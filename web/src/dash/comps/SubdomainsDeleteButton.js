import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { NotificationManager } from 'react-notifications';

class SubdomainsDeleteButton extends React.Component {
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

    async deleteSub() {
        let res = await fetch('/api/v1/deleteSubdomain', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: this.props.p.key,
                sub: this.props.p.sub,
                host: this.props.p.host
            })
        });

        let result = await res.json();

        if (result && result.success) {
            window.location.reload();
        }
    }

    render() {
        return (
            <>
                <Button variant="danger" onClick={this.handleShow} style={{ float: 'right', maxWidth: 400, maxHeight: 150 }}>
                    Delete
                </Button>

                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete {this.props.p.sub}.{this.props.p.host}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p style={{ color: 'red' }}><b>WARNING: This deletes everything uploaded to this domain!</b></p>
                        <p>Are you sure you want to delete {this.props.p.sub}.{this.props.p.host}?</p>
                        <br />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={() => this.deleteSub()}>
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

export default SubdomainsDeleteButton;