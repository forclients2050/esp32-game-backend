const Joi = require('joi');

const validateSignup = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

const validateGame = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow('').optional(),
  });
  return schema.validate(data);
};

const validateDevice = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    macAddress: Joi.string()
      .pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
      .required()
      .messages({ 'string.pattern.base': 'Please provide a valid MAC address' }),
    ipAddress: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).allow('').optional(),
  });
  return schema.validate(data);
};

module.exports = {
  validateSignup,
  validateLogin,
  validateGame,
  validateDevice,
};
