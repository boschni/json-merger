import * as jsonPtr from "json-ptr";
import Scope, {ScopeType} from "./Scope";

export default class MergerError extends Error {

    constructor(originalError: Error, scope: Scope) {
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

    private _createMessage(scope: Scope) {
        let message = "";
        if (scope) {
            const lastProp = scope.propertyPath[scope.propertyPath.length - 1];
            message = `An error occurred while processing the property "${lastProp}"\n`;
        }
        return message;
    }

    private _createProcessingStackTrace(scope: Scope) {
        let trace = "";
        let currentScope = scope;
        while (currentScope && currentScope.type !== ScopeType.MergeRoot) {
            const pathEncoded = jsonPtr.encodePointer(currentScope.propertyPath);
            const file = currentScope.sourceFilePath === undefined ? "" : currentScope.sourceFilePath;
            trace += `    at ${file}#${pathEncoded}\n`;
            currentScope = currentScope.parent;
        }
        return trace;
    }
}
