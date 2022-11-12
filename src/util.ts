import { ResponseTypes } from './app/Instances/db-types';

export const processResponse = (r: ResponseTypes): boolean =>
  r?.$metadata?.httpStatusCode?.toString().startsWith('2') ||
  r?.$metadata?.httpStatusCode === 304 ||
  false;

export const processResponses = (array: ResponseTypes[]): boolean =>
  array.every((r) => processResponse(r));
