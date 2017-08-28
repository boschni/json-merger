import Operation from "./Operation";

export default class RemoveOperation extends Operation {

    name() {
        return "remove";
    }

    processInObject(keywordValue: RemoveKeywordValue, target?: any) {
        // Undefined values get stripped in the serialize step
        if (keywordValue === true) {
            return undefined;
        }

        // Return target if the remove value is not true
        return target;
    }

    processInArray(keywordValue: RemoveKeywordValue, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], resultArrayIndex: number, _target: any[]) {
        if (keywordValue === true) {
            resultArray.splice(resultArrayIndex, 1);
            resultArrayIndex--;
        }
        return {resultArray, resultArrayIndex};
    }
}

/*
 * TYPES
 */

export type RemoveKeywordValue = boolean;
