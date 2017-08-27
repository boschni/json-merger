import range = require("lodash.range");
import Operation from "./Operation";
import {isObject} from "../utils/types";

export default class RepeatOperation extends Operation {

    keyword() {
        return "repeat";
    }

    process(source: RepeatOperationValue, target?: any): any {
        let result;

        let step = 1;
        let values: {key?: number | string, value: any}[] = [];

        // Handle $repeat.step
        if (typeof source.step === "number") {
            step = source.step;
        }

        // Handle $repeat.from
        if (typeof source.from === "number") {
            let from = source.from;
            let to = from + 1;

            if (typeof source.to === "number") {
                to = source.to;
            } else if (typeof source.through === "number") {
                to = source.through;
                to = to > 0 ? to + 1 : to - 1;
            }

            const normStep = to < from ? -Math.abs(step) : Math.abs(step);
            values = range(from, to, normStep).map(i => ({value: i}));
        }

        // Handle $repeat.range
        else if (typeof source.range === "string") {
            // replace comma's with spaces, remove double spaces and split by space
            const items = source.range.replace(/,/g, " ").replace(/\s+/g, " ").split(" ");

            items.forEach(item => {
                const split = item.split(":");
                let itemFrom = Number(split[0]);
                let itemTo = Number(split[1]);
                let itemStep = Number(split[2]);

                if (isNaN(itemFrom)) {
                    return;
                }

                if (isNaN(itemStep)) {
                    itemStep = step;
                }

                if (isNaN(itemTo)) {
                    itemTo = itemFrom;
                }

                itemTo = itemTo > 0 ? itemTo + 1 : itemTo - 1;
                itemStep = itemTo < itemFrom ? -Math.abs(itemStep) : Math.abs(itemStep);
                range(itemFrom, itemTo, itemStep).forEach(i => values.push({value: i}));
            });
        }

        // Handle $repeat.in
        else if (source.in !== undefined) {
            // Process in property
            const processedIn = this._processor.processSourcePropertyInNewScope(source.in, "in");

            // Handle array
            if (Array.isArray(processedIn)) {
                values = processedIn.map(value => ({value}));
            }

            // Handle object
            else if (isObject(processedIn)) {
                const obj = processedIn as any;
                values = Object.keys(obj).map(key => ({key, value: obj[key]}));
            }
        }

        // generate the repeated array
        const repeatResult = values.map((value, index) => {
            // add $repeat variable to the scope
            const scopeVariables = {
                $repeat: {
                    index,
                    key: value.key !== undefined ? value.key : index,
                    value: value.value
                }
            };

            // Process the value property without a target
            return this._processor.processSourceInNewScope(source.value, undefined, scopeVariables);
        });

        // Process repeat result and use the original target as target but do not process operations
        this._processor.disableKeywordOperations();
        result = this._processor.processSource(repeatResult, target);
        this._processor.enableKeywordOperations();

        return result;
    }
}

/*
 * TYPES
 */

export interface RepeatOperationValue {
    "from"?: number; // index start
    "in"?: object | any[]; // object or array to iterate over
    "range"?: string; // the range in format "1 2:10 11:100, 200:300, 400"
    "step"?: number; // step interval
    "through"?: number; // including index end
    "to"?: number; // excluding index end
    "value": any; // the value to repeat
}
