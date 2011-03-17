/*
 * The Application object (per-server-instantiation persistent data)
 * for use with Jetty.
 * 
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
*/
package rpcserver;

import jsonrpc.Application;
import org.eclipse.jetty.server.Server;

public class JettyApplication extends Server implements Application 
{
	public JettyApplication(int port)
	{
		super(port);
	}
}
