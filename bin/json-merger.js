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
    .option("-i, --operation-prefix [prefix]", "the operation prefix. Defaults to $")
    .option("--error-on-invalid-import", "throw an error if an import does not exist. Defaults to true")
    .parse(process.argv);

// construct config
var config = {
    operationPrefix: program.operationPrefix,
    stringify: program.pretty ? "pretty" : true,
    errorOnInvalidImport: program.errorOnInvalidImport
};

// merge the file(s)
var output = jsonMerger.mergeFiles(program.args, config);

// write to file or stdout
if (program.output) {
    fs.writeFileSync(program.output, output);
} else {
    console.log(output);
}
