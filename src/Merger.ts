import Config, {IConfig} from "./Config";
import DataLoader from "./DataLoader";
import MergerError from "./MergerError";
import Processor from "./Processor";

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
import RemoveOperation from "./operations/RemoveOperation";
import ReplaceOperation from "./operations/ReplaceOperation";
import MergeOperation from "./operations/MergeOperation";
import ExpressionOperation from "./operations/ExpressionOperation";
import ImportOperation from "./operations/ImportOperation";
import AppendOperation from "./operations/AppendOperation";
import PrependOperation from "./operations/PrependOperation";
import InsertOperation from "./operations/InsertOperation";
import SelectOperation from "./operations/SelectOperation";
import RepeatOperation from "./operations/RepeatOperation";
import MatchOperation from "./operations/MatchOperation";
import MoveOperation from "./operations/MoveOperation";
import ProcessOperation from "./operations/ProcessOperation";

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
        this._fileLoader.addLoaders([
            [new FsFileLoader(), 1]
        ]);

        // Init data deserializer and add default deserializers
        this._dataDeserializer = new DataDeserializer();
        this._dataDeserializer.addDeserializers([
            new JSONDataDeserializer(),
            new YAMLDataDeserializer()
        ]);

        // Init data serializer and add default serializers
        this._dataSerializer = new DataSerializer();
        this._dataSerializer.addSerializers([
            new JSONDataSerializer()
        ]);

        // Init data loader
        this._dataLoader = new DataLoader(this._config, this._dataDeserializer, this._fileLoader);

        // Init processor and add default operations
        this._processor = new Processor(this._config, this._dataLoader);
        this._processor.addOperations([
            new RemoveOperation(this._processor),
            new ReplaceOperation(this._processor),
            new MergeOperation(this._processor),
            new ExpressionOperation(this._processor),
            new ImportOperation(this._processor),
            new AppendOperation(this._processor),
            new PrependOperation(this._processor),
            new InsertOperation(this._processor),
            new SelectOperation(this._processor),
            new RepeatOperation(this._processor),
            new MatchOperation(this._processor),
            new MoveOperation(this._processor),
            new ProcessOperation(this._processor)
        ]);
    }

    mergeObject(object: object, config?: Partial<IConfig>) {
        const sources = [{type: SourceType.Object, object} as Source];
        return this._mergeSources(sources, config);
    }

    mergeObjects(objects: object[], config?: Partial<IConfig>) {
        const sources = objects.map(object => ({type: SourceType.Object, object} as Source));
        return this._mergeSources(sources, config);
    }

    mergeFile(uri: string, config?: Partial<IConfig>) {
        const sources = [{type: SourceType.Uri, uri} as Source];
        return this._mergeSources(sources, config);
    }

    mergeFiles(uris: string[], config?: Partial<IConfig>) {
        const sources = uris.map(uri => ({type: SourceType.Uri, uri} as Source));
        return this._mergeSources(sources, config);
    }

    setConfig(config?: Partial<IConfig>) {
        this._config.set(config);
    }

    clearCaches() {
        this._dataLoader.clearCache();
    }

    private _mergeSources(sources: Source[], config?: Partial<IConfig>): any {
        // Set new config if given
        if (config !== undefined) {
            this.setConfig(config);
        }

        // Init result
        let result: any;

        try {
            // Process and merge sources
            result = sources.reduce((target: any, source) => {

                // only create locals if params is defined because locals
                // is used to check if a file is already processed (caching)
                let scopeVariables: object;

                if (this._config.params !== undefined) {
                    scopeVariables = {
                        $params: this._config.params
                    };
                }

                // Is the source an object?
                if (source.type === SourceType.Object) {
                    return this._processor.processSourceInNewScope(source.object, target, scopeVariables);
                }

                // Or is the source a ref?
                else if (source.type === SourceType.Uri) {
                    return this._processor.loadAndProcessFileByRef(source.uri, target, scopeVariables);
                }
            }, undefined);
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

/*
 * TYPES
 */

enum SourceType {
    Object,
    Uri
}

interface UriSource {
    uri: string;
    type: SourceType.Uri;
}

interface ObjectSource {
    object: object;
    type: SourceType.Object;
}

type Source = UriSource
    | ObjectSource;
