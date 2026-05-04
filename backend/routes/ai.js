const express = require('express');
const PantryItem = require('../models/PantryItem');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/ai/use-first
// Returns items sorted by expiry (closest first) with a simple recommendation message
router.get('/use-first', protect, async (req, res) => {
  try {
    const today = new Date();

    const items = await PantryItem.find({ user: req.user._id }).sort({
      expiryDate: 1,
    });

    if (items.length === 0) {
      return res.json({ suggestions: [], message: 'Your pantry is empty. Add some items first.' });
    }

    const suggestions = items.slice(0, 5).map((item) => {
      const daysLeft = Math.ceil(
        (new Date(item.expiryDate) - today) / (1000 * 60 * 60 * 24)
      );

      let urgency = 'low';
      let note = '';

      if (daysLeft < 0) {
        urgency = 'expired';
        note = `Expired ${Math.abs(daysLeft)} day(s) ago. Consider discarding.`;
      } else if (daysLeft === 0) {
        urgency = 'critical';
        note = 'Expires today! Use immediately.';
      } else if (daysLeft <= 3) {
        urgency = 'high';
        note = `Expires in ${daysLeft} day(s). Use very soon.`;
      } else if (daysLeft <= 7) {
        urgency = 'medium';
        note = `Expires in ${daysLeft} day(s). Plan to use this week.`;
      } else {
        urgency = 'low';
        note = `Expires in ${daysLeft} day(s). No immediate rush.`;
      }

      return {
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        daysLeft,
        urgency,
        note,
      };
    });

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/ai/recipes
// Accepts { ingredients: ["egg", "tomato", ...] } and returns basic recipe ideas
// Uses simple rule-based logic without an external AI service
router.post('/recipes', protect, async (req, res) => {
  try {
    // Pull ingredients from request or from user's pantry
    let ingredientList = req.body.ingredients;

    if (!ingredientList || ingredientList.length === 0) {
      const pantryItems = await PantryItem.find({ user: req.user._id }).sort({
        expiryDate: 1,
      });
      ingredientList = pantryItems.map((item) => item.name.toLowerCase());
    }

    if (ingredientList.length === 0) {
      return res.json({
        recipes: [],
        message: 'No ingredients found. Add items to your pantry first.',
      });
    }

    const recipes = generateRecipeSuggestions(ingredientList);

    res.json({ recipes, ingredientsUsed: ingredientList });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Simple rule-based recipe suggestion engine
function generateRecipeSuggestions(ingredients) {
  const lower = ingredients.map((i) => i.toLowerCase());

  const recipeDatabase = [
    {
      name: 'Scrambled Eggs',
      requiredIngredients: ['egg', 'eggs'],
      optionalIngredients: ['butter', 'milk', 'cheese', 'salt', 'pepper'],
      instructions:
        'Whisk eggs with a splash of milk. Cook in a buttered pan on low heat, stirring gently until just set.',
      time: '10 minutes',
    },
    {
      name: 'Tomato Omelette',
      requiredIngredients: ['egg', 'eggs', 'tomato', 'tomatoes'],
      optionalIngredients: ['onion', 'cheese', 'salt', 'pepper', 'herbs'],
      instructions:
        'Beat eggs, pour into a hot pan. Add diced tomatoes and any extras. Fold and serve.',
      time: '15 minutes',
    },
    {
      name: 'Pasta with Tomato Sauce',
      requiredIngredients: ['pasta', 'tomato', 'tomatoes'],
      optionalIngredients: ['garlic', 'onion', 'olive oil', 'basil', 'cheese'],
      instructions:
        'Cook pasta. Saute garlic and onion, add tomatoes and simmer for 10 minutes. Toss with pasta.',
      time: '25 minutes',
    },
    {
      name: 'Garlic Fried Rice',
      requiredIngredients: ['rice'],
      optionalIngredients: ['garlic', 'egg', 'eggs', 'soy sauce', 'onion', 'vegetables'],
      instructions:
        'Fry garlic in oil, add day-old rice and stir-fry. Push to side, scramble egg, mix together.',
      time: '15 minutes',
    },
    {
      name: 'Simple Vegetable Stir-fry',
      requiredIngredients: ['carrot', 'carrots', 'broccoli', 'onion', 'pepper', 'peppers'],
      optionalIngredients: ['garlic', 'soy sauce', 'oil', 'ginger'],
      instructions:
        'Chop vegetables. Stir-fry on high heat in oil for 5-7 minutes. Season with soy sauce.',
      time: '20 minutes',
    },
    {
      name: 'Banana Smoothie',
      requiredIngredients: ['banana', 'bananas', 'milk'],
      optionalIngredients: ['honey', 'yogurt', 'ice'],
      instructions:
        'Blend banana with milk until smooth. Add honey to taste. Serve cold.',
      time: '5 minutes',
    },
    {
      name: 'Lentil Soup',
      requiredIngredients: ['lentil', 'lentils'],
      optionalIngredients: ['onion', 'garlic', 'tomato', 'carrot', 'cumin', 'salt'],
      instructions:
        'Saute onion and garlic. Add lentils, water or broth, and vegetables. Simmer 25-30 minutes.',
      time: '40 minutes',
    },
    {
      name: 'Cheese Toast',
      requiredIngredients: ['bread', 'cheese'],
      optionalIngredients: ['butter', 'tomato', 'onion'],
      instructions:
        'Butter bread, top with sliced or grated cheese. Toast until melted and golden.',
      time: '10 minutes',
    },
    {
      name: 'Avocado Toast',
      requiredIngredients: ['avocado', 'bread'],
      optionalIngredients: ['egg', 'eggs', 'lemon', 'salt', 'pepper', 'chili flakes'],
      instructions:
        'Toast bread. Mash avocado with lemon juice and salt. Spread on toast and top with any extras.',
      time: '10 minutes',
    },
    {
      name: 'Potato Soup',
      requiredIngredients: ['potato', 'potatoes'],
      optionalIngredients: ['onion', 'garlic', 'milk', 'butter', 'cheese', 'salt'],
      instructions:
        'Boil diced potatoes with onion until soft. Blend partially, add milk and butter. Season.',
      time: '30 minutes',
    },
  ];

  const matched = [];

  for (const recipe of recipeDatabase) {
    const hasRequired = recipe.requiredIngredients.some((req) =>
      lower.some((ing) => ing.includes(req) || req.includes(ing))
    );

    if (hasRequired) {
      const matchedOptional = recipe.optionalIngredients.filter((opt) =>
        lower.some((ing) => ing.includes(opt) || opt.includes(ing))
      );

      matched.push({
        name: recipe.name,
        instructions: recipe.instructions,
        time: recipe.time,
        matchedIngredients: [
          ...recipe.requiredIngredients.filter((req) =>
            lower.some((ing) => ing.includes(req) || req.includes(ing))
          ),
          ...matchedOptional,
        ],
        missingIngredients: recipe.requiredIngredients.filter(
          (req) => !lower.some((ing) => ing.includes(req) || req.includes(ing))
        ),
      });
    }
  }

  // Sort by number of matched ingredients
  matched.sort((a, b) => b.matchedIngredients.length - a.matchedIngredients.length);

  return matched.length > 0
    ? matched.slice(0, 5)
    : [
        {
          name: 'No specific recipes found',
          instructions:
            'Try adding more common ingredients like eggs, pasta, rice, or vegetables to get recipe suggestions.',
          time: '-',
          matchedIngredients: [],
          missingIngredients: [],
        },
      ];
}

module.exports = router;
