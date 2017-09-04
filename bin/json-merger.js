#!/usr/bin/env node

var program = require("commander");
var fs = require("fs-extra");
var jsonMerger = require("../dist");
var packageJson = require("../package");

// parse process arguments
program
    .version(packageJson.version)
    .usage("[options] <file ...>")
    .option("-p, --pretty", "pretty-print the output json. Defaults to false")
    .option("-o, --output [file]", "the output file. Defaults to stdout")
    .option("-op, --operation-prefix [prefix]", "the operation prefix. Defaults to $")
    .option("--error-on-file-not-found", "throw an error if a file is not found. Defaults to true")
    .option("--error-on-ref-not-found", "throw an error if a JSON pointer or JSON path is not found. Defaults to true")
    .parse(process.argv);

// construct config
var config = {
    operationPrefix: program.operationPrefix,
    stringify: program.pretty ? "pretty" : true,
    errorOnFileNotFound: program.errorOnFileNotFound,
    errorOnRefNotFound: program.errorOnRefNotFound
};

// merge the file(s)
var output = jsonMerger.mergeFiles(program.args, config);

// write to file or stdout
if (program.output) {
    fs.outputFileSync(program.output, output);
} else {
    console.log(output);
}
