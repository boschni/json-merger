"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Merger_1 = require("./src/Merger");
exports.Merger = Merger_1.default;
function fromObject(object, config) {
    var merger = new Merger_1.default(config);
    return merger.fromObject(object);
}
exports.fromObject = fromObject;
function mergeObjects(objects, config) {
    var merger = new Merger_1.default(config);
    return merger.mergeObjects(objects);
}
exports.mergeObjects = mergeObjects;
function fromFile(file, config) {
    var merger = new Merger_1.default(config);
    return merger.fromFile(file);
}
exports.fromFile = fromFile;
function mergeFiles(files, config) {
    var merger = new Merger_1.default(config);
    return merger.mergeFiles(files);
}
exports.mergeFiles = mergeFiles;
exports.default = Merger_1.default;
//# sourceMappingURL=index.js.map