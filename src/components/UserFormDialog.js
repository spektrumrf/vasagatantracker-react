import React from 'react';
import userService from '../services/users';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import _ from 'lodash';
import Loading from './Loading';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Slide from '@material-ui/core/Slide';
import DialogActions from '@material-ui/core/DialogActions';

class UserFormDialog extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            newUserName: '',
            newUserUsername: '',
            newUserType: '',
            newUserPassword: '',
            newUserCoefficient: '',
            open: false,
            loading: false,
            loadingActive: false,
            message: ''
        };
    }

    addUser = async (event) => {
        event.preventDefault();
        try {
            this.setState({ loading: true, loadingActive: true, message: ''  });
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
            this.setState({
                newUserName: '',
                newUserUsername: '',
                newUserType: '',
                newUserPassword: '',
                newUserCoefficient: '',
                open: false,
                loading: false,
                loadingActive: false,
                message: ''
            });
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({ loading: false, loadingActive: true, message: error ? error : 'Skapandet av användare misslyckades, pröva igen!' });
        }
    };

    transition = (props) => {
        return <Slide direction="up" {...props} />;
    };

    closeDialog = () => {
        this.setState({ open: false, loading: false, loadingActive: false, message: ''  });
    };

    render() {
        return (
            <div>
                <Button variant="contained" color="primary" size="large" onClick={() => {
                    this.setState({ open: true });
                }}>Nytt lag</Button>
                <Dialog fullScreen maxWidth="md" open={this.state.open} TransitionComponent={this.transition} transitionDuration={1000}>
                    <DialogContent style={{ display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center' }}>
                        <Typography variant="h5">Nytt lag</Typography>
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
                    </DialogContent>
                    <Loading active={this.state.loadingActive} loading={this.state.loading} message={this.state.message}/>
                    <DialogActions style={{ paddingBottom: '20px', paddingRight: '20px' }}>
                        <Button variant="contained" color="secondary" onClick={this.closeDialog}>Stäng</Button>
                        <Button variant="contained" onClick={this.addUser} color="primary">Skapa</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default UserFormDialog;