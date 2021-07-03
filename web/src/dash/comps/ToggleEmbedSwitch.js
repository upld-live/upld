import React from 'react';
import { Button, Form, Card } from 'react-bootstrap';

class ToggleEmbedSwitch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isEmbed: false
        };
    }

    async componentDidMount() {
        let res = await fetch('/api/v1/user/isEmbed', {
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

        if (result && result.success) {
            this.setState({
                isEmbed: result.isEmbed
            });
        }
    }

    async toggleEmbed() {
        let res = await fetch('/api/v1/user/toggleEmbed', {
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

        if (result && result.success) {
            this.setState({
                isEmbed: result.isEmbed
            });
        }
    }

    render() {
        return (
            <>
                <Card style={{ width: '30%', marginTop: '2%' }}>
                    <div style={{ padding: '10px' }}>
                        <Form>
                            <Form.Label>Currently embedding images: <b>{this.state.isEmbed ? 'True' : 'False'}</b></Form.Label>
                            <br />
                            <Button variant="primary" onClick={() => this.toggleEmbed()}>
                                Toggle
                            </Button>
                        </Form>
                    </div>
                </Card>
            </>
        );
    }
}

export default ToggleEmbedSwitch;