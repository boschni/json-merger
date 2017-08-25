import * as fs from "fs";
import * as nodePath from "path";
import * as jsonpath from "jsonpath";
import * as safeEval from "safe-eval";
import * as jsonPtr from "json-ptr";
import * as yaml from "js-yaml";
import range = require("lodash.range");
import {normalize as normalizeConfig, Config, NormalizedConfig} from "./config";
import {isObject} from "./utils";
import Context, {ImportOperationValue, Operation, OperationType, ScopeLocals} from "./Context";
import MergerError from "./MergerError";

export default class Merger {

    private config: NormalizedConfig;
    private context: Context;
    private fileCache: FileMap;
    private processedFileCache: ProcessedFileCache;

    /**************************************************************************
     * Public API
     **************************************************************************/

    constructor(config: Config) {
        this.resetCaches();
        this.setConfig(config);
    }

    setConfig(config: Config) {
        this.config = normalizeConfig(config);
        if (this.config.files) {
            this.addFiles(this.config.files);
        }
    }

    resetCaches() {
        this.fileCache = Object.create(null);
        this.processedFileCache = [];
    }

    addFile(path: string, object: object) {
        const resolvedPath = nodePath.resolve(this.config.cwd, path);
        this.fileCache[resolvedPath] = object;
    }

    addFiles(files: FileMap) {
        Object.keys(files).forEach(path => this.addFile(path, files[path]));
    }

    mergeObject(object: object, config?: Config) {
        const sources = [{type: SourceType.Object, object} as Source];
        return this._mergeSources(sources, config);
    }

    mergeObjects(objects: object[], config?: Config) {
        const sources = objects.map(object => ({type: SourceType.Object, object} as Source));
        return this._mergeSources(sources, config);
    }

    mergeFile(ref: string, config?: Config) {
        const sources = [{type: SourceType.Ref, ref} as Source];
        return this._mergeSources(sources, config);
    }

    mergeFiles(refs: string[], config?: Config) {
        const sources = refs.map(ref => ({type: SourceType.Ref, ref} as Source));
        return this._mergeSources(sources, config);
    }

    /**************************************************************************
     * Merge sources
     **************************************************************************/

    private _mergeSources(sources: Source[], config?: Config): any {
        // Set config if given
        if (config) {
            this.setConfig(config);
        }

        // Init result
        let result: any = undefined;

        // Create new context
        this.context = new Context(this.config);

        try {
            // Process and merge sources
            result = sources.reduce((target: any, job) => {

                const locals: ScopeLocals = {
                    $params: this.config.params
                };

                // Is the source an object?
                if (job.type === SourceType.Object) {
                    return this._processSourceObject(job.object, target, locals);
                }

                // Or is the source a ref?
                else if (job.type === SourceType.Ref) {
                    return this._processFileByRef(job.ref, target, locals);
                }
            }, result);
        } catch (e) {
            throw new MergerError(e, this.context);
        }

        // Delete context
        this.context = undefined;

        // Stringify?
        if (this.config.stringify) {
            const space = this.config.stringify === "pretty" ? "\t" : undefined;
            result = JSON.stringify(result, null, space);
        }

        return result;
    }

    private _loadFile(path: string): any {
        // Resolve file path
        const pathInContext = this.context.resolveFilePath(path);

        // Check if the resolved file path is already in the cache
        if (this.fileCache[pathInContext] !== undefined) {
            return this.fileCache[pathInContext];
        }

        let content;

        // Try to read file
        try {
            content = fs.readFileSync(pathInContext, "utf8");
        } catch (e) {
            if (this.config.errorOnFileNotFound) {
                throw new Error(`The file "${pathInContext}" does not exist. Set Config.errorOnFileNotFound to false to suppress this message`);
            }
        }

        // Parse if a file was found
        if (content !== undefined) {

            // YAML or JSON?
            if (/\.ya?ml$/.test(pathInContext)) {
                content = yaml.safeLoad(content, {
                    filename: pathInContext,
                    schema: yaml.JSON_SCHEMA
                });
            } else {
                content = JSON.parse(content);
            }
        }

        // Add result to cache
        this.fileCache[pathInContext] = content;

        return content;
    }

