import Merger from "./Merger";
import {Config} from "./config";

export function mergeObject(object: object, config?: Config) {
    const merger = new Merger(config);
    return merger.mergeObject(object);
}

export function mergeObjects(objects: object[], config?: Config) {
    const merger = new Merger(config);
    return merger.mergeObjects(objects);
}

export function mergeFile(file: string, config?: Config) {
    const merger = new Merger(config);
    return merger.mergeFile(file);
}

export function mergeFiles(files: string[], config?: Config) {
    const merger = new Merger(config);
    return merger.mergeFiles(files);
}

export {Merger};

export default Merger;
