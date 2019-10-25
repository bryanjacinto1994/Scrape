//Require mongoose NPM package

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Create New Schema For Note

var NoteSchema = new Schema({
    
    body: {type: String, validate:[function(input){return input.length >= 3}]}
});

//Create the schema model by using mongoose model method
var Note = mongoose.model('Note', NoteSchema);

module.exports = Note;