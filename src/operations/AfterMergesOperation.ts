import Operation from "./Operation";
import { Phase } from "../Scope";

export default class AfterMergesOperation extends Operation {
  name() {
    return "afterMerges";
  }

  processInObject(keyword: string, source: any, target?: any) {
    if (this._processor.currentScope.phase !== Phase.AfterMerges) {
      this._processor.currentScope.registerPhase(Phase.AfterMerges);
      return source;
    }

    const keywordValue: AfterMergesKeywordValue = source[keyword];

    // Process the $process property without a target
    return this._processor.processSource(keywordValue, target);
  }
}

/*
 * TYPES
 */

export type AfterMergesKeywordValue = any;
