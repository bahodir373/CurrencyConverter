const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')
const { startOptions } = require('./options')
require('dotenv').config()

const token = process.env.TOKEN

const bot = new TelegramBot(token, { polling: true })

async function getExchangeRate() {
	try {
		const response = await axios.get(
			'https://api.exchangerate-api.com/v4/latest/USD'
		)
		const usdToUzs = response.data.rates.UZS
		const uzsToUsd = 1 / usdToUzs
		return { usdToUzs, uzsToUsd }
	} catch (error) {
		console.error('Valyuta kursini olishda xatolik:', error)
		return null
	}
}

bot.setMyCommands([
	{
		command: '/start',
		description: 'Botni ishga tushirish',
	},
	{
		command: '/converter',
		description: 'Konvertatsiya qilish',
	},
])

bot.on('message', async msg => {
	const text = msg.text
	const chatId = msg.chat.id

	if (text === '/start') {
		await bot.sendMessage(
			chatId,
			`Assalomu alaykum ${msg.from.first_name}, bizning valyuta kursini hisoblaydigan botimizga xush kelibsiz!`
		)

		return bot.sendMessage(
			chatId,
			`Valyuta kursini hisoblash uchun /converter buyrug'ini ishga tushiring.`
		)
	}

	if (text === '/converter') {
		return bot.sendMessage(chatId, `Amalni tanlang:`, startOptions)
	}
})

bot.on('callback_query', async query => {
	const chatId = query.message.chat.id
	const data = query.data

	const currencies = await getExchangeRate()

	if (!currencies) {
		return bot.sendMessage(
			chatId,
			`Valyuta kursini olishda muammo yuz berdi. Keyinroq urinib ko'ring`
		)
	}

	if (data === 'usdToUzs') {
		bot.sendMessage(chatId, `Dollar miqdorini kiriting:`)

		bot.once('message', msg => {
			const amount = parseFloat(msg.text)
			if (!isNaN(amount)) {
				const converted = (amount * currencies.usdToUzs).toFixed(2)
				bot.sendMessage(chatId, `${amount} Dollar = ${converted} So'm`)
			} else {
				bot.sendMessage(chatId, `Iltimos to'g'ri son kiriting!`)
			}
		})
	}
	if (data === 'uzsToUsd') {
		bot.sendMessage(chatId, `So'm miqdorini kiriting:`)

		bot.once('message', msg => {
			const amount = parseFloat(msg.text)
			if (!isNaN(amount)) {
				const converted = (amount * currencies.uzsToUsd).toFixed(2)
				bot.sendMessage(chatId, `${amount} So'm = ${converted} Dollar`)
			} else {
				bot.sendMessage(chatId, `Iltimos to'g'ri son kiriting!`)
			}
		})
	}
})
