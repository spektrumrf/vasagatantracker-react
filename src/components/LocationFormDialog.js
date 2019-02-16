import React from 'react';
import locationService from '../services/locations';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMore from '../../node_modules/@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '../../node_modules/@material-ui/core/Button/Button';
import _ from 'lodash';

class LocationFormDialog extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            newLocationName: ''
        };
    }

    addLocation = async () => {
        try {
            if (!this.state.newLocationName) {
                return { error: 'Information saknas.' };
            }
            const location = {
                name: this.state.newLocationName
            };
            await locationService.create(location, this.props.store.getState().chosenYear);
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            console.log(error ? error : 'Något katastrofalt har inträffat... Ladda om sidan!' );
        }
    };

    render() {
        return (
            <div>
                <ExpansionPanel>
                    <ExpansionPanelSummary style={{ background: '#ff77a9' }} expandIcon={<ExpandMore/>}>
                        <Typography variant="h6">Ny plats</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails style={{ display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center' }} >
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
                    </ExpansionPanelDetails>
                    <ExpansionPanelActions style={{ paddingRight: '20px', paddingBottom: '20px' }}>
                        <Button variant="contained" onClick={this.addLocation} color="secondary">Skapa</Button>
                    </ExpansionPanelActions>
                </ExpansionPanel>
            </div>
        );
    }
}

export default LocationFormDialog;