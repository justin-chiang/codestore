import AWS from 'aws-sdk';
import 'dotenv/config';

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const storage = new AWS.S3();

const uploadResource = async (bucket, key, body, contentType) => {
    const params = {
        Bucket: bucket,
        Key: key,
        Body: body
    };
    if (contentType) {
        params.ContentType = contentType;
    }

    await storage.upload(params).promise();
};

const getResource = async (bucket, key) => {
    const params = {
        Bucket: bucket,
        Key: key
    };

    const data = await storage.getObject(params).promise();
    console.log(data);
    return data;
};

const deleteResource = async (bucket, key) => {
    const params = {
        Bucket: bucket,
        Key: key
    };

    await storage.deleteObject(params).promise();
};

export const s3 = {
    uploadResource,
    getResource,
    deleteResource
};
