import { mask, maskArgs } from '../logger';

describe('mask(attributes)', () => {
  it('should return a function', () => {
    expect(mask(['test'])).toEqual(expect.any(Function));
  });
  it('should return a mask function', () => {
    const input = { test: 'big secret' };
    expect(mask(['test'])(input)).toMatchObject({
      test: expect.stringMatching(/\*+/),
    });
  });
  it('should not add attributes', () => {
    const input = {};
    expect(mask(['test'])(input)).toEqual({});
  });
});

describe('maskArgs(attributes)', () => {
  it('should return a function', () => {
    expect(maskArgs(['test'])).toEqual(expect.any(Function));
  });
  it('should return a function that mask on first item', () => {
    const input = [{ test: 'big secret' }, { test: 'hello' }];
    expect(maskArgs(['test'])(input)).toMatchObject([
      { test: expect.stringMatching(/\*+/) },
      { test: 'hello' },
    ]);
  });
});
