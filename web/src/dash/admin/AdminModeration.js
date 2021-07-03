/*

	MODULE NAME - AdminModeration

	MODULE DESCRIPTION:
	Admin Dashboard page used to manually moderate images flagged as NSFW
	for TOS-breaking content.

*/

import React from 'react';

import AdminModerationImage from '../comps/AdminModerationImage';

import {
	Button,
} from 'react-bootstrap';

class AdminModeration extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			currentImage: [],
			currentImageID: '',
			childRef: [],
		};

		this.moderateNext = this.moderateNext.bind(this);
		this.getImage = this.getImage.bind(this);
	}

	async componentDidMount() {
		// Fetch image to moderate from api
		await this.getImage();

		this.setState({
			loading: false,
		});
	}

	async getImage() {
		let res = await fetch('/api/v1/admin/moderate/image', {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				key: this.props.p.key,
			}),
		});

		let image = await res.json();
		if (image.error) {
			alert(`Error: ${image.error}`);
			window.location.reload();
		}

		let b = [];

		let mCRef = React.createRef();

		if (image.noUpload) {
			b.push(<b style={{ color: 'red' }}>No images to moderate!</b>)
		} else {
			b.push(
				<AdminModerationImage p={{ key: this.props.p.key, userKey: image.user.key, id: image.id, domain: image.domain, ref: mCRef }} />
			);
		}

		this.setState({
			currentImage: b,
			currentImageID: image.id,
			childRef: mCRef,
			loading: false,
		});
	}

	async moderateNext(e) {
		e.preventDefault();

		let res = await fetch('/api/v1/admin/moderate/imageSafe', {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				key: this.props.p.key,
				id: this.state.currentImageID,
			}),
		});

		let result = await res.json();

		if (result.error) {
			alert(`Error: ${result.error}`);
			return window.location.reload();
		}

		let ref = this.state.childRef;
		if (!(ref.current === null || ref.current === undefined)) {
			ref.current.removeChild(ref.current.children[0]);
		}

		this.setState({
			currentImage: [],
			currentImageID: '',
			childRef: [],
			loading: true,
		});

		await this.getImage();
	}

	render() {
		if (this.state.loading)
			return null;

		return (
			<div className="adminModeration">
				<div className="moderationChild">
					{this.state.currentImage}

					<br />

					<Button variant="success" onClick={(e) => this.moderateNext(e)}>
						Next Upload
					</Button>
				</div>
			</div>
		);
	}
}

export default AdminModeration;