"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Context = (function () {
    function Context(config) {
        var _this = this;
        this.config = config;
        this.sourceStack = [];
        this.currentSource = undefined;
        this.allIndicators = this.createIndicatorMap(this.config.indicatorPrefix);
        this.allIndicatorsArray = Object
            .keys(this.allIndicators)
            .map(function (key) { return _this.allIndicators[key]; });
        this.indicators = this.allIndicators;
        this.indicatorsArray = this.allIndicatorsArray;
    }
    Context.prototype.createIndicatorMap = function (prefix) {
        var indicators = {
            Append: "append",
            Comment: "comment",
            Compile: "compile",
            Expression: "expression",
            Id: "id",
            Import: "import",
            Insert: "insert",
            Match: "match",
            Merge: "merge",
            Move: "move",
            Prepend: "prepend",
            Ref: "ref",
            Remove: "remove",
            Replace: "replace",
            Set: "set",
            Value: "value"
        };
        var indicatorMap = {};
        Object.keys(indicators).map(function (key) {
            indicatorMap[key] = prefix + indicators[key];
        });
        return indicatorMap;
    };
    Context.prototype.enterSource = function (filePath, targetRoot, sourceRoot) {
        if (this.currentSource) {
            filePath = filePath !== undefined ? filePath : this.currentSource.filePath;
            targetRoot = targetRoot !== undefined ? targetRoot : this.currentSource.targetRoot;
            sourceRoot = sourceRoot !== undefined ? sourceRoot : this.currentSource.sourceRoot;
        }
        this.currentSource = { filePath: filePath, path: [], targetRoot: targetRoot, sourceRoot: sourceRoot };
        this.sourceStack.push(this.currentSource);
    };
    Context.prototype.leaveSource = function () {
        this.sourceStack.pop();
        this.currentSource = this.sourceStack[this.sourceStack.length - 1];
    };
    Context.prototype.enterProperty = function (propertyName) {
        if (propertyName !== undefined) {
            this.currentSource.path.push(propertyName);
        }
    };
    Context.prototype.leaveProperty = function () {
        this.currentSource.path.pop();
    };
    Context.prototype.enableIndicators = function () {
        this.indicators = this.allIndicators;
        this.indicatorsArray = this.allIndicatorsArray;
    };
    Context.prototype.disableIndicators = function () {
        this.indicators = {};
        this.indicatorsArray = [];
    };
    return Context;
}());
exports.default = Context;
//# sourceMappingURL=Context.js.map