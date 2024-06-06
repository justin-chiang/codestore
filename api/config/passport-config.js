import passport from 'passport';
import passportJwt from 'passport-jwt';
import 'dotenv/config';

import { dynamodb } from '../services/dynamodb.js';

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        },
        async (jwtPayload, done) => {
            try {
                const user = await dynamodb.readItem('users', { username: jwtPayload.username });
                console.log('PASSPORT: ', user);
                return done(null, user);
            } catch (err) {
                return done(null, false);
            }
        }
    )
);
