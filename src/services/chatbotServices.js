require("dotenv").config();
import { response } from "express";
import request from "request";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED = "https://i.postimg.cc/rs93Bgqg/avt-remake.png";

let callSendAPI = async (sender_psid, response) => {
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
				console.log("message sent!");
			} else {
				console.error("Unable to send message:" + err);
			}
		}
	);
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
						title: `Xin chào ${username} đã đến với BÁNH GAI BÀ THÚY!🥰`,
						subtitle: "Mời bạn chọn",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "MENU",
								payload: "MENU",
							},
							{
								type: "postback",
								title: "ĐẶT BÁNH",
								payload: "RESERVE",
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

let handleSendMenu = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response1 = getMenuTemplate();

			//send text message
			await callSendAPI(sender_psid, response1);

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
							"Một loại bánh ngọt truyền thống của Việt Nam. Bánh có dạng hình vuông, màu đen màu của Lá Gai, mùi thơm đặc trưng của đỗ xanh và gạo nếp.",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "ĐẶT NGAY",
								payload: "RESERVE_NOW",
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BGAI_INFO",
							},
						],
					},
					{
						title: "Bánh Giò",
						subtitle: "Một loại bánh mặn được làm bằng bột gạo tẻ.",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "ĐẶT NGAY",
								payload: "RESERVE_NOW",
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BGIO_INFO",
							},
						],
					},
					{
						title: "Bánh Rợm",
						subtitle:
							"Một loại bánh truyền thống của người Tày - biểu tượng của sự no đủ và ấm êm.",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "ĐẶT NGAY",
								payload: "RESERVE_NOW",
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BROM_INFO",
							},
						],
					},
					{
						title: "Bánh Khoai",
						subtitle:
							"Một đặc sản Hưng Yên. Có lớp vỏ giòn và mát từ khoai sọ, thêm vị thơm và bùi của nhân đậu xanh.",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "ĐẶT NGAY",
								payload: "RESERVE_NOW",
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BKHOAI_INFO",
							},
						],
					},
					{
						title: "Bánh Gio (Tro)",
						subtitle:
							"Bánh gio, bánh tro, bánh ú tro hay bánh nẳng là một loại bánh được làm với thành phần chính là gạo nếp ngâm qua nước tro",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "ĐẶT NGAY",
								payload: "RESERVE_NOW",
							},
							{
								type: "postback",
								title: "THÔNG TIN CHI TIẾT",
								payload: "BTRO_INFO",
							},
						],
					},
				],
			},
		},
	};
	return response;
};

module.exports = {
	handleGetStarted: handleGetStarted,
	handleSendMenu: handleSendMenu,
};
