import React from 'react';
import { HashRouter as Router, Link, Route, Redirect } from 'react-router-dom';
import firestore from '../firestore';
import featService from '../services/feats';
import userService from '../services/users';
import locationService from '../services/locations';
import propertiesService from '../services/properties';
import List from '@material-ui/core/List';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Menu from '@material-ui/icons/Menu';
import CircularProgress from '@material-ui/core/CircularProgress';
import moment from 'moment';
import _ from 'lodash';
import Loadable from 'react-loadable';

const Loading = (props) => <div style={{ display: 'flex', justifyContent: 'center' }}><CircularProgress/></div>;
const AsyncHome = Loadable({ loader: () => import('./Home'), loading: Loading });
const AsyncRecentFeats = Loadable({ loader: () => import('./RecentFeats'), loading: Loading });
const AsyncFeats = Loadable({ loader: () => import('./Feats'), loading: Loading });
const AsyncUsers = Loadable({ loader: () => import('./Users'), loading: Loading });
const AsyncStatistics = Loadable({ loader: () => import('./Statistics'), loading: Loading });
const AsyncLocations = Loadable({ loader: () => import('./Locations'), loading: Loading });
const AsyncAdmin = Loadable({ loader: () => import('./Admin'), loading: Loading });
const AsyncLogin = Loadable({ loader: () => import('./Login'), loading: Loading });

