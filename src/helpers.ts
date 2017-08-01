export function mapFields(store: object, fieldNames: string[]): Object {
  return fieldNames.reduce(
    (result, fieldName) => Object.assign(result, {
      [fieldName]: () => store[fieldName]
    }),
    {}
  )
}

export function mapMethods(store, methodNames: string[]) {
  return methodNames.reduce(
    (result, methodName) => Object.assign(result, {
      [methodName]: store[methodName].bind(store)
    }),
    {}
  )
}
