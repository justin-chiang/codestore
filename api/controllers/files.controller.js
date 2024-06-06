import { s3 } from '../services/s3.js';

const BUCKET_NAME = 'codespace-files';

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Error uploading file',
                error: 'Request does not contain file'
            });
        }

        const fileName = `${req.user.username}/${req.file.originalname}`;
        const fileBody = req.file.buffer;

        console.log(fileName);
        console.log(fileBody);

        await s3.uploadResource(BUCKET_NAME, fileName, fileBody);
        console.log('File uploaded successfully: ', `${req.file.originalname}`);
        res.status(201).json({
            message: 'File uploaded successfully',
            fileName: `${req.file.originalname}`
        });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({
            message: 'Error uploading file',
            error: err
        });
    }
};

const getFiles = async (req, res) => {};

const getFile = async (req, res) => {
    try {
        const { fileName } = req.body;
        if (!fileName) {
            return res.status(400).json({
                message: 'Error retrieving file',
                error: 'Request does not contain filename'
            });
        }

        await s3.getResource(BUCKET_NAME, fileName);
        console.log('File retrieved successfully: ', `${fileName}`);
        res.status(201).json({
            message: 'File retrieved successfully',
            fileName: `${fileName}`
        });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({
            message: 'Error retrieving file',
            error: err
        });
    }
};

const deleteFile = async (req, res) => {
    try {
        const { fileName } = req.body;
        if (!fileName) {
            return res.status(400).json({
                message: 'Error deleting file',
                error: 'Request does not contain filename'
            });
        }

        const path = `${req.user.username}/${fileName}`;

        await s3.deleteResource(BUCKET_NAME, path);
        console.log('File deleted successfully: ', `${fileName}`);
        res.status(201).json({
            message: 'File deleted successfully',
            fileName: `${fileName}`
        });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({
            message: 'Error deleting file',
            error: err
        });
    }
};

export { uploadFile, getFiles, getFile, deleteFile };
