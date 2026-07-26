/* ============================================================
   shop.js - Shop UI rendering and purchase logic
   Items: TNT (500 each / bundle 3 for 1300), Shield (800),
   Lucky Leaf (1000), Claw Speed upgrade (variable price).
   ============================================================ */

const Shop = (function () {
  const PRICES = {
    tntSingle: 500,
    tntBundle: 1300,   // 3 TNT
    shield: 800,
    luckyLeaf: 1000
  };

  const SHOP_DIALOGS = [
    "Welcome back, miner! Let's see what we have today.",
    "That TNT costs 500 gold. Don't waste it on nothing!",
    "A Lucky Leaf costs 1000 gold. Turn a Rock into a Diamond!",
    "Your claw still slow? Upgrade it to chase those moving treasures.",
    "A Shield costs 800 gold — protect yourself from those nasty Mystery Bags.",
    "Buy a bundle of 3 TNT for 1300 — that's a bargain!",
    "Stock up wisely, the next round won't be easier."
  ];

  function randomDialog(gold) {
    const base = SHOP_DIALOGS[Math.floor(Math.random() * SHOP_DIALOGS.length)];
    return `${base} You've got ${gold} gold.`;
  }

  // Render the shop into the DOM. Returns nothing; uses callbacks for purchases.
  function render(gold, inventory, clawLevel, callbacks) {
    const grid = document.getElementById("shop-grid");
    grid.innerHTML = "";

    document.getElementById("shop-gold").textContent = gold;
    document.getElementById("shop-claw-level").textContent = clawLevel;
    document.getElementById("shop-dialog").textContent = randomDialog(gold);

    // TNT single
    grid.appendChild(makeItem({
      title: "🧨 TNT",
      desc: "Destroy a Rock and nearby Worms. Strategic time-saver.",
      price: `500 gold`,
      btn: "Buy 1 TNT",
      disabled: gold < PRICES.tntSingle,
      onClick: () => callbacks.buyTNT(1, PRICES.tntSingle)
    }));

    // TNT bundle
    grid.appendChild(makeItem({
      title: "🧨 TNT Bundle",
      desc: "3 TNT for the price of... well, a small discount!",
      price: `1300 gold (3×)`,
      btn: "Buy 3 TNT",
      disabled: gold < PRICES.tntBundle,
      onClick: () => callbacks.buyTNT(3, PRICES.tntBundle)
    }));

    // Shield
    grid.appendChild(makeItem({
      title: "🛡️ Shield",
      desc: "Blocks one -500 Mystery Bag penalty. Auto-consumed on hit.",
      price: `800 gold`,
      btn: "Buy Shield",
      disabled: gold < PRICES.shield,
      onClick: () => callbacks.buyShield(PRICES.shield)
    }));

    // Lucky Leaf
    grid.appendChild(makeItem({
      title: "🍀 Lucky Leaf",
      desc: "Turns the NEXT Rock you collect into a Diamond (+750).",
      price: `1000 gold`,
      btn: "Buy Lucky Leaf",
      disabled: gold < PRICES.luckyLeaf,
      onClick: () => callbacks.buyLuckyLeaf(PRICES.luckyLeaf)
    }));

    // Claw Speed upgrade
    const nextPrice = Upgrades.priceForNextLevel(clawLevel);
    grid.appendChild(makeItem({
      title: "⚙️ Claw Speed",
      desc: nextPrice === null
        ? "Max level reached! Your claw retrieval is at peak speed."
        : `Permanent upgrade. Faster object retrieval. Level ${clawLevel} → ${clawLevel + 1}.`,
      price: nextPrice === null ? "MAX" : `${nextPrice} gold`,
      btn: nextPrice === null ? "Max Level" : `Upgrade to L${clawLevel + 1}`,
      disabled: nextPrice === null || gold < nextPrice,
      onClick: () => callbacks.buyUpgrade(nextPrice)
    }));

    // Inventory display
    const inv = document.getElementById("shop-inventory-list");
    inv.innerHTML = "";
    const items = [
      `🧨 TNT × ${inventory.tnt}`,
      `🛡️ Shield × ${inventory.shield}`,
      `🍀 Lucky Leaf × ${inventory.luckyLeaf}`,
      `⚙️ Claw L${clawLevel}/5`
    ];
    inv.innerHTML = items.join("  ·  ");
  }

  function makeItem(opts) {
    const div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML = `<h4>${opts.title}</h4><div class="shop-desc">${opts.desc}</div><div class="shop-price">${opts.price}</div>`;
    const btn = document.createElement("button");
    btn.className = "shop-buy";
    btn.textContent = opts.btn;
    btn.disabled = !!opts.disabled;
    btn.addEventListener("click", opts.onClick);
    div.appendChild(btn);
    return div;
  }

  return { PRICES, render, randomDialog };
})();
