import React from 'react';

import { Form, Button } from 'react-bootstrap';

class BetaReport extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            reportBody: ''
        };
    }

    async submitReport() {
        let res = await fetch('/api/v1/createReport', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                key: this.props.p.key,
                reportBody: this.state.reportBody
            })
        });

        let result = await res.json();

        if (result && result.success) {
            alert('Report successfully submitted. Thank you!');
            window.location.reload();
        } else {
            alert('Error white submitting report: ' + result.error);
        }
    }

    onChange(e) {
        this.setState({
            reportBody: e.target.value
        });
    }

    render() {
        return (
            <>
                <div style={{ padding: '20px', width: '50%' }}>
                    <Form>
                        <Form.Label>Submit bug report</Form.Label>
                        <Form.Control as="textarea" type="text" placeholder="Report Body" onChange={(e) => this.onChange(e)} />
                        <br />
                        <Button variant="primary" onClick={() => this.submitReport()}>
                            Submit
                        </Button>
                    </Form>
                </div>
            </>
        );
    }

}

export default BetaReport;