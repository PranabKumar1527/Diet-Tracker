import React, { useState } from 'react';

const FOOD_LIBRARY = {
  Breakfast: [
    { id: 1, name: 'Poha', emoji: '🍚', calories: 180, protein: 4, carbs: 35, fat: 3, fiber: 2, time: '15 mins', difficulty: 'Easy', ingredients: ['1 cup flattened rice', '1 onion', '2 green chillies', '1 tsp mustard seeds', 'Curry leaves', 'Turmeric', 'Salt', 'Lemon juice', 'Coriander'], recipe: ['Rinse flattened rice and drain.', 'Heat oil, add mustard seeds and let them splutter.', 'Add curry leaves, green chillies and onion. Saute till golden.', 'Add turmeric and salt. Mix well.', 'Add flattened rice and mix gently.', 'Squeeze lemon juice and garnish with coriander.', 'Serve hot.'] },
    { id: 2, name: 'Upma', emoji: '🥣', calories: 150, protein: 4, carbs: 24, fat: 5, fiber: 2, time: '20 mins', difficulty: 'Easy', ingredients: ['1 cup semolina', '2 cups water', '1 onion', 'Green chillies', 'Ginger', 'Curry leaves', 'Mustard seeds', 'Salt'], recipe: ['Dry roast semolina till golden. Keep aside.', 'Heat oil, add mustard seeds.', 'Add curry leaves, ginger, chillies and onion.', 'Add water and salt. Bring to boil.', 'Slowly add semolina stirring continuously.', 'Cover and cook for 3-4 mins.', 'Serve with coconut chutney.'] },
    { id: 3, name: 'Idli Sambar', emoji: '🫓', calories: 200, protein: 8, carbs: 38, fat: 2, fiber: 4, time: '30 mins', difficulty: 'Medium', ingredients: ['4 idlis', 'Toor dal', 'Vegetables', 'Tamarind', 'Sambar powder', 'Mustard seeds', 'Curry leaves'], recipe: ['Prepare sambar with dal and vegetables.', 'Add tamarind water and sambar powder.', 'Temper with mustard seeds and curry leaves.', 'Serve hot idlis with sambar and coconut chutney.'] },
    { id: 4, name: 'Egg Omelette', emoji: '🍳', calories: 180, protein: 14, carbs: 2, fat: 13, fiber: 0, time: '10 mins', difficulty: 'Easy', ingredients: ['2 eggs', '1 onion', '1 tomato', 'Green chillies', 'Salt', 'Pepper', 'Oil'], recipe: ['Beat eggs with salt and pepper.', 'Heat oil in pan.', 'Add onion, tomato, chillies. Saute briefly.', 'Pour egg mixture over vegetables.', 'Cook till set, fold and serve.'] },
  ],
  Lunch: [
    { id: 5, name: 'Dal Rice', emoji: '🍛', calories: 350, protein: 14, carbs: 65, fat: 4, fiber: 8, time: '30 mins', difficulty: 'Easy', ingredients: ['1 cup rice', '1/2 cup toor dal', 'Tomato', 'Onion', 'Turmeric', 'Cumin', 'Salt', 'Ghee'], recipe: ['Cook rice separately.', 'Pressure cook dal with tomato and turmeric.', 'Temper with ghee, cumin, and onion.', 'Mix dal and serve hot with rice and pickle.'] },
    { id: 6, name: 'Roti Sabzi', emoji: '🫓', calories: 300, protein: 10, carbs: 50, fat: 6, fiber: 7, time: '25 mins', difficulty: 'Easy', ingredients: ['2 rotis', 'Mixed vegetables', 'Onion', 'Tomato', 'Spices', 'Oil'], recipe: ['Make soft rotis with whole wheat flour.', 'Cook vegetables with onion tomato masala.', 'Add spices and cook till done.', 'Serve roti with sabzi and curd.'] },
    { id: 7, name: 'Chicken Curry Rice', emoji: '🍗', calories: 450, protein: 35, carbs: 50, fat: 12, fiber: 3, time: '45 mins', difficulty: 'Medium', ingredients: ['200g chicken', '1 cup rice', 'Onion', 'Tomato', 'Ginger garlic paste', 'Spices', 'Oil'], recipe: ['Marinate chicken with spices.', 'Cook onion tomato masala.', 'Add chicken and cook till tender.', 'Serve with steamed rice.'] },
    { id: 8, name: 'Paneer Roti', emoji: '🧀', calories: 380, protein: 20, carbs: 45, fat: 14, fiber: 4, time: '30 mins', difficulty: 'Medium', ingredients: ['100g paneer', '2 rotis', 'Capsicum', 'Onion', 'Tomato', 'Spices'], recipe: ['Crumble or cube paneer.', 'Cook with onion capsicum and spices.', 'Make fresh rotis.', 'Serve together with curd on the side.'] },
  ],
  Dinner: [
    { id: 9, name: 'Khichdi', emoji: '🍲', calories: 280, protein: 12, carbs: 50, fat: 5, fiber: 6, time: '25 mins', difficulty: 'Easy', ingredients: ['1/2 cup rice', '1/2 cup moong dal', 'Vegetables', 'Turmeric', 'Ghee', 'Cumin', 'Salt'], recipe: ['Wash rice and dal together.', 'Pressure cook with vegetables and turmeric.', 'Temper with ghee and cumin.', 'Serve hot with curd or pickle.'] },
    { id: 10, name: 'Vegetable Soup', emoji: '🥣', calories: 120, protein: 5, carbs: 20, fat: 2, fiber: 5, time: '20 mins', difficulty: 'Easy', ingredients: ['Mixed vegetables', 'Garlic', 'Onion', 'Pepper', 'Salt', 'Herbs'], recipe: ['Chop all vegetables.', 'Saute garlic and onion.', 'Add vegetables and water.', 'Simmer till soft.', 'Blend partially for thick consistency.', 'Season and serve hot.'] },
    { id: 11, name: 'Egg Fried Rice', emoji: '🍳', calories: 320, protein: 18, carbs: 45, fat: 8, fiber: 2, time: '20 mins', difficulty: 'Easy', ingredients: ['1 cup cooked rice', '2 eggs', 'Vegetables', 'Soy sauce', 'Pepper', 'Oil'], recipe: ['Heat oil in wok.', 'Scramble eggs and keep aside.', 'Stir fry vegetables.', 'Add rice and mix well.', 'Add eggs and soy sauce.', 'Toss everything and serve hot.'] },
  ],
  Snacks: [
    { id: 12, name: 'Sprouts Salad', emoji: '🥗', calories: 120, protein: 9, carbs: 18, fat: 1, fiber: 5, time: '10 mins', difficulty: 'Easy', ingredients: ['1 cup mixed sprouts', 'Tomato', 'Onion', 'Cucumber', 'Lemon', 'Salt', 'Chaat masala'], recipe: ['Boil or steam sprouts lightly.', 'Chop all vegetables.', 'Mix everything together.', 'Add lemon juice and chaat masala.', 'Serve fresh.'] },
    { id: 13, name: 'Boiled Eggs', emoji: '🥚', calories: 140, protein: 12, carbs: 1, fat: 10, fiber: 0, time: '12 mins', difficulty: 'Easy', ingredients: ['2 eggs', 'Salt', 'Pepper', 'Chaat masala'], recipe: ['Place eggs in cold water.', 'Bring to boil, cook 10-12 mins.', 'Transfer to cold water immediately.', 'Peel and season with salt and chaat masala.'] },
    { id: 14, name: 'Fruit Bowl', emoji: '🍎', calories: 150, protein: 2, carbs: 35, fat: 0, fiber: 5, time: '5 mins', difficulty: 'Easy', ingredients: ['Banana', 'Apple', 'Pomegranate', 'Grapes', 'Honey'], recipe: ['Chop all fruits into bite sized pieces.', 'Mix together in a bowl.', 'Drizzle honey on top.', 'Serve fresh and chilled.'] },
  ],
};

