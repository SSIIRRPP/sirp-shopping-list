import { SagaMiddleware } from 'redux-saga';
import { processResponses } from '../../../util';
import { DataManagers, NotifierType } from '../../instances';
import { OptionsObject, SnackbarMessage } from 'notistack';
import { ResponseTypes } from '../db-types';
import Manager from '../Manager';
import { put } from 'redux-saga/effects';
import {
  dataSyncEnd,
  dataSyncStart,
  dataSyncSuccess,
} from '../../../features/state/stateSlice';

export interface SyncHelperConfig {
  instances: DataManagers;
  sagaMiddleware: SagaMiddleware;
  notifier: NotifierType | null;
  syncType: ReturnType<typeof dataSyncStart>['payload'];
}

export default class SyncHelper extends Manager {
  private instances: DataManagers;
  private notifier: NotifierType | null = null;
  private syncType: ReturnType<typeof dataSyncStart>['payload'];
  constructor(config: SyncHelperConfig) {
    super(config.sagaMiddleware);
    this.instances = config.instances;
    this.notifier = config.notifier;
    this.syncType = config.syncType;
  }

  async start() {
    const responses = await Promise.all(
      Object.values(this.instances)
        .map((instance) => instance.update())
        .flat()
    );
    this.processResponse(responses as ResponseTypes[]);
  }

  private notify(message: SnackbarMessage, options?: OptionsObject) {
    if (!!this.notifier) {
      return this.notifier(message, options);
    }
    return null;
  }

  processResponse(responses: ResponseTypes[]) {
    if (processResponses(responses)) {
      this.runSaga(this.sendSuccess);
      this.notifySuccess();
    } else {
      this.notifyError();
    }
    this.runSaga(this.sendEnd);
  }

  *sendSuccess() {
    yield put(dataSyncSuccess());
  }

  *sendEnd() {
    yield put(dataSyncEnd());
  }

  notifySuccess() {
    this.notify(
      this.syncType === 'manual-sync'
        ? 'Listas sincronizadas correctamente'
        : 'Lista de la compra completada correctamente',
      {
        variant: 'success',
      }
    );
  }

  notifyError() {
    return this.notify(
      this.syncType === 'manual-sync'
        ? 'Error al sincronizar las listas. Inténtalo de nuevo más tarde'
        : 'Error al completar la lista de la compra. Inténtalo de nuevo más tarde',
      { variant: 'error' }
    );
  }
}
