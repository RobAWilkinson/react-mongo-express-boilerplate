import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './app';
import Home from './common/home';
export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
  </Route>
);
