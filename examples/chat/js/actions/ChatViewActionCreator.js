/**
 * Created by cdyf on 15-2-5.
 */
define(function(require){
    var Fluxify = require("../../lib/Fluxify");

    var MessageStore = require("../stores/MessageStore");
    var ThreadStore = require("../stores/ThreadStore");

    var WebAPIUtils = require("../utils/WebAPIUtils");

    var dispatcher = Fluxify.dispatcher,
        ACTION_TYPE = Fluxify.getActionTypes();

    return {
        threadClick: function(thread){
            dispatcher.dispatch({
                action: {
                    actionType: ACTION_TYPE.THREAD_CLICK,
                    thread: thread
                }
            });

        },
        createMessage: function(text){
            var message = MessageStore.getCreatedMessage(text);

            dispatcher.dispatch({
                action: {
                    actionType: ACTION_TYPE.CREATE_MESSAGE,
                    message: message
                }
            });

            WebAPIUtils.addMessage(message, ThreadStore.getCurrent());
        }
    }
});