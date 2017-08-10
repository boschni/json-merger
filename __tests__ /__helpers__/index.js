function testConfig(overrides) {
    const defaults = {stringify: "pretty"};
    return Object.assign({}, defaults, overrides || {});
}

module.exports = {
    testConfig
};
