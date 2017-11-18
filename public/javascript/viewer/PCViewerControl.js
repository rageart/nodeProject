var viewer = null;
var manageNotice = null;

var APPLET_ID = "lte-lcs-viewer";

var VIEWER_LOAD_SUCS = 22000000;

var STATUS_INIT  = "INIT";
var STATUS_PLAY  = "PLAYING";
var STATUS_PAUSED  = "PAUSED";
var STATUS_STOPPED = "STOPPED";
var STATUS_BROKEN = "BROKEN";

var PLAY_TIMER;
var START_TIME;
var PLAY_SECOND = 0;

var LIST_CLICK_TIMER;
var LIST_START_TIMER = 0;

var TIMER_AREA;
var SENDER_INFO;
var SOUND_ON = -1;

var VIEWER_COUNT = 1;
var BEFORE_VIEWER_COUNT = 1;
var VIEWER_COUNT_TEMP;
var isFullScreen = false;

var streamInfoArr = [];			// 서비스 목록 정보
var streamInfoTempArr = [];

var requestStreamInfoArr = [];	// 영상 서비스 요청 정보

//var curStreamInfo = {};			// 영상 서비스 목록 선택 정보
//curStreamInfo = null;

var browser;
var user_id;

var SYNC_TIME;

var bServiceEnable;
var bLoadingServiceList;

var RANDOM_PLAYINDEX = 0;
var SERVICE_CLASS;
var bCaller = false;

// mVoIP
var adminInfo = {};
var callInfo = {};
var STATUS_CALL_READY = "CALL READY";
var STATUS_CALL_PLAYING = "CALL PLAYING";
var STATUS_CALL_DISABLE = "CALL DISABLE";
var STATUS_CALL_LOGINFAIL = "CALL LOGIN FAIL";
var bAuthorityWriteNotice;
var Camera = {};

var CAMERA_CHANGE_NOTHING = -1;
var CAMERA_CHANGE_FACING = 0;
var CAMERA_CHANGE_ROTATION = 1;

var CAMERA_FACING_BACK	= 0;
var CAMERA_FACING_FRONT	= 1;

var CAMERA_ROTATION_0	= 0;
var CAMERA_ROTATION_180	= 180;


//var STREAMING_TYPE = "REALTIME";

