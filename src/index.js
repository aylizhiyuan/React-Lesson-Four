import React ,{Component} from 'react'
import ReactDOM from "react-dom"
import Counter from './component/Counter'
import Todos from './component/Todos'
import AsyncCounter from './component/AsyncCounter'
//将store作为一个根组件里面的方法传递给所有的子组件
import {Provider} from './react-redux'
import store from './store'
ReactDOM.render(
  <Provider store={store}>
    <React.Fragment>
      <Counter/>
      <hr/>
      <Todos/>
      <hr/>
      <AsyncCounter/>
    </React.Fragment>
  </Provider>
  ,document.querySelector("#root"))