import express from "express";

const router = express.Router();

const getHandler = async (req, res, next) => {
    try {
        res.status(200).send({
            status: 200,
            message: `App is running on port ${ process.env.APP_PORT}`
        });
    } catch (error) {
        res.status(500).send({
            status: 500,
            message: `Internal Server Error`
        });
    }
};

router.get('/', getHandler);


export default router;