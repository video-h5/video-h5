$(document).ready(function() {


//绑定全屏改变事件
$( document ).bind(
    'fullscreenchange webkitfullscreenchange mozfullscreenchange',
    function(){
        //如果当前不是全屏，移出class
        if (!document.webkitIsFullScreen) {
            $(".videoContainer").removeClass("videoContainer-center")
        }
        
    }

);



    //INITIALIZE
    var video = $('#myVideo');

    //删除默认JS加载时的控制
    video.removeAttr('controls');

    $('.topControl').show() //.css({'bottom':-45});
    $('.loading').fadeIn(500);
    //$('.caption').fadeIn(500);

    //在一切开始之前
    video.on('loadedmetadata', function() {
        //顶部标题
        //$('.caption').animate({ 'top': -45 }, 300);
        var time=null;
        time=setTimeout(function(){
            $('.topControl').stop().animate({'bottom':-$('.topControl').outerHeight()}, 500);
        },3000)

        //设置视频属性
        //设置视频开始时间
        $('.current').text(timeFormat(0));
        //设置视频总时间
        $('.duration').text(timeFormat(video[0].duration));
        //设置默认声音音量
        updateVolume(0, 0.5);

        //开始视频缓冲数据 
        setTimeout(startBuffer, 150);

        //绑定视频事件
        $('.videoContainer')
            //.append('<div id="init"></div>')
            .hover(function() {
                $('.topControl').stop().animate({ 'bottom': 0 }, 500);
                //$('.caption').stop().animate({ 'top': 0 }, 500);
            }, function() {
                if (!volumeDrag && !timeDrag) {
                    $('.topControl').stop().animate({'bottom':-$('.topControl').outerHeight()}, 500);
                    //$('.caption').stop().animate({ 'top': -45 }, 500);
                }
            })
            .on('click', function() {
                //$('#init').remove();
                $('.btnPlay').addClass('paused');
                $(this).unbind('click');
                video[0].play();
            });
        //$('#init').fadeIn(200);
        
        $('.videoContainer').bind("touchstart",function(){
            clearTimeout(time);
            $('.topControl').stop().animate({ 'bottom': 0 }, 500);
        })

        $('.videoContainer').bind("touchend",function(){
                time=setTimeout(function(){
                    $('.topControl').stop().animate({'bottom':-$('.topControl').outerHeight()}, 500);
                },3000)
            
        })
    });

    //显示视频缓冲栏
    var startBuffer = function() {
        //获取缓冲数据的最后一帧的时间
        var currentBuffer = video[0].buffered.end(0);
        //获取视频总时间
        var maxduration = video[0].duration;
        //转换百分比
        var perc = 100 * currentBuffer / maxduration;
        //设置缓冲进度条长度
        $('.bufferBar').css('width', perc + '%');

        //如果缓冲还为完成，隔0.5秒执行一次缓冲条的计算
        if (currentBuffer < maxduration) {
            setTimeout(startBuffer, 500);
        }
    };

    //显示当前视频播放时间
    video.on('timeupdate', function() {
        //获取视频播放的当前时间位置
        var currentPos = video[0].currentTime;
        //获取视频总时间
        var maxduration = video[0].duration;
        //转换百分比
        var perc = 100 * currentPos / maxduration;
        //设置播放进度条长度
        $('.timeBar').css('width', perc + '%');
        //写入播放的时间
        $('.current').text(timeFormat(currentPos));
    });

    //控件事件
    //视频屏幕,播放按钮点击

    //点击视频，播放或者暂停
    video.on('click', function() { playpause(); });
    //点击播放按钮，播放或者暂停
    $('.btnPlay').on('click', function() { playpause(); });
    var playpause = function() {
        //是人都知道
        if (video[0].paused || video[0].ended) {
            $('.btnPlay').addClass('paused');
            video[0].play();
        } else {
            $('.btnPlay').removeClass('paused');
            video[0].pause();
        }
    };

    //快进
    /*$('.btnx1').on('click', function() { fastfowrd(this, 1); });
    $('.btnx3').on('click', function() { fastfowrd(this, 3); });
    var fastfowrd = function(obj, spd) {
        $('.text').removeClass('selected');
        $(obj).addClass('selected');
        video[0].playbackRate = spd;
        video[0].play();
    };*/

    //停止按钮
    $('.btnStop').on('click', function() {
        $('.btnPlay').removeClass('paused');
        updatebar($('.progress').offset().left);
        video[0].pause();
    });

    //全屏按钮
    $('.btnFS').on('click', function() {
        // if($(this).hasClass("btnFSW")){
        // 	$(this).removeClass("btnFSW");
        // 	if($.isFunction(document.webkitCancelFullScreen)) {
        // 		document.webkitCancelFullScreen();
        // 	}	
        // 	else if ($.isFunction(document.mozCancelFullScreen)) {
        // 		document.mozCancelFullScreen();
        // 	}
        // 	else {
        // 		alert('Your browsers doesn\'t support fullscreen');
        // 	}
        // }else{
        // 	$(this).addClass("btnFSW");
        // 	if($.isFunction(video[0].webkitRequestFullScreen)) {
        // 		video[0].webkitRequestFullScreen();
        // 	}	
        // 	else if ($.isFunction(video[0].mozRequestFullScreen)) {
        // 		video[0].mozRequestFullScreen();
        // 	}
        // 	else {
        // 		alert('Your browsers doesn\'t support fullscreen');
        // 	}
        // }
        //全屏
        if (document.webkitIsFullScreen) {
            //退出全屏，移出全屏class
            exitFullscreen();
            $(".videoContainer").removeClass("videoContainer-center")
        } else {
            //进入全屏，添加全屏clas
            launchFullScreen(document.documentElement);
            $(".videoContainer").addClass("videoContainer-center")
        }
        /*else if ($.isFunction(video[0].mozRequestFullScreen)) {
        	video[0].mozRequestFullScreen();
        }
        else {
        	alert('Your browsers doesn\'t support fullscreen');
        }*/

    });

    // 找到支持的方法, 使用需要全屏的 element 调用
    function launchFullScreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    // 退出 fullscreen
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozExitFullScreen) {
            document.mozExitFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        
    }



    //灯泡按钮点击
    /*$('.btnLight').click(function() {
        $(this).toggleClass('lighton');

        //if lightoff, create an overlay
        if (!$(this).hasClass('lighton')) {
            $('body').append('<div class="overlay"></div>');
            $('.overlay').css({
                'position': 'absolute',
                'width': 100 + '%',
                'height': $(document).height(),
                'background': '#000',
                'opacity': 0.9,
                'top': 0,
                'left': 0,
                'z-index': 999
            });
            $('.videoContainer').css({
                'z-index': 1000
            });
        }
        //if lighton, remove overlay
        else {
            $('.overlay').remove();
        }
    });*/

    //声音按钮点击
    $('.sound').click(function() {
        //如果声音控制台没有显示，就让其显示，并跳出程序
        if ($('.volume_none').css('display') == "none") {
            $('.volume_none').show();
            return false;
        }
        //是否静音，设置为true or false
        video[0].muted = !video[0].muted;
        //添加静音class
        $(this).toggleClass('muted');
        if (video[0].muted) {//非静音 设置为静音，设置音量为0
            $('.volumeBar').css('height', 0);
            $('.volumeT').text(0);
        } else {//是静音 设置为非静音，设置音量为当前音量
            $('.volumeBar').css('height', video[0].volume * 100 + '%');
            $('.volumeT').text(Math.floor(video[0].volume * 100));
        }
    });

    //全屏点击，隐藏声音控件
    $("html,body").click(function() {
        $('.volume_none').hide();
    })
    //点击声音控件，阻止隐藏声音控件
    $(".volume_none,.sound").click(function(e){
        e.stopPropagation();
    })

    //视频事件
    //视频canplay事件
    video.on('canplay', function() {
        $('.loading').fadeOut(100);
    });

    //视频canplaythrough事件
    //解决浏览器缓存问题
    var completeloaded = false;
    video.on('canplaythrough', function() {
        completeloaded = true;
    });

    //视频结束事件
    video.on('ended', function() {
        $('.btnPlay').removeClass('paused');
        video[0].pause();
    });

    //视频寻求事件
    video.on('seeking', function() {
        //如果视频满载,忽略加载屏幕
        if (!completeloaded) {
            $('.loading').fadeIn(200);
        }
    });



    //视频等待更多数据的事件
    video.on('waiting', function() {
        $('.loading').fadeIn(200);
    });

    //视频进度条
    //当视频timebar点击
    var timeDrag = false; /* 检查拖动事件 */
    //鼠标视频进度条拖动事件
    $('.progress').on('mousedown', function(e) {
        timeDrag = true;
        updatebar(e.pageX);
    });
    $(document).on('mouseup', function(e) {
        if (timeDrag) {
            timeDrag = false;
            updatebar(e.pageX);
        }
    });
    $(document).on('mousemove', function(e) {
        if (timeDrag) {
            updatebar(e.pageX);
        }
    });
    //移动端视频进度条拖动事件
    $('.progress').on('touchstart', function(e) {
        timeDrag = true;
        var XX = event.targetTouches[0].pageX;
        updatebar(XX);
        $(document).on('touchend', function(e) {
            if (timeDrag) {
                timeDrag = false;
                updatebar(XX);
            }
        });
        $(document).on('touchmove', function(e) {
            if (timeDrag) {
                XX = event.targetTouches[0].pageX;
                updatebar(XX);
            }
        });
    });


    var updatebar = function(x) {
        var progress = $('.progress');

        //计算阻力位置
        //和更新视频currenttime
        //进度条
        var maxduration = video[0].duration;
        var position = x - progress.offset().left;
        var percentage = 100 * position / progress.width();
        if (percentage > 100) {
            percentage = 100;
        }
        if (percentage < 0) {
            percentage = 0;
        }
        $('.timeBar').css('width', percentage + '%');
        video[0].currentTime = maxduration * percentage / 100;
    };

    //音量条
    //音量控制
    var volumeDrag = false;
    //鼠标音量拖动事件
    $('.volume').on('mousedown', function(e) {
        e.stopPropagation();
        volumeDrag = true;
        video[0].muted = false;
        $('.sound').removeClass('muted');
        updateVolume(e.pageY);
    });
    $(document).on('mouseup', function(e) {
        if (volumeDrag) {
            volumeDrag = false;
            updateVolume(e.pageY);
        }
    });
    $(document).on('mousemove', function(e) {
        if (volumeDrag) {
            updateVolume(e.pageY);
        }
    });
    //移动端音量拖动事件
    $('.volume').on('touchstart', function(e) {
        e.stopPropagation();
        volumeDrag = true;
        video[0].muted = false;
        $('.sound').removeClass('muted');
        var XX = event.targetTouches[0].pageY;
        updateVolume(XX);
        $(document).on('touchend', function(e) {
            if (volumeDrag) {
                volumeDrag = false;
                updateVolume(XX);
            }
        });
        $(document).on('touchmove', function(e) {
            if (volumeDrag) {
                XX = event.targetTouches[0].pageY;
                updateVolume(XX);
            }
        });
    });


    var updateVolume = function(x, vol) {
        var volume = $('.volume');
        var percentage;
        //如果有传入音量
        //更新音量数量
        if (vol) {
            percentage = vol * 100;
        } else {
            var position = volume.height() + volume.offset().top - x;
            percentage = 100 * position / volume.height();
        }

        if (percentage > 100) {
            percentage = 100;
        }
        if (percentage < 0) {
            percentage = 0;
        }

        //更新进度条和视频进度
        $('.volumeBar').css('height', percentage + '%');
        video[0].volume = percentage / 100;
        $('.volumeT').text(Math.floor(video[0].volume * 100));
        //基于音量大小改变音量图标
        if (video[0].volume == 0) {
            $('.sound').removeClass('sound2').addClass('muted');
        } else if (video[0].volume > 0.5) {
            $('.sound').removeClass('muted').addClass('sound2');
        } else {
            $('.sound').removeClass('muted').removeClass('sound2');
        }
    };

    //时间格式转换
    var timeFormat = function(seconds) {
        var m = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
        var s = Math.floor(seconds - (m * 60)) < 10 ? "0" + Math.floor(seconds - (m * 60)) : Math.floor(seconds - (m * 60));
        return m + ":" + s;
    };
});