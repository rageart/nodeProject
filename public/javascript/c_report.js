$(document).ready(function() {
    jQuery.ajaxSetup({
        cache: false
    });
    $('#videoHistory tbody tr').click(function() {
        var CUST_CTN = $(this).children().eq(1).text();
        var INSERT_DATE = $(this).children().eq(6).text();
        INSERT_DATE = INSERT_DATE.replace(/[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\(\=]/gi, "");
        location.href = "/report/" + CUST_CTN + "/" + INSERT_DATE;
    });
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
