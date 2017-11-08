export type PropList<TPropType> = string[] | { [propAlias: string]: TPropType }
export type FieldDescription = {
  get: string | ((store: object) => any),
  set?: string | ((store: object, value: any) => void)
}
export type MappedField = (() => any) | { get: () => any, set?: (value) => void }
export type propMaper<TPropType, TResult> = (store: object, propName: TPropType) => TResult

function mapProps<TPropType, TMapResult>(
  store: object,
  propNames: PropList<TPropType>,
  mapProp: propMaper<TPropType, TMapResult>
): object {
  const isArray = Array.isArray(propNames)

  return Object.keys(propNames).reduce(
    (result, key) => {
      const propAlias = isArray ? propNames[key] : key
      const propName = propNames[key]

      return Object.assign(result, {
        [propAlias]: mapProp(store, propName)
      })
    },
    {}
  )
}

function mapField(store: object, fieldDescription: string | FieldDescription): MappedField {
  if (typeof fieldDescription === 'string') {
    return () => store[fieldDescription]
  }

  const fieldDescriptionGet = fieldDescription.get
  let getter
  if (typeof fieldDescriptionGet === 'function') {
    getter = () => fieldDescriptionGet(store)
  } else {
    getter = () => store[fieldDescriptionGet]
  }

  const fieldDescriptionSet = fieldDescription.set
  let setter
  if (typeof fieldDescriptionSet === 'function') {
    setter = (value) => { fieldDescriptionSet(store, value) }
  } else if (typeof fieldDescriptionSet === 'string') {
    setter = (value) => { store[fieldDescriptionSet](value) }
  }

  return {
    get: getter,
    set: setter
  }
}

export function mapFields(store: object, fieldNames: PropList<string> | PropList<FieldDescription>): object {
  return mapProps(store, fieldNames, mapField)
}

function mapMethod(store: object, methodName: string): Function {
  return store[methodName].bind(store)
}

export function mapMethods(store: object, methodNames: PropList<string>): object {
  return mapProps(store, methodNames, mapMethod)
}
