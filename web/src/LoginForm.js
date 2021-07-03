import React from 'react';
import LoginButton from './LoginButton';
import InputField from './InputField';
import UserStore from './UserStore';
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
                username: '',
                password: '',
                buttonDisabled: false
            };
        });
    }

    setInputValue(property, val) {
        this.setState({
            [property]: val
        });
    }

    async doLogin() {
        if (!this.state.username || !this.state.password) {
            return;
        }

        this.setState({
            buttonDisabled: true
        });

        try {
            let res = await fetch('/api/v1/user/login', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password
                })
            });

            let result = await res.json();
            if (result && result.success) {
                UserStore.username = result.username;
                UserStore.isLoggedIn = true;
                UserStore.key = result.key;
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
                    Login
                </Button>

                <Modal show={this.state.show} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Login</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Alert variant="danger" show={this.state.disabled}>
                                {this.state.message}
                            </Alert>
                            <Form.Label>Enter your username and password below</Form.Label>
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
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <LoginButton
                            onClick={() => this.doLogin()}
                            disabled={this.state.buttonDisabled}
                            text='Login'
                        />
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default LoginForm;