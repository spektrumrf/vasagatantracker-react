import React from 'react';
import firestore from '../firestore';
import Feat from './Feat';
import MUIDataTable from 'mui-datatables';
import moment from 'moment';
import _ from 'lodash';
import localisation from '../localisation';

class FeatsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clickedFeatId: null,
            proofs: {}
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
                const proofPromises = feat.proofs ? feat.proofs.map(proofId => {
                    const proofRef = firestore.getStorage().ref().child(`years/${state.chosenYear}/feats/${feat.id}/proofs/${proofId}.jpg`);
                    return proofRef.getDownloadURL();
                }) : [];
                const proof = await Promise.all(proofPromises);
                const newState = this.state;
                newState.proofs[featId] = proof;
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
                name: 'Lag',
                options: {
                    filter: true,
                    sort: false
                }
            },
            {
                name: 'Poäng',
                options: {
                    filter: false,
                    sort: false
                }
            },
            {
                name: 'Plats',
                options: {
                    filter: true,
                    sort: false
                }
            }, {
                name: 'Tid',
                options: {
                    filter: false,
                    sort: true
                }
            }, {
                name: 'Status',
                options: {
                    filter: true,
                    sort: false
                }
            }];
        const user = this.props.store.getState().user;
        let featData = this.props.store.getState().feats
            .filter(feat => this.props.filter === 'all' || feat.user === user.id || _.get(user, 'type') === 'admin')
            .map(feat => {
                const location = this.props.store.getState().locations.find(loc => loc.id === feat.location);
                const user = this.props.store.getState().users.find(user => user.id === feat.user);
                return [feat.id, user.name, `${feat.value} sp`, location.name, moment.unix(feat.date).format('HH:mm:ss'), feat.approved ? 'Godkänd' : 'Inte godkänd'];
            });
        if(this.props.filter === 'all') {
            featData = featData.slice(0,10);
        }
        const options = {
            responsive: 'scroll',
            pagination: false,
            selectableRows: false,
            filterType: 'multiselect',
            print: false,
            download: false,
            onRowClick: (rowData) => {
                this.openFeat(rowData[0]);
            },
            textLabels: localisation
        };
        const title = this.props.filter === 'all' ? 'Senaste prestationer' : (_.get(user, 'type') === 'admin' ? 'Alla prestationer' : 'Egna prestationer');
        return (
            <div style={{ maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
                <MUIDataTable
                    title={title}
                    data={featData}
                    columns={columns}
                    options={options}
                />
                <Feat store={this.props.store} clickedFeatId={this.state.clickedFeatId} proof={this.state.proofs} clearClickedFeat={this.clearClickedFeat}/>
            </div>
        );
    }
}

export default FeatsList;