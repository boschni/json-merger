import * as path from "path";
import * as jsonpath from "jsonpath";
import * as jsonPtr from "json-ptr";
import {isObject} from "./utils/types";
import Scope from "./Scope";
import Config from "./Config";
import DataLoader from "./DataLoader";
import Operation from "./operations/Operation";

export default class Processor {

    currentScope: Scope;

    private _cache: CacheItem[] = [];
    private _enabledOperations: PrefixedKeywordOperationPair[] = [];
    private _keywordOperationMap: PrefixedKeywordOperationMap = {};
    private _operations: PrefixedKeywordOperationPair[] = [];
    private _scopes: Scope[] = [];

    constructor(
        private _config: Config,
        private _dataLoader: DataLoader
    ) {
        // Set enabled operations
        this._enabledOperations = this._operations;
    }

    addOperation(operation: Operation) {
        // Create prefixed keyword and operation pair
        const pair = {
            operation,
            prefixedKeyword: this._config.operationPrefix + operation.keyword()
        };

        // Add to the operations array
        this._operations.push(pair);

        // Add prefixed keyword to operation map for performance
        this._keywordOperationMap[pair.prefixedKeyword] = operation;
    }

    addOperations(operations: Operation[]) {
        operations.forEach(operation => this.addOperation(operation));
    }

    enableOperations() {
        this._enabledOperations = this._operations;
    }

    disableOperations() {
        this._enabledOperations = [];
    }

    isKeyword(input: string): boolean {
        return this._keywordOperationMap[input] !== undefined;
    }

    getCurrentUri(): string {
        if (this.currentScope && this.currentScope.sourceFilePath) {
            return this.currentScope.sourceFilePath;
        } else if (this._config.cwd !== "") {
            return path.join(this._config.cwd, "object.json");
        }
        return path.join(process.cwd(), "object.json");
    }

    loadFile(uri: string) {
        return this._dataLoader.load(uri, this.getCurrentUri());
    }

    loadFileByRef(ref: string) {
        const [uri, pointer] = ref.split("#");
        let result = this.loadFile(uri);
        if (pointer !== undefined) {
            result = this.resolveJsonPointer(result, pointer);
        }
        return result;
    }

    loadAndProcessFile(uri: string, target?: any, scopeVariables?: object): any {
        // Get absolute URI
        const currentUri = this.getCurrentUri();
        const sourceUri = this._dataLoader.toAbsoluteUri(uri, currentUri);

        // Check cache
        const cacheItem = this._cache
            .filter(x => x.uri === sourceUri && x.target === target && x.scopeVariables === scopeVariables)[0];

        // Return cache result if found
        if (cacheItem) {
            return cacheItem.result;
        }

        // Load file
        const source = this._dataLoader.load(sourceUri, currentUri);

        // Process source
        const result = this.processSourceWithUriInNewScope(source, sourceUri, target, scopeVariables);

        // Add to processed file cache
        this._cache.push({uri: sourceUri, target, result, scopeVariables});

        return result;
    }

    loadAndProcessFileByRef(ref: string, target?: any, scopeVariables?: object) {
        const [uri, pointer] = ref.split("#");
        let result = this.loadAndProcessFile(uri, target, scopeVariables);
        if (pointer !== undefined) {
            result = this.resolveJsonPointer(result, pointer);
        }
        return result;
    }

    processSourceInNewScope(source: any, target?: any, scopeVariables?: any) {
        this._enterScope(source, undefined, target, scopeVariables);
        const result = this.processSource(source, target);
        this._leaveScope();
        return result;
    }

    processSourceWithUriInNewScope(source: any, sourceUri?: string, target?: any, scopeVariables?: any) {
        this._enterScope(source, sourceUri, target, scopeVariables);
        const result = this.processSource(source, target);
        this._leaveScope();
        return result;
    }

    processSourcePropertyInNewScope(sourceProperty: any, sourcePropertyName: string, targetProperty?: any, scopeVariables?: any) {
        this._enterScope(sourceProperty, undefined, targetProperty, scopeVariables);
        const result = this.processSourceProperty(sourceProperty, sourcePropertyName, targetProperty);
        this._leaveScope();
        return result;
    }

