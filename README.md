# Auction House API by Austin Woo

## Utilizes
 - Serverless
 - AWS (CloudFormation, IAM Management, EventBridge, Simple Message Service, Simple Message Queue, DynamoDB)
 - Auth0
 - Node.js
 - CORS


## Endpoints
### Creating An Auction. 
POST { API_URL }/auction

### Getting All Auctions. 
GET { API_URL }/auctions

### Get Auction by ID. 
GET { API_URL }/auction/:id

### Place a bid on an auction item. 
PATCH { API_URL }/auction/:id/bid

** All request bodies are validated using @middy/validator, schemas located in /src/middlewares/schemas**
