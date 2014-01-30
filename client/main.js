MAX_NUMBER_TIMES = 10;
MIN_NUMBER_TIMES = 0;
MAX_TIME = 100;
MIN_TIME = 0;

MAX_NUMBER_DISTANCES = 10;
MIN_NUMBER_DISTANCES = 0;
MAX_DISTANCE = 100;
MIN_DISTANCE = 0;

PROGRESS_BAR_WIDTH = 300;

designCollection = new Meteor.Collection('design');

Deps.autorun(function () {
  //re-runs every time the experimentType session variable is changed
  //updates the experiment type template to the currently chosen experiment type
  console.log('inside autorun function');
  var type = Session.get('experimentType');
  if (document.getElementById('experimentType')) {
    //manually update the HTML drop down option menu
    //(NOTE: this should auto update as the value of the menu is dependent on the experiment Type session variable.
    //  But it doesn't!)
    document.getElementById('experimentType').value = type;
  };
  if (type == "none") {
    $('#typeDiv').html('Please choose an experiment above.');
  } else {
    //Render Template inside the typeDiv node
    $('#typeDiv').html(Meteor.render(Template[type]));
  };
});

Template.experiment.events({
  //dictionary of event triggers and their functions for the template experiment.
  'click #experimentTypeSubmit': function (event) {
    //Set the experiment type
    var type = document.getElementById('experimentType').value;
    console.log("inside the click experimentType event with type: "+type+" and type of type is "+typeof type);
    if (type != "none" & type != "timeExperiment" & type != "distanceExperiment") {
      throw "Value from the select node is not equal to one of the three options";
    };
    
    if (Session.get('experimentType') != type) {
      //Set reactive Session variable (will call autorun function to rerender template):
      Session.set('experimentType', type);
      //update server db:
      Meteor.call("updateExperimentType", type);
      //update other clients:
      designStream.emit('updateExperimentType', type);
    };
  }
});

Template.experiment.type = function () {
  return Session.get('experimentType');
};

Template.experiment.rendered = function () {
  //pass
};

Template.timeExperiment.events({
  'click #upTimes': function (event) {
    //increment the number of trials in the Time experiment
    var val = $('#incdecTimes').val();
    if (val == "") {
      //if field is empty, set the value to 1
      $('#incdecTimes').val("1");
    } else {
      var inc = parseInt(val)+1;
      if (inc<=MAX_NUMBER_TIMES) {
        $('#incdecTimes').val(inc);
      };
    };
  },
  'click #downTimes': function (event) {
    //decrement the number of trials in the Time experiment
    var inc = parseInt($('#incdecTimes').val())-1;
    if (inc>=MIN_NUMBER_TIMES) {
      $('#incdecTimes').val(inc);
    };
  },
  'click #submitTimes': function (event) {
    //submit the number of trials in the Time experiment
    var times = document.getElementById('incdecTimes').value
    console.log('inside submit number of times, with number = '+times);
    //check times is the correct format:
    if (!isNaN(times) & times >= MIN_NUMBER_TIMES & times <=MAX_NUMBER_TIMES) {
      //update other clients through Streams:
      designStream.emit('numberOfTimes', times);
      //update the Session variable (and auto re-render the HTML)
      Session.set('times', times);
      //update ther server DB:
      Meteor.call("updateTimes", times);

      //update session variables:
      for (var i = 1; i<= Session.get('times'); i ++) {
        //get values from server DB:
        Meteor.call("getTimeValue", i.toString(), function (err, result) {
          console.log('setting time value for '+result[1]+' to value '+result[0]);
          Session.set('timeValue'+result[1], result[0]);
        });
      };
    };
  }
}); 

