import React from 'react';
import { Jumbotron, Card, Button, Modal, Alert } from 'react-bootstrap';

class AdminUploadsButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            uploads: [],
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

    async componentDidMount() {
        //fetch uploads from api
        let res = await fetch("/api/v1/user/uploads", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: this.props.p.username,
                key: this.props.p.key
            })
        });

        let result = await res.json();

        if (result) {
            var u = [];

            var i;
            for (i = 0; i < result.length; i++) {
                let url = 'http://' + result[i].domain + '/' + result[i].id + '/thumb';

                var date = new Date(result[i].dateCreated).toLocaleString('en-US', { timeZone: 'EST' });
                u.push(
                    <>
                        <Card>
                            <div style={{ padding: '5px' }}>
                                <img alt={result[i].id} style={{ float: 'right', maxWidth: 400, maxHeight: 150 }} src={url}></img>
                                <div style={{ float: 'left' }}>
                                    <p><a href={url} target={'_blank'}>{result[i].id}</a> • {result[i].originalName}</p>
                                    <p><i>{result[i].uploader}</i> • <i>{result[i].domain}</i></p>
                                    <p>Date uploaded: {date} • Views: {result[i].views}</p>
                                </div>
                            </div>
                        </Card>
                        <br />
                    </>
                );
            }

            this.setState({
                uploads: u
            });
        } else {
            console.log('error while getting uploads');
        }
    }

    render() {
        return (
            <>
                <Button variant="primary" onClick={this.handleShow}>
                    Uploads
                </Button>

                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Uploads</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant="danger">
                            Use is prohibited unless used for moderating purposes!
                        </Alert>

                        {this.state.uploads}
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

export default AdminUploadsButton;