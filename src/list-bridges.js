import hue from "node-hue-api";

const displayBridges = function(bridges) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridges));
};

const searchBridges = async mode => {
	if (mode === 'local' || mode === 'upnp') {
		return await hue.v3.discovery.upnpSearch();
	} else {
		return await hue.v3.discovery.nupnpSearch();
	}
};

searchBridges('local').then(displayBridges);




