//这里定义我们的reducer处理函数
import * as types from '../action-types'
export default function(state={anumber:0},action){
  switch(action.type){
    case types.AINCREMENT:
      return {anumber:state.anumber+action.payload}
    default:
      return state
  }
}