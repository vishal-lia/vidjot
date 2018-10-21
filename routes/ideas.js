const express = require('express');
const Idea = require('../models/idea');

const router = express.Router();

// Fetch idea
router.get('/', (req, res) => {
    Idea.find({})
        .sort({date: -1})
        .then(ideas => {
            res.render('ideas/index', {ideas})
        })
        .catch(err => console.log(err));
});

// Add Idea Form
router.get('/add', (req, res) => {
    res.render('ideas/add');
});

// Edit Idea ( id is string representation of _id from mongoose)
router.get('/edit/:id', (req, res) => {
    Idea.findById(req.params.id)
        .then(idea => res.render('ideas/edit', idea))
        .catch(err => console.log(err));
});

// Process Form
router.post('/', (req, res) => {
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
router.put('/:id', (req, res) => {
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
router.delete('/:id', (req, res) => {
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

module.exports = router;