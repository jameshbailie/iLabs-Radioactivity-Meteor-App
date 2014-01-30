//set constants
MAX_NUMBER_TIMES = 10;
MIN_NUMBER_TIMES = 0;
MAX_TIME = 100;
MIN_TIME = 0;

MAX_NUMBER_DISTANCES = 10;
MIN_NUMBER_DISTANCES = 0;
MAX_DISTANCE = 100;
MIN_DISTANCE = 0;

//initialise mongoDB collection
designCollection = new Meteor.Collection('design');

Meteor.startup(function () {
  // code to run on server at startup

  //intialise the database (if it hasn't already been initialised)
  if (!(designCollection.findOne({}))) {
    //set experiment Type to none
    designCollection.insert({experimentType: "none"});

    designCollection.insert({numberOfTimes: "0"});

    //add the time values for each trial
    //(do them for all possible trials - solves callback issues elsewhere)
    for (var i = 1; i <= MAX_NUMBER_TIMES; i ++) {
      designCollection.insert({tId: i.toString(), tValue: "50"});
    };

    designCollection.insert({numberOfDistances: "0"});

    //add the distance values for each trial
    for (var i = 1; i <= MAX_NUMBER_DISTANCES; i ++) {
      designCollection.insert({dId: i.toString(), dValue: "50"});
    };
  };

});

Meteor.methods({
  //methods accessible only by server
  //methods are database functions called by the client and run on the server
  //(by default client cannot access server DB)
  //clients receive the method's result asynchronicously
  //methods are 'simulated' on the client if the method is defined in the client file.
  //see http://docs.meteor.com/#methods_header
  getTimeValue: function(id) {
    return [designCollection.findOne({tId: id}).tValue, id];
  },
  getDistanceValue: function(id) {
    return [designCollection.findOne({dId: id}).dValue, id];
  },
  getNumberOfTimes: function () {
    console.log("The number of times on server "+designCollection.findOne({numberOfTimes: {$exists: true}}).numberOfTimes);
    return designCollection.findOne({numberOfTimes: {$exists: true}}).numberOfTimes;
  },
  getNumberOfDistances: function () {
    console.log("The number of distances on server "+designCollection.findOne({numberOfDistances: {$exists: true}}).numberOfDistances);
    return designCollection.findOne({numberOfDistances: {$exists: true}}).numberOfDistances;
  },
  getExperimentType: function () {
    console.log("The experiment type on server "+designCollection.findOne({experimentType: {$exists: true}}).experimentType);
    return designCollection.findOne({experimentType: {$exists: true}}).experimentType;
  },
  updateTimeValue: function(id, value) {
    console.log("updating the time value of id: "+id+" with value: "+value);
    designCollection.update({tId: id}, {$set: {tValue: value}});
    console.log("updated:"+designCollection.findOne({tId: id}).tValue);
  },
  updateDistanceValue: function(id, value) {
    console.log("updating the distance value of id: "+id+" with value: "+value);
    designCollection.update({dId: id}, {$set: {dValue: value}});
    console.log("updated:"+designCollection.findOne({dId: id}).dValue);
  },
  updateExperimentType: function(type) {
    console.log("updating the experiment type to type: "+type);
    designCollection.update({experimentType: {$exists: true}}, {experimentType: type});
  },
  updateTimes: function(times) {
    //update the number of trials for the Time experiment to input times
    if (times > MAX_NUMBER_TIMES) {
      throw "Error too many trials"
    }
    designCollection.update({numberOfTimes: {$exists: true}},{$set: {numberOfTimes: times}});
    //test that the code below is redundant: as the database is initialised with the maximum number of times
    for (var i = 1; i <= times; i ++) {
      if (!(designCollection.findOne({tId: i.toString()}))) {
        designCollection.insert({tId: i.toString(), tValue: "50"});
      };
    };
  },
  updateDistances: function(distances) {
    console.log('updating distances on server to: '+distances);
    //update the number of trials for the Distance experiment to input distances
    if (distances > MAX_NUMBER_DISTANCES) {
      throw "Error too many trials"
    }
    designCollection.update({numberOfDistances: {$exists: true}},{$set: {numberOfDistances: distances}});
    //test that the code below is redundant: as the database is initialised with the maximum number of distances
    for (var i = 1; i <= distances; i ++) {
      if (!(designCollection.findOne({dId: i.toString()}))) {
        designCollection.insert({dId: i.toString(), dValue: "50"});
      };
    };
  }
});