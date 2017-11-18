var isTextMove = false;
var canModifyText = true;
var currentTextWidth = -1;
var commonTopMargin = 0;

var isOwner = false;
var isInput = true;
var img;

var originalmageList = [];
var originalPosInfo = [];
var featureKeyList = [];

var arStatus = "applet";
var isHistory = false;
var clickedHistoryIndex;
var selectedFeatureKey = null;

var resizeX;
var resizeY;

var resizeDivOriginalX;
var resizeDivOriginalY;

var historyListWidth;
var historyListHeight;

var recvUndoList = [];

var featureKeyListStr = "";
var featureKeyCount = 0;

var noticeObjectList = [];
var mediaNoticeList = [];

var lineHeight;

var textAreaClickPosX;
var textAreaClickPosY;
var textAreaPosX;
var textAreaPosY;

var lastAlarmTimestamp = -1;
var lastArStopSystemPopupTimestamp = -1;

var maxStrLen = -1;

var isLive = true;
var isEnableCameraAR = true;

function startArMemo() {
	console.log("startArMemo: " + isOwner)
	if ($("applet").length == 0) {
		alert("AR메모는 영상 수신 중에만 사용 가능합니다.");
		return;
	}

	if (viewer.getSelectedMedia() == false || viewer.getSelectedMedia() == 0) {
		alert("AR메모는 영상 수신 중에만 사용 가능합니다.");
		return;
	}

	if (isOpen) {
		rightNoticeToggle();
	}
	$("#original_sub").remove();
	canvasClear();

	if (isOwner) {
		getLearnableImage();
	} else {
		sendARMemoSetUp(true);
	}
}

function getLearnableImage() {
	console.log(isHistory)
	clearUndoRedo();
	canvasClear();
	if (isHistory) {
		console.log(originalmageList[clickedHistoryIndex]);
		console.log(originalPosInfo[clickedHistoryIndex]);
		console.log(featureKeyList[clickedHistoryIndex]);

		recvUndoList = [];

		img = $(document.createElement("img")).attr({
			"src": originalmageList[clickedHistoryIndex]
		});
		imgCv.drawImage(img[0], 0, 0, canvas.width, canvas.height);

		resizeX = canvas.width / img[0].naturalWidth;
		resizeY = canvas.height / img[0].naturalHeight;

		for (var i = 0; i < originalPosInfo[clickedHistoryIndex].shapes.length; i++) {
			historyDraw(cv, originalPosInfo[clickedHistoryIndex].shapes[i]);
			recvUndoList.push(originalPosInfo[clickedHistoryIndex].shapes[i]);
		}

		if (isOwner) {
			tracking2History();
		}
		history2Applet();
		applet2Canvas();
		isHistory = true;
	} else {
		recvUndoList = null;
		$("#getLearnableImage").addClass("hide");
		var data = viewer.getLearnableImage();
		if (data == false) {
			console.log("false");
			sendARMemoSetUp(false);
			$("#getLearnableImage").removeClass("hide");
			return;
		}
		img = $(document.createElement("img")).attr({
			"src": data
		});
		imgCv.drawImage(img[0], 0, 0, canvas.width, canvas.height);
		if (isOwner) {
			tracking2Applet();
		}
		applet2Canvas();
	}
	resizeXPer = img[0].naturalWidth / canvas.width;
	resizeYPer = img[0].naturalHeight / canvas.height;

	resizeX = canvas.width / img[0].naturalWidth;
	resizeY = canvas.height / img[0].naturalHeight;

	resizeDivOriginalX = canvas.width / img[0].naturalWidth
	resizeDivOriginalY = canvas.height / img[0].naturalHeight

	if (strokeKind == -1) {
		changeStrokeWidth(1);		// 기본 굵기 변경 2 -> 1
	}

	if (fontKind == -1) {
		changeFontSize(1, false);	// 기본 폰트크기 변경 2 -> 1
	}
	//sendARMemoSetUp();
}

function applet2Canvas() {
	console.log("applet2Canvas");
	$("#historyList").html("");
	$("#canvasArea").removeClass("hide");
	$("#myCanvas").removeClass("hide");
	$("#imgCanvas").removeClass("hide");
	$("#historyCanvas").addClass("hide");
	$("applet").addClass("hide");
	$("#arStopBtn").removeClass("hide");
	if (isOpen) {
		$("#sideNoticeCloseBtn").contents().find("body").click();
	}
	$("#controls").addClass("hide");
	$("#drawtools").removeClass("hide");
	arStatus = "canvas";
	isHistory = false;
	isTextMove = false;

	leftTopHide();
}

function playHide(isHide) {
	if (isHide) {
		var isBreak = false;
		$("#arStartBtn").addClass("hide");
		$("#historyArStartBtn").addClass("hide");
		$("#arStartBtn").siblings("div").each(function () {
			if (!isBreak) {
				if (!($(this).hasClass("hide"))) {
					$(this).children("div.btn_line").addClass("hide")
					isBreak = true;
				}
			}
		});
	} else {
		$("#arStartBtn").removeClass("hide");
		$("#historyArStartBtn").removeClass("hide");
		$("#arStartBtn").siblings("div").each(function () {
			$(this).children("div.btn_line").removeClass("hide")
		});
	}
}

function historyHide(isHide) {
	if (isHide) {
		$("div[name=divFunc]").each(function () {
			$(this).addClass("hide");
		})
		$("#arOriginImage").addClass("hide");
	} else {
		$("div[name=divFunc]").each(function () {
			$(this).removeClass("hide");
		})
		$("#arOriginImage").removeClass("hide");
	}
}

function leftTopHide() {
	$("#liveBtnImage").addClass("hide");
	$("#arBtnImage").addClass("hide");
	$("#replayBtnImage").addClass("hide");
}

function leftTopLiveReplayShow() {
	if (isLive) {
		$("#liveBtnImage").removeClass("hide");
	} else {
		$("#replayBtnImage").removeClass("hide");
	}
}

function canvas2Applet() {
	console.log("canvas2Applet");
	// $("#getLearnableImage").removeClass("hide");
	$("applet").removeClass("hide");
	$("#canvasArea").addClass("hide");
	$("#myCanvas").addClass("hide");
	$("#imgCanvas").addClass("hide");
	$("#historyCanvas").addClass("hide");
	$("#historyList").html("");
	canvasClear();
	$("#arStopBtn").addClass("hide");
	$("#controls").removeClass("hide");
	$("#drawtools").addClass("hide");
	arStatus = "applet";
	isHistory = false;

	leftTopLiveReplayShow();
}

function canvas2Tracking() {
	console.log("canvas2Tracking");
	$("#canvasArea").addClass("hide");
	$("#myCanvas").addClass("hide");
	$("#imgCanvas").addClass("hide");
	$("#historyCanvas").addClass("hide");
	$("applet").removeClass("hide");
	canvasClear();
	$("#historyList").html("");
	$("#img").removeClass("hide");
	$("#arStopBtn").removeClass("hide");
	$("#inputImageToggleBtn").removeClass("hide");
	$("#controls").removeClass("hide");
	$("#drawtools").addClass("hide");
	arStatus = "tracking";
	isHistory = false;
	$("#arBtnImage").removeClass("hide");
	leftTopLiveReplayShow();

	changeTooltipText("drawtools");
}
function tracking2Applet() {
	console.log("tracking2Applet");
	$("#getLearnableImage").removeClass("hide");
	$("applet").removeClass("hide");
	$("#arStopBtn").addClass("hide");
	$("#inputImageToggleBtn").addClass("hide");
	$("#historyCanvas").addClass("hide");
	$("#historyList").html("");
	arStatus = "applet";
	isHistory = false;

	changeTooltipText("streaming");
}
function applet2Tracking() {
	console.log("applet2Tracking");
	isInput = true;
	// $("#getLearnableImage").addClass("hide");
	$("#canvasArea").addClass("hide");
	$("#myCanvas").addClass("hide");
	$("#imgCanvas").addClass("hide");
	$("applet").removeClass("hide");
	$("#arStopBtn").removeClass("hide");
	$("#inputImageToggleBtn").removeClass("hide");
	$("#historyCanvas").addClass("hide");
	$("#historyList").html("");
	arStatus = "tracking";
	isHistory = false;
	$("#arBtnImage").removeClass("hide");
	playHide(true);
	
	changeViewOriginBtn(true, 1);

	changeTooltipText("tracking");
}

function applet2History() {
	console.log("applet2History");
	$("#canvasArea").removeClass("hide");
	$("#historyCanvas").removeClass("hide");
	$("applet").addClass("hide");

	$("#controls").addClass("hide");
	$("#original").removeClass("hide")
	isHistory = true;

	leftTopHide();
}

function history2Applet() {
	console.log("history2Applet");
	$("#canvasArea").addClass("hide");
	$("#historyCanvas").addClass("hide");
	$("applet").removeClass("hide");
	$("#historyList").html("");
	$("#controls").removeClass("hide");
	$("#original").addClass("hide");
	arStatus = "applet";
	isHistory = false;

	leftTopLiveReplayShow();

}

function history2Tracking() {
	console.log("history2Tracking");
	$("#canvasArea").addClass("hide");
	$("#historyCanvas").addClass("hide");
	$("applet").removeClass("hide");
	$("#historyList").html("");
	$("#controls").removeClass("hide");
	$("#original").addClass("hide");
	arStatus = "tracking";
	isHistory = false;
	$("#arBtnImage").removeClass("hide");

	leftTopLiveReplayShow();
}

