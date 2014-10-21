/**
 * Created by Akeron on 3/8/14.
 */
define([
    "dojo/_base/declare",
    "qasht/package/Unit",
    "jazzHands/parser/turtle",
    "dojo/when",
    "dojo/_base/Deferred",
    "blocks/Cache",
    "dojo/promise/all",
    "RdfJs/Environment",
    "RdfJs/toJsonld"
], function (declare, UnitTestPackage, Turtle, when, Deferred, Cache, all, rdfEnv, toJsonld) {
    return declare([UnitTestPackage, rdfEnv], {
        type: "w3c Unit",
        manifest: null,
        loaded: null,
        turtleParser: null,
        constructor: function(){
            var loader = this;
            if (!loader.manifest){
                return null;
            }

            loader.files = new Cache(this, "loadTurtle");
            loader.turtleParser = new Turtle();

            loader.setPrefix("mf", "http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#");
            loader.setPrefix("qt", "http://www.w3.org/2001/sw/DataAccess/tests/test-query#");
            loader.setPrefix("dawgt", "http://www.w3.org/2001/sw/DataAccess/tests/test-dawg#");
            loader.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
            loader.setPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#");

            if (this.prefix){
                Object.keys(this.prefix).forEach(function(pfx){
                    loader.setPrefix(pfx, loader.prefix[pfx]);
                });
            }

            loader.excludeByName = loader.excludeByName || {};
            loader.excludeById = loader.excludeById || {};
            loader.excludeByType = loader.excludeByType || {};
            loader.debugName = loader.debugName || {};
            loader.debugId = loader.debugId || {};
            loader.loaded = {};

            loader.store = loader.createGraph();

            loader.context = loader.toContext("mf");
            return when(loader.loadManifest(loader.manifest), function () {
                return this.listForEach(null,'<' + this.resolve("mf:entries") + '>', this._testCase);
            }.bind(this));
        },
        loadManifest: function(mid){
            var loader = this;
            if (loader.loaded[mid]){
                return null;
            }
            loader.loaded[mid] = true;

            return when(loader.files.get(mid), function(rdf){
                var store = loader.store;
                store.addAll(rdf);
                var root = mid.substring(0, mid.lastIndexOf("/") + 1);

                //TODO: deal with includes that have recursive includes
                return loader.listForEach(null, '<' + loader.resolve("mf:include") + ">", function(file){
                    return loader.loadManifest(root + file.valueOf());
                });
            });
        },
        loadTurtle: function (file) {
            var done = new Deferred();
            var loader = this;
            require(["dojo/text!" + file], function (data) {
                loader.turtleParser.setBase(file);
                when(loader.turtleParser.parse(data), done.resolve, done.reject);
            });

            return done;
        },
        listForEach: function(subject, predicate, fn){
            var defList = [];
            this.store.match(subject, predicate, null).forEach({
                loader:this,
                graph: this.store,
                run: function (triple) {
                    var last = triple.object;
                    do{
                        var first = this.graph.match(last.toNT(), '<' + this.loader.resolve("rdf:first") + '>', null).toArray()[0];

                        defList.push(fn.apply(this.loader, [first.object]));

                        last = this.graph.match(last.toNT(), '<' + this.loader.resolve("rdf:rest") + '>', null).toArray()[0].object;
                    } while (last.toString() !== this.loader.resolve("rdf:nil"));
                }
            });

            return all(defList);
        },
        debug: function(){
            return false;
        },
        _testCase: function(iri){
            return when(toJsonld(this.tree(iri.toNT()), { context: this.context }), function(ld){
                if (this.excludeByName[ld.name] || this.excludeById[ld["@id"]]) {
                    return;
                }
                var debug = this.debugName[ld["name"]] ||
                            this.debugId[ld["@id"]];

                if (ld["rdfs:comment"]) {
                    ld.name += " - " + ld["rdfs:comment"];
                }

                var type = ld["@type"];
                if (this.excludeByType[type]) {
                    return;
                }
                debug = debug || this.debug(ld);

                if (debug) {
                    console.log(ld["@id"], ld.name);
                    debugger;
                }
                if (!this[type]) {
                    if (this.default) {
                        this[type] = this.default;
                    }
                }

                if (this[type]) {
                    ld.getFile = function(file) {
                        var done = new Deferred();
                        require(["dojo/text!" + file], done.resolve);
                        return done;
                    };
                    this[type](ld);

                    function addDebug(fn) {
                        if (fn) {
                            return function() {
                                debugger;
                                fn.apply(this, arguments);
                            };
                        }
                        return null;
                    }

                    if (debug) {
                        ld.setUp = addDebug(ld.setUp);
                        ld.exec = addDebug(ld.exec);
                        ld.tearDown = addDebug(ld.tearDown);
                    }

                    this.addTest(ld);
                } else {
                    console.error("No test runner defined for type: " + type);
                }

            }.bind(this));
        },
        tree: function(subject, inc){
            var loader = this;
            inc = inc || {
                data: this.createGraph()
            };
            inc[subject] = true;
            var rdf = this.store.match(subject, null, null).toArray();
            rdf.forEach(function(t){
                if (!t.object.isLiteral()){
                    var o = t.object.toNT();
                    if (!(o in inc)){
                        inc.data.addAll(loader.tree(o, inc));
                    }
                }
            });
            inc.data.addAll(rdf);
            return inc.data;
        }
    });
});