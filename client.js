

var client = new WebTorrent()
var magnetURI = 'magnet:?xt=urn:btih:90a9fd9a8d66b9bacf46d3baf94d11144e2fd302&dn=wixmp-3dbd5cb16bb136182e099f78_iJ22E06S_%5B1%5D.m3u8&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337'

//curl http://www.streambox.fr/playlists/x36xhzz/url_2/193039199_mp4_h264_aac_ld_7.m3u8

var strings = ['#EXTM3U',
    '#EXT-X-VERSION:3',
    '#EXT-X-PLAYLIST-TYPE:VOD',
    '#EXT-X-TARGETDURATION:10',
    '#EXTINF:10.000,',
    'magnet:?xt=urn:btih:90a9fd9a8d66b9bacf46d3baf94d11144e2fd302',
    '#EXTINF:10.000,',
    'magnet:?xt=urn:btih:1ec3227aabe562cf2b244a41b93fa0a1aa423f4d',
    '#EXTINF:10.000,',
    'magnet:?xt=urn:btih:3cbd1622487f202f11aea838b0984a1478054456',
    '#EXTINF:10.000,',
    'magnet:?xt=urn:btih:9cf20cfe4fd1745ea4f72067192681b30b52a8c5',
    '#EXTINF:10.000,',
    'magnet:?xt=urn:btih:0c96911da7c860a9ae2a26ed8a96c10590508407',
    '#EXT-X-ENDLIST'];
var enc = new TextEncoder("utf-8");

function customLoaderP(onSuccess) {
  this.load = function(context, config, callbacks) {
    var url = context.url;
    var responseType = context.responseType;
    var onSuccess = callbacks.onSuccess;
    var onError = callbacks.onError;
    var onTimeOut = callbacks.onTimeout;
    var timeout = config.timeout;
    var maxRetry = config.maxRetry;
    var retryDelay = config.retryDelay;
    onSuccess({currentTarget: {getResponseHeader: function(){return ''}, responseText: strings.join('\n'), response: strings.join('\n')}}, {})
  }
}

function customLoader() {

  /* calling load() will start retrieving content at given URL (HTTP GET)
  params :
  url : URL to load
  responseType : xhr response Type (arraybuffer or default response Type for playlist)
  onSuccess : callback triggered upon successful loading of URL.
              it should return xhr event and load stats object {trequest,tfirst,tload}
  onError :   callback triggered if any I/O error is met while loading fragment
  onTimeOut : callback triggered if loading is still not finished after a certain duration
  timeout : timeout after which onTimeOut callback will be triggered(if loading is still not finished after that delay)
  maxRetry : max nb of load retry
  retryDelay : delay between an I/O error and following connection retry (ms). this to avoid spamming the server.
  */
  this.load = function(context, config, callbacks) {
	  var url = context.url;
	  var responseType = context.responseType;
	  var onSuccess = callbacks.onSuccess;
	  var onError = callbacks.onError;
	  var onTimeOut = callbacks.onTimeout;
	  var timeout = config.timeout;
	  var maxRetry = config.maxRetry;
	  var retryDelay = config.retryDelay;

    this.context = context;
    this.config = config;
    this.callbacks = callbacks;
	  
    this.onSuccess = onSuccess;
    
    var self = this;
    console.log(url);
    this.loader = client;
    this.loader.add(url+'&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337', function (torrent) {
      torrent.on('download', function (bytes) {
        console.log('just downloaded: ' + bytes)
        console.log('total downloaded: ' + torrent.downloaded);
        console.log('download speed: ' + torrent.downloadSpeed)
        console.log('progress: ' + torrent.progress)
      })
  // Got torrent metadata!
  console.log('Client is downloading:', torrent.infoHash)

  torrent.files[0].getBlob(function(err, blob) {
    var fileReader = new FileReader();
    fileReader.onload = function() {
      var loadend = self.loadend.bind(self)
      loadend({responseText: this.result, response: this.result})
    };
    fileReader.readAsArrayBuffer(blob);
  })
})
    this.stats = {trequest: performance.now(), retry: 0};
    this.stats.tfirst = null;
  }

  this.loadend = function(event) {
    console.log(event)
    event.getResponseHeader = function(name) {
      var regexp = new RegExp('^'+name+': (.*)$','im');
      var match = regexp.exec(this.responseHeaders);
      if (match) { return match[1]; }
      return '';
    };
    //console.log(event, event.getResponseHeader('Date'));
    this.stats.tload = performance.now();
    //this.onSuccess({currentTarget: event}, this.stats);
    this.onSuccess({data: event.response}, this.stats, this.context);
  }

  this.loadprogress = function(event) {
    if (this.stats.tfirst === null) {
      this.stats.tfirst = performance.now();
    }
  }

  /* abort any loading in progress */
  this.abort = function() {
    console.log('abort')
    //this.loader.remove(magnetURI);
  }
  /* destroy loading context */
  this.destroy = function() {}
}

if(Hls.isSupported()) {
  var video = document.getElementById('video');
  var hls = new Hls({fLoader: customLoader});
  hls.loadSource(URL.createObjectURL(new Blob([enc.encode(strings.join('\n'))])));
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED,function() {
    video.play();
  });
}
