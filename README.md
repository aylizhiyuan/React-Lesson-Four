# redux + react-redux + redux-middleware + redux-saga + dva + antd

父子组件传值一直是个问题，父组件想给子组件传值，那么只需要在父组件中调用子组件的位置以属性的形式传入即可，在子组件中通过this.props获取传递到的值即可

子组件想要给父组件传值有两种方式:

1. 依赖props来传递事件的引用，并通过回调的方式来实现
2. 子组件向父组件传值可以通过context,context可以跨级从父组件向子组件传值，也可以子组件来获取和设置父组件暴露出来的属性值

            -----------  store
                -------------- action
                -------------- reducers
                -------------- index.js
            ------------ index.js      

#### 1.  注入store 



redux是一个仓库，里面放着公共的数据，其实你可以理解为redux是一个在根组件上的一个公共的数据仓库，那么我们首先要做的就是如何把这个仓库注入到所有的组件中去

    //入口文件中index.js
    import {Provider} from './react-redux'
    import store from './store'

    ReactDOM.render(
        <Provider store={store}>
            <App/>
        </Provider>
    )

provider只不过是为了把数据传递给下面组件的一个容器

这个组件的原理就是通过context实现的

        // Provider.js
        export default class Provider extends Component {
            static childContextTypes = {
                store:PropTypes.object.isRequired
            }
            //在该组件上注册一个context，把传递过来的store赋值给他
            getChildContext(){
                return {
                    store:this.props.store
                }
            }
            //组件返回的内容就是组件内部的内容
            render(){
                return this.props.children
            }
        }


接下来有了store之后，下面我们需要一个存放state数据的地方，要想更新state的数据，你需要发起一个action,action就是一个普通的javascript对象，用来描述干什么

强制使用action来描述所有的变化是可以清晰的知道应用中到底发生了什么，如果一些东西改变了，就可以回到为什么变。action就像是描述发生了什么的指示器，最终为了把action和state串起来，开发一些函数，这就是reducer,那么，reducer只是一个接收state和action，并返回新的state的函数

reducer可以理解为根据不同的action，改变state,返回一个新的state的函数

store 就是一个暴露了dispatch,getState的对象


### 2. 创建store

- 维持应用的 state；
- 提供 getState() 方法获取 state；
- 提供 dispatch(action) 方法更新 state；
- 通过 subscribe(listener) 注册监听器;
- 通过 subscribe(listener) 返回的函数注销监听器。

接下来就是创建store,我们创建store的时候需要安装redux,在redux中引入createStore方法，另外在创建store的时候我们需要传入对应的reducer

    //从redux中拿到创建仓库的方法
    import {createStore} from 'redux'
    //拿到我们所有的已经合并后的reducers
    import {reducers} from './reducers'

    //创建一个store
    let store = createStore(reducers,defaultState,applyMiddleware(我自己的中间件));
    export default store

深入到createStore方法中去，就是创建一个redux仓库来保存整个状态树，改变状态树的唯一方法就是store.dispatch方法，然后用combineReducers方法把多个reducer合并成单独的一个reducer

    export default function createStore(reducer,preloadedState,enhancer){
        //如果存在中间件的话，把createStore和reducer传入到中间件内部
        if(enhancer){
            return enhancer(createStore)(reducer,preloadState);
        }
        let state = preloadState;
        let listeners = [];
        
        //返回状态
        function getState(){
            return state;
        }
        //监听变化的函数
        function subscribe(listener){
            listeners.push(listener);
            return function(){
                const index = listeners.indexOf(listener);
                listeners.splice(index,1);
            }
        }
        //派发一个动作，这是触发状态改变的唯一方法
        function dispatch(action){
            //传递给reducer，让reducer来进行处理
            //reducer里面接收state和action
            state = reducer(state,action);
            //调取我们的监听函数
            listeners.forEach(listener=>listener());
        }
        return {
            dispatch,
            subscribe,
            getState
        }
    }

### 3. 合并所有的reducer

        //reducers/index.js
        //合并所有的reducer方法
        import combineReducers from '../../redux/combineReducers'
        import counter from './counter'
        import todos from './todos'
        import asyncCounter from './asyncCounter'
        export default combineReducers({
            counter,
            todos,
            asyncCounter
        })

这个合并reducer的方法其实也是非常的简单的，将多个reducers合并成一个大的对象

        export default function combineReducers(reducers){
            return function (state={},action){
                return Object.keys(reducers).reduce((newState,key)=>{
                    newState[key]=reducers[key](state[key],action);
                    return newState;
                },{});
            }
        }

