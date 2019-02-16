import React from 'react';
import Location from './Location';
import MUIDataTable from 'mui-datatables';
import localisation from '../localisation';
import _ from 'lodash';

class LocationsList extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            clickedLocationId: null
        };
    }

    clearClickedLocation = () => () => {
        setTimeout(() => this.setState({ clickedLocationId: null }), 1000);
    };

    render() {
        const columns = [
            {
                name: 'Id',
                options: {
                    display: 'excluded',
                    filter: false,
                    sort: false
                }
            },
            {
                name: 'Namn',
                options: {
                    filter: false,
                    sort: false
                }
            },
            {
                name: 'Prestationer',
                options: {
                    filter: false,
                    sort: true
                }
            },
            {
                name: 'Poäng',
                options: {
                    filter: false,
                    sort: true
                }
            },
            {
                name: 'Medeltalspoäng',
                options: {
                    filter: false,
                    sort: true
                }
            }];
        const locationData = _(this.props.store.getState().locations)
            .map(location => {
                const state = this.props.store.getState();
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
                return [location.id, location.name, locationFeats, locationPoints, averageLocationPoints];
            })
            .value();
        const options = {
            responsive: 'scroll',
            pagination: false,
            selectableRows: false,
            filter: false,
            print: false,
            download: false,
            onRowClick: (rowData) => {
                const user = this.props.store.getState().user;
                if (_.get(user, 'type') === 'admin') {
                    this.setState({ clickedLocationId: rowData[0] });
                }
            },
            textLabels: localisation
        };
        return (
            <div>
                <MUIDataTable
                    title={'Platser'}
                    data={locationData}
                    columns={columns}
                    options={options}
                />
                <Location store={this.props.store} clickedLocationId={this.state.clickedLocationId} clearClickedLocation={this.clearClickedLocation} snack={this.props.snack}/>
            </div>
        );
    }
}

export default LocationsList;