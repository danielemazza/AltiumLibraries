$(function () {
    /*上传文件开始*/
    var uploader = WebUploader.create({
        // 选完文件后，是否自动上传。
        auto: true,
        // swf文件路径
        swf: '/img/js/jqueryplus/webuploader-0.1.5/Uploader.swf',
        // 文件接收服务端。
        server: '/Common/UpFile',
        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: { id: '#msgFile', multiple: false },
        fileVal: 'FileData',
        //fileNumLimit: 1,
        fileSingleSizeLimit: '10485760',
        accept: {
            title: 'File',
            extensions: 'bmp,png,gif,jpg,jpeg',
            mimeTypes: 'image/*'
        },
        'formData': { 'uptype': "blogfile", 'key': "", 'checkcode': "", "getjson": true },
    });

    uploader.on('uploadStart', function (file, percentage) {
        if (logintype != 1) {
            layerLogin();
            return;
        }
        $('#sfile').html('Uploading(0%)');
    });

    uploader.on('uploadProgress', function (file, percentage) {
        $('#sfile').html('<font color="green">Uploading(' + parseInt(percentage * 100) + '%)</font>');
    });

    uploader.on('uploadSuccess', function (file, data) {


        $('#sfile').html('');
        $('#msgPic').parent().find('img').remove();
        $('#msgPic').before('<img src="' + data.url + '" />');
        $('#msgPic').val(data.url);
        $('#msgPic').next().show();
        $('.error-tips').hide();
    });

    uploader.on('error', function (str) {
        if (str == "F_EXCEED_SIZE") {
            alert($('#JsA9').val())
        }
    });

    $('#removeMsgPic').click(function () {
        $('#msgPic').val('');
        $('#msgPic').parent().find('img').remove();
        $(this).hide();
        uploader.reset();
    });

    /*上传文件结束*/

});
//查看大图
function showbigimg(obj) {
    $('.mask,.close').show();
    var tempUrl = $(obj).attr('src');
    var tempImg = document.createElement('img');
    tempImg.src = tempUrl;
    $('.capablis').empty().append(tempImg).show();
}
function hidebigimg() {
    $('.mask,.close,.capablis').hide();
}


/*留言开始*/

//删除自己5小时内的留言
function delmsg(level, id, ispage) {
    layer.confirm($('#JsA10').val(), function (index) {
        $.getJSON($('#memberurl').val() + '/Web/DelComment?callback=?', { msgid: id }, function (res) {
            if (res.result) {
                if (level == 1) {
                    if (ispage > 0)
                        window.location.reload();
                    $('#li' + id).remove();
                    setChildrenMsgCount(level, id, -1);
                }
                else {
                    var obj = $('#' + (level == 1 ? 'li' : 'div-three-') + id);
                    var num = parseInt(obj.parents('li').find('b').text());
                    num += -1;
                    if (num < 0) {
                        num = 0;
                    }
                    obj.parents('li').find('b').text(num);
                    $('#div-three-' + id).remove();
                }
                setMsgCount(-1);

                layer.close(index);
            }
            else if (res.msg == "nothing") {
                layer.alert("error");
                return;
            }
            else if (res.msg == "havereply") {
                layer.alert($('#JsA11').val());
                return;
            }
            else {
                layer.alert($('#JsA12').val());
                return;
            }

        });
    })

}

//回复留言

