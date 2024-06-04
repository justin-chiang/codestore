import AWS from 'aws-sdk';
import 'dotenv/config';

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const db = new AWS.DynamoDB.DocumentClient();

const createItem = async (tableName, item) => {
    const params = {
        TableName: tableName,
        Item: item
    };
    await db.put(params).promise();
};

const readItem = async (tableName, key) => {
    const params = {
        TableName: tableName,
        Key: key
    };
    const data = await db.get(params).promise();
    return data.Item;
};

const queryItem = async (tableName, indexName, keyConditionExpression, expressionAttributeValues) => {
    const params = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues
    };
    const data = await db.query(params).promise();
    if (data.Items.length === 0) {
        return null;
    }
    return data.Items[0];
};

const updateItem = async (tableName, key, updateExpression, expressionAttributeValues) => {
    const params = {
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression
    };
    if (expressionAttributeValues) {
        params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const data = await db.update(params).promise();
    return data.Item;
};

const deleteItem = async (tableName, key) => {
    const params = {
        TableName: tableName,
        Key: key
    };

    await db.delete(params).promise();
};

export const dynamodb = {
    createItem,
    readItem,
    queryItem,
    updateItem,
    deleteItem
};
