import Operation from "./Operation";

export default class ReplaceOperation extends Operation {
  name() {
    return "replace";
  }

  processInObject(keyword: string, source: any, _target?: any) {
    const keywordValue: ReplaceKeywordValue = source[keyword];
    return this._processor.processSource(keywordValue);
  }
}

/*
 * TYPES
 */

export type ReplaceKeywordValue = any;
