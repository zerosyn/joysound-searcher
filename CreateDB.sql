-- Create syntax for TABLE 'js_artist'
CREATE TABLE `js_artist` (
  `artist_id` int(10) unsigned NOT NULL,
  `artist_name` varchar(64) NOT NULL,
  PRIMARY KEY (`artist_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'js_song'
CREATE TABLE `js_song` (
  `gid` int(10) unsigned NOT NULL,
  `song_no` int(10) unsigned NOT NULL DEFAULT '0',
  `song_name` varchar(128) NOT NULL,
  `artist_id` int(10) unsigned NOT NULL,
  `v2_flag` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `update_time` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`gid`),
  UNIQUE KEY `song_no` (`song_no`),
  KEY `artist_id` (`artist_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'unexpected_song'
CREATE TABLE `unexpected_song` (
  `song_id` int(10) NOT NULL,
  `data` text NOT NULL,
  PRIMARY KEY (`song_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;