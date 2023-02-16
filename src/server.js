import axios from 'axios';
import chalk from 'chalk';
import {v4 as uuid} from 'uuid';
import app from './app';
import connection from './database/config';

import TransportDriver from './models/TransportDriver';
import VehicleSubTypeIcon from './models/VehicleSubTypeIcon';
import VehicleIcon from './models/VehicleIcon';
import Ride from "./models/Ride";
import RunningService from "./models/RunningService";

const port = process.env.APP_PORT || 3000;

const sessions = {}

const server = app.listen(port, () => {
    console.log(chalk.white.bgGreen(`Server is running on port ${port}`))

    connection.connect(function (err) {
        if (err) {
            console.error("Error connecting to the database: " + err.stack);
            return;
        }
        console.log(chalk.bold.greenBright("Connected to the database as " + process.env.DB_DATABASE));
    });
});

//business logic

const getDriverInfo = async (id) => {
    try {
        const data = [];
        data['handicap'] = 0;
        data['child_seat'] = 0;
        data['icon'] = '';
        const transportDriver = await TransportDriver.findOne({
            where: {user_id: id}
        });
        if (transportDriver) {
            data['handicap'] = transportDriver.handicap;
            data['child_seat'] = transportDriver.child_seat;
            const vehicleSubTypeIcon = await VehicleSubTypeIcon.findOne({
                where: {vehicle_sub_type_id: transportDriver.vehicle_sub_type_id}
            });
            if (vehicleSubTypeIcon) {
                const vehicleIcon = await VehicleIcon.findOne({
                    where: {id: vehicleSubTypeIcon.vehicle_icon_id}
                });
                if (vehicleIcon) {
                    data['icon'] = vehicleIcon.icon;
                }
            }

        }
        return data;
    } catch (error) {
        console.log(error);
    }
}

const updateLocation = async (id, currentLat, currentLong) => {
    try {
        const transportDriver = await TransportDriver.findOne({where: {user_id: id}})
            .then(transportDriverResult => {
                // Check if record exists in db
                if (transportDriverResult) {
                    transportDriverResult.update(
                        {current_lat: currentLat, current_long: currentLong}
                    );
                }
            });
        return transportDriver;
    } catch (error) {
        console.log(error);
    }
}

const getRide = async (id) => {
    try {
        const ride = await Ride.findOne({
            where: {id: id}
        });
        return ride;
    } catch (error) {
        console.log(error);
    }
}

const getRunningService = async (seller_id) => {
    try {
        const runningService = await RunningService.findOne({
            where: {seller_id: seller_id}
        });
        return runningService;
    } catch (error) {
        console.log(error);
    }
}

const updateRidePath = async (id, lat, long) => {
    try {
        const updatePath = await Ride.findOne({where: {id: id}})
            .then(rideResult => {
                if (rideResult) {
                    console.log(rideResult);
                    let ridePaths = [];
                    if (rideResult.ride_path) {
                        for (var i in rideResult.ride_path)
                            ridePaths.push(rideResult.ride_path[i]);
                    }
                    console.log('path:');
                    const paths = ridePaths;
                    const data = {};
                    data.time = new Date().toISOString();
                    data.lat = lat;
                    data.long = long
                    paths.push(data);
                    console.log(paths);
                    rideResult.update({'ride_path': paths});
                }
            });
        return updatePath;
    } catch (error) {
        console.log(error);
    }
}
// updateRidePath(2185, 34.23423, 45.4234234);
//business logic end

// Intialize Socket
const io = require("socket.io")(server, {
    cors: {origin: "*"}
});

let userSessionId = uuid();

async function checkToken(token) {
    try {
        const response = await axios.get(`${process.env.API_URL}/v1/verify-user`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        });
        if (response) {
            sessions[userSessionId] = response.data.data.id;
            return true;
        }
        return false
    } catch (error) {
        return false;
    }
    ;
}

// Middleware function for authentication
async function authenticate(headers) {
    const token = headers.token;
    if (!token) {
        return false;
    }

    const isValid = await checkToken(token);
    return isValid;
}

// Setup Socket IO.
io.on('connection', (socket) => {
    console.log(`Client connected! ${socket.id}`);

    console.log(`Token is: ${socket.handshake.auth.token ? true : false}`);

    io.use(async (socket, next) => {
        const isAuthenticated = await authenticate(socket.handshake.auth);

        if (!isAuthenticated) {
            return next(new Error('Unauthorized'));
        }
        console.log(chalk.magentaBright('Authorized success!'));
        return next();
    });

    //nearby drivers
    socket.on(`driver-location.${sessions[userSessionId]}`, async (data, callback) => {
        console.log(`driver location userId: ${data.user_id}`);
        callback({
            status: "200",
            data: data
        });
        const driverInfo = getDriverInfo(data.user_id);
        const location = {
            driver_id: data.user_id,
            current_lat: data.current_lat,
            current_long: data.current_long,
            handicap: 0,
            child_seat: 0,
            icon: ''
        };
        driverInfo.then(result => {
            updateLocation(data.user_id, data.current_lat, data.current_long);
            location.handicap = result['handicap'];
            location.child_seat = result['child_seat'];
            location.icon = result['icon'];

            // mysql query start
            connection.query(`SELECT id,
                                     name,
                                     current_lat,
                                     current_long,
                                     (
                                             6371 * acos(
                                                         cos(radians(${data.current_lat}))
                                                         * cos(radians(current_lat))
                                                         * cos(radians(current_long) - radians(${data.current_long}))
                                                     + sin(radians(${data.current_lat}))
                                                             * sin(radians(current_lat))
                                             )
                                         ) AS distance
                              FROM users
                              HAVING distance < ${5}
                              ORDER BY distance`, function (
                error,
                results,
                fields
            ) {
                if (error) {
                    console.error("Error executing query: " + error.stack);
                }
                console.log(results);
                for (let i = 0; i < results.length; i++) {
                    if (data.user_id != results[i].id) {
                        console.log('user_app_id: ' + results[i].id);
                        socket.broadcast.volatile.emit(`nearby-drivers.${results[i].id}`, location);
                    }
                }
            });
            // mysql query end
        })

    });
    //nearby drivers end

    //my driver location
    socket.on(`ride-path-update.${sessions[userSessionId]}`, async (data, callback) => {
        callback({
            status: "200",
            data: data
        });
        const ride = getRide(data.ride_id);
        ride.then(rideResult => {
            if (rideResult) {
                const runningService = getRunningService(rideResult.driver_id);
                runningService.then(runningServiceResult => {
                    if (runningServiceResult) {
                        let driverInfo = getDriverInfo(rideResult.driver_id);
                        const location = {
                            driver_id: rideResult.driver_id,
                            current_lat: data.lat,
                            current_long: data.long,
                            icon: ''
                        };
                        driverInfo.then(result => {
                            if (data.pickup) updateLocation(rideResult.driver_id, data.lat, data.long);
                            else updateRidePath(rideResult.id, data.lat, data.long);
                            location.handicap = result['handicap'];
                            location.child_seat = result['child_seat'];
                            location.icon = result['icon'];
                            socket.broadcast.volatile.emit(`my-driver-location-updated.${runningServiceResult.user_id}`, location);
                        });
                    }
                });
            }
        });

    })
    //my driver location end

    socket.on('disconnect', () => {
        console.log('Client disconnected!');
    });
});
