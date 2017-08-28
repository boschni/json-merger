import Operation from "./Operation";

export default class MoveOperation extends Operation {

    name() {
        return "move";
    }

    processArrayItem(source: MoveOperationValue, _sourceArray: any[], sourceArrayIndex: number, resultArray: any[], _target: any[]) {
        // First remove the item from the result array
        const removedItem = resultArray.splice(sourceArrayIndex, 1)[0];

        // Then merge $move.value with the removed item
        const mergedItem = this._processor.processSourcePropertyInNewScope(source.value, "value", removedItem);

        // Calculate the index
        const index = source.index === "-" ? resultArray.length : source.index;

        // Then insert the merged item
        resultArray.splice(index, 0, mergedItem);

        return resultArray;
    }
}

/*
 * TYPES
 */

export interface MoveOperationValue {
    "index": number | "-"; // the index to move to, use '-' to append
    "value"?: any; // the optional value to merge the target item with
}
