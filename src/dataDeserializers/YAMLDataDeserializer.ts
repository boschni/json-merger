import * as yaml from "js-yaml";
import { DataDeserializerInterface } from "./DataDeserializer";

const yamlFileRegex = /\.ya?ml$/;

export default class YAMLDataDeserializer implements DataDeserializerInterface {
  /**
   * Check if the file should be handled by this deserializer.
   */
  match(uri: string): boolean {
    return yamlFileRegex.test(uri);
  }

  deserialize(uri: string, content: string): any {
    return yaml.load(content, {
      filename: uri,
      schema: yaml.JSON_SCHEMA,
    });
  }
}
