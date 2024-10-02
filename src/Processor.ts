import path from "path";
import jsonpath from "jsonpath";
import { JsonPointer } from "json-ptr";
import { isObject } from "./utils/types";
import {
  GlobalScope,
  Scope,
  Phase,
  RootMergeObjectScope,
  RootMergeFileScope,
  MergeFileScope,
  ScopeBase,
  MergeObjectScope,
  ScopeWithRoot,
  AnyScope,
} from "./Scope";
import Config from "./Config";
import DataLoader from "./DataLoader";
import Operation, { ProcessArrayItemResult } from "./operations/Operation";

/*
 * @TODO: Refactor the Processor/Scope/Phase construction
 */

export default class Processor {
  currentScope: AnyScope;

  private _cache: CacheItem[] = [];
  private _enabledOperationNames: string[] = [];
  private _nameOperationMap: NameOperationMap = {};
  private _operationNames: string[] = [];

  constructor(private _config: Config, private _dataLoader: DataLoader) {
    // Enable all operations
    this._enabledOperationNames = this._operationNames;
  }

  merge(sources: Source[]): any {
    // Create scope variables
    const scopeVariables = {
      $params: this._config.params,
    };

    // Create scope
    const scope = new GlobalScope();
    this._enterScope(scope);

    // Process and merge sources
    let result = sources.reduce((target: any, source) => {
      if (source.type === SourceType.Object) {
        target = this.mergeObject(source.object, target, scopeVariables);
      } else if (source.type === SourceType.Uri) {
        target = this.mergeFile(source.uri, target, scopeVariables);
      }
      return target;
    }, undefined);

    // Check if the AfterMerges phase should be executed
    if (scope.hasRegisteredPhase(Phase.AfterMerges)) {
      result = this.mergeObject(
        result,
        undefined,
        scopeVariables,
        Phase.AfterMerges
      );
    }

    // Leave global scope
    this._leaveScope();

    return result;
  }

  mergeFile(uri: string, target?: any, scopeVariables?: any) {
    return this.loadAndProcessFileByRef(uri, target, scopeVariables, true);
  }

  mergeObject(source: any, target?: any, scopeVariables?: any, phase?: Phase) {
    // Process
    const scope = new RootMergeObjectScope(
      source,
      target,
      this.currentScope,
      scopeVariables,
      phase
    );
    this._enterScope(scope);
    let result = this.processSource(source, target);
    this._leaveScope();

    // Check if the AfterMerge phase should be executed
    if (scope.hasRegisteredPhase(Phase.AfterMerge)) {
      result = this.mergeObject(
        result,
        target,
        scopeVariables,
        Phase.AfterMerge
      );
    }

    return result;
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
    operations.forEach((operation) => this.addOperation(operation));
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
    if (!this.startsWithOperationPrefix(input)) {
      return false;
    }
    const name = this.stripOperationPrefix(input);
    return this._nameOperationMap[name] !== undefined;
  }

  isEscapedKeyword(input: string): boolean {
    return this.isKeyword(this.stripOperationPrefix(input));
  }

  stripOperationPrefix(input: string): string {
    return input.substr(this._config.operationPrefix.length);
  }

  startsWithOperationPrefix(input: string): boolean {
    const prefix = this._config.operationPrefix;
    return input.substr(0, prefix.length) === prefix;
  }