function tracking2History() {
	console.log("tracking2History");
	$("#historyCanvas").removeClass("hide");
	$("#canvasArea").removeClass("hide");
	$("applet").addClass("hide");
	$("#controls").addClass("hide");
	$("#original").removeClass("hide");
	isHistory = true;

	leftTopHide();
}


function startedTracking() {
	applet2Tracking();
	viewer.startInputTrackingImage();
}


function stopTracking(bIsToast) {
	isInput = false;
	viewer.stopTrackingProcess();
	if (isHistory) {
		arStatus = "applet";
	} else {
		tracking2Applet();
	}

	playHide(false);
	// $("#getLearnableImage").removeClass("hide");
	//sendARMemoEnd();
	clearUndoRedo();
	if (bIsToast != false) toastPop("AR 서비스를 종료합니다.");
	isOwner = false;
	$("#arBtnImage").addClass("hide");
}

function toastPop(str) {
	$.toast(str, {
		duration: 3000,
		type: "info",
	});
}

function pushOriginalImage(data) {
	originalmageList.push(data);
}
 
function pushPosInfo(data) {
	var obj = JSON.parse(data);
	originalPosInfo.push(obj);
}

function pushFeatureKeyList(data) {
	featureKeyList.push(data);
}

function clearHistoryData() {
	originalmageList = [];
	originalPosInfo = [];
	featureKeyList = [];
	$(".drop-down").removeClass("on");
}

function initDrawtools() {

	console.log('initDrawtools')
	strokeKind = -1;
	fontKind = -1;

	selectedDrawColor(0, 'rd');
}

function revertApplet() {
	console.log('revertApplet');
	isOwner = false;
	originalmageList = [];
	originalPosInfo = [];
	featureKeyList = [];
	$("#original_sub").remove();
	clearHistoryData();

	canvas2Applet();
	tracking2Applet();
	history2Applet();
	initDrawtools();
	
	isCallHistoryList = false;

	resetToggleInputImageBtn();

	if (isOpen) {
		rightNoticeToggle();
	}
}

function historyDraw(drawCv, posInfo) {
	undoImageInfoList.push(canvas.toDataURL());
	var shape = posInfo;
	var path = shape.path;
	changeStrokeWidth(shape.strokeWidth);
	changeFontSize(shape.strokeWidth, false);
	var color = shape.color.replace("0x", "#");
	posInfoList.push(shape);
	if (shape.type == "rectangle") {
		var x1 = path[0] * resizeX;
		var y1 = path[1] * resizeY;
		var x2 = path[2] * resizeX;
		var y2 = path[3] * resizeY;
		drawCv.beginPath();
		drawCv.strokeStyle = color;
		drawCv.lineWidth = line_width;

		var minX = Math.min(x1, x2);
		var maxX = Math.max(x1, x2);
		var minY = Math.min(y1, y2);
		var maxY = Math.max(y1, y2);

		drawCv.rect(minX, minY, maxX - minX, maxY - minY);
		drawCv.stroke();
	} else if (shape.type == "line") {
		var x1 = path[0] * resizeX;
		var y1 = path[1] * resizeY;
		var x2 = path[2] * resizeX;
		var y2 = path[3] * resizeY;
		drawCv.beginPath();
		drawCv.strokeStyle = color;
		drawCv.moveTo(x1, y1);
		drawCv.lineTo(x2, y2);
		drawCv.lineWidth = line_width;
		drawCv.stroke();
	} else if (shape.type == "arrow") {
		var x1 = path[0] * resizeX;
		var y1 = path[1] * resizeY;
		var x2 = path[2] * resizeX;
		var y2 = path[3] * resizeY;
		drawCv.beginPath();
		drawCv.strokeStyle = color;
		drawCv.moveTo(x1, y1);
		drawCv.lineTo(x2, y2);
		drawCv.lineWidth = line_width;
		drawCv.stroke();
		drawCv.closePath();

		var radius = line_width * 5 / 2;
		// var angle = 30;
		// var angle = 40;
		var anglerad = Math.PI * angle / 180;
		var lineangle = Math.atan2(y2 - y1, x2 - x1);

		drawCv.beginPath();
		drawCv.moveTo(x2, y2);
		drawCv.lineTo(x2 - radius * Math.cos(lineangle - (anglerad / 2.0)), y2 - radius * Math.sin(lineangle - (anglerad / 2.0)));
		drawCv.lineTo(x2 - radius * Math.cos(lineangle + (anglerad / 2.0)), y2 - radius * Math.sin(lineangle + (anglerad / 2.0)));
		drawCv.lineTo(x2, y2);
		drawCv.lineTo(x2 - radius * Math.cos(lineangle - (anglerad / 2.0)), y2 - radius * Math.sin(lineangle - (anglerad / 2.0)));
		drawCv.fillStyle = color;
		drawCv.fill();
		drawCv.stroke();
		drawCv.closePath();
	} else if (shape.type == "pencil") {
		drawCv.strokeStyle = color;
		drawCv.lineWidth = line_width;
		for (var k = 2; k < path.length; k += 2) {
			drawCv.beginPath();
			drawCv.moveTo(path[k - 2] * resizeX, path[k - 1] * resizeY);
			drawCv.lineJoin = "miter";
			drawCv.lineCap = "round";
			drawCv.lineTo(path[k] * resizeX, path[k + 1] * resizeY);
			drawCv.stroke();
			drawCv.closePath();
		}
	} else if (shape.type == "circle") {
		drawCv.beginPath();
		var x1 = path[0] * resizeX;
		var y1 = path[1] * resizeY;
		var x2 = path[2] * resizeX;
		var y2 = path[3] * resizeY;
		var radius = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) / 2;
		drawCv.strokeStyle = color;
		drawCv.arc((x1 + x2) / 2, (y1 + y2) / 2, radius, 0, 2 * Math.PI);
		drawCv.lineWidth = line_width;
		drawCv.stroke();
	} else {
		var x1 = path[0] * resizeX;
		var y1 = path[1] * resizeY;

		drawCv.font = font_size + "px 맑은 고딕";
		drawCv.fillStyle = color;
		var tmpStrList = shape.text.split("\n");
		for (var i = 0; i < tmpStrList.length; i++) {
			var marginX;
			var marginY;
			var marginX = 0;
			var marginY = 0;
			if (fontKind == 1) {
				marginX = 1;
				marginY = 8;
				lineHeight = font_size + 1;
				if (resizeX == 2.5) {
					marginY = marginY - 3;
				}
			} else if (fontKind == 2) {
				marginX = 1;
				marginY = 19;
				lineHeight = font_size + 2;
				if (resizeX == 2.5) {
					marginY = marginY - 3;
				}
			} else {
				marginX = 1;
				marginY = 31;
				lineHeight = font_size + 2;
				if (resizeX == 2.5) {
					marginY = marginY - 3;
				}
			}
			drawCv.fillText(tmpStrList[i], x1 + marginX, y1 + marginY + (i * lineHeight) + commonTopMargin + 40);
		}
	}
}

function resizeApplet(x, y) {
	console.log("resizeApplet: " + x + ", " + y);
	$("canvas").each(function () {
		$(this)[0].width = x;
		$(this)[0].height = y;
		console.log("beforeCanvasSize: " + $(this).width() + ", " + $(this).height());
		$(this).width(x);
		$(this).height(y);
		console.log("afterCanvasSize: " + $(this).width() + ", " + $(this).height());
	});

	historyListHeight = y - (180 + (50 * y / 900));
	historyListWidth = (x - (320 * 3)) / 4;

	// $("div.screen-type2").css("top", ($(window).height() - commonTopMargin) + "px");
}

function setFeatureKeyList(str) {
	featureKeyListStr = str;
}

function setFeatureKeyCount(count) {
	featureKeyCount = count;
}

function sendFeatureKeyInfo() {
	var hisInfo = {
		"AR_CNT": featureKeyCount,
		"FEATURE_KEY_LIST": featureKeyListStr
	};
	console.log(hisInfo);
	sendARMemoHistory(hisInfo);
}

function initHistoryList() {
	originalmageList = [];
	originalPosInfo = [];
	featureKeyList = [];
}

