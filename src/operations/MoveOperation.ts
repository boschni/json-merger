import Operation from "./Operation";

export default class MoveOperation extends Operation {

    name() {
        return "move";
    }

    processInArray(keywordValue: MoveKeywordValue, _sourceArray: any[], _sourceArrayIndex: number, resultArray: any[], resultArrayIndex: number, _target: any[]) {
        // First remove the item from the result array
        const removedItem = resultArray.splice(resultArrayIndex, 1)[0];
        resultArrayIndex--;

        // Then merge $move.value with the removed item
        const mergedItem = this._processor.processSourcePropertyInNewScope(keywordValue.value, "value", removedItem);

        // Calculate the index
        const index = keywordValue.index === "-" ? resultArray.length : keywordValue.index;

        // Then insert the merged item
        resultArray.splice(index, 0, mergedItem);
        resultArrayIndex = index <= resultArrayIndex ? resultArrayIndex + 1 : resultArrayIndex;

        return {resultArray, resultArrayIndex};
    }
}

/*
 * TYPES
 */

export interface MoveKeywordValue {
    "index": number | "-"; // the index to move to, use '-' to append
    "value"?: any; // the optional value to merge the target item with
}