Template.distanceExperiment.events({
  'click #upDistances': function (event) {
    //increment the number of trials in the Distance experiment
    var val = $('#incdecDistances').val();
    if (val == "") {
      //if field is empty, increment to 1
      $('#incdecDistances').val("1");
    } else {
      var inc = parseInt(val)+1;
      if (inc<=MAX_NUMBER_DISTANCES) {
        $('#incdecDistances').val(inc);
      };
    };
  },
  'click #downDistances': function (event) {
    //decrement the number of trials in the Distance experiment
    var inc = parseInt($('#incdecDistances').val())-1;
    if (inc>=MIN_NUMBER_DISTANCES) {
      $('#incdecDistances').val(inc);
    };
  },
  'click #submitDistances': function (event) {
    //submit the number of trials in the Distance experiment
    var distances = document.getElementById('incdecDistances').value
    //check distances is the current format
    if (!isNaN(distances) & distances >= MIN_NUMBER_DISTANCES & distances <=MAX_NUMBER_DISTANCES) {
      console.log('sending distances: '+distances);
      //update other clients through Streams
      designStream.emit('numberOfDistances', distances);
      //update the Session variable (and auto re-render the HTML)
      Session.set('distances', distances);
      //update the server DB
      Meteor.call("updateDistances", distances);

      //update session variables:
      for (var i = 1; i<= Session.get('distances'); i ++) {
        Meteor.call("getDistanceValue", i.toString(), function (err, result) {
          console.log('setting distance value for '+result[1]+' to value '+result[0]);
          Session.set('distanceValue'+result[1], result[0]);
        });
      };
    };
  }
}); 

Template.timeProgressBar.events({
  'click .timeButton': function (event) {
    //update the time value for one of the trials using the text field and submit button
    console.log("id = "+this._id+" and time value = "+this.time);
    //ASSUMING MIN TIME IS 0
    var v = Math.round(document.getElementById("inputTime"+this._id).value);
    //check the correct format
    if (!isNaN(v) & v != "") {
      if (v < MIN_TIME) {
        //update the value to minimum 
        Template.timeProgressBar.updateATimeValue(this._id, MIN_TIME.toString());
      } else if (v > MAX_TIME) {
        //update the value to maximum
        Template.timeProgressBar.updateATimeValue(this._id, MAX_TIME.toString());
      } else {
        Template.timeProgressBar.updateATimeValue(this._id, v);
      };
      //reset the text field:
      document.getElementById("inputTime"+this._id).value = "";
    };
  },
  'click .progressCanvas' : function(event) {
    //update the time value for one of the trails using the canvas node
    //Need to normalise the value by dividing by the progress bar width and multiplying by the maximum time
    //ASSUMING MIN TIME IS 0
    //The -20 accounts for the positioning of the content div
    Template.timeProgressBar.updateATimeValue(this._id, (Math.round((event.x-20)/PROGRESS_BAR_WIDTH*MAX_TIME)).toString());
  }
});

Template.distanceProgressBar.events({
  'click .distanceButton': function (event) {
    //update the distance value of one of the trials using the text field and submit button
    console.log("id = "+this._id+" and distance value = "+this.distance);
    //ASSUMING MIN TIME IS 0
    var v = Math.round(document.getElementById("inputDistance"+this._id).value);
    if (!isNaN(v) & v != "") {
      if (v < MIN_DISTANCE) {
        //update the value to minimum
        Template.distanceProgressBar.updateADistanceValue(this._id, MIN_DISTANCE.toString());
      } else if (v > MAX_DISTANCE) {
        //update the value to maximum
        Template.distanceProgressBar.updateADistanceValue(this._id, MAX_DISTANCE.toString());
      } else {
        Template.distanceProgressBar.updateADistanceValue(this._id, v);
      };
      //reset the text field:
      document.getElementById("inputDistance"+this._id).value = "";
    };
  },
  'click .progressCanvas' : function(event) {
    //update the distance value of one of the trials using the canvas node
    //Need to normalise the value by dividing by the progress bar width and multiplying by the maximum time
    //ASSUMING MIN TIME IS 0
    //The -20 accounts for the positioning of the content div
    Template.distanceProgressBar.updateADistanceValue(this._id, (Math.round((event.x-20)/PROGRESS_BAR_WIDTH*MAX_DISTANCE)).toString());
  }
});

