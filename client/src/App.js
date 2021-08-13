import './App.css';
import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom/cjs/react-router-dom.min';
import Routers from './Routers';

export default class App extends Component {
  render(){
    return (
      <BrowserRouter>
      <Routers />
      </BrowserRouter>
    );

  }
}