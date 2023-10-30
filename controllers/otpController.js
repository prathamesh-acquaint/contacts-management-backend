const otpGenerator = require("otp-generator");
const OTP = require("../models/otpModel");
const asyncHandler = require("express-async-handler");

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    let otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Login user
// @route POST /api/veify
// @access public
const otpVerify = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;

  if (!otp || !email) {
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
  } else {
    return res.status(200).json({
      success: true,
      message: "User Verifed!",
    });
  }
});

module.exports = { sendOTP, otpVerify };
