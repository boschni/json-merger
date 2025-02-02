#!/usr/bin/env node

var { program } = require("commander");
var fs = require("fs-extra");
var jsonMerger = require("../dist");
var packageJson = require("../package");

// parse process arguments
program
  .version(packageJson.version)
  .usage("[options] <file...>")
  .argument("<file...>", "files to merge")
  .option("-p, --pretty", "pretty-print the output json. Defaults to false")
  .option("-o, --output <file>", "the output file. Defaults to stdout")
  .option(
    "--op, --operation-prefix <prefix>",
    "the operation prefix. Defaults to $",
  )
  .option(
    "--am, --default-array-merge-operation <operation>",
    "the default array merge operation. Defaults to combine",
  )
  .option(
    "-s, --spaces <value>",
    "Use number of spaces instead of tab when pretty-printing json.",
  )
  .option(
    "--error-on-file-not-found <value>",
    "throw an error if a file is not found. Defaults to true",
  )
  .option(
    "--error-on-ref-not-found <value>",
    "throw an error if a JSON pointer or JSON path is not found. Defaults to true",
  )
  .option(
    "--enable-expression-operation <value>",
    "Enables expressions. Do not use it to run untrusted code because it uses the node:vm module. Defaults to false",
  )
  .parse(process.argv);

var options = program.opts();

// Custom options parsing
var spaces = parseInt(options.spaces);

// construct config
var config = {
  operationPrefix: options.operationPrefix,
  stringify: options.pretty ? "pretty" : true,
  errorOnFileNotFound: options.errorOnFileNotFound !== "false",
  errorOnRefNotFound: options.errorOnRefNotFound !== "false",
  defaultArrayMergeOperation: options.defaultArrayMergeOperation,
  enableExpressionOperation: options.enableExpressionOperation === "true",
  spaces: isNaN(spaces) ? undefined : spaces,
};

// merge the file(s)
var output = jsonMerger.mergeFiles(program.args, config);

// write to file or stdout
if (options.output) {
  fs.outputFileSync(options.output, output);
} else {
  console.log(output);
}
