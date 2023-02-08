# Migration Algorithm for Serlo Editor Document Format

*M.2.2. Ein Migrationsalgorithmus für das Speicher- und Austauschformat ist implementiert. (Dieser ermöglicht, dass parallel neue Lerninhalte für den Editor entwickelt werden können und Lerninhalte im Speicher- und Austauschformat standardisiert werden können.)*

## Introduction

No software is set in stone, and there will always be a need to add or change features. However, these changes should not render existing content inaccessible. As a relatively young project, the Serlo Editor is poised for significant development in the near future, so we must be prepared for changes in the format of the stored content.

## Overview

To maintain backward compatibility, the Serlo Editor will employ a built-in migration algorithm. Each document contains a field that defines its current format version, represented by an integer starting from 1. Whenever a format change occurs, the version number is incremented by 1. Moreover, a migration function will be supplied that converts a document from version `n` to a valid document of version `n + 1`.

![grafik](https://user-images.githubusercontent.com/13507950/217207637-208e27cf-e7c5-4ee9-ac12-dc7055ce9743.png)

By employing this approach, we can guarantee that the latest version of the editor will be able to read all documents created using the same or earlier versions of the format. This way, we can ensure that the existing content remains accessible even as the software evolves and improves over time. Additionally, this approach also makes it easier to update to the latest version of the editor without having to worry about compatibility issues.

## Implementation

This section outlines a proposed implementation strategy.

### Document Format and version number

At the top level, a document is encapsulated in a JSON object with three properties:

- `type`: This property identifies the document as one created by the Serlo Editor and has a fixed string value of `"https://serlo.org/editor"`.
- `version`: An integer, as described previously.
- `content`: This property contains a plugin that is compatible with the Serlo Editor. Each plugin has a type and a state, where the state may contain nested plugins.

This is a minimal example for such a document:

```json
{
  "type": "https://serlo.org/editor",
  "version": 1,
  "content": {
    "plugin": "article",
    "state": ...
  }
}
```

The file [document_v1.json](https://github.com/serlo/lenabi-migration-algorithm/blob/49599f2d33d087200b9006b3d45e61d610b13e32/document_v1.json) contains a full example of a Serlo Editor document that implements the proposed version management scheme.


### Migrations

For every version except the current one, the file [migrations.js](https://github.com/serlo/lenabi-migration-algorithm/blob/main/migrations.js) defines a function that transforms the content of a document from that version to the next version. The basic structure is as follows:

```js
//migrations.js

export const migrations = {
  1: function(content) {
    // transform content from version 1 to version 2
    return content
  },
  2: function(content) {
    // transform content from version 2 to version 3
    return content
  }
  // ... and more migrations
}
```

This repo demonstrates some examples of possible migrations and there implementation:

- v1 -> v2: The image-plugin gets a new property `metadata` with a string about possible meta data like author or special licenses
- v2 -> v3: rename plugin "multimedia" to "sidebyside" to allow better naming convention
- v3 -> v4: To avoid duplication, set title to empty if it's the same as the link in the sources

### Running Migrations

TODO

To test the migrations itself, this repo includes a small runner script that compares the migrations with the output files.

```js
function runMigration(document) {
  let version = document.version
  while (version < SerloEditor.currentVersion) {
    document = migrations[version](document)
    version++
    documnet.version = version
  }
}
```

## Limitations

To make this system work, we have to make sure that all changes are automatically convertable without manual intervention, e.g. by choosing a good default value for new fields.

We don't want to run migrations on the database, as this could break documents. Documents are only updated after a new edit.

This system is very closes with h5p migration strategy, which is quite handy.