> combineReducers() 所做的只是生成一个函数，这个函数来调用你的一系列 reducer，每个 reducer 根据它们的 key 来筛选出 state 中的一部分数据并处理，然后这个生成的函数再将所有 reducer 的结果合并成一个大的对象。没有任何魔法。正如其他 reducers，如果 combineReducers() 中包含的所有 reducers 都没有更改 state，那么也就不会创建一个新的对象。

        

### 4. 创建reducer

            import * as types from '../action-types';
            export default function(state={items:[],newType:'all'},action){
            //action就是我们调用方法的时候返回的那个对象
            //这个对象里面的type指定我们调用dispatch里面的那个类型
            //text是我们的参数
            switch(action.type){
                case types.ADD_TODO://{type:ADD_TODO,text}
                    return {...state,items:[...state.items,{text:action.text,completed:false}]};
                case types.DEL_TODO:
                    return {...state,items:[...state.items.slice(0,action.index),...state.items.slice(action.index+1)]};
                case types.TOGGLE_TODO:
                    return {...state,items:state.items.map((item,index)=>{
                        if(index === action.index){
                            item.completed = !item.completed;//状态取反
                        }
                        return item;
                        })};
                case types.SWITCH_TYPE:
                    return {...state,newType:action.newType};
                default:
                    return state;
            }
            }

reducer接受两个参数，一个是state，就是我们的数据，另外一个是action,这个action是store中调用dispatch的时候拿到的,它会根据action.type执行不同的数据操作

只要传入参数相同，返回计算得到的下一个 state 就一定相同。没有特殊情况、没有副作用，没有 API 请求、没有变量修改，单纯执行计算。

### 5. 创建一个常用的触发dispatch的列表

        export const ADD_TODO = 'ADD_TODO';
        export const DEL_TODO = 'DEL_TODO';
        export const TOGGLE_TODO = 'TOGGLE_TODO';//开关切换完成的状态

> 记住永远是dispatch(action)触发调用reducer,reducer(state,action)改变数据后返回新的state

        //例如
        this.dispatch({type:"ADD_TODO"})
        //如果有个dispatch列表后
        this.dispatch({type:types.ADD_TODO})

        //reducer开始接收 ,这里的action就是{type:type.ADD_TODO}
        reducer(state,action)


        //内部reducer里面改变state
        switch(action.type){
            case "ADD_TODO":
                //执行state的改变
                return {...state,isTrue:false}
            default:
                return state
        }

> store 里能直接通过 store.dispatch() 调用 dispatch() 方法，但是多数情况下你会使用 react-redux 提供的 connect() 帮助器来调用。bindActionCreators() 可以自动把多个 action 创建函数 绑定到 dispatch() 方法上

### 6. 优化dispatch

其实到这里，基本也已经实现了,你可以用最简陋的办法在组件中使用store.getState()和store.dispatch()方法来完成对于仓库的一切操作，但是这里是非常不方便的，也是不太合理的，所以，我们要接着继续优化，继续把dispatch方法搞成一个在组件内直接可以调用的方法,就像我们把store直接注入到props属性中去,而不是直接通过store来调用，直接用this.props.属性 和this.props.方法来使用store

        const store = createStore(counter)
        const rootEl = document.getElementById('root')

        const render = () => ReactDOM.render(
        <Counter
            value={store.getState()}
            onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
            onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
        />,
        rootEl
        )

        render()
        store.subscribe(render)

-  增加action,将返回dispatch方法,你可以理解为直接封装dispatch,action只是描述了有事情发生，并没有描述应该如何更新state

            import * as types from '../action-types';
            //actionCreator 创建action的函数
            export default {
                addTodo(text){
                    //这里，你可以自定义action为任何类型，但是type是必要的
                    //如果要传递参数的话，就直接在这里传递即可
                    return {type:types.ADD_TODO,text}
                },
                delTodo(index){
                    return {type:types.DEL_TODO,index}
                },
                toggleTodo(index){
                    return {type:types.TOGGLE_TODO,index}
                },
                switchType(newType){
                    return {type:types.SWITCH_TYPE,newType}
                }
            }

-  在使用store的组件中通过connect方法来通过action调用dispatch,并传递参数


        import React,{Component} from 'react'
        import actions from '../store/action/todos'
        import {connect} from '../react-redux'
        class Todos extends Component {
            render(){
                <div>{this.props.items}</div>
            }
        }
        export default connect(
            state=>state.todos,
            actions
        )(Todos)

其实connect的做法就是把store的数据和方法通过props传递到组件内部,之前store已经通过context的方法注入到了所有的子组件中了

