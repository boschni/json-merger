import Operation from "./Operation";

export default class ReplaceOperation extends Operation {

    keyword() {
        return "replace";
    }

    process(source: ReplaceOperationValue): any {
        return this._processor.processSourceInNewScope(source);
    }
}

/*
 * TYPES
 */

export type ReplaceOperationValue = any;
