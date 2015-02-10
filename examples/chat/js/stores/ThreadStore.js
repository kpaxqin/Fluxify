/**
 * Created by cdyf on 15-2-4.
 */
define(function(require){
    var Fluxify = require("../../lib/Fluxify");

    var dispatcher = Fluxify.dispatcher,
        ACTION_TYPE = Fluxify.getActionTypes();

    var ChatMessageUtil = require("../utils/ChatMessageUtil");

    var _threads = {},
        _currentID;

    var ThreadStore = Fluxify.createStore("ThreadStore", {
        init: function(rawMessages){

            //转换得到threads
            rawMessages.forEach(function(message){
                var threadID = message.threadID;
                var thread = _threads[threadID];

                //thread已保存且当前message时间不是最新
                if (thread && thread.lastTimestamp > message.timestamp){
                    return;
                }
                _threads[threadID] = {
                    id: threadID,
                    name: message.threadName,
                    lastMessage: ChatMessageUtil.convertRawMessage(message),
                    lastTimestamp : message.timestamp
                }
            }, this);

            //计算current
            if (!_currentID){
                var sortedThreads = this.getAllChrono();
                this.setCurrentByID(sortedThreads[sortedThreads.length - 1].id);
            }
        },
        setCurrentByID: function(id){
            if (_threads[id]){
                _currentID = id;
                _threads[id].lastMessage.isRead = true;
            }
        },
        getByID: function(id){
            return _threads[id];
        },
        getAll: function(){
            return _threads;
        },
        getAllChrono: function(){
            var result = [];

            for (var id in _threads){
                var thread = _threads[id];
                result.push(thread)
            }

            result.sort(function(a, b){
                if (a.lastMessage.timestamp < b.lastMessage.timestamp) {
                    return -1;
                } else if (a.lastMessage.timestamp > b.lastMessage.timestamp) {
                    return 1;
                }
                return 0;
            })

            return result;
        },
        getCurrent: function(){
            return this.getByID(_currentID);
        },
        getCurrentID: function(){
            return _currentID;
        },
        /*
         * 由于标记message的isRead的工作在MessageStore中，此函数执行时计数出错，认为全部未读
         * */
        getUnreadCount: function(){
            var count = 0;
            for (var id in _threads){
                var thread = _threads[id];

                if (!thread.lastMessage.isRead){
                    count++;
                }
            }

            return count;
        }
    }, function(payload){//通过createStore构造的dispatch监听函数this指向构造出的Store
        var action = payload.action;

        switch (action.actionType){
            case ACTION_TYPE.RECEIVE_RAW_MESSAGE :
                this.init(action.rawMessages);

                break;
            case ACTION_TYPE.THREAD_CLICK :
                this.setCurrentByID(action.thread.id);
                this.emitChange();
                break;
            case ACTION_TYPE.CREATE_MESSAGE:
                var currentThread = this.getCurrent();

                currentThread.lastMessage = action.message;
                currentThread.lastTimestamp = +action.message.date;
                this.emitChange();

            default :
        }
    });

    return ThreadStore;

})