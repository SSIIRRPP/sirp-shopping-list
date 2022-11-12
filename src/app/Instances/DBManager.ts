import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import {
  BatchGetItemCommand,
  BatchWriteItemCommand,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { createAction } from '@reduxjs/toolkit';
import { SagaMiddleware } from 'redux-saga';
import { put, takeLeading } from 'redux-saga/effects';
import { identityPoolId, region, userPoolId } from '../../constants';
import { login, logout } from '../../features/auth/authSlice';
import GlobalInstances, { SagasList } from '../instances';
import {
  IGetCommand,
  IPutCommand,
  IUpdateCommand,
  IUpdateCommandData,
  IResponse,
  IDeleteCommand,
  IQueryCommand,
  IScanCommand,
  IGetResponse,
  IPutResponse,
  IUpdateResponse,
  IDeleteResponse,
  IQueryResponse,
  IScanResponse,
  CommandTypes,
} from './db-types';
import Manager from './Manager';

export class Response<T = unknown> implements IResponse {
  status: IResponse['status'] = 'PENDING';
  data: T | null = null;

  constructor() {}

  success(res: T) {
    this.status = 'OK';
    this.data = res;
    return res;
  }

  fail(err: T) {
    this.status = 'FAIL';
    this.data = err;
    return err;
  }
}

export interface IDBManager {
  sendDynamoRequest(command: IGetCommand): Promise<IGetResponse>;
  sendDynamoRequest(command: IPutCommand): Promise<IPutResponse>;
  sendDynamoRequest(command: IUpdateCommand): Promise<IUpdateResponse>;
  sendDynamoRequest(command: IDeleteCommand): Promise<IDeleteResponse>;
  sendDynamoRequest(command: IScanCommand): Promise<IScanResponse>;
  sendDynamoRequest(command: IQueryCommand): Promise<IQueryResponse>;
}

export const dbInitialized = createAction('db/initialized');

export interface DBManagerConfig {
  instances: GlobalInstances;
  sagaMiddleware: SagaMiddleware;
}

class DBManager extends Manager implements IDBManager {
  [x: string]: any;
  private static _instance: DBManager;
  private globalInstances: GlobalInstances;
  private sagas: SagasList | null = null;
  private dynamo: DynamoDBClient | null = null;
  private constructor(config: DBManagerConfig) {
    super(config.sagaMiddleware);
    this.globalInstances = config.instances;
    this.registerListeners(this.listenLogin());
  }

  static getInstance(config: DBManagerConfig) {
    if (!DBManager._instance) {
      DBManager._instance = new DBManager(config);
    }
    return DBManager._instance;
  }

  getSagas() {
    if (DBManager._instance) {
      if (!DBManager._instance.sagas) {
        DBManager._instance.sagas = this.getListeners();
      }
      return DBManager._instance.sagas;
    }
    throw new Error('No DBManager instance found!');
  }

  private getToken() {
    const token = DBManager._instance.globalInstances.executeInstanceMethod(
      'auth',
      'getUserIdToken',
      []
    );
    return token;
  }

  private *createDynamoInstance() {
    const token = DBManager._instance.getToken();
    if (token) {
      DBManager._instance.dynamo = new DynamoDBClient({
        region,
        credentials: fromCognitoIdentityPool({
          client: new CognitoIdentityClient({ region }),
          identityPoolId,
          logins: {
            [userPoolId]: token,
          },
        }),
      });
      yield put(dbInitialized());
    }
  }

  private destroyDynamoInstance() {
    DBManager._instance.dynamo = null;
  }

  private get(command: IGetCommand) {
    return new Promise<IGetResponse>(async (resolve) => {
      let response;
      if (DBManager._instance.dynamo) {
        let dbCommand;
        const { table, returnCapacity } = command;
        if (command.batch) {
          const { data } = command;
          dbCommand = new BatchGetItemCommand({
            RequestItems: { [table]: { Keys: data } },
            ReturnConsumedCapacity: returnCapacity,
          });
          response = await DBManager._instance.dynamo.send(dbCommand);
        } else {
          const { data } = command;
          dbCommand = new GetItemCommand({
            TableName: table,
            ReturnConsumedCapacity: returnCapacity,
            Key: data,
          });
          response = await DBManager._instance.dynamo.send(dbCommand);
        }
      }
      resolve(response);
    });
  }

  private put(command: IPutCommand) {
    return new Promise<IPutResponse>(async (resolve) => {
      let response;
      if (DBManager._instance.dynamo) {
        let dbCommand;
        const { table, returnCapacity } = command;
        if (command.batch) {
          const { data } = command;
          dbCommand = new BatchWriteItemCommand({
            RequestItems: { [table]: data },
            ReturnConsumedCapacity: returnCapacity,
          });
          response = await DBManager._instance.dynamo.send(dbCommand);
        } else {
          const { data } = command;
          dbCommand = new PutItemCommand({
            TableName: table,
            Item: data,
            ReturnConsumedCapacity: returnCapacity,
          });
          response = await DBManager._instance.dynamo.send(dbCommand);
        }
      }
      resolve(response);
    });
  }

  private update(command: IUpdateCommand) {
    return new Promise<IUpdateResponse>(async (resolve) => {
      let response;
      if (DBManager._instance.dynamo) {
        const { table, returnCapacity } = command;
        const createDbCommand = (data: IUpdateCommandData) =>
          new UpdateItemCommand({
            TableName: table,
            ReturnConsumedCapacity: returnCapacity,
            ...data,
          });
        if (command.batch) {
          const { data } = command;
          response = await Promise.all(
            data.map((data) =>
              DBManager._instance.dynamo?.send(createDbCommand(data))
            )
          );
        } else {
          const { data } = command;
          response = await DBManager._instance.dynamo.send(
            createDbCommand(data)
          );
        }
      }
      resolve(response);
    });
  }

  private delete(command: IDeleteCommand) {
    return new Promise<IDeleteResponse>(async (resolve) => {
      let response;
      if (DBManager._instance.dynamo) {
        const { table, returnCapacity } = command;
        if (command.batch) {
          const { data } = command;
          const dbCommand = new BatchWriteItemCommand({
            RequestItems: { [table]: data },
            ReturnConsumedCapacity: returnCapacity,
          });
          response = await DBManager._instance.dynamo.send(dbCommand);
        } else {
          const { data } = command;
          const dbCommand = new DeleteItemCommand({
            TableName: table,
            Key: data,
            ReturnConsumedCapacity: returnCapacity,
          });
          response = await DBManager._instance.dynamo.send(dbCommand);
        }
      }
      resolve(response);
    });
  }

  private query(command: IQueryCommand) {
    return new Promise<IQueryResponse>(async (resolve) => {
      let response;
      if (DBManager._instance.dynamo) {
        const { table, data, returnCapacity } = command;
        const dbCommand = new QueryCommand({
          TableName: table,
          ReturnConsumedCapacity: returnCapacity,
          ...data,
        });
        response = await DBManager._instance.dynamo.send(dbCommand);
      }
      resolve(response);
    });
  }

  private scan(command: IScanCommand) {
    return new Promise<IScanResponse>(async (resolve) => {
      let response;
      if (DBManager._instance.dynamo) {
        const { table, data, returnCapacity } = command;
        const dbCommand = new ScanCommand({
          TableName: table,
          ReturnConsumedCapacity: returnCapacity,
          ...data,
        });
        response = await DBManager._instance.dynamo.send(dbCommand);
      }
      resolve(response);
    });
  }

  sendDynamoRequest(command: IGetCommand): Promise<IGetResponse>;
  sendDynamoRequest(command: IPutCommand): Promise<IPutResponse>;
  sendDynamoRequest(command: IUpdateCommand): Promise<IUpdateResponse>;
  sendDynamoRequest(command: IDeleteCommand): Promise<IDeleteResponse>;
  sendDynamoRequest(command: IQueryCommand): Promise<IQueryResponse>;
  sendDynamoRequest(command: IScanCommand): Promise<IScanResponse>;
  sendDynamoRequest(command: CommandTypes) {
    const makeSender = () => {
      switch (command.type) {
        case 'get': {
          return () => DBManager._instance.get(command);
        }
        case 'put': {
          return () => DBManager._instance.put(command);
        }
        case 'update': {
          return () => DBManager._instance.update(command);
        }
        case 'delete': {
          return () => DBManager._instance.delete(command);
        }
        case 'query': {
          return () => DBManager._instance.query(command);
        }
        case 'scan': {
          return () => DBManager._instance.scan(command);
        }
        default:
          return null;
      }
    };

    const sender = makeSender();

    if (!sender) {
      throw new Error('Invalid command.type: ' + command.type);
    }
    return sender();
  }

  *listenLogin() {
    yield takeLeading(login.type, DBManager._instance.createDynamoInstance);
  }

  *listenLogout() {
    yield takeLeading(logout.type, DBManager._instance.destroyDynamoInstance);
  }
}

export default DBManager;
