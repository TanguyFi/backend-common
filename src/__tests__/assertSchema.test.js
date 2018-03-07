import Joi from 'joi';
import { only, ValidationError } from '../errors';
import { assertInput } from '../assertSchema';

describe('assertSchema', () => {
  describe('assertInput', () => {
    const Schema = Joi.object({
      a: Joi.string().required(),
      b: Joi.number().required(),
      c: Joi.object({
        d: Joi.string().required(),
      }).required(),
    });

    test('should throw a ValidationError', () => {
      const test = { c: {} };
      try {
        assertInput(Schema, test);
      } catch (e) {
        only(ValidationError, error => {
          expect(error.payload.errors).toMatchObject({
            a: expect.any(String),
            b: expect.any(String),
            c: {
              d: expect.any(String),
            },
          });
          expect(error.payload.object).toEqual(test);
        })(e);
      }
    });
  });
});
