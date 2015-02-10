/**
 * Created by kpaxqin@github on 15-2-4.
 */
define(function(require){
    return {
        convertRawMessage: function(rawMessage){
            return {
                id: rawMessage.id,
                threadID: rawMessage.threadID,
                authorName: rawMessage.authorName,
                date: new Date(rawMessage.timestamp),
                text: rawMessage.text,
                isRead: false//default to be false
            }
        }
    }
});