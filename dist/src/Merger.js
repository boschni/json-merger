"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var jsonpath = require("jsonpath");
var safeEval = require("safe-eval");
var jsonPtr = require("json-ptr");
var path = require("path");
var config_1 = require("./config");
var utils_1 = require("./utils");
var Context_1 = require("./Context");
var MergerError_1 = require("./MergerError");
var Merger = (function () {
    function Merger(config) {
        this.setConfig(config);
        this.resetCaches();
    }
    Merger.prototype.setConfig = function (config) {
        this.config = config_1.normalize(config);
    };
    Merger.prototype.resetCaches = function () {
        this.fileCache = Object.create(null);
        this.compiledFileCache = [];
    };
    Merger.prototype.fromObject = function (object) {
        var items = [{ object: object }];
        return this._compile(items);
    };
    Merger.prototype.mergeObjects = function (objects) {
        var items = objects.map(function (object) { return ({ object: object }); });
        return this._compile(items);
    };
    Merger.prototype.fromFile = function (ref) {
        var items = [{ ref: ref }];
        return this._compile(items);
    };
    Merger.prototype.mergeFiles = function (refs) {
        var items = refs.map(function (ref) { return ({ ref: ref }); });
        return this._compile(items);
    };
    Merger.prototype._compile = function (compileItems) {
        var _this = this;
        var result = undefined;
        this.context = new Context_1.default(this.config);
        try {
            result = compileItems.reduce(function (target, item) {
                if (item.ref !== undefined) {
                    return _this._compileReference(item.ref, target);
                }
                else {
                    return _this._compileObject(item.object, target);
                }
            }, result);
        }
        catch (e) {
            throw new MergerError_1.default(e, this.context);
        }
        this.context = undefined;
        if (this.config.stringify) {
            result = JSON.stringify(result, null, this.config.stringify === "pretty" ? "\t" : undefined);
        }
        return result;
    };
    Merger.prototype._compileReference = function (ref, target) {
        var _a = ref.split("#"), filePath = _a[0], pointer = _a[1];
        var result = this._compileFile(filePath, target);
        return this._resolvePointer(result, pointer);
    };
    Merger.prototype._compileFile = function (filePath, target) {
        filePath = this._resolveFilePathInContext(filePath);
        var compiledFiles = this.compiledFileCache
            .filter(function (x) { return x.filePath === filePath && x.target === target; });
        if (compiledFiles.length > 1) {
            return compiledFiles[0].result;
        }
        var result;
        var source = this._readFile(filePath);
        if (source !== undefined) {
            this.context.enterSource(filePath, target, source);
            result = this._processUnknown(target, source);
            this.context.leaveSource();
            this.compiledFileCache.push({ filePath: filePath, target: target, result: result });
        }
        return result;
    };
    Merger.prototype._resolveReference = function (ref, target) {
        if (ref === "" || ref[0] === "#" || ref[0] === "/") {
            return this._resolvePointer(target, ref);
        }
        var _a = ref.split("#"), filePath = _a[0], pointer = _a[1];
        var result = this._readFile(filePath);
        return this._resolvePointer(result, pointer);
    };
    Merger.prototype._readFile = function (filePath) {
        filePath = this._resolveFilePathInContext(filePath);
        if (this.fileCache[filePath] !== undefined) {
            return this.fileCache[filePath];
        }
        var content;
        try {
            content = fs.readFileSync(filePath, "utf8");
        }
        catch (e) {
            if (this.config.throwOnInvalidRef) {
                throw new Error("The file \"" + filePath + "\" does not exist. Set options.throwOnInvalidRef to false to suppress this message");
            }
        }
        if (content !== undefined) {
            content = JSON.parse(content);
        }
        this.fileCache[filePath] = content;
        return content;
    };
    Merger.prototype._compileObject = function (source, target) {
        this.context.enterSource(undefined, target, source);
        var result = this._processUnknown(target, source);
        this.context.leaveSource();
        return result;
    };
    Merger.prototype._resolvePointer = function (target, pointer) {
        if (pointer === undefined) {
            return target;
        }
        var result = jsonPtr.get(target, pointer);
        if (result === undefined && this.config.throwOnInvalidRef) {
            throw new Error("The ref \"" + pointer + "\" does not exist. Set options.throwOnInvalidRef to false to suppress this message");
        }
        return result;
    };
    Merger.prototype._resolveFilePathInContext = function (filePath) {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        var currentFilePath = this.context.currentSource !== undefined && this.context.currentSource.filePath;
        var cwd = typeof currentFilePath === "string" ? path.dirname(currentFilePath) : this.config.cwd;
        return path.resolve(cwd, filePath);
    };
    Merger.prototype._processUnknown = function (target, source, propertyName) {
        this.context.enterProperty(propertyName);
        if (utils_1.isObject(source)) {
            source = this._processObject(target, source);
        }
        else if (Array.isArray(source)) {
            source = this._processArray(target, source);
        }
        this.context.leaveProperty();
        return source;
    };
    Merger.prototype._processObject = function (target, source) {
        var _this = this;
        if (source[this.context.indicators.Replace] !== undefined) {
            target = undefined;
        }
        if (source[this.context.indicators.Ref] !== undefined) {
            this.context.enterProperty(this.context.indicators.Ref);
            var value = this._resolveReference(source[this.context.indicators.Ref], this.context.currentSource.sourceRoot);
            this.context.enterSource();
            var result_1 = this._processUnknown(target, value);
            this.context.leaveSource();
            this.context.leaveProperty();
            return result_1;
        }
        if (source[this.context.indicators.Import] !== undefined) {
            this.context.enterProperty(this.context.indicators.Import);
            var value = this._compileReference(source[this.context.indicators.Import]);
            this.context.enterSource();
            var result_2 = this._processUnknown(target, value);
            this.context.leaveSource();
            this.context.leaveProperty();
            return result_2;
        }
        if (source[this.context.indicators.Remove] === true) {
            return undefined;
        }
        if (source[this.context.indicators.Value] !== undefined) {
            return this._processUnknown(target, source[this.context.indicators.Value], this.context.indicators.Value);
        }
        if (source[this.context.indicators.Merge] !== undefined) {
            this.context.enterProperty(this.context.indicators.Merge);
            var sourceProperty = source[this.context.indicators.Merge].source;
            var sourcePropertyTarget = undefined;
            this.context.enterSource(this.context.currentSource.filePath, sourcePropertyTarget, sourceProperty);
            var compiledSourceProperty = this._processUnknown(sourcePropertyTarget, sourceProperty, "source");
            this.context.leaveSource();
            var withProperty = source[this.context.indicators.Merge].with;
            var withPropertyTarget = compiledSourceProperty;
            this.context.enterSource(this.context.currentSource.filePath, withPropertyTarget, withProperty);
            var compiledWithProperty = this._processUnknown(withPropertyTarget, withProperty, "with");
            this.context.leaveSource();
            var compiledWithPropertyTarget = target;
            this.context.disableIndicators();
            this.context.enterSource(this.context.currentSource.filePath, compiledWithPropertyTarget, compiledWithProperty);
            var result_3 = this._processUnknown(compiledWithPropertyTarget, compiledWithProperty);
            this.context.leaveSource();
            this.context.enableIndicators();
            this.context.leaveProperty();
            return result_3;
        }
        if (source[this.context.indicators.Expression] !== undefined) {
            this.context.enterProperty(this.context.indicators.Expression);
            var evalExpression = source[this.context.indicators.Expression];
            var evalContext = {
                $source: source,
                $sourceRoot: this.context.currentSource.sourceRoot,
                $target: target,
                $targetRoot: this.context.currentSource.targetRoot
            };
            var result_4 = safeEval(evalExpression, evalContext);
            this.context.leaveProperty();
            return result_4;
        }
        if (source[this.context.indicators.Compile] !== undefined) {
            var compileProperty = source[this.context.indicators.Compile];
            var compilePropertyTarget = undefined;
            this.context.enterSource(this.context.currentSource.filePath, compilePropertyTarget, compileProperty);
            var compiledCompileProperty = this._processUnknown(compilePropertyTarget, compileProperty, this.context.indicators.Compile);
            this.context.leaveSource();
            var compiledCompilePropertyTarget = target;
            this.context.enterSource(this.context.currentSource.filePath, compiledCompilePropertyTarget, compiledCompileProperty);
            var result_5 = this._processUnknown(compiledCompilePropertyTarget, compiledCompileProperty, this.context.indicators.Compile);
            this.context.leaveSource();
            return result_5;
        }
        var result = {};
        if (!utils_1.isObject(target)) {
            target = {};
        }
        Object.keys(target).forEach(function (key) {
            result[key] = target[key];
        });
        Object.keys(source).forEach(function (key) {
            if (_this.context.indicatorsArray.indexOf(key) === -1) {
                result[key] = _this._processUnknown(target[key], source[key], key);
            }
        });
        if (source[this.context.indicators.Set] !== undefined) {
            var setValue = source[this.context.indicators.Set];
            var setItems = Array.isArray(setValue) ? setValue : [setValue];
            setItems.forEach(function (item) {
                result[item.key] = _this._processUnknown(undefined, item.value, item.key);
            });
        }
        return result;
    };
    Merger.prototype._processArray = function (target, source) {
        var _this = this;
        if (!Array.isArray(target)) {
            target = [];
        }
        var removeActions = [];
        var prependActions = [];
        var appendActions = [];
        var insertActions = [];
        var mergeActions = [];
        var moveActions = [];
        source.forEach(function (sourceItem, sourceItemIndex) {
            var matchingTargetItemIndex = mergeActions.length + removeActions.length;
            var matchedTargetItem;
            var matchedTargetItemIndex;
            if (sourceItem[_this.context.indicators.Match] !== undefined) {
                var path_1 = jsonpath.paths(target, sourceItem[_this.context.indicators.Match])[0];
                if (path_1 === undefined) {
                    return;
                }
                matchedTargetItemIndex = path_1[1];
                matchedTargetItem = target[matchedTargetItemIndex];
            }
            if (sourceItem[_this.context.indicators.Append] === true) {
                appendActions.push({
                    value: matchedTargetItem !== undefined ? matchedTargetItem : sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }
            else if (sourceItem[_this.context.indicators.Prepend] === true) {
                prependActions.push({
                    value: matchedTargetItem !== undefined ? matchedTargetItem : sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }
            else if (sourceItem[_this.context.indicators.Insert] !== undefined) {
                insertActions.push({
                    newTargetItemIndex: sourceItem[_this.context.indicators.Insert],
                    value: matchedTargetItem !== undefined ? matchedTargetItem : sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }
            else if (sourceItem[_this.context.indicators.Move] !== undefined) {
                moveActions.push({
                    newTargetItemIndex: sourceItem[_this.context.indicators.Move],
                    targetItem: target[matchedTargetItem !== undefined ? matchedTargetItemIndex : matchingTargetItemIndex],
                    value: matchedTargetItem !== undefined ? matchedTargetItem : sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }
            else if (sourceItem[_this.context.indicators.Remove] === true) {
                removeActions.push({
                    targetItemIndex: matchedTargetItem !== undefined ? matchedTargetItemIndex : matchingTargetItemIndex,
                    sourceItemIndex: sourceItemIndex
                });
            }
            else {
                mergeActions.push({
                    targetItemIndex: matchedTargetItem !== undefined ? matchedTargetItemIndex : matchingTargetItemIndex,
                    value: sourceItem,
                    sourceItemIndex: sourceItemIndex
                });
            }
        });
        var result = target.slice();
        mergeActions.forEach(function (action) {
            var targetItem = result[action.targetItemIndex];
            var item = _this._processUnknown(targetItem, action.value, action.sourceItemIndex);
            result[action.targetItemIndex] = item;
        });
        removeActions.forEach(function (action) {
            result.splice(action.targetItemIndex, 1);
        });
        moveActions.forEach(function (action) {
            var targetItem = undefined;
            result.forEach(function (item, index) {
                if (item === action.targetItem) {
                    targetItem = result.splice(index, 1)[0];
                }
            });
            var item = _this._processUnknown(targetItem, action.value, action.sourceItemIndex);
            var index = action.newTargetItemIndex === "-" ? result.length : action.newTargetItemIndex;
            result.splice(index, 0, item);
        });
        insertActions.forEach(function (action) {
            var item = _this._processUnknown(undefined, action.value, action.sourceItemIndex);
            var index = action.newTargetItemIndex === "-" ? result.length : action.newTargetItemIndex;
            result.splice(index, 0, item);
        });
        prependActions.reverse().forEach(function (action) {
            var item = _this._processUnknown(undefined, action.value, action.sourceItemIndex);
            result.unshift(item);
        });
        appendActions.forEach(function (action) {
            var item = _this._processUnknown(undefined, action.value, action.sourceItemIndex);
            result.push(item);
        });
        return result;
    };
    return Merger;
}());
exports.default = Merger;
//# sourceMappingURL=Merger.js.map