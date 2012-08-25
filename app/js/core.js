var browser = (function(){
	var ua = navigator.userAgent.toLowerCase();
	var feature = {
		fuckie: (ua.indexOf('msie') != -1) ? ua.match(/msie (\d+)(\.\d+)?/i)[1] < 9 : false,
		firefox: (ua.indexOf('firefox') != -1),
		ios: (ua.indexOf('iphone') != -1 || ua.indexOf('ipad') != -1 || ua.indexOf('ipod') != -1),
		android: (ua.indexOf('android') != -1),
		mobile: 'ontouchstart' in document.documentElement,
		historyapi: 'replaceState' in window.history
	}
	feature.supportfixed = feature.ios ? ua.match(/os (\d)_/i)[1] > 4 : true;
	return feature;
}());

function parseQuery( query ){
	var params = query.split('&');
	var p = [], key = '', value = '';
	var result = {};
	for( var i in params ){
		p = params[i].split('=');
		key = decodeURIComponent( p[0] );
		value = p.length > 1 ? decodeURIComponent( p[1] ) : '';
		result[key] = value;
	}
	return result;
}

//把加号改成空格，以正确处理keyword
String.prototype.handleSpace = function(){
	return this.replace(/\+/g, '%20');
}
//处理地址栏编码中遗漏的逗号
String.prototype.encodeURIPlus = function(){
	return encodeURI( this ).replace(/,/g, '%2C')
}
String.prototype.htmlEntities = function(){
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
String.prototype.toNbsp = function(){
	return this.replace(/ /g, '&nbsp;')
}

$.prototype.toggleClassBy = function( condition, cls ){
	if( condition ){
		this.addClass( cls );
	} else {
		this.removeClass( cls );
	}
}

var HashManager = (function(){
	function isEmpty(){
		return !window.location.hash || window.location.hash == '#';
	}
	function current(){
		//由于firefox的地址已经解码，而webkit是原始状态，故firefox要重新编码以统一
		return browser.firefox ? window.location.hash.encodeURIPlus() : window.location.hash;
	}
	function push( hash ){
		window.location.hash = hash;
	}
	//不触发hashchange事件的地址替换
	function replace( hash ){
		//放弃ie9和android3、4
		if( browser.historyapi ){
			window.history.replaceState( {}, '', hash );
		}
	}
	function refresh( hash ){
		if( hash !== undefined && hash != current() ){
			window.location.hash = hash;
		} else {
			$(window).hashchange();
		}
	}
	var fns = {
		isEmpty: isEmpty,
		current: current,
		push: push,
		replace: replace,
		refresh: refresh
	};
	return fns;
}());

//拆分callback，数据处理部分必执行，界面处理部分在hash没变时才执行
function AjaxCall( hash, params, complete_fn, success_fn ){
	var host = 'http://moegoe.co.cc/seek';
	if( typeof params !== 'string' ){
		params = $.param( params );
	}
	$.ajax({
		url : host,
		dataType : "jsonp",
		data : params,
		timeout : 10000,
		success : function( data ){
			complete_fn( data );
			if( HashManager.current() == hash ){
				success_fn();
			}
		},
		error : function( xhr ){
			complete_fn( {} );
			if( HashManager.current() == hash ){
				success_fn();
			}
		}
	});
}