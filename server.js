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
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//Routes
//Homepage Route

app.get('/', function (req, res) {
    db.Article.find({})
        .sort({ _id: 1 })
        .then(function (dbArticles) {
            res.render('index', {
                dbArticles: dbArticles,
                homepage: true,
                noted: false
            })
        })
        .catch(function (err) {
            res.send(err);
        })
})

//Noted articles routes

app.get('/noted', function (req, res) {
    db.Article.find({})
        .sort({ _id: 1 })
        .populate('note')
        .where('note').ne([]).then(function (dbArticles) {
            res.render('index', {
                dbArticles: dbArticles,
                homepage: true,
                noted: false
            })
        })
        .catch(function (err) {
            res.send(error)
        });
});

//Scrape Articles

app.get('/scrape', function (req, res) {

    axios.get('https://www.nytimes.com')
        .then(function (response) {

            var $ = cheerio.load(response.data);

            $('h2.story-heading').each(function (i, element) {

                var result = {};

                result.title = $(element).children().text();
                result.link = $(element).children().attr('href');

                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            });
            res.redirect('/');
        })
        .catch(function (err) {
            res.send(err);
        })
});

//Get all News articles

app.get('/articles', function (req, res) {

    db.Article.find({}).sort({ _id: 1 }).then(function (dbArticle) {
        res.json(dbArticle);
    })
        .catch(function (err) {
            res.send(err);
        });

});

//Get specific articles id and populate with note

app.get('/articles/:id', function (req, res) {

    db.Workout.findOne({ _id: req.params.id })
        .populate('note')
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.send(err);
        });
});

// Route for saving/updating an Article associated Note

app.post('/articles/:id', function (req, res) {

    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { '$push': { note: dbNote._id } }, { new: true })
                .populate('note')
                .then(function (dbNote) {
                    res.json(dbNote);
                })
                .catch(function (err) {
                    res.send(err);
                });

        });
});

// Route to Delete Notes



app.listen(3000, function () {
    console.log('Application Running On PORT 3000');
});