class Year extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            unsubs: [],
            drawerOpen: false
        };
    }

    async componentDidUpdate(prevProps) {
        if (this.props.year !== prevProps.year) {
            await this.logout();
            this.props.store.dispatch({ type: 'UPDATE_CHOSEN_YEAR', chosenYear: this.props.year });
            await this.initData();
        }
    }

    async componentDidMount() {
        window.Chart = require('chart.js');
        this.props.store.dispatch({ type: 'UPDATE_CHOSEN_YEAR', chosenYear: this.props.year });
        await this.initData();
    }

    async componentWillUnmount() {
        this.state.unsubs.forEach(unsub => unsub());
        await firestore.getAuth().signOut();
    }

    initData = async () => {
        const state = this.props.store.getState();

        this.state.unsubs.forEach(unsub => unsub());
        firestore.setAppYear(state.chosenYear);

        const loggedUserJSON = window.localStorage.getItem('loggedFeatappUser');
        firestore.getAuth().onAuthStateChanged(async function(user) {
            if (user) {
                await user.getIdToken(true);
            }
        });

        let user = null;
        if (loggedUserJSON) {
            user = JSON.parse(loggedUserJSON);
            featService.setToken(user.token);
            userService.setToken(user.token);
            locationService.setToken(user.token);
            propertiesService.setToken(user.token);
        } else {
            firestore.getAuth().signInAnonymously()
                .catch((error) => {
                    console.log('Anonymous sign in error:', error);
                });
        }

        const properties = await firestore.getDatabase().get();
        const activeYearProperties = properties.data();
        this.props.store.dispatch({
            type: 'UPDATE_YEAR_PROPERTIES',
            startDate: activeYearProperties.startDate,
            realtimeCutoffTime: activeYearProperties.realtimeCutoffTime,
            finished: activeYearProperties.finished,
            info: {
                what: activeYearProperties.what,
                why: activeYearProperties.why,
                when: activeYearProperties.when,
                where: activeYearProperties.where,
                start: activeYearProperties.start,
                finish: activeYearProperties.finish,
                registration: activeYearProperties.registration,
                details: activeYearProperties.details,
                important: activeYearProperties.important
            }
        });

        this.props.store.dispatch({
            type: 'UPDATE_USER',
            user
        });

        this.registerRealtimeDataCallbacks();
    };

    logout = async () => {
        await firestore.getAuth().signOut();
        window.localStorage.removeItem('loggedFeatappUser');
        this.props.store.dispatch({
            type: 'LOGOUT'
        });
        this.props.store.dispatch({ type: 'UPDATE_CHOSEN_YEAR', chosenYear: this.props.year });
        await this.initData();
    };

    registerRealtimeDataCallbacks = () => {
        const locationsCollection = firestore.getCollection('locations');
        const usersCollection = firestore.getCollection('users');
        const featsCollection = firestore.getCollection('feats');
        const activeYearDoc = firestore.getProperties().doc('activeYear');
        const activeYearPropertiesDoc = firestore.getDatabase();
        const availableYearsCollection = firestore.getYears();

        let activeYearUnsub = activeYearDoc.onSnapshot(snapshot => {
            const data = snapshot.data();
            if (data) {
                const activeYear = data.activeYear.toString();
                this.props.store.dispatch({
                    type: 'UPDATE_ACTIVE_YEAR',
                    activeYear
                });
            }
        }, () => {
        });

        let activeYearPropertiesUnsub = activeYearPropertiesDoc.onSnapshot(snapshot => {
            const data = snapshot.data();
            if (data) {
                const activeYearProperties = data;
                this.props.store.dispatch({
                    type: 'UPDATE_YEAR_PROPERTIES',
                    startDate: activeYearProperties.startDate,
                    realtimeCutoffTime: activeYearProperties.realtimeCutoffTime,
                    finished: activeYearProperties.finished,
                    info: {
                        what: activeYearProperties.what,
                        why: activeYearProperties.why,
                        when: activeYearProperties.when,
                        where: activeYearProperties.where,
                        start: activeYearProperties.start,
                        finish: activeYearProperties.finish,
                        registration: activeYearProperties.registration,
                        details: activeYearProperties.details,
                        important: activeYearProperties.important
                    }
                });
            }
        }, () => {
        });

        let availableYearsUnsub = availableYearsCollection.onSnapshot(snapshot => {
            const data = snapshot.docs.map(doc => doc.data());
            if (data) {
                const availableYears = _(data)
                    .map(year => year.year)
                    .reverse()
                    .value();
                this.props.store.dispatch({
                    type: 'UPDATE_AVAILABLE_YEARS',
                    availableYears
                });
            }
        }, () => {
        });

        let locationsUnsub = locationsCollection.onSnapshot(snapshot => {
            const locations = snapshot.docs.map(doc => doc.data());
            const sortedLocations = locations.sort((l1, l2) => {
                const name1 = l1.name.toLowerCase();
                const name2 = l2.name.toLowerCase();
                if (name1 < name2) return -1;
                if (name2 < name1) return 1;
                return 0;
            });
            this.props.store.dispatch({
                type: 'UPDATE_LOCATIONS',
                locations: sortedLocations
            });
        }, () => {
        });

        let usersUnsub = usersCollection.onSnapshot(snapshot => {
            const users = snapshot.docs.map(doc => doc.data());
            const sortedUsers = users.sort((u1, u2) => u2.points - u1.points);
            this.props.store.dispatch({
                type: 'UPDATE_USERS',
                users: sortedUsers
            });
        }, () => {
        });

        let featsUnsub = () => {};
        let ownFeatsUnsub = () => {};
        const state = this.props.store.getState();
        if (state.user && (state.user.type === 'admin' || state.finished)) {
            featsUnsub = featsCollection.onSnapshot(snapshot => {
                const feats = snapshot.docs.map(doc => doc.data());
                const sortedFeats = feats.sort((f1, f2) => moment.unix(f2.date).diff(moment.unix(f1.date)));
                this.props.store.dispatch({
                    type: 'UPDATE_FEATS',
                    feats: sortedFeats
                });
            }, () => {
            });
        } else if (state.user) {
            ownFeatsUnsub = featsCollection.where('user', '==', state.user.id).onSnapshot(async snapshot => {
                const userFeats = snapshot.docs.map(doc => doc.data());
                const realtimeFeatsSnap = await featsCollection.where('date', '<', state.realtimeCutoffTime).where('approved', '==', true).get();
                const realtimeFeats = realtimeFeatsSnap.docs.map(doc => doc.data());
                const feats = _.unionBy(userFeats, realtimeFeats, 'id');
                const sortedFeats = feats.sort((f1, f2) => moment.unix(f2.date).diff(moment.unix(f1.date)));
                this.props.store.dispatch({
                    type: 'UPDATE_FEATS',
                    feats: sortedFeats
                });
            }, () => {
            });
            featsUnsub = featsCollection.where('date', '<', state.realtimeCutoffTime).where('approved', '==', true).onSnapshot(async snapshot => {
                const realtimeFeats = snapshot.docs.map(doc => doc.data());
                const userFeatsSnap = await featsCollection.where('user', '==', state.user.id).get();
                const userFeats = userFeatsSnap.docs.map(doc => doc.data());
                const feats = _.unionBy(userFeats, realtimeFeats, 'id');
                const sortedFeats = feats.sort((f1, f2) => moment.unix(f2.date).diff(moment.unix(f1.date)));
                this.props.store.dispatch({
                    type: 'UPDATE_FEATS',
                    feats: sortedFeats
                });
            }, () => {
            });
        }

        this.setState({
            unsubs: [locationsUnsub, usersUnsub, featsUnsub, activeYearUnsub, activeYearPropertiesUnsub, availableYearsUnsub, ownFeatsUnsub]
        });
    };

    toggleDrawer = (open) => () => {
        this.setState({ drawerOpen: open });
    };

    render() {
        const state = this.props.store.getState();

        const menuList = (
            <div>
                <List component="nav">
                    <ListItem button component={Link} to={`/year/${this.props.year}`} data-next={true}>
                        <ListItemText primary="Hemsida"/>
                    </ListItem>
                    {state.user &&
                    <ListItem button component={Link} to={`/year/${this.props.year}/recentfeats`} data-next={true}>
                        <ListItemText primary="Senaste prestationer"/>
                    </ListItem>}
                    {state.user &&
                    <ListItem button component={Link} to={`/year/${this.props.year}/feats`} data-next={true}>
                        <ListItemText primary={state.user.type === 'team' ? 'Egna prestationer' : 'Alla prestationer'}/>
                    </ListItem>}
                    {state.user &&
                    <ListItem button component={Link} to={`/year/${this.props.year}/users`} data-next={true}>
                        <ListItemText primary="Lag"/>
                    </ListItem>}
                    {state.user &&
                    <ListItem button component={Link} to={`/year/${this.props.year}/locations`} data-next={true}>
                        <ListItemText primary="Platser"/>
                    </ListItem>}
                    {state.user &&
                    <ListItem button component={Link} to={`/year/${this.props.year}/statistics`} data-next={true}>
                        <ListItemText primary="Statistik"/>
                    </ListItem>}
                    {state.user && state.user.type === 'admin' &&
                    <ListItem button component={Link} to={`/year/${this.props.year}/admin`} data-next={true}>
                        <ListItemText primary="Admin"/>
                    </ListItem>}
                </List>
                <Divider/>
                <List>
                    {state.user ?
                        <ListItem button component={Link} to={`/year/${this.props.year}`} data-next={true}
                            onClick={this.logout}>
                            <ListItemText primary={`Logga ut som ${state.user.name}`}/>
                        </ListItem> :
                        <ListItem button component={Link} to={`/year/${this.props.year}/login`} data-next={true}>
                            <ListItemText primary="Logga in"/>
                        </ListItem>}
                </List>
                <Divider/>
                <List>
                    {_.map(state.availableYears, year =>
                        <ListItem key={year} button component={Link} to={`/year/${year}`} data-next={true}>
                            <ListItemText primary={year}/>
                        </ListItem>)
                    }
                </List>
            </div>
        );
        const styles = {
            root: {
                textAlign: 'center',
                marginBottom: '75px'
            },
            grow: {
                flexGrow: 1
            },
            menuButton: {
                marginLeft: -12,
                marginRight: 20,
            },
        };
        return (
            <Router>
                <div style={{ marginLeft: '20px', marginRight: '20px', marginBottom: '100px' }}>
                    <div style={styles.root}>
                        <AppBar position="fixed">
                            <Toolbar style={{ display: 'flex', alignItems: 'center' }} variant="dense">
                                <div>
                                    <IconButton style={styles.menuButton} color="inherit" aria-label="Menu"
                                        onClick={this.toggleDrawer(true)}>
                                        <Menu/>
                                    </IconButton>
                                </div>
                                <div>
                                    <Typography variant="h6" color="inherit" style={styles.grow}>
                                        VasagatanTracker {this.props.year}
                                    </Typography>
                                </div>
                            </Toolbar>
                        </AppBar>
                    </div>
                    <SwipeableDrawer open={this.state.drawerOpen} onOpen={this.toggleDrawer(true)}
                        onClose={this.toggleDrawer(false)}>
                        <div
                            tabIndex={0}
                            role="button"
                            onClick={this.toggleDrawer(false)}
                            onKeyDown={this.toggleDrawer(false)}
                        >
                            {menuList}
                        </div>
                    </SwipeableDrawer>

                    <div>
                        <Route exact path='/year/:year' render={() =>
                            <AsyncHome store={this.props.store}/>
                        }/>
                        <Route exact path='/year/:year/recentfeats' render={({ match }) => {
                            if (state.user) {
                                return <AsyncRecentFeats store={this.props.store}/>;
                            } else {
                                return <Redirect to={`/year/${match.params.year}/login`}/>;
                            }
                        }}/>
                        <Route exact path='/year/:year/feats' render={({ match }) => {
                            if (state.user) {
                                return <AsyncFeats store={this.props.store}/>;
                            } else {
                                return <Redirect to={`/year/${match.params.year}/login`}/>;
                            }
                        }}/>
                        <Route exact path='/year/:year/users' render={({ match }) => {
                            if (state.user) {
                                return <AsyncUsers store={this.props.store}/>;
                            } else {
                                return <Redirect to={`/year/${match.params.year}/login`}/>;
                            }
                        }}/>
                        <Route exact path='/year/:year/statistics' render={({ match }) => {
                            if (state.user) {
                                return <AsyncStatistics store={this.props.store}/>;
                            } else {
                                return <Redirect to={`/year/${match.params.year}/login`}/>;
                            }
                        }}/>
                        <Route exact path='/year/:year/locations' render={({ match }) => {
                            if (state.user) {
                                return <AsyncLocations store={this.props.store}/>;
                            } else {
                                return <Redirect to={`/year/${match.params.year}/login`}/>;
                            }
                        }}/>
                        <Route exact path='/year/:year/admin' render={({ match }) => {
                            if (state.user && state.user.type === 'admin') {
                                return <AsyncAdmin store={this.props.store}/>;
                            } else {
                                return <Redirect to={`/year/${match.params.year}/login`}/>;
                            }
                        }}/>
                        <Route exact path='/year/:year/login'
                            render={({ match }) => {
                                if (state.user) {
                                    return <Redirect to={`/year/${match.params.year}`}/>;
                                } else {
                                    return <AsyncLogin store={this.props.store} unsubs={this.state.unsubs}
                                        realtime={this.registerRealtimeDataCallbacks}/>;
                                }
                            }}/>
                    </div>
                </div>
            </Router>
        );
    }
}

export default Year;