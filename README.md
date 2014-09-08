betfair-KDBfirehose
===================

So the point of the project is to build a kdb+ database stack (with a bit of bash) using the torq framework to capture,store and query realtime betting market data from betfair.com through the betfair API-NG. Betting data pretty similar to market data, so I think it's a good use case for torq/kdb+.  Most of the interesting stuff/stuff that neds done to make this work is in the feedhandler and the get market data bash scripts.

System Archicture
=================

My initial idea for how it should look is a standard torq stack, with some extra stuff at the top:

	betfair.com
	    |   
	    |  (pull requests via curl to betfair)
            |
	.sh script
	    |
	    |  (fh executes .sh on a timer to pull data/login info etc.)
	    |
    custom feedhandler
	    |
	    |  (after some pivoting, conversion out of json etc., push to tp)
	    |
	tickerplant
	    |
	    |
	    |
           rdb
	    |
	    |
	    |
	   hdb

.sh script
==========

Glen already wrote "the requestinator", which will use authentication files on homer to pull down a session id.  It doesn't work ght now because I too my hardcoded betfair password out of it, so need to add that back in as a config or something (not commited to public repo...).

Uing this session id and an application key we can request data from betfair.  They have some e public code up which is a very good starting point up at:

	https://github.com/betfair/API-NG-sample-code/tree/master/curl

Again we need to make some changes, remove hardcoded stuff into config files, or command line options.  It looks liekr it to work you also have to remove the port from the address, not sure why...  Probably best also remove the lines that call json reformat, as we can do the json conversion in q. So once weve the session id and ap key, the two important betfair API functions are listMarketCatalogue and listMarketBook, which get meta data about and market and actualy market data repectively.

feedhandler
===========

so if the sh script works the fh can grab jsons of market data, then convert to q dictionary using Arthur's new json API.  Then has to basically do two things:

- convert the dictionary to a table(s) by doing some clever pivoting
- attach the meta data

So I think all the data pulled will come down with things like selection id instead of team names etc., need to join that stuff on.

API-NG
======

To get a eel for the API theres a couple of good links.  First get logged into betafir and get your session id:

	https://api.developer.betfair.com/services/webapps/docs/display/1smk3cen4v3lu3yomq5qye0ni/API-NG+-+Visualiser

then you can get the app key and look at some data using these two visualisers:

	https://developer.betfair.com/visualisers/api-ng-account-operations/
	https://developer.betfair.com/visualisers/api-ng-sports-operations/


