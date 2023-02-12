const fs = require('fs')
const prettier = require('prettier')

const { migrations, getCurrentVersion } = require('./migrations')
const v1 = require('./document_v1.json')

// main
function runMigrations(document) {
  while (document.version < getCurrentVersion()) {
    document.content = migrations[document.version](document.content)
    console.log(
      'Document migrated from version',
      document.version,
      'to version',
      document.version + 1
    )
    document.version++
    fs.writeFileSync(
      './document_v' + document.version + '.json',
      prettier.format(JSON.stringify(document), {
        ...prettierConfig,
        parser: 'json',
      })
    )
  }
  return document
}

runMigrations(v1)