    private _loadFileByRef(ref: string) {
        const [path, pointer] = ref.split("#");
        let result = this._loadFile(path);
        if (pointer !== undefined) {
            result = this._resolveJsonPointer(result, pointer);
        }
        return result;
    }

    private _processFile(path: string, target?: any, locals?: ScopeLocals): any {
        // Resolve file path
        const pathInContext = this.context.resolveFilePath(path);

        // Check if a match is in the cache
        const processedFiles = this.processedFileCache
            .filter(x => (x.path === pathInContext) && x.target === target);

        // Return the match if found
        if (processedFiles.length > 1) {
            return processedFiles[0].result;
        }

        // Load file
        const source = this._loadFile(pathInContext);

        // Process source
        this.context.enterScope(source, target, locals, pathInContext);
        const result = this._processUnknown(source, target);
        this.context.leaveScope();

        // Add to processed file cache
        this.processedFileCache.push({path: pathInContext, target, result});

        return result;
    }

    private _processFileByRef(ref: string, target?: any, locals?: ScopeLocals) {
        const [path, pointer] = ref.split("#");
        let result = this._processFile(path, target, locals);
        if (pointer !== undefined) {
            result = this._resolveJsonPointer(result, pointer);
        }
        return result;
    }

    private _resolveJsonPointer(target: object, pointer?: string): any {
        let result;

        if (pointer === undefined || pointer === "/") {
            result = target;
        } else {
            result = jsonPtr.get(target, pointer);
        }

        if (result === undefined && this.config.errorOnRefNotFound) {
            throw new Error(`The JSON pointer "${pointer}" resolves to undefined. Set Config.errorOnRefNotFound to false to suppress this message`);
        }

        return result;
    }

    private _resolveJsonPath(target: object, path?: string): any {
        let result;

        if (path === undefined) {
            result = target;
        } else if (isObject(target) || Array.isArray(target)) {
            result = jsonpath.query(target, path);
        }

        if (result === undefined && this.config.errorOnRefNotFound) {
            throw new Error(`The JSON path "${path}" resolves to undefined. Set Config.errorOnRefNotFound to false to suppress this message`);
        }

        return result;
    }

    /**************************************************************************
     * Processing
     **************************************************************************/

    private _processSourceObject(object: object, target?: any, locals?: ScopeLocals): any {
        this.context.enterScope(object, target, locals);
        const result = this._processUnknown(object, target);
        this.context.leaveScope();
        return result;
    }

    private _processUnknown(source: any, target?: any, propertyName?: string | number): any {
        let result;

        // Enter property
        this.context.enterProperty(propertyName);

        // Process property if it is an object or array
        if (isObject(source)) {
            result = this._processObject(source, target);
        } else if (Array.isArray(source)) {
            result = this._processArray(source, target);
        } else {
            result = source;
        }

        // Leave property
        this.context.leaveProperty();

        return result;
    }

    private _processObject(source: object, target?: any): any {
        // Check if the source is an operation
        const operation = this.context.getOperation(source);
        if (operation !== undefined) {
            return this._processOperation(operation, target);
        }

        // Make sure target is an object
        if (!isObject(target)) {
            target = {};
        }

        // Copy target properties to the result object
        const result = {...target};

        // Process source properties and copy to result object
        Object.keys(source).forEach(key => {
            const targetPropertyName = this.context.getTargetPropertyName(key);
            if (targetPropertyName !== undefined) {
                result[targetPropertyName] = this._processUnknown((source as any)[key], target[key], key);
            }
        });

        return result;
    }

