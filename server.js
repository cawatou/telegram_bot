var TelegramBot = require('node-telegram-bot-api');

var token = '483874841:AAHA0hwxXXfXfpglDEA2wXWILak5uV9aqbw';
var bot = new TelegramBot(token, {polling: true});

bot.onText(/\/echo (.+)/, function (msg, match) {
    var fromId = msg.from.id;
    var resp = match[1];
    bot.sendMessage(fromId, resp);
});

bot.onText(/\/bash (.+)/, function (msg, match) {
    var fromId = msg.from.id;
    var resp = match[1];
    bot.sendMessage(fromId, resp);
});

bot.on('message', function (msg) {
    console.log(msg);
    var chatId = msg.chat.id;

    if(msg.text == 'bash'){
        bot.sendMessage(chatId, 'soon here been mem');
    }else{
        bot.sendMessage(chatId, 'Received your message');
    }

});