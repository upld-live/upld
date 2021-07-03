import React from 'react';
import { Button, Form, Card } from 'react-bootstrap';

import { SketchPicker } from 'react-color';

class ChangeColorDiv extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            chColor: '',
            loading: true
        };
    }

    async componentDidMount() {
        let res = await fetch('/api/v1/user/getColor', {
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
                chColor: '#' + result.color,
                loading: false
            });
        }
    }

    async changeColor() {
        let c = this.state.chColor.replace('#', '');

        let res = await fetch('/api/v1/user/changeColor', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: this.props.p.key,
                color: c
            })
        });

        let result = await res.json();

        if (result && result.success) {
            window.location.reload();
        } else {
            alert('There was an error while changing your embed color! (' + result.error + ')');
        }
    }

    handleChange(color) {
        this.setState({
            chColor: color.hex
        });
    }

    render() {
        if (this.state.loading) return null;

        return (
            <>
                <Card style={{ width: '30%', marginTop: '2%' }}>
                    <div style={{ padding: '10px' }}>
                        <Form>
                            <Form.Label>Change embed color</Form.Label>
                            <br />
                            <SketchPicker
                                color={this.state.chColor}
                                onChange={(e) => this.handleChange(e)}
                            />
                            <br />
                            <Button variant="primary" onClick={() => this.changeColor()}>
                                Submit
                            </Button>
                        </Form>
                    </div>
                </Card>
            </>
        );
    }
}

export default ChangeColorDiv;