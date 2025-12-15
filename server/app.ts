import createError from 'http-errors';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './src/routes/index.router';
import usersRouter from './src/routes/users.router';

const app = express();

// view engine setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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
