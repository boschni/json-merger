import {FileMap} from "./Merger";

export function normalize(config?: Config): NormalizedConfig {
    config = config || {};
    const normalized: Partial<NormalizedConfig> = {};
    normalized.cwd = typeof config.cwd === "string" ? config.cwd : "";
    normalized.files = config.files;
    normalized.operationPrefix = typeof config.operationPrefix === "string" ? config.operationPrefix : "$";
    normalized.errorOnFileNotFound = config.errorOnFileNotFound !== false;
    normalized.errorOnRefNotFound = config.errorOnRefNotFound !== false;
    normalized.stringify = config.stringify === true || config.stringify === "pretty" ? config.stringify : false;
    return normalized as NormalizedConfig;
}

export interface NormalizedConfig {
    cwd: string; // the current working directory in which to search. Defaults to process.cwd().
    files: FileMap; // object containing paths and the resulting objects that can be referenced while processing
    operationPrefix: string; // the prefix to indicate a property is an operation like $import.
    stringify: boolean | "pretty"; // should the output be stringified?
    errorOnFileNotFound: boolean; // should we throw an error if a file does not exist?
    errorOnRefNotFound: boolean; // should we throw an error if a JSON pointer or JSON path returns undefined?
}

export interface Config extends Partial<NormalizedConfig> {}
