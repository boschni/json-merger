export default class Scope {

    type: ScopeType;
    mergeRoot: Scope;
    root: Scope;
    parent?: Scope;
    source: any;
    sourceFilePath?: string;
    sourceFilename?: string;
    target?: any;
    phase: Phase;
    phasesToProcess: {[phase: string]: boolean} = {};
    propertyPath: (string | number)[] = [];
    variables: {[key: string]: any} = {};

    constructor(type: ScopeType, parentScope?: Scope, source?: any, sourceFilePath?: string, target?: any, variables?: any, phase?: Phase) {
        // copy parent scope properties if available
        if (parentScope) {
            Object.keys(parentScope)
                .forEach((key: keyof Scope) => this[key] = parentScope[key]);
        }

        // Set type
        this.type = type;

        // Is this a merge root scope?
        if (this.type === ScopeType.MergeRoot) {
            this.mergeRoot = this;
        }

        // Is this a file root scope?
        if (this.type === ScopeType.FileRoot) {
            this.root = this;
            this.sourceFilePath = sourceFilePath;
            this.sourceFilename = sourceFilePath.replace(/^.*[\\\/:]/, "").replace(/\.[^/.]+$/, "");
        }

        // Is this an object root scope?
        if (this.type === ScopeType.ObjectRoot) {
            this.root = this;
        }

        // Set references
        this.parent = parentScope;
        this.source = source;
        this.target = target;

        // Set phase if given
        if (phase !== undefined) {
            this.phase = phase;
        }

        // Add variables if given
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

    toPublicScope(): any {
        const scopeVariables: any = {
            ...this.variables,
            $source: this.source,
            $sourceFilename: this.sourceFilename,
            $target: this.target
        };

        if (this.root) {
            scopeVariables.$parent = this.parent ? this.parent.toPublicScope() : undefined;
            scopeVariables.$root = this.root === this ? scopeVariables : this.root.toPublicScope();
        }

        return scopeVariables;
    }

    executePhase(phase: Phase) {
        if (phase === Phase.AfterMerge) {
            this.root.phasesToProcess[Phase.AfterMerge] = true;
        } else if (phase === Phase.AfterMerges) {
            this.mergeRoot.phasesToProcess[Phase.AfterMerges] = true;
        }
    }
}

/*
 * TYPES
 */

export const enum Phase {
    AfterMerge = "afterMerge",
    AfterMerges = "afterMerges",
}

export const enum ScopeType {
    FileRoot,
    MergeRoot,
    Object,
    ObjectRoot
}
