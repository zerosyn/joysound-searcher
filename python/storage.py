#!/usr/bin/env python
# coding: utf-8

import MySQLdb
import json
from time import time

def quoteJoin( arr, quote, seperator = ',' ):
	return seperator.join( [ "%c%s%c" % (quote, s, quote) for s in arr ] )

def timenow():
	return int( time() )

class JSStorage:
	def __init__( self ):
		db = MySQLdb.connect( 'localhost', 'moegoe', 'moegoe', 'joysound', charset = 'utf8', use_unicode = True )
		self.c = db.cursor( MySQLdb.cursors.DictCursor )

	def getDetails( self, gids ):
		self.c.execute( 'SELECT * FROM `js_song` LEFT JOIN `js_artist` USING(`artist_id`) WHERE `gid` IN (%s)' % ','.join( gids ) )
		result = {}
		for song in self.c.fetchall():
			result[str( song['gid'] )] = dict(
				song_no = str( song['song_no'] ),
				title = song['song_name'],
				artist_id = str( song['artist_id'] ),
				artist = song['artist_name'],
				v2_flag = int( song['v2_flag'] )
			)
		return result

	def saveDetails( self, details ):
		now = timenow()
		values_song = []
		values_artist = []
		values_unexpect = []
		for gid in details:
			song = details[gid]
			if song:
				values_song.append( ( gid, song['song_no'], song['title'], song['artist_id'], song['v2_flag'], now ) )
				values_artist.append( ( song['artist_id'], song['artist'] ) )
				if 'sublist' in song:
					values_unexpect.append( ( gid, json.dumps( song['sublist'] ) ) )

		fields_song = quoteJoin( ['gid', 'song_no', 'song_name', 'artist_id', 'v2_flag', 'update_time'], '`' )
		fields_artist = quoteJoin( ['artist_id', 'artist_name'], '`' )
		placeholder_song = ','.join( [ r'%s' ] * 6 )
		placeholder_artist = ','.join( [ r'%s' ] * 2 )
		self.c.executemany( 'REPLACE INTO `js_song` (%s) VALUES (%s)' % ( fields_song, placeholder_song ), values_song )
		self.c.executemany( 'INSERT IGNORE INTO `js_artist` (%s) VALUES (%s)' % ( fields_artist, placeholder_artist ), values_artist )
		if len( values_unexpect ) > 0:
			self.c.executemany( r'REPLACE INTO `unexpected_song` (`song_id`, `data`) VALUES (%s, %s)', values_unexpect )
