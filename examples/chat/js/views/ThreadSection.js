define(function(require){
    var ThreadListItem = require("./ThreadListItem");
    var ThreadStore = require("../stores/ThreadStore");
    var UnreadThreadStore = require("../stores/UnreadThreadStore");

    var Fluxify = require("../../lib/Fluxify");

    var getInitState = function(){
        return {
            threads : ThreadStore.getAllChrono(),
            currentId: ThreadStore.getCurrentID(),
//            unreadCount: UnreadThreadStore.getUnreadThreadCount()
            unreadCount: ThreadStore.getUnreadCount()
        }
    }


    var ThreadSection =  React.createClass({displayName: 'ThreadSection',
        getInitialState: function(){
            return getInitState();
        },
        mixins: [Fluxify.ReactMixins],
        watchingStores: [ThreadStore, UnreadThreadStore],
        onStoreChange: function(){
            this.setState(getInitState());
        },
//        _onChange: function(){
//            this.setState(getInitState());
//        },
//        componentDidMount: function() {
//            ThreadStore.onChange(this._onChange, this);
//            UnreadThreadStore.onChange(this._onChange, this);
//        },
//
//        componentWillUnmount: function() {
//            ThreadStore.offChange(this._onChange);
//            UnreadThreadStore.offChange(this._onChange);
//        },
        render: function(){
            var self = this;
            var threadListItems = this.state.threads.map(function(thread){
                return (
                    React.createElement(ThreadListItem, {
                        key: thread.id, 
                        thread: thread, 
                        isCurrent: thread.id === self.state.currentId}
                    )
                )
            });

            return (
                React.createElement("div", {className: "thread-section"}, 
                    React.createElement("div", {className: "thread-count"}, 
                        React.createElement("span", null, "Unread threads: "), 
                        React.createElement("span", null, this.state.unreadCount)
                    ), 

                    React.createElement("ul", {className: "thread-list"}, 
                        threadListItems
                    )
                )
            )

        }

    });

    return ThreadSection;
})