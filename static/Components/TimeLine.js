import React from 'react';
import Event from './Event.js';
import Times from './Times.js';
import axios from 'axios';


class TimeLine extends React.Component {
	render () {
		return (
			<div className="TimeLine">
				<Times />
				<Event />
			</div>
		)
	}
}

export default TimeLine;
