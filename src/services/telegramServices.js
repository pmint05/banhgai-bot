import request from "request";
require("dotenv").config();
let sendNotification = (recieved_data) => {
	return new Promise((resolve, reject) => {
		try {
			let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
			let TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;
			// if (recieved_data.note === "") {
			// 	recieved_data.note = "<Không có>";
			// }
			// recieved_data.phoneNumber = recieved_data.phoneNumber.replace(
			// 	"'",
			// 	""
			// );
			let phoneNumber = recieved_data.phoneNumber.replace(/['"]+/g, "");
			let data = {
				chat_id: TELEGRAM_GROUP_ID,
				parse_mode: "HTML",
				text: `| -------- Đơn đặt mới -------- |\n| ---------------------------------------- |\n| 0. Tên Facebook: <strong>${recieved_data.username}</strong>\n| 1 .Họ & tên: <strong>${recieved_data.fullName}</strong>\n| 2. Số điện thoại: <strong>${phoneNumber}</strong>\n| 3 .Địa chỉ: <strong>${recieved_data.address}</strong>\n| 4. Loại bánh: <strong>${recieved_data.typeOfCake}</strong>\n| 5 .Số lượng: <strong>${recieved_data.number}</strong>\n| 6. Ghi chú: <strong>${recieved_data.note}</strong>\n| 6. Ghi chú: <strong>${recieved_data.order_number}</strong>\n| ---------------------------------------- |`,
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
