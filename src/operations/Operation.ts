import Processor from "../Processor";

export default abstract class Operation {

    protected _processor: Processor;

    constructor(processor: Processor) {
        this._processor = processor;
    }

    abstract name(): string;

    process(_source: any, _target: any): any {
        return {};
    }

    processArrayItem(source: any, _sourceArray: any[], sourceArrayIndex: number, resultArray: any[], target: any[]): any[] {
        const targetArrayItem = Array.isArray(target) ? target[sourceArrayIndex] : undefined;
        resultArray[sourceArrayIndex] = this.process(source, targetArrayItem);
        return resultArray;
    }
}
