# Movue [![npm version](https://badge.fury.io/js/movue.svg)](https://badge.fury.io/js/movue) [![Build Status](https://travis-ci.org/nighca/movue.svg?branch=master)](https://travis-ci.org/nighca/movue) [![Coverage Status](https://coveralls.io/repos/github/nighca/movue/badge.svg?branch=master)](https://coveralls.io/github/nighca/movue?branch=master) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Mobx integration for Vue.js, inspired by [vue-rx](https://github.com/vuejs/vue-rx).

### Install

```shell
npm i movue --save
```

If you use yarn,

```shell
yarn add movue
```

### Usage

Import Movue in your project and use it in Vue:

```javascript
import Vue from 'vue'
import Movue from '../src'
import * as mobx from 'mobx'

Vue.use(Movue, mobx)
```

You can pass the min parts of Mobx to reduce bundle size:

```javascript
import { reaction } from 'mobx'

Vue.use(Movue, { reaction })
```

Now you can use Mobx store in your Vue component:

```javascript
const todoStore = observable({
  todos: [],
  get unfinishedTodos() {/* ... */},
  addTodo: action(function() {/* ... */}),
  toggleTodo: action(function() {/* ... */})
})

export default {
  data() {/* ... */},
  computed: {/* ... */},
  // you should only use data from mobx store in `fromMobx` fields
  fromMobx: {
    unfinishedTodos() {
      return todoStore.unfinishedTodos
    }
  },
  methods: {
    toggleTodo(...args) {
      todoStore.toggleTodo(...args)
    }
  }
}
```

Fields defined in `fromMobx` can be used in the template or other parts of viewModel just like normal `computed` fields:

```html
<template>
  <p>Count of unfinished todos: {{unfinishedTodos.length}}</p>
</template>
```

You can use helper methods to simplify your code:

```javascript
import { mapFields, mapMethods } from 'movue'
export default {
  data() {/* ... */},
  computed: {/* ... */},
  fromMobx: mapFields(todoStore, ['todos', 'unfinishedTodos']),
  methods: {
    // `...` requires object spread syntax support
    ...mapMethods(todoStore, ['addTodo', 'toggleTodo']),
    someOtherMethod() {/* ... */}
  }
}
```

### API Reference

##### `mapFields(store: object, fieldNames: string[]): Object`

`mapFields` do fields' map for you:

```javascript
const fields = mapFields(todoStore, ['todos', 'unfinishedTodos'])
// equals
const fields = {
  todos() { return todoStore.todos },
  unfinishedTodos() { return todoStore.unfinishedTodos }
}
```

##### `mapMethods(store: object, methodNames: string[]): Object`

`mapMethods` do methods' map for you:

```javascript
const methods = mapMethods(todoStore, ['addTodo', 'toggleTodo'])
// equals
const methods = {
  addTodo: todoStore.addTodo.bind(todoStore),
  toggleTodo: todoStore.toggleTodo.bind(todoStore)
}
```

### License

[Apache-2.0](https://opensource.org/licenses/Apache-2.0)
