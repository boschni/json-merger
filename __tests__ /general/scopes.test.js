const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("when merging object1 and object2", function () {

    test("then $target in object1 should refer to undefined", function () {

        const object1 = {
            "a": {
                "$expression": "$target"
            }
        };

        const object2 = {};

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $target in object2 should refer to the processed object1", function () {

        const object1 = {
            "targetProp": "should be the value of sharedProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sharedProp": {
                "$expression": "$target.targetProp"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $targetProperty in object1 should refer to undefined", function () {

        const object1 = {
            "a": {
                "$expression": "$targetProperty"
            }
        };

        const object2 = {};

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $targetProperty in object2 should refer to the processed property in object1", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "should be the value of sharedProp"
        };

        const object2 = {
            "sourceProp": "object2.sourceProp",
            "sharedProp": {
                "$expression": "$targetProperty"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $source in object2 should refer to the unprocessed object2", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sourceProp": "should be the value of sharedProp",
            "sharedProp": {
                "$expression": "$source.sourceProp"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $sourceProperty in object2 should refer to the unprocessed object2 property", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sharedProp": {
                "$expression": "$sourceProperty"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    describe("and two objects are merged with $merge in object2", function () {

        test("then $root.$target in object2 $merge.with should refer to the processed object1", function () {

            const object1 = {
                "targetProp": "should be the value of mergeSharedProp",
                "sharedProp": "object1.sharedProp"
            };

            const object2 = {
                "sourceProp": "object2.sourceProperty",
                "sharedProp": {
                    "$merge": {
                        "source": {
                            "mergeSourceProp": "$merge.source.mergeSourceProp",
                            "mergeSharedProp": "$merge.source.mergeSharedProp"
                        },
                        "with": {
                            "mergeWithProp": "$merge.with.mergeWithProp",
                            "mergeSharedProp": {
                                "$expression": "$root.$target.targetProp"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $target in object2 $merge.with should refer to the processed object2 $merge.source", function () {

            const object1 = {
                "targetProp": "object1.targetProp",
                "sharedProp": "object1.sharedProp"
            };

            const object2 = {
                "sourceProp": "object2.sourceProperty",
                "sharedProp": {
                    "$merge": {
                        "source": {
                            "mergeSourceProp": "should be the value of mergeSharedProp",
                            "mergeSharedProp": "$merge.source.mergeSharedProp"
                        },
                        "with": {
                            "mergeWithProp": "$merge.with.mergeWithProp",
                            "mergeSharedProp": {
                                "$expression": "$target.mergeSourceProp"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $parent.$target in object2 $merge.with should refer to the processed object1", function () {

            const object1 = {
                "targetProp": "should be the value of mergeSharedProp",
                "sharedProp": "object1.sharedProp"
            };

            const object2 = {
                "sourceProp": "object2.sourceProperty",
                "sharedProp": {
                    "$merge": {
                        "source": {
                            "mergeSourceProp": "$merge.source.mergeSourceProp",
                            "mergeSharedProp": "$merge.source.mergeSharedProp"
                        },
                        "with": {
                            "mergeWithProp": "$merge.with.mergeWithProp",
                            "mergeSharedProp": {
                                "$expression": "$root.$target.targetProp"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $targetProperty in object2 $merge.with should refer to the processed object2 $merge.source property", function () {

            const object1 = {
                "targetProp": "object1.targetProp",
                "sharedProp": "object1.sharedProp"
            };

            const object2 = {
                "sourceProp": "object2.sourceProperty",
                "sharedProp": {
                    "$merge": {
                        "source": {
                            "mergeSourceProp": "$merge.source.mergeSourceProp",
                            "mergeSharedProp": "should be the value of mergeSharedProp"
                        },
                        "with": {
                            "mergeWithProp": "$merge.with.mergeWithProp",
                            "mergeSharedProp": {
                                "$expression": "$targetProperty"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $root.$source in object2 $merge.with should refer to the unprocessed object2", function () {

            const object1 = {
                "targetProp": "object1.targetProp",
                "sharedProp": "object1.sharedProp"
            };

            const object2 = {
                "sourceProp": "should be the value of mergeSharedProp",
                "sharedProp": {
                    "$merge": {
                        "source": {
                            "mergeSourceProp": "$merge.source.mergeSourceProp",
                            "mergeSharedProp": "$merge.source.mergeSharedProp"
                        },
                        "with": {
                            "mergeWithProp": "$merge.with.mergeWithProp",
                            "mergeSharedProp": {
                                "$expression": "$root.$source.sourceProp"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $source in object2 $merge.with should refer to the unprocessed object2 $merge.with", function () {

            const object1 = {
                "targetProp": "object1.targetProp",
                "sharedProp": "object1.sharedProp"
            };

            const object2 = {
                "sourceProp": "object2.sourceProperty",
                "sharedProp": {
                    "$merge": {
                        "source": {
                            "mergeSourceProp": "$merge.source.mergeSourceProp",
                            "mergeSharedProp": "$merge.source.mergeSharedProp"
                        },
                        "with": {
                            "mergeWithProp": "should be the value of mergeSharedProp",
                            "mergeSharedProp": {
                                "$expression": "$source.mergeWithProp"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $sourceProperty in object2 $merge.with should refer to the unprocessed object2 $merge.with property", function () {

            const object1 = {
                "targetProp": "object1.targetProp",
                "sharedProp": "object1.sharedProp"
            };

            const object2 = {
                "sourceProp": "object2.sourceProperty",
                "sharedProp": {
                    "$merge": {
                        "source": {
                            "mergeSourceProp": "$merge.source.mergeSourceProp",
                            "mergeSharedProp": "$merge.source.mergeSharedProp"
                        },
                        "with": {
                            "mergeWithProp": "$merge.with.mergeWithProp",
                            "mergeSharedProp": {
                                "$expression": "$sourceProperty"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });
    });
});

describe("when importing a file", function () {

    test("then $root in the file should refer to the root of the file", function () {

        const files = {
            "a.json": {
                "aa": {
                    "$expression": "$root.$source.sharedProp"
                },
                "sharedProp": "This should be the value of /a/aa"
            }
        };

        const object = {
            "a": {
                "$import": "a.json"
            },
            "sharedProp": "wrong"
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the parent scope variables should not be accessible", function () {

        const files = {
            "b.json": {
                "$expression": "typeof $repeat"
            }
        };

        const object = {
            "$repeat": {
                "range": "1",
                "value": {
                    "a": {
                        "$expression": "typeof $repeat"
                    },
                    "b": {
                        "$import": "b.json"
                    }
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $sourceFilename in the file should refer to the filename without extension", function () {

        const files = {
            "a.json": {
                "a": {
                    "$expression": "$sourceFileName"
                },
                "b": {
                    "$import": "b.json"
                }
            },
            "b.json": {
                "$expression": "$sourceFileName"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFile("a.json", testConfig());

        expect(result).toMatchSnapshot();
    });
});
