
$(function () {
    //用户头像浮动效果
    $('.js-user').hover(function () {
        $(this).find('.tooltip-user').addClass('open');
    }, function () {
        $(this).find('.tooltip-user').removeClass('open');
    });
});

jQuery.fn.Shake = function shake(shakenum, shakeDistance) {
    this.each(function () {
        var jSelf = $(this);
        jSelf.css({ position: 'relative' });
        for (var x = 1; x <= shakenum; x++) {
            jSelf.animate({ left: (-shakeDistance) }, 20)
                .animate({ left: shakeDistance }, 20)
                    .animate({ left: 0 }, 30);
        }
    });
    return this;
}

//layer
var index = 0;
function layerLogin() {
    index = layer.open({
        type: 2,
        title: $('#JsA16').val(),
        area: ['400px', '530px'],
        offset: '50px',
        content: "/project/loginiframe?returl=" + location.href
    });
}
function GetIndex() {
    return index;
}
//layer

/*SVG动画开始*/
//协议  
var svgNS = "http://www.w3.org/2000/svg";
//封装方法创建标签  
function createTag(tag, tagAttr) {
    var oTag = document.createElementNS(svgNS, tag);
    for (var attr in tagAttr) {
        oTag.setAttribute(attr, tagAttr[attr]);
    };
    return oTag;
};
//画圆弧的路径  
function drawArcByRadiusDeg(startX, startY, r, deg, clockwise) {
    var cw = typeof clockwise !== 'undefined' ? clockwise : 1;
    var x = startX - r + r * Math.cos(deg * Math.PI / 180);
    var y = startY + (1 === cw ? 1 : -1) * r * Math.sin(deg * Math.PI / 180);
    var bigOrSmall = deg > 180 ? 1 : 0;
    return "M " + startX + " " + startY + " A " + r + " " + r + " 0 " + bigOrSmall + " " + cw + " " + x + " " + y
}
//画图  
function drawPath(data, obj, x, y, r, stroke) {
    var clockwise = 1;//x,y圆心位置   r圆弧的半径   clockwise顺时针  
    var Percentage = data * 359.9999;
    var circle1 = createTag('path', { 'd': drawArcByRadiusDeg(x, y, r, 359.99, clockwise), 'opacity': "0.3", 'fill-opacity': "0", 'stroke-width': stroke });
    var circle2 = createTag('path', { 'd': drawArcByRadiusDeg(x, y, r, Percentage, clockwise), 'opacity': "1", 'fill-opacity': "0", 'stroke-width': stroke });



    $(obj).find('svg').append(circle1);
    $(obj).find('svg').append(circle2);

}
/*SVG动画结束*/
