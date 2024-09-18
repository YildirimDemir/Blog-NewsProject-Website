import EmblaCarousel from "@/components/LandingPage/Carousel";
import Posts from "@/components/Posts/Posts";
import Footer from "@/components/ui/Footer/Footer";
import Navbar from "@/components/ui/navbar/Navbar";

export default function Home() {
  return (
    <>
    <Navbar />
    <EmblaCarousel />
    <Posts />
    <Footer />
    </>
  );
}