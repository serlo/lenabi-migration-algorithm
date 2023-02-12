# Migration Algorithm for Serlo Editor Document Format

_M.2.2. Ein Migrationsalgorithmus für das Speicher- und Austauschformat ist
implementiert. (Dieser ermöglicht, dass parallel neue Lerninhalte für den Editor
entwickelt werden können und Lerninhalte im Speicher- und Austauschformat
standardisiert werden können.)_

## Introduction

No software is set in stone, and there will always be a need to add or change
features. However, these changes should not render existing content
inaccessible. As a relatively young project, the Serlo Editor is poised for
significant development in the near future, so we must be prepared for changes
in the format of the stored content.

## Overview

To maintain backward compatibility, the Serlo Editor will employ a built-in
migration algorithm. Each document contains a field that defines its current
format version, represented by an integer starting from 1. Whenever a format
change occurs, the version number is incremented by 1. Moreover, a migration
function will be supplied that converts a document from version `n` to a valid
document of version `n + 1`.

![grafik](https://user-images.githubusercontent.com/13507950/217872727-9c725bb5-b45e-402e-b1de-63a1bff5b30f.png)

By employing this approach, we can guarantee that the latest version of the
editor will be able to read all documents created using the same or earlier
versions of the format. This way, we can ensure that the existing content
remains accessible even as the software evolves and improves over time.
Additionally, this approach also makes it easier to update to the latest version
of the editor without having to worry about compatibility issues.

## Implementation

This section outlines a proposed implementation strategy.

### Document Format and version number

At the top level, a document is encapsulated in a JSON object with three
properties:

- `type`: This property identifies the document as one created by the Serlo
  Editor and has a fixed string value of `"https://serlo.org/editor"`.
- `version`: An integer, as described previously.
- `content`: This property contains a plugin that is compatible with the Serlo
  editor. Each plugin has a type and a state, where the state may contain nested
  plugins (see
  [description of the Serlo content format](https://github.com/serlo/documentation/wiki/Content-format)).

This is a minimal example for such a document:

```json
{
  "type": "https://serlo.org/editor",
  "version": 1,
  "content": {
    "plugin": "article",
    "state": {}
  }
}
```

The file
[document_v1.json](https://github.com/serlo/lenabi-migration-algorithm/blob/49599f2d33d087200b9006b3d45e61d610b13e32/document_v1.json)
contains a full example of a Serlo Editor document that implements the proposed
version management scheme.

### Migrations

For every version except the current one, the file
[migrations.js](https://github.com/serlo/lenabi-migration-algorithm/blob/main/migrations.js)
defines in a registry `migrations` a function that transforms the content of a
document from that version to the next version. The basic structure is as
follows:

```js
//migrations.js

const migrations = {
  1: function (content) {
    // transform content from version 1 to version 2
    return content
  },
  2: function (content) {
    // transform content from version 2 to version 3
    return content
  },
  // ... and more migrations
}
```

Those functions can be used to migrate a document `document` from its current
version to `targetVersion` by applying the necessary migrations in sequence:

```js
function applyMigrations({ document, targetVersion = getCurrentVersion() }) {
  for (let v = document.version; v < targetVersion; v++) {
    document = {
      ...document,
      content: migrations[v](document.content),
      version: v + 1,
    }
  }

  return document
}
```

This repository showcases some examples of potential migrations and their
implementation (Note that the examples only showcase the possibilities of
migrations and do not represent features that are planned to be implemented):

- `v1 -> v2`: A new "metadata" property is added to the state of the image
  plugin. It is given a default value of `{author: null, license: null}` to
  indicate the absence of any special metadata.
- `v2 -> v3`: The multimedia plugin is made more generic and renamed to
  `sidebyside`. The `illustrating` and `width` properties are removed and
  `explanation` and `multimedia` are renamed to `left` and `right`.
- `v3 -> v4`: A new property "caption" is added to the state of the sidebyside
  plugin. The default value of the caption is set to the empty string `""`.

You can refer to
[migrations.js](https://github.com/serlo/lenabi-migration-algorithm/blob/main/migrations.js)
for more details on how these features are implemented.

### Running tests / examples

The file [`migrations.test.js`](./migrations.test.js) showcases small examples
for the above migrations as well as how the migrations can be applied in
sequence in two cases. You can run the tests with `yarn test`.

### Running Migrations

This repository also includes a small script that executes the mutations on the
document `document_v1.json`. If you have node.js installed, you can run it with
following command (or directly with `yarn run:migrations`):

```sh
node index.js
```

If everything worked out, you can see this output:

```
Document migrated from version 1 to version 2
Document migrated from version 2 to version 3
Document migrated from version 3 to version 4
```

You can see the result of the migrations in the files `document_v2.json` to
`document_v4.json`. For demonstrating, the repository also contains the diffs of the
files.

## Comparison to the migration algorithm of H5P

The algorithm specified in this document is compatible to the
[migration algorithm of H5P](https://h5p.org/documentation/developers/content-upgrade).
Also H5P uses a sequence of migrations plugins. The main difference is, that in
H5P the version of the content matches the version of the source code itself.
They use the major and minor version to specify each migration step in the
registry:

```js
{
  [majorVersion]: {
    [minorVersion]: {
      contentUpgrade: function (parameters, finished) {}
    }
  }
}
```

Our implementation has some advantages:

- H5P applies a versioning to each of its plugins while we would apply only one
  global version number for all Serlo editor plugins. Thus we can incorporate
  migrations where one plugin is replaced by another (for example when it is
  completely rewritten) or when the content format totally changes (for example
  when we change the core framework of the editor). For those use cases the H5P
  migration algorithm cannot be used.
- We can add multiple migration steps in one update of the editor while for H5P
  all migrations in a version update need to be concatenated.
- Our migration algorithm is slightly simpler to implement.
- Our migration algorithm can be easily mapped to the H5P algorithm and thus be
  used in case we want to export our Content in the H5P file format.

In contrast in H5P it is easier to see which Plugin version is needed to render
a certain content. However both algorithm share the same basic ideas.

## Limitations

In order to ensure that the system operates smoothly, it is important to make
all changes convertible without manual intervention. This can be achieved by
selecting appropriate default values for new fields.

To minimize the risk of breaking existing documents, migrations should not be
performed directly on the database. Instead, documents should only be updated
after a new edit is made.

A migration can also only transformation which are already stored. Take for
example a table plugin where in a newer version an optional header got
introduced. Here we cannot provide a general migration algorithm since we do
cannot decide automatically whether a already defined table has a header or not.
However we can use and combine some solutions in this case:

- We can implement a good guess for the transformation (e.g if the design of the
  first row differs from the rest then the chance is high that it is a table).
- We can still ship the old table plugin which we only use for rendering tables
  in the old format.
- We can show to authors that a transformation is needed when they edit the
  document again.
