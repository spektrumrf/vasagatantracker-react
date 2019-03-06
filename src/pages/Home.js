import React from 'react';
import FeatFormDialog from '../components/FeatFormDialog';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Countdown from 'react-countdown-now';
import Paper from '../../node_modules/@material-ui/core/Paper/Paper';
import CircularProgress from '../../node_modules/@material-ui/core/CircularProgress/CircularProgress';
import _ from 'lodash';
import moment from 'moment';

const Home = props => {
    const state = props.store.getState();
    const user = state.user;
    const startDate = state.startDate;
    const info = state.info;
    const countdownRenderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
            return <Typography variant="h4">
                {state.activeYear === state.chosenYear ? 'Approbatur i Vasagatan har börjat, lycka till!' : 'Approbatur i Vasagatan är avslutad, buhuu!'}
            </Typography>;
        } else {
            return <Typography variant="h4">{hours} timmar {minutes} minuter {seconds} sekunder</Typography>;
        }
    };
    return (
        <div>
            {user && _.get(user, 'type') !== 'admin' &&
                    <FeatFormDialog store={props.store}/>}
            <div style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '500px' }}>
                <Paper style={{ display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center', textAlign: 'center' }}>
                    {startDate > moment().unix() && <Typography style={{ paddingBottom: '20px' }} variant="h4">Tid till Approbatur i Vasagatan</Typography>}
                    {startDate ?
                        <div style={{ paddingBottom: '20px' }}>
                            <Countdown date={startDate*1000} renderer={countdownRenderer}/>
                        </div> :
                        <div style={{ paddingBottom: '20px' }}>
                            <CircularProgress/>
                        </div>}
                    { !_.isEmpty(info) &&
                        <div>
                            <Typography variant="h6">Vad?</Typography>
                            <Typography variant="body1">{info.what}</Typography>

                            <Typography variant="h6">Varför?</Typography>
                            <Typography variant="body1">{info.why}</Typography>

                            <Typography variant="h6">När?</Typography>
                            <Typography variant="body1">{info.when}</Typography>

                            <Typography variant="h6">Var?</Typography>
                            <Typography variant="body1">{info.where}</Typography>

                            <Typography variant="h6">Start?</Typography>
                            <Typography variant="body1">{info.start}</Typography>

                            <Typography variant="h6">Mål?</Typography>
                            <Typography variant="body1">{info.finish}</Typography>

                            <Typography variant="h6">Anmälan?</Typography>
                            <Typography variant="body1">{info.registration}</Typography>

                            <Typography variant="h6">Detaljerad info?</Typography>
                            <Typography variant="body1"><Link href={info.details}>Approbatur i Vasagatan</Link></Typography>

                            <Typography variant="h6">Viktig info!</Typography>
                            <Typography variant="body1"><Link href={info.important}>Lyssna här</Link></Typography>
                        </div>
                    }
                </Paper>
            </div>
        </div>
    );
};

export default Home;