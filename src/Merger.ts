import * as fs from "fs";
import * as path from "path";
import * as jsonpath from "jsonpath";
import * as safeEval from "safe-eval";
import * as jsonPtr from "json-ptr";
import * as yaml from "js-yaml";
import {normalize as normalizeConfig, Config, NormalizedConfig} from "./config";
import {isObject} from "./utils";
import Context, {Operation, OperationType} from "./Context";
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

    addFile(uri: string, object: object) {
        uri = path.resolve(this.config.cwd, uri);
        this.fileCache[uri] = object;
    }

    addFiles(files: FileMap) {
        Object.keys(files).forEach(uri => this.addFile(uri, files[uri]));
    }

    fromObject(object: object) {
        const sources = [{type: SourceType.Object, object} as Source];
        return this._mergeSources(sources);
    }

    mergeObjects(objects: object[]) {
        const sources = objects.map(object => ({type: SourceType.Object, object} as Source));
        return this._mergeSources(sources);
    }

    fromFile(uri: string) {
        const sources = [{type: SourceType.Uri, uri} as Source];
        return this._mergeSources(sources);
    }

    mergeFiles(uris: string[]) {
        const sources = uris.map(uri => ({type: SourceType.Uri, uri} as Source));
        return this._mergeSources(sources);
    }

    /**************************************************************************
     * Merge sources
     **************************************************************************/

    private _mergeSources(sources: Source[]): any {
        // Init result
        let result: any = undefined;

        // Create new context
        this.context = new Context(this.config);

        try {
            // Process and merge sources
            result = sources.reduce((target: any, job) => {

                // Is the source an object?
                if (job.type === SourceType.Object) {
                    return this._processObjectSource(job.object, target);
                }

                // Or is the source an uri?
                else if (job.type === SourceType.Uri) {
                    return this._processUriSource(job.uri, target);
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

    private _processObjectSource(object: object, target?: any): any {
        this.context.enterSource(undefined, object, target);
        const result = this._processUnknown(object, target);
        this.context.leaveSource();
        return result;
    }

    private _processUriSource(uri: string, target?: any) {
        const [uriPrimary, uriFragment] = uri.split("#");
        const result = this._processFile(uriPrimary, target);
        return this._resolveJsonPointer(result, uriFragment);
    }

    private _processFile(path: string, target?: any): any {
        // Resolve file path
        const contextFilePath = this.context.resolveFilePath(path);

        // Check if a match is in the cache
        const processedFiles = this.processedFileCache
            .filter(x => (x.uri === path || x.uri === contextFilePath) && x.target === target);

        // Return the match if found
        if (processedFiles.length > 1) {
            return processedFiles[0].result;
        }

        // Load source
        const source = this._loadFile(path);

        // Process source
        this.context.enterSource(path, source, target);
        const result = this._processUnknown(source, target);
        this.context.leaveSource();

        // Add to processed file cache
        this.processedFileCache.push({uri: path, target, result});

        return result;
    }

    private _loadFile(path: string): any {
        // Resolve file path
        path = this.context.resolveFilePath(path);

        // Check if the resolved file path is already in the cache
        if (this.fileCache[path] !== undefined) {
            return this.fileCache[path];
        }

        let content;

        // Try to read file
        try {
            content = fs.readFileSync(path, "utf8");
        } catch (e) {
            if (this.config.throwOnInvalidRef) {
                throw new Error(`The file "${path}" does not exist. Set options.throwOnInvalidRef to false to suppress this message`);
            }
        }

        // Parse if a file was found
        if (content !== undefined) {

            // YAML or JSON?
            if (/\.yaml$/.test(path)) {
                content = yaml.safeLoad(content, {
                    filename: path
                });
            } else {
                content = JSON.parse(content);
            }
        }

        // Add result to cache
        this.fileCache[path] = content;

        return content;
    }

    private _resolveReference(ref: string, target?: any) {
        // Ref is local pointer
        if (ref === "" || ref[0] === "#" || ref[0] === "/") {
            return this._resolveJsonPointer(target, ref);
        }

        // Ref is file pointer
        const [filePath, pointer] = ref.split("#");
        const result = this._loadFile(filePath);
        return this._resolveJsonPointer(result, pointer)
    }

    private _resolveJsonPointer(target: object, pointer?: string): any {
        if (pointer === undefined) {
            return target;
        }

        if (pointer === "/") {
            return target;
        }

        const result = jsonPtr.get(target, pointer);

        if (result === undefined && this.config.throwOnInvalidRef) {
            throw new Error(`The ref "${pointer}" does not exist. Set options.throwOnInvalidRef to false to suppress this message`);
        }

        return result;
    }

    private _resolveJsonPath(target: object, path?: string): any {
        if (path === undefined) {
            return target;
        }

        const result = jsonpath.query(target, path);

        if (result === undefined && this.config.throwOnInvalidRef) {
            throw new Error(`The json path "${path}" does not exist. Set options.throwOnInvalidRef to false to suppress this message`);
        }

        return result;
    }

    /**************************************************************************
     * Processing
     **************************************************************************/

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
            result = this._processUnknown(operation.value.with, undefined, "with");
        }

        // Handle $ref
        else if (operation.type === OperationType.Ref) {
            // Resolve $ref
            const value = this._resolveReference(operation.value, this.context.currentSource.sourceRoot);

            // Merge with the target
            result = this._processObjectSource(value, target);
        }

        // Handle $import
        else if (operation.type === OperationType.Import) {
            // Process file reference
            const processedReference = this._processUriSource(operation.value);

            // Merge with the target
            result = this._processObjectSource(processedReference, target);
        }

        // Handle $merge
        else if (operation.type === OperationType.Merge) {
            // Process $merge.source property without a target
            this.context.enterProperty("source");
            const processedSourceProperty = this._processObjectSource(operation.value.source);
            this.context.leaveProperty();

            // Process $merge.with property and use the processed $merge.source property as target
            this.context.enterProperty("with");
            const processedWithProperty = this._processObjectSource(operation.value.with, processedSourceProperty);
            this.context.leaveProperty();

            // Process $merge result and use the original target as target but do not process operations
            this.context.disableOperations();
            result = this._processObjectSource(processedWithProperty, target);
            this.context.enableOperations();
        }

        // Handle $select
        else if (operation.type === OperationType.Select) {
            let selectValue;

            // Determine the select context
            if (operation.value.from === "target") {
                selectValue = target;
            } else if (operation.value.from === "source") {
                selectValue = operation.source;
            } else if (operation.value.from === "targetRoot") {
                selectValue = this.context.currentSource.targetRoot;
            } else if (operation.value.from === "sourceRoot") {
                selectValue = this.context.currentSource.sourceRoot;
            } else if (operation.value.from !== undefined) {
                this.context.enterProperty("from");
                selectValue = this._processObjectSource(operation.value.from);
                this.context.leaveProperty();
            } else {
                selectValue = target;
            }

            // Select based on JSON pointer or path
            if (operation.value.pointer !== undefined) {
                result = this._resolveJsonPointer(selectValue, operation.value.pointer);
            } else if (operation.value.path !== undefined) {
                result = this._resolveJsonPath(selectValue, operation.value.path);
                if (operation.value.multiple !== true) {
                    result = result[0];
                }
            }
        }

        // Handle $expression
        else if (operation.type === OperationType.Expression) {
            // Create eval context
            const evalContext = {
                $source: operation.source,
                $sourceRoot: this.context.currentSource.sourceRoot,
                $target: target,
                $targetRoot: this.context.currentSource.targetRoot
            };

            // Evaluate the expression
            result = safeEval(operation.value, evalContext);
        }

        // Handle $process
        else if (operation.type === OperationType.Process) {
            // Process the $process property without a target
            const processedProcessProperty = this._processObjectSource(operation.value);

            // Process the processed $process property and use the original target as target
            result = this._processObjectSource(processedProcessProperty, target);
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

                // Handle $match.jsonPath
                else if (operation.value.jsonPath !== undefined) {
                    // Try to find a matching item in the target
                    const path = jsonpath.paths(target, operation.value.jsonPath)[0];
                    targetItemIndex = path !== undefined ? path[1] as number : undefined;
                }

                // Ignore the item if no match found
                if (targetItemIndex === undefined || target[targetItemIndex] === undefined) {
                    return;
                }

                // Set matched target
                targetItem = target[targetItemIndex];

                // Map source item to $match.then
                sourceItem = operation.value.then;
                operation = this.context.getOperation(operation.value.then);
            }

            // Handle $append
            if (operation && operation.type === OperationType.Append) {
                const {value} = operation.value;
                appends.push({sourceItemIndex, value});
            }

            // Handle $prepend
            else if (operation && operation.type === OperationType.Prepend) {
                const {value} = operation.value;
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
                const {"with": value} = operation.value;
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
    Uri
}

interface UriSource {
    type: SourceType.Uri;
    uri: string;
}

interface ObjectSource {
    object: object;
    type: SourceType.Object;
}

type Source = UriSource
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
    [uri: string]: object;
}

interface ProcessedFileCache extends Array<ProcessedFileCacheEntry> {}

interface ProcessedFileCacheEntry {
    result: any;
    target: object;
    uri: string;
}
