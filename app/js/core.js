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
	return this.replace(/\+/g,'%20');
}
String.prototype.htmlEntities = function(){
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var HashManager = (function(){
	function isEmpty(){
		return !location.hash || location.hash == '#' || location.hash == '##';
	}
	function current(){
		//由于gecko的地址已经解码，而webkit是原始状态，故先解码（不影响gecko）再编码以统一
		//TODO optimize using browser check
		return encodeURI( decodeURI( location.hash ) );
	}
	function buildQuery( query ){
		return '#mod=qry&' + query.handleSpace();
	}
	function query( query ){
		push( buildQuery( query ) );
	}
	function push( hash ){
		window.location.hash = hash;
	}
	function replace( hash ){
		//不会触发hashchange事件
		window.history.replaceState( {}, '', hash );
	}
	function refresh( hash ){
		if( hash ){
			replace( hash );
		}
		$(window).hashchange();
	}
	var fns = {
		isEmpty: isEmpty,
		current: current,
		buildQuery: buildQuery,
		query: query,
		push: push,
		replace: replace,
		refresh: refresh
	};
	return fns;
}());

//拆分callback，数据处理部分必执行，界面处理部分在hash没变时才执行
function AjaxCall( hash, params, complete_fn, success_fn ){
	var host = 'http://moegoe.co.cc/seek';
	// var host = 'http://127.0.0.1:8080/';
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