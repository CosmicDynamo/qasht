define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when"
], function (declare, lang, when) {
    /**
     * @class qasht.Test
     */
    return declare([], {
        runner: null,
        timeout: 5000,
        _errLst: null,
        constructor: function (args) {
            lang.mixin(this, args);

            this._errLst = [];
        },
        complete: function () {
            if (this.done && !this.done.isResolved()) {
                this.done.resolve(this);
            }

            return this.done;
        },
        exec: function (test) {
            if (!this.runner) {
                console.error("Missing Test Runner!!!");
                return;
            }

            this.inherited(arguments);
        },
        assertFail: function (ex) {
            var assertion = "Assert " + (ex.assertion || "Fail") + ": " + (ex.hint || "");
            this.runner.logError(this, assertion, ex);
            return this.complete();
        },
        assertEqual: function (expected, actual, hint) {
            if (expected !== actual) {
                throw {
                    assertion: "Equal",
                    hint: hint,
                    message: "\nexpected:\n" + expected + "\nactual:\n" + actual
                }
            }
            this.runner.renderSuccess(this, "Assert Equal:", "val=", expected, hint);
        },
        assertNotEqual: function (expected, actual, hint) {
            if (expected === actual) {
                throw {
                    assertion: "Not Equal",
                    hint: hint,
                    message: "\nactual:\n" + actual
                }
            }
            this.runner.renderSuccess(this, "Assert Not Equal:", "p1=", expected, "p2=", actual, hint);
        },
        assertTrue: function (actual, hint) {
            if (true !== actual) {
                throw {
                    assertion: "True",
                    hint: hint,
                    message: "\nvalue:\n" + actual
                }
            }
            this.runner.renderSuccess(this, "Assert True", hint);
        },
        assertFalse: function (actual, hint) {
            if (false !== actual) {
                throw {
                    assertion: "False",
                    hint: hint,
                    message: "\nvalue:\n" + actual
                }
            }
            this.runner.renderSuccess(this, "Assert False", hint);
        },
        assertUndefined: function (actual, hint) {
            var isUnDef = actual == null;
            this.assertTrue(isUnDef, "Assert Is Undefined: " + hint);
        },
        assertIsNumber: function (value, hint) {
            var isNum = !isNaN(value) && isFinite(value);
            this.assertTrue(isNum, "Assert Is A Number: " + hint);
        },
        assertIsObject: function (instance, hint) {
            var isObj = instance != null && lang.isObject(instance);
            this.assertTrue(isObj, "Assert Is Object: " + hint);
        },
        assertIsArray: function (instance, hint) {
            var isArray = instance != null && lang.isArray(instance);
            this.assertTrue(isArray, "Assert Is Array: " + hint);
        },
        assertIsString: function (instance, hint) {
            var isString = instance != null && lang.isString(instance);
            this.assertTrue(isString, "Assert Is String: " + hint);
        },
        assertIsFunction: function (instance, hint) {
            var isObj = instance != null && lang.isFunction(instance);
            this.assertTrue(isObj, "Assert Is Function: " + hint);
        },
        assertNull: function (value, hint) {
            this.assertTrue(value === null, "Assert Is Null: " + hint);
        },
        whenResolved: function (promise, fn) {
            var test = this;
            return when(promise, fn, function (error) {
                test.assertFail(error);
            })
        },
        whenRejected: function (promise, fn) {
            var test = this;
            return when(promise, function (error) {
                test.assertFail(error);
            }, fn)
        }
    });
});
