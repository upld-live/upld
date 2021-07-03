import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import LogoutButton from './LoginButton';

import React from "react";
import { observer } from 'mobx-react';

import UserStore from './UserStore';

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      alertShow: true
    };

    this.WIPAlert = this.WIPAlert.bind(this);
    this.closeAlert = this.closeAlert.bind(this);
    this.LogoutB = this.LogoutB.bind(this);
  }

  async componentDidMount() {
    try {
      let res = await fetch('/api/v1/user/loggedIn', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      let result = await res.json();

      if (result && result.success) {
        UserStore.loading = false;
        UserStore.isLoggedIn = true;
        UserStore.username = result.username;
        UserStore.key = result.key;
      } else {
        UserStore.loading = false;
        UserStore.isLoggedIn = false;
      }
    } catch (e) {
      UserStore.loading = false;
      UserStore.isLoggedIn = false;
    }
  }

  async doLogout() {
    try {
      let res = await fetch('/api/v1/user/logout', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      let result = await res.json();

      if (result && result.success) {
        UserStore.isLoggedIn = false;
        UserStore.username = '';
        UserStore.key = '';
      }
    } catch (e) {
      console.log(e);
    }
  }

  /*handleDownload = () => {
    switch (parseInt(rf.current.value)) {
      case 1:
        window.location.href = "https://cdn.upld.live/sxcu/upld.live%20%28upld.live%29.sxcu";
        break;
      case 2:
        window.location.href = "https://cdn.upld.live/sxcu/fuck.upld.live%20%28upld.live%29.sxcu";
        break;
      case 3:
        window.location.href = "https://cdn.upld.live/sxcu/i.nigga.systems%20%28upld.live%29.sxcu";
        break;
      case 4:
        window.location.href = "https://cdn.upld.live/sxcu/nigga.systems%20%28upld.live%29.sxcu";
        break;
      default:
        console.log(rf.current.value);
    }
  }*/

  closeAlert = () => {
    this.setState((state) => {
      return {
        alertShow: false
      };
    });
  }

  DashboardButton() {
    return (
      <a href="/dashboard" class="btn btn-primary" style={{ color: 'white' }}>
        Dashboard
      </a>
    );
  }

  LogoutB() {
    return (
      <LogoutButton
        onClick={this.doLogout}
        disabled={false}
        text='Logout'
      />
    );
  }

  WIPAlert() {
    return (
      <Alert show={this.props.alertShow} variant="success" onClose={this.closeAlert}>
        Please note that upld is currently undergoing development, and is subject to change.
      </Alert>
    );
  }

  Bottomdivs() {
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <h2>
              Free to use
            </h2>
            <p>Accounts will always be free. To get a signup key, join the discord and just ask me for one :D</p>
          </div>

          <div className="col">
            <h2>
              Large Size Uploads
            </h2>
            <p>
              The maximum upload size for default users is 50mb, and 100mb for upgraded users.
            </p>
          </div>

          <div className="col">
            <h2>
              Dashboard
            </h2>
            <p>
              Get useful information about your uploads, account, etc. Update your account or remove uploads.
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <h2>
              Easy to use
            </h2>
            <p>upld was made with usability in mind. Using upld is very easy and help is always available when needed. Contact me on discord for information.</p>
          </div>

          <div className="col">
            <h2>
              Very secure
            </h2>
            <p>
              upld does not share user information with others. Your information is safe with us. The only way to get your information is through you.
            </p>
          </div>

          <div className="col">
            <h2>
              Free subdomains
            </h2>
            <p>
              Free accounts can have up to 5 free subdomains. Upgraded accounts can have up to 10. You can pay for more subdomains by contacting me on discord.
            </p>
          </div>
        </div>
      </div>
    );
  }

  Footer() {
    let year = new Date().getFullYear();
    return (
      <footer className="container">
        <p>upld, {year} • Join the <a href="https://discord.gg/bvbnhM3SKs" target={'_blank'}>discord</a>!</p>
      </footer>
    );
  }

  render() {
    if (UserStore.loading) {
      return (
        <div className="app">
          <p style={{ fontSize: 0 }}>Loading</p>
        </div>
      );
    } else {
      if (UserStore.isLoggedIn) {
        return (
          <div className="app">
            <Jumbotron>
              <div className="container">
                <Alert variant="primary">
                  Currently signed in as {UserStore.username}.
                </Alert>
                <h1>upld</h1>
                <p>
                  upld is an easy to use, simple file uploader made for use with ShareX.
                </p>
                <p>
                  <this.DashboardButton />
                  <div className="divider" />
                  <this.LogoutB />
                </p>
              </div>
            </Jumbotron>
            <this.Bottomdivs />

            <this.Footer />
          </div>
        );
      }

      return (
        <div className="app">
          <Jumbotron>
            <div className="container">
              <h1>upld</h1>
              <p>
                upld is an easy to use, simple file uploader made for use with ShareX.
              </p>
              <p>
                <LoginForm />
                <div className="divider" />
                <SignupForm />
              </p>
            </div>
          </Jumbotron>
          <this.Bottomdivs />

          <this.Footer />
        </div>
      );
    }
  }
}

export default observer(Homepage);
