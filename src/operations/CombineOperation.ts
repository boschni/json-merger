import Operation from "./Operation";

export default class CombineOperation extends Operation {
  name() {
    return "combine";
  }

  processInObject(keyword: string, source: any, target?: any) {
    const keywordValue: CombineKeywordValue = source[keyword];
    return this._processor.processSource(keywordValue, target);
  }
}

/*
 * TYPES
 */

export type CombineKeywordValue = any;
