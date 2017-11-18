/**
 * UtilLibWeb.js
 * 작성자: 이준혁
 * 최초작성일: 17.11.02
 */
function GetBrowserInfo(userAgent) {

    var start, end;
    var browser = new Object();

    browser.name = 'Chrome';
    start = userAgent.indexOf(browser.name);

    if (start > -1) {
        browser.version = userAgent.substr(start + browser.name.length + 1, 2);
        return browser;
    }

    browser.name = 'Firefox';
    start = userAgent.indexOf(browser.name);
    if (start > -1) {
        browser.version = userAgent.substr(start + browser.name.length + 1, 2);
        return browser;
    }

    browser.name = 'Trident';
    start = userAgent.indexOf(browser.name);
    if (start > -1) {
        // +3을 해야 ie실제 버전과 맞는다.
        browser.version = Number(userAgent.substr(start + browser.name.length + 1, 1));
        browser.version += 4;
        browser.name = "IE";
        return browser;
    }
}

function leadingZeros(n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (var i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
}

function setCookie(cookieName, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var cookieValue = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toGMTString());
    document.cookie = cookieName + "=" + cookieValue;
}

function deleteCookie(cookieName) {
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() - 1);
    document.cookie = cookieName + "= " + "; expires=" + expireDate.toGMTString();
}

function getCookie(name) {
    var cname = name + "=";
    var dc = document.cookie;
    if (dc.length > 0) {
        begin = dc.indexOf(cname);
        if (begin != -1) {
            begin += cname.length;
            end = dc.indexOf(";", begin);
            if (end == -1)
                end = dc.length;
            return unescape(dc.substring(begin, end));
        }
    }
    return null;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getGapTimeClientToServer() {
    var xmlHttp;

    function svcTime() {
      xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
      xmlHttp.open('HEAD', window.location.href.toString(), false);
      xmlHttp.setRequestHeader("Content-Type", "text/html");
      xmlHttp.send('');
      return xmlHttp.getResponseHeader("Date");
    }

    var st = svcTime();
    var serverDate = new Date(st);
    var clientDate = new Date();

    return parseInt(clientDate - serverDate);
  }

  function clone(obj) {
    if (obj === null || typeof(obj) !== 'object')
      return obj;

    var copy = obj.constructor();

    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = obj[attr];
      }
    }

    return copy;
  }

// 게시판 공통 function 모음
var common_list = {
    /*
     * 게시판 페이징
     * */
    pagination: function(currentPage, pageSize, url, data) {
        $.ajax({
            url: url,
            type: 'GET',
            data: data,
            success: function(data, status) {
                //전체개수
                console.log(data[0].CNT);
                var totalCount = data[0].CNT;
                $('#count').html("(총 "+totalCount+"건)");
                var numPages = Math.ceil(totalCount / pageSize);
                var href = "";
                var a = window.location.search.substr(1);
                if (a != '') {
                    var params = a.split('&');
                    console.log('params.length;' + params.length);
                    console.log(params);
                    for (var i = 0; i < params.length; i++) {
                        var param = params[i].split('=');
                        console.log('param :' + param[i]);
                        if (param[0] == 'page') {} else {
                            href += "&" + param[0] + "=" + param[1];
                            console.log('href: ' + href);
                        }
                    }
                }
                $('#paging').paging({
                    current: currentPage,
                    max: numPages,
                    href: "?page={0}" + href
                });
            }
        });
    },
    dept1: function() {
        $.ajax({
            url: '/optionDept1',
            type: 'GET',
            async: false,
            success: function(data) {
                $(data).each(function(index, item) {
                    var option = $("<option></option>").attr("value", item.CODE).text(item.CODE_NM);
                    $("#dept1").append(option);
                });
            }
        });
    },
    dept2: function(dept_code_01, option) {

        $.ajax({
            url: '/optionDept2',
            type: 'GET',
            async: false,
            data: {
                dept_code_01: dept_code_01
            },
            success: function(data) {
                $('#dept2').empty();
                if (option == 'all') {
                    var option1 = $("<option></option>").attr("value", "all").text('전체');
                    $("#dept2").append(option1);
                }
                $(data).each(function(index, item) {
                    var option = $("<option></option>").attr("value", item.CODE).text(item.CODE_NM);
                    $("#dept2").append(option);
                });
            }
        });
    },

    ajaxRequest : function(url, method, data) {
        $.ajax({
            url: url,
            type: method,
            data: data,
            success: function(data) {
                console.log(data);
            }
        });
    }
}

var common = {
	aside : function(){
		var $aside = $('aside'),
			 $toggleBtn=$('aside > .btn'),
			 $asideList = $aside.find('.aside-list');
             $plus= $('aside .content .plus');
             $aside_dept=$('.aside_dept');
			$asideList.find('.title').on('click', function(){
				if($(this).parent().hasClass('on')){
					$(this).parent().removeClass('on');
					$(this).next('.content').slideUp();
				} else {
					$(this).parent().addClass('on');
					$(this).next('.content').slideDown();
				}
			});
		$toggleBtn.on('click', function(){
			if($aside.hasClass('left')){
				if($aside.hasClass('on')){
					$aside.removeClass('on');
					$aside.animate({"left": "-=260px" },700);

					$(this).text('닫힘');
				} else{
					$aside.addClass('on');
					$aside.animate({"left": "+=260px" },700);

					$(this).text('열기');
				}
			} else {
				if($aside.hasClass('on')){
					$aside.removeClass('on');
					$aside.animate({"right": "-=260px" },700);
					$(this).text('닫힘');
				} else{
					$aside.addClass('on');
					$aside.animate({"right": "+=260px" },700);
					$(this).text('열기');
				}
			}
		});
        $plus.on('click', function(){
				if($plus.hasClass('on')){
					$plus.removeClass('on');
					$aside_dept.animate({"left": "+=1200px" },700);
				} else{
					$plus.addClass('on');
					$aside_dept.animate({"left": "-=1200px" },700);
				}
		});
}
}

//********************** socket start ********************************//
var socket = io.connect();

socket.on('logout', function(data) {
    if (data == $('#top_id').text()) {
        alert('다른 브라우저에서 동일한 아이디로 로그인하여 이전 세션의 연결을 종료합니다.\n확인을 누르면 로그아웃  됩니다.');
        location.href = "/logout";
    }
});
