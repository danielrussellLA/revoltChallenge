import React from 'react';
import axios from 'axios';


class Times extends React.Component {
	constructor (props) {
	    super(props);
	    this.state = {times: []};
			// on init, fetch timeline from db
	    this.fetchTimeLine();
	  }

	fetchTimeLine () {
	  	let that = this;
	  	axios.get('/timeLine')
	  	.then(function(res){
	  		that.setState({times: res.data.times});
	  	})
	  	.catch(function(res){
	  		console.log('Error in getting times');
	  	});
	  }

	  renderTimeline () {
	  	let createTimeLine = (item) => {
		  		return <li className={item.class}>{item.time}</li>
	  	}
	  	return <ul className="Times">{this.state.times.map(createTimeLine)}</ul>
	  }

	  render () {
		  return (
		  	this.renderTimeline()
		  )
	  }
}

export default Times;
