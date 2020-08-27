'use strict'
module.exports=compose;

/**
 * @description compose function 
 * @param middleware 中间件数组；
 *  
 *  1、每个中间件都是一个generator or async function ,接收两个参数 context,next; 上下文对象和next函数；
 *  2、每个中间件的执行都会在next()函数中卡住，执行递归函数dispatch(i+1)
 *  3、 递归结束的条件是!fn ,fn不存在，此时return Promise.resolve();
 *  3、如此，直到最后一个中间件的dispatch() resolve,上一个中间件才会执行；
 *  4、最后执行dispatch(0) 
 *
 * 
*/
function compose(middleware){
    return function (context,next){
        let index=-1;
        return dispatch(0);
        function dispatch(i){
            if(i<index){
                return Promise.reject(new Error('next function has been called multiple times'));
            }
            index=i;
            let fn=middleware[i];
            if(i==middleware.length){
                fn=next;
            }
            if(!fn){
                return Promise.resolve();
            }
            try{
                return Promise.resolve(fn(context,dispatch.bind(null,i+1)));
            }catch(err){
                return Promise.reject(err);
            }
        }
    }
};  