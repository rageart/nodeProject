var current_mode = "pen";
var modes = ["none", "pen", "line", "circle", "rect", "text", "arrow"];
var colors = ["#FF0000", "#00B0F0", "#FFC000", "#000000", "#FFFFFF", "#00B050"];
var fontSizeList = [40, 50, 60];
var lineSizeList = [4, 7, 10];
var canvas;
var cv;
var imgCanvas;
var imgCv;
var resizeXPer;
var resizeYPer;
var figX = 0;
var figY = 0;
var line_color = "#FF0000";
var line_width = -1;
var font_size = -1;
var strokeKind = -1;
var fontKind = -1;

var angle = 60;

var pointMaxSize = 4000;
var pointMaxMessage = "포인트는 4000개 까지 지정될 수 있습니다.";
var pointCnt = 0;

var posInfoList = [];
var redoPosInfoList = [];
var undoImageInfoList = [];
var redoImageInfoList = [];
var penPathList = [];
var isClick = false;
var createdText = false;
var lastImage;

function changeStrokeWidth(value) {
	console.log("changeStrokeWidth=" + value);
	line_width = Math.floor(lineSizeList[value - 1] * resizeX);
	strokeKind = value;
}

function changeFontSize(value, isCreateTextArea) {
	console.log("changeFontSize=" + value);
	font_size = Math.floor(fontSizeList[value - 1] * resizeX);
	fontKind = value;
	if (isCreateTextArea) {
		createTextArea();
	}
}

function changeMode(btn) {
	console.log("changeMode=" + btn);
	current_mode = modes[btn];
}
function checkMode(event) {
	if (createdText) {
		return;
	}

	pointCnt = 0;
	for (var i = 0; i < posInfoList.length; i++) {
		pointCnt += posInfoList[i].path.length / 2;
	}

	if (pointCnt >= pointMaxSize) {
		alert(pointMaxMessage);
		return;
	}
	lastImage = canvas.toDataURL();

	var x = event.x - canvas.offsetLeft;
	var y = event.y - canvas.offsetTop;

	switch (current_mode) {
		case modes[0]: //"none"
			break;
		case modes[1]: //"pen"
			penPathList = [];
			undoImageInfoList.push(canvas.toDataURL());
			redoPosInfoList = [];
			redoImageInfoList = [];
			cv.beginPath();
			isClick = true;
			figX = x;
			figY = y;
			break;
		case modes[2]: //"line"
			figX = x;
			figY = y;
			isClick = true;
			cv.beginPath();
			cv.moveTo(x, y);
			break;
		case modes[6]: //"arrow"
			figX = x;
			figY = y;
			isClick = true;
			cv.beginPath();
			cv.moveTo(x, y);
			break;
		case modes[3]: //"circle"
			cv.beginPath();
			figX = x;
			figY = y;
			isClick = true;
			break;
		case modes[4]: //"rect"
			cv.beginPath();
			figX = x;
			figY = y;
			isClick = true;
			break;
		case modes[5]: //"text"
			figX = x;
			figY = y;
			break;
	}
}
function completeDrawing(event) {
	if (!isClick && current_mode != "text") return;
	if (createdText) {
		return;
	}
	console.log("completeDrawing");
	isClick = false;
	var x = event.x - canvas.offsetLeft;
	var y = event.y - canvas.offsetTop;

	// 도형의 시작/끝 좌표가 같으면 캔슬
	if (current_mode == "pen") {
		if (penPathList.length == 0) {
			return;
		}
	} else {
		if (figX == x && figY == y) {
			return;
		}
	}

	switch (current_mode) {
		case modes[0]: //"none"
			break;
		case modes[1]: //"pen"
			posInfoList.push({
				"type": "pencil",
				"color": line_color.replace("#", "0x"),
				"strokeWidth": strokeKind,
				"path": penPathList
			});
			redoPosInfoList = [];
			penPathList = [];
			break;
		case modes[2]: //"line"
			loadImage(lastImage);
			getLinePosition(figX, figY, x, y, modes[2]);
			cv.lineTo(x, y);
			cv.lineWidth = line_width;
			cv.strokeStyle = line_color;
			cv.stroke();
			cv.fill();
			cv.closePath();
			break;
		case modes[6]: //"arrow"
			loadImage(lastImage);
			getLinePosition(figX, figY, x, y, modes[6]);
			cv.lineTo(x, y);
			cv.lineWidth = line_width;
			cv.strokeStyle = line_color;
			cv.stroke();
			cv.fill();
			cv.closePath();
			break;
		case modes[3]:  //"circle"
			loadImage(lastImage);
			var radius = Math.sqrt(Math.pow(figX - x, 2) + Math.pow(figY - y, 2)) / 2;
			getCircleAroundPosition(figX, figY, x, y, radius);
			cv.arc((figX + x) / 2, (figY + y) / 2, radius, 0, 2 * Math.PI);
			cv.lineWidth = line_width;
			cv.strokeStyle = line_color;
			cv.stroke();
			cv.closePath();
			break;
		case modes[4]: //"rect"
			if (figX == 0 && figY == 0) {
				break;
			}
			loadImage(lastImage);
			getRectAroundPosition(figX, figY, x, y);
			cv.rect(figX, figY, x - figX, y - figY);
			cv.lineWidth = line_width;
			cv.strokeStyle = line_color;
			cv.stroke();
			cv.closePath();
			break;
		case modes[5]: //"text"
			// createdText = true;
			var text = $(document.createElement("textarea")).addClass("tmpTextArea");

			var startX = (figX > x) ? x : figX;
			var startY = (figY > y) ? y : figY;

			text.attr("style", "z-index:99999; position: absolute; top:" + (startY + $("div.video_big").offset().top * 1) + "px; " +
				"left: " + startX + "px; background-color: transparent; overflow: hidden; font-size: " + font_size + "px; font-family: 맑은 고딕; color: " + line_color);
			$("#cctv").prepend(text);

			text.css("width", Math.abs(figX - x) + "px");
			text.css("height", Math.abs(figY - y) + "px");

			text.focus();

			text.focusout(function () {
				// console.log('focusout');
				if ($(".tmpTextArea").size() == 1) {
					var text = $(".tmpTextArea").val();
					if (text.trim() != "") {

						undoImageInfoList.push(canvas.toDataURL());
						redoPosInfoList = [];
						redoImageInfoList = []

						var offset = $(".tmpTextArea").offset();
						cv.font = font_size + "px 맑은 고딕";
						cv.fillStyle = line_color;
						cv.fillText(text, offset.left + 11, offset.top + 20);

						var yValue = Math.floor((offset.top + commonTopMargin) * resizeYPer);
						if (yValue >= img[0].height) {
							yValue = img[0].height - 1;
						}

						posInfoList.push({
							"type": "text",
							"color": line_color.replace("#", "0x"),
							"strokeWidth": strokeKind,
							"path": [
								Math.floor(offset.left * resizeXPer)
								, Math.floor(offset.top * resizeYPer)
								, Math.floor((offset.left + cv.measureText(text).width) * resizeXPer)
								, Math.floor((offset.top + commonTopMargin) * resizeYPer)
							],
							"text": text
						});
					}
					$(".tmpTextArea").remove();
					return;
				}
			});
			break;
		default:
			alert('mode 오류가 발생했습니다.');
			break;
	}

	//TODO: 차후 posInfoList 제거 로직 필요
	// 4000 체크
	pointCnt = 0;
	for (var i = 0; i < posInfoList.length; i++) {
		pointCnt += posInfoList[i].path.length / 2;
	}
	console.log("pointCnt=" + pointCnt);

	if (pointCnt > pointMaxSize) {
		alert(pointMaxMessage);
		undo();
	}
}

