# json-merger

Merge JSON (or YAML) files and objects with operations like $import $remove $replace $merge and more.

## Table of Contents:

- [API](#api)
  - [`.mergeFile(file: string, config?: Config)`](#mergefilefile-string-config-config)
  - [`.mergeFiles(files: string[], config?: Config)`](#mergefilesfiles-string-config-config)
  - [`.mergeObject(object: object, config?: Config)`](#mergeobjectobject-object-config-config)
  - [`.mergeObjects(objects: object[], config?: Config)`](#mergeobjectsobjects-object-config-config)
  - [`Merger(config?: Config)`](#mergerconfig-config)
- [Config](#config)
  - [`cwd: string`](#cwd-string)
  - [`errorOnFileNotFound: boolean`](#erroronfilenotfound-boolean)
  - [`errorOnRefNotFound: boolean`](#erroronrefnotfound-boolean)
  - [`operationPrefix: string`](#operationprefix-string)
  - [`params: object`](#params-object)
  - [`stringify: boolean`](#stringify-boolean--pretty)
  - [`defaultArrayMergeOperation: "combine" | "replace" | "concat"`](#defaultarraymergeoperation-combine--replace--concat)
- [Operations](#operations)
  - [`$import`](#import)
  - [`$merge`](#merge)
  - [`$remove`](#remove)
  - [`$replace`](#replace)
  - [`$concat`](#concat)
  - [`$combine`](#combine)
  - [`$append`](#append)
  - [`$prepend`](#prepend)
  - [`$insert`](#insert)
  - [`$match`](#match)
  - [`$move`](#move)
  - [`$select`](#select)
  - [`$repeat`](#repeat)
  - [`$include`](#include)
  - [`$expression`](#expression)
- [Scopes](#scopes)
- [Command line interface `json-merger`](#command-line-interface-json-merger)
- [Roadmap](#roadmap)

## API

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
var jsonMerger = require("json-merger");

var object = {
  a: {
    aa: "some value",
  },
  b: {
    $import: "b.json",
  },
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

**javascript**

```javascript
var jsonMerger = require("json-merger");

var object1 = {
  a: [1, 1, 1, 1],
};

var object2 = {
  a: [2, 2],
};

var result = jsonMerger.mergeObjects([object1, object2]);
```

**result**

```json
{
  "a": [2, 2, 1, 1]
}
```

### `Merger(config?: Config)`

The actual `Merger` class is also exported. The other exports are just shortcut methods.

Using one `Merger` instance has some performance advantages because it will cache previously loaded and processed files.

**javascript**

```javascript
var Merger = require("json-merger").Merger;

var merger = new Merger();

// the first call will load and process "a.json"
var result1 = merger.mergeFile("a.json");

// the second call will return the cached result
var result2 = merger.mergeFile("a.json");

// clear the caches
merger.clearCaches();
```

## Config

```typescript
interface Config {
  cwd?: string;
  errorOnFileNotFound?: boolean;
  errorOnRefNotFound?: boolean;
  operationPrefix?: string;
  params?: object;
  stringify?: boolean | "pretty";
  defaultArrayMergeOperation: "combine" | "replace" | "concat";
}
```

### `cwd: string`

The current working directory when importing files. Defaults to process.cwd().

### `errorOnFileNotFound: boolean`

Set this property to `false` to disable throwing errors when an imported file does not exist.

### `errorOnRefNotFound: boolean`

Set this property to `false` to disable throwing errors when an JSON pointer or JSON path does not exist.

### `operationPrefix: string`

Use this property to override the prefix to indicate a property is an operation like $import.
The default prefix is `$`but it is possible to change this to for example`@`to use keywords like`@import`.

### `params: object`

Object that will be available in [`$expression`](#expression) operations as `$params` variable.

### `stringify: boolean | "pretty"`

Set this property to `true` to stringify the JSON result. Set the property to `"pretty"` if the output should be pretty printed.

### `defaultArrayMergeOperation: "combine" | "replace" | "concat"`

Set this property to override default merge operation.
Default value is set to [`"combine"`](#combine). Possible values are:

- [`"replace"`](#replace)
- [`"concat"`](#concat)
- [`"combine"`](#combine)

## Operations

### `$import`

Use `$import` to import other JSON or YAML files.

Files imported with `$import` are processed before the result is returned.

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

When defined as an array, `$import` will process and merge the files in order before returning the result.

```json
{
  "$import": ["a.json", "b.yaml", "c.json"]
}
```

When importing a file it is also possible to provide a different `$params` object.
Setting this property will override the `Config.params` property.

```json
{
  "$import": {
    "path": "a.json",
    "params": {
      "prop": "some value that will be available in a.json as $params.prop"
    }
  }
}
```

The object syntax is also supported in an array.

```json
{
  "$import": [
    {
      "path": "a.json",
      "params": {
        "prop": "value1"
      }
    },
    {
      "path": "a.json",
      "params": {
        "prop": "value2"
      }
    }
  ]
}
```

Use [`$include`](#include) to process a file in the current scope.

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

The `$merge` operation is often used with the `$import` operation to merge other files from within the JSON itself.

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

### `$concat`

Use the `$concat` operation to concatenate two arrays.

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "someArray": [1]
}
```

**b.json**

```json
{
  "someArray": {
    "$concat": [2]
  }
}
```

**result**

```json
{
  "someArray": [1, 2]
}
```

### `$combine`

Use the `$combine` operation to combine two arrays.

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
  "someArray": {
    "$combine": [3, 3]
  }
}
```

**result**

```json
{
  "someArray": [3, 3, 3]
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

Set `$insert.index` to `-` to insert an item at the end of the array.

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

A negative `$insert.index` can be used, indicating an offset from the end of the array.

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

#### Match by JSON path query

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
      "$move": 1
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
          "$move": 1
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
          "$move": "-"
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

Be careful not to create an endless loop by selecting a parent property.

#### Select by JSON pointer

More information about JSON pointers can be found in the [JSON pointer specification](https://tools.ietf.org/html/rfc6901).

**javascript**

```javascript
var result = jsonMerger.mergeFile("a.json");
```

**a.json**

```json
{
  "prop": {
    "$select": "/otherProp"
  },
  "otherProp": "Should be the value of prop"
}
```

**result**

```json
{
  "prop": "Should be the value of prop",
  "otherProp": "Should be the value of prop"
}
```

#### Use `$select.query` to select by JSON path query

More information about JSON path queries can be found in the [JSON path documentation](https://www.npmjs.com/package/jsonpath).

**javascript**

```javascript
var result = jsonMerger.mergeFile("a.json");
```

**a.json**

```json
{
  "prop": {
    "$select": {
      "query": "$.someArray[*]"
    }
  },
  "someArray": [1, 2, 3]
}
```

**result**

```json
{
  "prop": 1,
  "someArray": [1, 2, 3]
}
```

#### Use `$select.multiple` to select multiple values

**javascript**

```javascript
var result = jsonMerger.mergeFile("a.json");
```

**a.json**

```json
{
  "prop": {
    "$select": {
      "query": "$.someArray[?(@ < 3)]",
      "multiple": true
    }
  },
  "someArray": [1, 2, 3]
}
```

**result**

```json
{
  "prop": [1, 2]
}
```

#### Use `$select.from` to select from an object

**javascript**

```javascript
var result = jsonMerger.mergeFile("a.json");
```

**a.json**

```json
{
  "prop": {
    "$select": {
      "from": {
        "$import": "b.json"
      },
      "path": "/someArray/2"
    }
  }
}
```

**b.json**

```json
{
  "someArray": [1, 2, 3]
}
```

**result**

```json
{
  "prop": 3
}
```

### `$repeat`

Use the `$repeat` operation to repeat a value.

#### Repeat with `$repeat.to`

**operation**

```json
{
  "$repeat": {
    "from": 1,
    "to": 4,
    "value": "repeat"
  }
}
```

**result**

```json
["repeat", "repeat", "repeat"]
```

#### Repeat with `$repeat.through`

The current value is available on the scope as `$repeat.value` variable.

**operation**

```json
{
  "$repeat": {
    "from": 1,
    "through": 4,
    "value": {
      "$expression": "$repeat.value"
    }
  }
}
```

**result**

```json
[1, 2, 3, 4]
```

#### Repeat with `$repeat.step`

**operation**

```json
{
  "$repeat": {
    "from": 0,
    "through": 10,
    "step": 5,
    "value": {
      "$expression": "$repeat.value"
    }
  }
}
```

**result**

```json
[0, 5, 10]
```

#### Repeat with `$repeat.range`

**operation**

```json
{
  "$repeat": {
    "range": "0:-2, 10, 20:30:5",
    "value": {
      "$expression": "$repeat.value"
    }
  }
}
```

**result**

```json
[0, -1, -2, 10, 20, 25, 30]
```

#### Repeat with `$repeat.in` as array

**operation**

```json
{
  "$repeat": {
    "in": ["a", "b"],
    "value": {
      "$expression": "$repeat.value"
    }
  }
}
```

**result**

```json
["a", "b"]
```

#### Repeat with `$repeat.in` as object

The current key is available on the scope as `$repeat.key` variable.

**operation**

```json
{
  "$repeat": {
    "in": {
      "keyA": "valueA",
      "keyB": "valueB"
    },
    "value": {
      "$expression": "{key: $repeat.key, value: $repeat.value}"
    }
  }
}
```

**result**

```json
[
  { "key": "keyA", "value": "valueA" },
  { "key": "keyB", "value": "valueB" }
]
```

#### Getting the current index

The current index is available on the scope as `$repeat.index` variable.

**operation**

```json
{
  "$repeat": {
    "range": "1:2",
    "value": {
      "$expression": "$repeat.index"
    }
  }
}
```

**result**

```json
[0, 1]
```

#### Nested repeat

Use `$parent` to get to the parent scope containing the parent `$repeat`.

**operation**

```json
{
  "$repeat": {
    "range": "0:1",
    "value": {
      "$repeat": {
        "range": "0:1",
        "value": {
          "$expression": "$parent.$repeat.index + '.' + $repeat.index"
        }
      }
    }
  }
}
```

**result**

```json
["0.0", "0.1", "1.0", "1.1"]
```

### `$include`

Use `$include` to load other JSON or YAML files and process them in the current scope.

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
      "$include": "remove.json"
    }
  ]
}
```

**remove.json**

```json
{
  "$remove": true
}
```

**result**

```json
{
  "someArray": [2, 3]
}
```

### `$expression`

Use the `$expression` operation to calculate a value with the help of a JavaScript expression.
The expression has access to the standard built-in JavaScript objects, the current [scope](#scopes) and optionally an `$input` variable.

#### Calculate a value

**javascript**

```javascript
var result = jsonMerger.mergeFile("a.json");
```

**a.json**

```json
{
  "prop": {
    "$expression": "1 + 2"
  }
}
```

**result**

```json
{
  "prop": 3
}
```

#### Calculate a value using `$expression.input`

**javascript**

```javascript
var result = jsonMerger.mergeFile("b.json");
```

**a.json**

```json
{
  "add": 2
}
```

**b.json**

```json
{
  "prop": {
    "$expression": {
      "expression": "1 + $input",
      "input": {
        "$import": "a.json#/add"
      }
    }
  }
}
```

**result**

```json
{
  "prop": 3
}
```

#### Calculate a value using the scope $targetProperty

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```json
{
  "prop": 1
}
```

**b.json**

```json
{
  "prop": {
    "$expression": "$targetProperty + 2"
  }
}
```

**result**

```json
{
  "prop": 3
}
```

#### Calculate a value using the scope $params

**javascript**

```javascript
var result = jsonMerger.mergeFile("a.json", {
  params: {
    add: 2,
  },
});
```

**a.json**

```json
{
  "prop": {
    "$expression": "1 + $params.add"
  }
}
```

**result**

```json
{
  "prop": 3
}
```

## Scopes

Scopes can be created while processing operation properties.
If for example a `$merge.with` is being processed then the merger will create a new scope for the `$merge.with` property.
Or if a `$repeat.value` property is being processed a new scope is created for the `$repeat.value` property.

A scope always has a `$source` property but not necessarily a `$target` property.

When we are merging object A with object B, then the `$target` property in the scope of object A is `undefined` because object A is not merged with anything.
It does have a `$source` property referring to object A itself.
Object B on the other hand has the processed object A as `$target` because object B is being merged with object A.
The `$source` property in the scope of object B refers to object B.

If object B had defined a `$merge` operation, then the merger would create a new scope for the `$merge.source` property and a new scope for the `$merge.with` property.

The `$target` within the `$merge.source` scope would be `undefined` because `$merge.source` is not merged with anything.
The `$target` within the `$merge.with` scope is the processed `$merge.source` because `$merge.with` is being merged with `$merge.source`.
The result of the `$merge` operation will eventually be merged with object A.

When in the `$merge.source` scope it is possible to get to the root (object B) scope using the `$root` property or to a parent scope using the `$parent` property.

```typescript
interface Scope {
  $params?: any; // $params properties in current scope
  $parent?: Scope; // reference to parent scope
  $repeat?: ScopeRepeat; // $repeat properties in current scope
  $root: Scope; // reference to root scope
  $source: any; // reference to the source object
  $target?: any; // reference to the target object
}
```

#### Example

**javascript**

```javascript
var result = jsonMerger.mergeFiles(["a.json", "b.json"]);
```

**a.json**

```js
// this is the root scope
{
  "prop1": {
    "$expression": "$target" // refers to undefined because a.json has no target
  },
  "prop2": {
    "$expression": "$targetProperty" // refers to undefined because a.json has no target
  },
  "prop3": {
    "$expression": "$source" // refers to the unprocessed a.json
  },
  "prop4": {
    "$expression": "$sourceProperty" // refers to the unprocessed a.json#/prop4
  },
  "prop5": {
    "$expression": "$root.$target" // refers to undefined because a.json has no target
  },
  "prop6": {
    "$expression": "$root.$source" // refers to the unprocessed a.json
  },
  "prop7": {
    "$expression": "$parent" // refers to undefined because the current scope has no parent scope
  },
}
```

**b.json**

```js
// this is the root scope
{
  "prop1": {
    "$expression": "$target" // refers to the processed a.json
  },
  "prop2": {
    "$expression": "$targetProperty" // refers to the processed a.json#/prop2
  },
  "prop3": {
    "$expression": "$source" // refers to the unprocessed b.json
  },
  "prop4": {
    "$expression": "$sourceProperty" // refers to the unprocessed b.json#/prop4
  },
  "prop5": {
    "$merge": {
      "source": { // $merge.source creates a new scope
        "prop1": {
          "$expression": "$target" // refers to undefined because b.json#/prop5/$merge/source has no target
        },
        "prop2": {
          "$expression": "$targetProperty" // refers to undefined because b.json#/prop5/$merge/source has no target
        },
        "prop3": {
          "$expression": "$source" // refers to the unprocessed b.json#/prop5/$merge/source
        },
        "prop4": {
          "$expression": "$sourceProperty" // refers to the unprocessed b.json#/prop5/$merge/source/prop4
        }
        "prop5": {
          "$expression": "$root.$target" // refers to the processed a.json
        }
        "prop6": {
          "$expression": "$root.$source" // refers to the unprocessed b.json
        },
        "prop7": {
          "$expression": "$parent.$target" // refers to the processed a.json
        }
        "prop8": {
          "$expression": "$parent.$source" // refers to the unprocessed b.json
        }
      },
      "with": { // $merge.with creates a new scope
        "prop1": {
          "$expression": "$target" // refers to the processed b.json#/prop5/$merge/source
        },
        "prop2": {
          "$expression": "$targetProperty" // refers to the processed b.json#/prop5/$merge/source/prop2
        },
        "prop3": {
          "$expression": "$source" // refers to the unprocessed b.json#/prop5/$merge/with
        },
        "prop4": {
          "$expression": "$sourceProperty" // refers to the unprocessed b.json#/prop5/$merge/with/prop4
        },
        "prop5": {
          "$expression": "$root.$target" // refers to the processed a.json
        },
        "prop6": {
          "$expression": "$root.source" // refers to the unprocessed b.json
        },
        "prop7": {
          "$expression": "$parent.$target" // refers to the processed a.json
        },
        "prop8": {
          "$expression": "$parent.source" // refers to the unprocessed b.json
        }
      }
    }
  },
  "prop6": {
    "$repeat": {
      "range": "0:1",
      "value": { // $repeat.value creates a new scope with a $repeat property on it
        "$repeat": {
          "range": "0:1",
          "value": { // $repeat.value creates a new scope with a $repeat property on it
            "$expression": "'This is item ' + $parent.$repeat.index + '.' + $repeat.index"
          }
        }
      }
    }
  }
}
```

---

## Command line interface `json-merger`

You can use `json-merger` as a command line tool:

```
  Usage: json-merger [options] <file ...>


  Options:

    -V, --version                       output the version number
    -p, --pretty                        pretty-print the output json
    -o, --output [file]                 the output file. Defaults to stdout
    -op, --operation-prefix [prefix]    the operation prefix. Defaults to $
    -am, --default-array-merge-operation [operation]      the default array merge operation. Defaults to combine
    --error-on-file-not-found           throw an error if a file is not found. Defaults to true
    --error-on-ref-not-found            throw an error if a JSON pointer or JSON path is not found. Defaults to true
    -h, --help                          output usage information
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

## Roadmap

- Add configurable file resolvers to import files from different sources.
- Add configurable (de)serializers to import and export different file formats.
