import * as fs from "fs";
import * as jsonpath from "jsonpath";
import * as safeEval from "safe-eval";
import * as jsonPtr from "json-ptr";
import * as path from "path";
import {normalize as normalizeConfig, Config, NormalizedConfig} from "./config";
import {isObject} from "./utils";
import Context from "./Context";
import MergerError from "./MergerError";

export default class Merger {

    private config: NormalizedConfig;
    private context: Context;
    private fileCache: FileCache;
    private compiledFileCache: CompiledFileCache;

    /**************************************************************************
     * Public API
     **************************************************************************/

    constructor(config: Config) {
        this.setConfig(config);
        this.resetCaches();
    }

    setConfig(config: Config) {
        this.config = normalizeConfig(config);
    }

    resetCaches() {
        this.fileCache = Object.create(null);
        this.compiledFileCache = [];
    }

    fromObject(object: JsonObject) {
        const items = [{object}];
        return this._compile(items);
    }

    mergeObjects(objects: JsonObject[]) {
        const items = objects.map(object => ({object}));
        return this._compile(items);
    }

    fromFile(ref: string) {
        const items = [{ref}];
        return this._compile(items);
    }

    mergeFiles(refs: string[]) {
        const items = refs.map(ref => ({ref}));
        return this._compile(items);
    }

    /**************************************************************************
     * Compilation
     **************************************************************************/

    private _compile(compileItems: CompileItem[]): any {
        // Init result
        let result: any = undefined;

        // Create new context
        this.context = new Context(this.config);

        try {
            // Compile and merge items
            result = compileItems.reduce((target: any, item) => {
                if (item.ref !== undefined) {
                    return this._compileReference(item.ref, target);
                } else {
                    return this._compileObject(item.object, target);
                }
            }, result);

        } catch (e) {
            throw new MergerError(e, this.context);
        }

        // Delete context
        this.context = undefined;

        // Stringify?
        if (this.config.stringify) {
            result = JSON.stringify(result, null, this.config.stringify === "pretty" ? "\t" : undefined);
        }

        return result;
    }

    private _compileReference(ref: string, target?: any) {
        const [filePath, pointer] = ref.split("#");
        const result = this._compileFile(filePath, target);
        return this._resolvePointer(result, pointer);
    }

    private _compileFile(filePath: string, target?: any): any {
        // Determine file path
        filePath = this._resolveFilePathInContext(filePath);

        // Check if a match is in the cache
        const compiledFiles = this.compiledFileCache
            .filter(x => x.filePath === filePath && x.target === target);

        // Return the match if found
        if (compiledFiles.length > 1) {
            return compiledFiles[0].result;
        }

        let result;

        const source = this._readFile(filePath);

        // Compile if a file has been found
        if (source !== undefined) {

            // Process source
            this.context.enterSource(filePath, target, source);
            result = this._processUnknown(target, source);
            this.context.leaveSource();

            // Add to compiled file cache
            this.compiledFileCache.push({filePath, target, result});
        }

        return result;
    }

    private _resolveReference(ref: string, target?: any) {
        // Ref is local pointer
        if (ref === "" || ref[0] === "#" || ref[0] === "/") {
            return this._resolvePointer(target, ref);
        }

        // Ref is remote pointer
        const [filePath, pointer] = ref.split("#");
        const result = this._readFile(filePath);
        return this._resolvePointer(result, pointer)
    }

