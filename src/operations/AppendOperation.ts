import Operation from "./Operation";

export default class AppendOperation extends Operation {

    name() {
        return "append";
    }

    processInArray(keywordValue: AppendKeywordValue, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], resultArrayIndex: number, _target: any[]) {
        const processedItem = this._processor.processSource(keywordValue);
        if (processedItem !== undefined) {
            resultArray.push(processedItem);
        }
        return {resultArray, resultArrayIndex};
    }
}

/*
 * TYPES
 */

export type AppendKeywordValue = any;
