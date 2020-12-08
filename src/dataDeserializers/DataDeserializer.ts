export default class DataDeserializer {
  private _deserializers: DataDeserializerInterface[] = [];

  deserialize(uri: string, content: string): any {
    // Find a deserializer
    const deserializer = this._deserializers.filter((x) => x.match(uri))[0];

    // Check if a deserializer was found
    if (!deserializer) {
      throw new Error(`No deserializer found for file "${uri}"`);
    }

    // Deserialize
    return deserializer.deserialize(uri, content);
  }

  addDeserializer(deserializer: DataDeserializerInterface) {
    this._deserializers.push(deserializer);
  }

  addDeserializers(deserializers: DataDeserializerInterface[]) {
    deserializers.forEach((deserializer) => this.addDeserializer(deserializer));
  }
}

/*
 * TYPES
 */

export interface DataDeserializerInterface {
  deserialize(uri: string, content: string): any;
  match(uri: string): boolean;
}
