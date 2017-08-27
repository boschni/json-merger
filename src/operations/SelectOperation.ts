import Operation from "./Operation";

export default class SelectOperation extends Operation {

    keyword() {
        return "select";
    }

    process(source: SelectOperationValue, target?: any): any {
        // Determine the select context
        let selectContext;

        if (source.from !== undefined) {
            selectContext = this._processor.processSourcePropertyInNewScope(source.from, "from");
        } else {
            selectContext = this._processor.currentScope.target;
        }

        let value;

        // Select based on JSON pointer or JSON path
        if (typeof source.path === "string") {
            value = this._processor.resolveJsonPointer(selectContext, source.path);
        } else if (typeof source.query === "string") {
            value = this._processor.resolveJsonPath(selectContext, source.query);
            if (source.multiple !== true) {
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

export interface SelectOperationValue {
    "from"?: any; // select context
    "multiple"?: boolean; // expect multiple results?
    "path"?: string; // json pointer
    "query"?: string; // json path
}

