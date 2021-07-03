import React from 'react';
import { Card, Button, Modal, Alert } from 'react-bootstrap';

class AdminDomainsButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            domains: [],
            show: false,
            max: 0
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

    async componentDidMount() {
        //fetch uploads from api
        let res = await fetch("/api/v1/user/subdomains", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                key: this.props.p.key
            })
        });

        let ress = await res.json();
        if (!ress.success) {
            return;
        }

        this.setState({
            max: ress.max
        });

        let result = ress.result;

        var u = [];

        var i;
        for (i = 0; i < result.length; i++) {
            var date = new Date(result[i].dateCreated).toLocaleString('en-US', { timeZone: 'EST' });
            u.push(
                <>
                    <Card>
                        <div style={{ padding: '5px' }}>
                            <div style={{ float: 'left' }}>
                                <p>{(result[i].sub + '.' + result[i].host)} • [{result[i]._id}]</p>
                                <p>{result[i].owner} • {date}</p>
                            </div>
                        </div>
                    </Card>
                    <br />
                </>
            );
        }

        this.setState({
            domains: u
        });
    }

    render() {
        return (
            <>
                <Button variant="primary" onClick={this.handleShow}>
                    Domains
                </Button>

                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Domains ({this.state.domains.length}/{this.state.max})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.domains}
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

export default AdminDomainsButton;