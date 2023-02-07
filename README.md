# Migration Algorithm for Serlo Editor Document Format

*M.2.2. Ein Migrationsalgorithmus für das Speicher- und Austauschformat ist implementiert. (Dieser ermöglicht, dass parallel neue Lerninhalte für den Editor entwickelt werden können und Lerninhalte im Speicher- und Austauschformat standardisiert werden können.)*

## Introduction

No software is set in stone. There will always be the need to add or change features. But doing these changes shouldn't make existing content inacessible. As a fairly youn project, the Serlo Editor will undergo a lot of developments in the foreseeable future, so we have to prepare for changes in the format of the content we store.

## Overview

To ensure backwards-compatibility, the Serlo Editor will use a built-in migration algorithm. Every document has a field that defines the current version of the format. The version number is an integer starting from 1. Everytime a breaking-change is made to the format, the version increases by 1. In addition, there will be a migration function provided that takes a document from version `n ` and converts it to a valid file of version `n + 1`:

![grafik](https://user-images.githubusercontent.com/13507950/217203324-ca8102c3-7103-4c3a-b82e-a9d00bcb25b6.png)

This way, we can ensure that the latest version of the editor is read all documents created with the same or earlier versions.

## Implementation

This section will outline a possible implementation strategy.

### Document Format and version number.

On the top-level, a document is a JSON-object with a `type` property and some custom fields that may contain nested documents. The top-level object (also called plugin) will get a version tag:

```json
{
  "type": "article",
  "title": "Sinus und Kosinus",
  "content":
    "nested subdocument ... ",
  "__meta_version": 1
}
```

### Migration Definition

```
const migrations = {
  1: function(document) {
    // do some migrations from 1 -> 2
    return document
  },
  2: function(document) {
    // do some migrations from 2 -> 3
    return document
  }
}
```

### Running Migrations

```
function runMigration(document) {
  let version = document.__meta_version
  while (version < SerloEditor.currentVersion) {
    document = migrations[version](document)
    version++
    documnet.__meta_version = version
  }
}
```

### Exmaple Migrations

- Change field name
- single value to array
- add new property
- ...

## Notes

To make this system work, we have to make sure that all changes are automatically convertable without manual intervention, e.g. by choosing a good default value for new fields.

We don't want to run migrations on the database, as this could break documents. Documents are only updated after a new edit.

This system is very closes with h5p migration strategy, which is quite handy.
