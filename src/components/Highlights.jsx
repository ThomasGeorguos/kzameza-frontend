import { ShoppingCart, BadgeCheck, ShieldCheck, Tag } from "lucide-react";

const items = [
  {
    icon: ShoppingCart,
    title: "Fast Delivery",
    desc: "Enjoy fast shipping on all your orders with reliable delivery service.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Guarantee",
    desc: "We ensure premium quality for every product we offer.",
  },
  {
    icon: Tag,
    title: "Daily Offers",
    desc: "Discover new deals and discounts every day on top titles.",
  },
  {
    icon: ShieldCheck,
    title: "100% Secure Payment",
    desc: "Your payments are fully protected with safe and reliable checkout.",
  },
];

function Highlights() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="bg-[#0B3D4A] rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-[#0B3D4A] hover:bg-[#0e4d5e] transition-colors duration-200 px-6 py-5 group"
            >
              {/* Icon */}
              <div className="shrink-0 w-11 h-11 rounded-xl bg-green-500/15 border border-green-400/25 flex items-center justify-center group-hover:bg-green-500/25 transition-colors duration-200">
                <Icon className="text-green-400 w-5 h-5" />
              </div>

              {/* Text */}
              <div>
                <h4 className="text-white font-semibold text-sm mb-1">
                  {title}
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Highlights;
