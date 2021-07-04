import React from 'react';
import LoginButton from './LoginButton';
import InputField from './InputField';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            confirmPassword: '',
            key: '',
            email: '',
            buttonDisabled: false,
            show: false,
            message: '',
            enabled: false
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
                username: '',
                password: '',
                confirmPassword: '',
                key: '',
                email: '',
                buttonDisabled: false
            };
        });
    }

    setInputValue(property, val) {
        this.setState({
            [property]: val
        });
    }

    async doSignup() {
        if (!this.state.username || !this.state.password || !this.state.key || !this.state.email) {
            return;
        }

        if (this.state.password !== this.state.confirmPassword) {
            this.setState({
                enabled: true,
                message: 'Passwords do not match!',
            });
            return;
        }

        this.setState({
            buttonDisabled: true
        });

        try {
            let res = await fetch('/api/v1/user/create', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password,
                    key: this.state.key,
                    email: this.state.email
                })
            });

            let result = await res.json();
            if (result && result.success) {
                window.location.reload();
            } else if (result && !result.success) {
                this.setState((state) => {
                    console.log(result.error);
                    return {
                        enabled: true,
                        message: result.error
                    };
                });
            } else {
                this.setState((state) => {
                    return {
                        enabled: true,
                        message: 'An error has occured, please try again.'
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
                    Signup
                </Button>

                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Signup</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Alert variant="danger" show={this.state.enabled}>
                                {this.state.message}
                            </Alert>
                            <p><b style={{ color: 'red' }}>WARNING: No matter what, do NOT share your signup key/upload key with anyone. This could potentially expose your uploads and more!</b></p>
                            <p><i>You can request a signup key from me on discord. (Runabox#0001)</i></p>
                            <InputField
                                type='text'
                                placeholder='Username'
                                value={this.state.username ? this.state.username : ''}
                                onChange={(val) => this.setInputValue('username', val)}
                            />

                            <InputField
                                type='password'
                                placeholder='Password'
                                value={this.state.password ? this.state.password : ''}
                                onChange={(val) => this.setInputValue('password', val)}
                            />

                            <InputField
                                type='password'
                                placeholder='Confirm Password'
                                value={this.state.confirmPassword ? this.state.confirmPassword : ''}
                                onChange={(val) => this.setInputValue('confirmPassword', val)}
                            />

                            <InputField
                                type='email'
                                placeholder='Email'
                                value={this.state.email ? this.state.email : ''}
                                onChange={(val) => this.setInputValue('email', val)}
                            />

                            <InputField
                                type='text'
                                placeholder='Signup Key'
                                value={this.state.key ? this.state.key : ''}
                                onChange={(val) => this.setInputValue('key', val)}
                            />
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <LoginButton
                            onClick={() => this.doSignup()}
                            disabled={this.state.buttonDisabled}
                            text='Submit'
                        />
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default LoginForm;