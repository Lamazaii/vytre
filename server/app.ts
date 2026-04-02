import createError from 'http-errors';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import createDebug from 'debug';

import documentsRouter from './src/routes/documents.router';

const app = express();
const debug = createDebug('app:server');

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    message: 'Trop de requêtes, réessayez plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173', // URL de votre client Vite
    credentials: true,
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
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/documents', documentsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Log error server-side
    if (isProduction) {
        debug('[ERROR] %s: %s', new Date().toISOString(), err.message);
    }

    const statusCode = 'status' in err ? (err.status as number) : 500;
    res.status(statusCode);

    // Generic error message in production
    res.json({
        message: isProduction
            ? 'Une erreur interne du serveur est survenue'
            : err.message,
    });
});

export default app;
