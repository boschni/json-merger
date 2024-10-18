import vm from "vm";
import Operation from "./Operation";

export default class ExpressionOperation extends Operation {
  name() {
    return "expression";
  }

  processInObject(keyword: string, source: any, target?: any) {
    const keywordValue: ExpressionKeywordValue = source[keyword];

    let input: any;
    let expression: string;

    // Get expression and input variable
    if (typeof keywordValue === "string") {
      expression = keywordValue;
    } else {
      if (typeof keywordValue.expression === "string") {
        expression = keywordValue.expression;
      }

      // process input if set
      if (keywordValue.input !== undefined) {
        input = this._processor.processSourceProperty(
          keywordValue.input,
          "input"
        );
      }
    }

    // Return if no expression found
    if (!expression) {
      return;
    }

    // Define global object VM
    const sandbox = {
      ...this._processor.currentScope.scopeVariables,
      $sourceProperty: keywordValue,
      $targetProperty: target,
      $input: input,
    };

    // Create context
    const context = vm.createContext(sandbox);

    // Evaluate the expression
    return vm.runInContext(`eval("${expression}");`, context);
  }
}

/*
 * TYPES
 */

export type ExpressionKeywordValue =
  | string // the expression
  | {
      expression: string; // the expression
      input?: any; // value of the $input variable
    };
