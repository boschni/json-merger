class Config {

    constructor(config) {
        config = config || {};

        // the current working directory in which to search. Defaults to process.cwd().
        this.cwd = typeof config.cwd === "string" ? config.cwd : "";

        // the prefix to indicate some property is an indicators
        this.indicatorPrefix = typeof config.indicatorPrefix === "string" ? config.indicatorPrefix : "$";

        // should we throw if a ref does not resolve?
        this.throwOnInvalidRef = config.throwOnInvalidRef !== false;

        // should the output be stringified?
        this.stringify = config.stringify === true || config.stringify === "pretty" ? config.stringify : false;
    }
}

module.exports = Config;
