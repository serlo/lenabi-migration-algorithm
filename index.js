const fs = require('fs')
const prettier = require('prettier')

const { applyMigrations, getCurrentVersion } = require('./migrations')
const prettierConfig = require('./.prettierrc.js')
const document_v1 = require('./document_v1.json')

// main
function runMigrations(document) {
  for (
    let targetVersion = document.version + 1;
    targetVersion <= getCurrentVersion();
    targetVersion++
  ) {
    const newDocument = applyMigrations({ document, targetVersion })

    console.log(
      'Document migrated from version',
      document.version,
      'to version',
      newDocument.version
    )

    fs.writeFileSync(
      './document_v' + targetVersion + '.json',
      prettier.format(JSON.stringify(newDocument), {
        ...prettierConfig,
        parser: 'json',
      })
    )
  }
}

runMigrations(document_v1)
