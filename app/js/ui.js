var UINav = (function(){
	var nav = $('nav');
	var kwd = $('#keyword');
	var kwdxbtn = nav.find('span.clean');

	function resetCleanBtn(){
		if( kwd.val() ){
			kwdxbtn.removeClass('disable');
		} else {
			kwdxbtn.addClass('disable');
		}
	}
	function showSearchOption(){
		nav.removeClass('nofocus');
	}
	function hideSearchOption(){
		kwd.blur();
		nav.addClass('nofocus');
	}
	function cleanKeyword(){
		kwd.val('');
		kwd.focus();
		resetCleanBtn();
	}
	function switchOption(e){
		if( !$(this).attr('selected') ){
			var option_group = $(e.delegateTarget);
			var name = option_group.attr('data-name');
			var val = $(this).attr('data-value');
			option_group.find('a.selected').removeClass('selected');
			$(this).addClass('selected');
			$('input[name=' + name + ']').val( val );
		}
	}
	return {
		resetCleanBtn: resetCleanBtn,
		showSearchOption: showSearchOption,
		hideSearchOption: hideSearchOption,
		cleanKeyword: cleanKeyword,
		switchOption: switchOption
	};
}());

var UIResult = (function(){
	var dom = $('#result');

	function _changeTitle( title ){
		document.title = title || 'もえゴエ';
	}
	function _resetBackgroundColor(){
		var li_num_odd = ( dom.children( 'li' ).length % 2 != 0 );
		$('body').toggleClassBy( li_num_odd, 'even' );
	}
	function showQryList( list ){
		_changeTitle( '' );
		dom.html( template( 'tpl_list', { list: list } ) );
		_resetBackgroundColor();
	}
	function showQuery( qry ){
		_changeTitle( qry.title_fmt );
		dom.html( template( 'tpl_result', { qry: qry } ) );
		dom.find('.qry').addClass('active');
		_resetBackgroundColor();
	}

	return {
		showQuery: showQuery,
		showQryList: showQryList
	};
}());

var UIFooter = (function(){
	var tip_dom = $('#tips');
	var tip_content = tip_dom.find('.content');
	var current_tip_id = 0;
	var tips = [
		'<em>もえゴエ</em> へようこそ',
		'部分曲目编号需要多Loading一段时间，不妨去喝杯红茶吧' + '( ˊ_>ˋ)'.htmlEntities(),
		'天朝曲库更新不及时，遇到「<em class="red">曲がありません</em>」请怪時臣(´・ω・`)',
		'「<em>もえゴエ</em>」没有加感叹号的原因只是为了在iOS主屏显示更美观' + '>_<'.htmlEntities(),
		'歌手与番組搜索正在开发中，お楽しみに',
		'任何问题、意见请在新浪微博<em>@moegoe</em>'
	];
	if( browser.ios ){
		tips.push( '可以用Safari将 <em>もえゴエ</em> 添加到主屏幕哦~' );
	}

	function randomTip(){
		//no random at first time
		if( tip_content.html() ){
			current_tip_id += Math.floor( Math.random() * ( tips.length - 1 ) ) + 1;
			current_tip_id %= tips.length;
		}
		tip_content.html( tips[current_tip_id] );
	}
	function hideTip(){
		tip_dom.hide();
	}

	return {
		randomTip: randomTip,
		hideTip: hideTip
	};
}());