    private _processOperation(operation: Operation, target?: any): any {
        let result: any = {};

        // Enter operation property
        this.context.enterProperty(operation.indicator);

        // Handle $remove
        if (operation.type === OperationType.Remove) {
            if (operation.value === true) {
                // undefined will remove the property in JSON.stringify
                result = undefined;
            }
        }

        // Handle $replace
        else if (operation.type === OperationType.Replace) {
            result = this._processUnknown(operation.value);
        }

        // Handle $import
        else if (operation.type === OperationType.Import) {
            const sources: ImportOperationValue[] = Array.isArray(operation.value) ? operation.value : [operation.value];

            // Process and merge sources
            const importResult = sources.reduce((target: any, source) => {

                if (typeof source === "string") {
                    // Process file reference
                    target = this._processFileByRef(source, target);
                } else {
                    // Should the file not be processed?
                    if (source.process === false) {
                        const file = this._loadFileByRef(source.path);
                        this.context.disableOperations();
                        target = this._processSourceObject(file, target);
                        this.context.enableOperations();
                    }

                    // the file needs to be processed
                    else {
                        let locals: ScopeLocals = {};

                        // process the params property if set
                        if (source.params !== undefined) {
                            this.context.enterProperty("params");
                            locals.$params = this._processSourceObject(source.params);
                            this.context.leaveProperty();
                        }

                        // process the file
                        target = this._processFileByRef(source.path, target, locals);
                    }
                }
                return target;
            }, undefined);

            // Merge with the target
            if (target === undefined) {
                this.context.disableOperations();
            }
            result = this._processSourceObject(importResult, target);
            if (target === undefined) {
                this.context.enableOperations();
            }
        }

        // Handle $merge
        else if (operation.type === OperationType.Merge) {
            // Process $merge.source property without a target
            this.context.enterProperty("source");
            const processedSourceProperty = this._processSourceObject(operation.value.source);
            this.context.leaveProperty();

            // Process $merge.with property and use the processed $merge.source property as target
            this.context.enterProperty("with");
            const processedWithProperty = this._processSourceObject(operation.value.with, processedSourceProperty);
            this.context.leaveProperty();

            // Process $merge result and use the original target as target but do not process operations
            this.context.disableOperations();
            result = this._processSourceObject(processedWithProperty, target);
            this.context.enableOperations();
        }

        // Handle $select
        else if (operation.type === OperationType.Select) {
            let selectContext;

            // Determine the select context
            if (operation.value.from !== undefined) {
                this.context.enterProperty("from");
                selectContext = this._processSourceObject(operation.value.from);
                this.context.leaveProperty();
            } else {
                selectContext = this.context.currentScope.$target;
            }

            let selectValue;

            // Select based on JSON pointer or JSON path
            if (operation.value.path !== undefined) {
                selectValue = this._resolveJsonPointer(selectContext, operation.value.path);
            } else if (operation.value.query !== undefined) {
                selectValue = this._resolveJsonPath(selectContext, operation.value.query);
                if (operation.value.multiple !== true) {
                    selectValue = selectValue[0];
                }
            }

            // Merge with the target
            result = this._processSourceObject(selectValue, target);
        }

        // Handle $expression
        else if (operation.type === OperationType.Expression) {
            let input: any;
            let expression: string;

            // Get expression and input variable
            if (typeof operation.value === "string") {
                expression = operation.value;
            } else {
                expression = operation.value.expression;

                // process input if set
                if (operation.value.input) {
                    this.context.enterProperty("input");
                    input = this._processSourceObject(operation.value.input);
                    this.context.leaveProperty();
                }
            }

            // Create eval context
            const evalContext = {
                ...this.context.currentScope,
                $sourceProperty: operation.source,
                $targetProperty: target,
                $input: input
            };

            // Evaluate the expression
            result = safeEval(expression, evalContext);
        }

        // Handle $repeat
        else if (operation.type === OperationType.Repeat) {
            let values: {key?: number | string, value: any}[] = [];

            // create values with $repeat.from and $repeat.until?
            if (typeof operation.value.from === "number" && typeof operation.value.until === "number") {
                for (let index = operation.value.from; index <= operation.value.until; index++) {
                    values.push({value: index});
                }
            }

            // is $repeat.values set and an array?
            else if (Array.isArray(operation.value.values)) {
                values = operation.value.values.map((value) => ({value}));
            }

            // is $repeat.values set and an object?
            else if (isObject(operation.value.values)) {
                const obj = operation.value.values as any;
                values = Object.keys(obj).map(key => ({key, value: obj[key]}));
            }

            // is $repeat.range set?
            else if (typeof operation.value.range === "string") {
                const ranges = operation.value.range
                    // replace comma characters with a space
                    .replace(/,/g, " ")

                    // remove double spaces
                    .replace(/\s+/g, " ")

                    // split by space
                    .split(" ");

                ranges.forEach(r => {
                    const split = r.split("-");
                    const start = Number(split[0]);
                    const end = Number(split[1]);
                    if (end) {
                        range(start, end + 1, 1).forEach(index => values.push({value: index}));
                    } else {
                        values.push({value: start});
                    }
                });
            }

            // generate the repeated array
            const repeatResult = values.map((value, index) => {
                // add $repeat variable to the scope
                const locals: ScopeLocals = {
                    $repeat: {
                        index,
                        key: value.key !== undefined ? value.key : index,
                        value: value.value
                    }
                };

                // Process the value property without a target
                return this._processSourceObject(operation.value.value, undefined, locals);
            });

            // Process repeat result and use the original target as target but do not process operations
            this.context.disableOperations();
            result = this._processSourceObject(repeatResult, target);
            this.context.enableOperations();
        }

        // Handle $process
        else if (operation.type === OperationType.Process) {
            // Process the $process property without a target
            const processedProcessProperty = this._processSourceObject(operation.value);

            // Process the processed $process property and use the original target as target
            result = this._processSourceObject(processedProcessProperty, target);
        }

        // Leave operation property
        this.context.leaveProperty();

        return result;
    }

