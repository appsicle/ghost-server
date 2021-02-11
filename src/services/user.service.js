const UserModel = require('../models/user.schema');
const { v4: uuid } = require('uuid');

const _create = async (userDTO) => {
  const { userId = uuid(), googleId, name, email, role, status, bio, age, ethnicity, location, profilePic } = userDTO;
  const userInstance = new UserModel({
    userId,
    googleId,
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

  const confirmedUser = await userInstance.save();
  return confirmedUser;
};

module.exports = {
  createWithGoogle: async (googleDTO) => {
    const { googleId, name, email, role, bio, age, ethnicity, location, profilePic } = googleDTO;

    // validation
    if (!googleId || !name || !email || !role) {
      console.log(googleId, name, email, role)
      throw new BadInputError(`Missing parameters: googleId, name, email, role`);
    }

    console.log('role got was ', role)

    if (role !== 'REVIEWER' && role !== 'REVIEWEE') {
      throw new BadInputError(`Invalid role`);
    }

    return await _create({ googleId, name, email, role, bio, age, ethnicity, location, profilePic });
  },
  retrieveWithGoogleId: async (googleId) => {
    const retrievedUser = await UserModel.findOne({ googleId: googleId });
    console.log(retrievedUser);
    return retrievedUser;
  },
  retrieve: async (userId) => {
    const retrievedUser = await UserModel.findOne({ userId: userId });
    return retrievedUser;
  },
};
