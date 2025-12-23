import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUploadZone from "@/components/upload/ImageUploadZone";
import master1Data from "../../master1.json";

interface Product {
  category: string;
  product_number: string;
  product_name: string;
  thumbnail_url: string;
  detail: {
    images: string[];
  };
}

const ProductDetail = () => {
  const { category, productNumber } = useParams<{ category: string; productNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    // Try to get product from location state first (if navigated from Fashion page)
    if (location.state?.product) {
      setProduct(location.state.product);
      return;
    }

    // Otherwise, find product from master1.json
    if (category && productNumber && master1Data?.categories) {
      const categoryData = master1Data.categories[category as keyof typeof master1Data.categories];
      if (categoryData?.products) {
        const foundProduct = categoryData.products.find(
          (p) => p.product_number === productNumber
        );
        if (foundProduct) {
          setProduct(foundProduct);
        }
      }
    }
  }, [category, productNumber, location.state]);

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-4rem)] gradient-warm flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
          <Button onClick={() => navigate("/fashion")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fashion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] gradient-warm">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/fashion")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fashion
          </Button>

          <div className="bg-card rounded-2xl shadow-elevated p-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-6">
              {product.product_name}
            </h1>

            {/* Upload Image Box */}
            <div className="mb-8">
              <ImageUploadZone
                label="Upload Image"
                image={uploadedImage}
                onImageChange={setUploadedImage}
              />
            </div>

            {/* Product Images */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Product Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.detail?.images?.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-border bg-secondary/30 hover:border-primary transition-smooth"
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.product_name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

