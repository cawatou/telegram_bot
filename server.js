var tgbot   = require('node-telegram-bot-api'),
    http    = require('http'),
    request = require('request'),
    cheerio = require('cheerio'),
    iconv   = require('iconv-lite'),
    fs      = require('fs'),
    log     = require('./log'),
    token = '483874841:AAHA0hwxXXfXfpglDEA2wXWILak5uV9aqbw',
    bot = new tgbot(token, {polling: true});

log.info('============== START ================');
bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    console.log(msg);
    if(msg.from.username) log.info(msg.from.username);
    else if(msg.from.first_name) log.info(msg.from.first_name);
    else log.info(msg.from.id);

    switch (msg.text) {
        case '/bash':
            request({uri:'http://bash.im/random', method:'GET', encoding: 'binary'},
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
            break;
        
        case '/lie':
            bot.sendMessage(chatId, "лай, чмо и педораз");
            break;
        
        case '/rook':
            bot.sendMessage(chatId, "Рокер, рикер, рикимару, райкин, рихтер, ростер, ркр, rkir и так далее");
            break;
        
        case '/skmnk':
            const photo = 'img/skmnk.jpeg';
            bot.sendPhoto(chatId, photo);
            break;
        
        case '/quote':
            fs.readFile('quotes/quotes.txt', 'utf8', function (err, data) {
                var arr = data.split(';');
                var rand = Math.floor(Math.random() * arr.length);                
                bot.sendMessage(chatId, arr[rand]);
            });           
            break;
        
        case '/test':      
            var text = "forward_from: { id: 172849660, is_bot: false, first_name: 'vo', last_name: 'va' }, forward_date: 1511445784, text: 'Как-то мутно всё!' }";
            bot.sendMessage(chatId, text);       
            break;
    }
}); 