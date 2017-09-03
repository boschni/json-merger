import {DataSerializerInterface} from "./DataSerializer";

const jsonFileRegex = /\.json$/;

export default class JSONDataSerializer implements DataSerializerInterface {

    /**
     * Check if the URI should be handled by this serializer.
     */
    match(uri: string): boolean {
        return jsonFileRegex.test(uri);
    }

    serialize(_: string, data: any, pretty: boolean): string {
        const space = pretty ? "\t" : undefined;
        return JSON.stringify(data, null, space);
    }
}
