/* Author: @xonecas

*/

function send (ev) {
   ev.preventDefault();
   var message = { text: $('#message').val(), author: window.nick, "color": window.color };
   socket.send(JSON.stringify(message));
   $('#message').val("");
}

function getColor () {
   var counter = 4, values = [], hex = '0123456789ABCDEF';
   while (--counter !== 0) {
      values.push(hex.charAt(Math.floor(Math.random() * 16)));
   }
   return "#"+values.join("");
}

var socket = new io.Socket('localhost'); 
socket.connect();
//socket.on('connect', function() {});
socket.on('message', function(message) {
   var style = (message.author === 'Raisa')? 
      'class="raisa"': (message.author === 'system')?
         'style="color:#999;"':
         'style="color:'+message.color+';"',
      text = message.text.replace(
         /(ftp|http|https|file):\/\/[\S]+(\b|$)/gim, 
         '<a href="$&" target="_new">$&</a>');

   $('#chat li:first-child').before(
      '<li><span '+style+'>'+message.author+"</span>: "+text+'</li>');
});
socket.on('disconnect', function(){ 
   socket.send(JSON.stringify({"leaving": window.nick}));
});

$(document).ready(function () {
   $('#go').click(function (ev) {
      ev.preventDefault();

      window.nick = $('#nick').val() || "guest"+new Date().getTime();
      window.color = getColor();
      socket.send(JSON.stringify({"joined": nick}));

      $('#user').fadeOut('fast').remove();
      $('#box').slideDown('fast');
      $('#chat').show();
   });

   $('#send').click(send);
   $('#message').keydown(function (ev) {
      if (ev.which === 13) send(ev);
   });

});























