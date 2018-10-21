const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const Idea = require('./models/idea');

const app = express();

const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/vidjot-dev', { useNewUrlParser: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));
// Support FindAndModify
mongoose.set('useFindAndModify', false);

// Handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Use BodyParser middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Method Override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
    secret: 'sudokey',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

// Global variables
app.use(function(req, res, next) {
    // Map flash key to global res variables to be used in _msg partial
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


// Index Route
app.get('/', (req, res) => {
    res.render('index', {title: "Welcome"});
});

// About Route
app.get('/about', (req, res) => {
    res.render('about');
});

// Fetch idea
app.get('/ideas', (req, res) => {
    Idea.find({})
        .sort({date: -1})
        .then(ideas => {
            res.render('ideas/index', {ideas})
        })
        .catch(err => console.log(err));
});

// Add Idea Form
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});

// Edit Idea ( id is string representation of _id from mongoose)
app.get('/ideas/edit/:id', (req, res) => {
    Idea.findById(req.params.id)
        .then(idea => res.render('ideas/edit', idea))
        .catch(err => console.log(err));
});

// Process Form
app.post('/ideas', (req, res) => {
    let errors = [];

    if(!req.body.title) {
        errors.push({text: 'Please add a title'});
    }
    if(!req.body.details) {
        errors.push({text: 'Please add details'});
    }

    if(errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        let newUser = {
            title: req.body.title,
            details: req.body.details
        };

        let idea = new Idea(newUser);

        idea.save()
            .then(idea => {
                req.flash('success_msg', 'Video Idea added');
                res.redirect('/ideas')
            })
            .catch(err => {
                req.flash('error_msg', 'Oops! Something went wrong.');
                console.log(err)
            });
    }
});

// Process Edit
app.put('/ideas/:id', (req, res) => {
    Idea.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        details: req.body.details
    })
    .then(() => {
        req.flash('success_msg', 'Video Idea updated');
        res.redirect('/ideas')
    })
    .catch(err => {
        req.flash('error_msg', 'Oops! Something went wrong.');
        console.log(err)
    });
});

// Process Delete
app.delete('/ideas/:id', (req, res) => {
    Idea.deleteOne({_id: req.params.id})
        .then(() => {
            req.flash('success_msg', 'Video Idea removed');
            res.redirect('/ideas')
        })
        .catch(err => {
            req.flash('error_msg', 'Oops! Something went wrong.');
            console.log(err)
        });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});