CalEvent = new Mongo.Collection('calevent');

if (Meteor.isClient) {

    Template.dialog.events({
        "click .close": function(event, template) {
            Session.set('editing_event', null);
        },
        "click .closeThis": function(event, template) {
            Session.set('editing_event', null);
        },
        "click .updateTitle": function(event, template) {
            var title = template.find('#title').value;
            Meteor.call('updateTitle', Session.get('editing_event'), title);
            Session.set('editing_event', null);
        }
    });

    Template.main.helpers({
        editing_event: function() {
            return Session.get('editing_event');
        }
    });

    Template.dialog.helpers({
        title: function() {
            var ce = CalEvent.findOne({
                _id: Session.get('editing_event')
            });
            return ce.title;
        }
    });

    Template.dialog.rendered = function() {
        if (Session.get('editDialog')) {
            var calevent = CalEvent.findOne({
                _id: Session.get('editDialog')
            });
            if (calevent) {
                $('#title').val(calevent.title);
            }
        }
    };

    Template.main.rendered = function() {
        var calendar = $('#calendar').fullCalendar({
            dayClick: function(date, allDay, jsEvent, view) {
                var calendarEvent = {};
                calendarEvent.start = date;
                calendarEvent.end = date;
                calendarEvent.title = 'New Event';
                calendarEvent.owner = Meteor.userId();
                Meteor.call('saveCalEvent', calendarEvent);
            },
            eventClick: function(calEvent, jsEvent, view) {
                Session.set('editing_event', calEvent._id);
                $('#title').val(calEvent.title);
            },
            events: function(start, end, callback) {
                var calEvents = CalEvent.find({}, {
                    reactive: false
                }).fetch();
                callback(calEvents);
            }
        }).data().fullCalendar;
        Deps.autorun(function() {
            CalEvent.find().fetch();
            if (calendar) {
                calendar.refetchEvents();
            }
        })
    }
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        Meteor.methods({
            'saveCalEvent': function(ce) {
                CalEvent.insert(ce);
            },
            'updateTitle': function(id, title) {
                return CalEvent.update({
                    _id: id
                }, {
                    $set: {
                        title: title
                    }
                });
            }
        })
    });
}