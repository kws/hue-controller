import config from "../config/index.js";
import controller from "./controller.js";
import schedule from "node-schedule";
import yaml from "node-yaml";
import fs from "fs";

const jobs = {};

/*
	Replaces JOB aliases with real IDs from config.
*/
const prepareJob = (job, jobsFile) => {
    let origLights = job.action.lights;

    // Treat as array
    if (origLights.constructor !== Array) {
        origLights = [origLights]
    }

    // Substitute aliases for real values
    let lights = origLights.map((light) => {
        return jobsFile.lights && jobsFile.lights[light] ? jobsFile.lights[light] : light
    });

    job.action.inputLights = job.action.lights;
    job.action.lights = lights;

    return job
};

const execute = (key, job) => {
    controller.execute(key, job).then(
        // do something?
    ).catch(err => {
            console.log(`Could not execute job "${key}":`, err)
        }
    )
};

const loadJobs = () => {
    let jobsFile;
    try {
        jobsFile = yaml.readSync(config.schedulesFile)
    } catch (e) {
        console.log("FAILED TO LOAD SCHEDULES");
        console.log(e);
        return
    }

    // Rename lights based on internal aliases
    Object.keys(jobsFile.schedules).forEach((key, index) => {
        jobsFile.schedules[key] = prepareJob(jobsFile.schedules[key], jobsFile)
    });

    // Cancel existing jobs
    Object.keys(jobs).forEach((key, index) => {
        let due = jobs[key].job.nextInvocation();
        jobs[key].job.cancel();
        delete jobs[key];
        console.log(`Cancelled ${key} that was due at ${due}`)
    });

    Object.keys(jobsFile.schedules).forEach((key, index) => {
        let job = jobsFile.schedules[key];
        job.job = schedule.scheduleJob(job.cron, () => {
            execute(key, job)
        });
        jobs[key] = job;
        console.log(`Scheduled ${key} next due at ${job.job.nextInvocation()}`)
    });

    if (jobsFile.instant) {
        Object.keys(jobsFile.instant).forEach((key, index) => {
            let job = jobsFile.instant[key];
            execute(key, prepareJob(job, jobsFile))
        })
    }

};

loadJobs();

let watchTimeout;
try {
    fs.watchFile(config.schedulesFile, {persistent: false}, () => {
        console.log("File change detected");
        clearTimeout(watchTimeout);
        watchTimeout = setTimeout(loadJobs, 200);
    })
} catch (e) {
    console.log(`Could not start watching file ${config.configFile}, will not auto reload any schedules. Make sure the file exists`);
    console.log(e.message);
}

export default {
    reload: loadJobs,
    jobs: jobs
};