import React from 'react';
import axios from 'axios';

class Event extends React.Component {
	constructor (props) {
    super(props);
    this.state = { events: [], timeLine: [], overlaps: 0 };
		// populateTimeLine with 720 arrays - each array represents a minute within the 12 hour time span of our timeline
		this.populateTimeLine();
		// on init, get events in db
		this.fetchEvents();
  }

	fetchEvents () {
		// hack - to preserve this binding inside .then
		let that = this;
		axios.get('/event')
		.then(function (res) {
			that.setState({ events: res.data.events });
			// sort events in case data on backend is unorganized. Could (should?) possibly move this to the backend
    	that.sortEvents();
			// arrange events in a 2d grid to help with all conflict/horizontal index caluclations
			that.arrangeEventsOnTimeLine();
			// find all conflicts on the timeline and populate events with number of conflicts
			that.getEventConflicts();
			// calculate each events' horizontal index based on their number of conflicts
			that.getHorizontalIdx();
			// re-calculate each events' conflicts to match the highest number of conflictts occuring in conflicting events
			that.formatConflicts();
		})
		.catch(function (res) {
			console.log('Error in getting events');
		});
	}

	populateTimeLine () {
		const timeLineLength = this.state.timeLine.length;
		let timeLine = [];
		for (let i = 0; i < 720; i++) {
			this.state.timeLine.push([]);
		}
	}

	arrangeEventsOnTimeLine () {
		const eventsLength = this.state.events.length;
		for (let i = 0; i < eventsLength; i++) {
			let event = this.state.events[i];
			let eventStartTime = this.convertTimeToMins(event.startTime);
			let eventEndTime = this.convertTimeToMins(event.endTime);

			for (let j = eventStartTime; j < eventEndTime; j++) {
				// store event objects in each minute on the timeline so that we can calculate relations between events
				// and manipulate events' data
				this.state.timeLine[j].push(event);
			}
		}
	}

	getEventConflicts () {
		for (let i = 0; i < 720; i++) {
			const timeSlotLength = this.state.timeLine[i].length;
			// If there's at least one event in the timeslot, loop through events
			if (timeSlotLength > 0) {
				// store the greatest concurrent conflicts for each event
				for (let j = 0; j < timeSlotLength; j++) {
					let event = this.state.events[this.state.timeLine[i][j].id - 1];
					if (!event.conflicts || event.conflicts < timeSlotLength) {
						event.conflicts = timeSlotLength;
					}
				}
			}
		}
	}

	formatConflicts () {
		const timeLineLength = this.state.timeLine.length;
		let greatestConflictAmt = 1;
		// loop through timeline and find the greatest amount of conflicts among conflicting events
		for (let i = 0; i < timeLineLength; i++) {
			for (let j = 0; j < this.state.timeLine[i].length; j++) {
				if(this.state.timeLine[i][j].conflicts > greatestConflictAmt){
					greatestConflictAmt = this.state.timeLine[i][j].conflicts;
				}
			}
			// loop through minute & change event's conflicts to match the greatest number
			// of conflicts in its conflicting event(s) so that Each event’s width will
			// be equal to that of all events that it overlaps
			for(let x = 0; x < this.state.timeLine[i].length; x++){
				this.state.timeLine[i][x].conflicts = greatestConflictAmt;
			}
			greatestConflictAmt = 1;
		}
		// force update ensures the state variables are updated with current info from this algorithm
		this.forceUpdate();
	}

	getHorizontalIdx () {
		const timeLineLength = this.state.timeLine.length;
		for (let i = 0; i < timeLineLength; i++) {
			for (let j = 0; j < this.state.timeLine[i].length; j++) {
				for (var x = 0; x < this.state.events.length; x++) {
					// find matching event to the current event being looped over in timeline
					if(this.state.events[x].id === this.state.timeLine[i][j].id){
						// if horizontalIdx is undefined, set it equal to the current index in the minute
						if(this.state.events[x].horizontalIdx === undefined){
							this.state.events[x].horizontalIdx = j;
						}
						// if we are at the 2nd or above event in the minute, set the event's horizontalIdx to the
						// previous event's horizontalIdx + 1
						if (j > 0){
							this.state.events[x].horizontalIdx = this.state.events[x - 1].horizontalIdx + 1;
						}
						// if the events horizontalIdx is equal to its # of conflicts, set horizontalIdx to 0 for aesthetic reasons
						if(this.state.events[x].horizontalIdx === this.state.events[x].conflicts){
							this.state.events[x].horizontalIdx = 0;
						}
						// if event's conflicting horizontalIdx is greater than the current event's horizontalIdx, set current's
						// horizontalIdx to 0 for aesthetic reasons
						if(this.state.timeLine[i][j - 1] && this.state.timeLine[i][j - 1].horizontalIdx > this.state.timeLine[i][j].horizontalIdx){
							this.state.events[x].horizontalIdx = 0;
						}
					}
				}
			}
		}
		// force update ensures the state variables are updated with current info from this algorithm
		this.forceUpdate();
	}

	sortEvents () {
		// sort events by time (earliest - latest) and give each event an unique id
		let that = this;
		let id = 1;
		let sorted = this.state.events.sort(function(a, b){
			return that.convertTimeToMins(a.startTime) - that.convertTimeToMins(b.startTime);
		});
		sorted.forEach(function (event) {
			event.id = id;
			id++;
		});
		this.setState({events: sorted});
	}

	convertTimeToMins (time) {
		// convert time from string format "HH:MM:SS" to mins
		let splitTime = time.split(':');
		let hours = parseInt(splitTime[0]);
		let mins = parseInt(splitTime[1]);

		hours = hours - 9;

		let hoursInMins = 0;
		for (let i = 0; i < hours; i ++) {
			hoursInMins += 60;
		}
		return hoursInMins + mins;
	}

	renderEvents () {
		// this is where the magic happens - we combine the calculations from all the above helper functions
		// to render event divs to the page
		let createEvent = (event) => {
			event.height = this.convertTimeToMins(event.endTime) - this.convertTimeToMins(event.startTime);
			event.width = 100 / event.conflicts;
			event.yPos = this.convertTimeToMins(event.startTime) + 12;
			event.xPos = event.horizontalIdx * event.width;
			return <div className="event" style={{width: event.width + "%", height: event.height + "px", top: event.yPos + "px", left: event.xPos + "%", background: "#"+Math.floor(Math.random()*16777215).toString(16)}}>{event.title}{event.startTime}{event.endTime}</div>
		};
		return <div className="eventsContainer">{this.state.events.map(createEvent)}</div>
	}

	render () {
		return (
			this.renderEvents()
		)
	}
}

export default Event;