export default function FoodLibrary({ userId }) {
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [selectedFood, setSelectedFood] = useState(null);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-1">🍽️ Food Library</h2>
      <p className="text-gray-400 text-sm mb-5">Browse healthy recipes. Click any dish to see full recipe.</p>

      {/* Meal Type Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.keys(FOOD_LIBRARY).map(type => (
          <button key={type} onClick={() => { setSelectedMeal(type); setSelectedFood(null); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedMeal === type
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}>
            {type}
          </button>
        ))}
      </div>

      {/* Food Cards Grid */}
      {!selectedFood && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FOOD_LIBRARY[selectedMeal].map(food => (
            <div key={food.id} onClick={() => setSelectedFood(food)}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-4 cursor-pointer hover:border-green-500/50 hover:bg-gray-750 transition-all group">
              <div className="text-5xl mb-3 text-center">{food.emoji}</div>
              <h3 className="font-bold text-white text-center mb-2 group-hover:text-green-400 transition-colors">
                {food.name}
              </h3>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>🔥 {food.calories}</span>
                <span>💪 {food.protein}g</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>⏱️ {food.time}</span>
                <span className={`px-2 py-0.5 rounded-full ${
                  food.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>{food.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail View */}
      {selectedFood && (
        <div className="animate-fadeIn">
          <button onClick={() => setSelectedFood(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors mb-5 text-sm">
            ← Back to {selectedMeal}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left - Recipe Info */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl">{selectedFood.emoji}</div>
                <div>
                  <h3 className="text-2xl font-black text-white">{selectedFood.name}</h3>
                  <div className="flex gap-3 mt-1 text-sm text-gray-400">
                    <span>⏱️ {selectedFood.time}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedFood.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{selectedFood.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Nutrition */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Calories', value: selectedFood.calories, unit: 'kcal', color: 'green' },
                  { label: 'Protein', value: selectedFood.protein, unit: 'g', color: 'blue' },
                  { label: 'Carbs', value: selectedFood.carbs, unit: 'g', color: 'orange' },
                  { label: 'Fat', value: selectedFood.fat, unit: 'g', color: 'yellow' },
                ].map((n, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-3 text-center">
                    <div className="text-xl font-black text-white">{n.value}<span className="text-xs text-gray-400 font-normal ml-1">{n.unit}</span></div>
                    <div className="text-xs text-gray-400 mt-1">{n.label}</div>
                  </div>
                ))}
              </div>

              {/* Ingredients */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h4 className="font-bold text-white mb-3">🛒 Ingredients</h4>
                <div className="space-y-1">
                  {selectedFood.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      {ing}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Steps */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="font-bold text-white mb-4">👨‍🍳 How to Prepare</h4>
              <div className="space-y-3">
                {selectedFood.recipe.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed" style={{fontFamily: 'Georgia, serif'}}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}