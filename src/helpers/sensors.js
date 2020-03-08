import uuid from 'uuid';
import controller from './controller.js'
import config from "../config/index.js";
import CSVLogger from "../loggers/csv.js";
import SQLiteLogger from "../loggers/sqlite.js";

const statusMap = {};
const listeners = [];

export const addListener = listener => {
    listeners.push(listener);
};

const fireChange = async sensor => {
    return Promise.all(listeners.map(l => l(sensor)))
};

const displayBrief = s => {
    if (s.type === "Daylight") {
        console.log(`${s.id}  ${s.name} daylight=${s.daylight} ${s.lastupdated}`);
    } else if (s.type === "ZGPSwitch") {
        console.log(`${s.id}  ${s.name} button=${s.buttonevent} ${s.lastupdated}`);
    } else if (s.type === "ZLLSwitch") {
        console.log(`${s.id}  ${s.name} button=${s.buttonevent} battery=${s.battery} ${s.lastupdated}`);
    } else if (s.type === "ZLLTemperature") {
        console.log(`${s.id}  ${s.name} temperature=${s.temperature/100} ${s.lastupdated}`);
    } else if (s.type === "ZLLPresence") {
        console.log(`${s.id}  ${s.name} presence=${s.presence} battery=${s.battery} ${s.lastupdated}`);
    } else if (s.type === "ZLLLightLevel") {
        console.log(`${s.id}  ${s.name} level=${s.lightlevel} dark=${s.dark} daylight=${s.daylight} ${s.lastupdated}`);
    }
};


export const display = s => {
    console.log(`\n${s.id} ${s.type} ${s.name}`);
    if (s.type === "Daylight") {
        console.log(`  ${s.daylight} ${s.lat} ${s.long} ${s.sunriseoffset} ${s.sunsetoffset} ${s.lastupdated}`)
    } else if (s.type === "CLIPGenericStatus") {
        console.log(`  ${s.status} ${s.lastupdated}`)
    } else if (s.type === "ZGPSwitch") {
        console.log(`  ${s.buttonevent} ${s.lastupdated}`)
    } else if (s.type === "ZLLSwitch") {
        console.log(`  ${s.buttonevent} ${s.battery} ${s.lastupdated}`)
    } else if (s.type === "CLIPGenericFlag") {
        console.log(`  ${s.flag} ${s.lastupdated}`)
    } else if (s.type === "ZLLTemperature") {
        console.log(`  ${s.temperature/100}C ${s.lastupdated}`)
    } else if (s.type === "ZLLPresence") {
        console.log(`  ${s.presence} ${s.battery} ${s.alert} ${s.sensitivity} ${s.lastupdated}`)
    } else if (s.type === "ZLLLightLevel") {
        console.log(`  ${s.lightlevel} ${s.dark} ${s.daylight} ${s.battery} ${s.lastupdated}`)
    } else {
        console.log(`  UNKNOWN: ${s.type} ${s.lastupdated}`)
    }
};

export const poll = async () => {
    const api = await controller.api();
    const sensors = await api.sensors.getAll();

    sensors.forEach(s => {
        s.event_id = uuid.v4();
        const oldValue = statusMap[s.id];
        statusMap[s.id] = s;
        if (!oldValue || oldValue.lastupdated !== s.lastupdated) {
            fireChange(s, oldValue)
        }
    })
};

addListener(displayBrief);

if (config.iotLog) {
    addListener(new CSVLogger(config.iotLog).log);
}
if (config.dbURL) {
    addListener(new SQLiteLogger(config.dbURL).log);
}