> 这是个手动开发的容器组件，封装了mapStateToProps和mapDispatchToProps

        import React,{Component} from 'react';
        import {bindActionsCreators} from '../redux';
        import propTypes from 'prop-types';
        export default function(mapStateToProps,mapDispatchToProps){
        return function(WrapedComponent){
            class ProxyComponent extends Component{
            static contextTypes = {
                store:propTypes.object
            }
            constructor(props,context){
                super(props,context);
                //拿到执行上下文的store
                this.store = context.store;
                this.state = mapStateToProps(this.store.getState());
            }
            async componentWillMount(){
                this.unsubscribe = this.store.subscribe(()=>{
                this.setState(mapStateToProps(this.store.getState()));
                });
            }
            componentWillUnmount(){
                this.unsubscribe();
            }
            render(){
                let actions= {};
                if(typeof mapDispatchToProps == 'function'){
                actions = mapDispatchToProps(this.store.disaptch);
                }else if(typeof mapDispatchToProps == 'object'){
                //mapDispatchToProps是{add_todo:function(text){return {type:types.ADD_TODO,text}}}
                //this.store.dispatch是一个触发状态变化的函数
                //这两个东西是怎么弄到一块去的，是通过bindActionsCreators来结合的
                actions = bindActionsCreators(mapDispatchToProps,this.store.dispatch);
                }
                return <WrapedComponent {...this.state} {...actions}/>
            }
            }
            return ProxyComponent;
        }
        }

- 使用action触发dispatch

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

### 7.增加中间件

其实我们在createStore的时候已经处理了中间件

        createStore(reducer,applyMiddleware());

接下来我们来看applyMiddleware的实现

        //仔细理解 applyMiddleware(promise,thunk,logger)(createStore)(reducer)
        //你就知道里面对应的是什么了

        import compose from './compose';
        export default function(...middlewares){//middleware 是应用的中间件  createStore用来创建仓库 reducer
        return function (createStore){
            return function(reducer){
            let store = createStore(reducer);
            let dispatch;
            let middlewareAPI = {
                getState:store.getState,
                dispatch:action=>dispatch(action)
            }
            middlewares = middlewares.map(middleware=>middleware(middlewareAPI));
            dispatch = compose(...middlewares)(store.dispatch);
            //这里返回新的dispatch的逻辑，解决了中间件的问题
            return {...store,dispatch};
            }
        }
        }
