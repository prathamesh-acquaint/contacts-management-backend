const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const OTP = require("../models/otpModel");

// @desc Register user
// @route POST /api/users/register
// @access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  console.log(username, email, password);

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed pasword: ", hashedPassword);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    console.log(user);
    if (user) {
      res.status(201).send({ _id: user.id, _email: user.email });
    } else {
      res.status(400);
      throw new Error("user data is not valid");
    }
    res.json({ message: "Register the user" });
  } catch (error) {
    console.log(error);
  }
});

// @desc Login user
// @route POST /api/user/register
// @access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email || !password || !otp) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  // Find the most recent OTP for the email
  const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
  if (response.length === 0 || otp !== response[0].otp) {
    return res.status(400).json({
      success: false,
      message: "The OTP is not valid",
    });
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ accessToken });
  } else {
    res.status(400);
    throw new Error("Invalid login details");
  }
  res.json({ message: "Login the user" });
});

// @desc Current user details.
// @route POST /api/user/current
// @access private
const currentUser = asyncHandler(async (req, res) => {
  console.log(JSON.stringify(req.headers));
  res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };
