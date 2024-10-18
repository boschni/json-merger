function testConfig(overrides) {
  const defaults = { enableExpressionOperation: true, stringify: "pretty" };
  return Object.assign({}, defaults, overrides || {});
}

module.exports = {
  testConfig,
};
