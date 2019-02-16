const moment = require('moment');

const defaultState = {
    feats: [],
    users: [],
    user: null,
    locations: [],
    chosenYear: moment().year().toString(),
    activeYear: moment().year().toString(),
    startDate: null,
    realtimeCutoffTime: null,
    snackMessage: null,
    snackOpen: false,
    info: {},
    finished: false,
    availableYears: [moment().year().toString()]
};

const vasagatanReducer = (state = defaultState, action) => {
    switch (action.type) {
    case 'UPDATE_CHOSEN_YEAR':
        return { ...state, chosenYear: action.chosenYear };
    case 'UPDATE_ACTIVE_YEAR':
        return { ...state, activeYear: action.activeYear };
    case 'UPDATE_START_DATE':
        return { ...state, startDate: action.startDate };
    case 'UPDATE_CUTOFF_TIME':
        return { ...state, realtimeCutoffTime: action.realtimeCutoffTime };
    case 'UPDATE_YEAR_PROPERTIES':
        return { ...state, realtimeCutoffTime: action.realtimeCutoffTime, startDate: action.startDate, info: action.info, finished: action.finished };
    case 'UPDATE_AVAILABLE_YEARS':
        return { ...state, availableYears: action.availableYears };
    case 'UPDATE_USER':
        return { ...state, user: action.user };
    case 'UPDATE_FEATS':
        return { ...state, feats: action.feats };
    case 'UPDATE_USERS':
        return { ...state, users: action.users };
    case 'UPDATE_SNACK':
        return { ...state, snackMessage: action.message, snackOpen: action.open };
    case 'UPDATE_LOCATIONS':
        return { ...state, locations: action.locations };
    case 'LOGIN':
        return { ...state, user: action.user };
    case 'LOGOUT':
        return { ...state, user: null };
    default:
        return state;
    }
};

export default vasagatanReducer;