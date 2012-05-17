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
		AjaxCall( qry.hash, qry.toParams(),
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
		}
	}
	function search(e){
		e.preventDefault();
		if( $.trim( $('#keyword').val() ) ){
			HashManager.query( $('nav form').serialize() );
		} else {
			UINav.hideSearchOption();
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
		if( qry && qry.hasNext() ){
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

$("#keyword").on( 'keyup change', UINav.resetCleanBtn );
$("#keyword").on( 'focus', UINav.showSearchOption );
$("nav").on( 'touchend click', stopBubble );
$("body").on( 'touchend click', UINav.hideSearchOption );
$("nav span.clean").on( 'click', UINav.cleanKeyword );
$("#nav_bottom .option_group").on( 'touchend click', 'a.option', UINav.switchOption );
$("#submit").on( 'click', Controller.search );
$("#result").on( 'click', 'li.qry', Controller.foldQry );
$("#result").on( 'click', 'a.remove', Controller.removeQry );
$("#result").on( 'click', 'a.retry', Controller.retryQry );
$("#result").on( 'click', 'li.more a', Controller.loadMore );
$('#tips').on( 'touchend click', UIFooter.randomTip );
$('#tips').on( 'click', '#tip_first', UIFooter.showHelp );
$('#help').on( 'click', UIFooter.hideHelp );
$(window).hashchange( Controller.analyseHash );

$(function(){
	UINav.resetCleanBtn();
	HashManager.refresh();
});
