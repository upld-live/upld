import React from 'react';

import Button from 'react-bootstrap/Button';

class LoginButton extends React.Component {
    render() {
        return (
            <Button variant="primary" disabled={this.props.disabled} onClick={this.props.onClick}>
                {this.props.text}
            </Button>
        );
    }
}

export default LoginButton;