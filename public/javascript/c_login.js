$(document).ready(function() {
    jQuery.ajaxSetup({
        cache: false
    });

    var agent = window.navigator.userAgent;
    agent = GetBrowserInfo(agent);
    var browser = agent.name + '' + agent.version;
    if (browser == 'IE11') {} else if (browser.indexOf('IE') > -1 && browser != 'IE11') {
        bootbox.alert(agent.name + '' + agent.version + "은(는) 권장하지 않는 브라우저입니다.\nInternet Explorer 11 을 사용하세요.  ");
    } else {
        bootbox.alert(agent.name + "은(는) 권장하지 않는 브라우저입니다.\nInternet Explorer 11 을 사용하세요.  ");
    }

    var userInputId = getCookie("userInputId");
    $("#inputEmail").val(userInputId);

    if ($("#inputEmail").val() != "") { // 그 전에 ID를 저장해서 처음 페이지 로딩 시, 입력 칸에 저장된 ID가 표시된 상태라면,
        $("#saveID").attr("checked", true); // ID 저장하기를 체크 상태로 두기.
    }

    $("#saveID").change(function() { // 체크박스에 변화가 있다면,
        if ($("#saveID").is(":checked")) { // ID 저장하기 체크했을 때,
            setCookie("userInputId", $("#inputEmail").val(), 7); // 7일 동안 쿠키 보관
        } else { // ID 저장하기 체크 해제 시,
            deleteCookie("userInputId");
        }
    });

    // ID 저장하기를 체크한 상태에서 ID를 입력하는 경우, 이럴 때도 쿠키 저장.
    $("#inputEmail").keyup(function() { // ID 입력 칸에 ID를 입력할 때,
        if ($("#saveID").is(":checked")) { // ID 저장하기를 체크한 상태라면,
            setCookie("userInputId", $("#inputEmail").val(), 7); // 7일 동안 쿠키 보관
        }
    });

});
