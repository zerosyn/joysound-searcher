function buildQuery( query ){
	//TODO 参数排序
	return '#mod=qry&' + query.handleSpace();
}

var JSQuery = function( keyword, searchtype, liketype ){
	this.RUNNING = 1;
	this.FETCHED = 2;
	this.ERROR = 3;

	this.keyword = keyword;
	this.searchtype = searchtype;
	this.liketype = liketype;
	this.status = this.RUNNING;
	this.count = 0;
	this.page = 0;
	this.list = [];

	this.retry = 0;

	this.hash = buildQuery( $.param({ keyword: this.keyword, liketype: this.liketype, searchtype: this.searchtype }) );
};
JSQuery.prototype = {
	toParams: function(){
		//param for next page
		return $.param({ mode: 1, keyword: this.keyword, liketype: this.liketype, searchtype: this.searchtype, page: this.page + 1 }).handleSpace();
	},
	additionalParams: function(){
		//retry threshold
		if( this.retry > 3 ){
			return '';
		} else {
			this.retry += 1;
		}
		var i, gids = [];
		for( i in this.list ){
			if( !this.list[i].song_no ){
				gids.push( this.list[i].gid );
			}
		}
		return ( gids.length > 0 ) ? $.param({ mode: 2, gids: gids.join('_') }) : '';
	},
	_updated: function(){
		this.lastupdate = new Date().getTime();
	},
	setRunning: function(){
		this.status = this.RUNNING;
		this._updated();
	},
	appendResult: function( result ){
		this.status = this.FETCHED;
		if( result.count === undefined ){
			if( this.page == 0 ){
				this.status = this.ERROR;
			}
		} else {
			this.count = result.count;
			//Append next page only
			if( this.page == result.page - 1 ){
				this.page = result.page;
				$.merge( this.list, result.list );
				//reset detail retry count
				this.retry = 0
			}
		}
		this._updated();
	},
	mergeDetail: function( details ){
		this._updated();
		var i, gid;
		for( i in this.list ){
			gid = this.list[i].gid;
			if( details[gid] !== undefined ){
				//update song details
				$.extend( this.list[i], details[gid] );
			}
		}
	},
	hasNext: function(){
		if( this.status === this.FETCHED && this.count > 0 ){
			return this.page < Math.ceil( this.count / 20 );
		}
		return false;
	},
	getKeyword: function(){
		var kwd = this.keyword;
		switch( this.liketype ){
			case '1': kwd = kwd + ' *'; break;
			case '2': kwd = '* ' + kwd + ' *'; break;
		}
		return kwd;
	},
	getTitle: function(){
		return '【' + this.getKeyword() + '】- Joysound Search';
	}
};

var JSHistory = (function(){
	var history = {};

	function get( hash ){
		return history[hash] || false;
	}
	function set( hash, qry ){
		history[hash] = qry;
	}
	function del( hash ){
		if( history[hash] ){
			delete history[hash];
			return true;
		}
		return false;
	}
	function getAll(){
		//转换成按时间排序的纯数组
		var arr = [];
		var hash;
		for( hash in history ){
			arr.push( history[hash] );
		}
		arr.sort(function(a, b){
			return b.lastupdate - a.lastupdate;
		});
		return arr;
	}
	return {
		get: get,
		set: set,
		del: del,
		getAll: getAll
	};
}());