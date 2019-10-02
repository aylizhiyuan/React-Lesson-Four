//监控数据变化的redux简单实现

function renderTitle(title){
  let titleEle = document.querySelector('#title');
  titleEle.innerHTML = title.text;
  titleEle.stype.color = title.colr;
}
function renderContent(content){
  let contentEle = document.querySelector('#content');
  contentEle.innerHTML = content.text;
  contentEle.style.color = content.color;
}
function render(){
  renderTitle(store.getState().title);
  renderContent(store.getState().content);
}
//这是我们的仓库，仓库里面主要的功能是返回getState ,获取数据
//还有就是dispatch方法，这个方法是用来调用方法修改数据
//subscibe这个方法是将render这个行为作为修改数据后的操作
//整体的流程就是

//1. 数据放到store仓库
//2. 设置一个reducer 来控制变化
//3. 传递给reducer state和action
//4. 根据不同的变化类型返回一个新的state
//5. 当用户调用dispatch方法的时候，除了获取到新的state之外，还要调用对应的render方法去修改对应的布局
function createStore(reducer){
  let state;
  let listeners = [];
  function getState(){
    return state;
  }
  function dispatch(action){
    state = reducer(state,action);
    listeners.forEach(l=>l());
  }
  function subscribe(listener){
    listeners.push(listener)
    return ()=>{
      listeners = listeners.filter(item=>item != listener)
    }
  }
  dispatch({});
  return {
    getState,
    dispatch,
    subscribe
  }
}
let initState = {
  title:{color:'red',text:'标题'},
  content:{color:'green',text:'内容'}
}
let reducer = function (state=initState,action) {
  switch (action.type) {
    case 'UPDATE_TITLE_COLOR':
      return {...state,title: {...state.title,color:action.color}};
    case 'UPDATE_CONTENT_CONTENT':
      return {...state,content: {...state.content,text:action.text}};
      break;
    default:
      return state;
  }
}
let store = createStore(reducer);
render();
let unsubscribe = store.subscribe(render);
setTimeout(function(){
  store.dispatch({type:'UPDATE_TITLE_COLOR',color:'purple'});
  unsubscribe();
  store.dispatch({type:'UPDATE_CONTENT_CONTENT',title:'新标题'})
},2000)