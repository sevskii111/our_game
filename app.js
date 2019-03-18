const express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    config = require('./config.js');

const app = express();

//App uses
app.use(bodyParser(), session({
    secret: "seva"
}), passport.initialize(), passport.session(), cookieParser());
app.set('views', './views');
app.set('view engine', 'pug');
//Passport setup
passport.use(new LocalStrategy((username, password, done) => {
    let user;
    if (user = config.users.find(u => u.username == username)) {
        if (user.password == password) {
            done(null, user);
        } else {
            done("Bad password");
        }
    } else {
        done("Unknown user");
    }
}));
//Passport routes
app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        res.redirect('/');
    });
//App routes

app.get('/', (req, res) => {
    res.render('login');
});

app.listen(config.port, (err) => {
    if (err) {
        console.log(`Err listening: ${err}`);
    } else {
        console.log(`Listening on port: ${config.port}`)
    }
});