/**
 * Created by cdyf on 15-2-4.
 */
define(function(require){
    var ServerActionCreator = require("../actions/ChatServerActionCreator");

    return {
        getAllMessage: function(){
            var msgStr = localStorage.getItem("messages"),
                messages = JSON.parse(msgStr);

            ServerActionCreator.receiveAll(messages);
        },
        addMessage: function(message, thread){
            var rawMessages = JSON.parse(localStorage.getItem("messages")),
                newMessage = {
                    id: message.id,
                    threadID: message.threadID,
                    threadName: thread.name,
                    authorName: message.authorName,
                    text: message.text,
                    timestamp: +message.date
                };
            rawMessages.push(newMessage);

            //模拟服务器异步处理并返回结果
            setTimeout(function(){
                localStorage.setItem("messages", JSON.stringify(rawMessages));
                ServerActionCreator.addMessage(newMessage);
            }, 1000);

        }
    }
})