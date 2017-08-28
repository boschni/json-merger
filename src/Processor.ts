import * as path from "path";
import * as jsonpath from "jsonpath";
import * as jsonPtr from "json-ptr";
import {isObject} from "./utils/types";
import Scope from "./Scope";
import Config from "./Config";
import DataLoader from "./DataLoader";
import Operation, {ProcessArrayItemResult} from "./operations/Operation";

export default class Processor {

    currentScope: Scope;

    private _cache: CacheItem[] = [];
    private _enabledOperationNames: string[] = [];
    private _nameOperationMap: NameOperationMap = {};
    private _operationNames: string[] = [];
    private _scopes: Scope[] = [];

    constructor(
        private _config: Config,
        private _dataLoader: DataLoader
    ) {
        // Enable all operations
        this._enabledOperationNames = this._operationNames;
    }

    addOperation(operation: Operation) {
        // Get operation name
        const name = operation.name();

        // Add to name to operation map
        this._nameOperationMap[name] = operation;

        // Add to the operation names array
        this._operationNames.push(name);
    }

    addOperations(operations: Operation[]) {
        operations.forEach(operation => this.addOperation(operation));
    }

    enableOperations() {
        this._enabledOperationNames = this._operationNames;
    }

    disableOperations() {
        this._enabledOperationNames = [];
    }

    getKeyword(operationName: string): string {
        return this._config.operationPrefix + operationName;
    }

    isKeyword(input: string): boolean {
        const name = input.substr(this._config.operationPrefix.length);
        return this._nameOperationMap[name] !== undefined;
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
        const absoluteUri = this._dataLoader.toAbsoluteUri(uri, currentUri);

        // Determine the used scope variables
        let usedScopeVariables = scopeVariables;
        if (usedScopeVariables === undefined && this.currentScope) {
            usedScopeVariables = this.currentScope.variables;
        }

        // Hash the data that could change the output of the processing.
        // At the moment the target and scope variables can change the output.
        const hashedTarget = JSON.stringify(target);
        const hashedScopeVariables = JSON.stringify(usedScopeVariables);

        // Check cache
        const cacheItem = this._cache
            .filter(x => (
                x.absoluteUri === absoluteUri
                && x.hashedTarget === hashedTarget
                && x.hashedScopeVariables === hashedScopeVariables
            ))[0];

        // Return cache result if found
        if (cacheItem) {
            return cacheItem.result;
        }

        // Load file
        const source = this._dataLoader.load(absoluteUri, currentUri);

        // Process source
        const result = this.processSourceWithUriInNewScope(source, absoluteUri, target, scopeVariables);

        // Add to processed file cache
        this._cache.push({absoluteUri, hashedTarget, hashedScopeVariables, result});

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
        for (let i = 0; i < this._enabledOperationNames.length; i++) {
            const name = this._enabledOperationNames[i];
            const operation = this._nameOperationMap[name];
            const keyword = this.getKeyword(name);
            const value = source[keyword];
            if (value !== undefined) {
                this.currentScope.enterProperty(keyword);
                const result = operation.processInObject(value, target);
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

        // Create the initial process result object
        let processResult: ProcessArrayItemResult = {
            resultArray: target.slice(),
            resultArrayIndex: -1
        };

        // Process all source array items
        source.forEach((sourceItem, sourceItemIndex) => {
            this.currentScope.enterProperty(sourceItemIndex);
            processResult = this.processArrayItem(sourceItem, source, sourceItemIndex, processResult.resultArray, processResult.resultArrayIndex + 1, target);
            this.currentScope.leaveProperty();
        });

        return processResult.resultArray;
    }

    processArrayItem(source: any, sourceArray: any[], sourceArrayIndex: number, resultArray: any[], resultArrayIndex: number, target: any[]): ProcessArrayItemResult {
        // Check if the array item is an operation
        for (let i = 0; i < this._enabledOperationNames.length; i++) {
            const name = this._enabledOperationNames[i];
            const operation = this._nameOperationMap[name];
            const keyword = this.getKeyword(name);
            const value = source[keyword];
            if (value !== undefined) {
                this.currentScope.enterProperty(keyword);
                const result = operation.processInArray(value, sourceArray, sourceArrayIndex, resultArray, resultArrayIndex, target);
                this.currentScope.leaveProperty();
                return result;
            }
        }
        resultArray[resultArrayIndex] = this.processSource(source, resultArray[resultArrayIndex]);
        return {resultArray, resultArrayIndex};
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
    absoluteUri: string;
    hashedScopeVariables: string;
    hashedTarget: string;
    result: any;
}

interface NameOperationMap {
    [name: string]: Operation;
}