function loadHistoryList() {
	isCallHistoryList = false;
	if (originalmageList.length == 0) {
		toastPop("원본이미지가 존재하지 않습니다");
		isOpenOriginalImageList = false;
		return;
	}

	var iframe = $(document.createElement("iframe")).attr({
		"id": "original_sub",
		"width": "100%",
		"height": "154",
		"frameborder": "0",
		"scrolling": "no",
		"allowTransparency": "false"
	});
	$("body").append(iframe);
	var $head = $("#original_sub").contents().find("head");
	var url = "/stylesheets/viewer/common.css";
	$head.append($("<link/>", { rel: "stylesheet", href: url, type: "text/css" } ));

	var ul = $(document.createElement("ul"));

	for (var i = 0; i < 3; i++) {
		//var index = Math.min(originalmageList.length, originalPosInfo.length) - 1 - i;
		var index = i;
		console.log("index=", index);
		//if (index < 0) break;
		if (Math.min(originalmageList.length, originalPosInfo.length) - 1 < i) break;
		
		var id = "history" + i;

		var tmpCanvas = $("#tmpCanvas")[0];
		var tmpCv = tmpCanvas.getContext("2d");
		var img = $(document.createElement("img")).attr({
			"src": originalmageList[index],
			"width": tmpCanvas.width + "px",
			"height": tmpCanvas.height + "px"
		});

		tmpCv.drawImage(img[0], 0, 0, tmpCanvas.width, tmpCanvas.height);

		if (originalPosInfo[index] != null) {
			var posInfos = originalPosInfo[index].shapes;
			resizeX = tmpCanvas.width / originalPosInfo[index].width;
			resizeY = tmpCanvas.height / originalPosInfo[index].height;

			for (var j = 0; j < posInfos.length; j++) {
				historyDraw(tmpCv, posInfos[j]);
			}
		}

		var lastOrigin = "";
		if (isHistory) {
			if (clickedHistoryIndex == i) lastOrigin = "on";			
		} else {
			if (originalPosInfo.length-1 == i) lastOrigin = "on";
		}

		ul.append(
			$(document.createElement("li")).addClass("cutFrame").addClass(lastOrigin).append(
				$(document.createElement("img")).attr("src", tmpCanvas.toDataURL())
			).attr("historyIndex", i).on("click", function () {
				toggleOriginalImageList();
				var historyCanvas = $("#historyCanvas")[0];
				var historyCv = historyCanvas.getContext("2d");
				historyCv.drawImage($(this).children("img")[0], 0, 0, historyCanvas.width, historyCanvas.height);
				clickedHistoryIndex = $(this).attr("historyIndex");//Math.min(originalmageList.length, originalPosInfo.length) - 1 - ($(this).attr("historyIndex") * 1);
				if (arStatus == "applet") {
					applet2History();
				} else {
					tracking2History();
				}
			})
		);
	}

	var divInIframe = $(document.createElement("div")).addClass("originalCut_layer").attr("id", "originalCut").append(ul);
	$("#original_sub").contents().find("body").append(divInIframe);
}

function getNotice(clickedItem, pCustCtn, pInsertDate) {
	console.log("getNotice. " + clickedItem);
	var streamInfo = {};
	var mediaId;

	var div = $("#leftBtnDiv");

	mediaId = viewer.getSelectedMedia();
	if (mediaId == false) {
		div.css("left", "0px");
		isOpen = false;
		$("#noticeLeftListDiv").css("left", "-200px");
		alert("선택된 영상이 없습니다.");
		return;
	}
	streamInfo = selectStreamingInfo(mediaId);

	var param = {
		"P_CUST_CTN": streamInfo.MOBILE_NUM,
		"P_INSERT_DATE": streamInfo.INSERT_DATE
	}

	$.ajax({
		url:'/SelectNoticeDataOnChannel',
		type:'POST',
		data : param,
		success:function(data){
			console.log("SelectNoticeDataOnChannel")
			mediaNoticeList = [];
			var noticeObject = {};
			for (var i = 0; i < data.length; i++) {
				var noticeInfo = data[data.length - 1 - i];
				if (noticeObject.mediaId == null) {
					noticeObject.mediaId = mediaId;
					noticeObject.noticeList = [];
				}

				var notice = {};
				notice.nSeq = noticeInfo.N_SEQ;
				notice.devNm = noticeInfo.DEV_NM;
				notice.devDeptNm = noticeInfo.DEV_DEPT_NM;
				notice.nTitle = noticeInfo.N_TITLE;
				var tmpContent = noticeInfo.N_CONTENT;
				tmpContent = tmpContent.replaceAll("%<%", ",");
				tmpContent = tmpContent.replaceAll("%--%", "=");
				tmpContent = tmpContent.replaceAll("%7%", "&");
				tmpContent = tmpContent.replaceAll(/\n/g, "<br>");
				notice.nContent = tmpContent;
				notice.writeTime = noticeInfo.WRITE_TIME;
				notice.insertDate = noticeInfo.INSERT_DATE;
				notice.nType = noticeInfo.N_TYPE;
				notice.nReadFlag = noticeInfo.N_READ_FLAG;
				noticeObject.noticeList.push(notice);
				mediaNoticeList.push(notice);
			}

			for (var i = 0; i < noticeObjectList.length; i++) {
				var tmpNotice = noticeObjectList[i];
				if (tmpNotice.mediaId == noticeObject.mediaId) {
					noticeObjectList.splice(i, 1);
				}
			}
			noticeObjectList.push(noticeObject);
			console.log('mediaNoticeList : ', mediaNoticeList);

			for (var i = 0; i < mediaNoticeList.length; i++) {
				if (mediaNoticeList[i].nReadFlag == 0) { 	// 안 읽은 시스템 공지사항
					if (mediaNoticeList[i].nType == 1) { 	// 시스템 공지사항
						var noticeInfo = clone(selectStreamingInfo(viewer.getSelectedMedia()));
						noticeInfo.MOBILE_NUM = mediaNoticeList[i].nSeq;
						noticeInfo.INSERT_DATE = mediaNoticeList[i].insertDate;
						noticeInfo.N_SEQ = '0';
						//console.log("insertNotice : ", noticeInfo);
						insertNotice(noticeInfo, "1", "", "");
					} else {								// 서비스 공지사항
						//console.log("UpdateSystemNotice : ", mediaNoticeList[i].nSeq);
						UpdateSystemNotice(mediaNoticeList[i].nSeq);
					}
				}		
			}
		}
	}).done(function () {
		if (clickedItem == "reload") {
			buildNoticeList();
		} else if (clickedItem == "right") {
			rightNoticeToggle();
		}

		changeNoticeCount(0);
	});
}

function insertNotice(info, nType, title, contents) {

	var content = contents.replaceAll(",", "%<%");
	content = content.replaceAll("=", "%--%");
	content = content.replaceAll("&", "%7%");

	console.log(content)

	var streamInfo;
	if (info == null) {
		streamInfo = selectStreamingInfo(viewer.getSelectedMedia());
	} else {
		streamInfo = info;
	}
	var param = {
		"P_CUST_CTN": streamInfo.MOBILE_NUM,
		"P_INSERT_DATE": streamInfo.INSERT_DATE,
		"DEV_TYPE": "3",
		"DEV_KEY": streamInfo.VIEW_NUM,
		"DEV_INDEX": "0",
		"DEV_NM": getAdminName(),
		"DEV_DEPT_NM": getAdminDeptName(),
		"N_TITLE": title,
		"N_CONTENT": content,
		"N_TYPE": nType,
		"N_SEQ": typeof streamInfo.N_SEQ == "undefined" ? "create" : "fix"
	}

	console.log('insertNotice param : ', param)

	$.ajax({
		url:'/InsertNoticeDataOnChannel',
		type:'POST',
		data : param,
		success:function(data){
			console.log(data)
			if (info == null) {
				console.log('sendNoticeOnChannel');
				sendNoticeOnChannel(data, "INSERT");
				GetPCViewerList(user_id, browser);
			}
		}
	}).done(function () {
		if (info == null) 
			getNotice("reload");
		//else 
		//	changeNoticeCount(0);
		//setNoticeCount();
	});
}

function updateNotice(seq, title, contents) {

	var content = contents.replaceAll(",", "%<%");
	content = content.replaceAll("=", "%--%");
	content = content.replaceAll("&", "%7%");

	console.log(content)

	var streamInfo = selectStreamingInfo(viewer.getSelectedMedia());
	var param = {
		"P_CUST_CTN": streamInfo.MOBILE_NUM,
		"P_INSERT_DATE": streamInfo.INSERT_DATE,
		"N_SEQ": seq,
		"N_TITLE": title,
		"N_CONTENT": content
	}

	console.log(param)

	$.ajax({
		url:'/UpdateNoticeDataOnChannel',
		type:'POST',
		data : param,
		success:function(data){
			console.log(data)
			sendNoticeOnChannel(data, "UPDATE");
		}
	}).done(function () {
		getNotice("reload");
	});
}

function UpdateSystemNotice(seq) {

	var streamInfo = selectStreamingInfo(viewer.getSelectedMedia());
	var param = {
		"P_CUST_CTN" : streamInfo.MOBILE_NUM,
		"P_INSERT_DATE" : streamInfo.INSERT_DATE,
		//"DEV_KEY" : streamInfo.DEV_KEY,
		//"DEV_INDEX" : streamInfo.DEV_INDEX,
		"N_SEQ" : seq
	};

	$.ajax({
		url:'/UpdateSystemNoticeChangeStatus',
		type:'POST',
		data : param,
		success:function(data){
			//changeNoticeCount(0);
			//console.log(data)
			//sendNoticeOnChannel(data);
		}
	})	
}

