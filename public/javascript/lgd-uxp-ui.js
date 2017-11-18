/**
 * UXP UI COMMON
 * 작성자: 노종민
 * 최초작성일: 16.05.16
 */

//ie console.log
var console = window.console || {
    log: function() {}
};

//init uxp
var uxp = uxp || {};

(function($) {
    uxp = {
        funcCheck: function(func) {
            if (typeof func !== 'undefined' && typeof func !== 'function') {
                throw {
                    name: 'TypeError',
                    message: 'is not function'
                };
            }
        },
        log: function(key, value) {
            console.log(key + ' : ' + value);
        },
        messageBox: {
            setDefaults: function() {
                ko = {
                    OK: '확인',
                    CANCEL: '취소',
                    CONFIRM: '확인'
                };
                bootbox.addLocale('ko', ko);
                bootbox.setDefaults({
                    locale: 'ko',
                    closeButton: true,
                    className: 'uxp-modal'
                });
            },
            alert: function(options, callback) {
                try {
                    uxp.funcCheck(callback);
                    this.setDefaults();
                    bootbox.alert({
                        size: 'small',
                        buttons: {
                            'ok': {
                                className: 'btn-primary btn-darkgray btn-sm'
                            }
                        },
                        title: options.title || 'Information',
                        message: options.msg,
                        callback: callback
                    });
                } catch (e) {
                    console.log(e.name + ': ' + e.message);
                }
            },
            confirm: function(options, callback) {
                if (arguments.length == 2 && typeof title == 'function') {
                    callback = title;
                    title = 'Information';
                }
                try {
                    uxp.funcCheck(callback);
                    this.setDefaults();
                    bootbox.confirm({
                        buttons: {
                            'confirm': {
                                className: 'btn-primary btn-darkgray btn-sm'
                            },
                            'cancel': {
                                className: 'btn-gray btn-sm'
                            }
                        },
                        title: options.title || 'Information',
                        message: options.msg,
                        callback: callback
                    });
                } catch (e) {
                    console.log(e.name + ': ' + e.message);
                }
            },
            prompt: function(title, callback) {
                try {
                    uxp.funcCheck(callback);
                    this.setDefaults();
                    bootbox.prompt({
                        buttons: {
                            'cancel': {
                                className: 'btn-gray btn-sm'
                            },
                            'confirm': {
                                className: 'btn-primary btn-darkgray btn-sm'
                            }
                        },
                        title: title,
                        callback: callback
                    });
                } catch (e) {
                    console.log(e.name + ': ' + e.message);
                }
            }
        },
        jsonSort: function(data, prop, asc) {
            if (typeof data !== 'object') {
                return false;
            }
            data = data.sort(function(a, b) {
                if (asc) {
                    return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
                } else {
                    return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
                }
            });
        },
        openPop: function(url, name, popWidth, popHeight) {
            var scWidth = screen.availWidth,
                scHeight = screen.availHeight,
                left = (parseInt(scWidth) - popWidth) / 2,
                top = (parseInt(scHeight) - popHeight) / 2;

            name = name || "Popup";

            window.open(url, name, 'width=' + popWidth + ', height=' + popHeight + ', top=' + top + ', left=' + left);
        },
        initLnb: function(obj) {
            obj.find('.current').parents('li').addClass('active');
            obj.find('.active > ul').slideDown('fast');
            obj.find('.active > a > span').removeClass('fa-angle-down').addClass('fa-angle-up');
        },
        /**
         * LNB
         * LNB영역에 마우스 아웃시 메뉴가 초기화 된다.
         * 메뉴를 클릭하지 않았는데도 이벤트가 적용되기 때문에 bool 변수로 메뉴 클릭했을때만
         * 마우스 아웃 이벤트가 적용되게 한다.
         */
        lnb: function(bool) {
            var that = this,
                lnbFlag = false,
                tabTitle = null,
                tabInx = 0,
                tabUrl = null,
                len;

            this.lnb = $('.lnb');
            this.initLnb(this.lnb);

            this.lnb.find('a').on('click', function(e) {
                var isUl = $(this).siblings('ul').length;

                if (isUl) {
                    e.preventDefault();
                    lnbFlag = true;
                    $(e.target).parent('li').siblings().removeClass('active').children('ul').slideUp('fast')
                        .end().children('a').children('span').removeClass('fa-angle-up').addClass('fa-angle-down');
                    $(e.target).children('span').toggleClass('fa-angle-up fa-angle-down');
                    $(e.target).parent('li').toggleClass('active').end().siblings('ul').slideToggle('fast');
                } else {
                    that.lnb.find('.current').removeClass('current');
                    $(this).parent().addClass('current');

                    if ($(e.target).data('mdi')) {
                        e.preventDefault();
                        tabTitle = $(e.target).text();
                        tabInx = $(e.target).data('index');
                        tabUrl = $(e.target).attr('href');
                        len = $('.ui-tabs-nav > li').length;

                        if (len >= 10) {
                            uxp.messageBox.alert({
                                msg: '더이상 추가 할 수 없습니다.'
                            });
                            return false;
                        }

                        that.mdi.addTab(tabTitle, tabUrl, tabInx);
                        $(e.target).data('mdi', false);
                    } else if ($(e.target).data('mdi') === false) {
                        e.preventDefault();
                        that.mdi.selecteTab(e.target);
                    }
                }
            });

            if (bool) {
                this.lnb.on('mouseleave', function() {
                    if (lnbFlag) {
                        $(this).find('.active').find('a > span').toggleClass('fa-angle-up fa-angle-down');
                        $(this).find('.active').removeClass('active').end().find('ul > li > ul').slideUp('fast');
                        that.initLnb(that.lnb);
                        lnbFlag = false;
                    }
                });
            }
        },
        getWinWidth: function() {
            return $(window).outerWidth(true);
        },
        getWinHeight: function() {
            return $(window).outerHeight(true);
        },
        getNextHeight: function(obj) {
            var nextHeight = 0;

            $(obj).nextAll().each(function(i, el) {
                nextHeight += $(el).outerHeight(true);
            });

            return nextHeight;
        },
        setHeight: function(obj, next) {
            var offsetTop, bottom, scrollHeight;

            offsetTop = obj.offset().top;
            bottom = parseInt($('.page-content').css('padding-bottom')) || 0;
            next = next || 0;

            return (this.getWinHeight() - offsetTop - bottom - next) + 'px';
        },
        autoHeight: function(obj, minHeight) {
            var that, $target;

            that = this;
            $target = $(obj);
            $target.css('min-height', minHeight || 300);

            if ($target.next().length) {
                $target.css({
                    height: that.setHeight($target, uxp.getNextHeight($target))
                });
            } else {
                $target.css({
                    height: that.setHeight($target)
                });
            }

            if ($('.mdi-tabs').length === 0) {
                $('html').css('overflow-y', 'auto');
            } else {
                $('html, body').css('overflow', 'hidden');
                $('body').css('min-width', 'auto');
            }
        },
        gnbScroll: function() {
            var that = this;
            this.scrollWrap = $('.scroll-wrap');
            this.gnb = $('.gnb');
            this.gnbControl = $('.gnb-control');

            var scrollPosition = 0,
                INTERVAL = 300; //한번에 이동하는 거리

            this.gnbControl.children('.grd-prev').on('click', function() {
                if (scrollPosition <= 0) {
                    that.messageBox.alert({
                        msg: '메뉴에 처음 입니다.'
                    });
                    return false;
                } else {
                    scrollPosition -= INTERVAL;
                    that.scrollWrap.stop().animate({
                        scrollLeft: scrollPosition + 'px'
                    });
                }
            });

            this.gnbControl.children('.grd-next').on('click', function() {
                var scrollRight = that.gnb.width() - that.scrollWrap.width();

                if (scrollPosition > scrollRight) {
                    that.messageBox.alert({
                        msg: '메뉴에 끝 입니다.'
                    });
                    return false;
                } else {
                    scrollPosition += INTERVAL;
                    that.scrollWrap.stop().animate({
                        scrollLeft: scrollPosition + 'px'
                    });
                }
            });
        },
        mdi: {
            tabList: $('#mdiList').children('.dropdown-menu'),
            closeTabs: function(obj) {
                var that = this,
                    inx = $(obj).closest('li').attr('aria-controls').replace(/[^0-9]/g, ''),
                    panelId = $(obj).closest('li').remove().attr('aria-controls');

                if (typeof uxp.lnb !== 'function') {
                    uxp.lnb.find('[data-index="' + inx + '"]').data('mdi', true).parent('li').removeClass('current');
                }

                //that.mdiTabs.find("#" + panelId ).children('iframe')[0].contentWindow.location.reload();

                that.mdiTabs.find("#" + panelId).children('iframe').attr('src', 'about:blank');
                setTimeout(function() {
                    that.mdiTabs.find("#" + panelId).off().remove();
                }, 100);

                this.tabList.find('[data-index="' + inx + '"]').closest('li').remove();
                that.mdiTabs.tabs('refresh');
            },
            closeAllTabs: function() {
                var that = this,
                    $tabs = that.mdiTabs.find('.ui-tabs-nav'),
                    $panels = $('.mdi-contents'),
                    iframe = $('iframe'),
                    inx = 0;

                if ($tabs.length === 0) {
                    uxp.messageBox.alert({
                        msg: '닫을 탭이 없습니다.'
                    });
                } else {
                    uxp.messageBox.confirm({
                        msg: '전체 탭을 닫으시겠습니까?'
                    }, function(result) {
                        if (result) {

                            for (inx; inx < iframe.length; inx++) {
                                $('iframe').eq(inx).attr('src', 'about:blank');
                            }

                            setTimeout(function() {
                                $tabs.off().empty();
                                $panels.off().empty();
                                that.tabList.off().empty();
                                that.tabList.hide();
                                $('#fullFoldingBtn').children().removeClass('ico-search-open').addClass('ico-search-close');
                                uxp.lnb.find("a").data('mdi', true).parent('li').removeClass('current');
                            }, 100);
                        }
                    });
                }
            },
            _dialogLeft: 0,
            _dialogtop: 0,
            _dialogMode: function() {
                var that = this;

                this.mdiTabs.find('.ui-tabs-nav').sortable("disable");

                var d = $('.ui-tabs-panel').dialog({
                    appendTo: ".mdi-contents",
                    create: function(event, ui) {
                        that.mdiTabs.tabs("disable");
                    },
                    minWidth: 1080,
                    minHeight: 500,
                    open: function(event, ui) {
                        var vDlg = $(event.target).parent();
                        var vCont = $('.mdi-contents');
                        var opt = {
                            my: "left top",
                            at: "left+" + that._dialogLeft + " top+" + that._dialogtop,
                            of: vCont
                        };

                        vDlg.draggable("option", "containment", vCont);
                        vDlg.draggable("option", "scroll", true);
                        $(this).dialog("option", "position", opt);

                        that._dialogLeft = that._dialogLeft + 100;
                        that._dialogtop = that._dialogtop + 30;
                    }
                }).dialogExtend({
                    "closable": true,
                    "maximizable": true,
                    "minimizable": true,
                    "collapsable": true,
                    "dblclick": "collapse",
                    "titlebar": "transparent",
                    "minimizeLocation": "right",
                    "icons": {
                        "close": "fa fa-times",
                        "maximize": "ui-icon-circle-plus",
                        "minimize": "ui-icon-circle-minus",
                        "collapse": "ui-icon-triangle-1-s",
                        "restore": "ui-icon-bullet"
                    },
                    "load": function(evt, dlg) {
                        console.log(evt.type);
                    },
                    "beforeCollapse": function(evt, dlg) {
                        console.log(evt.type);
                    },
                    "beforeMaximize": function(evt, dlg) {
                        console.log(evt.type);
                    },
                    "beforeMinimize": function(evt, dlg) {
                        console.log(evt.type);
                    },
                    "beforeRestore": function(evt, dlg) {
                        console.log(evt.type);
                    },
                    "collapse": function(evt, dlg) {
                        console.log(evt.type);
                    },
                    "maximize": function(evt, dlg) {
                        console.log(evt.type);
                    },
                    "minimize": function(evt, dlg) {
                        console.log(evt.type);
                    },
                    "restore": function(evt, dlg) {
                        console.log(evt.type);
                    }
                });
            },
            _tabMode: function() {
                var that = this;
                var ins = this.mdiTabs.tabs('instance');

                if (ins.options.disabled) {
                    this.mdiTabs.tabs('enable');
                    $('.ui-tabs-panel').dialog("destroy");

                    that._dialogLeft = 0;
                    that._dialogtop = 0;
                }
            },
            addTab: function(title, url, inx) {
                var that = this,
                    tabTitle = title,
                    tabUrl = url,
                    tabTemplate = '<li><a href="#{href}">#{label} <span class="close">×</span></a></li>';

                $('.page-loading').show();

                var label = tabTitle || 'Tab-' + inx,
                    id = 'tabs-' + inx,
                    li = $(tabTemplate.replace(/#\{href\}/g, '#' + id).replace(/#\{label\}/g, label)),
                    tabContent = '<div id="' + id + '"><iframe id="mdiFrame-' + inx + '" src=' + url + ' width="100%" height="100%" class="mdiFrame"></iframe></div>';

                this.tabList.append('<li><a href="#' + id + '" data-index="' + inx + '">' + label + '</a></li>');
                this.mdiTabs.find('.ui-tabs-nav').append(li);
                this.mdiTabs.find('.mdi-contents').append(tabContent);
                this.mdiTabs.tabs("refresh");
                this.selecteTab(this.mdiTabs.find('[aria-controls="tabs-' + inx + '"]').children());
            },
            selecteTab: function(obj) {
                var that = this,
                    targetInx = $(obj).data('index') || $(obj).attr('href').replace(/[^0-9]/g, ''),
                    tab = that.mdiTabs.find('.ui-tabs-nav').children('[aria-controls="tabs-' + targetInx + '"]'),
                    inx = that.mdiTabs.find('.ui-tabs-nav').children().index(tab);

                this.mdiTabs.tabs('option', 'active', inx);
            },
            resizeMdi: function(obj) {
                $(window).on('resize', $.proxy(function() {
                    this.autoHeight(obj);
                }, uxp));
            },
            init: function(obj) {
                var that = this;
                var active, collapsible, resizeTarget, isVisible;

                //create tabs
                this.mdiTabs = $(obj).tabs({
                    activate: function(event, ui) {
                        //console.log('activate');

                        isVisible = ui.newPanel.find('iframe', document).contents().find('.search-wrap').is(':visible');

                        if (isVisible) {
                            $('#fullFoldingBtn').children().removeClass('ico-search-open').addClass('ico-search-close');
                        } else {
                            $('#fullFoldingBtn').children().removeClass('ico-search-close').addClass('ico-search-open');
                        }

                        ui.newPanel.find('iframe').on('load', function() {
                            $('.page-loading').hide();
                        });
                    },
                    beforeActivate: function(event, ui) {
                        //console.log('beforeActive');
                    },
                    beforeLoad: function(event, ui) {
                        //console.log('beforeLoad');
                    },
                    load: function(event, ui) {
                        //console.log('load');
                    },
                    create: function(event, ui) {
                        //console.log('create');
                    }
                });

                //resize MDI wrap
                that.resizeMdi(this.mdiTabs.find('.mdi-contents'));

                //sort tabs
                this.mdiTabs.find('.ui-tabs-nav').sortable({
                    axis: 'x',
                    stop: function() {
                        that.mdiTabs.tabs('refresh');
                    }
                });

                //select tabs
                that.tabList.on('click', 'a', function(e) {
                    e.preventDefault();
                    that.selecteTab(e.target);
                });

                //close tabs
                this.mdiTabs.on('click', 'span.close', function(e) {
                    that.closeTabs(e.target);
                });

                //close tabs all
                $('#closeAllMid').on('click', function() {
                    that.closeAllTabs();
                });

                var inx = 0,
                    interval = 0,
                    $mdiTabs = $('.mdi-tabs .nav-tabs');

                //mdi control prev
                $('.mdi-control .prev').on('click', function() {
                    if ($mdiTabs.children('li').eq(inx).prev().length) {
                        interval += $mdiTabs.children('li').eq(inx).prev().width();
                        inx -= 1;
                    }

                    $mdiTabs.stop().animate({
                        'left': interval
                    });
                });

                //mdi control next
                $('.mdi-control .next').on('click', function() {
                    if (($mdiTabs.position().left + $mdiTabs.width() > $('.scroll-wrap').width()) && $mdiTabs.children('li').eq(inx).next().length) {
                        interval -= $mdiTabs.children('li').eq(inx).next().width();
                        inx += 1;
                    }

                    $mdiTabs.stop().animate({
                        'left': interval
                    });
                });
            }
        },
        datepicker: {
            single: function(selector, target, opts) {
                var defaults, options;

                if (!opts) opts = {};

                defaults = {
                    autoClose: true,
                    singleDate: true,
                    singleMonth: true,
                    showShortcuts: false,
                    getValue: function() {
                        if ($(target).val())
                            return $(target).val();
                        else
                            return '';
                    },
                    setValue: function(s) {
                        $(target).val(s);
                    }
                };

                options = $.extend({}, defaults, opts);

                $(selector).dateRangePicker(options);
            },
            fromTo: function(selector, targetFrom, targetTo, opts) {
                var defaults, options;

                if (!opts) opts = {};

                defaults = {
                    autoClose: true,
                    separator: ' ~ ',
                    getValue: function() {
                        if ($(targetFrom).val() && $(targetTo).val())
                            return $(targetFrom).val() + ' ~ ' + $(targetTo).val();
                        else
                            return '';
                    },
                    setValue: function(s, s1, s2) {
                        $(targetFrom).val(s1);
                        $(targetTo).val(s2);
                    },
                    showShortcuts: true,
                    shortcuts: {
                        'next-days': [3, 5, 7],
                        'next': ['week', 'month']
                    }
                };

                options = $.extend({}, defaults, opts);

                $(selector).dateRangePicker(options);
            }
        },
        moveTimeline: function(obj, msg1, msg2) {
            var $timeline, $schedule, $up, $down, tlHeight, intervalHeight, intervalTemp;

            $timeline = $(obj);
            $schedule = $timeline.closest('.schedule-wrap');
            $up = $schedule.find('.control-up');
            $down = $schedule.find('.control-down');
            tlHeight = $timeline.height();
            intervalHeight = $timeline.find('li').height();
            intervalTemp = 0;

            $up.on('click', function(e) {
                e.preventDefault();
                if (intervalTemp > 0) {
                    intervalTemp -= intervalHeight;
                } else {
                    uxp.messageBox.alert({
                        msg: typeof msg1 != 'undefined' ? msg1 : '처음 입니다.'
                    });
                }
                $timeline.stop().animate({
                    scrollTop: intervalTemp + 'px'
                }, 'fast');
            });

            $down.on('click', function(e) {
                e.preventDefault();

                var scrollbottom = $timeline.children('ul').height() - tlHeight;

                if (intervalTemp < scrollbottom) {
                    intervalTemp += intervalHeight;
                } else {
                    uxp.messageBox.alert({
                        msg: typeof msg2 != 'undefined' ? msg2 : '마지막 입니다.'
                    });
                }

                $timeline.stop().animate({
                    scrollTop: intervalTemp + 'px'
                }, 'fast');
            });
        },
        /**
         * 사이드바 토글 함수
         * @param  sidebar position
         * @param  sidebar toggle button position
         * @param  main container position
         */
        sidebarToggle: function(obj, sidebarPosition, buttonPosition, mainPosition) {
            if ($(obj).closest('.sidebar').hasClass('left')) {
                this.sideBar.stop().animate({
                    left: sidebarPosition + 'px'
                }, 100);
                this.sideToggleBtn.stop().animate({
                    right: buttonPosition + 'px'
                }, 100);
                this.mainWrap.stop().animate({
                    marginLeft: mainPosition + 'px'
                }, 100);
            } else if ($(obj).closest('.sidebar').hasClass('right')) {
                this.sideBar.stop().animate({
                    right: sidebarPosition + 'px'
                }, 100);
                this.sideToggleBtn.stop().animate({
                    left: buttonPosition + 'px'
                }, 100);
                this.mainWrap.stop().animate({
                    marginRight: mainPosition + 'px'
                }, 100);
            }
        },
        sidebar: function(callback) {
            var that = this;

            this.mainWrap = $('.page-content');

            $('.btn-side-toggle').on('click', function(e) {
                that.sideBar = $(this).closest('.sidebar');
                that.sideToggleBtn = $(this);
                that.sideBar.toggleClass('closed');

                $(this).children().toggleClass('fa-angle-left fa-angle-right');

                if (that.sideBar.hasClass('closed')) {
                    if (that.sideBar.hasClass('right')) {
                        that.sidebarToggle(this, -125, 0, 75);
                    } else {
                        that.sidebarToggle(this, -200, -30, 30);
                    }
                } else {
                    if (that.sideBar.children('.quick-menu').is(':visible')) {
                        that.sidebarToggle(this, 40, 0, 240);
                    } else {
                        that.sidebarToggle(this, 0, 0, 200);
                    }
                }

                if (typeof callback === 'function') {
                    callback();
                }
            });
        },
        /**
         * [searchBoxToggle description]
         * @param  {[type]} obj           [description]
         * @param  {[type]} target        [description]
         * @param  {[type]} class1        [description]
         * @param  {[type]} class2        [description]
         * @param  {[type]} scrollBoolean [윈도우 스크롤영역을 유지 할 필요가 있을경우 Boolean 값 'true'를 줄 경우 윈도우 스크롤에 영향을 주지 않는다.]
         * @return {[type]}               [description]
         */
        searchBoxToggle: function(obj, target, class1, class2, scrollBoolean) {
            if (typeof scrollBoolean == 'undefined') {
                $('html').css('overflow-y', 'hidden');
            }

            if (target.is(':visible')) {
                $(obj).children().toggleClass(class1 + ' ' + class2);
            } else {
                $(obj).children().toggleClass(class2 + ' ' + class1);
            }

            $.fx.off = true;

            //debugger;

            target.toggle(function() {
                if (typeof uxp.mdi.mdiTabs === null || typeof uxp.mdi.mdiTabs === 'undefined') {
                    $(window).resize();
                } else {
                    //console.log(target.siblings('.grid-wrap').is(':visible'))
                    var activeInx = uxp.mdi.mdiTabs.tabs().find('.ui-tabs-active').attr('aria-controls').replace(/[^0-9]/g, '');

                    if (target.siblings('.grid-wrap').is(':visible')) {
                        uxp.mdi.mdiTabs.find('#mdiFrame-' + activeInx, document)[0].contentWindow.resizeGrid('.grid-wrap');
                    }
                    //target.siblings('.grid-wrap').is(':visible') ? uxp.mdi.mdiTabs.find('#mdiFrame-' + activeInx, document)[0].contentWindow.resizeGrid('.grid-wrap') : 0;
                }
                $.fx.off = false;
            });
        },
        searchBox: function(scrollBoolean) {
            var that, $searchDetail, activeInx, currentInx;

            that = this;
            this.partFoldingBtn = $('.partFoldingBtn');
            this.fullFoldingBtn = $('#fullFoldingBtn');
            this.searchBox = $('.search-wrap');

            //전체 검색영역 토글
            this.fullFoldingBtn.on('click', function(e) {
                isMDI = $('#tabs').find('.ui-tabs-nav').children().length ? true : false;

                if (isMDI) {
                    activeInx = that.mdi.mdiTabs.tabs().find('.ui-tabs-active').attr('aria-controls').replace(/[^0-9]/g, '');
                    that.searchBox = that.mdi.mdiTabs.find('#mdiFrame-' + activeInx, document).contents().find('.search-wrap');
                }
                that.searchBoxToggle(this, that.searchBox, 'ico-search-close', 'ico-search-open', scrollBoolean);
            });

            //검색 숨김 영역 토글
            this.partFoldingBtn.on('click', function(e) {
                $searchDetail = $(this).siblings('.search-detail');
                that.searchBoxToggle(this, $searchDetail, 'fa-plus', 'fa-minus', scrollBoolean);
            });
        },
        resizeFrame: function(obj) {
            $('html, body').css('overflow', 'hidden');
            var that = this;
            var s_width = $('.sidebar').width();

            $(obj).css('height', (this.getWinHeight() - $(obj).offset().top || 0) + 'px'); //1 = border

            if ($('.sidebar').hasClass('closed')) {
                $(obj).css('width', (this.getWinWidth() - 30) + 'px');
            } else {
                $(obj).css('width', (this.getWinWidth() - (s_width)) + 'px');
            }
        },
        bsCollepse: function(e) {
            $(e.target).prev('.panel-heading').find('span.fa').toggleClass('fa-angle-down fa-angle-up');
        },
        changeTheme: function() {
            var that = uxp;

            $('.navbar').toggleClass('navbar-inverse');
            $('.sidebar').toggleClass('sidebar-inverse');
            that.setCookie('theme', 'inverse', 30);
        },
        // 쿠키 세팅 함수
        setCookie: function(sName, sValue, nDays) {
            var expires = "";
            if (nDays) {
                var d = new Date();
                d.setTime(d.getTime() + nDays * 24 * 60 * 60 * 1000);
                expires = '; expires=' + d.toGMTString();
            }

            document.cookie = sName + '=' + sValue + expires + '; path=/';
        },
        // 쿠기 조회 함수
        getCookie: function(sName) {
            var re = new RegExp('(\;|^)[^;]*(' + sName + ')\=([^;]*)(;|$)');
            var res = re.exec(document.cookie);
            return res !== null ? res[3] : null;
        },
        // 쿠키 삭제 함수
        removeCookie: function(name) {
            setCookie(name, '', -1);
        },
        loading: function() {
            $(window).load(function() {
                $('.page-loading').hide();
            });
        },
        dataFormat: function() {
            //숫자포맷
            $('[data-numeral]', document).each(function(i, el) {
                var cleaveNumeral = new Cleave(el, {
                    numeral: true,
                    numeralDecimalScale: 5,
                    delimiter: '',
                    numeralThousandsGroupStyle: 'thousand'
                });
            });

            //통화포맷
            $('[data-currency]', document).each(function(i, el) {
                var cleaveCurrency = new Cleave(el, {
                    numeral: true,
                    numeralDecimalScale: 5,
                    numeralThousandsGroupStyle: 'thousand'
                });
            });

            //날짜포맷
            $('[data-date]', document).each(function(i, el) {
                var cleaveDate = new Cleave(el, {
                    delimiter: '-',
                    date: true,
                    datePattern: ['Y', 'm', 'd']
                });
            });

            //전화번호 포맷
            $('[data-phone]', document).each(function(i, el) {
                var cleavePhone = new Cleave(el, {
                    phone: true,
                    delimiter: '-',
                    phoneRegionCode: 'KR'
                });
            });
        },
        init: function() {
            var that = this;

            this.dataFormat();

            // 테마변경
            $('#changeTheme').on('click', that.changeTheme);

            $('.btn-favorite, .btn-lnb').on('click', function() {
                var $sidebar = $(this).closest('.sidebar');
                var $lnb = $sidebar.children('.lnb');
                var $favoLnb = $sidebar.children('.lnb.favorite');

                if ($(this).closest('.sidebar-header').length === 0) {
                    if ($(this).hasClass('btn-lnb')) {
                        $lnb.show();
                        $favoLnb.addClass('sr-only');
                    } else {
                        $lnb.hide();
                        $favoLnb.removeClass('sr-only').show();
                    }
                } else {
                    if ($favoLnb.hasClass('sr-only')) {
                        $lnb.hide();
                        $favoLnb.removeClass('sr-only').show();
                        $(this).children().toggleClass('ico-menu-favorite ico-menu-favorite-s');
                    } else {
                        $lnb.show();
                        $favoLnb.addClass('sr-only');
                        $(this).children().toggleClass('ico-menu-favorite-s ico-menu-favorite');
                    }
                }
            });

            $('.quick-menu > .btn-group > .btn').on('click', function() {
                $(this).siblings().removeClass('active');
                $(this).addClass('active');

                if ($(this).find('.fa-star-o').length) {
                    $(this).find('.fa-star-o').removeClass('fa-star-o').addClass('fa-star');
                } else {
                    $(this).siblings().find('.fa-star').removeClass('fa-star').addClass('fa-star-o');
                }
            });
        },
        getID: function() {
            $.ajax({
                url: '/getInFo',
                type: 'POST',
                success: function(data, status) {
                    $('#top_id').text(data.id);
                    if (data.lv == 1) {
                        $('#top_lv').text("(슈퍼관리자)");
                    } else if (data.lv == 2) {
                        $('#top_lv').text("(제어관리자)");
                    }
                }
            });
        },
        getMenuActive: function() {
            var urls = document.location.href;

            if (urls.indexOf("/status") >= 0) {
                $(".navbar-nav > li:nth-child(1) > a").addClass("current");
            }
            if (urls.indexOf("/report") >= 0) {
                $(".navbar-nav > li:nth-child(2) > a").addClass("current");
            }
            if (urls.indexOf("/setup") >= 0) {
                $(".navbar-nav > li:nth-child(3) > a").addClass("current");
            }
        }
    };

    $(function() {
        uxp.init();
        uxp.loading();
        uxp.getID();
        uxp.getMenuActive();
    });

    // 파일첨부
    $(document).ready(function() {
        var fileTarget = $('.filebox .upload-hidden');

        fileTarget.on('change', function() {
            if (window.FileReader) {
                var filename = $(this)[0].files[0].name;
            } else {
                var filename = $(this).val().split('/').pop().split('\\').pop();
            }

            $(this).siblings('.upload-name').val(filename);
        });
    });

})(jQuery);
