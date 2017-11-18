function veiwerNotify() {
    notification.notify('success', 'PC뷰어 서비스 요청', {
        notification: {
            position: ['middle', 'top']
        }
    });
}
socket.on('B100', function(data) {
    veiwerNotify();
});

// 빠른 연결, 빠른 영상
socket.on('B101', function(data) {
    veiwerNotify();
});

function initMap() {

  var location =  [
          {lat: 37.4856752, lng: 126.8954674},
          {lat: 37.4856752, lng: 127.8954684},
          {lat: 37.4856752, lng: 128.8954694},
          {lat: 37.4856752, lng: 129.8954693}
        ];

  var image = "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=10%7Cc90000%7CffffFF";

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: location[0]
  });

  var marker = new google.maps.Marker({
      position: location[0],
      map: map,
      icon : image,
      draggable:false
  });

  var flightPath = new google.maps.Polyline({
          path: location,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        flightPath.setMap(map);
}

$('.img-thumbnail').click(function() {
    var agent = window.navigator.userAgent;
    agent = GetBrowserInfo(agent);
    var browser = agent.name + '' + agent.version;
    if (browser.indexOf('IE') > -1) {
    } else {
        alert(agent.name + "에서는 영상뷰어를  제공하지 않습니다.\nInternet Explorer11을 사용하세요.");
    }

    // 16:9의 비율을 기준
    var height, width;
    height = screen.availHeight - 70;
    width = ((height-70) * 16) / 9;

    var top = 0;
    var left = (screen.availWidth - width) / 2;

    if (browser.indexOf('IE') > -1) {
        var popOption = "width="+width+",height="+height+",top=" + top + ",left=" + left + ",  location=0, resizable=no, scrollbars=no, status=no; modal=yes";
        wo = window.open("/openpcviewer", "stream viewer", popOption);
        wo.focus();
    }
    // $('.modal-body').empty();
    // $($(this).parents('div').html()).appendTo('.modal-body');
    // $('#myModal').modal({
    //     show: true
    // });
});