//添加留言输入框
function addreplyform(level, id, bename) {
    if (level == 1) {
        //第一级留言（直接回复博客）
        //目前,第一级留言输入框默认显示
    }
    else if (level == 2) {
        //第二级留言（回复第一级留言）
        if ($('#form-two-' + id).length > 0) {
            $('#div-two-' + id).toggle();
            return;
        }
        var html = '<form class="sub-comment-form  active" id="form-two-' + id + '">';
        html += '<div class="form-group">';
        html += '<textarea id="msg-' + id + '" rows="1" class="form-control js-mention js-auto-expand" placeholder="" onfocus="focusmsg(this)" required></textarea>';
        html += '</div>';
        html += '<div class="form-group text-right actions">';
        html += '<button type="button" class="btn btn-default btn-sm" onclick="cancelmsg(this)">' + $('#JsCancel').val() + '</button> ';
        html += '<button type="button" class="btn btn-primary btn-sm" onclick="savemsg(2,' + id + ',1)">' + $('#JsA15').val() + '</button>';
        html += '</div>';
        $('#div-two-' + id).append(html).show();
    }
    else if (level == 3) {
        //第三级留言（回复第二级留言）
        if ($('#form-two-' + id).length > 0) {
            $('#form-two-' + id).toggle();
            return;
        }
        var html = '<form class="js-active-on-valid js-comment-create" id="form-two-' + id + '">';
        html += '<div class="form-group">';
        html += '<span class="reply_name small">' + $('#JsA13').val() + ' @' + bename + ' </span>';
        html += '<textarea id="msg-' + id + '" rows="1" class="form-control js-mention js-auto-expand" placeholder="" onfocus="focusmsg(this)" required></textarea>';
        html += '</div>';
        html += '<div class="form-group text-right">';
        html += '<button type="button" class="btn btn-default btn-sm" onclick="addreplyform(3,' + id + ')">' + $('#JsCancel').val() + '</button> ';
        html += '<button type="button" class="btn btn-primary btn-sm" onclick="savemsg(3,' + id + ',1)">' + $('#JsA15').val() + '</button>';
        html += '</div>';
        $('#div-three-' + id).children('div').append(html).show();
    }
}

