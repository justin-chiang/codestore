import express from 'express';
import passport from 'passport';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import filesRoutes from './routes/files.routes.js';
import './config/passport-config.js';

const app = express();
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/files', filesRoutes);

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Codestore',
            version: '1.0.0'
        }
    },
    apis: ['./api/routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