var noticePopupSeq = 0;
var noticeAlarmRetryCnt = 0;
function noticeAlarm(obj) {
	console.log(obj)
	if (noticeAlarmRetryCnt > 10) {
		console.log("noticeAlarmRetryCnt=" + noticeAlarmRetryCnt);
		return;
	}

	if ($("applet").length == 0) {
		setTimeout(function(){ noticeAlarm(obj) }, 1000);
		noticeAlarmRetryCnt++;
		return;
	}

	if (viewer.getSelectedMedia() == false || viewer.getSelectedMedia() == 0) {
		noticeAlarmRetryCnt++;
		setTimeout(function(){ noticeAlarm(obj) }, 1000);
		return;
	}
	noticeAlarmRetryCnt = 0;

	$("#noticeAlarm").remove();

	// 목록 갱신
	GetPCViewerList(user_id, browser, buildMovieList(false));

	var url;
	var param;
	if (obj.TYPE == 1) { // system
		url = '/getSystemNoticeContent';
		param = {
			"P_CUST_CTN" : obj.SEQ
		}
	} else {			// service
		url = '/getServiceNoticeContent';
		param = {
			"P_CUST_CTN" : obj.MOBILE_NUM,
			"WRITE_TIME" : obj.WRITE_TIME,
			"N_SEQ" : obj.SEQ
		}
	}

	$.ajax({
		url:url,
		type:'POST',
		data : param,
		async : false,
		success:function(data){
			obj.TEXT = data.N_CONTENT;
		}
	})	

	var iframe = $(document.createElement("iframe")).addClass("pop").attr({
		"width": "600",
		"height": "452",
		"frameborder": "0",
		"scrolling": "no",
		"id": "noticeAlarm"
	});

	$("body").append(iframe);

	var $head = $("#noticeAlarm").contents().find("head");
	var url = "/stylesheets/viewer/common.css";
	$head.append($("<link/>", { rel: "stylesheet", href: url, type: "text/css" } ));

	var text = obj.TEXT;
	console.log('noticeAlarm before : ', text);
	text = text.replaceAll("%<%", ",");
	text = text.replaceAll("%--%", "=");
	text = text.replaceAll("%7%", "&");
	text = text.replaceAll(/\n/g, "<br>");
	console.log('noticeAlarm after : ', text);
	
	var divInIframe = $(document.createElement("div")).addClass("pop_com").attr("id", "pop").append(
		$(document.createElement("ul")).append(
			$(document.createElement("li")).addClass("pop_title").append(
				$(document.createElement("span")).text("공지사항")
			).append(
				$(document.createElement("span")).addClass("pop_close").attr("id", "pop_close").on("click", function () {
					removeAlarm();
				})
			)
		).append(
			$(document.createElement("li")).addClass("pop_con").append(
				$(document.createElement("table")).append(
					$(document.createElement("caption")).html("공지사항")
				).append(
					$(document.createElement("colgroup")).append(
						$(document.createElement("col")).css("width", "80px")
					).append(
						$(document.createElement("col")).css("width", "279px")
					).append(
						$(document.createElement("col")).css("width", "50px")
					).append(
						$(document.createElement("col")).css("width", "50px")
					)
				).append(
					$(document.createElement("tbody")).append(
						$(document.createElement("tr")).append(
							$(document.createElement("th")).attr("scope", "col").text("")
						).append(
							$(document.createElement("td")).text(obj.OWNER_NM)
						).append(
							$(document.createElement("th")).attr("scope", "col").text("")
						).append(
							$(document.createElement("td")).text(obj.WRITE_TIME)
						)
					).append(
						$(document.createElement("tr")).append(
							$(document.createElement("td")).attr("colspan", "4").append(
								$(document.createElement("div")).html(text)
							)
						)
					)
				)
			)
		).append(
			$(document.createElement("li")).addClass("pop_btn").append(
				$(document.createElement("button")).addClass("pop_btn_bl100").text("확인").append(
					$(document.createElement("span")).addClass("pop_btn_txt_y").text(" (남은시간 5초)")
				)
			).on("click", function () {
				removeAlarm();
			})
		)
	);
	iframe.contents().find("body").append(divInIframe);
	//TODO: 알람이 왔을 때 자동으로 창이 열려야하는지 확인 후 수정
	if (isOpen) {
		getNotice("reload");
	}
	// else {
	// 	getNotice("right");
	// }

	lastAlarmTimestamp = new Date().getTime();

	setTimeout(function(){ noticeAlarmTimer() }, 100);
}

function removeAlarm() {
	$("#noticeAlarm").remove();
	lastAlarmTimestamp = -1;
}

function noticeAlarmTimer() {
	if (lastAlarmTimestamp == -1) {
		return;
	}
	var time = (5 - Math.ceil((new Date().getTime() - lastAlarmTimestamp) / 1000)) * 1;
	$("#noticeAlarm").contents().find("body").find("span.pop_btn_txt_y").text(" (남은시간 " + time + "초)");
	if (time < 0) {
		removeAlarm();
	} else {
		setTimeout(function(){ noticeAlarmTimer() }, 100);
	}
}

var isOpen = false;
function rightNoticeToggle() {
	if (isOpen) {
		$("#sideNoticeCloseBtn").remove();
		$("#sideNoticeDiv").remove();
		isOpen = false;
	} else {
		buildNoticeList();
	}
}

function recvFromApplet(data) {
	var obj;
	if (data.indexOf("[debug]") == 0) {
		// console.log(data);
		return;
	} else {
		obj = JSON.parse(data);
	}
	var command = obj.COMMAND;
	console.log("recvFromApplet. command=" + command);
	switch (command) {
		case "B212":
			console.log("dataCnt=" + obj.DATA_CNT)
			GetPCViewerList(user_id, browser, function(){
				sendARMemoNotiRes(obj);
			});
			break;
		default:
			console.log(obj);
			break;
	}
}

function arBtnOnOff(on) {
	console.log("arBtnOnOff. " + on);
	// if (on) {
	toastARStatusChangeCamera();
		
	if (isEnableCameraRotation() && isEnableCameraDirection()) {
		// if (isEnableCameraRotation() == true)
		// 	toastPop("발신 카메라의 방향이 원상복구되어 AR메모 서비스를 시작할 수 있습니다.");
		// else
		// 	toastPop("후면 카메라로 전환되어 AR메모 서비스를 시작할 수 있습니다.");		
		//$("#arStopBtn").removeClass("hide");
		//$("#arBtnImage").removeClass("hide");		
		playHide(false);
	} else {
		if (arStatus == "canvas") {
			// if (isEnableCameraRotation() == false)
			// 	toastPop("발신 카메라 영상의 상하반전으로 AR메모 서비스를 시작할 수 없습니다. 영상 화면으로 전환합니다.");
			// else
			// 	toastPop("전면 카메라로 전환되어 AR메모 서비스를 시작할 수 없습니다. 영상 화면으로 전환합니다.");
			cancelArCanvas();
			// $("#arStopBtn").addClass("hide");
			// $("#arBtnImage").addClass("hide");		
			// playHide(true);
		} else if (arStatus == "applet") {
			// if (isEnableCameraRotation() == false)
			// 	toastPop("발신 카메라 영상의 상하반전으로 AR메모 서비스를 시작할 수 없습니다.");
			// else
			// 	toastPop("전면 카메라로 전환되어 AR메모 서비스를 시작할 수 없습니다.");			
			// $("#arStopBtn").addClass("hide");
			// $("#arBtnImage").addClass("hide");		
			// playHide(true);
		}
		$("#arStopBtn").addClass("hide");
		$("#arBtnImage").addClass("hide");		
		playHide(true);
	}

}

function inputTrackingImageOnOff(on) {
	console.log("inputTrackingImageOnOff. " + on);
	toastARStatusChangeCamera();	
		
	//if (on) {
	if (isEnableCameraRotation() && isEnableCameraDirection()) {
		if (arStatus == "tracking") {
			startInputTrackingImage();
			playHide(false);
			$("img.toggleImg").attr("src", "/images/ar_memo_icons/ic_ar_on_1.png");
			$("#arStopBtn").removeClass("hide");
			$("#arBtnImage").removeClass("hide");
			$("#inputImageToggleBtn").removeClass("hide");		
		} else {

		}
	} else {
		if (arStatus == "canvas") {
			cancelArCanvas();
		} else {
		}
		stopInputTrackingImage();

		$("img.toggleImg").attr("src", "/images/ar_memo_icons/ic_ar_off_1.png");
		$("#arStopBtn").addClass("hide");
		$("#inputImageToggleBtn").addClass("hide");		
		$("#arBtnImage").addClass("hide");		
		playHide(true);
	}	
}

function toastARStatusChangeCamera(enable) {

	var msg = "";
	if (isEnableCameraRotation() == false && isEnableCameraDirection() == true) {
		msg += "발신 카메라의 상하반전으로";
	} 

	if (isEnableCameraDirection() == false && isEnableCameraRotation() == true) {
		msg += "발신 카메라의 전면 전환으로";
	}

	if (isEnableCameraRotation() == false && isEnableCameraDirection() == false) {
		if (getCameraChangeType() == CAMERA_CHANGE_ROTATION) {
			msg += "발신 카메라의 상하반전으로";
		} else {
			msg += "발신 카메라의 전면 전환으로";
		}
	}

	if (isEnableCameraRotation() == true && isEnableCameraDirection() == true) {
		if (getCameraChangeType() == CAMERA_CHANGE_ROTATION) {
			msg += "발신 카메라의 원상복구로";
		} else {
			msg += "발신 카메라의 후면 전환으로";
		}
	}

	msg += " AR메모 서비스를";

	if (isEnableCameraRotation() == false || isEnableCameraDirection() == false) {
		if (arStatus == "tracking" && isInput)
			msg += " 일시정지 합니다."
		else
			msg += " 사용할 수 없습니다.";
	} else {
		if (arStatus == "tracking" && !isInput)
			msg += " 사용합니다."
		else
			msg += " 사용할 수 있습니다."
	}

	if (arStatus == "canvas") {
		msg += " 영상화면으로 전환합니다.";
	}

	toastPop(msg);
	console.log(msg);
	// if (enable) {
	// 	toastPop("발신 카메라의 방향이 원상복구되어 AR메모 서비스를 시작할 수 있습니다.");
	// 	toastPop("후면 카메라로 전환되어 AR메모 서비스를 시작할 수 있습니다.");		

	// 	toastPop("발신 카메라의 방향이 원상복구되어 AR메모 서비스를 시작합니다.");
	// 	toastPop("후면 카메라로 전환되어 AR메모 서비스를 시작합니다.");
	// } else {
	// 	toastPop("발신 카메라의 방향이 상하반전되어 AR메모 서비스를 중지합니다..");
	// 	toastPop("전면 카메라로 전환되어 AR메모 서비스를 중지합니다.");
	
	// 	toastPop("발신 카메라 영상의 상하반전으로 AR메모 서비스를 시작할 수 없습니다. 영상 화면으로 전환합니다.");
	// 	toastPop("전면 카메라로 전환되어 AR메모 서비스를 시작할 수 없습니다. 영상 화면으로 전환합니다.");
	
	// }
}


