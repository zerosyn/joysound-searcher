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

	function _renderQuery( qry, active ){
		var cls = '', text = '';
		switch( qry.status ){
			case qry.RUNNING: cls = 'running'; break;
			case qry.ERROR: cls = 'error'; break;
		}
		if( active ){
			cls += ' active';
		}
		if( qry.count ) {
			text = String( qry.count ) + ' results';
		} else {
			switch( qry.status ){
				case qry.FETCHED: text = 'No result'; break;
				case qry.RUNNING: text = 'Running'; break;
				case qry.ERROR: text = '<a class="retry" href="##">Retry</a>'; break;
			}
		}
		return '<li class="qry ' + cls + '" id="' + qry.hash + '">' + 
					'<p class="major"><span>【<em>' + qry.getKeyword().toNbsp() + '</em>】</span></p>' +
					'<p class="minor"><span><em>' + text + '</em></span></p>' +
					'<p class="right"><a class="remove" href="##">&nbsp;×&nbsp;</a></p>' +
				'</li>';
	}
	function _renderSong( row ){
		var cls = '';
		var song_no = row.song_no || '...';
		if( !song_no ){ cls = 'loading'; }
		else if( row.v2_flag == 2 ){ cls = 'exist'; }
		else if( row.v2_flag == 1 ){ cls = 'notexist'; }
		return '<li>' +
					'<p class="major"><span>' + row.title + '</span></p>' +
					'<p class="minor"><span>' + row.artist + '</span></p>' +
					'<p class="right ' + cls + '">' + song_no + '</p>' +
				'</li>';
	}
	function _renderMore(){
		return '<li class="more"><p><span><a class="more" href="##">Load more</a></span></p>' + 
					'<p class="right"><a class="fold" href="##">&nbsp;×&nbsp;</a></p>' +
				'</li>';
	}
	function _renderLoadingMore(){
		return '<li class="more"><p><span><em>Loading more ...</em></span></p>' +
					'<p class="right"><a class="fold" href="##">&nbsp;×&nbsp;</a></p>' +
				'</li>';
	}
	function _renderResult( qry ){
		var html = '';
		var i;
		if( qry.list ){
			for( i in qry.list ){
				html += _renderSong( qry.list[i] );
			}
			if( qry.status === qry.RUNNING && qry.page > 0 ){
				html += _renderLoadingMore();
			} else if( qry.hasNext() ){
				html += _renderMore();
			}
		}
		return html;
	}
	function _changeTitle( title ){
		document.title = title || 'もえゴエ';
	}
	function _resetBackgroundColor(){
		var li_num_odd = ( dom.children( 'li' ).length % 2 != 0 );
		$('body').toggleClassBy( li_num_odd, 'even' );
	}
	function showQryList( list ){
		var html = '';
		var i;
		for( i in list ){
			html += _renderQuery( list[i] );
		}
		_changeTitle( '' );
		dom.html( html );
		_resetBackgroundColor();
	}
	function showQuery( qry ){
		_changeTitle( qry.getTitle() );
		dom.html( _renderQuery( qry, true ) + _renderResult( qry ) );
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