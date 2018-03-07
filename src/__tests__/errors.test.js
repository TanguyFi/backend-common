import {
  DefaultError,
  DomainError,
  ValidationError,
  InternalError,
  only,
} from '../errors';

describe('different types of error', () => {
  describe('DefaultError', () => {
    test('should accept message and payload', () => {
      const message = 'This a test message';
      const payload = { a: 1 };
      try {
        throw new DefaultError(message, payload);
      } catch (error) {
        expect(error.message).toEqual(message);
        expect(error.payload).toEqual(payload);
        expect(error.toObject()).toEqual({ message, payload });
      }
    });
  });

  describe('DomainError', () => {
    test('should be a DefaultError and have a errorCode', () => {
      const message = 'This a test message';
      const payload = { a: 1 };
      const errorCode = 'TEST_ERROR';
      try {
        throw new DomainError(message, errorCode, payload);
      } catch (error) {
        expect(error instanceof DefaultError).toBe(true);
        expect(error.message).toEqual(message);
        expect(error.payload).toEqual(payload);
        expect(error.errorCode).toEqual(errorCode);
        expect(error.toObject()).toEqual({ message, payload, errorCode });
      }
    });
  });

  describe('ValidationError', () => {
    test('sould be a instance of DomainError', () => {
      try {
        throw new ValidationError({});
      } catch (error) {
        expect(error instanceof DomainError).toBe(true);
        expect(error.errorCode).toEqual(ValidationError.ERROR_CODE);
      }
    });
  });

  describe('InternalError', () => {
    test('should be an instance of DefaultError', () => {
      try {
        throw new InternalError();
      } catch (error) {
        expect(error instanceof DefaultError).toBe(true);
      }
    });
  });

  describe('only(ErrorType, handler)', () => {
    test('should catch error of type ErrorType', () => {
      try {
        throw new InternalError();
      } catch (error) {
        only(InternalError, err => {
          expect(err instanceof DefaultError).toBe(true);
        })(error);
      }
    });

    test('should throw error of different type', () => {
      expect(() => {
        try {
          throw new DefaultError('Plop', {});
        } catch (error) {
          only(InternalError, () => {})(error);
        }
      }).toThrow();
    });
  });
});
