import React,{Component} from 'react'
//我们如果要在这个项目中直接使用store的话
import store from '../store'
import * as types from '../store/action-types'
//要对dispatch再进行一个封装
import actions from '../store/action/counter'
//连接我们的redux
import {connect} from '../react-redux'

class Counter extends Component {
  constructor(props){
    super(props);
    this.state = {
      number:props.number
    }
  }
  componentWillMount() {
    this.unsubscirbe = store.subscribe(()=>{
      this.setState({number:this.props.number})
    })
  }
  componentWillUnmount() {
    this.unsubscirbe();//取消这个订阅
  }

  render(){
    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={this.props.increment}>+</button>
        <button onClick={this.props.decrement}>-</button>
        <button onClick={()=>{
          setTimeout(()=>{
            this.props.increment()
          },1000)
        }} >一秒后再加</button>
      </div>
    )
  }
}
export default connect(
  state=>state.counter,
  actions
)(Counter);