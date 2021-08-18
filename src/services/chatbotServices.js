require("dotenv").config();
import { response } from "express";
import request from "request";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED = "https://i.postimg.cc/rs93Bgqg/avt-remake.png";

let callSendAPI = (sender_psid, response) => {
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
			let response1 = {
				text: `Chào ${username} đã đến với page của mìnk =3`,
			};

			let response2 = sendGetStartedTemplate();

			//send text message
			await callSendAPI(sender_psid, response1);

			//send generic template message
			await callSendAPI(sender_psid, response2);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};

let sendGetStartedTemplate = () => {
	let response = {
		attachment: {
			type: "template",
			payload: {
				template_type: "generic",
				elements: [
					{
						title: "Xin chào bạn đã đến với page của mình!",
						subtitle: "Mời bạn chọn",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "LỰA CHỌN 1",
								payload: "CHOICE_ONE",
							},
							{
								type: "postback",
								title: "LỰA CHỌN 2",
								payload: "CHOICE_TWO",
							},
							{
								type: "postback",
								title: "LỰA CHỌN 3",
								payload: "CHOICE_THREE",
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
};
