import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeAuction(auction){
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id: auction.id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues:{
            ':status': 'CLOSED',
        },
        ExpressionAttributeNames:{
            '#status' : 'status',
        },
    };

    const result = await dynamodb.update(params).promise();
    const { seller, title, highestBid } = auction;
    const { amount, bidder } = highestBid;

    const subjectBody = {
        subject: '',
        body: ''
    }

    if(amount === 0){
        subjectBody.subject = 'Your item had no bids';
        subjectBody.body = `Your item ${title} had no bids placed`;
    }
    else{
        subjectBody.subject = 'Your item has been sold!';
        subjectBody.body = `Your item ${title} has been sold for ${amount}`;
    }

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: subjectBody.subject,
            recipient: seller,
            body: subjectBody.body,
        })
    }).promise()
    if(amount !== 0){
        const notifyBidder = sqs.sendMessage({
            QueueUrl: process.env.MAIL_QUEUE_URL,
            MessageBody: JSON.stringify({
                subject: 'You won an auction!',
                recipient: bidder,
                body: `You won the auction! ${title} has been sold for ${amount}`,
            })
        }).promise()
        return Promise.all([notifySeller, notifyBidder])
    }

    return Promise.all([notifySeller]);
}