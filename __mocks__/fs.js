const fsActual = require.requireActual("fs");
const fs = jest.genMockFromModule("fs");
const path = require("path");

let mockFiles;

fs.__setMockFiles = function(newMockFiles) {
    mockFiles = Object.create(null);
    Object.keys(newMockFiles).forEach(fileName => {
        let newFileName = fileName;
        if (!path.isAbsolute(fileName)) {
            newFileName = path.resolve(process.cwd(), fileName);
        }
        mockFiles[newFileName] = newMockFiles[fileName];
    });
};

fs.__setJsonMockFiles = function(newMockFiles, stringify) {
    Object.keys(newMockFiles).forEach(fileName => {
        newMockFiles[fileName] = stringify === false ? newMockFiles[fileName] : JSON.stringify(newMockFiles[fileName]);
    });
    fs.__setMockFiles(newMockFiles);
};

fs.readFileSync = jest.fn(function(fileName) {
    if (mockFiles !== undefined) {
        if (mockFiles[fileName] === undefined) {
            throw new Error("readFileSyncMock: file does not exist");
        }
        return mockFiles[fileName];
    } else {
        return fsActual.readFileSync(fileName, "utf8");
    }
});

module.exports = fs;
