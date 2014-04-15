var exit = process.exit
var argv = process.argv; //hold a reference to original process.exit so that we are not affected even when a test changes it

var test = "module.js"
for (var idx = 0; idx < argv.length; idx++){
    if (argv[idx] == "run"){
        test = argv[++idx];
    }
}
//var jsdom = require("jsdom");
//jsdom.env(
//  '<html><body></body></html>',
//    function(errors, window){
//        global.document = window.document;
//       global.window = window;
console.log('loading dojo');
require('../../dojo/dojo.js');
//if (!window.require){
//    window.require = global.require;
//}
//process.versions.node = null;//necessary for argo/jsonld so that it doesn't think this is node.js running.
//window.document.attachEvent = function(a, b){
//    console.warn('someone tried to attach an event (' + a + ')');
//};
//global.addEventListener = function(a, b){
//    console.warn('someone tried to add an event listener (' + a + ')');
//};
//location = window.location;
//navigator = {msPointerEnabled: false};//necessary for dojo/touch
//global.location = window.location;
global.log = console.log;
global.exit = exit;
//global.error = console.error;
global.coverageGood = 95;
global.coverageOk = 70;

var djConfig = {
    async : 1, // We want to make sure we are using the "modern" loader
    hasCache : {
        "dom" : 1 // Ensure that none of the code assumes we have a DOM
    },
    // While it is possible to use config-tlmSiblingOfDojo to tell the
    // loader that your packages share the same root path as the loader,
    // this really isn't always a good idea and it is better to be
    // explicit about our package map.
    packages : [
        {
            name : "dojo",
            location : "../../dojo"
        },
        {
            name : "dijit",
            location : "../../dijit"
        },
        {
            name : "dojox",
            location : "../../dojox"
        },
        {
            name : "qasht",
            location : "../../qasht"
        },
        {
            name : "qash",
            location : "../../qash"
        }
    ]
};
try{
    global.require(djConfig, ["qasht/main"], function (qasht){
        qasht.complete = function (){
            global.exit();
        }
        global.require([test]);
    });
} catch(e){
    global.log('\r\n\r\n\r\n----------------------------------------------\r\nBuild Failed!\r\n\r\n', e.message,
               e.stack);
    global.exit();
}
//    });