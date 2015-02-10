define(function(require){

    var ViewActionCreator = require("../actions/ChatViewActionCreator");

    var MessageStore = require("../stores/MessageStore");

    var ENTER_KEY_CODE = 13;

    var MessageComposer = React.createClass({
        getInitialState: function(){
            return {
                text: ""
            }
        },
        _onKeyDown: function(e){
            if (e.keyCode === ENTER_KEY_CODE){
                e.preventDefault();
                var text = this.state.text.trim();
                if (text){

//                    var message = MessageStore.getCreatedMessage(text);

                    ViewActionCreator.createMessage(text);

                    this.setState({text: ''});
                }
            }
        },
        _onChange: function(e){
            this.setState({
                text: e.target.value
            })
        },
        render: function(){
            return (
                <textarea
                    className="message-composer"
                    name="message"
                    onKeyDown={this._onKeyDown}
                    onChange={this._onChange}
                    value={this.state.text}
                >
                </textarea>
            )
        }
    })

    return MessageComposer;

});