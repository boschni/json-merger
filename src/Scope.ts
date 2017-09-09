/*
 * BASE CLASS
 */

export class ScopeBase {

    parent?: ScopeBase;
    phase: Phase = Phase.Merge;
    registeredPhases: RegisteredPhasesMap = {};
    propertyPath: (string | number)[] = [];
    localVariables: Variables;
    scopeVariables: Variables = {};

    constructor(parent?: ScopeBase, localVariables?: Variables, phase?: Phase) {
        this.localVariables = localVariables;

        if (parent) {
            this.parent = parent;
            this.phase = parent.phase;
            this.scopeVariables = {...this.parent.scopeVariables};
            this.scopeVariables.$parent = this.parent.scopeVariables;
        }

        if (this.localVariables) {
            this.scopeVariables = {...this.scopeVariables, ...this.localVariables};
        }

        if (phase) {
            this.deregisterPhase(phase);
            this.phase = phase;
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

    registerPhase(phase: Phase) {
        let scope: ScopeBase = this;
        while (scope) {
            scope.registeredPhases[phase] = true;
            scope = scope.parent;
        }
    }

    deregisterPhase(phase: Phase) {
        let scope: ScopeBase = this;
        while (scope) {
            scope.registeredPhases[phase] = false;
            scope = scope.parent;
        }
    }

    hasRegisteredPhase(phase: Phase) {
        return this.registeredPhases[phase] === true;
    }
}

/*
 * PUBLIC CLASSES
 */

export class GlobalScope extends ScopeBase {}

export class RootMergeObjectScope extends ScopeBase {
    root: RootMergeObjectScope;
    source: any;
    target: any;
    constructor(source: any, target: any, parent: ScopeBase, variables?: Variables, phase?: Phase) {
        super(parent, variables, phase);
        this.root = this;
        this.source = source;
        this.target = target;
        this.scopeVariables.$root = this.root.scopeVariables;
        this.scopeVariables.$source = this.source;
        this.scopeVariables.$target = this.target;
    }
}

export class MergeObjectScope extends ScopeBase {
    root: ScopeWithRoot;
    source: any;
    target: any;
    constructor(source: any, target: any, parent: ScopeWithRoot, variables?: Variables, phase?: Phase) {
        super(parent, variables, phase);
        this.root = parent.root;
        this.source = source;
        this.target = target;
        this.scopeVariables.$root = this.root.scopeVariables;
        this.scopeVariables.$source = this.source;
        this.scopeVariables.$target = this.target;
    }
}

export class RootMergeFileScope extends ScopeBase {
    root: RootMergeFileScope;
    source: any;
    sourceFilePath: string;
    sourceFileName: string;
    target: any;
    constructor(sourceFilePath: string, source: any, target: any, parent: ScopeBase, variables?: Variables, phase?: Phase) {
        super(parent, variables, phase);
        this.root = this;
        this.source = source;
        this.target = target;
        this.sourceFilePath = sourceFilePath;
        this.sourceFileName = this.sourceFilePath.replace(/^.*[\\\/:]/, "").replace(/\.[^/.]+$/, "");
        this.scopeVariables.$root = this.root.scopeVariables;
        this.scopeVariables.$source = this.source;
        this.scopeVariables.$target = this.target;
        this.scopeVariables.$sourceFilePath = this.sourceFilePath;
        this.scopeVariables.$sourceFileName = this.sourceFileName;
    }
}

export class MergeFileScope extends ScopeBase {
    root: MergeFileScope;
    sourceFileName: string;
    constructor(public sourceFilePath: string, public source: any, public target: any, parent: ScopeBase, variables?: Variables, phase?: Phase) {
        super(parent, variables, phase);
        this.root = this;
        this.sourceFileName = this.sourceFilePath.replace(/^.*[\\\/:]/, "").replace(/\.[^/.]+$/, "");
        this.scopeVariables.$root = this.root.scopeVariables;
        this.scopeVariables.$source = this.source;
        this.scopeVariables.$target = this.target;
        this.scopeVariables.$sourceFilePath = this.sourceFilePath;
        this.scopeVariables.$sourceFileName = this.sourceFileName;
    }
}

export class Scope extends ScopeBase {
    root: ScopeWithRoot;
    constructor(parent: ScopeWithRoot, variables?: Variables, phase?: Phase) {
        super(parent, variables, phase);
        this.root = parent.root;
        this.scopeVariables.$root = this.root.scopeVariables;
    }
}

export type ScopeWithRoot = RootMergeFileScope | RootMergeObjectScope | MergeFileScope | MergeObjectScope | Scope;

export type AnyScope = GlobalScope | ScopeWithRoot;

/*
 * TYPES
 */

export const enum Phase {
    AfterMerge = "afterMerge",
    AfterMerges = "afterMerges",
    Merge = "merge"
}

export interface RegisteredPhasesMap {
    [phase: string]: boolean;
}

export interface Variables {
    [name: string]: any;
}
