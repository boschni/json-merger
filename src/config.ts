import {FileMap} from "./Merger";

export function normalize(config?: Config): NormalizedConfig {
    config = config || {};
    const normalized: Partial<NormalizedConfig> = {};
    normalized.cwd = typeof config.cwd === "string" ? config.cwd : "";
    normalized.files = config.files;
    normalized.indicatorPrefix = typeof config.indicatorPrefix === "string" ? config.indicatorPrefix : "$";
    normalized.throwOnInvalidRef = config.throwOnInvalidRef !== false;
    normalized.stringify = config.stringify === true || config.stringify === "pretty" ? config.stringify : false;
    return normalized as NormalizedConfig;
}

export interface NormalizedConfig {
    cwd: string; // the current working directory in which to search. Defaults to process.cwd().
    files: FileMap; // object containing paths and the resulting objects that can be referenced while processing
    indicatorPrefix: string // the prefix to indicate a property is an indicator like $import.
    stringify: boolean | "pretty"; // should the output be stringified?
    throwOnInvalidRef: boolean; // should we throw if a file or JSON reference does not exist?
}

export interface Config extends Partial<NormalizedConfig> {}
