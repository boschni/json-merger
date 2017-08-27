import {DataDeserializerInterface} from "./DataDeserializer";

export default class JSONDataDeserializer implements DataDeserializerInterface {

    /**
     * Check if the file should be handled by this deserializer.
     */
    match(uri: string): boolean {
        return /\.json$/.test(uri);
    }

    deserialize(_: string, content: string): any {
        return JSON.parse(content);
    }
}
