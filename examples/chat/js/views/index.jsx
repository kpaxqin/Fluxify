define(function(require){
    var ThreadSection = require("./ThreadSection");

    var MessageSection = require("./MessageSection");

    return React.createClass({
        render: function(){
            return (
                <div className="chatapp">
                    <ThreadSection />
                    <MessageSection />
                </div>
            )
        }
    })
});