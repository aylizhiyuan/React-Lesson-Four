import React,{Component} from 'react'
import actions from '../store/action/todos'
import {connect} from '../react-redux'
class Todos extends Component {
  handleKeyDown = (event)=>{
    let code = event.keyCode;
    if(code == 13){
      this.props.addTodo(event.target.value);
      event.target.value = '';
    }
  }
  render(){
    return (
      <div>
        <input onKeyDown={this.handleKeyDown}/>
        <ul>
          {
            this.props.items.map((item,index)=>(
              <li key={index} style={{textDecoration:item.completed?'line-through':''}}>
                {item.text}
              </li>
            ))
          }
        </ul>
      </div>
    )
  }
}
export default connect(
  state=>state.todos,
  actions
)(Todos)