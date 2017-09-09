import range = require("lodash.range");
import Operation from "./Operation";
import {isObject} from "../utils/types";

export default class RepeatOperation extends Operation {

    name() {
        return "repeat";
    }

    processInObject(keyword: string, source: any, target?: any) {
        const keywordValue: RepeatKeywordValue = source[keyword];

        let result;
        let step = 1;
        let values: {key?: number | string, value: any}[] = [];

        // Handle $repeat.step
        if (typeof keywordValue.step === "number") {
            step = keywordValue.step;
        }

        // Handle $repeat.from
        if (typeof keywordValue.from === "number") {
            let from = keywordValue.from;
            let to = from + 1;

            if (typeof keywordValue.to === "number") {
                to = keywordValue.to;
            } else if (typeof keywordValue.through === "number") {
                to = keywordValue.through;
                to = to > 0 ? to + 1 : to - 1;
            }

            const normStep = to < from ? -Math.abs(step) : Math.abs(step);
            values = range(from, to, normStep).map(i => ({value: i}));
        }

        // Handle $repeat.range
        else if (typeof keywordValue.range === "string") {
            // replace comma's with spaces, remove double spaces and split by space
            const items = keywordValue.range.replace(/,/g, " ").replace(/\s+/g, " ").split(" ");

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
        else if (keywordValue.in !== undefined) {
            // Process in property
            const processedIn = this._processor.processSourceProperty(keywordValue.in, "in");

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
            return this._processor.processSourcePropertyInNewScope(keywordValue.value, "value", undefined, scopeVariables);
        });

        // Process repeat result and use the original target as target but do not process operations
        this._processor.disableOperations();
        result = this._processor.processSource(repeatResult, target);
        this._processor.enableOperations();

        return result;
    }
}

/*
 * TYPES
 */

export interface RepeatKeywordValue {
    "from"?: number; // index start
    "in"?: object | any[]; // object or array to iterate over
    "range"?: string; // the range in format "1 2:10 11:100, 200:300, 400"
    "step"?: number; // step interval
    "through"?: number; // including index end
    "to"?: number; // excluding index end
    "value": any; // the value to repeat
}
