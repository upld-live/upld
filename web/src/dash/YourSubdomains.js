import React from 'react';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import SubdomainsDeleteButton from './comps/SubdomainsDeleteButton';

class YourSubdomains extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            subdomains: [],
            username: '',
            key: ''
        };
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

        //fetch uploads from api
        let res = await fetch("/api/v1/user/subdomains", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                key: this.state.key
            })
        });

        let ress = await res.json();
        if (!ress.success) {
            return;
        }

        this.setState({
            max: ress.max
        });

        let result = ress.result;

        var u = [];

        var i;
        for (i = 0; i < result.length; i++) {
            var date = new Date(result[i].dateCreated).toLocaleString('en-US', { timeZone: 'EST' });
            u.push(
                <>
                    <Card>
                        <div style={{ padding: '5px' }}>
                            <SubdomainsDeleteButton p={{ key: this.state.key, sub: result[i].sub, host: result[i].host }} />
                            <Button style={{ float: 'right', maxWidth: 400, maxHeight: 150, marginRight: '5px' }} href={`/api/v1/user/getConfig?key=${this.state.key}&sub=${result[i].sub}&host=${result[i].host}`}>Download Config</Button>
                            <div style={{ float: 'left' }}>
                                <p><b>{(result[i].sub + '.' + result[i].host)}</b></p>
                                <p>Created by: {this.state.username}</p>
                                <p>Date created: {date}</p>
                            </div>
                        </div>
                    </Card>
                    <br />
                </>
            );
        }

        this.setState({
            subdomains: u
        });
    }

    render() {
        return (
            <>
                <Jumbotron>
                    <div className="container">
                        <p style={{ fontSize: '40px' }}>Subdomains</p>
                        <p><i>All subdomains for user {this.state.username} <b>({this.state.subdomains.length}/{this.state.max})</b></i></p>
                    </div>
                </Jumbotron>
                <div className="container">
                    {this.state.subdomains}
                </div>
            </>
        );
    }
}

export default YourSubdomains;