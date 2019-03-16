import React from 'react';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import propertiesService from '../services/properties';
import UserFormDialog from '../components/UserFormDialog';
import LocationFormDialog from '../components/LocationFormDialog';
import Typography from '../../node_modules/@material-ui/core/Typography/Typography';
import Button from '../../node_modules/@material-ui/core/Button/Button';
import { DateTimePicker } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import Grid from '../../node_modules/@material-ui/core/Grid/Grid';
import _ from 'lodash';
import Loading from '../components/Loading';

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chosenYear: this.props.store.getState().chosenYear,
            realtimeCutoffTime: this.props.store.getState().realtimeCutoffTime,
            startDate: this.props.store.getState().startDate,
            newRealtimeCutoffTime: this.props.store.getState().realtimeCutoffTime,
            newStartDate: this.props.store.getState().startDate,
            loading: false,
            loadingActive: false,
            message: ''
        };
    }

    async componentDidUpdate() {
        const realtimeCutoffTime = this.props.store.getState().realtimeCutoffTime;
        const startDate = this.props.store.getState().startDate;
        if (realtimeCutoffTime !== this.state.realtimeCutoffTime) {
            this.setState({ realtimeCutoffTime, newRealtimeCutoffTime: realtimeCutoffTime });
        }
        if (startDate !== this.state.startDate) {
            this.setState({ startDate, newStartDate: startDate });
        }
    }

    updateStartDate = async () => {
        try {
            if (window.confirm('Är du säker att du vill ändra starttiden?')) {
                this.setState({ loading: true, loadingActive: true });
                await propertiesService.update({ startDate: this.state.newStartDate }, this.state.chosenYear);
                console.log('updated');
                this.setState({ startDate: this.state.newStartDate, open: false, loading: false, loadingActive: false });
                this.props.store.dispatch({
                    type: 'UPDATE_START_DATE',
                    startDate: this.state.newStartDate
                });
            }
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({ loading: false, loadingActive: true, message: error ? error : 'Något katastrofalt har inträffat... Får du säkert göra detta?!' });
        }
    };

    updateRealtimeCutoffTime = async () => {
        try {
            if (window.confirm('Är du säker att du vill ändra realtime cutoff tiden?')) {
                this.setState({ loading: true, loadingActive: true });
                await propertiesService.update({ realtimeCutoffTime: this.state.newRealtimeCutoffTime }, this.state.chosenYear);
                this.setState({ realtimeCutoffTime: this.state.newRealtimeCutoffTime, open: false, loading: false, loadingActive: false });
                this.props.store.dispatch({
                    type: 'UPDATE_CUTOFF_TIME',
                    realtimeCutoffTime: this.state.newRealtimeCutoffTime
                });
            }
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({ loading: false, loadingActive: true, message: error ? error : 'Något katastrofalt har inträffat... Får du säkert göra detta?!' });
        }
    };

    render() {
        return (
            <MuiPickersUtilsProvider utils={MomentUtils} locale={'fi'}>
                <div>
                    <div style={{ paddingTop: '0px' }}>
                        <Typography variant="h5">Admin</Typography>
                    </div>
                    <div style={{ paddingTop: '15px', paddingBottom: '30px' }}>
                        <UserFormDialog store={this.props.store}/>
                    </div>
                    <div style={{ paddingBottom: '30px' }}>
                        <LocationFormDialog store={this.props.store}/>
                    </div>
                    <Grid container spacing={24} style={{ padding: '10px' }}>
                        <Grid item>
                            <div>
                                <Typography variant="h6">
                                Starttid: {moment.unix(this.state.startDate).format('DD.MM.YYYY HH:mm:ss')}
                                </Typography>
                            </div>
                            <form>
                                <DateTimePicker
                                    ampm={false}
                                    value={moment.unix(this.state.newStartDate)}
                                    onChange={(date) => {
                                        this.setState({ newStartDate: date.unix() });
                                    }}
                                    label="Ny starttid"
                                />
                            </form>
                            <Button style={{ marginTop: '10px' }} color="primary" variant="contained" onClick={this.updateStartDate}>Uppdatera starttid</Button>
                        </Grid>
                        <Grid item>
                            <div>
                                <Typography variant="h6">
                            Realtime cutoff: {moment.unix(this.state.realtimeCutoffTime).format('DD.MM.YYYY HH:mm:ss')}
                                </Typography>
                            </div>
                            <form>
                                <DateTimePicker
                                    ampm={false}
                                    value={moment.unix(this.state.newRealtimeCutoffTime)}
                                    onChange={(date) => this.setState({ newRealtimeCutoffTime: date.unix() })}
                                    label="Ny realtime cutoff"
                                />
                            </form>
                            <Button style={{ marginTop: '10px' }} color="primary" variant="contained" onClick={this.updateRealtimeCutoffTime}>Uppdatera realtime cutoff</Button>
                        </Grid>
                    </Grid>
                    <Loading active={this.state.loadingActive} loading={this.state.loading} message={this.state.message}/>
                </div>
            </MuiPickersUtilsProvider>
        );
    }
}

export default Admin;