import { expect } from 'chai';
import validateLatitude from '../validateLatitude';

describe('Validate latitude', () => {
  it('should return true for latitude too small or too big', () => {
    expect(validateLatitude(-91)).to.equal(true);
    expect(validateLatitude(91)).to.equal(true);
  });

  it('should return false for valid latitude', () => {
    expect(validateLatitude(1)).to.equal(false);
  });
});
