import React, { useContext, useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";
import { HistoricalStockValuesContext } from "../contexts/HistoricalStockValuesContext";
import "./ModalGraph.css";

// Shows graph of selected stocks in table
// Historical data for stocks is stored in HistoricalStockValuesContext
// Data and UI updates are performed using effect hooks
const ModalGraph = props => {
  // symbols is an array of stock symbols as strings
  // show is an boolean value
  const { historicalValues, updateStockHistory } = useContext(
    HistoricalStockValuesContext
  );
  const [showHideClassName, setShowHideClassName] = useState(
    "modal display-none"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dates, setDates] = useState();
  const [graphData, setGraphData] = useState([]);

  // Set date range when component mounts
  // While component is mounted the date range stays as the last one the user defined
  // Initial date range is the previous 30 days
  useEffect(() => {
    let end = new Date();
    let start = new Date();
    start.setDate(end.getDate() - 30);

    // Set date values in input from initial state
    setStartDate(start.toISOString().substring(0, 10));
    setEndDate(end.toISOString().substring(0, 10));

    setDates({
      start: start.toISOString().substring(0, 10),
      end: end.toISOString().substring(0, 10)
    });
  }, []);

  // Hides and shows graph based on show prop
  // Updates historical stock values in context
  useEffect(() => {
    if (props.show) {
      setShowHideClassName("modal display-block");

      updateStockHistory(props.symbols);
    } else {
      setShowHideClassName("modal display-none");
    }
  }, [props, updateStockHistory]);

  //Update graph lines when historical data or date range changes
  useEffect(() => {
    if (props.symbols[0]) {
      let stocks = [];
      let data = [];

      // Get stock states from context
      for (let symbol of props.symbols) {
        const stockToEdit = historicalValues.find(s => s.symbol === symbol);
        if (typeof stockToEdit !== "undefined") {
          stocks.push(stockToEdit);
        }
      }

      if (stocks.length === props.symbols.length) {
        let incDate = new Date(dates.start);
        const stopDate = new Date(dates.end);

        // Build graph data from stock states.
        // Graph data consists of an array of objects
        // An object has a date and a value for every stock, using symbol as key
        while (incDate <= stopDate) {
          let newElement = {};
          const dateString = incDate.toISOString().substring(0, 10);
          newElement["date"] = dateString;

          for (let stock of stocks) {
            let symb = stock.symbol;
            let stockDate = stock.historicalValues.find(
              histValue => histValue.date === dateString
            );
            if (stockDate) {
              newElement[symb] = parseFloat(stockDate.value);
            }
          }
          data.push(newElement);

          incDate.setDate(incDate.getDate() + 1);
        }

        setGraphData(data);
      }
    }
  }, [historicalValues, dates, props]);

  // set new date state from input
  const handleUpdateDates = e => {
    e.preventDefault();
    setDates({ start: startDate, end: endDate });
  };

  const handleClose = e => {
    props.handleClose();
  };

  // Colors for graph lines
  const COLORS = [
    "#8ec07c",
    "#fb4934",
    "#fabd2f",
    "#b8bb26",
    "#d3869b",
    "#83a598",
    "#fe8019"
  ];

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        {props.symbols.length > 0 ? (
          <div>
            <ResponsiveContainer
              className="line-chart"
              width="95%"
              height={500}
            >
              <LineChart data={graphData}>
                {props.symbols.map((symbol, index) => {
                  return (
                    <Line
                      key={symbol}
                      connectNulls={true}
                      type="monotone"
                      dataKey={symbol}
                      dot={false}
                      stroke={COLORS[index]}
                    />
                  );
                })}

                <Legend />
                <CartesianGrid stroke="#eee5ce" />
                <XAxis dataKey="date" stroke="#eee5ce" />
                <YAxis stroke="#eee5ce" />
              </LineChart>
            </ResponsiveContainer>

            <hr></hr>

            <form id="date-form" onSubmit={handleUpdateDates}>
              <div className="inline-block">
                <label>Start date:</label>
                <br></br>
                <input
                  type="text"
                  placeholder="yyyy-mm-dd"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="inline-block">
                <label>End date:</label>
                <br></br>
                <input
                  type="text"
                  placeholder="yyyy-mm-dd"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
              <input type="submit" value="Update" />
            </form>

            <hr></hr>
          </div>
        ) : (
          <h2> Please select the stocks to show from the portfolio table </h2>
        )}

        <button id="close-button" onClick={handleClose}>
          Close
        </button>
      </section>
    </div>
  );
};

export default ModalGraph;
