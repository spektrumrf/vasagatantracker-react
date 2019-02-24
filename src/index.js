import ReactDOM from 'react-dom';
import React from 'react';
import VasagatanTracker from './VasagatanTracker';
import vasagatanReducer from './vasagatanReducer';
import { createStore } from 'redux';
import * as serviceWorker from './serviceWorker';

const store = createStore(vasagatanReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const render = () => {
    ReactDOM.render(
        <VasagatanTracker store={store}/>,
        document.getElementById('root')
    );
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();

render();
store.subscribe(render);