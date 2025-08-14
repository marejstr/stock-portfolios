import React, { createContext, useEffect, useState } from "react";

export const HistoricalStockValuesContext = createContext();

// Stateless function component that provides a context to consumers
const HistoricalStockValuesContextProvider = props => {
  const initialData = () => {
    let localStorageData = localStorage.getItem("historicalValues");
    return localStorageData ? JSON.parse(localStorageData) : [];
  };

  // The state of the context is provided using the state hook
  const [historicalValues, setHistoricalValues] = useState(initialData);

  // Structure of data
  /*
    {
        symbol: msft,
        updateDate: '2019-11-23',
        historicalValues: [
            {
                date: '2018-06-12',
                value: 20
            },
            ...
        ]
    }
    */

  // Effect hook that runs every time the historicalValues data changes
  useEffect(() => {
    localStorage.setItem("historicalValues", JSON.stringify(historicalValues));
  }, [historicalValues]);

  // Main function for updating historical values
  const updateStockHistory = async symbols => {
    // Copy state array
    // Update data for every stock in stocks
    // Save all updates back to state at the same time
    // Only one save to state to prevent re-renders of graph for every stock
    let previousValues = [...historicalValues];
    let changed = false;

    for (let symbol of symbols) {
      const stock = historicalValues.find(stock => stock.symbol === symbol);

      if (stock) {
        if (isSameDay(new Date(stock.updateDate), new Date())) {
          // Stock has been updated today
          console.log("No need to update stock");
        } else {
          // Stock is present in state but needs to be updated
          console.log("Updating historical values and replacing old");
          previousValues = await updateHistoricalValues(symbol, previousValues);
          changed = true;
        }
      } else {
        // Stock does not exist in state
        console.log("Adding historical values for new stock");
        previousValues = await updateAndAdd(symbol, previousValues);
        changed = true;
      }
    }
    if (changed) {
      setHistoricalValues([...previousValues]);
    }
  };

  const isSameDay = (a, b) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  // function for fetching new historical values from iexapis
  const histValues = async symbol => {
    try {
      const url =
        "https://sandbox.iexapis.com/stable/stock/" +
        symbol +
        "/chart/5y?token=Tpk_ba7aef68a8924148a189e53d3b72666e";

      const res = await fetch(url);
      const histJson = await res.json();
      return histJson;
    } catch (e) {
      console.log(e);
    }
  };

  // common function for update functions
  const getDataFromSymbol = async symbol => {
    const jsonData = await histValues(symbol);

    if (jsonData !== undefined) {
      let openValues;
      if (jsonData[0].hasOwnProperty("uOpen")) {
        openValues = jsonData.map(item => ({
          date: item.date,
          value: item.uOpen
        }));
      } else {
        console.log("Invalid response");
      }

      return openValues;
    }
    return null;
  };

  const updateAndAdd = async (symbol, previousValues) => {
    let openValues = await getDataFromSymbol(symbol);

    // return state with added stock
    return [
      ...previousValues,
      {
        symbol: symbol,
        updateDate: new Date(),
        historicalValues: openValues
      }
    ];
  };

  const updateHistoricalValues = async (symbol, previousValues) => {
    let openValues = await getDataFromSymbol(symbol);

    // remove stock with out of date data from state
    const stocks = previousValues.filter(stock => stock.symbol !== symbol);

    // return state with updated data for the removed stock
    return [
      ...stocks,
      {
        symbol: symbol,
        updateDate: new Date(),
        historicalValues: openValues
      }
    ];
  };

  return (
    <HistoricalStockValuesContext.Provider
      value={{ historicalValues, updateStockHistory }}
    >
      {props.children}
    </HistoricalStockValuesContext.Provider>
  );
};

export default HistoricalStockValuesContextProvider;
