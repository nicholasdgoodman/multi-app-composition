import React from 'react';
import barchart from './barchart.svg';

import './App.css';
import { fchmod } from 'fs';

declare const fin: any;

class ChartApp extends React.Component {
  constructor(props: any) {
    super(props);

    this.setup();
  }

  state = {
    popoutCommand: window.opener ? "popin" : "popout",
    data: ''
  }

  setup = async () => {
    fin.desktop.InterApplicationBus.subscribe('*', 'update-data', (data:any) => {
      this.setState({data});
    });

    fin.desktop.InterApplicationBus.subscribe('*', 'discover-charts', registerChart);

    function registerChart() {
      fin.desktop.InterApplicationBus.publish('register-chart', {
        frameName: window.name,
        frameIdentity: fin.desktop.Frame.getCurrent()
      });
    }

    registerChart();
  }

  performPopAction() {
    let popoutCommand = this.state.popoutCommand;
    fin.desktop.InterApplicationBus.publish(`window-manager/${this.state.popoutCommand}`, window.name);        
    
    // If not an IFrame or a Popup, toggle state locally
    if(window.top === window || window.opener !== null) {
      popoutCommand = popoutCommand === "popout" ? "popin" : "popout";
      this.setState({popoutCommand});
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <button onClick={async () => this.performPopAction()}>{this.state.popoutCommand}</button>
          <img src={barchart} alt="logo" className="App-chart" />
          <p>{window.name}</p>
          <span>{this.state.data}</span>
        </header>
      </div>
    );
  }
}

export default ChartApp;
