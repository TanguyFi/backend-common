import { assocPath } from 'ramda';
import { InternalError, ValidationError } from './errors';

/*
 * Encapsulate Joi https://github.com/hapijs/joi/blob/v13.0.2/API.md
 */

function transformJoiError(joiError) {
  return joiError.details.reduce(
    (acc, detail) => assocPath(detail.path, detail.message, acc),
    {},
  );
}

export function assertInput(schema, inputValue) {
  const { error, value } = schema.validate(inputValue, { abortEarly: false });
  if (error) {
    const errors = transformJoiError(error);
    throw new ValidationError(errors, inputValue);
  }
  return value;
}

export function assertInternal(schema, object) {
  const { error, value } = schema.validate(object);
  if (error) {
    const errors = transformJoiError(error);
    throw new InternalError('Internal validation error', {
      errors,
      object,
    });
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
