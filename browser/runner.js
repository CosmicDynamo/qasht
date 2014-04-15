define([
           "dojo/_base/lang", "dojo/dom-construct", "dojo/dom-class", "dojo/dom-style", "dojo/query", "dojo/dom",
           "dojo/window", "../runner", "qash/genId", "dojo/text!qasht/browser/template/testGroup.html",
           "dojo/text!qasht/browser/template/test.html", "dojo/text!qasht/browser/template/testLog.html",
           "dojo/text!qasht/browser/template/logStart.html", "dojo/text!qasht/browser/template/logMessage.html",
           "dojo/text!qasht/browser/template/logEnd.html"
       ], function (lang, domConstruct, domClass, domStyle, query, dom, win, runner, genId, testGroup, testTemplate,
                    testLog, logStart, logMessage, logEnd){
    var render = {
        testGroup : testGroup,
        testTemplate : testTemplate,
        logTemplate : testLog,
        logStart : logStart,
        logMessage : logMessage,
        logEnd : logEnd,
        init : false,
        _renderedModules : {},
        total : 0,
        initialize : function (){
            if (!this.init){
                this.testList = query("#testList")[0];
                this.testLog = query("#testLog")[0];
                this.totalProgress = query("#totalProgress")[0];

                domStyle.set(query("#testRunner")[0], "height", win.getBox().h + "px");
                window.onresize = function (event){
                    domStyle.set(query("#testRunner")[0], "height", win.getBox().h + "px");
                };

                this.init = true;
            }
        },
        buildRendering : function (test){
            this.initialize();

            var modId = test.module + (test.type ? ("&nbsp;(" + test.type + ")") : "");
            test.moduleId = modId;
            var group = this._renderedModules[modId];
            var isNewGroup = group == null;
            if (isNewGroup){
                var id = genId();
                group = {
                    id : id,
                    domNode : domConstruct.toDom(this.testGroup.replace("%%id%%", id).replace("%%name%%", modId)),
                    runnerProgress : domConstruct.toDom("<div class='color pass' style='width:0;'></div>"),
                    total : 0,
                    completed : 0,
                    elapsed : 0,
                    last : null
                };
                group.time = query(".time", group.domNode)[0];
                group.progress = query(".bar", group.domNode)[0];

                domConstruct.place(group.domNode, this.testList, 0);

                domConstruct.place(group.runnerProgress, this.totalProgress);

                group.domNode.onclick = function (){
                    var tests = query("[group=" + id + "].test");
                    for (var idx = 0; idx < tests.length; idx++){
                        var test = tests[idx];

                        domStyle.set(test, "display", this.collapsed ? "none" : "");
                    }

                    this.collapsed = !this.collapsed;
                };
                this._renderedModules[modId] = group;
            }

            this.total++;

            test.id = genId();
            var testNode = domConstruct.toDom(this.testTemplate.replace("%%id%%", test.id).replace("%%group%%",
                                                                                                   group.id).replace("%%name%%",
                                                                                                                     test.name));

            var placeId = group.last || group.id;
            domConstruct.place(testNode, query("#" + placeId)[0], "after");

            group.total++;
            group.last = test.id;

            var all = this._renderedModules;
            var total = this.total;
            Object.keys(all).forEach(function (groupId){
                var g = all[groupId];
                domStyle.set(g.runnerProgress, "width", ((g.completed / total) * 100) + "%");
            });
            all = null;
        },
        renderTestStart : function (test){
            var id = genId();
            test.__render = {
                id : id
            };
            test.__render.log = domConstruct.toDom(this.logTemplate.replace("%%id%%", id));

            var message = test.name;
            if (test.testDetails){
                message += "\n" + test.testDetails(test);
            }
            while(message.indexOf("<") > -1){
                message = message.replace("<", "&lt;");
            }
            while(message.indexOf("\n") > -1){
                message = message.replace("\n", "<br />");
            }
            var msg = domConstruct.toDom(this.logStart.replace("%%name%%", message));

            domConstruct.place(test.__render.log, this.testLog);
            domConstruct.place(msg, test.__render.log);

            test.__render.label = query("#" + test.id)[0];
            var runner = this;
            test.__render.label.onclick = function (){
                runner.testLog.scrollTop = query("#" + id)[0].scrollIntoView()
            };

            test.__render.start = new Date();
        },
        renderTestEnd : function (test){
            var elapsed = (new Date() - test.__render.start);
            var msg = domConstruct.toDom(this.logEnd.replace("%%time%%", this.shrinkTime(elapsed)));
            domConstruct.place(msg, test.__render.log);

            var status = "pass";
            var testLabel = test.__render.label;
            if (test.passed){
                status = "pass";
            } else{
                domClass.remove(test.__render.log, "pass");
                domClass.remove(testLabel, "pass");
                if (test.failed){
                    status = "fail";
                } else{
                    status = "inconclusive";
                }
            }
            domClass.add(test.__render.log, status);
            domClass.add(testLabel, status);
            query(".time", testLabel)[0].innerText = this.shrinkTime(elapsed);

            var group = this._renderedModules[test.moduleId];
            group.completed++;
            var progress = ((group.completed / group.total) * 100);
            domStyle.set(group.progress, "width", progress + "%");
            group.elapsed += elapsed;

            var time = "";
            if (group.completed == group.total){
                if (!this.async){
                    time = this.shrinkTime(group.elapsed);
                }
                domClass.add(group.domNode, "color");
            } else{
                time = progress.toString();
                if (time.indexOf(".")){
                    time = time.substr(0, time.indexOf(".") + 2);
                }
                time += "%";
            }
            group.time.innerText = time;

            if (test.failed){
                domClass.remove(group.domNode, "pass");
                domClass.add(group.domNode, "fail");
                domClass.remove(group.runnerProgress, "pass");
                domClass.add(group.runnerProgress, "fail");
            }

            domStyle.set(group.runnerProgress, "width", ((group.completed / this.total) * 100) + "%");
            this.completed++;
        },
        shrinkTime : function (out){
            var end = "ms";
            if (out > 1000){
                out = out / 1000;
                end = "s";
                if (out > 60){
                    out = out / 60;
                    end = "m";
                }
            }

            out = out.toString();
            if (out.indexOf(".") >= 0){
                out = out.substr(0, out.indexOf(".") + 2);
            }
            return out + end;
        },
        renderError : function (test, message, error){
            message = (message || "Test Error");
            if (error && error.message){
                message += error.message + (error.stack ? ("<br />" + error.stack + "<br /><br />") : "");
            }
            while (message.indexOf("\n") > -1){
                message = message.replace("\n", "<br />");
            }
            var msg = domConstruct.toDom(this.logMessage.replace("%%msg%%", message));
            domConstruct.place(msg, test.__render.log);
            domClass.add(msg, "fail");
        },
        renderSuccess : function (test, message){
            if (message){
                for (var idx = 2; idx < arguments.length; idx++){
                    if (arguments[idx]){
                        message += " " + arguments[idx];
                    }
                }
                var msg = domConstruct.toDom(this.logMessage.replace("%%msg%%", message));
                domConstruct.place(msg, test.__render.log);
            }
        }
    };

    return lang.mixin(runner, render);
});