designStream = new Meteor.Stream('design');

designStream.on('numberOfTimes', function(times) {
  //Updating the number of trials for time experiment from Stream:
  console.log('inside stream read on. Times ='+times);
  Session.set('times', times);

  for (var i = 1; i<= Session.get('times'); i ++) {
    //set time value from server database
    Meteor.call("getTimeValue", i.toString(), function (err, result) {
      console.log('setting time value for '+result[1]+' to value '+result[0]);
      Session.set('timeValue'+result[1], result[0]);
    });
  };
});

designStream.on('numberOfDistances', function(distances) {
  //Updating the number of trails for distance experiment from Stream
  console.log('inside stream read on. Distances ='+distances);
  Session.set('distances', distances);

  for (var i = 1; i<= Session.get('distances'); i ++) {
    //set distance value from server database
    Meteor.call("getDistanceValue", i.toString(), function (err, result) {
      console.log('setting distance value for '+result[1]+' to value '+result[0]);
      Session.set('distanceValue'+result[1], result[0]);
    });
  };
});

designStream.on('updateTimeValue', function(output) {
  //update time value stored in Session from Stream
  //output is variable of form: "id-value"
  var id = output.split("-")[0];
  var value = output.split('-')[1];
  console.log("updating the time value of id: "+id+" to value: "+value+" from STREAMS");
  Session.set('timeValue'+id, value);
});

designStream.on('updateDistanceValue', function(output) {
  //update distance value stored in Session from Stream
  //output is variable of form: "id-value"
  var id = output.split("-")[0];
  var value = output.split('-')[1];
  console.log("updating the distance value of id: "+id+" to value: "+value+" from STREAMS");
  Session.set('distanceValue'+id, value);
});

designStream.on('updateExperimentType', function(type) {
  //update experiment value in Session from Stream 
  //(HTML will auto update from autorun function (which is dependent on experimentType session variable))
  console.log("Inside updateExperimentType From STREAM with sent type: "+type+" and Session type: "+Session.get('experimentType'))
  if (Session.get('experimentType') != type) {
    Session.set('experimentType', type);
  };
});