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
                <li className={className}
                    onClick={onClick}
                >
                    <h5 className="thread-name">{thread.name}</h5>
                    <div className="thread-time">
                        {new Date(lastMsg.date.toLocaleTimeString())}
                    </div>
                    <div className="thread-last-message">
                        {lastMsg.text}
                    </div>
                </li>
            )
        }
    })

})