function penDrag(event) {
	if (isClick) {

		var x = event.x - canvas.offsetLeft;
		var y = event.y - canvas.offsetTop;

		if ("pen" == current_mode) {
			if (pointCnt + penPathList.length / 2 >= pointMaxSize) {
				return;
			}
			cv.beginPath();

			var resizeX = Math.floor(x * resizeXPer);
			var resizeY = Math.floor(y * resizeYPer);

			if (penPathList.length == 0) {
				penPathList.push(Math.floor(figX * resizeXPer));
				penPathList.push(Math.floor(figY * resizeYPer));
			}
			penPathList.push(resizeX);
			penPathList.push(resizeY);

			cv.lineJoin = "miter";
			cv.lineCap  = "round";
			cv.moveTo(figX, figY);
			cv.lineTo(x, y);
			cv.lineWidth = line_width;
			cv.strokeStyle = line_color;
			cv.stroke();
			cv.closePath();
			figX = x;
			figY = y;
		} else {
			loadImage(lastImage);

			cv.beginPath();

			switch (current_mode) {
				case modes[2]: //"line"
					cv.moveTo(figX, figY);
					cv.lineTo(x, y);
					cv.lineWidth = line_width;
					cv.strokeStyle = line_color;
					cv.stroke();
					cv.closePath();

					cv.moveTo(figX, figY);
					break;
				case modes[6]: //"arrow"
					cv.moveTo(figX, figY);
					cv.lineTo(x, y);
					cv.lineWidth = line_width;
					cv.strokeStyle = line_color;
					cv.stroke();
					cv.closePath();

					cv.beginPath();
					cv.moveTo(x, y);
					var radius = line_width * 5 / 2;

					var anglerad = Math.PI * angle / 180;
					var lineangle = Math.atan2(y - figY, x - figX);

					cv.lineTo(x - radius * Math.cos(lineangle - (anglerad / 2.0)), y - radius * Math.sin(lineangle - (anglerad / 2.0)));
					cv.lineTo(x - radius * Math.cos(lineangle + (anglerad / 2.0)), y - radius * Math.sin(lineangle + (anglerad / 2.0)));
					cv.lineTo(x, y);
					cv.lineTo(x - radius * Math.cos(lineangle - (anglerad / 2.0)), y - radius * Math.sin(lineangle - (anglerad / 2.0)));
					cv.fillStyle = line_color;
					cv.fill();
					cv.stroke();
					cv.closePath();

					cv.moveTo(figX, figY);
					break;
				case modes[3]:  //"circle"
					var radius = Math.sqrt(Math.pow(figX - x, 2) + Math.pow(figY - y, 2)) / 2;
					// getCircleAroundPosition(figX, figY, x, y, radius);
					cv.arc((figX + x) / 2, (figY + y) / 2, radius, 0, 2 * Math.PI);
					cv.lineWidth = line_width;
					cv.strokeStyle = line_color;
					cv.stroke();
					cv.closePath();
					break;
				case modes[4]: //"rect"
					if (figX == 0 && figY == 0) {
						break;
					}
					cv.rect(figX, figY, x - figX, y - figY);
					console.log(x - figX)
					console.log(y - figY)
					cv.lineWidth = line_width;
					cv.strokeStyle = line_color;
					cv.stroke();
					cv.closePath();
					break;
				case modes[5]: //"text"
					break;
				default:
					break;
			}
		}
	}
}

