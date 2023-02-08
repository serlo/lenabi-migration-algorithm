function matchPlugin(tree, type, f) {
  if (!tree) return
  if (Array.isArray(tree)) {
    tree.forEach((element) => {
      matchPlugin(element, type, f)
    })
  } else if (tree.plugin === type) {
    f(tree)
  } else if (typeof tree === 'object') {
    for (const prop in tree) {
      if (Object.hasOwn(tree, prop)) {
        matchPlugin(tree[prop], type, f)
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

module.exports = { migrations }
