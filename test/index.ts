import Vue from 'vue'
import { reaction, observable, runInAction, action, computed } from 'mobx'
import Movue, { mapFields, mapMethods } from '../src'

const nextTick = Vue.nextTick

test('install well', () => {
  Vue.use(Movue, { reaction })
})

test('bind mobx store to render', done => {
  Vue.use(Movue, { reaction })

  const data = observable({
    foo: 1,
    bar: 2,
    get foobar() {
      return this.foo + this.bar
    }
  })

  const vm = new Vue({
    fromMobx: {
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

test(`can use this.data in fromMobx`, done => {
  Vue.use(Movue, { reaction })

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
    fromMobx: {
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


test(`fields in fromMobx can be used in watch & computed`, done => {
  Vue.use(Movue, { reaction })

  const data = observable({
    foo: 1
  })

  const onFooChange = jest.fn()
  const onFoobarChange = jest.fn()

  const vm = new Vue({
    data() {
      return {
        bar: 2
      }
    },
    computed: {
      foobar() {
        return this.foo + this.bar
      }
    },
    fromMobx: {
      foo() {
        return data.foo
      }
    },
    watch: {
      foo(value) {
        onFooChange(value)
      },
      foobar(value) {
        onFoobarChange(value)
      }
    },
    render (h) {
      const vm: any = this
      return h('div', `${vm.foobar}`)
    }
  }).$mount()

  expect(vm.$el.textContent).toBe('3')

  vm.bar++
  runInAction(() => {
    data.foo++
  })

  nextTick(() => {
    expect(vm.$el.textContent).toBe('5')
    expect(onFooChange.mock.calls).toHaveLength(1)
    expect(onFooChange.mock.calls[0][0]).toBe(2)
    expect(onFoobarChange.mock.calls).toHaveLength(1)
    expect(onFoobarChange.mock.calls[0][0]).toBe(5)
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
  Vue.use(Movue, { reaction })

  const counter = new Counter()

  const vm = new Vue({
    fromMobx: {
      ...mapFields(counter, ['num', 'numPlus'])
    },
    render (h) {
      const vm: any = this
      return h('div', `${vm.num}|${vm.numPlus}`)
    }
  }).$mount()

  expect(vm.$el.textContent).toBe('0|1')
})

test('helper mapFields with alias', () => {
  Vue.use(Movue, { reaction })

  const counter = new Counter()

  const vm = new Vue({
    fromMobx: {
      ...mapFields(counter, {
        myNum: 'num',
        myNumPlustOne: 'numPlus'
      })
    },
    render (h) {
      const vm: any = this
      return h('div', `${vm.myNum}|${vm.myNumPlustOne}`)
    }
  }).$mount()

  expect(vm.$el.textContent).toBe('0|1')
})

test('helper mapMethods', () => {
  Vue.use(Movue, { reaction })

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

test('helper mapMethods with alias', () => {
  Vue.use(Movue, { reaction })

  const counter = new Counter()

  const vm = new Vue({
    methods: {
      ...mapMethods(counter, {
        myPlus: 'plus',
        myReset: 'reset'
      })
    },
    render (h) {
      const vm: any = this
      return h('div', `${vm.num}|${vm.numPlus}`)
    }
  }).$mount()

  expect(counter.num).toBe(0)

  vm.myPlus()
  expect(counter.num).toBe(1)

  vm.myPlus()
  expect(counter.num).toBe(2)

  vm.myReset()
  expect(counter.num).toBe(0)
})

test('clean watchers before destroy', () => {
  Vue.use(Movue, { reaction })

  const data = observable({
    foo: 1
  })

  const vm = new Vue({
    fromMobx: {
      foo() {
        return data.foo
      }
    },
    render (h) {
      const vm: any = this
      return h('div', vm.foo + '')
    }
  }).$mount()

  vm.$destroy()
})

test('normal components destroy well', () => {
  const vm = new Vue({
    data() {
      return { foo: 1 }
    },
    render (h) {
      const vm: any = this
      return h('div', vm.foo + '')
    }
  }).$mount()

  vm.$destroy()
})
