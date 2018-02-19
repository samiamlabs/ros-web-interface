import React from 'react';
import ReactDOM from 'react-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import RappStarter from '../RappStarter';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const component = (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <RappStarter/>
    </MuiThemeProvider>
  )
  ReactDOM.render(component, div);
  ReactDOM.unmountComponentAtNode(div);
});
