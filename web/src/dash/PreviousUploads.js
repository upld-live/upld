import React from 'react';
import {
    Jumbotron,
    Card,
} from 'react-bootstrap';

import UploadDeleteButton from './comps/UploadDeleteButton';

class PreviousUploads extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            uploads: [],
            username: '',
            key: ''
        };
    }

    async componentDidMount() {
        //get username and key from api
        let r1 = await fetch('/api/v1/user/loggedIn', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        let rs1 = await r1.json();

        this.setState({
            username: rs1.username,
            key: rs1.key
        });

        //fetch uploads from api
        let res = await fetch("/api/v1/user/uploads", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username,
                key: this.state.key
            })
        });

        let result = await res.json();

        if (result) {
            var u = [];

            var i;
            for (i = 0; i < result.length; i++) {
                let url = 'http://' + result[i].domain + '/' + result[i].id + '/thumb';
                let deletionURL = 'https://' + result[i].domain + '/d?image=' + result[i].id + '&deletionId=' + result[i].deletionId + '&type=' + result[i].extension.replace('.', '');

                var date = new Date(result[i].dateCreated).toLocaleString('en-US', { timeZone: 'EST' });
                u.push(
                    <i>
                        <Card className="uploadCard" style={{ width: '20wh', height: 400, marginBottom: 30, display: 'flex', justifyContent: 'center' }}>
                            <div style={{ padding: '5px' }}>
                                <img alt={result[i].id} style={{ float: 'right', maxWidth: '20wh', maxHeight: 150 }} src={url}></img>
                                <div style={{ marginTop: 150 }}>
                                    <p><a href={url} target={'_blank'}>{result[i].id}</a> • {result[i].originalName} {/*result[i].isNSFW ? <p><b style={{ color: 'red' }}>NSFW</b></p> : ''*/}</p>
                                    <p><i>{result[i].uploader}</i> • <i>{result[i].domain}</i></p>
                                    <p>Date uploaded: {date} • Views: {result[i].views}</p>
                                    <UploadDeleteButton p={{ deletionURL }} />
                                </div>
                            </div>
                        </Card>
                    </i>
                );
            }

            this.setState({
                uploads: u
            });
        } else {
            alert('Error while getting uploads! ' + result.error);
        }
    }

    render() {
        return (
            <>
                <Jumbotron>
                    <div className="container">
                        <p style={{ fontSize: '40px' }}>Recent Uploads</p>
                        <p><i>All uploads for user {this.state.username}</i></p>
                    </div>
                </Jumbotron>
                <div className="container">
                    <div className="uploadGrid">
                        {this.state.uploads}
                    </div>
                </div>
            </>
        );
    }
}

export default PreviousUploads;