    private _readFile(filePath: string): any {
        // Determine file path
        filePath = this._resolveFilePathInContext(filePath);

        // Check if the file is already in the cache
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

    private _compileObject(source: JsonObject, target?: any): any {
        this.context.enterSource(undefined, target, source);
        const result = this._processUnknown(target, source);
        this.context.leaveSource();
        return result;
    }

    private _resolvePointer(target: JsonObject, pointer?: string): any {
        if (pointer === undefined) {
            return target;
        }

        const result = jsonPtr.get(target, pointer);

        if (result === undefined && this.config.throwOnInvalidRef) {
            throw new Error(`The ref "${pointer}" does not exist. Set options.throwOnInvalidRef to false to suppress this message`);
        }

        return result;
    }

    private _resolveFilePathInContext(filePath: string): string {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        const currentFilePath = this.context.currentSource !== undefined && this.context.currentSource.filePath;
        const cwd = typeof currentFilePath === "string" ? path.dirname(currentFilePath) : this.config.cwd;
        return path.resolve(cwd, filePath);
    }

    /**************************************************************************
     * Processing
     **************************************************************************/

    private _processUnknown(target: any, source: any, propertyName?: string | number): any {
        this.context.enterProperty(propertyName);

        if (isObject(source)) {
            source = this._processObject(target, source);
        } else if (Array.isArray(source)) {
            source = this._processArray(target, source);
        }

        this.context.leaveProperty();

        return source;
    }

    private _processObject(target: any, source: UntypedObject): any {
        // Handle $replace
        if (source[this.context.indicators.Replace] !== undefined) {
            target = undefined;
        }

        // Handle $ref
        if (source[this.context.indicators.Ref] !== undefined) {
            this.context.enterProperty(this.context.indicators.Ref);

            // Resolve reference
            const value = this._resolveReference(
                source[this.context.indicators.Ref],
                this.context.currentSource.sourceRoot
            );

            // Merge with the target
            this.context.enterSource();
            const result = this._processUnknown(target, value);
            this.context.leaveSource();

            this.context.leaveProperty();

            return result;
        }

        // Handle $import
        if (source[this.context.indicators.Import] !== undefined) {
            this.context.enterProperty(this.context.indicators.Import);

            // Compile reference
            const value = this._compileReference(source[this.context.indicators.Import]);

            // Merge with the target
            this.context.enterSource();
            const result = this._processUnknown(target, value);
            this.context.leaveSource();

            this.context.leaveProperty();

            return result;
        }

        // Handle $remove
        if (source[this.context.indicators.Remove] === true) {
            // undefined will remove the property in JSON.stringify
            return undefined;
        }

        // Handle $value
        if (source[this.context.indicators.Value] !== undefined) {
            return this._processUnknown(target, source[this.context.indicators.Value], this.context.indicators.Value);
        }

        // Handle $merge
        if (source[this.context.indicators.Merge] !== undefined) {
            this.context.enterProperty(this.context.indicators.Merge);

            // Compile $merge.source property without a target
            const sourceProperty = source[this.context.indicators.Merge].source;
            const sourcePropertyTarget: undefined = undefined;
            this.context.enterSource(this.context.currentSource.filePath, sourcePropertyTarget, sourceProperty);
            const compiledSourceProperty = this._processUnknown(sourcePropertyTarget, sourceProperty, "source");
            this.context.leaveSource();

            // Compile $merge.with property and use the compiled $merge.source property as target
            const withProperty = source[this.context.indicators.Merge].with;
            const withPropertyTarget = compiledSourceProperty;
            this.context.enterSource(this.context.currentSource.filePath, withPropertyTarget, withProperty);
            const compiledWithProperty = this._processUnknown(withPropertyTarget, withProperty, "with");
            this.context.leaveSource();

            // Compile $merge result and use the original target as target but do not process the indicators
            const compiledWithPropertyTarget = target;
            this.context.disableIndicators();
            this.context.enterSource(this.context.currentSource.filePath, compiledWithPropertyTarget, compiledWithProperty);
            const result = this._processUnknown(compiledWithPropertyTarget, compiledWithProperty);
            this.context.leaveSource();
            this.context.enableIndicators();

            this.context.leaveProperty();

            return result;
        }

        // Handle $expression
        if (source[this.context.indicators.Expression] !== undefined) {
            this.context.enterProperty(this.context.indicators.Expression);

            const evalExpression = source[this.context.indicators.Expression];

            const evalContext = {
                $source: source,
                $sourceRoot: this.context.currentSource.sourceRoot,
                $target: target,
                $targetRoot: this.context.currentSource.targetRoot
            };

            const result = safeEval(evalExpression, evalContext);

            this.context.leaveProperty();

            return result;
        }

        // Handle $compile
        if (source[this.context.indicators.Compile] !== undefined) {

            // Compile the $compile property without a target
            const compileProperty = source[this.context.indicators.Compile];
            const compilePropertyTarget: undefined = undefined;
            this.context.enterSource(this.context.currentSource.filePath, compilePropertyTarget, compileProperty);
            const compiledCompileProperty = this._processUnknown(compilePropertyTarget, compileProperty, this.context.indicators.Compile);
            this.context.leaveSource();

            // Compile the compiled $compile property and use the original target as target
            const compiledCompilePropertyTarget = target;
            this.context.enterSource(this.context.currentSource.filePath, compiledCompilePropertyTarget, compiledCompileProperty);
            const result = this._processUnknown(compiledCompilePropertyTarget, compiledCompileProperty, this.context.indicators.Compile);
            this.context.leaveSource();

            return result;
        }

        // Create result object
        const result: UntypedObject = {};

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
            // Prevent indicators from being copied to the result
            if (this.context.indicatorsArray.indexOf(key) === -1) {
                // Process the source property
                result[key] = this._processUnknown(target[key], source[key], key);
            }
        });

        // Handle $set
        if (source[this.context.indicators.Set] !== undefined) {
            const setValue = source[this.context.indicators.Set];
            const setItems = Array.isArray(setValue) ? setValue : [setValue];

            // Process and set items
            setItems.forEach(item => {
                result[item.key] = this._processUnknown(undefined, item.value, item.key);
            });
        }

