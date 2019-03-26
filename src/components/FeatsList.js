import React from 'react';
import firestore from '../firestore';
import Feat from './Feat';
import moment from 'moment';
import _ from 'lodash';
import Paper from '../../node_modules/@material-ui/core/Paper/Paper';
import Typography from '../../node_modules/@material-ui/core/Typography/Typography';
import {
    Grid,
    VirtualTable,
    TableHeaderRow
} from '@devexpress/dx-react-grid-material-ui';
import {
    FilteringState,
    IntegratedFiltering,
    IntegratedSorting,
    SortingState
} from '@devexpress/dx-react-grid';
import Input from '../../node_modules/@material-ui/core/Input/Input';
import FormControl from '../../node_modules/@material-ui/core/FormControl/FormControl';
import InputLabel from '../../node_modules/@material-ui/core/InputLabel/InputLabel';
import Select from '../../node_modules/@material-ui/core/Select/Select';
import MenuItem from '../../node_modules/@material-ui/core/MenuItem/MenuItem';
import Checkbox from '../../node_modules/@material-ui/core/Checkbox/Checkbox';
import ListItemText from '../../node_modules/@material-ui/core/ListItemText/ListItemText';
import MuiGrid from '../../node_modules/@material-ui/core/Grid/Grid';
import FilterList from '../../node_modules/@material-ui/icons/FilterList';
import IconButton from '../../node_modules/@material-ui/core/IconButton/IconButton';

const columns = [
    { name: 'name', title: 'Lag' },
    { name: 'points', title: 'Poäng' },
    { name: 'location', title: 'Plats' },
    { name: 'time', title: 'Tid' },
    { name: 'status', title: 'Status' }
];

const columnExtensions = [
    { columnName: 'name', width: 130, wordWrapEnabled: true },
    { columnName: 'location', width: 110, wordWrapEnabled: true },
    { columnName: 'points', width: 80 },
    { columnName: 'time', width: 90 },
    { columnName: 'status', width: 110 }];

const filterPredicate = (value, filter) => _.isEmpty(filter.value) || _.includes(filter.value, value);

class FeatsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clickedFeatId: null,
            proofs: {},
            filters: [{ columnName: 'status', value: [] }, { columnName: 'name', value: [] }, { columnName: 'location', value: [] }],
            filterVisible: false
        };
    }

    openFeat = async (featId) => {
        try {
            const state = this.props.store.getState();
            const feat = _.find(state.feats, feat => feat.id === featId);

            if(_.get(state.user, 'type') === 'team' && feat.user !== _.get(state.user, 'id')){
                return;
            }

            if (_.isEmpty(this.state.proofs[featId])) {
                this.setState({ clickedFeatId: featId });
                const proofPromises = feat.proofs ? feat.proofs.map(proofFilename => {
                    const proofRef = firestore.getStorage().ref().child(`proofs/${proofFilename}`);
                    return proofRef.getDownloadURL();
                }) : [];
                const proofs = await Promise.all(proofPromises)
                    .catch((error) => {
                        console.log('Något bevis kunde inte hittas, sorry!', error);
                    });
                const newState = this.state;
                newState.proofs[featId] = proofs ? proofs : [];
                this.setState(newState);
            } else {
                this.setState({ clickedFeatId: featId });
            }
        } catch(exception){
            const error = _.get(exception, 'request.data.error');
            console.log(error ? error : 'Något katastrofalt har inträffat... Försök igen om en stund!!' );
        }
    };

    clearClickedFeat = () => () => {
        setTimeout(() => this.setState({ clickedFeatId: null }), 1000) ;
    };

    handleStatusFilterChange = (event) => {
        let newFilters = [...this.state.filters];
        newFilters[0] = { columnName: 'status', value: event.target.value };
        this.setState({ filters: newFilters });
    };

    handleTeamFilterChange = (event) => {
        let newFilters = [...this.state.filters];
        newFilters[1] = { columnName: 'name', value: event.target.value };
        this.setState({ filters: newFilters });
    };

    handleLocationFilterChange = (event) => {
        let newFilters = [...this.state.filters];
        newFilters[2] = { columnName: 'location', value: event.target.value };
        this.setState({ filters: newFilters });
    };

    TableRow = ({ row, ...restProps }) => (
        <Table.Row
            {...restProps}
            onClick={() => this.openFeat(row.id)}
            style={{ backgroundColor: row.approved ? '#d6ffd6' : '#ffcccb' }}
        />
    );

    render() {
        const state = this.props.store.getState();
        const user = state.user;
        let featData = state.feats
            .filter(feat => this.props.filter === 'all' || feat.user === user.id || _.get(user, 'type') === 'admin')
            .map(feat => {
                const location = state.locations.find(loc => loc.id === feat.location);
                const user = state.users.find(user => user.id === feat.user);
                return { id: feat.id, name: user.name, points: `${feat.value} sp`, location: location.name, time: moment.unix(feat.date).format('HH:mm:ss'), status: feat.approved ? 'Godkänd' : 'Inte godkänd', approved: feat.approved };
            });
        if(this.props.filter === 'all') {
            featData = featData.filter(feat => feat.approved).slice(0,10);
        }
        const title = this.props.filter === 'all' ? 'Senaste prestationer' : (_.get(user, 'type') === 'admin' ? 'Alla prestationer' : 'Egna prestationer');
        return (
            <div style={{ maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto' }}>
                <Paper>
                    <Grid rows={featData} columns={columns}>
                        <FilteringState filters={this.state.filters} />
                        <IntegratedFiltering columnExtensions={[
                            { columnName: 'status', predicate: filterPredicate },
                            { columnName: 'name', predicate: filterPredicate },
                            { columnName: 'location', predicate: filterPredicate },
                        ]}/>
                        <SortingState defaultSorting={[]}/>
                        <IntegratedSorting />
                        <VirtualTable rowComponent={this.TableRow} columnExtensions={columnExtensions} />
                        <TableHeaderRow showSortingControls />
                        <div style={{ display: 'flex', paddingTop: '10px', paddingLeft: '20px' }}>
                            <Typography variant="h6">{title}</Typography>
                            <IconButton style={{ marginTop: '10px', marginLeft: 'auto' }} onClick={() => this.setState({ filterVisible: !this.state.filterVisible })}>
                                <Typography>{this.state.filterVisible ? 'Dölj filtren' : 'Visa filtren'}</Typography>
                                <FilterList style={{ marginLeft: '5px' }}/>
                            </IconButton>
                        </div>
                        {this.state.filterVisible &&
                        <MuiGrid container spacing={16} style={{ paddingLeft: '30px', paddingRight: '20px' }}>
                            <MuiGrid container spacing={16}>
                                <MuiGrid item xs={6}>
                                    <FormControl style={{ marginBottom: '10px' }} fullWidth>
                                        <InputLabel htmlFor="select-multiple-checkbox">Lag</InputLabel>
                                        <Select
                                            multiple
                                            value={this.state.filters[1].value}
                                            onChange={this.handleTeamFilterChange}
                                            input={<Input id="select-multiple-checkbox" />}
                                            renderValue={selected => selected.join(', ')}
                                        >
                                            {_(state.users).filter(user => user.type === 'team').map(user => (
                                                <MenuItem key={user.id} value={user.name}>
                                                    <Checkbox checked={_.includes(this.state.filters[1].value, user.name)} />
                                                    <ListItemText primary={user.name} />
                                                </MenuItem>
                                            )).value()}
                                        </Select>
                                    </FormControl>
                                </MuiGrid>
                                <MuiGrid item xs={6}>
                                    <FormControl style={{ marginBottom: '10px' }} fullWidth>
                                        <InputLabel htmlFor="select-multiple-checkbox">Godkännande</InputLabel>
                                        <Select
                                            multiple
                                            value={this.state.filters[0].value}
                                            onChange={this.handleStatusFilterChange}
                                            input={<Input id="select-multiple-checkbox" />}
                                            renderValue={selected => selected.join(', ')}
                                        >
                                            <MenuItem key={0} value={'Godkänd'}>
                                                <Checkbox checked={_.includes(this.state.filters[0].value, 'Godkänd')} />
                                                <ListItemText primary={'Godkänd'} />
                                            </MenuItem>
                                            <MenuItem key={1} value={'Inte godkänd'}>
                                                <Checkbox checked={_.includes(this.state.filters[0].value, 'Inte godkänd')} />
                                                <ListItemText primary={'Inte godkänd'} />
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </MuiGrid>
                            </MuiGrid>
                            <MuiGrid container spacing={16}>
                                <MuiGrid item xs={6}>
                                    <FormControl style={{ marginBottom: '10px' }} fullWidth>
                                        <InputLabel htmlFor="select-multiple-checkbox">Platser</InputLabel>
                                        <Select
                                            multiple
                                            value={this.state.filters[2].value}
                                            onChange={this.handleLocationFilterChange}
                                            input={<Input id="select-multiple-checkbox" />}
                                            renderValue={selected => selected.join(', ')}
                                        >
                                            {_(state.locations).map(location => (
                                                <MenuItem key={location.id} value={location.name}>
                                                    <Checkbox checked={_.includes(this.state.filters[2].value, location.name)} />
                                                    <ListItemText primary={location.name} />
                                                </MenuItem>
                                            )).value()}
                                        </Select>
                                    </FormControl>
                                </MuiGrid>
                            </MuiGrid>
                        </MuiGrid>}
                    </Grid>
                </Paper>
                <Feat store={this.props.store} clickedFeatId={this.state.clickedFeatId} proof={this.state.proofs} clearClickedFeat={this.clearClickedFeat}/>
            </div>
        );
    }
}

export default FeatsList;