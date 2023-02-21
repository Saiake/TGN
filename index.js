const { Telegraf } = require('telegraf')
const { Worker } = require('node:worker_threads')

function runService(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./ExcelReader.js', { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    })
  })
}

const token = '6034191716:AAEMdbm9eJGn4-0C9r0UzLcZOw7JWqEC4Vw'
const bot = new Telegraf(token, {handlerTimeout: 9_000_000});

bot.start(async (ctx) => {
    console.log('ok')
    runService(
      {
        params: [0,0,0], 
        wanted: [30,30,30]
      }).then(msg => {
        ctx.reply('Send me ')
      })
});

bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.launch();