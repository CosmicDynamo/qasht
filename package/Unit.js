define([
           "dojo/_base/declare", "./_TestPackage", "../type/UnitTest"
       ], function (declare, _TestPackage, UnitTest){
    return declare([_TestPackage], {
        TestCtr : UnitTest
    });
})