const ArrayMergeOperations: ArrayMergeOperation[] = [
  "combine",
  "replace",
  "concat",
];
export type ArrayMergeOperation = "combine" | "replace" | "concat";

export default class Config implements IConfig {
  cwd: string;
  errorOnFileNotFound: boolean;
  errorOnRefNotFound: boolean;
  operationPrefix: string;
  params: any;
  stringify: boolean | "pretty";
  defaultArrayMergeOperation: ArrayMergeOperation;

  constructor(config?: Partial<IConfig>) {
    this.set(config);
  }

  set(config?: Partial<IConfig>) {
    config = config || {};
    this.cwd = typeof config.cwd === "string" ? config.cwd : "";
    this.errorOnFileNotFound = config.errorOnFileNotFound !== false;
    this.errorOnRefNotFound = config.errorOnRefNotFound !== false;
    this.operationPrefix =
      typeof config.operationPrefix === "string" ? config.operationPrefix : "$";
    this.params = config.params;
    this.stringify =
      config.stringify === true || config.stringify === "pretty"
        ? config.stringify
        : false;
    this.defaultArrayMergeOperation = ArrayMergeOperations.includes(
      config.defaultArrayMergeOperation
    )
      ? config.defaultArrayMergeOperation
      : "combine";
  }
}

export interface IConfig {
  cwd: string; // the current working directory in which to search. Defaults to process.cwd().
  errorOnFileNotFound: boolean; // should we throw an error if a file does not exist?
  errorOnRefNotFound: boolean; // should we throw an error if a JSON pointer or JSON path returns undefined?
  operationPrefix: string; // the prefix to indicate a property is an operation like $import.
  params: any; // object containing parameters available as $params in $expression operations.
  stringify: boolean | "pretty"; // should the output be stringified?
  defaultArrayMergeOperation: ArrayMergeOperation; // default array operation which will be applied to merge arrays.
}
