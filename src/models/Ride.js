import {Sequelize, DataType} from 'sequelize';
import sequelize from '../database/sequelize';

const Ride = sequelize.define("Ride", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    driver_id: {
        type: Sequelize.INTEGER
    },
    ride_path: {
        type: Sequelize.JSON
    }
},{tableName: 'rides'});

export default Ride;