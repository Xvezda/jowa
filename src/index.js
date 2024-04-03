/**
 * @typedef {{
 *   type: string;
 *   args: (Schema | any)[];
 * }} Schema
 */

/**
 * @typedef {{
 *   [k: string]: Schema | any;
 * }} Context
 */

/**
 * @param {any} s
 * @returns {s is Schema}
 */
export const isSchema = (s) => s && typeof s === 'object' && typeof s.type === 'string' && Array.isArray(s.args)

/**
 * @param {Schema} schema
 * @param {Context} context
 * @returns {any}
 * @throws {Error}
 */
export function fromSchema (schema, context = globalThis) {
  const type = context[schema.type]
  if (typeof type !== 'function') throw new Error(`Unknown type: ${schema.type}`)

  const result = type.apply(null, schema.args.map(s => {
    if (isSchema(s)) {
      return fromSchema(s)
    } else if (s && typeof s === 'object' && !Array.isArray(s)) {
      const copy = { ...s }
      for (const [k, v] of Object.entries(s)) {
        if (isSchema(v)) {
          copy[k] = fromSchema(v)
        }
      }
      return copy
    }
    return s
  }))
  return result
}

/**
 * @param {any} value
 * @returns {Schema | null}
 * @throws {Error}
 */
export function toSchema (value) {
  if (value === null) return null

  if (typeof value === 'number') {
    return {
      type: 'Number',
      args: [value]
    }
  }

  if (typeof value === 'string') {
    return {
      type: 'String',
      args: [value]
    }
  }

  if (typeof value === 'boolean') {
    return {
      type: 'Boolean',
      args: [value]
    }
  }

  if (value instanceof RegExp) {
    return {
      type: 'RegExp',
      args: [
        value.source,
        value.flags
      ]
    }
  }

  if (Array.isArray(value)) {
    return {
      type: 'Array',
      args: value.map(toSchema)
    }
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    /** @type {{ [k: string]: any }} */
    const args = {}
    for (const [k, v] of Object.entries(value)) {
      try {
        args[k] = toSchema(v)
      } catch (e) {
        continue
      }
    }

    return {
      type: 'Object',
      args: [args]
    }
  }
  throw new Error(`Unsupported value: ${value}`)
}
