import React, { useState } from "react";
import HistoricalStockValuesContextProvider from "../contexts/HistoricalStockValuesContext";
import PortfolioContextProvider from "../contexts/PortfolioContext";
import "./App.css";
import Header from "./Header";
import ModalGraph from "./ModalGraph";
import NewPortfolioForm from "./NewPortfolioForm";
import PortfolioGrid from "./PortfolioGrid";

/*
    App uses context providers to handle all the state that should be saved to local storage.
    HistoricalStockValuesContext handles graph historical data for all stocks that have been shown.
    PortfolioContext handles data about portfolios and stocks in those portfolios
*/

function App() {
  // State that determines if the graph window should be visible
  const [modalState, setModalState] = useState(false);
  // Stock symbols that are shown on the graph
  const [modalSymbols, setModalSymbols] = useState([]);

  // Shows the graph window. Symbol array is an array of string symbols to be shown
  const showModal = symbolArray => {
    setModalState(true);
    setModalSymbols(symbolArray);
  };

  return (
    <div className="App">
      <PortfolioContextProvider>
        <div className="top">
          <Header />
          <NewPortfolioForm />
        </div>
        <PortfolioGrid showModal={showModal} />
      </PortfolioContextProvider>
      <HistoricalStockValuesContextProvider>
        <ModalGraph
          show={modalState}
          symbols={modalSymbols}
          handleClose={() => setModalState(false)}
        />
      </HistoricalStockValuesContextProvider>
    </div>
  );
}

export default App;
