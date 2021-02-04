const UserModel = require('../models/user.schema')

module.exports = {
    create: async (userDTO) => {
        const { userId, name, email, role } = userDTO

        const userInstance = new UserModel({
            userId: userId,
            name: name,
            email: email,
            role: role
        })

        try {
            const confirmedUser = await userInstance.save();
            return { confirmedUser };
        } catch (err) {
            console.log(err)
            return { err };
        }

    },
    retrieve: async (userDTO) => {
        const { userId } = userDTO

        try {
            const retrievedUser= await UserModel.findOne({ userId: userId });
            return { retrievedUser };
        } catch (err) {
            console.log(err)
            return { err };
        }
    }
}