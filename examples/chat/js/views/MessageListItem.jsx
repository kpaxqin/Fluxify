define(function(require){


    return React.createClass({
        render: function(){
            var msg = this.props.message;

            var Loading;

            if (msg.isSending){
                Loading = <i className="message-sending"></i>
            }

            return (
                <li className="message-list-item">
                    <h5 className="message-author-name">{msg.authorName}</h5>
                    <div className="message-time">{msg.date.toLocaleTimeString()}</div>
                    <div className="message-text">
                        {Loading}
                        {msg.text}
                    </div>
                </li>
            )
        }
    })
})