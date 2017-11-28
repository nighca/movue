import Vue from 'vue'
import { reaction, observable, runInAction, action, computed } from 'mobx'
import Component from 'vue-class-component'
import Movue, { FromMobx } from '../src'

const nextTick = Vue.nextTick

test('works well with vue-class-component', done => {
  Vue.use(Movue, { reaction })

  const data = observable({
    foo: 1,
    get fooPlus() {
      return this.foo + 1
    },
    setFoo(value) {
      this.foo = value
    }
  })

  @Component
  class ClassComponent extends Vue {
    @FromMobx get foo() {
      return data.foo
    }
    @FromMobx get fooPlus() {
      return data.fooPlus
    }
    set foo(value) {
      data.setFoo(value)
    }

    setFoo(value) {
      data.setFoo(value)
    }

    render (h) {
      const vm = this
      return h('div', `${vm.foo}|${vm.fooPlus}`)
    }
  }

  const vm = new ClassComponent()

  vm.$mount()
  expect(vm.$el.textContent).toBe('1|2')

  vm.foo = 2
  nextTick(() => {
    expect(vm.$el.textContent).toBe('2|3')

    vm.setFoo(3)
    nextTick(() => {
      expect(vm.$el.textContent).toBe('3|4')
      done()
    })
  })
})

