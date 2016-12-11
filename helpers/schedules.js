var hue = require("node-hue-api"),
	config = require("config"),
    HueApi = hue.HueApi,
    schedule = require('node-schedule'),
    lightState = hue.lightState;

const DINING_CEILING = 1,
	  SOFA_CEILING = 2,
	  CARS_LIGHTS = 3,
	  BED = 4,
	  DESK_LAMP = 5,
	  DINING_UPLIGHT = 6,
	  TV_LIGHTS = 7,
	  SOFA_UPLIGHT = 8,
	  CUPBOARD_TOP = 9,
	  CUPBOARD_BOTTOM = 10;

var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};


const api = new HueApi(config.hostname, config.username);

const addIdToStatus = (light) => {
	return api.lightStatus(light).then((status) => 
		new Promise((accept, reject) => {status.id = light; accept(status)})
	);
}

// TODO: Replace this with single call to api.lights()
const getState = (lights, data) => {
	if (lights.constructor !== Array) {lights = [lights]}
	return Promise.all(lights.map((light) => addIdToStatus(light)));
}

const statesToMap = (states) => states.reduce((o,v,i) => {o[v.id] = v; return o}, {});

const setLow = () => {
	api.lightStatus(CUPBOARD_TOP).then(conditionalOn).done()
}

const setOff = () => {
	api.lightStatus(CUPBOARD_TOP).then(conditionalOff).done()
}

const flashWarn = (lights, colour) => {
	getState(lights).then((status) => conditionalWarn(status, colour));
}

const conditionalWarn = (status, colour=[255,0,0]) => {
	status = statesToMap(status)
	const lights = Object.keys(status)

	// Make sure at least one light is on
	if (lights.reduce((o,v) => o || status[v].state.on, false)) {

		// Return to original state
		const resetState = () => {
			Promise.all(lights.map((light) => {
				const lightState = status[light].state
				lightState.alert = 'none'
				api.setLightState(light, lightState)
			})).then(displayResult)
		}

		// alert state
		const state = lightState.create().on().rgb(colour).alert('lselect')

		Promise.all(lights.map((light) => api.setLightState(light, state)))
			.then(() => setTimeout(resetState, 5000))
	}

}

const conditionalOn = (status) => {
	console.log("Conditional on", status.state)
	if (!status.state.on) {
		console.log("Turning on")
		state = {on: true, bri: 50, ct: 350}
		api.setLightState(CUPBOARD_TOP, state).then(displayResult).done()
		api.setLightState(CUPBOARD_BOTTOM, state).then(displayResult).done()
	}
}

const conditionalOff = (status) => {
	console.log("Conditional off", status.state)
	if (status.state.bri === 50 && status.state.ct === 350 && status.state.colormode === 'ct') {
		console.log("Turning off")
		state = {on: false}
		api.setLightState(CUPBOARD_TOP, state).then(displayResult).done()
		api.setLightState(CUPBOARD_BOTTOM, state).then(displayResult).done()
	}
}

// Get ready for school alert
schedule.scheduleJob('15 8 * * *', () => flashWarn([DINING_UPLIGHT,SOFA_UPLIGHT,CUPBOARD_BOTTOM,CUPBOARD_TOP], [0,255,0]));

// Bedtime
schedule.scheduleJob('45 19 * * *', () => flashWarn([DINING_UPLIGHT,SOFA_UPLIGHT,CUPBOARD_BOTTOM,CUPBOARD_TOP], [255,0,0]));

// Stop reading
schedule.scheduleJob('30 20 * * *', () => flashWarn([BED], [0, 0, 255]));

// Notify app start
flashWarn([DINING_UPLIGHT], [0,255,0])

module.exports = {
	api: api,
	flashWarn: flashWarn
}
