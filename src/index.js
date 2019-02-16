import ReactDOM from 'react-dom';
import React from 'react';
import VasagatanTracker from './VasagatanTracker';
import vasagatanReducer from './vasagatanReducer';
import { createStore } from 'redux';

const store = createStore(vasagatanReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const render = () => {
    ReactDOM.render(
        <VasagatanTracker store={store}/>,
        document.getElementById('root')
    );
};

render();
store.subscribe(render);