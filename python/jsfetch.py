#!/usr/bin/env python
# coding: utf-8

from urllib import urlencode
from urllib3 import PoolManager
from hashlib import md5
from os import path as fs

SEARCH_SONG = 2
SEARCH_ARTIST = 1
SEARCH_SOURCE = 3

PAGE_OFFSET = 20

def __fetch( url ):
	#chunk = urllib2.urlopen( url ).read()
	return PoolManager().request( 'GET', url ).data

def __jsfetch( path, params, cache_file = '' ):
	if cache_file and fs.exists( cache_file ):
		with open( cache_file ) as f:
			content = f.read()
	else:
		base_url = r'http://joysound.com/ex/search/%s.htm?' % path
		content = __fetch( base_url + urlencode( params ) )
		#handle konzatsu
		if content.find( 'ただいま混み合っています' ) != -1:
			content = ''
		elif cache_file:
			with open( cache_file, 'w' ) as f:
				f.write( content )
	return content

def __param( keyword = '', like_type = 1, page = 1 ):
	return dict(
		karaokeall = 1,
		searchType = '01',
		searchWordType = 2,
		searchWord = keyword,
		searchLikeType = like_type,
		sortKey = 1,
		offset = ( int( page ) - 1 ) * PAGE_OFFSET
	)

def search( keyword, search_type, like_type, page ):
	if search_type == SEARCH_SONG:
		path = 'songsearchword'
	elif search_type == SEARCH_ARTIST:
		path = 'artistsearchword'
	elif search_type == SEARCH_SOURCE:
		path = 'titlesearchword'
	else:
		return ''

	cache_file = './%s/%s.htm' % ( path, '%s_%s_%s' % ( md5( keyword ).hexdigest(), like_type, page ) )
	return __jsfetch( path, __param( keyword, like_type, page ), cache_file )

def songList( identity, search_type, page ):
	p = __param( page = page )
	if search_type == SEARCH_ARTIST:
		path = 'artist'
		p.update( artistId = identity )
	elif search_type == SEARCH_SOURCE:
		path = 'title'
		p.update( titleCd = identity )
	else:
		return ''
	
	return __jsfetch( path, p )

def songDetail( gid ):
	cache_file = './songs/%s.htm' % gid
	return __jsfetch( 'song', dict( gakkyokuId = gid ), cache_file )