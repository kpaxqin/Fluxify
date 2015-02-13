Fluxify: 构建Flux应用的轻量化工具库
==================

##概述
Fluxify是一个轻量化的（目前源码不足500行），协助构建[Flux][Flux]结构Web应用的工具库

由于facebook的[Flux][Flux]库更偏向于理念展示，公布的实现中只有Dispatcher部分。实际构建中有大量的重复工作可以由统一的工具库代劳，这也是Fluxify出现的原因。

Fluxify目前做了以下事情：

* ActionTypes的配置与访问
* 内置单例的dispatcher实例，用户不必new Dispatcher
* 提供createStore工厂方法用于生成Store，封装了事件和注册dispatcher回调的代码
* 提供ReactMixins，简化React组件监听Store的代码

##使用
### 配置ActionTypes
提供了`Fluxify.setActionTypes`和`Fluxify.getActionTypes`两个工具函数，实际使用示例如下
```js
// constant.js
module.exports = {
    ACTION_TYPE: {
        THREAD_CLICK: null,
        CREATE_MESSAGE: null
    }
}

//appIndex.js
var constant = require("constant");

Fluxify.setActionTypes(constant.ACTION_TYPE);

//then you can get ActionTypes anywhere by Fluxify.getActionTypes
Fluxify.getActionTypes();// => Object {THREAD_CLICK: "THREAD_CLICK", CREATE_MESSAGE: "CREATE_MESSAGE"}


```
其中`Fluxify.setActionTypes`支持多次调用，最终保存的将是merge后的结果

为了简化配置，`Fluxify.setActionTypes`还提供了自动的KeyMirror功能

如下
```js
Fluxify.setActionTypes({FOO: null});
Fluxify.setActionTypes({BAR: 1});

console.log(Fluxify.getActionTypes());
// => Object {FOO: "FOO", BAR: 1}
//KeyMirror只对值为null或undefined的key生效，避免覆盖用户配置
```

### 内置dispatcher

由于在Flux中dispatcher是单例的action转发器，因此没有由用户构建实例的必要，直接内置了一个dispatcher实例并通过`Fluxify.dispatcher`访问

保留了`register, unregister, waitFor, dispatch`等函数接口，其中waitFor不仅支持回调ID数组，也支持Store对象数组（由createStore构建的Store），如下：

```js
var FooStore = Fluxify.createStore("FooStore", {/*methods*/}, function(payload){});

//BarStore.js
/*省略代码若干*/

dispatcher.waitFor([FooStore.dispatchToken]);//等效于 dispatcher.waitFor([FooStore]);

```

###createStore工厂方法

createStore对事件相关的代码进行了封装，同时规范了构造Store对象的过程。注意createStore构建出的Store是一个简单对象。

createStore(name, methods, onDispatching)提供了三个参数:

* `name`  Store名，此参数目前还没有被用到，留作备用
* `methods` Store的业务方法集合，与业务相关的方法应该放在这个对象中，最终将被以Object.assign的方式merge进返回的Store对象
* `onDispatching(payload)`  注册在dispatcher上的回调函数，处理action相关的逻辑，此函数的this指向当前Store

createStore返回的Store对象具备如下函数与属性：

* `dispatchToken` dispatcher回调函数的回调ID
* `emitChange()`  触发Store的change事件
* `onChange(listener, context)`  添加change事件监听器
* `offChange(listener)`  移除change事件监听器

###ReactMixins

使用示例
```js
React.createClass({
    mixins: [Fluxify.ReactMixins],
    watchingStores: [FooStore, BarStore],
    /*
    当watchingStores数组中的任一Store触发change事件时，onStoreChange函数即会被调用，this指向当前react组件。
    可以省略onStoreChange函数，默认会调用this.forceUpdate
    */
    onStoreChange : function(){
        this.setState({
            foo: "foo"
        });
    },
    render: function(){/*...*/}
});

```
###存在的问题与展望:

1. createStore保留了onDispatching函数，这意味着在onDispatching函数中一定会用`switch-case`语句来分发action逻辑，这种模式的缺点明显：`switch-case`本身的语法不够健壮，不同的action处理逻辑共享同一个作用域也存在风险（虽然可以用即时函数解决）。<br/>之所以没有采用类似[Fluxxor][Fluxxor]的配置化转发Action，是存在几方面的考虑：
  * ActionTypes都是变量，无法通过对象字面量Mapping的方式书写（变量不能作为 字面量对象的key）。Fluxxor的解决方案是用bindActions函数参数奇偶位做区分，但个人认为这种方式在工程化的应用中显得不够严谨。
  * 采用声名式配置意味着每种Action都需要一个函数进行处理，这意味着Store会混杂业务函数与action处理函数。多数情况下每种Action的处理代码只有少数几行，而Store要监听的Action种类可能会很多，大量的action处理函数可能造成代码难以阅读和维护
2. 无论是官方库还是第三方实现，Flux架构目前缺少一块重要的拼图：**“异步调用前置化、Store逻辑同步化”是Flux的核心，但是目前为止没有足够健壮的手段来维护这种核心理念**。<br/>有很多不理解Web API call前置理念的开发者，在声称自己实现了一个Flux框架时直接省略掉了ActionCreator，导致Store异步化并且迅速掉入复杂的store关系维护陷阱，无论用多么强大的组合事件机制都难以挽回。<br/>Fluxify中依然存在着上面提到的**健壮**性缺失的问题，一句setTimeout都会让管理Store依赖的核心函数waitFor失效。或许像facebook这样工程师平均素质足够高的团队可以不用在乎，但从更普遍的工程角度这无疑是难以接受的。而这也将是Fluxify下一步思考的重点

[Flux]: https://github.com/facebook/flux

[Fluxxor]: http://fluxxor.com/
