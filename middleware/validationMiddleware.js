import { body, param, validationResult } from 'express-validator';
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from '../errors/customErrors.js';
import mongoose from 'mongoose';
import UserModel from '../models/UserModel.js';

const withValidationErrors = (validateValues) => {
  return [
    ...validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        if (errorMessages[0].startsWith('no job')) {
          throw new NotFoundError(errorMessages);
        }
        if (errorMessages[0].startsWith('not authorized')) {
          throw new UnauthenticatedError(errorMessages);
        }
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateRegisterInput = withValidationErrors([
  body('name').notEmpty().trim().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('please provide valid email')
    .custom(async (email) => {
      const previousUser = await UserModel.findOne({ email });
      if (previousUser)
        throw Error('the email is already registered in the database');
    })
    .trim(),
  body('password')
    .isLength({ min: 8, max: 12 })
    .withMessage('password should be between 8 and 12 characters long')
    .notEmpty()
    .withMessage('password is required'),
]);

export const validateLoginInput = withValidationErrors([
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('please provide a valid email')
    .trim(),
  body('password').notEmpty().withMessage('password is required'),
]);

export const validateIdParam = withValidationErrors([
  param('id').custom(async (value, { req }) => {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) throw new Error('invalid mongoDB id');

    const job = await JobModel.findById(value);
    if (!job) throw new Error(`no job with id ${value}`);

    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.userID === job.createdBy.toString();
    if (!isAdmin && !isOwner)
      throw new Error('not authorized to acces this route');
  }),
]);

export const validateUpdateUserInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required').trim(),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('please provide valid email')
    .custom(async (email, { req }) => {
      const previousUser = await UserModel.findOne({ email });
      if (previousUser && previousUser._id.toString() !== req.user.userId)
        throw Error('the email is already registered in the database');
    })
    .trim(),
]);
