const { Telegraf, Markup, Scenes, session } = require('telegraf')
const { Worker } = require('node:worker_threads')
const fs = require('fs')

const BOSS = 6035751718
const filepath = './src/оплачено.txt'

const payScene = new Scenes.WizardScene(
  'payScene',
  (ctx) => {
    fs.readFile(filepath, function (err, data) {
      if (data.indexOf(ctx.wizard.state.id + '\n') >= 0) {
        ctx.reply('Вы уже оплачивали!')
        return ctx.scene.leave()
      }
      else {
        ctx.reply('📩 Отправьте ссылку по оплате:')
        return ctx.wizard.next();
      }
    });
  },
  (ctx) => {
    if (ctx.message.text.indexOf('https://solscan.io/tx/') == -1) {
      ctx.reply('Упс, кажется вы отправили не ссылку');
      return; 
    }
    bot.telegram.sendMessage(BOSS, ctx.message.text, Markup.inlineKeyboard(
      [
        Markup.button.callback('Подтвердить', ctx.message.chat.id)
      ]))
    ctx.reply('После проверки вы получите доступ к функции 🧢 Подбор одежды', Markup.inlineKeyboard(
      [
        Markup.button.callback('🧢 Подбор одежды', 'clothes')
      ]
    ))
    return ctx.scene.leave()
  }
)

const clothesScene = new Scenes.WizardScene(
  'clothesScene',
  (ctx) => {
    ctx.reply('Введите имя вашего CAThlete')
    ctx.wizard.state = {};
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.name = ctx.message.text
    ctx.replyWithHTML('Введите <b>имеющееся</b> значение силы');
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.power = ctx.message.text
    if (/^\d+$/.test(ctx.wizard.state.power)) {
      ctx.replyWithHTML('Введите <b>имеющееся</b> значение стамины');
      return ctx.wizard.next()
    }
    else {
      return ctx.replyWithHTML('Введите <b>имеющееся</b> значение силы')
    }
  },
  (ctx) => {
    ctx.wizard.state.stamina = ctx.message.text
    if (/^\d+$/.test(ctx.wizard.state.stamina)) {
      ctx.replyWithHTML('Введите <b>имеющееся</b> значение скорости');
      return ctx.wizard.next()
    }
    else {
      return ctx.replyWithHTML('Введите <b>имеющееся</b> значение стамины')
    }
  },
  (ctx) => {
    ctx.wizard.state.speed = ctx.message.text
    if (/^\d+$/.test(ctx.wizard.state.speed)) {
      ctx.replyWithHTML('Введите <b>желаемое</b> значение силы');
      return ctx.wizard.next()
    }
    else {
      return ctx.replyWithHTML('Введите <b>имеющееся</b> значение скорости')
    }
  },
  (ctx) => {
    ctx.wizard.state.wpower = ctx.message.text
    if (/^\d+$/.test(ctx.wizard.state.wpower)) {
      ctx.replyWithHTML('Введите <b>желаемое</b> значение стамины');
      return ctx.wizard.next()
    }
    else {
      return ctx.replyWithHTML('Введите <b>желаемое</b> значение силы')
    }
  },
  (ctx) => {
    ctx.wizard.state.wstamina = ctx.message.text
    if (/^\d+$/.test(ctx.wizard.state.wstamina)) {
      ctx.replyWithHTML('Введите <b>желаемое</b> значение скорости');
      return ctx.wizard.next()
    }
    else {
      return ctx.replyWithHTML('Введите <b>желаемое</b> значение стамины')
    }
  },
  (ctx) => {
    ctx.wizard.state.wspeed = ctx.message.text
    if (/^\d+$/.test(ctx.wizard.state.wspeed)) {
      let params = []
      params.push(ctx.wizard.state.power)
      params.push(ctx.wizard.state.stamina)
      params.push(ctx.wizard.state.speed)
      let wanted = []
      wanted.push(ctx.wizard.state.wpower)
      wanted.push(ctx.wizard.state.wstamina)
      wanted.push(ctx.wizard.state.wspeed)
      ctx.reply('Секундочку, сейчас я подберу Вам варианты...')
      runService(
        {
          params: params, 
          wanted: wanted
        }).then(msg => {
          ctx.reply(ctx.wizard.state.name + ' может надеть на себя:')
          for (let i = 0; i < msg.result.length; i++) {
            let message = ''
            for (let j = 0; j < msg.result[i].length; j++) {
              message = message + msg.result[i][j].get(0) + '-' + 
                        msg.result[i][j].get(1) + '-' + 
                        msg.result[i][j].get(2) + ' ' +
                        msg.result[i][j].get('type') + ' '
            }
            message = message + ' <b>~ Price</b> ' + msg.result[i]['price']
            ctx.replyWithHTML(message)
          }
        })
      return ctx.scene.leave()
    }
    else {
      return ctx.replyWithHTML('Введите <b>желаемое</b> значение скорости')
    }
  }
)

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

