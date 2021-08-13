import { GithubLoginButton } from "react-social-login-buttons";
import React, { Component } from 'react';

export default class Home extends Component {

  githubLogin(){
    window.open("http://localhost:3000/auth/github", "_self");
  }

  render(){
    return (
      <div>
        <GithubLoginButton onClick={this.githubLogin} />

      </div>
    );
  }
}