中间件你可以理解为返回一个新的dispatch,加入我们的逻辑,或者是在action的时候，添加新的任务,用户调用action ---> 触发dispatch ---> 根据state和action传入到reducer中 ---> reducer返回新的state供用户使用 ----> 用户可以根据state的改变去主动的触发视图更新 ----> 任何用户都可以调用


        let logger = function({dispatch,getState}){
        //next是老的原生的dispatch    
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

接下来我们来讨论异步的情况,异步的话只能使用中间件处理完毕之后

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

下面就是对应的action函数，注意是函数了，不是对象了

        thunkIncrement(){
            return function(dispatch,getState){
            setTimeout(function(){
                dispatch({type:types.AINCREMENT,payload:1});
            },1000);
            }
        },
        promiseIncrement(){
            return new Promise(function(resolve,reject){
            setTimeout(function(){
                resolve({type:types.AINCREMENT,payload:1});
            },1000);
            });
        },



### 8.增加异步中间件saga

1. redux-saga的工作原理

- sagas采用generator函数来yield Effects
- generator函数的作用可以暂停执行，再次执行的时候可以从上次暂停的地方继续执行
- Effect是一个简单的对象，该对象包含了一些给middleware解释执行的信息
- 你可以通过使用fork,call,take,put,cancel等来创建effects

2. redux-saga的分类

- woker saga做主要的工作,入调用API，进行异步请求
- watcher saga监听被dispatch的actions,当接收到actions的时候调用woker执行任务
- root saga为入口

3. 中间件的API

- createSagaMiddleware(...sagas)
- middleware.run(saga,...args)

4. 调用顺序

- rootsaga被middleware调用
- rootsaga中yield引用watchsaga
- watchsaga中调用具体的worker来执行异步操作

5. 常用的API

- take获取指定类型的action


- takeEvery 你可以理解为我监听一个异步的action

        import {call,put} from 'redux-saga/effects'
        export function* fetchData(action){
            try {
                const data = yield call(Api.fetchUser,action.payload)
                //触发的实际是同步的
                yield put({type:"FETCH_SUCCEEDED",data})
            }catch(error){
                yield put({type:"FETCH_FAILED",error})
            }
        }
        每次在FETCH_REQUESTED 的action发起的时候启动这个任务
        import {takeEvery} from 'redux-saga'
        function *watchFetchData(){
            //允许多个fetchData实例同时启动
            yiled* takeEvery('FETCH_REQUESTED',fetchData)
        }


- takelatest 多个action同时并行的时候，只执行最后一个，自动cancel前面take的actions


- call阻塞式异步调用，第一个参数是调用的generator函数，后面的参数是传递的参数，会阻塞直到promise返回结果。如果阻塞的时候有其他的action,那么这些action都会错过，不会被执行


- fork非阻塞时候调用，可以理解为子任务单独处理，每个action都会得到处理，不会错过执行的时机


- put相当于dispatch函数，用于generator中dispatch action


- cancel可以取消fork出来的子任务，将在当前执行的任务中抛出一个saga类型的异常，可以通过try catch捕获到，但是这个错误并不会向上冒泡


- race返回先完成的任务，cancel其他的


> 登录注册案例

        ----- store  //我们的仓库
                ---- action-types.js 我们的action类型
                ---- actions.js 我们的action
                ---- index.js 创建store的地方
                ---- reducers 修改store的地方
        ----- saga.js //rootsaga
        ----- index.js // 根组件注入的地方
        ----- components //组件


- index.js 根组件注入的地方

        import React,{Component} from 'react'
        import ReactDOM from 'react-dom'
        import Login from './components/Login'
        import Logout from './components/Logout'
        import {Provider} from 'react-redux'
        //我们创建好的store仓库
        import store from './store'
        import {Route,Switch,Redireact} from 'react-router-dom'
        ReactDOM.render(
            <Provider store={store}>
                <Switch>
                    <Route path='/login' component={Login}>
                    <Route path='/logout' component={Logout}>
                    <Redirect to='/login'>
                </Switch>
            </Provider>
        ,document.querySelecotr('#root'));

- index.js 创建store的地方

        import {createStore,applyMiddleware,componse} from 'redux'
        //引入我们的reducers
        import reducers from './reducers'
        //处理异步的action
        import {rootSaga} from './sagas'
        //创建一个可以帮你运行saga的中间件
        let sagaMiddleware = createSagaMiddleware()
        let store = createStore(reducers,applyMiddleware(sagaMiddleware));
        sagaMiddleware.run(rootSaga,store);
        export default store;


- index.js 创建改变state的reducer

        import * as types from '../action-types'
        import {combinReducers} from 'redux'
        function user(state={token:'',error:''},action){
            switch(action.type){
                case types.LOGIN_SUCCESS:
                    return {...state,token:action.token}
                case types.LOGIN.ERROR:
                    return {...state,error:action.error}; 
                default:
                    return state;       
            }
        }
        export default combinReducers({
            user
        })

- action-types.js 触发的事件

        export const LOGIN_REQUEST = 'LOGIN_REQUEST';
        export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
        export const LOGIN_ERROR = 'LOGIN_ERROR';

        export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
        export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
        export const LOGOUT_ERROR = 'LOGOUT_ERROR';

- actions.js 我们的action会返回一个对象

        import * as types from './action-types';
        export default {
            //这里面其实是异步的任务,saga处理
            //返回的这个type是在action中不存在的
            login(username,password){
                return {type:types.LOGIN_REQUEST,username,password};
            },
            logout(){
                return {type:types.LOGOUT_REQUEST};
            }
        }

- saga.js 我们的异步管理


            import 'babel-polyfill';
            import {takeEvery,all,call,put,take} from 'redux-saga/effects';
            import * as types from './store/action-types';
            import {push} from 'react-router-redux';
            let Api = {
            login(username,password){
                return new Promise(function(resolve,reject){
                    //setTimeout(function(){
                    resolve(username+password);
                    console.log('login resolve');
                    // },1000);
                });
            }
            }
            function* login(username,password){
            try{
                let token = yield call(Api.login,username,password);
                //let token = yield Api.login(username,password);

                console.log('token',token);
                yield put({type:types.LOGIN_SUCCESS,token});
                //跳到个人页
                yield put(push('/logout')); 
                return token;
            }catch(error){
                put({type:types.LOGIN_ERROR,error});
            }
            }
            function* loginFlow(){
            while(true){
                //监听未来的action,用户在退出的时候，必须等待take的任务是已经被触发了
                let {username,password} = yield take(types.LOGIN_REQUEST);
                let token = yield login(username,password);
                if(token){
                yield take(types.LOGOUT_REQUEST);
                //跳回登录
                yield put(push('/login')); 
                }
            }
            }
            function* watchAction(getState){
                yield takeEvery('*',function* (action){
                console.log(getState());
                console.log(action);
                });
            
            }
            export function* rootSaga({getState}){
            yield all([loginFlow(),watchAction(getState)]);
            }






        




























