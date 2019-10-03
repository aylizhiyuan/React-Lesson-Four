# redux + redux中间件 + redux-saga

## 1. redux

redux是用来干什么的？这是我们需要第一个明白的，它跟vuex是一样的功能，用来完成一些数据的共享，使得我们所有的组件都可以很方便的访问到store仓库，改变仓库中的数据dispatch

- 第一步:创建我们的仓库
- 第二步:设置我们的reducer
- 第三步:合并所有的reducer
- 第四步:封装我们的action,用action调用dispatch
- 第五步:让我们在react中使用redux




## 2. redux中间件

它是用来在redux的dispatch中加入一些自己的逻辑,例如支持一些异步的操作,因为本身redux是不支持异步操作的

- 


## 3. redux-saga

它是用来支持异步操作的一个redux中间件

## 4. dva = redux + redux + react-router + fetch的一个东西

