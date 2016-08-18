String.prototype.format = format = function () {
    var args = arguments;
    //如果第一个参数是对象
    var isObject = typeof args[0] === 'object';
    var re = isObject ? /\{(\w+)\}/g : /\{(\d+)\}/g;
    return this.replace(re, function (m, key) {
        return isObject ? isNull(args[0][key]) : isNull(args[key]);
    });
}
//变量为null or undefined 返回 ''
function isNull(fieldvalue) {
    return fieldvalue == undefined || fieldvalue == null ? '' : fieldvalue;
};
/*
  2016-04-13 gooddeng
  最新写的最简洁的日期选择器。
  一百多行代码，你找不到更简洁的实现
*/

//Date对象加 本月一号是星期几的方法
Date.prototype.getFirstDayWeek = function () {
    var d = new Date(this);
    d.setDate(1);
    return d.getDay()
};

//Date对象加 本月多少天的方法
Date.prototype.getDaysInMonth = function () {
    var d1 = new Date(this), d2 = new Date(this);
    d1.setDate(1);
    d2.setDate(1);
    d2.setMonth(d2.getMonth() + 1);
    return (d2 - d1) / 86400000;
};


//根据日期创建本月的日历表
datepicker = {
    _generateHTML: function (D) {
        var year = D.getFullYear(), month = D.getMonth() + 1, day = D.getDate();

        //先生成所有的单元格
        var btnUpdate = function (addYear, addMonth, icon) {
            return '<th class="btn" data-click="update" data-param="{0},{1}">{2}</th>'.format(addYear, addMonth, icon);
        }

        var _html = ['<table>'];
        _html.push('<tr class="toolbar">' + btnUpdate("-1", "0", "«") + btnUpdate("0", "-1", "<") + '<th colspan=3>' + year + '-' + month + '-' + day + '</th>' + btnUpdate("0", "1", ">") + btnUpdate("1", "0", "»") + '</tr>');

        //生成周单元格
        _html.push('<tr class="week">');
        var week = ['日', '一', '二', '三', '四', '五', '六'];
        for (var i = 0; i < week.length; i++) {
            _html.push('<th>' + week[i] + '</th>');
        }
        _html.push('</tr>');

        var cells = [];

        //初始行空白单元格
        for (var i = 0; i < D.getFirstDayWeek() ; i++) {
            cells.push('<th></th>');
        }

        //日期单元格单元格
        for (var i = 0; i < D.getDaysInMonth() ; i++) {
            cells.push('<td data-date="{0}-{1}-{2}" data-click="setdate">{2}</td>'.format(year, month, i + 1));
        }

        //剩余空白单元格
        var toend = cells.length % 7;
        if (toend != 0) {
            for (var i = 0; i < 7 - toend; i++) {
                cells.push('<th> </th>');
            }
        }

        for (var i = 0; i < cells.length; i++) {
            _html.push((i == 0 ? '<tr>' : i % 7 == 0 ? '</tr><tr>' : '') + cells[i] + (i == cells.length - 1 ? '</tr>' : ''));
        }

        return _html.join('');
    },

    update: function (wrap, addYear, addMonth) {
        //创建日期选择器
        var D = wrap.data('date') || new Date;

        addYear && D.setYear(D.getFullYear() + addYear * 1);
        addMonth && D.setMonth(D.getMonth() + addMonth * 1);
        wrap.data('date', D);

        wrap.html(datepicker._generateHTML(D));
    },

    curPicker: null, //当前活动的日历

    show: function (el) {
        if (!el) return;

        //创建的datepicker 缓存在 data-picker
        var $picker = $(el).data('picker');

        //不存在创建日历
        if (!$picker || $picker.length === 0) {
            $picker = $('<div class="datepicker unselectable"></div>');

            isFixed = false;
            $(el).parents().each(function () {
                isFixed |= $(this).css("position") === "fixed";
                return !isFixed;
            });

            if (isFixed) {
                $picker.css('position', 'fixed');
            }

            var pos = $(el).offset();
            $picker.css({ left: pos.left, top: pos.top + el.offsetHeight });

            $picker.delegate('td,th', 'click', function (e) {
                var cell = $(e.target);
                var action = cell.data('click');
                if (action == "setdate") {
                    $(el).val(cell.data('date'));
                    //validate.check(el);
                    $picker.hide();
                } else if (action == "update") {
                    var param = cell.data('param').split(',');
                    datepicker.update($picker, param[0], param[1]);
                }
            });

            $picker.data('el', el);
            $picker.data('date', new Date);

            datepicker.update($picker, 0, 0);
            document.body.appendChild($picker[0]);
            //$(el).after($picker);

            $(el).data('picker', $picker);
        }

        this.curPicker = $picker;

        $picker.show();
    }

}

$(function () {
    //实现点击非日历区域，隐藏日历
    $(document).mousedown(function (evt) {
        var target = evt.target;

        var picker = datepicker.curPicker;

        if (!picker) return;

        if (picker.has(target).length === 0) {
            picker.hide();
        }

    });

    //日期选择器的显示
    $(document).delegate('input', 'focus', function () {
        var self = $(this);

        //取input设置的data-option
        var option = self.data('data');
        if (!option) {
            var data = self.data('option');
            if (!data) return;

            //转json格式
            option = eval('(' + data + ')');
            self.data('data', option);
        }

        //日期选择器显示
        if (option.type == 'date') {
            datepicker.show(this);
        }
    });

    //失去焦点时，校验
    /*$(document).delegate('input', 'blur', function (evt) {
        validate.check(this);
    });*/

});