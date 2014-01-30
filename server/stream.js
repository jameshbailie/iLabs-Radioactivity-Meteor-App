//initialise the streams:
designStream = new Meteor.Stream('design');
chatStream = new Meteor.Stream('chat');

chatStream.addFilter(function(eventName, args) {
  //restrict chat lengths to 256
  var a = args;
  for (var i=0; i<a.length; i++) {
    if (a[i].length > 256) {
      a[i] = a[i].substring(0,255);
    };
  };
  if (a.length > 5) {
    return a.slice(0,5);
  }
  return a;
});

//enable all read/write permissions for all clients for all streams
chatStream.permissions.write(function(eventName, username, message) {
  return true;
});

chatStream.permissions.read(function () {
  return true;
});

designStream.permissions.read(function () {
  return true;
});

designStream.permissions.write(function () {
  return true;
});