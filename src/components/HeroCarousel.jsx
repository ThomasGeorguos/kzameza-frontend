import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";

const slides = [
  {
    id: 1,
    number: "01",
    image: "turkishCoffee.jpg",
    eyebrow: "New Arrival",
    title: "Summer",
    highlight: "Collection",
    description: "Discover the latest trends crafted for the modern lifestyle.",
  },
  {
    id: 2,
    number: "02",
    image: "frenchCoffee.jpg",
    eyebrow: "Limited Offer",
    title: "Up to 50%",
    highlight: "Off",
    description: "Grab your favorites before they're gone. Today only.",
  },
  {
    id: 3,
    number: "03",
    image: "greek.jpg",
    eyebrow: "Best Sellers",
    title: "Top Picks",
    highlight: "This Week",
    description: "Handpicked products loved by thousands of happy customers.",
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const swiperRef = useRef(null);

  return (
    <>
      <style>{`
        .hero-track { animation: fadeSlide 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-6">
        <div
          className="w-full bg-[#0B3D4A] overflow-hidden rounded-3xl border border-white/10 shadow-xl"
          style={{ height: "460px" }}
        >
          <div className="max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-2">
            {/* Left — Text Panel */}
            <div className="relative flex items-center px-8 md:px-14 order-2 md:order-1">
              {/* رقم زخرفي كبير في الخلفية */}
              <span
                key={slides[active].id}
                className="hero-track absolute -top-4 left-6 md:left-10 text-[130px] font-black text-white/5 select-none leading-none"
              >
                {slides[active].number}
              </span>

              <div
                key={`text-${slides[active].id}`}
                className="hero-track relative z-10 max-w-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-[2px] bg-green-400" />
                  <span className="text-green-400 text-xs font-bold uppercase tracking-widest">
                    {slides[active].eyebrow}
                  </span>
                </div>

                <h2 className="text-4xl md:text-[42px] font-black text-white leading-[1.05] tracking-tight">
                  {slides[active].title}
                  <br />
                  <span className="text-green-400">
                    {slides[active].highlight}
                  </span>
                </h2>

                <p className="text-gray-400 text-sm leading-relaxed mt-5">
                  {slides[active].description}
                </p>

                {/* Progress Dashes */}
                <div className="flex items-center gap-2 mt-9">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => swiperRef.current?.slideToLoop(i)}
                      aria-label={`Slide ${i + 1}`}
                      className="group py-2 cursor-pointer"
                    >
                      <span
                        className={`block h-[3px] rounded-full transition-all duration-500 ${
                          i === active
                            ? "w-8 bg-green-400"
                            : "w-4 bg-white/20 group-hover:bg-white/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Image Panel */}
            <div className="relative h-full order-1 md:order-2 overflow-hidden">
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                loop
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                speed={700}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                onSlideChange={(swiper) => setActive(swiper.realIndex)}
                className="w-full h-full"
              >
                {slides.map((slide) => (
                  <SwiperSlide key={slide.id}>
                    <div className="relative w-full h-full">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      {/* تدرج يربط الصورة بلون الصفحة */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0B3D4A] via-transparent to-transparent md:from-[#0B3D4A] md:w-1/4" />
                      <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* شكل زخرفي في الركن */}
              <div className="absolute bottom-5 right-5 w-14 h-14 rounded-2xl bg-[#0B3D4A]/70 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <span className="text-white font-black text-sm">
                  {slides[active].number}
                  <span className="text-gray-400">/0{slides.length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
