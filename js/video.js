(function($) {
    var videos = function(obj) {
        // 初始化
        var _this = this;
        var video = obj,
            // 为video添加父级容器，并获取video父级
            videoParent = video.wrap("<div>").parent(),
            _controlHtml = "<div class=\"topControl hidden\">" + "<div class=\"btnPlay\" title=\"Play/Pause video\"></div>" + "<div class=\"time\">" + "<span class=\"current\"></span>/<span class=\"duration\"></span>" + "</div>" + "<div class=\"progress\">" + "<span class=\"bufferBar\"></span>" + "<span class=\"timeBar\"></span>" + "</div>" + "<div class=\"soundBox\">" + "<div class=\"sound\" title=\"Mute/Unmute sound\"></div>" + "<span class=\"volume_none\">" + "<div class=\"volume_box\">" + "<span class=\"volumeT\">100</span>" + "<div class=\"volume\" title=\"Set volume\">" + "<span class=\"volumeBar\"></span>" + "</div>" + "<span class=\"volumeB\">0</span>" + "</div>" + "</span>" + "</div>" + "<div class=\"btnFS\" title=\"Switch to full screen\"></div>" + "</div>" + "<div class=\"caption\"><div class=\"caption_media\"></div><div class=\"caption_text\">正在加载，请稍等…</div></div>";
        videoParent.append(_controlHtml);

        var Control = videoParent.find('.topControl'), //控制条
            caption = videoParent.find('.caption'), //加载动画
            current = videoParent.find('.current'), //当前播放时间进度
            duration = videoParent.find('.duration'), //视频总时间
            btnPlay = videoParent.find('.btnPlay'), //播放按钮
            bufferBar = videoParent.find('.bufferBar'), //视频加载进度条
            progress = videoParent.find('.progress'), //播放进度条包裹div
            timeBar = videoParent.find('.timeBar'), //视频播放进度条
            sound = videoParent.find('.sound'), //声音按钮
            soundBox = videoParent.find('.soundBox'),
            volume_none = videoParent.find('.volume_none'), //声音条包裹div
            volumeBar = videoParent.find('.volumeBar'), //声音进度条
            volumeT = videoParent.find('.volumeT'), //当前声音大小
            volume = videoParent.find('.volume'), //声音背景条
            btnFS = videoParent.find('.btnFS'); //全屏按钮

        // 将video上的属性拷贝到父级之上，并给固有的class
        videoClassName = video.attr('class');
        videoParent.addClass(videoClassName);

        video.attr('class', 'vjs-tech');

        //页面加载后移除默认的controls控件
        video.removeAttr('controls');

        // 判断是否设置了自动播放
        if (video[0].autoplay) {
            videoParent.addClass("videoPlaying")
            video[0].play()
        } else {
            videoParent.addClass("videoPaused")
            video[0].pause()
        }
        caption.show();

        // 获取元数据后绑定的事件
        video.on('loadedmetadata', function() {
            /**
             * 设置视频属性
             * 1.设置视频开始时间
             * 2.设置视频总时间
             * 3.设置默认声音音量
             */
            current.text(_this.timeFormat(0));
            if (video[0].duration > 1) {
                duration.text(_this.timeFormat(video[0].duration));
            }else{
                duration.text(_this.timeFormat(0));
            }
            updateVolume(0, 0.5);
            Control.removeClass("hidden")
                //开始视频缓冲数据 
            setTimeout(startBuffer, 150);

            /**
             * 当获得元数据后3000毫秒隐藏播放控件
             */
            var time = setTimeout(function() {
                Control.animate({ 'bottom': -Control.height() }, 250);
                volume_none.hide();
            }, 5000);

            // 为父元素绑定鼠标和点击事件
            videoParent.on("mouseenter", function(e) {
                clearTimeout(time);
                e.preventDefault();
                Control.animate({ 'bottom': 0 }, 250);
            });
            videoParent.on('mouseleave', function(e) {
                e.preventDefault();
                if (!volumeDrag && !timeDrag) {
                    time = setTimeout(function() {
                        Control.animate({ 'bottom': -Control.height() }, 250);
                        volume_none.hide();
                    }, 5000);
                }
            });

            videoParent.on("touchstart touchmove", function() {
                clearTimeout(time);
                Control.animate({ 'bottom': 0 }, 250);
            });

            videoParent.on("touchend touchcancel", function() {
                clearTimeout(time);
                time = setTimeout(function() {
                    Control.animate({ 'bottom': -Control.height() }, 250);
                    volume_none.hide();
                }, 3000);

            })


            //显示视频缓冲栏
            var startBuffer = function() {
                //获取缓冲数据的最后一帧的时间
                var currentBuffer = video[0].buffered.end(0);
                //获取视频总时间
                var maxduration = video[0].duration;
                //转换百分比
                var perc = 100 * currentBuffer / maxduration;
                //设置缓冲进度条长度
                bufferBar.css('width', perc + '%');
                //如果缓冲还为完成，隔0.5秒执行一次缓冲条的计算
                if (currentBuffer < maxduration) {
                    setTimeout(startBuffer, 500);
                }
            };
        });

        //视频事件
        //视频canplay事件
        video.on('canplay', function() {
            caption.hide(100);
        });

        //视频canplaythrough事件
        //解决浏览器缓存问题
        var completeloaded = false;
        video.on('canplaythrough', function() {
            completeloaded = true;

        });


        //显示当前视频播放时间
        video[0].addEventListener("timeupdate", function () {
            //获取视频播放的当前时间位置
            var currentPos = video[0].currentTime;
            //获取视频总时间
            var maxduration = video[0].duration;
            //转换百分比
            var perc = 100 * currentPos / maxduration;
            //设置播放进度条长度
            timeBar.css('width', perc + '%');
            //写入播放的时间
            $(".text").text(currentPos)
            current.html(_this.timeFormat(currentPos));
            if (duration.text() == _this.timeFormat(0) && video[0].duration > 1) {
                duration.text(_this.timeFormat(video[0].duration));
            }
        });


        //视频结束事件
        video.on('ended', function() {
            btnPlay.removeClass('paused');
            video[0].pause();
        });

        //视频寻求事件
        video.on('seeking', function() {
            //如果视频满载,忽略加载屏幕
            if (!completeloaded) {
                caption.show(200);
            }
        });

        //视频等待更多数据的事件
        video.on('waiting', function() {
            caption.show(200);
        });

        /**
         * 控件事件绑定
         */
        var _touchstart = "ontouchstart" in document ? "touchstart" : "mousedown",
            _touchmove = "ontouchmove" in document ? "touchmove" : "mousemove",
            _touchend = "ontouchend" in document ? "touchend" : "mouseup";

        //点击视频，播放或者暂停
        video.on(_touchstart, function(e) {
            if (_this.isInFullScreen() || videoParent.hasClass('videofullscreen')) return;
            playpause();
        });
        //点击播放按钮，播放或者暂停
        btnPlay.on(_touchstart, function() { playpause(); });
        /**
         * 播放或者暂停的函数
         * @return 无 如果暂停就播放，反之播放就暂停
         */
        var playpause = function() {
            if (video[0].paused || video[0].ended) {
                videoParent.removeClass('videoPaused')
                videoParent.addClass('videoPlaying');
                video[0].play();
            } else {
                videoParent.addClass('videoPaused');
                videoParent.removeClass('videoPlaying');
                video[0].pause();
            }
        };

 
        //视频进度条
        //当视频timebar点击
        var timeDrag = false, // 检查拖动事件
            timevalue;
        //鼠标视频进度条拖动事件
        progress.on(_touchstart, function(e) {
            timeDrag = true;
            timevalue = e.pageX || event.targetTouches[0].pageX;
            updatebar(timevalue);
        });
        $(document).on(_touchmove, function(e) {
            if (timeDrag) {
                timevalue = e.pageX || event.targetTouches[0].pageX;
                $(".text").text(timevalue+""+timeDrag)
                updatebar(timevalue);
            }
        });
        $(document).on(_touchend, function() {
            if (timeDrag) {
                updatebar(timevalue);
                timeDrag = false;
            }
        });
        /**
         * 进度条函数
         * @param  {number} x 鼠标或者手指当前坐标位置
         */
        var updatebar = function(x) {
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
            timeBar.css('width', percentage + '%');
            video[0].currentTime = maxduration * percentage / 100;
            current.text(_this.timeFormat(video[0].currentTime));
        };


        /**
         * 为音量调节绑定事件
         */
        soundBox.on('mouseenter', function(event) {
            event.preventDefault();
            touchIsSupport = "ontouchstart" in document ? true : false;
            if (!touchIsSupport) {
                volume_none.show();
            }
        });
        soundBox.on('mouseleave', function(event) {
            event.preventDefault();
            volume_none.hide();
        });

        //声音按钮点击
        sound.on(_touchstart, function(event) {
            //是否静音，设置为true or false
            video[0].muted = !video[0].muted;
            //添加静音class
            $(this).toggleClass('muted');
            if (video[0].muted) { //非静音 设置为静音，设置音量为0
                volumeBar.css('height', 0);
                volumeT.text(0);
            } else { //是静音 设置为非静音，设置音量为当前音量
                volumeBar.css('height', video[0].volume * 100 + '%');
                volumeT.text(Math.floor(video[0].volume * 100));
            }
            _this.stopEventBubble(event);
        });

        //全屏点击，隐藏声音控件
        $("html,body").on(_touchstart, function() {
            volume_none.hide();
        });
        //点击声音控件，阻止隐藏声音控件
        volume_none.on(_touchstart, function(event) {
            _this.stopEventBubble(event);
        });

        //音量控制
        var volumeDrag = false,
            volumevalue;
        volume.on(_touchstart, function(e) {
            _this.stopEventBubble(e);
            volumeDrag = true;
            video[0].muted = false;
            sound.removeClass('muted');
            volumevalue = e.pageY || event.targetTouches[0].pageY;
            updateVolume(volumevalue);
        });
        $(document).on(_touchmove, function(e) {
            volumevalue = e.pageY || event.targetTouches[0].pageY;
            if (volumeDrag) {
                updateVolume(volumevalue);
            }
        });
        $(document).on(_touchend, function(e) {
            if (volumeDrag) {
                updateVolume(volumevalue);
                volumeDrag = false;
            }
        });
        /**
         * 设置音量函数
         * @param  {number} x   鼠标或者手指偏移量
         * @param  {number} vol 用来设置具体的偏移值
         */
        var updateVolume = function(x, vol) {
            var percentage;
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
            volumeBar.css('height', percentage + '%');
            video[0].volume = percentage / 100;
            volumeT.text(Math.floor(video[0].volume * 100));
            //基于音量大小改变音量图标
            if (video[0].volume == 0) {
                sound.addClass('muted');
            } else {
                sound.removeClass('muted');
            }
        };

        //全屏按钮
        btnFS.on(_touchstart, function() {
            if (_this.isInFullScreen()) {
                //退出全屏，移出全屏class
                videoParent.removeClass("videofullscreen")
            } else {
                //进入全屏，添加全屏clas
                if (videoParent.hasClass('videofullscreen')) {
                    videoParent.removeClass("videofullscreen")
                    Control.css('bottom', '0px');
                } else {
                    videoParent.addClass("videofullscreen")
                }
            }
            _this.toggleFullScreen()
            $(".text").text(i++)
        });
        var fullscreenchange = 'fullscreenchange webkitfullscreenchange mozfullscreenchange';
        $(document).off(fullscreenchange).on(fullscreenchange, function() {
            //如果当前不是全屏，移出class
            if (!_this.isInFullScreen()) {
                $("div.videofullscreen").removeClass("videofullscreen")
            }
        });

    };
    videos.prototype = {
        /**
         * 时间格式化函数
         * @param  {number} seconds 数值类型
         * @return {string}         返回字符串类型
         */
        timeFormat: function(seconds) {
            var m = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
            var s = Math.floor(seconds - (m * 60)) < 10 ? "0" + Math.floor(seconds - (m * 60)) : Math.floor(seconds - (m * 60));
            return m + ":" + s;
        },
        /**
         * 阻止事件冒泡
         * @param  {对象} event 事件执行后返回的事件对象
         * @return {无}       没有明确指出返回值
         */
        stopEventBubble: function(event) {
            var e = event || window.event;
            if (e && e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        },
        isInFullScreen: function() {

            if (document.fullScreenElement !== undefined) {
                return !!document.fullScreenElement;
            }
            if (document.mozFullScreen !== undefined) {
                return !!document.mozFullScreen;
            }
            if (document.webkitIsFullScreen !== undefined) {
                return !!document.webkitIsFullScreen;
            }
            if (window['fullScreen'] !== undefined) {
                return !!window.fullScreen;
            }
            if (window.navigator.standalone !== undefined) {
                return !!window.navigator.standalone;
            }

            // heuristic method
            // 5px height margin, just in case (needed by e.g. IE)
            var heightMargin = 5;
            var u = navigator.userAgent;
            if (u.indexOf('AppleWebKit') > -1 && /Apple Computer/.test(navigator.vendor)) {
                // Safari in full screen mode shows the navigation bar,which is 40px  
                heightMargin = 42;
            }
            return screen.width == window.innerWidth && Math.abs(screen.height - window.innerHeight) < heightMargin;
        },
        /** 
         * Switch to/from fullscreen mode. 
         * Must be triggered by mouse event 
         * @param {Boolean} b on/off fullscreen 
         */
        setFullScreen: function(b) {
            if (b) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.body.requestFullscreen) {
                    document.body.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (document.body.webkitRequestFullScreen) {
                    document.body.webkitRequestFullScreen();
                } else if (typeof window.ActiveXObject != "undefined") {
                    // for Internet Explorer  
                    var wscript = new ActiveXObject("WScript.Shell");
                    if (wscript != null) {
                        wscript.SendKeys("{F11}");
                    }
                }
            } else {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (typeof window.ActiveXObject != "undefined") {
                    // for Internet Explorer
                    var wscript = new ActiveXObject("WScript.Shell");
                    if (wscript != null) {
                        wscript.SendKeys("{F11}");
                    }
                }
            }
        },

        /** 
         * Toggle full screen mode. 
         * @return {Boolean} the new full-screen mode 
         */
        toggleFullScreen: function() {
            var isInFullScreen = this.isInFullScreen();
            this.setFullScreen(!isInFullScreen);
            return this.isInFullScreen();
        }
    }
    $(function() {
        $("video").each(function() {
            new videos($(this));
        });
        // setTimeout(function(){
        //     var a=$("html").html()
        //     $("body").text(a)
        // },10000)
    });
})(Zepto);
