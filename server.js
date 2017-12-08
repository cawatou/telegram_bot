var tgbot   = require('node-telegram-bot-api'),
    bParser = require('body-parser'),
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
app.use(bParser.json() );
app.use(bParser.urlencoded({
    extended: true
}));

var   url  = process.env.URL || 'http://95.183.10.70:8080';
//var   url  = '0';
const port = process.env.PORT || 8080;
//log.info('============== START ================');



/*bot.getChatAdministrators("-1001205417187")
    .then(res=>{
        console.log(res);
    })*/


bot.on('message', function (msg) {
    var chatId = msg.chat.id,
        fromId = msg.from.id;
    console.log(msg);
    if(!msg.photo && msg.text[0] == '/'){
        if(msg.from.username) log.info(msg.from.username + ' - ' + msg.text + ' ('+ msg.chat.type +')' );
        else if(msg.from.first_name) log.info(msg.from.first_name + ' - ' + msg.text + ' ('+ msg.chat.type +')' );
        else log.info(msg.from.id + ' - ' + msg.text + ' ('+ msg.chat.type +')' );
    }

    var command = msg.text.replace( "@script30sm_bot", "" );
    switch (command) {
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
            var response = '';
            db.get("rook", "all")
                .then(function(res) {
                    for (var i=0; i < res.length; i++) {
                        if(i == res.length - 1) response = response + res[i].value;
                        else response = response + res[i].value + ', ';
                    };
                    bot.sendMessage(chatId, response + " и так далее");
                })
                .catch(function(err){
                    console.log(err);
                })
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
                sortable = [],
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

                for (var user in counter) {
                    sortable.push([user, counter[user]]);
                }

                sortable.sort(function(a, b) {
                    return b[1] - a[1];
                });

                for (var i=0; i < sortable.length; i++) {
                    if(i == 14) break;
                    response = response + (i + 1) + ') ' +sortable[i][0] + '- ' + sortable[i][1] + '\n\r';
                };

                bot.sendMessage(chatId, response);
            });
            break;


        case '/game': 
            bot.sendGame(msg.chat.id, gameName);
            break
        
        case '/game_top':
            var users = [],
                response = '',
                user_name = '';
            db.get("users", "all")
                .then(function(data){
                    for(var i=0; i < data.length; i++){
                        users.push([data[i].id, data[i].name]);
                    }
                    return db.get("game_score", "all", {}, {total_score: -1})
                })
                .then(function(score){                    
                    for(var i=0; i < score.length; i++){
                        for(var j=0; j < users.length; j++){
                            console.log(users[j][0], score[i].uid);
                            if(parseInt(users[j][0]) == parseInt(score[i].uid)) {
                                user_name = users[j][1];
                            }
                        }
                        response = response + (i + 1) + ") " + user_name + " - " + score[i].total_score + '\r\n';
                    }
                    bot.sendMessage(chatId, response);
                })
            break;

        case '/game_record':
            var users = [],
                response = '',
                user_name ='';
            db.get("users", "all")
                .then(function(data){
                    for(var i=0; i < data.length; i++){
                        users.push([data[i].id, data[i].name]);
                    }
                    return db.get("game_score", "one", {}, {best_score: -1})
                })
                .then(function(score){
                    console.log('score: ', score, users);
                    for(var j=0; j < users.length; j++){
                        if(parseInt(users[j][0]) == parseInt(score.uid)) {
                            user_name = users[j][1];
                            console.log(user_name);
                        }
                    }
                    response = "Лучший счет за игру: " + score.best_score + " [ " + user_name + " ]";
                    bot.sendMessage(chatId, response)
                })
            break;
        
        case '/вовка':
            bot.sendMessage(chatId, "Тру тестер");
            break;

        case '/саня':
            bot.sendMessage(chatId, "Ёба я тоже тестер нахуй");
            break;

        case '/help':
            var response = '';            
            db.get("help_menu", "all", {}, {sort: 1})
                .then(function(res){
                    for (var i=0; i<res.length; i++) {
                        response = response + res[i].value + '\r\n';
                    };
                    bot.sendMessage(chatId, response);
                })
            break;
    }
});

