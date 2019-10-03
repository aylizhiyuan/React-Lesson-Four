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