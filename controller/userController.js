const Signup = require("../model/schema")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer= require("nodemailer")

const loginToken = id => {
    return jwt.sign({ id }, `${process.env.JWT_SECRET_KEY}`, {
      expiresIn: "1h"
    })
  }




// get all users

exports.getAllUsers = (req,res)=>{
    Signup.find().then((result)=>{
        res.json(result)
    })
}


//create all users  or registrer User

exports.createUser = async (req,res,next)=>{  
  const { email } = req.body;  

  const existingUser = await Signup.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already exists' });
  }
    const User=  await Signup.create(req.body)
    const token = loginToken(User._id)
    res.status(201).json({
        token,
        data:{
            User
        }
    })

    if(!User){
        res.status(404).json({
            error:"User not found"
        })
    }
}


// Login User

exports.loginUser = async function(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required."
      });
    }
  
    const user = await Signup.findOne({ email }).select('+password');
  
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }
  
    const passwordMatch = await user.correctPassword(password, user.password);
  
    if (!passwordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect password."
      });
    }
  
    const token = loginToken(user)
  
    res.status(200).json({
      token,
      data: {
        user
      }
    });
  }


  //getSingle User


  exports.getUser= async (req, res) => {
    const {id} = req.params;
  
    try {
        const profile = await Signup.findOne({ _id: id });
    
        if (!profile) {
          console.log('Profile not found');
          return res.status(404).send('Profile not found');
        }
        res.json({profile});
      } catch (error) {
        console.log('Error retrieving profile:', error);
        res.status(500).send('Error retrieving profile');
      }
    }

// Update Users Profile Pic

  exports.updateUserPhoto= async (req, res) => {
    const {id} = req.params;
  
    try {
         const user = await Signup.findOneAndUpdate(
    { _id: id },
    { $set: { img: req.file.filename } },
    { new: true }
  ).select('+password');

  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (req.file) {
        // If a file is uploaded, update the image field
        user.img = req.file.filename;
      }
  
    
  await user.save({ validateBeforeSave: false });
  const updatedUser = await Signup.findById(id).select('+password');
  
      res.json(
      {
        user:updatedUser
      });
      
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  }

  // update user Video
  exports.updateUserVideo= async (req, res) => {
    const {id} = req.params;
  
    try {
         const user = await Signup.findOneAndUpdate(
    { _id: id },
    { $set: { video: req.file.filename } },
    { new: true }
  ).select('+password');

  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (req.file) {
        // If a file is uploaded, update the video field
        user.video = req.file.filename;
      }
  
    
  await user.save({ validateBeforeSave: false });
  const updatedUser = await Signup.findById(id).select('+password');
  
      res.json(
      {
        user:updatedUser
      });
      
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  }


  exports.updateUserpdf= async (req, res) => {
    const {id} = req.params;
  
    try {
         const user = await Signup.findOneAndUpdate(
    { _id: id },
    { $set: { pdf: req.file.filename } },
    { new: true }
  ).select('+password');

  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (req.file) {
        // If a file is uploaded, update the video field
        user.pdf = req.file.filename;
      }
  
    
  await user.save({ validateBeforeSave: false });
  const updatedUser = await Signup.findById(id).select('+password');
  
      res.json(
      {
        user:updatedUser
      });
      
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  }



  // Update User Data

  exports.updateUser=async function(req,res){
    const { id } = req.params;
    const data = req.body;
    try {
      const user = await Signup.findOneAndUpdate({ _id: id }, data);
      const newtoken = loginToken(user)
      if (!user) {
        res.status(404).json({ message: 'user Not Found'});
      } else {
        res.status(200).json({
              newtoken,
              data: {
                user
              }

        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}


// Send Otp for Forget Pass

exports.sendOtp = async (req, res) => {
  console.log(req.body);
  const _otp = Math.round(10000 + Math.random() * 90000);
  console.log(_otp);

  let user = await Signup.findOne({ email: req.body.email });
  if (!user) {
    return res.status(500).json({ message: "User not found" });
  }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secureConnection: false,
    auth: {
      user: "mohodsameer84@gmail.com",
      pass: "jziypgnyzpyqfpdx",
    },
  });

  try {
    let info = await transporter.sendMail({
      from: "mohodsameer84@gmail.com",
      to: req.body.email,
      subject: "OTP",
      text: String(_otp),
      html: `<html><body> Verify Your OTP: ${_otp} </body></html>`,
    });

    if (info.messageId) {
      console.log(info, 84);
      Signup.updateOne({ email: req.body.email }, { otp: _otp })
        .then((result) => {
          res.status(200).json({ message: "OTP sent" });
        })
        .catch((err) => {
          res.status(500).json({ message: "Server error" });
        });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  } catch (error) {
    console.log("An error occurred while sending the OTP:", error);
    res.status(500).json({ message: "An error occurred while sending the OTP" });
  }
};


/// Submit Otp and Verify

     exports.submitOtp=(req, res) => {
        console.log(res.body);
      
        Signup.findOne({ otp: req.body.otp }).then(result => {
          // Assuming Signup is your mongoose model
          if (!result) {
            res.send({ code: 500, message: 'OTP is wrong' });
            return;
          }
      
          // Hash the new password
          bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) {
              res.send({ code: 500, message: 'Error hashing password' });
              return;
            }
      
            // Update the password with the hashed password
            Signup.updateOne({ email: result.email }, { password: hashedPassword })
              .then(() => {
                res.send({ code: 200, message: 'Password updated' });
              })
              .catch(err => {
                res.send({ code: 500, message: 'Server error' });
              });
          });
        }).catch(err => {
          res.send({ code: 500, message: 'OTP is wrong' });
        });
      }