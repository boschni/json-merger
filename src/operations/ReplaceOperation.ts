import Operation from "./Operation";

export default class ReplaceOperation extends Operation {

    name() {
        return "replace";
    }

    processInObject(keywordValue: ReplaceKeywordValue): any {
        return this._processor.processSourceInNewScope(keywordValue);
    }
}

/*
 * TYPES
 */

export type ReplaceKeywordValue = any;
