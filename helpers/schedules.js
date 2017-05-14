const hue = require("node-hue-api"),
	config = require("config"),
	controller = require("./controller"),
    schedule = require('node-schedule'),
	yaml = require("node-yaml"),
	fs = require("fs")


const jobs = {}

/*
	Replaces JOB aliases with real IDs from config.
*/
const prepareJob = (job, jobsFile) => {
	var origLights = job.action.lights

	// Treat as array
	if (origLights.constructor !== Array) {origLights = [origLights]}

	// Substitute aliases for real values
	var lights = origLights.map((light) => {
		return jobsFile.lights && jobsFile.lights[light] ? jobsFile.lights[light] : light
	})

	job.action.inputLights = job.action.lights
	job.action.lights = lights

	return job
}

const loadJobs = () => {
	let jobsFile
	try {
		jobsFile = yaml.readSync(config.schedulesFile)
	} catch (e) {
		console.log("FAILED TO LOAD SCHEDULES")
		console.log(e)
		return
	}

	// Rename lights based on internal aliases
	Object.keys(jobsFile.schedules).forEach((key,index) => {
		jobsFile.schedules[key] = prepareJob(jobsFile.schedules[key], jobsFile)
	})

	// Cancel existing jobs
	Object.keys(jobs).forEach((key,index) => {
		let due = jobs[key].job.nextInvocation()
	    jobs[key].job.cancel();
	    delete jobs[key]
		console.log(`Cancelled ${key} that was due at ${due}`)
	});

	Object.keys(jobsFile.schedules).forEach((key,index) => {
		var job = jobsFile.schedules[key]
		job.job = schedule.scheduleJob(job.cron, () => {
			controller.execute(key, job)
		})
		jobs[key] = job
		console.log(`Scheduled ${key} next due at ${job.job.nextInvocation()}`)
	})

	if (jobsFile.instant) {
		Object.keys(jobsFile.instant).forEach((key,index) => {
			var job = jobsFile.instant[key]
			controller.execute(key, prepareJob(job, jobsFile))
		})
	}

}

loadJobs()
let watchTimeout;
try {
	fs.watchFile(config.schedulesFile, { persistent: false }, () => {
	  console.log("File change detected")
	  clearTimeout(watchTimeout);
	  watchTimeout = setTimeout(loadJobs, 200);
	})
} catch (e) {
	console.log(`Could not start watching file ${config.configFile}, will not auto reload any schedules. Make sure the file exists`);
	console.log(e.message);
}
module.exports = {
	reload: loadJobs,
	jobs: jobs
}