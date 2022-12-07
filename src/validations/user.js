import Joi from "joi";

export const validateSignup = user => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(20).required(),
    lastName: Joi.string().min(2).max(20).required(),
    username: Joi.string().min(2).max(15),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(16),
  });
  return schema.validate(user);
};

export const validateLogin = login => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  return schema.validate(login);
};
