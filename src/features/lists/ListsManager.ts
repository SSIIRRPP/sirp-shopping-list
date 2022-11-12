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
  listHasError,
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

function dataVerifier(lists: List[]): List[] {
  return lists.filter((list) => !listHasError(list));
}

function itemKeyBuilder(list: List) {
  return { id: list.id };
}

class ListsManager extends DataManager<List, List['id']> {
  constructor(config: ListsManagerConfig) {
    super({
      table: listsDbTable,
      name: 'lists',
      instances: config.instances,
      sagaMiddleware: config.sagaMiddleware,
      selector: selectLists,
      dataVerifier,
      itemKeyBuilder,
      query: 'scan',
      actions,
    });
    this.registerListeners(this.listenGetLists(), this.listenDbInitialized());
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