jQuery.ajaxSetup({cache:false});
$(document).ready(function() {
	console.log('ready');
	//manageNotice = new manageNotice();
	//console.log('height :', $(".video .bg4").height());
	//$("#sideNoticeBtn").css("top", )
	$.toast.config.width = 700;

	selectedDrawTool(1, this);
	
	
	$(".tooltip").on('click', function(){
		var _this = $(this),
			_thisParent = _this.parent(),
			_parentsLi = $('.toollist > li');

		if (_thisParent.find('.dropdown-content').length > 0){
			if (_thisParent.hasClass('show')){
				_thisParent.removeClass('show');
			} else {
				_parentsLi.find('.dropdown-content').parent().parent().removeClass('show');
				_thisParent.addClass('show');
			}
		} else if (_thisParent.find('.tooltip').length > 1){
			_parentsLi.find('.dropdown-content').parent().parent().removeClass('show');
			_this.addClass('tooltip-hide').siblings().removeClass('tooltip-hide');
		} else {
			_parentsLi.find('.dropdown-content').parent().parent().removeClass('show');
		}


		var clickMenuVal = _this.attr('value');
		if (clickMenuVal == "play") {

		} else if (clickMenuVal == "stop") {
			var mediaId = getSelectedMedia();

			EndStream(mediaId);
			if (isFullScreen) setValueArrInfo(streamInfoTempArr, selectStreamingInfo(mediaId), false);
			stopVideo(mediaId);
			GetPCViewerList(user_id, browser);

			LIST_START_TIMER = 0;
			clearInterval(LIST_CLICK_TIMER);
			changeNoticeCount();	
		} else if (clickMenuVal == "soundon"){	// sound off로 전환
			if(viewer != null && viewer.getPlayStatus(viewer.getSelectedMedia()) == STATUS_PLAY) {
	
				SOUND_ON = -1;
				viewer.setMute(viewer.getSelectedMedia(), true);
				setMuteStreamInfo(viewer.getSelectedMedia(), true);

				GetPCViewerList(user_id, browser);
			}
		} else if (clickMenuVal == "soundoff"){	// sound on로 전환
			if(viewer != null && viewer.getPlayStatus(viewer.getSelectedMedia()) == STATUS_PLAY) {

				viewer.setMute(SOUND_ON, true);
				setMuteStreamInfo(SOUND_ON, true);
				SOUND_ON = viewer.getSelectedMedia();
				viewer.setMute(viewer.getSelectedMedia(), false);
				setMuteStreamInfo(viewer.getSelectedMedia(), false);

				GetPCViewerList(user_id, browser);				
			}
		} else if (clickMenuVal == "ring") {

			if (callInfo.STATUS == STATUS_CALL_LOGINFAIL) {
				alert('통화서버 로그인 실패입니다.\n관리자에게 문의하세요');
				$("#ring").removeClass('tooltip-hide');
				$("#hangup").addClass('tooltip-hide');
				return;
			}
	
			var streamInfoObj = selectStreamingInfo(viewer.getSelectedMedia());
			if (typeof streamInfoObj == "undefined") return;
	
			//if(callInfo.STATUS == STATUS_CALL_READY) {
				var voiceArray = new Array();
				var voiceInfo = new Object();
	
				voiceInfo.name = adminInfo.name;
				voiceInfo.ctn = session_id;
				voiceInfo.dept = adminInfo.dept;
				voiceInfo.arank = adminInfo.arank;
				voiceArray.push(voiceInfo);
	
				var voiceInfoList = new Object();
				voiceInfoList.COMMAND = 'B200';
				voiceInfoList.INSERT_DATE = streamInfoObj.INSERT_DATE;
				voiceInfoList.CTN_DEVICE = '';
				voiceInfoList.MOBILE_NUM = streamInfoObj.MOBILE_NUM;
				voiceInfoList.CALL_TYPE = '3';
				voiceInfoList.voiceList = voiceArray;
	
				socket.emit('addVoice', voiceInfoList);
	
				callInfo.CTN = streamInfoObj.MOBILE_NUM;
				callInfo.STATUS = STATUS_CALL_PLAYING;
	
				bCaller = true;
	
				//resultCall 에서 통화 연결에 대한 팝업 메세지를 받으므로 이 부분은 삭제
				//alert('통화연결 요청하였습니다.');
			/*
			} else if (callInfo.STATUS == STATUS_CALL_PLAYING){
				//if (streamInfoObj.MOBILE_NUM == callInfo.CTN) {
					var msg = "통화를 종료하시겠습니까?";
					if (confirm(msg) != 0) {
						viewer.hangup(0);
						callInfo.CTN = '';
						callInfo.STATUS = STATUS_CALL_READY;
					}
				//} else {
					//alert('이미 통화중인 상태입니다.');
				//}
			}
			*/
		} else if (clickMenuVal == "hangup") {			
			var msg = "통화를 종료하시겠습니까?";
			if (confirm(msg) != 0) {
				viewer.hangup(0);
				callInfo.CTN = '';
				callInfo.STATUS = STATUS_CALL_READY;
			}
		} else if (clickMenuVal == "fullscreen") {
			
			//console.log('fullscreen')
			var soundstatus_hide = _parentsLi.eq(0).find('.tooltip-hide').eq(1).attr('value');
			var vol_status = false;
			if (soundstatus_hide == "soundon") // sound off
				vol_status = true;
			
			//console.log('vol_status : ', vol_status);
			var mediaId = viewer.getSelectedMedia();
			 if (viewer != null) {
			 	var obj = selectStreamingInfo(mediaId);
			 	copyTempStreamInfo(mediaId);
			// 	stopVideoAll();
				VIEWER_COUNT_TEMP = VIEWER_COUNT;
			 	VIEWER_COUNT = 1;
			// 	startStream(browser.name, browser.version, obj, mediaId, false, false, true);
				viewer.setFullscreen(mediaId);
			 	isFullScreen = true;
			 } else {
			 }
	
			if (!vol_status) {
	
				SOUND_ON = mediaId;
				viewer.setMute(mediaId, false);
				setMuteStreamInfo(mediaId, false);
			}
											
		} else if (clickMenuVal == "bagicscreen") {
			
			//console.log('bagicscreen')
			var soundstatus_hide = _parentsLi.eq(0).find('.tooltip-hide').eq(1).attr('value');
			var vol_status = false;
			if (soundstatus_hide == "soundon") // sound off
				vol_status = true;

			//console.log('vol_status : ', vol_status);
			var mediaId = viewer.getSelectedMedia();
			if (viewer != null) {
				toggleFullScreen(false, mediaId);
				viewer.setFullscreen(null);
				VIEWER_COUNT = VIEWER_COUNT_TEMP;
				isFullScreen = false;
				//VIEWER_COUNT = $('input[name=viewer_count]:checked').val();
				//stopVideo(mediaId);
				//startVideoAllPlaying();
			} else {
			}
		
			if (!vol_status) {
	
				SOUND_ON = mediaId;
				viewer.setMute(mediaId, false);
				setMuteStreamInfo(mediaId, false);
			}								
		}	
	});

	$(".progress_in").css("height", 0);
	$(".progress_out").css("height", 0);
	
    $("<div class='notify'/>").css("display","none").appendTo("body");
    window.toast = function(msg) {
        $(".notify").text(msg).fadeIn(500).fadeOut(10*1000);
    };

	GetAdminInfo();
	GetServiceClass();

	// mVoIP
	callInfo.STATUS = STATUS_CALL_DISABLE;
	callInfo.CTN = '';

	SYNC_TIME = getGapTimeClientToServer();

	var socket = io.connect();
	browser = GetBrowserInfo(navigator.userAgent);
	user_id = session_id;
	var strong = $('<strong></strong>').text(user_id);
	$('.id').append(strong);
	var user_lv = getCookie("user_lv");
	var a, button;

	if (user_lv == 3){
		a = $('<a></a>').attr({"href" : "/logout", "class" : "btn94"}).text("로그아웃");
		$("div.member_info > div.member").append(a);

	} else {
		a = $('<a></a>').attr({"href" : "javascript:window.close()", "class" : "btn94"}).text("닫기");
		$("div.member_info > div.member").append(a);
	}

	//TIMER_AREA = $("div.info").find(".title");
	TIMER_AREA = $('.playTime');
	//SENDER_INFO = $("div.info").find(".sender");

	bServiceEnable = false;

	InitPCViewer();

	var input = $("div.viewer_count > input:radio");

	var container = $("div.video");

	$(".play_btn_s").on("click", function() {
		var isPlaying = $(this).is(".stop");

		if(!isPlaying) {

			var mediaId = getSelectedMedia();

			EndStream(mediaId);
			if (isFullScreen) setValueArrInfo(streamInfoTempArr, selectStreamingInfo(mediaId), false);
			stopVideo(mediaId);
			GetPCViewerList(user_id, browser);

			LIST_START_TIMER = 0;
			clearInterval(LIST_CLICK_TIMER);

			//$(".btn_volum").addClass(".off");

		} else {
		}
	});

	$(".btn_volum").on("click", function() {

		if(viewer != null && viewer.getPlayStatus(viewer.getSelectedMedia()) == STATUS_PLAY) {
			if($(this).is(".off")) { // 음소거

				SOUND_ON = -1;
				viewer.setMute(viewer.getSelectedMedia(), true);
				setMuteStreamInfo(viewer.getSelectedMedia(), true);

				GetPCViewerList(user_id, browser);
			} else {

				// 팝업 제거
				viewer.setMute(SOUND_ON, true);
				setMuteStreamInfo(SOUND_ON, true);
				SOUND_ON = viewer.getSelectedMedia();
				viewer.setMute(viewer.getSelectedMedia(), false);
				setMuteStreamInfo(viewer.getSelectedMedia(), false);

				GetPCViewerList(user_id, browser);
			}
		}
	});

	// mVoIP
	$(".btn_call").on("click", function() {

		if (callInfo.STATUS == STATUS_CALL_LOGINFAIL) {
			alert('통화서버 로그인 실패입니다.\n관리자에게 문의하세요');
			return;
		}

		var streamInfoObj = selectStreamingInfo(viewer.getSelectedMedia());
		if (typeof streamInfoObj == "undefined") return;

		if(callInfo.STATUS == STATUS_CALL_READY) {
			var voiceArray = new Array();
			var voiceInfo = new Object();

			voiceInfo.name = adminInfo.name;
			voiceInfo.ctn = session_id;
			voiceInfo.dept = adminInfo.dept;
			voiceInfo.arank = adminInfo.arank;
			voiceArray.push(voiceInfo);

			var voiceInfoList = new Object();
			voiceInfoList.COMMAND = 'B200';
			voiceInfoList.INSERT_DATE = streamInfoObj.INSERT_DATE;
			voiceInfoList.CTN_DEVICE = '';
			voiceInfoList.MOBILE_NUM = streamInfoObj.MOBILE_NUM;
			voiceInfoList.CALL_TYPE = '3';
			voiceInfoList.voiceList = voiceArray;

			socket.emit('addVoice', voiceInfoList);

			callInfo.CTN = streamInfoObj.MOBILE_NUM;
			callInfo.STATUS = STATUS_CALL_PLAYING;

			bCaller = true;

			//resultCall 에서 통화 연결에 대한 팝업 메세지를 받으므로 이 부분은 삭제
			//alert('통화연결 요청하였습니다.');

		} else if (callInfo.STATUS == STATUS_CALL_PLAYING){
			//if (streamInfoObj.MOBILE_NUM == callInfo.CTN) {
				var msg = "통화를 종료하시겠습니까?";
				if (confirm(msg) != 0) {
					viewer.hangup(0);
					callInfo.CTN = '';
					callInfo.STATUS = STATUS_CALL_READY;
				}
			//} else {
				//alert('이미 통화중인 상태입니다.');
			//}
		} /*else if (callInfo.STATUS == 'CALL_STOP'){
			alert('이미 통화중인 상태입니다.');*/

		//$(".btn_call").toggleClass("off", callInfo.STATUS == STATUS_CALL_READY ? false : true);
	});

	/* socket.io */
	// mVoIP 요청에 대한 응답 처리 메세지
	socket.on('B200', function(data) {

		// 성공
		if (data.F_CALL_TYPE == 3 && data.F_MOBILE_NUM == user_id){
			callInfo.STATUS = STATUS_CALL_PLAYING;
			callInfo.CTN = data.F_MOBILE_NUM;
			applyCallButtonStatus(viewer.getSelectedMedia());
		}
	});

	socket.on('B999', function(data) {

		// 실패
		if (data.F_CALL_TYPE == 3 && data.F_MOBILE_NUM == user_id) {

			callInfo.STATUS = STATUS_CALL_READY;
			applyCallButtonStatus(viewer.getSelectedMedia());
			alert(data.REASON);
		}
	});

	/* iwsys */
	socket.on('B302', function(data) {

		if (!bServiceEnable) return;

		if (data.VIEW_TYPE == 3 && data.VIEW_NUM == user_id){

			selectPcList(browser.name, browser.version, data.MOBILE_NUM, data.LAST_DATE, data.VIEW_NUM, data.VIEW_INDEX, true, false);
			GetPCViewerList(user_id, browser);
			self.focus();
		}
	});

	// 제어SW 종료
	socket.on('B303', function(data) {
		
		if (data.VIEW_TYPE != 3)
			return;

		if (data.VIEW_TYPE == 3 && data.VIEW_NUM == user_id){

			// 제어SW에서 추가되어 있고 영상 서비스가 시작되지 않은 상태
			if (data.PLAY_INDEX > 0) {
				EndStream(data.PLAY_INDEX);
				stopVideo(data.PLAY_INDEX);
			}

			GetPCViewerList(user_id, browser);
			alert('제어S/W에 의한 영상 서비스 강제종료');			
		}
	});

	// response start stream
	socket.on('B304', function(data) {

		if (data.VIEW_TYPE == 3 && data.VIEW_NUM == user_id){

			playVideo($("div.video"), data, false);
		}
	});

	// 발신 서비스 종료
	socket.on('B801', function(data) {

		if (data.VIEW_TYPE == 3 && data.VIEW_NUM == user_id){

			// 영상 재생 중인 발신 서비스가 종료되었을 경우에만 stop
			if (data.PLAY_INDEX > 0) {
				stopVideo(data.PLAY_INDEX);
			}

			GetPCViewerList(user_id, browser);
			var msg;
			if (data.DEV_STATUS == 3) {	//정상
				msg = '발신단말 정상종료' + '\n' + data.DEV_NUM + ' / ' + data.DEV_NM + ' / ' + data.DEV_DEPT_NM;
			}else {
				msg = '발신단말 비정상종료' + '\n' + data.DEV_NUM + ' / ' + data.DEV_NM + ' / ' + data.DEV_DEPT_NM + '\n' + data.REASON;
			}

			var option = {
				"type" : "INFORMATION",
				"message" : msg,
				"stop_fun" : function() {
								removeStopClickAlarmPopup();
							},
				"stop_val" : "닫기",
				"keep" : 5
			};						
			createArStopSystemPopup(selectStreamingInfo(viewer.getSelectedMedia()),option);
			//alert(msg);
		}
	});

	// 비정상 감지 후 재시작
	socket.on('B902', function(data) {

		if (!bServiceEnable) return;

		if (data.VIEW_TYPE == 3 && data.VIEW_NUM == user_id){

			// 영상 재생 중인 발신 서비스가 종료되었을 경우에만 stop
			if (data.PLAY_INDEX > 0) {
				EndStream(data.PLAY_INDEX);
				stopVideo(data.PLAY_INDEX);
				selectPcList(browser.name, browser.version, data.MOBILE_NUM, data.LAST_DATE, data.VIEW_NUM, data.VIEW_INDEX, true, true);
				//var msg;
				msg = '(' + data.DEV_NM + ') 영상처리 지연으로 재연결합니다.';
				toast(msg);
			}
		}
	});


	// 비정상 오류
	socket.on('B998', function(data) {

		if (data.VIEW_TYPE == 3 && data.VIEW_NUM == user_id){

			if (data.PLAY_INDEX > 0) {
				stopVideo(data.PLAY_INDEX);
			}
			GetPCViewerList(user_id, browser);
			if (typeof data.DEV_NUM != "undefined")
				alert('발신 서비스 비정상 종료' + '\n' + data.DEV_NUM + ' / ' + data.DEV_NM + ' / ' + data.DEV_DEPT_NM + '\n' + data.REASON);
			else
				alert('발신 서비스 비정상 종료' + '\n' + data.REASON);
		}
	});

	// 서비스 제한
	socket.on('B997', function(data) {

		if (data.VIEW_TYPE == 3 && data.VIEW_NUM == user_id){

			GetPCViewerList(user_id, browser);
			alert(data.REASON + '\n잠시 후 다시 사용하세요.');
		}
	});

	socket.on('logout', function(data) {
		if(data == user_id) {
			// end streaming
			for (var i in streamInfoArr) {
				if (streamInfoArr[i].ISPLAYING)
					EndStream(streamInfoArr[i].PLAY_INDEX);
			}
			alert('다른 브라우저에서 동일한 아이디로 로그인하여 이전 세션의 연결을 종료합니다.\n확인을 누르면 창이 닫힙니다.');
			self.close();
			//location.href= "/logout2";
		}
	});

	//# start 20170531 by ywhan
	// AR Memo set up response message
	socket.on('B210', function(data) {

		sendMessageToApplet('B210', data);
	});
	// AR Memo set up notice message other viewer
	socket.on('B220', function(data) {

		sendMessageToApplet('B220', data);
	});
	// AR Memo play response message
	socket.on('B211', function(data) {
		sendMessageToApplet('B211', data);
	});
	// AR Memo add request message
	socket.on('B212', function(data) {
		sendMessageToApplet('B212', data);
	});

	// AR Memo History Response
    socket.on('B214', function(data) {
        sendMessageToApplet('B214', data);
    });

	// AR Memo Message
	socket.on('B216', function(data) {
		sendMessageToApplet('B216', data);
	});

	// AR Memo Message
	socket.on('B217', function(data) {
		sendMessageToApplet('B217', data);
	});
	//# end

	socket.on('B510', function(data) {
		sendMessageToApplet('B510', data);
	});

	socket.on('B231', function(data) {
		if (data.VIEW_TYPE == 3 && data.VIEW_NUM == user_id) {
			//공지사항 수신 함수 호출
			
			//console.log(JSON.stringify(decodeURIComponent(data)));
			//console.log(data)
			noticeAlarm(data);
			sendNoticeResponseOnChannel(data);
			setNoticeCount();
			//eventNoticeCount(data);
		}
	});

	/* iwsys */
	// 수정
	$(".btn_volum").on("click", function() {

		if(viewer != null && viewer.getPlayStatus(viewer.getSelectedMedia()) == STATUS_PLAY) {
			if($(this).is(".off")) { // 음소거

				SOUND_ON = -1;
				viewer.setMute(viewer.getSelectedMedia(), true);
				setMuteStreamInfo(viewer.getSelectedMedia(), true);

				GetPCViewerList(user_id, browser);
			} else {

				// 팝업 제거
				viewer.setMute(SOUND_ON, true);
				setMuteStreamInfo(SOUND_ON, true);
				SOUND_ON = viewer.getSelectedMedia();
				viewer.setMute(viewer.getSelectedMedia(), false);
				setMuteStreamInfo(viewer.getSelectedMedia(), false);

				GetPCViewerList(user_id, browser);
			}
		}
	});

	$("div.video_big").find("a.btn_screen").on("click", function() {

		var vol_status = $("div.video_big").find("a.btn_volum").is(".off");

		var mediaId = viewer.getSelectedMedia();
		//if (viewer != null && VIEWER_COUNT > 1) {
		if (viewer != null) {
			//mediaId = viewer.getSelectedMedia();
			var obj = selectStreamingInfo(mediaId);
			copyTempStreamInfo(mediaId);
			stopVideoAll();
			VIEWER_COUNT = 1;
			startStream(browser.name, browser.version, obj, mediaId, false, false, true);
			isFullScreen = true;
		} else {
			//isFullScreen = true;
			//toggleFulonllScreen(true, mediaId);
		}

		if (!vol_status) {

			SOUND_ON = mediaId;
			viewer.setMute(mediaId, false);
			setMuteStreamInfo(mediaId, false);
		}

		$("div.full_screen").find("a.btn_volum").toggleClass("off", vol_status);
	});

	$("div.full_screen").find("a.btn_screen").on("click", function() {

		var vol_status = $("div.full_screen").find("a.btn_volum").is(".off");

		var mediaId = viewer.getSelectedMedia();
		//if (viewer != null && VIEWER_COUNT > 1) {
		if (viewer != null) {// && viewer.getPlayStatus() == STATUS_PLAY) {
			//mediaId = viewer.getSelectedMedia();
			toggleFullScreen(false, mediaId);
			isFullScreen = false;
			VIEWER_COUNT = $('input[name=viewer_count]:checked').val();
			stopVideo(mediaId);
			//startVideoAll();
			startVideoAllPlaying();
		} else {
			//isFullScreen = false;
			//toggleFullScreen(false, mediaId);
		}


		if (!vol_status) {

			SOUND_ON = mediaId;
			viewer.setMute(mediaId, false);
			setMuteStreamInfo(mediaId, false);
		}

		$("div.video_big").find("a.btn_volum").toggleClass("off", vol_status);
	});

	/*
	document.onkeydown = function() {
		// 새로고침 방지 ( Ctrl+R, Ctrl+N, F5 )
		if ( event.ctrlKey == true && ( event.keyCode == 78 || event.keyCode == 82 ) || event.keyCode == 116) {
			event.keyCode = 0;
			event.cancelBubble = true;
			event.returnValue = false;
		}
	}
	*/
	//$(window).bind('beforeunload', function(event){

		//alert(JSON.stringify(event))
		//return "Do you really want to leave now?";
	//});
});

