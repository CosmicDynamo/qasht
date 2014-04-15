(function (){
    var boot = // zero to many scripts to load a configuration and/or loader.
            // i.e. path-to-util/qasht/runner.html?boots=path-to/config.js,path-to/require.js
            ["../dojo/dojo.js"], standardDojoBoot = boot,

        test = // zero to many AMD modules and/or URLs to load; provided by csv URL query parameter="test"
            // For example, the URL...
            //
            //		 path-to-util/qasht/runner.html?test=qasht/selfTest,my/path/test.js
            //
            // ...will load...
            //
            //	 * the AMD module qasht/selfTest
            //	 * the plain old Javascript resource my/path/test.js
            //
            ["dojo/tests/module"],

        paths = // zero to many path items to pass to the AMD loader; provided by semicolon separated values
            // for URL query parameter="paths"; each path item has the form <from-path>,<to-path>
            // i.e. path-to-util/qasht/runner.html?paths=my/from/path,my/to/path;my/from/path2,my/to/path2
        {},

        qashtPlugins = // Semicolon separated list of files to load before the tests.
            // Idea is to override aspects of qasht for reporting purposes.
            "",

        breakOnError = // boolean; instructs qasht to call the debugger upon a test failures; this can be helpful when
            // trying to isolate exactly where the test failed
            false,

        async = // boolean; config require.async==true before loading boot; this will have the effect of making
            // version 1.7+ dojo bootstrap/loader operating in async mode
            false,

        sandbox = // boolean; use a loader configuration that sandboxes the dojo and dojox objects used by qasht
            false,

        trim = function (text){
            if (text instanceof Array){
                for (var result = [], i = 0; i < text.length; i++){
                    result.push(trim(text[i]));
                }
                return result;
            } else{
                return text.match(/[^\s]*/)[0];
            }
        };

    qstr = window.location.search.substr(1);

    if (qstr.length){
        for (var qparts = qstr.split("&"), x = 0; x < qparts.length; x++){
            var tp = qparts[x].split("="), name = tp[0], value = (tp[1] || "").replace(/[<>"':\(\)]/g, ""); // replace() to avoid XSS attack
            //Avoid URLs that use the same protocol but on other domains, for security reasons.
            if (value.indexOf("//") === 0 || value.indexOf("\\\\") === 0){
                throw "Insupported URL";
            }
            switch (name){
                // Note:
                //	 * dojoUrl is deprecated, and is a synonym for boot
                //	 * testUrl is deprecated, and is a synonym for test
                //	 * testModule is deprecated, and is a synonym for test (dots are automatically replaced with slashes)
                //	 * registerModulePath is deprecated, and is a synonym for paths
                case "boot":
                case "dojoUrl":
                    boot = trim(value.split(","));
                    break;

                case "test":
                    test = trim(value.replace(/\./g, "/").split(","));
                    break;

                // registerModulePath is deprecated; use "paths"
                case "registerModulePath":
                case "paths":
                    for (var path, modules = value.split(";"), i = 0; i < modules.length; i++){
                        path = modules[i].split(",");
                        paths[trim(path[0])] = trim(path[1]);
                    }
                    break;

                case "breakOnError":
                    breakOnError = true;
                    break;

                case "sandbox":
                    sandbox = true;
                    break;

                case "async":
                    async = true;
                    break;
                case "qashtPlugins":
                    qashtPlugins = value.split(";");
                    break;
            }
        }
    }

    var config = {
        paths : paths,
        deps : ["dojo/domReady", "qasht/main"],
        callback : function (domReady, qasht){
            domReady(function (){
                if (blanket){
                    blanket.setupCoverage();

                    qasht.on('end', function (){
                        blanket.onTestsDone();
                    });

                    qasht.on('suite', function (){
                        blanket.onModuleStart();
                    });

                    qasht.on('testStart', function (){
                        blanket.onTestStart();
                    });

                    qasht.on('testComplete', function (test){
                        blanket.onTestDone(qasht.totalTests, test.passed);
                    });

                    blanket.customReporter = function (coverage_results){
                        console.log(coverage_results);
                    };
                }

                qasht.breakOnError = breakOnError;
                require(test, function (){
                    qasht.run();
                });
            });
        },
        async : async,
        isDebug : 1
    };

    // load all of the qashtPlugins
    if (qashtPlugins){
        var i = 0;
        for (i = 0; i < qashtPlugins.length; i++){
            config.deps.push(qashtPlugins[i]);
        }
    }

    require = config;

    // now script inject any boots
    for (var e, i = 0; i < boot.length; i++){
        if (boot[i]){
            e = document.createElement("script");
            e.type = "text/javascript";
            e.src = boot[i];
            e.charset = "utf-8";
            document.getElementsByTagName("head")[0].appendChild(e);
        }
    }
})();