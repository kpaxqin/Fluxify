/**
 * Created by cdyf on 15-2-4.
 */
define(function(require){
    var Fluxify = require("../../lib/Fluxify");

    var dispatcher = Fluxify.dispatcher,
        ACTION_TYPE = Fluxify.getActionTypes();

    return {
        receiveAll: function(msgs){
            dispatcher.dispatch({
                action: {
                    actionType: ACTION_TYPE.RECEIVE_RAW_MESSAGE,
                    rawMessages: msgs
                }
            })
        }
    }
});