import React from 'react';
import ReactDOM from 'react-dom';
import ChartApp from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ChartApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
