import Operation from "./Operation";

export default class ProcessOperation extends Operation {

    name() {
        return "process";
    }

    processInObject(keyword: string, source: any, target?: any) {
        const keywordValue: ProcessKeywordValue = source[keyword];

        // Process the $process property without a target
        const processedProcessProperty = this._processor.processSourceInNewScope(keywordValue);

        // Process the processed $process property and use the original target as target
        return this._processor.processSourceInNewScope(processedProcessProperty, target);
    }
}

/*
 * TYPES
 */

export type ProcessKeywordValue = any;
