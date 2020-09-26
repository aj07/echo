import React, { Component, useState, useContext, useEffect } from 'react';
import { MDBContainer, MDBTabPane, MDBTabContent, MDBNav, MDBNavItem, MDBNavLink, MDBIcon, MDBRow, MDBCol,MDBCard, MDBCardBody, MDBInput, MDBBtn } from 'mdbreact';
import Layout from '../../Components/UserPages/UserLayout';
import { useRouter } from 'next/router'
import axios from 'axios';

import { NearContext } from '../../context/NearContext';
import Big from 'big.js';

const { SkynetClient } = require('@nebulous/skynet');


// create a client
const client = new SkynetClient();


async function uploadExample(file) {
	try {
		const { skylink } = await client.uploadFile(file);
		console.log(`Upload successful, skylink: ${skylink}`);
		return skylink;
	} catch (error) {
		console.log(error)
		return "";
	}
}


const BOATLOAD_OF_GAS = Big(3)
	.times(10 ** 13)
	.toFixed();

class Create extends Component  {
	//get current near data and access to my echo contract
	static contextType = NearContext
	
	state = {
		success: false,
		url: '',
		file: '',
		name: '',
		cost: '',
		description: '',
		contributor_info: '',
		image_url: '',
		fileStream: '',
	}

	componentDidMount() {
		const nearContext = this.NearContext;
		console.log(nearContext);
		// const contract = this.nearContext.contract[0];	
	}
	


		handleChange = (ev) => {
		console.log(ev);
		this.setState({ success: false, url: '' });
	};

	
	handleChooseFile = (ev) => {
		hiddenFileInput.current.click();
	}


	handleOnChange = (e) => {
		this.setState({ [e.target.id]: e.target.value  })
	};

	handleOnSubmit = (e) => {
		e.preventDefault();
		
		console.log('submitting things');

		this.contract
			.createTier(
				{
					name: this.state.name,
					cost: this.state.cost,
					description: this.state.description,
					contributor_info: [this.state.contributor_info],
					tier_image: this.state.image_url,
				},
				BOATLOAD_OF_GAS
				// Big(donation.value || '0')
				// 	.times(10 ** 24)
				// 	.toFixed()
			)
			.then(() => {
				this.contract
					.getTiersList({
						owner: nearContext.user.accountId,
					})
					.then((tiers) => {
						console.log(tiers);
					});
			});
			

	};


	


	handleUpload = async (ev) => {
		//
		//
		//
		// somehow set the response of skynet to:  this.state.image_url
		// 
		// then trigger the submit function?
		//
		//

		let file = this.uploadInput.files[0];

		let response = uploadExample(file)
		//let response = await client.uploadFile(file);
		console.log(`Upload successful, skylink 2: ${response}`);


		// Split the filename to get the name and type
		let fileParts = this.uploadInput.files[0].name.split('.');
		let fileName = fileParts[0];
		let fileType = fileParts[1];
		console.log('Preparing the upload');

		this.setState({ image_url: response });
		//this.handleOnSubmit()
		axios
			.post('http://localhost:3000/', {
				fileName: fileName,
				fileType: fileType,
			})
			.then((response) => {
				var returnData = response.data.data.returnData;
				var signedRequest = returnData.signedRequest;
				var url = returnData.url;
				this.setState({ url: url });
				console.log('Recieved a signed request ' + signedRequest);

				// Put the fileType in the headers for the upload
				var options = {
					headers: {
						'Content-Type': fileType,
					},
				};
				axios
					.put(signedRequest, file, options)
					.then((result) => {
						console.log('Response from s3');
						this.setState({ success: true });
					})
					.catch((error) => {
						alert('ERROR ' + JSON.stringify(error));
					});
			})
			.catch((error) => {
				alert(JSON.stringify(error));
			});
	};

