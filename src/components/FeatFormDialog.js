import React from 'react';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Typography from '@material-ui/core/Typography';
import ImageCompressor from 'image-compressor.js';
import featService from '../services/feats';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Fab from '../../node_modules/@material-ui/core/Fab/Fab';
import Add from '@material-ui/icons/Add';
import Slide from "../../node_modules/@material-ui/core/Slide/Slide";
import Loading from "./Loading";
import _ from 'lodash';
import uuid from 'uuid/v4';

class FeatFormDialog extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            newFiles: [],
            newFeatValue: '',
            newFeatLocationName: '',
            newFeatComment: '',
            open: false,
            loading: false,
            loadingActive: false,
            message: ''
        };
    }

    addFeat = async () => {
        try {
            this.setState({ loading: true, loadingActive: true, message: ''  });
            const newFeatValue = this.state.newFeatValue;
            const newFeatLocationName = this.state.newFeatLocationName;
            const newFeatLocation = this.props.store.getState().locations.find(l => l.name === newFeatLocationName);
            const newFeatComment = this.state.newFeatComment;

            if (newFeatValue < 0 || newFeatValue > 15 || !newFeatValue) {
                return this.setState({ loading: false, loadingActive: true, message: 'Poängantalet är för litet, för stort, eller saknas' });
            }

            if (!newFeatLocation) {
                return this.setState({ loading: false, loadingActive: true, message: 'Välj en plats' });
            }

            if (this.state.newFiles.length === 0) {
                return this.setState({ loading: false, loadingActive: true, message: 'Ladda upp åtminstone ett bevis' });
            }
            if ((newFeatLocation.name === 'Bonusuppgift' || newFeatLocation.name === 'Övrig') && newFeatComment === '') {
                return this.setState({ loading: false, loadingActive: true, message: 'Lämna en förklarande kommentar om du vill spara en bonusuppgift eller om platsen inte finns i listan.'  });
            }

            const state = this.props.store.getState();

            const proofs = [];
            for (let file of this.state.newFiles) {
                if (file.type.includes('image')) {
                    const compressedImage = await this.processImage(file);
                    const imageBase64 = await this.getBase64(compressedImage);
                    proofs.push(imageBase64);
                } else {
                    return this.setState({ loading: false, loadingActive: true, message: 'Endast bilder duger som bevis!'  });
                }
            }
            const feat = {
                id: uuid(),
                value: parseFloat(newFeatValue),
                location: newFeatLocation.id,
                user: state.user.id,
                comment: newFeatComment,
                content: { öl: 0, cider: 0, lonkero: 0, vin: 0, drink: 0, mat: 0, shot: 0, annat: 0 },
                adminComment: '',
                proofs
            };

            await featService.create(feat, state.chosenYear);

            this.setState({
                newFiles: [],
                open: false,
                loading: false,
                loadingActive: false,
                message: ''
            });
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            this.setState({ loading: false, loadingActive: true, message: error ? error : 'Skapandet av prestationen misslyckades, pröva igen!' });
        }
    };

    processImage = async (image) => {
        const imageCompressor = new ImageCompressor();
        return await imageCompressor.compress(image, {
            quality: 0.8,
            maxWidth: 1400
        });
    };

    getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    handleFileChange = (event) => {
        if (event) {
            this.setState({ newFiles: event.target.files.length === 0 ? [] : event.target.files });
        } else {
            this.setState({ newFiles: [] });
        }
    };

    transition = (props) => {
        return <Slide direction="up" {...props} />;
    };

    closeDialog = () => {
        this.setState({ open: false, loading: false, loadingActive: false, message: ''  });
    };

    render() {
        const locationOptions = this.props.store.getState().locations;
        const fabStyle = {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            height: '60px',
            width: '60px',
            zIndex: 4
        };

        return (
            <div>
                <Fab color="primary" size="large" style={fabStyle} onClick={() => {
                    this.setState({ open: true });
                }}>
                    <Add/>
                </Fab>
                <Dialog fullScreen maxWidth="md" open={this.state.open} TransitionComponent={this.transition} transitionDuration={1000}>
                    <DialogContent style={{ display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center' }}>
                        <Typography variant="h5">Ny prestation</Typography>
                        <form autoComplete="off">
                            <FormControl fullWidth style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <TextField
                                    label="Poäng"
                                    type="number"
                                    name="newFeatValue"
                                    value={this.state.newFeatValue}
                                    onChange={(event) => {
                                        this.setState({ newFeatValue: event.target.value });
                                    }}
                                />
                                <FormHelperText>0-15, skriv 0 om oklart</FormHelperText>
                            </FormControl>
                            <FormControl fullWidth style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <InputLabel>Plats</InputLabel>
                                <Select
                                    value={this.state.newFeatLocationName}
                                    onChange={(event) => {
                                        this.setState({ newFeatLocationName: event.target.value });
                                    }}>
                                    {locationOptions.map(location =>
                                        <MenuItem key={location.name} value={location.name}>{location.name}</MenuItem>)
                                    }
                                </Select>
                                <FormHelperText>Specialkrogar märkta med *</FormHelperText>
                            </FormControl>
                            <FormControl fullWidth style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <TextField
                                    label="Kommentar"
                                    type="text"
                                    name="newFeatComment"
                                    value={this.state.newFeatComment}
                                    onChange={(event) => {
                                        this.setState({ newFeatComment: event.target.value });
                                    }}
                                />
                            </FormControl>
                            <FormControl style={{ marginTop: '20px', marginBottom: '10px' }} fullWidth>
                                <Button component="label" variant="outlined" color="primary">
                                    {this.state.newFiles.length === 0 ? 'Ladda upp bevis' : `${this.state.newFiles.length} st. bevis valda`}
                                    <input style={{ display: 'none' }} type='file' id='newFiles' multiple name='newFiles' accept='image/*' onChange={this.handleFileChange}/>
                                </Button>
                            </FormControl>
                            <div style={{ alignItems: 'left' }}>
                                <Typography variant="h6">Poänglista</Typography>
                                <Typography variant="body1">Krog på Vasagatan (minst 3 sp), obesökt, 2sp</Typography>
                                <Typography variant="body1">Krog på Vasagatan (minst 3 sp), besökt, 1sp</Typography>
                                <Typography variant="body1">Öl/cider/lonkero, 0,33 l, 0,75 sp</Typography>
                                <Typography variant="body1">Öl/cider/lonkero, 0,4 l, 1 sp</Typography>
                                <Typography variant="body1">Öl/cider/lonkero, 0,5 l, 1,25 sp</Typography>
                                <Typography variant="body1">Vin/drink/mat, 1 sp</Typography>
                                <Typography variant="body1">Shot, 0,75 sp</Typography>
                            </div>
                        </form>
                    </DialogContent>
                    <Loading active={this.state.loadingActive} loading={this.state.loading} message={this.state.message}/>
                    <DialogActions style={{ paddingBottom: '20px', paddingRight: '20px' }}>
                        <Button variant="contained" color="secondary" onClick={this.closeDialog}>Stäng</Button>
                        <Button variant="contained" onClick={this.addFeat} color="primary">Skapa</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default FeatFormDialog;