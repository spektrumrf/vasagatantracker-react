import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginService from '../services/login';
import featService from '../services/feats';
import userService from '../services/users';
import locationService from '../services/locations';
import propertiesService from '../services/properties';
import firestore from '../firestore';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Loading from './Loading';
import _ from 'lodash';

function LoginForm(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingActive, setLoadingActive] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    async function login(event) {
        event.preventDefault();
        try {
            const usernameTrim = username.trim();

            setLoading(true);
            setLoadingActive(true);
            const user = await loginService.login({ username: usernameTrim, password }, props.store.getState().chosenYear.toString());
            const state = props.store.getState();

            props.unsubs.forEach(unsub => unsub());

            firestore.setAppYear(state.chosenYear);

            window.localStorage.setItem('loggedFeatappUser', JSON.stringify(user));

            await firestore.getAuth().signInWithCustomToken(user.firestoreToken);

            props.store.dispatch({
                type: 'UPDATE_USER',
                user
            });

            const properties = await firestore.getDatabase().get();
            const activeYearProperties = properties.data();
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

            featService.setToken(user.token);
            userService.setToken(user.token);
            locationService.setToken(user.token);
            propertiesService.setToken(user.token);

            setLoading(false);
            setLoadingActive(false);
            props.realtime();
            navigate('..');
        } catch (exception) {
            const error = _.get(exception, 'request.data.error');
            setLoading(false);
            setLoadingActive(true);
            setMessage(error ? error : 'Lösenord eller användarnamn fel, alternativt Act of Ruben');
        }
    }
    return (
        <div style={{ width: 'auto', marginLeft: 'auto', marginRight: 'auto', maxWidth: '500px' }}>
            <Paper style={{ display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center' }}>
                <Typography variant="h5">Logga in</Typography>
                <form style={{ width: '100%' }}>
                    <FormControl margin="normal" fullWidth>
                        <TextField
                            label="Användarnamn"
                            name="username"
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            autoCapitalize="false"
                            autoCorrect="false"
                        />
                    </FormControl>
                    <FormControl margin="normal" fullWidth>
                        <TextField
                            label="Lösenord"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            name="password"
                        />
                    </FormControl>
                    <Loading active={loadingActive} loading={loading} message={message}/>
                    <Button type="submit" style={{ marginTop: '20px' }} variant="contained" color="secondary" onClick={login}>Logga in</Button>
                </form>
            </Paper>
        </div>
    );
}

export default LoginForm;