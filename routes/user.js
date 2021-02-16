const express = require('express');
const router = express.Router();
const user = require('../controller/user');

router.get('/', user.getWelcomePage);

router.get('/users/register', user.getSignupPage);

router.post('/users/register', user.postSignup);

router.get('/users/register/verify-email', user.getEmailVerifyPage);

router.post('/users/register/verify-email', user.postCode);

router.get('/users/login', user.getLoginPage);

router.post('/users/login', user.postLogin);

router.post('/home', user.getHomePage);

router.get('/home', user.getHomePage);

router.get('/users/logout', user.getLogout);

module.exports = router;