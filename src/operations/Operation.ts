import Processor from "../Processor";

export default abstract class Operation {
  protected _processor: Processor;

  constructor(processor: Processor) {
    this._processor = processor;
  }

  abstract name(): string;

  /**
   * @param _keyword The keyword. For example "$import".
   * @param _source The source object. For example {$import: "a.json"}.
   * @param _target The target value.
   * @returns The result
   */
  processInObject(_keyword: string, _source: any, _target: any): any {
    return {};
  }

  /**
   * @param keyword The keyword. For example "$import".
   * @param source The source object. For example {$import: "a.json"}.
   * @param _sourceArray The source array. For example [{$import: "a.json"}].
   * @param _sourceArrayIndex The source array index. For example 0.
   * @param resultArray The array to operate on. For example [{$import: "a.json"}].
   * @param resultArrayIndex The index to operate on. For example 0.
   * @param _target The target value.
   * @returns An object containing the new result array and the new result array index.
   */
  processInArray(
    keyword: string,
    source: any,
    _sourceArray: any[],
    _sourceArrayIndex: number,
    resultArray: any[],
    resultArrayIndex: number,
    _target: any[]
  ): ProcessArrayItemResult {
    resultArray[resultArrayIndex] = this.processInObject(
      keyword,
      source,
      resultArray[resultArrayIndex]
    );
    return { resultArray, resultArrayIndex };
  }
}

/*
 * TYPES
 */

export interface ProcessArrayItemResult {
  resultArray: any[];
  resultArrayIndex: number;
}