// add in db
bot.onText(/\/addquote/, function(msg) {
    var command = msg.text.replace( "@script30sm_bot", "" ),
        chatId = msg.chat.id,
        quote = command.substring(10);

    if(quote != "") {
        db.get("quotes", "one", {"text": quote})
            .then(function (res) {
                if (res) {
                    bot.sendMessage(chatId, "Такая цитата уже есть");
                } else {
                    db.insert("quotes", {"text": quote});
                    bot.sendMessage(chatId, "Цитата добавлена");
                }
            })
    }else{
        bot.sendMessage(chatId, "Нельзя добавить пустую цитату");
    }
});

bot.onText(/\/addrook/, function(msg) {
    var command = msg.text.replace( "@script30sm_bot", "" ),
        chatId = msg.chat.id,
        rook = command.substring(9);
    
    if(rook != ""){
        db.get("rook", "one", {"value": rook})
            .then(function(res){
                if(res) {
                    bot.sendMessage(chatId, "Такой Рукер уже есть");
                }else{
                    db.insert("rook", {"value": rook});
                    bot.sendMessage(chatId, "Рукер добавлен");
                }
            })
    }else{
        bot.sendMessage(chatId, "Пустым Рукер быть не может");
    } 
   
});


// remove from db
bot.onText(/\/delquote/, function(msg) {
    var command = msg.text.replace( "@script30sm_bot", "" ),
        chatId = msg.chat.id,
        quote = command.substring(10);

    db.get("quotes", "one", {"text": quote})
        .then(function(res){
            if(res) {
                db.del("quotes", res);
                bot.sendMessage(chatId, "Цитата удалена");
            }else{
                bot.sendMessage(chatId, "Цитата не найдена");
            }
        })
});

bot.onText(/\/delrook/, function(msg) {
    var command = msg.text.replace( "@script30sm_bot", "" ),
        chatId = msg.chat.id,
        rook = command.substring(9);

    db.get("rook", "one", {"value": rook})
        .then(function(res){
            if(res) {
                db.del("rook", res);
                bot.sendMessage(chatId, "Рукер удален =)");
            }else{
                bot.sendMessage(chatId, "Такой Рукер не найден");
            }
        })
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



// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    if(callbackQuery.id) {
        if (callbackQuery.from.username) log.info(callbackQuery.from.username + ' - start game ');
        else if (callbackQuery.from.first_name) log.info(callbackQuery.from.first_name + ' - start game');
        else log.info(callbackQuery.from.id + ' - start game');
    }
    url = "http://95.183.10.70:8080";
    url = url + "/?userid=" + callbackQuery.from.id;
    bot.answerCallbackQuery(callbackQuery.id, url, true, { url });
});

// Render the HTML game
app.get('/', function requestListener(req, res) {
    console.log('Render the HTML game');
    res.sendFile(path.join(__dirname, 'game/game.html'));
});


app.post('/score', function requestListener(req, res) {
    var userId = req.body.userid,
        score = req.body.score,
        data;

    db.get('game_score', 'one', {"uid": userId})
        .then(function(data){
            if(data){
                data.game_count++;
                if(parseInt(data.best_score) < parseInt(score)) data.best_score = score;
                data.total_score = parseInt(data.total_score) + parseInt(score);
                db.update('game_score', data, {'uid': userId});
            }else{
                var data = {"uid":userId, "game_count": 1, "best_score": parseInt(score), "total_score": parseInt(score)};
                db.insert('game_score', data);
            }
        })

    console.log('score: ', score, userId);
});

// Bind server to port
app.listen(port, function listen() {
    console.log('Bind server to port');
    console.log(`Server is listening at http://localhost:${port}`);
});

