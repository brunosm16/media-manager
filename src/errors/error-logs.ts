import { Logger } from '@nestjs/common';

export const logErrorDetailed = (
  err: any,
  message: string = 'An error ocurred'
): void => {
  Logger.error({
    err,
    message,
  });
};
