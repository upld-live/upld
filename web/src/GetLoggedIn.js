import React from 'react';
import { observer } from 'mobx-react';
import { Redirect } from 'react-router';

class GetLoggedIn extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            success: false,
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
            success: result.success,
            loading: false
        });
    }

    render() {
        if (this.state.loading) return null;

        if (this.state.success) {
            return (<></>);
        }
        return (<Redirect to="/" />);
    }
}

export default observer(GetLoggedIn);