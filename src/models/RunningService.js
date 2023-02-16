import {Sequelize, DataType} from 'sequelize';
import sequelize from '../database/sequelize';

const RunningService = sequelize.define("RunningService", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    seller_id: {
        type: Sequelize.INTEGER
    },
    user_id: {
        type: Sequelize.INTEGER
    }
},{tableName: 'running_services'});

export default RunningService;