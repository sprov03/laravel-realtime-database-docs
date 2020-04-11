# Intro

Laravel Realtime database provides a simple way to fully sync a client store across many browsers.  No more manually
firing events on the api, and manually handing each event on the front end.

## How It Works

Laravel Realtime Database: (LRD)
* Buy Flagging changes to Models, we are able to track changes indirectly.
* Buy Defining a Store, we can Determine when changes need to be pushed to the clients.
* Buy Defining properties on the store (Eloquent Queries) we can determine if the changes should be ignored or not.
* Buy Defining Model Changes we can fine tune the store behavior
* Buy Leveraging Middleware, you can set it and forget it, data will stay in sync if you change the client or the backend.
