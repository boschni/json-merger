import Merger from "./Merger";
import { IConfig } from "./Config";

export function mergeObject(object: object, config?: Partial<IConfig>) {
  const merger = new Merger(config);
  return merger.mergeObject(object);
}

export function mergeObjects(objects: object[], config?: Partial<IConfig>) {
  const merger = new Merger(config);
  return merger.mergeObjects(objects);
}

export function mergeFile(file: string, config?: Partial<IConfig>) {
  const merger = new Merger(config);
  return merger.mergeFile(file);
}

export function mergeFiles(files: string[], config?: Partial<IConfig>) {
  const merger = new Merger(config);
  return merger.mergeFiles(files);
}

export { Merger };

export default Merger;
