import Context from "./Context";
export default class MergerError extends Error {
    constructor(originalError: Error, context: Context);
    private _createMessage(context);
    private _createProcessingStackTrace(context);
}
