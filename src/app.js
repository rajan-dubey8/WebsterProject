const express = require("express");
const app = express();
const port = 8000;
const path = require("path");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const session = require("express-session");

const mongoDBSession = require("connect-mongodb-session")(session);
require("./db/conn");
const db =
  "mongodb+srv://user_rd:rdrajan5751@cluster0.sqyghbz.mongodb.net/MySpace?retryWrites=true&w=majority";
const local = "mongodb://127.0.0.1:27017";
const store = new mongoDBSession({
  uri: local,
  collection: "mySession",
});

//using session
app.use(
  session({
    secret: "key that will sign cookies ",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/gallery");
  },

  filename: function (req, file, cb) {
    return cb(null, Date.now() + path.extname(file.originalname));
    // return cb(null, `${Date.now()}-${file.originalname}`);  //error and result
  },
});
const upload = multer({
  storage: storage,
});

app.use(express.json());
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views")); //for linking ejs files folder
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); //for linking html and css files folder
app.use(express.static(path.join(__dirname, "../public/gallery")));

const Register = require("./models/userReg"); // acquiring our model
const Blogs = require("./models/blogs");
const { randomBytes } = require("crypto");
const { NONAME } = require("dns");

app.listen(port, () => {
  console.log("listening to port " + port);
});

// const postss = [
//     {
//        image: "https://therepproject.org/wp-content/uploads/2023/10/ThickSkin_16x9_PR_TuneIn-copy-1536x864.jpeg",
//        title: "THICK SKIN IS #MEDIAWELIKE",
//        text: "Last month, Thick Skin premiered"

//        comments: [{
//           by: "Shivam",
//           txt: "Fabulous Post"
//        }]
//     },

//     {
//        image: "https://therepproject.org/wp-content/uploads/2023/10/Untitled-design-2023-10-10T152908.663-1100x619.png",
//        title: "RECOMMENDATIONS FROM A RESTORATIVE JUSTICE FACILITATOR",
//        text: "For the most recent conversation in our #EndRape Expert IRE.",
//        createdBy: "Ayush",
//        comments: [{
//           by: "Abhay",
//           txt: "Incredible blog"
//        }]

//     }
// ]

//nodemailer

//middleware for authorisation
const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

const root_email = "rajandubey5751@gmail.com";
const pass = "nhzy hewr sqcl dwlw";
const sendResetMail = async (name, email, token) => {
  // try {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "rajandubey5751@gmail.com",
      pass: "nhzy hewr sqcl dwlw",
    },
  });
  const mailOptions = {
    from: "rajandubey5751@gmail.com",
    to: email,
    subject: "For Reset Password",
    html:
      "<h3>Hii !  " +
      name +
      '</h3><br><h5>Please click here to <a href="http://127.0.0.1:8000/forget-password?token=' +
      token +
      '">Reset</a> your password.</h5>',
  };
  // transporter.sendMail(mailOptions,  (error)=> {
  //     if (error) {
  //         console.log("error under sendResetMail under transporter " + error);
  //     } else {
  //         console.log("Email has been sent ");
  //     }
  // })

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email has been sent ");
  } catch (err) {
    console.log("error occurred under sendMail " + err);
  }

  // } catch (err) {
  //     console.log("error under sendResetMail " + err.message);
  // }
};

let name = "";
let currUser = "";
app.get("/", (req, res) => {
  res.render("welcome.ejs");
});

app.post("/signin", async (req, res) => {
  try {
    // console.log(req.body);
    let email = req.body.email;
    let password = req.body.password;
    // console.log(`${email} ans password is ${password}`);
    const user = await Register.findOne({ email: email });
    // console.log(user);
    if (user === null) {
      throw "First sign up with your details";
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      name = user.name;
      currUser = user.name;
      const posts = await Blogs.find();
      req.session.isAuth = true;
      res.redirect("/home");
      // res.status(200).render("home.ejs", { name, posts });
    } else {
      // res.render("logIn.ejs");
      throw "Invalid login details";
    }
  } catch (err) {
    console.log("error occurred " + err);

    res.render("logIn.ejs", { err });
    // alert("invalid details");
    //  res.send(err);
  }
});
app.post("/signup", async (req, res) => {
  try {
    const password = req.body.password;
    const register = await Register.create(req.body);
    const hashpswd = await bcrypt.hash(password, 12);
    const updated = await Register.findByIdAndUpdate(
      { _id: register._id },
      { $set: { password: hashpswd } }
    );
    name = req.body.name;
    currUser = req.body.name;
    req.session.isAuth = true;
    res.redirect("/home");
  } catch (err) {
    console.log("error occurred " + err);

    // res.status(404).json({
    //     status:"fail",
    //     message:err.message
    // });
    //  res.send(err.message);
    err.message = "Email or Mobile_No already registered";
    res.render("logIn.ejs", { err });
  }
});

app.post("/forget", async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);
    const userData = await Register.findOne({ email: email });
    if (userData) {
      const randomString = randomstring.generate();
      const updatedData = await Register.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetMail(userData.name, userData.email, randomString);
      // console.log(userData.name+" "+userData.email);
      res.render("forgetpass.ejs", {
        message: "Please check your mail to reset password ",
      });
    } else {
      res.render("forgetpass.ejs", { message: "Entered email is not registered" });
    }
  } catch (err) {
    console.log("error occurred under post request of forget  " + err);
  }
});


