# telegram-bot

telegram-bot is an application to track messages from Telegram users by their credentials.

## Installation

The application runs inside a Docker container and interacts with a MongoDB database to store account credentials and messages from the users.

In order to setup the database connection, edit the .env.local or .env.production file and add there the MongoDB connection string, like shown in .env.example.

The port on which the application will be available should also be configured there.

First of all, it's necessary to build the docker container:

```bash
docker build -t telegram-bot .
```

Once the container is built, it's possible to run it:

```bash
docker run -it --name telegram-bot --network host --env-file .env.local telegram-bot
```

Edit the .env.production file and provide it as --env-file to the container in the production environment.

## Usage

Once the container is run, it is possible to view the messages and group them by either the chat title or sender name.

Pressing the expand button at the right of the row will show the Telegram messages.

It is also possible to follow the /#add route and add a new Telegram account, like described here:

[Obtaining api id](https://core.telegram.org/api/obtaining_api_id)

Basically, the phone number, API ID and API Hash are required to start authentication. Once the user receives the one-time code to his phone number and inputs it into the app, his messages start being tracked.


