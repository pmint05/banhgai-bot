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
		}
	);
};
//validate inputs
// function validateInputFields() {
// 	let phoneNumber = $("#phoneNumber");

// 	if (phoneNumber.val() === "") {
// 		phoneNumber.addClass("is-invalid");
// 		return true;
// 	} else {
// 		phoneNumber.removeClass("is-invalid");
// 	}

// 	return false;
// }

function handleClickReserveButton() {
	$("#btnReserve").on("click", function (e) {
		// let check = validateInputFields();
		let data = {
			psid: $("#psid").val(),
			fullName: $("#full-name").val(),
			phoneNumber: $("#phone-number").val(),
			address: $("#address").val(),
			note: $("#note").val(),
			typeOfCake: $("#type option:selected").text(),
			number: $("#number").val(),
		};

		// if (!check) {
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

		//send data to node.js server
		$.ajax({
			url: `${window.location.origin}/reserve-info`,
			method: "POST",
			data: data,
			success: function (data) {
				console.log(data);
			},
			error: function (error) {
				console.log(error);
			},
		});
		// }
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
