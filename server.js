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
    if(msg.text[0] == '/'){
        if(msg.from.username) log.info(msg.from.username + ' - ' + msg.text);
        else if(msg.from.first_name) log.info(msg.from.first_name + ' - ' + msg.text);
        else log.info(msg.from.id + ' - ' + msg.text);
    }    

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
        
        case '/quote_list':            
            fs.readFile('quotes/quotes.txt', 'utf8', function (err, data) {
                var arr = data.split(';'),
                    fromId = msg.from.id,
                    response = '';
                for (var i=0; i<arr.length; i++) {
                    response = response + arr[i] + '\r\n';
                };

                bot.sendMessage(fromId, response) 
                    .catch(function (err) {
                        bot.sendMessage(msg.chat.id, "Сначала открой приват с ботом");
                    });
            });
           
                   
            break;
        
        case '/help':      
            var command = [
                '/bash - Случайный пост с сайта bash.im', 
                '/lie - Вся правда о лае', 
                '/rook - Кто такой рук?', 
                '/skmnk - &геш', 
                '/quote - Случайная цитата',
                '/вовка и /саня - Тестеры',
                '/quote - Случайная цитата',
                '/quote_list - Список всех цитат (В личку)',
                '/help - Список команд'
            ],  
                response = '';
            for (var i=0; i<command.length; i++) {
                response = response + command[i] + '\r\n';                
            };
            bot.sendMessage(chatId, response);
            break;
        
        case '/test':      
            var text = "forward_from: { id: 172849660, is_bot: false, first_name: 'vo', last_name: 'va' }, forward_date: 1511445784, text: 'Как-то мутно всё!' }";
            bot.sendMessage(chatId, text);       
            break;

        case '/вовка':
            var text = "Тру тестер";
            bot.sendMessage(chatId, text);
            break;

        case '/саня':
            var text = "Ёба я тоже тестер нахуй";
            bot.sendMessage(chatId, text);
            break;
    }
}); 