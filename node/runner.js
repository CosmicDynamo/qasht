define([
    "dojo/_base/lang",
    "dojo/node!fs",
    "../runner"
], function (lang, fs, runner) {
    if (!fs.existsSync("log")) {
        fs.mkdirSync("log");
    }
    var errFile = "log/err_run";
    var idx = 0;
    while (fs.existsSync(errFile + idx + ".txt")) {
        idx++
    }

    errFile = errFile + idx + ".txt";

    var render = {
        buildRendering: function (test) {
        },
        renderTestStart: function (test) {
            console.log("Started", test.module, "(" + test.type + ")", test.name);
        },
        renderTestEnd: function (test) {
            console.log("Complete", test.module, "(" + test.type + ")", test.name);
        },
        renderError: function (test, message, error) {
            message = (message || "Test Error");
            if (error && error.message) {
                message += error.message + (error.stack ? ("\n" + error.stack + "\n\n") : "");
            }

            console.log(message, "fail");

            var errMesg = ["Failed: ", test.module, "(" + test.type + ")", test.name].join(" ") + "\r\n" + message + "\r\n";
            fs.appendFile(errFile, errMesg, function () {
            });
        },
        renderSuccess: function (test, message) {
            if (message) {
                for (var idx = 2; idx < arguments.length; idx++) {
                    if (arguments[idx]) {
                        message += " " + arguments[idx];
                    }
                }

                console.log(message, "pass");
            }
        }
    };

    return lang.mixin(runner, render);
});