import * as jsonpath from "jsonpath";
import * as jsonPtr from "json-ptr";
import Operation from "./Operation";

export default class MatchOperation extends Operation {

    keyword() {
        return "match";
    }

    processArrayItem(source: MatchOperationValue, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], _target: any[]) {
        let resultItemIndex: number;

        // Handle $match.index
        if (source.index !== undefined) {
            resultItemIndex = source.index === "-" ? resultArray.length - 1 : source.index;
        }

        // Handle $match.query
        else if (source.query !== undefined) {
            // Try to find a matching item in the result
            const path = jsonpath.paths(resultArray, source.query)[0];
            resultItemIndex = path !== undefined ? path[1] as number : undefined;
        }

        // Handle $match.path
        else if (source.path !== undefined) {
            // Try to find a matching item in the result
            if (jsonPtr.get(resultArray, source.path) !== undefined) {
                [resultItemIndex] = jsonPtr.decodePointer(source.path)[0];
            }
        }

        // Ignore the item if no match found
        if (resultItemIndex === undefined || resultArray[resultItemIndex] === undefined) {
            return resultArray;
        }

        // Process result array item
        return this._processor.processArrayItem(source.value, resultArray, resultItemIndex, resultArray, resultArray);
    }
}

/*
 * TYPES
 */

export interface MatchOperationValue {
    "index"?: number | "-"; // the index to match against, use '-' to match on the last item
    "path"?: string; // the json pointer to match against
    "query"?: string; // the json path to match against
    "value": any; // the operation or value to use if a match is found
}
