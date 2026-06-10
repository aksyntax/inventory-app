import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">

      {/* LOGO */}
      <div className="logoBox">
        <div className="logoCircle">N</div>
        <div>
          <h3>Napworks</h3>
          <p>Company</p>
        </div>
      </div>

      <div className="menuTitle">GENERAL</div>

      <Link className={isActive("/") ? "active" : ""} to="/">
        Dashboard
      </Link>

      <Link className={isActive("/products") ? "active" : ""} to="/products">
        Product (119)
      </Link>

      <Link to="/products" className={isActive("/add-product") ? "active" : ""}>
        Transaction (443)
      </Link>

      <Link>
        Customers
      </Link>
      <Link>
        Sales Report
      </Link>

    </div>
  );
}