import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import Homepage from './Homepage';
import Dashboard from './Dashboard';

import GA from './GoogleAnalytics'

const ascii = "\n8 8888      88 8 888888888o   8 8888         8 888888888o.\n8 8888      88 8 8888    `88. 8 8888         8 8888    `^888.\n8 8888      88 8 8888     `88 8 8888         8 8888        `88.\n8 8888      88 8 8888     ,88 8 8888         8 8888         `88\n8 8888      88 8 8888.   ,88' 8 8888         8 8888          88\n8 8888      88 8 888888888P'  8 8888         8 8888          88\n8 8888      88 8 8888         8 8888         8 8888         ,88\n` 8888     ,8P 8 8888         8 8888         8 8888        ,88'\n  8888   ,d8P  8 8888         8 8888         8 8888    ,o88P'\n   `Y88888P'   8 8888         8 888888888888 8 888888888P'      ";

class App extends React.Component {
  render() {
    console.log(ascii);
    return (
      <Router>
        <div>
          {GA.init() && <GA.RouteTracker />}
          <Switch>
            <Route exact path="/" component={Homepage} />
            <Route path="/dashboard" component={Dashboard} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;