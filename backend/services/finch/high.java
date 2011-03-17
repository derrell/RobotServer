/*
 * Interface to the high-level Finch control methods
 * 
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package services.finch;

import org.json.simple.JSONObject;
import edu.cmu.ri.createlab.terk.robot.finch.Finch;
import jsonrpc.AbstractRpcClass;
import jsonrpc.JsonRpcError;

public class high extends AbstractRpcClass
{
    private static final long Error_Finch = 1;

    /**
     * Get and save a new finch object, or return the existing one.
     */
    private Finch _getFinch() throws JsonRpcError
    {
        // Get a reference to our Finch
        Finch finch = (Finch) this._getApplication().getAttribute("finch");

        // Disconnect from the finch
        if (finch != null)
        {
            return finch;
        }

        // Reconnect with a new Finch object
        try
        {
//            throw new JsonRpcError(Error_Finch, "Manually bypassing Finch");
             finch = new Finch();

             // Save the new reference
             this._getApplication().setAttribute("finch", finch);

             // Indicate success 
             return finch;
        }
        catch (Exception e)
        {
            // Some unknown error. Wrap its text in our own error
            throw new JsonRpcError(Error_Finch, "Finch: " + e.toString(), e);
        }
    }

    /**
     * Reset the Finch by disconnecting. The next request will reconnect.
     * 
     * @return 0, always.
     */
    public int reset()
    {
        // Get a reference to our Finch
        Finch finch = (Finch) this._getApplication().getAttribute("finch");

        // Disconnect from the finch
        if (finch != null)
        {
            finch.quit();
            this._getApplication().setAttribute("finch", null);
        }

        // Indicate success
        return 0;
    }

    /**
     * Play a tone at a specified frequency for a specified duration, on the
     * Finch's internal buzzer.
     * 
     * Note that this is non-blocking, so a subsequent call before an initial
     * call has completed the specified duration will stop the initial tone and
     * begin the newly-requested one.
     * 
     * @param frequency
     *        The value to be echoed
     * 
     * @param duration
     *        The duration, in milliseconds, for which the tone should play.
     * 
     * @return 0, always
     * @throws JsonRpcError
     */
    public int playTone(Long frequency, Long duration) throws JsonRpcError
    {
        // Get a reference to our Finch
        Finch finch = this._getFinch();

        // Make him buzz
        finch.buzz(frequency.intValue(), duration.intValue());

        // Indicate success
        return 0;
    }

    /**
     * Obtain the current accelerometer values. Acceleration values will be in
     * the range [-1.5, +1.5]. When the Finch is level, the x and y values
     * should show close to 0.0, and the z value close to +1.0
     * 
     * @return A map containing the x, y, and z accelerometer values.
     * @throws JsonRpcError
     */
    @SuppressWarnings("unchecked")
    public JSONObject getAccelerations() throws JsonRpcError
    {
        // Get a reference to our Finch
        Finch finch = this._getFinch();

        // Instantiate a return object
        JSONObject ret = new JSONObject();

        // Get the current acceleration values
        double[] accelerations = finch.getAccelerations();

        // Convert them to object format
        ret.put("x", accelerations[0]);
        ret.put("y", accelerations[1]);
        ret.put("z", accelerations[2]);

        return ret;
    }

    /**
     * Get the current light sensor values. Values are in the range [0, 255]
     * with higher values indicating more light being detected.
     * 
     * @return A map containing the "left" and "right" light sensor values
     * @throws JsonRpcError
     */
    @SuppressWarnings("unchecked")
    public JSONObject getLightSensors() throws JsonRpcError
    {
        // Get a reference to our Finch
        Finch finch = this._getFinch();

        // Instantiate a return object
        JSONObject ret = new JSONObject();

        // Get the current light sensor values
        int[] sensors = finch.getLightSensors();

        // Convert them to object format
        ret.put("left", sensors[0]);
        ret.put("right", sensors[1]);

        return ret;
    }

    /**
     * Get the current obstacle sensor values. Values are boolean, with true
     * indicating that an obstacle is detected.
     * 
     * @return A map containing the left and right sensor values
     * @throws JsonRpcError
     */
    @SuppressWarnings("unchecked")
    public JSONObject getObstacleSensors() throws JsonRpcError
    {
        // Get a reference to our Finch
        Finch finch = this._getFinch();

        // Instantiate a return object
        JSONObject ret = new JSONObject();

        // Get the current obstacle sensor values
        boolean[] sensors = finch.getObstacleSensors();

        // Convert them to object format
        ret.put("left", sensors[0]);
        ret.put("right", sensors[1]);

        return ret;
    }

    /**
     * Get the current temperature sensor value. The value is measured in
     * degrees Celsius.
     * 
     * @return The temperature sensor value.
     * @throws JsonRpcError
     */
    public double getTemperature() throws JsonRpcError
    {
        // Get a reference to our Finch
        Finch finch = this._getFinch();

        // Get and return the current temperature sensor value
        return finch.getTemperature();
    }

    /**
     * Get the values of all sensors.
     * 
     * See the individual sensor methods for details of values.
     * 
     * @return A map containing an "accelerometer" map, a "light" map, an
     *         "obstacle" map, and a "temperature" value.
     * @throws JsonRpcError
     */
    @SuppressWarnings("unchecked")
    public JSONObject getAllSensors() throws JsonRpcError
    {
        // Get a reference to our Finch
        Finch finch = this._getFinch();

        // Instantiate a return object
        JSONObject ret = new JSONObject();

        // We'll need a temporary object too
        JSONObject obj;

        // Get the current acceleration values
        double[] accelerations = finch.getAccelerations();

        // Get a new temporary object for accelerations
        obj = new JSONObject();

        // Add the accelerometer values to the temp object, and add the temp
        // object to the return object
        obj.put("x", accelerations[0]);
        obj.put("y", accelerations[1]);
        obj.put("z", accelerations[2]);
        ret.put("accelerometer", obj);

        // Get the current light sensor values
        int[] lightSensors = finch.getLightSensors();

        // Get a new temporary object for light sensors
        obj = new JSONObject();

        // Add the light sensor values to the temp object, and add the temp
        // object to the return object
        obj.put("left", lightSensors[0]);
        obj.put("right", lightSensors[1]);
        ret.put("light", obj);

        // Get the current obstacle sensor values
        boolean[] obstacleSensors = finch.getObstacleSensors();

        // Get a new temporary object for obstacle sensors
        obj = new JSONObject();

        // Add the obstacle sensor values to the temp object, and add the temp
        // object to the return object
        obj.put("left", obstacleSensors[0]);
        obj.put("right", obstacleSensors[1]);
        ret.put("obstacle", obj);

        // Get the temperature sensor value and add it to the return object
        ret.put("temperature", finch.getTemperature());

        // Give 'em the whole kit and kaboodle!
        return ret;

    }

    /**
     * Set Finch's beak LED to a specified color. If any color value is out of
     * range, it is set to the closest extreme value of the legal range.
     * 
     * @param red
     *        The intensity of red, in the range [0, 255]
     * 
     * @param green
     *        The intensity of green, in the range [0, 255]
     * 
     * @param blue
     *        The intensity of blue, in the range [0, 255]
     * 
     * @return 0, always
     * @throws JsonRpcError
     */
    public int setLED(Long red, Long green, Long blue) throws JsonRpcError
    {
        int r = red.intValue();
        int g = green.intValue();
        int b = blue.intValue();

        // Get a reference to our Finch
        Finch finch = this._getFinch();

        // Ensure that all intensity values are within range
        // First red...
        if (r < 0)
        {
            r = 0;
        }
        else if (r > 255)
        {
            r = 255;
        }

        // then green...
        if (g < 0)
        {
            g = 0;
        }
        else if (g > 255)
        {
            g = 255;
        }

        // and finally blue.
        if (b < 0)
        {
            b = 0;
        }
        else if (b > 255)
        {
            b = 255;
        }

        // Set the LED intensity
        finch.setLED(r, g, b);

        // Indicate success
        return 0;
    }

    /**
     * Set the power level for each wheel. Power levels range from [-255, 255]
     * with negative values reversing the direction the wheel turns.
     * 
     * @param leftPower
     *        Power level to apply to the left wheel
     * 
     * @param rightPower
     *        Power level to apply to the right wheel
     * 
     * @return 0, always
     * @throws JsonRpcError
     */
    public int setWheelPower(Long leftWheelPower, Long rightWheelPower)
            throws JsonRpcError
    {
        int     leftPower = leftWheelPower.intValue();
        int     rightPower = rightWheelPower.intValue();
        
        // Get a reference to our Finch
        Finch finch = this._getFinch();

        // If either value is out of range, map it to the closest extreme legal
        // value. First the left wheel power...
        if (leftPower < -255)
        {
            leftPower = -255;
        }
        else if (leftPower > 255)
        {
            leftPower = 255;
        }

        // ... and now the right wheel power.
        if (rightPower < -255)
        {
            rightPower = -255;
        }
        else if (rightPower > 255)
        {
            rightPower = 255;
        }

        // The Finch API calls this "wheel velocity" but is implemented as wheel
        // power. We may try to implement a velocity function based on power
        // duty cycle, at some point.
        finch.setWheelVelocities((int) leftPower, (int) rightPower);

        // Indicate success
        return 0;
    }
}
