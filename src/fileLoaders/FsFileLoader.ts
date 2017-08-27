import * as fs from "fs";
import * as path from "path";
import {FileLoaderInterface} from "./FileLoader";

export default class FsFileLoader implements FileLoaderInterface {

    /**
     * Check if the URI should be handled by this loader.
     */
    match(uri: string, currentUri: string): boolean {
        if (uri.substr(0, 7) === "file://") {
            return true;
        }

        const protocolRegex = /^(?:[a-z]+:)?\/\//i;

        // Ignore if the uri contains a non file:// protocol
        if (protocolRegex.test(uri)) {
            return false;
        }

        // Uri has no protocol so if the current uri has file:// it is a file uri
        if (currentUri.substr(0, 7) === "file://") {
            return true;
        }

        // return true if the current uri contains no protocol
        return !protocolRegex.test(currentUri);
    }

    toAbsoluteUri(uri: string, currentUri: string): string {
        const cwd = path.dirname(currentUri);
        return path.resolve(cwd, uri);
    }

    load(uri: string): string {
        return fs.readFileSync(uri, "utf8");
    }
}