	render(){
	return (
		<Layout>
			<MDBContainer>
				<MDBRow>
					<MDBCol md="8" className="mx-auto">
						<MDBCard>
							<div className="header pt-3 k-green-bg">
								<MDBRow className="d-flex justify-content-start">
									<h3 className="text-white mt-3 mb-4 pb-1 mx-5 mx-auto">Create Tier</h3>
								</MDBRow>
							</div>
							<MDBCardBody className="mx-4 mt-2">
								<form >
									<label className="mt-3">Tier Title</label>
									<input
										label="Tier Title"
										id="name"
										group
										className="form-control"
										type="text"
										value={this.state.name}
										onChange={this.handleOnChange}
										required
									/>
									<label className="mt-3">Tier Image Url</label>
									{/* <input
										label="Tier Title"
										id="image_url"
										group
										className="form-control"
										type="text"
										value={this.image_url}
										onChange={handleOnChange}
										required
									/> */}
									<div className="App">
										<input
											onChange={this.handleChange}
											ref={(ref) => {
												this.uploadInput = ref;
											}}
											type="file"
										/>
										<br />
										{/* <button className="mx-auto" onClick={this.handleUpload}>
											UPLOAD
										</button> */}
									</div>
									<center>
										{/* {this.state.success ? <Success_message /> : null} */}
										{/* <MDBBtn className="btn btn-outline-teal mt-4 mx-auto" onClick={this.handleUpload}>
											Send to SkyNet
											<MDBIcon far icon="paper-plane" className="ml-2" />
										</MDBBtn> */}
									</center>
									<label className="mt-3">Set Price</label>
									<input
										id="cost"
										label="Price"
										className="form-control"
										group
										type="text"
										value={this.state.cost}
										onChange={this.handleOnChange}
										required
									/>
									<label className="mt-3">Tier description</label>
									<textarea
										id="description"
										className="form-control"
										label="Tier description"
										group
										type="textarea"
										rows="4"
										value={this.state.description}
										onChange={this.handleOnChange}
										required
									/>
									<label className="mt-3">Required Info</label>
									<textarea
										id="contributor_info"
										className="form-control"
										label="Required Info"
										group
										type="textarea"
										rows="4"
										value={this.state.contributor_info}
										onChange={this.handleOnChange}
										required
									/>

									<div className="text-center mb-4 mt-5">
										<MDBBtn color="danger" onClick={this.handleUpload} className="btn-block z-depth-2">
											Submit
										</MDBBtn>
									</div>
								</form>
							</MDBCardBody>
						</MDBCard>
					</MDBCol>
				</MDBRow>
			</MDBContainer>

			{/* <MDBContainer className="classic-tabs">
				<MDBNav classicTabs color="orange" className="mt-5 mx-auto">
					<MDBNavItem
						onClick={() => setActiveTab('1')}
						className={ activeTab == '1' ? 'active' : ''}
					>
						<MDBIcon icon="user" size="2x" />
						<br />
						Profile
					</MDBNavItem>
					<MDBNavItem
						onClick={() => setActiveTab('2')}
						className={activeTab == '2' ? 'active' : ''}
					>
							<MDBIcon icon="heart" size="2x" />
							<br />
							Follow
					</MDBNavItem>
					<MDBNavItem
						onClick={() => setActiveTab('3')}
						className={activeTab == '3' ? 'active' : ''}
					>
							<MDBIcon icon="envelope" size="2x" />
							<br />
							Contact
					</MDBNavItem>
					<MDBNavItem 
					onClick={() => setActiveTab('4')}
							className={activeTab == '4' ? 'active' : ''}>
							<MDBIcon icon="star" size="2x" />
							<br />
							Be Awesome
					</MDBNavItem>
				</MDBNav>
				<MDBTabContent className="card mb-5" activeItem={activeTab}>
					<MDBTabPane tabId="1">
						<p>
							Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
							rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
							explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
							consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
							dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora
							incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
						</p>
					</MDBTabPane>
					<MDBTabPane tabId="2">
						<p>
							Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid
							ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
							molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
						</p>
					</MDBTabPane>
					<MDBTabPane tabId="3">
						<p>
							At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti
							atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique
							sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum
							facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
							impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor
							repellendus.
						</p>
					</MDBTabPane>
					<MDBTabPane tabId="4">
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
							ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
							fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
							mollit anim id est laborum.
						</p>
					</MDBTabPane>
				</MDBTabContent>
			</MDBContainer>
		 */}
		</Layout>
	);
}}

export default Create
