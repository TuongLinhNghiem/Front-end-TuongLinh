// Comprehensive logic test - injected into the game via browser js
(function(){
  const g = window.__game;
  const results = [];
  function log(name, cond) { results.push((cond ? "PASS" : "FAIL") + ": " + name); }

  // Test 8,9: Mystery bag positive/negative
  g.score = 0; g.inventory.shield = 1;
  // Force positive: we override Math.random temporarily
  const origRandom = Math.random;
  Math.random = () => 0.1; // < 0.5 => positive
  g.resolveMysteryBag({x:100,y:100});
  log("Mystery Bag +1000", g.score === 1000);
  log("Shield not consumed on +1000", g.inventory.shield === 1);

  // Mystery bag negative without shield consumed: shield should block
  g.score = 1000; g.inventory.shield = 1;
  Math.random = () => 0.8; // >= 0.5 => negative
  g.resolveMysteryBag({x:100,y:100});
  log("Shield blocks -500 (score unchanged)", g.score === 1000);
  log("Shield consumed on -500 block", g.inventory.shield === 0);

  // Mystery bag negative with no shield: lose 500
  g.score = 1000; g.inventory.shield = 0;
  Math.random = () => 0.8;
  g.resolveMysteryBag({x:100,y:100});
  log("Mystery Bag -500 (no shield)", g.score === 500);

  Math.random = origRandom;

  // Test 12,13: Lucky Leaf transform
  g.score = 0; g.inventory.luckyLeaf = 1; g.inventory.luckyLeafActive = false;
  g.activateLuckyLeaf();
  log("Lucky Leaf activated", g.inventory.luckyLeafActive === true);
  log("Lucky Leaf count decremented", g.inventory.luckyLeaf === 0);
  // Simulate retrieving a rock
  g.score = 0;
  g.onRetrieve({type:"rock", x:200, y:200, removed:false});
  log("Lucky Leaf transforms rock to +750", g.score === 750);
  log("Lucky Leaf consumed after transform", g.inventory.luckyLeafActive === false);

  // Rock without lucky leaf: +50, combo reset
  g.score = 0; g.combo = 5; g.comboMult = 1.2; g.inventory.luckyLeafActive = false;
  g.onRetrieve({type:"rock", x:200, y:200, removed:false});
  log("Rock gives +50", g.score === 50);
  log("Rock resets combo", g.combo === 0);

  // Worm: 0 gold, resets combo
  g.score = 100; g.combo = 5;
  g.onRetrieve({type:"worm", x:200, y:200, removed:false});
  log("Worm gives 0 gold", g.score === 100);
  log("Worm resets combo", g.combo === 0);

  // Combo system: 3 consecutive valuable => x1.1
  g.score = 0; g.combo = 0; g.comboMult = 1;
  g.onRetrieve({type:"smallGold", value:100, x:1,y:1, removed:false});
  g.onRetrieve({type:"smallGold", value:100, x:1,y:1, removed:false});
  g.onRetrieve({type:"smallGold", value:100, x:1,y:1, removed:false});
  log("Combo x1.1 after 3 valuable", g.comboMult === 1.1);
  log("Combo score 3*100*1.0..1.1", g.score === 300); // first 2 at x1.0, 3rd at x1.1 => 100+100+110=310? 
  // Actually combo increments BEFORE applying mult. Let me check: 1st: combo=1 mult=1 (no upgrade yet, combo<3) =>100; 2nd: combo=2 mult=1 =>100; 3rd: combo=3, updateComboMult=>1.1, apply =>110. total 310
  log("Combo total = 310 (100+100+110)", g.score === 310);

  // Star thresholds
  log("Scoring round 1: 3 stars at 7000", Scoring.calcStars(1, 7000) === 3);
  log("Scoring round 1: 2 stars at 4500", Scoring.calcStars(1, 4500) === 2);
  log("Scoring round 1: 1 star at 2000", Scoring.calcStars(1, 2000) === 1);
  log("Scoring round 1: 0 stars below 2000", Scoring.calcStars(1, 1999) === 0);
  log("Scoring round 1: pass at 1500", Scoring.passed(1, 1500) === true);
  log("Scoring round 1: fail below 1500", Scoring.passed(1, 1499) === false);
  log("Scoring round 10: 3 stars at 15000", Scoring.calcStars(10, 15000) === 3);

  // Claw upgrade max
  log("Claw upgrade can't exceed 5", Upgrades.canUpgrade(5) === false);
  log("Claw upgrade can at 4", Upgrades.canUpgrade(4) === true);
  log("Claw speed multiplier L5=1.5", Upgrades.multiplier(5) === 1.5);

  // Layout builds valid for all rounds
  let allValid = true;
  for (let r = 1; r <= 10; r++) {
    const objs = LayoutManager.buildLayout(r);
    if (!objs || objs.length === 0) allValid = false;
  }
  log("All 10 rounds build layouts", allValid);

  return results.join("\n");
})();
