var express = require('express');
var router = express.Router();
var Score = require('../models/scoreModel');

router.get('/scores', function(req, res) {
	Score.find(function(err, scores) {
		if (err) return console.log(err);
		console.log(scores);
		res.send(scores);
	})
})

router.post('/scores', function(req, res) {
	console.log(req.body);
	var newScore = new Score(req.body);
	newScore.save(function(err) {
		if (err) return console.log(err);
		res.send({ message: 'POST: /scores \t success'});
	});
})


/* GET home page. */
router.get('*', function(req, res, next) {
  res.sendFile('index.html', { root: 'public' })
});


module.exports = router;
