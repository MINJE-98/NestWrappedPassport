import '../App.css';
import React, { Component } from 'react';
import axios from "axios";

export default class Mypage extends Component {
  state = {
    userinfo: {}
  }
  async componentDidMount(){
    const { data } = await axios.get("http://localhost:3000/auth/status",{withCredentials: true })
    console.log(data);
    this.setState({ userinfo: data })
  }
  logout(){
    window.open("http://localhost:3000/auth/logout", "_self");
  }
  render(){
    return (
      <div>
        마이페이지
        <br />
        {this.state.userinfo.username}
        <br />
        <button onClick={()=> this.logout()}>
          로그아웃
        </button>
      </div>
    );

  }
}