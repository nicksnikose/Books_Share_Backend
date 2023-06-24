const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

// create schema
const salt=bcrypt.genSaltSync(10)

const signupSchema = new Schema({
   firstName: {
        type:String,
    },
    lastName:{
      type:String,  
   },
    email:{
        type:String,   
        unique:true 
    },
    password:{
      type:String
    },
    number:{
        type:Number,
    },
    fullAddress:{
      type:String
    },
    PinCode:{
      type:String
    },
    City:{
      type:String
    },
    img:{
      type:String,
      default: 'default.jpg'
  },
  numberofbooks:{
    type:Number
  }
  

});

signupSchema.pre('save', function(next) {
    if (this.isModified('password')) { // check if password is modified then has it
      var user = this;
      bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    } else {
      next();
    }
  });

signupSchema.methods.correctPassword=async function(
    candidatePassword,
    userPassword
){
 return await bcrypt.compare(candidatePassword,userPassword)
};


const Signup = mongoose.model('signup',signupSchema);
module.exports = Signup;