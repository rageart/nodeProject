var common = {
	gnb: function(){
		$gnb=$('.gnb ul > li > a');
		$gnb.bind('mouseenter focusin', function(){
			$gnb.parent().removeClass('on');
			$(this).parent().addClass('on');
		});
		$gnb.bind('mouseleave focusout', function(){
			$gnb.parent().removeClass('on');
			$(this).parent().removeClass('on');
		});
	},
	placeholder : function(){
		$('input, textarea').each(function() {
			$(this).data('holder', $(this).attr('placeholder'));
			$(this).focusin(function(){
				$(this).attr('placeholder','');
			});
			$(this).focusout(function(){
				$(this).attr('placeholder', $(this).data('holder'));
			});
		});
	},
	modal : function(){
		var $modalBtn = $('.btn-modal'),
			 $mask = $('.modal-mask');
		$modalBtn.on('click', function(){
			var modalId = $(this).attr('data-target');
			$(modalId).show();
			$mask.show();
		});
		$mask.on('click', function(){
			$(this).hide();
			$('.modal').hide();
		});
		$('.modal').find('.modal-closed').on('click', function(){
			$mask.hide();
			$('.modal').hide();
		});
	},
	aside : function(){
		var $aside = $('aside'),
			 $toggleBtn=$('aside > .btn'),
			 $asideList = $aside.find('.aside-list');
			//$aside.height($('.container').height());
			$asideList.find('.title').on('click', function(){
				if($(this).parent().hasClass('on')){
					$(this).parent().removeClass('on');
					$(this).next('.content').slideUp();
				} else {
					$(this).parent().addClass('on');
					$(this).next('.content').slideDown();
				}
			});
		$toggleBtn.on('click', function(){;
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

		$(window).bind('scroll', function () {
			$aside.css('top','');
			if ($(window).scrollTop() > 154) {
				$aside.addClass('top');
			} else {
				$aside.removeClass('top');
				var moveTop = 154-$(window).scrollTop();
				$aside.animate({top:moveTop+"px" }, 100);
			}
		});
	},
	table : function(){
		var $tbDefault = $('.tb-default');
		$tbDefault.find('tbody > tr:odd').addClass('bg-gray');
		$tbDefault.each(function(){
			var tbBodyCnt = $tbDefault.find('tbody > tr').length;
			for(i=1; i<tbBodyCnt+1; i++){
				var row =$(this).find('tr').eq(i);
				row.find('.cnt').text(i);
			}
		});
		var $btnSwitch = $('.btn-switch');
		$btnSwitch.on('click', function(){
			if($(this).hasClass('on')){
				$(this).removeClass('on').text('OFF');
			} else {
				$(this).addClass('on').text('ON');
			}
		});
	},
	tab : function(){
		var $tabmenu = $('.tab-menu');
		$tabmenu.find('a').on('click', function(){
			$(this).closest('.tab-container').find('.tab-menu > li').removeClass('on');
			$(this).parent().addClass('on');
			var idx = $(this).parent().index();
			$(this).closest('.tab-container').find('.tab-body').hide();
			$(this).closest('.tab-container').find('.tab-body').eq(idx).show();
		});
	},
	checkForm : function(){
		var checkbox = $('.checkbox');
		checkbox.change(function(){
			if($(this).hasClass('on')){
				$(this).removeClass('on');
			} else {
				$(this).addClass('on');
			}
		});
	},
	dropdown : function(){
		var dropdown = $('.drop-down'),
			 dropBtn = dropdown.find('.btn-toggle');
		dropBtn.on('click', function(){
			$(this).parent().toggleClass('on')
		});
	},
}

var realtime = {
	table : function(){
		var $tbList = $('.work-table'),
			 $tbListBtn = $tbList.find('.btn');
			$tbListBtn.on('click', function(){
			if ($tbList.hasClass('on')){
				$tbList.removeClass('on');
				$tbList.stop().animate({ top : 10 }, 500).css('bottum','auto');
				$('.work-fluid').addClass('fixed');
			}else{
				$tbList.addClass('on');
				var tbTop =  176 - $tbList.height();
				$tbList.stop().animate({ top:  tbTop}, 500).css('top','auto');
				$('.work-fluid').removeClass('fixed');

			}
		});
	},
	workdj : function(){

		var $tbList = $('.work-dj'),
			$tbListBtn = $tbList.find('.btn');
			$tbListBtnW= $tbList.find('.tb-wrap');
			$tbListBtn.on('click', function(){
			if ($tbList.hasClass('on')){
					if(!($('.work-fluid').hasClass('absolute'))){
						$('.work-fluid').addClass('fixed');
					}
					$tbListBtnW.slideUp({
						 complete: function(){
							 $tbList.removeClass('on');
						 }
					});
			}else{
					$tbList.addClass('on');
					$tbListBtnW.slideDown();
					$('.work-fluid').removeClass('fixed');
			}
		});
	},
	detailView : function(){
		var $workDetail = $('.work-detail'),
			$workCon = $workDetail.find('.content');
			$workDetail.find('.title').on('click', function(){
				if($workDetail.hasClass('on')){
					if(!($('.work-fluid').hasClass('absolute'))){
						$('.work-fluid').addClass('fixed');
					}
					$workCon.slideUp({
						 complete: function(){
							 $workDetail.removeClass('on');
						 }
					});

				} else {
					$workDetail.addClass('on');
					$workCon.slideDown();
					$('.work-fluid').removeClass('fixed');
				}
			});
	}
}
// 서비스 공통 function 모음
var service = {
	/*
	 * [171024 jhlee] PC뷰,MAP 체크
	 * */
	 PCMAPcheck: function (P_CUST_CTN,P_INSERT_DATE,DEV_KEY,MAP_STATUS) {

		 $.ajax({
			 url:'/locAdminMappingInsert',
			 type:'POST',
			 dataType:'json',
			 data : {
				 P_CUST_CTN : P_CUST_CTN,
				 P_INSERT_DATE : P_INSERT_DATE,
				 DEV_KEY : DEV_KEY,
				 MAP_STATUS : "7"
			 },
			 success:function(data){

			 },
			 error:function(request,status,error){
			 var responseText=request.responseText;
			 security_alert(responseText,1);
			 }
		 });
	 },
	 PCMAPuncheck: function (P_CUST_CTN,P_INSERT_DATE,DEV_KEY,MAP_STATUS) {
		 $.ajax({
			 url:'/locAdminMappingModify',
			 type:'POST',
			 dataType:'json',
			 data : {
				 P_CUST_CTN : P_CUST_CTN,
				 P_INSERT_DATE : P_INSERT_DATE,
				 DEV_KEY : DEV_KEY,
				 MAP_STATUS : "5"
			 },
			 success:function(data){

			 },
			 error:function(request,status,error){
			 var responseText=request.responseText;
			 security_alert(responseText,1);
			 }
		 });
	 }
}



$(document).ready(function(){
	//common.gnb();
	common.placeholder();
	common.modal();
	common.aside();
	common.table();
	common.tab();
	common.checkForm();
	common.dropdown();

	realtime.table();
	realtime.workdj();
	realtime.detailView();

});
