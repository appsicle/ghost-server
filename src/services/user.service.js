const UserModel = require('../models/user.schema');
const { v4: uuid } = require('uuid');

const _create = async (userDTO) => {
  const { userId = uuid(), googleId, name, email, role, status } = userDTO;
  const userInstance = new UserModel({
    userId,
    googleId,
    name,
    email,
    role,
    status,
  });

  try {
    const confirmedUser = await userInstance.save();
    return { confirmedUser };
  } catch (err) {
    console.log(err);
    return { err };
  }
};

module.exports = {
  createWithGoogle: async (googleDTO) => {
    const { googleId, name, email, role } = googleDTO;

    // validation
    if (!googleId || !name || !email) {
      throw 'Missing parameters';
    }

    console.log('role got was ', role)

    if (role !== 'REVIEWER' && role !== 'REVIEWEE') {
      throw 'Invalid role';
    }

    await _create({ googleId, name, email, role });
  },
  retrieveWithGoogleId: async (googleId) => {
    try {
      const retrievedUser = await UserModel.findOne({ googleId: googleId });
      console.log(retrievedUser);
      return { retrievedUser };
    } catch (err) {
      console.log(err);
      return { err };
    }
  },
  retrieve: async (userDTO) => {
    const { userId } = userDTO;

    try {
      const retrievedUser = await UserModel.findOne({ userId: userId });
      return { retrievedUser };
    } catch (err) {
      console.log(err);
      return { err };
    }
  },
};
