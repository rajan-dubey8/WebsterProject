
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "config.env") });


const CON_STR = process.env.CONN_STR;
// console.log(process.env.CONN_STR);
const local = "mongodb://127.0.0.1:27017";
mongoose
  .connect(CON_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((conn) => {
    //console.log(conn);
    console.log("DB connection successfull");
  })
  .catch((err) => {
    console.log("error occurred " + err);
  });


