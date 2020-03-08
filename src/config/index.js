import path from "path";
import process from "process";
import hue from "node-hue-api";

const { pathname } = new URL(import.meta.url);


const discovery = hue.v3.discovery;

async function discoverBridge() {
  const discoveryResults = await discovery.nupnpSearch();

  if (discoveryResults.length === 0) {
    console.error('Failed to resolve any Hue Bridges');
    return null;
  } else {
    // Ignoring that you could have more than one Hue Bridge on a network as this is unlikely in 99.9% of users situations
    return discoveryResults[0].ipaddress;
  }
}

const getHostName = async () => {
  return process.env.HUE_HOSTNAME || await discoverBridge()
};

export default {
  hostname: getHostName,
  username: process.env.HUE_USERNAME,
  configFile: process.env.CONFIG_FILE || path.join(pathname, '../../../settings/config.yml'),
  schedulesFile: process.env.CONFIG_FILE || path.join(pathname, '../../../settings/schedules.yml'),
  iotLog: process.env.IOT_LOG,
  dbURL: process.env.IOT_DB_URL,
};