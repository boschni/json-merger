import Operation from "./Operation";

export default class InsertOperation extends Operation {

    keyword() {
        return "insert";
    }

    processArrayItem(source: InsertOperationValue, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], _target: any[]) {
        const item = this._processor.processSourcePropertyInNewScope(source.value, "value");
        const index = source.index === "-" ? resultArray.length : source.index;
        resultArray.splice(index, 0, item);
        return resultArray;
    }
}

/*
 * TYPES
 */

export interface InsertOperationValue {
    "index": number | "-"; // the index to insert at, use '-' to append
    "value": any; // the value to insert
}
