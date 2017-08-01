import VueClass from 'vue'
import { optionName, disposersName } from './utils'

interface IMobxMethods {
  reaction: any
}

type Disposer = () => void

function install(Vue: typeof VueClass, mobxMethods: IMobxMethods) {

  const defineReactive = (Vue as any).util.defineReactive

  function created(this: VueClass) {
    const vm = this
    const fromStore = vm.$options[optionName]
    if (!fromStore) {
      return
    }

    const disposers: Disposer[] = vm[disposersName] = []

    Object.keys(fromStore).forEach(key => {
      const compute = fromStore[key]
      disposers.push(mobxMethods.reaction(
        () => compute.apply(vm),
        val => {
          if (key in vm) {
            vm[key] = val
          } else {
            defineReactive(vm, key, val)
          }
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
    created,
    beforeDestroy
  })
}

export { optionName, disposersName } from './utils'
export * from './helpers'

export default {
  install
}
