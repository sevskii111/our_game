const express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	passportSocketIo = require("passport.socketio"),
	config = require('./config.js');

const app = express();


//App uses
app.use(
	bodyParser.json(),
	bodyParser.urlencoded(),
	session({
		secret: "seva",
		resave: false,
		saveUninitialized: false
	}),
	passport.initialize(),
	passport.session(),
	cookieParser(),
	express.static('public'));
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
	}
);
passport.serializeUser((user, done) => {
	done(null, user.username);
});
passport.deserializeUser((username, done) => {
	done(null, config.users.find(u => u.username == username));
});



//App routes

app.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		if (req.user.admin) {
			res.render('admin');
		} else {
			res.render('user');
		}
	} else {
		res.render('login');

	}
});




/////
http.listen(config.port, (err) => {
	if (err) {
		console.log(`Err listening: ${err}`);
	} else {
		console.log(`Listening on port: ${config.port}`)
	}

});