import jsonpath from "jsonpath";
import { JsonPointer } from "json-ptr";
import Operation from "./Operation";

export default class MatchOperation extends Operation {
  name() {
    return "match";
  }

  processInArray(
    keyword: string,
    source: any,
    sourceArray: any[],
    sourceArrayIndex: number,
    resultArray: any[],
    resultArrayIndex: number,
    target: any[]
  ) {
    const keywordValue: MatchKeywordValue = source[keyword];

    let matchedResultArrayIndex: number;

    // Handle $match.index
    if (keywordValue.index !== undefined) {
      matchedResultArrayIndex =
        keywordValue.index === "-"
          ? resultArray.length - 1
          : keywordValue.index;
    }

    // Handle $match.query
    else if (keywordValue.query !== undefined) {
      // Try to find a matching item in the result
      const path = jsonpath.paths(resultArray, keywordValue.query)[0];
      matchedResultArrayIndex =
        path !== undefined ? (path[1] as number) : undefined;
    }

    // Handle $match.path
    else if (keywordValue.path !== undefined) {
      // Try to find a matching item in the result
      if (JsonPointer.get(resultArray, keywordValue.path) !== undefined) {
        matchedResultArrayIndex = Number(
          JsonPointer.decode(keywordValue.path)[0]
        );
      }
    }

    // Ignore the item if no match found
    if (
      matchedResultArrayIndex === undefined ||
      resultArray[matchedResultArrayIndex] === undefined
    ) {
      return { resultArray, resultArrayIndex };
    }

    // Process result array item
    const result = this._processor.processArrayItem(
      keywordValue.value,
      sourceArray,
      sourceArrayIndex,
      resultArray,
      matchedResultArrayIndex,
      target
    );

    // Check if an array item has been inserted or removed below or at the current array item
    if (matchedResultArrayIndex <= resultArrayIndex) {
      resultArrayIndex += result.resultArrayIndex - matchedResultArrayIndex;
    }

    return { resultArray: result.resultArray, resultArrayIndex };
  }
}

/*
 * TYPES
 */

export interface MatchKeywordValue {
  index?: number | "-"; // the index to match against, use '-' to match on the last item
  path?: string; // the json pointer to match against
  query?: string; // the json path to match against
  value: any; // the operation or value to use if a match is found
}
