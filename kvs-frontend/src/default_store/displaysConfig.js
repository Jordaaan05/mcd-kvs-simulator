export const displays = {
    MFY1: {
        stationName: 'MFY1',
        columns: 2,
        itemsPerCard: 12,
        showmfy: false,
        orangeTime: 30,
        redTime: 60,
        transformItems: (items, ctx) => {
            return items
                .filter(item => 
                    item.Categories.some(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    )
                )
                .sort((a, b) => {
                    const ca = a.Categories.find(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    );
                    const cb = b.Categories.find(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    );

                    if (ca.sortID !== cb.sortID) return ca.sortID - cb.sortID;
                    return a.ID - b.ID;
                });
        }
    },

    MFY2: {
        stationName: 'MFY2',
        columns: 2,
        itemsPerCard: 12,
        showmfy: false,
        orangeTime: 30,
        redTime: 60,
        transformItems: (items, ctx) => {
            return items
                .filter(item => 
                    item.Categories.some(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    )
                )
                .sort((a, b) => {
                    const ca = a.Categories.find(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    );
                    const cb = b.Categories.find(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    );

                    if (ca.sortID !== cb.sortID) return ca.sortID - cb.sortID;
                    return a.ID - b.ID;
                });
        }
    },

    MFY3: {
        stationName: 'MFY3',
        columns: 2,
        itemsPerCard: 12,
        showmfy: false,
        orangeTime: 30,
        redTime: 60,
        transformItems: (items, ctx) => {
            return items
                .filter(item => 
                    item.Categories.some(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    )
                )
                .sort((a, b) => {
                    const ca = a.Categories.find(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    );
                    const cb = b.Categories.find(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    );

                    if (ca.sortID !== cb.sortID) return ca.sortID - cb.sortID;
                    return a.ID - b.ID;
                });
        }
    },

    MFY4: {
        stationName: 'MFY4',
        columns: 2,
        itemsPerCard: 12,
        showmfy: false,
        orangeTime: 30,
        redTime: 60,
        transformItems: (items, ctx) => {
            return items
                .filter(item => 
                    item.Categories.some(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    )
                )
                .sort((a, b) => {
                    const ca = a.Categories.find(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    );
                    const cb = b.Categories.find(c => 
                        c.name === "Beef" || c.name === "Chicken" || c.name === "Breakfast"
                    );

                    if (ca.sortID !== cb.sortID) return ca.sortID - cb.sortID;
                    return a.ID - b.ID;
                });
        }
    },

    GRILL1: {
        stationName: 'GRILL1',
        columns: 3,
        itemsPerCard: 12,
        showmfy: false,
        orangeTime: 30,
        redTime: 60,
        transformItems: (items, ctx) => {
            return items
                .filter(item => 
                    item.Categories.some(c => c.name === "Beef")
                )
                .sort((a, b) => {
                    const ca = a.Categories.find(c => c.name === "Beef");
                    const cb = b.Categories.find(c => c.name === "Beef");

                    if (ca.sortID !== cb.sortID) return ca.sortID - cb.sortID;
                    return a.ID - b.ID;
                });
        }
    },

    FC1: {
        stationName: 'FC1',
        columns: 4,
        itemsPerCard: 12,
        showmfy: true,
        orangeTime: 60,
        redTime: 90,
    },

    FC2: {
        stationName: 'FC2',
        columns: 4,
        itemsPerCard: 12,
        showmfy: true,
        orangeTime: 60,
        redTime: 90,
    },

    DRINKS1: {
        stationName: 'DRINKS1',
        columns: 4,
        itemsPerCard: 12,
        showmfy: false,
        orangeTime: 30,
        redTime: 60,
        transformItems: (items, ctx) => {
            return items
                .filter(item => 
                    item.Categories.some(c => 
                        c.name === 'Drinks' || c.name  === 'Deserts'
                    )
                )
                .sort((a, b) => {
                    const ca = a.Categories.find(c => 
                        c.name === "Drinks" || c.name === "Deserts"
                    );
                    const cb = b.Categories.find(c => 
                        c.name === "Drinks" || c.name === "Deserts"
                    );

                    if (ca.sortID !== cb.sortID) return ca.sortID - cb.sortID;
                    return a.ID - b.ID;
                })
        }
    }
}