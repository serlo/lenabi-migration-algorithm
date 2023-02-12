const fs = require('fs')
const prettier = require('prettier')
const prettierConfig = require('./.prettierrc.js')

const { migrations } = require('./migrations')
const v1 = require('./document_v1.json')

const SerloEditor = { currentVersion: 4 }

// main
function runMigrations(document) {
  while (document.version < SerloEditor.currentVersion) {
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
