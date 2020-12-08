import { DataDeserializerInterface } from "./DataDeserializer";

const jsonFileRegex = /\.json$/;

export default class JSONDataDeserializer implements DataDeserializerInterface {
  /**
   * Check if the file should be handled by this deserializer.
   */
  match(uri: string): boolean {
    return jsonFileRegex.test(uri);
  }

  deserialize(_: string, content: string): any {
    return JSON.parse(content);
  }
}
