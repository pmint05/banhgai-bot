import request from "request";
require("dotenv").config();
let sendNotification = () => {
	return new Promise((resolve, reject) => {
		try {
			let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
			let TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

			let data = {
				chat_id: TELEGRAM_GROUP_ID,
				parse_mode: "HTML",
				text: "<b>Hello</b>",
			};
			// https://api.telegram.org/bot1954437611:AAHpub5JP2ksiT-S-NHZSodOfWq-4nll3Us/sendMessage?chat_id=-1001514909519&text=welcome
			request(
				{
					url: `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
					method: "POST",
					json: data,
				},
				(err, res, body) => {
					if (!err) {
						resolve("done");
					} else {
						console.log(err);
						reject(err);
					}
				}
			);
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	sendNotification: sendNotification,
};
