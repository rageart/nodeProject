UI = {
	load: function(){
		UI.stipulationWrap();
		UI.settings_area();
		UI.cctv();
		UI.accessAction();
		UI.alignRadio();
		UI.checkbox();
		UI.thumbnailPress();
		UI.remoteList();
		UI.on_off();
		UI.btn_volum();
		UI.play_btn_s();
		UI.full_screen();
		UI.fullScreen();
		UI.loginInput();
		UI.thumbnail_delete();
		UI.qna_list();
		UI.settings();
		UI.notice_list();
		UI.info_tab();
		UI.photo_modify();
		UI.lnb();
		UI.detail_ico();
	},

	stipulationWrap: function(){
		var winH = $(window).height(),
		top_title = $('#stipulation .top_title').height(),
		bottom = $('#stipulation .bottom').height(),
		aHeught = top_title + 58,
		conH = $('#stipulation .contents');
		conH.css({'height':winH - aHeught});
	},
	settings_area: function(){
		var	winW = $(window).width(),
		winH = $(window).height(),
		warpW = $('#wrap').width(),
		settings = $('#settings .settings_area'),
		btn_save = $('#settings .btn_save');
		settings.css({'height':winH - 100});
		if(winW < 1035 ){
			btn_save.addClass('minw');
		}else{
			btn_save.removeClass('minw');
		}
	},
	cctv: function(){
		var	winW = $(window).width(),
			winH = $(window).height() -$('#select_cctv_btn').height(),
			wrap = $('#cctv_wrap'),
			cctv = $('#cctv'),
			big = $('.video_big'),
			video = $('.video_big .video'),
			wrapH = winH - $('#remocon_wrap').height()-11,
			cctvH = winH - $('#remocon_wrap').height()- $('#select_cctv_btn').height(),

			cctvW = wrap.width();
			cctv4 = $('#cctv .video_list');
			cctv4_in = $('#cctv .video_list .inner');

			cctv4_video = $('.inner_wrap .video');

		// start : modified by jyongt 08.17
		//if (location.pathname.indexOf("/OpenPCViewerN_pb") == -1) {
		//	wrap.css({'height':wrapH});
		//} else {
			wrap.css({'height':cctvW * 0.5625});
		//}

		// wrap.css({'height':wrapH});
		// end

		cctv.css({'width':cctvW,'height':cctvH});
		var bigH1 = cctvH;
		var bigW1 = cctvH * 1.777777;

		var bigW2 = cctvW;
		var bigH2 = cctvW * 0.5625;

		var marT1 = - bigH1 / 2;
		var marL1 = - bigW1 / 2;

		console.log('wrap : ', wrap.width());
		console.log('cctv : ', cctv.width());
		//console.log('bigW2 : ', bigW2);
		//console.log('bigW1 : ', bigW1);

		

		var marT2 = - bigH2 / 2;
		var marL2 = - bigW2 / 2;

		var bigW3 = cctvW-8;
		var bigH3 = bigW3*9/16+82;
/*
		console.log('winW : ' +  winW + ', winH : ' +  winH + ', bigW2 : ' +  bigW2 + ', bigW1 : ' +  bigW1 + ', bigH1 : ' +  bigH1+ ', bigH2 : ' +  bigH2  );
		console.log('marT2 : ' +  marT2 + ', marL2 : ' +  marL2   );

		//alert(winW + ","+ winH + ","+ bigW1 + ","+ bigW2+ ","+ marT2);
		if(winW < 1024 || winH < 570){
			//big.css({'width':824,'height':464,'margin-top':-232,'margin-left':-412,'left':'50%','top':'50%'});
			console.log('1 winW : ', winW);
			console.log('1 winH : ', winH); 
			big.css({'width':824,'height':464,'margin-top':-232,'margin-left':-412,'left':'30%','top':'50%'}); //ywhan
			video.css('height',424);
		}else if(bigW2 > bigW1){
			//big.css({'width':bigW1,'height':bigH1,'margin-top':0,'margin-left':marL1,'left':'50%','top':0});
			console.log('2 bigW2 : ', bigW2);
			console.log('2 bigW1 : ', bigW1);
			big.css({'width':bigW1,'height':bigH1,'margin-top':0,'margin-left':marL1,'left':'50%','top':0}); //ywhan
			video.css('height',bigH1 - 40);
		}else{
			//big.css({'width':bigW2,'height':bigH2,'margin-top':marT2,'margin-left':0,'left':0,'top':'50%'});
			console.log('3 bigW2 : ', bigW2);
			console.log('3 bigW1 : ', bigW1);
			big.css({'width':bigW2,'height':bigH2 ,'margin-left':0,'left':0 });//dj
			video.css('height',bigH2 - 40);
		}
*/
			console.log('bigW2 :', bigW2);
			console.log('bigH2 : ', bigH2);
			
			big.css({'width':bigW2,'height':bigH2+25 ,'margin-left':0,'left':0 });//dj
			video.css('height',bigH2);//고정

		//console.log($('#cctv_wrap').height()< bigH3)
		if($('#cctv_wrap').height()< bigH3){
			bigH3 = $('#cctv_wrap').height() - 24;
			bigW3 = (bigH3-82)*16/9;
		}
		cctv4.css({'width':bigW3,'height':bigH3,'margin-top':-bigH3/2+10,'left':0,'top':'50%'});
		arg = ($('#cctv_wrap').width() - cctv4.width())/2;
		cctv4.css({'margin-left':arg});
		cctv4_in.css({'height':bigH3/2-14,'width':bigW3/2-8});
		cctv4_video.css({'height':cctv4_in.height()-45});
		//$('.video_list ul .inner .info').css({'width':bigW3/2-37})
		$('.video_list ul .inner .hover').css({'height':cctv4_in.height() - 4,'width':bigW3/2-12});
		//cctv2 일때 가운데 정렬~
		var cctv_len = $(".video_list >ul >li").length;
		var cctv2_top = (cctv.height() - cctv4_in.height())/2;
		if(cctv_len == 2){
			cctv4.css({'margin-top':-cctv2_top});
		}
	},

	layerOpen: function(aa){
		$(aa).show();		
	},

	accessAction: function(){
		/*var flag = false;

		$('.btn_access').click(function(){
			if(flag){
				$('.accessLayer').show();
			}else{
				$('.accessLayer').show();
				$('.scroll_wrap').customScrollbar();
				flag = true;
			}
		});*/

		$('.btn_access').click(function(){
			$('.accessLayer').show();
		});
	},

	layerClose: function(aa){		
		$(aa).hide();		
	},
	fullScreen: function(aa,val){
		
		if(val == "open"){
			$(aa).show();
			toggleFull(true);	
		}else if(val == "close"){
			$(aa).hide();
			toggleFull(false);
		}	
	},

	alignRadio: function(){
		var label_l = $('.align_radio .time_rdo1');
		var label_r = $('.align_radio .time_rdo2');

		label_l.click(function(){
			$(this).parents('.align_radio').addClass('left');
			$(this).parents('.align_radio').removeClass('right');
		});

		label_r.click(function(){
			$(this).parents('.align_radio').addClass('right');
			$(this).parents('.align_radio').removeClass('left');
		});
	},

	checkbox: function(){
		var $obj = $('.chk_st1 input');
			$obj.bind('click', function(){
				if(!$(this).parent().hasClass('dim')){
					$(this).parent().toggleClass('on');
				}
			});
	},
	
	thumbnailPress: function(){
		var list = $('.thumbnail .thumbnail_list > li > a');
		var btn_modify = $('.thumbnail .title .btn_modify');
		var btn_cancel = $('.thumbnail .title .btn_cancel');

		list.click(function(){
			if($(this).parents('.thumbnail').hasClass('modify')){
				$(this).parent().toggleClass('on');
			}else{
				$('.playerLayer').show();
			}
		});

		btn_modify.click(function(){
			$(this).parents('.thumbnail').addClass('modify');
		});

		btn_cancel.click(function(){
			$(this).parents('.thumbnail').removeClass('modify');
		});
	},

	remoteList: function(){
		var wrap = $('#remocon');
		var list = $('.remote_list > li');
		//var list_talkie = list.find('.talkie_area').children('a');
		var voice = list.find('.talkie_area').children('.voice');
		var speaker = list.find('.talkie_area').children('.speaker');
		var plus = $('.remote_area .btn_plus');
		var minus = $('.remote_area .btn_minus');
		var message = $('#remocon .message');
		var list_dim = $('.remote_list > .dim');
		var volume = $('.btn_volum');		
		
		var btn_message = $('#remocon .btn_message');
		var btn_message_privacy = $('#remocon .btn_message privacy');

		list.each(function(){
			if($(this).hasClass('press')){
				$(this).find('em').text('ON');
			}else{
				$(this).find('em').text('OFF');
			}
		});

		list.click(function(){
			//워키토키 아이콘엔 click 이벤트 빼기
			var index = $(this).index();
			if(index !=2){
				if($(this).hasClass('dim')){
					return;
				}else{
					if($(this).hasClass('press')){
						$(this).find('em').text('OFF');
						$(this).removeClass('press');
						//OFF일때
						// 녹화 영상 열기 팝업없어서 제외
						setClickOffText(index);
					}else{
						$(this).find('em').text('ON');
						$(this).addClass('press');
						//On일때
						// 녹화 영상 열기 팝업없어서 제외

						if(index != 6){
							if($(this).hasClass('sd')){
								setClickOnText("sd");
							}else if($(this).hasClass('reserve')){
								setClickOnText("reserve");
							}else{
								setClickOnText(index);
							}
						}

						//setClickOnText(index);

						//침입감지 sd카드
						//setClickOnText("sd");
						//침입감지 예약
						//setClickOnText("reserve");
					}
				}
				if(index != 6){
					messageView();
				}
			}//워키토키 이벤트는 따로 처리함
		});
		
		function messageView(){
			if(message.children('span').text() != ""){
				message.stop().fadeIn(500, function(){
					message.stop().fadeOut(500);
				});
			}
		}		
		function setClickOnText (index){
			message.removeClass('typeL');
			var str = "";
			switch (index){
				case 0:
					str ="화면캡쳐가 완료되었습니다.";
					break;
				case 1:
					str = "간편녹화가 시작되었습니다.";
					break;
				case 20:
					str = "말하기 중입니다.";
					break;
				case 21:
					str = "듣기 중입니다.";
					break;
				case 3:
					str = "CCTV 경보가 시작되었습니다.";
					break;
				case 4:
					str = "침입감지 설정이 시작되었습니다.";
					break;
				case 5:
					str = "침입감지 알리미가 ON 되었습니다.";
					break;
				case 6:
					//녹화영상 열기
					str = "";
					break;
				case "sd":
					message.addClass('typeL');
					str = "침입감지 설정이 시작되었습니다. SD카드 녹화는 자동으로 <br/>종료되었으며, 녹화된 영상은 CCTV SD카드에 저장되었습니다.";
					break;
				case "reserve":
					message.addClass('typeL');		
					str = "침입감지 설정이 시작되었습니다. 현재 침임감지 예약이 설정되어 <br/>있습니다. 해당 예약 시간대와 겹치는 경우 침입감지예약이 취소됩니다.";
					break;
			}
			message.children('span').html(str);
		};
		
		function setClickOffText(index){
			message.removeClass('typeL');
			switch (index){
			case 0:
				str = "";
				break;
			case 1:
				str = "간편녹화가 저장되었습니다.";
				break;
			case 20:
				str = "";
				break;
			case 21:
				str = "";
				break;
			case 3:
				str = "CCTV 경보가 해제되었습니다.";
				break;
			case 4:
				str = "침입감지 설정이 종료되었습니다.";
				break;
			case 5:
				str = "침입감지 알리미가 OFF 되었습니다.";
				break;
			case 6:
				//녹화영상 열기
				str = "";
				break;
			case "sd":
				str = "";
				break;
			case "reserve":
				str = "";
				break;
			}
			message.children('span').text(str);
		};
		
		plus
		.mousedown(function(){
			$(this).addClass('press');
		})
		.mouseup(function(){
			$(this).removeClass('press');
		})		
		.click(function(){
			if($(this).hasClass('dim')){
				return;
			}else{
				//$(this).toggleClass('press');
			}
		});		
		$(window).mouseup(function(){
			plus.removeClass('press');
			minus.removeClass('press');
		});

		minus
		.mousedown(function(){
			$(this).addClass('press');
		})
		.mouseup(function(){
			$(this).removeClass('press');
		})
		.click(function(){
			if($(this).hasClass('dim')){
				return;
			}else{
				//$(this).toggleClass('press');
			}
		});

		btn_dim_ver = wrap.find('.remote_list').children('li'),
		message_section = wrap.find('.btn_message');

		btn_dim_ver.each(function(i){this.num = i;});

		btn_dim_ver.mouseover(function(){
			message_section.eq(this.num).stop().fadeIn(500);
		});

		btn_dim_ver.mouseleave(function(){
			message_section.stop().fadeOut(500);
		});
		
	
		voice.bind("click" , function(e){
			$(this).toggleClass('talkie_on');
			
			//스피커 처리		
			if($(this).hasClass('talkie_on')){
				if($('.btn_volum').hasClass('off')){
					
				}else{
					$('.btn_volum').toggleClass('off');
				}
			}else{
				if($('.btn_volum').hasClass('off')){
					$('.btn_volum').removeClass('off');
				}else{
					$('.btn_volum').toggleClass('off');
				}
			}
			
			//아이콘 press처리
			$(".remote_list > li.m3").toggleClass("press");
			
			if($(".remote_list > li.m3").hasClass('press')){
				$(this).find('em').text('ON');
				speaker.removeClass('talkie_on');
				speaker.find('em').text('OFF');
				//popup
				setClickOnText(20);
				messageView();
			}else{
				$(this).find('em').text('OFF');
				//popup
				setClickOffText(20);
				messageView();
			}
			e.stopPropagation();
		});
		
		$(".remote_list > li.m3")
		.hover(
			function() {
				if(!$(this).hasClass('dim')){
					speaker.children('span').css('color' , '#fb6362');
				}	
			}, function() {
				if(!speaker.hasClass('talkie_on') && !$(this).hasClass('dim')){
					speaker.children('span').css('color' , '#222222');	
				}
			}
		)
		.click(function(){
			voice.trigger('click');
		});
		
		speaker.bind("click" , function(e){
			if($(this).hasClass('talkie_on')){
				//OFF
				$(this).find('em').text('OFF');
				$(this).toggleClass('talkie_on');
				//popup
				setClickOffText(21);
				messageView();
			}else{
				//On
				$(this).find('em').text('ON');
				$(this).toggleClass('talkie_on');
				
				if(voice.hasClass('talkie_on')){
					$(".remote_list > li.m3").toggleClass("press");	
					voice.toggleClass('talkie_on');
					if($(".remote_list > li.m3").hasClass('press')){
						voice.find('em').text('ON');
					}else{
						voice.find('em').text('OFF');
					}
				}
				//popup
				setClickOnText(21);
				messageView();
			}
			e.stopPropagation();
		});
		
	},
	

	on_off: function(){
		var label = $('.on_off > label');
				

		$('.on_off.on > .handler').css('left',34);
		$('.on_off.off > .handler').css('left',0);

		label.click(function(){
			var handler = $(this).next('.handler');
			var timeSettingTab = $(this).parent().parent().parent().find('li:eq(1)').children('.timeSettingTab');
			
			if($(this).parent().hasClass('on')){
				$(this).parent().addClass('off');
				$(this).parent().removeClass('on');
				handler.stop().animate({'left':0}, 100);	
				
				if($(this).parent().parent().index() == 0){					
					timeSettingTab.children('.title1').addClass('dim');
					timeSettingTab.children('em').addClass('dim');
					timeSettingTab.find('.info_table div').addClass('dim');
					timeSettingTab.find('.viewTimeTable_btn').addClass('dim').removeClass('settimer_on').removeClass('on');
					
					$(this).parent().parent().parent().find('li:eq(1)').css('height' , '57px');
					timeSettingTab.find('.viewTimeTable_btn').css('display' , 'none');										
				}else if($(this).parent().parent().index() == 3){
					$(this).parent().parent().children('em.off').show();
					$(this).parent().parent().children('em.on').hide();
				}				
			}else{
				$(this).parent().addClass('on');
				$(this).parent().removeClass('off');
				handler.stop().animate({'left':34}, 100);
				
				if($(this).parent().parent().index() == 0){					
					timeSettingTab.children('.title1').removeClass('dim');
					timeSettingTab.children('em').removeClass('dim');
					timeSettingTab.find('.info_table div').removeClass('dim');
					timeSettingTab.find('.viewTimeTable_btn').removeClass('dim');
					
					timeSettingTab.find('.viewTimeTable_btn').css('display' , 'inline-block');
				}else if($(this).parent().parent().index() == 3){
					$(this).parent().parent().children('em.off').hide();
					$(this).parent().parent().children('em.on').show();
				}
			}			
		});
		
		
		$('.viewTimeTable_btn').click(function(event){
			if($(this).parents('li').hasClass('dim'))return;
			$(this).toggleClass('settimer_on');		
			if($(this).hasClass('settimer_on')){
				$(this).parent().parent().parent().css('height' , '320px');				
			}else{
				$(this).parent().parent().parent().css('height' , '57px');				
			}
//			$(this).toggleClass('settimer_on') ? $(this).parent().parent().parent().css('height' , '320px') : $(this).parent().parent().parent().css('height' , '57px');	
		});
		
		var days = $('.days_table ul > li div');
		days.click(function(){
			$(this).toggleClass('on');
			summaryDetectSchedule($(this));
		});
	},

	btn_volum: function(){
		var btn = $('.btn_volum');
		var btn2 = $('.btn_volum2');
		var btn3 = $('.btn_volum3');
		var detail_mic = $('.btn_mic');
		var talkie_v = $(".remote_list > li.m3").children('.talkie_area').children('.voice');
		var talkie_s = $(".remote_list > li.m3").children('.talkie_area').children('.speaker');

		btn2.click(function(event){
			$('.volum_box').hide();
			$(this).removeClass('off');
			$(this).next('.volum_box').toggle();
			event.stopPropagation();
		});

		btn3.click(function(event){
			$('.volum_box').hide();
			$(this).removeClass('off');
			$(this).next('.volum_box').toggle();
			event.stopPropagation();
		});

		$('.volum_box').click(function(event){
			event.stopPropagation();
		});

		$('body').click(function(){
			$('.volum_box').hide();
		});

		btn.click(function(){
			if($(this).hasClass('off')){
				$(this).removeClass('off');
				
				if(talkie_s.hasClass('off')){
					talkie_s.find('em').text('ON');
					talkie_s.children('span').css('color' , '#fb6362');
					talkie_s.addClass('talkie_on');
					talkie_s.removeClass('off');
				}
				
				if(talkie_v.hasClass('talkie_on')){
					talkie_v.toggleClass('talkie_on');
					talkie_v.addClass('off');
					$(".remote_list > li.m3").toggleClass("press");
					
					if($(".remote_list > li.m3").hasClass('press')){
						talkie_v.find('em').text('ON');
					}else{
						talkie_v.find('em').text('OFF');
					}
				}
			}else{
				$(this).addClass('off');
				
				if(talkie_s.hasClass('talkie_on')){
					talkie_s.addClass('off');
					talkie_s.find('em').text('OFF');
					talkie_s.children('span').css('color' , '#222222');	
					talkie_s.removeClass('talkie_on');
				}
			}
			
			if(talkie_s.hasClass('talkie_on')||talkie_v.hasClass('talkie_on')){
				$(".remote_list > li.m3").children('span').css('color' , '#fb6362');				
			}else{
				//$(".remote_list > li.m3").children('span').css('color' , '#222222');				
			}
		});		
		
		detail_mic.click(function(){
			$(this).toggleClass('clk');
		});
	},

	play_btn_s: function(){
		var btn = $('.play_btn_s');

		btn.click(function(){
			if($(this).hasClass('stop')){
				$(this).addClass('play');
				$(this).removeClass('stop');
				$(this).next().next().children('.m1').addClass('on');
				$(this).next().next().children('.m2').removeClass('on');
			}else{
				$(this).addClass('stop');
				$(this).removeClass('play');
				$(this).next().next().children('.m1').removeClass('on');
				$(this).next().next().children('.m2').addClass('on');
			}
		});
	},

	full_screen: function(){
		var screen = $('#full_screen .full_screen');
		var video = $('#full_screen .video');
		var play_bar = $('#full_screen .play_bar');
		var play_slider = $('#full_screen .play_bar .play_slider');
		var winW = $(window).width();
		var winH = $(window).height();

		var bigH1 = winH;
		var bigW1 = winH * 1.777777;

		var bigW2 = winW;
		var bigH2 = winW * 0.5625;

		var marT1 = - bigH1 / 2;
		var marL1 = - bigW1 / 2;

		var marT2 = - bigH2 / 2;
		var marL2 = - bigW2 / 2;

		if(winW < 1024){
			screen.css({'width':1024,'height':536,'margin-top':-268,'margin-left':0,'left':0,'top':'50%'});
			video.css('height',536);
		}else if(winH < 768){
			screen.css({'width':1024,'height':536,'margin-top':0,'margin-left':-512,'left':'50%','top':0});
			video.css('height',536);
		}else if(bigW2 > bigW1){
			screen.css({'width':bigW1,'height':bigH1 - 40,'margin-top':0,'margin-left':marL1,'left':'50%','top':0});
			video.css('height',bigH1 - 40);
		}else{
			screen.css({'width':bigW2,'height':bigH2 - 40,'margin-top':marT2,'margin-left':0,'left':0,'top':'50%'});
			video.css('height',bigH2 - 40);
		}

		var barW = screen.width() - 277;
		var sliderW = barW - 121;

		play_bar.css('width',barW);
		play_slider.css('width',sliderW);

		$( ".play_slider" ).slider({
			orientation: "horizontal",
			range: "min",
			animate: true
		});
	},

	loginInput: function(){
		var input_id = $('#login .input_id');
		var input_pw = $('#login .input_pw');

		input_id.each(function(){
			this.v = $(this).val();
		});

		input_pw.each(function(){
			this.v = $(this).val();
		});

		input_id.focusin(function(){
			if($(this).val() == this.v){
				$(this).val('');
			}else{
				return;
			}
		});

		input_id.focusout(function(){
			if($(this).val() == 0){
				$(this).val(this.v);
			}else{
				return;
			}
		});

		input_pw.focusin(function(){
			if($(this).val() == this.v){
				$(this).val('');
				$(this).attr({'type':'password'});
			}else{
				return;
			}
		});

		input_pw.focusout(function(){
			if($(this).val() == 0){
				$(this).val(this.v);
				$(this).attr('type','text');
			}else{
				return;
			}
		});
	},

	thumbnail_delete: function(){
		var btn_delete = $('.thumbnail').find('.btn_delete');
		var list = $('.thumbnail_list > li');

		btn_delete.click(function(){
			if(list.hasClass('on')){
				$('.delete1').show();
			}else{
				$('.delete2').show();
			}
		});
	},

	qna_list: function(){
		var li = $('#qna_wrap .qna_list > li > .q');

		li.click(function(){
			if($(this).parent().hasClass('on')){
				$(this).parent().removeClass('on');
			}else{
				$('#qna_wrap .qna_list > li').removeClass('on');
				$(this).parent().addClass('on');
			}
		});
	},

	notice_list: function(){
		var li = $('#notice_wrap .notice_list > li > .top_box');

		li.click(function(){
			if($(this).parent().hasClass('on')){
				$(this).parent().removeClass('on');
			}else{
				$('#notice_wrap .notice_list > li').removeClass('on');
				$(this).parent().addClass('on');
			}
		});
	},

	settings: function(){
		var btn_modify = $('#settings .btn_modify');
		var btn_confirm = $('#settings .btn_confirm');
		var btn_arrow = $('#settings .btn_topArea');

		btn_modify.click(function(){
			$(this).parent('.left').addClass('modify');
		});

		btn_confirm.click(function(){
			$(this).parent('.left').removeClass('modify');
		});

		btn_arrow.click(function(){
			if($(this).parents('.inner').hasClass('on')){
				$(this).parents('.inner').removeClass('on');
			}else{
				$(this).parents('.inner').addClass('on');
			}
		});
	},

	info_tab: function(){
		var tab = $('.tab_list > li');
		var con = $('.con_list > li');

		tab.each(function(i){this.num = i;});

		tab.click(function(){
			tab.removeClass('on');
			$(this).addClass('on');
			con.removeClass('on');
			con.eq(this.num).addClass('on');
		});
	},

	photo_modify: function(){
		var photo_modify = $('#settings .photo_modify');

		photo_modify.click(function(e){
			e.stopPropagation();
			//$(this).next('.modify_list').toggle();		
			
		});

		$('body').click(function(){
			$('.modify_list').hide();
		});
	},

	lnb: function(){
		var area = $('.lnb');
		var inner_btn = area.find('li ul li');

		inner_btn.click(function(e){
			$(this).siblings().removeClass('on');
			$(this).addClass('on');
		});
	},
	detail_ico: function(){
		var area = $('.btn_list');
		var inner_btn = area.find('li');

		inner_btn.click(function(){
			$(this).toggleClass('clk');
		});
	}

};

