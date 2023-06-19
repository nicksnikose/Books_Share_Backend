const express = require ('express');
const bodyParser= require('body-parser');
const mongoose=require("mongoose")
const cors = require('cors');
const jwt = require("jsonwebtoken")

const userRouter =require('./router/userRoutes')


// set up express app
const app = express();
app.use(cors())


app.use(bodyParser.json());
// connect to server 
mongoose.connect('mongodb://127.0.0.1:27017/books_share')
mongoose.Promise = global.Promise


///Storage



//initialize routes
app.use("/",userRouter);

app.use(function(err,req,res,next){
     res.send({error:err.message})
})



// listen for req
app.listen(process.env.port||5000,function(){
 console.log("Books Share port 5000");
});


module.exports = app