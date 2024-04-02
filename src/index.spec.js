import { describe, test, expect } from 'vitest'
import { fromSchema, toSchema } from '.'

describe('fromSchema', () => {
  test('string from schema', async () => {
    expect(fromSchema({ ctor: 'String', args: ['foo'] })).toEqual('foo')
  })

  test('number from schema', async () => {
    expect(fromSchema({ ctor: 'Number', args: [1] })).toEqual(1)
    expect(fromSchema({ ctor: 'Number', args: ['42'] })).toEqual(42)
  })

  test('regex from schema', async () => {
    const result = fromSchema({
      ctor: 'RegExp',
      args: ['hello (\\w+)', 'i']
    })

    expect('Hey! Hello User!'.match(result)).toEqual(expect.objectContaining({ 0: 'Hello User', 1: 'User' }))
  })

  test('can be escaped', async () => {
    const escaped = {
      ctor: 'Object',
      args: [
        {
          ctor: {
            ctor: 'String',
            args: ['String']
          },
          args: {
            ctor: 'Array',
            args: [
              {
                ctor: 'String',
                args: ['Escaped!']
              }
            ]
          }
        }
      ]
    }

    expect(fromSchema(escaped)).toMatchObject({
      ctor: 'String',
      args: ['Escaped!']
    })
  })
})

describe('toSchema', () => {
  test('number to schema', async () => {
    expect(toSchema(42)).toEqual({ ctor: 'Number', args: [42] })
  })

  test('string to schema', async () => {
    expect(toSchema('foo')).toEqual({ ctor: 'String', args: ['foo'] })
  })

  test('regex to schema', async () => {
    const result = toSchema(/hello (\w+)/i)

    expect(result).toEqual({
      ctor: 'RegExp',
      args: ['hello (\\w+)', 'i']
    })
  })

  test('can be escaped', async () => {
    const escaped = {
      ctor: 'String',
      args: ['Escaped!']
    }

    expect(toSchema(escaped)).toEqual({
      ctor: 'Object',
      args: [
        {
          ctor: {
            ctor: 'String',
            args: ['String']
          },
          args: {
            ctor: 'Array',
            args: [
              {
                ctor: 'String',
                args: ['Escaped!']
              }
            ]
          }
        }
      ]
    })
  })
})

test('combined', async () => {
  const combined = {
    foo: { bar: 'baz' },
    fizz: [1, 2, 'buzz'],
    hello: /^world$/gi,
    escapeMe: { ctor: 'String', args: ['Escaped!'] },
    flag: true,
    empty: null
  }

  // @ts-ignore
  expect(fromSchema(toSchema(combined))).toMatchObject(combined)

  // @ts-ignore
  expect(fromSchema(toSchema(fromSchema(toSchema(combined))))).toMatchObject(combined)
})

test('customizability', async () => {
  const context = {
    /** @param {string} args */
    Title (args) {
      return args[0].charAt(0).toUpperCase().concat(args.substring(1))
    }
  }
  expect(fromSchema({ ctor: 'Title', args: ['hello'] }, context)).toEqual('Hello')
})
