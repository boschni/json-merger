const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

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

    test("then $currentTarget in object1 should refer to undefined", function () {

        const object1 = {
            "a": {
                "$expression": "$currentTarget"
            }
        };

        const object2 = {};

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $currentTarget in object2 should refer to the processed object1", function () {

        const object1 = {
            "targetProp": "should be the value of sharedProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sharedProp": {
                "$expression": "$currentTarget.targetProp"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $currentTargetProperty in object1 should refer to undefined", function () {

        const object1 = {
            "a": {
                "$expression": "$currentTargetProperty"
            }
        };

        const object2 = {};

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $currentTargetProperty in object2 should refer to the processed property in object1", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "should be the value of sharedProp"
        };

        const object2 = {
            "sourceProp": "object2.sourceProp",
            "sharedProp": {
                "$expression": "$currentTargetProperty"
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

    test("then $currentSource in object2 should refer to the unprocessed object2", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sourceProp": "should be the value of sharedProp",
            "sharedProp": {
                "$expression": "$currentSource.sourceProp"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then $currentSourceProperty in object2 should refer to the unprocessed object2 property", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sharedProp": {
                "$expression": "$currentSourceProperty.$expression"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    describe("and two objects are merged with $merge in object2", function () {

        test("then $target in object2 $merge.with should refer to the processed object1", function () {

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
                                "$expression": "$target.targetProp"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $currentTarget in object2 $merge.with should refer to the processed object2 $merge.source", function () {

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
                                "$expression": "$currentTarget.mergeSourceProp"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $currentTargetProperty in object2 $merge.with should refer to the processed object2 $merge.source property", function () {

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
                                "$expression": "$currentTargetProperty"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $source in object2 $merge.with should refer to the unprocessed object2", function () {

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
                                "$expression": "$source.sourceProp"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $currentSource in object2 $merge.with should refer to the unprocessed object2 $merge.with", function () {

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
                                "$expression": "$currentSource.mergeWithProp"
                            }
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("then $currentSourceProperty in object2 $merge.with should refer to the unprocessed object2 $merge.with property", function () {

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
                                "$expression": "$currentSourceProperty.$expression"
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
