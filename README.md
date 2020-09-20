# Real-time chat application

## University of Helsinki - DB application course project

https://hy-tsoha.github.io/materiaali/index

### Project Description

This is a realtime chat application that somewhat tries to mimic Discord/Slack. The UI is a single page app done with React and the backend is a restful API created with Python, FastApi and PostgreSQL.

### Done so far

-   The application has different channels where messaging takes place
-   User can create a username that is persisted in localstorage. The user is saved to db
-   Users can send messages on different channels.
-   The messaging in the channels happens in real-time using websockets

### Still todo

-   Authentication, Authorization & real user management
-   Editing & deleting messages
-   Users should be able to create channels new channels in the UI (now only the POST endpoint exists)
-   Users should be able to create private channels where only the users that are invited by the channel's creator can participate in
-   Searchable channels, users, messages and servers
-   users should be able to reply to specific messages, creating message threads
-   A list of users that are online should be displayed on the side of the application
-   Users should be able to react to messages (like, dislike etc.)
-   New chat servers (that contain a set of channels & messages etc) should be possible to create, join & search
-   Users should be able to join channels instead of seeing all in the sidebar
-   private messaging between users
-   deploy to heroku

### Start app

## Backend

`cd backend`
`pip install -r requirements.txt`
`uvicorn main:app --reload`

## Frontend

`cd frontend`
`npm install`
`npm start`
