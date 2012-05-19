#!/usr/bin/env python
# coding: utf-8

import threading
import jsfetch
import joysound2
from model import Songs

def search( keyword, search_type, like_type, page ):
	page = int( page ) if int( page ) > 0 else 1
	chunk = jsfetch.search( keyword, search_type, like_type, page )
	#TODO analyse artist list & bangumi list
	song_list, count = joysound2.analyseSongList( chunk )
	song_list = Songs( song_list = song_list ).export()
	return dict(
		count = count,
		page = page,
		list = song_list
	)

def songlist( identity, search_type, page ):
	page = int( page ) if int( page ) > 0 else 1
	chunk = jsfetch.songList( identity, search_type, page )
	list_type = joysound2.LIST_TYPE_NO_ARTIST if search_type == jsfetch.SEARCH_ARTIST else joysound2.LIST_TYPE_NO_SOURCE
	song_list, count = joysound2.analyseSongList( chunk, list_type )
	song_list = Songs( song_list = song_list ).export()
	return dict(
		count = count,
		page = page,
		list = song_list
	)

class FetchThread( threading.Thread ):
	def __init__( self, gid, result_set ):
		threading.Thread.__init__( self )
		self.gid = gid
		self.result_set = result_set

	def run( self ):
		chunk = jsfetch.songDetail( self.gid )
		self.result_set[self.gid] = joysound2.analyseSong( chunk )

def getDetails( gids ):
	songs = Songs( gids = gids )
	result = { gid:{} for gid in songs.remain_gids }
	thread_list = []
	for gid in gids:
		th = FetchThread( gid, result )
		thread_list.append( th )

	for th in thread_list:
		th.start()
		
	for th in thread_list:
		th.join()

	return songs.merge( result ).details


if __name__ == '__main__':
	import json, sys
	#print json.dumps( songlist( 1217, 1, 1 ) )
	k = sys.argv[1]
	l = int( sys.argv[2] )
	p = int( sys.argv[3] )
	if k:
		print json.dumps( search( k, 2, l, p ) )