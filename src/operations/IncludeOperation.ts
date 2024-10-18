import Operation, { ProcessArrayItemResult } from "./Operation";

export default class IncludeOperation extends Operation {
  name() {
    return "include";
  }

  processInObject(keyword: string, source: any, target?: any) {
    const keywordValue: IncludeKeywordValue = source[keyword];

    // Load file content
    const result = this._processor.loadFileByRef(keywordValue);

    // Process content
    return this._processor.processSource(result, target);
  }

  processInArray(
    keyword: string,
    source: any,
    sourceArray: any[],
    sourceArrayIndex: number,
    resultArray: any[],
    resultArrayIndex: number,
    target: any[],
  ): ProcessArrayItemResult {
    const keywordValue: IncludeKeywordValue = source[keyword];

    // Load file content
    const content = this._processor.loadFileByRef(keywordValue);

    // Process result array item
    return this._processor.processArrayItem(
      content,
      sourceArray,
      sourceArrayIndex,
      resultArray,
      resultArrayIndex,
      target,
    );
  }
}

/*
 * TYPES
 */

export type IncludeKeywordValue = string; // the path to the file to include
