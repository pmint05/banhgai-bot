(function (d, s, id) {
	var js,
		fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {
		return;
	}
	js = d.createElement(s);
	js.id = id;
	js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
	fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "Messenger");
window.extAsyncInit = function () {
	document.querySelector('[name="reserve-form"]').onsubmit = (e) =>
		e.preventDefault();
	// the Messenger Extensions JS SDK is done loading

	MessengerExtensions.getContext(
		"1021596391986821",
		function success(thread_context) {
			// success
			//set psid to input
			$("#psid").val(thread_context.psid);
			handleClickReserveButton();
		},
		function error(err) {
			// error
			console.log("Reserve error:", err);
			let numberInput = document.querySelector("#number");
			numberInput.oninput = () => {
				updateCost();
			};
			$("#type").on("change", () => {
				updateCost();
			});
			let updateCost = () => {
				let price = $("#type option:selected").data("price");
				let total_cost = document.querySelector("#total_cost");
				total_cost.innerHTML = `${
					numberInput.value || 0
				} x ${price}k = ${price * numberInput.value}k`;
				if (numberInput.value != 0) {
					$(".total_cost").addClass("active");
				} else {
					$(".total_cost").removeClass("active");
				}
			};
		}
	);
};
function showErrPopup(text) {
	var errPopup = document.querySelector(".errPopup");
	errPopup.innerHTML = text;
	errPopup.classList.add("show");
	setTimeout(() => {
		errPopup.classList.remove("show");
	}, 1500);
}
//validate inputs
function validateInputFields(event) {
	event.preventDefault();
	let phoneNumber = $("#phoneNumber");
	let address = $("#address");
	let numberOfCake = $("#number");

	if (phoneNumber.val().length != 10) {
		phoneNumber.addClass("is-invalid");
		phoneNumber.focus();
		showErrPopup("Số điện thoại không hợp lệ");
		return true;
	} else {
		phoneNumber.removeClass("is-invalid");
		$(".phoneError").hide();
	}
	if (address.val().length < 5) {
		address.focus();
		address.addClass("is-invalid");
		showErrPopup("Địa chỉ không hợp lệ");
		return true;
	} else {
		address.removeClass("is-invalid");
		$(".addError").hide();
	}
	if (numberOfCake.val() == "") {
		numberOfCake.focus();
		numberOfCake.addClass("is-invalid");
		showErrPopup("Số lượng không hợp lệ");
		return true;
	} else {
		numberOfCake.removeClass("is-invalid");
	}

	return false;
}

function handleClickReserveButton() {
	$("#btnReserve").on("click", function (e) {
		e.preventDefault();
		const uppercaseWords = (str) =>
			str.replace(/^(.)|\s+(.)/g, (c) => c.toUpperCase());
		let check = validateInputFields(e);
		let data = {
			psid: $("#psid").val(),
			fullName: uppercaseWords($("#fullName").val()),
			phoneNumber: $("#phoneNumber").val(),
			address: uppercaseWords($("#address").val()),
			note: $("#note").val().trim(),
			typeOfCake: $("#type option:selected").html().trim(),
			number: $("#number").val(),
		};

		if (!check) {
			//close webview
			MessengerExtensions.requestCloseBrowser(
				function success() {
					// webview closed
				},
				function error(err) {
					// an error occurred
					console.log(err);
				}
			);
			var site = "https://banhgai-bot.herokuapp.com";
			//send data to node.js server
			$.ajax({
				// url: `${window.location.origin}/reserve-info`,
				url: `${site}/reserve-info`,
				method: "POST",
				data: data,
				success: function (data) {
					console.log(data);
				},
				error: function (error) {
					console.log(error);
				},
			});
		}
	});
}
// var Parameter = {
// 	url: "vn.json", //Đường dẫn đến file chứa dữ liệu hoặc api do backend cung cấp
// 	method: "GET", //do backend cung cấp
// 	responseType: "application/json", //kiểu Dữ liệu trả về do backend cung cấp
// };
// //gọi ajax = axios => nó trả về cho chúng ta là một promise
// var promise = axios(Parameter);
// //Xử lý khi request thành công
// promise.then(function (result) {
// 	renderCity(result.data);
// });

// function renderCity(data) {
// 	let districts = document.getElementById("district");
// 	let wards = document.getElementById("ward");
// 	let citis = document.getElementById("city");
// 	for (const x of data) {
// 		citis.options[citis.options.length] = new Option(x.Name, x.Id);
// 	}

// 	// xứ lý khi thay đổi tỉnh thành thì sẽ hiển thị ra quận huyện thuộc tỉnh thành đó
// 	citis.onchange = function () {
// 		district.length = 1;
// 		ward.length = 1;
// 		if (this.value != "") {
// 			const result = data.filter((n) => n.Id === this.value);

// 			for (const k of result[0].Districts) {
// 				district.options[district.options.length] = new Option(
// 					k.Name,
// 					k.Id
// 				);
// 			}
// 		}
// 	};

// 	// xứ lý khi thay đổi quận huyện thì sẽ hiển thị ra phường xã thuộc quận huyện đó
// 	district.onchange = function () {
// 		ward.length = 1;
// 		const dataCity = data.filter((n) => n.Id === citis.value);
// 		if (this.value != "") {
// 			const dataWards = dataCity[0].Districts.filter(
// 				(n) => n.Id === this.value
// 			)[0].Wards;

// 			for (const w of dataWards) {
// 				wards.options[wards.options.length] = new Option(w.Name, w.Id);
// 			}
// 		}
// 	};
// }
jQuery(function ($) {
	// MAD-RIPPLE // (jQ+CSS)
	$(document).on("mousedown", "[data-ripple]", function (e) {
		var $self = $(this);

		if ($self.is(".btn-disabled")) {
			return;
		}
		if ($self.closest("[data-ripple]")) {
			e.stopPropagation();
		}

		var initPos = $self.css("position"),
			offs = $self.offset(),
			x = e.pageX - offs.left,
			y = e.pageY - offs.top,
			dia = Math.min(this.offsetHeight, this.offsetWidth, 100), // start diameter
			$ripple = $("<div/>", { class: "ripple", appendTo: $self });

		if (!initPos || initPos === "static") {
			$self.css({ position: "relative" });
		}

		$("<div/>", {
			class: "rippleWave",
			css: {
				background: $self.data("ripple"),
				width: dia,
				height: dia,
				left: x - dia / 2,
				top: y - dia / 2,
			},
			appendTo: $ripple,
			one: {
				animationend: function () {
					$ripple.remove();
				},
			},
		});
	});
});
