/*
var fav_list = {};	
$(function(){
	var fav = $.cookie('favorite');
	if( fav ){
		fav_list = $.parseJSON( fav );
	}
});
$("#result span.no").click(function(){
	var no = $(this).text();
	var li = $('#song_' + no);
	if( fav_list[no] ){
		delete fav_list[no];
		li.removeClass('fav');
	} else {
		fav_list[no] = 1;
		li.addClass('fav');
	}
	$.cookie('favorite', JSON.stringify( fav_list ), { expires: 365 });
});
*/
function stopBubble(e){
	e.stopPropagation();
}

var Controller = (function(){
	function _findLi( dom ){
		return dom.parentsUntil('li').parent();
	}
	function _runQuery( qry ){
		qry.setRunning();
		UIResult.showQuery( qry );
		AjaxCall( qry.hash, qry.params_fmt,
			function( data ){
				qry.appendResult( data );
				_loadDetail( qry );
			},
			function(){
				UIResult.showQuery( qry );
			}
		);
	}
	function _loadDetail( qry ){
		var params = qry.additionalParams();
		if( params ){
			AjaxCall( qry.hash, params,
				function( data ){
					qry.mergeDetail( data );
					_loadDetail( qry );
				},
				function(){
					UIResult.showQuery( qry );
				}
			);
		} else {
			UIResult.showQuery( qry );
		}
	}
	function search(e){
		e.preventDefault();
		UINav.hideSearchOption();
		var kwd = $('#keyword');
		var value = $.trim( kwd.val() );
		kwd.val( value );
		if( value ){
			HashManager.push( buildQuery( $('nav form').serialize() ) );
		}
		return false;
	}
	function foldQry(){
		var hash = $(this).attr('id');
		if( hash == HashManager.current() ){
			HashManager.push( '' );
		} else {
			HashManager.push( hash );
		}
	}
	function removeQry(e){
		e.preventDefault();
		stopBubble(e);
		var hash = _findLi( $(this) ).attr('id');
		if( JSHistory.del( hash ) ){
			if( HashManager.current() != '' ){
				//return to top
				HashManager.push( '' );
			} else {
				HashManager.refresh();
			}
		}
	}
	function retryQry(e){
		e.preventDefault();
		stopBubble(e);
		var hash = _findLi( $(this) ).attr('id');
		var qry = JSHistory.get( hash );
		if( qry ){
			_runQuery( qry );
		}
	}
	function loadMore(e){
		e.preventDefault();
		var hash = HashManager.current();
		var qry = JSHistory.get( hash );
		if( qry && qry.more.enabled ){
			_runQuery( qry );
		}
	}
	function analyseHash(){
		if( HashManager.isEmpty() ){
			var list = JSHistory.getAll();
			UIResult.showQryList( list );
			return;
		}
		var params = parseQuery( HashManager.current().substr(1) );
		if( !params.mod ){
			HashManager.refresh( '' );
			return;
		}
		switch( params.mod ){
			case 'qry':
				var qry = new JSQuery( params.keyword, params.searchtype, params.liketype );
				var exist = JSHistory.get( qry.hash );
				HashManager.replace( qry.hash );
				UINav.hideSearchOption();
				if( exist ){
					UIResult.showQuery( exist );
				} else {
					JSHistory.set( qry.hash, qry );
					_runQuery( qry );
				}
				break;
		}
	}
	
	return {
		search: search,
		foldQry: foldQry,
		removeQry: removeQry,
		retryQry: retryQry,
		loadMore: loadMore,
		analyseHash: analyseHash
	};
}());

$(function(){
	var tap_event = browser.mobile ? 'tap' : 'click';
	if( browser.fuckie ){
		$('body').html("<div id='fuckie'>古董浏览器是无法正常访问本站的哟~</div>");
		return;
	}
	$("#keyword").on( 'keyup change', UINav.resetCleanBtn );
	$("#keyword").on( 'focus', UINav.showSearchOption );
	$("nav").on( tap_event, stopBubble );
	$("html").on( tap_event, UINav.hideSearchOption );
	$("nav span.clean").on( tap_event, UINav.cleanKeyword );
	$("#nav_bottom .option_group").on( tap_event, 'a.option', UINav.switchOption );
	$("form").on( 'submit', Controller.search );
	$("#result").on( tap_event, 'li.qry', Controller.foldQry );
	$("#result").on( tap_event, 'a.fold', Controller.foldQry );
	$("#result").on( tap_event, 'a.remove', Controller.removeQry );
	$("#result").on( tap_event, 'a.retry', Controller.retryQry );
	$("#result").on( tap_event, 'a.more', Controller.loadMore );
	$("#result").on( 'doubleTap swipeDown', function(){ HashManager.push(''); } );
	$(window).hashchange( Controller.analyseHash );

	UINav.resetCleanBtn();
	HashManager.refresh();
	//tips
	UIFooter.randomTip();
	var tip_trigger = setInterval( UIFooter.randomTip, 30000 );
	// var stop_trigger = function(e){ UIFooter.hideTip(); clearInterval( tip_trigger ); stopBubble(e); };
	// $("#tips .close").on( tap_event, stop_trigger );
	$("#tips").on( tap_event, UIFooter.randomTip );
});
