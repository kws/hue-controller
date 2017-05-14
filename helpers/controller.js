var hue = require("node-hue-api"),
	config = require("config"),
    schedule = require('node-schedule'),
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
						 		var actionLights = job.action.lights

						 		// // First make sure we're dealing with an array of lights
					 			if (actionLights.constructor !== Array) {actionLights = [actionLights]}

					 			// Create map of names to lights
					 			var lightNames = info.lights.reduce((map, light) => {map[light.name] = light; return map}, {})

								// Map light names to IDs (we should use names from state instead?)
								actionLights = actionLights.map((light) => lightNames[light] ? lightNames[light].id : light)

								// Ids in HUE response are always strings, so make sure even numbers are treated as strings
								actionLights = actionLights.map((light) => `${light}`)

								// Filter to only the lights we operate on
								lights = info.lights.filter((light) => actionLights.indexOf(light.id) >= 0)

								console.log(`Executing job ${key} on ${lights.length} lights.`)
								switch(job.action.method) {
									case 'flash':
										executeFlash(lights, job)
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
				return group.state.any_on ? Promise.reject(`all_off not met`) : Promise.resolve()
			default:
				return Promise.reject('Unmatched condition')
		}
	})
}

const executeFlash = (lights, job) => {
	var colour = parseColor(job.action.colour)
	var timeout = job.action.timeout ? parseInt(job.action.timeout) : 5000

	// Return to original state
	const resetState = () => {
		Promise.all(lights.map((light) => {
			light.state.alert = 'none'
			api.setLightState(light.id, light.state)
		}))
	}

	// Create the alert state
	const state = lightState.create().on().rgb(colour.rgb).alert('lselect')

	// Execute chain
	Promise.all(lights.map((light) => api.setLightState(light.id, state)))
		.then(() => setTimeout(resetState, timeout))
}

module.exports = {
	api: api,
	execute: execute
}
