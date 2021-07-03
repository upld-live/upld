/*

	MODULE NAME - AdminModerationImage

	MODULE DESCRIPTION:
	Sub component of AdminModeration, this is where the actual image, button,
	and user card goes.

*/

import React from 'react';

import {
	Card,
} from 'react-bootstrap';

import AdminDomainsButton from './AdminDomainsButton';
import AdminUploadsButton from './AdminUploadsButton';
import AdminTerminateButton from './AdminTerminateButton';

class AdminModerationImage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			userCard: [],
		};
	}

	async componentDidMount() {
		let res = await fetch('/api/v1/admin/user', {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				key: this.props.p.key,
				userKey: this.props.p.userKey,
			}),
		});

		let result = await res.json();

		var date = new Date(result.dateCreated).toLocaleString('en-US', { timeZone: 'EST' });

		let b = [];

		b.push(
			<Card>
				<div style={{ padding: '5px' }}>
					<div style={{ float: 'right' }}>
						<AdminDomainsButton p={{ key: result.uploadKey }} />
						<div class="divider" />
						<AdminUploadsButton p={{ username: result.username, key: result.uploadKey }} />
						<div class="divider" />
						<AdminTerminateButton p={{ username: result.username, key: result.uploadKey, hostKey: this.props.p.key }} />
					</div>
					<div style={{ float: 'left' }}>
						<div alt={result.username} style={{ backgroundImage: `url(${result.pfp})` }} className="image1"></div>
						<p>[{result._id}] {result.username} • Signed up {date}</p>
						<p>Key: {result.uploadKey} • Email: {result.email}</p>
						<p>Upgraded? {result.isUpgraded ? 'Yes' : 'No'} • Admin? {result.isAdmin ? 'Yes' : 'No'}</p>
					</div>
				</div>
			</Card>
		);

		this.setState({
			loading: false,
			userCard: b,
		});
	}

	render() {
		if (this.state.loading)
			return null;

		return (
			<div ref={this.props.p.ref}>
				<div className="moderationCardContainer">
					<Card className="moderationCard">
						<img src={`https://${this.props.p.domain}/${this.props.p.id}/thumb`} />
					</Card>
				</div>

				<br />
				<br />

				{this.state.userCard}
			</div>
		);
	}
}

export default AdminModerationImage;