app.get("/forget-password", async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await Register.findOne({ token: token });
    if (tokenData) {
      res.render("confirmpass.ejs", { userID: tokenData._id });
    } else {
      res.render("404", { message: "Page not Found !! Retry " });
    }
  } catch (err) {
    console.log("error occurred under get req of forget-password");
  }
});

app.post("/forget-password", async (req, res) => {
  try {
    const password = req.body.password;
    const userID = req.body.userID;
    const hashpswd = await bcrypt.hash(password, 12);
    const updatedData = await Register.findByIdAndUpdate(
      { _id: userID },
      { $set: { password: hashpswd, token: "" } }
    );
    res.redirect("/");
  } catch (err) {
    console.log("error occurred under post req of forget-password");
  }
});

app.get("/home", isAuth, async (req, res) => {
  try {
    // const nw=await Blogs.insertMany(postss);
    const posts = await Blogs.find();
    res.render("home.ejs", { name, posts });
  } catch (err) {
    console.log("error occurred" + err);
  }
});
app.get("/login", (req, res) => {
  let err = "Enter your details";
  res.render("logIn.ejs", { err });
});
app.get("/signin", async (req, res) => {
  try {
    let err = "Enter your details";
    name = "user";
    const posts = await Blogs.find();
    // res.render("home.ejs", { name, posts });
    req.session.isAuth = true;
    res.redirect("/home");
  } catch (err) {
    console.log("error occurred" + err);
  }
});
app.get("/forget", (req, res) => {
  res.render("forgetpass.ejs");
});



app.get("/createBlog", isAuth, async (req, res) => {
  try {
    console.log(currUser);
    const posts = await Blogs.find({ createdBy: currUser });
    // console.log(posts)
    res.render("newBlog.ejs", { name, posts });
  } catch (err) {
    console.log("error under get request of createBlog");
  }
});
app.get("/postNew", (req, res) => {
  res.render("postNew.ejs", { name });
});
app.get("/about", (req, res) => {
  res.render("about.ejs", { name });
});
app.get("/:id/edit", async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Blogs.findById(id);
    res.status(200).render("editblog.ejs", { name, post });
  } catch (err) {
    console.log("error occurred in updating blog");
  }
});

app.get("/:id", isAuth, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const post = await Blogs.findById(id);

    res.status(200).render("showBlogs.ejs", { name, post });
  } catch (err) {
    // console.log("error occurred in finding blog")
  }
});

app.patch("/:id/createBlog", isAuth, async (req, res) => {
  try {
    //    console.log(req.body)
    const id = req.params.id;
    // console.log(id)
    const post = await Blogs.findById(id);
    post.text = req.body.text;
    //    console.log(post);
    post.save();
    // const posts= await Blogs.find({createdBy:currUser}) ;

    res.redirect("/createBlog");
  } catch (err) {
    console.log("error under patch request of createBlog");
  }
});

app.get("/:id/deleteBlog", isAuth, async (req, res) => {
  try {
    const id = req.params.id;
    await Blogs.findByIdAndDelete(id);
    post.text = req.body.text;
    res.redirect("/createBlog");
  } catch (err) {
    console.log("error under get request of deleteBlog");
  }
});
// app.post("/createBlog",async (req,res)=>{
// try{

//     const inser=await Blogs.create(req.body);
//     res.redirect("/home");
// }
// catch(err){
//     console.log("error under post request of postNew Blog" +err);
// }
// })

app.post("/createBlog", isAuth, upload.single("image"), async (req, res) => {
  try {
    const data = req.body;
    const username = await Register.findOne({ name: req.body.createdBy });
    
    if (username) {
      image1 = req.file.path;
      data.image = image1.substring(15);
      // console.log(data);
      // console.log(req.file.path);
      const post = await Blogs.create(data);

      res.status(200).render("preview.ejs", { name, post });
      // res.redirect("/home");
    } else {
      res.render("UserNotFound", { message:username });
    }
  } catch (err) {
    console.log("error under post request of postNew Blog " + err);
  }
});
app.post("/postnew", (req, res) => {
  res.redirect("/home");
});
app.post("/deletethis", async (req, res) => {
  try {
    const blogID = req.body.id;
    const blogs = await Blogs.findByIdAndDelete(blogID);
    res.redirect("/home");
  } catch (err) {
    console.log(
      "error occurred under post req of delete the preview blog " + err
    );
  }
});

app.post("/addComment", async (req, res) => {
  let userID = req.body.id;
  let text = req.body.text;
  let name = req.body.name;
  // console.log(req.body)
  const userD = await Register.findOne({ name: name });
  if (userD) {
    let comment = {};

    comment.by = name;
    comment.text = text;
    const user = await Blogs.findById({ _id: userID });
    await user.comments.push(comment);
    const updatedData = await Blogs.updateOne(
      { _id: userID },
      { $set: { comments: user.comments } }
    );
    console.log(comment);
    console.log(user.comments);
    res.redirect("back");
  } else {
    res.render("UserNotFound.ejs", { message: "user" });
  }
});

app.post("/like", isAuth, async (req, res) => {
  try {
    let userID = req.body.id;
    const blog = await Blogs.findById({ _id: userID });
    blog.likes = blog.likes + 1;
    const updatedData = await Blogs.updateOne(
      { _id: userID },
      { $set: { likes: blog.likes } }
    );
    res.redirect("back");
  } catch (err) {
    console.log("error under like " + err);
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    } else {
      res.redirect("/logIn");
    }
  });
});
