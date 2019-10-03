export default function bindActionCreators(actions,dispatch){
  //actions = {add_todo:function(text){return {type:types.ADD_TODO,text}}}
  //dispatch是我们的触发函数
  let newActions = {};
  for(let attr in actions){
    newActions[attr] = function(){
      //触发函数会触发，将add_todo的返回结果传递到触发函数中
      dispatch(actions[attr].apply(null,arguments));
    }
  }
  return newActions;
}