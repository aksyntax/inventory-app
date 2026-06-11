import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UploadIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#2A78F6" strokeWidth="1.5" />
      <circle cx="8" cy="10" r="1.4" fill="#2A78F6" />
      <path d="M6.5 17L11 12.5L14 15.5L16.5 13L19 15.5V17H6.5Z" fill="#2A78F6" />
    </svg>
  );
}

export default function AddProduct() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (index, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${index + 1} exceeds 5MB limit`);
        return;
      }

      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
        alert(`Image ${index + 1} is not in JPG, PNG, GIF, or WebP format`);
        return;
      }

      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleFileInputClick = (index) => {
    document.getElementById(`image-input-${index}`).click();
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!productName || !price) {
      alert("Please fill in product name and price");
      return;
    }

    const uploadedImages = images.filter((img) => img !== null);
    if (uploadedImages.length === 0) {
      alert("Please upload at least 1 image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("productName", productName);
      formData.append("price", price);

      uploadedImages.forEach((img) => {
        formData.append("images", img);
      });

      const response = await axios.post(
        "http://localhost:5000/api/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Product added successfully!");
      setProductName("");
      setPrice("");
      setImages([null, null, null, null]);

      setTimeout(() => {
        navigate("/products");
      }, 500);
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error.response?.data?.message || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addProductContainer">
      <h2>Add Product</h2>

      <form onSubmit={submit} className="addProductForm">
        <div className="addProductTopRow">
          {/* PRODUCT INFORMATION */}
          <div className="productInfoSection addCard">
            <h3>Product Information</h3>
            <p className="sectionSubtext">Fill details of the product</p>

            <div className="formGroup">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="Input product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="formInput"
              />
            </div>

            <div className="formGroup">
              <label>Price</label>
              <input
                type="number"
                placeholder="Enter Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="formInput"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* IMAGE UPLOAD SECTION */}
          <div className="imageProductSection addCard">
            <h3>Image Product</h3>
            <p className="sectionSubtext">Note : Format photos JPG, PNG, GIF, or WebP (Max size 4MB)</p>

            <div className="imageGridContainer">
              {images.map((image, index) => (
                <div key={index} className="imageUploadBox">
                  <input
                    type="file"
                    id={`image-input-${index}`}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => handleImageChange(index, e.target.files[0])}
                    style={{ display: "none" }}
                  />

                  {image ? (
                    <div className="imagePreview">
                      <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="removeImageBtn"
                        onClick={() => removeImage(index)}
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div
                      className="imageUploadPlaceholder"
                      onClick={() => handleFileInputClick(index)}
                    >
                      <UploadIcon />
                      <p className="imagePlaceholderText">Photo {index + 1}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="imageActions">
              <button type="submit" className="saveProductBtn" disabled={loading}>
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
