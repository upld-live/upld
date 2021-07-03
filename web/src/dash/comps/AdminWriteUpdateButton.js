import React from 'react';
import LoginButton from '../../LoginButton';
import InputField from '../../InputField';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

class AdminWriteUpdateButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            added: '',
            changed: '',
            fixed: '',
            buttonDisabled: false,
            show: false,
            message: '',
            disabled: false
        }
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

    resetForm() {
        this.setState((state) => {
            return {
                title: '',
                changed: '',
                fixed: '',
                added: '',
                buttonDisabled: false
            };
        });
    }

    setInputValue(property, val) {
        this.setState({
            [property]: val
        });
    }

    async doUpdate() {
        if (!this.state.title || !this.state.fixed || !this.state.added || !this.state.changed) {
            return;
        }

        this.setState({
            buttonDisabled: true
        });

        try {
            let res = await fetch('/api/v1/updates/publish', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    key: this.props.p.key,
                    title: this.state.title,
                    added: this.state.added,
                    fixed: this.state.fixed,
                    changed: this.state.changed
                })
            });

            let result = await res.json();
            if (result && result.success) {
                window.location.reload();
            } else if (result && !result.success) {
                this.resetForm();
                this.setState((state) => {
                    console.log(result.error);
                    return {
                        disabled: true,
                        message: result.error
                    };
                });
            }
        } catch (e) {
            console.log(e);
            this.resetForm();
        }
    }

    render() {
        return (
            <>
                <Button variant="primary" onClick={this.handleShow}>
                    Write Update
                </Button>

                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Write Update</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Alert variant="danger" show={this.state.disabled}>
                                {this.state.message}
                            </Alert>
                            <p><i>Publish an update to the entire platform.</i></p>
                            <InputField
                                type='text'
                                placeholder='Title'
                                value={this.state.title ? this.state.title : ''}
                                onChange={(val) => this.setInputValue('title', val)}
                            />

                            <InputField
                                type='text'
                                as='textarea'
                                placeholder='Added'
                                value={this.state.added ? this.state.added : ''}
                                onChange={(val) => this.setInputValue('added', val)}
                            />

                            <InputField
                                type='text'
                                as='textarea'
                                placeholder='Fixed'
                                value={this.state.fixed ? this.state.fixed : ''}
                                onChange={(val) => this.setInputValue('fixed', val)}
                            />

                            <InputField
                                type='text'
                                as='textarea'
                                placeholder='Changed'
                                value={this.state.changed ? this.state.changed : ''}
                                onChange={(val) => this.setInputValue('changed', val)}
                            />
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <LoginButton
                            onClick={() => this.doUpdate()}
                            disabled={this.state.buttonDisabled}
                            text='Submit'
                        />
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default AdminWriteUpdateButton;