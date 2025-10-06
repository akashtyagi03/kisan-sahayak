export default FeatureCard = ({ icon, title, description, comingSoon }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 border border-gray-100 relative">
      {comingSoon && (
        <span className="absolute top-0 right-0 bg-yellow-400 text-gray-800 text-xs font-semibold px-2 py-1 rounded-bl-lg">
          Coming Soon
        </span>
      )}
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-base">{description}</p>
    </div>
  );