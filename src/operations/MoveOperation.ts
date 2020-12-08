import Operation from "./Operation";

export default class MoveOperation extends Operation {
  name() {
    return "move";
  }

  processInArray(
    keyword: string,
    source: any,
    _sourceArray: any[],
    _sourceArrayIndex: number,
    resultArray: any[],
    resultArrayIndex: number,
    _target: any[]
  ) {
    const keywordValue: MoveKeywordValue = source[keyword];

    // First remove the item from the result array
    let item = resultArray.splice(resultArrayIndex, 1)[0];
    resultArrayIndex--;

    let index: IndexValue;

    if (typeof keywordValue === "number" || keywordValue === "-") {
      index = keywordValue;
    } else {
      index = keywordValue.index;

      // Merge $move.value with the item?
      if (keywordValue.value !== undefined) {
        item = this._processor.processSourceProperty(
          keywordValue.value,
          "value",
          item
        );
      }
    }

    // Check if the index should be the last item
    if (index === "-") {
      index = resultArray.length;
    }

    // Then insert the item at the given index
    resultArray.splice(index, 0, item);
    resultArrayIndex =
      index <= resultArrayIndex ? resultArrayIndex + 1 : resultArrayIndex;

    return { resultArray, resultArrayIndex };
  }
}

/*
 * TYPES
 */

export type MoveKeywordValue =
  | IndexValue
  | {
      index: IndexValue;
      value?: any; // the optional value to merge the target item with
    };

export type IndexValue = number | "-"; // the index to move to, use '-' to append
