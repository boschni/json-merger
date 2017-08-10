class Context {

    constructor(config) {
        this.config = config;
        this.sourceStack = [];
        this.currentSource = undefined;

        // add indicators
        this.indicators = {
            Append: "append",
            Comment: "comment",
            Compile: "compile",
            Expression: "expression",
            Id: "id",
            Import: "import",
            Insert: "insert",
            Match: "match",
            Merge: "merge",
            Move: "move",
            Prepend: "prepend",
            Ref: "ref",
            Remove: "remove",
            Replace: "replace",
            Set: "set",
            Value: "value"
        };

        this.indicatorsArray = [];

        Object.keys(this.indicators).map(key => {
            const indicator = this.config.indicatorPrefix + this.indicators[key];
            this.indicators[key] = indicator;
            this.indicatorsArray.push(indicator)
        });

        this._indicators = this.indicators;
        this._indicatorsArray = this.indicatorsArray;
    }

    enterSource(filePath, targetRoot, sourceRoot) {
        if (this.currentSource) {
            filePath = filePath !== undefined ? filePath : this.currentSource.filePath;
            targetRoot = targetRoot !== undefined ? targetRoot : this.currentSource.targetRoot;
            sourceRoot = sourceRoot !== undefined ? sourceRoot : this.currentSource.sourceRoot;
        }
        this.currentSource = {filePath, path: [], targetRoot, sourceRoot};
        this.sourceStack.push(this.currentSource);
    }

    leaveSource() {
        this.sourceStack.pop();
        this.currentSource = this.sourceStack[this.sourceStack.length - 1];
    }

    enterProperty(propertyName) {
        if (propertyName !== undefined) {
            this.currentSource.path.push(propertyName);
        }
    }

    leaveProperty() {
        this.currentSource.path.pop();
    }

    enableIndicators() {
        this.indicators = this._indicators;
        this.indicatorsArray = this._indicatorsArray;
    }

    disableIndicators() {
        this.indicators = {};
        this.indicatorsArray = [];
    }
}

module.exports = Context;
