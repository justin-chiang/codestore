import express from 'express';
import passport from 'passport';
import multer from 'multer';

import { uploadFile, getFiles, getFile, deleteFile } from '../controllers/files.controller.js';

const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const router = express.Router();

router.post('/upload', passport.authenticate('jwt', { session: false }), upload.single('file'), uploadFile);
router.get('/files', passport.authenticate('jwt', { session: false }), getFiles);
router.get('/file', passport.authenticate('jwt', { session: false }), getFile);
router.post('/delete', passport.authenticate('jwt', { session: false }), deleteFile);

export default router;
