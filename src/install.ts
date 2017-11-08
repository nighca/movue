import VueClass from 'vue'

export type Disposer = () => void
export type Getter = () => any
export type Setter = (value: any) => void
export type FromMobxEntries = {
  key: string,
  get: Getter,
  set?: Setter
}
export type VueComputed = Getter | { get: Getter, set: Setter }

export interface IMobxMethods {
  reaction: (getter: Getter, reaction: (value: any) => void, any) => Disposer
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends VueClass> {
    fromMobx?: { [key: string]: (this: V) => any }
  }
}

const movueDisposersKey = '__movueDisposers__'

export default function install(Vue: typeof VueClass, mobxMethods: IMobxMethods) {

  const defineReactive = (Vue as any).util.defineReactive

  function beforeCreate(this: VueClass) {
    const vm = this

    vm.$options.computed = getFromStoreEntries(vm).reduce(
      (computed, { key, set }) => {
        const reactivePropertyKey = getReactivePropertyKey(key)
        defineReactive(vm, reactivePropertyKey, null, null, true)

        return Object.assign(
          computed,
          { [key]: createComputedField(vm, reactivePropertyKey, set) }
        )
      },
      vm.$options.computed || {}
    )
  }

  function created(this: VueClass) {
    const vm = this

    const disposers: Disposer[] = getFromStoreEntries(vm).map(({ key, get }) => {
      const reactivePropKey = getReactivePropertyKey(key)
      const updateReactiveProperty = value => { vm[reactivePropKey] = value }
      return mobxMethods.reaction(() => get.call(vm), updateReactiveProperty, true)
    })

    vm[movueDisposersKey] = disposers
  }

  function beforeDestroy(this: VueClass) {
    const vm = this

    const disposers: Disposer[] = vm[movueDisposersKey]
    if (disposers) {
      disposers.forEach(dispose => dispose())
    }
  }

  Vue.mixin({
    beforeCreate,
    created,
    beforeDestroy
  })
}

function createComputedField(vm: VueClass, key: string, setter?: Setter): VueComputed {
  if (typeof setter === 'function') {
    return {
      get: () => vm[key],
      set: (value) => setter.call(vm, value)
    }
  }

  return () => vm[key]
}

function getFromStoreEntries(vm: VueClass): FromMobxEntries[] {
  const fromStore = vm.$options.fromMobx
  if (!fromStore) {
    return []
  }

  return Object.keys(fromStore).map(key => {
    const field = fromStore[key]
    const isFieldFunction = typeof field === 'function'
    const isSetterFunction = !isFieldFunction && typeof field.set === 'function'

    return {
      key,
      get: isFieldFunction ? field : field.get,
      set: isSetterFunction ? field.set : null
    }
  })
}

function getReactivePropertyKey(fieldKey: string): string {
  return `__movue_${fieldKey}`
}
