import Operation from "./Operation";

export default class AppendOperation extends Operation {

    keyword() {
        return "append";
    }

    processArrayItem(source: AppendOperationValue, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], _target: any[]) {
        const processedItem = this._processor.processSource(source);
        if (processedItem !== undefined) {
            resultArray.push(processedItem);
        }
        return resultArray;
    }
}

/*
 * TYPES
 */

export type AppendOperationValue = any;
