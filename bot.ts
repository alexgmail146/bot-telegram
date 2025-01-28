import { Telegraf } from 'telegraf';

const bot = new Telegraf('your_bot_token');  // Reemplaza con tu token

bot.start((ctx) => ctx.reply('¡Hola! Soy tu bot.'));
bot.help((ctx) => ctx.reply('En qué puedo ayudarte?'));

bot.on('text', (ctx) => {
    ctx.reply(`Recibí tu mensaje: ${ctx.message.text}`);
});

bot.launch()
    .then(() => {
        console.log('Bot iniciado correctamente');
    })
    .catch((err) => {
        console.error('Error al iniciar el bot:', err);
    });
