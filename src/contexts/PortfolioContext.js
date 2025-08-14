import React, { createContext, useEffect, useReducer } from "react";
import { portfolioReducer } from "../reducers/portfolioReducer";

export const PortfolioContext = createContext();

// Stateless function component that provides a context to consumers
const PortfolioContextProvider = props => {
  // The state is an array of portfolio objects that each contains an array with stocks

  // Uses a reducer to perform changes in the state
  // Initial data is loaded from local storage
  const [portfolios, dispatch] = useReducer(portfolioReducer, [], () => {
    const localStoragePortfolios = localStorage.getItem("portfolios");
    return localStoragePortfolios ? JSON.parse(localStoragePortfolios) : [];
  });

  // Effect hook that runs every time the portfolios data changes
  // Saves state to local storage
  useEffect(() => {
    localStorage.setItem("portfolios", JSON.stringify(portfolios));
  }, [portfolios]);

  // Updates stocks in a portfolio with current value
  // Reducer can't have async function.
  // Handle async part here and use reducer to add data to state
  const updateStocks = async id => {
    const portfolio = portfolios.find(portfolio => portfolio.id === id);

    // wait for every promise
    let stocks = await Promise.all(
      portfolio.stocks.map(async stock => {
        stock.latestValue = await getCurrentPrice(stock.symbol);
        return stock;
      })
    );

    dispatch({ type: "UPDATE_STOCKS", id: id, stocks: stocks });
  };

  // Add a new stock to defined portfolio
  // Reducer can't have async function.
  // Handle async part here and use reducer to add data to state
  const addStock = async (id, symbol, date, quantity) => {
    var histDate = date.replace(/-/g, "");

    const latest = await getCurrentPrice(symbol);
    const historicalPrice = await getHistoricalPrice(symbol, histDate);

    if (historicalPrice !== null && historicalPrice[0] !== undefined) {
      if (historicalPrice[0].hasOwnProperty("uClose")) {
        const price = historicalPrice[0]["uClose"];
        dispatch({
          type: "ADD_STOCK",
          id: id,
          symbol: symbol,
          value: price,
          latest: latest,
          quantity: quantity
        });
        return "";
      } else {
        // return error message
        return "Could not find price for the stock";
      }
    } else {
      // return error message
      return "No data for stock";
    }
  };

  // function for fetching new historical values from iexapis
  const getHistoricalPrice = async (symbol, date) => {
    try {
      const url =
        "https://sandbox.iexapis.com/stable/stock/" +
        symbol +
        "/chart/date/" +
        date +
        "?chartByDay=true&token=Tpk_ba7aef68a8924148a189e53d3b72666e";
      const res = await fetch(url);
      const priceJson = await res.json();
      return priceJson;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  const getCurrentPrice = async symbol => {
    try {
      const url =
        "https://sandbox.iexapis.com/stable/stock/" +
        symbol +
        "/quote/latestPrice?token=Tpk_ba7aef68a8924148a189e53d3b72666e";

      const res = await fetch(url);
      const priceJson = await res.json();
      let latestPrice = priceJson;

      return latestPrice;
    } catch (err) {
      console.log(err);
    }
  };

  // Return the portfolio provider for the child components to consume
  // The available state and functions the child components can consume is defined in the value property
  return (
    <PortfolioContext.Provider
      value={{ portfolios, dispatch, updateStocks, addStock }}
    >
      {props.children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioContextProvider;
