import React from 'react';
import ReactDOM from 'react-dom';
import TimeLine from './Components/TimeLine.js'

class Main extends React.Component{
render() {
    return (
      <div>
        <TimeLine />
      </div>
    )
  }
};

ReactDOM.render(<Main />, document.getElementById("main"));
