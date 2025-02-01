const ArrayMergeOperations: ArrayMergeOperation[] = [
  "combine",
  "replace",
  "concat",
];

export type ArrayMergeOperation = "combine" | "replace" | "concat";

export default class Config implements IConfig {
  cwd: string;
  enableExpressionOperation: boolean;
  errorOnFileNotFound: boolean;
  errorOnRefNotFound: boolean;
  operationPrefix: string;
  params: any;
  stringify: boolean | "pretty";
  defaultArrayMergeOperation: ArrayMergeOperation;
  prettyPrintIndenting: number | "\t";

  constructor(config?: Partial<IConfig>) {
    this.set(config);
  }

  set(config?: Partial<IConfig>) {
    config = config || {};
    this.cwd = typeof config.cwd === "string" ? config.cwd : "";
    this.errorOnFileNotFound = config.errorOnFileNotFound !== false;
    this.errorOnRefNotFound = config.errorOnRefNotFound !== false;
    this.enableExpressionOperation = config.enableExpressionOperation === true;
    this.operationPrefix =
      typeof config.operationPrefix === "string" ? config.operationPrefix : "$";
    this.params = config.params;
    this.stringify =
      config.stringify === true || config.stringify === "pretty"
        ? config.stringify
        : false;
    this.defaultArrayMergeOperation =
      ArrayMergeOperations.indexOf(config.defaultArrayMergeOperation) !== -1
        ? config.defaultArrayMergeOperation
        : "combine";
    this.prettyPrintIndenting = config.prettyPrintIndenting ?? "\t";
  }
}

export interface IConfig {
  /**
   * The current working directory in which to search. Defaults to process.cwd().
   */
  cwd: string;
  /**
   * Indicates if an error should be throw if a file does not exist.
   */
  errorOnFileNotFound: boolean;
  /**
   * Indicates if an error should be throw if a JSON pointer or JSON path returns undefined.
   */
  errorOnRefNotFound: boolean;
  /**
   * The prefix to indicate a property is an operation like $import.
   */
  operationPrefix: string;
  /**
   * Enables the expression operation. Do not use it to run untrusted code because it uses the node:vm module. Defaults to false",
   */
  enableExpressionOperation: boolean;
  /**
   * Object containing parameters available as $params in $expression operations.
   */
  params: any;
  /**
   * Indicates if the output should be stringified.
   */
  stringify: boolean | "pretty";
  /**
   * Default array operation which will be applied to merge arrays.
   */
  defaultArrayMergeOperation: ArrayMergeOperation;
  /**
   * Indicate if the output should indent with spaces or tab character when json is prettified
   */
  prettyPrintIndenting: number | "\t"
}
