define(function(require){
    var Fluxify = require("../../lib/Fluxify");

    var dispatcher = Fluxify.dispatcher,
        ACTION_TYPE = Fluxify.getActionTypes();

    var ThreadStore = require("./ThreadStore");
    var MessageStore = require("./MessageStore");

    var UnreadThreadStore = Fluxify.createStore("UnreadThreadStore", {
        getUnreadThreadCount: function(){
            var count = 0,
                _threads = ThreadStore.getAll();
            for (var id in _threads){
                var thread = _threads[id];

                if (!thread.lastMessage.isRead){
                    count++;
                }
            }

            return count;
        }
    }, function(payload){
        var action = payload.action;

        switch (action.actionType){
            case ACTION_TYPE.RECEIVE_RAW_MESSAGE:
                dispatcher.waitFor([ThreadStore.dispatchToken, MessageStore.dispatchToken])
                break;
        }
    });

    return UnreadThreadStore;
})