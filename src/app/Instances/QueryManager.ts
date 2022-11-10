/* import GlobalInstances from '../instances';
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
import DBManager from './DBManager';

export interface QueryManagerConfig {
  type: 'query' | 'scan';
  table: string;
  name: keyof RootState;
  instances: GlobalInstances;
  actions: Actions;
}

class QueryManager {
  private lastKey: string | null = null;
  private type: QueryManagerConfig['type'];
  private table: string;
  private globalInstances: GlobalInstances;
  private actions: Actions;
  constructor(config: QueryManagerConfig) {
    this.table = config.table;
    this.globalInstances = config.instances;
    this.actions = config.actions;
    this.type = config.type;
  }

  private sendRequest(
    config?: Partial<IQueryCommand>
  ): Promise<IQueryResponse>;
  private sendRequest(config?: Partial<IScanCommand>): Promise<IScanResponse>;
  private async sendRequest(config?: Partial<IQueryCommand | IScanCommand>) {
    let _command = {
      batch: false as false,
      table: this.table,
      actions: this.actions,
    };
    if (config) {
      _command = { ..._command, ...config };
    }
    let command: unknown
    if (this.type === 'query') {
      command = {
        ..._command,
        type: 'query',
        data: _command.data ?? {},
      };
    } else {
      command = {
        ..._command,
        type: 'scan',
        data: {},
      };
    }
    const response = await this.globalInstances.executeSiblingMethod(
      'db',
      'sendDynamoRequest',
      [command]
    );
    return response
  }

  query() {}

  private async sendQuery(command: IQueryCommand) {
    const response = await this.globalInstances.executeSiblingMethod(
      'db',
      'sendDynamoRequest',
      [command]
    );
    console.log('res: ', response);
    return response;
  }
  private async sendScan(command: IScanCommand) {
    
    console.log('res: ', response);
    return response;
  }
}

export default QueryManager;
 */

export {};
