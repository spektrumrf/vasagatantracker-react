import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useParams, useLocation, Navigate } from 'react-router-dom';
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
/* import Menu from '@material-ui/icons/Menu';
import ChatIcon from '@material-ui/icons/Chat'; */
import CircularProgress from '@material-ui/core/CircularProgress';
import Chat from '../components/Chat';
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

function Year(props) {
    const state = props.store.getState();

    const [unsubs, setUnsubs] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
    const { year }= useParams();
    const location = useLocation();

    useEffect(async () => {
        window.Chart = require('chart.js');
        props.store.dispatch({ type: 'UPDATE_CHOSEN_YEAR', chosenYear: year });
        await initData();
        return async function cleanup() {
            unsubs.forEach(unsub => unsub());
            await firestore.getAuth().signOut();
        };
    }, [year]);

    async function initData() {
        const state = props.store.getState();

        unsubs.forEach(unsub => unsub());
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

        props.store.dispatch({
            type: 'UPDATE_USER',
            user
        });

        const properties = await firestore.getDatabase().get();
        const activeYearProperties = properties.data();
        console.log(activeYearProperties);
        props.store.dispatch({
            type: 'UPDATE_YEAR_PROPERTIES',
            startDate: activeYearProperties.startDate,
            realtimeCutoffTime: activeYearProperties.realtimeCutoffTime,
            endDate: activeYearProperties.endDate,
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

        registerRealtimeDataCallbacks();
    }

    async function logout() {
        await firestore.getAuth().signOut();
        window.localStorage.removeItem('loggedFeatappUser');
        props.store.dispatch({
            type: 'LOGOUT'
        });
        props.store.dispatch({ type: 'UPDATE_CHOSEN_YEAR', chosenYear: props.year });
        await initData();
    }

    function registerRealtimeDataCallbacks() {
        const locationsCollection = firestore.getCollection('locations');
        const usersCollection = firestore.getCollection('users');
        const featsCollection = firestore.getCollection('feats');
        const commentsCollection = firestore.getCollection('comments');
        const activeYearDoc = firestore.getProperties().doc('activeYear');
        const activeYearPropertiesDoc = firestore.getDatabase();
        const availableYearsCollection = firestore.getYears();

        let activeYearUnsub = activeYearDoc.onSnapshot(snapshot => {
            const data = snapshot.data();
            if (data) {
                const activeYear = data.activeYear.toString();
                props.store.dispatch({
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
                props.store.dispatch({
                    type: 'UPDATE_YEAR_PROPERTIES',
                    startDate: activeYearProperties.startDate,
                    endDate: activeYearProperties.endDate,
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
                props.store.dispatch({
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
            props.store.dispatch({
                type: 'UPDATE_LOCATIONS',
                locations: sortedLocations
            });
        }, () => {
        });

        let usersUnsub = usersCollection.onSnapshot(snapshot => {
            const users = snapshot.docs.map(doc => doc.data());
            const sortedUsers = users.sort((u1, u2) => u2.points - u1.points);
            props.store.dispatch({
                type: 'UPDATE_USERS',
                users: sortedUsers
            });
        }, () => {
        });

        let featsUnsub = () => {};
        let ownFeatsUnsub = () => {};
        const state = props.store.getState();
        if (state.user && (state.user.type === 'admin' || state.finished)) {
            featsUnsub = featsCollection.onSnapshot(snapshot => {
                const feats = snapshot.docs.map(doc => doc.data());
                const sortedFeats = feats.sort((f1, f2) => moment.unix(f2.date).diff(moment.unix(f1.date)));
                props.store.dispatch({
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
                props.store.dispatch({
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
                props.store.dispatch({
                    type: 'UPDATE_FEATS',
                    feats: sortedFeats
                });
            }, () => {
            });
        }

        let commentsUnsub = commentsCollection.onSnapshot( async snapshot => {
            const comments = snapshot.docs.map(doc => doc.data());
            const sortedComments = comments.sort((f1, f2) => moment.unix(f2.date).diff(moment.unix(f1.date)));
            props.store.dispatch({
                type: 'UPDATE_COMMENTS',
                comments: sortedComments
            });
        }, () => {

        });

        setUnsubs([locationsUnsub, usersUnsub, featsUnsub, activeYearUnsub, activeYearPropertiesUnsub, availableYearsUnsub, ownFeatsUnsub, commentsUnsub]);
    }

    const setDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    const setChatDrawer = (open) => () => {
        setChatDrawerOpen(open);
    };

    const menuList = (
        <div style={{ maxWidth: '200px' }}>
            <List component="nav">
                <ListItem button component={Link} to={`/year/${year}`} data-next={true}>
                    <ListItemText primary="Hemsida"/>
                </ListItem>
                {state.user &&
                    <ListItem button component={Link} to={`/year/${year}/recentfeats`} data-next={true}>
                        <ListItemText primary="Senaste prestationer"/>
                    </ListItem>}
                {state.user &&
                    <ListItem button component={Link} to={`/year/${year}/feats`} data-next={true}>
                        <ListItemText primary={state.user.type === 'team' ? 'Egna prestationer' : 'Alla prestationer'}/>
                    </ListItem>}
                {state.user &&
                    <ListItem button component={Link} to={`/year/${year}/users`} data-next={true}>
                        <ListItemText primary="Lag"/>
                    </ListItem>}
                {state.user &&
                    <ListItem button component={Link} to={`/year/${year}/locations`} data-next={true}>
                        <ListItemText primary="Platser"/>
                    </ListItem>}
                {state.user &&
                    <ListItem button component={Link} to={`/year/${year}/statistics`} data-next={true}>
                        <ListItemText primary="Statistik"/>
                    </ListItem>}
                {state.user && state.user.type === 'admin' &&
                    <ListItem button component={Link} to={`/year/${year}/admin`} data-next={true}>
                        <ListItemText primary="Admin"/>
                    </ListItem>}
            </List>
            <Divider/>
            <List>
                {state.user ?
                    <ListItem button component={Link} to={`/year/${year}`} data-next={true}
                        onClick={logout}>
                        <ListItemText primary={`Logga ut som ${state.user.name}`}/>
                    </ListItem> :
                    <ListItem button component={Link} to={`/year/${year}/login`} data-next={true}>
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
        chatButton: {
            marginRight: -10,
        },
    };
    return (
        <div style={{ marginLeft: '20px', marginRight: '20px', marginBottom: '100px' }}>
            <div style={styles.root}>
                <AppBar position="fixed">
                    <Toolbar style={{ display: 'flex', alignItems: 'center' }} variant="dense">
                        <div>
                            <IconButton style={styles.menuButton} color="inherit" aria-label="Menu"
                                onClick={setDrawer(true)}>
                                {/* <Menu/> */}
                            </IconButton>
                        </div>
                        <div>
                            <Typography variant="h6" color="inherit" style={styles.grow}>
                                        VasagatanTracker {props.year}
                            </Typography>
                        </div>
                        {state.user &&
                                <div style={{ marginLeft: 'auto' }}>
                                    <IconButton style={styles.chatButton} color="inherit" aria-label="Chat"
                                        onClick={setChatDrawer(true)}>
                                        {/* <ChatIcon/> */}
                                    </IconButton>
                                </div>}
                    </Toolbar>
                </AppBar>
            </div>
            <SwipeableDrawer open={drawerOpen} onOpen={setDrawer(true)}
                onClose={setDrawer(false)}>
                <div
                    tabIndex={0}
                    role="button"
                    onClick={setDrawer(false)}
                    onKeyDown={setDrawer(false)}
                >
                    {menuList}
                </div>
            </SwipeableDrawer>
            {state.user &&
                    <SwipeableDrawer anchor="right" open={chatDrawerOpen} onOpen={setChatDrawer(true)}
                        onClose={setChatDrawer(false)}>
                        <div
                            tabIndex={0}
                            role="button"
                        >
                            <Chat store={props.store}/>
                        </div>
                    </SwipeableDrawer>}
            <Routes>
                {state.user ?
                    <>
                        <Route path='' element={<AsyncHome store={props.store}/>}/>
                        <Route path='recentfeats' element={<AsyncRecentFeats store={props.store}/>}/>
                        <Route path='feats' element={<AsyncFeats store={props.store}/>}/>
                        <Route path='users' element={<AsyncUsers store={props.store}/>}/>
                        <Route path='statistics' element={<AsyncStatistics store={props.store}/>}/>
                        <Route path='locations' element={<AsyncLocations store={props.store}/>}/>
                        {state.user.type === 'admin' &&
                          <Route path='admin' element={<AsyncAdmin store={props.store}/>}/>
                        }
                    </> :
                    <>
                        <Route path='' element={<AsyncHome store={props.store}/>}/>
                        <Route path="/*" element={ <Navigate to='login'/>}/>
                    </>
                }
                <Route path='login'
                    element={<AsyncLogin store={props.store} unsubs={unsubs}
                        realtime={registerRealtimeDataCallbacks}/>}/>

            </Routes>
        </div>
    );
}

export default Year;