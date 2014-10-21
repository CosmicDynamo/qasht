define([
    "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Deferred", "dojo/promise/all", "dojo/when", "../runner"
], function (declare, lang, Deferred, all, when, runner) {
    return declare([], {
        module: null,
        type: null,
        testModule: null,
        tests: null,
        load: null,
        constructor: function (params) {
            lang.mixin(this, params);

            this.load = new Deferred();

            if (this.tests) {
                this.addTest(this.tests);
            }
        },
        addTest: function (test) {
            if (lang.isArray(test)) {
                test.forEach(function (t) {
                    this.addTest(t)
                }.bind(this));
                return;
            }
            test = new this.TestCtr(test);

            test.module = this.module;

            if (this.setUp) {
                if (test.setUp) {
                    test.setUp = this.chain(this.setUp, test.setUp);
                } else {
                    test.setUp = this.setUp;
                }
            }

            if (this.tearDown) {
                if (test.tearDown) {
                    test.tearDown = this.chain(this.tearDown, test.tearDown);
                } else {
                    test.tearDown = this.tearDown;
                }
            }

            runner.run(test);
        },
        chain: function (first, second) {
            if (first && second) {
                return function () {
                    var args = arguments;
                    var self = this;
                    var done = first.apply(self, args);
                    if (lang.isArray(done)) {
                        done = all(done);
                    }
                    return when(done, function () {
                        var rtn = second.apply(self, args);
                        self = null;

                        return lang.isArray(rtn) ? all(rtn) : rtn;
                    });
                };
            }
            return first || second;
        }
    });
});