import Merger, {JsonObject} from "./Merger";
import {Config} from "./config";

export function fromObject(object: JsonObject, config?: Config) {
    const merger = new Merger(config);
    return merger.fromObject(object);
}

export function mergeObjects(objects: JsonObject[], config?: Config) {
    const merger = new Merger(config);
    return merger.mergeObjects(objects);
}

export function fromFile(file: string, config?: Config) {
    const merger = new Merger(config);
    return merger.fromFile(file);
}

export function mergeFiles(files: string[], config?: Config) {
    const merger = new Merger(config);
    return merger.mergeFiles(files);
}

export {Merger};

export default Merger;