var tmpWidth ;
var tmpHeight;
var tmpLeft;
var tmpTop;
function createTextArea() {
	console.log('mousedown')
	$("#textLayer").remove();
	canModifyText = true;
	tmpWidth = $(window).width() / 2;
	tmpLeft = $(window).width() / 4;
	currentTextWidth = tmpWidth;
	if (strokeKind == 1) {
		// tmpHeight = $(window).height() / 3;
		tmpTop = $(window).height() / 3;
	} else if (strokeKind == 2) {
		// tmpHeight = $(window).height() / 3;
		tmpTop = $(window).height() / 3;
	} else {
		// tmpHeight = $(window).height() / 2;
		tmpTop = $(window).height() / 4;
	}
	tmpHeight = Math.floor(font_size * 10 / 3);
	createdText = true;
	if (fontKind == 1) {
		lineHeight = font_size + 1;
	} else if (fontKind == 2) {
		lineHeight = font_size + 2;
	} else {
		lineHeight = font_size + 2;
	}
	console.log(fontKind)
	console.log(lineHeight)
	var div = $(document.createElement("div")).css({
		"position": "absolute",
		"z-index": 99999,
		"top": tmpTop + "px",
		"left": tmpLeft + "px",
		"width": tmpWidth + "px",
		"height": tmpHeight+ "px",
		"margin": "0px",
		"font-size": font_size + "px",
		"font-family": "맑은 고딕",
		"border": "dotted #000000 1px",
		"color": line_color,
		"line-height": lineHeight + "px"
	}).attr({
		"id": "textLayer"
	}).addClass("layer");
	var textArea = $(document.createElement("textarea")).addClass("textArea layer");
	textArea.css({
		"background-color": "rgba(0,0,0,0.35)",
		"overflow": "hidden",
		"font-size": font_size + "px",
		"font-family": "맑은 고딕",
		"width": tmpWidth + "px",
		"height": tmpHeight+ "px",
		"padding": "0px",
		"border": "0px",
		"color": line_color,
		"word-break": "break-all",
		"line-height": lineHeight + "px"
	}).attr({
		"id": "textArea"
	});

	div.on("keyup", function () {
		$("#textArea").focus();
	});
	
	textArea.on("mousedown", function (e) {
		if (textArea.val().trim() == "") {
			isTextMove = false;
			canModifyText = true;
			$("#textLayer").remove();
			return;
		}
		isTextMove = !isTextMove;
		canModifyText = false;
		textAreaClickPosX = e.pageX;
		textAreaClickPosY = e.pageY;
		console.log(e.pageX)
		console.log(e.pageY)
		textAreaPosX = $("#textArea").offset().left;
		textAreaPosY = $("#textArea").offset().top;
		$(this).focus();
		var test = $(this).val();
		$(this).val("");
		$(this).val(test);

		// if (isTextMove) {
		// 	$("#textLayer").width(tmpWidth);
		// } else {
		// 	if ($("#textLayer").offset().left + $("#textLayer").width() > $("#myCanvas").width()) {
		// 		$("#textLayer").width($("#textLayer").width() - ($("#textLayer").offset().left + $("#textLayer").width() - $("#myCanvas").width()) - 2);
		// 	}
		// }

		var lineCnt = 1;
		maxStrLen = -1;
		cv.font = font_size + "px 맑은 고딕";
		var str = $("#textArea").val();
		var strLen;
		var tmpStr = "";
		var resultStr = "";
		for (var i = 0; i < str.length; i++) {
			if (str[i] == "\n") {
				lineCnt++;
				strLen = cv.measureText(tmpStr).width;
				console.log("########################### " + tmpStr + "   " + strLen);
				if (maxStrLen < strLen) {
					maxStrLen = strLen;
				}
				tmpStr = "";
				resultStr += "\n";
				continue;
			}
			tmpStr += str[i];
			strLen = cv.measureText(tmpStr).width;
			if (strLen >= Math.floor(currentTextWidth)) {
				console.log("##############################################")
				strLen = cv.measureText(tmpStr.substr(0, tmpStr.length - 1)).width;
				tmpStr = tmpStr.substr(tmpStr.length - 1, 1);
				resultStr += "\n";
				lineCnt++;
			}
			resultStr += str[i];
			if (maxStrLen < strLen) {
				maxStrLen = strLen;
			}
			if (strLen >= Math.floor(currentTextWidth)) {
				maxStrLen = strLen;
			}
		}
		// maxStrLen = maxStrLen + 5;
		maxStrLen = maxStrLen;
		console.log(lineCnt)
		console.log(maxStrLen)

		$("#textArea").width(maxStrLen);
		$("#textArea").height(tmpHeight / 3 * lineCnt);
		$("#textLayer").width(maxStrLen);
		$("#textLayer").height(tmpHeight / 3 * lineCnt);

		e.preventDefault();
	});

	var testVal = false;
	textArea.on("keydown", function (e) {
		if (!canModifyText) {
			e.preventDefault();
			return;
		}
		var key = e.keyCode;
		if (key >= 33 && key <= 40) {
			e.preventDefault();
		}

		// Backspace 예외
		if (key == 8) return;

		var str = $("#textArea").val();
		var tmpStr = "";
		var resultStr = "";

		var lineCnt = 1;
		for (var i = 0; i < str.length; i++) {
			if (str[i] == "\n") {
				lineCnt++;
				tmpStr = "";
				continue;
			}
			tmpStr += str[i];
			cv.font = font_size + "px 맑은 고딕";
			// if (cv.measureText(tmpStr).width >= Math.floor(tmpWidth)) {
			if (cv.measureText(tmpStr).width >= Math.floor(currentTextWidth)) {
				tmpStr = tmpStr.substr(tmpStr.length - 1, 1);
				lineCnt++;
				continue;
			}
		}
		if (lineCnt == 3) {
			if (key == 229) {
				tmpStr += "가";
			} else {
				tmpStr += e.char;
			}
			cv.font = font_size + "px 맑은 고딕";
			console.log(tmpStr)
			console.log(cv.measureText(tmpStr).width)
			console.log(tmpWidth)
			// if (cv.measureText(tmpStr).width >= Math.floor(tmpWidth)) {
			if (cv.measureText(tmpStr).width >= Math.floor(currentTextWidth)) {
				$("#textLayer").focus();
				// testVal = true;
				e.preventDefault();
			}
		}
	});

	textArea.on("keyup", function (e) {
		if (!canModifyText) {
			e.preventDefault();
			return;
		}
		var key = e.keyCode;
		if (key >= 33 && key <= 40) {
			e.preventDefault();
		}

		$("div.drop-down2").removeClass("on");

		var str = textArea.val();
		var tmpStr = "";
		var resultStr = "";

		var lineCnt = 1;
		for (var i = 0; i < str.length; i++) {
			if (str[i] == "\n") {
				if (lineCnt >= 3) {
					$(this).val("");
					$(this).val(resultStr);
					lastTestValue = "";
					break;
				}
				lineCnt++;
				tmpStr = "";
				resultStr += "\n";
				continue;
			}
			tmpStr += str[i];
			cv.font = font_size + "px 맑은 고딕";
			// 5는 보정치
			// if (cv.measureText(tmpStr).width >= Math.floor(tmpWidth)) {
			if (cv.measureText(tmpStr).width >= Math.floor(currentTextWidth)) {
				tmpStr = tmpStr.substr(tmpStr.length - 1, 1);
				if (lineCnt >= 3) {
					$(this).val("");
					$(this).val(resultStr);
					lastTestValue = "";
					break;
				}
				lineCnt++;
			}

			if (lineCnt >= 3) {
				if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(str[i])) {
					// if (cv.measureText(tmpStr + "가").width > Math.floor(tmpWidth)) {
					if (cv.measureText(tmpStr + "가").width > Math.floor(currentTextWidth)) {
						$(this).val("");
						$(this).val(resultStr);
						lastTestValue = "";
						$("#textLayer").focus();
						e.preventDefault();
					}
				}
			}

			resultStr += str[i];

		}
	});

	div.append(textArea);
	$("#canvasArea").append(div);
	textArea.focus();
}

function resetToggleInputImageBtn() {
	isInput = true;
	$("#toggleImg").attr("src", "/resources/images/btn_controls_arOn.png");
	$("#toggleImg").siblings("span").text("AR메모 보이기");
}