Template.timeProgressBar.updateATimeValue = function(id, timeValue) {
  console.log("type of id: "+typeof id);
  console.log("type of timeValue: "+typeof timeValue);
  //update the Session variable
  Session.set('timeValue'+id, timeValue);
  //update the server DB
  Meteor.call("updateTimeValue", id, timeValue);
  //update the other clients through Streams
  designStream.emit('updateTimeValue', id+"-"+timeValue);    
};

Template.distanceProgressBar.updateADistanceValue = function(id, distanceValue) {
  console.log("type of id: "+typeof id);
  console.log("type of distanceValue: "+typeof distanceValue);
  //update the Session variable
  Session.set('distanceValue'+id, distanceValue);
  //update ther server DB
  Meteor.call("updateDistanceValue", id, distanceValue);
  //update the other clients through Streams
  designStream.emit('updateDistanceValue', id+"-"+distanceValue);    
};

Template.displayTimes.chooseTimes = function () {
  //Create list to be exported to Handlebars 
  var listOfTimes = [];

  //Grab list from Session variables
  for (var i = 1; i<= Session.get('times'); i ++) {
    listOfTimes.push({ _id: i.toString(), time: Session.get('timeValue'+i.toString()), width: PROGRESS_BAR_WIDTH, timeWidth: Session.get('timeValue'+i.toString())/MAX_TIME*100});
  };

  return listOfTimes;
};

Template.displayDistances.chooseDistances = function () {
  //Create list to be exported to Handlebars
  var listOfDistances = [];

  //Grab list from Session variables
  for (var i = 1; i<= Session.get('distances'); i ++) {
    listOfDistances.push({ _id: i.toString(), distance: Session.get('distanceValue'+i.toString()), width: PROGRESS_BAR_WIDTH, distanceWidth: Session.get('distanceValue'+i.toString())/MAX_DISTANCE*100});
  };

  return listOfDistances;
};

Template.timeExperiment.times = function () {
  return Session.get('times');
};

Template.distanceExperiment.distances = function () {
  return Session.get('distances');
};

Template.experiment.rendered = function () {
  //move footer back to bottom of the page each time the experiment template is rerendered
  rerenderfooter();
};

Template.timeExperiment.rendered = function () {
  //move footer back to bottom of the page each time the timeExperiment template is rerendered
  rerenderfooter();
};

Template.distanceExperiment.rendered = function () {
  //move footer back to bottom of the page each time the distanceExperiment template is rerendered
  rerenderfooter();
};

rerenderfooter = function () {
  //Need to use the leftSideColumn div to determine the height 
  //as the chatbox in the rightSideColumn will increase the scrollHeight 
  //as messages make the chatbox window bigger

  var scrollHeight = parseInt($("#leftSideColumn")[0].scrollHeight);
  //set minimum height at 750 (so footer doesn't go over rightSideColumn)
  if (scrollHeight > 750) {
    var newHeight = scrollHeight;
  }
  else {
    var newHeight = 750;
  };
  $("#content").height(newHeight);
};

Meteor.startup(function () {
  //run when client connects:

  //update Session values from server DB:

  //calls the getExperimentType method on server
  //gets the error message and result asynchronously and the runs the call back function
  Meteor.call("getExperimentType", function (err, result) {
    Session.set('experimentType', result);
  });

  Meteor.call("getNumberOfTimes", function (err, result) {
    console.log('setting numberOfTimes on client to: '+result);
    Session.set('times', result);
  });

  for (var i = 1; i<= MAX_NUMBER_TIMES; i ++) {
    Meteor.call("getTimeValue", i.toString(), function (err, result) {
      console.log('setting time value for '+result[1]+' to value '+result[0]);
      Session.set('timeValue'+result[1], result[0]);
    });
  };

  Meteor.call("getNumberOfDistances", function (err, result) {
    console.log('setting numberOfDistances on client to: '+result);
    Session.set('distances', result);
  });

  for (var i = 1; i<= MAX_NUMBER_DISTANCES; i ++) {
    Meteor.call("getDistanceValue", i.toString(), function (err, result) {
      console.log('setting distance value for '+result[1]+' to value '+result[0]);
      Session.set('distanceValue'+result[1], result[0]);
    });
  };

  console.log("the experimentType session variable is "+Session.get('experimentType'));
});