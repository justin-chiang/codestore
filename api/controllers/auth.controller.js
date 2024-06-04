import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { dynamodb } from '../database/dynamodb.js';

const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: 'Error registering user',
                error: 'Request does not contain username or password'
            });
        }

        const existing = await dynamodb.readItem('users', { username });
        if (existing) {
            return res.status(409).json({
                message: 'Error registering user',
                error: 'User with username already exists'
            });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = {
            username,
            password: hash
        };
        await dynamodb.createItem('users', user);

        console.log('Registered successfully: ', user);
        res.status(201).json({
            message: 'Registered successfully',
            user
        });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({
            message: 'Error registering user',
            error: err
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: 'Error logging in user',
                error: 'Request does not contain username or password'
            });
        }

        const user = await dynamodb.readItem('users', { username });
        if (!user) {
            return res.status(404).json({
                message: 'Error logging in user',
                error: 'Cannot find user with specified username'
            });
        }

        const decrypt = await bcrypt.compare(password, user.password);
        if (!decrypt) {
            return res.status(400).json({
                message: 'Error logging in user',
                error: 'Invalid username or password'
            });
        }

        const refreshToken = crypto.randomBytes(64).toString('hex');

        const updateExpression = 'SET refreshToken = :r';
        const expressionAttributeValues = { ':r': refreshToken };
        await dynamodb.updateItem('users', { username }, updateExpression, expressionAttributeValues);

        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });

        console.log('Logged in successfully: ', token, refreshToken);
        res.status(200).json({
            message: 'Logged in successfully',
            token,
            refreshToken
        });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({
            message: 'Error logging in user',
            error: err
        });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                message: 'Error logging out user',
                error: 'Request does not contain refresh token'
            });
        }

        const keyConditionExpression = 'refreshToken = :t';
        const expressionAttributeValues = { ':t': refreshToken };
        const user = await dynamodb.queryItem('users', 'refreshToken-index', keyConditionExpression, expressionAttributeValues);
        if (!user) {
            return res.status(404).json({
                message: 'Error logging out user',
                error: 'Cannot find user associated with refresh token'
            });
        }

        const updateExpression = 'REMOVE refreshToken';
        await dynamodb.updateItem('users', { username: user.username }, updateExpression);

        console.log('Logged out successfully');
        res.status(200).json({
            message: 'Logged out successfully'
        });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({
            message: 'Error logging out user',
            error: err
        });
    }
};

const token = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                message: 'Error creating access token',
                error: 'Request does not contain refresh token'
            });
        }

        const keyConditionExpression = 'refreshToken = :t';
        const expressionAttributeValues = { ':t': refreshToken };
        const user = await dynamodb.queryItem('users', 'refreshToken-index', keyConditionExpression, expressionAttributeValues);
        if (!user) {
            return res.status(404).json({
                message: 'Error creating access token',
                error: 'Cannot find user associated with refresh token'
            });
        }

        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('Access token created successfully', token);
        res.status(200).json({
            message: 'Access token created successfully',
            token
        });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({
            message: 'Error creating access token',
            error: err
        });
    }
};

export { register, login, logout, token };
