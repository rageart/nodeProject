$(document).ready(function() {
    jQuery.ajaxSetup({
        cache: false
    });
    $('#addChannel').click(function() {
        var channel = $("#channel").val();
        var description = $("#description").val();
        console.log(channel);
        console.log(description);
        $.ajax({
            url: '/setup/setting',
            type: 'POST',
            data: {
                channel: channel,
                description: description
            },
            success: function(data) {
                bootbox.alert(data.channel + " 추가 완료");
            },
            error: function(request, status, error) {
                bootbox.alert(request, status, error);
            }
        });
    });

    $('input[name=chn_list_chk]').click(function() {
        $('input[name=chn_list_chk]').removeAttr('checked');
        $(this).prop('checked', 'checked');
        chManger.setDefault();

        var channel = $(this).parents("tr").children("td:nth-of-type(2)").text();

        if ($(this).is(':checked')) {
            $('.shuttle #channel').text('채널명 : '+ channel);
            $('input[type="checkbox"][name="inlineCheckbox"]').prop('checked',false);
            $(this).prop('checked',true);
            $.ajax({
                url: '/channel/user',
                type: 'GET',
                data: {
                    channel: channel
                },
                success: function(data) {
                    $('#list').empty();

                    if (data.length == 0) {
                        var tr = $('<tr></tr>').attr({
                            "height": "40px",
                            "align": "center"
                        });
                        var td = $("<td colspan='10'></td>").attr("align", "center").text('사용자가 존재하지 않습니다.');
                        tr.append(td);
                        $('#list').append(tr);
                    } else {
                        $(data).each(function(index, item) {
                            var tr = $('<tr></tr>').attr({
                                "height": "40px",
                                "align": "center"
                            });
                            var td = $("<td></td>").attr({
                                "align": "center"
                            });
                            var td0 = td.clone().html("<div class='checkbox checkbox-uxp checkbox-inline'><input name='ultra_chk' type='checkbox'value='"+item.DEV_KEY+"'><label for='inlineCheckbox'></label></div>")
                            var td1 = td.clone().text(item.DEV_NM);
                            var td2 = td.clone().text(item.DEV_DEPT_NM);
                            var td3 = td.clone().text(item.MOBILE_NUM);
                            if(item.CHANNEL_AUTH==1){
                                var td4 = td.clone().html("<div class='radio radio-uxp radio-inline'><input name='chnMngBtn' type='radio' checked='checked' value='1' onclick='changeClick(this);'><label for='inlineRadio1'></label></div>")
                            }else{
                                var td4 = td.clone().html("<div class='radio radio-uxp radio-inline'><input name='chnMngBtn' type='radio' value='2' onclick='changeClick(this);'><label for='inlineRadio1'></label></div>")
                            }
                            tr.append(td0);
                            tr.append(td1);
                            tr.append(td2);
                            tr.append(td3);
                            tr.append(td4);
                            $('#list').append(tr);
                        });
                    }
                },
                error: function(request, status, error) {
                    alert(request, status, error);
                }
            });
        }
    });
});
