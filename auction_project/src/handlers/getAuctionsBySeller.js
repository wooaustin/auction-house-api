import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();


export async function getAuctionsBySellerEmail(email){
    let auctions;
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'seller',
        KeyConditionExpression: ' #seller = :seller',
        ExpressionAttributeValues: {
            ':seller' : email,
        },
        ExpressionAttributeNames: {
            '#seller' : 'seller',
        }
    }

    try{
        const result = await dynamodb.query(params).promise();
        auctions = result.Items;
    }
    catch(error){
        console.error(error);
        throw new createError.InternalServerError(error);
    }
    if(!auctions){
        throw new createError.NotFound(`Auctions with seller "${seller}" not found`);
    }
    return auctions;
}


export async function getAuctionsBySeller(event, context){
    let auctions;
    const { seller } = event.pathParameters;
    auctions = getAuction(id);
    return {
        statusCode: 200,
        body: JSON.stringify(auctions)
    }
}

export const handler = commonMiddleware(getAuctionsBySeller)
    .use(validator({inputSchema: getAuctionsBySeller, useDefaults: true}));