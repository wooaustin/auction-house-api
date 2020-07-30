import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import validator from '@middy/validator';
import cors from '@middy/http-cors';
import { getAuction } from './getAuctionById'; 
import { uploadPictureToS3 } from '../lib/uploadPictureToS3';
import { setPictureInDynamo } from '../lib/setPictureInDynamo';
import uploadAuctionPictureSchema from '../lib/schemas/uploadAuctionPictureSchema';

export async function uploadAuctionPicture(event){
    const { id } = event.pathParameters;
    const { email } = event.requestContext.authorizer;
    const auction = await getAuction(id);
    
    //Seller validation, only the seller can upload a picture
    if(auction.seller != email){
        throw new createError.Forbidden(`You are not the seller of this item`);
    }
    //Base64 conversion and buffer placement
    const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    let updatedAuction;

    try{
        const pictureUrl = await uploadPictureToS3(auction.id+'.jpg', buffer);
        updatedAuction = await setPictureInDynamo(auction.id, pictureUrl);
    }catch(error){
        console.error(error);
        throw new createError.InternalServerError(error);
    }
    return {
        statusCode: 200,
        body: JSON.stringify({updatedAuction}),
    }
}

export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler())
    .use(validator({ inputSchema: uploadAuctionPictureSchema}))
    .use(cors());