import {
  AttributeValue,
  BatchGetItemCommandOutput,
  BatchWriteItemCommandOutput,
  DeleteItemCommandOutput,
  GetItemCommandOutput,
  PutItemCommandOutput,
  QueryCommandInput,
  QueryCommandOutput,
  ReturnConsumedCapacity,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { AnyAction } from '@reduxjs/toolkit';

export type DynamoValue<T = AttributeValue> = Record<string, T>;

export type DataVerificationFunction<T = any> = (i: T[]) => T[];

export interface Middlewares {
  prev?: (() => any)[];
  post?: (() => any)[];
}

export type ActionValues = Array<AnyAction | ((payload: any) => AnyAction)>;

export interface ActionTypes {
  start?: ActionValues;
  fail: ActionValues;
  success: ActionValues;
}

export interface Actions {
  load: ActionTypes;
  update: ActionTypes;
}

export interface Command {
  type: 'put' | 'get' | 'update' | 'delete' | 'query' | 'scan';
  batch: boolean;
  data: any;
  returnCapacity?: ReturnConsumedCapacity;
  middlewares?: Middlewares;
  table: string;
}

interface GetCommandSimple extends Command {
  type: 'get';
  batch: false;
  data: DynamoValue;
}

interface GetCommandBatch extends Command {
  type: 'get';
  batch: true;
  data: DynamoValue[];
}

export type IGetCommand = GetCommandSimple | GetCommandBatch;
export type IGetResponse =
  | BatchGetItemCommandOutput
  | GetItemCommandOutput
  | undefined;

interface PutCommandSimple extends Command {
  type: 'put';
  batch: false;
  data: DynamoValue;
}

interface PutCommandBatch extends Command {
  type: 'put';
  batch: true;
  data: { PutRequest: { Item: DynamoValue } }[];
}

export type IPutCommand = PutCommandSimple | PutCommandBatch;
export type IPutResponse =
  | BatchWriteItemCommandOutput
  | PutItemCommandOutput
  | undefined;

export type IUpdateCommandData = Omit<UpdateItemCommandInput, 'TableName'>;

interface UpdateCommandSimple extends Command {
  type: 'update';
  batch: false;
  data: IUpdateCommandData;
}

interface UpdateCommandBatch extends Command {
  type: 'update';
  batch: true;
  data: IUpdateCommandData[];
}

export type IUpdateCommand = UpdateCommandSimple | UpdateCommandBatch;
export type IUpdateResponse =
  | UpdateItemCommandOutput
  | UpdateItemCommandOutput[]
  | undefined
  | (UpdateItemCommandOutput | undefined)[];

interface DeleteCommandSimple extends Command {
  type: 'delete';
  batch: false;
  data: DynamoValue;
}

interface DeleteCommandBatch extends Command {
  type: 'delete';
  batch: true;
  data: { DeleteRequest: { Key: DynamoValue } }[];
}

export type IDeleteCommand = DeleteCommandSimple | DeleteCommandBatch;
export type IDeleteResponse =
  | BatchWriteItemCommandOutput
  | DeleteItemCommandOutput
  | undefined;

export type IQueryCommandData = Partial<Omit<QueryCommandInput, 'TableName'>>;

export interface IQueryCommand extends Command {
  type: 'query';
  batch: false;
  data: IQueryCommandData;
}
export type IQueryResponse = QueryCommandOutput | undefined;

export type IScanCommandData = Partial<Omit<ScanCommandInput, 'TableName'>>;

export interface IScanCommand extends Command {
  type: 'scan';
  batch: false;
  data: IScanCommandData;
}
export type IScanResponse = ScanCommandOutput | undefined;

export type CommandTypes =
  | IGetCommand
  | IPutCommand
  | IUpdateCommand
  | IDeleteCommand
  | IQueryCommand
  | IScanCommand;

export type ResponseTypes =
  | BatchGetItemCommandOutput
  | BatchWriteItemCommandOutput
  | DeleteItemCommandOutput
  | GetItemCommandOutput
  | PutItemCommandOutput
  | QueryCommandOutput
  | ScanCommandOutput
  | UpdateItemCommandOutput;
