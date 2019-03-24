const
    fs = require('fs'),
    ms = require('mediaserver'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    config = require('./config.js'),
    questions = require('./questions.js');

const app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

//
let currAudio = null;
//

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


const startTime = Date.now();
//App routes
let queue = [];
let queueEnabled = false;
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.admin) {
            res.render('admin', {
                questions: questions
            });
        } else {
            res.render('user');
        }
    } else {
        res.render('login');

    }
});
let question = {
    text: null,
    image: null,
    audio: null
}
app.get('/audio', (req, res) => {
    if (currAudio) {
        fs.createReadStream(`./private/sounds/${currAudio}`, 'base64').pipe(res);
    } else {
        res.send("");
    }
});

app.post('/ask', (req, res) => {
    queue = [];
    io.emit('queue', queue);
    queueEnabled = false;
    if (req.isAuthenticated() && req.user.admin) {
        currAudio = req.body.audio;
        question = {
            text: req.body.text,
            image: req.body.image ? fs.readFileSync(`./private/images/${req.body.image}`, 'base64') : null,
            audio: req.body.audio ? true : false
        };
        io.emit('question', question);
        res.json(question);
    }
});

app.get('/queue', (req, res) => {
    if (req.isAuthenticated() && req.user.admin) {
        queueEnabled = true;
        res.json({
            success: 1
        });
    }
});

app.get('/close', (req, res) => {
    queue = [];
    if (req.isAuthenticated() && req.user.admin) {
        io.emit('question', {
            text: null,
            audio: null,
            image: null
        });
        res.json({
            success: 1
        });
    }
});

let timeOuts = {};
app.get('/clicked', (req, res) => {
    if (req.isAuthenticated() && !req.user.admin) {
        if (!timeOuts[req.user.username]) {
            if (queueEnabled) {
                if (queue.indexOf(req.user.color) == -1) {
                    queue.push(req.user.color);
                    io.emit('queue', queue);
                }
                res.send({
                    success: 1
                });
            } else {
                timeOuts[req.user.username] = true;
                res.send({
                    success: 0,
                    timeout: config.timeout
                });
                setTimeout(() => {
                    timeOuts[req.user.username] = false;
                }, config.timeout);
            }
        } else {
            res.send({
                success: 1
            });
        }
    }
});

app.get('/status', (req, res) => {
    res.json({
        questionText,
        queue
    });
});
/////
io.on('connection', (socket) => {
    socket.emit('question', question);
    socket.emit('check', startTime);
});
////
http.listen(process.env.PORT || config.port , (err) => {
    if (err) {
        console.log(`Err listening: ${err}`);
    } else {
        console.log(`Listening on port: ${config.port}`)
    }

});