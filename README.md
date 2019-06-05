<img src="https://nighca.tristana.cc/movue-2.png" alt="logo" height="120" align="right" />

# Movue [![npm version](https://badge.fury.io/js/movue.svg)](https://badge.fury.io/js/movue) [![Build Status](https://travis-ci.org/nighca/movue.svg?branch=master)](https://travis-ci.org/nighca/movue) [![Coverage Status](https://coveralls.io/repos/github/nighca/movue/badge.svg?branch=master)](https://coveralls.io/github/nighca/movue?branch=master) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

MobX integration for Vue.js, inspired by [vue-rx](https://github.com/vuejs/vue-rx).

Movue aims for providing simple and reliable integration between Mobx and Vue.js, which sometimes means [less convenience](https://github.com/nighca/movue/issues/16). You may want to try [mobx-vue](https://github.com/mobxjs/mobx-vue) if you are facing more complex situation. :)

### Why movue

[Why MobX + movue, instead of Vuex?](https://github.com/nighca/movue/issues/8)

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
import Movue from 'movue'
import * as mobx from 'mobx'

Vue.use(Movue, mobx)
```

You can pass the min parts of MobX to reduce bundle size:

```javascript
import { reaction } from 'mobx'

Vue.use(Movue, { reaction })
```

Now you can use data from MobX store in your Vue component:

```javascript
// given MobX store
const todoStore = observable({
  todos: [],
  get unfinishedTodos() {/* ... */},
  addTodo: action(function() {/* ... */}),
  toggleTodo: action(function() {/* ... */})
  setTodos: action(function() {/* ... */})
})

// given vue component
export default {
  data() {/* ... */},
  computed: {/* ... */},
  // you should use data from MobX store only in `fromMobx` properties
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

Properties defined in `fromMobx` can be used in the template or other parts of viewModel just like normal Vue [`computed`](https://vuejs.org/v2/guide/computed.html#Computed-Properties) properties:

```html
<template>
  <p>Count of unfinished todos: {{unfinishedTodos.length}}</p>
</template>
```

Like `computed` properties, we can define getter & setter for `fromMobx` properties:

```javascript
export default {
  fromMobx: {
    todos: {
      // getter
      get() {
        return todoStore.todos
      },
      // setter
      set(todos) {
        todoStore.setTodos(todos)
      }
    }
  }
}
```

You can use helper methods to simplify your code:

```javascript
import { mapFields, mapMethods } from 'movue'

export default {
  fromMobx: mapFields(todoStore, ['todos', 'unfinishedTodos']),
  methods: {
    // `...` requires object spread syntax support
    ...mapMethods(todoStore, ['addTodo', 'toggleTodo']),
    someOtherMethod() {/* ... */}
  }
}
```

movue works well with [vue-class-component](https://github.com/vuejs/vue-class-component):

```javascript
import { FromMobx } from 'movue'

@Component({/* ... */})
class Todo extends Vue {
  // get todos
  @FromMobx get todos() {
    return todoStore.todos
  }
  // you don't need decorator for setters
  set todos(todos) {
    todoStore.setTodos(todos)
  }
  // you can also set value with a component method
  setTodos(todos) {
    todoStore.setTodos(todos)
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

##### `mapFields(store: object, fieldNames: {[fieldAlias: string]: string}): Object`

You can use aliases for fields:

```javascript
const fields = mapFields(todoStore, {
  todoList: 'todos',
  unfinishedTodoList: 'unfinishedTodos'
})
// equals
const fields = {
  todoList() { return todoStore.todos },
  unfinishedTodoList() { return todoStore.unfinishedTodos }
}
```

##### `mapFields(store: object, fieldNames: {[fieldAlias: string]: { get: string, set?: string }}): Object`

Also you can specify a setter for the field:

```javascript
const fields = mapFields(todoStore, {
  todoList: {
    get: 'todos'
  },
  unfinishedTodoList: 'unfinishedTodos',
  newTodoItemName: {
    get: 'newItemName',
    set: 'setNewItemName'
  }
})
// equals
const fields = {
  todoList() { return todoStore.todos },
  unfinishedTodoList() { return todoStore.unfinishedTodos },
  newTodoItemName: {
    get() { return todoStore.newItemName },
    set(value) { todoStore.setNewItemName(value) }
  }
}
```

##### `mapFields(store: object, fieldNames: {[fieldAlias: string]: { get: (store: object) => any, set?: (store: object, value: any) => void }}): Object`

You can specify a complex setter and getter for the field:

```javascript
const fields = mapFields(todoStore, {
  todoList: {
    get: 'todos'
  },
  unfinishedTodoList: 'unfinishedTodos',
  newTodoItemName: {
    get(store) {
      // store === todoStore
      return store.newItemName
    },
    set(store, value) {
      // store === todoStore
      store.setNewItemName(value)
    }
  }
})
// equals
const fields = {
  todoList() { return todoStore.todos },
  unfinishedTodoList() { return todoStore.unfinishedTodos },
  newTodoItemName: {
    get() { return todoStore.newItemName },
    set(value) { todoStore.setNewItemName(value) }
  }
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

##### `mapMethods(store: object, methodNames: {[methodAlias: string]: string}): Object`

You can use aliases for methods:

```javascript
const methods = mapMethods(todoStore, {
  addTodoItem: 'addTodo',
  checkTodoItem: 'toggleTodo'
})
// equals
const methods = {
  addTodoItem: todoStore.addTodo.bind(todoStore),
  checkTodoItem: todoStore.toggleTodo.bind(todoStore)
}
```

##### `FromMobx(target: Vue, key: string): void`

`FromMobx` helps to use movue together with [vue-class-component](https://github.com/vuejs/vue-class-component). You should use `FromMobx` as decorator for class property accessors:

```javascript
@Component({/* ... */})
class Todo extends Vue {
  @FromMobx get todos() {
    return todoStore.todos
  }
}
```

### License

[Apache-2.0](https://opensource.org/licenses/Apache-2.0)
