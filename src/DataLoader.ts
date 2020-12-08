import Config from "./Config";
import DataDeserializer from "./dataDeserializers/DataDeserializer";
import FileLoader from "./fileLoaders/FileLoader";

export default class DataLoader {
  private _cache: Cache = {};

  constructor(
    private _config: Config,
    private _dataDeserializer: DataDeserializer,
    private _fileLoader: FileLoader
  ) {}

  load(uri: string, currentUri: string): any {
    const absoluteUri = this.toAbsoluteUri(uri, currentUri);

    // Check cache
    if (this._cache[absoluteUri]) {
      return this._cache[absoluteUri];
    }

    let content;

    try {
      content = this._fileLoader.load(uri, currentUri);
    } catch (e) {
      if (this._config.errorOnFileNotFound) {
        throw new Error(
          `The file "${uri}" does not exist. Set Config.errorOnFileNotFound to false to suppress this message`
        );
      }
      return;
    }

    let result;

    // Deserialize if a file was found
    if (content !== undefined) {
      result = this._dataDeserializer.deserialize(uri, content);
    }

    // Add to cache
    this._cache[absoluteUri] = result;

    // Return result
    return result;
  }

  toAbsoluteUri(uri: string, currentUri: string): string | undefined {
    return this._fileLoader.toAbsoluteUri(uri, currentUri);
  }

  clearCache() {
    this._cache = {};
    this._fileLoader.clearCache();
  }
}

/*
 * TYPES
 */

interface Cache {
  [absoluteUri: string]: any;
}