$(window).keyup(function(e) {
	//console.log('key event');
	// esc or f1 key event
	if (e.keyCode  == 27 || e.keyCode == 122) {
		console.log('esc key event');
		$("#btn_off").trigger("click"); 
	}		
});

// esc or F11
function clickedESC() {
	//console.log("clickedESC")
	if (isFullScreen) {
		console.log('applet esc key event');
		$("#btn_off").trigger("click"); 
	}
}

$(window).resize(function() {
	console.log('resize');
	$("applet").each(function() {

		console.log('event');
		var adjContainer;
		/*
		if(isFullScreen) {
			adjContainer = $("div.full_screen > div.video");
		} else {
			adjContainer = $("div.video_big > div.video");
		}
		*/
		adjContainer = $("div.video_big > div.video");		

		adjustAppletSize(adjContainer);
		try {
			//setInterval(function() { adjustAppletSize(adjContainer); }, 500);
		} catch(ignore) { }
	});
});

function GetServiceClass() {

	$.ajax({
		url:'/getServiceClassPCViewer',
		type:'POST',
		success:function(data){
			SERVICE_CLASS = data[0].SV_NECESSARY_SV;
			if (SERVICE_CLASS == 1 || SERVICE_CLASS == 2 || SERVICE_CLASS == 4) {
				// $('input:radio[name=viewer_count]:input[value=4]').prop("disabled", true);
				// $('input:radio[name=viewer_count]:input[value=9]').prop("disabled", true);
			}
		}
	});
}

// mVoIP
function GetAdminInfo() {

	$.ajax({
		url:'/getAdminInfo',
		type:'POST',
		success:function(data){
			//console.log('getAdminInfo : ', data);
			adminInfo.name  = data[0].ADMIN_NM;
			adminInfo.ctn   = data[0].ADMIN_MOBILE_NUM;
			adminInfo.dept  = data[0].ADMIN_DEPT_NM;
			adminInfo.arank = data[0].ADMIN_ARANK;
			adminInfo.debug = data[0].VIEWER_DEBUG == 1 ? true : false;
		}
	});
}
function InitPCViewer() {

	copyTempStreamInfo();

	DeleteAllRequestStreamInfo();

	removeAllStreamInfo();
	isFullScreen = false;
	SOUND_ON = -1;

	initCamera();

	changeNoticeCount();

	// 애플릿,  비디오 초기화
	InitVideo($("div.video"));
}

function reLoadViewer(user_id, browser) {

	bServiceEnable = false;

	RANDOM_PLAYINDEX++;
	RANDOM_PLAYINDEX = RANDOM_PLAYINDEX % 100;

	stopVideoAll();

	InitPCViewer();

	autoStartVideo();
}

function autoStartVideo() {
	GetPCViewerList(user_id, browser, function(){
		if (streamInfoArr.length == 0) bServiceEnable = true;
		startVideoAll();
	});
}

function InitControl(container) {

	//$("#soundon").hide();
//	console.log("<%=data.ARMemo%>");
	if (ARMemo != 'Y') {
		//$("#arStartBtn").addClass("hide");
		//$("#arStopBtn").addClass("hide");
		$("#inputImageToggleBtn").addClass("hide");
		$("#arOriginImage").addClass("hide");
		playHide(true);
	}

	$("#soundon").addClass('tooltip-hide');
	$("#ring").addClass('tooltip-hide');

	clearTimer();
	hideSenderInfo();
}

function GetPCViewerList(user_id, browser, callback) {

	$.ajax({
		url:'/pcList',
		type:'POST',
		data : {
			devKey: user_id,
			devType : '3'
		},
		success:function(data){
			$('#pcList').empty();
			removeAllStreamInfo();
			bLoadingServiceList = true;
			
			// <!-- 1, 55 2 85,  3, 115-->
			var ifrhsize = (30*data.length)+25 ;

			var listCount = 0;
			$(data).each(function(index, item){
				// 제어SW종료인 경우 목록에서 제외
				// 쿼리로는 해결 안되는 상황이라 로컬에서 처리
				// => 쿼리로 해결하여 주석처리
				//if (item.DEFECT_CODE == '0001')
				//	return true;

				if (listCount == 0) {
					var ul = '<iframe id="ifSize2" src="" width="140" height='+ifrhsize+' frameborder="0" scrolling="no" style=" position: absolute; z-index: -10; top: 0px; "  ></iframe>';
	            	$('#pcList').append(ul);
				}
				listCount++;

				var cust_nm, cust_dept_nm;

				cust_nm = getTextEllipsis(item.CUST_NM);
				cust_dept_nm = getTextEllipsis(item.CUST_DEPT_NM);

				addStreamInfo(item);

				var checkyn = "checkbox";
				var soundyn = "sound";
				var activeL = "liText";
                if(item.LAST_STATUS == 2){
                	if (isSelectedMedia(item)) {
                    	activeL = "liTextSelected";
                   	}
                   	else{
                   		activeL = "liTextActive";
                   	}
                	checkyn = "checkbox on";
                }

				if(SOUND_ON == item.PLAY_INDEX){ // on
					soundyn = "sound on";
				}

				//---------------------------------------
				var javas = "javascript:selectPcListId('" + browser.name + "','" + browser.version + "','" + item.P_CUST_CTN + "','"+ item.P_INSERT_DATE + "','" + user_id + "','" + item.DEV_INDEX + "'," + false + "," + false +" ,'list_"+index+"')";
				//var values = '<li class="'+soundyn+'"><label class="'+checkyn+'" id="list_'+index+'"><input type="checkbox" name="" onclick="'+javas+'"/><span class="label">' + cust_nm + '</span></label></li>';
				//var values = '<li class="'+soundyn+'"><a href="'+javas+'" ><font color=ffffff>' + cust_nm + '</font></a></li>';
				var li = $('<li></li>').addClass(soundyn);
				var a = $('<a></a>').addClass(activeL).attr("href", javas).text(cust_nm);
				a.on("click", function () {
					if (isOpen) {
						getNotice("topMenu", item.P_CUST_CTN, item.P_INSERT_DATE);
					}
				});
				var values = li.append(a);
				var noticeBtn = $(document.createElement("button")).on("click", function () {
					selectPcListId(browser.name, browser.version, item.P_CUST_CTN, item.P_INSERT_DATE, user_id, item.DEV_INDEX, false, false, "list_" + index);
					/*if (isOpen) {
						// reloadNoticeSlider();
						getNotice("topMenu", item.P_CUST_CTN, item.P_INSERT_DATE);
					} else {
						$("#noticeLeftBtn").contents().find("body").find("span").click();
					}*/
					getNotice("topMenu", item.P_CUST_CTN, item.P_INSERT_DATE);
					if (!isOpen) {
						leftNoticeToggle();
					}
				})
				li.append(noticeBtn);
				//a href="'+javas+'" ><font color=ffffff>' + cust_nm + '</font></a></li>';

				//---------------------------------------

				//var isSoundImgEc
                $('#pcList').append(values);
			});
			
			bLoadingServiceList = false;

			buildMovieList(false);

			changePlayCount(streamInfoArr.length);

			if (typeof callback == "function")
				callback();

		},
		error:function(err){
			//배열 전체 삭제
			//streamInfoArr.length = 0;
		}
	});
}

