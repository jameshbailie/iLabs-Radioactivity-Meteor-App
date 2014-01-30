chatStream = new Meteor.Stream('chat');

chatStream.on('message', function(username, message) {
  //on receiving a new message, update the chat messages 
  //(HTML node is dependent on the Session variable so auto updates)
  Session.set('chatMessage'+Session.get('numberChatMessages').toString(), username+": "+message);
  Session.set('numberChatMessages', Session.get('numberChatMessages')+1);
});

chatStream.on('newUser', function() {
  //on receiving a 'newUser' alert
  Session.set('chatMessage'+Session.get('numberChatMessages').toString(), "A new user has entered the experiment design interface");
  Session.set('numberChatMessages', Session.get('numberChatMessages')+1);
})

Template.chatWindow.messages = function () {
  //Create list to be exported to Handlebars
  var chatMessages = []
  //Grab messages stored in the Session variables
  for (var i = 0; i < Session.get('numberChatMessages'); i ++) {
    chatMessages.push({message: Session.get('chatMessage'+i.toString())});
  };
  //$('#recordOfMessages').scrollTop($('#recordOfMessages')[0].scrollHeight);
  return chatMessages;
}

Template.chatWindow.events({
  //dictionary of event triggers and their function for the chatWindow template
  'click #sendMessage': function () {
    //get username and message:
    var u = document.getElementById('name').value;
    var m = document.getElementById('message').value;
    if (m != "" & u != "") {
      if (u.length > 32) {
        Session.set('chatMessage'+Session.get('numberChatMessages').toString(), 'Username too long.')
        Session.set('numberChatMessages', Session.get('numberChatMessages')+1);
        return
      }
      if (m.length > 256) {
        Session.set('chatMessage'+Session.get('numberChatMessages').toString(), 'Message too long.')
        Session.set('numberChatMessages', Session.get('numberChatMessages')+1);
        return
      }
      var text = u+': '+m;
      //reset the message text field:
      document.getElementById('message').value = "";
      //set the session variable (and auto re-render the HTML)
      Session.set('chatMessage'+Session.get('numberChatMessages').toString(), text);
      Session.set('numberChatMessages', Session.get('numberChatMessages')+1);
      //update the other clients through Streams
      chatStream.emit('message', u, m);
    };
  }
});

Template.chatWindow.rendered = function () {
	//Run every time the chat window template is rendered
	//Scrolls to the bottom of the chat window
  $('#recordOfMessages').scrollTop($('#recordOfMessages')[0].scrollHeight);
};

Meteor.startup(function () {
  //initialise chatMessages session variable
  Session.set('numberChatMessages', 0);
  chatStream.emit('newUser');
});