import { channel, Saga, SagaMiddleware } from 'redux-saga';
import { Effect, select, take } from 'redux-saga/effects';
import { SagasList } from '../instances';

class Manager {
  private eventChannel: ReturnType<typeof channel>;
  private sagaMiddleware: SagaMiddleware;
  private listeners: SagasList = [this.baseSaga()];

  constructor(sagaMiddleware: SagaMiddleware) {
    this.eventChannel = this.createEventChannel();
    this.sagaMiddleware = sagaMiddleware;
  }

  private createEventChannel() {
    const c = channel();
    return c;
  }

  protected sendToChannel(effect: Effect) {
    this.eventChannel.put(effect);
  }

  protected subscribeToChannel() {
    return take(this.eventChannel);
  }

  protected registerListeners(...args: SagasList) {
    args.forEach((listener) => this.listeners.push(listener));
  }

  protected runSaga(saga: Saga, args?: unknown[]) {
    return this.sagaMiddleware.run(saga, args);
  }

  protected selectFromStore<T = unknown>(selector: any, args?: unknown[]) {
    function* selectionSaga(): any {
      const selection: T[] = yield select(selector, args) || [];
      return selection;
    }
    return this.runSaga(selectionSaga).result<T[]>();
  }

  getListeners() {
    return this.listeners;
  }

  protected *baseSaga() {
    while (true) {
      const effect: Effect = yield take(this.eventChannel);
      yield effect;
    }
  }
}

export default Manager;