function getTextEllipsis(str) {
    var len = 0;
    var retStr = '';
    var bOver = false;
    for (var i = 0; i < str.length; i++) {
        if (escape(str.charAt(i)).length == 6) {
            len++;
        }
        len++;

        if(len > 18){
        	bOver = true;
	        break;
        }

        retStr += str.charAt(i);
    }

    if (bOver) retStr += '...';

    return retStr;
}

function InitVideo(container) {

	InitControl(container);

	var cols, rows;
	if (VIEWER_COUNT == 1){
		cols = 1;
		rows = 1;
	} else if (VIEWER_COUNT == 4) {
		cols = 2;
		rows = 2;
	} else if (VIEWER_COUNT == 9) {
		cols = 2;
		rows = 2;
	} else {
		cols = 1;
		rows = 1;
	}

	var param = {
				id			: APPLET_ID
			, 	cols		: cols
			,	rows		: rows
			,   width		: container.width()
			,   height		: container.height()
	};

	if(viewer == null) {
		var onLoad  = function() {
			logServerUpload(2, 'onLoad', '', '');

			if (mVoIP == 'Y') viewer.setWebRTC(user_id, user_pw);
			viewer.setImgDecodeTerm(66);
			viewer.setInputTrackingImageTerm(100);

			// 임시 코드
			// AR VOD 스트리밍
			/*
			if (VIEWER_COUNT == 1) { 
				$.ajax({
				    url: '/arfeaturedata',
				    type:'get',
					headers:{'Content-Type':'application/octet-stream','X-Requested-With':'XMLHttpRequest'},
					dataType:'binary',
					success:function(blob){
						console.log('blob : ', blob);
						var reader = new FileReader();
						reader.readAsArrayBuffer(blob);
						//reader.readAsDataURL(myBlob);

						reader.onload = function(e) {
							// to get rid of MIME
							var r = reader.result;
							console.log(r)
							//var data = r.substr(r.indexOf(',') + 1)
							//console.log(data);
							//TiddlySaver.saveFile("c:\\temp\\_testpic.jpg", data);
						}
				    }
				});			
			}
			*/
		};
		var onError = function() {

			logServerUpload(2, 'onError', '', '');

			// 다시 정리 필요
			var socket = io.connect();
			var streamInfo = new Object();
			streamInfo.COMMAND = 'B901';
			streamInfo.CTN_DEVICE = '';
			//streamInfo.MOBILE_NUM = curStreamInfo.MOBILE_NUM;
			//streamInfo.VIEW_NUM = curStreamInfo.VIEW_NUM;
			//streamInfo.VIEW_TYPE = curStreamInfo.VIEW_TYPE;
			//streamInfo.VIEW_INDEX = curStreamInfo.VIEW_INDEX;
			streamInfo.FAIL_CODE = '0001';
			streamInfo.FAIL_TYPE = '';
			streamInfo.FAIL_REASON = 'applet load error';
			socket.emit('Abnormal', streamInfo);
		};

		logServerUpload(0, 'new PCViewer', rows + '_' + cols, '');

		viewer = new PCViewer(param, container, onLoad, onError);
	}else {
		logServerUpload(0, 'setResizePanel', rows + '_' + cols, '');
		if (VIEWER_COUNT == 4) viewer.setKindPanel(0);
		if (VIEWER_COUNT == 9) viewer.setKindPanel(1);

		var result = viewer.setResizePanel(rows, cols);
		logServerUpload(1, 'setResizePanel', rows + '_' + cols, result);
	}
}

function playVideo(container, obj, dummy) {

	if(viewer != null) {
		var url = "rtsp://" + obj.SVR_IP + ":" + obj.SVR_PORT + "/" + obj.DEPTH_1 + "/" + obj.VIEW_NUM + "/" + obj.VIEW_INDEX;		
		logServerUpload(0, 'addMedia', obj.PLAY_INDEX + '_' + url, '');
		var result = viewer.addMedia(obj.PLAY_INDEX, url);
		logServerUpload(1, 'addMedia', obj.PLAY_INDEX + '_' + url, result);
		// logServerUpload(0, 'addMedia', obj.PLAY_INDEX + '_' + obj.CONN_URL, '');
		// var result = viewer.addMedia(obj.PLAY_INDEX, obj.CONN_URL);
		// logServerUpload(1, 'addMedia', obj.PLAY_INDEX + '_' + obj.CONN_URL, result);

		AddRequestStreamInfo(obj.PLAY_INDEX);
		//setTimeout(function() { DeleteRequestStreamInfo(obj.PLAY_INDEX);} , 5000);

		//# start 20170531 by ywhan
		if (result) {
			//console.log('obj : ', obj);
			if (VIEWER_COUNT == 1) {
				leftTopLiveReplayShow();
			}
			obj.IP = rtsp_url;
			sendMessageToApplet('A240', obj);
		}
		//# end
	}
}

function stopVideo(mediaId) {

	if (viewer.getSelectedMedia() == mediaId && isOpen) rightNoticeToggle();

	InitControl($("div.video"));

	if (viewer.getPanelCount() == 1) {
		if (viewer.isTracking()) {
			tracking2Applet();
			viewer.stopTrackingProcess();
		}else{
			canvas2Applet();
		}
		revertApplet();
		changeViewOriginBtn(false);

		initCamera();
		playHide(false);
	}

	logServerUpload(0, 'removeMedia', mediaId, '');
	var result = viewer.removeMedia(mediaId);
	logServerUpload(1, 'removeMedia', mediaId, result);

	applyPlayButtonStatus2(mediaId);
	applyMuteButtonStatus(mediaId);
	applyCallButtonStatus(mediaId);

	if (SOUND_ON == mediaId) SOUND_ON = -1;

	leftTopHide();

	EndStream(mediaId);

	setPlayStreamInfo(mediaId, false);
	setMuteStreamInfo(mediaId, true);
}

function initCamera() {
	Camera.changeType = CAMERA_CHANGE_NOTHING;
	Camera.direction = CAMERA_FACING_BACK;
	Camera.rotation = CAMERA_ROTATION_0;
}

function selectPcList(BR_NAME, BR_VERSION, CUST_CTN, INSERT_DATE, VIEW_NUM, VIEW_INDEX, AutoPlay, IsContinue) {

	var streamInfo = {};

	streamInfo.MOBILE_NUM 		= CUST_CTN;
	streamInfo.INSERT_DATE      = INSERT_DATE;
	streamInfo.VIEW_NUM 		= VIEW_NUM;
	streamInfo.VIEW_TYPE 		= '3';
	streamInfo.VIEW_INDEX 		= VIEW_INDEX;

	startStream(BR_NAME, BR_VERSION, streamInfo, 0, true, AutoPlay, IsContinue);
}

function selectPcListId(BR_NAME, BR_VERSION, CUST_CTN, INSERT_DATE, VIEW_NUM, VIEW_INDEX, AutoPlay, IsContinue, Id) {

	var streamInfo = {};

	streamInfo.MOBILE_NUM 		= CUST_CTN;
	streamInfo.INSERT_DATE      = INSERT_DATE;
	streamInfo.VIEW_NUM 		= VIEW_NUM;
	streamInfo.VIEW_TYPE 		= '3';
	streamInfo.VIEW_INDEX 		= VIEW_INDEX;

	if (!bServiceEnable) {
		//$('input:radio[name=viewer_count]:input[value='+VIEWER_COUNT+']').prop("checked", true);
		alert('영상 뷰어 로딩 중입니다.\n잠시 후 이용해 주세요.');
		return;
	}
		
	startStream(BR_NAME, BR_VERSION, streamInfo, 0, true, AutoPlay, IsContinue);
}


function startStream(BR_NAME, BR_VERSION, playStreamInfo, fullscreenIndex, IsCheck, AutoPlay, IsContinue) {

	if (IsPlayingService(playStreamInfo) && IsCheck) {

		//var streamInfo = selectStreamingInfo2(playStreamInfo.MOBILE_NUM, playStreamInfo.INSERT_DATE);
		var streamInfo = selectStreamingInfo2(playStreamInfo.MOBILE_NUM);
		applyPlayButtonStatus2(streamInfo.PLAY_INDEX);
		//alert("재생 중인 영상입니다.");
		viewer.setSelectedMedia(streamInfo.PLAY_INDEX);
		onMouseClicked(streamInfo.PLAY_INDEX);
		return;
	}

	if (fullscreenIndex == 0 && GetCountPlayingService() >= VIEWER_COUNT) {
		if (!AutoPlay) {
			// [160921] 1:1 화면에서는 기존 영상 정지 후 선택한 서비스 시작으로 요청
			if (VIEWER_COUNT == 1) {
				stopVideo(getSelectedMedia());
			} else {
				alert('모든 영상이 재생중입니다.');
				return;
			}
		} else {
			return;
		}
	}

	var PLAY_INDEX = fullscreenIndex > 0 ? fullscreenIndex : getPlayIndex();
	setPlayStreamInfo(PLAY_INDEX, true);

	//$("applet").css("position", "static");

	// 재생 목록 클릭 방지 제한
	//throttleClickViewerList(0, true);

	var socket = io.connect();
	var streamInfo = {};
	streamInfo.COMMAND 			= 'B304';
	streamInfo.CTN_DEVICE 		= '';
	streamInfo.MOBILE_NUM 		= playStreamInfo.MOBILE_NUM;
	streamInfo.INSERT_DATE      = playStreamInfo.INSERT_DATE;
	streamInfo.VIEW_NUM 		= playStreamInfo.VIEW_NUM;
	streamInfo.VIEW_TYPE 		= playStreamInfo.VIEW_TYPE;
	streamInfo.VIEW_INDEX 		= playStreamInfo.VIEW_INDEX;
	streamInfo.PLAY_INDEX		= PLAY_INDEX;
	streamInfo.FRAME_CNT		= VIEWER_COUNT;
	streamInfo.BROWSER_NAME 	= BR_NAME;
	streamInfo.BROWSER_VERSION 	= BR_VERSION;
	streamInfo.CONTINUE			= IsContinue ? 'Y' : 'N';

	socket.emit('startStream', streamInfo);
}

function EndStream(mediaId) {

	var obj = selectStreamingInfo(mediaId);
	//console.log('EndStream : ', obj)
	if (typeof obj == "undefined") return;

	var socket = io.connect();
	var streamInfo = new Object();
	streamInfo.COMMAND    		= 'B305';
	streamInfo.CTN_DEVICE 		= '';
	streamInfo.MOBILE_NUM 		= obj.MOBILE_NUM;
	streamInfo.VIEW_NUM 		= obj.VIEW_NUM;
	streamInfo.URL 				= obj.URL;
	streamInfo.VIEW_TYPE 		= obj.VIEW_TYPE;
	streamInfo.VIEW_INDEX 		= obj.VIEW_INDEX;
	streamInfo.PLAY_INDEX		= obj.PLAY_INDEX;
	streamInfo.FRAME_CNT		= VIEWER_COUNT;
	streamInfo.BROWSER_NAME 	= browser.name;
	streamInfo.BROWSER_VERSION 	= browser.version;
	socket.emit('EndStream', streamInfo);
}

