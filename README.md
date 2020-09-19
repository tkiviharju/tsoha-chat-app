# Real-time chat application 

## University of Helsinki - DB application course project
https://hy-tsoha.github.io/materiaali/index

### Project Description
* The application has different channels where the messaging takes place
* Users can create an account, create channels and send messages
* Users can also edit and delete messages they have created
* Users can create private channels where only the users that are invited by the channel's creator can participate in
* Messages can be searched 
* A list of users that are online is displayed on the side of the application
* The messaging in the channels happens in real-time using websockets
* All messages are saved to a database


### Start app
## Backend
`uvicorn main:app --reload`

## Frontend 
`npm start`