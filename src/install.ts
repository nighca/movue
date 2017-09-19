import VueClass from 'vue'
import { optionName, disposersName } from './utils'

export interface IMobxMethods {
  reaction: any
}

export type Disposer = () => void

export default function install(Vue: typeof VueClass, mobxMethods: IMobxMethods) {

  const defineReactive = (Vue as any).util.defineReactive

  function beforeCreate(this: VueClass) {
    const vm = this
    getFromStoreEntries(vm).forEach(({ key, compute }) => {
      defineReactive(vm, key, null)
    })
  }

  function created(this: VueClass) {
    const vm = this
    const entries = getFromStoreEntries(vm)
    if (entries.length <= 0) {
      return
    }

    const disposers: Disposer[] = vm[disposersName] = []

    entries.forEach(({ key, compute }) => {
      disposers.push(mobxMethods.reaction(
        () => compute.apply(vm),
        val => {
          vm[key] = val
        },
        true
      ))
    })
  }

  function beforeDestroy(this: VueClass) {
    const vm = this
    const disposers: Disposer[] = vm[disposersName]
    if (disposers) {
      disposers.forEach(
        dispose => dispose()
      )
    }
  }

  Vue.mixin({
    beforeCreate,
    created,
    beforeDestroy
  })
}

function getFromStoreEntries(vm: VueClass) {
  const fromStore = vm.$options[optionName]
  if (!fromStore) {
    return []
  }

  return Object.keys(fromStore).map(
    key => ({ key, compute: fromStore[key] })
  )
}
