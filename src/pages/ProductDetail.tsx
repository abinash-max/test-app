import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  const [generatedImages, setGeneratedImages] = useState<(string | null)[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<Set<number>>(new Set());
  const [selectedImage, setSelectedImage] = useState<{ url: string; index: number; isGenerated: boolean } | null>(null);

  useEffect(() => {
    // Try to get product from location state first (if navigated from Fashion page)
    if (location.state?.product) {
      console.log("Product from location state:", location.state.product);
      console.log("Product images:", location.state.product.detail?.images);
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
          console.log("Product found:", foundProduct);
          console.log("Product images:", foundProduct.detail?.images);
          setProduct(foundProduct);
        } else {
          console.error("Product not found:", productNumber, "in category:", category);
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
    setGeneratingIndex(new Set(product.detail.images.map((_, i) => i)));

    try {
      if (!uploadedFile) {
        toast.error("Please upload a user image file");
        setIsGenerating(false);
        setGeneratingIndex(new Set());
        return;
      }

      const productType = getProductType(category || "");
      
      // Create parallel API calls for all product images with index tracking
      const apiCalls = product.detail.images.map(async (garmentImageUrl, index) => {
        try {
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
            console.error(`API call failed for image ${index}: ${garmentImageUrl}`, errorText);
            return { index, result: null, error: true };
          }

          // Check if response is JSON or image
          const contentType = response.headers.get("content-type");
          let resultUrl = "";
          
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            resultUrl = data.result || data.image || data.url || data.generated_image || data.output || data.result_url || "";
          } else {
            // If it's an image, convert to blob URL
            const blob = await response.blob();
            resultUrl = URL.createObjectURL(blob);
          }

          return { index, result: resultUrl, error: false };
        } catch (error) {
          console.error(`Error generating image ${index}:`, error);
          return { index, result: null, error: true };
        }
      });

      // Wait for all API calls to complete (using allSettled to handle failures gracefully)
      const results = await Promise.allSettled(apiCalls);
      
      // Process results and create array matching catalog image positions
      const newGeneratedImages: (string | null)[] = new Array(product.detail.images.length).fill(null);
      let successCount = 0;
      
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { index, result: imageUrl, error } = result.value;
          if (!error && imageUrl && imageUrl.trim() !== "") {
            newGeneratedImages[index] = imageUrl;
            successCount++;
          }
        }
      });
      
      setGeneratedImages(newGeneratedImages);
      setIsGenerating(false);
      setGeneratingIndex(new Set());
      
      if (successCount > 0) {
        toast.success(`Successfully generated ${successCount} out of ${product.detail.images.length} image(s)`);
      } else {
        toast.error("No images were generated. Please try again.");
      }
    } catch (error) {
      console.error("Error generating images:", error);
      toast.error("Failed to generate images. Please try again.");
      setIsGenerating(false);
      setGeneratingIndex(new Set());
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

            {/* Product Images */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {generatedImages.some(img => img !== null && img !== undefined && img.trim() !== "") ? "Generated Images" : "Product Images"}
              </h2>
              {!product.detail?.images || product.detail.images.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No product images available
                </div>
              ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.detail.images.map((imageUrl, index) => {
                  const generatedImage = generatedImages[index];
                  const isGeneratingThis = generatingIndex.has(index);
                  const showGenerated = generatedImage !== null && generatedImage !== undefined && generatedImage.trim() !== "" && !isGeneratingThis;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        const imageToShow = showGenerated && generatedImage ? generatedImage : imageUrl;
                        setSelectedImage({
                          url: imageToShow,
                          index,
                          isGenerated: showGenerated
                        });
                      }}
                      className={`aspect-square rounded-lg overflow-hidden border-2 bg-secondary/30 hover:border-primary transition-smooth relative cursor-pointer ${
                        showGenerated ? "border-primary" : "border-border"
                      }`}
                    >
                      {isGeneratingThis ? (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : showGenerated && generatedImage ? (
                        <img
                          src={generatedImage}
                          alt={`${product.product_name} - Image ${index + 1} (Generated)`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Failed to load generated image ${index}:`, generatedImage);
                            // Fallback to original if generated image fails to load
                            e.currentTarget.src = imageUrl;
                          }}
                        />
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${product.product_name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            console.error(`Failed to load image ${index}:`, imageUrl);
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Image not available</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                      {showGenerated && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary/90 text-primary-foreground text-xs font-medium">
                          Generated
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0">
          {selectedImage && (
            <div className="relative w-full h-full">
              <img
                src={selectedImage.url}
                alt={`${product.product_name} - Image ${selectedImage.index + 1}${selectedImage.isGenerated ? " (Generated)" : ""}`}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
              {selectedImage.isGenerated && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-primary/90 text-primary-foreground text-sm font-medium">
                  Generated
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;

