const { applyMigrations } = require('./migrations')

test('Migration from v1 to v2 adds metadata to an image', () => {
  expect(
    applyMigrations({
      document: {
        type: 'https://serlo.org/editor',
        content: {
          plugin: 'image',
          state: { src: 'http://example.com/image.png' },
        },
        version: 1,
      },
      targetVersion: 2,
    })
  ).toEqual({
    type: 'https://serlo.org/editor',
    content: {
      plugin: 'image',
      state: {
        src: 'http://example.com/image.png',
        metadata: { author: null, license: null },
      },
    },
    version: 1,
  })
})
