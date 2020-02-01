import hue from "node-hue-api";
import config from "../config/index.js";
import parseColor from "parse-color";
import convertColor from "color-convert";

const hueApi = hue.v3.api;
const LightState = hue.v3.lightStates.LightState;

let __api;
const getApi = async () => {
	if (__api) {
		return __api;
	}
	const hostname = await config.hostname();
	__api = await new hueApi.createLocal(hostname).connect(config.username);
	return __api;
};


const displayResult = result => {
    console.log(JSON.stringify(result, null, 2));
};

const execute = async (key, job) => {
	let api;
	try {
		api = await getApi()
	} catch (err) {
		console.error(err.message);
		return
	}

	// Does the job have a condition
	if (job.condition) {
		const conditionMet = await checkCondition(job.condition);
		if (!conditionMet) {
			return
		}
	}

	// Now execute
	if (job.action) {
		let lights = await api.lights.getAll();
		let actionLights = job.action.lights;

		// First make sure we're dealing with an array of lights
		if (actionLights.constructor !== Array) {
			actionLights = [actionLights]
		}

		// Create map of names to lights
		const lightNames = lights.reduce((map, light) => {
			map[light.name] = light;
			return map
		}, {});

		// Map light names to IDs (we should use names from state instead?)
		actionLights = actionLights.map((light) => lightNames[light] ? lightNames[light].id : light);

		// Filter to only the lights we operate on
		lights = lights.filter((light) => actionLights.indexOf(light.id) >= 0);

		console.log(`Executing job ${key} on ${lights.length} lights.`);

		switch (job.action.method) {
			case 'dim':
				await executeDim(lights, job);
				break;
			case 'flash':
				await executeFlash(lights, job);
				break;
			case 'random':
				await executeRandom(lights, job);
				break;
			default:
				console.log(`Unknown action: ${job.action.method}`)
		}

	}
};

const checkCondition = async condition => {
	const api = await getApi();
	let groups = await api.groups.getAll();
	groups = groups.filter((group) => group.name.toUpperCase() === condition.room.toUpperCase());
	if (groups.length === 0) {
		console.log(`Room ${condition.room} not found for condition. Failing.`);
		return false
	}

	const group = groups[0];
	switch(condition.status) {
		case 'all_on':
		case 'any_on':
			return group.state[condition.status];
		case 'all_off':
			return !group.state.any_on;
		default:
			return false
		}
};

const executeDim = async (lights, job) => {
	const api = await getApi();
	const target = job.action.target ? job.action.target : 0;
	const step = job.action.step ? job.action.step : 10;
	//For each light that is above the target, reduce the brightness until it hits the target
	await Promise.all(lights.map((light) => {
		if (light.state.on && light.state.bri > target) {
			const lightTarget = Math.max(target, light.state.bri - step);
			console.log(`Reducing ${light.id} from ${light.state.bri} to ${lightTarget}. Target ${target}.`);
			api.lights.setLightState(light.id, {'bri': lightTarget});
		} 
	}));

};

const executeRandom = async (lights, job) => {
	const api = await getApi();
	const color = Math.floor(Math.random() * 360);
	const rgb = convertColor.hsv.rgb(color, 100, 100);
	let newState = new LightState().on().rgb(rgb).brightness(100);

	if (job.action.transition) {
		newState = newState.transition(job.action.transition)
	}

	//For each light that is above the target, reduce the brightness until it hits the target
	await Promise.all(lights.map((light) =>
		api.lights.setLightState(light.id, newState)
	));
};

const executeFlash = async (lights, job) => {
	const api = await getApi();
	const colour = parseColor(job.action.colour);
	const timeout = job.action.timeout ? parseInt(job.action.timeout) : 5000;

	const originalStates = lights.map(light => {return {id: light.id, state: light.state}});

	// Return to original state
	const resetState = () => {
		Promise.all(originalStates.map((light) => {
			light.state.alert = 'none';
			api.lights.setLightState(light.id, light.state)
		}))
	};

	// Create the alert state
	const state = new LightState().on().rgb(colour.rgb).alert('lselect');

	// Execute chain
	await Promise.all(lights.map((light) => api.lights.setLightState(light.id, state)))
		.then(() => setTimeout(resetState, timeout))
};

export default {
	api: getApi,
	execute: execute
};
