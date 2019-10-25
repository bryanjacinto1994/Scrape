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

//Handlebars
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//MongoDB connection
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

//Routes

//Root Route

app.get('/', function(req, res){
    db.Health.find({}).sort({ time: -1 }).populate('notes.note').then(function(dbHealth){
        res.json('index', {result: dbHealth});
    })
    .catch(function(err){
        res.json(err);
    })
})

//Scrape Articles

app.get('/scrape', function(req, res){

    axios.get('https://www.usatoday.com/news/health/')
    .then(function(response){

        var $ = cheerio.load(response.data);

        $('div.p1-title').each(function(i, element){

            var result = {};

            result.title = $(element).children('a').text();
            result.link = $(element).children('a').attr('href');

            db.Health.create(result)
            .then(function(dbHealth){
                console.log(dbHealth);
            })
            .catch(function(err){
                console.log(err);
            });
        });
        res.send('Workouts Scraped');
    });
});

//Get all health articles

app.get('/health', function(req, res){
    
    db.Health.find({}, function(error, found){
        if(error){
            res.json(error)
        }
        else{
            res.json(found)
        }
    });
});

//Get specific workouts id and populate with note

app.get('/health/:id', function(req, res){

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

app.post('/health/:id', function(req, res){

db.Note.create(req.body)
.then(function(dbNote){
    return db.Health.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
})
.then(function(dbHealth){
    res.json(dbHealth);
})
.catch(function(err){
    res.json(err);
});
    
});

app.listen(3000, function(){
    console.log('Application Running On PORT 3000');
});
