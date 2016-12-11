var express = require('express');
var router = express.Router();
var hue = require('../helpers/schedules');
var parse = require('parse-color');

/* GET users listing. */
router.get('/flash/lights/:lights/:colour', function(req, res, next) {
	var lights = req.params.lights;
	var colour = req.params.colour;

	lights = lights.split('-')
	colour = parse(colour)

	console.log('Lights', lights)
	console.log('Colour', colour)

	hue.flashWarn(lights, colour.rgb)

	res.send("OK")
});

router.get('/info/groups', function(req, res, next) {
	hue.api.groups()
		.then((info) => res.send(info))
});

router.get('/info/lights', function(req, res, next) {
	hue.api.lights()
		.then((info) => res.send(info))
});

module.exports = router;