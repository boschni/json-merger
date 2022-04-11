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
  .option(
    "-op, --operation-prefix [prefix]",
    "the operation prefix. Defaults to $"
  )
  .option(
    "-am, --default-array-merge-operation [operation]",
    "the default array merge operation. Defaults to combine"
  )
  .option(
    "--error-on-file-not-found [value]",
    "throw an error if a file is not found. Defaults to true"
  )
  .option(
    "--error-on-ref-not-found [value]",
    "throw an error if a JSON pointer or JSON path is not found. Defaults to true"
  )
  .parse(process.argv);

var options = program.opts();

// construct config
var config = {
  operationPrefix: options.operationPrefix,
  stringify: options.pretty ? "pretty" : true,
  errorOnFileNotFound: options.errorOnFileNotFound !== "false",
  errorOnRefNotFound: options.errorOnRefNotFound !== "false",
  defaultArrayMergeOperation: options.defaultArrayMergeOperation,
};

// merge the file(s)
var output = jsonMerger.mergeFiles(program.args, config);

// write to file or stdout
if (options.output) {
  fs.outputFileSync(options.output, output);
} else {
  console.log(output);
}
