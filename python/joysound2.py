#!/usr/bin/env python
# coding: utf-8

import re
from pyquery import PyQuery as pq

V2_UNKNOWN = 0
V2_NOTEXIST = 1
V2_EXIST = 2

LIST_TYPE_FULL = 1			#普通搜索列表页
LIST_TYPE_NO_ARTIST = 2		#歌手列表页（没有歌手列）
LIST_TYPE_NO_SOURCE = 3		#番组列表页（没有番组列）


def analyseSong( chunk ):
	start = chunk.find( 'musicName"' )
	if start == -1: return False

	result = {}
	p = re.compile( r'ranking\.htm.*\?selSongNo=(\d+)">(.+)<\/a>[^!]+対応機種([^!]+)<!--' )
	matches = p.finditer( chunk[start:] )
	if matches:
		sub_list = []
		for m in matches:
			v2_flag = V2_EXIST if m.group(3).find( 'HyperJoyV2' ) != -1 else V2_NOTEXIST
			subsong = {
				'song_no': m.group(1),
				'title': m.group(2),
				'v2_flag': v2_flag,
			}
			sub_list.append( subsong )
			if v2_flag:
				result.update( subsong )
		if 'v2_flag' not in result:
			result.update( sub_list[0] )
		#if len( sub_list ) > 1:
			#TODO

	start2 = chunk.find( 'artistId=' )
	end2 = chunk.find( '/a', start2 ) + 3
	p = re.compile( r'artistId=(\d+)">(.+)<\/a>' )
	m = p.search( chunk[start2:end2] )
	if m:
		result['artist_id'] = m.group(1)
		result['artist'] = m.group(2)

	return result

#analyse joysound search result table cell to NUMBER & TEXT
def analyseTd( dom, regex ):
	a = dom.find('a')
	if not a: return [0, '']
	m = re.search( regex, a.attr.href )
	if m:
		return [m.group(1), a.text()]
	else:
		return [0, '']

def analyseSongList( chunk, list_type = LIST_TYPE_FULL ):
	start = chunk.find( 'showsMusicTable' )
	if start == -1: return [False, 0]

	#TODO list_type为歌手页时要从标题里取得artist和artist_id
	song_list = []
	html = pq( chunk )
	table = html('#showsMusicTable')
	#count span
	count_dom = table.prevAll().find('span.hit')
	count = count_dom.text().strip() if count_dom else 0

	def analyseTr( index, tr ):
		#ignore head row & icon row
		td_list = pq( tr ).find('td')
		if not td_list: return
		if td_list.eq(0).find('.btmIcon'): return

		#title td
		gid, title = analyseTd( td_list.eq(1), r'gakkyokuId=(\d+)' )
		if not gid: return

		song = dict( gid=gid, title=title )

		#singer td
		if list_type != LIST_TYPE_NO_ARTIST:
			td_index_singer = 2
			artist_id, artist = analyseTd( td_list.eq( td_index_singer ), r'artistId=(\d+)' )
			song.update( artist_id=artist_id, artist=artist )

		#source td
		if list_type != LIST_TYPE_NO_SOURCE:
			td_index_source = 3
			source_id, source = analyseTd( td_list.eq( td_index_source ), r'titleCd=(\d+)' )
			song.update( source_id=source, source=source )

		#kasi td
		td_index_kasi = 4 if list_type == LIST_TYPE_FULL else 3;
		song_no, unused = analyseTd( td_list.eq( td_index_kasi ), r'_selSongNo_(\d+)_songwords' )
		song.update( song_no=song_no, v2_flag=V2_UNKNOWN )
		
		song_list.append( song )

	#result table
	table.find('tr').each( analyseTr )

	return [song_list, count]