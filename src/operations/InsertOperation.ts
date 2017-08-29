import Operation from "./Operation";

export default class InsertOperation extends Operation {

    name() {
        return "insert";
    }

    processInArray(keyword: string, source: any, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], resultArrayIndex: number, _target: any[]) {
        const keywordValue: InsertKeywordValue = source[keyword];
        const item = this._processor.processSourcePropertyInNewScope(keywordValue.value, "value");
        const index = keywordValue.index === "-" ? resultArray.length : keywordValue.index;
        resultArray.splice(index, 0, item);
        resultArrayIndex = index <= resultArrayIndex ? resultArrayIndex + 1 : resultArrayIndex;
        return {resultArray, resultArrayIndex};
    }
}

/*
 * TYPES
 */

export interface InsertKeywordValue {
    "index": number | "-"; // the index to insert at, use '-' to append
    "value": any; // the value to insert
}
