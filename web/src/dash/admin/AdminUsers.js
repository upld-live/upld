import React from 'react';
import { Button, Card, Jumbotron, Form } from 'react-bootstrap';
import AdminDomainsButton from '../comps/AdminDomainsButton';
import AdminUploadsButton from '../comps/AdminUploadsButton';
import AdminTerminateButton from '../comps/AdminTerminateButton';

class AdminUsers extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            key: '',
            username: '',
            search: ''
        };

        this.search = this.search.bind(this);
        this.onSearch = this.onSearch.bind(this);
    }

    async componentDidMount() {
        //get username and key from api
        let r1 = await fetch('/api/v1/user/loggedIn', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        let rs1 = await r1.json();

        this.setState({
            username: rs1.username,
            key: rs1.key
        });

        await this.onSearch();
    }

    async search(e) {
        await this.onSearch(e.target.value);
    }

    async onSearch(e) {
        if (e === undefined) {
            e = '';
        }

        this.setState({
            users: []
        });

        let res = await fetch('/api/v1/admin/users/search', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: this.state.key,
                s: e
            })
        });

        let result = await res.json();

        if (result && result.success) {
            let u = [];
            for (var i = 0; i < result.user.length; i++) {
                var date = new Date(result.user[i].dateCreated).toLocaleString('en-US', { timeZone: 'EST' });
                if (result.user[i].username === this.state.username) {
                    u.push(
                        <>
                            <Card>
                                <div style={{ padding: '5px' }}>
                                    <div style={{ float: 'right' }}>
                                        <AdminDomainsButton p={{ key: this.state.key }} />
                                        <div class="divider" />
                                        <AdminUploadsButton p={{ username: this.state.username, key: this.state.key }} />
                                    </div>
                                    <div style={{ float: 'left' }}>
                                        <div alt={result.user[i].username} style={{ backgroundImage: `url(${result.user[i].pfp})` }} className="image1"></div>
                                        <p>[{result.user[i]._id}] {result.user[i].username} • Signed up {date}</p>
                                        <p>Key: {result.user[i].uploadKey} • Email: {result.user[i].email}</p>
                                        <p>Upgraded? {result.user[i].isUpgraded ? 'Yes' : 'No'} • Admin? {result.user[i].isAdmin ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </Card>
                            <br />
                        </>
                    );
                } else if (result.user[i].isTerminated) {
                    u.push(
                        <>
                            <Card style={{}}>
                                <div style={{ padding: '5px' }}>
                                    <div alt={result.user[i].username} style={{ backgroundImage: `url(${result.user[i].pfp})` }} className="image1"></div>
                                    <p>[{result.user[i]._id}] {result.user[i].username} • Signed up {date}</p>
                                    <p>Key: {result.user[i].uploadKey} • Email: {result.user[i].email}</p>

                                    <p style={{ color: 'red' }}><b>This user is permanently banned.</b></p>
                                </div>
                            </Card>
                            <br />
                        </>
                    );
                } else {
                    u.push(
                        <>
                            <Card style={{}}>
                                <div style={{ padding: '5px' }}>
                                    <div style={{ float: 'right' }}>
                                        <AdminDomainsButton p={{ key: result.user[i].uploadKey }} />
                                        <div class="divider" />
                                        <AdminUploadsButton p={{ username: result.user[i].username, key: result.user[i].uploadKey }} />
                                        <div class="divider" />
                                        <AdminTerminateButton p={{ username: result.user[i].username, key: result.user[i].uploadKey, hostKey: this.state.key }} />
                                    </div>
                                    <div style={{ float: 'left' }}>
                                        <div alt={result.user[i].username} style={{ backgroundImage: `url(${result.user[i].pfp})` }} className="image1"></div>
                                        <p>[{result.user[i]._id}] {result.user[i].username} • Signed up {date}</p>
                                        <p>Key: {result.user[i].uploadKey} • Email: {result.user[i].email}</p>
                                        <p>Upgraded? {result.user[i].isUpgraded ? 'Yes' : 'No'} • Admin? {result.user[i].isAdmin ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </Card>
                            <br />
                        </>
                    );
                }
            }

            this.setState({
                users: u
            });
        }
    }

    render() {
        return (
            <>
                <Jumbotron>
                    <div className="container">
                        <p style={{ fontSize: '40px' }}>Users</p>
                        <p><i>All users currently signed up to upld. Terminate, edit, or view user uploads.</i></p>
                    </div>
                </Jumbotron>
                <div className="container">
                    <Form>
                        <Form.Control style={{ width: '50%' }} type="text" placeholder="Search" onChange={(e) => this.search(e)} />
                    </Form>
                    <br />

                    <div className="adminUsers">
                        {this.state.users}
                    </div>

                </div>
            </>
        );
    }
}

export default AdminUsers;