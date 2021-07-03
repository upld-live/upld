import React from 'react';
import { Card, Jumbotron } from 'react-bootstrap';

import AdminWriteUpdateButton from '../comps/AdminWriteUpdateButton';

class AdminStats extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            key: '',
            latestUpdate: []
        };
    }

    async componentDidMount() {
        let res = await fetch('/api/v1/updates/latest');

        let result = await res.json();

        this.setState({
            latestUpdate: result
        });
    }

    render() {
        return (
            <>
                <Jumbotron>
                    <div className="container">
                        <p style={{ fontSize: '40px' }}>Updates</p>
                        <p><i>Write changelog updates to display on every users dashboard.</i></p>

                        <AdminWriteUpdateButton p={{ key: this.props.p.key }} />
                    </div>
                </Jumbotron>
                <div className="container">
                    <Card>
                        <Card.Header>
                            {this.state.latestUpdate.title} by {this.state.latestUpdate.uploader}
                        </Card.Header>
                        <Card.Body>
                            <b>Added</b>
                            <p>{this.state.latestUpdate.added}</p>
                            <br />
                            <b>Fixed</b>
                            <p>{this.state.latestUpdate.fixed}</p>
                            <br />
                            <b>Changed</b>
                            <p>{this.state.latestUpdate.changed}</p>
                        </Card.Body>
                    </Card>
                </div>
            </>
        );
    }
}

export default AdminStats;