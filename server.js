var tgbot   = require('node-telegram-bot-api'),
    rp      = require('request-promise'),
    request = require('request'),
    cheerio = require('cheerio'),
    iconv   = require('iconv-lite'),
    moment  = require('moment'),
    fs      = require('fs'),
    db      = require('./db'),
    log     = require('./log'),
    config  = require('./config'),
    token   = config.tg_token,
    bot = new tgbot(token, {polling: true});

//log.info('============== START ================');

bot.on('message', function (msg) {
    var chatId = msg.chat.id,
        fromId = msg.from.id;
    console.log(msg);
    if(!msg.photo && msg.text[0] == '/'){
        if(msg.from.username) log.info(msg.from.username + ' - ' + msg.text);
        else if(msg.from.first_name) log.info(msg.from.first_name + ' - ' + msg.text);
        else log.info(msg.from.id + ' - ' + msg.text);
    }    

    switch (msg.text) {
        case '/bash':
            request({uri:'http://bash.im/random', method:'GET', encoding: 'binary'},
                function (err, res, page) {
                    var $=cheerio.load(page),
                        response = '';

                    $('.quote .text').each(function(){
                        $(this.children).each(function(){
                            console.log(this);
                            if(this.type == 'text') response = response + iconv.decode(this.data, 'win1251');
                            if(this.type == 'tag' && this.name == 'br') response = response + '\r\n';
                        });
                        return false;
                    });
                    bot.sendMessage(chatId, response);
                });
            break;
        
        case '/lie':
            bot.sendMessage(chatId, "лай, чмо и педораз");
            break;
        
        case '/rook':
            bot.sendMessage(chatId, "Рокер, рикер, рикимару, райкин, рихтер, ростер, ркр, rkir, розенталь, ройзман, Рамзи, рамблер, рондо, ресторатор, ректор, рандом, рокфор, рокфеллер, раптор, румба, ридли и так далее");
            break;
        
        case '/skmnk':
            bot.sendPhoto(chatId, 'img/skmnk.jpeg');
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

        case '/fagot':
            var date = moment(date).format("YYYY-MM-DD");
            db.get('date', 'one')
                .then(function (data){
                    if(data.value == date){                        
                         db.get('fagot', 'one')
                            .then(function (fagot){
                                bot.sendMessage(chatId, 'Пидор дня - ' + fagot.name);
                            })
                            .catch(function (err) {
                                logger.info('getFagot error:', err);
                            });
                    }else{
                        db.get('users', 'all')
                            .then(function (users){
                                var fagots = [],
                                    rand = Math.floor(Math.random() * users.length);
                                
                                for (var i = 0; i < users.length; i++) {
                                    fagots.push(users[i]['name']);
                                }

                                db.update('date', {'value': date}, {'value': data.value});
                                db.get('fagot', 'one')
                                    .then(function (old_fagot){
                                        db.update('fagot', {'name': fagots[rand]}, {'name': old_fagot.name});
                                        return db.get('users', 'one', {"name": fagots[rand]})
                                    }) 
                                    .then(function (user){                                        
                                        user.fagot_count++;
                                        db.update('users', user, {'name': user.name});                                            
                                        bot.sendMessage(chatId, 'Пидор дня - ' + fagots[rand]);                                                                              
                                    })
                                    .catch(function (err) {
                                        logger.info('setFagot error:', err);
                                    });
                                
                            })
                            .catch(function (err) {
                                logger.info('getUserName error:', err);
                            })
                    }
                })
                .catch(function (err) {
                    logger.info('get error:', err);
                });
            
            break;

        case '/fagot_top':
            db.get('users', 'all', {}, {'fagot_count': -1})
                .then(function(users){
                    var top = '';
                    for (var i = 0; i < users.length; i++) {                        
                        top = top + users[i].name + ' - ' + users[i].fagot_count + '\r\n';
                    }
                    bot.sendMessage(chatId, top);
                })
           
            break; 
        
        case '/gif':
            var options = {
                    uri: 'http://forgifs.com/gallery/main.php?g2_view=dynamicalbum.RandomAlbum',
                    transform: function (body) {
                        return cheerio.load(body);
                    }
                },
                url = '',
                response = '';

            rp(options)
                .then(function ($) {
                    $('#gsThumbMatrix .giItemCell').each(function(){
                        url = 'http://forgifs.com/gallery/' + $(this).find('a').attr('href');
                        return false;
                    });
                    request({uri: url, method: 'GET', encoding: 'binary'},
                        function (err, res, page) {
                            $=cheerio.load(page);
                            console.log('tt');
                            response = 'http://forgifs.com/gallery/' + $('#gsImageView img').attr('src');
                            bot.sendMessage(chatId, response);
                        });
                })
                .catch(function (err) {
                    logger.info('get error /gif:', err);
                });
            
           /* request({uri:'http://forgifs.com/gallery/main.php?g2_view=dynamicalbum.RandomAlbum', method:'GET', encoding: 'binary'},
                function (err, res, page) {
                    var $=cheerio.load(page);
                    $('#gsThumbMatrix .giItemCell').each(function(){
                        return url = 'http://forgifs.com/gallery/' + $(this).find('a').attr('href');                    
                    });
                    console.log(url);
                    //bot.sendMessage(chatId, response);
                });
            console.log('external:');*/
            /*request({uri: url, method: 'GET', encoding: 'binary'},
                function (err, res, page) {
                    $=cheerio.load(page);
                    console.log('tt');
                    response = 'http://forgifs.com/gallery/' + $('#gsImageView img').attr('src');
                });*/
            
            break;

        case '/вовка':
            bot.sendMessage(chatId, "Тру тестер");
            break;

        case '/саня':
            bot.sendMessage(chatId, "Ёба я тоже тестер нахуй");
            break;

        case '/help':
            var command = [
                    '/bash - Случайный пост с сайта bash.im',
                    '/lie - Вся правда о лае',
                    '/rook - Кто такой рук?',
                    '/skmnk - &геш',
                    '/quote - Случайная цитата',
                    '/quote_list - Список всех цитат (В личку)',
                    '/fagot - пидр дня',
                    '/fagot_top - топ пидров',
                    '/gif - Случайная гифка',
                    '/help - Список команд',
                    '/вовка и /саня - Тестеры'],
                response = '';
            for (var i=0; i<command.length; i++) {
                response = response + command[i] + '\r\n';
            };
            bot.sendMessage(chatId, response);
            break;
    }
}); 