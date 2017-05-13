const config = require("config"),
	yaml = require("node-yaml"),
	fs = require('fs');

const roomConfig = {lights:{}}

const load = () => { 
	var lights
	try {
		lights = yaml.readSync(config.configFile) 
	} catch (e) {
		console.log("Failed to read configuration")
		console.log(e)
		return
	}
	roomConfig['lights'] = lights
	console.log(`Loaded config from ${config.configFile}`)
}

/**
Accepts a list of names and returns a list of integers (if lights found)
**/
const lights = (names) => {
	if (names.constructor !== Array) {names = [names]}

	return names.map((name) => {
		// We also handle integers as strings
		if (isNaN(name)) {
			var light = roomConfig['lights'][name]
			if (light) {
				return light
			} else {
				return -1
			}
		} else {
			return parseInt(name)
		}	
	})
}

load()
let watchTimeout;
try {
	fs.watchFile(config.configFile, { persistent: false }, () => {
	  clearTimeout(watchTimeout);
	  watchTimeout = setTimeout(load, 200);
	})
} catch (e) {
	console.log(`Could not start watching file ${config.configFile}, will not auto reload any presets. Make sure the file exists`);
	console.log(e.message);
}
module.exports = {
	lights: lights
}