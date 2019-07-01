import React from 'react';
import logo from './logo.svg';
import './App.css';
import { DH_UNABLE_TO_CHECK_GENERATOR } from 'constants';

declare const fin: any;

const DataPicker: React.FC<any> = props => (
      <div>
      <span>{props.destination}</span>
      <button onClick={()=>(props.send("A"))}>A</button>
      <button onClick={()=>(props.send("B"))}>B</button>
      <button onClick={()=>(props.send("C"))}>C</button>
      </div>
  );

class App extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {
      charts: {}
    }

    fin.desktop.InterApplicationBus.subscribe("*", "register-chart", (resp:any) => {
      let {frameName, frameIdentity} = resp;
      let charts = this.state.charts;

      let chart = charts[frameName] || { state: '' };
      Object.assign(chart, { identity: frameIdentity });
      charts[frameName] = chart;

      this.setState({charts});
      this.sendChartData(frameIdentity, chart.state);
    });

    fin.desktop.InterApplicationBus.publish("discover-charts", {});
  }

  state = {
    charts: {} as any
  }

  async updateCharts(dest:string, data:string): Promise<void> {
    let charts = this.state.charts;
    let chart = charts[dest];
    chart.state = data;
    
    this.setState({charts});
    this.sendChartData(chart.identity, data);
  }

  async sendChartData(identity: any, data: string): Promise<void> {
    //let dataChannel = await dataChannelPromise;
    //dataChannel.dispatch({uuid: window.name, name: dest}, "update-data", data);
    fin.desktop.InterApplicationBus.send(identity.uuid, identity.name, "update-data", data);
  }

  render():any {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <DataPicker destination="topChartApp" send={(data:string) => this.updateCharts("topChartApp", data)}/>
          <br/>
          <DataPicker destination="bottomChartApp" send={(data:string) => this.updateCharts("bottomChartApp", data)}/> 
        </header>
      </div>
    );
  }
}


//const dataChannelPromise = fin.InterApplicationBus.Channel.create("data-channel").then((ch:any) => {console.log('data-channel created'); return ch;});

export default App;
