import fs from 'fs';
import os from 'os';
import dateFormat from 'dateformat';

// optional values in csv
const o = o => o ? o : '';

export const createLogObject = s => {
    // date,id,name,type,value,battery,dark,daylight
    const msg = {date: s.lastupdated, id: s.id, name: s.name, event_id: s.event_id};
    if (s.type === "Daylight") {
        msg.type = "daylight";
        msg.value = s.daylight;
        msg.daylight = s.daylight;
    } else if (s.type === "ZGPSwitch" || s.type === "ZLLSwitch") {
        msg.type = "button";
        msg.value = s.buttonevent;
        msg.battery = s.battery;
    } else if (s.type === "ZLLTemperature") {
        msg.type = "temperature";
        msg.value = s.temperature / 100;
    } else if (s.type === "ZLLPresence") {
        msg.type = "presence";
        msg.value = s.presence;
        msg.battery = s.battery;
    } else if (s.type === "ZLLLightLevel") {
        msg.type = "lightlevel";
        msg.value = s.lightlevel;
        msg.dark = s.dark;
        msg.daylight = s.daylight;
    }
    return msg;
};

export default class CSVLogger {
    constructor(filename) {
        this.filename = filename;
    }

    log = s => {
        const msg = createLogObject(s);
        if (msg.type) {
            const msgStr = `${msg.date},${msg.id},${msg.name},${msg.type},${msg.value}` +
                `,${o(msg.battery)},${o(msg.dark)},${o(msg.daylight)},${msg.event_id}\n`;
            const filename = this.filename.replace("%date%", dateFormat(new Date(), "yyyy-mm-dd"));
            fs.appendFile(filename, msgStr, function (err) {
                if (err) {
                    console.err(`${err.message}: Could not log ${msgStr} to ${filename}`)
                    console.err(err)
                }
            });
        }
    };
}