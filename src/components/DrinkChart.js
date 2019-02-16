import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import _ from 'lodash';

class DrinkChart extends React.Component{

    drinkChartData = () => {
        const drinks = { öl: 0, cider: 0, lonkero: 0, vin: 0, drink: 0, mat: 0, shot: 0, annat: 0 };
        let drinkChartData = [];
        const approvedFeats = this.props.store.getState().feats.filter(f => f.approved);
        const drinkTotals = approvedFeats.reduce((data, feat) => {
            const featContent = feat.content;
            const newData = data;
            _.forEach(newData, (value, key) => {
                newData[key] += featContent[key];
            });
            return newData;
        }, drinks);
        _.forEach(drinkTotals, (value, key) => {
            drinkChartData = _.concat(drinkChartData, { name: key, antal: value });
        });
        return drinkChartData;
    };

    render() {
        return (
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={this.drinkChartData()}
                    margin={{ top: 80, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Tooltip/>
                    <Legend/>
                    <Bar dataKey="antal" fill='pink'/>
                </BarChart>
            </ResponsiveContainer>
        );
    }
}

export default DrinkChart;