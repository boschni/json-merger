import Processor from "../Processor";

export default abstract class Operation {

    protected _processor: Processor;

    constructor(processor: Processor) {
        this._processor = processor;
    }

    abstract name(): string;

    processInObject(_keywordValue: any, _target: any): any {
        return {};
    }

    processInArray(keywordValue: any, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], resultArrayIndex: number, _target: any[]): ProcessArrayItemResult {
        resultArray[resultArrayIndex] = this.processInObject(keywordValue, resultArray[resultArrayIndex]);
        return {resultArray, resultArrayIndex};
    }
}

/*
 * TYPES
 */

export interface ProcessArrayItemResult {
    resultArray: any[],
    resultArrayIndex: number;
}
