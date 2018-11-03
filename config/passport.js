const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = function(passport) {
    passport.use(new LocalStrategy({usernameField: 'email'}, 
    (email, password, done) => {


        // Match User
        User.findOne({
            email: email
        }).then(user => {
            if(!user) {
                return done(null, false, {message: 'No user found'});   // Args(error, user, message)
            }

            // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err;

                if(isMatch) {
                    return done(null, user); // Send User as param in authenticate callback (internally used by req.login)
                } else {
                    return done(null, false, {message: 'Password Incorrect'});
                }
            });
        }).catch(err => console.log(err));
    }));

    // Sessions

    // saves the user id in the request object as request.session.passport
    // adds the user object to the request object as request.user
    passport.serializeUser(function(user, done) {
        done(null, user.id);  
    });
    
    // called by req.isAuthenticated() 
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);  
        });
    });
}

