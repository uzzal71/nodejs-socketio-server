import routes from "./routes";

const configure = (app) => {
    app.use('/', routes);
}

export default configure;