function cancelArCanvas() {
	console.log("cancelArCanvas: " + isOwner)
	if (isOwner) {
		canvas2Tracking();
	} else {
		canvas2Applet();
		sendARMemoSetUp();
	}
	clearUndoRedo();
	$(".tmpTextArea").remove();
}

function startTracking() {
	if (posInfoList.length == 0) {
		alert("AR메모가 작성되지 않았습니다.");
		return;
	}
	var data = {};
	data.width = img[0].naturalWidth;
	data.height = img[0].naturalHeight;
	data.shapes = posInfoList;
	if (viewer.setPosInfo(data)) {

		if (isOwner) {
			viewer.stopTrackingProcess();
			sendARMemoEnd("request");
		}

		var isNewLearn = false;

		// 신규 학습인지, 재사용인지 판단
		if (recvUndoList == null) {
			isNewLearn = true;
		} else {
			if (recvUndoList.length == posInfoList.length) {
				for (var i = 0; i < recvUndoList.length; i++) {
					var historyPos = recvUndoList[i];
					var newPos = posInfoList[i];
					console.log(historyPos)
					console.log(newPos)
					if (historyPos.color != newPos.color) {
						isNewLearn = true;
						break;
					}
					if (historyPos.type != newPos.type) {
						isNewLearn = true;
						break;
					}
					if (historyPos.path.length != newPos.path.length) {
						isNewLearn = true;
						break;
					}
					for (var j = 0; j < historyPos.path.length; j++) {
						var historyPosPath = historyPos.path[j];
						var newPosPath = newPos.path[j];
						if (historyPosPath != newPosPath) {
							isNewLearn = true;
							break;
						}
					}
					if (isNewLearn) {
						break;
					}
				}
			} else {
				isNewLearn = true;
			}
		}

		// 신규 학습일 경우
		if (isNewLearn) {
			if (isHistory) {
				// 학습시 필요한 이미지를 가져오기 위해서
				isHistory = false;
				viewer.setModifyHistoryData(featureKeyList[clickedHistoryIndex]);
			}

			var result = viewer.learn();
			if (result.RET_CODE == "0000") {
				cv.clearRect(0, 0, canvas.width, canvas.height);
				cv.beginPath();
				posInfoList = [];
				viewer.startTrackingProcess();
				resetToggleInputImageBtn();
				canvas2Tracking();
				clearUndoRedo();
				$(".tmpTextArea").remove();
				sendARMemolearnResult(result, false);
				isOwner = true;
			} else {
				console.log(result.RET_CODE)
				isOwner = false;
			}
		} else {
			// 히스토리 학습일 경우
			console.log("재사용 시나리오!");
			var featureKey = featureKeyList[clickedHistoryIndex];
			if (viewer.startHistoryTracking(featureKey)) {
				canvas2Tracking();
				var tmpArInfo = {};
				tmpArInfo.RET_CODE = "0000";
				tmpArInfo.LEARNING_START_TIME = "0";
				tmpArInfo.LEARNING_END_TIME = "0";
				tmpArInfo.FEATURE_KEY = featureKey;
				console.log("############################# 재사용 featureKey=" + featureKey);
				sendARMemolearnResult(tmpArInfo, true);
				isOwner = true;
			} else {
				console.log("재사용 에러");
				isOwner = false;
			}
		}

		if (isOwner) {
			playHide(false);
			// $("#getLearnableImage").removeClass("hide");
		}
	}
}

function toggleInputImage() {
	if (isInput) {
		stopInputTrackingImage();
		// viewer.stopInputTrackingImage();
		// isInput = false;
		// $("#toggleImg").attr("src", "/resources/images/btn_controls_arOff.png");
		// $("#toggleImg").siblings("span").text("AR메모 감추기");
	} else {
		startInputTrackingImage();
		// viewer.startInputTrackingImage();
		// isInput = true;
		// $("#toggleImg").attr("src", "/resources/images/btn_controls_arOn.png");
		// $("#toggleImg").siblings("span").text("AR메모 보이기");
	}
}

function startInputTrackingImage() {
	viewer.startInputTrackingImage();
	isInput = true;
	$("#toggleImg").attr("src", "/resources/images/btn_controls_arOn.png");
	$("#toggleImg").siblings("span").text("AR메모 보이기");
}

function stopInputTrackingImage() {
	viewer.stopInputTrackingImage();
	isInput = false;
	$("#toggleImg").attr("src", "/resources/images/btn_controls_arOff.png");
	$("#toggleImg").siblings("span").text("AR메모 감추기");
}

function sideNoticeClick() {
	if ($("applet").length == 0) {
		return;
	}
	mediaId = viewer.getSelectedMedia();
	if (mediaId == false) {
		alert("선택된 영상이 없습니다.");
		return;
	}
	getNotice("right");
}

