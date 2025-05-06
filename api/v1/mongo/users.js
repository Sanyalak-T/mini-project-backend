import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../models/User.js";
import { getAllUsers, createUser } from "./controllers/usersController.js";
import { authUser } from "../../../middleware/auth.js";

const router = express.Router();

// No auth required
// get all users
// use controller to ligics
router.get("/users", getAllUsers);

// create a user
// use controller to ligics
router.post("/users", createUser);

// get a user by ID
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json({
      error: false,
      user,
      message: "Fetch a user successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch a user",
      details: err.message,
    });
  }
});

// new get public profile
// router.get("/public-profile/:id", async (req, res) => {
//   const { id } = req.params;
//   // const { fullName } = req.body;

//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       console.log("no user");
//     }

//     // if (!fullName) {
//     //   console.log("no fullname");
//     // }
//     res.status(200).json({
//       error: false,
//       user,
//       message: "Fetch a public profile successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       error: true,
//       message: "Failed to fetch a full name and user",
//       details: err.message,
//     });
//   }
// });

// update a user
// locgic in a route
router.put("/users/:id", async (req, res) => {
  const payload = req.body;
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(id, { $set: payload });
    res.status(200).json({ user });
  } catch (err) {
    res.status(400).json({
      error: true,
      message: "Failed to update a user",
      details: err.message,
    });
  }
});

// delete a user
// locgic in a route
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to delete a user",
      details: err.message,
    });
  }
});

// register a new user
router.post("/auth/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    res.status(400).json({
      error: true,
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        error: true,
        message: "Email already in use.",
      });
    }

    const user = new User({ fullName, email, password });
    await user.save();
    res.status(201).json({
      error: false,
      message: "User register succussfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// login a user - jwt signed token
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        error: true,
        message: "Invalid credentials - user not found!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        error: true,
        message: "Invalid credentials - user not match",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // jwt.sign => เหมือนกับให้ CEO มา sign งาน => รับพารามิเตอร์ 3 ส่วน
    // ส่วนที่ 1 เปรียบเหมือนกับแม่คุณแจ
    // ส่วนที่ 2 เปรียบเหมือนกับคุณแจ
    // ส่วนที่ 3 เปรียบเหมือนว่าคุณสามารถใช้งานได้ภายในเวลาเท่าไร

    res.status(200).json({
      error: false,
      token,
      message: "Login Successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// get current user profile (protected route)
router.get("/auth/profile", authUser, async (req, res) => {
  const user = await User.findById(req.user.user._id).select("-password"); //exclude password
  if (!user) {
    return res.status(404).json({
      error: true,
      message: "User not found",
    });
  }
  res.status(200).json({
    error: false,
    user,
  });
});

// login a user - jwt signed token
router.post("/auth/cookie/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email and password are required!",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Invalid credenitals - user not found!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: "Invalid credinitals - user not match",
      });
    }

    // generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // 1 hour expiration
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, //only send over HTTPS in prod
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000, //1 hour
    });

    res.status(200).json({
      error: false,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      }, //send some safe public info if needed
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// Logout
router.post("/auth/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// verify token
router.get("/auth/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      error: true,
      message: "Token is required",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      error: false,
      userId: decoded.userId,
      message: "Token is valid",
    });
  } catch (err) {
    res.status(401).json({
      error: true,
      message: "Invalid token",
    });
  }
});

// No use after implementing auth
// create user accunt
router.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res.status(400).json({
      error: true,
      message: "Full Name is required",
    });
  }

  if (!email) {
    return res.status(400).json({
      error: true,
      message: "Email is required",
    });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.json({
      error: true,
      message: "User already exist",
    });
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successful",
  });

  // get user
  router.get("/get-user", async (req, res) => {
    const { user } = req.user;
    const isUser = await User.findOne({ _id: user._id });
    if (!isUser) {
      return res.sendStatus(401);
    }

    return res.json({
      user: isUser,
      message: "",
    });
  });

  router.get("/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ user: req.user });
  });
});

export default router;
