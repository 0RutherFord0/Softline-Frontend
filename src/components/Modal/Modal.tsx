import React, { useEffect, useState } from 'react';
import 'antd/dist/antd.css';
const { RangePicker } = DatePicker;
import './Modal.scss';
import axiosConfig from '../../Utils/axiosConfig';
import { Contract, NewContract } from '../../interfaces/Contracts';
import { useDispatch, useSelector } from 'react-redux';
import { unAuth, userState } from '../../store/userAuth/userAuthSlice';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';

import { Modal, notification } from 'antd';
import { CloseOutlined } from '@mui/icons-material';
import { DatePicker, Input, Space } from 'antd';
import moment, { Moment } from 'moment';
import { ServiceCategory } from '../../interfaces/ServicePackage';
import { ServiceItem } from '../../interfaces/ServiceItem';
import { Agent } from '../../interfaces/Agents';
import axios from 'axios';
import { Button as AntdButton } from 'antd';
import { Department } from '../../interfaces/Companies';
import ReactSelect from 'react-select';
import { asstesOptions } from '../../Utils/constData';
import { dateDiff } from '../../Utils/helperFunction';
import { createContract } from '../../store/contracts';
type Props = {
	handelCancel: () => void;
	openModal: boolean;
};
type notifications = {
	shownotification: boolean;
	message: string;
};
const ModalComponents: React.FC<Props> = ({ handelCancel, openModal }) => {
	const authReducer = useSelector((state: { userReducer: userState }) => {
		return state.userReducer;
	});
	const dispatch: any = useDispatch();
	const [selectedserviceItem, setselectedserviceItem] = useState<any>(null);
	const [assets, setAssets] = useState<any>(null);
	const [selectedID, setSelectedID] = useState<Number>(0);
	const [selectedCompanyID, setselectedCompanyID] = useState<Number>(0);
	const [selectedCompany, setSelectedCompany] = useState('');
	const [multiSelectOptions, setMultiSelectOptions] = useState<any>([]);
	const [listOfCompanies, setListOfCompanies] = useState<[] | Department[]>(
		[]
	);
	const [contractPeriod, setContractPeriod] = useState('');
	const [listOfServicePackage, setListOfServicePackage] = useState<
		[] | ServiceCategory[]
	>([]);
	const [listOfServiceItem, setlistOfServiceItem] = useState<
		[] | ServiceItem[]
	>([]);
	const [listOfAgents, setListOfAgents] = useState<[] | Agent[]>([]);
	const [serviceItem, setserviceItem] = useState<string[]>([]);
	//contract details
	const [contractID, setContractID] = useState('');
	const [contractName, setContractName] = useState('');
	const [startDate, setstartDate] = useState<string>('');
	const [endDate, setendDate] = useState<string>('');
	const [typeHours, setTypeHours] = useState('Proactive');
	const [selectedAgent, setSelectedAgent] = useState('');
	const [selectedServicePkg, setSelectedServicePkg] = useState('');
	const [remarks, setRemarks] = useState('');
	const [hours, setHours] = useState(0);
	const [noftification, setNoftification] = useState<notifications>({
		message: '',
		shownotification: false,
	});
	useEffect(() => {
		const getCompanies = async () => {
			return axiosConfig.get('/api/v1/getCompanies', {
				headers: {
					authorization: authReducer.accessToken.toString(),
				},
			});
		};
		const getServicePackage = async () => {
			return axiosConfig.get('/api/v1/getServicePackage', {
				headers: {
					authorization: authReducer.accessToken.toString(),
				},
			});
		};
		const getServiceItem = async () => {
			return axiosConfig.get('/api/v1/getServiceItem', {
				headers: {
					authorization: authReducer.accessToken.toString(),
				},
			});
		};
		const getAgents = async () => {
			return axiosConfig.get('/api/v1/getAgents', {
				headers: {
					authorization: authReducer.accessToken.toString(),
				},
			});
		};

		const getData = async () => {
			axios
				.all([
					getCompanies(),
					getServicePackage(),
					getServiceItem(),
					getAgents(),
				])
				.then((res) => {
					if (res[0].data['ok']) {
						setListOfCompanies(
							res[0].data['companies']['departments']
						);
					}
					if (res[1].data['ok']) {
						setListOfServicePackage(
							res[1].data['servicePackage']['service_categories']
						);
					}
					if (res[2].data['ok']) {
						setlistOfServiceItem(
							res[2].data['servicePackage']['service_items']
						);
					}
					if (res[3].data['ok']) {
						setListOfAgents(res[3].data['data']['agents']);
						setSelectedAgent(
							res[3].data['data']['agents'][0]['first_name'] +
								' ' +
								res[3].data['data']['agents'][0]['last_name']
						);
					}
				})
				.catch((res) => {
					if (res.response.status === 403) {
						dispatch(unAuth());

						window.location.reload();
					}
				});
		};
		if (authReducer.auth) {
			getData();
		}
	}, []);
	const openNotification = (msg: string) => {
		notification.error({
			message: 'Contract',
			description: msg,
		});
	};
	async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();

		if (selectedCompany === '') {
			setNoftification({
				shownotification: true,
				message: 'Select a Company',
			});

			setTimeout(() => {
				setNoftification({ shownotification: false, message: '' });
			}, 5000);
		} else if (selectedServicePkg === '') {
			setNoftification({
				shownotification: true,
				message: 'Select a Service Package',
			});

			setTimeout(() => {
				setNoftification({ shownotification: false, message: '' });
			}, 5000);
		} else if (selectedserviceItem.length < 1) {
			setNoftification({
				shownotification: true,
				message: 'Select a Service item',
			});

			setTimeout(() => {
				setNoftification({ shownotification: false, message: '' });
			}, 5000);
		} else if (startDate === '' || endDate === '') {
			setNoftification({
				shownotification: true,
				message: 'Select a contract period',
			});
			setTimeout(() => {
				setNoftification({ shownotification: false, message: '' });
			}, 5000);
		} else if (!Array.isArray(assets) || assets.length < 1) {
			setNoftification({
				shownotification: true,
				message: 'Select a assets',
			});
			setTimeout(() => {
				setNoftification({ shownotification: false, message: '' });
			}, 5000);
		} else {
			if (Array.isArray(assets)) {
				const data = assets.map((asset) => {
					return asset.value;
				});
				if (Array.isArray(selectedserviceItem)) {
					const Items = selectedserviceItem.map((items) => {
						return items.value;
					});

					const newContract: NewContract = {
						id: contractID,
						company: selectedCompany,
						contractName: contractName,
						ownerId: authReducer.userId.toString(),
						typeOfHours: typeHours,
						startDate: startDate.toString(),
						endDate: endDate.toString(),
						serviceItem: Items,
						servicePackage: selectedServicePkg,
						projectManager: selectedAgent,
						remarks: remarks,
						totalEntitlement: hours.toString(),
						assets: data,
					};
					const result = await dispatch(createContract(newContract));
					if (result.payload.ok) {
						handelCancel();
					} else {
						if (
							result.payload.message ===
							'User Authentication faild'
						) {
							dispatch(unAuth());
							setNoftification({
								shownotification: true,
								message: result.payload.response.data.message,
							});
							setTimeout(() => {
								setNoftification({
									shownotification: false,
									message: '',
								});
							}, 5000);
						} else {
							setNoftification({
								shownotification: true,
								message: result.payload.response.data.message,
							});
							setTimeout(() => {
								setNoftification({
									shownotification: false,
									message: '',
								});
							}, 5000);
						}
					}
				}
			}
		}
	}

	return (
		<Modal
			visible={openModal}
			onOk={handelCancel}
			footer={[]}
			style={{ top: 20 }}
			className="modal_container"
			onCancel={handelCancel}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<div className="contract_container">
				<form onSubmit={handleSubmit} className="formClass">
					<div className="form_container">
						<Snackbar
							open={noftification.shownotification}
							autoHideDuration={5000}
						>
							<Alert
								sx={{
									backgroundColor: '#a22e37',
									color: 'whitesmoke',
								}}
								severity="error"
							>
								{noftification.message}
							</Alert>
						</Snackbar>
						<div className="left_side" onSubmit={(e) => {}}>
							<Typography className="label">
								Contract ID
							</Typography>
							<Input
								className="textInput"
								aria-label="contract"
								required
								onChange={(e) => setContractID(e.target.value)}
							/>

							<Typography className="label">Company</Typography>

							<select
								name="select Company"
								className="selectInput"
								onChange={(e) => {
									const selectedCompany =
										listOfCompanies[
											e.target.options.selectedIndex - 1
										];

									setSelectedCompany(selectedCompany.name);

									setselectedCompanyID(
										parseInt(e.target.value)
									);
								}}
							>
								<option defaultValue={'default'} key="default">
									Select Companies
								</option>
								{listOfCompanies.map(
									(department: Department) => {
										return (
											<option
												key={department.id}
												value={department.id}
												aria-label={department.name}
											>
												{department.name}
											</option>
										);
									}
								)}
							</select>
							<Typography className="label">
								Service Item
							</Typography>
							<ReactSelect
								isMulti
								className="multiSelect"
								options={listOfServiceItem
									.map((serviceItem) => {
										if (
											serviceItem.category_id ===
											selectedID
										) {
											return {
												label: serviceItem.name,
												value: serviceItem.name,
											};
										}
									})
									.filter(function (el) {
										return el != null;
									})}
								closeMenuOnSelect={false}
								hideSelectedOptions={false}
								onChange={(selected) => {
									setselectedserviceItem(selected);
								}}
								value={selectedserviceItem}
							/>
							<div className="label">
								Contract Period{' '}
								{contractPeriod && (
									<span className="period">{`( ${contractPeriod} ) `}</span>
								)}
							</div>

							<RangePicker
								className="datePicker"
								onChange={(e) => {
									const startDate =
										e?.[0]?.toDate().toString() ?? '';
									const endDate =
										e?.[1]?.toDate().toString() ?? '';
									setstartDate(startDate);
									setendDate(endDate);
									const datediff = dateDiff(
										moment(e?.[0]),
										moment(e?.[1])
									);
									const years =
										datediff.years > 0
											? `${datediff.years} year `
											: '';
									const months =
										datediff.months > 0
											? `${datediff.months} month `
											: '';
									const days =
										datediff.days > 0
											? `${datediff.days} days `
											: '';

									setContractPeriod(years + months + days);
								}}
								disabledDate={(current) => {
									let customDate =
										moment().format('YYYY-MM-DD');
									return (
										current &&
										current <
											moment(customDate, 'YYYY-MM-DD')
									);
								}}
							/>
							<Typography className="label">
								Type of Hours
							</Typography>
							<select
								name="typeOfHours"
								className="selectInput"
								onChange={(e) => {
									setTypeHours(e.target.value.toString());
								}}
							>
								<option value="Proactive" id="Proactive">
									Proactive
								</option>
								<option value="Reactive" id="Reactive">
									Reactive
								</option>
								<option value="Both" id="Both">
									Both
								</option>
							</select>
							<Typography className="label">
								Service Asset
							</Typography>
							<ReactSelect
								isMulti
								menuPlacement="top"
								className="multiSelect"
								options={asstesOptions}
								closeMenuOnSelect={false}
								hideSelectedOptions={false}
								onChange={(selected) => {
									console.log(assets);

									setAssets(selected);
								}}
								value={assets}
							/>
						</div>
						<div className="right_side">
							<Typography className="label">
								Contract Name
							</Typography>
							<Input
								className="textInput"
								required
								type={'text'}
								onChange={(e) => {
									setContractName(e.target.value);
								}}
							/>
							<Typography className="label">
								Service Package
							</Typography>

							<select
								className="selectInput"
								name="List of Service Package"
								id="List of Service Package"
								onChange={async (e) => {
									setselectedserviceItem([]);
									const id = parseInt(e.target.value);
									setMultiSelectOptions(
										listOfServiceItem
											.map((serviceItem) => {
												if (
													serviceItem.category_id ===
													selectedCompanyID
												) {
													return {
														label: serviceItem.name,
														value: serviceItem.name,
													};
												}
											})
											.filter(function (el) {
												return el != null;
											})
									);
									setserviceItem([]);
									const selectedPkg =
										listOfServicePackage[
											e.target.options.selectedIndex - 1
										];

									setSelectedServicePkg(selectedPkg.name);
									setSelectedID(id);
								}}
							>
								<option defaultValue={'default'}>
									Select Service Package
								</option>
								{listOfServicePackage.map(
									(ServiceCategory: ServiceCategory) => {
										return (
											<option
												key={ServiceCategory.id}
												value={ServiceCategory.id}
												aria-label={
													ServiceCategory.name
												}
											>
												{ServiceCategory.name}
											</option>
										);
									}
								)}
							</select>
							<Typography className="label">Agents</Typography>

							<select
								className="selectInput"
								name="Select Agents"
								id="Agents"
								value={selectedAgent}
								onChange={(e) => {
									setSelectedAgent(e.target.value);
								}}
							>
								{listOfAgents.map((agent: Agent) => {
									return (
										<option
											key={agent.id}
											value={
												agent.first_name +
												' ' +
												agent.last_name
											}
											aria-label={
												agent.first_name +
												' ' +
												agent.last_name
											}
										>
											{agent.first_name +
												' ' +
												agent.last_name}
										</option>
									);
								})}
							</select>
							<Typography className="label">
								Contract Hours
							</Typography>
							<Input
								className="textInput"
								type="number"
								min={1}
								required
								onChange={(e) => {
									setHours(parseInt(e.target.value));
								}}
							/>
							<Typography className="label">Remarks</Typography>
							<Input
								className="textInput"
								type="text"
								onChange={(e) => {
									setRemarks(e.target.value);
								}}
							/>
						</div>
					</div>

					<button
						key="btn"
						type="submit"
						className="createContractBtn"
					>
						Create Contract
					</button>
				</form>
			</div>
		</Modal>
	);
};

export default ModalComponents;
