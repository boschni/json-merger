export declare function normalize(config?: Config): NormalizedConfig;
export interface NormalizedConfig {
    cwd: string;
    indicatorPrefix: string;
    throwOnInvalidRef: boolean;
    stringify: boolean | "pretty";
}
export interface Config extends Partial<NormalizedConfig> {
}
