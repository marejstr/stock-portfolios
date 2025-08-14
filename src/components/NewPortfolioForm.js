import React, { useContext, useState } from "react";
import { PortfolioContext } from "../contexts/PortfolioContext";
import "./NewPortfolioForm.css";

// Form in header for adding a new portfolio
const NewPortfolioForm = () => {
  const { dispatch } = useContext(PortfolioContext);
  const [portfolioName, setPortfolioName] = useState("");

  const handleAddPortfolio = e => {
    e.preventDefault();
    dispatch({ type: "ADD_PORTFOLIO", name: portfolioName });
    setPortfolioName("");
  };

  return (
    <form className="portfolio-form" onSubmit={handleAddPortfolio}>
      <input
        type="text"
        placeholder="Portfolio name"
        value={portfolioName}
        onChange={e => setPortfolioName(e.target.value)}
        required
      />
      <input type="submit" value="Add portfolio" />
    </form>
  );
};

export default NewPortfolioForm;
