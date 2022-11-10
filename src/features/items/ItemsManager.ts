import { SagaMiddleware } from 'redux-saga';
import { call, put, takeLeading } from 'redux-saga/effects';
import GlobalInstances from '../../app/instances';
import DataManager from '../../app/Instances/DataManager';
import { Actions } from '../../app/Instances/db-types';
import { dbInitialized } from '../../app/Instances/DBManager';
import { itemsDbTable } from '../../constants';
import {
  getItems,
  getItemsFailed,
  getItemsSuccess,
  Item,
  selectItems,
} from './itemsSlice';

export interface ItemsManagerConfig {
  instances: GlobalInstances;
  sagaMiddleware: SagaMiddleware;
}

const actions: Actions = {
  load: {
    fail: [getItemsFailed],
    success: [getItemsSuccess],
  },
  update: {
    success: [],
    fail: [],
  },
};

class ItemsManager extends DataManager<Item> {
  constructor(config: ItemsManagerConfig) {
    super({
      table: itemsDbTable,
      name: 'items',
      instances: config.instances,
      sagaMiddleware: config.sagaMiddleware,
      selector: selectItems,
      query: 'scan',
      actions,
    });
    this.registerListeners([this.listenGetItems(), this.listenDbInitialized()]);
  }

  /* *loadItems() {
    const items: Item[] = yield call([this, this.load]);
  } */

  *listenDbInitialized() {
    yield takeLeading(dbInitialized.type, function* () {
      yield put(getItems());
    });
  }

  *listenGetItems() {
    yield takeLeading(getItems.type, this.load.bind(this));
  }
}

export default ItemsManager;
