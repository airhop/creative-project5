var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScoreSchema = new Schema({
	name: String,
	score: Number,
	color: String
})

module.exports = mongoose.model('Score', ScoreSchema);