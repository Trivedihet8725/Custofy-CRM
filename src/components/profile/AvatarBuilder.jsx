import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

const TRAITS = {
  skinColor: [
    { label: "Light", value: "ffdbb4", color: "#ffdbb4" },
    { label: "Medium Light", value: "edb98a", color: "#edb98a" },
    { label: "Medium", value: "d08b5b", color: "#d08b5b" },
    { label: "Medium Dark", value: "ae5d29", color: "#ae5d29" },
    { label: "Dark", value: "614335", color: "#614335" },
  ],
  top: [
    { label: "Short", value: "shortHair" },
    { label: "Long", value: "longHair" },
    { label: "Curly", value: "shortHairTheCaesar" },
    { label: "Dreads", value: "shortHairDreads01" },
    { label: "Hat", value: "hat" },
    { label: "Hijab", value: "hijab" },
    { label: "Turban", value: "turban" },
    { label: "Winter Hat", value: "winterHat1" },
  ],
  hairColor: [
    { label: "Black", value: "2c1b18", color: "#2c1b18" },
    { label: "Dark Brown", value: "4a3123", color: "#4a3123" },
    { label: "Brown", value: "724133", color: "#724133" },
    { label: "Blonde", value: "d6b370", color: "#d6b370" },
    { label: "Red", value: "c93305", color: "#c93305" },
    { label: "Pink", value: "f59797", color: "#f59797" },
    { label: "White", value: "e8e1e1", color: "#e8e1e1" },
  ],
  clothing: [
    { label: "T-Shirt", value: "shirtCrewNeck" },
    { label: "Hoodie", value: "hoodie" },
    { label: "Blazer", value: "blazerAndShirt" },
    { label: "Sweater", value: "collarAndSweater" },
    { label: "Overall", value: "overall" },
    { label: "Graphic Tee", value: "graphicShirt" },
  ],
  clothingColor: [
    { label: "Black", value: "262E33", color: "#262E33" },
    { label: "Blue", value: "65C9FF", color: "#65C9FF" },
    { label: "Red", value: "ff5c5c", color: "#ff5c5c" },
    { label: "Purple", value: "9287FF", color: "#9287FF" },
    { label: "Green", value: "A7FFC4", color: "#A7FFC4" },
  ],
  accessories: [
    { label: "None", value: "blank" },
    { label: "Glasses 1", value: "prescription01" },
    { label: "Glasses 2", value: "prescription02" },
    { label: "Round", value: "round" },
    { label: "Sunglasses", value: "sunglasses" },
  ],
  facialHair: [
    { label: "None", value: "blank" },
    { label: "Medium Beard", value: "beardMedium" },
    { label: "Light Beard", value: "beardLight" },
    { label: "Moustache", value: "moustacheMagnum" },
  ]
};

const CATEGORIES = [
  { id: "skinColor", label: "Skin" },
  { id: "top", label: "Hair Style" },
  { id: "hairColor", label: "Hair Color" },
  { id: "clothing", label: "Clothing" },
  { id: "clothingColor", label: "Cloth Color" },
  { id: "accessories", label: "Accessories" },
  { id: "facialHair", label: "Facial Hair" },
];

export const getCustomAvatarUrl = (traits) => {
  if (!traits || typeof traits !== 'object') {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${traits || "custofy_admin"}`;
  }
  
  const params = new URLSearchParams({
    seed: traits.seed || "custom",
    skinColor: traits.skinColor || "edb98a",
    top: traits.top || "shortHair",
    hairColor: traits.hairColor || "2c1b18",
    clothing: traits.clothing || "shirtCrewNeck",
    clothingColor: traits.clothingColor || "262E33",
    accessories: traits.accessories || "blank",
    facialHair: traits.facialHair || "blank",
  });
  return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
};

export default function AvatarBuilder({ initialTraits, onSave, onClose }) {
  const [activeCategory, setActiveCategory] = useState("skinColor");
  const [traits, setTraits] = useState(() => {
    if (initialTraits && typeof initialTraits === 'object') {
      return initialTraits;
    }
    return {
      seed: "custom",
      skinColor: "edb98a",
      top: "shortHair",
      hairColor: "2c1b18",
      clothing: "shirtCrewNeck",
      clothingColor: "262E33",
      accessories: "blank",
      facialHair: "blank",
    };
  });

  const handleSelect = (value) => {
    setTraits(prev => ({ ...prev, [activeCategory]: value }));
  };

  const currentPreviewUrl = getCustomAvatarUrl(traits);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-bold text-slate-800">Avatar Studio</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          
          {/* LEFT: Live Preview */}
          <div className="w-full sm:w-1/3 bg-slate-50 flex flex-col items-center justify-center p-6 border-r border-slate-100">
            <div className="w-40 h-40 bg-white rounded-full shadow-inner border-4 border-white flex items-center justify-center p-2 mb-4">
              <img src={currentPreviewUrl} alt="Live Avatar Preview" className="w-full h-full" />
            </div>
            <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Live Preview</p>
          </div>

          {/* RIGHT: Controls */}
          <div className="w-full sm:w-2/3 flex flex-col h-full bg-white">
            
            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b hide-scrollbar p-2">
              <div className="flex gap-2 px-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      activeCategory === cat.id 
                        ? "bg-indigo-100 text-indigo-700 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TRAITS[activeCategory].map(option => {
                  const isSelected = traits[activeCategory] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`
                        relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all
                        ${isSelected ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-white hover:border-slate-300"}
                      `}
                    >
                      {option.color && (
                        <div 
                          className="w-8 h-8 rounded-full mb-2 shadow-sm border border-slate-200"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <span className={`text-xs font-semibold ${isSelected ? "text-indigo-700" : "text-slate-600"}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-indigo-500 text-white p-0.5 rounded-full">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-white rounded-b-3xl flex justify-end">
          <button
            onClick={() => onSave(traits)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold tracking-wide hover:bg-indigo-700 btn-3d"
          >
            Save Avatar
          </button>
        </div>

      </div>
    </div>
  );
}
