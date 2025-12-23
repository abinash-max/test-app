import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bed, Sofa, Armchair } from "lucide-react";
import masterData from "../../master.json";

interface Product {
  category: string;
  product_number: string;
  product_name: string;
  thumbnail_url: string;
  detail: {
    images: string[];
  };
}

interface CategoryData {
  category_name: string;
  products: Product[];
}

const HomeGoods = () => {
  const [data, setData] = useState<{
    bed?: CategoryData;
    sofa?: CategoryData;
    armchair?: CategoryData;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Load data from master.json
    if (masterData && masterData.categories) {
      setData({
        bed: masterData.categories.bed,
        sofa: masterData.categories.sofa,
        armchair: masterData.categories.armchair,
      });
    }
  }, []);

  const handleProductClick = (category: string, product: Product) => {
    navigate(`/homegoods/product/${category}/${product.product_number}`, {
      state: { product },
    });
  };

  const renderProductGrid = (products: Product[] | undefined, category: string) => {
    if (!products || products.length === 0) {
      return <div className="text-center text-muted-foreground py-8">No products available</div>;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <div
            key={product.product_number}
            onClick={() => handleProductClick(category, product)}
            className="group cursor-pointer bg-card rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-smooth shadow-soft hover:shadow-elevated animate-fade-in"
          >
            <div className="aspect-square relative overflow-hidden bg-secondary/30">
              <img
                src={product.thumbnail_url}
                alt={product.product_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {product.product_name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] gradient-warm">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">
              Home Goods Collection
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse our curated selection of home furniture
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-elevated p-6 animate-fade-in">
            <Tabs defaultValue="bed" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="bed" className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Bed
                </TabsTrigger>
                <TabsTrigger value="sofa" className="flex items-center gap-2">
                  <Sofa className="h-4 w-4" />
                  Sofa
                </TabsTrigger>
                <TabsTrigger value="armchair" className="flex items-center gap-2">
                  <Armchair className="h-4 w-4" />
                  Armchair
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bed" className="animate-fade-in">
                {renderProductGrid(data.bed?.products, "bed")}
              </TabsContent>

              <TabsContent value="sofa" className="animate-fade-in">
                {renderProductGrid(data.sofa?.products, "sofa")}
              </TabsContent>

              <TabsContent value="armchair" className="animate-fade-in">
                {renderProductGrid(data.armchair?.products, "armchair")}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeGoods;
