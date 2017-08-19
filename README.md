# json-merger
Merge JSON (or YAML) files and objects with operations like $import $remove $replace $merge and more.

Table of Contents:
------------------
* [Merger](#merger)
* [`.mergeFile("a.json", config?)`](#merge-file)
* [`.mergeFiles(["a.json", "b.json"], config?)`](#merge-files)
* [`.mergeObject(object, config?)`](#merge-object)
* [`.mergeObjects([object1, object2], config?)`](#merge-objects)
* [`.addFile("b.json", content)`](#add-file)
* [`.addFiles([{path, content}])`](#add-file)
* [`.addFileSerializer(regex, serializeFn)`](#add-file)
* [`.addFileDeserializer(regex, deserializeFn)`](#add-file)
* [Config](#config)
  * [cwd: string](#config-cwd)
  * [files: FileMap](#config-files)
  * [stringify: boolean](#config-stringify)
  * [operationPrefix: string](#config-operation-prefix)
  * [errorOnInvalidImport: boolean](#config-error-on-invalid-import)
  * [errorOnInvalidSelect: boolean](#config-error-on-invalid-select)
* [Operations](#operations)
  * [`$import`](#import)
  * [`$merge`](#merge)
  * [`$remove`](#remove)
  * [`$replace`](#replace)
  * [`$select`](#select)
  * [`$append`, `$prepend`, `$insert`](#append-prepend-insert)
  * [`$match`](#match)
  * [`$move`](#move)
  * [`$expression`](#expression)
  * [`$process`](#process)
  * [`$comment`](#comment)
* [Command line interface `json-merger`](#command-line-interface-json-merger)

Apply operations such as [`$insert`](#append-prepend-insert), [`$match`](#match) and [`$replace`](#replace) to tell the processor how to merge the files.

`.mergeFile("file.json")`
------------------------

    var jsonMerger = require("json-merger");
    var result = jsonMerger.mergeFile("a.json");

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

Result:

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

`.mergeObject(object)`
------------------------

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

Result:

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

--------

Operations:
-----------

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


### `$remove`

Use the `$remove` operation to remove a property or array item.

#### Remove an object property

**a.json**

```json
{
  "$merge": {
    "source": {
      "$import": "b.json"
    },
    "with": {
      "prop2": {
        "$remove": true
      }
    }
  }
}
```

**b.json**

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

**Merger.mergeFile("a.json")**

```json
{
  "prop1": {
    "prop1a": "some value"
  }
}
```

#### Remove an array item

**a.json**

```json
{
  "$merge": {
    "source": {
      "$import": "b.json"
    },
    "with": {
      "someArray": [
        {
          "$remove": true
        },
        {
          "$remove": true
        }
      ]
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

**Merger.mergeFile("a.json")**

```json
{
  "someArray": [3]
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
    --error-on-invalid-import        throw an error if an import does not exist. Defaults to true
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
