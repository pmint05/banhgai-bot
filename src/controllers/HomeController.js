require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
import request from "request";
import chatbotServices from "../services/chatbotServices";
import telegramServices from "../services/telegramServices";
import moment from "moment";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

let writeDataToGoogleSheet = async (data) => {
	let formatedDate = moment(Date.now())
		.utcOffset("+07:00")
		.format("HH:mm DD/MM/YYYY");
	// Initialize the sheet - doc ID is the long id in the sheets URL
	const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
	// Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
	await doc.useServiceAccountAuth({
		client_email: JSON.parse(`"${GOOGLE_SERVICE_ACCOUNT_EMAIL}"`),
		private_key: JSON.parse(`"${GOOGLE_PRIVATE_KEY}"`),
	});
	await doc.loadInfo(); // loads document properties and worksheets
	const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

	await sheet.addRow({
		"Họ & Tên": data.fullName,
		"Số Điện Thoại": data.phoneNumber,
		"Địa Chỉ": data.address,
		"Loại Bánh": data.typeOfCake,
		"Số Lượng": data.number,
		"Ghi Chú": data.note,
		"Thời Gian": formatedDate,
		"Tên Facebook": data.username,
	});
};
//process.env.NAME_VARIABLES
let getHomePage = (req, res) => {
	return res.render("homepage.ejs");
};
let postWebhook = (req, res) => {
	let body = req.body;

	// Checks this is an event from a page subscription
	if (body.object === "page") {
		// Iterates over each entry - there may be multiple if batched
		body.entry.forEach(function (entry) {
			// Gets the body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);

			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log("Sender PSID: " + sender_psid);

			// Check if the event is a message or postback and
			// pass the event to the appropriate handler function
			if (webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message);
			} else if (webhook_event.postback) {
				handlePostback(sender_psid, webhook_event.postback);
			}
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send("EVENT_RECEIVED");
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
};

let getWebhook = (req, res) => {
	// Your verify token. Should be a random string.
	let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

	// Parse the query params
	let mode = req.query["hub.mode"];
	let token = req.query["hub.verify_token"];
	let challenge = req.query["hub.challenge"];

	// Checks if a token and mode is in the query string of the request
	if (mode && token) {
		// Checks the mode and token sent is correct
		if (mode === "subscribe" && token === VERIFY_TOKEN) {
			// Responds with the challenge token from the request
			console.log("WEBHOOK_VERIFIED");
			res.status(200).send(challenge);
		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
};
// Handles messages events
let handleMessage = async (sender_psid, received_message) => {
	let response;
	//Check quick reply messages
	if (received_message.quick_reply && received_message.quick_reply.payload) {
		if (received_message.quick_reply.payload === "USAGE") {
			await chatbotServices.handleSendUsage(sender_psid);
		}
		return;
	}
	if (received_message.text) {
		// Checks if the message contains text
		// Create the payload for a basic text message, which
		// will be added to the body of our request to the Send API
		let message = received_message.text;

		switch (message) {
			case "Bạn phục vụ loại đồ ăn gì":
				response = {
					attachment: {
						type: "template",
						payload: {
							template_type: "button",
							text: 'Bên mình chuyên cung cấp các loại bánh truyền thống với chất lượng tuyệt hảo là giá cả phải chăng.\nBạn có thể nhấn vào "Menu" để biết các loại bánh mà bên mình cung cấp nhé 😉',
							buttons: [
								{
									type: "postback",
									title: "MENU",
									payload: "MENU",
								},
							],
						},
					},
				};
			case "Tôi có thể xem menu không":
				response = {
					text: "Tất nhiên rồi, menu của bạn đây!",
				};
				await chatbotServices.handleSendMenu(sender_psid);
				break;
			case "Địa điểm kinh doanh của bạn ở đâu":
				response = {
					attachment: {
						type: "template",
						payload: {
							template_type: "button",
							text: 'Địa điểm kinh doanh của chúng tôi: Phổng, Vân Nham, Hữu Lũng, Lạng Sơn. Bạn có thể nhấn vào "THÔNG TIN" để biết thêm các thông tin liên hệ khác của chúng tôi 😉',
							buttons: [
								{
									type: "postback",
									title: "THÔNG TIN",
									payload: "INFOMATION",
								},
							],
						},
					},
				};
				break;
			case "Bạn có giao hàng không":
				response = {
					attachment: {
						type: "template",
						payload: {
							template_type: "button",
							text: "Có, chúng tôi nhận giao hàng tận nhà trong phạm vi xã Vân Nham. Những địa điểm xa hơn chúng tôi sẽ gửi hàng thông qua xe khách !",
							buttons: [
								{
									type: "postback",
									title: "THÔNG TIN",
									payload: "INFOMATION",
								},
							],
						},
					},
				};
				break;

			default:
				let response = {
					text: "Xin lỗi tôi chỉ là robot, tôi không hiểu tin nhắn của bạn. Bạn có thể xem cách tôi hoạt động bằng cách nhấn vào nút dưới đây. Cảm ơn bạn đã ghé thăm BÁNH GAI BÀ THÚY !❤️",
					quick_replies: [
						{
							content_type: "text",
							title: "HD sử dụng Bot",
							payload: "USAGE",
						},
					],
				};
				break;
		}
	} else if (received_message.attachments) {
		// Get the URL of the message attachment
		let attachment_url = received_message.attachments[0].payload.url;
		response = {
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					elements: [
						{
							title: "Is this the right picture?",
							subtitle: "Tap a button to answer.",
							image_url: attachment_url,
							buttons: [
								{
									type: "postback",
									title: "Yes!",
									payload: "yes",
								},
								{
									type: "postback",
									title: "No!",
									payload: "no",
								},
							],
						},
					],
				},
			},
		};
	}

	// Send the response message
	callSendAPI(sender_psid, response);
};
// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
	let response;

	// Get the payload for the postback
	let payload = received_postback.payload;

	// Set the response based on the postback payload
	switch (payload) {
		case "yes":
			response = { text: "Thanks!" };
			break;
		case "no":
			response = { text: "Oops, try sending another image." };
			break;
		case "RESTART_CHATBOT":
		case "GET_STARTED":
			await chatbotServices.handleGetStarted(sender_psid);
			break;
		case "MENU":
			await chatbotServices.handleSendMenu(sender_psid);
			break;
		case "INFOMATION":
			await chatbotServices.handleSendInfo(sender_psid);
			break;
		case "BGAI_DETAILS":
			await chatbotServices.handleSendBgaiDetails(sender_psid);
			break;
		case "BGIO_DETAILS":
			await chatbotServices.handleSendBgioDetails(sender_psid);
			break;
		case "BROM_DETAILS":
			await chatbotServices.handleSendBromDetails(sender_psid);
			break;
		case "BKHOAI_DETAILS":
			await chatbotServices.handleSendBkhoaiDetails(sender_psid);
			break;
		case "BTRO_DETAILS":
			await chatbotServices.handleSendBtroDetails(sender_psid);
			break;
		default:
			response = { text: `Oops, Xin lỗi tôi không hiểu ${payload}` };
	}

	// Send the message to acknowledge the postback
	callSendAPI(sender_psid, response);
}
// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
	// Construct the message body
	let request_body = {
		recipient: {
			id: sender_psid,
		},
		message: response,
	};

	// Send the HTTP request to the Messenger Platform
	request(
		{
			uri: "https://graph.facebook.com/v2.6/me/messages",
			qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
			method: "POST",
			json: request_body,
		},
		(err, res, body) => {
			if (!err) {
				console.log("message sent!");
			} else {
				console.error("Unable to send message:" + err);
			}
		}
	);
}
let setupProfile = async (req, res) => {
	//call profile facebook api
	// Construct the message body
	let request_body = {
		get_started: { payload: "GET_STARTED" },
		whitelisted_domains: [
			"https://banhgaibathuy.herokuapp.com/",
			"https://banhgaibathuy.herokuapp.com/reserve",
		],
	};

	// Send the HTTP request to the Messenger Platform
	await request(
		{
			uri: `https://graph.facebook.com/v11.0/me/messenger_profile`,
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: "POST",
			json: request_body,
		},
		(err, res, body) => {
			console.log(body);
			if (!err) {
				console.log("Setup user profile succeeds!");
			} else {
				console.error("Unable to setup:" + err);
			}
		}
	);

	return res.send("Setup user profile succeeds!");
};
let setupPersistentMenu = async (req, res) => {
	//call profile facebook api
	// Construct the message body
	let request_body = {
		persistent_menu: [
			{
				locale: "default",
				composer_input_disabled: false,
				call_to_actions: [
					{
						type: "web_url",
						title: "Trang cá nhân",
						url: "fb.com/lamthuy.63/",
						webview_height_ratio: "full",
					},
					{
						type: "web_url",
						url: `${process.env.URL_WEBVIEW_ORDER}`,
						title: "Đặt bánh ngay!",
						webview_height_ratio: "tall",
						messenger_extensions: true,
					},
					{
						type: "postback",
						title: "Khởi động lại bot",
						payload: "RESTART_CHATBOT",
					},
				],
			},
		],
	};

	// Send the HTTP request to the Messenger Platform
	await request(
		{
			uri: `https://graph.facebook.com/v11.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: "POST",
			json: request_body,
		},
		(err, res, body) => {
			console.log(body);
			if (!err) {
				console.log("Setup persistent menu succeeds!");
			} else {
				console.error("Unable to setup:" + err);
			}
		}
	);

	return res.send("Setup persistent menu succeeds!");
};
let handleReserve = (req, res) => {
	return res.render("reserve.ejs");
};
let handlePostReserve = async (req, res) => {
	try {
		let username = await chatbotServices.getUserName(req.body.psid);

		//write data to google sheet
		let data = {
			fullName: req.body.fullName,
			phoneNumber: `'${req.body.phoneNumber}`,
			address: req.body.address,
			typeOfCake: req.body.typeOfCake,
			number: req.body.number,
			note: req.body.note,
			username: username,
		};
		await writeDataToGoogleSheet(data);
		await telegramServices.sendNotification(data);
		let name = "";
		if (req.body.fullName === "") {
			name = username;
		} else name = req.body.fullName;
		let numOfCake = req.body.number;
		let cakeType = req.body.typeOfCake;
		let address = req.body.address;
		let note = req.body.note;
		let phoneNumber = req.body.phoneNumber;
		let productImageUrl;
		let price;

		// I demo response with sample text
		// you can check database for customer order's status

		let response1 = {
			text: `---Thông tin khác hàng---
            \nHọ và tên: ${name}
            \nSố điện thoại: ${phoneNumber}
            \nĐịa chỉ: ${address}
            \nLoại bánh: ${cakeType}
            \nSố lượng: ${numOfCake}
            \nGhi chú: ${note}
            `,
		};

		if (cakeType == "Bánh Khoai") {
			price = 6000;
		} else {
			price = 5000;
		}
		let cost = numOfCake * price;
		switch (cakeType) {
			case "Bánh Gai":
				productImageUrl =
					"https://i.postimg.cc/rs93Bgqg/avt-remake.png";
				break;
			case "Bánh Giò":
				productImageUrl =
					"https://i.postimg.cc/rs93Bgqg/avt-remake.png";
				break;
			case "Bánh Rợm":
				productImageUrl =
					"https://i.postimg.cc/rs93Bgqg/avt-remake.png";
				break;
			case "Bánh Khoai":
				productImageUrl =
					"https://i.postimg.cc/rs93Bgqg/avt-remake.png";
				break;
			case "Bánh Gio":
				productImageUrl =
					"https://i.postimg.cc/rs93Bgqg/avt-remake.png";
				break;

			default:
				break;
		}
		let response2 = {
			attachment: {
				type: "template",
				payload: {
					template_type: "receipt",
					recipient_name: name,
					order_number: "12345678902",
					currency: "VND",
					payment_method: "Thanh toán khi nhận hàng",
					order_url: "https://banhgaibathuy.herokuapp.com/",
					timestamp: moment().unix(),
					address: {
						street_1: address,
						street_2: "",
						city: address,
						postal_code: phoneNumber,
						state: address,
						country: "VN",
					},
					summary: {
						subtotal: cost,
						shipping_cost: 0,
						total_tax: 0,
						total_cost: cost,
					},
					adjustments: [],
					elements: [
						{
							title: cakeType,
							subtitle: note,
							quantity: numOfCake,
							price: price,
							currency: "VND",
							image_url: productImageUrl,
						},
					],
				},
			},
		};

		await chatbotServices.callSendAPI(req.body.psid, response1);
		await chatbotServices.callSendAPI(req.body.psid, response2);
		return res.status(200).json({
			message: "ok",
			data: data,
		});
	} catch (e) {
		console.log("err: ", e);
		return res.status(500).json({
			message: "err",
		});
	}
};
module.exports = {
	getHomePage: getHomePage,
	postWebhook: postWebhook,
	getWebhook: getWebhook,
	setupProfile: setupProfile,
	setupPersistentMenu: setupPersistentMenu,
	handleReserve: handleReserve,
	handlePostReserve: handlePostReserve,
};
