import { expect } from 'chai';
import sinon from 'sinon';
import { ErrorCode } from '../../types';
import logger from '../logger';
import responseError from '../responseError';

describe('Response error', () => {
  it('should log the error and return an error object', () => {
    const errorCode = ErrorCode.SERVER_ERROR;
    const errorMsg = 'test message';

    const spyLogger = sinon.spy(logger, 'error');

    const res = responseError(errorCode, errorMsg);

    expect(res.error_code).to.equal(ErrorCode.SERVER_ERROR);
    expect(res.message).to.equal(errorMsg);
    expect(spyLogger.calledOnce).to.equal(true);
  });
});
