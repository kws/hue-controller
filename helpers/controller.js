var hue = require("node-hue-api"),
	config = require("config"),
    schedule = require('node-schedule'),
    roomConfig = require('./roomConfig'),
	parseColor = require('parse-color'),
    lightState = hue.lightState,
    HueApi = hue.HueApi

const api = new HueApi(config.hostname, config.username)

var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

const execute = (key, job) => {
	console.log(`Executing ${key}`, job)

	var promise = Promise.resolve()

	// Does the job have a condition
	if (job.condition) {

		promise = promise.then(() => checkCondition(job.condition))

	}

	// Now execute
	if (job.action) {

		promise = promise.then(() => api.lights())
						 .then((info) => {

								// Map light names to references (we should use names from state instead?)
								lights = roomConfig.lights(job.action.lights)

								// Filter to only the lights we operate on
								lights = info.lights.filter((light) => lights.indexOf(parseInt(light.id)) >= 0)

								switch(job.action.method) {
									case 'flash':
										executeFlash(lights, job.action.colour)
										break
									default:
										console.log(`Unknown action: ${job.action.method}`)
								}
							})
	}

	promise.then(() => {console.log(`Job ${key} complete`)}).catch((err)=>{console.log("Failed:",err)})
}

const checkCondition = (condition) => {
	return api.groups().then((groups) => {
		groups = groups.filter((group) => group.name.toUpperCase() === condition.room.toUpperCase())
		if (groups.length === 0) {
			return Promise.reject(`Room ${condition.room} not found for condition. Failing.`)
		}
		group = groups[0]
		switch(condition.status) {
			case 'all_on':
			case 'any_on':
				return group.state[condition.status] ? Promise.resolve() : Promise.reject(`${condition.status} not met`)
			case 'all_off':
				return group.state.any_on ? Promise.reject(`any_on not met`) : Promise.resolve()
			default:
				return Promise.reject('Unmatched condition')
		}
	})
}

const executeFlash = (lights, colour) => {
	colour = parseColor(colour)

	// Return to original state
	const resetState = () => {
		Promise.all(lights.map((light) => {
			light.state.alert = 'none'
			api.setLightState(light.id, light.state)
		}))
	}

	// alert state
	const state = lightState.create().on().rgb(colour.rgb).alert('lselect')

	Promise.all(lights.map((light) => api.setLightState(light.id, state)))
		.then(() => setTimeout(resetState, 5000))
}

module.exports = {
	api: api,
	execute: execute
}
