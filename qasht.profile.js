var testResourceRe = /^doh\/tests/, list = {
    "qasht/qasht.profile" : 1,
    "qasht/package.json" : 1,
    "qasht/tests" : 1,
    "qasht/_parseURLargs" : 1
}, copyOnly = function (mid){
    return (mid in list);
};

var profile = {
    resourceTags : {
        test : function (filename, mid){
            return testResourceRe.test(mid);
        },

        copyOnly : function (filename, mid){
            return copyOnly(mid);
        },

        amd : function (filename, mid){
            return !testResourceRe.test(mid) && !copyOnly(mid) && /\.js$/.test(filename);
        }
    }
};
