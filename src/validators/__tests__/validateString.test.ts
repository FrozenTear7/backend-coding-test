import { expect } from 'chai';
import validateString from '../validateString';

describe('Validate string', () => {
  it('should return true for a non-string value', () => {
    expect(validateString(null)).to.equal(true);
    expect(validateString(1)).to.equal(true);
  });

  it('should return false for a valid string', () => {
    expect(validateString('valid')).to.equal(false);
  });
});
