import axios from 'axios';
import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './containers/Home';
import Mypage from './containers/Mypage';

export default class Routers extends Component {
  state = {
    islogined: false
  }
  async componentDidMount(){
    const { data } = await axios.get("http://localhost:3000/auth/status",{withCredentials: true })
    if(typeof data == "object") this.setState({ islogined: true })
    else this.setState({ islogined: false })
  }
  render(){
    return (
      <div  style={{ display: "flex", position: "absolute", height: "100%" }}>
        <Switch>
          {this.state.islogined ? 
          <Route exact path="/" component={Mypage} /> : 
          <Route exact path="/" component={Home} />
          }
          
          
        </Switch>
      </div>
  );
  }
}
