import Merger, { JsonObject } from "./src/Merger";
import { Config } from "./src/config";
export declare function fromObject(object: JsonObject, config?: Config): any;
export declare function mergeObjects(objects: JsonObject[], config?: Config): any;
export declare function fromFile(file: string, config?: Config): any;
export declare function mergeFiles(files: string[], config?: Config): any;
export { Merger };
export default Merger;