function buildNoticeList() {
	//var canCreateNotice = checkAuth();
	var canCreateNotice = bAuthorityWriteNotice;	
	console.log("checkAuth: ", canCreateNotice);
	// TODO: 테스트용
	if (streamInfoArr.length > 0) {
		if (streamInfoArr[0].VIEW_NUM == "jyongt" || streamInfoArr[0].VIEW_NUM == "chuschus") {
			canCreateNotice = true;
		}
	}

	var sideNoticeDiv;
	var sideNoticeList;
	var sideNoticeCloseDiv;
	var sideNoticeCloseBtn;
	if (isOpen) {
		$("#sideNotice").remove();
		sideNoticeDiv = $("#sideNoticeDiv");
		sideNoticeList = $("#sideNoticeList");
	} else {
		// start 우측 리스트 영역 생성
		sideNoticeDiv = $(document.createElement("div")).css({
			"position": "absolute",
			"right": 0,
			"top": 0,
			// "height": "100%",
			"height": $("body").height() - $("#controls").height() - 10,
			"z-index": 15
		}).attr("id", "sideNoticeDiv");

		sideNoticeList = $(document.createElement("iframe")).css({
			"width": 321,
			"height": $("applet").height(),
			"frameborder": "0",
			"scrolling":" no",
			"allowTransparency": "true"
		}).attr("id", "sideNoticeList");
		// end 우측 리스트 영역 생성

		// start 닫기 버튼
		sideNoticeCloseDiv = $(document.createElement("div")).css({
			"position": "absolute",
			"right": 323,
			"top": $("applet").height() / 2 - 27,
			"width": "31px",
			"height": "59px",
			"z-index": 999
		}).attr("id", "sideNoticeCloseDiv");

		sideNoticeCloseBtn = $(document.createElement("iframe")).css({
			"width": "31px",
			"height": "59px",
			"display": "none"
		}).attr({
			"id": "sideNoticeCloseBtn",
			"frameborder": "0",
			"scrolling":" no",
			"allowTransparency": "true"
		});
		sideNoticeCloseDiv.append(sideNoticeCloseBtn);
		$("body").append(sideNoticeCloseDiv)
		$("#sideNoticeCloseBtn").contents().find("body").on("click", function () {
			rightNoticeToggle();
		});
		var $head = $("#sideNoticeCloseBtn").contents().find("head");
		var url = "/stylesheets/viewer/common.css";
		$head.append($("<link/>", { rel: "stylesheet", href: url, type: "text/css" } ));
		$("#sideNoticeCloseBtn").contents().find("body").append(
			$(document.createElement("div")).addClass("sideCloseBtn").append(
				$(document.createElement("a")).addClass("closebtn").attr("href", "javascript:void(0)").append(
					$(document.createElement("img")).attr("src", "/resources/images/tip_sideLayer_close.png")
				)
			)
		);
		// end 닫기 버튼
	}


	var noticeList = $(document.createElement("div")).addClass("side_con").css("height", $("applet").height() - 65);

	//TODO: 공지사항 출력 개수를 정하는 로직 필요할 듯 - 최신 10개
	var noticeIndex = 0;
	for (var i = mediaNoticeList.length - 1; i >= 0; i--) {
		noticeIndex++;
		if (noticeIndex > 10) {
			break;
		}
		var notice = mediaNoticeList[i];

		var className;
		if (notice.nType == 1)  // 시스템 공지사항
			className = "notice_box";
		else
			className = "svc_notice_box";

		noticeList.append(
			//$(document.createElement("div")).addClass("side_con").append(
				$(document.createElement("div")).addClass(className).append(
					$(document.createElement("ul")).append(
						$(document.createElement("li")).addClass("con01").append(
							$(document.createElement("span")).addClass("fl").text(getTextEllipsis(notice.devNm))
						).append(
							// $(document.createElement("span")).addClass("fr").text(notice.writeTime + " ").append(
							$(document.createElement("span")).addClass("fr").text(notice.writeTime.substring(5, 19) + " ").append(
								(!canCreateNotice && notice.nType == 2) ? $(document.createElement("img")).attr("style", "width: 20px; height: 20px;") : (
									$(document.createElement("img")).attr({
										"src": (notice.nType == 2) ? "/resources/images/tip_notice_edit.png" : "/resources/images/tip_notice_sys.png",
										"noticeSeq": i,
									}).on("click", function () {
										var indexNum = ($(this).attr("noticeSeq") * 1);
										var selectedNotice = mediaNoticeList[indexNum];
										if (selectedNotice.nType == 2) {
											// var indexNum = ($(this).attr("noticeSeq") * 1);
											// var selectedNotice = mediaNoticeList[indexNum];
											// start 공지사항 수정
											// rightNoticeToggle();
											var noticeModifyIframe = $(document.createElement("iframe")).addClass("pop").css({
												"width": 600,
												"height": 392,
												"frameborder": "0",
												"scrolling": " no",
											}).attr("id", "noticeModifyIframe");

											if ($("#noticeModifyIframe").length != 0) {
												$("#noticeModifyIframe").remove();
											}

											$("body").append(noticeModifyIframe);

											var $head = $("#noticeModifyIframe").contents().find("head");
											var url = "/stylesheets/viewer/common.css";
											$head.append($("<link/>", {rel: "stylesheet", href: url, type: "text/css"}));

											var noticeModifyDiv = $(document.createElement("div")).addClass("pop_com").attr("id", "pop").append(
												$(document.createElement("ul")).append(
													$(document.createElement("li")).addClass("pop_title").append(
														$(document.createElement("span")).text("공지사항 - 수정")
													).append(
														$(document.createElement("span")).addClass("pop_close").attr("id", "closePop").on("click", function () {
															$("#noticeModifyIframe").remove();
														})
													)
												).append(
													$(document.createElement("li")).addClass("pop_con").append(																								
														$(document.createElement("textarea")).attr("rows", 10).val(selectedNotice.nContent.replaceAll("<br>", "\n"))
													)
												).append(
													$(document.createElement("li")).addClass("pop_btn").append(
														$(document.createElement("button")).addClass("pop_btn_bl").html("수정").on("click", function () {
															var contents = $(this).parent().siblings("li.pop_con").children("textarea").val();
															if (contents.trim() == "") {
																alert("내용을 입력해 주세요.");
																return;
															}
															updateNotice(selectedNotice.nSeq, "", contents);
															$("#noticeModifyIframe").remove();
														})
													).append(" ").append(
														$(document.createElement("button")).addClass("pop_btn_gr").html("취소").on("click", function () {
															$("#noticeModifyIframe").remove();
														})
													)
												)
											)
											$("#noticeModifyIframe").contents().find("body").append(noticeModifyDiv);
											// end 공지사항 수정
										}
									})
								)
							)
						)
					).append(
						$(document.createElement("li")).addClass("con02").attr("style", "word-break: break-all;").html(notice.nContent)
					)
				)
			//)
		);
	}

	var noticeTmp = $(document.createElement("div")).addClass("sideList").attr("id", "sideNotice");
	sideNoticeDiv.append(sideNoticeList)

	$("body").append(sideNoticeDiv);

	var $head = $("#sideNoticeList").contents().find("head");
	var url = "/stylesheets/viewer/common.css";
	$head.append($("<link/>", { rel: "stylesheet", href: url, type: "text/css" } ));

	if (canCreateNotice) {
		var createNoticeBtn = $(document.createElement("button")).addClass("side_btn_bl100").html("실시간 공지사항 작성")
				
		createNoticeBtn.on("click", function () {
			// start 공지사항 작성
			// rightNoticeToggle();
			var noticeCreateIframe = $(document.createElement("iframe")).addClass("pop").css({
				"width": 600,
				"height": 392,
				"frameborder": "0",
				"scrolling": " no",
			}).attr("id", "noticeCreateIframe");

			if ($("#noticeCreateIframe").length != 0) {
				$("#noticeCreateIframe").remove();
			}

			$("body").append(noticeCreateIframe);

			var $head = $("#noticeCreateIframe").contents().find("head");
			var url = "/stylesheets/viewer/common.css";
			$head.append($("<link/>", {rel: "stylesheet", href: url, type: "text/css"}));

			var noticeCreateDiv = $(document.createElement("div")).addClass("pop_com").attr("id", "pop").append(
				$(document.createElement("ul")).append(
					$(document.createElement("li")).addClass("pop_title").append(
						$(document.createElement("span")).text("공지사항 - 작성")
					).append(
						$(document.createElement("span")).addClass("pop_close").attr("id", "closePop").on("click", function () {
							$("#noticeCreateIframe").remove();
						})
					)
				).append(
					$(document.createElement("li")).addClass("pop_con").append(
						// $(document.createElement("textarea")).attr("rows", 10)
						$(document.createElement("textarea")).attr("style", "height: 200px;")
					)
				).append(
					$(document.createElement("li")).addClass("pop_btn").append(
						$(document.createElement("button")).addClass("pop_btn_bl").html("전달").on("click", function () {
							var contents = $(this).parent().siblings("li.pop_con").children("textarea").val();
							if (contents.trim() == "") {
								alert("내용을 입력해 주세요.");
								return;
							}
							// alert($(this).parent().siblings("li.pop_con").children("textarea").val())
							insertNotice(null, "2", "", contents); // 서비스 공지사항 추가
							$("#noticeCreateIframe").remove();
						})
					).append(" ").append(
						$(document.createElement("button")).addClass("pop_btn_gr").html("취소").on("click", function () {
							$("#noticeCreateIframe").remove();
						})
					)
				)
			);
			$("#noticeCreateIframe").contents().find("body").append(noticeCreateDiv);

			noticeCreateIframe.css("height", $("#noticeCreateIframe").contents().find("#pop").height() + 10);

		});
		// end 공지사항 작성

		noticeList.append(
			$(document.createElement("div")).addClass("side_btn").css("width","100%").append(
				createNoticeBtn
			)
		);
	}

	noticeTmp.append(noticeList)
	$("#sideNoticeList").contents().find("body").append(
		noticeTmp
	)

	$("#sideNoticeCloseBtn").css("display", "")
	isOpen = true;
}

var curStreamInfo;
function createArStopSystemPopup(streamInfo, option) {
	curStreamInfo = streamInfo;
	var iframe = $(document.createElement("iframe")).addClass("pop").attr({
		"width": "400",
		"height": "232",
		"frameborder": "0",
		"scrolling": "no",
		"id": "arStopSystemPopup"
	});

	$("body").append(iframe);

	var $head = $("#arStopSystemPopup").contents().find("head");
	var url = "/stylesheets/viewer/common.css";
	$head.append($("<link/>", { rel: "stylesheet", href: url, type: "text/css" } ));

	var buttonType, stopFun, continueFun;
	if (option.type == "INFORMATION") {
		buttonType = "pop_btn_bl hide";
	} else if (option.type == "QUESTION") {
		buttonType = "pop_btn_bl";
	}
	
	var timer_msg;
	if (option.keep == "forever") {
		timer_msg = "";
	} else {
		timer_msg = "남은시간 " + option.keep + "초";
	}

	var divInIframe = $(document.createElement("div")).addClass("pop_system").attr("id", "pop").append(
		$(document.createElement("ul")).append(
			$(document.createElement("li")).addClass("pop_title").append(
				$(document.createElement("span")).text("서비스")
			).append(
				$(document.createElement("span")).addClass("pop_close").attr("id", "closePop").on("click", option.stop_fun)
			)
		).append(
			$(document.createElement("li")).addClass("pop_con").html(option.message)
		).append(
			$(document.createElement("li")).addClass("pop_btn").append(
				$(document.createElement("button")).addClass(buttonType).text("계속").on("click", option.continue_fun)
			).append(" ").append(
				$(document.createElement("button")).addClass("pop_btn_gr").text(option.stop_val).append(
					$(document.createElement("span")).addClass("pop_btn_txt_y").append(timer_msg)
				).on("click", option.stop_fun)
			)
		)
	);

	$("#arStopSystemPopup").contents().find("body").append(divInIframe);

	self.focus();

	if (option.keep != "forever") {
		lastArStopSystemPopupTimestamp = new Date().getTime();
		if (option.type == "INFORMATION") {
			setTimeout(function(){ removeAlarmPopup(option) }, 100);
		} else if (option.type == "QUESTION") {
			setTimeout(function(){ arStopPopupTimer(option) }, 100);
		}
	}
}

function removeAlarmPopup(option) {
	var time = remainTimeSecond(option);
	
	if (time < 0) {
		removeStopClickAlarmPopup();
	} else {
		setTimeout(function(){ removeAlarmPopup(option) }, 100);
	}
}

function removeStopClickAlarmPopup() {
	$("#arStopSystemPopup").remove();
}

function remainTimeSecond(option) {
	var time = (option.keep - Math.ceil((new Date().getTime() - lastArStopSystemPopupTimestamp) / 1000)) * 1;
	if (time >= 0) {
		$("#arStopSystemPopup").contents().find("body").find("span.pop_btn_txt_y").text(" (남은시간 " + time + "초)");
	}
	
	if (option.stop_timeout) return -1;
	return time;
}

function removeArStopSystemPopup(isStop) {
	if (isStop) {
		stopTracking();
		sendARMemoEnd("response", "Y", curStreamInfo);
	} else {
		sendARMemoEnd("response", "N", curStreamInfo)
	}
	lastArStopSystemPopupTimestamp = -1;
	removeStopClickAlarmPopup();
	//$("#arStopSystemPopup").remove();
}

function arStopPopupTimer(option) {
	if (lastArStopSystemPopupTimestamp == -1) {
		return;
	}
	var time = remainTimeSecond(option);
	console.log(time);
	if (time < 0) {
		if (typeof option.stop_fun == "undefined") {
			removeArStopSystemPopup(true);
		} else {
			if (!option.stop_timeout)
				option.auto_stop_fun();
		}
	} else {
		setTimeout(function(){ arStopPopupTimer(option) }, 100);
	}
}