function appletInitEnd() {
	//console.log("### appletInitEnd ###")
	//viewer.setDebugMode(adminInfo.debug);
	autoStartVideo();	
}

function onLoadViewer(mediaId, code) {

	//console.log('onLoadViewer : ', mediaId);
	DeleteRequestStreamInfo(mediaId);
	//console.log('requestStreamInfoArr length : ', requestStreamInfoArr.length)

	logServerUpload(2, 'onLoadViewer', mediaId, code);

	if(code == VIEWER_LOAD_SUCS) {
		viewer.setSelectedMedia(mediaId);
		GetPCViewerList(user_id, browser, function() {
			applyPlayButtonStatus2(mediaId);
			applyMuteButtonStatus(mediaId);
			applyCallButtonStatus(mediaId);

			var info = selectStreamingInfo(mediaId);
			if (typeof info != "undefined") {
				startTimer(info.START_TIME);
				showSenderInfo(info);
				isAuthorityWriteNotice(info);
				if (viewer.getPanelCount() == 1) changeViewOriginBtn(true, info.AR_COUNT);
				setNoticeCount();			
			}
		});
	} else {

		var info = selectStreamingInfo(mediaId);
		if (typeof info == "undefined") return;

		var streamInfo = {};
		streamInfo.COMMAND    = 'B901';
		streamInfo.CTN_DEVICE = '';
		streamInfo.MOBILE_NUM = info.MOBILE_NUM;
		streamInfo.VIEW_NUM = info.VIEW_NUM;
		streamInfo.VIEW_TYPE = info.VIEW_TYPE;
		streamInfo.VIEW_INDEX = info.VIEW_INDEX;
		streamInfo.FAIL_CODE = '0001';
		streamInfo.FAIL_TYPE = '';
		streamInfo.FAIL_REASON = 'applet load error';

		var socket = io.connect();
		socket.emit('Abnormal', streamInfo);

		EndStream(mediaId);
		InitControl();

		GetPCViewerList(user_id, browser);

		alert('영상 재생을 위한 구동 시 오류가 발생했습니다.\n잠시후 다시 시도하세요');
	}

	// 재생 목록 클릭 방지 해제
	//throttleClickViewerList(0, false);
}

function throttleClickViewerList(index, isRunning) {
	var $list = $(".movieIndex", index);
	var $list_children = $(".movieIndex .fl", index);
	if (isRunning) {
		$list.prop("disabled", true);
		$list_children.css("color", "gray")
	} else {
		$list.prop("disabled", false);
	}
}

function isAuthorityWriteNotice(info) {
	var param = {
		"P_CUST_CTN" : info.MOBILE_NUM,
		"P_INSERT_DATE" : info.INSERT_DATE
	};

	$.ajax({
		url:'/isAuthorityWriteNotice',
		type:'POST',
		data : param,
		success:function(data){
			//console.log('isAuthorityWriteNotice : ', data.DEV_KEY)
			if (data.DEV_KEY == user_id) {
				$(".side_btn").removeClass("hide");
				bAuthorityWriteNotice = true;
			} else {
				//console.log('button delete')
				$(".side_btn").addClass("hide");
				bAuthorityWriteNotice = false;
			}
			if (isOpen) getNotice("reload");
		}
	});
}

function onLoadApplet() {
	console.log("onLoadApplet()");
}

function onStreamPipeBroken(mediaId) {

	logServerUpload(2, 'onStreamPipeBroken', mediaId, '');

	var socket = io.connect();
	var obj = selectStreamingInfo(mediaId);

	if (typeof obj != "undefined")
	{
		var streamInfo = {};
		streamInfo.COMMAND = 'B901';
		streamInfo.CTN_DEVICE = '';
		streamInfo.MOBILE_NUM = obj.MOBILE_NUM;
		streamInfo.VIEW_NUM = obj.VIEW_NUM;
		streamInfo.VIEW_TYPE = obj.VIEW_TYPE;
		streamInfo.VIEW_INDEX = obj.VIEW_INDEX;
		streamInfo.FAIL_CODE = '0002';
		streamInfo.FAIL_TYPE = '';
		streamInfo.FAIL_REASON = 'stream pipe broken';
		socket.emit('Abnormal', streamInfo);

		//EndStream(mediaId);
		stopVideo(mediaId);

		var msg = "네트워크 상태가 불안정하여 (" + obj.CUST_NM + ") 수신 서비스를 종료합니다.";
		alert(msg);
		GetPCViewerList(user_id, browser);
	}
}

function onMouseClicked(mediaId)
{
	logServerUpload(2, 'onMouseClicked', mediaId, '');

	clearTimer();
	hideSenderInfo();

	applyPlayButtonStatus2(mediaId);
	applyMuteButtonStatus(mediaId);
	// mVoIP
	applyCallButtonStatus(mediaId);

	GetPCViewerList(user_id, browser, function(){

		var info = selectStreamingInfo(mediaId);
		if(typeof info != "undefined") {
			startTimer(info.START_TIME);
			showSenderInfo(info);
			isAuthorityWriteNotice(info);
			if (viewer.getPanelCount() == 1) changeViewOriginBtn(true, info.AR_COUNT);
		}
		setNoticeCount();
	});
	if (typeof noticeReloadFunction == 'function') {
		noticeReloadFunction();
	}
}

function onMouseDoubleClicked(mediaId) {

}

function getLoginResult(b, s) {
	var msg;
	if (b)
		alert("통화 서버 로그인에 성공하셨습니다.");
	else
		alert("통화 서버 로그인에 실패하셨습니다.");
	// 로그인 실패시
	if (!b) {
		callInfo.STATUS = STATUS_CALL_LOGINFAIL;
	} else {
		callInfo.STATUS = STATUS_CALL_READY;
	}
}

function resultCall(type, roomId, msg) {
	//console.log('resultCall : ', type, roomId, msg);

	if (type == "ring")
	{
		//bCaller = false;
		var position = msg.indexOf('success');
		if (position != -1) {
			var msg = "통화연결을 하시겠습니까?";
			if (bCaller == false) {
				if (confirm(msg) != 0) {
					callRing();
				} else {
					viewer.setResultCall(false);
				}
			} else {
				setTimeout(function() {
					callRing();
				}, 1000);
			}
		} else {
			alert('통화연결에 실패하였습니다.');
		}

		bCaller = false;
	} else if (type == "leaveRoom") {

		if (msg == user_id) {
			viewer.hangup(0);
			callInfo.CTN = '';
			callInfo.STATUS = STATUS_CALL_READY;
			applyCallButtonStatus(viewer.getSelectedMedia());
			alert('통화가 종료되었습니다.');
		} else {
			// 방에서 다른 사용자가 떠났습니다.
		}
	}
}

function callRing() {

	viewer.setResultCall(true);
	callInfo.STATUS = STATUS_CALL_PLAYING;
	applyCallButtonStatus(viewer.getSelectedMedia());
}

/*
function applyPlayButtonStatus() {

	var isPlaying = false;
	try {
		isPlaying = (viewer != null && viewer.getPlayStatus() == STATUS_PLAY);
	} catch(ignore) { }

	if (isPlaying) $("#stop").show();
	else $("#stop").hide();
	//$(".play_btn_s").toggleClass("play", !isPlaying);
	//$(".play_btn_s").toggleClass("stop", isPlaying);
}
*/

function applyPlayButtonStatus2(mediaId) {

	//alert(mediaId)
	var isPlaying = false;
	try {
		isPlaying = (viewer != null && viewer.getPlayStatus(mediaId) == STATUS_PLAY);
		logServerUpload(1, 'applyPlayButtonStatus2 getPlayStatus', mediaId, viewer.getPlayStatus(mediaId));
		// if (isPlaying) {
		// 	$(".play_btn_s").show();
		// 	if (mVoIP != 'Y') $(".btn_volum").show();
		// 	$(".btn_screen").show();
		// }
	} catch(ignore) { }
	
	if (isPlaying) {
		$("#stop").removeClass('tooltip-hide').siblings().addClass('tooltip-hide');
		if (mVoIP == 'Y') $("#ring").removeClass('tooltip-hide')
	} else {
		$("#stop").addClass('tooltip-hide').siblings().removeClass('tooltip-hide');
		if (mVoIP == 'Y') $("#ring").addClass('tooltip-hide')
	}

	//if (mVoIP == 'Y') $("#stop").addClass('tooltip-hide')
	//if (isPlaying) $("#play").trigger("click");
	//else $("#stop").trigger("click");
	//$(".play_btn_s").toggleClass("play", !isPlaying);
	//$(".play_btn_s").toggleClass("stop", isPlaying);
}

function applyMuteButtonStatus(mediaId) {

	var isMute = false;

	if(viewer != null && viewer.getPlayStatus(mediaId) == STATUS_PLAY) {
		logServerUpload(1, 'applyMuteButtonStatus getPlayStatus', mediaId, viewer.getPlayStatus(mediaId));
		
		var mute = IsMutingService(mediaId);		
		if (mute) $("#soundon").addClass('tooltip-hide').siblings().removeClass('tooltip-hide');
		else $("#soundon").removeClass('tooltip-hide').siblings().addClass('tooltip-hide');
		
		viewer.setMute(mediaId, mute);
	} else {
		
		$("#soundon").addClass('tooltip-hide').siblings().addClass('tooltip-hide');
	}
}

function applyCallButtonStatus(mediaId) {

	var isPlaying = false;
	try {
		isPlaying = (viewer != null && viewer.getPlayStatus(mediaId) == STATUS_PLAY);
		logServerUpload(1, 'applyCallButtonStatus getPlayStatus', mediaId, viewer.getPlayStatus(mediaId));
		if (isPlaying) {
			//console.log('getPlayStatus : ', viewer.getPlayStatus(mediaId));
			if (mVoIP === 'Y') $(".btn_call").show();
		}
	} catch(ignore) { }

	var status;
	var streamInfoObj = selectStreamingInfo(mediaId);
	if (typeof streamInfoObj == 'undefined') return;
	//console.log('streamInfoObj : ', streamInfoObj);
	//if (callInfo.CTN == streamInfoObj.MOBILE_NUM) {
		if (callInfo.STATUS == STATUS_CALL_READY) {
			status = false;
		} else {
			status = true;
		}
	//} else {
	//	status = false;
	//}

	$(".btn_call").toggleClass("off", status);
}

