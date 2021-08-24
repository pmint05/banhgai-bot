require("dotenv").config();
import { response } from "express";
import request from "request";
const admin = require("firebase-admin");
const serviceAccount = require("../configs/ServiceAccountKey.json");
var otherApp = admin.initializeApp(
	{
		credential: admin.credential.cert(serviceAccount),
		databaseURL:
			"https://banhgai-chatbot-data-default-rtdb.asia-southeast1.firebasedatabase.app/",
	},
	"otherApp"
);
var db = otherApp.database();
let available_BGAI = db.ref().child("available_cakes/banh_gai");
let available_BGIO = db.ref().child("available_cakes/banh_gio");
let available_BROM = db.ref().child("available_cakes/banh_rom");
let available_BKHOAI = db.ref().child("available_cakes/banh_khoai");
let available_BTRO = db.ref().child("available_cakes/banh_tro");
let available_banh_gai;
let available_banh_gio;
let available_banh_rom;
let available_banh_khoai;
let available_banh_tro;

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED = "https://i.postimg.cc/rs93Bgqg/avt-remake.png";

let callSendAPI = async (sender_psid, response) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Construct the message body
			let request_body = {
				recipient: {
					id: sender_psid,
				},
				message: response,
			};
			await sendTypingOn(sender_psid);
			await sendMarkReadMessage(sender_psid);

			// Send the HTTP request to the Messenger Platform
			request(
				{
					uri: "https://graph.facebook.com/v2.6/me/messages",
					qs: { access_token: PAGE_ACCESS_TOKEN },
					method: "POST",
					json: request_body,
				},
				(err, res, body) => {
					if (!err) {
						resolve("message sent!");
					} else {
						console.error("Unable to send message:" + err);
					}
				}
			);
		} catch (error) {
			reject(error);
		}
	});
};
let sendTypingOn = (sender_psid) => {
	// Construct the message body
	let request_body = {
		recipient: {
			id: sender_psid,
		},
		sender_action: "typing_on",
	};

	// Send the HTTP request to the Messenger Platform
	request(
		{
			uri: "https://graph.facebook.com/v2.6/me/messages",
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: "POST",
			json: request_body,
		},
		(err, res, body) => {
			if (!err) {
				console.log("sendTypingOn sent!");
			} else {
				console.error("Unable to send sendTypingOn:" + err);
			}
		}
	);
};
let sendMarkReadMessage = (sender_psid) => {
	// Construct the message body
	let request_body = {
		recipient: {
			id: sender_psid,
		},
		sender_action: "mark_seen",
	};

	// Send the HTTP request to the Messenger Platform
	request(
		{
			uri: "https://graph.facebook.com/v2.6/me/messages",
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: "POST",
			json: request_body,
		},
		(err, res, body) => {
			if (!err) {
				console.log("sendMarkReadMessage sent!");
			} else {
				console.error("Unable to send sendMarkReadMessage:" + err);
			}
		}
	);
};
let getUserName = (sender_psid) => {
	return new Promise((resolve, reject) => {
		// Send the HTTP request to the Messenger Platform
		request(
			{
				uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
				method: "GET",
			},
			(err, res, body) => {
				console.log(body);
				if (!err) {
					body = JSON.parse(body);
					// "first_name": "Peter",
					// "last_name": "Chang",
					let username = `${body.last_name} ${body.first_name}`;
					resolve(username);
				} else {
					console.error("Unable to send message:" + err);
					reject(err);
				}
			}
		);
	});
};
let handleGetStarted = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let username = await getUserName(sender_psid);
			let response = getStartTemplate(username);

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let getStartTemplate = (username) => {
	let response = {
		attachment: {
			type: "template",
			payload: {
				template_type: "generic",
				elements: [
					{
						title: `Chào mừng ${username} đã đến với BÁNH GAI BÀ THÚY!🥰`,
						subtitle: "Mời bạn chọn",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "MENU",
								payload: "MENU",
							},
							{
								type: "web_url",
								url: `${process.env.URL_WEBVIEW_ORDER}`,
								title: "ĐẶT BÁNH",
								webview_height_ratio: "tall",
								messenger_extensions: true,
							},
							{
								type: "postback",
								title: "THÔNG TIN",
								payload: "INFOMATION",
							},
						],
					},
				],
			},
		},
	};
	return response;
};
let getQuickReplyTemplate = () => {
	let response = {
		text: "Nếu bạn là người mới, hãy xem cách page này hoạt động nhé 😉",
		quick_replies: [
			{
				content_type: "text",
				title: "HD sử dụng Bot",
				payload: "USAGE",
			},
			// {
			// 	content_type: "user_phone_number",
			// 	title: "SĐT",
			// 	payload: "PHONE_NUM",
			// },
		],
	};
	return response;
};
let handleSendInfo = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response1 = getInfoTemplate();
			let response2 = getQuickReplyTemplate();

			//send generic template message
			await callSendAPI(sender_psid, response1);
			await callSendAPI(sender_psid, response2);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let getInfoTemplate = () => {
	let response = {
		attachment: {
			type: "template",
			payload: {
				template_type: "button",
				text: "BÁNH GAI BÀ THÚY là thương hiệu của các loại bánh truyền thống như bánh gai, bánh giò, bánh rợm, ...\nVới tuổi đời hơn 10 năm, BÁNH GAI BÀ THÚY cam kết sẽ mang đến những sản phẩm mang đậm chất truyền thống và có chất lượng tốt nhất đến với người tiêu dùng !❤️",
				buttons: [
					{
						type: "phone_number",
						title: "☎️ GỌI NGAY ☎️",
						payload: "+84399514332",
					},
					{
						type: "postback",
						title: "XEM BÁNH SẴN CÓ",
						payload: "AVAILABLE_CAKES",
					},
				],
			},
		},
	};
	return response;
};
let handleSendAvailableCakes = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = getAvailableCakes();

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};

