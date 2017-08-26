import * as path from "path";
import {NormalizedConfig} from "./config";

export default class Context {

    currentScope?: Scope;
    scopes: Scope[] = [];

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
        const currentFilePath = this.currentScope !== undefined && this.currentScope.$sourceFilePath;
        const cwd = typeof currentFilePath === "string" ? path.dirname(currentFilePath) : this.config.cwd;
        return path.resolve(cwd, filePath);
    }

    enterScope(source?: any, target?: any, locals?: ScopeLocals, sourceFilePath?: string) {
        // create a copy of the current scope or create a new object
        let scope: Partial<Scope> = this.currentScope ? {...this.currentScope} : {};

        // set references
        scope.$root = this.scopes.length ? this.scopes[0] : scope as Scope;
        scope.$parent = this.currentScope;
        scope.$source = source;
        scope.$target = target;

        // create a new scope property path
        scope.$propertyPath = [];

        // set the source file path if given
        if (sourceFilePath !== undefined) {
            scope.$sourceFilePath = sourceFilePath;
        }

        // override locals if given
        if (locals) {
            scope = {...scope, ...locals};
        }

        this.currentScope = scope as Scope;
        this.scopes.push(this.currentScope);
    }

    leaveScope() {
        this.scopes.pop();
        this.currentScope = this.scopes[this.scopes.length - 1];
    }

    enterProperty(propertyName?: string | number) {
        if (propertyName !== undefined) {
            this.currentScope.$propertyPath.push(propertyName);
        }
    }

    leaveProperty() {
        this.currentScope.$propertyPath.pop();
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
    Repeat,
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
    "process"?: boolean; // indicates if the file should be processed
    "params"?: any; // the params to pass to the file
};

export interface RemoveOperation extends OperationBase<RemoveOperation> {
    type: OperationType.Remove;
    value: boolean; // indicates if the property should be removed
}

export interface ProcessOperation extends OperationBase<ProcessOperation> {
    type: OperationType.Process;
    value: any; // the value to process
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
    "from"?: any; // select context
    "multiple"?: boolean; // expect multiple results?
    "path"?: string; // json pointer
    "query"?: string; // json path
}

export interface ExpressionOperation extends OperationBase<ExpressionOperation> {
    type: OperationType.Expression;
    value: ExpressionOperationValue;
}

export type ExpressionOperationValue = string // the expression
    | {
    "expression": string; // the expression
    "input"?: any; // value of the $input variable
};

export interface RepeatOperation extends OperationBase<RepeatOperation> {
    type: OperationType.Repeat;
    value: RepeatOperationValue;
}

export interface RepeatOperationValue {
    "from"?: number; // index start
    "in"?: object | any[]; // object or array to iterate over
    "range"?: string; // the range in format "1 2:10 11:100, 200:300, 400"
    "step"?: number; // step interval
    "through"?: number; // including index end
    "to"?: number; // excluding index end
    "value": any; // the value to repeat
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
    | RepeatOperation
    | ReplaceOperation
    | SelectOperation;

export interface ScopeLocals {
    $params?: any; // $params properties in current scope
    $repeat?: ScopeRepeat; // $repeat properties in current scope
}

export interface ScopeRepeat {
    index: number;
    key: number | string;
    value: any;
}

export interface Scope extends ScopeLocals {
    $parent?: Scope; // reference to parent scope
    $propertyPath: Array<string | number>; // the current scope property path
    $root: Scope; // reference to root scope
    $source: any; // reference to the source object
    $sourceFilePath?: string; // optional source file path
    $target?: any; // reference to the target object
}
