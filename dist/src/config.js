"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function normalize(config) {
    config = config || {};
    var normalized = {};
    normalized.cwd = typeof config.cwd === "string" ? config.cwd : "";
    normalized.indicatorPrefix = typeof config.indicatorPrefix === "string" ? config.indicatorPrefix : "$";
    normalized.throwOnInvalidRef = config.throwOnInvalidRef !== false;
    normalized.stringify = config.stringify === true || config.stringify === "pretty" ? config.stringify : false;
    return normalized;
}
exports.normalize = normalize;
//# sourceMappingURL=config.js.map