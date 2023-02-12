function matchPlugin(tree, pluginName, applyChange) {
  if (!tree) return
  if (Array.isArray(tree)) {
    tree.forEach((element) => {
      matchPlugin(element, pluginName, applyChange)
    })
  } else if (tree.plugin === pluginName) {
    applyChange(tree)
  } else if (typeof tree === 'object') {
    for (const prop in tree) {
      if (Object.hasOwn(tree, prop)) {
        matchPlugin(tree[prop], pluginName, applyChange)
      }
    }
  }
}

const migrations = {
  1: function (content) {
    // Example 1: Add metadata property to image
    matchPlugin(content, 'image', (plugin) => {
      plugin.state.metadata = {
        author: null,
        license: null,
      }
    })

    return content
  },
  2: function (content) {
    // Example 2: Change type of existing plugin and convert automatically
    matchPlugin(content, 'multimedia', (plugin) => {
      plugin.plugin = 'sidebyside'
      plugin.state = {
        left: plugin.state.explanation,
        right: plugin.state.multimedia,
      }
    })

    return content
  },
  3: function (content) {
    // Example 4: Add new property caption to sidebyside plugin
    matchPlugin(content, 'sidebyside', (plugin) => {
      plugin.caption = ''
    })

    return content
  },
}

function applyMigrations({ document, targetVersion = getCurrentVersion() }) {
  for (let v = document.version; v < targetVersion; v++) {
    document = migrations[v](document)
  }

  return document
}

function getCurrentVersion() {
  return Math.max(...Object.keys(migrations)) + 1
}

module.exports = { migrations, getCurrentVersion, applyMigrations }
