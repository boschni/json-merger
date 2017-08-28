import Operation from "./Operation";

export default class RemoveOperation extends Operation {

    name() {
        return "remove";
    }

    process(source: RemoveOperationValue, target?: any) {
        // Undefined values get stripped in the serialize step
        if (source === true) {
            return undefined;
        }

        // Return target if the remove value is not true
        return target;
    }

    processArrayItem(source: RemoveOperationValue, _sourceArray: any[], sourceArrayIndex: number, resultArray: any[], _target: any[]) {
        if (source === true) {
            resultArray.splice(sourceArrayIndex, 1);
        }
        return resultArray;
    }
}

/*
 * TYPES
 */

export type RemoveOperationValue = boolean;