    processSourceProperty(sourceProperty: any, sourcePropertyName: string, targetProperty?: any) {
        this.currentScope.enterProperty(sourcePropertyName);
        const result = this.processSource(sourceProperty, targetProperty);
        this.currentScope.leaveProperty();
        return result;
    }

    processSource(source: any, target?: any) {
        if (isObject(source)) {
            return this._processObject(source, target);
        } else if (Array.isArray(source)) {
            return this._processArray(source, target);
        }
        return source;
    }

    private _processObject(source: any, target: any) {
        // Check if the object is an operation
        for (let i = 0; i < this._enabledOperations.length; i++) {
            const pair = this._enabledOperations[i];
            const value = source[pair.prefixedKeyword];
            if (value !== undefined) {
                this.currentScope.enterProperty(pair.prefixedKeyword);
                const result = pair.operation.process(value, target);
                this.currentScope.leaveProperty();
                return result;
            }
        }

        // Make sure target is an object
        if (!isObject(target)) {
            target = {};
        }

        // Copy target properties to the result object
        const result = {...target};

        // Process source properties and copy to result object
        Object.keys(source).forEach((key) => {
            // Strip the operation prefix
            const possibleKeyword = key.substr(this._config.operationPrefix.length);

            // strip $comment properties
            if (possibleKeyword === "comment") {
                return;
            }

            // process source property and copy to result
            const targetKey = this.isKeyword(possibleKeyword) ? possibleKeyword : key;
            result[targetKey] = this.processSourceProperty(source[key], key, target[key]);
        });

        return result;
    }

    private _processArray(source: any[], target?: any) {
        // Make sure target is an array
        target = (Array.isArray(target) ? target : [])  as any[];

        // Create a copy of the target
        let result = target.slice();

        // Process all source array items
        source.forEach((sourceItem, sourceItemIndex) => {
            this.currentScope.enterProperty(sourceItemIndex);
            result = this.processArrayItem(sourceItem, source, sourceItemIndex, result, target);
            this.currentScope.leaveProperty();
        });

        return result;
    }

    processArrayItem(source: any, sourceArray: any[], sourceArrayIndex: number, resultArray: any[], target: any[]) {
        for (let i = 0; i < this._enabledOperations.length; i++) {
            const pair = this._enabledOperations[i];
            const value = source[pair.prefixedKeyword];
            if (value !== undefined) {
                this.currentScope.enterProperty(pair.prefixedKeyword);
                const result = pair.operation.processArrayItem(value, sourceArray, sourceArrayIndex, resultArray, target);
                this.currentScope.leaveProperty();
                return result;
            }
        }
        resultArray[sourceArrayIndex] = this.processSource(source, target[sourceArrayIndex]);
        return resultArray;
    }

    resolveJsonPointer(target: object, pointer?: string): any {
        let result;

        if (pointer === undefined || pointer === "/") {
            result = target;
        } else {
            result = jsonPtr.get(target, pointer);
        }

        if (result === undefined && this._config.errorOnRefNotFound) {
            throw new Error(`The JSON pointer "${pointer}" resolves to undefined. Set Config.errorOnRefNotFound to false to suppress this message`);
        }

        return result;
    }

    resolveJsonPath(target: object, path?: string): any {
        let result;

        if (path === undefined) {
            result = target;
        } else if (isObject(target) || Array.isArray(target)) {
            result = jsonpath.query(target, path);
        }

        if (result === undefined && this._config.errorOnRefNotFound) {
            throw new Error(`The JSON path "${path}" resolves to undefined. Set Config.errorOnRefNotFound to false to suppress this message`);
        }

        return result;
    }

    private _enterScope(source?: any, sourceFilePath?: string, target?: any, variables?: any) {
        this.currentScope = new Scope(this.currentScope, source, sourceFilePath, target, variables);
        this._scopes.push(this.currentScope);
    }

    private _leaveScope() {
        this._scopes.pop();
        this.currentScope = this._scopes[this._scopes.length - 1];
    }
}

/*
 * TYPES
 */

interface CacheItem {
    result: any;
    scopeVariables?: object;
    target: object;
    uri: string;
}

interface PrefixedKeywordOperationMap {
    [prefixedKeyword: string]: Operation;
}

interface PrefixedKeywordOperationPair {
    operation: Operation;
    prefixedKeyword: string;
}
