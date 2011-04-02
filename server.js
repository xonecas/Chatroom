// author: Sean Caetano Martin (xonecas)
// 
// Rob Righter https://github.com/robrighter/node-boilerplate
// made a node boilerplate, but I find that it does too much
// I like making my own routes, and organize them as I see fit
// this applies for server errors and 404's
// So I made this, a more compact boiler, that will serve static
// files off the shelf (just in case you want to get going quick)
// Everything else is for you to decide
//
// I will keep this up to date with current node and connect versions
// any issues please file a issue
//

// add some mime-types
// mime already defines some for us, soon they'll support all
var mime = require('mime');

// define early so that connect sees them
mime.define({
   'application/x-font-woff': ['woff'],
   'image/vnd.microsoft.icon': ['ico'],
   'image/webp': ['webp'],
   'text/cache-manifest': ['manifest'],
   'text/x-component': ['htc'],
   'application/x-chrome-extension': ['crx']
});

// make sure you install Connect (npm install connect)
// find the docs here: http://senchalabs.github.com/connect/
var connect = require('connect'),
   io = require('socket.io'),
   // inspect tool, I use it all the time.
   inspect = require('util').inspect;
   // uncomment this if you plan on concatenate files
   // var fs = require('fs');

// concatenate files, ahead of server start for better performance
// for high concurrency servers this step's callback must init the
// server or the files being requested might not be ready.
// read and merge jquery and js/script.js
/*
fs.readFile(__dirname+'/js/libs/jquery-1.5.js', 'utf8', function (err, jquery) {
   fs.readFile(__dirname+'/js/script.js', 'utf8', function (err, script.js) {
      fs.writeFile(__dirname+'/js/bundle.js', jquery + script, 'utf8', function (err) {
         if (err) throw err;
         // file is written
      });
   });
});
*/

var routes = function (app) {
   // your routes go here
   // you can use app.get, app.post, ...
   // the docs are here: http://senchalabs.github.com/connect/middleware-router.html





   // this must be the last route, its an addition to the static provider
   app.get('*', function (req, res, next) {
      var reqPath = req.url; // connect populates this

      // use this header for html files, or add it as a meta tag
      // to save header bytes serve it only to IE
      // user agent is not always there
      var userAgent = req.headers['user-agent'];
      if (userAgent && userAgent.indexOf('MSIE') && 
         reqPath.match(/\.html$/) || reqPath.match(/\.htm$/))
         res.setHeader('X-UA-Compatible', "IE=Edge,chrome=1");

      // protect .files
      if (reqPath.match(/(^|\/)\./))
         res.end("Not allowed");

      next(); // let the static server do the rest
   });
}

// set you cache maximum age, in milisecconds.
// if you don't use cache break use a smaller value
var oneMonth = 1000 * 60 * 60 * 24 * 30;

// start the server
var server = connect.createServer(
   // good ol'apache like logging
   // you can customize how the log looks: 
   // http://senchalabs.github.com/connect/middleware-logger.html
   connect.logger(),

   // call to trigger routes
   connect.router(routes),

   // set to ./ to find the boilerplate files
   // change if you have an htdocs dir or similar
   // maxAge is set to one month
   connect.static(__dirname+'/htdocs', {maxAge: oneMonth})
);

// bind the server to a port, choose your port:
server.listen(1111); // 80 is the default web port and 443 for TLS

// socket.io 
var socket = io.listen(server); 
socket.on('connection', function(client){ 
   // new client is here! 
   client.on('message', function(data) { 
      data = JSON.parse(data);
      console.log(inspect(data)); 
      
      if (data.joined) {
         data.author = 'system';
         data.color = '#999';
         data.text = data.joined +" has joined";
      }
      else if (data.leaving) {
         data.author = 'system';
         data.text = data.leaving +" has left";
      }

      socket.broadcast(data);
   }) 
   //client.on('disconnect', function(){ … }) 
}); 

// Your server is running :-)
console.log('Node server is running!');

// this is a failsafe, it will catch the error silently and logged it the console
// while this works, you should really try to catch the errors with a try/catch block
// more on this here: http://nodejs.org/docs/v0.4.3/api/process.html#event_uncaughtException_
process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});
