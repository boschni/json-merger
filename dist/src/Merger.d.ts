import { Config } from "./config";
export default class Merger {
    private config;
    private context;
    private fileCache;
    private compiledFileCache;
    constructor(config: Config);
    setConfig(config: Config): void;
    resetCaches(): void;
    fromObject(object: JsonObject): any;
    mergeObjects(objects: JsonObject[]): any;
    fromFile(ref: string): any;
    mergeFiles(refs: string[]): any;
    private _compile(compileItems);
    private _compileReference(ref, target?);
    private _compileFile(filePath, target?);
    private _resolveReference(ref, target?);
    private _readFile(filePath);
    private _compileObject(source, target?);
    private _resolvePointer(target, pointer?);
    private _resolveFilePathInContext(filePath);
    private _processUnknown(target, source, propertyName?);
    private _processObject(target, source);
    private _processArray(target, source);
}
export declare type JsonObject = UntypedObject | UntypedArray;
export interface UntypedObject {
    [key: string]: any;
    [key: number]: any;
}
export interface UntypedArray extends Array<any> {
}
