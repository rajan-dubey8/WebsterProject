const mongoose = require("mongoose");

const useSchema = new mongoose.Schema({


    title: {
        type: "String"
    },
    createdBy: {
        type: "String",

    },
    image: {
        type: "String"
    },
    text: {
        type: "String"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    likes: {
        type: Number,
        default: 1
    },
    comments: [
        {
        by: "String",
        text: "String"
    }

    ]
})

// creating collection or model

const Blogs = new mongoose.model("Blogs", useSchema);
module.exports = Blogs;
