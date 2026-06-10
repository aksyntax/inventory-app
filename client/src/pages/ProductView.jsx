import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ productName: "", price: "" });

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/products/${id}`
      );
      setProduct(res.data);
      setEditData({
        productName: res.data.productName,
        price: res.data.price,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("productName", editData.productName);
      formData.append("price", editData.price);

      await axios.put(`http://localhost:5000/api/products/${id}`, formData);
      setIsEditing(false);
      fetchProduct();
      alert("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        alert("Product deleted successfully");
        navigate("/products");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      }
    }
  };

  if (!product) return <p>Loading...</p>;

  const currentImage = product.images?.[selectedImageIndex];

  return (
    <div className="productViewContainer">
      <div className="productViewContent">
        {/* LEFT IMAGE SECTION */}
        <div className="imageSection">
          {currentImage && (
            <>
              <img
                className="mainImage"
                src={currentImage.url}
                alt={product.productName}
              />
              <div className="thumbRow">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={selectedImageIndex === index ? "activeThumb" : ""}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT DETAILS SECTION */}
        <div className="detailsSection">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editData.productName}
                onChange={(e) =>
                  setEditData({ ...editData, productName: e.target.value })
                }
              />
              <input
                type="number"
                value={editData.price}
                onChange={(e) =>
                  setEditData({ ...editData, price: e.target.value })
                }
              />
              <button onClick={handleUpdate}>Save Changes</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <h2>{product.productName}</h2>
              <h3>${product.price.toFixed(2)}</h3>
              <p>Product ID: {product._id}</p>
              <p>
                Created At:{" "}
                {new Date(product.createdAt).toLocaleDateString()}
              </p>
              <div className="actionButtons">
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}