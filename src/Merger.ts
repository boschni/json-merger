import Config, { IConfig } from "./Config";
import DataLoader from "./DataLoader";
import MergerError from "./MergerError";
import Processor, { Source, SourceType } from "./Processor";

// Import file loaders
import FileLoader from "./fileLoaders/FileLoader";
import FsFileLoader from "./fileLoaders/FsFileLoader";

// Import deserializers
import DataDeserializer from "./dataDeserializers/DataDeserializer";
import JSONDataDeserializer from "./dataDeserializers/JSONDataDeserializer";
import YAMLDataDeserializer from "./dataDeserializers/YAMLDataDeserializer";

// Import serializers
import DataSerializer from "./dataSerializers/DataSerializer";
import JSONDataSerializer from "./dataSerializers/JSONDataSerializer";

// Import operations
import type Operation from "./operations/Operation";
import AfterMergeOperation from "./operations/AfterMergeOperation";
import AfterMergesOperation from "./operations/AfterMergesOperation";
import AppendOperation from "./operations/AppendOperation";
import CombineOperation from "./operations/CombineOperation";
import ConcatOperation from "./operations/ConcatOperation";
import ExpressionOperation from "./operations/ExpressionOperation";
import ImportOperation from "./operations/ImportOperation";
import IncludeOperation from "./operations/IncludeOperation";
import InsertOperation from "./operations/InsertOperation";
import MatchOperation from "./operations/MatchOperation";
import MergeOperation from "./operations/MergeOperation";
import MoveOperation from "./operations/MoveOperation";
import PrependOperation from "./operations/PrependOperation";
import RemoveOperation from "./operations/RemoveOperation";
import RepeatOperation from "./operations/RepeatOperation";
import ReplaceOperation from "./operations/ReplaceOperation";
import SelectOperation from "./operations/SelectOperation";

export default class Merger {
  private _config: Config;
  private _dataDeserializer: DataDeserializer;
  private _dataLoader: DataLoader;
  private _dataSerializer: DataSerializer;
  private _fileLoader: FileLoader;
  private _processor: Processor;

  constructor(config: Partial<IConfig>) {
    this._config = new Config(config);

    // Init file loader and add default loaders
    this._fileLoader = new FileLoader();
    this._fileLoader.addLoaders([[new FsFileLoader(), 1]]);

    // Init data deserializer and add default deserializers
    this._dataDeserializer = new DataDeserializer();
    this._dataDeserializer.addDeserializers([
      new JSONDataDeserializer(),
      new YAMLDataDeserializer(),
    ]);

    // Init data serializer and add default serializers
    this._dataSerializer = new DataSerializer();
    this._dataSerializer.addSerializers([new JSONDataSerializer()]);

    // Init data loader
    this._dataLoader = new DataLoader(
      this._config,
      this._dataDeserializer,
      this._fileLoader
    );

    // Init processor and add default operations
    this._processor = new Processor(this._config, this._dataLoader);

    const operations: Operation[] = [];

    if (this._config.enableExpressionOperation) {
      operations.push(new ExpressionOperation(this._processor));
    }

    operations.push(
      new RemoveOperation(this._processor),
      new ReplaceOperation(this._processor),
      new ImportOperation(this._processor),
      new CombineOperation(this._processor),
      new ConcatOperation(this._processor),
      new AppendOperation(this._processor),
      new PrependOperation(this._processor),
      new InsertOperation(this._processor),
      new SelectOperation(this._processor),
      new RepeatOperation(this._processor),
      new MatchOperation(this._processor),
      new MoveOperation(this._processor),
      new MergeOperation(this._processor),
      new IncludeOperation(this._processor),
      new AfterMergeOperation(this._processor),
      new AfterMergesOperation(this._processor)
    );

    this._processor.addOperations(operations);
  }

  mergeObject(object: object, config?: Partial<IConfig>) {
    const sources = [{ type: SourceType.Object, object } as Source];
    return this._merge(sources, config);
  }

  mergeObjects(objects: object[], config?: Partial<IConfig>) {
    const sources = objects.map(
      (object) => ({ type: SourceType.Object, object } as Source)
    );
    return this._merge(sources, config);
  }

  mergeFile(uri: string, config?: Partial<IConfig>) {
    const sources = [{ type: SourceType.Uri, uri } as Source];
    return this._merge(sources, config);
  }

  mergeFiles(uris: string[], config?: Partial<IConfig>) {
    const sources = uris.map(
      (uri) => ({ type: SourceType.Uri, uri } as Source)
    );
    return this._merge(sources, config);
  }

  setConfig(config?: Partial<IConfig>) {
    this._config.set(config);
  }

  clearCaches() {
    this._dataLoader.clearCache();
  }

  private _merge(sources: Source[], config?: Partial<IConfig>): any {
    // Set new config if given
    if (config !== undefined) {
      this.setConfig(config);
    }

    // Init result
    let result: any;

    try {
      result = this._processor.merge(sources);
    } catch (e) {
      throw new MergerError(e, this._processor.currentScope);
    }

    // Stringify?
    if (this._config.stringify) {
      const pretty = this._config.stringify === "pretty";
      result = this._dataSerializer.serialize(".json", result, pretty);
    }

    return result;
  }
}
