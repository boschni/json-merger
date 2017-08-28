import * as safeEval from "safe-eval";
import Operation from "./Operation";

export default class ExpressionOperation extends Operation {

    name() {
        return "expression";
    }

    process(source: ExpressionOperationValue, target?: any) {
        let input: any;
        let expression: string;

        // Get expression and input variable
        if (typeof source === "string") {
            expression = source;
        } else {
            if (typeof source.expression === "string") {
                expression = source.expression;
            }

            // process input if set
            if (source.input !== undefined) {
                input = this._processor.processSourcePropertyInNewScope(source.input, "input");
            }
        }

        // Return if no expression found
        if (!expression) {
            return;
        }

        // Create eval context
        const evalContext = {
            ...this._processor.currentScope.getScopeVariables(),
            $sourceProperty: source,
            $targetProperty: target,
            $input: input
        };

        // Evaluate the expression
        return safeEval(expression, evalContext);
    }
}

/*
 * TYPES
 */

export type ExpressionOperationValue = string // the expression
    | {
    "expression": string; // the expression
    "input"?: any; // value of the $input variable
};
