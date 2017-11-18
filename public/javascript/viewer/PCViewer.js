var APPLET_ID_MAPP = [];
var javaDeploy = null;
var retryCnt = 0;
var isRetry = false;

// -----------------------------------------------------------------------------
// PCViewer Applet 관련 Logic Function
// -----------------------------------------------------------------------------
/**
 * PCViewer Viewer 를 초기화하기 위한 생성자.
 * 
 * @param uboxId
 */
function PCViewer(parameters, target, onLoad, onError) {
	// console.log("retryCnt=" + retryCnt);

	var elementId = parameters['id'];

	var appletTag = null;

	this.getElementId = function() {
		return elementId;
	};

	this.getAppletElement = function() {
		return document.getElementById(this.getElementId());
	}

	this.getAppletTag = function() {
		return appletTag;
	}

	try {		// S:Argument Validation
		assert(parameters['id'], IllegalArgumentException, MISSING_REQUIRED_ARGUMENT, "id cannot be null.");
	} catch (e) {
		if(console && console.log) {
			console.log(e);
		}
		throw e;
	}

	if (document.getElementById(parameters['id']) != null) {
		// throw parameters['id'] + " has already initiated.";
	}
	var attributes = {
		id : parameters['id'],
		code : "com.lguplus.ltelcs.pcviewer.PCViewerApplet",
		archive : getPCViewerArchiveList(),
		codebase : "/applets",
		width : parameters['width'],
		height : parameters['height'],
		alt : "No applet"
	};
	console.log(attributes)
	parameters['java_status_events'] = true;

	var version = "1.8";
	
	if(javaDeploy == null){
		javaDeploy = deployJava;
	}

	// var checkVersion = javaDeploy.getJREs()[0];
	// console.log(checkVersion)
	// if (typeof checkVersion == "undefined" && retryCnt < 15) {
	// 	// TODO
	// 	retryCnt = retryCnt + 1
	// 	setTimeout(function(){PCViewer(parameters, target, onLoad, onError)}, 1000);
	// 	return false;
	// }
	// else {
		// location.href = "http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html";

		// return;
	// }

//	appletTag = javaDeploy.runApplet(attributes, parameters, version);
	appletTag = javaDeploy.getAppletTag(attributes, parameters)
	/*
	 * Target의 Type 에 따라 return type 및 처리 Logic이 달라짐. - HTMLDivElement : 해당
	 * Element 하위에 Applet Element를 Append함. - jQuery Object : 해당 Element 하위에
	 * Applet Element를 Append함. - 기타 : Applet Tag 원문을 return.
	 */
	var className = getClass(target);
	if (className == "HTMLDivElement" || className == "Object") {
		target.innerHTML = appletTag;
		appletTag = document.getElementById(parameters["id"]);
	} else if (className == "jQuery") {
		$(target)[0].innerHTML = $(target)[0].innerHTML + appletTag;
		appletTag = document.getElementById(parameters["id"]);
	}
	if(onLoad	) { document.getElementById(elementId).onLoad  = onLoad;  }
	if(onError	) { document.getElementById(elementId).onError = onError; }

	APPLET_ID_MAPP[elementId] = this;

	setTimeout(function () {
		try {
			APPLET_ID_MAPP[elementId].getAppletElement().getPlayMediaCount();
			console.log("succ")
		} catch (e) {
			var checkVersion = javaDeploy.getJREs()[0];
			if (checkVersion == "undefined" && !isRetry) {
				isRetry = true;
				setTimeout(function(){PCViewer(parameters, target, onLoad, onError)}, 1000);
				return false;
			}
			console.log("https://www.java.com/ko/download/ie_manual.jsp");
			// alert("https://www.java.com/ko/download/ie_manual.jsp");
			location.href = "https://www.java.com/ko/download/ie_manual.jsp";
		}
	}, 10000);

	// return appletTag;
	return this;
}

function checkJre() {

}



function createApplet() {
	if(javaDeploy.getJREs()) {
		
	}
}



/**
 * 영상을 초기화하고 다시 Play 한다.
 *
 * @returns 결과
 */