    private _processArray(source: any[], target?: any): any {
        if (!Array.isArray(target)) {
            target = [];
        }

        // Fetch array operations
        const appends: AppendArrayOperation[] = [];
        const inserts: InsertArrayOperation[] = [];
        const merges: MergeArrayOperation[] = [];
        const moves: MoveArrayOperation[] = [];
        const prepends: PrependArrayOperation[] = [];
        const removes: RemoveArrayOperation[] = [];
        const replaces: ReplaceArrayOperation[] = [];

        source.forEach((sourceItem, sourceItemIndex) => {

            // Calculate to which target item this source item should refer to
            let targetItemIndex = merges.length + removes.length;
            let targetItem = target[targetItemIndex];

            // Try to get operation
            let operation = this.context.getOperation(sourceItem);

            // Handle $match
            if (operation && operation.type === OperationType.Match) {
                // Handle $match.index
                if (operation.value.index !== undefined) {
                    targetItemIndex = operation.value.index === "-" ? target.length - 1 : operation.value.index;
                }

                // Handle $match.query
                else if (operation.value.query !== undefined) {
                    // Try to find a matching item in the target
                    const path = jsonpath.paths(target, operation.value.query)[0];
                    targetItemIndex = path !== undefined ? path[1] as number : undefined;
                }

                // Handle $match.path
                else if (operation.value.path !== undefined) {
                    // Try to find a matching item in the target
                    if (jsonPtr.get(target, operation.value.path) !== undefined) {
                        [targetItemIndex] = jsonPtr.decodePointer(operation.value.path)[0];
                    }
                }

                // Ignore the item if no match found
                if (targetItemIndex === undefined || target[targetItemIndex] === undefined) {
                    return;
                }

                // Set matched target
                targetItem = target[targetItemIndex];

                // Map source item to $match.value
                sourceItem = operation.value.value;
                operation = this.context.getOperation(sourceItem);
            }

            // Handle $append
            if (operation && operation.type === OperationType.Append) {
                const {value} = operation;
                appends.push({sourceItemIndex, value});
            }

            // Handle $prepend
            else if (operation && operation.type === OperationType.Prepend) {
                const {value} = operation;
                prepends.push({sourceItemIndex, value});
            }

            // Handle $insert
            else if (operation && operation.type === OperationType.Insert) {
                const {value, index: newTargetItemIndex} = operation.value;
                inserts.push({newTargetItemIndex, sourceItemIndex, value});
            }

            // Handle $move
            else if (operation && operation.type === OperationType.Move) {
                const {value, index: newTargetItemIndex} = operation.value;
                moves.push({newTargetItemIndex, sourceItemIndex, targetItem, value});
            }

            // Handle $remove
            else if (operation && operation.type === OperationType.Remove) {
                if (operation.value === true) {
                    removes.push({targetItemIndex, sourceItemIndex});
                }
            }

            // Handle $replace
            else if (operation && operation.type === OperationType.Replace) {
                const {value} = operation;
                replaces.push({sourceItemIndex, targetItemIndex, value});
            }

            // No array operation found, add merge action
            else {
                const value = sourceItem;
                merges.push({sourceItemIndex, targetItem, targetItemIndex, value});
            }
        });

        // Execute array operations
        const result: any[] = target.slice();

        // Do merges first
        merges.forEach(op => {
            result[op.targetItemIndex] = this._processUnknown(op.value, op.targetItem, op.sourceItemIndex);
        });

        // Then replaces
        replaces.forEach(op => {
            result[op.targetItemIndex] = this._processUnknown(op.value, undefined, op.sourceItemIndex);
        });

        // Then removes
        removes.forEach(op => {
            result.splice(op.targetItemIndex, 1);
        });

        // Then prepends
        prepends.reverse().forEach(op => {
            result.unshift(this._processUnknown(op.value, undefined, op.sourceItemIndex));
        });

        // Then appends
        appends.forEach(op => {
            result.push(this._processUnknown(op.value, undefined, op.sourceItemIndex));
        });

        // Then moves
        moves.forEach(op => {
            const targetItemIndex = result.reduce((index, item, i) => item === op.targetItem ? i : index, -1);
            if (targetItemIndex !== -1) {
                result.splice(targetItemIndex, 1);
            }
            const item = this._processUnknown(op.value, op.targetItem, op.sourceItemIndex);
            const index = op.newTargetItemIndex === "-" ? result.length : op.newTargetItemIndex;
            result.splice(index, 0, item);
        });

        // Then inserts
        inserts.forEach(op => {
            const item = this._processUnknown(op.value, undefined, op.sourceItemIndex);
            const index = op.newTargetItemIndex === "-" ? result.length : op.newTargetItemIndex;
            result.splice(index, 0, item);
        });

        return result;
    }
}

