import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { apiFetch } from "../config/api";

import "swiper/css";
import "swiper/css/effect-fade";

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [active, setActive] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    apiFetch("/api/hero-slides")
      .then((res) => res.json())
      .then((data) => setSlides(data.slides || []))
      .catch((err) => console.error("Error fetching hero slides", err));
  }, []);

  if (slides.length === 0) return null;

  const current = slides[active];
  const linkTo = current.product?._id
    ? `/products/${current.product._id}`
    : "/products";

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
            <Link
              to={linkTo}
              className="relative flex items-center px-8 md:px-14 order-2 md:order-1"
            >
              <span
                key={current._id}
                className="hero-track absolute -top-4 left-6 md:left-10 text-[130px] font-black text-white/5 select-none leading-none"
              >
                {String(active + 1).padStart(2, "0")}
              </span>

              <div
                key={`text-${current._id}`}
                className="hero-track relative z-10 max-w-sm"
              >
                {current.eyebrow && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-[2px] bg-green-400" />
                    <span className="text-green-400 text-xs font-bold uppercase tracking-widest">
                      {current.eyebrow}
                    </span>
                  </div>
                )}

                <h2 className="text-4xl md:text-[42px] font-black text-white leading-[1.05] tracking-tight hover:text-green-400 transition-colors duration-200">
                  {current.title || current.product?.title}
                  {current.highlight && (
                    <>
                      <br />
                      <span className="text-green-400">
                        {current.highlight}
                      </span>
                    </>
                  )}
                </h2>

                {current.description && (
                  <p className="text-gray-400 text-sm leading-relaxed mt-5">
                    {current.description}
                  </p>
                )}

                {/* Progress Dashes */}
                <div className="flex items-center gap-2 mt-9">
                  {slides.map((s, i) => (
                    <button
                      key={s._id}
                      onClick={(e) => {
                        e.preventDefault();
                        swiperRef.current?.slideToLoop(i);
                      }}
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
            </Link>

            {/* Right — Image Panel */}
            <Link
              to={linkTo}
              className="relative h-full order-1 md:order-2 overflow-hidden block"
            >
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
                  <SwiperSlide key={slide._id}>
                    <div className="relative w-full h-full">
                      <img
                        src={slide.image}
                        alt={slide.title || slide.product?.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0B3D4A] via-transparent to-transparent md:from-[#0B3D4A] md:w-1/4" />
                      <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="absolute bottom-5 right-5 w-14 h-14 rounded-2xl bg-[#0B3D4A]/70 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <span className="text-white font-black text-sm">
                  {String(active + 1).padStart(2, "0")}
                  <span className="text-gray-400">/0{slides.length}</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
