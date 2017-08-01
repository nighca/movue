import Vue from 'vue'
import { reaction, observable, runInAction, action, computed } from 'mobx'
import Movue, { optionName, mapFields, mapMethods } from '../src'

Vue.use(Movue, { reaction })

const nextTick = Vue.nextTick

test('bind mobx store to render', done => {
  const data = observable({
    foo: 1,
    bar: 2,
    get foobar() {
      return this.foo + this.bar
    }
  })

  const vm = new Vue({
    [optionName]: {
      foo() {
        return data.foo
      },
      foobarPlus() {
        return data.foobar + 1
      }
    },
    render (h) {
      const vm: any = this
      return h('div', `${vm.foo}|${vm.foobarPlus}`)
    }
  }).$mount()

  expect(vm.$el.textContent).toBe('1|4')

  runInAction(() => {
    data.foo++
  })

  nextTick(() => {
    expect(vm.$el.textContent).toBe('2|5')
    done()
  })
})

test(`can use this.data in ${optionName}`, done => {
  const data = observable({
    foo: 1,
    get fooPlus() {
      return this.foo + 1
    }
  })

  const vm = new Vue({
    data() {
      return {
        bar: 2
      }
    },
    computed: {
      barPlus() {
        return this.bar + 1
      }
    },
    [optionName]: {
      foobar() {
        return data.foo + this.bar
      },
      foobarPlus() {
        return data.fooPlus + this.barPlus
      }
    },
    render (h) {
      const vm: any = this
      return h('div', `${vm.foobar}|${vm.foobarPlus}`)
    }
  }).$mount()

  expect(vm.$el.textContent).toBe('3|5')

  vm.bar++
  runInAction(() => {
    data.foo++
  })

  nextTick(() => {
    expect(vm.$el.textContent).toBe('5|7')
    done()
  })
})

class Counter {
  @observable num = 0
  @computed get numPlus() {
    return this.num + 1
  }
  @action plus() {
    this.num++
  }
  @action reset() {
    this.num = 0
  }
}

test('helper mapFields', () => {
  const counter = new Counter()

  const vm = new Vue({
    [optionName]: {
      ...mapFields(counter, ['num', 'numPlus'])
    },
    render (h) {
      const vm: any = this
      return h('div', `${vm.num}|${vm.numPlus}`)
    }
  }).$mount()

  expect(vm.$el.textContent).toBe('0|1')
})

test('helper mapMethods', () => {
  const counter = new Counter()

  const vm = new Vue({
    methods: {
      ...mapMethods(counter, ['plus', 'reset'])
    },
    render (h) {
      const vm: any = this
      return h('div', `${vm.num}|${vm.numPlus}`)
    }
  }).$mount()

  expect(counter.num).toBe(0)

  vm.plus()
  expect(counter.num).toBe(1)

  vm.plus()
  expect(counter.num).toBe(2)

  vm.reset()
  expect(counter.num).toBe(0)
})
