import { describe, test, expect } from 'vitest'
import { fromSchema, toSchema } from '.'

describe('fromSchema', () => {
  test('string from schema', async () => {
    expect(fromSchema({ type: 'String', args: ['foo'] })).toEqual('foo')
  })

  test('number from schema', async () => {
    expect(fromSchema({ type: 'Number', args: [1] })).toEqual(1)
    expect(fromSchema({ type: 'Number', args: ['42'] })).toEqual(42)
  })

  test('regex from schema', async () => {
    const result = fromSchema({
      type: 'RegExp',
      args: ['hello (\\w+)', 'i']
    })

    expect('Hey! Hello User!'.match(result)).toEqual(expect.objectContaining({ 0: 'Hello User', 1: 'User' }))
  })

  test('can be escaped', async () => {
    const escaped = {
      type: 'Object',
      args: [
        {
          type: {
            type: 'String',
            args: ['String']
          },
          args: {
            type: 'Array',
            args: [
              {
                type: 'String',
                args: ['Escaped!']
              }
            ]
          }
        }
      ]
    }

    expect(fromSchema(escaped)).toMatchObject({
      type: 'String',
      args: ['Escaped!']
    })
  })
})

describe('toSchema', () => {
  test('number to schema', async () => {
    expect(toSchema(42)).toEqual({ type: 'Number', args: [42] })
  })

  test('string to schema', async () => {
    expect(toSchema('foo')).toEqual({ type: 'String', args: ['foo'] })
  })

  test('regex to schema', async () => {
    const result = toSchema(/hello (\w+)/i)

    expect(result).toEqual({
      type: 'RegExp',
      args: ['hello (\\w+)', 'i']
    })
  })

  test('can be escaped', async () => {
    const escaped = {
      type: 'String',
      args: ['Escaped!']
    }

    expect(toSchema(escaped)).toEqual({
      type: 'Object',
      args: [
        {
          type: {
            type: 'String',
            args: ['String']
          },
          args: {
            type: 'Array',
            args: [
              {
                type: 'String',
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
    escapeMe: { type: 'String', args: ['Escaped!'] },
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
  expect(fromSchema({ type: 'Title', args: ['hello'] }, context)).toEqual('Hello')
})
