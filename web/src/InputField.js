import React from 'react';

import Form from 'react-bootstrap/Form';

class InputField extends React.Component {
    render() {
        return (
            <Form.Group>
                <Form.Control as={this.props.as ? this.props.as : 'input'} value={this.props.value} type={this.props.type} placeholder={this.props.placeholder} onChange={(e) => this.props.onChange(e.target.value)} />
            </Form.Group>
        );
    }
}

export default InputField;