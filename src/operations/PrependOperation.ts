import Operation from "./Operation";

export default class PrependOperation extends Operation {

    name() {
        return "prepend";
    }

    processInArray(keywordValue: PrependKeywordValue, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], resultArrayIndex: number, _target: any[]) {
        const processedItem = this._processor.processSource(keywordValue);
        if (processedItem !== undefined) {
            resultArray.unshift(processedItem);
            resultArrayIndex++;
        }
        return {resultArray, resultArrayIndex};
    }
}

/*
 * TYPES
 */

export type PrependKeywordValue = any;
