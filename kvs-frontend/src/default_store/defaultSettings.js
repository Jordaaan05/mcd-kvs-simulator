export const defaultSettings = [
    { name: "Generator-Enabled", value: "False"},
    { name: "Num-IPS", value: "4"},
    { name: "Num-FC", value: "2"},
    { name: "Store-Size", value: "Large"},
    { name: "Order-Arrival-Rate", value: "Max"},
    { name: "Average-Order-Size", value: "0"},
    { name: "Rush-Period", value: "Off"}
]

/*
Settings Explained:

    Generator-Enabled:
        Enables or Disables the built-in order generator. Think of it as a automatic/manual mode for order creation.

    Num-IPS:
        Changes the number of MFY screens that are enabled.

    Num-FC:
        Changes the number of FC sides that are enabled.

    Store-Size:
        Affects the order arrival rate, as obviously we do not want a single sided food court to receive the order load of a $6,000+ store...

    Order-Arrival-Rate:
        Self explanatory, affects the rate at which orders arrive.
        Possible values include:
        Slow: Less than 1 order per minute
        Typical: Around an order per minute
        Peak: 2-4 orders per minute
        Max: More than 4 orders per minute 
        Note these values are for a Large store, for a small store or a foodcourt, the peak value would likely become the MAX value, etc.

    Average-Order-Size:
        Ability to manipulate the average number of sandwhiches per order, forsay if the default is larger than your store, or if you are not as used to larger orders.
        Default is 0 for off, letting the order generator have full control over everything.
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

    All of these settings are changable within the setup page.
*/