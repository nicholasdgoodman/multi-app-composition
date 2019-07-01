import React from 'react';
import './App.css';

declare const fin: any;

fin.desktop.InterApplicationBus.subscribe("*", "window-manager/popout", (id:string, uuid:string, name:string) => {
	console.log('popout', id, uuid, name);
  let iframe = document.getElementById(id) as HTMLIFrameElement;
  
	let url = iframe.src;
	let windowName = iframe.name;
	
	(iframe.parentNode as Node).removeChild(iframe);
	
	window.open(url, windowName);
});

fin.desktop.InterApplicationBus.subscribe("*", "window-manager/popin", (id:string, uuid:string, name:string) => {
	console.log('popin', id, uuid, name);
	
	let ofWin = fin.desktop.Window.wrap(uuid, name);
	
	ofWin.getInfo((info: any) => {
		let url = info.url;
		ofWin.close();
		
		let iframe = document.createElement('iframe');
		iframe.src = url;
		iframe.name = name;
		iframe.id = name;
		
		let parentNode = document.getElementById(name + '-parentNode') as HTMLDivElement;
		parentNode.appendChild(iframe);
	});
});


const App: React.FC = () => {
  return (
    <div className="App"> 
    <div className="container">
      <FramedContent name="topbarApp" url="http://localhost:3002/color.html" />
      <FramedContent name="sidebarApp" url="http://localhost:3002/color.html" />
      <FramedContent name="blotterApp" url="http://localhost:3001" />
      <div className="charts">
        <FramedContent name="topChartApp" className="chart topChartApp" url="http://localhost:3002" />
        <FramedContent name="bottomChartApp" className="chart bottomChartApp" url="http://localhost:3002" />
      </div>
    </div>
    </div>
  );
}

const FramedContent: React.FC<any> = (props) => {
  return(
    <div id={props.name + '-parentNode'} className={props.className || props.name}>
      <iframe id={props.name} name={props.name} title={props.name} src={props.url}></iframe>
    </div>
  )
}

export default App;
