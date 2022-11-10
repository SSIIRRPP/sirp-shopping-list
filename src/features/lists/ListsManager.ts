import { SagaMiddleware } from 'redux-saga';
import { call, put, takeLeading } from 'redux-saga/effects';
import GlobalInstances from '../../app/instances';
import DataManager from '../../app/Instances/DataManager';
import { Actions } from '../../app/Instances/db-types';
import { dbInitialized } from '../../app/Instances/DBManager';
import { listsDbTable } from '../../constants';
import {
  getLists,
  getListsFailed,
  getListsSuccess,
  List,
  selectLists,
} from './listsSlice';

export interface ListsManagerConfig {
  instances: GlobalInstances;
  sagaMiddleware: SagaMiddleware;
}

const actions: Actions = {
  load: {
    fail: [getListsFailed],
    success: [getListsSuccess],
  },
  update: {
    success: [],
    fail: [],
  },
};

class ListsManager extends DataManager<List> {
  constructor(config: ListsManagerConfig) {
    super({
      table: listsDbTable,
      name: 'lists',
      instances: config.instances,
      sagaMiddleware: config.sagaMiddleware,
      selector: selectLists,
      query: 'scan',
      actions,
    });
    this.registerListeners([this.listenGetLists(), this.listenDbInitialized()]);
  }

  *listenDbInitialized() {
    yield takeLeading(dbInitialized.type, function* () {
      yield put(getLists());
    });
  }

  *listenGetLists() {
    yield takeLeading(getLists.type, this.load.bind(this));
  }
}

export default ListsManager;
