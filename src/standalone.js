import controller from "./helpers/controller.js";
import schedules from "./helpers/schedules.js";

// Just make sure we have a reference
if (controller && schedules) {
    console.log("Loaded")
}

setInterval(() => {}, 1 << 30);
