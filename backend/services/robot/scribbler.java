/*
 * Interface to the Scribbler
 * 
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package services.robot;

import java.util.HashMap;

import jsonrpc.AbstractRpcClass;
import jsonrpc.JsonRpcError;
//import Myro.Scribbler;

public class scribbler extends AbstractRpcClass
{
    private class Scribbler
    {
        public Scribbler(String portName) {}
        @SuppressWarnings("unused")
        public Scribbler get(String portName) { return null; }
        @SuppressWarnings("unused")
        public void put(String portName, Scribbler robot) {}
        public void autoCamera()
        {
            // TODO Auto-generated method stub
            
        }
        public void backward()
        {
            // TODO Auto-generated method stub
            
        }
        public void backward(Double speed)
        {
            // TODO Auto-generated method stub
            
        }
        public void backward(Double speed, Double numSeconds)
        {
            // TODO Auto-generated method stub
            
        }
        public void beep(Double duration, Long frequency)
        {
            // TODO Auto-generated method stub
            
        }
        public void beep(Double duration, Long frequency1, Long frequency2)
        {
            // TODO Auto-generated method stub
            
        }
    };
    
    private static final long Error_Connect = 1;

    @SuppressWarnings({ "rawtypes" })
    private HashMap           robots        = new HashMap();

    /**
     * Initialize a Scribbler on a specific port
     * 
     * @param portName
     *        Name of the port to which this Scribbler is connected
     * 
     * @return 0, always
     * 
     * @throws JsonRpcError
     */
    @SuppressWarnings("unchecked")
    public Scribbler _getRobot(String portName) throws JsonRpcError
    {
        Scribbler robot;

        try
        {
            robot = (Scribbler) robots.get("portName");
            if (robot == null)
            {
                robot = new Scribbler(portName);
                robots.put(portName, robot);
            }
            return robot;
        }
        catch (Exception e)
        {
            // Some unknown error. Wrap its text in our own error
            throw new JsonRpcError(Error_Connect, "Scribbler: " + e.toString(),
                    e);
        }
    }

    /**
     * Turn on the Fluke camera's auto-exposure, auto-gain, and
     * auto-color-balance.
     * 
     * @param portName
     *        Name of the port to which this Scribbler is connected
     * 
     * @return 0, always
     */
    public int autoCamera(String portName) throws JsonRpcError
    {
        this._getRobot(portName).autoCamera();
        return 0;
    }

    /**
     * Start the Scribbler moving backward at full speed with no rotational
     * movement. The Scribbler will continue to move until another movement
     * method is invoked (e.g., stop, move, forward, backward, turnLeft,
     * turnRight, motors, translate, rotate ).
     * 
     * @return 0, always
     * @throws JsonRpcError 
     */
    public int backward(String portName) throws JsonRpcError
    {
        this._getRobot(portName).backward();
        return 0;
    }

    /**
     * Start the Scribbler moving backward at full speed with no rotational
     * movement. The Scribbler will continue to move until another movement
     * method is invoked (e.g., stop, move, forward, backward, turnLeft,
     * turnRight, motors, translate, rotate ).
     * 
     * @param speed
     *        Specifies the speed. Positive values specify backward movement
     *        (1.0 is full backward speed), negative values specify forward
     *        movement (-1.0 is full forward speed).
     * 
     * @return 0, always
     * @throws JsonRpcError 
     */
    public int backward(String portName, Double speed) throws JsonRpcError
    {
        this._getRobot(portName).backward(speed);
        return 0;
    }

    /**
     * Start the Scribbler moving backward at full speed with no rotational
     * movement. The Scribbler will continue to move until another movement
     * method is invoked (e.g., stop, move, forward, backward, turnLeft,
     * turnRight, motors, translate, rotate ).
     * 
     * @param speed
     *        The speed to move. Positive values specify backward movement (1.0
     *        is full backward speed), negative values specify forward movement
     *        (-1.0 is full forward speed).
     * 
     * @param numSeconds
     *        The length of time to move, in seconds.
     * 
     * @return 0, always
     * @throws JsonRpcError 
     */
    public int backward(String portName, Double speed, Double numSeconds) throws JsonRpcError
    {
        this._getRobot(portName).backward(speed, numSeconds);
        return 0;
    }

    public int beep(String portName, Double duration, Long frequency) throws JsonRpcError
    {
        this._getRobot(portName).beep(duration, frequency);
        return 0;
    }

    public int beep(String portName, Double duration, Long frequency1,
            Long frequency2) throws JsonRpcError
    {
        this._getRobot(portName).beep(duration, frequency1, frequency2);
        return 0;
    }
}
