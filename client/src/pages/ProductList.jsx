import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
  });

  const fetchProducts = async (pageNumber = 1, filterParams = {}) => {
    try {
      const query = new URLSearchParams({
        page: pageNumber,
        ...filterParams,
      }).toString();

      const res = await axios.get(
        `http://localhost:5000/api/products?${query}`
      );

      setProducts(res.data.products);
      setTotalPages(res.data.pagination.total);
      setTotalItems(res.data.pagination.totalItems);
      setPage(res.data.pagination.current);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const applyFilters = () => {
    setPage(1);
    const params = {
      search: filters.search,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
    fetchProducts(1, params);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      minPrice: "",
      maxPrice: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
    fetchProducts(1);
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        applyFilters();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  useEffect(() => {
    fetchProducts(page, {
      search: filters.search,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  }, [page, filters]);

  return (
    <div className="productListContainer">
      {/* HEADER SECTION WITH TITLE */}
      <div className="productPageHeader">
        <h2>Product</h2>
      </div>

      {/* SEARCH & ACTION BAR - Always visible */}
      <div className="searchActionBar">
        <div className="searchBoxWrapper">
          <input
            type="text"
            placeholder="Search product"
            value={filters.search}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, search: e.target.value });
            }}
            className="searchInput"
          />
          <span className="searchIconSpan">🔍</span>
        </div>

        <div className="actionButtons">
          <button
            className="filterBtn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>Filter</span>
            <span className="filterIcon">⚙️</span>
          </button>
          <Link to="/add-product" className="addProductBtn">
            + New Product
          </Link>
        </div>
      </div>

      {/* EXPANDABLE FILTERS SECTION */}
      {showFilters && (
        <div className="expandedFiltersSection">
          <div className="filterRowGroup">
            <div className="dateRangeFilter">
              <label>Date Range</label>
              <div className="dateInputGroup">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  placeholder="Start Date"
                  className="dateInput"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  placeholder="End Date"
                  className="dateInput"
                />
              </div>
            </div>

            <div className="priceFilter">
              <label>Price</label>
              <div className="priceInputGroup">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="priceInput"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="priceInput"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <div className="productsTable">
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>Product</th>
              <th>Price</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td className="productCell">
                    {product.images && product.images.length > 0 && (
                      <img
                        src={product.images[0].url}
                        alt={product.productName}
                        width="40"
                        height="40"
                      />
                    )}
                    <span>{product.productName}</span>
                  </td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    {new Date(product.createdAt).toLocaleDateString()} at{" "}
                    {new Date(product.createdAt).toLocaleTimeString()}
                  </td>
                  <td>
                    <button
                      className="deleteBtn"
                      onClick={() => deleteProduct(product._id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="paginationSection">
        <div className="paginationInfo">
          {products.length > 0 && (
            <>
              <span>
                {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} of{" "}
                {totalItems} Pages
              </span>
            </>
          )}
        </div>

        <div className="paginationControls">
          <span>The page on</span>
          <input
            type="number"
            value={page}
            onChange={(e) => setPage(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max={totalPages}
          />
          <button
            disabled={page === 1}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            ←
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