function getLinePosition(x1, y1, x2, y2, type) {
	var posList = [];
	var path = [];
	posList.push({
		"x": Math.floor(x1 * resizeXPer),
		"y": Math.floor(y1 * resizeYPer)
	});
	posList.push({
		"x": Math.floor(x2 * resizeXPer),
		"y": Math.floor(y2 * resizeYPer)
	});

	path.push(Math.floor(x1 * resizeXPer));
	path.push(Math.floor(y1 * resizeYPer));
	path.push(Math.floor(x2 * resizeXPer));
	path.push(Math.floor(y2 * resizeYPer));

	posInfoList.push({
		"type": type,
		"color": line_color.replace("#", "0x"),
		"strokeWidth": strokeKind,
		"path": path
	});
	undoImageInfoList.push(canvas.toDataURL());
	redoPosInfoList = [];
	redoImageInfoList = []
}

function getCircleAroundPosition(x1, y1, x2, y2, radius) {
	var path = [];

	path.push(Math.floor(x1 * resizeXPer));
	path.push(Math.floor(y1 * resizeYPer));
	path.push(Math.floor(x2 * resizeXPer));
	path.push(Math.floor(y2 * resizeYPer));
	posInfoList.push({
		"type": "circle",
		"color": line_color.replace("#", "0x"),
		"strokeWidth": strokeKind,
		"path": path
	});
	undoImageInfoList.push(canvas.toDataURL());
	redoPosInfoList = [];
	redoImageInfoList = []
}

function getRectAroundPosition(x1, y1, x2, y2) {
	var posList = [];
	var path = [];
	path.push(Math.floor(x1 * resizeXPer));
	path.push(Math.floor(y1 * resizeYPer));
	path.push(Math.floor(x2 * resizeXPer));
	path.push(Math.floor(y2 * resizeYPer));
	posList.push({
		"x": Math.floor(x1 * resizeXPer),
		"y": Math.floor(y1 * resizeYPer)
	});
	posList.push({
		"x": Math.floor(x1 * resizeXPer),
		"y": Math.floor(y2 * resizeYPer)
	});
	posList.push({
		"x": Math.floor(x2 * resizeXPer),
		"y": Math.floor(y2 * resizeYPer)
	});
	posList.push({
		"x": Math.floor(x2 * resizeXPer),
		"y": Math.floor(y1 * resizeYPer)
	});

	posInfoList.push({
		"type": "rectangle" ,
		"color": line_color.replace("#", "0x"),
		"strokeWidth": strokeKind,
		"path": path
	});
	undoImageInfoList.push(canvas.toDataURL());
	redoPosInfoList = [];
	redoImageInfoList = []
}

function undo() {
	var data = undoImageInfoList.pop();
	if (data == undefined) {
		console.log("undo() null");
		return;
	}
	redoImageInfoList.push(canvas.toDataURL());
	redoPosInfoList.push(posInfoList.pop());

	loadImage(data);
}

function redo() {
	var data = redoImageInfoList.pop();
	if (data == undefined) {
		console.log("redo() null");
		return;
	}
	undoImageInfoList.push(canvas.toDataURL());
	posInfoList.push(redoPosInfoList.pop());

	loadImage(data);
}

function changeColor(colorIndex) {
	line_color = colors[colorIndex];
}

Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};

function clearUndoRedo() {
	posInfoList = [];
	redoPosInfoList = [];
	undoImageInfoList = [];
	redoImageInfoList = [];
	penPathList = [];
}

function loadImage(image) {
	var img = $(document.createElement("img")).attr({
		"src": image
	});
	cv.clearRect(0, 0, canvas.width, canvas.height);
	cv.drawImage(img[0], 0, 0, canvas.width, canvas.height);
}

function canvasClear() {
	cv.clearRect(0, 0, canvas.width, canvas.height);
}
