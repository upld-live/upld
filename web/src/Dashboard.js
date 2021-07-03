import './App.css';

import Navbar from 'react-bootstrap/Navbar';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';

import React from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";

//dash pages
import UploadPage from './dash/UploadPage';
import UpdateUserDetials from './dash/UpdateUserDetails';
import CreateSubdomain from './dash/CreateSubdomain';
import YourSubdomains from './dash/YourSubdomains';
import PreviousUploads from './dash/PreviousUploads';
import DashboardHomePage from './dash/DashboardHomePage';
import BetaFeedback from './dash/beta/BetaFeedback';
import BetaReport from './dash/beta/BetaReport';

import AdminStats from './dash/admin/AdminStats';
import AdminUsers from './dash/admin/AdminUsers';
import AdminUpdates from './dash/admin/AdminUpdates';
import AdminModeration from './dash/admin/AdminModeration';

import { Alert } from 'react-bootstrap';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            success: false,
            loading: true,
            username: '',
            key: '',
            pfp: '',
            buildID: '',
        };

        this.DashboardSidebar = this.DashboardSidebar.bind(this);
        this.AdminDashboardSidebar = this.AdminDashboardSidebar.bind(this);
    }

    async componentDidMount() {
        let res = await fetch('/api/v1/user/loggedIn', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        let result = await res.json();

        let r = await fetch('/api/v1/buildID');
        let b = await r.json();
        console.log(b.build.buildID);

        if (result.isAdmin) {
            this.setState({
                success: result.success,
                loading: false,
                username: result.username,
                isAdmin: result.isAdmin,
                key: result.key,
                pfp: result.pfp,
                build: b.build,
            });
        } else {
            this.setState({
                success: result.success,
                loading: false,
                username: result.username,
                key: result.key,
                pfp: result.pfp,
                build: b.build,
            });
        }
    }

    /*async doLogout() {
        try {
            let res = await fetch('/logout', {
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

            window.location.href = '/';
        } catch (e) {
            console.log(e);
        }
    }

    LogoutB() {
        return (
            <LogoutButton
                onClick={() => this.doLogout()}
                disabled={false}
                text='Logout'
            />
        );
    }*/

    DashboardSidebar() {
        return (
            <div style={{ position: 'fixed' }}>
                <div className="c1">
                    <Card style={{ maxWidth: '20%', height: '95vh' }}>
                        <div className="sidebar">
                            <aside class="menu">
                                <p class="menu-list menu-label">
                                    Dashboard
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard">Home</a></li>
                                </ul>
                                <p class="menu-list menu-label">
                                    Upload
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard/upload">Upload</a></li>
                                    <li><a href="/dashboard/previousUploads">Recent Uploads</a></li>
                                </ul>
                                <p class="menu-list menu-label">
                                    Domains
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard/createSubdomain">Create Subdomain</a></li>
                                    <li><a href="/dashboard/subdomains">Your subdomains</a></li>
                                </ul>
                                <p class="menu-list menu-label">
                                    User
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard/updateUser">User Details</a></li>
                                </ul>
                                <p class="menu-list menu-label">
                                    Beta
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard/beta/submitReport">Report Bug</a></li>
                                    <li><a href="/dashboard/beta/submitFeedback">Send Feedback</a></li>
                                </ul>
                            </aside>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    AdminDashboardSidebar() {
        return (
            <div style={{ position: 'fixed' }}>
                <div className="c1">
                    <Card style={{ maxWidth: '20%', height: '95vh' }}>
                        <div className="sidebar">
                            <aside class="menu">
                                <p class="menu-list menu-label">
                                    Dashboard
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard">Home</a></li>
                                </ul>
                                <p class="menu-list menu-label">
                                    Upload
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard/upload">Upload</a></li>
                                    <li><a href="/dashboard/previousUploads">Recent Uploads</a></li>
                                </ul>
                                <p class="menu-list menu-label">
                                    Domains
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard/createSubdomain">Create Subdomain</a></li>
                                    <li><a href="/dashboard/subdomains">Your subdomains</a></li>
                                </ul>
                                <p class="menu-list menu-label">
                                    User
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard/updateUser">User Details</a></li>
                                </ul>
                                <p class="menu-list menu-label">
                                    Beta
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard/beta/submitReport">Report Bug</a></li>
                                    <li><a href="/dashboard/beta/submitFeedback">Send Feedback</a></li>
                                </ul>
                                <p class="menu-list menu-label">
                                    Admin
                                </p>
                                <ul class="menu-list">
                                    <li><a href="/dashboard/admin/allUsers">View all users</a></li>
                                    <li><a href="/dashboard/admin/addUpdate">Publish update</a></li>
                                    <li><a href="/dashboard/admin/stats">General Statistics</a></li>
                                    <li><a href="/dashboard/admin/moderation">Moderation</a></li>
                                </ul>

                                <Alert variant="warning" style={{ marginTop: 30, width: '95%' }}>
                                    Build Identifier: {this.state.build.id}, Date Compiled: {new Date(this.state.build.compilationDate).toLocaleString('en-US', { timeZone: 'EST' })}
                                </Alert>
                            </aside>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    BottomTag() {
        return (
            <></>
        );
    }

    render() {
        if (this.state.loading) return null;

        if (this.state.success) {
            if (this.state.isAdmin) {
                return (
                    <div className="app">
                        <this.BottomTag />
                        <Navbar bg="dark" variant="dark" style={{ height: '5vh', position: 'fixed', width: '100%' }} className="dashNav">
                            <Navbar.Brand href="#" className="rainbow-text">
                                upld beta
                            </Navbar.Brand>

                            <Nav className="mr-auto" />

                            <Navbar.Brand style={{ marginTop: '0.5%' }}>
                                {this.state.username}
                            </Navbar.Brand>
                            <div class="image" style={{ backgroundImage: 'url(' + this.state.pfp + ')' }} />
                        </Navbar>

                        <this.AdminDashboardSidebar />

                        <Router>
                            <div className="page">
                                <Switch>
                                    <Route exact path="/dashboard">
                                        <DashboardHomePage username={this.state.username} />
                                    </Route>
                                    <Route path="/dashboard/previousUploads">
                                        <PreviousUploads />
                                    </Route>
                                    <Route path="/dashboard/upload">
                                        <UploadPage p={{ username: this.state.username, key: this.state.key }} />
                                    </Route>
                                    <Route path="/dashboard/createSubdomain">
                                        <CreateSubdomain />
                                    </Route>
                                    <Route path="/dashboard/subdomains">
                                        <YourSubdomains />
                                    </Route>
                                    <Route path="/dashboard/updateUser">
                                        <UpdateUserDetials />
                                    </Route>
                                    <Route path="/dashboard/beta/submitFeedback">
                                        <BetaFeedback p={{ key: this.state.key }} />
                                    </Route>
                                    <Route path="/dashboard/beta/submitReport">
                                        <BetaReport p={{ key: this.state.key }} />
                                    </Route>
                                    <Route path="/dashboard/admin/stats">
                                        <AdminStats p={{ key: this.state.key }} />
                                    </Route>
                                    <Route path="/dashboard/admin/allUsers">
                                        <AdminUsers key={this.state.key} />
                                    </Route>
                                    <Route path="/dashboard/admin/addUpdate">
                                        <AdminUpdates p={{ key: this.state.key }} />
                                    </Route>
                                    <Route path="/dashboard/admin/moderation">
                                        <AdminModeration p={{ key: this.state.key }} />
                                    </Route>
                                </Switch>
                            </div>
                        </Router>
                    </div>
                );
            }

            return (
                <div className="app">
                    <this.BottomTag />
                    <Navbar bg="dark" variant="dark" style={{ height: '5vh', position: 'fixed', width: '100%' }} className="dashNav">
                        <Navbar.Brand href="#" style={{ fontSize: '170%' }}>
                            upld beta
                        </Navbar.Brand>

                        <Nav className="mr-auto" />

                        <Navbar.Brand style={{ marginTop: '0.5%' }}>
                            {this.state.username}
                        </Navbar.Brand>
                        <div class="image" style={{ backgroundImage: 'url(' + this.state.pfp + ')' }} />
                    </Navbar>

                    <this.DashboardSidebar />

                    <Router>
                        <div className="page">
                            <Switch>
                                <Route exact path="/dashboard">
                                    <DashboardHomePage username={this.state.username} />
                                </Route>
                                <Route path="/dashboard/previousUploads">
                                    <PreviousUploads />
                                </Route>
                                <Route path="/dashboard/upload">
                                    <UploadPage p={{ username: this.state.username, key: this.state.key }} />
                                </Route>
                                <Route path="/dashboard/createSubdomain">
                                    <CreateSubdomain />
                                </Route>
                                <Route path="/dashboard/subdomains">
                                    <YourSubdomains />
                                </Route>
                                <Route path="/dashboard/updateUser">
                                    <UpdateUserDetials />
                                </Route>
                                <Route path="/dashboard/beta/submitFeedback">
                                    <BetaFeedback p={{ key: this.state.key }} />
                                </Route>
                                <Route path="/dashboard/beta/submitReport">
                                    <BetaReport p={{ key: this.state.key }} />
                                </Route>
                            </Switch>
                        </div>
                    </Router>
                </div>
            );
        }

        return (<Redirect to="/" />);
    }
}

export default Dashboard;
