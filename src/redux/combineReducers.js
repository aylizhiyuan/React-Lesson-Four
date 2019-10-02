export default function combineReducers(reducers) {
  return function (state={},action) {
    //console.log(Object.keys(reducers));
    //[count,todos].reduce
    //数组的reduce方法会把每个里面的元素合并成一个对象
    return Object.keys(reducers).reduce((newState,key) => {
      //key表示的是是couterReducer和todoReducer
      //newState = [count:处理函数,todos:处理函数()]
      //console.log(reducers[key]);
      //newState是我们最终要合并的对象
      //console.log(state);这里state是为空的
      //newState[count] = count(state[count],action)
      //newState[todos] = todos(state[todos],action)
      newState[key]=reducers[key](state[key],action);
      return newState;
    },{});
  }
}