// hms-frontend/src/components/Tabs.jsx

export const Tabs = ({ 
  tabs, 
  activeTab, 
  setActiveTab 
}) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-1 py-3 text-sm font-600 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
