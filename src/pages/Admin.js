import React from 'react';
import AdapterMoment from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import propertiesService from '../services/properties';
import UserFormDialog from '../components/UserFormDialog';
import LocationFormDialog from '../components/LocationFormDialog';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DateTimePicker from '@mui/lab/DateTimePicker';
import moment from 'moment';
import Grid from '@mui/material/Grid';
import _ from 'lodash';
import Loading from '../components/Loading';

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chosenYear: this.props.store.getState().chosenYear,
            realtimeCutoffTime: this.props.store.getState().realtimeCutoffTime,
            startDate: this.props.store.getState().startDate,
            endDate: this.props.store.getState().endDate,
            newRealtimeCutoffTime: this.props.store.getState().realtimeCutoffTime,
            newStartDate: this.props.store.getState().startDate,
            newEndDate: this.props.store.getState().endDate,
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

    updateEndDate = async () => {
        try {
            if (window.confirm('Är du säker att du vill ändra sluttiden?')) {
                this.setState({ loading: true, loadingActive: true });
                await propertiesService.update({ endDate: this.state.newEndDate }, this.state.chosenYear);
                this.setState({ endDate: this.state.newEndDate, open: false, loading: false, loadingActive: false });
                this.props.store.dispatch({
                    type: 'UPDATE_END_DATE',
                    endDate: this.state.newEndDate
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
            <LocalizationProvider dateAdapter={AdapterMoment}>
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
                    <Loading active={this.state.loadingActive} loading={this.state.loading} message={this.state.message}/>
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
                                Sluttid: {moment.unix(this.state.endDate).format('DD.MM.YYYY HH:mm:ss')}
                                </Typography>
                            </div>
                            <form>
                                <DateTimePicker
                                    ampm={false}
                                    value={moment.unix(this.state.newEndDate)}
                                    onChange={(date) => this.setState({ newEndDate: date.unix() })}
                                    label="Ny sluttid"
                                />
                            </form>
                            <Button style={{ marginTop: '10px' }} color="primary" variant="contained" onClick={this.updateEndDate}>Uppdatera sluttid</Button>
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
                </div>
            </LocalizationProvider>
        );
    }
}

export default Admin;