var tgbot   = require('node-telegram-bot-api'),
    http    = require('http'),
    request = require('request'),
    cheerio = require('cheerio'),
    iconv   = require('iconv-lite'),
    log     = require('./log'),
    token = '483874841:AAHA0hwxXXfXfpglDEA2wXWILak5uV9aqbw',
    bot = new tgbot(token, {polling: true});

log.info('============== START ================');
bot.onText(/\/bash (.+)/, function (msg, match) {
    var fromId = msg.from.id,
        resp = match[1];
    
    bot.sendMessage(fromId, resp);
});

bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    //console.log(msg);
    if(msg.text == '/bash'){
        log.info(msg.from.first_name);
        request({
                uri:'http://bash.im/random',
                method:'GET',
                encoding: 'binary'
            },
            function (err, res, page) {
                var $=cheerio.load(page);
                
                $('.quote .text').each(function(){
                    $(this.children).each(function(){
                        if(this.type == 'text') {
                            var text = iconv.decode(this.data, 'win1251');
                            bot.sendMessage(chatId, text);
                        }
                     });              
                    return false;
                });
            });        
    }else{
        bot.sendMessage(chatId, "I don't know this cmnd");
    }
}); 