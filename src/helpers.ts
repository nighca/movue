export type PropList = string[] | { [propAlias: string]: string }

function mapProps(store: object, propNames: PropList, mapProp: (store: object, propName: string) => Function): object {
  const isArray = propNames instanceof Array;

  return Object.keys(propNames).reduce(
    (result, key) => {
      const propAlias = isArray ? propNames[key] : key;
      const propName = propNames[key];

      return Object.assign(result, {
        [propAlias]: mapProp(store, propName)
      })
    },
    {}
  )
}

function mapField(store: object, fieldName: string): Function {
  return () => store[fieldName]
}

export function mapFields(store: object, fieldNames: PropList): object {
  return mapProps(store, fieldNames, mapField)
}

function mapMethod(store: object, methodName: string): Function {
  return store[methodName].bind(store)
}

export function mapMethods(store: object, methodNames: PropList): object {
  return mapProps(store, methodNames, mapMethod)
}