$(window).resize(function(){
	UI.stipulationWrap();
	UI.settings_area();
	UI.cctv();
	UI.full_screen();
});

$(document).ready(function(){
	UI.load();
	// $( ".volum" ).slider({
	// 	value: 50,
	// 	orientation: "horizontal",
	// 	range: "min",
	// 	animate: true
	// });
	// $( ".play_slider" ).slider({
	// 	value: 50,
	// 	orientation: "horizontal",
	// 	range: "min",
	// 	animate: true
	// });
	// $( ".volum2" ).slider({
	// 	value: 50,
	// 	orientation: "vertical",
	// 	range: "min",
	// 	min: 0,
	// 	max: 100,
	// 	animate: true
	// });
	// $( ".volum3" ).slider({
	// 	value: 50,
	// 	orientation: "vertical",
	// 	range: "min",
	// 	min: 0,
	// 	max: 100,
	// 	animate: true
	// });
	// $('.datepicker').datepicker({ maxDate: "+0d" });
	// $('.select_st1').customSelect();
	// UI.load();
	// $('#stipulation .stipulation').customScrollbar();
	// //start time set
	
	// //start time set
	// $(document).on("keyup", "input:text[numberOnly]", 
	// 		function() {
	// 	$(this).val($(this).val().replace(/[^0-9]/gi,""));
	// 		//숫자만 입력
	// 		if($(this).val().length == 2){
	// 			if($(this).parent().attr("id") == "starttime"){
	// 				if($(this).val() > 23){
	// 					//alert("입력가능한 숫자를 입력해주세요 '\n' 시:0~23 ,분 0~59");
	// 					UI.layerOpen('#time_popup');
	// 					$(this).val("22");
	// 				}
	// 			}
	// 			else if($(this).parent().attr("id") == "startmin"){
	// 				if($(this).val() > 59){
	// 					//alert("입력가능한 숫자를 입력해주세요 '\n' 시:0~23 ,분 0~59");
	// 					UI.layerOpen('#time_popup');
	// 					$(this).val("00");
	// 				}
	// 			}
	// 			else if($(this).parent().attr("id") == "endtime"){
	// 				if($(this).val() > 23){
	// 					//alert("입력가능한 숫자를 입력해주세요 '\n' 시:0~23 ,분 0~59");
	// 					UI.layerOpen('#time_popup');
	// 					$(this).val("08");
	// 				}
	// 			}
	// 			else if($(this).parent().attr("id") == "endmin"){
	// 				if($(this).val() > 59){
	// 					//alert("입력가능한 숫자를 입력해주세요 '\n' 시:0~23 ,분 0~59");
	// 					UI.layerOpen('#time_popup');
	// 					$(this).val("30");
	// 				}
	// 			}
				
	// 		}
	// 		summaryDetectSchedule($(this));
	// }
	// );
	
	// $(".start_time .thead_first,.start_time .tfoot_first").bind("click",function(){
	// 	apmset($(this).parent().parent().parent().find(".tbody_first"));
	// 	summaryDetectSchedule($(this));
	// });
	// //time
	// $(".start_time .thead_second").bind("click",function(){
	// 	timeset("plus" ,$(this).parent().parent().parent().find(".tbody_second input"));
	// 	summaryDetectSchedule($(this));
	// });
	// $(".start_time .tfoot_second").bind("click",function(){
	// 	timeset("minus" ,$(this).parent().parent().parent().find(".tbody_second input"));
	// 	summaryDetectSchedule($(this));
	// });
	// //min
	// $(".start_time .thead_last").bind("click",function(){
	// 	mimset("plus" , $(this).parent().parent().parent().find(".tbody_last input"));
	// 	summaryDetectSchedule($(this));
	// });
	
	// $(".start_time .tfoot_last").bind("click",function(){
	// 	mimset("minus" ,$(this).parent().parent().parent().find(".tbody_last input"));
	// 	summaryDetectSchedule($(this));
	// });
	// //close time set
	// $(".close_time .thead_first,.close_time .tfoot_first").bind("click",function(){
	// 	apmset($(this).parent().parent().parent().find(".tbody_first input"));
	// 	summaryDetectSchedule($(this));
	// });
	// //time
	// $(".close_time .thead_second").bind("click",function(){
	// 	timeset("plus" ,$(this).parent().parent().parent().find(".tbody_second input"));
	// 	summaryDetectSchedule($(this));
	// });
	// $(".close_time .tfoot_second").bind("click",function(){
	// 	timeset("minus" ,$(this).parent().parent().parent().find(".tbody_second input"));
	// 	summaryDetectSchedule($(this));
	// });
	// //min
	// $(".close_time .thead_last").bind("click",function(){
	// 	mimset("plus" , $(this).parent().parent().parent().find(".tbody_last input"));
	// 	summaryDetectSchedule($(this));
	// });
	
	// $(".close_time .tfoot_last").bind("click",function(){
	// 	mimset("minus" ,$(this).parent().parent().parent().find(".tbody_last input"));
	// 	summaryDetectSchedule($(this));
	// });
		
	// function apmset(obj){
	// 	if(obj.html() == "오전"){
	// 		obj.text("오후");
	// 	}else{
	// 		obj.text("오전");
	// 	}
	// }
	// function timeset(form , obj){
	// 	var changeVal = Number(obj.val());
	// 	if(form == "plus"){
	// 		if(changeVal<23){
	// 			changeVal = changeVal + 1;
	// 		}else{
	// 			changeVal = 00;
	// 		}
	// 	}else if(form == "minus"){
	// 		if(changeVal > 0){
	// 			changeVal = changeVal - 1;
	// 		}else{
	// 			changeVal = 23;
	// 		}
	// 	}
	// 	if(changeVal<10){
	// 		changeVal ="0"+changeVal;
	// 	}
	// 	obj.val(changeVal);
	// }
	
	// function mimset(form , obj){
	// 	var changeVal = Number(obj.val());
	// 	if(form == "plus"){
	// 		if(changeVal<59){
	// 			changeVal = changeVal + 1;
	// 		}else{
	// 			changeVal = 0;
	// 		}
	// 	}else if(form == "minus"){
	// 		if(changeVal > 0){
	// 			changeVal = changeVal - 1;
	// 		}else{
	// 			changeVal = 59;
	// 		}
	// 	}
	// 	if(changeVal<10){
	// 		changeVal ="0"+changeVal;
	// 	}
	// 	obj.val(changeVal);
	// }
});

