import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();


async function getAuctionsBySellerEmail(seller){
    let auctions;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        KeyConditionExpression: 'seller = :seller',
        ExpressionAttributeValues: {
            ':seller' : seller,
        },
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
    const { email } = event.requestContext.authorizer;
    auctions = await getAuctionsBySellerEmail(email);
    return {
        statusCode: 200,
        body: JSON.stringify(auctions)
    }
}

export const handler = commonMiddleware(getAuctionsBySeller);