import Operation from "./Operation";

export default class PrependOperation extends Operation {

    keyword() {
        return "prepend";
    }

    processArrayItem(source: PrependOperationValue, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], _target: any[]) {
        const processedItem = this._processor.processSource(source);
        if (processedItem !== undefined) {
            resultArray.unshift(processedItem);
        }
        return resultArray;
    }
}

/*
 * TYPES
 */

export type PrependOperationValue = any;
