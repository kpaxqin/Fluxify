/**
 * Created by cdyf on 15-2-6.
 */
(function(global, factory){
    // CMD & CMD-like
    if (typeof define ==="function"){
        define(function(require, exports, module){
            factory(global, exports);
        })
    }else {
        factory(global, {});
    }
})(this, function(root, Fluxify){

//    var Fluxify = window.Fluxify = {};

    var _OP = Object.prototype,
        _AP = Array.prototype,
        hasOwn = _OP.hasOwnProperty;


    var ACTION_TYPES = {};

    Fluxify.utils = {
        /*
        * change {foo: null, bar: null} to {foo: "foo", bar: "bar"}
        * keyMirror({foo: 1}) ==> {"foo": 1}, we'll not overwrite existed value by default
        * keyMirror({foo: 1}, true) ==> {"foo" : "foo"}
        * */
        keyMirror: function(object, overwrite){
            overwrite = overwrite || false;

            var result = {};

            for (var key in object){
                if (!hasOwn.call(object, key)){
                    continue;
                }

                if (object[key]){
                    result[key] = overwrite ? key : object[key];
                }else{
                    result[key] = key;
                }
            }

            return result;
        },
        /*
        *  Object.assign polyfill from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
        * */
        objectAssign: function(target, firstSource) {
            "use strict";
            if (target === undefined || target === null)
                throw new TypeError("Cannot convert first argument to object");
            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) continue;
                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
                }
            }
            return to;
        },
        extend : function(childProto){
            var child,
                parent = this,
                proxy = function(){};

            child = function(){
                return parent.apply(this, arguments);
            };

            proxy.prototype = parent.prototype;

            child.prototype = Fluxify.utils.objectAssign({
                constructor: child
            }, new proxy(), childProto);

            child.__super__ = parent;

            return child;
        }
    }

    /*
    * 可以多次调用，自动merge
    * */
    Fluxify.setActionTypes = function(types){
        ACTION_TYPES = Fluxify.utils.objectAssign(ACTION_TYPES, Fluxify.utils.keyMirror(types));

        return ACTION_TYPES;
    };

    Fluxify.getActionTypes = function(){
        return ACTION_TYPES;
    };

    /*
    * from Backbone.js
    * */
    Fluxify.Events = (function(){
        var hasOwnProperty = _OP.hasOwnProperty,
            toString = _OP.toString,
            slice = _AP.slice;


        var _ = {//methods from underscore that Events in use
            once: function (func) {
                var ran = false, memo;
                return function() {
                    if (ran) return memo;
                    ran = true;
                    memo = func.apply(this, arguments);
                    func = null;
                    return memo;
                };
            },
            isObject: function (obj) {
                return obj === Object(obj);
            },
            isArray : Array.isArray || function(obj) {
                return toString.call(obj) == '[object Array]';
            },
            isString: function(obj){
                return toString.call(obj) == '[object String]';
            },
            has: function(obj, key) {
                return hasOwnProperty.call(obj, key);
            },
            keys : function (obj) {
                if (!_.isObject(obj)) return [];
                if (nativeKeys) return nativeKeys(obj);
                var keys = [];
                for (var key in obj) if (_.has(obj, key)) keys.push(key);
                return keys;
            },
            isEmpty : function (obj) {
                if (obj == null) return true;
                if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
                for (var key in obj) if (_.has(obj, key)) return false;
                return true;
            }
        }

        var Events = {

            // Bind an event to a `callback` function. Passing `"all"` will bind
            // the callback to all events fired.
            on: function(name, callback, context) {
                if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
                this._events || (this._events = {});
                var events = this._events[name] || (this._events[name] = []);
                events.push({callback: callback, context: context, ctx: context || this});
                return this;
            },

            // Bind an event to only be triggered a single time. After the first time
            // the callback is invoked, it will be removed.
            once: function(name, callback, context) {
                if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
                var self = this;
                var once = _.once(function() {
                    self.off(name, once);
                    callback.apply(this, arguments);
                });
                once._callback = callback;
                return this.on(name, once, context);
            },

            // Remove one or many callbacks. If `context` is null, removes all
            // callbacks with that function. If `callback` is null, removes all
            // callbacks for the event. If `name` is null, removes all bound
            // callbacks for all events.
            off: function(name, callback, context) {
                if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;

                // Remove all callbacks for all events.
                if (!name && !callback && !context) {
                    this._events = void 0;
                    return this;
                }

                var names = name ? [name] : _.keys(this._events);
                for (var i = 0, length = names.length; i < length; i++) {
                    name = names[i];

                    // Bail out if there are no events stored.
                    var events = this._events[name];
                    if (!events) continue;

                    // Remove all callbacks for this event.
                    if (!callback && !context) {
                        delete this._events[name];
                        continue;
                    }

                    // Find any remaining events.
                    var remaining = [];
                    for (var j = 0, k = events.length; j < k; j++) {
                        var event = events[j];
                        if (
                            callback && callback !== event.callback &&
                                callback !== event.callback._callback ||
                                context && context !== event.context
                            ) {
                            remaining.push(event);
                        }
                    }

                    // Replace events if there are any remaining.  Otherwise, clean up.
                    if (remaining.length) {
                        this._events[name] = remaining;
                    } else {
                        delete this._events[name];
                    }
                }

                return this;
            },

            // Trigger one or many events, firing all bound callbacks. Callbacks are
            // passed the same arguments as `trigger` is, apart from the event name
            // (unless you're listening on `"all"`, which will cause your callback to
            // receive the true name of the event as the first argument).
            trigger: function(name) {
                if (!this._events) return this;
                var args = slice.call(arguments, 1);
                if (!eventsApi(this, 'trigger', name, args)) return this;
                var events = this._events[name];
                var allEvents = this._events.all;
                if (events) triggerEvents(events, args);
                if (allEvents) triggerEvents(allEvents, arguments);
                return this;
            },

            // Tell this object to stop listening to either specific events ... or
            // to every object it's currently listening to.
            stopListening: function(obj, name, callback) {
                var listeningTo = this._listeningTo;
                if (!listeningTo) return this;
                var remove = !name && !callback;
                if (!callback && typeof name === 'object') callback = this;
                if (obj) (listeningTo = {})[obj._listenId] = obj;
                for (var id in listeningTo) {
                    obj = listeningTo[id];
                    obj.off(name, callback, this);
                    if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
                }
                return this;
            }

        };

        // Regular expression used to split event strings.
        var eventSplitter = /\s+/;

        // Implement fancy features of the Events API such as multiple event
        // names `"change blur"` and jQuery-style event maps `{change: action}`
        // in terms of the existing API.
        var eventsApi = function(obj, action, name, rest) {
            if (!name) return true;

            // Handle event maps.
            if (typeof name === 'object') {
                for (var key in name) {
                    obj[action].apply(obj, [key, name[key]].concat(rest));
                }
                return false;
            }

            // Handle space separated event names.
            if (eventSplitter.test(name)) {
                var names = name.split(eventSplitter);
                for (var i = 0, length = names.length; i < length; i++) {
                    obj[action].apply(obj, [names[i]].concat(rest));
                }
                return false;
            }

            return true;
        };

        // A difficult-to-believe, but optimized internal dispatch function for
        // triggering events. Tries to keep the usual cases speedy (most internal
        // Backbone events have 3 arguments).
        var triggerEvents = function(events, args) {
            var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
            switch (args.length) {
                case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
                case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
                case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
                case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
                default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
            }
        };
        /*
         todo: 暂不迁移IOC版本
         var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

         // Inversion-of-control versions of `on` and `once`. Tell *this* object to
         // listen to an event in another object ... keeping track of what it's
         // listening to.
         _.each(listenMethods, function(implementation, method) {
         Events[method] = function(obj, name, callback) {
         var listeningTo = this._listeningTo || (this._listeningTo = {});
         var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
         listeningTo[id] = obj;
         if (!callback && typeof name === 'object') callback = this;
         obj[implementation](name, callback, this);
         return this;
         };
         });
         */

        // Aliases for backwards compatibility.
        Events.bind   = Events.on;
        Events.unbind = Events.off;

        return Events;
    })();

    Fluxify.dispatcher = (function(){

        var tokenIndex = 0,
            tokenPrefix = "ID_";

        var Dispatcher = function(){
            this._isDispatching = false;
            this._currentPayload = undefined;
            this._callbacks = {};
            this._pending = {};
            this._handled = {};
        };

        Dispatcher.prototype = {
            constructor : Dispatcher,
            register: function(callback){
                var token = tokenPrefix + tokenIndex++;

                this._callbacks[token] = callback;

                return token;
            },
            unregister: function(token){
                delete this._callbacks[token];
            },
            dispatch : function(payload){
                if (this._isDispatching){
                    console.error("cannot dispatch in middle of a dispatch");
                    return;
                }

                this._startDispatching(payload);

                for (var token in this._callbacks){
                    if (!hasOwn.call(this._callbacks, token)){
                        continue;
                    }
                    this._invokeCallback(token);

                }
                this._afterDispatching();
            },
            _startDispatching: function(payload){
                this._currentPayload = payload;
                this._isDispatching = true;
            },
            _afterDispatching: function(){
                this._pending = {};
                this._handled = {};
                this._currentPayload = undefined;
                this._isDispatching = false;
            },
            _invokeCallback: function(token){
                var callback = this._callbacks[token];

                this._pending[token] = true;
                callback.call(this, this._currentPayload);
                this._handled[token] = true;
            },
            waitFor : function(tokens){
                for (var i = 0, len = tokens.length; i < len; i++){
                    var token = tokens[i];

                    if (typeof token === "object"){
                        token = token.dispatchToken;
                    }

                    //check callback exist
                    if (this._callbacks[token]){
                        //已经开始执行
                        if (this._pending[token]){
                            //没有执行完，依赖一个执行中的callback说明成环
                            if (!this._handled[token]){
                                throw Error("circle dependencies found while waitFor :" + token);
                            }
                        }else{//没开始执行
                            this._invokeCallback(token);
                        }
                    }else{
                        console.error("callback not found for token: " + token);
                    }
                }
            }
        }

        return new Dispatcher();
    })();

    var CHANGE_EVENT = "change";
    Fluxify.createStore = function(name, methods, onDispatching){
        var Store = Fluxify.utils.objectAssign({
            emitChange: function(data){
                this.trigger(CHANGE_EVENT, data);
            },
            onChange: function(listener, context){
                this.on(CHANGE_EVENT, listener, context);
            },
            offChange: function(listener){
                this.off(CHANGE_EVENT, listener);
            }
        }, Fluxify.Events, methods);

        if (typeof onDispatching === "function"){
            Store.dispatchToken = Fluxify.dispatcher.register(onDispatching.bind(Store));
        }

        return Store;
    }

    Fluxify.ReactMixins = (function(){
        var storeListenerHandler = function(method){

            var watchingStores = this.watchingStores,
                onStoreChange = this.onStoreChange || this.forceUpdate;

            if (!watchingStores || watchingStores.length < 0){
                console.log("no valid stores watching");
            }

            for (var i = 0, len = watchingStores.length, store = null; i < len; i++){
                store = watchingStores[i];
                if (store && typeof store[method] === "function"){
                    store[method](onStoreChange, this);
                }
            }
        };

        return {
            componentDidMount : function(){
                storeListenerHandler.call(this, "onChange");
            },
            componentWillUnmount : function(){
                storeListenerHandler.call(this, "offChange");
            }
        }
    })();

    root.Fluxify = Fluxify;
});