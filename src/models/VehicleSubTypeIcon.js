import {Sequelize, DataType} from 'sequelize';
import sequelize from '../database/sequelize';

const TransportDriver = sequelize.define("VehicleSubTypeIcon", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    vehicle_sub_type_id: {
        type: Sequelize.INTEGER
    },
    vehicle_icon_id: {
        type: Sequelize.INTEGER
    }
},{tableName: 'vehicle_sub_type_icons'});

export default TransportDriver;