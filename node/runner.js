define([
           "dojo/_base/lang", "../runner"
       ], function (lang, runner){
    var render = {
        buildRendering : function (test){
        },
        renderTestStart : function (test){
            console.log("Started", test.module, "(" + test.type + ")", test.name);
        },
        renderTestEnd : function (test){
            console.log("Complete", test.module, "(" + test.type + ")", test.name);
        },
        renderError : function (test, message, error){
            message = (message || "Test Error");
            if (error && error.message){
                message += error.message + (error.stack ? ("\n" + error.stack + "\n\n") : "");
            }

            console.log(message, "fail");
        },
        renderSuccess : function (test, message){
            /*if (message){
                for (var idx = 2; idx < arguments.length;idx++){
                    if (arguments[idx]){
                        message += " " + arguments[idx];
                    }
                }

                console.log(message, "pass");
            }*/
        }
    };

    return lang.mixin(runner, render);
});