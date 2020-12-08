import Operation from "./Operation";

export default class MergeOperation extends Operation {
  name() {
    return "merge";
  }

  processInObject(keyword: string, source: any, target?: any) {
    const keywordValue: MergeKeywordValue = source[keyword];

    // Process $merge.source property without a target
    const processedSourceProperty = this._processor.processSourcePropertyInNewMergeObjectScope(
      keywordValue.source,
      "source"
    );

    // Process $merge.with property and use the processed $merge.source property as target
    const processedWithProperty = this._processor.processSourcePropertyInNewMergeObjectScope(
      keywordValue.with,
      "with",
      processedSourceProperty
    );

    // Process $merge result and use the original target as target
    return this._processor.processSource(processedWithProperty, target);
  }
}

/*
 * TYPES
 */

export interface MergeKeywordValue {
  source: any; // the value to merge
  with: any; // the value to merge with
}
