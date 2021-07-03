import React from 'react';

import { Jumbotron, Card } from 'react-bootstrap';

class AdminStats extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stats: []
        };
    }

    async componentDidMount() {
        let res = await fetch('/api/v1/admin/stats', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: this.props.p.key
            })
        });

        let result = await res.json();

        if (!result.error) {
            let files = result.files;
            let views = result.views;
            let hosts = result.hosts;
            let subs = result.subs;
            let size = result.size;
            let users = result.users;

            let u = [];

            u.push(
                <>
                    <div className="statCardsDash">
                        <Card>
                            <Card.Header>
                                Admin Stats
                            </Card.Header>

                            <Card.Body>
                                <Card className="statCardDash">
                                    <div style={{ padding: '5px' }}>
                                        <Card.Title>
                                            <h6>Total Uploads</h6>
                                        </Card.Title>

                                        <Card.Body>
                                            <p style={{ fontSize: '20px' }}>{files}</p>
                                        </Card.Body>
                                    </div>
                                </Card>

                                <br />

                                <Card className="statCardDash">
                                    <div style={{ padding: '5px' }}>
                                        <Card.Title>
                                            <h6>Total Views</h6>
                                        </Card.Title>

                                        <Card.Body>
                                            <p style={{ fontSize: '20px' }}>{views}</p>
                                        </Card.Body>
                                    </div>
                                </Card>

                                <br />

                                <Card className="statCardDash">
                                    <div style={{ padding: '5px' }}>
                                        <Card.Title>
                                            <h6># of users</h6>
                                        </Card.Title>

                                        <Card.Body>
                                            <p style={{ fontSize: '20px' }}>{users}</p>
                                        </Card.Body>
                                    </div>
                                </Card>

                                <br />

                                <Card className="statCardDash">
                                    <div style={{ padding: '5px' }}>
                                        <Card.Title>
                                            <h6># of hosts</h6>
                                        </Card.Title>

                                        <Card.Body>
                                            <p style={{ fontSize: '20px' }}>{hosts}</p>
                                        </Card.Body>
                                    </div>
                                </Card>

                                <br />

                                <Card className="statCardDash">
                                    <div style={{ padding: '5px' }}>
                                        <Card.Title>
                                            <h6># of subdomains</h6>
                                        </Card.Title>

                                        <Card.Body>
                                            <p style={{ fontSize: '20px' }}>{subs}</p>
                                        </Card.Body>
                                    </div>
                                </Card>

                                <br />

                                <Card className="statCardDash">
                                    <div style={{ padding: '5px' }}>
                                        <Card.Title>
                                            <h6>Total size of all uploads</h6>
                                        </Card.Title>

                                        <Card.Body>
                                            <p style={{ fontSize: '20px' }}>{size}</p>
                                        </Card.Body>
                                    </div>
                                </Card>

                                <br />
                            </Card.Body>
                        </Card>
                    </div>
                </>
            );

            this.setState({
                stats: u
            });
        }
    }

    render() {
        return (
            <>
                <Jumbotron>
                    <div className="container">
                        <p style={{ fontSize: '40px' }}>Statistics</p>
                    </div>
                </Jumbotron>
                <div className="container">
                    {this.state.stats}
                </div>
            </>
        );
    }
}

export default AdminStats;