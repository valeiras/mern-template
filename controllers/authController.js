import UserModel from '../models/UserModel.js';
import { StatusCodes } from 'http-status-codes';
import { UnauthenticatedError } from '../errors/customErrors.js';
import { comparePasword, hashPassword } from '../utils/passwordUtils.js';
import { createJWT } from '../utils/tokenUtils.js';

export const register = async (req, res) => {
  const isFirstUser = (await UserModel.countDocuments()) === 0;
  req.body.role = isFirstUser ? 'admin' : 'user';

  req.body.password = await hashPassword(req.body.password);

  const user = await UserModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: 'user created' });
};

export const login = async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });
  const isValidUser =
    user && (await comparePasword(req.body.password, user.password));

  if (!isValidUser) throw new UnauthenticatedError('invalid credentials');

  const token = createJWT({ userId: user._id, role: user.role });
  const oneDay = 1000 * 60 * 24;
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(StatusCodes.OK).json({ msg: 'login successful' });
};

export const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(Date.now()) });
  res.status(StatusCodes.OK).json({ msg: 'user logged out' });
};
