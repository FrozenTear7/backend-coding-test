import { expect } from 'chai';
import validateLongitude from '../validateLongitude';

describe('Validate longitude', () => {
  it('should return true for longitude too small or too big', () => {
    expect(validateLongitude(-181)).to.equal(true);
    expect(validateLongitude(181)).to.equal(true);
  });

  it('should return false for valid longitude', () => {
    expect(validateLongitude(1)).to.equal(false);
  });
});
