//Require the mongoose NPM package
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Create a new Article schema

var ArticleSchema = new Schema({

    name: {type: String, required: true},
    note: {type: Schema.Types.ObjectId, ref: 'Note'},
    link: {type: String, required: true},
    paragraph: {type: String, required: true},
    time: {type: Date, default: Date.now}      
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;