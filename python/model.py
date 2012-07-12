#!/usr/bin/env python
# coding: utf-8

from storage import JSStorage

class Songs:
	def __init__( self, gids = [], song_list = [] ):
		self.db = JSStorage()
		self.gids = []
		self.details = {}
		if song_list:
			for song in song_list:
				gid = str( song['gid'] )
				self.gids.append( gid )
				self.details[gid] = song
		else:
			self.gids = gids
			self.details = { gid:{} for gid in gids }

		#merge exist
		self.remain_gids = self.gids[:]
		if len( self.gids ) > 0:
			exist = self.db.getDetails( self.gids )
			for gid in exist:
				self.details[gid].update( exist[gid] )
				self.remain_gids.remove( gid )
		#TODO push remain_gids to Message Queue

	def merge( self, details ):
		self.db.saveDetails( details )
		for gid in details:
			if details[gid]:
				self.details[gid].update( details[gid] )
				self.remain_gids.remove( gid )
		return self

	def export( self ):
		result = []
		for gid in self.gids:
			if self.details[gid]:
				song = self.details[gid]
				song['gid'] = gid
				result.append( song )
		return result