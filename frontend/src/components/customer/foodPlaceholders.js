const placeholderByCategory = {
    breakfast: '/food-placeholders/comfort-bowl.svg',
    bowls: '/food-placeholders/comfort-bowl.svg',
    burgers: '/food-placeholders/handheld.svg',
    sandwiches: '/food-placeholders/handheld.svg',
    mains: '/food-placeholders/shareable.svg',
    sides: '/food-placeholders/shareable.svg',
    desserts: '/food-placeholders/sweet-finish.svg',
    drinks: '/food-placeholders/sweet-finish.svg'
};

export const getFoodPlaceholder = (category = '') => {
    const normalizedCategory = category.toLowerCase().trim();
    const matchingCategory = Object.keys(placeholderByCategory)
        .find((key) => normalizedCategory.includes(key));

    return placeholderByCategory[matchingCategory] || placeholderByCategory.mains;
};
