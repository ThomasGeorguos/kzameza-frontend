import FeaturedProducts from "../components/FeaturedProducts";
import HeroCarousel from "../components/HeroCarousel";
import Highlights from "../components/Highlights";

function Home() {
  return (
    <div>
      <HeroCarousel />
      <Highlights />
      <FeaturedProducts />
    </div>
  );
}

export default Home;
