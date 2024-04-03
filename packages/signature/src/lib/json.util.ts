/* eslint-disable @typescript-eslint/no-explicit-any */

type Transformation = (key: string, value: any) => any

type ExtendType = {
  replacer: Transformation
}

const EXTENDED_TYPES: Record<string, ExtendType> = {
  bigint: {
    replacer: (key: string, value: any) => {
      // IMPORTANT: The bigint replacer [1] has a significant limitation that
      // hinders its use with a reviver [2].
      //
      // In theory, JSON parse and stringify operations should allow for
      // round-trip conversion. However, once a bigint is converted to a string,
      // it becomes challenging to discern whether the string value was
      // originally a number or a bigint.
      //
      // To address this, one proposed solution is to either prefix the
      // stringified bigint with a unique marker, like
      // bigint:<stringified-bigint>, or transform the bigint into an object
      // with a special key indicating its type, such as { __type: 'bigint',
      // value: <stringified-bigint> }.
      //
      // Personally, I'm not in favor of these methods as transforming the key
      // into an object requires the entire system to understand how to process
      // it, or it forces consumers to be aware of the format for sending
      // correct data.
      //
      // Given these considerations, I would advise against using the reviver in
      // this scenario and only apply the replacer during stringify operations,
      // with the understanding that it won't be possible to revert the string
      // back to its original bigint form.
      //
      // Reference
      // [1] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#replacer
      // [2] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver
      if (typeof value === 'bigint') {
        return value.toString()
      } else {
        return value
      }
    }
  }
}

export const stringify = (value: any) => {
  return JSON.stringify(value, (key: string, value: any) => {
    const type = typeof value

    if (EXTENDED_TYPES[type]) {
      return EXTENDED_TYPES[type].replacer(key, value)
    } else {
      return value
    }
  })
}

/**
 * Canonicalization of JSON objects, as per https://datatracker.ietf.org/doc/html/rfc8785
 *
 * Source Credit: https://github.com/erdtman/canonicalize
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function canonicalize(object: any): string {
  if (typeof object === 'number' && isNaN(object)) {
    throw new Error('NaN is not allowed')
  }

  if (typeof object === 'number' && !isFinite(object)) {
    throw new Error('Infinity is not allowed')
  }

  if (object === null || typeof object !== 'object') {
    return stringify(object)
  }

  if (object.toJSON instanceof Function) {
    return canonicalize(object.toJSON())
  }

  if (Array.isArray(object)) {
    const values = object.reduce((t, cv, ci) => {
      const comma = ci === 0 ? '' : ','
      const value = cv === undefined || typeof cv === 'symbol' ? null : cv
      return `${t}${comma}${canonicalize(value)}`
    }, '')
    return `[${values}]`
  }

  const values = Object.keys(object)
    .sort()
    .reduce((t, cv) => {
      if (object[cv] === undefined || typeof object[cv] === 'symbol') {
        return t
      }
      const comma = t.length === 0 ? '' : ','
      return `${t}${comma}${canonicalize(cv)}:${canonicalize(object[cv])}`
    }, '')
  return `{${values}}`
}
