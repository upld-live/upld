import React from 'react';
import { Card, Button, Modal, Alert } from 'react-bootstrap';

class AdminDomainsButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
    }

    handleClose = () => {
        this.setState((state) => {
            return {
                show: false
            };
        });
    }

    handleShow = () => {
        this.setState((state) => {
            return {
                show: true
            };
        });
    }

    async terminate() {
        /*
            WARNING: This function permanently deletes the user and all of its data!!!
        */

        let res = await fetch('/api/v1/admin/terminate', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.props.p.username,
                key: this.props.p.key,
                adminKey: this.props.p.hostKey
            })
        });

        let result = await res.json();

        if (result && result.success) {
            alert(`User ${this.props.p.username} has successfully been terminated.`);
            window.location.reload();
        } else {
            alert('Error while terminating user!');
            window.location.reload();
        }
    }

    render() {
        return (
            <>
                <Button variant="danger" onClick={this.handleShow}>
                    Terminate
                </Button>

                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Terminate user {this.props.p.username}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p style={{ color: 'red' }}><b>WARNING: This action is irreversible!</b></p>
                        <p>Are you sure you want to terminate {this.props.p.username}?</p>
                        <br />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={() => this.terminate()}>
                            Yes
                        </Button>
                        <Button variant="primary" onClick={this.handleClose}>
                            No
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default AdminDomainsButton;