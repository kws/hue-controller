import fs from 'fs';
import dateFormat from 'dateformat';

export default class CSVLogger {
    constructor(filename) {
        this.filename = filename;
    }

    log = s => {
        let msg;
        if (s.type === "Daylight") {
            msg = (`${s.lastupdated},${s.id},${s.name},daylight,${s.daylight},,,${s.daylight}\n`);
        } else if (s.type === "ZGPSwitch") {
            msg = (`${s.lastupdated},${s.id},${s.name},button,${s.buttonevent}\n`);
        } else if (s.type === "ZLLSwitch") {
            msg = (`${s.lastupdated},${s.id},${s.name},button,${s.buttonevent},${s.battery}\n`);
        } else if (s.type === "ZLLTemperature") {
            msg = (`${s.lastupdated},${s.id},${s.name},temperature,${s.temperature / 100}\n`);
        } else if (s.type === "ZLLPresence") {
            msg = (`${s.lastupdated},${s.id},${s.name},presence,${s.presence},${s.battery}\n`);
        } else if (s.type === "ZLLLightLevel") {
            msg = (`${s.lastupdated},${s.id},${s.name},lightlevel,${s.lightlevel},,${s.dark},${s.daylight}\n`);
        }
        if (msg) {
            const filename = this.filename.replace("%date%", dateFormat(new Date(), "yyyy-mm-dd"));
            fs.appendFile(filename, msg, function (err) {
                if (err) {
                    console.log(`{err}: Could not log ${msg}`)
                }
            });
        }
    };
}