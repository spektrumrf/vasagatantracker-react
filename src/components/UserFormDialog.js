import React from 'react';
import userService from '../services/users';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMore from '../../node_modules/@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import TextField from '@material-ui/core/TextField';
import FormControl from '../../node_modules/@material-ui/core/FormControl/FormControl';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Button from '../../node_modules/@material-ui/core/Button/Button';
import _ from 'lodash';
import Loading from './Loading';

class UserFormDialog extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            newUserName: '',
            newUserUsername: '',
            newUserType: '',
            newUserPassword: '',
            newUserCoefficient: '',
            loading: false,
            loadingActive: false,
            message: ''
        };
    }

    addUser = async (event) => {
        event.preventDefault();
        try {
            const newUserName = this.state.newUserName;
            const newUserUsername = this.state.newUserUsername;
            const newUserType = this.state.newUserType;
            const newUserPassword = this.state.newUserPassword;
            const newUserCoefficient = this.state.newUserCoefficient;

            if (!newUserName || !newUserUsername || !newUserType || !newUserPassword || !newUserPassword || !newUserCoefficient) {
                return this.setState({ loading: false, loadingActive: true, message: 'Information saknas' });
            }

            const user = {
                name: newUserName,
                username: newUserUsername,
                type: newUserType,
                password: newUserPassword,
                coefficient: newUserCoefficient
            };

            await userService.create(user, this.props.store.getState().chosenYear);

        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({ loading: false, loadingActive: true, message: error ? error : 'Skapandet av användare misslyckades, pröva igen!' });
        }
    };

    render() {
        return (
            <div>
                <ExpansionPanel>
                    <ExpansionPanelSummary style={{ background: '#ff77a9' }} expandIcon={<ExpandMore/>}>
                        <Typography variant="h6">Nytt lag</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails style={{ display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center' }} >
                        <form autoComplete="off">
                            <FormControl fullWidth>
                                <TextField
                                    label="Lagnamn"
                                    type="text"
                                    value={this.state.newUserName}
                                    name="newLocationName"
                                    onChange={(event) => {
                                        this.setState({ newUserName: event.target.value });
                                    }}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <TextField
                                    label="Användarnamn"
                                    type="text"
                                    value={this.state.newUserUsername}
                                    name="newUserUsername"
                                    onChange={(event) => {
                                        this.setState({ newUserUsername: event.target.value });
                                    }}
                                />
                            </FormControl>

                            <FormControl fullWidth>
                                <TextField
                                    label="Lösenord"
                                    type="password"
                                    value={this.state.newUserPassword}
                                    name="newUserPassword"
                                    onChange={(event) => {
                                        this.setState({ newUserPassword: event.target.value });
                                    }}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <TextField
                                    label="Typ (admin eller team)"
                                    type="text"
                                    value={this.state.newUserType}
                                    name="newUserType"
                                    onChange={(event) => {
                                        this.setState({ newUserType: event.target.value });
                                    }}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <TextField
                                    label="Koefficient"
                                    type="number"
                                    value={this.state.newUserCoefficient}
                                    name="newUserType"
                                    onChange={(event) => {
                                        this.setState({ newUserCoefficient: event.target.value });
                                    }}
                                />
                            </FormControl>
                        </form>
                    </ExpansionPanelDetails>
                    <Loading active={this.state.loadingActive} loading={this.state.loading} message={this.state.message}/>
                    <ExpansionPanelActions style={{ paddingRight: '20px', paddingBottom: '20px' }}>
                        <Button variant="contained" onClick={this.addUser} color="secondary">Skapa</Button>
                    </ExpansionPanelActions>
                </ExpansionPanel>
            </div>
        );
    }
}

export default UserFormDialog;