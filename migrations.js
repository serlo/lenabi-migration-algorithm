function matchPlugin(tree, pluginName, applyChange) {
  if (tree == null || typeof tree !== 'object') {
    return tree
  } else if (Array.isArray(tree)) {
    return tree.map((element) => matchPlugin(element, pluginName, applyChange))
  } else if (tree.plugin === pluginName) {
    // For the prototype we omit the case that transformations might be also
    // necessary to apply on nested elements
    return applyChange(tree)
  } else {
    return Object.fromEntries(
      Object.entries(tree).map(([key, value]) => [
        key,
        matchPlugin(value, pluginName, applyChange),
      ])
    )
  }
}

const migrations = {
  // Example 1: Add metadata property to image
  1: (content) =>
    matchPlugin(
      content,
      'image',
      updateState({ metadata: { author: null, license: null } })
    ),
  // Example 2: Change type of existing plugin and convert automatically
  2: (content) =>
    matchPlugin(content, 'multimedia', (plugin) => {
      return {
        plugin: 'sidebyside',
        state: {
          left: plugin.state.explanation,
          right: plugin.state.multimedia,
        },
      }
    }),
  // Example 4: Add new property caption to sidebyside plugin
  3: (content) =>
    matchPlugin(content, 'sidebyside', updateState({ caption: '' })),
}

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

function getCurrentVersion() {
  return Math.max(...Object.keys(migrations)) + 1
}

function updateState(updateOfState) {
  return (plugin) => ({
    ...plugin,
    state: { ...plugin.state, ...updateOfState },
  })
}

module.exports = { getCurrentVersion, applyMigrations }
