define([
           "dojo/_base/Deferred", "dojo/_base/lang", "dojo/when", "dojo/promise/all", "qash/now", "qash/lang/Function"
       ], function (Deferred, lang, when, all, now){
    return {
        buildRendering : null,
        last : null,
        totalTests : 0,
        completed : 0,
        passed : 0,
        failed : 0,
        inconclusive : 0,
        async : false,
        run : function (test){
            if (test){
                this.totalTests++;
                this.buildRendering(test);

                if (this.async){
                    this.execTest.defer(this)(test);
                } else{
                    function run(){
                        return this.execTest(test);
                    }

                    this.last = when(this.last, run.bind(this), run.bind(this));
                }
            }
        },
        execTest : function (test){
            var self = this;
            var args = arguments;

            test.runner = this;
            test.started = now();
            this.renderTestStart(test);
            this.testStart(test);
            function onError(ex){
                test.assertFail(ex);
            }

            var setup = null;
            if (lang.isFunction(test.setUp)){
                try{
                    setup = test.setUp.defer(test).apply(this, arguments);
                } catch(ex){
                    return onError(ex);
                }
            }

            var run = when(setup, function (){
                return test.exec.defer(test).apply(this, args);
            }, onError);

            function clean(){
                var cleaned = null;
                if (lang.isFunction(test.tearDown)){
                    cleaned = test.tearDown.defer(test).apply(this, args);
                }

                function exit(){
                    test.passed = !test.failed && !test.inconclusive;
                    self.renderTestEnd(test);
                    self.testComplete(test);
                    self = null;
                    return test.runner = null;
                }

                return when(cleaned, exit, exit);
            }

            test.done = new Deferred();
            var destroyed = when(run, function (){
                return test.done
            }, onError);

            if (test.timeout){
                this.timeout.next(this, test.timeout || 1000)(test);
            }

            return when(destroyed, clean, clean);
        },
        testStart : function (test){
        },
        testComplete : function (test){
        },
        logError : function (test, message, error){
            test.failed = true;

            this.renderError(test, message, error);
        },
        timeout : function (test){
            if (!(test.done && test.done.isResolved())){
                test.assertFail({hint : "Test Timeout Reached: " + test.timeout + "ms" });
            }
        },
        on : function (event, fn){
            if (!this[event]){
                this[event] = function (){
                };
            }

            var before = this[event];

            this[event] = function (){
                var args = arguments;
                var out = before.apply(this, args);
                when(out, function (){
                    fn.apply(this, args);
                });
                return out;
            }
        }
    }
});