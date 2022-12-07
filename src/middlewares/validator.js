import { errorResponse } from "../utilities/responses";

const options = {
  stripUnknown: true,
  abortEarly: false,
  errors: {
    wrap: {
      label: ""
    }
  }
};

const validate = (schemas, values) => {
  let error = [];
  // eslint-disable-next-line no-restricted-syntax
  for (let paramToValidate of Object.keys(schemas)) {
    const value = values[paramToValidate];
    if (value) {
      const schema = schemas[paramToValidate];
      let result = schema.validate(values[paramToValidate], options);
      if (result.error) {
        error.push(
          result.error.details.map(
            detail => `${detail.message}`
          )
        );
      } else {
        // eslint-disable-next-line no-param-reassign
        values[paramToValidate] = result.value;
      }
    } else {
      error.push(`${paramToValidate} missing`);
    }
  }
  if (error.length > 0) return { error: error.flat() };
  return {};
};

const validationMiddleware = (requestSchema, auth = true) => {
  const schema = auth
    ? {
      ...requestSchema,
    }
    : requestSchema;
  return (req, res, next) => {
    const { error } = validate(schema, req);
    if (error) {
      return errorResponse(res, 422, error[0]);
    }
    next();
  };
};

export default validationMiddleware;
