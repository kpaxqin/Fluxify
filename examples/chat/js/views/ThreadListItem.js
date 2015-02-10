define(function(require){
    var ViewActionCreator = require("../actions/ChatViewActionCreator");

    return React.createClass({

        render: function(){
            var thread = this.props.thread,
                lastMsg = thread.lastMessage,
                isCurrent = this.props.isCurrent;

            var className = (function(){
                var base = "thread-list-item";
                return isCurrent ? base + " active": base;
            })()

            var onClick = function(){
                ViewActionCreator.threadClick(thread);
            }

            return (
                React.createElement("li", {className: className, 
                    onClick: onClick
                }, 
                    React.createElement("h5", {className: "thread-name"}, thread.name), 
                    React.createElement("div", {className: "thread-time"}, 
                        new Date(lastMsg.date.toLocaleTimeString())
                    ), 
                    React.createElement("div", {className: "thread-last-message"}, 
                        lastMsg.text
                    )
                )
            )
        }
    })

})