// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
var randomScore = function() {
  return Math.floor(Math.random()*10)*5;
}

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    if (Session.get('sortByName') === true) {
      return Players.find({}, {sort: {name: 1}});
    }
    else {
      return Players.find({}, {sort: {score: -1, name: 1}});
    }
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click input.sort': function () {
      var is_sorted_by_name = Session.get('sortByName');
      if (is_sorted_by_name === true) {
        Session.set('sortByName', false);
      }
      else {
        Session.set('sortByName', true);
      }
    },
    'click input.reset': function () {
      Players.find({}).forEach(function(player) {
        Players.update(player, {$set: {score: randomScore()}});
      });
    },
    'click input.remove': function () {
      Players.remove(Session.get("selected_player"));
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });

  Template.addPlayer.events({
    'click input.add': function () {
      Players.insert({name: playerName.value, score: Number(playerScore.value)});
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: randomScore});
    }
  });
}

