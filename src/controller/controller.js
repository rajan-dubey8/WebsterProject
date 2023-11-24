const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });
// const bcrypt=require("bcrypt";)
const root_email = "rajandubey5751@gmail.com";
const pass = "ggyw gsbl vrzy fuif";
const sendResetMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service:'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user:"rajandubey5751@gmail.com",
                pass: "ggyw gsbl vrzy fuif",
            }
        });
        const mailOptions = {
            from:"rajandubey5751@gmail.com",
            to: email,
            subject: 'For Reset Password',
            html: '<h3>Hii! ' + name + '</h3><br>please click here to <a href="http://127.0.0.1:8000/forget-password?token=' + token + '">Reset</a> your password.'
        }
        // transporter.sendMail(mailOptions, function (error, info) {
        //     if (error) {
        //         console.log("error under sendResetMail under transporter " + error);
        //     } else {
        //         console.log("Email has been sent ", info.response);
        //     }
        // })

       const sendMail=async (transporter,mailOptions)=>{
        try{
            await transporter.sendMail(mailOptions);
            console.log("email has sent")

        }
        catch(err){
            console.log("error under sendMail "+err)
        }
       }

       sendMail(transporter,mailOptions);
    } catch (err) {
        console.log("error under sendResetMail" + err.message);
    }
}
// const securePassword=async(password){
//     try{
//         const passwordHash=await bcrypt.hash(password,10);
//         return passwordHash;
//     }catch(err){
//         console.log("error occurred under secure of hashPassword ");
//     }
// }
module.exports = sendResetMail;
