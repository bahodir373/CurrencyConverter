module.exports = {
	startOptions: {
		reply_markup: {
			inline_keyboard: [
				[{ text: `Dollar ➡️ So'm`, callback_data: 'usdToUzs' }],
				[{ text: `So'm ➡️ Dollar`, callback_data: 'uzsToUsd' }],
			],
		},
	},
}
