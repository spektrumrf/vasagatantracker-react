import React from 'react';
import User from './User';
import MUIDataTable from 'mui-datatables';
import _ from 'lodash';
import localisation from '../localisation';

class UsersList extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            clickedUserId: null
        };
    }

    clearClickedUser = () => () => {
        setTimeout(() => this.setState({ clickedUserId: null }), 1000);
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
                name: 'Poäng',
                options: {
                    filter: false,
                    sort: true
                }
            },
            {
                name: 'Poäng med koefficient',
                options: {
                    filter: false,
                    sort: true
                }
            }];
        const userData = _(this.props.store.getState().users)
            .filter(user => user.type === 'team')
            .map(user => {
                const userPoints = this.props.store.getState().feats.reduce((sum, feat) => {
                    if (user.id === feat.user && feat.approved) {
                        return sum + feat.value;
                    } else {
                        return sum;
                    }
                }, 0);
                const userPointsWithCoefficient = Math.round(userPoints * parseFloat(user.coefficient) * 100) / 100;
                return [user.id, user.name, userPoints, userPointsWithCoefficient];
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
                    this.setState({ clickedUserId: rowData[0] });
                }
            },
            textLabels: localisation
        };
        return (
            <div style={{ maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                <MUIDataTable
                    title={'Lag'}
                    data={userData}
                    columns={columns}
                    options={options}
                />
                <User store={this.props.store} clickedUserId={this.state.clickedUserId} clearClickedUser={this.clearClickedUser}/>
            </div>
        );
    }
}

export default UsersList;