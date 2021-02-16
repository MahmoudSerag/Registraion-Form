const asyncHandler = require('../middleware/async');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../model/user');
session = {
  cookie: {
    path: '/',
    _expires: '2022-02-15T16:40:19.191Z',
     originalMaxAge: 31536000000,
     httpOnly: true }
};


const transport = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));


exports.getWelcomePage = asyncHandler(async(req, res, next) => {
  res.status(200).render('welcomePage');
});


exports.getLoginPage = asyncHandler(async(req, res, next) => {
  res.status(200).render('login');
});


exports.getSignupPage = asyncHandler(async(req, res, next) => {
  res.status(200).render('signup');
});


exports.getEmailVerifyPage = asyncHandler(async(req, res, next) => {
  res.status(200).render('verify-email');
});


exports.postSignup = asyncHandler(async(req, res, next) => {
  
  if (!req.body.name) {
    throw new Error('Name is required.');
  }
  if (!req.body.email) {
    throw new Error('Email is required or invalid email.');
  }
  if (!req.body.password) {
    throw new Error('Password is required.');
  }
  if (!req.body.password2) {
    throw new Error('Confirm password is required.');
  }
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.password2;
  if (password.length < 8) {
    throw new Error('Password at least 8 characters.');
  }
  if (confirmPassword != password) {
    throw new Error('Password must be matched.');
  }
  const checkEmail = await User.findOne({email: email});
  if (checkEmail) {
    throw new Error('Email is already exist.');
  }
  res.status(201).redirect('/users/register/verify-email');
  const hashedPassword = await bcrypt.hash(password, 12);
  const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 12);
  const user = {
    name: name,
    email: email,
    password: hashedPassword,
    confirmPassword: hashedConfirmPassword
  };
  const code = Math.floor(Math.random() * (000000, 999999)) + 1;
  await transport.sendMail({
    to: email,
    from: 'mahmoudsrag16@gmail.com',
    subject: 'Verify your email',
    html: `<h1> Code: ${code} </h1>`
  });
  session.code = code;
  session.user = user;
  console.log(session);
});


exports.postCode = asyncHandler(async(req, res, next) => {
  if (req.body.code != session.code) {
    console.log(req.body.code, session.code);
    return res.status(300).redirect('/users/register/verify-email');
  }
  res.status(300).redirect('/users/login');
  session.isLoggedIn = false;
  session.code = null;
  const user = new User({
    name: session.user.name,
    email: session.user.email,
    password: session.user.password,
    confirmPassword: session.user.confirmPassword,
  });
  await user.save();
  session.user._id = user._id;
  session.user.__v = user.__v;
  console.log(session);
});


exports.postLogin = asyncHandler(async(req, res, next) => {
  if (!req.body.email) {
    throw new Error('Email is required.');
  }
  if (!req.body.password) {
    throw new Error('Password is required.');
  }
  const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({email: email});
  if (!user) {
    throw new Error("The email address that you've entered doesn't match any account.");
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    throw new Error('Password must be matched.');
  }
  res.status(300).redirect('/home');
  session.isLoggedIn = true;
  session.user = user;
  console.log(session);
});


exports.getHomePage = asyncHandler(async(req, res, next) => {
  const name = session.user.name;
  res.status(200).render('home', {
    name: name
  });
  console.log(name);
});


exports.getLogout = asyncHandler(async(req, res, next) => {
  session.isLoggedIn = false;
  res.status(300).redirect('/users/login');
});