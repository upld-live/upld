import React from 'react';
import LoginButton from '../LoginButton';
import InputField from '../InputField';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';


class CreateSubdomain extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            host: 'upld.live',
            subdomain: '',
            key: '',
            variant: 'success',
            buttonDisabled: false,
            message: '',
            disabled: false,
            hostOptions: []
        }
    }

    async componentDidMount() {
        let res = await fetch('/api/v1/user/loggedIn', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        let result = await res.json();

        this.setState({
            key: result.key
        });

        //get host(s)
        let hostRes = await fetch('/api/v1/hosts', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        let resu = await hostRes.json();

        var ho = [];
        var i;
        for (var i = 0; i < resu.length; i++) {
            ho.push(<option value={resu[i].name}>{resu[i].name}</option>);
        }

        this.setState({
            hostOptions: ho
        });
    }

    setInputValue(property, val) {
        this.setState({
            [property]: val
        });
    }

    async doCreateSubdomain() {
        if (!this.state.subdomain) {
            return;
        }

        this.setState({
            buttonDisabled: true
        });

        try {
            console.log(this.state.subdomain);
            console.log(this.state.host);
            console.log(this.state.key);

            let res = await fetch('/api/v1/createSubdomain', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sub: this.state.subdomain,
                    host: this.state.host,
                    key: this.state.key
                })
            });

            let result = await res.json();
            if (result && result.success) {
                this.setState((state) => {
                    return {
                        disabled: true,
                        variant: 'success',
                        message: 'Successfully created domain ' + this.state.subdomain + '.' + this.state.host + '! Please allow up to 2 minutes for the domain to fully propogate.',
                        buttonDisabled: false
                    };
                });
            } else if (result && !result.success) {
                this.setState((state) => {
                    console.log(result.error);
                    return {
                        disabled: true,
                        variant: 'danger',
                        message: result.error,
                        buttonDisabled: false
                    };
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        return (
            <>
                <div style={{ padding: '40px', width: '35%' }}>
                    <Form>
                        <Alert variant={this.state.variant} show={this.state.disabled}>
                            {this.state.message}
                        </Alert>

                        <Form.Label>Create the domain you would like using the form below</Form.Label>

                        <Form.Control as="select" onChange={(val) => this.setInputValue('host', val.target.value)}>
                            {this.state.hostOptions}
                        </Form.Control>

                        <br />

                        <InputField
                            type='text'
                            placeholder='Subdomain'
                            value={this.state.subdomain ? this.state.subdomain : ''}
                            onChange={(val) => this.setInputValue('subdomain', val)}
                        />

                        <LoginButton
                            onClick={() => this.doCreateSubdomain()}
                            disabled={this.state.buttonDisabled}
                            text='Create'
                        />
                    </Form>
                </div>
            </>
        );
    }
}

export default CreateSubdomain;