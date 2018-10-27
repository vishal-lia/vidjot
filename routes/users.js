const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Load User Module
const User = require('../models/user');

// Login Route
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Register Route
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Login Form POST
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Register Form POST
router.post('/register', (req, res) => {
    let errors = [];

    if(req.body.password !== req.body.confirmPassword) {
        errors.push({text: 'Passwords do not match'});
    }

    if(req.body.password.length < 4) {
        errors.push({text: 'Password must be atleast 4 characters'});
    }

    if(errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        });
    } else {
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password         
        });

        User.findOne({email: newUser.email})
            .then(user => {
                if(user) {
                    req.flash('error_msg', 'Email already Registered');
                    res.render('users/register', {
                        name: req.body.name,
                        email: req.body.email                   
                    });
                } else {
                    bcrypt.genSalt(10, function(err, salt) {
                        if(err) throw err;
                        bcrypt.hash(newUser.password, salt, function(err, hash) {
                            if(err) throw err;
                            newUser.password = hash;
            
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/users/login');
                                })
                                .catch(err => {     
                                    console.log(err);
                                    res.status(400).send(err);
                                });
                        });
                    });
                }
            })
            .catch(err => {     
                console.log(err);
                res.status(400).send(err);
            });
    }
});

// Logout Route
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;