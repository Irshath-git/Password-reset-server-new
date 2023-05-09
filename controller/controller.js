const Joi = require("joi");
const sendEmail = require("../utils/sendEmail");
const { userModel } = require("../model/userModel");
const { validate } = require("../model/userModel");
const Token = require("../model/token");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const passwordComplexity = require("joi-password-complexity");

const Base_Url = "https://password-reset-cli.netlify.app/changepassword";
const RenderBase = "https://password-reset-p5hw.onrender.com";

//register user
async function register_user(req, res) {
  const { name, email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (user) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // console.log(hashedPassword);

  const newUser = new userModel({
    name,
    email,
    password: hashedPassword,
  });

  // newUser.save();
  // try {
  //   if (user) {
  //     res.send(user).json({ message: "User created successfully" });
  //   }
  // } catch (error) {
  //   res.status(500).json({ error: err.message });
  // }

  newUser
    .save()
    .then(() => res.status(200).json({ message: "User created successfully" }))
    .catch((err) => res.status(500).json({ error: err.message }));
}

//Login user
async function login_user(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user._id }, "secret123");
  res.status(200).json({ token, message: "User Logged in successfully" });
}

//Logout user
async function logout(req, res) {
  req.session = null;
  res.json({ message: "Logout Successfull" });
}

//Password Reset-Link
async function password_reset_link(req, res) {
  try {
    const schema = Joi.object({ email: Joi.string().email().required() });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await userModel.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send("user with given email doesn't exist");

    let token = await Token.findOne({ userId: user._id });
    console.log(token);
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${process.env.PORT}/password-reset/${user._id}/${token.token}/click the link to reset the password ${Base_Url}/${user._id}/${token.token}`;
    // const link = `${RenderBase/user._id/token.token/ Base_Url}`;
    await sendEmail(user.email, "Password reset", link);

    res.send("password reset link sent to your email account");
  } catch (error) {
    res.send(error, "An error occured");
    console.log(error);
  }
}

//password reset
async function password_reset(req, res) {
  try {
    const schema = Joi.object({
      password: passwordComplexity().required().label("Password"),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await userModel.findById(req.params.userId);
    if (!user) return res.status(400).send("invalid link or expired");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");

    if (!user.verified) user.verified = true;

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword;
    await user.save();
    await token.deleteOne();

    res.status(200).send({ message: "Password reset successfully" });

    // user.password = req.body.password;
    // await user.save();
    // await token.delete();

    // res.send("password reset sucessfully.");
  } catch (error) {
    res.send(error, "An error occured");
    console.log(error);
  }
}

module.exports = {
  register_user,
  login_user,
  logout,
  password_reset_link,
  password_reset,
};
