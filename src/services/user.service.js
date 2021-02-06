const UserModel = require('../models/user.schema');

module.exports = {
  create: async (googleId, name, email, role) => {
    const userId = uuid();
    const userInstance = new userModel({
      userId,
      googleId,
      name,
      email,
      role,
    });

    try {
      const confirmedUser = await userInstance.save();
      return { confirmedUser };
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
