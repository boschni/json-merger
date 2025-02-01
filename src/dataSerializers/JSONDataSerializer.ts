import { DataSerializerInterface } from "./DataSerializer";

const jsonFileRegex = /\.json$/;

export default class JSONDataSerializer implements DataSerializerInterface {
  /**
   * Check if the URI should be handled by this serializer.
   */
  match(uri: string): boolean {
    return jsonFileRegex.test(uri);
  }

  serialize(_: string, data: any, pretty: boolean, indenting: number | "\t"): string {
    const space = pretty ? indenting : undefined;
    return JSON.stringify(data, null, space);
  }
}
