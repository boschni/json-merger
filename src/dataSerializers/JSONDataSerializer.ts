import {DataSerializerInterface} from "./DataSerializer";

export default class JSONDataSerializer implements DataSerializerInterface {

    /**
     * Check if the URI should be handled by this serializer.
     */
    match(uri: string): boolean {
        return /\.json$/.test(uri);
    }

    serialize(_: string, data: any, pretty: boolean): string {
        const space = pretty ? "\t" : undefined;
        return JSON.stringify(data, null, space);
    }
}
