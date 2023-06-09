const userSchema = require("../Schema/userSchema");
const bcrypt = require("bcrypt");
const generateToken = require("../config/generateToken");

module.exports = {
  createANewUser: async (req, res) => {
    try {
      const checkUser = await userSchema.findOne({ email: req.body.email });
      if (checkUser) return res.json({ error: "User already exists" });
      const encryptedPassword = await bcrypt.hash(req.body.password, 10);

      const User = new userSchema({
        userName: req.body.userName,
        email: req.body.email,
        password: encryptedPassword,
      });
      User.save();
      res.json({ success: true });
    } catch (error) {
      res.json({ error: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userSchema.findOne({ email: email });
      if (!user) return res.json({ error: "User not found" });
      const checkPassword = await bcrypt.compare(password, user.password);
      if (checkPassword) {
        const token = await generateToken({ id: user._id, email: email });
        const userObject = {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          createdAt: user.createdAt,
          about: user.about,
          reputation: user.reputation,
        };

        res.json({ status: true, token: token, userObject: userObject });
      } else {
        res.json({ error: "Invalid password" });
      }
    } catch (error) {
      res.json({ error: error.message });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const users = await userSchema.aggregate([
        { $project: { userName: 1, createdAt: 1 } },
      ]);

      res.json({ users: users });
    } catch (error) {
      res.json({ error: error.message });
    }
  },
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await userSchema.findById(id);

      const user = {
        _id: data._id,
        userName: data.userName,
        reputation: data.reputation,
        createdAt: data.createdAt,
        about: data.about,
      };

      res.json({ userData: user });
    } catch (error) {
      res.json({ error: error.message });
    }
  },

  searchUser: async (req, res) => {
    try {
      const { search } = req.query;
      const data = await userSchema.find({
        userName: { $regex: `${search}`, $options: "i" },
      });
      res.json({ users: data });
    } catch (error) {
      res.json({ error: error.message });
    }
  },

  edit: async (req, res) => {
    try {
      const userObj = {
        userName: req.body.userName,
        about: req.body.about,
        email: req.body.email,
      };
      const data = await userSchema.updateOne(
        { _id: req.params.id },
        {
          $set: {
            email: userObj.email,
            about: req.body.about,
            userName: req.body.userName,
          },
        }
      );
      const user = await userSchema.findById(req.params.id);
      const userObject = {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        createdAt: user.createdAt,
        about: user.about,
        reputation: user.reputation,
      };
    
      res.json({ data: userObject, edited: true });
    } catch (error) {
      res.json({ error: error.message });
    }
  },
 
};