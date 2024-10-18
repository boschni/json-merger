import Operation from "./Operation";

export default class PrependOperation extends Operation {
  name() {
    return "prepend";
  }

  processInArray(
    keyword: string,
    source: any,
    _sourceArray: any[],
    _sourceArrayIndex: number,
    resultArray: any[],
    resultArrayIndex: number,
    _target: any[],
  ) {
    const keywordValue: PrependKeywordValue = source[keyword];
    const processedItem = this._processor.processSource(keywordValue);
    if (processedItem !== undefined) {
      resultArray.unshift(processedItem);
      resultArrayIndex++;
    }
    return { resultArray, resultArrayIndex };
  }
}

/*
 * TYPES
 */

export type PrependKeywordValue = any;
