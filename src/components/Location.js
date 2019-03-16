import React from 'react';
import locationService from '../services/locations';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Button from '../../node_modules/@material-ui/core/Button/Button';
import List from '../../node_modules/@material-ui/core/List/List';
import ListItem from '../../node_modules/@material-ui/core/ListItem/ListItem';
import ListItemText from '../../node_modules/@material-ui/core/ListItemText/ListItemText';
import Divider from '@material-ui/core/Divider';
import Slide from '../../node_modules/@material-ui/core/Slide/Slide';
import Typography from '../../node_modules/@material-ui/core/Typography/Typography';
import Loading from './Loading';
import _ from 'lodash';

class Location extends React.Component{
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
        if (this.props.clickedLocationId !== prevProps.clickedLocationId) {
            this.setState({ open: !!this.props.clickedLocationId });
        }
    }

    deleteLocation = async () => {
        try {
            const state = this.props.store.getState();
            const location = state.locations.find(location => location.id === this.props.clickedLocationId);
            if (window.confirm(`Är du säker att du vill ta bort plats ${location.name}?`)) {
                this.setState({ loading: true, loadingActive: true });
                await locationService.remove(location.id, state.chosenYear);
                this.setState({ open: false, loading: false, loadingActive: false });
                this.props.clearClickedLocation()();
            }
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({ loading: false, loadingActive: true, message: error ? error : 'Raderingen misslyckades, pröva igen' });
        }
    };

    closeDialog = async () => {
        this.setState({ open: false, loading: false, loadingActive: false, message: ''  });
        this.props.clearClickedLocation()();
    };

    transition = (props) => {
        return <Slide direction="up" {...props} />;
    };

    render() {
        const state = this.props.store.getState();
        const location = state.locations.find(location => location.id === this.props.clickedLocationId);
        let locationFeats, locationPoints;
        if (location) {
            locationFeats = state.feats.reduce((sum, feat) => {
                if (location.id === feat.location && feat.approved) {
                    return sum + 1;
                } else {
                    return sum;
                }
            }, 0);

            locationPoints = state.feats.reduce((sum, feat) => {
                if (location.id === feat.location && feat.approved) {
                    return sum + feat.value;
                } else {
                    return sum;
                }
            }, 0);
        }

        return (

            <Dialog fullScreen maxWidth="md" open={this.state.open} onClose={this.props.clearClickedLocation()} TransitionComponent={this.transition} transitionDuration={1000}>
                <DialogContent style={{ display: 'flex', flexDirection: 'column', padding: '40px' }}>
                    {location &&
                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <Typography variant='h6'>Plats</Typography>
                            <List dense={false}>
                                <ListItem>
                                    <ListItemText
                                        primary="Namn"
                                        secondary={location.name}
                                    />
                                </ListItem>
                                <Divider/>
                                <ListItem>
                                    <ListItemText
                                        primary="Prestationer"
                                        secondary={locationFeats}
                                    />
                                </ListItem>
                                <Divider/>
                                <ListItem>
                                    <ListItemText
                                        primary="Poäng"
                                        secondary={locationPoints}
                                    />
                                </ListItem>
                                <Divider/>
                                <ListItem>
                                    <ListItemText
                                        primary="Medeltalspoäng"
                                        secondary={locationFeats === 0 ? 0 : Math.round((locationPoints / locationFeats) * 100) / 100}
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
                    <Button style={{ margin: '5px' }} variant="contained" color="primary" onClick={this.deleteLocation}>Radera</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default Location;