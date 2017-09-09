import * as safeEval from "safe-eval";
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
                input = this._processor.processSourceProperty(keywordValue.input, "input");
            }
        }

        // Return if no expression found
        if (!expression) {
            return;
        }

        // Create eval context
        const evalContext = {
            ...this._processor.currentScope.scopeVariables,
            $sourceProperty: keywordValue,
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

export type ExpressionKeywordValue = string // the expression
    | {
    "expression": string; // the expression
    "input"?: any; // value of the $input variable
};