//保存留言
function savemsg(level, id, ispage) {
    var msg = $('#msg-' + id).val();
    var msgpic = '';
    var detailid = 0;
    if (level == 1) {
        msgpic = $('#msgPic').val();
    }
    
    if ((msg && msg.length > 0) || msgpic.length > 4) {
        $.ajax({
            url: $('#memberurl').val() + '/Web/SaveComment?callback=?',
            dataType: 'jsonp',
            data: { msg: msg, replyid: id, objid: $('#hidobjid').val(), msgpic: msgpic, objtype: $('#hidobjtype').val() },
            success: function (res) {
                if (res.result) {
                    if (ispage > 0) {
                        window.location.reload();
                        return;
                    }
                    //js加载，不刷新页面，增强体验
                    $('#msg-' + id).val("");
                    if (level == 1) {
                        $('#msgPic').val('');
                        $('#msgPic').parent().find('img').remove();
                        $('#removeMsgPic').hide();
                        //第一级留言（直接回复博客）
                        var objtype = parseInt($('#hidobjtype').val());
                        var html = '<li class="comment-item" id="li' + res.msg.Id + '">';
                        if (objtype != 1 && objtype != 2 && objtype != 3) {
                            html += '<div class="a-i-award"><dl class="" onclick="MarkComment(this,true,' + res.msg.Id + ')"><dt class="icon-award"></dt>';
                            html += '<dd id="commentMarkCnt' + res.msg.Id + '">0</dd></dl><dl class="" onclick="MarkComment(this,false,' + res.msg.Id + ')"><dt class="icon-n-award"></dt></dl></div>';
                            html += '<div class="r-user-info"><span class="r-name"><a href="/project/member/?bmbno=' + res.msg.UserGuid + '" target="_blank" class="link"><img src="' + (res.msg.HeadPic == "" ? "/project/img/images/avatar/user_pic-70x705.png" : res.msg.HeadPic) + '" class="avatar-m">' + (res.msg.ContactName == "" ? "Engineer" : res.msg.ContactName) + '</a></span></div>';
                        } else {
                            html += '<span class="r-avatar"><a href="/project/member/?bmbno=' + res.msg.UserGuid + '" target="_blank" class="link"><img src="' + (res.msg.HeadPic == "" ? "/project/img/images/avatar/user_pic-70x705.png" : res.msg.HeadPic) + '" class="avatar-m"></a></span>';
                            html += '<div class="r-user-info"><span class="r-name"><a href="/project/member/?bmbno=' + res.msg.UserGuid + '" target="_blank" class="link">' + (res.msg.ContactName == "" ? "Engineer" : res.msg.ContactName) + '</a></span></div>';
                        }

                        html += '<p class="r-message">';
                        if (res.msg.MsgPic && res.msg.MsgPic.length > 0) {
                            html += '<img src="' + res.msg.MsgPic + '" />' + '<br />'
                        }
                        html += res.msg.Note + '</p>';
                        html += '<div class="a-i-footer clearfix">';
                        html += '<span class="info-text">' + res.msg.EnAddTime + '</span>';
                        html += '<span class="info-text comment-info"><i class="icon-comment"></i> <b>0</b> Comments</span>';
                        html += '</div>';
                        html += '<div class="sub-comments-box" style="display:none;" id="div-two-' + res.msg.Id + '">';
                        html += '<div class="sub-comments media-list"></div></div>';
                        html += '<div class="r-operate-btn">';
                        html += '<span class="icon-btn icon-replay" onclick="addreplyform(2,\'' + res.msg.Id + '\')">Reply</span> ';
                        html += '<span class="icon-btn icon-del" onclick="delmsg(1,\'' + res.msg.Id + '\',' + ispage + ')">delete</span>';
                        html += '</div>';
                        html += '</li>';
                        $('.comments-list').append(html);
                        setMsgCount(1);
                        setChildrenMsgCount(1, res.msg.Id, 1);
                        if (ispage == 0)
                            $("html,body").animate({ scrollTop: $("#li" + res.msg.Id).offset().top - 70 }, 1000);
                    }
                    else {
                        //第二级留言（回复第一级留言）
                        var html = '<div class="sub-comment media" id="div-three-' + res.msg.Id + '">';
                        html += '<div class="media-body" >';
                        html += '<div class="source clearfix">';
                        html += '<a href="/project/member/?bmbno=' + res.msg.UserGuid + '" target="_blank" class="author">' + (res.msg.ContactName == "" ? "Engineer" : res.msg.ContactName);
                        html += '</a>';
                        html += '<span class="action-link"> ' + res.msg.AddTime;
                        html += '</span>';
                        html += '<span class="pull-right">';
                        html += '<a href="javascript:void(0)" class="action-link" onclick="addreplyform(3,' + res.msg.Id + ',\'' + (res.msg.ContactName == "" ? "Engineer" : res.msg.ContactName) + '\')">Reply</a> ';
                        html += '<a href="javascript:void(0)" class="action-link js-comment-destroy" onclick="delmsg(' + level + ',' + res.msg.Id + ',' + ispage + ')">delete</a>';
                        html += '</span>';
                        html += '</div>';
                        html += '<div class="content unsafe">';
                        if (level == 3) {
                            //第三级留言（回复第二级留言）
                            html += '<div class="question-comment-reply small">';
                            html += 'Reply<a href="/project/member/?bmbno=' + res.msg.ReplyUserGuid + '" target="_blank" class="author" >@ ' + (res.msg.ReplyContactName == "" ? "Engineer" : res.msg.ReplyContactName) + '：</a>';
                            html += '</div>';
                        }
                        html += '<p>' + res.msg.Note + '</p>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                        if (level == 3) {
                            //第三级留言（回复第二级留言）
                            addreplyform(3, id);
                            $('#div-three-' + id).parent('div').append(html);
                        }
                        else {
                            $('#div-two-' + id).children('div').append(html);
                        }

                        setMsgCount(1);
                        setChildrenMsgCount(3, res.msg.Id, 1);
                    }
                }
                else if (res.msg == "nologin") {
                    //弹出登录框
                    layerLogin();
                }
                else {
                    layer.alert("error");
                }

            },
            error: function (xhr, status, error) {

            }

        });
    }
    else {
        $('#msg-' + id).addClass('form-error');
        if (!$('#msg-' + id).hasClass('js-mention'))
            $('.error-tips').show().Shake(4, 10);
    }

}

function cancelmsg(obj) {
    $(obj).closest("form").removeClass("active");
}

function focusmsg(obj) {
    $(obj).closest("form").addClass("active");
}

//更新留言数量
function setMsgCount(val) {
    var num = parseInt($('#MsgCount').text());
    num += parseInt(val);
    if (num < 0) {
        num = 0;
    }
    $('#MsgCount').text(num);
}

function setChildrenMsgCount(level, id, val) {
    var obj = $('#' + (level == 1 ? 'li' : 'div-three-') + id);
    var num = parseInt(obj.parents('li').find('b').text());
    num += parseInt(val);
    if (num < 0) {
        num = 0;
    }
    obj.parents('li').find('b').text(num);
}

