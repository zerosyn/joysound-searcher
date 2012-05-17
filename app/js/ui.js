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

// var jslink_song = 'http://joysound.com/ex/search/song.htm?gakkyokuId=';
// var jslink_artist = 'http://joysound.com/ex/search/artist.htm?artistId=';
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
					'<p class="major"><span>【<em>' + qry.getKeyword() + '</em>】</span></p>' +
					'<p class="minor"><span><em>' + text + '</em></span></p>' +
					'<p class="right"><a class="remove" href="##">&nbsp;×&nbsp;</a></p>' +
				'</li>';
	}
	function _renderSong( row ){
		var cls = '';
		var song_no = row.song_no ? row.song_no : '...';
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
		return '<li class="more"><p><span><a href="##">Load more</a></span></p></li>';
	}
	function _renderLoadingMore(){
		return '<li class="more"><p><span><em>Loading more ...</em></span></p></li>';
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
	function showQryList( list ){
		var html = '';
		var i;
		for( i in list ){
			html += _renderQuery( list[i] );
		}
		_changeTitle( '' );
		dom.html( html );
		//TODO abstract
		UIFooter.randomTip();
	}
	function showQuery( qry ){
		_changeTitle( qry.getTitle() );
		dom.html( _renderQuery( qry, true ) + _renderResult( qry ) );
		UIFooter.hideTip();
	}

	return {
		showQuery: showQuery,
		showQryList: showQryList
	};
}());

var UIFooter = (function(){
	var help_dom = $('#help');
	var tip_dom = $('#tips');
	var tips = [
		'<a id="tip_first">初次使用请戳我</a>',
		'可以用Safari将<em>もえゴエ</em>添加到主屏幕哦^^',
		'部分曲目编号需要多Loading一段时间，不妨去喝杯红茶吧',
		'天朝曲目更新不及时，遇到 <em>曲がありません</em> 请怪時臣XD',
		'<em>もえゴエ</em>没有加感叹号的原因是为了在iOS主屏更加美观' + '>_<'.htmlEntities(),
		'歌手与番組搜索正在开发中，お楽しみに'
	];
	var current_tip_id = 0;

	function randomTip(){
		//no random at first time
		if( tip_dom.html() ){
			current_tip_id += Math.floor( Math.random() * ( tips.length - 1 ) ) + 1;
			current_tip_id %= tips.length;
		}
		tip_dom.html( tips[current_tip_id] );
		tip_dom.show();
	}
	function hideTip(){
		tip_dom.hide();
	}
	function showHelp(){
		help_dom.show();
	}
	function hideHelp(){
		help_dom.hide();
	}

	return {
		randomTip: randomTip,
		hideTip: hideTip,
		showHelp: showHelp,
		hideHelp: hideHelp
	};
}());