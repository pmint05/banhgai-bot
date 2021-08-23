import request from "request";
require("dotenv").config();
let sendNotification = (recieved_data) => {
	return new Promise((resolve, reject) => {
		try {
			let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
			let TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

			let data = {
				chat_id: TELEGRAM_GROUP_ID,
				parse_mode: "HTML",
				text: `| --- Một đơn đặt mới --- |\n| -------------------- |\n| 0.Tên Facebook: <b>${recieved_data.username}</b> |\n| 1.Họ & tên: <b>${recieved_data.fullName}</b> |\n| 2.Số điện thoại: <b>${recieved_data.phoneNumber}</b> |\n| 3.Địa chỉ: <b>${recieved_data.address}</b> |\n| 4.Loại bánh: <b>${recieved_data.typeOfCake}</b> |\n| 5.Số lượng: <b>${recieved_data.number}</b> |\n| 6.Ghi chú: <b>${recieved_data.note}</b> |\n`,
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
