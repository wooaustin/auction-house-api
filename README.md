# Auction House API by Austin Woo

## Utilizes
 - Serverless
 - AWS (CloudFormation, Lambda, IAM Management, EventBridge, Simple Message Service, Simple Message Queue, DynamoDB)
 - Auth0
 - Node.js
 - CORS


## Endpoints
### Creating An Auction. 
POST /auction

### Getting All Auctions. 
GET /auctions

### Get Auction by ID. 
GET /auction/:id

### Place a bid on an auction item. 
PATCH /auction/:id/bid

### Upload base64 image to Amazon S3 bucket
PATCH /auction/:id/picture

#### How it updates
Using Amazon EventBridge, list of auction items are checked for expiration time and closed if expiration time is reached.
processAuctions function in auction_project/src/handlers/processAuctions is run every minute to:
1. Check for expired auctions
2. Closes auctions if they are expired
3. Sends out email notifications to seller/bidder via Amazon Simple Message Queue

#### Data
Auction item data is hosted via Amazon DynamoDB

** All request bodies are validated using @middy/validator, schemas located in auction_project/src/middlewares/schemas**
