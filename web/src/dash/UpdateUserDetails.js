import React from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';

import ToggleEmbedSwitch from './comps/ToggleEmbedSwitch';
import ChangeColorDiv from './comps/ChangeColorDiv';

import AuditView from './AuditView';

class UpdateUserDetails extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            key: '',
            pfp: '',
            file: File,
            show: false,
            message: '',
            loading: true
        };
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
            key: result.key,
            pfp: result.pfp,
            loading: false
        });
    }

    handleFileInput = (e) => {
        // handle validations
        this.setState({
            file: e.target.files[0]
        });
    }

    async doUpload() {
        let s = this.state.file.name.split('.');
        let ext = s[s.length - 1];

        let formData = new FormData();
        formData.append('image', this.state.file);

        let res = await fetch('/api/v1/update/pfp?key=' + this.state.key, {
            method: 'post',
            body: formData
        });

        let result = await res.json();

        if (result && result.success) {
            window.location.reload();

            this.setState({
                show: true,
                message: 'Successfully updated profile picture!'
            });
        }
    }

    render() {
        if (this.state.loading) return null;

        return (
            <>
                <div style={{ padding: '20px', clear: 'both', display: 'flex', flexDirection: 'row', }}>
                    <div style={{ width: '70%' }}>
                        <div style={{ width: '100%' }}>
                            <Card style={{ width: '30%', marginTop: 15 }}>
                                <div style={{ padding: '10px' }}>
                                    Current Profile Picture <br />
                                    <img src={this.state.pfp} alt={'Current pfp'} style={{ maxWidth: '100px', maxHeight: '100px' }} />

                                    <Alert variant="success" show={this.state.show}>
                                        {this.state.message}
                                    </Alert>

                                    <Form style={{ marginTop: '10px' }} action={"/api/v1/update/pfp?key=" + this.state.key} method="POST" >
                                        <Form.Group>
                                            <Form.File type="file" name="image" id="image" label={<i>Update Profile Picture</i>} onChange={this.handleFileInput} />
                                        </Form.Group>

                                        <Button variant="primary" onClick={() => this.doUpload()}>
                                            Submit
                                        </Button>
                                    </Form>
                                </div>
                            </Card>
                            <ToggleEmbedSwitch p={{ key: this.state.key }} />
                        </div>
                        <div style={{ width: '100%' }}>
                            <ChangeColorDiv p={{ key: this.state.key }} />
                        </div>
                    </div>

                    <AuditView p={{ key: this.state.key }} />
                </div>
            </>
        );
    }
}

export default UpdateUserDetails;