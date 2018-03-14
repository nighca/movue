import VueClass from 'vue'
import { Getter, Setter, Disposer, FromMobxEntry, IMobxMethods } from './types'

export default class ChangeDetector {
  defineReactive: Function
  mobxMethods: IMobxMethods
  changeDetector: VueClass

  constructor(Vue: typeof VueClass, mobxMethods: IMobxMethods) {
    this.defineReactive = (Vue as any).util.defineReactive
    this.mobxMethods = mobxMethods
    this.changeDetector = new Vue()
  }

  defineReactiveProperty(vm: VueClass, key: string) {
    const reactivePropertyKey = this._getReactivePropertyKey(vm, key)
    this.defineReactive(this.changeDetector, reactivePropertyKey, null, null, true)
  }
  getReactiveProperty(vm: VueClass, key: string): any {
    const reactivePropertyKey = this._getReactivePropertyKey(vm, key)
    return this.changeDetector[reactivePropertyKey]
  }
  updateReactiveProperty(vm: VueClass, key: string, value: any) {
    const reactivePropertyKey = this._getReactivePropertyKey(vm, key)
    this.changeDetector[reactivePropertyKey] = value
  }
  removeReactiveProperty(vm: VueClass, key: string) {
    const reactivePropertyKey = this._getReactivePropertyKey(vm, key)
    delete this.changeDetector[reactivePropertyKey]
  }

  defineReactionList(vm: VueClass, fromMobxEntries: FromMobxEntry[]) {
    const reactivePropertyListKey = this._getReactionListKey(vm)
    const reactivePropertyList: Disposer[] = fromMobxEntries.map(({ key, get }) => {
      const updateReactiveProperty = value => { this.updateReactiveProperty(vm, key, value) }

      return this.mobxMethods.reaction(() => get.call(vm), updateReactiveProperty, {
        fireImmediately: true
      })
    })

    this.changeDetector[reactivePropertyListKey] = reactivePropertyList
  }
  removeReactionList(vm: VueClass) {
    const reactivePropertyListKey = this._getReactionListKey(vm)

    this.changeDetector[reactivePropertyListKey].forEach(dispose => dispose())
    delete this.changeDetector[reactivePropertyListKey]
  }

  _getReactionListKey(vm: VueClass): string {
    return (vm as any)._uid
  }
  _getReactivePropertyKey(vm: VueClass, key: string): string {
    return `${(vm as any)._uid}.${key}`
  }
}
