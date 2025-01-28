import { Bot, Context } from 'https://deno.land/x/grammy@v1.8.0/mod.ts'; // Importación de Grammy desde Deno.land
import axios from 'https://cdn.skypack.dev/axios'; // Importación de Axios desde Skypack

// Inicialización del bot
const bot = new Bot('7163585362:AAEHCcNdIJb4GC6-s4ECPXRDt3XkFr0qAtg'); // Token de tu bot

// Agregar log para ver si el bot está inicializando
console.log("Bot inicializado correctamente");

// Diccionario con las monedas soportadas
const MONEDAS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  MYRIA: 'myria', // Asegúrate de que este ID sea correcto en CoinGecko
};

// Función para obtener el precio de una moneda
async function obtener_precio(moneda: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${moneda}&vs_currencies=usd`
    );
    if (response.data[moneda]) {
      return `$${response.data[moneda].usd}`;
    } else {
      return 'Moneda no encontrada';
    }
  } catch (error) {
    console.error(error);
    return 'Error al obtener el precio';
  }
}

// Función para obtener el historial de precios de una moneda (últimos 7 días)
async function obtener_historial(moneda: string) {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${moneda}/market_chart?vs_currency=usd&days=7`
    );
    return response.data.prices;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Función para obtener noticias de una moneda
async function obtener_noticias(moneda: string) {
  try {
    const response = await axios.get(
      `https://cryptopanic.com/api/v1/posts/?auth_token=988bef9cd51a15ea8205b645a649a8f743badefe&currencies=${moneda}`
    );
    return response.data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Comando para obtener el precio de una moneda
bot.command('precio', async (ctx: Context) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length > 0 && MONEDAS[args[0].toUpperCase()]) {
    const precio = await obtener_precio(MONEDAS[args[0].toUpperCase()]);
    ctx.reply(`El precio de ${args[0].toUpperCase()} es: ${precio}`);
  } else {
    ctx.reply('Por favor, proporciona una moneda válida.');
  }
});

// Comando para obtener el historial de precios de una moneda (gráfico)
bot.command('grafico', async (ctx: Context) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length > 0 && MONEDAS[args[0].toUpperCase()]) {
    const historial = await obtener_historial(MONEDAS[args[0].toUpperCase()]);
    if (historial) {
      const tiempos = historial.map((item: any) => new Date(item[0]));
      const precios = historial.map((item: any) => item[1]);

      // Crear gráfico
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(800, 600);
      const ctxCanvas = canvas.getContext('2d');
      ctxCanvas.beginPath();
      ctxCanvas.moveTo(tiempos[0].getTime(), precios[0]);

      tiempos.forEach((time: Date, index: number) => {
        ctxCanvas.lineTo(time.getTime(), precios[index]);
      });
      ctxCanvas.stroke();

      // Enviar imagen del gráfico
      const buffer = canvas.toBuffer();
      ctx.replyWithPhoto({ source: buffer });
    } else {
      ctx.reply('No se pudo obtener el historial de precios.');
    }
  } else {
    ctx.reply('Por favor, proporciona una moneda válida.');
  }
});

// Comando para obtener noticias de una moneda
bot.command('noticias', async (ctx: Context) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length > 0 && MONEDAS[args[0].toUpperCase()]) {
    const noticias = await obtener_noticias(MONEDAS[args[0].toUpperCase()]);
    if (noticias.length > 0) {
      let mensaje = 'Últimas noticias:\n';
      noticias.forEach((n: any) => {
        // Generar los enlaces clickeables en formato Markdown
        mensaje += `[${n.title}](${n.url})\n`;
      });
      ctx.reply(mensaje, { parse_mode: 'Markdown' });
    } else {
      ctx.reply('No se encontraron noticias.');
    }
  } else {
    ctx.reply('Por favor, proporciona una moneda válida.');
  }
});

// Comando de prueba para verificar la respuesta del bot
bot.command('ping', (ctx: Context) => {
  ctx.reply('Pong!');
});

// Iniciar el bot
bot.start();
