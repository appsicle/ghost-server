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

  const confirmedUser = await userInstance.save();
  return { confirmedUser };
};

module.exports = {
  createWithGoogle: async (googleDTO) => {
    const { googleId, name, email, role } = googleDTO;

    // validation
    if (!googleId || !name || !email || !role) {
      // TODO: might be bad to leak google id here
      throw new BadInputError(`Missing parameters: googleId, name, email, role`);
    }

    console.log('role got was ', role)

    if (role !== 'REVIEWER' && role !== 'REVIEWEE') {
      throw new BadInputError(`Invalid role`);
    }

    await _create({ googleId, name, email, role });
  },
  retrieveWithGoogleId: async (googleId) => {
    const retrievedUser = await UserModel.findOne({ googleId: googleId });
    console.log(retrievedUser);
    return retrievedUser;
  },
  retrieve: async (userDTO) => {
    const { userId } = userDTO;

    const retrievedUser = await UserModel.findOne({ userId: userId });
    return retrievedUser;
  },
};
