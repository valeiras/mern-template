import { StatusCodes } from 'http-status-codes';
import UserModel from '../models/UserModel.js';

export const getAllUsers = async (req, res) => {
  const users = await UserModel.find();
  res.status(StatusCodes.OK).json({ users });
};

export const getAppData = async (req, res) => {
  const nbUsers = await UserModel.countDocuments();
  const otherAdminData = {};
  res.status(StatusCodes.OK).json({ nbUsers, otherAdminData });
};
