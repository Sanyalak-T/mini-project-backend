import { User } from "../../../../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    // exclude passwords in the result
    // const users = await User.find();
    // res.status(200).json({ error: false, users });
    const users = await User.find().select("-password").sort("-createdAt");
    res.json({
      error: false,
      users,
      message: "All users retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch users",
      details: err.message,
    });
  }
};

// next step from here.

export const createUser = async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName) {
    return res.status(400).json({
      error: true,
      message: "Fullname is required",
    });
  }

  if (!email) {
    return res.status(400).json({
      error: true,
      message: "Email is required",
    });
  }

  try {
    // prevent dupplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({
        error: true,
        message: "Email alreay in use!",
      });
    }

    // create and save new user
    const user = new User({ fullName, email });
    await user.save();

    res.status(201).json({
      error: false,
      user,
      message: "User created successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
};
