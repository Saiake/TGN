const ExcelReader = require ('./ExcelReader.js')
const { Telegraf } = require('telegraf')

const filename = './sales.xlsx'
ExcelReader.getPrices(filename)
ExcelReader.getData(filename)

const token = '6034191716:AAEMdbm9eJGn4-0C9r0UzLcZOw7JWqEC4Vw'
const bot = new Telegraf(token);

bot.start(async (ctx) => {
    let obj = new ExcelReader
    await obj.canBuy(ExcelReader.mainArray, [0,0,0], [20,20,20])
    await ctx.reply('Send me ')
});
bot.help(async (ctx) => await ctx.reply('Send me a sticker'));
bot.on('sticker', async (ctx) => await ctx.reply('👍'));
bot.hears('hi', async (ctx) => await ctx.reply('Hey there'));

bot.launch();