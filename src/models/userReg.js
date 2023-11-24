const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: "String",
        required: true
    },
    mobileNo: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: "String",
        required: true,
        unique: true
    },
    password: {
        type: "String",
       
        required: ['true', 'password is a required field'],
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    
    token:{
        type:String,
        default:""
    }

})

// creating collection or model

const Register=new mongoose.model("Register",userSchema);
module.exports=Register;
