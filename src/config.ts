export function normalize(config?: Config): NormalizedConfig {
    config = config || {};
    const normalized: Partial<NormalizedConfig> = {};
    normalized.cwd = typeof config.cwd === "string" ? config.cwd : "";
    normalized.indicatorPrefix = typeof config.indicatorPrefix === "string" ? config.indicatorPrefix : "$";
    normalized.throwOnInvalidRef = config.throwOnInvalidRef !== false;
    normalized.stringify = config.stringify === true || config.stringify === "pretty" ? config.stringify : false;
    return normalized as NormalizedConfig;
}

export interface NormalizedConfig {
    cwd: string; // the current working directory in which to search. Defaults to process.cwd().
    indicatorPrefix: string // the prefix to indicate a property is an indicator like $import.
    throwOnInvalidRef: boolean; // should we throw if a file or JSON reference does not exist?
    stringify: boolean | "pretty"; // should the output be stringified?
}

export interface Config extends Partial<NormalizedConfig> {}
