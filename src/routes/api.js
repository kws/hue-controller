import express from "express";

import controller from "../helpers/controller.js";
import schedules from "../helpers/schedules.js";

const router = express.Router({});

/* GET users listing. */
router.get('/flash/lights/:lights/:colour', async function(req, res, next) {
	const lights = req.params.lights.split('-');
	const colour = req.params.colour;

	console.log('Lights', lights)
	console.log('Colour', colour)

	const action = {
		lights,
		colour,
		method: 'flash'
	}

	await controller.execute('api',{action})

	res.send("OK")
});

router.get('/info/schedules', function(req, res, next) {
	const jobs = schedules.jobs
	const output = JSON.parse(JSON.stringify(jobs))
	Object.keys(output).forEach((key) => {
		const out = output[key]
		out.next = jobs[key].job.nextInvocation()
		delete out.job
	})
	res.send(output)
});

router.get('/info/groups', async (req, res, next) => {
	const api = await controller.api();
	const groups = await api.groups.getAll();
	const value = groups.map(g => g.getJsonPayload());
	res.send(value);
});

router.get('/info/lights', async (req, res, next) => {
	const api = await controller.api();
	const lights = await api.lights.getAll();
	const value = lights.map(l => l.getJsonPayload());
	res.send(value);
});

router.get('/info/sensors', async (req, res, next) => {
	const api = await controller.api();
	const sensors = await api.sensors.getAll();
	const value = sensors.map(s => s.getJsonPayload());
	res.send(value);
});

/** Use for testing current TZ settings */
router.get('/info/time', function(req, res, next) {
	res.send("" + new Date())
});

router.get('/info/tz', function(req, res, next) {
	res.send("" + new Date().getTimezoneOffset())
});

export default router

