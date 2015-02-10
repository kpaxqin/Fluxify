define(function(require){
    var MessageStore = require("../stores/MessageStore");
    var ThreadStore = require("../stores/ThreadStore");
    var MessageListItem = require("./MessageListItem");
    var MessageComposer = require("./MessageComposer");
    var Fluxify = require("../../lib/Fluxify");

    return React.createClass({

//        _onChange: function(){
//            this.forceUpdate();
//        },
//        componentDidMount: function() {
//            MessageStore.onChange(this._onChange, this);
//        },
//
//        componentWillUnmount: function() {
//            MessageStore.offChange(this._onChange);
//        },
        mixins: [Fluxify.ReactMixins],
        watchingStores: [MessageStore],
        render: function(){
            var thread = ThreadStore.getCurrent();
            var messages = MessageStore.getAllForCurrentThread();

            var msgListItems = messages.map(function(message){
                return (
                    <MessageListItem
                        message={message}
                    />
                    )

            });

            return (
                <div className="message-section">
                    <h3 className="message-thread-heading">
                        {thread.name}
                    </h3>
                    <ul className="message-list">
                        {msgListItems}
                    </ul>
                    <MessageComposer />
                </div>
            )
        }
    })

})