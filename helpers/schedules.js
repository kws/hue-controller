const hue = require("node-hue-api"),
	config = require("config"),
	controller = require("./controller"),
    schedule = require('node-schedule'),
	yaml = require("node-yaml"),
	fs = require("fs")


const jobs = {}

const loadJobs = () => {
	let newJobs
	try {
		newJobs = yaml.readSync(config.schedulesFile)
	} catch (e) {
		console.log("FAILED TO LOAD SCHEDULES")
		console.log(e)
		return
	}

	// Cancel existing jobs
	Object.keys(jobs).forEach((key,index) => {
		let due = jobs[key].job.nextInvocation()
	    jobs[key].job.cancel();
	    delete jobs[key]
		console.log(`Cancelled ${key} that was due at ${due}`)
	});

	Object.keys(newJobs.schedules).forEach((key,index) => {
		var job = newJobs.schedules[key]
		job.job = schedule.scheduleJob(job.cron, () => {
			controller.execute(key, job)
		})
		jobs[key] = job
		console.log(`Scheduled ${key} next due at ${job.job.nextInvocation()}`)
	})

	if (newJobs.instant) {
		Object.keys(newJobs.instant).forEach((key,index) => {
			var job = newJobs.instant[key]
			controller.execute(key, job)
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