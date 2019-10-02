//这个是用来合并多个reducer的
import combineReducers from "../../redux/combineReducers"
import counter from './counter'
import todos from './todos'
export default combineReducers({
  counter,
  todos
})