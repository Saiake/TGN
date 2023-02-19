const ExcelReader = require ('./ExcelReader.js')
const { Telegraf } = require('telegraf')

const filename = './sales.xlsx'
ExcelReader.getPrices(filename)
ExcelReader.getData(filename)

const token = '6034191716:AAEMdbm9eJGn4-0C9r0UzLcZOw7JWqEC4Vw'
const bot = new Telegraf(token);

bot.start((ctx) => {
    let obj = new ExcelReader
    obj.canBuy(ExcelReader.mainArray, [0,0,0], [30,30,30])
    ctx.reply('Send me ')
});
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.launch();