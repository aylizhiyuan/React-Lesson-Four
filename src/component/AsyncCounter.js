//异步的counter
import React,{Component} from 'react'
import {connect} from '../react-redux'
import actions from '../store/action/asyncCounter'
class AsyncCounter extends Component {
  render(){
    return(
      <div>
        <p>{this.props.anumber}</p>
        <button onClick={this.props.aincrement}>+</button>
        <button onClick={this.props.thunkIncrement}>一秒后加1</button>
        <button onClick={this.props.promiseIncrement}>promise+1</button>
        <button onClick={this.props.payloadIncrement}>payload+1</button>
      </div>
    )
  }
}
export default connect(
  state=>state.asyncCounter,
  actions
)(AsyncCounter);