const UserModel = require('../models/user.schema');
const { v4: uuid } = require('uuid');
const { NoAccessError, BadInputError, StatusCodeError } = require('../errors');

const createWithGoogle = async (
  googleId,
  name,
  email,
  role,
  bio = null,
  age = null,
  ethnicity = null,
  location = null,
  profilePic = null,
) => {
  // required fields
  if (!googleId || !name || !email || !role) {
    console.log(googleId, name, email, role);
    throw new BadInputError(`Missing parameters: googleId, name, email, role`);
  }
  if (role !== 'REVIEWER' && role !== 'REVIEWEE') {
    throw new BadInputError(`Invalid role`);
  }

  // check duplicate
  const checkDup = await UserModel.findOne({ googleId: googleId });
  if (checkDup) {
    throw new StatusCodeError(400, 'User already has an account');
  }

  const userInstance = new UserModel({
    userId: uuid(),
    googleId,
    name,
    email,
    role,
    bio,
    age,
    ethnicity,
    location,
    profilePic,
  });

  return await userInstance.save();
};

const createWithEmailPassword = async (
  password,
  name,
  email,
  role,
  status = null,
  bio = null,
  age = null,
  ethnicity = null,
  location = null,
  profilePic = null,
) => {
  // required fields
  if (!password || !name || !email || !role) {
    console.log(password, name, email, role);
    throw new BadInputError(`Missing parameters: googleId, name, email, role`);
  }
  if (role !== 'REVIEWER' && role !== 'REVIEWEE') {
    throw new BadInputError(`Invalid role`);
  }

  // check duplicates
  const checkDup = await UserModel.findOne({ email: email });
  if (checkDup) {
    throw new StatusCodeError(400, 'User already has an account');
  }

  const userInstance = new UserModel({
    userId: uuid(),
    name,
    email,
    role,
    status,
    bio,
    age,
    ethnicity,
    location,
    profilePic,
  });

  userInstance.setPassword(password);

  const confirmedUser = await userInstance.save();
  return confirmedUser;
};

const retrieveWithEmailPassword = async (email, password) => {
  const retrievedUser = await UserModel.findOne({ email: email });

  if (retrievedUser === null) {
    throw new NoAccessError('User not found');
  }

  if (!retrievedUser.validPassword(password)) {
    throw new NoAccessError('Wrong Password');
  }

  return retrievedUser;
};

const retrieveWithGoogleId = async (googleId) => {
  const retrievedUser = await UserModel.findOne({ googleId: googleId });

  if (retrievedUser === null) {
    throw new NoAccessError('User not found');
  }

  return retrievedUser;
};

module.exports = {
  createWithGoogle,
  retrieveWithGoogleId,
  createWithEmailPassword,
  retrieveWithEmailPassword,
};
