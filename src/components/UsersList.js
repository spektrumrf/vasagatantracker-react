import React from 'react';
import User from './User';
import _ from 'lodash';
import { Grid, Table, TableHeaderRow } from '@devexpress/dx-react-grid-material-ui';
import { IntegratedSorting, SortingState } from '@devexpress/dx-react-grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

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
        const state = this.props.store.getState();
        const TableRow = ({ row, ...restProps }) => (
            <Table.Row
                {...restProps}
                onClick={() => {
                    if (_.get(state.user, 'type') === 'admin') {
                        this.setState({ clickedUserId: row.id });
                    }
                }}
            />
        );
        const columns = [
            { name: 'name', title: 'Namn' },
            { name: 'points', title: 'Poäng' },
            { name: 'pointsCoefficient', title: 'Poäng med koefficient' },
        ];
        const columnExtensions = [
            { columnName: 'name', width: 150, wordWrapEnabled: true },
            { columnName: 'points', width: 100 },
            { columnName: 'pointsCoefficient', width: 180 }];
        const userData = _(this.props.store.getState().users)
            .filter(user => user.type === 'team')
            .map(user => {
                const userPoints = state.feats.reduce((sum, feat) => {
                    if (user.id === feat.user && feat.approved) {
                        return sum + feat.value;
                    } else {
                        return sum;
                    }
                }, 0);
                const userPointsWithCoefficient = Math.round(userPoints * parseFloat(user.coefficient) * 100) / 100;
                return { id: user.id, name: user.name, points: userPoints, pointsCoefficient: userPointsWithCoefficient };
            })
            .value();
        return (
            <div style={{ maxWidth: '430px', marginLeft: 'auto', marginRight: 'auto' }}>
                <Paper>
                    <Grid rows={userData} columns={columns}>
                        <SortingState defaultSorting={[]}/>
                        <IntegratedSorting />
                        <Table rowComponent={TableRow} columnExtensions={columnExtensions} />
                        <TableHeaderRow showSortingControls />
                        <Typography variant="h6" style={{ paddingTop: '10px', paddingLeft: '20px' }}>
                            Lag
                        </Typography>
                    </Grid>
                </Paper>
                <User store={this.props.store} clickedUserId={this.state.clickedUserId} clearClickedUser={this.clearClickedUser}/>
            </div>
        );
    }
}

export default UsersList;