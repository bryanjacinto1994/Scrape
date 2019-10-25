//Require the mongoose NPM package
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Create a new Article schema

var ArticleSchema = new Schema({

    name: {type: String, required: true, unique: true},
    link: {type: String, required: true, unique: true},
    paragraph: {type: String, required: true, unique: true},
    note: {type: Schema.Types.ObjectId, ref: 'Note'}      
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;