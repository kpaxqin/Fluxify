define(function(require){
    var ThreadSection = require("./ThreadSection");

    var MessageSection = require("./MessageSection");

    return React.createClass({
        render: function(){
            return (
                React.createElement("div", {className: "chatapp"}, 
                    React.createElement(ThreadSection, null), 
                    React.createElement(MessageSection, null)
                )
            )
        }
    })
});