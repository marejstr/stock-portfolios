import React, { useContext } from "react";
import { PortfolioContext } from "../contexts/PortfolioContext";
import Portfolio from "./Portfolio";
import "./PortfolioGrid.css";

// Renders a grid of portfolios if there are any in PortfolioContext state.
// Otherwise renders a text line
const PortfolioGrid = props => {
  const { portfolios } = useContext(PortfolioContext);

  return portfolios.length ? (
    <div className="portfolio-grid">
      {portfolios.map(portfolio => {
        return (
          <Portfolio
            key={portfolio.id}
            portfolio={portfolio}
            showModal={props.showModal}
          ></Portfolio>
        );
      })}
    </div>
  ) : (
    <h2>No portfolios to show</h2>
  );
};

export default PortfolioGrid;
