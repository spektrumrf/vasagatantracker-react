import React from 'react';
import featService from '../services/feats';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import _ from 'lodash';
import Slide from '@material-ui/core/Slide';
import Loading from './Loading';

class FeatEditFormDialog extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            editedFeatContent: {},
            editedFeatValue: '',
            editedFeatLocationName: '',
            editedFeatAdminComment: '',
            loading: false,
            loadingActive: false,
            message: ''
        };
    }

    async componentDidMount(){
        this.setState({
            editedFeatContent: this.props.feat.content,
            editedFeatValue: this.props.feat.value,
            editedFeatLocationName: this.props.location.name,
            editedFeatAdminComment: this.props.feat.adminComment
        });
    }

    editFeat = async (event) => {
        event.preventDefault();
        try {
            if (window.confirm('Är du säker att du vill editera prestationen?')) {

                this.setState({ loading: true, loadingActive: true });

                const editedFeatValue = this.state.editedFeatValue;
                const editedFeatLocationName = this.state.editedFeatLocationName;
                const editedFeatLocation = this.props.store.getState().locations.find(l => l.name === editedFeatLocationName);
                const editedFeatContent = this.state.editedFeatContent;
                const editedFeatAdminComment = this.state.editedFeatAdminComment;

                const feat = this.props.feat;

                const editedFeat = {
                    date: feat.date,
                    approved: feat.approved,
                    user: feat.user,
                    value: editedFeatValue === '' ? feat.value : parseFloat(editedFeatValue),
                    location: editedFeatLocation === null ? feat.location : editedFeatLocation.id,
                    comment: feat.comment,
                    content: editedFeatContent === feat.content ? feat.content : editedFeatContent,
                    adminComment: editedFeatAdminComment,
                    editedFeatLocation,
                    currentFeat: feat
                };

                await featService.update(feat.id, editedFeat, this.props.store.getState().chosenYear, 'editFeat');
                this.setState({ loading: false, loadingActive: false });
                this.props.closeEditMode();
            }
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({ loading: false, loadingActive: true, message: error ? error : 'Editeringen av prestationen misslyckades, pröva igen!'  });
        }
    };

    transition = (props) => {
        return <Slide direction="up" {...props} />;
    };

    render() {
        const locationOptions = this.props.store.getState().locations;
        const drinkOptions = [0,1,2,3,4,5,6,7,8,9,10];
        const feat = this.props.feat;
        const contentKeys = _.keys(feat.content);
        return (
            <div>
                <Dialog fullScreen maxWidth="md" open={this.props.open} TransitionComponent={this.transition} transitionDuration={1000}>
                    <DialogContent style={{ display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center' }}>
                        <Typography variant="h6">Editera prestation</Typography>
                        <form autoComplete="off">
                            <FormControl fullWidth style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <TextField
                                    label="Poäng"
                                    type="number"
                                    name="editedFeatValue"
                                    value={this.state.editedFeatValue}
                                    onChange={(event) => {
                                        this.setState({ editedFeatValue: event.target.value });
                                    }}
                                />
                                <FormHelperText>Välj nya poäng</FormHelperText>
                            </FormControl>
                            <FormControl fullWidth style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <InputLabel>Plats</InputLabel>
                                <Select
                                    value={this.state.editedFeatLocationName}
                                    onChange={(event) => {
                                        this.setState({ editedFeatLocationName: event.target.value });
                                    }}
                                >
                                    {locationOptions.map(location =>
                                        <MenuItem key={location.name} value={location.name}>{location.name}</MenuItem>)
                                    }
                                </Select>
                                <FormHelperText>Välj ny plats</FormHelperText>
                            </FormControl>
                            <FormControl fullWidth style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <div>
                                    <Grid container spacing={24}>
                                        <Grid item xs>
                                            {_.map(contentKeys, (drink, i) => {
                                                if(i > 3) {
                                                    return null;
                                                } else {
                                                    return(
                                                        <FormControl key={drink} fullWidth style={{ marginTop: '10px', marginBottom: '10px' }}>
                                                            <InputLabel>{drink}</InputLabel>
                                                            <Select
                                                                value={this.state.editedFeatContent[drink]}
                                                                onChange={(event) => {
                                                                    const newEditedFeatContent = { ...this.state.editedFeatContent };
                                                                    newEditedFeatContent[drink] = event.target.value;
                                                                    this.setState({
                                                                        editedFeatContent: newEditedFeatContent
                                                                    });
                                                                }}>
                                                                {drinkOptions.map(option =>
                                                                    <MenuItem key={option}
                                                                        value={option}>{option}</MenuItem>)
                                                                }
                                                            </Select>
                                                        </FormControl>
                                                    );
                                                }
                                            })}
                                        </Grid>
                                        <Grid item xs>
                                            {_.map(contentKeys, (drink, i) => {
                                                if(i < 4) {
                                                    return null;
                                                } else {
                                                    return(
                                                        <FormControl key={drink} fullWidth style={{ marginTop: '10px', marginBottom: '10px' }}>
                                                            <InputLabel>{drink}</InputLabel>
                                                            <Select
                                                                value={this.state.editedFeatContent[drink]}
                                                                onChange={(event) => {
                                                                    const newEditedFeatContent = { ...this.state.editedFeatContent };
                                                                    newEditedFeatContent[drink] = event.target.value;
                                                                    this.setState({
                                                                        editedFeatContent: newEditedFeatContent
                                                                    });
                                                                }}>
                                                                {drinkOptions.map(option =>
                                                                    <MenuItem key={option}
                                                                        value={option}>{option}</MenuItem>)
                                                                }
                                                            </Select>
                                                        </FormControl>
                                                    );
                                                }
                                            })}
                                        </Grid>
                                    </Grid>
                                </div>
                            </FormControl>
                            <FormControl fullWidth style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <TextField
                                    label="Domarkommentar"
                                    type="text"
                                    name="editedFeatAdminComment"
                                    value={this.state.editedFeatAdminComment}
                                    onChange={(event) => {
                                        this.setState({ editedFeatAdminComment: event.target.value });
                                    }}
                                />
                                <FormHelperText>Skriv en kommentar</FormHelperText>
                            </FormControl>
                        </form>
                    </DialogContent>
                    <Loading active={this.state.loadingActive} loading={this.state.loading} message={this.state.message}/>
                    <DialogActions style={{ paddingBottom: '20px', paddingRight: '20px' }}>
                        <Button style={{ margin: '5px' }} variant="contained" onClick={this.props.closeEditMode} color="secondary">Tillbaka</Button>
                        <div style={{ position: 'relative' }}>
                            <Button style={{ margin: '5px' }} variant="contained" color="primary" onClick={this.editFeat}>Spara</Button>
                        </div>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default FeatEditFormDialog;