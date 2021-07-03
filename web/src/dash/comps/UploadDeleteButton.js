import React from 'react';
import { Button } from 'react-bootstrap';
import { NotificationManager } from 'react-notifications';

class UploadDeleteButton extends React.Component {
    constructor(props) {
        super(props);
    }

    async deleteUpload() {
        let res = await fetch(this.props.p.deletionURL);

        let result = await res.json();

        if (result && result.success) {
            window.location.reload();
        } else {
            alert('Error while deleting upload!');
        }
    }

    render() {
        return (
            <>
                <Button variant="danger" onClick={() => this.deleteUpload()}>
                    Delete Upload
                </Button>
            </>
        );
    }
}

export default UploadDeleteButton;