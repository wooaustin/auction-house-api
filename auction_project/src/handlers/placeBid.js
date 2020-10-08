import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { getAuction } from './getAuctionById';
import placeBidSchema from '../lib/schemas/placeBidSchema';
import validator from '@middy/validator';
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
async function placeBid(event, context){
    const { id }  = event.pathParameters;
    const { amount } = event.body;
    const { email } = event.requestContext.authorizer;
    const auction = await getAuction(id);

    //Bid Identity validation
    if(email === auction.seller){
        throw new createError.Forbidden(`You cannot bid on your own auctions`);
    }
    //Avoiding double bidding
    if(email === auction.highestBid.bidder){
        throw new createError.Forbidden(`You are already the highest bidder`);
    }

    //Auction status validation
    if( auction.status != 'OPEN'){
        throw new createError.Forbidden(`You cannot bid on closed auctions`);
    }

    //Auction amount validation
    if( amount <= auction.highestBid.amount){
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}`);
    }

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount, bidder = :bidder',
        ExpressionAttributeValues: {
            ':amount' : amount,
            ':bidder' : email,
        },
        ReturnValues: 'ALL_NEW',
    };


    const sellerSubjectBody = {
        subject: `Your item has a new bid`,
        body: `${email} has placed a bid on your item for ${amount}`,
    }

    const previousBidderSubjectBody = {
        subject: `You have been outbid`,
        body: `${email} has outbid you with the bid price ${amount}`
    }

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: sellerSubjectBody.subject,
            recipient: auction.seller,
            body: sellerSubjectBody.body,
        })
    }).promise();

    const notifyBidder = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: previousBidderSubjectBody.subject,
            recipient: email,
            body: previousBidderSubjectBody.body,
        })
    })

    let updatedAuction;
    try{
        const result = await dynamodb.update(params).promise();
        updatedAuction = result.Attributes;
    }catch(error){
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(updatedAuction),
    };
}

export const handler = commonMiddleware(placeBid)
    .use(validator({inputSchema: placeBidSchema}));