// Analyze max possible score per round (valuable objects only, with max combo x1.3)
const OBJECT_VALUES = {
  smallGold: 100, mediumGold: 250, largeGold: 500, rock: 50, worm: 0,
  diamond: 750, mysteryBag: 1000, movingDiamond: 1000, goldenTreasure: 1500, tnt: 0
};
const VALUABLE = ["smallGold","mediumGold","largeGold","diamond","movingDiamond","goldenTreasure","mysteryBag"];

function layoutMax(layouts) {
  return layouts.map(layout => {
    let base = 0;
    layout.forEach(o => {
      if (VALUABLE.includes(o.t)) base += OBJECT_VALUES[o.t];
    });
    // best case: all valuable collected consecutively with ramping combo
    // approximate max with combo: average multiplier ~1.2 if all valuable
    return Math.round(base * 1.2);
  });
}
