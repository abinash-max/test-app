import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Custom Image Upload Component
  const CustomImageUploadZone = ({
    label,
    image,
    file,
    onImageChange,
  }: {
    label: string;
    image: string | null;
    file: File | null;
    onImageChange: (imageUrl: string | null, file: File | null) => void;
  }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = useCallback((selectedFile: File) => {
      if (selectedFile.type === "image/jpeg" || selectedFile.type === "image/jpg") {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImageChange(event.target?.result as string, selectedFile);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        toast.error("Please upload a JPG or JPEG image");
      }
    }, [onImageChange]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    }, [handleFileSelect]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    }, [handleFileSelect]);

    const handleRemove = useCallback(() => {
      onImageChange(null, null);
    }, [onImageChange]);

    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {image ? (
          <div className="relative rounded-xl overflow-hidden border-2 border-border bg-card shadow-soft animate-scale-in">
            <img
              src={image}
              alt="Uploaded"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-smooth"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 transition-smooth cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            <input
              type="file"
              accept="image/jpeg,image/jpg"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="p-3 rounded-full bg-accent">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop your JPG/JPEG image here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get product type based on category
  const getProductType = (category: string): string => {
    if (category === "mens_shirts") return "mens_shirts";
    if (category === "womens_wear") return "womens_wear";
    if (category === "shoes") return "shoes";
    return category;
  };

  const handlePersonalize = async () => {
    if (!uploadedImage || !product || !product.detail?.images) {
      toast.error("Please upload a user image first");
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      if (!uploadedFile) {
        toast.error("Please upload a user image file");
        setIsGenerating(false);
        return;
      }

      const productType = getProductType(category || "");
      
      // Create parallel API calls for all product images
      const apiCalls = product.detail.images.map(async (garmentImageUrl) => {
        const formData = new FormData();
        formData.append("user_image", uploadedFile);
        formData.append("garment_image_url", garmentImageUrl);
        formData.append("product_type", productType);

        const response = await fetch("https://hp.gennoctua.com/api/tryon/virtual-tryon", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API call failed for image: ${garmentImageUrl}`, errorText);
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        // Check if response is JSON or image
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          // Try multiple possible response fields
          return data.result || data.image || data.url || data.generated_image || data.output || data.result_url || "";
        } else {
          // If it's an image, convert to blob URL
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
      });

      // Wait for all API calls to complete
      const results = await Promise.all(apiCalls);
      
      // Filter out empty results
      const validResults = results.filter((url) => url && url.trim() !== "");
      
      setGeneratedImages(validResults);
      setIsGenerating(false);
      
      if (validResults.length > 0) {
        toast.success(`Successfully generated ${validResults.length} image(s)`);
      } else {
        toast.error("No images were generated. Please check the API response format.");
      }
    } catch (error) {
      console.error("Error generating images:", error);
      toast.error("Failed to generate images. Please try again.");
      setIsGenerating(false);
    }
  };

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
            <div className="mb-6 border-2 border-dashed border-border rounded-xl p-4 bg-accent/20">
              <CustomImageUploadZone
                label="Upload User Image (JPG/JPEG)"
                image={uploadedImage}
                file={uploadedFile}
                onImageChange={(imageUrl, file) => {
                  setUploadedImage(imageUrl);
                  setUploadedFile(file);
                }}
              />
            </div>

            {/* Personalize Button */}
            <div className="mb-8">
              <Button
                variant="personalize"
                size="xl"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePersonalize}
                disabled={!uploadedImage || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Images...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Personalize
                  </>
                )}
              </Button>
              {!uploadedImage && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Please upload an image to enable personalization
                </p>
              )}
            </div>

            {/* Generated Images */}
            {generatedImages.length > 0 && (
              <div className="space-y-4 mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Generated Images
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generatedImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-primary bg-secondary/30 hover:border-primary/80 transition-smooth"
                    >
                      <img
                        src={imageUrl}
                        alt={`Generated Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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

