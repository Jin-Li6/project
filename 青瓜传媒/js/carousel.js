function css() {
    var ele = arguments[0];
    var attr = arguments[1];
    if (arguments.length == 2) {
        //获取样式
        if (getComputedStyle(ele, false)) {
            //证明在主流浏览器下：IE9+ 和 主流的浏览器
            return getComputedStyle(ele, false)[attr];
        } else {
            //低版本IE:IE678
            return ele.currentStyle(attr);
        }
    } else if (arguments.length == 3) {
        //设置样式
        // box.style.display = 'block';
        var val = arguments[2];
        ele.style[attr] = val;
    }

}

function startMove(obj, json, fnend) {

    clearInterval(obj.timer); //防止定时器叠加
    obj.timer = setInterval(function () {

        var istrue = true;

        //1.获取属性名，获取键名：属性名->初始值
        for (var key in json) { //key:键名   json[key] :键值
            //			console.log(key); //width heigth opacity
            var cur = 0; //存初始值

            if (key == 'opacity') { //初始值
                cur = css(obj, key) * 100; //透明度
            } else {
                cur = parseInt(css(obj, key)); // 300px  300  width heigth borderwidth px为单位的

            }

            //2.根据初始值和目标值，进行判断确定speed方向，变形：缓冲运动
            //距离越大，速度越大,下面的公式具备方向
            var speed = (json[key] - cur) / 6; //出现小数
            speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed); //不要小数部分，没有这句话或晃动

            //保证上一个属性全部都达到目标值了
            if (cur != json[key]) { //width 200 heigth 400
                istrue = false; //如果没有达到目标值，开关false
            } else {
                istrue = true; //true true
            }

            //3、运动
            if (key == 'opacity') {
                obj.style.opacity = (cur + speed) / 100; //0-1
                obj.style.filter = 'alpha(opacity:' + (cur + speed) + ')'; //0-100
            } else {
                obj.style[key] = cur + speed + 'px'; //针对普通属性 left  top height 
            }

        }

        //4.回调函数:准备一个开关,确保以上json所有的属性都已经达到目标值,才能调用这个回调函数
        if (istrue) { //如果为true,证明以上属性都达到目标值了
            clearInterval(obj.timer);
            if (fnend) { //可选参数的由来
                fnend();
            }
        }

    }, 30); //obj.timer 每个对象都有自己定时器

}

/*--------------------------------------------*/
function imgScroll(id) {

    let box = document.getElementById(id);
    let lis = box.querySelectorAll('.imglist li');
    let iw = lis[0].offsetWidth;
    let light = box.querySelector('.light');
    let now = 0; //存放可视区图片下标
    let prevbtn = box.querySelector('.prev');
    let nextbtn = box.querySelector('.next');

    //1.把图片放大右侧，除了第一张放在可视区
    for (var i = 1; i < lis.length; i++) {
        lis[i].style.left = iw + 'px';
    }

    //2.开启定时器让图片动起来,自动轮播

    let timer = null;

    timer = setInterval(next, 2000); //每间隔两秒钟切换一个图片

    function next() {
        //旧图挪走，新图进场
        startMove(lis[now], {
            'left': -iw
        });
        //新图
        now++;
        if (now >= lis.length) { //临界点
            now = 0;
        }
        lis[now].style.left = iw + 'px'; //快速把新图放在右侧
        startMove(lis[now], {
            'left': 0
        });
        lightMove(); //焦点跟随
    }

    function prev() {
        //旧图：挪到右边
        startMove(lis[now], {
            'left': iw
        });
        //新图
        now--;
        if (now < 0) { //临界值
            now = lis.length - 1;
        }
        //新图快速放在左边，再挪进可视区
        lis[now].style.left = -iw + 'px';
        startMove(lis[now], {
            'left': 0
        });
        lightMove(); //焦点跟随
    }

    //3.生成焦点并焦点跟随
    var html = '';
    for (var i = 0; i < lis.length; i++) {
        html += `<span>${i + 1}</span>`;
    }
    light.innerHTML = html;
    light.children[0].className = 'active';

    //焦点跟随
    function lightMove() {
        //排他
        for (var i = 0; i < light.children.length; i++) {
            light.children[i].className = '';
        }
        light.children[now].className = 'active';
    }

    //4.左右按钮可以切换上下张

    //输入移入停止播放，鼠标移出继续播放
    box.onmouseover = () => {
        clearInterval(timer);
    }

    box.onmouseout = () => {
        timer = setInterval(next, 2000); //每间隔两秒钟切换一个图片
    }

    nextbtn.onclick = () => {
        next(); //下一张
    }

    prevbtn.onclick = () => {
        prev(); //上一张
    }


    //5.点击焦点能快速的跳转到对应图片
    light.onclick = ev => {
        if (ev.target.tagName.toLowerCase() == 'span') {
            // console.log(ev.target.innerHTML - 1);
            let index = ev.target.innerHTML - 1;
            if (index > now) {
                //新图从右边切入
                //旧图挪到左侧
                startMove(lis[now], {
                    'left': -iw
                });
                //新图快速放在右侧，挪到可视区
                lis[index].style.left = iw + 'px';
                startMove(lis[index], {
                    'left': 0
                });
            }
            if (index < now) {
                //从左边切入
                startMove(lis[now], {
                    'left': iw
                });
                lis[index].style.left = -iw + 'px';
                startMove(lis[index], {
                    'left': 0
                });
            }
            //新图变旧图
            now = index;
            lightMove();
        }
    }
}