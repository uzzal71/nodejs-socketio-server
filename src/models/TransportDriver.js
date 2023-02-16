import {Sequelize, DataType} from 'sequelize';
import sequelize from '../database/sequelize';

const TransportDriver = sequelize.define("TransportDriver", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    vehicle_sub_type_id: {
        type: Sequelize.INTEGER
    },
    current_lat: {
        type: Sequelize.STRING
    },
    current_long: {
        type: Sequelize.STRING
    },
    handicap: {
        type: Sequelize.INTEGER
    },
    child_seat: {
        type: Sequelize.INTEGER
    }
},{tableName: 'transport_driver'});

export default TransportDriver;