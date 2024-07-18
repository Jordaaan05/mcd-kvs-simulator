## To run:
Execute `npm start` in the kvs-frontend directory.

## Before first use:
Please ensure that you have created the .env file, as otherwise the server will not be accessible to the app.

## ENV File format:
There env file should contain the following:

REACT_APP_SERVER_ADDRESS = http://{address}
REACT_APP_SERVER_PORT = {port_that_backend_is_running_on}
REACT_APP_PORT = {port_that_you_want_the_app_to_use}

Where address can be one of a few things, depending on where you want the app to be accessed from;
1. address: localhost, for when you want the app to be accessed only by the machine it is running on
2. address: 192.168..., the address of the machine it is running on, on your local network, for where you want to be able to access the app from any device on your local network that has access to a web browser. (NOTE: the app is NOT designed for use on mobile devices.)
3. address: your public facing IP address, for if you (for some stupid reason) want the app to be accessible from any device in the world. I would HIGHLY recommend against doing this. If you are for some reason choosing this, ensure that you have correct port forwarding setup for the app and for the server.
If you have a CDN setup pointing towards your machine, you can also use this... but I will not offer support towards using this as you likely already know what you're doing, and it is not a recommended use case for this program.

Also note the two seperate ports, the BACKEND (SERVER_PORT) is the one that your kvs-backend server is running on, by default this is 5000,
the REACT_APP_PORT is the one that you access through your browser, and is set to 3000 by default.