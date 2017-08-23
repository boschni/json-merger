# json-merger
Merge JSON (or YAML) files and objects with operations like $import $remove $replace $merge and more.

WORK IN PROGRESS, expect the API to change until 1.0.0.

Table of Contents:
------------------
* [API](#api)
  * [`Merger`](#merger)
  * [`.mergeFile(file: string, config?: Config)`](#mergefilefile-string-config-config)
  * [`.mergeFiles(files: string[], config?: Config)`](#mergefilesfiles-string-config-config)
  * [`.mergeObject(object: object, config?: Config)`](#mergeobjectobject-object-config-config)
  * [`.mergeObjects(objects: object[], config?: Config)`](#mergeobjectsobjects-object-config-config)
* [Config](#config)
  * [`cwd: string`](#cwd-string)
  * [`files: FileMap`](#files-filemap)
  * [`stringify: boolean`](#stringify-boolean)
  * [`operationPrefix: string`](#operationprefix-string)
  * [`errorOnFileNotFound: boolean`](#erroronfilenotfound-boolean)
  * [`errorOnRefNotFound: boolean`](#erroronrefnotfound-boolean)
* [Operations](#operations)
  * [`$import`](#import)
  * [`$merge`](#merge)
  * [`$remove`](#remove)
  * [`$replace`](#replace)
  * [`$append`](#append)
  * [`$prepend`](#prepend)
  * [`$insert`](#insert)
  * [`$match`](#match)
  * [`$move`](#move)
  * [`$select`](#select)
  * [`$expression`](#expression)
  * [`$process`](#process)
  * [`$comment`](#comment)
* [Command line interface `json-merger`](#command-line-interface-json-merger)
* [Roadmap](#roadmap)

API
---

### `.mergeFile(file: string, config?: Config)`

**javascript**

```javascript
var jsonMerger = require("json-merger");
var result = jsonMerger.mergeFile("a.json");
```

**a.json:**

```json
{
  "$merge": {
    "source": {
      "$import": "b.json"
    },
    "with": {
      "prop1": {
        "$replace": {
          "prop1a": "this will replace b.json's property prop1"
        }
      },
      "prop2": {
        "prop2a": "this will merge with b.json's property prop2"
      }
    }
  }
}
```

**b.json:**

```json
{
  "prop1": {
    "prop1b": "will be replaced"
  },
  "prop2": {
    "prop2b": "will be merged"
  }
}
```

**result**

```json
{
  "prop1": {
    "prop1a": "this will replace b.json's property prop1"
  },
  "prop2": {
    "prop2a": "this will merge with b.json's property prop2",
    "prop2b": "will be merged"
  }
}
```

### `.mergeFiles(files: string[], config?: Config)`

**javascript**

```javascript
var jsonMerger = require("json-merger");
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json:**

```json
{
  "a": "some value"
}
```

**b.json:**

```json
{
  "b": "some other value"
}
```

**result**

```json
{
  "a": "some value",
  "b": "some other value"
}
```

### `.mergeObject(object: object, config?: Config)`

**javascript**

```javascript
var jsonMerger = require('json-merger');

var object = {
  "a": {
    "aa": "some value"
  },
  "b": {
    "$import": "b.json"
  }
};

var result = jsonMerger.mergeObject(object);
```

**b.json:**

```json
{
  "bb": "some other value"
}
```

**result**

```json
{
  "a": {
    "aa": "some value"
  },
  "b": {
    "bb": "some other value"
  }
}
```

### `.mergeObjects(objects: object[], config?: Config)`

```javascript
var jsonMerger = require("json-merger");

var object1 = {
  a: [1, 1, 1, 1]
};

var object2 = {
  a: [2, 2]
};

var result = jsonMerger.mergeObjects([object1, object2]);
```

**result**

```json
{
  "a": [2, 2, 1, 1]
}
```

Config
------

```typescript
interface Config {
    cwd: string;
    files: FileMap;
    operationPrefix: string;
    stringify: boolean | "pretty";
    errorOnFileNotFound: boolean;
    errorOnRefNotFound: boolean;
}
```

### `cwd: string`
The current working directory when importing files. Defaults to process.cwd().

### `files: FileMap`
Object containing paths and the resulting objects that can be imported.

### `operationPrefix: string`
Use this property to override the prefix to indicate a property is an operation like $import.
The default prefix is `$` but it is possible to change this to for example `@import`.

### `stringify: boolean | "pretty"`
Set this property to `true` to stringify the JSON result. Set the property to `"pretty"` if the output should be pretty printed.

### `errorOnFileNotFound: boolean`
Set this property to `false` to disable throwing errors when an imported file does not exist.

### `errorOnRefNotFound: boolean`
Set this property to `false` to disable throwing errors when an JSON pointer or JSON path resolves to undefined.

Operations
----------

### `$import`

Use `$import` to import other JSON or YAML files.

```json
{
  "$import": "a.json"
}
```

[JSON reference](https://tools.ietf.org/html/draft-pbryan-zyp-json-ref-03) syntax is supported. The following example will import the first array item from the `someArray` property in `a.json`.

```json
{
  "$import": "a.json#/someArray/0"
}
```

When defined as an array, `$import` will merge the files in order and return the result.

```json
{
  "$import": ["a.json", "b.yaml", "c.json"]
}
```

Import will process the file before importing by default.
Meaning all operations in `a.json` will be applied before returning the result.
Set `$import.process` to false to disable this behavior. When `false` it will return the unprocessed value.

```json
{
  "$import": {
    "path": "a.json",
    "process": false
  }
}
```

The object syntax is also supported in an array.

```json
{
  "$import": [
    {
      "path": "a.json",
      "process": false
    },
    {
      "path": "b.json",
      "process": false
    }
  ]
}
```

### `$merge`

Use the `$merge` operation to merge objects and arrays.

**javascript**

```javascript
var result = jsonMerger.mergeFile("a.json");
```

**a.json**

```json
{
  "$merge": {
    "source": {
      "a": {
        "aa": "some value"
      }
    },
    "with": {
      "a": {
        "bb": "some other value"
      }
    }
  }
}
```

**result**

```json
{
  "a": {
    "aa": "some value",
    "bb": "some other value"
  }
}
```

#### Merging with other files

The `$merge` operation is often used in conjunction with the `$import` operation to merge with other files from out the JSON itself.

**javascript**

```javascript
var result = jsonMerger.mergeFile("a.json");
```

**a.json**

```json
{
  "$merge": {
    "source": {
      "$import": "b.json"
    },
    "with": {
      "a": {
        "bb": "some other value"
      }
    }
  }
}
```

**b.json**

```json
{
  "a": {
    "aa": "some value"
  }
}
```

**result**

```json
{
  "a": {
    "aa": "some value",
    "bb": "some other value"
  }
}
```

### `$remove`

Use the `$remove` operation to remove properties and array items.

#### Remove object properties

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "prop1": {
    "prop1a": "some value"
  },
  "prop2": {
    "prop2a": "some other value"
  }
}
```

**b.json**

```json
{
  "prop2": {
    "$remove": true
  }
}
```

**result**

```json
{
  "prop1": {
    "prop1a": "some value"
  }
}
```

#### Remove array items

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$remove": true
    },
    {
      "$remove": true
    }
  ]
}
```

**result**

```json
{
  "someArray": [3]
}
```

### `$replace`

Use the `$replace` operation to replace properties and array items.

#### Replace object properties

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "prop1": {
    "prop1a": "some value"
  },
  "prop2": {
    "prop2a": "some other value"
  }
}
```

**b.json**

```json
{
  "prop2": {
    "$replace": {
      "prop2b": "replaced value"
    }
  }
}
```

**result**

```json
{
  "prop1": {
    "prop1a": "some value"
  },
  "prop2": {
    "prop2b": "replaced value"
  }
}
```

#### Replace array items

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [
    {
      "a": 1
    },
    {
      "b": 2
    }
  ]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$replace": {
        "c": 3
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [
    {
      "c": 3
    },
    {
      "b": 2
    }
  ]
}
```

### `$append`

Use the `$append` operation to append an item to an array.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$append": 4
    }
  ]
}
```

**result**

```json
{
  "someArray": [1, 2, 3, 4]
}
```

### `$prepend`

Use the `$prepend` operation to prepend an item to an array.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$prepend": 4
    }
  ]
}
```

**result**

```json
{
  "someArray": [4, 1, 2, 3]
}
```

### `$insert`

Use the `$insert` operation to insert an item to an array.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$insert": {
        "index": 1,
        "value": 4
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [1, 4, 2, 3]
}
```

#### Insert as last item

Set `$import.index` to `-` to insert an item at the end of the array.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$insert": {
        "index": "-",
        "value": 4
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [1, 2, 3, 4]
}
```

#### Insert before the last item

A negative `$import.index` can be used, indicating an offset from the end of the array. 

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$insert": {
        "index": -1,
        "value": 4
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [1, 2, 4, 3]
}
```

### `$match`

Use the `$match` operation to search for a specific array item and merge with that item.

#### Match by index

Use `$match.index` to match an array item by index.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$match": {
        "index": 1,
        "value": 4
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [1, 4, 3]
}
```

#### Match by JSON pointer

Use `$match.path` to match an array item with a JSON pointer.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$match": {
        "path": "/1",
        "value": 4
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [1, 4, 3]
}
```

#### Match by JSON path

Use `$match.query` to match an array item with a [JSON path](https://www.npmjs.com/package/jsonpath) query.
The following example will search for an array item containing the value `2` and merge it with the value `4`.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$match": {
        "query": "$[?(@ == 2)]",
        "value": 4
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [1, 4, 3]
}
```

### `$move`

Use the `$move` operation to move an array item.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$move": {
        "index": 1
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [2, 1, 3]
}
```

#### Move a matched array item

Use the `$match` operation in conjunction with the `$move` operation to move a specific array item.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$match": {
        "index": 0,
        "value": {
          "$move": {
            "index": 1
          }
        }
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [2, 1, 3]
}
```

#### Move a matched array item to the end

Use `-` as `$move.index` value to move an array item to the end.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$match": {
        "index": 0,
        "value": {
          "$move": {
            "index": "-"
          }
        }
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [2, 3, 1]
}
```

#### Move and merge a matched array item

Use `$move.value` to not only move the item but also merge it with a value.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [
    {
      "a": 1
    },
    {
      "a": 2
    },
    {
      "a": 3
    }
  ]
}
```

**b.json**

```json
{
  "someArray": [
    {
      "$match": {
        "query": "$[?(@.a == 3)]",
        "value": {
          "$move": {
            "index": 0,
            "value": {
              "b": 3
            }
          }
        }
      }
    }
  ]
}
```

**result**

```json
{
  "someArray": [
    {
      "a": 3,
      "b": 3
    },
    {
      "a": 1
    },
    {
      "a": 2
    }
  ]
}
```

### `$select`

Use the `$select` operation to select one or multiple values.

### Select value by JSON pointer

**javascript**

```javascript
var result = jsonMerger.mergeFile("b.json");
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "prop": {
    "$select": {
      "from": {
        "$import": "a.json"
      },
      "path": "/someArray/0"
    }
  }
}
```

**result**

```json
{
  "prop": 1
}
```

### Select value by JSON path

**javascript**

```javascript
var result = jsonMerger.mergeFile("b.json");
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "prop": {
    "$select": {
      "from": {
        "$import": "a.json"
      },
      "query": "$[*]"
    }
  }
}
```

**result**

```json
{
  "prop": 1
}
```

### Select multiple values by JSON path

**javascript**

```javascript
var result = jsonMerger.mergeFile("b.json");
```

**a.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**b.json**

```json
{
  "prop": {
    "$select": {
      "from": {
        "$import": "a.json"
      },
      "query": "$[?(@ < 3)]",
      "multiple": true
    }
  }
}
```

**result**

```json
{
  "prop": [1, 2]
}
```

### Select from a context

The `$select.from` property can also be used to select from a context.
The available contexts are `target`, `currentTarget`, `currentTargetProperty`, `source`, `currentSource` and `currentSourceProperty`.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```js
{
  "prop1": {
    "$select": {
      "from": "target", // refers to undefined because a.json has no target
      "path": "/"
    }
  },
  "prop2": {
    "$select": {
      "from": "currentTarget", // refers to undefined because a.json has no target
      "path": "/"
    }
  },
  "prop3": {
    "$select": {
      "from": "currentTargetProperty", // refers to undefined because a.json has no target
      "path": "/"
    }
  },
  "prop4": {
    "$select": {
      "from": "source", // refers to the unprocessed a.json
      "path": "/"
    }
  },
  "prop5": {
    "$select": {
      "from": "currentSource", // refers to the unprocessed a.json
      "path": "/"
    }
  },
  "prop6": {
    "$select": {
      "from": "currentSourceProperty", // refers to the unprocessed a.json#/prop6
      "path": "/"
    }
  }
}
```

**b.json**

```js
{
  "prop1": {
    "$select": {
      "from": "target", // refers to the processed a.json
      "path": "/"
    }
  },
  "prop2": {
    "$select": {
      "from": "currentTarget", // refers to the processed a.json
      "path": "/"
    }
  },
  "prop3": {
    "$select": {
      "from": "currentTargetProperty", // refers to the processed a.json#/prop3
      "path": "/"
    }
  },
  "prop4": {
    "$select": {
      "from": "source", // refers to the unprocessed b.json
      "path": "/"
    }
  },
  "prop5": {
    "$select": {
      "from": "currentSource", // refers to the unprocessed b.json
      "path": "/"
    }
  },
  "prop6": {
    "$select": {
      "from": "currentSourceProperty", // refers to the unprocessed b.json#/prop6
      "path": "/"
    }
  },
  "prop7": {
    "$merge": {
      "source": {
        "prop1": {
          "$select": {
            "from": "target", // refers to the processed a.json
            "path": "/"
          }
        },
        "prop2": {
          "$select": {
            "from": "currentTarget", // refers to undefined because b.json#/prop7/$merge/source has no target
            "path": "/"
          }
        },
        "prop3": {
          "$select": {
            "from": "currentTargetProperty", // refers to undefined because b.json#/prop7/$merge/source has no target
            "path": "/"
          }
        },
        "prop4": {
          "$select": {
            "from": "source", // refers to the unprocessed b.json
            "path": "/"
          }
        },
        "prop5": {
          "$select": {
            "from": "currentSource", // refers to the unprocessed b.json#/prop7/$merge/source
            "path": "/"
          }
        },
        "prop6": {
          "$select": {
            "from": "currentSourceProperty", // refers to the unprocessed b.json#/prop7/$merge/source/prop6
            "path": "/"
          }
        }
      },
      "with": {
        "prop1": {
          "$select": {
            "from": "target", // refers to the processed a.json
            "path": "/"
          }
        },
        "prop2": {
          "$select": {
            "from": "currentTarget", // refers to the processed b.json#/prop7/$merge/source
            "path": "/"
          }
        },
        "prop3": {
          "$select": {
            "from": "currentTargetProperty", // refers to the processed b.json#/prop7/$merge/source
            "path": "/"
          }
        },
        "prop4": {
          "$select": {
            "from": "source", // refers to the unprocessed b.json
            "path": "/"
          }
        },
        "prop5": {
          "$select": {
            "from": "currentSource", // refers to the unprocessed b.json#/prop7/$merge/with
            "path": "/"
          }
        },
        "prop6": {
          "$select": {
            "from": "currentSourceProperty", // refers to the unprocessed b.json#/prop7/$merge/with/prop6
            "path": "/"
          }
        }
      }
    }
  }
}
```

--------

Command line interface `json-merger`
------------------------------------

You can use `json-merger` as a command line tool:

```
  Usage: json-merger [options] <file ...>


  Options:

    -V, --version                    output the version number
    -p, --pretty                     pretty-print the output json
    -o, --output [file]              the output file. Defaults to stdout
    -i, --operation-prefix [prefix]  the operation prefix. Defaults to $
    --error-on-file-not-found        throw an error if a file is not found. Defaults to true
    --error-on-ref-not-found         throw an error if a JSON pointer or JSON path is not found. Defaults to true
    -h, --help                       output usage information
```

Usage:

```sh
json-merger a.json > result.json
json-merger --output result.json a.json
json-merger --output result.json --pretty a.json
```

Install `json-merger` globally to be able to use the command line interface.

```sh
npm install -g json-merger
```

Roadmap
-------
- Add configurable file resolvers to import files from different sources.
- Add configurable (de)serializers to import and export different file formats.
