import createStore from '../redux/createStore'
import applyMiddleware from "../redux/applyMiddleware"
import reducers from './reducers'
//这里我们给仓库增加一个中间件
// 获取仓库状态  派发动作 调用下一个中间 action
let logger = function({dispatch,getState}){
  return function(next){
    return function(action){
      console.log('老状态1 ',getState());
      next(action);//派发动作
      console.log('新状态1 ',getState());
      let newState = getState();
      if(newState.number == 10){
        dispatch({type:'INCREMENT',payload:-10});
      }
    }
  }
}
let thunk = ({dispatch,getState})=>next=>action=>{
  if(typeof action == 'function'){
    action(dispatch,getState);
  }else{
    next(action);
  }
}
let promise = ({dispatch,getState})=>next=>action=>{
  if(action.then && typeof action.then == 'function'){
    action.then(dispatch);
  }else if(action.payload&& action.payload.then&& typeof action.payload.then == 'function'){
    action.payload.then(payload=>dispatch({...action,payload}),payload=>dispatch({...action,payload}));
  }else{
    next(action);
  }
}
//middlewares=[logger1,logger2]
//let store = applyMiddleware(promise,thunk,logger)(createStore)(reducer);
// if(enhancer && typeof enhancer == 'function'){
//     return enhancer(createStore)(reducer);
// }
let store = createStore(reducers,{anumber:10},applyMiddleware(promise,thunk,logger));
window.store = store;
export default store