//加载留言
function LoadComment(page, objid) {
    $('#comment_ul').html('');
    $('#commentload').show();
    $.ajax({
        url: $('#memberurl').val() + '/Web/GetWebComment?callback=?',
        dataType: 'jsonp',
        data: { objid: objid, objtype: $('#hidobjtype').val(), page: page },
        success: function (jason) {
            var totalpage = jason.TotalCount / 20;
            if (totalpage % 1 > 0)
                totalpage = parseInt(totalpage) + 1;

            if (jason.PageDv && jason.PageDv.length > 0) {
                $('#PageDv').html('<div class="dvPage">' + jason.PageDv + '</div>');
            }
            
            //if (page >= totalpage)
            //{
            //    $('#commentviewmore').parent().remove();
            //}
            if (jason.TotalCount > 0) {
                page = jason.PageIndex;
                var msgList = jason.DataList;
                var html = '';
                if (msgList && msgList.length > 0) {
                    for (var item in msgList) {
                        html += '<li class="comment-item" id="li' + msgList[item].Id + '">';
                        if ($('#hidobjtype').val() != 1 && $('#hidobjtype').val() != 2 && $('#hidobjtype').val() != 3) {
                            html += '<div class="a-i-award">';
                            html += '<dl class="' + (msgList[item].MarkStatus == 1 ? "active" : "") + '" onclick="MarkComment(this,true,'+msgList[item].Id+')">';
                            html += '<dt class="icon-award"></dt>';
                            html += '<dd id="commentMarkCnt'+msgList[item].Id+'">'+msgList[item].MarkCnt+'</dd>';
                            html += '</dl>';
                            html += '<dl class="' + (msgList[item].MarkStatus == 2 ? "active" : "") + '" onclick="MarkComment(this,false,' + msgList[item].Id + ')">';
                            html += '<dt class="icon-n-award"></dt>';
                            html += '</dl></div>';
                            html += '<div class="r-user-info"><span class="r-name"><a href="/project/member/?bmbno=' + msgList[item].UserGuid + '" target="_blank" class="link"><img src="' + msgList[item].HeadPic + '" class="avatar-m">' + (msgList[item].MbId > 0 ? msgList[item].ContactName : msgList[item].Name == "" ? msgList[item].Email : msgList[item].Name) + '</a></span></div>';
                        }
                        else {
                            html += '<span class="r-avatar">';
                            html += '<a href="/project/member/?bmbno=' + msgList[item].UserGuid + '" target="_blank" class="link">'
                            html += '<img src="' + msgList[item].HeadPic + '" class="avatar-m">';
                            html += '</a>';
                            html += '</span>'
                            html += '<div class="r-user-info"><span class="r-name"><a href="/project/member/?bmbno=' + msgList[item].UserGuid + '" target="_blank" class="link">' + (msgList[item].MbId > 0 ? msgList[item].ContactName : msgList[item].Name == "" ? msgList[item].Email : msgList[item].Name) + '</a></span></div>';
                        }
                        html += '<div class="r-message"><div class="des-text">' + msgList[item].Note + '</div>' + (msgList[item].MsgPic != "" ? '<div class="imgs-box clearfix"><div class="imgs"><img src="' + msgList[item].MsgPic + '" onclick="showbigimg(this)" /></div></div>' : "") + '</div>';
                        html += '<div class="a-i-footer clearfix">';
                        html += '<span class="info-text">' + msgList[item].EnAddTime + '</span>';
                        html += '<span class="info-text comment-info"><i class="icon-comment"></i><b>' + (msgList[item].ReplyList ? msgList[item].ReplyList.length : 0) + '</b> ' + $('#JsA1').val() + '</span>';
                        html += '</div>';
                        //<!-- 回复留言 -->
                        html += '<div class="sub-comments-box" style="' + (msgList[item].ReplyList && msgList[item].ReplyList.length > 0 ? "" : " display:none;") + '" id="div-two-' + msgList[item].Id + '">';
                        html += '<div class="sub-comments media-list">';
                        var ReplyList = msgList[item].ReplyList;
                        if (ReplyList && ReplyList.length > 0) {
                            for (var reply in ReplyList) {
                                html += '<div class="sub-comment media" id="div-three-' + ReplyList[reply].Id + '">';
                                html += '<div class="media-body" style="display: block;">';
                                html += '<div class="source clearfix">';
                                html += '<a href="/project/member/?bmbno=' + ReplyList[reply].UserGuid + '" target="_blank" class="author">' + ReplyList[reply].ContactName + '</a> ';
                                html += '<span class="action-link">' + ReplyList[reply].AddTimeStr + '</span>';
                                html += '<span class="pull-right">';
                                html += '<a href="javascript:void(0)" class="action-link" onclick="addreplyform(3,' + ReplyList[reply].Id + ',\'' + ReplyList[reply].ContactName + '\')">' + $('#JsA13').val() + '</a>';
                                if (ReplyList[reply].IsMy && ((new Date() -new Date(ReplyList[reply].AddTime)) / (1000 * 60 * 60)) <= 5 && (!ReplyList[reply].ReplyList || ReplyList[reply].ReplyList.length == 0)) {
                                    html += ' <a href="javascript:void(0)" class="action-link js-comment-destroy" onclick="delmsg(' + (ReplyList[reply].ReplyCommentId > 0 && ReplyList[reply].ReplyCommentId != msgList[item].Id ? 3 : 2) + ',' + ReplyList[reply].Id + ',1)">' + $('#JsA14').val() + '</a>';
                                }
                                html += '</span>';
                                html += '</div>';

                                html += '<div class="content unsafe">';
                                if (ReplyList[reply].ReplyCommentId > 0 && ReplyList[reply].ReplyCommentId != msgList[item].Id) {
                                    html += '<div class="question-comment-reply small">';
                                    html += 'Reply<a href="/project/member/?bmbno=' + ReplyList[reply].ReplyUserGuid + '" target="_blank" class="author">@ ' + ReplyList[reply].ReplyContactName + '：</a>';
                                    html += '</div>';
                                }
                                html += '<p>' + ReplyList[reply].Note + '</p>';

                                html += '</div>';
                                html += '</div>';
                                html += '</div>';
                            }
                        }
                        html += '</div>';
                        if (msgList[item].ReplyList && msgList[item].ReplyList.length > 0) {
                            html += '<form class="sub-comment-form  active" id="form-two-' + msgList[item].Id + '">';
                            html += '<div class="form-group">';
                            html += '<textarea id="msg-' + msgList[item].Id + '" rows="1" class="form-control js-mention js-auto-expand" placeholder="" onfocus="focusmsg(this)" required></textarea>';
                            html += '</div>';
                            html += '<div class="form-group text-right actions">';
                            html += '<button type="button" class="btn btn-default btn-sm" onclick="cancelmsg(this)">' + $('#JsCancel').val() + '</button> ';
                            html += '<button type="button" class="btn btn-primary btn-sm" onclick="savemsg(2,' + msgList[item].Id + ',1)">' + $('#JsA15').val() + '</button>';
                            html += '</div>';
                            html += '</form>';
                        }
                        html += '</div>';
                        html += '<div class="r-operate-btn">';
                        if (msgList[item].MbId > 0) {
                            html += '<span class="icon-btn icon-replay" onclick="addreplyform(2,' + msgList[item].Id + ')">' + $('#JsA13').val() + '</span>';
                        }
                        //<!-- 可删除自己5小时内的留言 -->
                        if (msgList[item].IsMy && ((new Date() - new Date(msgList[item].AddTime)) / (1000 * 60 * 60)) <= 5 && (!msgList[item].ReplyList || msgList[item].ReplyList.Count == 0)) {
                            html += ' <span class="icon-btn icon-del" onclick="delmsg(1,' + msgList[item].Id + ',1)">' + $('#JsA14').val() + '</span>';
                        }
                        html += '</div>';
                        html += '</li>';
                    }
                    $('#commentload').hide();
                    $('#comment_ul').html(html);
                    //$('#comment_ul').append(html);
                }

            }
            $('#commentload').hide();
        },
        error: function (xhr, status, error) {
            $('#commentload').hide();
        }

    });
}

/*留言结束*/



