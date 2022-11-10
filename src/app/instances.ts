import { SagaMiddleware } from 'redux-saga';
import { all, Effect, takeLeading } from 'redux-saga/effects';
import ItemsManager from '../features/items/ItemsManager';
import ListsManager from '../features/lists/ListsManager';
import AuthManager, { IAuthManager } from './Instances/AuthManager';
import DBManager, { IDBManager } from './Instances/DBManager';

declare global {
  interface Window {
    _GlobalInstances?: GlobalInstances;
  }
}

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

interface DataManagers {
  [key: string]: any;
  items: ItemsManager;
  lists: ListsManager;
}

class GlobalInstances {
  private static _instance: GlobalInstances;
  private sagaMiddleware: SagaMiddleware;
  private instances: Instances;
  private dataManagers: DataManagers;

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
      items: new ItemsManager(instancesConfig),
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
    ];
    yield all(sagas);
  }

  executeInstanceMethod(
    instanceKey: 'auth',
    methodKey: keyof IAuthManager,
    args?: Parameters<IAuthManager[typeof methodKey]>
  ): ReturnType<IAuthManager[typeof methodKey]>;
  executeInstanceMethod(
    instanceKey: 'items',
    methodKey: keyof ItemsManager,
    args?: Parameters<ItemsManager[typeof methodKey]>
  ): ReturnType<ItemsManager[typeof methodKey]>;
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

  private getSagasArray() {
    return Object.values(GlobalInstances._instance.instances)
      .map((instance) => instance.getSagas())
      .flat();
  }

  private getDataListeners() {
    return Object.values(GlobalInstances._instance.dataManagers)
      .map((instance) => instance.getListeners())
      .flat();
  }
}

export default GlobalInstances;
