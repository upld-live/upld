import React from 'react';

import { Jumbotron } from 'react-bootstrap';

class AdminReports extends React.Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {

    }

    render() {
        return (
            <>
                <Jumbotron>
                    <div className="container">
                        <h1>Recent Reports</h1>
                    </div>
                </Jumbotron>
            </>
        );
    }

}

export default AdminReports;