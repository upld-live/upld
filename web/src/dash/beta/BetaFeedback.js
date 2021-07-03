import React from 'react';

import { Form, Button } from 'react-bootstrap';

class BetaFeedback extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            feedbackBody: ''
        };
    }

    async submitFeedback() {
        let res = await fetch('/api/v1/createFeedback', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                key: this.props.p.key,
                feedbackBody: this.state.feedbackBody
            })
        });

        let result = await res.json();

        if (result && result.success) {
            alert('Report successfully feedback. Thank you!');
            window.location.reload();
        } else {
            alert('Error white submitting feedback: ' + result.error);
        }
    }

    onChange(e) {
        this.setState({
            feedbackBody: e.target.value
        });
    }

    render() {
        return (
            <>
                <div style={{ padding: '20px', width: '50%' }}>
                    <Form>
                        <Form.Label>Submit feedback</Form.Label>
                        <Form.Control as="textarea" type="text" placeholder="Feedback Body" onChange={(e) => this.onChange(e)} />
                        <br />
                        <Button variant="primary" onClick={() => this.submitFeedback()}>
                            Submit
                        </Button>
                    </Form>
                </div>
            </>
        );
    }

}

export default BetaFeedback;