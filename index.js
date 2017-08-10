const Merger = require("./src/Merger");

function fromObject(value, config) {
    const merger = new Merger(config);
    return merger.fromObject(value);
}

function mergeObjects(values, config) {
    const merger = new Merger(config);
    return merger.mergeObjects(values);
}

function fromFile(file, config) {
    const merger = new Merger(config);
    return merger.fromFile(file);
}

function mergeFiles(files, config) {
    const merger = new Merger(config);
    return merger.mergeFiles(files);
}

module.exports = {
	fromObject,
    fromFile,
    mergeFiles,
    mergeObjects,
    Merger
};
