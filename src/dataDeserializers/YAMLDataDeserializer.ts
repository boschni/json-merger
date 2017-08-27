import * as yaml from "js-yaml";
import {DataDeserializerInterface} from "./DataDeserializer";

export default class YAMLDataDeserializer implements DataDeserializerInterface {

    /**
     * Check if the file should be handled by this deserializer.
     */
    match(uri: string): boolean {
        return /\.ya?ml$/.test(uri);
    }

    deserialize(uri: string, content: string): any {
        return yaml.safeLoad(content, {
            filename: uri,
            schema: yaml.JSON_SCHEMA
        });
    }
}
