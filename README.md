## About
A basic whatspp like chat application for frontend for sending, recieving messages from various user with simple google auth

## How to setup
1. Clone this repo using `git clone`
2. Go inside the folder and do `npm install` to install the dependencies
3. Once done with installing do `npm start` to start the server

## Functionality
1. Redux to handle complex states and maintaining state like 
    1. Read, 
    2. Last messages
    3. Fetch chats
    4. Store chats with last message

2. Send, Update and Get all the previous Messages
3. Filter chats based on Read and Unread last messages
4. Get All the user with you are talking and show it in UI
5. Pagination for List of users
6. Reverse pagination for messages
7. Social Authentication with Google Auth
8. Key(Keyboard) based navigation - `keyUP` and `key down` for going up and down in the chat and setting focus, `enter key` outside chat window to open the chat of the user, `enter key` inside chat window to send messages.
9. Count of No. of Unread messages
10. Mark as read option without actually reading the chat



## Decisions
1. Used REST APIs to implement these functionalities while best case is combination of REST APIs and Websocket to efficiently uses
2. Used Combination of React Hooks and Redux for storing chats, and handling state for User Information(list of user with last messages) and messages with useState, useEffect, useRef, redux-toolkit functionalities
3. Used Polling to send and recieve messages with Reverse OnScroll Pagination and update the state with React Hooks with minimal Re-render
4. Used React-router for routing purposes with default route when user has not logged in as `/` and `/chats` when loggedin 
5. Used tailwind css for styling purpose
6. Maintained minimilistic design with focus on user experience.

## Improvements
1. Efficiently use Polling and Websocket for better user experience
2. Design Improvements
3. Efficiently setup a scalable backend for better functionality
4. Efficiently use Pagination with all edge cases
5. Use of hooks like `useMemo()`, `React.momo()`, `useCallback()` to reduce the re-renders
6. Efficient uses of Redux functionalities and remove redux usage if not required
7. Others
