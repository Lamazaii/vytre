import createError from 'http-errors';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
// eslint-disable-next-line n/no-extraneous-import
import swaggerUi from 'swagger-ui-express';
// eslint-disable-next-line n/no-extraneous-import
import swaggerJsdoc from 'swagger-jsdoc';

import indexRouter from './src/routes/index.router';
import usersRouter from './src/routes/users.router';

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // URL de votre client Vite
  credentials: true
}));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vytre API',
      version: '1.0.0',
      description: 'API documentation for Vytre project',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);

// view engine setup
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(
    function (err: Error, req: Request, res: Response, _next: NextFunction) {
    // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        if ('status' in err) {
            res.status(err.status as number);
        } else {
            res.status(500);
        }

        // render the error page
        res.json({ error: err});
    });

export default app;
