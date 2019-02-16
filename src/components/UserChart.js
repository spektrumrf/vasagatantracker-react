import React from 'react';
import { TimeSeries } from 'pondjs';
import { format } from 'd3-format';
import { Resizable, LineChart, YAxis, Charts, ChartRow, ChartContainer, Legend, styler } from 'react-timeseries-charts';
import _ from 'lodash';
import moment from 'moment';
import CircularProgress from '../../node_modules/@material-ui/core/CircularProgress/CircularProgress';


class CrossHairs extends React.Component {
    render() {
        const { x, y } = this.props;
        const style = { pointerEvents: 'none', stroke: '#ccc' };
        if (!_.isNull(x) && !_.isNull(y)) {
            return (
                <g>
                    <line style={style} x1={0} y1={y} x2={this.props.width} y2={y} />
                    <line style={style} x1={x} y1={0} x2={x} y2={this.props.height} />
                </g>
            );
        } else {
            return <g />;
        }
    }
}

class UserChart extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            tracker: null,
            x: null,
            y: null
        };
    }

    async componentDidMount() {
        this.initData();
    }

    async componentDidUpdate() {
        const feats = this.props.store.getState().feats;
        const users = this.props.store.getState().users;
        if (feats !== this.state.feats || users !== this.state.users) {
            this.initData();
        }
    }

    initData = () => {
        const colors = ['red', 'green', 'blue', 'orange', 'purple', 'magenta', 'lime', 'teal', 'brown', 'maroon', 'olive', 'navy', 'grey', 'black'];
        const users = this.props.store.getState().users;
        const teamUsers = users.filter(u => u.type === 'team');
        const feats = this.props.store.getState().feats;

        const maxTeamPoints = _(teamUsers)
            .map(user => {
                return feats.reduce((sum, feat) => {
                    if (user.id === feat.user && feat.approved) {
                        return sum + feat.value;
                    } else {
                        return sum;
                    }
                }, 0);
            })
            .max();

        const columns = _.reduce(teamUsers, (columns, team) => {
            return _.concat(columns, team.id);
        }, ['time']);

        const style = styler(_.map(teamUsers, (user, i) => {
            return { key: user.id, color: colors[i] };
        }));
        this.setState({ maxTeamPoints, users, feats, teamUsers, columns, style });
    };

    userChartData = () => {
        const columns = this.state.columns;
        const teams = this.state.teamUsers;
        const approvedFeats = this.state.feats
            .filter(f => {
                const featUser = _.find(this.state.users, user => user.id === f.user);
                return f.approved && featUser.type === 'team';
            })
            .sort((f1, f2) => moment.unix(f1.date).diff(moment.unix(f2.date)));

        if(!approvedFeats || approvedFeats.length === 0){
            return null;
        }

        const startNode = _.reduce(teams, (startNode) => {
            return _.concat(startNode, 0);
        }, [this.props.store.getState().startDate*1000]);

        const teamPoints = _.reduce(teams, (teamPoints, team) => {
            teamPoints[team.id] = 0;
            return teamPoints;
        }, {});

        const data = _.reduce(approvedFeats, (dataArray, feat) => {
            const date = feat.date*1000;
            const newDataEntry = _.map(columns, column => {
                if(column === 'time') {
                    return date;
                } else if(feat.user === column) {
                    teamPoints[column] += feat.value;
                    return teamPoints[column];
                } else {
                    return teamPoints[column];
                }
            });
            return _.concat(dataArray, [newDataEntry]);
        }, [startNode]);

        return new TimeSeries({
            name: 'Poäng',
            columns: columns,
            points: data
        });
    };

    handleTrackerChanged = tracker => {
        if (!tracker) {
            this.setState({ tracker, x: null, y: null });
        } else {
            this.setState({ tracker });
        }
    };

    handleMouseMove = (x, y) => {
        this.setState({ x, y });
    };

    render() {
        if(!this.state.teamUsers || !this.state.maxTeamPoints || !this.state.columns || !this.state.style){
            return null;
        }
        const f = format('.1f');
        const teamUsers = this.state.teamUsers;
        const columns = this.state.columns;
        const maxTeamPoints = this.state.maxTeamPoints;
        const style = this.state.style;

        const series = this.userChartData();

        const labels = _.map(teamUsers, user => {
            const label = { key: user.id, label: user.username };
            if (this.state.tracker) {
                const index = series.bisect(this.state.tracker);
                const trackerEvent = series.at(index);
                label.value = `${f(trackerEvent.get(user.id))}`;
            }
            return label;
        });

        return (
            <div style={{ marginTop: '30px' }}>
                {series ?
                    <div>
                        <Resizable>
                            <ChartContainer
                                titleStyle={{ fill: '#555', fontWeight: 500 }}
                                timeRange={series.range()}
                                onBackgroundClick={() => this.setState({ selection: null })}
                                onMouseMove={(x, y) => this.handleMouseMove(x, y)}
                                timeAxisAngledLabels={true}
                                timeAxisHeight={65}
                                format="%H:%M:%S"
                                onTrackerChanged={this.handleTrackerChanged}
                            >
                                <ChartRow height="300">
                                    <YAxis
                                        id="sp"
                                        label="Poäng (sp)"
                                        min={0}
                                        max={maxTeamPoints}
                                        width="60"
                                        format={f}
                                    />
                                    <Charts>
                                        <LineChart
                                            axis="sp"
                                            breakLine={false}
                                            interpolation="curveBasis"
                                            columns={columns.slice(1)}
                                            series={series}
                                            style={style}
                                            highlight={this.state.highlight}
                                            onHighlightChange={highlight =>
                                                this.setState({ highlight })
                                            }
                                            selection={this.state.selection}
                                            onSelectionChange={selection =>
                                                this.setState({ selection })
                                            }/>
                                        <CrossHairs x={this.state.x} y={this.state.y} />
                                    </Charts>
                                </ChartRow>
                            </ChartContainer>
                        </Resizable>
                        <Legend
                            type="line"
                            align="right"
                            style={this.state.style}
                            highlight={this.state.highlight}
                            onHighlightChange={highlight => this.setState({ highlight })}
                            selection={this.state.selection}
                            onSelectionChange={selection => this.setState({ selection })}
                            categories={labels}
                        />
                    </div> : <CircularProgress/>}
            </div>
        );
    }
}

export default UserChart;