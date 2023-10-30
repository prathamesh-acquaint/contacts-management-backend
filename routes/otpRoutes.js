const express = require("express");
const otpController = require("../controllers/otpController");
const router = express.Router();
router.post("/send-otp", otpController.sendOTP);
router.post("/verify", otpController.otpVerify);

module.exports = router;
