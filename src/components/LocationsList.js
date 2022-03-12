import React from 'react';
import Location from './Location';
import _ from 'lodash';
import { Grid, Table, TableHeaderRow } from '@devexpress/dx-react-grid-material-ui';
import { IntegratedSorting, SortingState } from '@devexpress/dx-react-grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

class LocationsList extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            clickedLocationId: null,
        };
    }

    clearClickedLocation = () => () => {
        setTimeout(() => this.setState({ clickedLocationId: null }), 1000);
    };

    render() {
        const state = this.props.store.getState();
        const TableRow = ({ row, ...restProps }) => (
            <Table.Row
                {...restProps}
                onClick={() => {
                    const user = state.user;
                    if (_.get(user, 'type') === 'admin') {
                        this.setState({ clickedLocationId: row.id });
                    }
                }}
            />
        );
        const columns = [
            { name: 'name', title: 'Plats' },
            { name: 'feats', title: 'Prestationer' },
            { name: 'points', title: 'Poäng' },
            { name: 'averagePoints', title: 'Medelpoäng' },
        ];
        const columnExtensions = [
            { columnName: 'name', width: 130, wordWrapEnabled: true },
            { columnName: 'feats', width: 120 },
            { columnName: 'points', width: 100 },
            { columnName: 'averagePoints', width: 130 }];
        const locationData = _(state.locations)
            .map(location => {
                const locationFeats = state.feats.reduce((sum, feat) => {
                    if (location.id === feat.location && feat.approved) {
                        return sum + 1;
                    } else {
                        return sum;
                    }
                }, 0);

                const locationPoints = state.feats.reduce((sum, feat) => {
                    if (location.id === feat.location && feat.approved) {
                        return sum + feat.value;
                    } else {
                        return sum;
                    }
                }, 0);
                const averageLocationPoints = locationFeats === 0 ? 0 : Math.round((locationPoints / locationFeats) * 100) / 100;
                return { id: location.id, name: location.name, feats: locationFeats, points: locationPoints, averagePoints: averageLocationPoints };
            })
            .value();
        return (
            <div style={{ maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                <Paper>
                    <Grid rows={locationData} columns={columns}>
                        <SortingState defaultSorting={[]}/>
                        <IntegratedSorting />
                        <Table rowComponent={TableRow} columnExtensions={columnExtensions} />
                        <TableHeaderRow showSortingControls />
                        <Typography variant="h6" style={{ paddingTop: '10px', paddingLeft: '20px' }}>
                            Platser
                        </Typography>
                    </Grid>
                </Paper>
                <Location store={this.props.store} clickedLocationId={this.state.clickedLocationId} clearClickedLocation={this.clearClickedLocation}/>
            </div>
        );
    }
}

export default LocationsList;