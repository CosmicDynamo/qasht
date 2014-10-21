qasht
=====

AMD Testing Library

###Why: 
because doh is bad

###Features
* Works in browser
* Deals with async code
* Has assert function for common test assertions (or at least the ones I use in my code
** See qasht/type/_Test for a complete list of assertions (Will translate to here eventually, but hey, so much time; so little to do....

##Known loger term Goals:
* browser or NodeJs capability
* Bamboo integration


##Usage Example:
### Adding a simple Unit Test
    define([
        "qasht/package/Unit",
    ], function (UnitTestPackage) {
        return new TestPackage({
            module: "sample/amd/module", //Name of the AMD module being tested for output messaging
            type: "Example", //Optional message to display next to the module name DEFAULT 'Unit'
            tests: [  //Array of tests to perform
            {
                name: "add: Adds Triple to a Graph", //Name of this test
                setUp: function (test) { //Optional Setup method called before this test is run
                    test.attach = "value";
                },
                exec: function (test) { //Required test execution method
                    test.qGraph.add(test.triple);
                    
                    test.assertEqual("value", test.attach, "A sample assertion that should pass"); //Your assertions, test will fail if there is not at least one
                    test.assertEqual("global value", test.global, "A sample assertion that should pass"); //Your assertions, test will fail if there is not at least one
                    
                    test.complete(); //tells the engine this test is done.  Needed to handle async execution
                },
                tearDown: function(test){//Optional method called after this test is run to clean up memory
                    test.attach = "value"; 
                }
            }
            ],
            setUp: function (test) {//Optional Setup method called before each test in the Package is run
                test.global = "global value";
            },
            tearDown: function (test) {//Optional Setup method called after each test in the Package is run
                window.badIdea = null;
            }
        });
    });