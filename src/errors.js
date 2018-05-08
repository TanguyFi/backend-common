import ExtendableError from 'es6-error';

export class DefaultError extends ExtendableError {
  constructor(
    message = '',
    errorCode = DefaultError.ERROR_CODE,
    payload = null,
  ) {
    super(message);
    this.payload = payload;
    this.errorCode = errorCode;
  }

  static get ERROR_CODE() {
    return 'DEFAULT_ERROR';
  }

  toObject() {
    return {
      message: this.message,
      payload: this.payload,
      errorCode: this.errorCode,
    };
  }
}

export class DomainError extends DefaultError {
  constructor(message, errorCode = DomainError.ERROR_CODE, payload = null) {
    super(message, errorCode, payload);
  }

  static get ERROR_CODE() {
    return 'DOMAIN_ERROR';
  }
}

export class ValidationError extends DefaultError {
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

export class InternalError extends DefaultError {
  constructor(message, payload) {
    super(message, InternalError.ERROR_CODE, payload);
  }

  static get ERROR_CODE() {
    return 'INTERNAL_ERROR';
  }
}

export function only(SpecificError, handler) {
  return function onlyHandler(error) {
    if (error instanceof SpecificError) {
      return handler(error);
    }
    throw error;
  };
}
