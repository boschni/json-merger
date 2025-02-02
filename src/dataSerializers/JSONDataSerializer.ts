import { DataSerializerInterface } from "./DataSerializer";

const jsonFileRegex = /\.json$/;

export default class JSONDataSerializer implements DataSerializerInterface {
  /**
   * Check if the URI should be handled by this serializer.
   */
  match(uri: string): boolean {
    return jsonFileRegex.test(uri);
  }

  serialize(_: string, data: any, pretty: boolean, spaces?: number): string {
    return JSON.stringify(data, null, this.getIndention(pretty, spaces));
  }

  private getIndention(pretty: boolean, spaces?: number): "\t"|number|undefined {
    if (!pretty) {
      return undefined;
    }

    return spaces ?? "\t";
  }
}
