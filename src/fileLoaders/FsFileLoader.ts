import * as fs from "fs";
import * as path from "path";
import {FileLoaderInterface} from "./FileLoader";

const protocolRegex = /^(?:[a-z]+:)?\/\//i;

export default class FsFileLoader implements FileLoaderInterface {

    /**
     * Check if the URI should be handled by this loader.
     */
    match(uri: string, currentUri: string): boolean {
        // Match if the uri contains a file:// protocol
        if (uri.substr(0, 7) === "file://") {
            return true;
        }

        // No match if the uri contains an other protocol
        if (protocolRegex.test(uri)) {
            return false;
        }

        // Match if the uri has no protocol but the current uri contains a file:// protocol
        if (currentUri.substr(0, 7) === "file://") {
            return true;
        }

        // Match if both the uri and the current uri contain no protocol
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
