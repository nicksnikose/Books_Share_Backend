const express = require("express")
const userController = require("../controller/userController")
const Signup = require("../model/schema")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer")



const router = express.Router();
const storage = multer.diskStorage({
  destination: './jwtui/public',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });

router
  .route('/users')
  .get(userController.getAllUsers)
  .post(userController.createUser)

router
  .route("/users/login")
  .post(userController.loginUser)

router.route("/users/:id")
  .put(userController.updateUser)
  .get(userController.getUser)

router
  .put("/users/:id/image", upload.single("image"), userController.updateUserPhoto)
  .put("/users/:id/video", upload.single("video"), userController.updateUserVideo)
  .put("/users/:id/pdf", upload.single("pdf"), userController.updateUserpdf)

router
  .route("/sendotp")
  .post(userController.sendOtp)

router
  .route("/submitotp")
  .post(userController.submitOtp)

module.exports = router;