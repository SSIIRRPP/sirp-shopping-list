import { unmarshall as unm, marshall as msh } from '@aws-sdk/util-dynamodb';
import { Action } from '@reduxjs/toolkit';
import deepEqual from 'deep-equal';
import { SagaMiddleware } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { AppSelector } from '../hooks';
import GlobalInstances from '../instances';
import { RootState } from '../store';
import { FullQueryLoader } from './db-helpers';
import { Actions, ActionValues } from './db-types';
import Manager from './Manager';

export interface DataManagerConfig {
  query?: 'query' | 'scan';
  table: string;
  name: keyof RootState;
  selector: AppSelector;
  instances: GlobalInstances;
  sagaMiddleware: SagaMiddleware;
  actions: Actions;
}

class DataManager<T extends { id: string }> extends Manager {
  private table: string;
  protected name: keyof RootState;
  protected globalInstances: GlobalInstances;
  protected actions: Actions;
  private fetched: Record<string, T> | null = null;
  private fetchedKeys: Array<string> | null = null;
  private selector: AppSelector;
  private query: null | 'query' | 'scan' = null;

  constructor(config: DataManagerConfig) {
    super(config.sagaMiddleware);
    this.globalInstances = config.instances;
    this.table = config.table;
    this.name = config.name;
    this.actions = config.actions;
    this.selector = config.selector;
    this.query = config.query ?? null;
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

  private queryRequest(): Promise<Array<unknown>> {
    const queryHelper = new FullQueryLoader<T>({
      type: this.query!,
      table: this.table,
      name: this.name,
      actions: this.actions,
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
        const unmarshalled = this.unmarshall(response as any);
        this.addFetched(unmarshalled as any);
        this.addFetchedKeys(unmarshalled.map((i: any) => i.id));
        items = unmarshalled;
      } else {
      }
      this.sendActionsToChannel(this.actions.load.success, items);
    } catch (e) {
      this.sendActionsToChannel(this.actions.load.fail, e);
    }
  }

  async update() {}

  private unmarshall(items: {} | {}[]) {
    if (Array.isArray(items)) {
      return items.map((i) => unm(i));
    } else {
      return unm(items);
    }
  }

  private marshall(items: {} | {}[]) {
    if (Array.isArray(items)) {
      return items.map((i) => msh(i));
    } else {
      return msh(items);
    }
  }

  private addFetched(items: T[]) {
    this.fetched = Object.fromEntries(items.map((item: T) => [item.id, item]));
  }

  private addFetchedKeys(keys: string[]) {
    this.fetchedKeys = keys;
  }

  private checkItemEquality(itemId: string, item: T): boolean {
    return deepEqual(this.fetched?.[itemId], item);
  }

  checkEquality() {
    const selection = this.selectFromStore(this.selector);
    return deepEqual(Object.values(this.fetched ?? {}), selection);
  }
}

export default DataManager;
