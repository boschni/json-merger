import Operation from "./Operation";

export default class ProcessOperation extends Operation {

    keyword() {
        return "process";
    }

    process(source: ProcessValue, target?: any): any {
        // Process the $process property without a target
        const processedProcessProperty = this._processor.processSourceInNewScope(source);

        // Process the processed $process property and use the original target as target
        return this._processor.processSourceInNewScope(processedProcessProperty, target);
    }
}

/*
 * TYPES
 */

export type ProcessValue = any;