function adjustViewerSize(appletId) {
	var applet    = $("#" + appletId);
	var container = applet.parent();

	applet.width (container.width()  );
	applet.height(container.height() );
}

function startTimer(START_TIME) {
	if(PLAY_TIMER != null) {
		clearInterval(PLAY_TIMER);
	}

	TIMER_AREA.text(calcGapTime(START_TIME));

	PLAY_TIMER = setInterval(function() {
		TIMER_AREA.text(calcGapTime(START_TIME));
		// PLAY_SECOND++;
		// $(".progress_in").css("width", )
	}, 900);
}

function calcGapTime(START_TIME) {

	var elapsedTime = (new Date().getTime() - START_TIME) / 1000;
	var elapsedHour = leftPad(parseInt(elapsedTime / 3600), "0", 2);
	var elapsedMins = leftPad(parseInt((elapsedTime % 3600) / 60), "0", 2);
	var elapsedSecs = leftPad(parseInt(elapsedTime % 60), "0", 2);
	var elapsedStr = elapsedHour + " : " + elapsedMins + " : " + elapsedSecs;

	return elapsedStr;
}


function pauseTimer() {
	if(PLAY_TIMER) {
		clearInterval(PLAY_TIMER);
	}
}

function clearTimer() {
	pauseTimer();
	TIMER_AREA.text("");
}

function leftPad(str, chr, num) {
	str = str + "";

	var max = num - str.length;
	for (var i = 0; i < max; i++) {
		str = chr + str;
	}

	return str;
}

function showSenderInfo(sender) {
	//SENDER_INFO.text("");
}

function hideSenderInfo() {
	//SENDER_INFO.text("");
}

function toggleFullScreen(isFullscreen, mediaId) {
	//if($("applet").length == 0) return;
	//if (curStreamInfo == null) return;

	if(viewer != null && viewer.getPlayStatus(mediaId) == STATUS_PLAY) {

		logServerUpload(1, 'toggleFullScreen getPlayStatus', isFullscreen + '_' + mediaId, viewer.getPlayStatus(mediaId));

		var adjContainer = null;
		if(isFullscreen) {
			$("applet").css("position", "fixed");
			$("applet").css("z-index", "400");

			adjContainer = $("div.full_screen > div.video");
		} else {
			adjContainer = $("div.video_big > div.video");
			$("applet").css("position", "static");
		}

		var top  = adjContainer.offset().top;
		var left = adjContainer.offset().left;

		$("applet").offset({ top : top ,left : left });
		$("applet").width(adjContainer.width());
		$("applet").height(adjContainer.height());

		if (isFullscreen) {
			logServerUpload(0, 'setFullscreen', mediaId, '');
			var result = viewer.setFullscreen(mediaId);
			logServerUpload(1, 'setFullscreen', mediaId, result);
		} else {
			logServerUpload(0, 'setFullscreen', '', '');
			var result = viewer.setFullscreen(null);
			logServerUpload(1, 'setFullscreen', '', result);
		}
	}
}

function addStreamInfo(data) {

	var obj = {};

	obj.MOBILE_NUM 	 = data.P_CUST_CTN;
	obj.INSERT_DATE  = data.P_INSERT_DATE;
	obj.STREAM_URL	 = data.URL;
	obj.PLAY_INDEX	 = data.PLAY_INDEX;
	obj.ISPLAYING    = data.LAST_STATUS == 2 ? true : false;
	//obj.ISPLAYING    = data.STATUS == 2 ? true : false;
	obj.ISMUTING	 = SOUND_ON == data.PLAY_INDEX ? false : true;
	if( data.LAST_SVC_TIME_ST != undefined){
		obj.START_TIME	 = getTimeToStringTime(data.LAST_SVC_TIME_ST)+ SYNC_TIME;
	}else{
		obj.START_TIME	 = 0;
	}
	//obj.START_TIME	 = getTimeToStringTime(data.SVC_TIME_ST)+ SYNC_TIME;
	obj.VIEW_NUM	 = data.DEV_KEY;
	obj.VIEW_TYPE	 = data.DEV_TYPE;
	obj.VIEW_INDEX   = data.DEV_INDEX;
	obj.CUST_NM		 = data.CUST_NM;
	obj.CUST_DEPT_NM = data.CUST_DEPT_NM;
	obj.FEATURE_KEY  = data.FEATURE_KEY;
	obj.OWNER_TYPE	 = data.OWNER_TYPE;
	obj.NOTICE_COUNT = data.NOTICE_COUNT;
	obj.AR_COUNT	 = data.AR_COUNT;

	streamInfoArr.push(obj);
}

function setPlayIndexStreamInfo(obj) {

	streamInfoArr.filter(function(value, index){
		if (value.MOBILE_NUM == obj.MOBILE_NUM) { //} && value.INSERT_DATE == obj.LAST_DATE){
			streamInfoArr[index].PLAY_INDEX = obj.PLAY_INDEX;
		}
	});
}

function deleteStreamInfo(playIndex) {

	streamInfoArr.filter(function(value, index){
		if (value.PLAY_INDEX == playIndex){
			streamInfoArr.splice(index, 1);
		}
	});
}

function isIncludeStreamInfo(obj) {

	var isInclude = streamInfoArr.filter(function(item){
		return item.MOBILE_NUM == obj.MOBILE_NUM && item.INSERT_DATE == obj.INSERT_DATE;
	});

	if (isInclude.length > 0)
		return true;
	else
		return false;
}

function removeAllStreamInfo() {

	streamInfoArr.length = 0;
}

function setPlayStreamInfo(playIndex, status) {

	streamInfoArr.filter(function(value, index){
		if (value.PLAY_INDEX == playIndex){
			streamInfoArr[index].ISPLAYING = status;
		}
	});
}

function setMuteStreamInfo(playIndex, status) {

	streamInfoArr.filter(function(value, index){
		if (value.PLAY_INDEX == playIndex){
			streamInfoArr[index].ISMUTING = status;
		}
	});
}

function setPlayTimeStreamInfo(playIndex) {

	streamInfoArr.filter(function(value, index){
		if (value.PLAY_INDEX == playIndex){
			streamInfoArr[index].START_TIME = new Date().getTime();
		}
	});
}

function isPlayingSound() {

	var count = 0;
	streamInfoArr.filter(function(value, index){
		if (value.ISMUTING == false){
			count++;
		}
	});

	return count;
}

function getSelectedMedia() {

	return viewer.getSelectedMedia();
	/*
	if (VIEWER_COUNT > 1) {
		if (viewer.getSelectedMedia() == false)
			return 0;
		else
			return viewer.getSelectedMedia();
	} else {
		return 1;
	}
	*/
}

function getPlayIndex() {

	var playIndexArr = [];
	streamInfoArr.filter(function(value, index){
		if (value.ISPLAYING) {
			playIndexArr.push(value.PLAY_INDEX);
		}
	});

	playIndexArr.sort(function(a, b){return a-b});

	var newIndex = 1;
	for (var i in playIndexArr) {
		if (newIndex != (playIndexArr[i] % 10)) {
			break;
			//return newIndex;
		}
		newIndex++;
	}

	//var playIndex = parseInt(RANDOM_PLAYINDEX.toString() + newIndex.toString());
	//return newIndex;
	return createPlayIndex(newIndex, true);
}

function createPlayIndex(playIndex, bChange) {

	if (bChange){
		return parseInt(RANDOM_PLAYINDEX.toString() + playIndex.toString());
	} else {
		return playIndex;
	}
}

function isSelectedMedia(obj){

	if (viewer == null) return false;

	var media = viewer.getSelectedMedia();
	if (media == false) return false;

	var info = selectStreamingInfo(media);
	if (typeof info == "undefined") return false;
	if (info.MOBILE_NUM == obj.MOBILE_NUM && info.INSERT_DATE == obj.INSERT_DATE)
		return true;
	else
		return false;
}

function GetCountPlayingService() {

	var count = 0;
	streamInfoArr.filter(function(value, index){
		if (value.ISPLAYING == true){
			count++;
		}
	});

	return count;
}

function IsPlayingService(obj) {

	var isInclude = streamInfoArr.filter(function(item){
		return item.MOBILE_NUM == obj.MOBILE_NUM && item.INSERT_DATE == obj.INSERT_DATE;
	});

	if (isInclude.length > 0)
		return isInclude[0].ISPLAYING;
	else
		return false;
}

function IsPlayingService2(obj) {

	var isInclude = streamInfoArr.filter(function(item){
		return item.MOBILE_NUM == obj.P_CUST_CTN && item.INSERT_DATE == obj.P_INSERT_DATE;
	});

	if (isInclude.length > 0)
		return isInclude[0].ISPLAYING;
	else
		return false;
}


function IsMutingService(mediaId) {

	var isInclude = streamInfoArr.filter(function(item){
		return item.PLAY_INDEX == mediaId;
	});

	if (isInclude.length > 0) {
		return isInclude[0].ISMUTING;	// 음소거중
	} else
		return true;
}

function selectStreamingInfo(playIndex) {

	var isInclude = streamInfoArr.filter(function(item){
		return item.PLAY_INDEX == playIndex && item.ISPLAYING == true;
	});
	return isInclude[0];
}

function selectStreamingInfo2(MOBILE_NUM) { //, INSERT_DATE) {

	var isInclude = streamInfoArr.filter(function(item){
		return item.MOBILE_NUM == MOBILE_NUM; // && item.INSERT_DATE == INSERT_DATE;
	});
	return isInclude[0];
}

function selectARStreamingInfo() {

	//console.log('selectARStreamingInfo() streamInfoArr : ', streamInfoArr);

	var isInclude = streamInfoArr.filter(function(item){
		return item.FEATURE_KEY != null
	});
	return isInclude[0];
}

function stopVideoAll() {
	//console.log('stopVideoAll : ', streamInfoArr.length);
	for (var i in streamInfoArr) {
		console.log('streamInfoArr : ',i , ' ', streamInfoArr[i].ISPLAYING);
		if (streamInfoArr[i].ISPLAYING){
			stopVideo(streamInfoArr[i].PLAY_INDEX);
		}
	}
}

function copyTempStreamInfo(fullscreenIndex) {

	streamInfoTempArr.length = 0;

	for (var i in streamInfoArr) {
		if (streamInfoArr[i].ISPLAYING){
			var obj = clone(streamInfoArr[i]);
			streamInfoTempArr.push(obj);
		}
	}
}

