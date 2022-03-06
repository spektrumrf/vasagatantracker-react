import React from 'react';
import userService from '../services/users';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import _ from 'lodash';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import Loading from './Loading';

class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            loading: false,
            loadingActive: false,
            message: ''
        };
    }

    async componentDidUpdate(prevProps) {
        if (this.props.clickedUserId !== prevProps.clickedUserId) {
            this.setState({ open: !!this.props.clickedUserId });
        }
    }

    deleteUser = async () => {
        const state = this.props.store.getState();
        const user = state.users.find(user => this.props.clickedUserId === user.id);
        try {
            if (window.confirm(`Är du säker att du vill ta bort lag ${user.name}?`)) {
                this.setState({ loading: true, loadingActive: true });
                await userService.remove(user.id, state.chosenYear);
                this.setState({ open: false, loading: false, loadingActive: false });
                this.props.clearClickedUser()();
            }
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({ loading: false, loadingActive: true, message: error ? error : 'Raderingen misslyckades, pröva igen' });
        }
    };

    closeDialog = async () => {
        this.setState({ open: false, loading: false, loadingActive: false, message: ''  });
        this.props.clearClickedUser()();
    };

    transition = (props) => {
        return <Slide direction="up" {...props} />;
    };

    render() {
        const state = this.props.store.getState();
        const user = _.find(state.users, user => user.id === this.props.clickedUserId);
        let userPoints;
        let userPointsWithCoefficient;
        if(user) {
            userPoints = this.props.store.getState().feats.reduce((sum, feat) => {
                if (user.id === feat.user && feat.approved) {
                    return sum + feat.value;
                } else {
                    return sum;
                }
            }, 0);
            userPointsWithCoefficient = Math.round(userPoints * parseFloat(user.coefficient) * 100) / 100;
        }
        return (
            <Dialog fullScreen maxWidth="md" open={this.state.open} onClose={this.props.clearClickedUser()} TransitionComponent={this.transition} transitionDuration={1000}>
                <DialogContent style={{ display: 'flex', flexDirection: 'column', padding: '40px' }}>
                    {user &&
                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <Typography variant='h6'>Användare</Typography>
                            <List dense={false}>
                                <ListItem>
                                    <ListItemText
                                        primary="Namn"
                                        secondary={user.name}
                                    />
                                </ListItem>
                                <Divider/>
                                <ListItem>
                                    <ListItemText
                                        primary="Poäng"
                                        secondary={userPoints}
                                    />
                                </ListItem>
                                <Divider/>
                                <ListItem>
                                    <ListItemText
                                        primary="Poäng med koefficient"
                                        secondary={userPointsWithCoefficient}
                                    />
                                </ListItem>
                                <Divider/>
                                <ListItem>
                                    <ListItemText
                                        primary="Koefficient"
                                        secondary={user.coefficient}
                                    />
                                </ListItem>
                                <Divider/>
                                <ListItem>
                                    <ListItemText
                                        primary="Användartyp"
                                        secondary={user.type}
                                    />
                                </ListItem>
                                <Divider/>
                            </List>
                        </div>
                    }
                </DialogContent>
                <Loading active={this.state.loadingActive} loading={this.state.loading} message={this.state.message}/>
                <DialogActions style={{ paddingBottom: '20px', paddingRight: '20px' }}>
                    <Button style={{ margin: '5px' }} variant="contained" onClick={this.closeDialog} color="secondary">Stäng</Button>
                    <Button style={{ margin: '5px' }} variant="contained" color="primary" onClick={this.deleteUser}>Radera</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default User;