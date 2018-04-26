#! /usr/bin/python
from twisted.web import server, resource
from twisted.internet import reactor
import subprocess
import sys
import os
import signal

"""
	Usage: python server.py
	Dependencies: 
		youtube-dl (upgrade to the latest with $ youtube-dl -U)
		omxplayer		
"""

class HelloResource(resource.Resource):
	"""
	mplayer -cookies -cookies-file /tmp/cookie.txt $(youtube-dl -g --cookies /tmp/cookie.txt "http://www.youtube.com/watch?v=kww0WXcH74o")
	"""   
	isLeaf = True # required - don't know what it is
	previous = { # previous video
		'yt_dl': {},
		'player': {}
	}
	base_url = 'http://www.youtube.com/watch?v='
    
	def render_GET(self, request):
		""" 
		copy the play_url method from __init__.py
		"""
		print(request.args)
		# TODO make it more generic by iterating the args?
		# TODO add support for this
		v_param = request.args['v'][0]
		try:
			start_param = request.args['start_at'][0]
			end_param = request.args['end_at'][0]
		except KeyError:
			pass # just play the whole thing
	
		request.setHeader("content-type", "text/plain")

		# find the new video
		yt_dl = subprocess.Popen(['youtube-dl', '-g', self.base_url + v_param], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
		(yt_url, err) = yt_dl.communicate()
		if yt_dl.returncode != 0:
			return('Something\'s wrong with the retrieval of the url ' + err)
			# sys.stderr.write(err)
			#raise RuntimeError('Error getting URL ' + param)
		
		player = subprocess.Popen(
            ['omxplayer','-ohdmi', yt_url.decode('UTF-8').strip()],
            stdout = subprocess.PIPE, stderr = subprocess.PIPE, preexec_fn=os.setsid)
		print(player.poll()) # should be None if it's started

		# now kill the previous one
		while self.previous['player'] and self.previous['player'].poll() == None:
			print('killing previous video')
			os.killpg(self.previous['player'].pid, signal.SIGTERM)
			print(self.previous['player'].poll())

		# update with the current
		self.previous['yt_dl'] = yt_dl
		self.previous['player'] = player
		
		return "I play " + v_param + "\n"
	

reactor.listenTCP(8080, server.Site(HelloResource()))
reactor.run()


