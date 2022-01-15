const Joi = require("joi");

const userregschema = Joi.object({
  name: Joi.string().min(6).max(100).required(),
  email: Joi.string().min(6).max(100).required().email(),
  password: Joi.string().min(6).max(100).required(),
  dob: Joi.string().min(6).max(100).required(),
  gender: Joi.string().required(),
});

const userloginschema = Joi.object({
  email: Joi.string().min(6).max(100).required().email(),
  password: Joi.string().min(6).max(100).required(),
});

const userforgotpasswordschema = Joi.object({
  email: Joi.string().min(6).max(100).required().email(),
});

const userotpvalidateschema = Joi.object({
  email: Joi.string().min(6).max(100).required().email(),
  otp: Joi.string().min(4).max(4).required(),
});

const userupdateschema = Joi.object({
  name: Joi.string().min(6).max(100).required(),
  password: Joi.string().min(6).max(100).required(),
  dob: Joi.string().min(6).max(100).required(),
  gender: Joi.string().required(),
});

const userregschemavalidation = (validation) => {
  return userregschema.validate(validation);
};

const userloginschemavalidation = (validation) => {
  return userloginschema.validate(validation);
};

const userupdateschemavalidation = (validation) => {
  return userupdateschema.validate(validation);
};

const userotpschemavalidation = (validation) => {
  return userotpvalidateschema.validate(validation);
};

const userforgotpasswordschemavalidation = (validation) => {
  return userforgotpasswordschema.validate(validation);
};

module.exports.userregschemavalidation = userregschemavalidation;

module.exports.userloginschemavalidation = userloginschemavalidation;

module.exports.userupdateschemavalidation = userupdateschemavalidation;

module.exports.userotpschemavalidation = userotpschemavalidation;

module.exports.userforgotpasswordschemavalidation =
  userforgotpasswordschemavalidation;
