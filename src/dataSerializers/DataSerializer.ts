export default class DataSerializer {
  private _serializers: DataSerializerInterface[] = [];

  serialize(uri: string, data: any, pretty: boolean): any {
    const serializer = this._serializers.filter((x) => x.match(uri))[0];

    // Check if a loader was found
    if (!serializer) {
      throw new Error(`No serializer found for file "${uri}"`);
    }

    return serializer.serialize(uri, data, pretty);
  }

  addSerializer(serializer: DataSerializerInterface) {
    this._serializers.push(serializer);
  }

  addSerializers(serializers: DataSerializerInterface[]) {
    serializers.forEach((serializer) => this.addSerializer(serializer));
  }
}

/*
 * TYPES
 */

export interface DataSerializerInterface {
  match(uri: string): boolean;
  serialize(uri: string, data: any, pretty: boolean): string;
}
