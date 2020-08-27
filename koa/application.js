const http =require('http');
const Emmiter =require('events');

const debug =require('debug')('koa:application');
// 引入组合函数；
const compose =require('./compose')
// 定义context 
const context =require('./context');


module.exports=class Application extends Emitter{
 
    constructor(){
        super();
        this.middleware=[];
        // 创建this.context,并将context 作为原型proto
        this.context=Object.create(context);
    }
    use(fn){
        this.middleware.push(fn);
    }

    listen(...args){

        debug('listen')
        const server =http.createServer(this.callback());
        return server.listen(...args);
    }
    
    // callback
     callback(){
         // 处理中间件，将middlerware作为compose组合函数的参数；
         const fn=compose(this.middleware);
         const handleRequest=(req,res)=>{
            const ctx=this.createContext(req,res);
            this.handleRequest(ctx,fn);
         }
         return handleRequest;
     }

     /**
      * Handle request in callback
      * @api private
     */

     handleRequest(ctx,fnMiddleware){
        ctx.statusCode=404;
        const onerror =err=>ctx.onerror(err);
        const handleResponse=()=>respoond(ctx);
        return fnMiddleware(ctx).then(handleResponse).catch(onerror)
     }
      /**
   * Initialize a new context.
   *
   * 源码中会有 koa 的 request 和 response 对象的封装，
   * 然后将 context, request, response , 原生的 req , res , 彼此进行一系列的关联
   * 这里只留下 req 和 res 用于 ctx 的代理
   * @api private
   */
     createContext(req,res){
        const context=Object.create(this.context)
        context.app=this;
        context.req=req;
        context.res=res;
        return context;
     }

 

}

   /**
 * Response helper.
 * 源码中这里是响应处理，主要是对 body 的各类处理和异常处理
 * 我们就简单直接输出body了
 */

function respond (ctx) {
 let body=ctx.body
 ctx.res.end(body);    
}