import * as fs from "fs";
import * as jsonpath from "jsonpath";
import * as safeEval from "safe-eval";
import * as jsonPtr from "json-ptr";
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
        return this._resolvePointer(result, uriFragment);
    }

    private _processFile(filePath: string, target?: any): any {
        // Resolve file path
        const contextFilePath = this.context.resolveFilePath(filePath);

        // Check if a match is in the cache
        const processedFiles = this.processedFileCache
            .filter(x => (x.uri === filePath || x.uri === contextFilePath) && x.target === target);

        // Return the match if found
        if (processedFiles.length > 1) {
            return processedFiles[0].result;
        }

        // Load source
        const source = this._readFile(filePath);

        // Process source
        this.context.enterSource(filePath, source, target);
        const result = this._processUnknown(source, target);
        this.context.leaveSource();

        // Add to processed file cache
        this.processedFileCache.push({uri: filePath, target, result});

        return result;
    }

    private _resolveReference(ref: string, target?: any) {
        // Ref is local pointer
        if (ref === "" || ref[0] === "#" || ref[0] === "/") {
            return this._resolvePointer(target, ref);
        }

        // Ref is file pointer
        const [filePath, pointer] = ref.split("#");
        const result = this._readFile(filePath);
        return this._resolvePointer(result, pointer)
    }

    private _readFile(filePath: string): any {
        // Check if the file is already in the cache
        if (this.fileCache[filePath] !== undefined) {
            return this.fileCache[filePath];
        }

        // Resolve file path
        filePath = this.context.resolveFilePath(filePath);

        // Check if the resolved file path is already in the cache
        if (this.fileCache[filePath] !== undefined) {
            return this.fileCache[filePath];
        }

        let content;

        // Try to read file
        try {
            content = fs.readFileSync(filePath, "utf8");
        } catch (e) {
            if (this.config.throwOnInvalidRef) {
                throw new Error(`The file "${filePath}" does not exist. Set options.throwOnInvalidRef to false to suppress this message`);
            }
        }

        // If read, parse JSON
        if (content !== undefined) {
            content = JSON.parse(content);
        }

        // Add result to cache
        this.fileCache[filePath] = content;

        return content;
    }

    private _resolvePointer(target: object, pointer?: string): any {
        if (pointer === undefined) {
            return target;
        }

        const result = jsonPtr.get(target, pointer);

        if (result === undefined && this.config.throwOnInvalidRef) {
            throw new Error(`The ref "${pointer}" does not exist. Set options.throwOnInvalidRef to false to suppress this message`);
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
        // Check if the object is an operation
        const operation = this.context.getOperation(source);
        if (operation !== undefined) {
            return this._processOperation(operation, target);
        }

        // Create result object
        const result: any = {};

        // Make sure target is an object
        if (!isObject(target)) {
            target = {};
        }

        // Copy target properties to the result object
        Object.keys(target).forEach(key => {
            result[key] = target[key];
        });

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
        if (operation.type === OperationType.Remove && operation.value === true) {
            // undefined will remove the property in JSON.stringify
            result = undefined;
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
        merges.forEach(action => {
            const item = this._processUnknown(action.value, action.targetItem, action.sourceItemIndex);
            result[action.targetItemIndex] = item;
        });

        // Then replaces
        replaces.forEach(action => {
            const item = this._processUnknown(action.value, undefined, action.sourceItemIndex);
            result[action.targetItemIndex] = item;
        });

        // Then removes
        removes.forEach(action => {
            result.splice(action.targetItemIndex, 1);
        });

        // Then prepends
        prepends.reverse().forEach(action => {
            const item = this._processUnknown(action.value, undefined, action.sourceItemIndex);
            result.unshift(item);
        });

        // Then appends
        appends.forEach(action => {
            const item = this._processUnknown(action.value, undefined, action.sourceItemIndex);
            result.push(item);
        });

        // Then moves
        moves.forEach(action => {
            const targetItemIndex = result.reduce((index, item, i) => item === action.targetItem ? i : index, -1);
            if (targetItemIndex !== -1) {
                result.splice(targetItemIndex, 1);
            }
            const item = this._processUnknown(action.value, action.targetItem, action.sourceItemIndex);
            const index = action.newTargetItemIndex === "-" ? result.length : action.newTargetItemIndex;
            result.splice(index, 0, item);
        });

        // Then inserts
        inserts.forEach(action => {
            const item = this._processUnknown(action.value, undefined, action.sourceItemIndex);
            const index = action.newTargetItemIndex === "-" ? result.length : action.newTargetItemIndex;
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
