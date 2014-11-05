var args = {};
process.argv.forEach(function (value) {
    var parts = value.split("=");
    args[parts[0]] = parts[1] || true;
});

var fs = require("fs");

dojoConfig = {
    async: 1, // We want to make sure we are using the "modern" loader
    hasCache: {
        "dom": 1 // Ensure that none of the code assumes we have a DOM
    },
    // While it is possible to use config-tlmSiblingOfDojo to tell the
    // loader that your packages share the same root path as the loader,
    // this really isn't always a good idea and it is better to be
    // explicit about our package map.
    packages: fs.readdirSync('./').map(function (file) {
        return {
            name: file,
            location: "../" + file
        }
    })
};

require(args['dojo'] || '../dojo/dojo.js');//setup dojo,

var workingDir = process.cwd();

global.require([
    "dojo/_base/Deferred",
    "dojo/_base/kernel",
    "qasht/node/runner"
], function (Promise, kernel) {
    //necessary for jsonld so that it doesn't think this is node.js running.
    process.versions.node = null;

    global.Promise = Promise;//needed for argo/jsonld line 990.

    var location = {};
    location.origin = workingDir + "\\";
    location.pathname = "NodeJs.js";
    kernel.global.location = location;


    global.require([args.module], function () {
    });
});