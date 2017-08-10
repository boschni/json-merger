import { NormalizedConfig } from "./config";
export default class Context {
    config: NormalizedConfig;
    sourceStack: Source[];
    currentSource?: Source;
    indicators: IndicatorMap;
    allIndicators: IndicatorMap;
    indicatorsArray: string[];
    allIndicatorsArray: string[];
    constructor(config: NormalizedConfig);
    createIndicatorMap(prefix: string): IndicatorMap;
    enterSource(filePath?: string, targetRoot?: any, sourceRoot?: any): void;
    leaveSource(): void;
    enterProperty(propertyName?: string | number): void;
    leaveProperty(): void;
    enableIndicators(): void;
    disableIndicators(): void;
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
