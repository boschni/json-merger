import { encodePointer } from "json-ptr";
import {
  GlobalScope,
  MergeFileScope,
  RootMergeFileScope,
  ScopeBase,
} from "./Scope";

export default class MergerError extends Error {
  constructor(originalError: Error, scope: ScopeBase) {
    super();

    // Set the prototype explicitly because because new.target
    // is not available in ES5 runtime environments.
    (this as any).__proto__ = MergerError.prototype;

    const message = this._createMessage(scope);
    const stack = this._createProcessingStackTrace(scope);
    this.name = "MergerError";
    this.message = `${message}${stack}\n${originalError.message}`;
    this.stack = `${message}${stack}\n${originalError.stack}`;
  }

  private _createMessage(scope: ScopeBase) {
    let message = "";
    if (scope) {
      const lastProp = scope.propertyPath[scope.propertyPath.length - 1];
      message = `An error occurred while processing the property "${lastProp}"\n`;
    }
    return message;
  }

  private _createProcessingStackTrace(scope: ScopeBase) {
    let trace = "";
    let currentScope = scope;
    while (currentScope && !(currentScope instanceof GlobalScope)) {
      const pathEncoded = encodePointer(currentScope.propertyPath);
      let filePath = "";
      if (
        currentScope instanceof MergeFileScope ||
        currentScope instanceof RootMergeFileScope
      ) {
        filePath = currentScope.sourceFilePath;
      }
      trace += `    at ${filePath}#${pathEncoded}\n`;
      currentScope = currentScope.parent;
    }
    return trace;
  }
}
