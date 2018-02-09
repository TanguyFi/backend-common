import { ValidationError, InternalError } from './errors';

/*
 * Encapsulate Joi https://github.com/hapijs/joi/blob/v13.0.2/API.md
 */

export function assertInput(schema, inputValue) {
  const { error, value } = schema.validate(inputValue);
  if (error) {
    // eslint-disable-next-line no-underscore-dangle
    throw new ValidationError(error.message, error.details, error._object);
  }
  return value;
}

export function assertInternal(schema, object) {
  const { error, value } = schema.validate(object);
  if (error) {
    throw new InternalError(error.message, { errors: error.details, object });
  }
  return value;
}

export function assertTest(schema, object) {
  const { error, value } = schema.validate(object, { abortEarly: false });
  if (error) {
    throw new Error(error.message);
  }

  return value;
}

export function format(schema, object) {
  return assertInternal(schema, object);
}
