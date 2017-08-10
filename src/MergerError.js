const jsonPtr = require("json-ptr");

class MergerError extends Error {

    constructor(originalError, context) {
        super();
        const message = this.createMessage(context);
        const stack = this.createProcessingStackTrace(context);
        this.name = this.constructor.name;
        this.message = message + stack + "\n" + originalError.message;
        this.stack = message + stack + "\n" + originalError.stack;
    }

    createMessage(context) {
        let message = "";
        if (context.currentSource) {
            const lastProp = context.currentSource.path[context.currentSource.path.length - 1];
            message = `An error occurred while processing the property "${lastProp}"\n`;
        }
        return message;
    }

    createProcessingStackTrace(context) {
        return context.sourceStack.reverse().reduce((trace, source) => {
            const pathEncoded = jsonPtr.encodePointer(source.path);
            const file = source.filePath === undefined ? "" : source.filePath;
            return `${trace}    at ${file}#${pathEncoded}\n`;
        }, "");
    }
}

module.exports = MergerError;
