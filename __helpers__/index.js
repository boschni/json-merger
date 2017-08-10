const jsonMerger = require("../index");

function mergeObject(object, opts) {
    opts = Object.assign({stringify: "pretty"}, opts);
    return jsonMerger.fromObject(object, opts);
}

function mergeObjects(objects, opts) {
    opts = Object.assign({stringify: "pretty"}, opts);
    return jsonMerger.mergeObjects(objects, opts);
}

function expectStringWithMatchers(str, matchers) {
    matchers.forEach(matcher => expect(str).toEqual(matcher));
}

module.exports = {
    expectStringWithMatchers,
    fromObject: mergeObject,
    mergeObjects: mergeObjects
};
