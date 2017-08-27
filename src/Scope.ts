export default class Scope {

    root: Scope;
    parent?: Scope;
    source: any;
    sourceFilePath?: string;
    target?: any;
    propertyPath: (string | number)[] = [];
    variables: {[key: string]: any} = {};

    constructor(parentScope?: Scope, source?: any, sourceFilePath?: string, target?: any, variables?: any) {
        // copy parent scope properties if available
        if (parentScope) {
            Object.keys(parentScope).forEach((key: keyof Scope) => this[key] = parentScope[key]);
        } else {
            this.root = this;
        }

        // set references
        this.parent = parentScope;
        this.source = source;
        this.target = target;

        // set the source file path if given
        if (sourceFilePath !== undefined) {
            this.sourceFilePath = sourceFilePath;
        }

        // add variables if given
        if (variables) {
            this.variables = {...this.variables};
            Object.keys(variables).forEach(key => this.variables[key] = variables[key]);
        }
    }

    enterProperty(propertyName?: string | number) {
        if (propertyName !== undefined) {
            this.propertyPath.push(propertyName);
        }
    }

    leaveProperty() {
        this.propertyPath.pop();
    }

    getScopeVariables(): any {
        const scopeVariables: any = {
            ...this.variables,
            $source: this.source,
            $target: this.target
        };
        scopeVariables.$parent = this.parent ? this.parent.getScopeVariables() : undefined;
        scopeVariables.$root = this.root === this ? scopeVariables : this.root.getScopeVariables();
        return scopeVariables;
    }
}
