import { marshall } from '@aws-sdk/util-dynamodb';
import {
  DataVerificationFunction,
  IDeleteCommand,
  IPutCommand,
} from '../db-types';
import UpdateCommandBuilder from './UpdateCommandBuilder';

export interface WriteCommandsBuilderConfig<T extends { [key: string]: any }> {
  put: T[];
  update: T[];
  delete: T[];
  updateBuilder?: UpdateCommandBuilder;
  dataVerifier: DataVerificationFunction<T>;
  itemKeyBuilder: (item: T) => { [k: string]: string };
  table: string;
}

function cleanArray<T>(array: T[]) {
  return array.filter(Boolean);
}

export default class WriteCommandsBuilder<T extends { [key: string]: any }> {
  private putElements: T[][];
  private updateElements: T[][];
  private deleteKeys: T[][];
  private table: string;
  private updateBuilder: UpdateCommandBuilder | null;
  private dataVerifier: DataVerificationFunction<T>;
  private itemKeyBuilder: (item: T) => { [k: string]: string };
  constructor(config: WriteCommandsBuilderConfig<T>) {
    this.updateBuilder = config.updateBuilder ?? null;
    this.dataVerifier = config.dataVerifier;
    this.itemKeyBuilder = config.itemKeyBuilder;
    this.putElements = this.divideAndVerify(config.put);
    this.updateElements = this.divideAndVerify(config.update);
    this.deleteKeys = this.divideAndVerify(config.delete);
    this.table = config.table;
  }

  private buildUpdateCommand(elements: T[]) {
    return this.buildPutCommand(elements);
    /* if (elements.length > 0) {
      let command: IPutCommand;
      if (elements.length > 1) {
        command = {
          type: 'put',
          batch: true,
          table: this.table,
        };
      } else {
        command = {
          type: 'put',
          batch: false,
          table: this.table,
        };
      }
      return command;
    }
    return null; */
  }

  private buildPutCommand(elements: T[]) {
    if (elements.length > 0) {
      let command: IPutCommand;
      if (elements.length > 1) {
        command = {
          type: 'put',
          batch: true,
          table: this.table,
          data: elements.map((element) => ({
            PutRequest: { Item: marshall(element) },
          })),
        };
      } else {
        command = {
          type: 'put',
          batch: false,
          table: this.table,
          data: marshall(elements[0]),
        };
      }
      return command;
    }
    return null;
  }

  private buildDeleteCommand(elements: T[]) {
    if (elements.length > 0) {
      let command: IDeleteCommand;
      if (this.deleteKeys.length > 1) {
        command = {
          type: 'delete',
          batch: true,
          table: this.table,
          data: elements.map((element) => ({
            DeleteRequest: { Key: marshall(this.itemKeyBuilder(element)) },
          })),
        };
      } else {
        command = {
          type: 'delete',
          batch: false,
          table: this.table,
          data: marshall(this.itemKeyBuilder(elements[0])),
        };
      }
      return command;
    }
    return null;
  }

  private divideAndVerify(elements: T[]) {
    const verifiedData = this.dataVerifier(elements);
    return this.divideCommands(verifiedData, 25);
  }

  private divideCommands<T>(arrayToDivide: T[], arrayMax: number) {
    let array = [...arrayToDivide];
    let newArray: T[][] = [];
    while (array.length > arrayMax) {
      let localArray = array.slice(0, arrayMax);
      newArray = [...newArray, localArray];
      array = array.slice(arrayMax, array.length);
    }
    newArray = [...newArray, array];
    return newArray;
  }

  build() {
    return {
      put: cleanArray(
        this.putElements.map(
          (arrayOfItems) => this.buildPutCommand(arrayOfItems)!
        )
      ),
      update: cleanArray(
        this.updateElements.map(
          (arrayOfItems) => this.buildUpdateCommand(arrayOfItems)!
        )
      ),
      delete: cleanArray(
        this.deleteKeys.map(
          (arrayOfKeys) => this.buildDeleteCommand(arrayOfKeys)!
        )
      ),
    };
  }
}
