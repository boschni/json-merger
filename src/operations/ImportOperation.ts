import {isObject} from "../utils/types";
import Operation from "./Operation";

export default class ImportOperation extends Operation {

    name() {
        return "import";
    }

    processInObject(keyword: string, source: any, target?: any) {
        const keywordValue: ImportKeywordValue = source[keyword];

        // Make sure we have an array of import values
        const importValues: ImportKeywordValue[] = Array.isArray(keywordValue) ? keywordValue : [keywordValue];

        // Process and merge sources
        const importResult = importValues.reduce((result: any, importValue) => {

            // Is the Import a file reference?
            if (typeof importValue === "string") {
                return this._processor.loadAndProcessFileByRef(importValue, result);
            }

            // Ignore if no path is found
            if (typeof importValue.path !== "string") {
                return result;
            }

            // Import processed
            let scopeVariables: any;

            // Process the params property if set
            if (isObject(importValue.params)) {
                scopeVariables = {};
                scopeVariables.$params = this._processor.processSourceProperty(importValue.params, "params");
            }

            // process the file
            return this._processor.loadAndProcessFileByRef(importValue.path, result, scopeVariables);
        }, undefined);

        // Merge with the target
        return this._processor.processSource(importResult, target);
    }
}

/*
 * TYPES
 */

export type ImportKeywordValue = string // the path to the file to import
    | {
    path: string; // the path to the file to import
    params?: any; // the params to pass to the file
};
