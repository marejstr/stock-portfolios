import uuid from "uuid/v1";

// Reducer for PortfolioContext
export const portfolioReducer = (state, action) => {
  switch (action.type) {
    // Add a new portfolio object to the state
    // The old state is expanded with ...state and a new portfolio is added to the end
    // A random unique id for the portfolio is created with the uuid library
    case "ADD_PORTFOLIO":
      return [
        ...state,
        {
          id: uuid(),
          name: action.name,
          currency: "EUR",
          stocks: []
        }
      ];
    // Remove a portfolio object from the state
    // Filter out the object that matches the passed in id and return the result
    case "REMOVE_PORTFOLIO":
      return state.filter(portfolio => portfolio.id !== action.id);
    case "ADD_STOCK":
      // Add a new stock to defined portfolio
      const portfolioToEdit = state.find(
        portfolio => portfolio.id === action.id
      );

      const newStockArray = portfolioToEdit.stocks.concat([
        {
          id: uuid(),
          symbol: action.symbol.toUpperCase(),
          initialValue: action.value,
          latestValue: action.latest,
          quantity: action.quantity
        }
      ]);

      const index = state.findIndex(portfolio => portfolio.id === action.id);

      if (index === -1) {
        console.log("Could not find portfolio with correct id");
        return state;
      } else {
        return [
          ...state.slice(0, index),
          Object.assign({}, state[index], { stocks: newStockArray }),
          ...state.slice(index + 1)
        ];
      }
    case "REMOVE_STOCKS":
      // Remove selected stocks from a defined portfolio
      const portfolio = state.find(portfolio => portfolio.id === action.id);

      let stocks = portfolio.stocks;
      action.stockIds.forEach(id => {
        stocks = stocks.filter(stock => stock.id !== id);
      });

      const pIndex = state.findIndex(portfolio => portfolio.id === action.id);
      if (pIndex === -1) {
        console.log("Could not find portfolio with correct id");
        return state;
      } else {
        return [
          ...state.slice(0, pIndex),
          Object.assign({}, state[pIndex], { stocks: stocks }),
          ...state.slice(pIndex + 1)
        ];
      }
    case "UPDATE_STOCKS":
      const ind = state.findIndex(portfolio => portfolio.id === action.id);
      if (ind === -1) {
        console.log("Could not find portfolio with correct id");
        return state;
      } else {
        return [
          ...state.slice(0, ind),
          Object.assign({}, state[ind], { stocks: action.stocks }),
          ...state.slice(ind + 1)
        ];
      }

    case "CHANGE_CURRENCY":
      // Change currency state for a defined portfolio
      const portfolioToEditIndex = state.findIndex(
        portfolio => portfolio.id === action.id
      );
      if (portfolioToEditIndex === -1) {
        console.log("Could not find portfolio with correct id");
        return state;
      } else {
        return [
          ...state.slice(0, portfolioToEditIndex),
          Object.assign({}, state[portfolioToEditIndex], {
            currency: action.currency
          }),
          ...state.slice(portfolioToEditIndex + 1)
        ];
      }

    default:
      return state;
  }
};
