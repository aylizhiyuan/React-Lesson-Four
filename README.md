# redux + redux中间件 + redux-saga + dva的发展

## 1. redux

redux是用来干什么的？这是我们需要第一个明白的，它跟vuex是一样的功能，用来完成一些数据的共享，使得我们所有的组件都可以很方便的访问到store仓库，改变仓库中的数据dispatch

- 第一步:创建我们的仓库
- 第二步:设置我们的reducer
- 第三步:合并所有的reducer
- 第四步:封装我们的action,用action调用dispatch
- 第五步:让我们在react中使用redux




## 2. redux中间件

它是用来在redux的dispatch中加入一些自己的逻辑,例如支持一些异步的操作,因为本身redux是不支持异步操作的

- 第一步，在创建仓库的时候将原始的dispatch重新改造为新的dispatch
- 第二步,当调用dispatch的时候依次执行所有的中间件

        + src
        + component
            - user.js //这里面是我们的组件
        + reducers
            - user.js //我们组件使用的reducers
        + actions
            - user.js //我们组件触发的action列表


## 3. redux-saga

它是用来支持异步操作的一个redux中间件

        + src
        + sagas
            - user.js
        + reducers
            - user.js
        + actions
            - user.js

你会发现是不是特别的麻烦啊，对吧，我们每次都要这么做的

举例说明:完成一个登陆的逻辑

        //component/Login.js我们的登陆组件
        //需要注意的是，我们在这里面使用了connect来封装这个组件

        import React,{Component} from 'react';
        import actions from '../store/actions';
        import {connect} from 'react-redux';
        class Login extends Component{
            handleSubmit = (event)=>{
                event.preventDefault();  
                let username = this.username.value;
                let password = this.password.value;
                this.props.login(username,password);
            }
            render(){
                return (
                    <form onSubmit={this.handleSubmit}>
                        用户名 <input type="text" ref={input=>this.username = input} /><br/>
                        密码 <input type="text" ref={input=>this.password = input} /><br/>
                        <input type="submit"/>
                    </form>
                )
            }
        }
        export default connect(
            state=>({...state.user}),
            actions
        )(Login);

接下来是我们user的reducer

    //这里面定义了我们的state和修改逻辑

    //注意，这里使用了合并combinReducers来合并多个reducer

    import * as types from '../action-types';
    import {combineReducers} from 'redux';
    import {routerReducer } from 'react-router-redux'
    function user(state = {token:'',error:''}, action) {
        switch (action.type) {
            case types.LOGIN_SUCCESS:
                return { ...state,token:action.token};
            case types.LOGIN_ERROR:
                return { ...state,error:action.error};
            default:
                return state;
        }
    }
    export default combineReducers({
        user,
        router: routerReducer
    });

然后是我们封装好的action对应dispatch

        //注意我们在这里传递的两个参数
        import * as types from './action-types';
        export default {
            login(username,password){
                return {type:types.LOGIN_REQUEST,username,password};
            },
            logout(){
                return {type:types.LOGOUT_REQUEST};
            }
        }

最后就是我们的saga了，我们需要在saga中完成整个逻辑

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

最后我们在创建store的时候将saga的逻辑注入到store中，比如用户名的判断、密码的判断、发生请求、得到token

        import {createStore,applyMiddleware,compose} from 'redux';
        import reducers from './reducers';
        import createSagaMiddleware  from 'redux-saga';
        import {rootSaga} from '../sagas';
        import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
        import createHistory from 'history/createHashHistory'
        let history = createHistory();
        let middlewareRouter = routerMiddleware(history);
        const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
        //let store = createStore(reducers);
        //let store = applyMiddleware()(createStore)(reducers);
        //这是一个可以帮你运行saga的中间件
        let sagaMiddleware = createSagaMiddleware();
        let store = createStore(reducers,composeEnhancers(applyMiddleware(sagaMiddleware,middlewareRouter)));
        //通过中间件执行或者说运行saga
        sagaMiddleware.run(rootSaga,store);
        window.store = store;
        export default store;

## 4. dva = redux + redux + react-router + fetch

dva是我们真正在写项目的时候需要理解和熟悉的项目构造，所以，这个是重点





