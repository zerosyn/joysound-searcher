#!/usr/bin/env python
# coding: utf-8

from gevent import wsgi
from urlparse import parse_qs
from urllib2 import unquote, quote
import traceback
import json
import x

def application(environ, start_response):
	try:
		d = parse_qs( environ['QUERY_STRING'] )
		mode = int( d.get( 'mode', [0] )[0] )
		callback = d.get( 'callback', [''] )[0]
		if not mode or not callback:
			raise Exception

		result = ''
		#search
		if mode == 1:
			keyword = unquote( quote( unquote( d.get( 'keyword', [''] )[0] ) ) )
			searchtype = int( d.get( 'searchtype', [2] )[0] )
			liketype = int( d.get( 'liketype', [1] )[0] )
			page = int( d.get( 'page', [1] )[0] )
			if keyword:
				result = x.search( keyword, searchtype, liketype, page )
		#songs detail
		elif mode == 2:
			gids = d.get( 'gids', [''] )[0].split( '_' )
			if len( gids ) > 0:
				result = x.getDetails( gids )
		#list song by artist / source
		elif mode == 3:
			searchtype = int( d.get( 'searchtype', [1] )[0] )
			identity = int( d.get( 'artist_id', [0] )[0] )
			page = int( d.get( 'page', [1] )[0] )
			if( identity > 0 ):
				result = x.songlist( identity, searchtype, page )

		status = '200 OK'

	except Exception, e:
		result = traceback.format_exc()
		status = '500 Server Error'

	finally:
		response_headers = [('Content-type', 'application/json')]
		start_response( status, response_headers )
		output = callback + '(' + json.dumps( result ) + ')'
		return [output]

wsgi.WSGIServer(('', 8235), application, spawn=None).serve_forever()