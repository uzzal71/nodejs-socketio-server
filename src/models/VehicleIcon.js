import {Sequelize, DataType} from 'sequelize';
import sequelize from '../database/sequelize';

const TransportDriver = sequelize.define("VehicleSubTypeIcon", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    icon: {
        type: Sequelize.STRING
    }
},{tableName: 'vehicle_icons'});

export default TransportDriver;