  getCurrentUri(): string {
    const scope = this.currentScope as MergeFileScope;
    if (scope.root && scope.root.sourceFilePath) {
      return scope.root.sourceFilePath;
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

  loadAndProcessFile(
    uri: string,
    target?: any,
    scopeVariables?: any,
    isRoot: boolean = false
  ): any {
    // Get absolute URI
    const currentUri = this.getCurrentUri();
    const absoluteUri = this._dataLoader.toAbsoluteUri(uri, currentUri);

    // Determine the used scope variables
    let usedScopeVariables = scopeVariables;
    if (usedScopeVariables === undefined && this.currentScope) {
      usedScopeVariables = this.currentScope.localVariables;
    }

    // Hash the data that could change the output of the processing.
    // At the moment the target and scope variables can change the output.
    // But we don't need to hash the target because the DataLoader
    // always returns the same target reference.
    const hashedScopeVariables = JSON.stringify(usedScopeVariables);

    // Check cache
    const cacheItem = this._cache.filter(
      (x) =>
        x.absoluteUri === absoluteUri &&
        x.target === target &&
        x.hashedScopeVariables === hashedScopeVariables
    )[0];

    // Return cache result if found
    if (cacheItem) {
      if (cacheItem.executeAfterMergesPhase) {
        this.currentScope.registerPhase(Phase.AfterMerges);
      }
      return cacheItem.result;
    }

    // Load file
    const source = this._dataLoader.load(absoluteUri, currentUri);

    // Create scope variables
    scopeVariables = scopeVariables || {};

    // Copy current scope $params if no new $params are defined
    if (!scopeVariables.$params) {
      scopeVariables.$params = this.currentScope.scopeVariables.$params;
    }

    // Enter file root scope
    let scope;

    if (isRoot) {
      scope = new RootMergeFileScope(
        absoluteUri,
        source,
        target,
        this.currentScope,
        scopeVariables,
        this.currentScope.phase
      );
    } else {
      scope = new MergeFileScope(
        absoluteUri,
        source,
        target,
        this.currentScope,
        scopeVariables,
        this.currentScope.phase
      );
    }

    this._enterScope(scope);

    // Process source
    let result = this.processSource(source, target);

    // Check if an after merge phase should be executed
    if (scope.hasRegisteredPhase(Phase.AfterMerge)) {
      const mergeObjectScope = new MergeObjectScope(
        result,
        undefined,
        scope,
        scopeVariables,
        Phase.AfterMerge
      );
      this._enterScope(mergeObjectScope);
      result = this.processSource(result);
      this._leaveScope();
    }

    // Leave file root scope
    this._leaveScope();

    // Add to processed file cache
    const executeAfterMergesPhase = scope.hasRegisteredPhase(Phase.AfterMerges);
    this._cache.push({
      absoluteUri,
      target,
      hashedScopeVariables,
      result,
      executeAfterMergesPhase,
    });

    return result;
  }

  loadAndProcessFileByRef(
    ref: string,
    target?: any,
    scopeVariables?: object,
    isRoot: boolean = false
  ) {
    const [uri, pointer] = ref.split("#");
    let result = this.loadAndProcessFile(uri, target, scopeVariables, isRoot);
    if (pointer !== undefined) {
      result = this.resolveJsonPointer(result, pointer);
    }
    return result;
  }

  processSourcePropertyInNewMergeObjectScope(
    sourceProperty: any,
    sourcePropertyName: string,
    targetProperty?: any,
    scopeVariables?: any
  ) {
    const scope = new MergeObjectScope(
      sourceProperty,
      targetProperty,
      this.currentScope as ScopeWithRoot,
      scopeVariables
    );
    this._enterScope(scope);
    const result = this.processSourceProperty(
      sourceProperty,
      sourcePropertyName,
      targetProperty
    );
    this._leaveScope();
    return result;
  }

  processSourcePropertyInNewScope(
    sourceProperty: any,
    sourcePropertyName: string,
    targetProperty?: any,
    scopeVariables?: any
  ) {
    const scope = new Scope(this.currentScope as ScopeWithRoot, scopeVariables);
    this._enterScope(scope);
    const result = this.processSourceProperty(
      sourceProperty,
      sourcePropertyName,
      targetProperty
    );
    this._leaveScope();
    return result;
  }

  processSourceProperty(
    sourceProperty: any,
    sourcePropertyName: string,
    targetProperty?: any
  ) {
    this.currentScope.enterProperty(sourcePropertyName);
    const modifiedSourceProperty = this.addDefaultArrayMergeStrategy(
      sourceProperty,
      targetProperty
    );
    const result = this.processSource(modifiedSourceProperty, targetProperty);
    this.currentScope.leaveProperty();
    return result;
  }

  addDefaultArrayMergeStrategy(sourceProperty: any, targetProperty: any): any {
    const isBothArray =
      Array.isArray(sourceProperty) && Array.isArray(targetProperty);
    if (isBothArray) {
      const keyword = this.getKeyword(this._config.defaultArrayMergeOperation);
      return { [keyword]: sourceProperty };
    }
    return sourceProperty;
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
      if (source[keyword] !== undefined) {
        this.currentScope.enterProperty(keyword);
        const result = operation.processInObject(keyword, source, target);
        this.currentScope.leaveProperty();
        return result;
      }
    }

    // Make sure target is an object
    if (!isObject(target)) {
      target = {};
    }

    // Copy target properties to the result object
    const result = { ...target };

    // Process source properties and copy to result object
    Object.keys(source).forEach((key) => {
      // strip $comment properties
      if (this.stripOperationPrefix(key) === "comment") {
        return;
      }

      // process source property and copy to result
      const targetKey = this.isEscapedKeyword(key)
        ? this.stripOperationPrefix(key)
        : key;
      result[targetKey] = this.processSourceProperty(
        source[key],
        key,
        target[key]
      );

      // value of "undefined" indicates the property must be deleted (see "remove" operation)
      if (typeof result[targetKey] === "undefined") {
        delete result[targetKey];
      }
    });

    return result;
  }

  private _processArray(source: any[], target?: any) {
    // Make sure target is an array
    target = (Array.isArray(target) ? target : []) as any[];

    // Create the initial process result object
    let processResult: ProcessArrayItemResult = {
      resultArray: target.slice(),
      resultArrayIndex: -1,
    };

    // Process all source array items
    source.forEach((sourceItem, sourceItemIndex) => {
      this.currentScope.enterProperty(sourceItemIndex);
      processResult = this.processArrayItem(
        sourceItem,
        source,
        sourceItemIndex,
        processResult.resultArray,
        processResult.resultArrayIndex + 1,
        target
      );
      this.currentScope.leaveProperty();
    });

    return processResult.resultArray;
  }

  processArrayItem(
    source: any,
    sourceArray: any[],
    sourceArrayIndex: number,
    resultArray: any[],
    resultArrayIndex: number,
    target: any[]
  ): ProcessArrayItemResult {
    if (isObject(source)) {
      // Check if the array item is an operation
      for (let i = 0; i < this._enabledOperationNames.length; i++) {
        const name = this._enabledOperationNames[i];
        const operation = this._nameOperationMap[name];
        const keyword = this.getKeyword(name);
        if (source[keyword] !== undefined) {
          this.currentScope.enterProperty(keyword);
          const result = operation.processInArray(
            keyword,
            source,
            sourceArray,
            sourceArrayIndex,
            resultArray,
            resultArrayIndex,
            target
          );
          this.currentScope.leaveProperty();
          return result;
        }
      }
    }
    resultArray[resultArrayIndex] = this.processSource(
      source,
      resultArray[resultArrayIndex]
    );
    return { resultArray, resultArrayIndex };
  }

  resolveJsonPointer(target: object, pointer?: string): any {
    let result;

    if (pointer === undefined || pointer === "/") {
      result = target;
    } else {
      result = JsonPointer.get(target, pointer);
    }

    if (result === undefined && this._config.errorOnRefNotFound) {
      throw new Error(
        `The JSON pointer "${pointer}" resolves to undefined. Set Config.errorOnRefNotFound to false to suppress this message`
      );
    }

    return result;
  }

  resolveJsonPath(target: object, path?: string): any {
    let result: any;

    if (path === undefined) {
      result = target;
    } else if (isObject(target) || Array.isArray(target)) {
      result = jsonpath.query(target, path);
    }

    if (
      this._config.errorOnRefNotFound &&
      (result === undefined || result.length === 0)
    ) {
      throw new Error(
        `The JSON path "${path}" resolves to undefined. Set Config.errorOnRefNotFound to false to suppress this message`
      );
    }

    return result;
  }

  private _enterScope(scope: ScopeBase) {
    this.currentScope = scope;
    return this.currentScope;
  }

  private _leaveScope() {
    const currentScope = this.currentScope;
    this.currentScope = this.currentScope.parent;
    return currentScope;
  }
}

/*
 * TYPES
 */

interface CacheItem {
  absoluteUri: string;
  executeAfterMergesPhase: boolean;
  hashedScopeVariables: string;
  result: any;
  target: any;
}

interface NameOperationMap {
  [name: string]: Operation;
}

export const enum SourceType {
  Object,
  Uri,
}

export interface UriSource {
  uri: string;
  type: SourceType.Uri;
}

export interface ObjectSource {
  object: object;
  type: SourceType.Object;
}

export type Source = UriSource | ObjectSource;
