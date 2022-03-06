import React from 'react';
import locationService from '../services/locations';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import _ from 'lodash';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Loading from './Loading';
import DialogActions from '@mui/material/DialogActions';
import Slide from '@mui/material/Slide';

class LocationFormDialog extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            newLocationName: '',
            open: false,
            loading: false,
            loadingActive: false,
            message: ''
        };
    }

    addLocation = async () => {
        try {
            this.setState({ loading: true, loadingActive: true, message: '' });
            if (!this.state.newLocationName) {
                return this.setState({ loading: false, loadingActive: true, message: 'Information saknas' });
            }
            const location = {
                name: this.state.newLocationName
            };
            await locationService.create(location, this.props.store.getState().chosenYear);
            this.setState({
                newLocationName: '',
                open: false,
                loading: false,
                loadingActive: false,
                message: ''
            });
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({ loading: false, loadingActive: true, message: error ? error : 'Skapandet av laget misslyckades, pröva igen!' });

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
                }}>Ny plats</Button>
                <Dialog fullScreen maxWidth="md" open={this.state.open} TransitionComponent={this.transition} transitionDuration={1000}>
                    <DialogContent style={{ display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center' }}>
                        <Typography variant="h5">Ny plats</Typography>
                        <form autoComplete="off">
                            <FormControl fullWidth>
                                <TextField
                                    label="Namn"
                                    type="text"
                                    value={this.state.newLocationName}
                                    name="newLocationName"
                                    onChange={(event) => {
                                        this.setState({ newLocationName: event.target.value });
                                    }}
                                />
                            </FormControl>
                        </form>
                    </DialogContent>
                    <Loading active={this.state.loadingActive} loading={this.state.loading} message={this.state.message}/>
                    <DialogActions style={{ paddingBottom: '20px', paddingRight: '20px' }}>
                        <Button variant="contained" color="secondary" onClick={this.closeDialog}>Stäng</Button>
                        <Button variant="contained" onClick={this.addLocation} color="primary">Skapa</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default LocationFormDialog;