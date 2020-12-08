import Operation from "./Operation";
import { Phase } from "../Scope";

export default class AfterMergeOperation extends Operation {
  name() {
    return "afterMerge";
  }

  processInObject(keyword: string, source: any, target?: any) {
    if (this._processor.currentScope.phase !== Phase.AfterMerge) {
      this._processor.currentScope.registerPhase(Phase.AfterMerge);
      return source;
    }

    const keywordValue: AfterMergeKeywordValue = source[keyword];

    // Process the $process property without a target
    return this._processor.processSource(keywordValue, target);
  }
}

/*
 * TYPES
 */

export type AfterMergeKeywordValue = any;