function clickedStopTracking() {
	if (!confirm("AR 서비스를 종료하시겠습니까?")) {
		return;
	}
	stopTracking();
	sendARMemoEnd("request");
}

var isOpenOriginalImageList = false;
var isCallHistoryList = false;

function toggleOriginalImageList() {
	if (isCallHistoryList) {
		return;
	}
	if (isOpenOriginalImageList) {
		$("#original_sub").remove();
		isOpenOriginalImageList = false;
	} else {
		isCallHistoryList = true;
		viewer.getFeatureKeyList();
		isOpenOriginalImageList = true;
	}
}

function cancelHistory() {
	isOpenHistoryImage = false;
	//if (isEnableCameraAR) playHide(false);
	if (arStatus == "applet") {
		history2Applet();
	} else {
		history2Tracking();
	}
}

function saveHistory(element) {
	var tmp = $(element);
	tmp.prop("disabled", true);
	var historyCanvas = $("#historyCanvas")[0];
	viewer.saveHistoryImage(streamInfo.MOBILE_NUM, historyCanvas.toDataURL());
	toastPop("저장하였습니다.");
	setTimeout(function () {
		tmp.prop("disabled", false);
	}, 5000);
}


var isMovieOpen = false;
function rightMovieToggle() {
	if (isMovieOpen) {
		$("#sideMovieCloseBtn").remove();
		$("#sideMovieDiv").remove();
		isMovieOpen = false;
	} else {
		buildMovieList(true);
	}
}

function sideMovieClick() {
	rightMovieToggle();
}

function buildMovieList(onClickOpen) {
	var sideMovieDiv;
	var sideMovieList;
	var sideMovieCloseDiv;
	var sideMovieCloseBtn;
	if (isMovieOpen) {
		$("#sideMovie").remove();
		sideMovieDiv = $("#sideMovieDiv");
		sideMovieList = $("#sideMovieList");
	} else {
		if (!onClickOpen) {
			return;
		}
		// start 우측 리스트 영역 생성
		sideMovieDiv = $(document.createElement("div")).css({
			"position": "absolute",
			"right": 0,
			"top": 0,
			// "height": "100%",
			"height": $("body").height() - $("#controls").height() - 10,
			"z-index": 15
		}).attr("id", "sideMovieDiv");

		sideMovieList = $(document.createElement("iframe")).css({
			"width": 321,
			"height": $("applet").height(),
			"frameborder": "0",
			"scrolling":" no",
			"allowTransparency": "true"
		}).attr("id", "sideMovieList");
		// end 우측 리스트 영역 생성

		// start 닫기 버튼
		sideMovieCloseDiv = $(document.createElement("div")).css({
			"position": "absolute",
			"right": 323,
			"top": $("applet").height() / 2 - 27,
			"width": "31px",
			"height": "59px",
			"z-index": 999
		}).attr("id", "sideMovieCloseDiv");

		sideMovieCloseBtn = $(document.createElement("iframe")).css({
			"width": "31px",
			"height": "59px",
			"display": "none"
		}).attr({
			"id": "sideMovieCloseBtn",
			"frameborder": "0",
			"scrolling":" no",
			"allowTransparency": "true"
		});
		sideMovieCloseDiv.append(sideMovieCloseBtn);
		$("body").append(sideMovieCloseDiv)
		$("#sideMovieCloseBtn").contents().find("body").on("click", function () {
			rightMovieToggle();
		});
		var $head = $("#sideMovieCloseBtn").contents().find("head");
		var url = "/stylesheets/viewer/common.css";
		$head.append($("<link/>", { rel: "stylesheet", href: url, type: "text/css" } ));
		$("#sideMovieCloseBtn").contents().find("body").append(
			$(document.createElement("div")).addClass("sideCloseBtn").append(
				$(document.createElement("a")).addClass("closebtn").attr("href", "javascript:void(0)").append(
					$(document.createElement("img")).attr("src", "/resources/images/tip_sideLayer_close.png")
				)
			)
		);
		// end 닫기 버튼

		sideMovieDiv.append(sideMovieList)

		$("body").append(sideMovieDiv);


		var $head = $("#sideMovieList").contents().find("head");
		var url = "/stylesheets/viewer/common.css";
		$head.append($("<link/>", { rel: "stylesheet", href: url, type: "text/css" } ));

	}
	var movieTmp = $(document.createElement("div")).addClass("sideList").attr("id", "sidePlay");

	var movieList = $(document.createElement("div")).addClass("side_con");

	for (var i = 0; i < streamInfoArr.length; i++) {
		var movie = streamInfoArr[i];

		// mute 체크
		var soundBtn;
		if (movie.ISMUTING) {
			soundBtn = $(document.createElement("div")).attr({
				"id": "btn_off",
				"style": "padding-top: 6px;"
			}).append(
				$(document.createElement("img")).attr("src", "/resources/images/tip_sound_off.png")
			)
		} else {
			soundBtn = $(document.createElement("div")).attr({
				"id": "btn_on",
				"style": "padding-top: 6px;"
			}).append(
				$(document.createElement("img")).attr("src", "/resources/images/tip_sound_on.png")
			)
		}
		// soundBtn.on("click", function (e) {
		// 	e.preventDefault();
		// 	alert("sound")
		// });

		var service;
		if(movie.ISPLAYING){
			if (isSelectedMedia(movie)) {
				service = $(document.createElement("div")).addClass("fl").append(movie.CUST_NM).attr("style", "color:red");
			} else {
				service= $(document.createElement("div")).addClass("fl").append(movie.CUST_NM).attr("style", "color:#0E9AEF");
			}
		} else {
			service= $(document.createElement("div")).addClass("fl").append(movie.CUST_NM);
		}
		//console.log('service : ', service);
		
		movieList.append(
			$(document.createElement("div")).addClass("play_box").append(
				service
				// $(document.createElement("div")).addClass("fl").append(movie.CUST_NM)
			).append(
				$(document.createElement("div")).addClass("fr").append(
					$(document.createElement("div")).addClass("play_notice_on").append(
						// $(document.createElement("span")).text(movie.NOTICE_COUNT)
						$(document.createElement("span")).text(movie.NOTICE_COUNT)
					)
				).append(soundBtn)
			).attr("movieIndex", i).on("click", function () {
				//TODO: 영상 전환 이벤트
				//var tmp = $(this);
				$(this).prop("disabled", true);
				selectPcListId(browser.name, browser.version, streamInfoArr[$(this).attr("movieIndex")].MOBILE_NUM, streamInfoArr[$(this).attr("movieIndex")].INSERT_DATE, user_id, streamInfoArr[$(this).attr("movieIndex")].VIEW_INDEX, false, false, i);
				setTimeout(function () { $(this).prop("disabled", false);}, 1000);
			})
		);
	}

	// movieList.append(
	// 	$(document.createElement("div")).addClass("play_box").append(
	// 		$(document.createElement("div")).addClass("fl").append("발신영상 이름")
	// 	).append(
	// 		$(document.createElement("div")).addClass("fr").append(
	// 			$(document.createElement("div")).addClass("play_notice_on").append(
	// 				$(document.createElement("span")).text("5")
	// 			)
	// 		).append(" ").append(
	// 			$(document.createElement("div")).addClass("play_sound").attr("id", "playSound").append(
	// 				$(document.createElement("button")).attr({
	// 					"id": "btn_on",
	// 					"style": "padding-top: 6px;"
	// 				}).append(
	// 					$(document.createElement("img")).attr("src", "/resources/images/tip_sound_on.png")
	// 				)
	// 			).append(
	// 				$(document.createElement("button")).addClass("hide").attr({
	// 					"id": "btn_off",
	// 					"style": "padding-top: 6px;"
	// 				}).append(
	// 					$(document.createElement("img")).attr("src", "/resources/images/tip_sound_off.png")
	// 				)
	// 			).append(
	// 				$(document.createElement("input")).addClass("hide").attr("type", "checkbox")
	// 			)
	// 		)
	// 	)
	// );
	//


	movieTmp.append(movieList)

	$("#sideMovieList").contents().find("body").append(
		movieTmp
	)


	$("#sideMovieCloseBtn").css("display", "")
	isMovieOpen = true;
}

// function clickedESC() {
// 	console.log("clickedESC")
// }

// function onResumeViewer() {
// 	console.log("onResumeViewer")
// }

function changeNoticeCount(cnt) {
	$("#sideNoticeBtn").contents().find("p.btnNotice").text(cnt);
}

function changePlayCount(cnt) {
	$("#sideMovieBtn").contents().find("p.btnPlay").text(cnt);
}

function changeTooltipText(status) {
	switch(status) {
		case "streaming" : 
			$("#arStartBtn .tooltiptext").text("AR메모 작성");
			break;
		case "tracking" :
			$("#arStartBtn .tooltiptext").text("AR메모 재시작");
			break;
		case "drawtools" :
			break;
	}
}

function changeViewOriginBtn(isEnable, count) {
	if (isEnable) {
		if (count > 0) {
			$("#viewOrignalBtn").attr("src", "/resources/images/btn_controls_arImg.png");
		} else {
			$("#viewOrignalBtn").attr("src", "/resources/images/btn_controls_arImg_disable.png");
		}
	} else {
		$("#viewOrignalBtn").attr("src", "/resources/images/btn_controls_arImg_disable.png");
	}
}

String.prototype.replaceAll = function(org, dest) {
	return this.split(org).join(dest);
}