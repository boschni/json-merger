import Operation from "./Operation";

export default class RemoveOperation extends Operation {
  name() {
    return "remove";
  }

  processInObject(keyword: string, source: any, target?: any) {
    const keywordValue: RemoveKeywordValue = source[keyword];

    // Undefined values get stripped in the serialize step
    if (keywordValue === true) {
      return undefined;
    }

    // Return target if the remove value is not true
    return target;
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
    const keywordValue: RemoveKeywordValue = source[keyword];
    if (keywordValue === true) {
      resultArray.splice(resultArrayIndex, 1);
      resultArrayIndex--;
    }
    return { resultArray, resultArrayIndex };
  }
}

/*
 * TYPES
 */

export type RemoveKeywordValue = boolean;
