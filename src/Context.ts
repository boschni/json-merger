import * as path from "path";
import {NormalizedConfig} from "./config";

export default class Context {

    currentSource?: Source;
    sourceStack: Source[] = [];

    private config: NormalizedConfig;
    private operationTypeValues: number[];
    private operationTypeIndicatorMap: OperationTypeIndicatorMap;
    private indicatorOperationTypeMap: IndicatorOperationTypeMap;
    private operationsEnabled = true;

    constructor(config: NormalizedConfig) {
        this.config = config;
        this.operationTypeValues = this._getOperationTypeValues();
        this.operationTypeIndicatorMap = this._getOperationTypeIndicatorMap(this.config.operationPrefix);
        this.indicatorOperationTypeMap = this._getIndicatorOperationTypeMap(this.operationTypeIndicatorMap);
    }

    private _getOperationTypeValues(): number[] {
        return Object.keys(OperationType)
            .map(key => OperationType[key as any])
            .filter(value => typeof value === "number") as any as number[];
    }

    private _getOperationTypeIndicatorMap(prefix: string): OperationTypeIndicatorMap {
        return Object.keys(OperationType)
            .filter(key => typeof key === "string")
            .reduce((result, key) => {
                result[OperationType[key as any] as any] = prefix + key.toLowerCase();
                return result;
            }, {} as OperationTypeIndicatorMap);
    }

    private _getIndicatorOperationTypeMap(obj: OperationTypeIndicatorMap): IndicatorOperationTypeMap {
        return Object.keys(obj)
            .reduce((result, key) => {
                result[obj[Number(key)]] = Number(key);
                return result;
            }, {} as IndicatorOperationTypeMap);
    }

    getOperation(source: any): Operation | undefined {
        if (source === undefined || !this.operationsEnabled) {
            return;
        }
        for (let i = 0; i < this.operationTypeValues.length; i++) {
            const type = this.operationTypeValues[i];
            const indicator = this.operationTypeIndicatorMap[type];
            const value = source[indicator];
            if (value !== undefined) {
                return {indicator, type, source, value};
            }
        }
    }

    getTargetPropertyName(sourcePropertyName: string): string | undefined {
        const indicator = sourcePropertyName.substr(1);
        if (this.indicatorOperationTypeMap[indicator] !== undefined) {
            return indicator;
        }
        if (indicator === "comment") {
            return;
        }
        return sourcePropertyName;
    }

    enableOperations() {
        this.operationsEnabled = true;
    }

    disableOperations() {
        this.operationsEnabled = false;
    }

    resolveFilePath(filePath: string): string {
        const currentFilePath = this.currentSource !== undefined && this.currentSource.filePath;
        const cwd = typeof currentFilePath === "string" ? path.dirname(currentFilePath) : this.config.cwd;
        return path.resolve(cwd, filePath);
    }

    enterSource(filePath?: string, sourceRoot?: any, targetRoot?: any) {
        if (this.currentSource) {
            filePath = filePath !== undefined ? filePath : this.currentSource.filePath;
            targetRoot = targetRoot !== undefined ? targetRoot : this.currentSource.targetRoot;
            sourceRoot = sourceRoot !== undefined ? sourceRoot : this.currentSource.sourceRoot;
        }
        this.currentSource = {filePath, path: [], targetRoot, sourceRoot};
        this.sourceStack.push(this.currentSource);
    }

    leaveSource() {
        this.sourceStack.pop();
        this.currentSource = this.sourceStack[this.sourceStack.length - 1];
    }

    enterProperty(propertyName?: string | number) {
        if (propertyName !== undefined) {
            this.currentSource.path.push(propertyName);
        }
    }

    leaveProperty() {
        this.currentSource.path.pop();
    }
}

/*
 * TYPES
 */

export enum OperationType {
    Append,
    Expression,
    Import,
    Insert,
    Match,
    Merge,
    Move,
    Prepend,
    Process,
    Remove,
    Replace,
    Select
}

interface OperationTypeIndicatorMap {
    [operationType: number]: string;
}

interface IndicatorOperationTypeMap {
    [indicator: string]: number;
}

/*
 * OPERATIONS
 */

export interface OperationBase<T> {
    indicator: string;
    source: {
        [indicator: string]: T
    };
}

export interface ImportOperation extends OperationBase<ImportOperation> {
    type: OperationType.Import;
    value: ImportOperationValue | ImportOperationValue[];
}

export type ImportOperationValue = string // the path to the file to import
    | {
    "path": string; // the path to the file to import
    "process": boolean; // indicates if the file should be processed
};

export interface RemoveOperation extends OperationBase<RemoveOperation> {
    type: OperationType.Remove;
    value: boolean; // indicates if the property should be removed
}

export interface ProcessOperation extends OperationBase<ProcessOperation> {
    type: OperationType.Process;
    value: any; // the value to process
}

export interface ExpressionOperation extends OperationBase<ExpressionOperation> {
    type: OperationType.Expression;
    value: string; // the expression
}

export interface MergeOperation extends OperationBase<MergeOperation> {
    type: OperationType.Merge;
    value: MergeOperationValue;
}

export interface MergeOperationValue {
    "source": any; // the value to merge
    "with": any; // the value to merge with
}

export interface ReplaceOperation extends OperationBase<ReplaceOperation> {
    type: OperationType.Replace;
    value: any; // the value to replace the target with
}

export interface AppendOperation extends OperationBase<AppendOperation> {
    type: OperationType.Append;
    value: any; // the value to append
}

export interface PrependOperation extends OperationBase<PrependOperation> {
    type: OperationType.Prepend;
    value: any; // the value to prepend
}

export interface InsertOperation extends OperationBase<InsertOperation> {
    type: OperationType.Insert;
    value: InsertOperationValue;
}

export interface InsertOperationValue {
    "index": number | "-"; // the index to insert at, use '-' to append
    "value": any; // the value to insert
}

export interface MoveOperation extends OperationBase<MoveOperation> {
    type: OperationType.Move;
    value: MoveOperationValue;
}

export interface MoveOperationValue {
    "index": number | "-"; // the index to move to, use '-' to append
    "value"?: any; // the optional value to merge the target item with
}

export interface MatchOperation extends OperationBase<MatchOperation> {
    type: OperationType.Match;
    value: MatchOperationValue;
}

export interface MatchOperationValue {
    "index"?: number | "-"; // the index to match against, use '-' to match on the last item
    "path"?: string; // the json pointer to match against
    "query"?: string; // the json path to match against
    "value": any; // the operation or value to use if a match is found
}

export interface SelectOperation extends OperationBase<SelectOperation> {
    type: OperationType.Select;
    value: SelectOperationValue;
}

export interface SelectOperationValue {
    "from"?: "target" | "targetRoot" | "source" | "sourceRoot" | any; // select context
    "multiple"?: boolean; // expect multiple results?
    "path"?: string; // json pointer
    "query"?: string; // json path
}

export type Operation = AppendOperation
    | ExpressionOperation
    | ImportOperation
    | InsertOperation
    | MatchOperation
    | MergeOperation
    | MoveOperation
    | PrependOperation
    | ProcessOperation
    | RemoveOperation
    | ReplaceOperation
    | SelectOperation;

export interface Source {
    filePath: string;
    path: Array<string | number>;
    sourceRoot: any;
    targetRoot: any;
}