bot.start((ctx) => {
  ctx.reply('Send me ',
    Markup.keyboard(
      [
        '📋 Основная информация',
        '📁 Что может бот',
        '🧢 Подбор одежды',
        '😥 Связаться с админом'
      ]).resize()
  )
})

bot.hears(/📋 Основная информация/musg, async (ctx) => {
  await ctx.reply(`Приветствуем, ` + ctx.message.chat.first_name + ` на нашем сервисе WalkenClothes!)
Данный бот был создан, чтобы облегчить вам выбор одежды под ваши конкретные нужды
Если вы хотите разогнать свои статы до определенного значения, то этот бот вам точно подойдет!`)
  await ctx.replyWithPhoto({ source: "./src/картинка.png" })
  await ctx.reply("Чтобы пользоваться ботом, его нужно оплатить.\n\
На данный момент цена месячной подписки составляет 349 wlkn, переводи монеты на данный кошелек и,\n\
как только запрос будет обработан, ты получишь доступ ко всему функционалу\n\
\n\
Адрес оплаты:\n\
`6EqB7B7V7USEpJsthe6bXsbXVxdFt9HgEnruPSaEiRew`\n\
\n\
(Адрес скопируется в буфер при нажатии на него)\n\
\n\
Видео-инструкция по оплате ниже!", { parse_mode: "Markdown" })
  await ctx.replyWithVideo({ source: "./src/Видео.MOV" })
  await ctx.reply(`После оплаты нажмите кнопку оплачено, и отправьте ссылку на оплату в формате:
https://solscan.io/tx/`, Markup.inlineKeyboard(
    [
      Markup.button.callback('Оплачено', 'pay')
    ]
  ))
})

const stage = new Scenes.Stage([payScene, clothesScene]);
bot.use(session());
bot.use(stage.middleware());
stage.register(payScene);
stage.register(clothesScene);

bot.hears(/🧢 Подбор одежды/musg, (ctx) => {
  fs.readFile(filepath, function (err, data) {
    if (data.indexOf(ctx.message.chat.id + '\n') == -1) {
      ctx.reply('Мне нужно ещё немного времени, чтобы проверить оплату')
    }
    else {
      ctx.scene.enter('clothesScene')
    }
  });
})

bot.hears(/🧢 Подбор одежды/musg, (ctx) => {
  ctx.reply(`Вы вводите значения характеристик своего CAThlete (значение силы, стамины и скорости)

Затем вводите значения характеристик, которых вы бы хотели достичь
  
Бот подбирает вам одежду`)
})

bot.hears(/😥 Связаться с админом/musg, (ctx) => {
  ctx.reply('Для связи с админом: ')
})

bot.action('pay', (ctx) => {
  ctx.scene.enter('payScene', {id: ctx.update.callback_query.from.id})
})

bot.action(/^\d+$/, (ctx) => {
  if (ctx.message.from.id == BOSS) {
    fs.appendFileSync('./src/оплачено.txt', ctx.match[0] + '\n');
    ctx.reply('Подтверждаю!')
  }
})

bot.action('clothes', (ctx) => {
  fs.readFile(filepath, function (err, data) {
    if (data.indexOf(ctx.message.chat.id + '\n') == -1) {
      ctx.reply('Мне нужно ещё немного времени, чтобы проверить оплату')
    }
    else {
      ctx.scene.enter('clothesScene')
    }
  });
})

bot.launch();