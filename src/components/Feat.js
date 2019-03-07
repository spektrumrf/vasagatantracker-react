import React from 'react';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import featService from '../services/feats';
import CircularProgress from '../../node_modules/@material-ui/core/CircularProgress/CircularProgress';
import _ from 'lodash';
import ListItem from '../../node_modules/@material-ui/core/ListItem/ListItem';
import List from '../../node_modules/@material-ui/core/List/List';
import ListItemText from '../../node_modules/@material-ui/core/ListItemText/ListItemText';
import Button from '../../node_modules/@material-ui/core/Button/Button';
import moment from 'moment';
import Typography from '../../node_modules/@material-ui/core/Typography/Typography';
import FeatEditFormDialog from './FeatEditFormDialog';
import Slide from '../../node_modules/@material-ui/core/Slide/Slide';
import Loading from './Loading';

class Feat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            editMode: false,
            editedFeatContent: '',
            editedFeatValue: '',
            editedFeatLocationName: '',
            editedFeatAdminComment: '',
            loading: false,
            loadingActive: false,
            message: ''
        };
    }

    async componentDidUpdate(prevProps) {
        if (this.props.clickedFeatId !== prevProps.clickedFeatId) {
            this.setState({ open: !!this.props.clickedFeatId });
        }
    }

    deleteFeat = async () => {
        try {
            const state = this.props.store.getState();
            const feat = _.find(state.feats, feat => feat.id === this.props.clickedFeatId);
            const featUser = _.find(state.users, user => feat.user === user.id);
            const featLocation = _.find(state.locations, location => feat.location === location.id);

            if (window.confirm(`Är du säker att du vill ta bort prestationen av ${featUser.name} på ${featLocation.name} för ${feat.value}sp?`)) {
                this.setState({ loading: true, loadingActive: true });
                await featService.remove(feat.id, state.chosenYear);
                this.setState({ open: false, loading: false, loadingActive: false });

                this.props.clearClickedFeat()();
            }
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({
                loading: false,
                loadingActive: true,
                message: error ? error : 'Raderingen misslyckades, pröva igen'
            });
        }
    };

    approveFeat = async () => {
        try {
            const state = this.props.store.getState();
            const feat = _.find(state.feats, feat => feat.id === this.props.clickedFeatId);
            const featUser = _.find(state.users, user => feat.user === user.id);
            const featLocation = _.find(state.locations, location => feat.location === location.id);

            if (window.confirm(`Är du säker att du vill godkänna prestationen av ${featUser.name} på ${featLocation.name} för ${feat.value}sp?`)) {
                this.setState({ loading: true, loadingActive: true });
                await featService.update(feat.id, { ...feat, currentFeat: feat }, state.chosenYear, 'approveFeat');
                this.setState({ loading: false, loadingActive: false });
            }
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({
                loading: false,
                loadingActive: true,
                message: error ? error : 'Godkännandet misslyckades, pröva igen'
            });
        }
    };

    closeDialog = async () => {
        this.setState({ open: false, loading: false, loadingActive: false, message: '' });
        this.props.clearClickedFeat()();
    };

    transition = (props) => {
        return <Slide direction="up" {...props} />;
    };

    render() {
        const state = this.props.store.getState();
        const user = state.user;
        const feat = _.find(state.feats, feat => feat.id === this.props.clickedFeatId);
        let featUser, featLocation;
        if (feat) {
            featUser = _.find(state.users, user => feat.user === user.id);
            featLocation = _.find(state.locations, location => feat.location === location.id);
        }
        const featColumnWidth = feat && (!this.props.proof[feat.id] || this.props.proof[feat.id].length !== 0) ? 6 : 12;
        return (
            <div>
                <Dialog fullScreen maxWidth="md" open={this.state.open} onClose={this.props.clearClickedFeat()}
                    TransitionComponent={this.transition} transitionDuration={1000}>
                    <DialogContent>
                        {feat &&
                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <Grid direction="row" container spacing={8} style={{ display: 'flex' }}>
                                {(!this.props.proof[feat.id] || this.props.proof[feat.id].length !== 0) &&
                                <Grid item xs={6}>
                                    <List dense={false}>
                                        <Typography variant='h6'>Bevis</Typography>
                                        {this.props.proof[feat.id] ? this.props.proof[feat.id].map(p =>
                                            <img key={p} src={p} alt="Bevis" width="100%"/>) : <CircularProgress/>}
                                    </List>
                                </Grid>
                                }
                                <Grid item xs={featColumnWidth}>
                                    <List dense={false}>
                                        <Typography variant='h6'>Prestation</Typography>
                                        <ListItem>
                                            <ListItemText primary="Tid"
                                                secondary={moment.unix(feat.date).format('DD.MM.YYYY HH:mm:ss')}/>
                                        </ListItem>
                                        <Divider/>
                                        <ListItem>
                                            <ListItemText primary="Lag" secondary={featUser.name}/>
                                        </ListItem>
                                        <Divider/>
                                        <ListItem>
                                            <ListItemText primary="Poäng" secondary={feat.value}/>
                                        </ListItem>
                                        <Divider/>
                                        <ListItem>
                                            <ListItemText primary="Plats" secondary={featLocation.name}/>
                                        </ListItem>
                                        <Divider/>
                                        <ListItem>
                                            <ListItemText primary="Detaljer"/>
                                        </ListItem>
                                        <ListItem>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'left',
                                                marginLeft: '10px',
                                                marginTop: '-10px'
                                            }}>
                                                {_.map(feat.content, (value, drink) => <Typography key={drink}
                                                    variant="body1">{`${drink} ${value}`}</Typography>)}
                                            </div>
                                        </ListItem>
                                        <Divider/>
                                        <ListItem>
                                            <ListItemText primary="Godkänd" secondary={feat.approved ? 'Ja' : 'Nej'}/>
                                        </ListItem>
                                        <Divider/>
                                        <ListItem>
                                            <ListItemText primary="Lagkommentar" secondary={feat.comment}/>
                                        </ListItem>
                                        <Divider/>
                                        <ListItem>
                                            <ListItemText primary="Domarkommentar" secondary={feat.adminComment}/>
                                        </ListItem>
                                        <Divider/>
                                    </List>
                                </Grid>
                            </Grid>
                        </div>}
                    </DialogContent>
                    <Loading active={this.state.loadingActive} loading={this.state.loading}
                        message={this.state.message}/>
                    <DialogActions style={{ paddingRight: '20px', paddingBottom: '10px', paddingTop: '10px' }}>
                        {feat &&
                        <div>
                            <Button style={{ margin: '5px' }} variant="contained" onClick={this.closeDialog}
                                color="secondary">Stäng</Button>
                            {_.get(user, 'type') === 'admin' &&
                            <Button style={{ margin: '5px' }} label="Radera" variant="contained" color="primary"
                                onClick={this.deleteFeat}>Radera</Button>}
                            {_.get(user, 'type') === 'admin' &&
                            <Button variant="contained" color="primary"
                                onClick={() => this.setState({ editMode: true })}>Editera</Button>}
                            {_.get(user, 'type') === 'admin' && !feat.approved &&
                            <Button style={{ margin: '5px' }} label="Godkänn" variant="contained" color="primary"
                                onClick={this.approveFeat}>Godkänn</Button>}
                        </div>}
                    </DialogActions>
                </Dialog>
                {feat && <FeatEditFormDialog store={this.props.store}
                    feat={feat} location={featLocation}
                    open={this.state.editMode}
                    closeEditMode={() => this.setState({ editMode: false })}/>}
            </div>
        );
    }
}

export default Feat;