const express = require('express');
const router = express.Router();
const controller = require('../helpers/controller');
const schedules = require('../helpers/schedules')

/* GET users listing. */
router.get('/flash/lights/:lights/:colour', function(req, res, next) {
	var lights = req.params.lights.split('-');
	var colour = req.params.colour;

	console.log('Lights', lights)
	console.log('Colour', colour)

	var action = {
		lights,
		colour,
		method: 'flash'
	}

	controller.execute('api',{action})

	res.send("OK")
});

router.get('/info/schedules', function(req, res, next) {
	var jobs = schedules.jobs
	var output = JSON.parse(JSON.stringify(jobs))
	Object.keys(output).forEach((key) => {
		var out = output[key]
		out.next = jobs[key].job.nextInvocation()
		delete out.job
	})
	res.send(output)
});

router.get('/info/groups', function(req, res, next) {
	controller.api.groups()
		.then((info) => res.send(info))
});

router.get('/info/lights', function(req, res, next) {
	controller.api.lights()
		.then((info) => res.send(info))
});

/** Use for testing current TZ settings */
router.get('/info/time', function(req, res, next) {
	res.send("" + new Date())
});

router.get('/info/tz', function(req, res, next) {
	res.send("" + new Date().getTimezoneOffset())
});

module.exports = router;