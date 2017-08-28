import Operation from "./Operation";

export default class SelectOperation extends Operation {

    name() {
        return "select";
    }

    processInObject(keywordValue: SelectKeywordValue, target?: any): any {
        // Determine the select context
        let selectContext;

        if (keywordValue.from !== undefined) {
            selectContext = this._processor.processSourcePropertyInNewScope(keywordValue.from, "from");
        } else {
            selectContext = this._processor.currentScope.target;
        }

        let value;

        // Select based on JSON pointer or JSON path
        if (typeof keywordValue.path === "string") {
            value = this._processor.resolveJsonPointer(selectContext, keywordValue.path);
        } else if (typeof keywordValue.query === "string") {
            value = this._processor.resolveJsonPath(selectContext, keywordValue.query);
            if (keywordValue.multiple !== true) {
                value = value[0];
            }
        }

        // Merge with the target
        return this._processor.processSourceInNewScope(value, target);
    }
}

/*
 * TYPES
 */

export interface SelectKeywordValue {
    "from"?: any; // select context
    "multiple"?: boolean; // expect multiple results?
    "path"?: string; // json pointer
    "query"?: string; // json path
}

