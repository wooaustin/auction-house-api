import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctionsBySeller(event, context){
    let auctions;
    const { email } = event.requestContext.authorizer;
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'sellerAndEndDate',
        KeyConditionExpression: 'seller = :seller',
        ExpressionAttributeValues: {
            ':seller' : email,
        },
    };
    try{
        const result = await dynamodb.query(params).promise();
        auctions = result.Items;
    }
    catch(error){
        console.error(error);
        throw new createError.InternalServerError(error);
        
    }
    return {
        statusCode: 200,
        body: JSON.stringify(auctions),
    }
}

export const handler = commonMiddleware(getAuctionsBySeller);