import ExtendableError from 'es6-error';

export class DefaultError extends ExtendableError {
  constructor(message, payload) {
    super(message);
    this.payload = payload;
  }

  toObject() {
    return {
      message: this.message,
      payload: this.payload,
    };
  }
}

export class DomainError extends DefaultError {
  constructor(
    message = '',
    errorCode = DomainError.ERROR_CODE,
    payload = null,
  ) {
    super(message, payload);
    this.errorCode = errorCode;
  }

  static get ERROR_CODE() {
    return 'DOMAIN_ERROR';
  }

  toObject() {
    return {
      message: this.message,
      payload: this.payload,
      errorCode: this.errorCode,
    };
  }
}

export class ValidationError extends DomainError {
  constructor(errors, object) {
    super('Validation error', ValidationError.ERROR_CODE, {
      errors,
      object,
    });
  }

  static get ERROR_CODE() {
    return 'VALIDATION_ERROR';
  }
}

export class InternalError extends DefaultError {}

export function only(SpecificError, handler) {
  return function onlyHandler(error) {
    if (error instanceof SpecificError) {
      return handler(error);
    }
    throw error;
  };
}