// 풀 스크린 후 되돌아 왔을 때 비디오 재생 함수
function startVideoAllPlaying() {

	// PLAY_INDEX에 따라 정렬
	streamInfoTempArr.sort(function (a, b) {
		return a.PLAY_INDEX < b.PLAY_INDEX ? -1 : a.PLAY_INDEX > b.PLAY_INDEX ? 1 : 0;
	});

	for (var i in streamInfoTempArr) {

		if (streamInfoTempArr[i].ISPLAYING){

			if (VIEWER_COUNT == i) break;

			var obj = streamInfoTempArr[i];
			if (typeof obj != "undefined") {
				startStream(browser.name, browser.version, obj, streamInfoTempArr[i].PLAY_INDEX, false, false, true);
			}
		}
	}
}

// 뷰어 화면 갯수 전환 시에 비디오 재생 함수
function startVideoAll() {

	for (var i in streamInfoArr) {
		if (VIEWER_COUNT == i) break;
		var obj = streamInfoArr[i];

		var isContinue = false;
		for (var j in streamInfoTempArr) {
			var tempObj = streamInfoTempArr[j];
			if (obj.MOBILE_NUM == tempObj.MOBILE_NUM){
				isContinue = tempObj.ISPLAYING;
				//startStream(browser.name, browser.version, obj, ++i, false, false, tempObj.ISPLAYING);
				break;
			}
		}

		var playIndex = createPlayIndex(++i, true);

		startStream(browser.name, browser.version, obj, playIndex, false, false, isContinue);
	}
}

function setValueArrInfo(arr, obj, value) {

	for (var i in arr) {
		if (arr[i].MOBILE_NUM == obj.MOBILE_NUM && arr[i].INSERT_DATE == obj.INSERT_DATE) {
			arr[i].ISPLAYING = value;
		}
	}
}

function adjustAppletSize(adjContainer) {

	//alert('adjustAppletSize')
	var top  = adjContainer.offset().top;
	var left = adjContainer.offset().left;
	console.log(top, left);
	
	$("applet").offset({ top : top ,left : left });

	$("applet").width(adjContainer.width());
	$("applet").height(adjContainer.height());
}


var isChangViewOpen = false;	
function createChannelView() {
	if (isChangViewOpen) {
		$("#changeView").remove();
		isChangViewOpen = false;
	} else {
		isChangViewOpen = true;
		var iframe = $(document.createElement("iframe")).attr({
			"id" : "changeView",
			"width": "64",
			"height": "184",
			"frameborder": "0",
			"scrolling": "no",
			"allowTransparency": "true",
			"style" : "position:absolute; left:-5px; top:-214px; no-repeat 0 0; z-index:-10;"
		});
		
		$("#changeBtn").append(iframe);
	}
}


function play(a, object){

	if (SERVICE_CLASS == 1 || SERVICE_CLASS == 2 || SERVICE_CLASS == 4) {
		if (a == '4' || a == '9') {
			alert("해당 서비스를 이용할 수 없습니다.\n관리자에게 문의 바랍니다.");
			return;
		}
	}
	
	if (VIEWER_COUNT == a) return;

	if (!bServiceEnable || bLoadingServiceList) {
		alert('영상 뷰어 로딩 중입니다.\n화면 전환은 잠시 후 이용해 주세요.');
		return;
	}

	//$("#play01").css("color", "#434343");
	//$("#play04").css("color", "#434343");
	//$("#play09").css("color", "#434343");
	
	var before_val = VIEWER_COUNT;
	//$('input:radio[name=viewer_count]:input[value='+a+']').prop("checked", true);

	var bChange = playCountFunction(a, before_val);

	if (bChange) {
		var _this = $(object);
		_thisParent = _this.parent();
		_thisParent.parent().removeClass('show');

		_this.attr("style", "background-color: #0099ff");
		_this.siblings().removeAttr("style");

		createChannelView();		
		VIEWER_COUNT = a;
		reLoadViewer(user_id, browser);		
	}

	if (VIEWER_COUNT == "1") {
		$("#liveBtnImage").removeClass("hide");
		playHide(false);
		historyHide(false);
	} else {
		$("#liveBtnImage").addClass("hide");
		playHide(true);
		historyHide(true);
	}
}

function playCountFunction(a, before_val){

	var playCount = GetCountPlayingService();

	var check_val = a;
	if (playCount > check_val) {
		if(confirm("영상 중 일부만 재생될 수 있습니다. 계속 하시겠습니까?")) {
			return true;					
		}else {
			return false;
		}
	} else {
		return true;		
	}
}

function setNoticeCount() {

	var mediaId = viewer.getSelectedMedia();
	if (mediaId == false) return;

	streamInfo = selectStreamingInfo(mediaId);
	
	if (typeof streamInfo == "undefined") console.log('undefined streamInfo : ', mediaId)
	
	var param = {
		"P_CUST_CTN": streamInfo.MOBILE_NUM,
		"P_INSERT_DATE": streamInfo.INSERT_DATE
	}
		
	$.ajax({
		url:'/getCountNewNoticeOnChannel',
		type:'POST',
		data : param,
		success:function(data){
			// var noticeInfo = {};
			// noticeInfo.mediaId = mediaId;
			// noticeInfo.totalCount = data.length;
			// manageNotice.add(noticeInfo);
			// var Notice = manageNotice.getNotice(mediaId);
			// var unReadCount = Notice.getUnreadCount()
			// console.log('unReadCount : ', unReadCount);
			console.log(data.NOTICE_COUNT)
			changeNoticeCount(data.NOTICE_COUNT);
		}
	});	
}

function logServerUpload(dir, operate, param, result)
{
	var socket = io.connect();

	var logInfo = {};

	if (dir == 0)
		logInfo.DIR = 'call';
	else if (dir == 1)
		logInfo.DIR = 'result';
	else if (dir == 2)
		logInfo.DIR = 'callback';

	//logInfo.DIR = dir == 0 ? 'call' : 'result' : 'callback';
	logInfo.USER_ID = user_id;
	logInfo.OPERATE = operate;
	logInfo.PARAM = param;
	logInfo.RESULT = result;
	//alert(logInfo);
	socket.emit('log_OperatePCViewer', logInfo);
}

function DeleteAllRequestStreamInfo()
{
	requestStreamInfoArr.length = 0;
}

function AddRequestStreamInfo(playIndex)
{
	requestStreamInfoArr.push(playIndex);

	//console.log('requestStreamInfoArr add');
	CheckNewServiceEnable();	
}

function GetSizeRequestStreamInfo()
{
	return requestStreamInfoArr.length;
}

function CheckNewServiceEnable() {

	if (GetSizeRequestStreamInfo() == 0) {	
		console.log("======================= change viewer count Enable =========================");
		setTimeout(function() {
			console.log("======================= real change viewer count Enable =========================");
			bServiceEnable = true;
		}, 2000);
	} else {
		bServiceEnable = false;
	}
}

function DeleteRequestStreamInfo(playIndex)
{
	console.log('b requestStreamInfoArr length ', requestStreamInfoArr.length);
	for (var i in requestStreamInfoArr) {
		if (requestStreamInfoArr[i] == playIndex) {
			requestStreamInfoArr.splice(i, 1);
		}
	}
	console.log('a requestStreamInfoArr length ', requestStreamInfoArr.length);
	
	CheckNewServiceEnable();
}

//# start 20170607 by ywhan
function setFeatureKeyStreamInfo(playIndex, featureKey) {

	streamInfoArr.filter(function(value, index){
		if (value.PLAY_INDEX == playIndex){
			streamInfoArr[index].FEATURE_KEY = featureKey;
		}
	});
}

function sendMessageToApplet(command, data) {
	if(data.VIEW_TYPE == 3 && data.VIEW_NUM == user_id && VIEWER_COUNT == 1) {
		if (typeof data.COMMAND == 'undefined') data.COMMAND = command;

		switch (command) {
			case 'B210':
			{
				if (data.AR_STATUS == "0") {
					console.log('getLearnableImage()');
					getLearnableImage();
					//setupARMemo(data);
				} else {
					alert('다른 사용자가 AR메모 서비스를 사용 중입니다.');
				}
				break;
			}
			case 'B220':
			{
				break;
			}
			case 'B211':
			{
				//setFeatureKeyStreamInfo(data.PLAY_INDEX, data.FEATURE_KEY);
				GetPCViewerList(user_id, browser, function() {
				});
				break;
			}
			case 'B212':
			{
				break;
			}
			case 'B216':
			{
				// confirm 함수 특성 상 현재의 정보를 미리 갖고 있어야 함. 그렇지 않으면 문제 발생
				var curStreamInfo = selectStreamingInfo(viewer.getSelectedMedia());
				if (data.KEEP_OWNER == "Y") {
					sendARMemoEnd("response", "N", curStreamInfo)
				} else {
					if (viewer.isTracking()) {
						// var option = {
						// 	"type" : "QUESTION",
						// 	"message" : "AR 메모 서비스가 종료되었습니다.<br />AR 트래킹을 계속 하시겠습니까?",
						// 	"keep" : 10
						// };
						var option = {
							"type" : "QUESTION",
							"message" : "AR 메모 서비스가 종료되었습니다.<br />AR 트래킹을 계속 하시겠습니까?",
							"continue_fun" : function() {
												option.stop_timeout = true;
												removeArStopSystemPopup(false);
											},
							"stop_fun" : function() {
												option.stop_timeout = true;
												removeArStopSystemPopup(true);
											},
							"auto_stop_fun" : function() {
												option.stop_timeout = true;
												removeArStopSystemPopup(true);
											},
							"stop_val" : "종료",
							"keep" : 10,
							"stop_timeout" : false
						};						
												
						createArStopSystemPopup(curStreamInfo, option);
					}
				}
				break;
			}
			case 'B217':
			{
				// Camera.direction = Camera.direction == CAMERA_FACING_BACK ? CAMERA_FACING_FRONT : CAMERA_FACING_BACK;

				// if(arStatus == "tracking") {
				// 	if (isHistory) {
				// 		//playHide(true);
				// 	} else {
				// 		//tracking2Applet();
				// 	}
				// 	//stopTracking(false);
				// 	if (!isLearnableImage()) {
				// 		$("#arStopBtn").addClass("hide");
				// 		$("#inputImageToggleBtn").addClass("hide");
				// 		toastPop("전면 카메라로 전환되어 AR메모 서비스를 중지 합니다.");
				// 		stopInputTrackingImage();
				// 		playHide(true);
				// 	} else {
				// 		$("#arStopBtn").removeClass("hide");
				// 		$("#inputImageToggleBtn").removeClass("hide");
				// 		toastPop("후면 카메라로 전환되어 AR메모 서비스를 시작합니다.");
				// 		startInputTrackingImage();
				// 		playHide(false);
				// 	}
				// } else if (arStatus == "canvas") {
				// 	toastPop("전면 카메라로 전환되어 AR메모 서비스를 시작할 수 없습니다. 영상 화면으로 전환합니다.");
				// 	cancelArCanvas();
				// 	playHide(true);
				// } else if (arStatus == "applet") {
				// 	if (!isLearnableImage()) {	
				// 		toastPop("전면 카메라로 전환되어 AR메모 서비스를 시작할 수 없습니다.");
				// 		playHide(true);
				// 	} else {
				// 		toastPop("후면 카메라로 전환되어 AR메모 서비스를 시작할 수 있습니다.");
				// 		playHide(false);
				// 	}
				// }
				// break;
			}
			case 'B510':	// 카메라 상하반전 이벤트
			{
				Camera.changeType = Camera.direction == data.CAMERA_TYPE ? CAMERA_CHANGE_ROTATION : CAMERA_CHANGE_FACING;
				Camera.direction = data.CAMERA_TYPE == 1 ? CAMERA_FACING_FRONT : CAMERA_FACING_BACK;
				Camera.rotation = data.CAMERA_ANGLE == 0 ? CAMERA_ROTATION_0 : CAMERA_ROTATION_180;

				// if (data.CAMERA_ANGLE == 0) {  	// 카메라 방향 정상각도

				// } else {						// 카메라 방향 상하반전

				// }
				break;
			}
		}

		viewer.sendToApplet(data);
		console.log('sendToApplet :', data);
	}
}

