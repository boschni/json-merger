import Operation from "./Operation";
import {Phase} from "../Scope";

export default class ProcessOperation extends Operation {

    name() {
        return "process";
    }

    processInObject(keyword: string, source: any, target?: any) {
        const keywordValue: ProcessKeywordValue = source[keyword];

        if (typeof keywordValue.phase === "string" && keywordValue.phase !== this._processor.currentScope.phase) {
            this._processor.currentScope.executePhase(keywordValue.phase);
            return source;
        }

        // Process the $process property without a target
        return this._processor.processSource(keywordValue.value, target);
    }
}

/*
 * TYPES
 */

export type ProcessKeywordValue = {
    "phase"?: Phase,
    "value": any;
};
