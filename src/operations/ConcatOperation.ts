import Operation from "./Operation";

export default class ConcatOperation extends Operation {

    name() {
        return "concat";
    }

    processInObject(keyword: string, source: any, target?: any) {
        const keywordValue: ConcatKeywordValue = source[keyword];
        const processedSource = this._processor.processSource(keywordValue);
        return [].concat(target, processedSource);
    }
}

/*
 * TYPES
 */

export type ConcatKeywordValue = any;
