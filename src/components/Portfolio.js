import React, { useContext, useEffect, useState } from "react";
import { PortfolioContext } from "../contexts/PortfolioContext";
import "./Portfolio.css";

const Portfolio = props => {
  // portfolio is the state of this portfolio
  // show modal is a passed down function
  const { portfolio, showModal } = props;

  const { dispatch, updateStocks, addStock } = useContext(PortfolioContext);
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockDate, setStockDate] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockErrorMessage, setStockErrorMessage] = useState("");
  const [selectValue, setSelectValue] = useState();
  const [selectedRows, setSelectedRows] = useState([]);

  // Set state of currency dropdown when state of portfolio prop changes
  // Used for setting dropdown value on re-render
  useEffect(() => {
    setSelectValue(portfolio.currency);
  }, [portfolio]);

  // Saves a new stock to the correct portfolio in PortfolioContext and clears input fields
  const handleAddStock = async e => {
    e.preventDefault();
    setStockErrorMessage("Loading data...");

    const message = await addStock(
      portfolio.id,
      stockSymbol,
      stockDate,
      stockQuantity
    );

    // Add stock button will be disabled if there is a message.
    // Can't perform the exact same search but if it failed you probably need to make changes
    setStockErrorMessage(message);
    if (message === "") {
      setStockSymbol("");
      setStockDate("");
      setStockQuantity("");
    }
  };

  // Handles changes in the input fields for a new stock.
  // Updates the error message if inputs are not valid
  const handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;

    switch (name) {
      case "symbol":
        setStockSymbol(value);
        updateStockErrorMessage(value, stockDate, stockQuantity);
        break;
      case "date":
        setStockDate(value);
        updateStockErrorMessage(stockSymbol, value, stockQuantity);
        break;
      case "quantity":
        setStockQuantity(value);
        updateStockErrorMessage(stockSymbol, stockDate, value);
        break;
      default:
        break;
    }
  };

  // Updates the error message for stock input fields based on current values
  const updateStockErrorMessage = (symbol, date, quantity) => {
    let errorMessage = "";

    if (symbol.length > 0 && symbol.length > 5) {
      errorMessage = "Symbol has to be under 6 characters long";
    } else if (
      Date.parse(new Date(date) === "Invalid Date") ||
      isNaN(new Date(date)) ||
      !/(\d{4})-(\d{2})-(\d{2})/.test(date)
    ) {
      errorMessage = "Please enter past date in format: yyyy-mm-dd";
    } else if (quantity.length > 0 && !/^\+?[1-9][\d]*$/.test(quantity)) {
      errorMessage = "Number of shares has to be a positive whole number";
    }
    setStockErrorMessage(errorMessage);
  };

  // Handles clicks on table rows
  const handleRowClick = stock => {
    if (selectedRows.indexOf(stock.id) >= 0) {
      // The stock id is found in selectedRows state array
      // Filter out the id and add remaining back to selectedRows
      setSelectedRows(selectedRows.filter(i => i !== stock.id));
    } else {
      // Add the stock id to selectedRows
      setSelectedRows(selectedRows.concat(stock.id));
    }
  };

  // Handles conversion from dollar to euro
  // All values saved in state is saved as dollar
  const exchange = value => {
    let floatValue = parseFloat(value);
    if (portfolio.currency === "EUR") {
      return Math.round((floatValue / 1.11) * 100) / 100;
    }
    return Math.round(floatValue * 100) / 100;
  };

  // Calculates total value for all stocks in table
  const calculateTotalValue = () => {
    let sum = 0;
    portfolio.stocks.forEach(stock => {
      sum = sum + stock.latestValue * stock.quantity;
    });
    return sum;
  };

  // Removes stocks from the correct portfolio in PortfolioContext and clears selected rows
  const removeStocks = e => {
    dispatch({
      type: "REMOVE_STOCKS",
      id: portfolio.id,
      stockIds: selectedRows
    });
    setSelectedRows([]);
  };

  // Creates array of stock symbols that are selected in the table and returns to parent via props
  const showGraph = e => {
    let symbolArray = [];
    portfolio.stocks.forEach(stock => {
      if (selectedRows.includes(stock.id)) {
        symbolArray.push(stock.symbol);
      }
    });
    showModal(symbolArray);
  };

  // Saves currency to the correct portfolio in PortfolioContext
  const selectChanged = e => {
    setSelectValue(e.target.value);
    dispatch({
      type: "CHANGE_CURRENCY",
      id: portfolio.id,
      currency: e.target.value
    });
  };

  return (
    <div className="Portfolio">
      <div className="portfolio-header">
        <h1>{portfolio.name}</h1>

        <button
          id="delete-portfolio"
          onClick={() =>
            dispatch({ type: "REMOVE_PORTFOLIO", id: portfolio.id })
          }
        >
          Delete
        </button>

        <button id="first-button" onClick={() => updateStocks(portfolio.id)}>
          Refresh
        </button>

        <button onClick={removeStocks}>Delete selected</button>

        <button onClick={showGraph}>Graph selected</button>

        <select value={selectValue} onChange={selectChanged}>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div className="portfolio-body">
        <table className="table-scroll">
          <thead>
            <tr>
              <th>✓</th>
              <th>Symbol</th>
              <th>Purchase value</th>
              <th>Current value</th>
              <th>Quantity</th>
              <th>Total value</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.stocks.map(stock => (
              <tr
                className={
                  selectedRows.includes(stock.id) ? "selected" : "not-selected"
                }
                key={stock.id}
                onClick={() => handleRowClick(stock)}
              >
                <td>{selectedRows.includes(stock.id) ? "✓" : ""}</td>
                <td>{stock.symbol}</td>
                <td>{exchange(stock.initialValue)}</td>
                <td>{exchange(stock.latestValue)}</td>
                <td>{stock.quantity}</td>
                <td>{exchange(stock.latestValue * stock.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        Total portfolio value: {exchange(calculateTotalValue())}{" "}
        {portfolio.currency}
        <div id="error-label">
          <label>{stockErrorMessage}</label>
        </div>
        <form onSubmit={handleAddStock}>
          <input
            type="text"
            name="symbol"
            placeholder="Symbol"
            title="Symbol for stock. For example: AAPL"
            value={stockSymbol}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="date"
            placeholder="Date of purchase"
            title="Date of purchase in format: yyyy-mm-dd"
            value={stockDate}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="quantity"
            placeholder="Number of shares"
            title="The number of stocks to be added"
            value={stockQuantity}
            onChange={handleChange}
            required
          />
          <input disabled={stockErrorMessage} type="submit" value="Add stock" />
          <br />
        </form>
      </div>
    </div>
  );
};

export default Portfolio;
