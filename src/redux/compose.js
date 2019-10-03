export default function compose(...fns){
  if(fns.length==1)
    return fns[0];
    //a是最终调用的函数,b是函数集合中的每一个函数
  return fns.reduce((a,b)=>(...args)=>a(b(...args)));
}