import React from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import View from "../../assets/view.svg";

const DashboardHeader: React.FC = () => {
  return (
    <div className="flex justify-end mb-8">
      <Link to="/history">
        <Button className="flex items-center gap-2">
          <img
            src={View}
            alt="View Poll History"
            className="inline-block w-6 h-6 mr-2 align-middle"
          />
          View Poll history
        </Button>
      </Link>
    </div>
  );
};

export default DashboardHeader;
