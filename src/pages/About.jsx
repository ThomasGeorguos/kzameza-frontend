import { Globe, ShieldCheck, Truck, BadgeCheck, Users, Package } from "lucide-react"
 
const stats = [
  { value: "500+",  label: "Products" },
  { value: "20+",   label: "Countries Imported From" },
  { value: "10K+",  label: "Happy Customers" },
  { value: "99%",   label: "Satisfaction Rate" },
]
 
const values = [
  { icon: Globe,       title: "Global Sourcing",     desc: "We import directly from top manufacturers worldwide to bring you the best products at competitive prices." },
  { icon: ShieldCheck, title: "Quality Checked",     desc: "Every product passes strict quality checks before reaching your hands." },
  { icon: Truck,       title: "Fast Delivery",       desc: "We ensure your orders are packed and shipped as quickly as possible." },
  { icon: BadgeCheck,  title: "Authentic Products",  desc: "100% genuine products sourced directly from trusted international suppliers." },
  { icon: Users,       title: "Customer First",      desc: "Our team is always here to help you with anything you need, before and after your purchase." },
  { icon: Package,     title: "Wide Variety",        desc: "From electronics to fashion to home essentials — we carry it all under one roof." },
]
 
 function About() {
  return (
    <div className="min-h-screen bg-slate-100">
 
      {/* Hero */}
      <div className="bg-[#0B3D4A] py-20 px-6 text-center relative overflow-hidden">
        {/* bg pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
 
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-400/30 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            Your Trusted <span className="text-green-400">Import Store</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            We are an e-commerce store specializing in importing high-quality products from around the world and delivering them straight to your door. From electronics to fashion, home essentials to accessories — we bring the world to you.
          </p>
        </div>
      </div>
 
      {/* Stats */}
      <div className="bg-[#0e4d5e] py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-green-400">{value}</p>
              <p className="text-gray-300 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
 
      {/* Values */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-1 h-7 bg-green-500 rounded-full" />
            <h2 className="text-2xl font-black text-gray-800">Why Choose Us</h2>
            <div className="w-1 h-7 bg-green-500 rounded-full" />
          </div>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            We're committed to making your shopping experience seamless, reliable, and enjoyable.
          </p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#0B3D4A] border border-white/10 rounded-2xl p-6 hover:border-green-400/30 hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="w-11 h-11 rounded-xl bg-green-500/15 border border-green-400/25 flex items-center justify-center mb-4 group-hover:bg-green-500/25 transition-colors">
                <Icon className="w-5 h-5 text-green-400" />
              </div>
              <h4 className="text-white font-bold text-sm mb-2">{title}</h4>
              <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
 
      {/* Mission */}
      <div className="bg-[#0B3D4A] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-5">Our Mission</h2>
          <p className="text-gray-300 text-base leading-relaxed">
            Our mission is simple — make world-class products accessible to everyone. We handle the complex process of international importing so you don't have to. Every item in our store is carefully selected, quality-verified, and priced fairly.
          </p>
        </div>
      </div>
 
    </div>
  )
}
export default About
 