/*
 * TYPES
 */

/*
 * SOURCE
 */

enum SourceType {
    Object,
    Ref
}

interface RefSource {
    ref: string;
    type: SourceType.Ref;
}

interface ObjectSource {
    object: object;
    type: SourceType.Object;
}

type Source = RefSource
    | ObjectSource;

/*
 * ARRAY ACTIONS
 */

interface ArrayOperation {
    sourceItemIndex: number;
}

interface AppendArrayOperation extends ArrayOperation {
    value: any;
}

interface PrependArrayOperation extends ArrayOperation {
    value: any;
}

interface InsertArrayOperation extends ArrayOperation {
    newTargetItemIndex: number | "-";
    value: any;
}

interface MoveArrayOperation extends ArrayOperation {
    newTargetItemIndex: number | "-";
    targetItem: any;
    value: any;
}

interface RemoveArrayOperation extends ArrayOperation {
    targetItemIndex: number;
}

interface MergeArrayOperation extends ArrayOperation {
    targetItem: any;
    targetItemIndex: number;
    value: any;
}

interface ReplaceArrayOperation extends ArrayOperation {
    targetItemIndex: number;
    value: any;
}

/*
 * FILE CACHE
 */

export interface FileMap {
    [path: string]: object;
}

interface ProcessedFileCache extends Array<ProcessedFileCacheEntry> {}

interface ProcessedFileCacheEntry {
    path: string;
    result: any;
    target: object;
}
