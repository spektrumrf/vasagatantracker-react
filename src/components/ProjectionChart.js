import React from 'react';
import { TimeSeries, TimeRange } from 'pondjs';
import { format } from 'd3-format';
import { Resizable, LineChart, YAxis, Charts, ChartRow, ChartContainer, Legend, styler } from 'react-timeseries-charts';
import _ from 'lodash';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';


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

class ProjectionChart extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            tracker: null,
            x: null,
            y: null
        };
    }

    async componentDidMount() {
        this.projectionData();
    }

    async componentDidUpdate() {
        const feats = this.props.store.getState().feats;
        const users = this.props.store.getState().users;
        if (feats !== this.state.feats || users !== this.state.users) {
            this.projectionData();
        }
    }

    projectionData = () => {
        const state = this.props.store.getState();
        const startDate = state.startDate;
        const colors = ['red', 'green', 'blue', 'orange', 'purple', 'magenta', 'lime', 'teal', 'brown', 'maroon', 'olive', 'navy', 'grey', 'black'];
        const users = state.users;
        const teams = users.filter(u => u.type === 'team');
        const feats = state.feats;

        const columns = _.reduce(teams, (columns, team) => {
            return _.concat(columns, team.id);
        }, ['time']);

        const style = styler(_.map(teams, (user, i) => {
            return { key: user.id, color: colors[i] };
        }));
        const approvedFeats = feats
            .filter(f => {
                const featUser = _.find(teams, user => user.id === f.user);
                return f.approved && featUser.type === 'team' && f.date >= startDate;
            })
            .sort((f1, f2) => moment.unix(f1.date).diff(moment.unix(f2.date)));

        if(!approvedFeats || approvedFeats.length === 0){
            return null;
        }

        const startNode = _.reduce(teams, (startNode) => {
            return _.concat(startNode, 0);
        }, [state.startDate*1000]);

        const teamPoints = _.reduce(teams, (teamPoints, team) => {
            teamPoints[team.id] = 0;
            return teamPoints;
        }, {});


        const data = _.reduce(approvedFeats, (dataArray, feat) => {
            const date = feat.date*1000;
            const endDate = Math.max(state.endDate, feat.date);
            const timeQuotient = (endDate-state.startDate)/(feat.date-state.startDate);
            const newDataEntry = _.map(columns, column => {
                if(column === 'time') {
                    return date;
                } else if(feat.user === column) {
                    teamPoints[column] += feat.value;
                    return teamPoints[column]*timeQuotient;
                } else {
                    return teamPoints[column]*timeQuotient;
                }
            });
            return _.concat(dataArray, [newDataEntry]);
        }, [startNode]);

        let maxProjection = _(data)
            .map(node => _.max(_.tail(node)))
            .max();

        maxProjection = Math.min(maxProjection, 300);

        const series = new TimeSeries({
            name: 'Projektioner',
            columns: columns,
            points: data
        });

        this.setState({ maxProjection, series, feats, teams, users, columns, style });
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
        if(!this.state.teams || !this.state.maxProjection || !this.state.columns || !this.state.style || !this.state.series){
            return null;
        }
        const f = format('.1f');
        const teams = this.state.teams;
        const columns = this.state.columns;
        const maxProjection = this.state.maxProjection;
        const style = this.state.style;

        const series = this.state.series;
        const duration = (moment(series.range().end()).unix()-moment(series.range().begin()).unix())/60;
        const range = new TimeRange(moment(series.range().begin()), moment(series.range().end()).add(duration/20, 'minutes'));

        const labels = _.map(teams, user => {
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
                                timeRange={range}
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
                                        label="Projektion (sp)"
                                        min={0}
                                        max={maxProjection}
                                        width="60"
                                        format={f}
                                    />
                                    <Charts>
                                        <LineChart
                                            axis="sp"
                                            breakLine={false}
                                            interpolation="curveMonotoneX"
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

export default ProjectionChart;