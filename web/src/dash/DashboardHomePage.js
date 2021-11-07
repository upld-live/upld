import React from 'react';
import Jumbotron from 'react-bootstrap/esm/Jumbotron';
import Card from 'react-bootstrap/esm/Card';

class DashboardHomePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            latestUpdate: []
        };
    }

    async componentDidMount() {
        let res = await fetch('/api/v1/updates/latest');

        let result = await res.json();

        if (result === null) {
            this.setState({
                latestUpdate: {
                    title: "No Updates",
                    added: "",
                    fixed: "",
                    changed: "",
                    date: undefined,
                    uploader: "N/A",
                }
            });
            return;
        }

        let added = <p>{result.added.replace("\n", {"\n"})</p>;

        let latestUpdate = {
            title: result.title,
            added,
            fixed,
            changed,
            date: result.date,
            uploader: result.uploader,
        };

        this.setState({
            latestUpdate,
        });
    }

    render() {
        return (
            <>
                <Jumbotron>
                    <div className="container">
                        <h1>Welcome, {this.props.username}!</h1>
                        <br />
                        <i>Welcome to upld's (WIP) dashboard! For any questions, please contact Runabox#0001 on discord.</i>
                    </div>
                </Jumbotron>
                <div className="container">
                    <Card>
                        <Card.Header>
                            <b>Latest Update: </b> <div className="divider" /> {this.state.latestUpdate.title} by {this.state.latestUpdate.uploader}
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

export default DashboardHomePage;