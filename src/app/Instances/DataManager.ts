import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall as unm } from '@aws-sdk/util-dynamodb';
import deepEqual from 'deep-equal';
import { SagaMiddleware } from 'redux-saga';
import { put, takeLeading } from 'redux-saga/effects';
import { AppDataSelector } from '../hooks';
import GlobalInstances from '../instances';
import { RootState } from '../store';
import FullQueryLoader from './db-helpers/FullQueryLoader';
import WriteCommandsBuilder from './db-helpers/WriteCommandsBuilder';
import UpdateComparer from './db-helpers/UpdateComparer';
import { Actions, ActionValues, DataVerificationFunction } from './db-types';
import Manager from './Manager';
import { dataSyncSuccess } from '../../features/state/stateSlice';

export interface DataManagerConfig<T> {
  query?: 'query' | 'scan';
  table: string;
  name: keyof RootState;
  selector: AppDataSelector<T>;
  dataVerifier: DataVerificationFunction<T>;
  itemKeyBuilder: (item: T) => { [k: string]: string };
  instances: GlobalInstances;
  sagaMiddleware: SagaMiddleware;
  actions: Actions;
}

class DataManager<
  T extends { [key: string]: any },
  P extends string | number | symbol
> extends Manager {
  private table: string;
  protected name: keyof RootState;
  protected globalInstances: GlobalInstances;
  protected actions: Actions;
  private fetched: Record<P, T> = {} as Record<P, T>;
  private fetchedKeys: Set<P> = new Set();
  private selector: AppDataSelector<T>;
  private itemKeyBuilder: (item: T) => { [k: string]: string };
  private dataVerifier: DataVerificationFunction<T>;
  private query: null | 'query' | 'scan' = null;

  constructor(config: DataManagerConfig<T>) {
    super(config.sagaMiddleware);
    this.globalInstances = config.instances;
    this.table = config.table;
    this.name = config.name;
    this.actions = config.actions;
    this.selector = config.selector;
    this.dataVerifier = config.dataVerifier;
    this.itemKeyBuilder = config.itemKeyBuilder;
    this.query = config.query ?? null;
    this.registerListeners(this.listenSyncDataSuccess());
  }

  private sendActionsToChannel(actions?: ActionValues, payload?: any) {
    actions &&
      actions.forEach((action) => {
        if (typeof action === 'function') {
          action = action(payload);
        }
        this.sendToChannel(put(action));
      });
  }

  private queryRequest(): Promise<Array<T>> {
    const queryHelper = new FullQueryLoader<T>({
      type: this.query!,
      table: this.table,
      name: this.name,
      instances: this.globalInstances,
    });
    return queryHelper.load();
  }

  private simpleRequest() {}

  async load() {
    this.sendActionsToChannel(this.actions.load?.start);
    try {
      let items;
      if (this.query) {
        const response = await this.queryRequest();
        const unmarshalled = this.unmarshall(response);
        this.addFetched(unmarshalled);
        this.addFetchedKeys(unmarshalled.map((i) => i.id));
        items = unmarshalled;
      } else {
      }
      this.sendActionsToChannel(this.actions.load.success, items);
    } catch (e) {
      this.sendActionsToChannel(this.actions.load.fail, e);
    }
  }

  update() {
    const selection = this.selectFromStore<T>(this.selector) || [];
    const selectionObject = Object.fromEntries(
      selection.map((item) => [item.id, item])
    );

    const comparer = new UpdateComparer<T, P>({
      newItems: selectionObject,
      oldItems: this.fetched ?? {},
    });
    const comparison = comparer.compare();
    const { put, update, delete: deleted } = comparison;

    const commands = new WriteCommandsBuilder<T>({
      put: Array.from(put).map((id) => selectionObject[id]),
      delete: Array.from(deleted).map((id) => this.fetched[id]),
      update: Array.from(update).map((id) => selectionObject[id]),
      table: this.table,
      dataVerifier: this.dataVerifier,
      itemKeyBuilder: this.itemKeyBuilder,
    }).build();

    return Object.values(commands)
      .map((commandsArray) =>
        commandsArray.map((command) =>
          this.globalInstances.executeInstanceMethod(
            'db',
            'sendDynamoRequest',
            [command]
          )
        )
      )
      .flat();
  }

  adoptStoreItems() {
    const selection = this.selectFromStore<T>(this.selector) || [];
    const selectionObject = Object.fromEntries(
      selection.map((item) => [item.id, item])
    );
    this.fetched = selectionObject;
  }

  private unmarshall(items: Record<string, AttributeValue>): T;
  private unmarshall(items: Record<string, AttributeValue>[]): T[];
  private unmarshall(
    items: Record<string, AttributeValue> | Record<string, AttributeValue>[]
  ) {
    if (Array.isArray(items)) {
      const a = items.map((i) => unm(i) as T);
      return a;
    } else {
      return unm(items) as T;
    }
  }

  private addFetched(items: T | T[]) {
    let newFetched: Record<P, T>;
    if (Array.isArray(items)) {
      newFetched = Object.fromEntries(
        items.map((item) => [item.id as P, item])
      ) as Record<P, T>;
    } else {
      newFetched = { [items.id]: items } as Record<P, T>;
    }
    this.fetched = {
      ...this.fetched,
      ...newFetched,
    };
  }

  private addFetchedKeys(keys: P | Array<P>) {
    let newKeys = new Set<P>();
    if (Array.isArray(keys)) {
    } else {
    }
    newKeys.forEach((key) => {
      this.fetchedKeys.add(key);
    });
  }

  *listenSyncDataSuccess() {
    yield takeLeading(dataSyncSuccess.type, this.adoptStoreItems.bind(this));
  }

  checkEquality() {
    const selection = this.selectFromStore(this.selector);
    return deepEqual(Object.values(this.fetched ?? {}), selection);
  }
}

export default DataManager;
