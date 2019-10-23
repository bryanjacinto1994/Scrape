//Require mongoose NPM package

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Create New Schema For Note

var NoteSchema = new Schema({
    
    title: String,
    body: String
});

//Create the schema model by using mongoose model method
var Note = mongoose.model('Note', NoteSchema);

module.exports = Note;