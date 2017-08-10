#!/usr/bin/env node

var program = require("commander");
var fs = require("fs");
var jsonMerger = require("../dist");
var packageJson = require("../package");

// parse process arguments
program
    .version(packageJson.version)
    .usage("[options] <file ...>")
    .option("-p, --pretty", "pretty-print the output json")
    .option("-o, --output [file]", "the output file. Defaults to stdout")
    .option("-t, --throw-on-invalid-ref", "throw if a $ref indicator is invalid. Defaults to false")
    .option("-i, --indicator-prefix [prefix]", "the indicator prefix. Defaults to $")
    .parse(process.argv);

// construct config
var config = {
    indicatorPrefix: program.indicatorPrefix,
    stringify: program.pretty ? "pretty" : true,
    throwOnInvalidRef: program.throwOnInvalidRef
};

// merge the file(s)
var output = jsonMerger.mergeFiles(program.args, config);

// write to file or stdout
if (program.output) {
    fs.writeFileSync(program.output, output);
} else {
    console.log(output);
}
