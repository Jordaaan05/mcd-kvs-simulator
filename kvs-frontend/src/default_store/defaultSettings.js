export const defaultSettings = [
    { name: "Generator-Enabled", value: "Off"},
    { name: "Num-IPS", value: "4"},
    { name: "Num-FC", value: "2"},
    { name: "Num-McCafe", value: "2"},
    { name: "Store-Size", value: "Food Court"},
    { name: "Order-Arrival-Rate", value: "Off"},
    { name: "Average-Order-Size", value: "Off"},
    { name: "Rush-Period", value: "Off"},
    { name: "Drive-Enabled", value: "Off"},
    { name: "Station-Lock", value: "Off"},
    { name: "Simulated-Time", value: "None"},
]

/*
Settings Explained:

    Generator-Enabled:
        Enables or Disables the built-in order generator. Think of it as a automatic/manual mode for order creation.

    Num-IPS:
        Changes the number of MFY screens that are enabled.
        Can be any integer 1 through 4.

    Num-FC:
        Changes the number of FC sides that are enabled.
        Can be 1 or 2.

    Num-McCafe:
        Changes the number of enabled McCafe sides
        Can be 1 or 2 (default is 2)
    
    Store-Size:
        Affects the order arrival rate, as obviously we do not want a single sided food court to receive the order load of a $6,000+ store...
        Note that if an Order-Arrival-Rate is set, the store size will not affect this.
        Possible values:
        Food Court: 1 IP, 1 FC, Low order arrival rates. Does not change the value for Order-Arrival-Rate though. (Default)
        Small: 2 IP, 1 FC, Still low arival rates, but more than Food Court levels.
        Medium: 3 IP, 2 FC, Medium level arrival rates
        Large: 4 IP, 2 FC, High order arrival rates

    Order-Arrival-Rate:
        Self explanatory, affects the rate at which orders arrive.
        Possible values include:
        Off: Let Store-Size affect the rate at which orders arrive. (Default)
        Slow: Less than 1 order per minute
        Typical: Around an order per minute
        Peak: 2-4 orders per minute
        Max: More than 4 orders per minute 
        Note these values are for a Large store, for a small store or a foodcourt, the peak value would likely become the MAX value, etc.

    Average-Order-Size:
        Ability to manipulate the average number of sandwiches per order, forsay if the default is larger than your store, or if you are not as used to larger orders.
        Default is Off, letting the order generator have full control over everything.
        Possible values are 1-3, and the generator has a huge bias to this number, only +- a few less than half the time

    Rush-Period:
        Ability to control the type of orders, and their arrival rate biases towards rushes. 
        Default is Off, where the order generator will use real time to control the order generation process.
        Other states being:
        Breakfast - Primarily breakfast orders, with a splash of all-day menu items thrown in. Peak for a MAX large store is around $2,500-$3,000,
        Lunch - Mix of all orders with an average order size of around 2.5. Peak for a MAX large store is around $6,000,
        Dinner - Similar to lunch, but the average order size is around 3. Order arrival rate is lower to account for this, and the peak for a max store is around $5,000,
        Friday Dinner - Same as dinner but the order arrival rate is higher, MAX peak can go up to $6,500. 
        Again note that the other states are only for when one of these rush periods is wanted to be locked in. If left off, the system will generate orders based on the real date and time.

    Drive-Enabled:
        Self explanatory really, 
        Off: Drive Thru is disabled, even if called for by the store size
        On: Drive Thru is enabled, but only if the store size calls for it.

    Station-Lock:
        Ability to be able to lock into a certain station
        Off: Entire restaurant is simulated
        Kitchen: Only MFY1 is enabled, and orders are only generated for this station. For initiator practice
        Front Counter: Only FC1 is enabled, and orders are only generated for this station, For practice for assembly, which can apply to either DT or FC.

    Simulated-Time:
        Ability to change the time that the program is operating in, to simulate a rush period more realistically,
        None: Uses the system time, everything runs as normal
        10-12: Sets the clock to 10:00, and simulates from then up until 12:00, resetting back to None once this period has completed. 
        12-2: Sets the clock to 12:00, simulates to 14:00. Resets once the period is over
        5-8: Sets the clock to 17:00, simulates until 20:00. 
        These settings are only intended to cover the main rush periods of the day, more may be added in future.
    All of these settings are changable within the setup page.
*/