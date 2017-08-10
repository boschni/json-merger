"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var jsonPtr = require("json-ptr");
var MergerError = (function (_super) {
    __extends(MergerError, _super);
    function MergerError(originalError, context) {
        var _this = _super.call(this) || this;
        _this.__proto__ = MergerError.prototype;
        var message = _this._createMessage(context);
        var stack = _this._createProcessingStackTrace(context);
        _this.name = "MergerError";
        _this.message = "" + message + stack + "\n" + originalError.message;
        _this.stack = "" + message + stack + "\n" + originalError.stack;
        return _this;
    }
    MergerError.prototype._createMessage = function (context) {
        var message = "";
        if (context.currentSource) {
            var lastProp = context.currentSource.path[context.currentSource.path.length - 1];
            message = "An error occurred while processing the property \"" + lastProp + "\"\n";
        }
        return message;
    };
    MergerError.prototype._createProcessingStackTrace = function (context) {
        return context.sourceStack.reverse().reduce(function (trace, source) {
            var pathEncoded = jsonPtr.encodePointer(source.path);
            var file = source.filePath === undefined ? "" : source.filePath;
            return trace + "    at " + file + "#" + pathEncoded + "\n";
        }, "");
    };
    return MergerError;
}(Error));
exports.default = MergerError;
//# sourceMappingURL=MergerError.js.map