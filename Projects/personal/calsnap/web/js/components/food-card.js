function renderFoodCard(food, index, editable) {
  const editBtn = editable
    ? `<button class="btn-sm btn-outline" data-action="edit" data-idx="${index}">修正</button>`
    : '';
  return `
    <div class="food-item" data-idx="${index}">
      <div class="food-info">
        <span class="food-name">${esc(food.name)}</span>
        <span class="food-weight">${food.weight_g ? food.weight_g + 'g' : ''}</span>
      </div>
      <div class="food-meta">
        <span class="food-cal">${fmtCal(food.calories)} kcal</span>
        ${food.protein != null ? `<span class="food-macro">蛋白${food.protein}g</span>` : ''}
        ${food.fat != null ? `<span class="food-macro">脂肪${food.fat}g</span>` : ''}
        ${food.carbs != null ? `<span class="food-macro">碳水${food.carbs}g</span>` : ''}
        ${editBtn}
      </div>
    </div>
  `;
}

function renderFoodList(foods, editable) {
  return foods.map((f, i) => renderFoodCard(f, i, editable)).join('');
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
