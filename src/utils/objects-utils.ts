import type { RemoveObjectKeysResult } from './utils-types';

const valueIsEmpty = (value: any): boolean =>
  value !== null && value !== undefined;

export const removeObjectEmptyValues = (
  object: Record<string, any>
): Record<string, any> => {
  const entries = Object.entries(object)
    .filter(([_, value]) => valueIsEmpty(value))
    .map(([key, value]) => [key, value]);

  return Object.fromEntries(entries);
};

export const assignObjectToAnother = (
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> => {
  const result = target;

  Object.keys(source).forEach((key) =>
    Object.assign(result, { [key]: source[key] })
  );

  return result;
};

export const objectIsEmpty = (object: Record<string, any>): boolean =>
  !Object.keys(object).length;

export const camelCaseObjectKeys = (
  obj: Record<string, any>
): Record<string, any> => {
  const entries = Object.entries(obj);

  return entries.reduce((acc: Record<string, any>, [key, value]) => {
    const tempAcc = acc;

    const camelCaseKey = key.charAt(0).toLowerCase() + key.slice(1);
    tempAcc[camelCaseKey] = value;

    return tempAcc;
  }, {});
};

export const removeObjectKeys = (
  obj: Record<string, any>,
  keys: string[]
): RemoveObjectKeysResult => {
  const resultObject = obj;

  keys.forEach((key) => {
    delete resultObject[key];
  });

  const isSuccessfulDeleted = Object.keys(resultObject).length !== keys.length;

  return {
    isSuccessfulDeleted,
    resultObject,
  };
};