/**
 * 선택된 영상의 ID 를 가져온다.
 * @returns mediaId
 */
PCViewer.prototype.getSelectedMedia = function() {
	var jsonStr = this.getAppletElement().getSelectedMedia();
	console.log(jsonStr);
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 재생중인 영상의 개수를 가져온다.
 * @returns mediaCnt
 */
PCViewer.prototype.getPlayMediaCount = function() {
	var jsonStr = this.getAppletElement().getPlayMediaCount();
	console.log(jsonStr);
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * Component 에 영상을 재생 상태를 조회한다.
 *
 * @returns 재생 상태
 */
PCViewer.prototype.getPlayStatus = function(mediaId) {
	var jsonStr = this.getAppletElement().playStatus(mediaId);
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 다채널 영상 중 특정 영상을 전체화면으로 재생한다.
 * 
 * @returns 음소거 해제 처리 성공 여부
 */
PCViewer.prototype.setFullscreen = function(mediaId) {
	if(!mediaId){
		var tmpMediaId = null;
	} else {
		var tmpMediaId = mediaId;
	}
	console.log(tmpMediaId);
	var jsonStr = this.getAppletElement().setFullscreen(tmpMediaId);
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 음소거 설정.
 */
PCViewer.prototype.setMute = function(mediaId, onOff) {
	var jsonStr = this.getAppletElement().setMute(mediaId, onOff);
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 영상 추가.
 */
PCViewer.prototype.addMedia = function(mediaId, mediaUrl) {
	console.log("addMedia!!!!")
	var jsonStr = this.getAppletElement().addMedia(mediaId, mediaUrl);
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 영상 정지.
 */
PCViewer.prototype.stopMedia = function(mediaId) {
	var jsonStr = this.getAppletElement().stopMedia(mediaId);
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 영상 제거.
 */
PCViewer.prototype.removeMedia = function(mediaId) {
	var jsonStr = this.getAppletElement().removeMedia(mediaId);
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 영상 선택 취소
 */
PCViewer.prototype.setUnLockClick = function() {
	this.getAppletElement().setUnLockClick();
	return true;
}

/**
 * 애플릿 종료 
 */
PCViewer.prototype.setShutdown = function() {
	this.getAppletElement().shutdown();
	return true;
}

/**
 * 영상 선택
 */
PCViewer.prototype.setSelectedMedia = function(mediaId) {
	return this.getAppletElement().setSelectedMedia(mediaId);
}

/**
 *	가로 세로 크기 변경 
 */
PCViewer.prototype.setResizePanel = function(rows, cols) {
	return this.getAppletElement().setResizePanel(rows, cols);
}

/**
 *	상태 로그 찍기
 */
PCViewer.prototype.setWriteStatusLog = function() {
	this.getAppletElement().setWriteStatusLog();
	return true;
}

/**
 *
 * 패널 종류 변경
 */
PCViewer.prototype.setKindPanel = function(kind) {
	this.getAppletElement().setKindPanel(kind);
	return true;
}

/**
 * 패널 수
 */
PCViewer.prototype.getPanelCount = function(kind) {
	var jsonStr = this.getAppletElement().getPanelCount();
	console.log(jsonStr);
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 *
 * webRTC 사용 On
 */
PCViewer.prototype.setWebRTC = function(id, pw) {
   return this.getAppletElement().setWebRTC(id, pw);
}

/**
 *
 * webRTC 전화 끊기
 */
PCViewer.prototype.hangup = function() {
   this.getAppletElement().hangup();
   return true;
}

/**
 *
 * webRTC 전화 받기
 */
PCViewer.prototype.setResultCall = function(yesNo) {
   this.getAppletElement().setResultCall(yesNo);
   return true;
}

/**
 * DLL 로드
 */
PCViewer.prototype.setArMemoRootPath = function() {
	this.getAppletElement().setArMemoRootPath();
	return true;
}

/**
 * AR Memo 초기화
 */
PCViewer.prototype.initialize = function() {
	var jsonStr = this.getAppletElement().initialize();
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 학습 가능한 이미지 가져오기
 */
PCViewer.prototype.getLearnableImage = function() {
	var jsonStr = this.getAppletElement().getLearnableImage();
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * stoke 애플릿으로 보내기
 */
PCViewer.prototype.setPosInfo = function(posInfoList) {
	var jsonStr = this.getAppletElement().setPosInfo(JSON.stringify(posInfoList));
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 학습
 */
PCViewer.prototype.learn = function() {
	var jsonStr = this.getAppletElement().learn();
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 학습 데이터 삭제
 */
PCViewer.prototype.clearLearnedTrackable = function() {
	var jsonStr = this.getAppletElement().clearLearnedTrackable();
	var resVal = buildAppletResult(jsonStr);
	return resVal;
}

/**
 * 트래킹 시작 및 학습데이터 입력
 */
PCViewer.prototype.startTrackingProcess = function() {
	this.getAppletElement().startTrackingProcess();
	return true;
}

/**
 * 트래킹 여부
 */
PCViewer.prototype.isTracking = function() {
	return this.getAppletElement().isTracking();
}

/**
 * 트래킹 중지 및 학습데이터 삭제
 */
PCViewer.prototype.stopTrackingProcess = function() {
	this.getAppletElement().stopTrackingProcess();
	return true;
}


/**
 * 트래킹 시작
 */
PCViewer.prototype.startTracking = function() {
	this.getAppletElement().startTracking();
	return true;
}

/**
 * 트래킹 학습 데이터 입력
 */
PCViewer.prototype.setTrackingTrackableArray = function() {
	this.getAppletElement().setTrackingTrackableArray();
	return true;
}

/**
 * 트래킹 이미지 입력 및 좌표 그리기
 */
PCViewer.prototype.startInputTrackingImage = function() {
	this.getAppletElement().startInputTrackingImage();
	return true;
}

/**
 * 트래킹 이미지 입력 정지
 */
PCViewer.prototype.stopInputTrackingImage = function() {
	this.getAppletElement().stopInputTrackingImage();
	return true;
}

/**
 * 트래킹 정지
 */
PCViewer.prototype.stopTracking = function() {
	this.getAppletElement().stopTracking();
	return true;
}

/**
 * Canvas 사이즈 전달
 */
PCViewer.prototype.initResizeValue = function() {
	this.getAppletElement().initResizeValue();
	return true;
}

/**
 * javascript -> applert 데이터 전달
 */
PCViewer.prototype.sendToApplet = function(str) {
	console.log(JSON.stringify(str));
	this.getAppletElement().sendToApplet(JSON.stringify(str));
	return true;
}

/**
 * AR메모 디버그 용도의 이미지 저장
*/
PCViewer.prototype.setInputImgDebug = function() {
    this.getAppletElement().setInputImgDebug();
    return true;
}

/**
 * AR메모 디버그 용도의 학습데이터 저장
*/
PCViewer.prototype.getCurrentLearnData = function() {
    this.getAppletElement().getCurrentLearnData();
    return true;
}

/**
 * featureKeyList 받아오기
 */
PCViewer.prototype.getFeatureKeyList = function() {
	this.getAppletElement().getFeatureKeyList();
	return true;
}

/**
 * history tracking 시작
 */
PCViewer.prototype.startHistoryTracking = function(key) {
	this.getAppletElement().startHistoryTracking(key);
	return true;
}

/**
 * modify history 데이터 세팅
 */
PCViewer.prototype.setModifyHistoryData = function(key) {
	this.getAppletElement().setModifyHistoryData(key);
	return true;
}

/**
 * 매트릭스 디버그
 */
PCViewer.prototype.getMatrix = function(num, width, hegiht) {
	this.getAppletElement().getMatrix(num, width, hegiht);
	return true;
}


/**
 * 트래킹 이미지 입력 주기
 */
PCViewer.prototype.setInputTrackingImageTerm = function(term) {
	this.getAppletElement().setInputTrackingImageTerm(term);
	return true;
}

/**
 * 히스토리 이미지 저장
 */
PCViewer.prototype.saveHistoryImage = function(ctn, data) {
	this.getAppletElement().saveHistoryImage(ctn, data);
	return true;
}

/**
 * 프레임 변경
 */
PCViewer.prototype.setImgDecodeTerm = function(term) {
	this.getAppletElement().setImgDecodeTerm(term);
	return true;
}

/**
 * VOD 총 플레이 시간
 */
PCViewer.prototype.setVODPlayTime = function(sec) {
	this.getAppletElement().setVODPlayTime(sec);
	return true;
}

/**
 * 일시정지
 */
PCViewer.prototype.pause = function() {
	this.getAppletElement().pause();
	return true;
}

/**
 * 재생
 */
PCViewer.prototype.play = function() {
	this.getAppletElement().play();
	return true;
}

/**
 * 디버그 모드 설정 변경
 */
PCViewer.prototype.setDebugMode = function(isDebugMode) {
	this.getAppletElement().setDebugMode(isDebugMode);
	return true;
}


/**
 * PCViewer Applet 을 초기화 하기 위해 필요한 Archive 목록.
 * 
 * @returns Archive 목록.
 */
function getPCViewerArchiveList() {
	var archive = [
			"ltelcs-applet.jar"
		,	"ltelcs-model.jar"
		,	"gson.jar"
		,	"jna.jar"
		,	"logback-classic.jar"
		,	"logback-core.jar"
		,	"platform.jar"
		,	"slf4j-api.jar"
		,	"xuggle-xuggler.jar"
		,   "calees.jar"
		,   "commons-codec-1.8.jar"
      	,   "httpclient-4.5.2.jar"
      	,   "Java-WebSocket-1.3.0.jar"
      	,   "json-20160810.jar"
      	,   "kxml2-2.3.0.jar"
      	,   "xmlpull-1.1.3.4a.jar"
      	,   "commons-lang3-3.0.jar"
	];

	return archive.join();
}

// -----------------------------------------------------------------------------
// 관련 Utility
// -----------------------------------------------------------------------------
function getElementId() {
	return this.getElementId();
}

/**
 * IE 하위 버전에 console 객체가 없으므로 console.assert 대신 별도 assert function 사용
 * 
 * @param condition
 *            Assert condition
 * @param message
 *            Assertion fail 시의 Message.
 */
function assert(condition, cls, code, message) {
	if (!condition) {
		throw new cls(code, message || "Assertion failed");
	}
}

/**
 * 인자로 받은 Object 의 Class Name을 return한다.
 * 
 * @param obj
 *            판별 대상 Object
 * @returns 판별된 Class Name
 */
function getClass(obj) {
	if (typeof obj === "undefined")
		return "undefined";
	else if (obj === null)
		return "null";
	else if (obj instanceof jQuery)
		return "jQuery";

	return Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1];
}

function getAppletObject(id) {
	return APPLET_ID_MAPP[id];
}

/**
 * Applet 으로부터 받은 결과를 JSON Object로 Parsing 하여 정상인 경우 결과 return. 오류인 경우 Excpetion
 * throw.
 * 
 * @param jsonStr
 * @returns
 */
function buildAppletResult(jsonStr) {
	var obj = jQuery.parseJSON(jsonStr);
	if (obj.resCd == 0) {
		return obj.resVal;
	} else {
//		throw obj;
		return false;
	}
}

// -----------------------------------------------------------------------------
// Exception 정의
// -----------------------------------------------------------------------------
function PCViewerException(errCd, errMsg) {
	this.errCd = errCd;
	this.errMsg = errMsg;
}

var IllegalArgumentException = function() {
	PCViewerException.apply(this, arguments)
};
// IllegalParameterException.prototype = new PCViewerException;
// IllegalParameterException.prototype.constructor = PCViewerException;

// -----------------------------------------------------------------------------
// Error Code 정의
// -----------------------------------------------------------------------------
var MISSING_REQUIRED_ARGUMENT = 2100;
var ARGUMENT_TYPE_ERROR       = 2200;
