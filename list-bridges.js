import hue from "node-hue-api";

const displayBridges = function(bridges) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridges));
};

const searchBridges = async () => {
	const bridges = await hue.v3.discovery.nupnpSearch()
	return bridges
}

searchBridges().then(displayBridges)




