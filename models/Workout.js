//Require the mongoose NPM package
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Create a new Article schema

var WorkoutSchema = new Schema({

    name: {type: String, required: true},
    note: {type: Schema.Types.ObjectId, ref: 'Note'},
    link: {type: String, required: true}      
});

var Workout = mongoose.model('Workout', WorkoutSchema);

module.exports = Workout;