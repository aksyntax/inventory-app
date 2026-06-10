import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        {/* PRODUCT INFORMATION */}
        <div className="productInfoSection">
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
        <div className="imageProductSection">
          <h3>Image Product</h3>
          <p className="sectionSubtext">
            Note: Format photos JPG, PNG, or PDF Max file size
          </p>

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
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    className="imageUploadPlaceholder"
                    onClick={() => handleFileInputClick(index)}
                  >
                    <div className="uploadIcon">📷</div>
                    <p className="imagePlaceholderText">Photo {index + 1}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="imageInfoText">
            ✓ Format photos JPG, PNG, GIF, or WebP<br/>
            ✓ Max file size 5MB each
          </p>
        </div>

        {/* SAVE BUTTON */}
        <button type="submit" className="saveProductBtn" disabled={loading}>
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
