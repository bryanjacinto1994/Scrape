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
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
//MongoDB connection
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI,  { useNewUrlParser: true });

//Routes
//Homepage Route

app.get('/', function(req, res){
    db.
})

//Scrape Articles

app.get('/scrape', function (req, res) {

    axios.get('https://www.nytimes.com/section/us')
        .then(function (response) {

            var $ = cheerio.load(response.data);

            $('article').each(function (i, element) {

                var result = {};

                result.title = $(this).children('h2').text();
                result.link = $(this).children('a').attr('href');

                db.Article.create(result)
                    .then(function (dbArticle) {
                        res.json(dbArticle);
                    })
                    .catch(function (err) {
                        res.json(err);
                    });
            });
            res.send('Articles Scraped');
        });
});

//Get all News articles

app.get('/articles', function (req, res) {

    db.Article.find({}).then(function (dbArticle) {
        res.json(dbArticle);
    })
        .catch(function (err) {
            res.json(err);
        });

});

//Get specific workouts id and populate with note

app.get('/articles/:id', function (req, res) {

    db.Workout.find({ _id: req.params.id })
        .populate('note')
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating an Workout associated Note

app.post('/articles/:id', function (req, res) {

    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });

});

app.listen(3000, function () {
    console.log('Application Running On PORT 3000');
});
