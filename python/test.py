#!/usr/bin/env python
# coding: utf-8

import x
import unittest

x.getDetails( [568145, 621792, 278101] )
'''{621792: {'v2_flag': 2, 'artist': 'FRENCHESKA FARR', 'song_no': '154051', 'artist_id': '232287', 'title': 'I&#39;LL SEE THE SUN'}, 568145: {'v2_flag': 1, 'artist': 'Waves', 'song_no': '109179', 'artist_id': '51149', 'title': 'I&#39;ll go'}, 278101: {'v2_flag': 2, 'artist': 'BANGLES', 'song_no': '23230', 'artist_id': '2833', 'title': 'I&#39;LL SET YOU FREE'}}'''


def benchmark():
	import json, sys
	from timeit import Timer
	from jsfetch import search

	chunk = search( "i'll", 2, 1, 1 )
	t1 = Timer( "analyseSongList( chunk )", "from joysound import analyseSongList; chunk = '''%s'''" % (chunk,) )
	t2 = Timer( "analyseSongList( chunk )", "from joysound2 import analyseSongList; chunk = '''%s'''" % (chunk,) )
	print t1.timeit( 10 ) # 4.2660381794
	print t2.timeit( 10 ) # 0.319856882095