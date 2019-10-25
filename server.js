//Grab Required NPM Packages
var express = require('express');
var mongoose = require('mongoose');
var logger = require('morgan');
var cheerio = require('cheerio');
var axios = require('axios');

//Require The Models
var db = require('./models');

//Initialize Express
var app = express();

//Morgan Log requests
app.use(logger('dev'));

//JSON Parse Request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Public Static Folder
app.use(express.static('public'));

//MongoDB connection
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

//Routes

//Scrape bodybuilding.com

app.get('/scrape', function(req, res){

    axios.get('https://www.usatoday.com/news/health/')
    .then(function(response){

        var $ = cheerio.load(response.data);

        $('div.plan__info plan__info__name').each(function(i, element){

            var result = {};

            result.title = $(this).children('a').text();
            result.link = $(this).children('a').attr('href');

            db.Workout.create(result)
            .then(function(dbWorkout){
                console.log(dbWorkout);
            })
            .catch(function(err){
                console.log(err);
            });
        });
        res.send('Workouts Scraped');
    });
});

//Get all workouts

app.get('/workouts', function(req, res){
    
    db.Workout.find({}, function(error, found){
        if(error){
            res.json(error)
        }
        else{
            res.json(found)
        }
    });
});

//Get specific workouts id and populate with note

app.get('/workouts/:id', function(req, res){

    db.Workout.find({_id: req.params.id})
    .populate('note')
    .then(function(dbWorkout){
        res.json(dbWorkout);
    })
    .catch(function(err){
        res.json(dbWorkout);
    });
});

// Route for saving/updating an Workout associated Note

app.post('/workouts/:id', function(req, res){

db.Note.create(req.body)
.then(function(dbNote){
    return db.Workout.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
})
.then(function(dbWorkout){
    res.json(dbWorkout);
})
.catch(function(err){
    res.json(err);
});
    
});

app.listen(3000, function(){
    console.log('Application Running On PORT 3000');
});
