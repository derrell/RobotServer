This code is for the Finch Robot: http://finchrobot.com

==============================================================================

Using the Finch Server / Using JavaScript to talk to the Finch
--------------------------------------------------------------

There are two related, but separate capabilities described here.

1. The Finch Server allows any application which can issue HTTP requests, to
   control the Finch robot and retrieve input from its sensors. Those
   applications may be written in any language.

2. It is also possible to run JavaScript programs, without using the Finch
   Server, to control the Finch.

==============================================================================

Setup
-----

The top-level directory, in which you likely found this README file, should
initially contain the following files and directories:

    alwaysUpHill.js
    bootstrap.js
    build/
    config.json
    debugger.sh
    Finch.js
    generate.py
    jars.linux/
    jars.win/
    libs.linux/
    libs.win/
    readline.js
    README
    README.developer
    server.sh
    services.js
    standalone.sh

1. Although there may be some other, ancillary files in this top-level
    directory, it is important that if you find any files with the extension
    ".jar", ".dll" or ".so" in this directory, that you remove them before
    proceeding with step 2.

Linux instructions
------------------

2a. Copy all of the files from libs-linux/ into this top-level directory. That
    will include libraries for both 32-bit and 64-bit Linux. You may remove
    the one which does not apply to your environment. The file name should
    make it obvious which is which.

2b. Copy all of the files from jars-linux/ into this top-level directory.

2c. Be sure you have libstdc++5 installed: apt-get install libstdc++5

Windows instructions
--------------------

2a: Copy all of the files from libs-win/ into this top-level directory.

2b. Copy all of the files from jars-win/ into this top-level directory.

==============================================================================

Finch Server
------------

Run server.sh, which starts up the server. The server listens on 128.0.0.1,
typically known as "localhost", on port 3000. (See Note, below)

Commands to, and responses from the Finch Server are in JSON-RPC Version 2
format. See http://groups.google.com/group/json-rpc/web/json-rpc-2-0 for
details.

The methods that are available for controlling the Finch, and those methods'
parameters, are documented in Finch.js. To call these methods, create a
JSON-RPC request, in the following format:

  {"jsonrpc":"2.0", "method":"robot.finch.xxx", "params": [yyy, zzz]}
or
  {"jsonrpc":"2.0", "method":"robot.finch.xxx", "params": [yyy, zzz], "id":nnn}

The first element, "jsonrpc":"2.0", is required, unaltered, in every request.

Replace xxx with the name of the method to be called. The parameter list is
enclosed in square brackets, so yyy and zzz are the parameters to the xxx
method. (See below for an alternate encoding to allow named parameters instead
of positional parameters as depicted here.)

Remote procedure calls can be issued with a response requested, or with no
response request. "Set commands" to the Finch, for example, do not return a
useful value, so you needn't request a response. Requests for the obstacle
sensor values, on the other hand, return a meaningful value, so you would want
to request a response. The way that you indicate that no response is desired
is by leaving off the "id" member of the JSON-RPC request, as shown in the
first example above. When a response is desired, you provide an id
value. Replace nnn with a number or string. The response will contain that
same identifier. (Typically you use a numeric id value that is incremented for
each request you issue. In a sophisticated environment, that allows for
multiple requests to be issued concurrently, and to be able to match the
responses, which may be returned in any order, with the requests to which they
apply.)

A real example, using the Finch methods, might look like this:

 { "id":1, "jsonrpc":"2.0", "method":"robot.finch.getObstacleSensors"}

In this case, there were no parameters, so the "params" member was not
included in the request.

The response looks like this:

  {"id":1,"result":{"left":false,"right":false},"jsonrpc":"2.0"}

Notice that the id from the request is echoed back in the response. There is
also a result member which is the specific return value from the method you
called.

If there is an error, then instead of the response containing a "result"
member, it will contain an "error" member, as described in the JSON-RPC
Version 2 specification.

The JSON-RPC request can be sent either as data in a POST request, or
URL-encoded and in a GET request. In either case, the URL for remote procedure
calls is http:localhost:3000/rpc

To issue a query using a POST request, provide the JSON-encoded string as
data in the POST request.

To issue a query using a GET request, URL-encode the JSON-encoded string,
prepend a question mark to it, and append that whole string to the URL. The
above request to obtain the obstacle sensors would then look like this:

  http://localhost:3000/rpc?%7B%22id%22:1,%20%22jsonrpc%22:%222.0%22,%20%22method%22:%22robot.finch.getObstacleSensors%22%7D

Some browsers allow you to pass an unencoded request, so the following, much
simpler-looking request, might work, depending on what you're using to send
the request:

  http://localhost:3000/rpc?{"id":1, "jsonrpc":"2.0", "method":"robot.finch.getObstacleSensors"}

When the RPC method being called requires parameters, they may be passed in
either of two ways: with positional parameters as shown previously, or with
named parameters. The names of the parameters can be found in Finch.js.

The following requests are all equivalent:

 { "jsonrpc":"2.0", "method":"robot.finch.setLED", "params":[0,128,256]}

and

 { "jsonrpc":"2.0", "method":"robot.finch.setLED", "params":{"r":0,"g":128,"b": 256} }

and

 { "jsonrpc":"2.0", "method":"robot.finch.setLED", "params":{"b":256,"g":128,"r":0} }




Note: The port number that the server listens on is specified in bootstrap.js
in the call to the Server() constructor. See the Jetty documentation for the
class org.mortbay.jetty.Server. If you want to listen on an interface other
than localhost, you'll also want to look at the documentation for the class
org.mortbay.jetty.bio.SocketConnector.


==============================================================================

Running JavaScript program to control the Finch
-----------------------------------------------

The standalone.sh script is used to run a JavaScript program that controls the
Finch. There is no server involved in this case; the JavaScript program
directly interfaces with the Finch to control it.

The available methods are the same as when using the server, and are available
in Finch.js.

An example is provided in alwaysUpHill.js. In this application, after
calibrating, the Finch will always try to move up hill.

To run the example, type "standalone.sh alwaysUpHill.js"
