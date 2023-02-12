const { applyMigrations } = require('./migrations')

test('Migration from v1 to v2 adds metadata to the "image" plugin', () => {
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
    version: 2,
  })
})

test('Migration from v2 to v3 redefines "multimedia" plugin into "sidebyside" plugin', () => {
  expect(
    applyMigrations({
      document: {
        type: 'https://serlo.org/editor',
        content: {
          plugin: 'multimedia',
          state: { explanation: 'content 1', multimedia: 'content 2' },
        },
        version: 2,
      },
      targetVersion: 3,
    })
  ).toEqual({
    type: 'https://serlo.org/editor',
    content: {
      plugin: 'sidebyside',
      state: { left: 'content 1', right: 'content 2' },
    },
    version: 3,
  })
})

test('Migration from v1 to v2 adds caption to "sidebyside" plugin', () => {
  expect(
    applyMigrations({
      document: {
        type: 'https://serlo.org/editor',
        content: {
          plugin: 'sidebyside',
          state: { left: 'content 1', right: 'content 2' },
        },
        version: 3,
      },
      targetVersion: 4,
    })
  ).toEqual({
    type: 'https://serlo.org/editor',
    content: {
      plugin: 'sidebyside',
      state: { left: 'content 1', right: 'content 2', caption: '' },
    },
    version: 4,
  })
})

test('Migration from v1 to v4 would apply all migrations', () => {
  expect(
    applyMigrations({
      document: {
        type: 'https://serlo.org/editor',
        content: {
          plugin: 'article',
          state: [
            {
              plugin: 'image',
              state: { src: 'http://example.com/image.png' },
            },
            {
              plugin: 'multimedia',
              state: { explanation: 'content 1', multimedia: 'content 2' },
            },
          ],
        },
        version: 1,
      },
    })
  ).toEqual({
    type: 'https://serlo.org/editor',
    content: {
      plugin: 'article',
      state: [
        {
          plugin: 'image',
          state: {
            src: 'http://example.com/image.png',
            metadata: { author: null, license: null },
          },
        },
        {
          plugin: 'sidebyside',
          state: { left: 'content 1', right: 'content 2', caption: '' },
        },
      ],
    },
    version: 4,
  })
})

test('Migration from v2 to v4 would apply all migrations for "sidebyside" plugin', () => {
  expect(
    applyMigrations({
      document: {
        type: 'https://serlo.org/editor',
        content: {
          plugin: 'article',
          state: [
            {
              plugin: 'multimedia',
              state: { explanation: 'content 1', multimedia: 'content 2' },
            },
          ],
        },
        version: 2,
      },
    })
  ).toEqual({
    type: 'https://serlo.org/editor',
    content: {
      plugin: 'article',
      state: [
        {
          plugin: 'sidebyside',
          state: { left: 'content 1', right: 'content 2', caption: '' },
        },
      ],
    },
    version: 4,
  })
})
