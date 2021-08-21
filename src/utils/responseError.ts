import { ErrorCode, ResponseError } from '../types';
import logger from './logger';

const responseError = (
  error_code: ErrorCode,
  message: string
): ResponseError => {
  const error: ResponseError = {
    error_code,
    message,
  };
  logger.error(`${error.error_code} - ${error.message}`);
  return error;
};

export default responseError;