function getCameraChangeType() {
	return Camera.changeType;
}

function isEnableCameraRotation() {
	if (Camera.rotation == CAMERA_ROTATION_180) return false;	
	return true;
}

function isEnableCameraDirection() {
	if (Camera.direction == CAMERA_FACING_FRONT) return false;	
	return true;
}

function sendARMemoSetUp(bUse) {

	var streamInfo = selectStreamingInfo(viewer.getSelectedMedia());

	var msg = {};
	msg.COMMAND = 'B210';
	msg.BODY = "MOBILE_NUM=" + streamInfo.MOBILE_NUM + "&VIEW_TYPE=" + streamInfo.VIEW_TYPE + "&VIEW_NUM=" + streamInfo.VIEW_NUM;
	msg.BODY += "&VIEW_INDEX=" + streamInfo.VIEW_INDEX + "&PLAY_INDEX=" + streamInfo.PLAY_INDEX;

	if (bUse){
		msg.BODY += '&A_STATUS=1';
	} else {
		msg.BODY += '&A_STATUS=9' + '&RET_CODE=0001';
	}

	socket.emit('B210', msg);
}

function sendARMemolearnResult(arInfo, bReuse) {

	var streamInfo = selectStreamingInfo(viewer.getSelectedMedia());

	var msg = {};
	msg.COMMAND = 'B211';
	msg.BODY = "MOBILE_NUM=" + streamInfo.MOBILE_NUM + "&VIEW_TYPE=" + streamInfo.VIEW_TYPE + "&VIEW_NUM=" + streamInfo.VIEW_NUM;
	msg.BODY += "&VIEW_INDEX=" + streamInfo.VIEW_INDEX + "&PLAY_INDEX=" + streamInfo.PLAY_INDEX;
	msg.BODY += "&RET_CODE="+ arInfo.RET_CODE + "&LEARNING_START_TIME="+ arInfo.LEARNING_START_TIME + "&LEARNING_END_TIME="+ arInfo.LEARNING_END_TIME;

	// AR 이력 재사용 시 추가될 내용
	if (bReuse){
		msg.BODY += "&FEATURE_KEY="+ arInfo.FEATURE_KEY;
	}

	socket.emit('B211', msg);
}

function sendARMemoNotiRes(arInfo) {

	//var streamInfo = selectARStreamingInfo();

	//console.log('sendARMemoNitoRes() arInfo : ', arInfo);

	var msg = {};
	msg.COMMAND = 'B212';
	msg.BODY = "MOBILE_NUM=" + arInfo.MOBILE_NUM + "&VIEW_TYPE=" + arInfo.VIEW_TYPE + "&VIEW_NUM=" + arInfo.VIEW_NUM;
	msg.BODY += "&VIEW_INDEX=" + arInfo.VIEW_INDEX + "&PLAY_INDEX=" + arInfo.PLAY_INDEX;
	msg.BODY += "&DATA_CNT=" + arInfo.DATA_CNT;

	//console.log('socket.emit : ', msg);

	socket.emit('B212', msg);
}

function sendARMemoHistory(hisInfo) {

	var msg = {};

	var streamInfo = selectStreamingInfo(viewer.getSelectedMedia());

	msg.COMMAND = 'B214';
    msg.BODY = "MOBILE_NUM=" + streamInfo.MOBILE_NUM + "&VIEW_TYPE=" + streamInfo.VIEW_TYPE + "&VIEW_NUM=" + streamInfo.VIEW_NUM;
    msg.BODY += "&VIEW_INDEX=" + streamInfo.VIEW_INDEX + "&PLAY_INDEX=" + streamInfo.PLAY_INDEX;
	msg.BODY += "&AR_CNT=" + hisInfo.AR_CNT + "&FEATURE_KEY_LIST=" + hisInfo.FEATURE_KEY_LIST;

	socket.emit('B214', msg);
}

function sendARMemoStatus(statusValue) {

	var streamInfo = selectStreamingInfo(viewer.getSelectedMedia());

	var msg = {};
	msg.COMMAND = 'B215';
	msg.BODY = "MOBILE_NUM=" + streamInfo.MOBILE_NUM + "&VIEW_TYPE=" + streamInfo.VIEW_TYPE + "&VIEW_NUM=" + streamInfo.VIEW_NUM;
	msg.BODY += "&VIEW_INDEX=" + streamInfo.VIEW_INDEX + "&PLAY_INDEX=" + streamInfo.PLAY_INDEX;
	msg.BODY += "&FEATURE_KEY=" + streamInfo.FEATURE_KEY + "&TSTATUS=" + statusValue + "&RET_CODE=0000";

	socket.emit('B215', msg);
}

function sendARMemoEnd(httpMethod, isContinue, curStreamInfo) {

	var streamInfo;
	if (typeof curStreamInfo == "undefined")
		streamInfo = selectStreamingInfo(viewer.getSelectedMedia());
	else
		streamInfo = curStreamInfo;

	var msg = {};
	msg.COMMAND = 'B216';
	msg.BODY = "MOBILE_NUM=" + streamInfo.MOBILE_NUM + "&VIEW_TYPE=" + streamInfo.VIEW_TYPE + "&VIEW_NUM=" + streamInfo.VIEW_NUM;
	msg.BODY += "&VIEW_INDEX=" + streamInfo.VIEW_INDEX + "&PLAY_INDEX=" + streamInfo.PLAY_INDEX;

	if (httpMethod == 'request') { // request
		msg.BODY += "&FEATURE_KEY=" + streamInfo.FEATURE_KEY;
		msg.METHOD = "request";
	} else { // response
		msg.BODY += "&SERVICE_YN=" + isContinue;
		msg.METHOD = "response";
	}

	if (isOwner) {
		msg.BODY += "&KEEP_OWNER=Y";
	} else {
		msg.BODY += "&KEEP_OWNER=N";
	}

	socket.emit('B216', msg);
}
//# end

function sendNoticeOnChannel(seq, type){

	var streamInfo = selectStreamingInfo(viewer.getSelectedMedia());

	var msg = {};
	msg.COMMAND = 'B230';
	msg.BODY = "MOBILE_NUM=" + streamInfo.MOBILE_NUM + "&VIEW_TYPE=" + streamInfo.VIEW_TYPE + "&VIEW_NUM=" + streamInfo.VIEW_NUM;
	msg.BODY += "&VIEW_INDEX=" + streamInfo.VIEW_INDEX + "&PLAY_INDEX=" + streamInfo.PLAY_INDEX;
	msg.BODY += "&SEQ=" + seq + "&CRUD=" + type;

	socket.emit('B230', msg);
}

function sendNoticeResponseOnChannel(data){

	var streamInfo = selectStreamingInfo2(data.MOBILE_NUM);

	var msg = {};
	msg.COMMAND = 'B231';
	msg.BODY = "MOBILE_NUM=" + streamInfo.MOBILE_NUM + "&VIEW_TYPE=" + streamInfo.VIEW_TYPE + "&VIEW_NUM=" + streamInfo.VIEW_NUM;
	msg.BODY += "&VIEW_INDEX=" + streamInfo.VIEW_INDEX + "&PLAY_INDEX=" + streamInfo.PLAY_INDEX;
	msg.BODY += "&OWNER_KEY=" + data.OWNER_KEY + "&SEQ=" + data.SEQ;

	socket.emit('B231', msg);
}


/*
function getCpuModelInfo(model) {
	logServerUpload(2, 'getCpuModelInfo', model, '');
	CPU = model;	
	//toast(CPU);
	//console.log('cpu:', model);
}

function getMemInfo(mem) {
                
    logServerUpload(2, 'getMemInfo', mem, '');
    MEM = mem;
    
//    console.log('mem: ', mem);
    
    if (CPU == '' || MEM == '') {
        isService9Viewer = 0;
        isEnableCPU = 0;
        isEnableMEM = 0;
        
        autoStartVideo();
    } else {
        var cpuDArr = CPU.split('@');
        var hz = cpuDArr[1].replace(/ /g, '');
            
        var cpuArr = CPU.split(' ');
        var manufacturer = cpuArr[0].split('(')[0];
        var corebrand = cpuArr[1].split('(')[0];
        var namebrand = cpuArr[2];    
            
        var mem = MEM.split(' ')[0];    
            
        $.ajax({
            url:'/IsService9Viewer',
            type:'POST',
            data : {
                manufacturer : manufacturer,
                corebrand : corebrand,
                namebrand : namebrand,
                hz : hz,
                mem    : mem
            },
            success:function(data){
//                isService9Viewer = data.CPU_COUNT; // & data.MEM_COUNT;
                isEnableCPU = data.CPU_COUNT > 0 ? 1 : 0;
                isEnableMEM = Number(mem) < 8 ? 0 : 1;
                isService9Viewer = isEnableCPU & isEnableMEM;
                
                autoStartVideo();                                                            
            }
        });        
    }
}
*/

