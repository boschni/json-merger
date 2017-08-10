import {NormalizedConfig} from "./config";

export default class Context {

    config: NormalizedConfig;
    sourceStack: Source[];
    currentSource?: Source;
    indicators: IndicatorMap;
    allIndicators: IndicatorMap;
    indicatorsArray: string[];
    allIndicatorsArray: string[];

    constructor(config: NormalizedConfig) {
        this.config = config;
        this.sourceStack = [];
        this.currentSource = undefined;
        this.allIndicators = this.createIndicatorMap(this.config.indicatorPrefix);
        this.allIndicatorsArray = Object
            .keys(this.allIndicators)
            .map((key: keyof IndicatorMap) => this.allIndicators[key]);
        this.indicators = this.allIndicators;
        this.indicatorsArray = this.allIndicatorsArray;
    }

    createIndicatorMap(prefix: string): IndicatorMap {
        const indicators = {
            Append: "append",
            Comment: "comment",
            Compile: "compile",
            Expression: "expression",
            Id: "id",
            Import: "import",
            Insert: "insert",
            Match: "match",
            Merge: "merge",
            Move: "move",
            Prepend: "prepend",
            Ref: "ref",
            Remove: "remove",
            Replace: "replace",
            Set: "set",
            Value: "value"
        };

        const indicatorMap: IndicatorMap = {};

        Object.keys(indicators).map((key: keyof IndicatorMap) => {
            indicatorMap[key] = prefix + indicators[key];
        });

        return indicatorMap;
    }

    enterSource(filePath?: string, targetRoot?: any, sourceRoot?: any) {
        if (this.currentSource) {
            filePath = filePath !== undefined ? filePath : this.currentSource.filePath;
            targetRoot = targetRoot !== undefined ? targetRoot : this.currentSource.targetRoot;
            sourceRoot = sourceRoot !== undefined ? sourceRoot : this.currentSource.sourceRoot;
        }
        this.currentSource = {filePath, path: [], targetRoot, sourceRoot};
        this.sourceStack.push(this.currentSource);
    }

    leaveSource() {
        this.sourceStack.pop();
        this.currentSource = this.sourceStack[this.sourceStack.length - 1];
    }

    enterProperty(propertyName?: string | number) {
        if (propertyName !== undefined) {
            this.currentSource.path.push(propertyName);
        }
    }

    leaveProperty() {
        this.currentSource.path.pop();
    }

    enableIndicators() {
        this.indicators = this.allIndicators;
        this.indicatorsArray = this.allIndicatorsArray;
    }

    disableIndicators() {
        this.indicators = {};
        this.indicatorsArray = [];
    }
}

export interface IndicatorMap {
    Append?: string;
    Comment?: string;
    Compile?: string;
    Expression?: string;
    Id?: string;
    Import?: string;
    Insert?: string;
    Match?: string;
    Merge?: string;
    Move?: string;
    Prepend?: string;
    Ref?: string;
    Remove?: string;
    Replace?: string;
    Set?: string;
    Value?: string;
}

export interface Source {
    filePath: string;
    path: Array<string | number>;
    sourceRoot: any;
    targetRoot: any;
}
