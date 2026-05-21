export const COMMUNITY_INSIGHTS = {
  // --- INTRINSIC FRAMES ---
  "Adaptive Frame": {
    name: "Adaptive Frame",
    activation: "Passive",
    stackBehavior: "Static archetype baseline.",
    timers: "Always active.",
    statBoosts: "Well-rounded grip, reliable and sturdy. Balanced stability, range, and handling baseline.",
    enhanced: null
  },
  "Precision Frame": {
    name: "Precision Frame",
    activation: "Passive",
    stackBehavior: "Highly predictable vertical recoil. Reduces bounce intensity by 15%.",
    timers: "Always active.",
    statBoosts: "Substantially narrows the horizontal recoil bounce cone. Modifies baseline sway recoil direction.",
    enhanced: null
  },
  "Lightweight Frame": {
    name: "Lightweight Frame",
    activation: "Passive (Weapon Held in Hand)",
    stackBehavior: "Grants +20 Mobility and a +6.25% Sprint Speed increase.",
    timers: "Active while this weapon is equipped and drawn.",
    statBoosts: "Provides passive +20 Mobility (which decreases class ability cooldown for Hunters) and increases jump height.",
    enhanced: null
  },
  "Aggressive Frame": {
    name: "Aggressive Frame",
    activation: "Passive",
    stackBehavior: "High damage, high recoil baseline.",
    timers: "Always active.",
    statBoosts: "Optimized for high impact and damage per shot. Releasing the trigger after a defeat slightly boosts rate of fire on select variants.",
    enhanced: null
  },
  "Rapid-Fire Frame": {
    name: "Rapid-Fire Frame",
    activation: "Passive / Empty Magazine",
    stackBehavior: "Grants deep ammo reserves. Increases reload speed by +30 and applies a 0.8x Reload Duration multiplier when the magazine is empty.",
    timers: "Reload multiplier active only when reloading from 0 rounds.",
    statBoosts: "Grants +30 Reload Speed when magazine is completely empty.",
    enhanced: null
  },
  "Aggressive Burst": {
    name: "Aggressive Burst",
    activation: "Passive",
    stackBehavior: "Fires a hard-hitting burst of high-damage rounds.",
    timers: "Always active.",
    statBoosts: "Increases burst rate-of-fire. Optimizes recoil weight for vertical groupings.",
    enhanced: null
  },
  "Heavy Burst": {
    name: "Heavy Burst",
    activation: "Passive",
    stackBehavior: "Fires a robust, slow, high-damage burst pattern.",
    timers: "Always active.",
    statBoosts: "Slightly slows burst interval while massively increasing single-bullet stopping power.",
    enhanced: null
  },

  // --- COLUMN 3 & 4 TRAITS ---
  "Rampage": {
    name: "Rampage",
    activation: "Weapon final blows",
    stackBehavior: "Stacks up to 3 times. Stack 1: +10% | Stack 2: +21% | Stack 3: +33% weapon damage.",
    timers: "Duration: 3.5 seconds. Kills refresh duration. Can refresh at max stacks.",
    statBoosts: "No passive stat boosts in standard variant.",
    enhanced: {
      name: "Enhanced Rampage",
      changes: "Increases the active buff duration to 4.0 seconds (up from 3.5s).",
      statBoosts: "Grants passive +5 Stability."
    }
  },
  "Outlaw": {
    name: "Outlaw",
    activation: "Precision final blows",
    stackBehavior: "Greatly increases Reload Speed and applies a 0.9x Reload Duration multiplier.",
    timers: "Duration: 6.0 seconds. Can be refreshed while active.",
    statBoosts: "Grants +50 Reload Speed and increases handling responsiveness.",
    enhanced: {
      name: "Enhanced Outlaw",
      changes: "Increases the active buff duration to 7.0 seconds (up from 6.0s).",
      statBoosts: "Grants passive +5 Reload Speed."
    }
  },
  "Demolitionist": {
    name: "Demolitionist",
    activation: "Weapon final blows / Grenade cast",
    stackBehavior: "Defeating targets generates grenade energy. Throwing a grenade reloads the weapon from reserves.",
    timers: "Grenade energy instant on kill. Weapon reload has a 3.0 second internal cooldown.",
    statBoosts: "Primary weapons generate 10% grenade energy. Special weapons generate 20%.",
    enhanced: {
      name: "Enhanced Demolitionist",
      changes: "Increases grenade energy per kill to 11% (Primary) / 22% (Special).",
      statBoosts: "Grants passive +5 Handling."
    }
  },
  "Frenzy": {
    name: "Frenzy",
    activation: "In combat for 12 seconds",
    stackBehavior: "Grants +15% weapon damage, +100 Handling, and +100 Reload Speed.",
    timers: "Takes 12.0 seconds in combat (dealing or taking damage) to activate. Persists until out of combat for 5.0 seconds.",
    statBoosts: "Grants +100 Handling and +100 Reload Speed while the Frenzy buff is active.",
    enhanced: {
      name: "Enhanced Frenzy",
      changes: "Reduces required combat duration to activate from 12.0 seconds to 10.0 seconds.",
      statBoosts: "Grants passive +5 Handling."
    }
  },
  "Kill Clip": {
    name: "Kill Clip",
    activation: "Reloading after a final blow",
    stackBehavior: "Reloading within 3.5 seconds of a weapon kill grants +25% weapon damage.",
    timers: "Duration: 5.0 seconds. Cannot be refreshed while active (must wait for buff to expire).",
    statBoosts: "No passive stat boosts in standard variant.",
    enhanced: {
      name: "Enhanced Kill Clip",
      changes: "Increases active buff duration to 5.5 seconds (up from 5.0s).",
      statBoosts: "Grants passive +5 Stability."
    }
  },
  "Incandescent": {
    name: "Incandescent",
    activation: "Weapon final blows",
    stackBehavior: "Defeating a target spreads Scorch to nearby targets. Radius: 4.0 meters.",
    timers: "Instant on defeat. Scorch stacks decay over time naturally.",
    statBoosts: "Applies 30 Scorch stacks (40 with Ember of Ashes). Powerful defeats apply 40 Scorch (85 with Ember of Ashes).",
    enhanced: {
      name: "Enhanced Incandescent",
      changes: "Increases base Scorch stacks applied on nearby targets to 40 (50 with Ember of Ashes).",
      statBoosts: "Grants passive +5 Range."
    }
  },
  "Voltshot": {
    name: "Voltshot",
    activation: "Reloading after a final blow",
    stackBehavior: "Reloading within 7.0 seconds of a kill overcharges the weapon. Next hit applies Jolt to the target.",
    timers: "Overcharge duration: 7.0 seconds. Jolt persists until discharged.",
    statBoosts: "Jolt deals high-damage chain lightning to nearby targets when damaged.",
    enhanced: {
      name: "Enhanced Voltshot",
      changes: "Increases the active overcharge duration to 8.5 seconds (up from 7.0s).",
      statBoosts: "Grants passive +5 Reload Speed."
    }
  },
  "Kinetic Tremors": {
    name: "Kinetic Tremors",
    activation: "Sustained kinetic damage",
    stackBehavior: "Dealing sustained damage emits 3 shockwaves that damage nearby targets and deal high stagger.",
    timers: "Requires a specific number of hits to trigger depending on weapon archetype (e.g. Hand Cannon: 5 hits, Pulse: 12 hits). Shockwaves emit over ~2.0 seconds.",
    statBoosts: "Shockwaves deal AoE Kinetic damage and stun champion barriers or shield structures.",
    enhanced: {
      name: "Enhanced Kinetic Tremors",
      changes: "Reduces the number of hits required to activate: Hand Cannon: 4 hits | Pulse: 11 hits | Scout: 5 hits.",
      statBoosts: "Grants passive +5 Stability."
    }
  },
  "Adrenaline Junkie": {
    name: "Adrenaline Junkie",
    activation: "Weapon / Grenade final blows",
    stackBehavior: "Stacks up to 5 times. Weapon kills grant 1 stack. Grenade kills instantly grant 5 stacks. Damage: +6.7% | +13.3% | +20% | +26.7% | +33.3% damage.",
    timers: "Duration: 4.5 seconds. Re-triggering or getting a grenade kill refreshes duration.",
    statBoosts: "Grants up to +20 Handling scaling with stacks (reaches +20 Handling at max 5 stacks).",
    enhanced: {
      name: "Enhanced Adrenaline Junkie",
      changes: "Increases active buff duration to 5.5 seconds (up from 4.5s).",
      statBoosts: "Grants passive +5 Handling."
    }
  },
  "Ambitious Assassin": {
    name: "Ambitious Assassin",
    activation: "Reloading after rapid defeats",
    stackBehavior: "Overflows the magazine based on defeats prior to reload. +20% overflow per kill.",
    timers: "Must reload within 7.0 seconds of defeats. Max overflow caps at +150% (Primary) / +50% (Special/Heavy).",
    statBoosts: "Allows loaded magazine count to far exceed weapon's standard capacity limit.",
    enhanced: {
      name: "Enhanced Ambitious Assassin",
      changes: "Increases time window to reload after defeats to 8.5 seconds (up from 7.0s).",
      statBoosts: "Grants passive +5 Reload Speed."
    }
  },
  "Surrounded": {
    name: "Surrounded",
    activation: "3+ enemies in close proximity",
    stackBehavior: "Grants +40% weapon damage (+47.3% with Surrounded Spec mod).",
    timers: "Requires 3 or more enemies within 8.0 meters. Buff lingers for 1.5 seconds after leaving proximity.",
    statBoosts: "Massive damage bonus, highly optimized for close-range combat and sword engagements.",
    enhanced: {
      name: "Enhanced Surrounded",
      changes: "Increases the active damage bonus to +42% (+49.3% with Surrounded Spec mod).",
      statBoosts: "Grants passive +5 Handling."
    }
  },
  "Destabilizing Rounds": {
    name: "Destabilizing Rounds",
    activation: "Weapon final blows",
    stackBehavior: "Defeating a target applies Volatile to nearby targets in a 6.5 meter radius.",
    timers: "Has a 4.0 second internal cooldown before it can be triggered again.",
    statBoosts: "Volatile targets explode in a Void shockwave when taking sustained damage or on defeat.",
    enhanced: {
      name: "Enhanced Destabilizing Rounds",
      changes: "Reduces internal cooldown from 4.0 seconds to 3.5 seconds.",
      statBoosts: "Grants passive +5 Stability."
    }
  },
  "Target Lock": {
    name: "Target Lock",
    activation: "Sustained damage on a single target",
    stackBehavior: "Damage increases as long as the trigger remains held and hits are landed. Stacks up to 5 times. Max damage: +25% to +40% depending on archetype.",
    timers: "Resets instantly upon missing a shot, reloading, or swapping weapons.",
    statBoosts: "Massively improves single-target boss DPS for automatic weapons (Auto Rifles, SMGs, LMGs).",
    enhanced: {
      name: "Enhanced Target Lock",
      changes: "Grants +10% more buffer space before misses reset the stack multiplier.",
      statBoosts: "Grants passive +5 Stability."
    }
  },
  "Desperate Measures": {
    name: "Desperate Measures",
    activation: "Weapon / Ability final blows",
    stackBehavior: "Stacks up to 3 times. Weapon kills grant 1 stack (+10% damage). Melee/Grenade kills grant 2 stacks (+20% damage). Max: +30% damage.",
    timers: "Duration: 7.0 seconds. Kills refresh duration.",
    statBoosts: "Ideal for ability-heavy ability looping builds.",
    enhanced: {
      name: "Enhanced Desperate Measures",
      changes: "Increases active buff duration to 8.0 seconds (up from 7.0s).",
      statBoosts: "Grants passive +5 Handling."
    }
  },
  "Firefly": {
    name: "Firefly",
    activation: "Precision final blows",
    stackBehavior: "Precision defeats cause a Solar explosion and grant +50 Reload Speed.",
    timers: "Reload speed buff duration: 6.0 seconds. Explosion is instant on defeat.",
    statBoosts: "Grants +50 Reload Speed while the Firefly reload buff is active.",
    enhanced: {
      name: "Enhanced Firefly",
      changes: "Increases active reload speed buff duration to 7.0 seconds (up from 6.0s).",
      statBoosts: "Grants passive +5 Reload Speed."
    }
  },
  "Explosive Payload": {
    name: "Explosive Payload",
    activation: "Passive (Every Shot)",
    stackBehavior: "Splits damage into 50% impact and 50% explosive damage. Explosive portion has zero range falloff.",
    timers: "Always active.",
    statBoosts: "Effectively extends range profile by mitigating 50% of damage falloff. Deals high flinch in PvP.",
    enhanced: {
      name: "Enhanced Explosive Payload",
      changes: "Slightly increases active explosion radius and adds minor stagger modifier.",
      statBoosts: "Grants passive +5 Range."
    }
  },
  "One for All": {
    name: "One for All",
    activation: "Hitting 3 separate targets",
    stackBehavior: "Hitting 3 separate combatants within 3.0 seconds grants +35% weapon damage.",
    timers: "Duration: 10.0 seconds. Cannot be refreshed while active.",
    statBoosts: "Extremely strong passive damage bonus for high-density mob clearing.",
    enhanced: {
      name: "Enhanced One for All",
      changes: "Increases active buff duration to 11.0 seconds (up from 10.0s).",
      statBoosts: "Grants passive +5 Stability."
    }
  },

  // --- WEAPON MODS ---
  "Quick Access Sling": {
    name: "Quick Access Sling",
    activation: "Passive",
    stackBehavior: "Grants 0.9x ready/stow duration multiplier for 1.5 seconds after swapping.",
    timers: "Active upon weapon swap.",
    statBoosts: "Decreases ready/stow frame duration.",
    enhanced: null
  },
  "Counterbalance Stock": {
    name: "Counterbalance Stock",
    activation: "Passive",
    stackBehavior: "Passively grants +15 Recoil Direction.",
    timers: "Always active.",
    statBoosts: "Passively grants +15 Recoil Direction, shifting the bounce direction closer to true vertical (ending in 5).",
    enhanced: null
  },
  "Adept Range": {
    name: "Adept Range",
    activation: "Passive",
    stackBehavior: "Passively grants +10 Range.",
    timers: "Always active.",
    statBoosts: "Passively grants +10 Range.",
    enhanced: null
  },
  "Adept Reload": {
    name: "Adept Reload",
    activation: "Passive",
    stackBehavior: "Passively grants +10 Reload Speed.",
    timers: "Always active.",
    statBoosts: "Passively grants +10 Reload Speed.",
    enhanced: null
  },
  "Adept Counterbalance": {
    name: "Adept Counterbalance",
    activation: "Passive",
    stackBehavior: "Passively grants +35 Recoil Direction and -10 Range.",
    timers: "Always active.",
    statBoosts: "Passively grants +35 Recoil Direction and -10 Range.",
    enhanced: null
  },
  "Adept Big Ones Spec": {
    name: "Adept Big Ones Spec",
    activation: "Passive",
    stackBehavior: "Increases weapon damage against majors, bosses, and champions by 7.77%.",
    timers: "Always active.",
    statBoosts: "Combines Major Spec and Boss Spec into a single mod.",
    enhanced: null
  },
  "Targeting Adjuster": {
    name: "Targeting Adjuster",
    activation: "Passive",
    stackBehavior: "Passively grants +5 Aim Assistance.",
    timers: "Always active.",
    statBoosts: "Passively grants +5 Aim Assistance.",
    enhanced: null
  },
  "Adept Stability": {
    name: "Adept Stability",
    activation: "Passive",
    stackBehavior: "Passively grants +10 Stability.",
    timers: "Always active.",
    statBoosts: "Passively grants +10 Stability.",
    enhanced: null
  },
  "Adept Handling": {
    name: "Adept Handling",
    activation: "Passive",
    stackBehavior: "Passively grants +10 Handling.",
    timers: "Always active.",
    statBoosts: "Passively grants +10 Handling.",
    enhanced: null
  },
  "Anti-Flinch": {
    name: "Anti-Flinch",
    activation: "Passive",
    stackBehavior: "Passively grants 15% Flinch Resistance.",
    timers: "Always active.",
    statBoosts: "Passively grants 15% Flinch Resistance.",
    enhanced: null
  },
  "Synergy": {
    name: "Synergy",
    activation: "Passive",
    stackBehavior: "Matching ability usage grants +10 Stability and +10 Handling.",
    timers: "Always active.",
    statBoosts: "Grants +10 Stability and +10 Handling.",
    enhanced: null
  },
  "Bandolier": {
    name: "Bandolier",
    activation: "Passive",
    stackBehavior: "Grants slightly increased ammo generation and magazine size.",
    timers: "Always active.",
    statBoosts: "Grants slightly increased ammo generation and magazine size.",
    enhanced: null
  },
  "Stunloader": {
    name: "Stunloader",
    activation: "Passive",
    stackBehavior: "Stunning a champion automatically reloads the weapon from reserves.",
    timers: "Always active.",
    statBoosts: "Stunning a champion automatically reloads the weapon from reserves.",
    enhanced: null
  },
  "Aerodynamics": {
    name: "Aerodynamics",
    activation: "Passive",
    stackBehavior: "Passively grants +7 Velocity and +7 Blast Radius.",
    timers: "Always active.",
    statBoosts: "Passively grants +7 Velocity and +7 Blast Radius.",
    enhanced: null
  },
  "Tension": {
    name: "Tension",
    activation: "Passive",
    stackBehavior: "Passively grants +7 Draw Time, +7 Velocity, and +7 Accuracy.",
    timers: "Always active.",
    statBoosts: "Passively grants +7 Draw Time, +7 Velocity, and +7 Accuracy.",
    enhanced: null
  },
  "Tactical": {
    name: "Tactical",
    activation: "Passive",
    stackBehavior: "Passively grants +7 Reload Speed and +7 Handling.",
    timers: "Always active.",
    statBoosts: "Passively grants +7 Reload Speed and +7 Handling.",
    enhanced: null
  },
  "Ballistics": {
    name: "Ballistics",
    activation: "Passive",
    stackBehavior: "Passively grants +7 Range and +7 Stability.",
    timers: "Always active.",
    statBoosts: "Passively grants +7 Range and +7 Stability.",
    enhanced: null
  },
  "CQC Optics: High": {
    name: "CQC Optics: High",
    activation: "Passive",
    stackBehavior: "Passively adjusts Zoom value by +1.",
    timers: "Always active.",
    statBoosts: "Passively adjusts Zoom value by +1.",
    enhanced: null
  },
  "CQC Optics: Low": {
    name: "CQC Optics: Low",
    activation: "Passive",
    stackBehavior: "Passively adjusts Zoom value by -1.",
    timers: "Always active.",
    statBoosts: "Passively adjusts Zoom value by -1.",
    enhanced: null
  },
  "Marksman Optics: High": {
    name: "Marksman Optics: High",
    activation: "Passive",
    stackBehavior: "Passively adjusts Zoom value by +2.",
    timers: "Always active.",
    statBoosts: "Passively adjusts Zoom value by +2.",
    enhanced: null
  },
  "Marksman Optics: Low": {
    name: "Marksman Optics: Low",
    activation: "Passive",
    stackBehavior: "Passively adjusts Zoom value by -2.",
    timers: "Always active.",
    statBoosts: "Passively adjusts Zoom value by -2.",
    enhanced: null
  },
  "Flight": {
    name: "Flight",
    activation: "Passive",
    stackBehavior: "Passively grants +7 Velocity, +7 Handling, and +7 Range.",
    timers: "Always active.",
    statBoosts: "Passively grants +7 Velocity, +7 Handling, and +7 Range.",
    enhanced: null
  },
  "Anti-Flinch Spec": {
    name: "Anti-Flinch Spec",
    activation: "Passive",
    stackBehavior: "Reduces incoming flinch when taking damage from combatants.",
    timers: "Always active.",
    statBoosts: "Reduces incoming flinch when taking damage from combatants.",
    enhanced: null
  },
  "Origin Perk Spec": {
    name: "Origin Perk Spec",
    activation: "Passive",
    stackBehavior: "Slightly improves the benefits provided by this weapon's Origin Traits.",
    timers: "Always active.",
    statBoosts: "Slightly improves the benefits provided by this weapon's Origin Traits.",
    enhanced: null
  },
  "Volatile Flow": {
    name: "Volatile Flow",
    activation: "Passive",
    stackBehavior: "Void weapons gain Volatile Rounds upon picking up an Orb of Power. Active seasonal modifier.",
    timers: "Always active.",
    statBoosts: "Void weapons gain Volatile Rounds upon picking up an Orb of Power. Active seasonal modifier.",
    enhanced: null
  },
  "Jumpshot": {
    name: "Jumpshot",
    activation: "Airborne swap",
    stackBehavior: "Drawing the weapon while airborne provides short-duration movement and swap speed speed buffs.",
    timers: "3 seconds after swap.",
    statBoosts: "Increases movement speed and draw time responsiveness.",
    enhanced: null
  },
  "Shattershafts": {
    name: "Shattershafts",
    activation: "Shot release",
    stackBehavior: "Causes arrows to split into multiple projectiles after traveling a short distance.",
    timers: "Always active.",
    statBoosts: "Splits damage pattern, ideal for short-range crowd control.",
    enhanced: null
  },
  "Tungsten Bowstring": {
    name: "Tungsten Bowstring",
    activation: "Passive",
    stackBehavior: "Increases damage at the cost of draw time and handling.",
    timers: "Always active.",
    statBoosts: "Adds high physical impact and damage, but significantly slows down draw cycle.",
    enhanced: null
  },
  "Abundant Ammo": {
    name: "Abundant Ammo",
    activation: "Passive",
    stackBehavior: "Passively increases ammo reserves capacity.",
    timers: "Always active.",
    statBoosts: "Allows carrying more total reserve ammunition.",
    enhanced: null
  },
  "Calm Amidst Chaos": {
    name: "Calm Amidst Chaos",
    activation: "Sustained fire",
    stackBehavior: "Sustained fire reduces recoil and improves accuracy.",
    timers: "Active during continuous fire.",
    statBoosts: "Improves overall stability and tightens projectile spread over long bursts.",
    enhanced: null
  },
  "Overpressured Munitions": {
    name: "Overpressured Munitions",
    activation: "Passive",
    stackBehavior: "Fires rounds with increased damage and physics impact.",
    timers: "Always active.",
    statBoosts: "Increases flinch dealt to targets and adds high physics impact.",
    enhanced: null
  },
  "Stay in the Fight": {
    name: "Stay in the Fight",
    activation: "Weapon kills",
    stackBehavior: "Defeats with this weapon initiate health regeneration.",
    timers: "Instant on kill.",
    statBoosts: "Instantly starts healing recovery upon securing a final blow.",
    enhanced: null
  },
  "Kill Shot": {
    name: "Kill Shot",
    activation: "Dealing damage",
    stackBehavior: "Dealing damage increases damage output for a short duration.",
    timers: "Active upon damage.",
    statBoosts: "Increases weapon damage by a static percentage upon hit.",
    enhanced: null
  },
  "Opening Salvo": {
    name: "Opening Salvo",
    activation: "Initial shot",
    stackBehavior: "The first shot of an engagement has improved accuracy and range.",
    timers: "Resets after 3 seconds of not firing.",
    statBoosts: "Grants high stability and target acquisition on the opening bullet.",
    enhanced: null
  },
  "Enhanced Accuracy": {
    name: "Enhanced Accuracy",
    activation: "Passive",
    stackBehavior: "Greatly increases accuracy (+10 Accuracy).",
    timers: "Always active.",
    statBoosts: "Provides +10 Accuracy.",
    enhanced: null
  },
  "Enhanced Blast Radius": {
    name: "Enhanced Blast Radius",
    activation: "Passive",
    stackBehavior: "Greatly increases blast radius (+10 Blast Radius).",
    timers: "Always active.",
    statBoosts: "Provides +10 Blast Radius.",
    enhanced: null
  },
  "Enhanced Charge Time": {
    name: "Enhanced Charge Time",
    activation: "Passive",
    stackBehavior: "Greatly decreases charge time (-10 Charge Time).",
    timers: "Always active.",
    statBoosts: "Provides -10 Charge Time.",
    enhanced: null
  },
  "Enhanced Draw Time": {
    name: "Enhanced Draw Time",
    activation: "Passive",
    stackBehavior: "Greatly decreases draw time (-10 Draw Time).",
    timers: "Always active.",
    statBoosts: "Provides -10 Draw Time.",
    enhanced: null
  },
  "Enhanced Handling": {
    name: "Enhanced Handling",
    activation: "Passive",
    stackBehavior: "Greatly increases handling (+10 Handling).",
    timers: "Always active.",
    statBoosts: "Provides +10 Handling.",
    enhanced: null
  },
  "Enhanced Heat Generated": {
    name: "Enhanced Heat Generated",
    activation: "Passive",
    stackBehavior: "Greatly improves heat capacity/ventilation (+10 Heat Generated).",
    timers: "Always active.",
    statBoosts: "Provides +10 Heat Generated.",
    enhanced: null
  },
  "Enhanced Impact": {
    name: "Enhanced Impact",
    activation: "Passive",
    stackBehavior: "Greatly increases impact (+10 Impact).",
    timers: "Always active.",
    statBoosts: "Provides +10 Impact.",
    enhanced: null
  },
  "Enhanced Persistence": {
    name: "Enhanced Persistence",
    activation: "Passive",
    stackBehavior: "Greatly improves persistence and accuracy stability (+10 Persistence).",
    timers: "Always active.",
    statBoosts: "Provides +10 Persistence.",
    enhanced: null
  },
  "Enhanced Projectile Speed": {
    name: "Enhanced Projectile Speed",
    activation: "Passive",
    stackBehavior: "Greatly increases projectile speed (+10 Projectile Speed).",
    timers: "Always active.",
    statBoosts: "Provides +10 Projectile Speed.",
    enhanced: null
  },
  "Enhanced Range": {
    name: "Enhanced Range",
    activation: "Passive",
    stackBehavior: "Greatly increases range (+10 Range).",
    timers: "Always active.",
    statBoosts: "Provides +10 Range.",
    enhanced: null
  },
  "Enhanced Reload": {
    name: "Enhanced Reload",
    activation: "Passive",
    stackBehavior: "Greatly increases reload speed (+10 Reload Speed).",
    timers: "Always active.",
    statBoosts: "Provides +10 Reload Speed.",
    enhanced: null
  },
  "Enhanced Shield Duration": {
    name: "Enhanced Shield Duration",
    activation: "Passive",
    stackBehavior: "Greatly increases shield duration (+10 Shield Duration).",
    timers: "Always active.",
    statBoosts: "Provides +10 Shield Duration.",
    enhanced: null
  },
  "Enhanced Stability": {
    name: "Enhanced Stability",
    activation: "Passive",
    stackBehavior: "Greatly increases stability (+10 Stability).",
    timers: "Always active.",
    statBoosts: "Provides +10 Stability.",
    enhanced: null
  },
  "Enhanced Vent Speed": {
    name: "Enhanced Vent Speed",
    activation: "Passive",
    stackBehavior: "Greatly increases vent speed (+10 Vent Speed).",
    timers: "Always active.",
    statBoosts: "Provides +10 Vent Speed.",
    enhanced: null
  }
};