function cancelFullScreen(el) {
    var requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.msExitFullscreen;
    //alert(requestMethod)
    if (requestMethod) { // cancel full screen.
        requestMethod.call(el);
         document.msExitFullscreen();
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
    	
		var width = 1600;
		var height = 950;
    	
//    	var width = window.innerWidth - 250;
//		var height = window.outerWidth / 2;
		
		var top = (screen.availHeight) / 2;
		var left = (screen.availWidth) / 2;
		
		//alert(width+''+height);
		
		window.moveTo(top,left);
        window.resizeTo(width,height);    	
        //window.resizeBy(0, 0);    	
    	 

    	/*
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
        */
    }
}

function requestFullScreen(el) {
    // Supports most browsers and their versions.
    var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
    	    	
		window.moveTo(0,0);
        //window.resizeTo(screen.availWidth,screen.availHeight);
        
        setTimeout(function() {window.resizeTo(screen.availWidth,screen.availHeight);}, 300);
        
        //console.log('[requestFullScreen] screen.availWidth : ', screen.availWidth);
        //console.log('[requestFullScreen] screen.availHeight : ', screen.availHeight);
    	/*        	
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
        */
    }
    return false;
}

function toggleFull(isInFullScreen) {
    var elem = document.body; // Make the body go full screen.
      
	// 익스 9에서는 풀 스크린이 안되므로 이 API에 대한 리턴값은 undefined이다. 따라서 쓸 수 없음. 익스 11이상부터 써야 될듯. 우선은 막음       	
    //var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||  (document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement);					
    if (!isInFullScreen) {
        cancelFullScreen(document);
    } else {
        requestFullScreen(elem);
    }
    return false;
}