let getAvailableCakes = async () => {
	await available_BGAI.once("value", (snap) => {
		available_banh_gai = snap.val();
	});
	await available_BGIO.once("value", (snap) => {
		available_banh_gio = snap.val();
	});
	await available_BROM.once("value", (snap) => {
		available_banh_rom = snap.val();
	});
	await available_BKHOAI.once("value", (snap) => {
		available_banh_khoai = snap.val();
	});
	await available_BTRO.once("value", (snap) => {
		available_banh_tro = snap.val();
	});
	let response = {
		attachment: {
			type: "template",
			payload: {
				template_type: "button",
				text: `▷ Số bánh sẵn có:\n• Bánh Gai: ${available_banh_gai}\n• Bánh Giò: ${available_banh_gio}\n• Bánh Rợm: ${available_banh_rom}\n• Bánh Khoai: ${available_banh_khoai}\n• Bánh gio: ${available_banh_tro}`,
				buttons: [
					{
						type: "web_url",
						url: `${process.env.URL_WEBVIEW_ORDER}`,
						title: "ĐẶT NGAY",
						webview_height_ratio: "tall",
						messenger_extensions: true,
					},
				],
			},
		},
	};
	return response;
};
let handleSendMenu = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = getMenuTemplate();

			//send text message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let getMenuTemplate = () => {
	let response = {
		attachment: {
			type: "template",
			payload: {
				template_type: "generic",
				elements: [
					{
						title: "Bánh Gai",
						subtitle:
							"5k/cái\nMột loại bánh ngọt truyền thống của Việt Nam. Bánh có màu đen màu của lá Gai, mùi thơm đặc trưng của đỗ xanh và gạo nếp.",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "web_url",
								url: `${process.env.URL_WEBVIEW_ORDER}`,
								title: "ĐẶT NGAY",
								webview_height_ratio: "tall",
								messenger_extensions: true,
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BGAI_DETAILS",
							},
						],
					},
					{
						title: "Bánh Giò",
						subtitle:
							"5k/cái\nBánh được làm bằng bột gạo tẻ, nhân có vị mặn với thịt lọn, mộc nhĩ và hành khô.",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "web_url",
								url: `${process.env.URL_WEBVIEW_ORDER}`,
								title: "ĐẶT NGAY",
								webview_height_ratio: "tall",
								messenger_extensions: true,
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BGIO_DETAILS",
							},
						],
					},
					{
						title: "Bánh Rợm",
						subtitle:
							"5k/cái\nMột loại bánh truyền thống của người Tày - biểu tượng của sự no đủ và ấm êm.",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "web_url",
								url: `${process.env.URL_WEBVIEW_ORDER}`,
								title: "ĐẶT NGAY",
								webview_height_ratio: "tall",
								messenger_extensions: true,
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BROM_DETAILS",
							},
						],
					},
					{
						title: "Bánh Khoai",
						subtitle:
							"6k/cái\nĐặc sản Hưng Yên. Có lớp vỏ giòn và mát từ khoai sọ, thêm vị thơm và bùi của nhân đậu xanh.",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "web_url",
								url: `${process.env.URL_WEBVIEW_ORDER}`,
								title: "ĐẶT NGAY",
								webview_height_ratio: "tall",
								messenger_extensions: true,
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BKHOAI_DETAILS",
							},
						],
					},
					{
						title: "Bánh Gio (Tro)",
						subtitle:
							"5k/cái\nBánh gio, bánh tro, bánh ú tro hay bánh nẳng là một loại bánh được làm với thành phần chính là gạo nếp ngâm qua nước tro",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "web_url",
								url: `${process.env.URL_WEBVIEW_ORDER}`,
								title: "ĐẶT NGAY",
								webview_height_ratio: "tall",
								messenger_extensions: true,
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BTRO_DETAILS",
							},
						],
					},
				],
			},
		},
	};
	return response;
};
let handleSendBgaiDetails = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = {
				text: "▷ Bánh gai là một loại bánh ngọt truyền thống của Việt Nam, bắt nguồn vùng Đồng bằng Bắc bộ ở Việt Nam. Bánh có dạng hình vuông, màu đen màu của lá Gai, mùi thơm đặc trưng của đỗ xanh và gạo nếp.\n▷ Thành phần:\n• Vỏ bánh: Bột gạo nếp, lá cây Gai, đường, vừng.\n• Nhân bánh: Đỗ xanh, cùi dừa nạo nhỏ, đường.\n▷ Hạn sử dụng: 5-7 ngày ở nhiệt độ phòng",
			};

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let handleSendBgioDetails = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = {
				text: "▷ Bánh giò là một món bánh ngon, dễ ăn, được rất nhiều người yêu thích. Món bánh này còn gắn liền với ký ức tuổi thơ của biết bao thế hệ học sinh, sinh viên Việt Nam.\n▷ Thành phần:\n• Vỏ bánh: Bột gạo tẻ.\n• Nhân bánh: Thịt băm, mộc nhĩ, hành khô.\n▷ Hạn sử dụng: Dùng trong ngày.",
			};

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let handleSendBromDetails = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = {
				text: "▷ Bánh rợm của người Tày là thứ bánh vô cùng phổ biến, mộc mạc mà để lại biết bao thương nhớ. Ngày tết, món bánh rợm là biểu tượng của sự no đủ và ấm êm.\n▷ Thành phần:\n• Vỏ bánh: Bột gạo nếp.\n• Nhân bánh: Đỗ xanh, hạt tiêu.\n▷ Hạn sử dụng: Dùng trong ngày.",
			};

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let handleSendBkhoaiDetails = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = {
				text: "▷ Bánh khoai sọ là một đặc sản Hưng Yên được khá nhiều người yêu thích. Với lớp vỏ giòn và mát từ khoai sọ, thêm vị thơm và bùi của nhân đậu xanh khiến cho những chiếc bánh khoai sọ càng được yêu thích hơn và được sử dụng cho bữa sáng.\n▷ Thành phần:\n• Vỏ bánh: Khoai sọ, bột gạo tẻ.\n• Nhân bánh: Đỗ xanh, thịt mỡ, hạt tiêu.\n▷ Hạn sử dụng: Dùng trong ngày.",
			};

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let handleSendBtroDetails = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = {
				text: "▷ Bánh gio, bánh tro, bánh ú tro hay bánh nẳng là một loại bánh được làm với thành phần chính là gạo nếp ngâm qua nước tro (từ tro than lá cây, nhất là lá tre) và gói lá đem luộc chín trong nồi. Bánh gio có xuất xứ từ Quảng Đông, Trung Quốc và có từ thời nhà Minh.\n▷ Thành phần:\n• Phần bánh: Bột gạo nếp, nước gio.\n• Nước chấm: Mật.\n▷ Hạn sử dụng: Dùng trong ngày.",
			};

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let handleSendUsage = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = {
				text: "Page Bánh Gai Bà Thúy hoạt động 1 cách hoàn toàn tự động, bạn không cần nhắn với page bất kì dòng tin nào mà thay vào đó hãy sử dụng những nút đính kèm với tin nhắn từ page hoặc trong menu cố định dưới phần nhập tin nhắn",
			};

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	handleGetStarted: handleGetStarted,
	handleSendMenu: handleSendMenu,
	handleSendInfo: handleSendInfo,
	handleSendBgaiDetails: handleSendBgaiDetails,
	handleSendBgioDetails: handleSendBgioDetails,
	handleSendBromDetails: handleSendBromDetails,
	handleSendBkhoaiDetails: handleSendBkhoaiDetails,
	handleSendBtroDetails: handleSendBtroDetails,
	callSendAPI: callSendAPI,
	getUserName: getUserName,
	handleSendUsage: handleSendUsage,
	handleSendAvailableCakes: handleSendAvailableCakes,
};
