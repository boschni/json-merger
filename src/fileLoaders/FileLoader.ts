export default class FileLoader {

    private _uriCache: UriCache = {};
    private _loaders: Loader[] = [];

    load(uri: string, currentUri: string): string {
        // Find loader
        const loader = this._loaders.filter(x => x.loader.match(uri, currentUri))[0];

        if (loader === undefined) {
            throw new Error(`No file loader found for file "${uri}"`);
        }

        // Get absolute URI
        const absoluteUri = loader.loader.toAbsoluteUri(uri, currentUri);

        // Load file
        return loader.loader.load(absoluteUri);
    }

    addLoader(loader: FileLoaderInterface, priority: number) {
        this._loaders.push({loader, priority});
        this._loaders = this._loaders.sort((a: Loader, b: Loader) => -(a.priority - b.priority));
    }

    addLoaders(loaders: [FileLoaderInterface, number][]) {
        loaders.forEach(x => this.addLoader(x[0], x[1]));
    }

    toAbsoluteUri(uri: string, currentUri: string): string | undefined {
        const cacheKey = uri + currentUri;

        // Check cache
        if (this._uriCache[cacheKey]) {
            return this._uriCache[cacheKey];
        }

        // Find loader
        const loader = this._loaders.filter(x => x.loader.match(uri, currentUri))[0];

        // Check if a loader was found
        if (!loader) {
            return;
        }

        // Convert to absolute URI
        const absoluteUri = loader.loader.toAbsoluteUri(uri, currentUri);

        // Add to cache
        this._uriCache[cacheKey] = absoluteUri;

        return absoluteUri;
    }

    clearCache() {
        this._uriCache = {};
    }
}

/*
 * TYPES
 */

export interface FileLoaderInterface {
    load(uri: string): string;
    match(uri: string, currentUri: string): boolean;
    toAbsoluteUri(uri: string, currentUri: string): string;
}

interface Loader {
    loader: FileLoaderInterface;
    priority: number;
}

interface UriCache {
    [uriAndCurrentUriConcatenated: string]: string;
}
