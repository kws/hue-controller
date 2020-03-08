import sqlite3 from 'sqlite3';
import { createLogObject } from './csv.js';

const SQL = `
    INSERT INTO log (event_id, date, id, name, type, value, battery, dark, daylight) 
    VALUES ($event_id, $date, $id, $name, $type, $value, $battery, $dark, $daylight)
`;

export default class SQLiteLogger {
    constructor(dbURL) {
        this.db = new sqlite3.Database(dbURL);
        //date,id,name,type,value,battery,dark,daylight
        this.db.run(`CREATE TABLE IF NOT EXISTS log (
            event_id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            id NUMERIC NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            value TEXT NOT NULL,
            battery NUMERIC,
            dark TEXT,
            daylight TEXT
        )`);
    }

    log = s => {
        const msg = createLogObject(s);
        if (msg.type) {
            const dbInsert = {};
            for (const property in msg) {
                dbInsert[`$${property}`] = msg[property];
            }
            this.db.run(SQL, dbInsert);
        }
    };
}