/**
 * Created by cdyf on 15-2-4.
 */
define(function(require){
    var Fluxify = require("../lib/Fluxify");

    var Constants = require("./constants/Constants");

    var IndexView = require("./views/index");

    var mockdata = require("./utils/mockdata");

    var WebAPIUtils = require("./utils/WebAPIUtils");

    mockdata.init();

    Fluxify.setActionTypes(Constants.ACTION_TYPE);

    return {
        init: function(){
            WebAPIUtils.getAllMessage();

            React.render(
                React.createElement(IndexView, null),
                document.getElementById("chat")
            )
        }
    }

});