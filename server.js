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
    express = require('express'),
    path    = require('path'),
    token   = config.tg_token,
    bot = new tgbot(token, {polling: true}),
    app = express();

const gameName = process.env.TELEGRAM_GAMENAME || 'game30sm';

app.set('view engine', 'ejs');

var   url  = process.env.URL || 'http://95.183.10.70:8080';
//var   url  = '0';
const port = process.env.PORT || 8080;
console.log(url);
//log.info('============== START ================');

/*var counter = new Array(),
    response = '',
    sort_array = new Array();
fs.readFile('logs/cheese.log', 'utf8', function (err, data) {
    var arr = data.split('\n');
    for(var i=0; i < arr.length; i++){
        var row = arr[i].split('- ');
        var name = row[1];

        if(name == undefined || name == '============== START ================') continue;
        if(counter[name]) counter[name]++;
        else counter[name] = 1;
    }

    for (key in counter) {
        sort_array.push({})
    }
    counter.sort();
    console.log(counter);
});*/

db.get("quotes", "one", {"text": "Долбоебы.!"})
    .then(function(res){
        if(res) {
            console.log("Такая цитата уже есть");
        }else{
            console.log("insert db");
        }
    })

bot.on('message', function (msg) {
    var chatId = msg.chat.id,
        fromId = msg.from.id;
    console.log(msg);
    if(!msg.photo && msg.text[0] == '/'){
        if(msg.from.username) log.info(msg.from.username + ' - ' + msg.text + ' ('+ msg.chat.type +')' );
        else if(msg.from.first_name) log.info(msg.from.first_name + ' - ' + msg.text + ' ('+ msg.chat.type +')' );
        else log.info(msg.from.id + ' - ' + msg.text + ' ('+ msg.chat.type +')' );
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
            bot.sendMessage(chatId, "Рокер, рикер, рикимару, райкин, рихтер, ростер, ркр, rkir, розенталь, ройзман, Рамзи, рамблер, рондо, ресторатор, ректор, рандом, рокфор, рокфеллер, раптор, румба, ридли, ридонли, ротонда, Роллингстоунс, Ребекка, Ростислав и так далее");
            break;
        
        case '/skmnk':
            bot.sendPhoto(chatId, 'img/skmnk.jpeg');
            break;
        
        case '/quote':
            db.get("quotes", "all")
                .then(function(res){
                    var rand = Math.floor(Math.random() * res.length);
                    bot.sendMessage(chatId, res[rand].text);
                });

            break;
        
        case '/quote_list':
            db.get("quotes", "all")
                .then(function(res){
                    var fromId = msg.from.id,
                        response = '';

                    for (var i=0; i<res.length; i++) {
                        response = response + res[i].text + '\r\n';
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
                            response = 'http://forgifs.com/gallery/' + $('#gsImageView img').attr('src');
                            bot.sendDocument(chatId, response);
                        });
                })
                .catch(function (err) {
                    logger.info('get error /gif:', err);
                });

            break;

        case '/use':
            var counter = [],
                response = '';
            fs.readFile('logs/cheese.log', 'utf8', function (err, data) {
                var arr = data.split('\n');
                for(var i=0; i < arr.length; i++){
                    var row = arr[i].split('- ');
                    var name = row[1];

                    if(name == undefined || name == '============== START ================') continue;
                    if(counter[name]) counter[name]++;
                    else counter[name] = 1;
                }
                counter.sort(compareNumeric);
                for (key in counter) {
                    response = response + key + '- ' + counter[key] + '\n\r';
                };

                bot.sendMessage(chatId, response);
            });
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
                    '/use - топ пользователей скрипта',
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

// add in db
bot.onText(/\/addquot/, function(msg) {
    var chatId = msg.chat.id,
        quote = msg.text.substring(9);

    db.get("quotes", "one", {"text": quote})
        .then(function(res){
            if(res) {
                console.log("Такая цитата уже есть");
            }else{
                console.log("insert db");
                db.insert("quotes", {"text": quote});
            }
        })
    console.log(quote);
});


/*======================== GAME ========================*/
// tunnel to localhost.
if (url === '0') {
    console.log('Tunnel to localhost');
    const ngrok = require('ngrok');
    ngrok.connect(port, function onConnect(error, u) {
        if (error) throw error;
        url = u;
        console.log(`Game tunneled at ${url}`);
    });
}

// Matches /start
bot.onText(/\/game/, function onPhotoText(msg) {
    console.log('start');
    bot.sendGame(msg.chat.id, gameName);
});

// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    bot.answerCallbackQuery(callbackQuery.id, { url });
});

// Render the HTML game
app.get('/', function requestListener(req, res) {
    console.log('Render the HTML game', res);
    res.sendFile(path.join(__dirname, 'game/game.html'));
});

// Bind server to port
app.listen(port, function listen() {
    console.log('Bind server to port');
    console.log(`Server is listening at http://localhost:${port}`);
});


function compareNumeric(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
}