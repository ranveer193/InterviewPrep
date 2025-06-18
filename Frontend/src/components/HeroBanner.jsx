// components/HeroBanner.jsx
export default function HeroBanner({ title = "Interview Experiences", subtitle = "From NIT KKR to top companies—real interviews, real experiences." }) {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12 mb-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-8 left-8 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute top-16 right-16 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 text-center">
        {/* Main Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
