const fs = require("fs");
const jsonpath = require("jsonpath");
const safeEval = require("safe-eval");
const jsonPtr = require("json-ptr");
const path = require("path");
const Config = require("./Config");
const Context = require("./Context");
const MergerError = require("./MergerError");
const {isObject} = require("./utils");

class Merger {

    /**************************************************************************
     * Public API
     **************************************************************************/

    constructor(config) {
        this.setConfig(config);
        this.fileCache = Object.create(null);
        this.compiledFileCache = [];
    }

    fromObject(object) {
        return this._compile([object], false);
    }

    fromFile(file) {
        return this._compile([file], true);
    }

    mergeObjects(objects) {
        return this._compile(objects, false);
    }

    mergeFiles(files) {
        return this._compile(files, true);
    }

    setConfig(config) {
        this.config = new Config(config);
    }

    clearCaches() {
        this.fileCache = Object.create(null);
        this.compiledFileCache = [];
    }

    /**************************************************************************
     * Init
     **************************************************************************/

    _compile(input, isFile) {
        // Create new context
        this.context = new Context(this.config);

        let result;

        try {
            if (isFile) {
                result = input.reduce((target, reference) => {
                    return this._resolveJsonReference(reference, true, target);
                }, undefined);
            } else {
                result = input.reduce((target, source) => {
                    return this._compileObject(target, source);
                }, undefined);
            }
        } catch (e) {
            throw new MergerError(e, this.context);
        }

        if (this.config.stringify) {
            result = JSON.stringify(result, null, this.config.stringify === "pretty" ? "\t" : undefined);
        }

        // Delete context
        this.context = undefined;

        return result;
    }

    _resolveJsonReference(reference, compile, target) {
        // Extract possible JSON pointer
        const [filePath, jsonPointer] = reference.split("#");

        // Get result
        let result = compile ? this._compileFile(target, filePath) : this._readFile(filePath);

        // return the value referenced by the JSON pointer if needed
        if (jsonPointer !== undefined) {
            result = this._resolveJsonPointer(result, jsonPointer);
        }

        return result;
    }

    _readFile(filePath) {
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

    _compileFile(target, filePath) {
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

        // Compile if no match found
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

    _compileObject(target, source) {
        this.context.enterSource(undefined, target, source);
        const result = this._processUnknown(target, source);
        this.context.leaveSource();
        return result;
    }

    _resolveFilePathInContext(filePath) {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        const currentFilePath = this.context.currentSource !== undefined && this.context.currentSource.filePath;
        const cwd = typeof currentFilePath === "string" ? path.dirname(currentFilePath) : this.config.cwd;
        return path.resolve(cwd, filePath);
    }

    _resolveJsonPointer(object, pointer) {
        const result = jsonPtr.get(object, pointer);

        if (result === undefined && this.config.throwOnInvalidRef) {
            throw new Error(`The ref "${pointer}" does not exist. Set options.throwOnInvalidRef to false to suppress this message`);
        }

        return result;
    }

    /**************************************************************************
     * Processing
     **************************************************************************/

    _processUnknown(target, source, propertyName) {
        this.context.enterProperty(propertyName);

        if (isObject(source)) {
            source = this._processObject(target, source);
        } else if (Array.isArray(source)) {
            source = this._processArray(target, source);
        }

        this.context.leaveProperty();

        return source;
    }

    _processObject(target, source) {
        // Handle $replace
        if (source[this.context.indicators.Replace] !== undefined) {
            target = undefined;
        }

        // Handle $ref
        if (source[this.context.indicators.Ref] !== undefined) {
            this.context.enterProperty(this.context.indicators.Ref);

            let referencedValue;
            const reference = source[this.context.indicators.Ref];

            // Local or remote pointer?
            if (reference === "" || reference[0] === "#" || reference[0] === "/") {
                referencedValue = this._resolveJsonPointer(this.context.currentSource.sourceRoot, reference);
            } else {
                referencedValue = this._resolveJsonReference(reference, false);
            }

            // Merge with the target
            this.context.enterSource();
            const result = this._processUnknown(target, referencedValue);
            this.context.leaveSource();

            this.context.leaveProperty();

            return result;
        }

        // Handle $import
        if (source[this.context.indicators.Import] !== undefined) {
            this.context.enterProperty(this.context.indicators.Import);

            const referencedValue = this._resolveJsonReference(source[this.context.indicators.Import], true);

            // Merge with the target
            this.context.enterSource();
            const result = this._processUnknown(target, referencedValue);
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
            const sourcePropertyTarget = undefined;
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
            const compilePropertyTarget = undefined;
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
        const result = {};

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

    _processArray(target, source) {
        if (!Array.isArray(target)) {
            target = [];
        }

        // Fetch actions
        const removeActions = [];
        const prependActions = [];
        const appendActions = [];
        const insertActions = [];
        const mergeActions = [];
        const moveActions = [];

        source.forEach((sourceItem, sourceItemIndex) => {

            // Calculate to which target item this source item should refer to
            const matchingTargetItemIndex = mergeActions.length + removeActions.length;

            // Create variables to hold the
            let matchedTargetItem;
            let matchedTargetItemIndex;

            // Handle $match
            if (sourceItem[this.context.indicators.Match] !== undefined) {
                // Try to find a matching item in the target
                const path = jsonpath.paths(target, sourceItem[this.context.indicators.Match])[0];

                // Ignore the item if no match found
                if (path === undefined) {
                    return;
                }

                // Set matched target
                matchedTargetItemIndex = path[1];
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
        const result = target.slice();

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

module.exports = Merger;