        return result;
    }

    private _processArray(target: any, source: UntypedArray): any {
        if (!Array.isArray(target)) {
            target = [];
        }

        // Fetch actions
        const removeActions: ArrayRemoveAction[] = [];
        const prependActions: ArrayPrependAction[] = [];
        const appendActions: ArrayAppendAction[] = [];
        const insertActions: ArrayInsertAction[] = [];
        const mergeActions: ArrayMergeAction[] = [];
        const moveActions: ArrayMoveAction[] = [];

        source.forEach((sourceItem, sourceItemIndex) => {

            // Calculate to which target item this source item should refer to
            const matchingTargetItemIndex = mergeActions.length + removeActions.length;

            // Create variables to hold the
            let matchedTargetItem: any;
            let matchedTargetItemIndex: number;

            // Handle $match
            if (sourceItem[this.context.indicators.Match] !== undefined) {
                // Try to find a matching item in the target
                const path = jsonpath.paths(target, sourceItem[this.context.indicators.Match])[0];

                // Ignore the item if no match found
                if (path === undefined) {
                    return;
                }

                // Set matched target
                matchedTargetItemIndex = path[1] as number;
                matchedTargetItem = target[matchedTargetItemIndex];
            }

            // Handle $append
            if (sourceItem[this.context.indicators.Append] === true) {
                appendActions.push({
                    value: matchedTargetItem !== undefined ? matchedTargetItem : sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }

            // Handle $prepend
            else if (sourceItem[this.context.indicators.Prepend] === true) {
                prependActions.push({
                    value: matchedTargetItem !== undefined ? matchedTargetItem : sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }

            // Handle $insert
            else if (sourceItem[this.context.indicators.Insert] !== undefined) {
                insertActions.push({
                    newTargetItemIndex: sourceItem[this.context.indicators.Insert],
                    value: matchedTargetItem !== undefined ? matchedTargetItem : sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }

            // Handle $move
            else if (sourceItem[this.context.indicators.Move] !== undefined) {
                moveActions.push({
                    newTargetItemIndex: sourceItem[this.context.indicators.Move],
                    targetItem: target[matchedTargetItem !== undefined ? matchedTargetItemIndex : matchingTargetItemIndex],
                    value: matchedTargetItem !== undefined ? matchedTargetItem : sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }

            // Handle $remove
            else if (sourceItem[this.context.indicators.Remove] === true) {
                removeActions.push({
                    targetItemIndex: matchedTargetItem !== undefined ? matchedTargetItemIndex : matchingTargetItemIndex,
                    sourceItemIndex: sourceItemIndex
                });
            }

            // No indicator, add merge action
            else {
                mergeActions.push({
                    targetItemIndex: matchedTargetItem !== undefined ? matchedTargetItemIndex : matchingTargetItemIndex,
                    value: sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }
        });

        // Clone target array
        const result: any[] = target.slice();

        // Do merges first
        mergeActions.forEach(action => {
            const targetItem = result[action.targetItemIndex];
            const item = this._processUnknown(targetItem, action.value, action.sourceItemIndex);
            result[action.targetItemIndex] = item;
        });

        // Then removes
        removeActions.forEach(action => {
            result.splice(action.targetItemIndex, 1);
        });

        // Then moves
        moveActions.forEach(action => {
            let targetItem = undefined;
            result.forEach((item, index) => {
                if (item === action.targetItem) {
                    targetItem = result.splice(index, 1)[0];
                }
            });
            const item = this._processUnknown(targetItem, action.value, action.sourceItemIndex);
            const index = action.newTargetItemIndex === "-" ? result.length : action.newTargetItemIndex;
            result.splice(index, 0, item);
        });

        // Then inserts
        insertActions.forEach(action => {
            const item = this._processUnknown(undefined, action.value, action.sourceItemIndex);
            const index = action.newTargetItemIndex === "-" ? result.length : action.newTargetItemIndex;
            result.splice(index, 0, item);
        });

        // Then prepends
        prependActions.reverse().forEach(action => {
            const item = this._processUnknown(undefined, action.value, action.sourceItemIndex);
            result.unshift(item);
        });

        // And as last appends
        appendActions.forEach(action => {
            const item = this._processUnknown(undefined, action.value, action.sourceItemIndex);
            result.push(item);
        });

        return result;
    }
}

/*
 * TYPES
 */

export type JsonObject = UntypedObject | UntypedArray;

export interface UntypedObject {
    [key: string]: any;
    [key: number]: any;
}

export interface UntypedArray extends Array<any> {}

interface CompileItem {
    ref?: string;
    object?: JsonObject;
}

interface ArrayAppendAction {
    sourceItemIndex: number;
    value: any;
}

interface ArrayPrependAction {
    sourceItemIndex: number;
    value: any;
}

interface ArrayInsertAction {
    newTargetItemIndex: number | "-";
    sourceItemIndex: number;
    value: any;
}

interface ArrayMoveAction {
    newTargetItemIndex: number | "-";
    sourceItemIndex: number;
    targetItem: any;
    value: any;
}

interface ArrayRemoveAction {
    sourceItemIndex: number;
    targetItemIndex: number;
}

interface ArrayMergeAction {
    sourceItemIndex: number;
    targetItemIndex: number;
    value: any;
}

interface FileCache {
    [filePath: string]: any;
}

interface CompiledFileCache extends Array<CompiledFileCacheEntry> {}

interface CompiledFileCacheEntry {
    filePath: string;
    result: any;
    target: any;
}
