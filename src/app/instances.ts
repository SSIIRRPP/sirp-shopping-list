import { PayloadAction } from '@reduxjs/toolkit';
import { ProviderContext } from 'notistack';
import { SagaMiddleware } from 'redux-saga';
import { all, Effect, takeLeading } from 'redux-saga/effects';
import ListsManager from '../features/lists/ListsManager';
import {
  changeShoppingMode,
  dataSyncStart,
  StateInitialState,
} from '../features/state/stateSlice';
import AuthManager, { IAuthManager } from './Instances/AuthManager';
import SyncHelper from './Instances/db-helpers/SyncHelper';
import DBManager, { IDBManager } from './Instances/DBManager';

declare global {
  interface Window {
    _GlobalInstances?: GlobalInstances;
  }
}

export type NotifierType = (
  ...args: Parameters<ProviderContext['enqueueSnackbar']>
) => ReturnType<ProviderContext['enqueueSnackbar']> | null;

export type Saga<T, P, U> = Generator<Effect<T, P>, void, U>;

export type SagasList<T = never | any, P = any, U = unknown> = Saga<T, P, U>[];

type InstancesTypes = AuthManager | DBManager;

interface InstancesStructure {
  [key: string]: InstancesTypes;
}

interface Instances extends InstancesStructure {
  auth: AuthManager;
  db: DBManager;
}

type DataManagerTypes = ListsManager;

export interface DataManagers {
  [key: string]: DataManagerTypes;
  lists: ListsManager;
}

class GlobalInstances {
  private static _instance: GlobalInstances;
  private sagaMiddleware: SagaMiddleware;
  private instances: Instances;
  private dataManagers: DataManagers;
  private shoppingMode: StateInitialState['mode'] = 'edition';
  private notifier: NotifierType | null = null;

  private constructor(sagaMiddleware: SagaMiddleware) {
    window._GlobalInstances = this;

    this.sagaMiddleware = sagaMiddleware;

    const instancesConfig = {
      instances: this,
      sagaMiddleware: this.sagaMiddleware,
    };

    this.instances = {
      db: DBManager.getInstance(instancesConfig),
      auth: AuthManager.getInstance(instancesConfig),
    };

    this.dataManagers = {
      lists: new ListsManager(instancesConfig),
    };
  }

  static getInstance(sagaMiddleware: SagaMiddleware) {
    if (!GlobalInstances._instance) {
      GlobalInstances._instance = new GlobalInstances(sagaMiddleware);
      window._GlobalInstances = GlobalInstances._instance;
    }
    return GlobalInstances._instance;
  }

  init() {
    GlobalInstances._instance.initInstances();
    this.sagaMiddleware.run(this.startSagas);
  }

  private initInstances(): void {
    Object.values(this.instances).forEach((inst) => {
      inst.start && inst.start();
    });
  }

  private *startSagas() {
    const sagas = [
      ...GlobalInstances._instance.getSagasArray(),
      ...GlobalInstances._instance.getDataListeners(),
      ...GlobalInstances._instance.getOwnSagas(),
    ];
    yield all(sagas);
  }

  executeInstanceMethod(
    instanceKey: 'auth',
    methodKey: keyof IAuthManager,
    args?: Parameters<IAuthManager[typeof methodKey]>
  ): ReturnType<IAuthManager[typeof methodKey]>;
  executeInstanceMethod(
    instanceKey: 'lists',
    methodKey: keyof ListsManager,
    args?: Parameters<ListsManager[typeof methodKey]>
  ): ReturnType<ListsManager[typeof methodKey]>;
  executeInstanceMethod(
    instanceKey: 'db',
    methodKey: keyof IDBManager,
    args?: any[]
  ): ReturnType<IDBManager[typeof methodKey]>;
  executeInstanceMethod(
    instanceKey: keyof Instances | keyof DataManagers,
    methodKey: string,
    args?: any[]
  ) {
    const instance =
      this.instances[instanceKey] || this.dataManagers[instanceKey];
    if (instance) {
      const method = instance[methodKey];
      if (typeof method === 'function') {
        return method.apply(instance, args);
      }
    }
    throw new Error(`No method ${methodKey} in instance ${instanceKey}`);
  }

  getInstances(): Record<keyof Instances, InstancesTypes> {
    return Object.fromEntries(
      Object.entries(GlobalInstances._instance.instances).map(
        ([key, instance]) => [key, instance.instance]
      )
    );
  }

  addNotificationFunction(notifier: NotifierType) {
    this.notifier = notifier;
  }

  private getSagasArray() {
    return Object.values(GlobalInstances._instance.instances)
      .map((instance) => instance.getSagas())
      .flat();
  }

  private getOwnSagas() {
    return [
      GlobalInstances._instance.listenDataSync(),
      GlobalInstances._instance.listenModeChange(),
    ];
  }

  private getDataListeners() {
    return Object.values(GlobalInstances._instance.dataManagers)
      .map((instance) => instance.getListeners())
      .flat();
  }

  private syncData(action: ReturnType<typeof dataSyncStart>) {
    const helper = new SyncHelper({
      instances: this.dataManagers,
      sagaMiddleware: this.sagaMiddleware,
      notifier: GlobalInstances._instance.notifier,
      syncType: action.payload,
    });
    helper.start();
  }

  private toggleShoppingMode(action: PayloadAction<StateInitialState['mode']>) {
    GlobalInstances._instance.shoppingMode = action.payload;
  }

  private *listenModeChange() {
    yield takeLeading(
      changeShoppingMode.type,
      this.toggleShoppingMode.bind(this)
    );
  }

  private *listenDataSync() {
    yield takeLeading(
      dataSyncStart.type,
      GlobalInstances._instance.syncData.bind(this)
    );
  }
}

export default GlobalInstances;
