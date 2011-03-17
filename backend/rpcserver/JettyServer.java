/*
 * Start-up file for JSON-RPC server, for use with Jetty
 * 
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package rpcserver;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.logging.Logger;
import java.util.logging.Level;

import jsonrpc.JsonRpc;

import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.handler.AbstractHandler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.util.log.Log;

//import edu.cmu.ri.createlab.terk.robot.finch.Finch;

public class JettyServer extends AbstractHandler
{
    protected static JettyApplication application = new JettyApplication(8888);

    public void handle(String target, Request baseRequest,
            HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException
    {
        // The size of the read buffer
        final int BUFFER_SIZE = 8192;

        int length;
        char[] readBuffer = new char[BUFFER_SIZE];
        String result;
        String requestString;
        StringBuffer requestBuffer = new StringBuffer();
        InputStream inputStream = null;
        InputStreamReader reader = null;

        final Logger log = Logger.getLogger(JettyServer.class.getName());
        log.logp(Level.INFO, "JettyServer", "handle", "target=" + target);

        // Is this a remote procedure call request?
        if (!target.equals("/rpc") && !target.startsWith("/rpc?")
                && !target.startsWith("/rpc/"))
        {
            // Nope. Let someone else handle it.
            log.info("Not a remote procedure call request");
            return;
        }

        // Determine the request method. We currently support only POST.
        if (!request.getMethod().equals("POST"))
        {
            log.info("Unexpected data (not POST)");
            response.getWriter().println(
                    "JSON-RPC request expected; "
                            + "unexpected data received (not POST)");
            return;
        }

        // We'll handle this request
        baseRequest.setHandled(true);

        // Get the input stream (the POST data)
        inputStream = request.getInputStream();

        // Create a stream reader
        reader = new InputStreamReader(inputStream, "UTF-8");

        // While there's data available...
        while ((length = reader.read(readBuffer)) != -1)
        {
            // ... append the new data to the request buffer
            requestBuffer.append(readBuffer, 0, length);
        }

        // Generate a single string from the request buffer
        requestString = requestBuffer.toString();

        // Handle the JSON-RPC request and retrieve the result
        response.setContentType("application/json;charset=utf-8");
        result = JsonRpc.handleRequest(requestString, request, null,
                application);

        // Output the result
        response.getWriter().print(result.trim());
    }

    public static void main(String[] args) throws Exception
    {
        //
        // Static File Handler
        //

        // Create a resource handler to deal with static file requests
        ResourceHandler resourceHandler = new ResourceHandler();

        // If a request on the root path is received, serve a default file.
        resourceHandler.setWelcomeFiles(new String[] { "index.html" });

        // FIXME!
        // Serve files from our current directory
        resourceHandler.setResourceBase(args.length == 1 ? args[0] : ".");

        // Let 'em know what's going on
        Log.info("serving " + resourceHandler.getBaseResource());

        //
        // Remote Procedure Call handler
        //

        // Instantiate a new JettyServer which also directly handles RPCs
        Handler rpcHandler = new JettyServer();

        //
        // We have multiple handlers, so we need a handler collection
        //

        // Instantiate a handler collection
        HandlerCollection handlers = new HandlerCollection();

        // Add the two handlers. The RPC handler comes first. If it can't handle
        // the request, then the resource handler will be called.
        handlers.setHandlers(new Handler[] { rpcHandler, resourceHandler });
        JettyServer.application.setHandler(handlers);

        // We need one application-wide Finch instance. Obtain it now.
//        JettyServer.application.setAttribute("finch", new Finch());
        JettyServer.application.setAttribute("finch", null);

        // Start the server
        JettyServer.application.start();
        JettyServer.application.join();
    }
}
