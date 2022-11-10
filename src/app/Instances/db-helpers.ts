import { AttributeValue } from '@aws-sdk/client-dynamodb';
import GlobalInstances from '../instances';
import { RootState } from '../store';
import {
  Actions,
  IQueryCommand,
  IQueryCommandData,
  IQueryResponse,
  IScanCommand,
  IScanCommandData,
  IScanResponse,
} from './db-types';

export interface FullQueryLoaderConfig {
  type: 'query' | 'scan';
  table: string;
  name: keyof RootState;
  instances: GlobalInstances;
  actions: Actions;
  data?: IQueryCommandData | IScanCommandData;
}

export class FullQueryLoader<T> {
  private lastKey: Record<string, AttributeValue> | null = null;
  private items: T[] = [];
  private type: FullQueryLoaderConfig['type'];
  private table: string;
  private actions: Actions;
  private globalInstances: GlobalInstances;
  private data?: IQueryCommandData | IScanCommandData;

  constructor(config: FullQueryLoaderConfig) {
    this.table = config.table;
    this.globalInstances = config.instances;
    this.actions = config.actions;
    this.type = config.type;
    this.data = config.data;
  }

  load() {
    return this.sendRequest();
  }

  private async query(data: IQueryCommandData): Promise<IQueryResponse> {
    const command: IQueryCommand = {
      type: 'query',
      batch: false as false,
      table: this.table,
      actions: this.actions,
      data,
    };
    const response = await this.globalInstances.executeInstanceMethod(
      'db',
      'sendDynamoRequest',
      [command]
    );
    return response;
  }

  private async scan(data: IScanCommandData): Promise<IScanResponse> {
    const command: IScanCommand = {
      type: 'scan',
      batch: false as false,
      table: this.table,
      actions: this.actions,
      data,
    };
    const response = await this.globalInstances.executeInstanceMethod(
      'db',
      'sendDynamoRequest',
      [command]
    );
    return response;
  }

  private sendRequest(): Promise<Array<unknown>> {
    const sendFunction =
      this.type === 'query' ? this.query.bind(this) : this.scan.bind(this);
    return new Promise(async (resolve, reject) => {
      try {
        let response;
        while (!response && !this.lastKey) {
          const data: any = { ...this.data };
          if (this.lastKey) {
            data.ExclusiveStartKey = this.lastKey;
          }
          response = await sendFunction(data);
          if (response) {
            this.processQueryResponse(response);
          }
        }
        resolve(this.items);
      } catch (e) {
        console.error('FullQueryLoader error: ', e);
        reject(e);
      }
    });
  }

  private processQueryResponse(response: IQueryResponse | IScanResponse) {
    const { Items, LastEvaluatedKey } = response!;
    if (Items) {
      this.items = this.items.concat(Items as T[]);
    }
    if (LastEvaluatedKey) {
      this.lastKey = LastEvaluatedKey;
    }
  }
}

export interface SyncHelperConfig {
  instances: GlobalInstances;
}

export class SyncHelper {
  private instances: GlobalInstances;
  constructor(config: SyncHelperConfig) {
    this.instances = config.instances;
  }
}
