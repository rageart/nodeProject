Date.prototype.formatDate= function(f) {
  
      //alert(123);
  
      if (!this.valueOf()) return " ";
  
      var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
      var d = this;
  
      return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
          switch ($1) {
              case "yyyy": return d.getFullYear();
              case "yy": return (d.getFullYear() % 1000).zf(2);
              case "MM": return (d.getMonth()+1).zf(2);
              case "dd": return d.getDate().zf(2);
              case "E": return weekName[d.getDay()];
              case "HH": return d.getHours().zf(2);
              case "hh": return d.getHours().zf(2);
              case "mm": return d.getMinutes().zf(2);
              case "ss": return d.getSeconds().zf(2);
              case "a/p": return d.getHours() < 12 ? "AM" : "PM";
              default: return $1;
          }
      });
  };
  
String.prototype.string = function(len)
{
    var s = '', i = 0; 
    while (i++ < len) { 
      s += this; 
    } 
    return s;
};

String.prototype.zf = function(len)
{
  return "0".string(len - this.length) + this;
};

Number.prototype.zf = function(len)
{
  return this.toString().zf(len);
};  

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
      for (var i = 0; i < digits - n.length; i++)
          zero += '0';
  }
  return zero + n;
}

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

function byteConvertor(bytes) {

  bytes = parseInt(bytes);

  var s = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  var e = Math.floor(Math.log(bytes) / Math.log(1024));

  if (e == "-Infinity") return "0 " + s[0];
  else return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];
}

function term(startTime,endTime){

  var startDate = new Date(parseInt(startTime.substring(0,4), 10),
             parseInt(startTime.substring(4,6), 10)-1,
             parseInt(startTime.substring(6,8), 10),
             parseInt(startTime.substring(8,10), 10),
             parseInt(startTime.substring(10,12), 10),
             parseInt(startTime.substring(12,14), 10)
            );
   var endDate = new Date(parseInt(endTime.substring(0,4), 10),
             parseInt(endTime.substring(4,6), 10)-1,
             parseInt(endTime.substring(6,8), 10),
             parseInt(endTime.substring(8,10), 10),
             parseInt(endTime.substring(10,12), 10),
             parseInt(endTime.substring(12,14), 10)
            );

   // 두 일자(startTime, endTime) 사이의 차이를 구한다.
   var dateGap = endDate.getTime() - startDate.getTime();
   var timeGap = new Date(0, 0, 0, 0, 0, 0, endDate - startDate);

   // 두 일자(startTime, endTime) 사이의 간격을 "일-시간-분"으로 표시한다.
   var diffDay  = Math.floor(dateGap / (1000 * 60 * 60 * 24)); // 일수
   var diffHour = timeGap.getHours();       // 시간
   var diffMin  = timeGap.getMinutes();      // 분
   var diffSec  = timeGap.getSeconds();      // 초

   return diffDay;
}

function today(){
  var today = new Date();

  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  var hour = today.getHours();
  var min = today.getMinutes();
  var second = today.getSeconds();

  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  if (hour < 10) {
    hour = '0' + hour;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (second < 10) {
    second = '0' + second;
  }
  var date = year + '' + month + '' + day + '' + hour + '' + min + '' + second;
  return date
}

exports.GetBrowserInfo = GetBrowserInfo;
exports.byteConvertor = byteConvertor;
exports.term = term;
exports.today = today;
exports.leadingZeros = leadingZeros;