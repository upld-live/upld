import React from 'react';

import { Card, Jumbotron } from 'react-bootstrap';

class UploadPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            upgraded: false,
            loaded: false,
            files: 0,
            views: 0,
            lastUpload: '',
            mostViewedUpload: []
        };

        this.rateLimitingSpecs = this.rateLimitingSpecs.bind(this);
    }

    async componentDidMount() {
        //get stats
        let r1 = await fetch('/api/v1/user/stats', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: this.props.p.key
            })
        });

        let rs1 = await r1.json();

        if (rs1 && rs1.success) {
            var date2;
            if (rs1.lastUpload) {
                date2 = new Date(rs1.lastUpload).toLocaleString('en-US', { timeZone: 'EST' });
            } else {
                date2 = 'No uploads';
            }

            this.setState({
                files: rs1.files ? rs1.files : 0,
                views: rs1.views ? rs1.views : 0,
                lastUpload: date2
            });
        }

        let r2 = await fetch('/api/v1/user/vUpload', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: this.props.p.key
            })
        });

        let rs2 = await r2.json();

        let u = [];

        if (rs2.noUpload) {
            u.push(
                <div style={{ padding: '5px' }}>
                    <div style={{ float: 'left' }}>
                        <p style={{ color: 'red' }}><b>No upload to show.</b></p>
                    </div>
                </div>
            );
        } else {
            let url = 'https://' + rs2.domain + '/' + rs2.id + '/thumb';
            var date = new Date(rs2.dateCreated).toLocaleString('en-US', { timeZone: 'EST' });

            u.push(
                <div style={{ padding: '5px' }}>
                    <img alt={rs2.id} style={{ float: 'right', maxWidth: 400, maxHeight: 150 }} src={url}></img>
                    <div style={{ float: 'left' }}>
                        <p><a href={url} target={'_blank'}>{rs2.id}</a> • {rs2.originalName}</p>
                        <p><i>{rs2.uploader}</i> • <i>{rs2.domain}</i></p>
                        <p>Date uploaded: {date} • Views: {rs2.views}</p>
                    </div>
                </div>
            );
        }

        this.setState({
            mostViewedUpload: u
        });

        let res = await fetch('/api/v1/user/upgraded', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: '' + this.props.p.username
            })
        });

        let result = await res.json();

        if (result && result.success) {
            if (result.isUpgraded) {
                this.setState({
                    upgraded: true,
                    loaded: true
                });
            } else {
                this.setState({
                    loaded: true
                });
            }
        } else {
            this.setState({
                loaded: true
            });
        }
    }

    rateLimitingSpecs() {
        if (this.state.upgraded) {
            return (
                <>
                    <i>You can upload 35 files in 2 minutes without getting rate limited. Thank you for upgrading!</i>
                </>
            );
        } else {
            return (<></>);
        }
    }

    render() {
        if (!this.state.loaded) return null;

        return (
            <>
                <Jumbotron>
                    <div className="container">
                        <p style={{ fontSize: '40px' }}>Upload</p>
                        <this.rateLimitingSpecs />
                    </div>
                </Jumbotron>

                <div className="container">
                    <div className="container">
                        To upload to upld, please download the ShareX config (.sxcu file) for your specifed domain.

                        <br />
                        <br />

                        Download your configs in <a href="/dashboard/subdomains"><i>Your subdomains</i></a> or create a new one in <a href="/dashboard/createSubdomain"><i>Create Subdomain</i></a>.

                        <br />
                        <br />

                        <div className="statCardsDash">
                            <Card>
                                <Card.Header>
                                    Your upload stats
                                </Card.Header>

                                <Card.Body>
                                    <Card className="statCardDash">
                                        <div style={{ padding: '5px' }}>
                                            <Card.Title>
                                                <h6>Files</h6>
                                            </Card.Title>

                                            <Card.Body>
                                                <p style={{ fontSize: '20px' }}>{this.state.files}</p>
                                            </Card.Body>
                                        </div>
                                    </Card>

                                    <br />

                                    <Card className="statCardDash">
                                        <div style={{ padding: '5px' }}>
                                            <Card.Title>
                                                <h6>Views</h6>
                                            </Card.Title>

                                            <Card.Body>
                                                <p style={{ fontSize: '20px' }}>{this.state.views}</p>
                                            </Card.Body>
                                        </div>
                                    </Card>

                                    <br />

                                    <Card className="statCardDash">
                                        <div style={{ padding: '5px' }}>
                                            <Card.Title>
                                                <h6>Last Upload</h6>
                                            </Card.Title>

                                            <Card.Body>
                                                <p style={{ fontSize: '20px' }}>{this.state.lastUpload}</p>
                                            </Card.Body>
                                        </div>
                                    </Card>

                                    <br />

                                    <Card className="statCardDash">
                                        <div style={{ padding: '5px' }}>
                                            <Card.Title>
                                                <h6>Most viewed upload</h6>
                                            </Card.Title>

                                            <Card.Body>
                                                <Card>{this.state.mostViewedUpload}</Card>
                                            </Card.Body>
                                        </div>
                                    </Card>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default UploadPage;