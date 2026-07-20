import User from "../model/userModel.js";

export const createUser = async (req, res) => {
    try {
        const userData = new User(req.body);

        const { email } = req.body;

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({
                message: "User already exists."
            });
        }

        const savedUser = await userData.save();

        return res.status(200).json(savedUser);

    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error."
        });
    }
};

export const fetch = async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) {
            return res.status(404).json({
                message: "No users found."
            });
        }
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({
            error: "Internal Server Error."
        });
    }
};
export const update = async (req, res) => {
    try { 
        const id = req.params.id;
        const userExist = await User.findOne({ _id: id });
        if (!userExist) {
            return res.status(404).json({
                message: "User not found."
            });
        }
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        res.status(201).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error." });

    }
};

export const deleteUser = async (req, res) => {
    try {
          const id = req.params.id;
        const userExist = await User.findOne({ _id: id });
        if (!userExist) {
            return res.status(404).json({
                message: "User not found."
            });
        }
        await User.findByIdAndDelete(id);
        res.status(201).json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error." });
    }
}