import React from 'react';

import {
	Card,
} from 'react-bootstrap';

class AuditView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			audits: [],
			loading: true
		};
	}

	async componentDidMount() {
		let res = await fetch('/api/v1/user/recentAudits', {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				key: this.props.p.key,
			}),
		});

		let result = await res.json();
		if (result.error) {
			alert(`Error: ${result.err}`);
			window.location.reload();
		}

		let b = [];
		result.forEach(audit => {
			b.push(
				<Card className="auditCard">
					<div style={{ padding: 10 }}>
						<p style={{ fontSize: '125%' }}><i>[{audit.date === undefined ? 'No date' : new Date(audit.date).toLocaleString('en-US', { timeZone: 'EST' })}]</i> {audit.aString}</p>
						<p><b>Description:</b> <i>{audit.description}</i></p>
						<p><b>IP:</b> <i>{audit.ip}</i></p>
					</div>
				</Card>
			);
		});

		this.setState({
			audits: b,
			loading: false,
		});
	}

	render() {
		if (this.state.loading)
			return null;

		return (
			<Card className="audits">
				<div style={{ padding: 15, height: '100%' }}>
					<Card.Title>
						Audit Log
					</Card.Title>

					<Card.Body>
						{this.state.audits}
					</Card.Body>
				</div>
			</Card>
		);
	}
}

export default AuditView;
