import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, Share2, Compass, ShieldAlert, Sword, 
  Zap, Sparkles, Layers, Activity, Info, X, ChevronRight, Copy, Check, InfoIcon,
  Archive, User, LogOut, RefreshCw, Target, Plus
} from 'lucide-react';

// Static Data Imports
import weaponsData from './data/weapons.json';
import perksData from './data/perks.json';
import statsData from './data/stats.json';
import modsData from './data/mods.json';
import { COMMUNITY_INSIGHTS } from './data/communityInsights';

// Bungie API & OAuth configurations
const BUNGIE_API_KEY = import.meta.env.VITE_BUNGIE_API_KEY || 'ed248174f8f34940bf2df8c6ed61cff1';
const BUNGIE_CLIENT_ID = import.meta.env.VITE_BUNGIE_CLIENT_ID || '52277';
const BUNGIE_OAUTH_URL = import.meta.env.VITE_BUNGIE_OAUTH_URL || 'https://www.bungie.net/en/OAuth/Authorize';


// High-fidelity Mock Vault Weapons for premium Sandbox Mode
const MOCK_VAULT_WEAPONS = [
  {
    instanceId: 'mock-coup-1',
    hash: 2763843898,
    name: 'Midnight Coup',
    customRollName: 'Outlaw + Kinetic Tremors',
    source: 'Vault',
    activePerks: {
      0: 1294026524, // Intrinsic Frame
      1: 1482024992, // Smallbore
      2: 3142289711, // Accurized Rounds
      3: 1168162263, // Outlaw
      4: 3891536761, // Kinetic Tremors
      7: 2942552113, // Stability MW
      8: 2489430594  // Indomitability
    }
  },
  {
    instanceId: 'mock-luna-1',
    hash: 276384399,
    name: "Luna's Howl",
    customRollName: 'Slideshot + Magnificent Howl',
    source: 'Equipped',
    activePerks: {
      0: 1322370662, // Precision Frame
      1: 1482024992, // Smallbore
      2: 1885400500, // Ricochet Rounds
      3: 3161816588, // Slideshot
      4: 2720533289, // Magnificent Howl
      5: 2489430594, // Indomitability
      8: 150943607   // Range MW
    }
  },
  {
    instanceId: 'mock-recluse-1',
    hash: 3098328572,
    name: 'The Recluse',
    customRollName: 'Feeding Frenzy + Master of Arms',
    source: 'Vault',
    activePerks: {
      0: 1458010786, // Lightweight Frame
      1: 1392496348, // Polygonal Rifling
      2: 1885400500, // Ricochet Rounds
      3: 2779035018, // Feeding Frenzy
      4: 3081867624, // Master of Arms
      7: 2942552113, // Stability MW
      8: 2489430594  // Indomitability
    }
  },
  {
    instanceId: 'mock-apex-1',
    hash: 2545083870,
    name: 'Apex Predator',
    customRollName: 'Tracking + Cluster Bomb',
    source: 'Carried',
    activePerks: {
      0: 1294026524, // Adaptive Frame
      1: 3525010810, // Quick Launch
      2: 3796465595, // Impact Casing
      3: 3977735242, // Tracking Module
      4: 1275731761, // Cluster Bomb
      7: 3444329767  // Blast Radius MW
    }
  }
];

// Weapon mod descriptions fallbacks (since Bungie manifest stores standard/adept descriptions under different nodes)
const MOD_DESCRIPTIONS = {
  targeting_adjuster: "Increases weapon target acquisition (+5 Aim Assistance).",
  backup_mag: "Increases magazine capacity (+30 Magazine size stat).",
  freehand_grip: "Increases accuracy and ready speed while firing from the hip.",
  icarus_grip: "Improves accuracy and handling while airborne (+15 Airborne Effectiveness).",
  quick_access_sling: "Increases ready and stow speed (+10% Ready/Stow speed multiplier).",
  counterbalance_stock: "Reduces recoil deviation for the weapon (+15 Recoil Direction).",
  sprint_grip: "Temporarily increases ready speed and aim down sights speed after sprinting.",
  radar_tuner: "Radar returns immediately when you stop aiming down sights.",
  radar_booster: "Slightly increases the range at which radar detects enemies.",
  minor_spec: "Deals extra damage against minor combatants (+7.7% damage).",
  major_spec: "Deals extra damage against powerful combatants (+7.7% damage).",
  boss_spec: "Deals extra damage against bosses and vehicles (+7.7% damage).",
  taken_spec: "Deals extra damage against Taken combatants (+10% damage).",
  adept_range: "Greatly increases range (+10 Range).",
  adept_stability: "Greatly increases stability (+10 Stability).",
  adept_handling: "Greatly increases handling (+10 Handling).",
  adept_reload: "Greatly increases reload speed (+10 Reload Speed).",
  adept_counterbalance: "Greatly reduces recoil deviation. Decreases range (+35 Recoil Direction, -10 Range).",
  adept_icarus: "Greatly increases airborne effectiveness. Slightly increases handling (+15 Airborne Effectiveness, +5 Handling).",
  adept_charge_time: "Slightly decreases charge time (-10 Charge Time).",
  adept_draw_time: "Slightly decreases draw time (-10 Draw Time).",
  adept_projectile_speed: "Greatly increases projectile speed (+10 Velocity).",
  adept_blast_radius: "Greatly increases blast radius (+10 Blast Radius).",
  adept_big_ones_spec: "Deals extra damage against powerful combatants, bosses, and vehicles (+7.7% damage).",
  anti_flinch_spec: "Reduces incoming flinch when taking damage from combatants.",
  origin_perk_spec: "Slightly improves the benefits provided by this weapon's Origin Traits.",
  volatile_flow: "Void weapons gain Volatile Rounds upon picking up an Orb of Power. Active seasonal modifier.",
  anti_flinch: "Reduces incoming flinch for this weapon.",
  synergy: "Matching ability usage grants Stability and Handling.",
  bandolier: "Grants slightly increased ammo generation and magazine size.",
  stunloader: "Stunning a champion automatically reloads the weapon from reserves.",
  aerodynamics: "Grants increased blast radius and projectile speed.",
  tension: "Grants increased draw time and accuracy.",
  tactical: "Grants increased reload speed and handling.",
  ballistics: "Grants increased range and stability.",
  cqc_optics__high: "Passively adjusts Zoom value by +1.",
  cqc_optics__low: "Passively adjusts Zoom value by -1.",
  marksman_optics__high: "Passively adjusts Zoom value by +2.",
  marksman_optics__low: "Passively adjusts Zoom value by -2.",
  flight: "Passively grants increased velocity, handling, and range.",
  jumpshot: "Drawing the weapon while airborne provides movement speed and draw time buffs.",
  shattershafts: "Causes arrows to split into multiple projectiles after traveling a short distance.",
  tungsten_bowstring: "Increases damage at the cost of draw time and handling.",
  abundant_ammo: "Passively increases ammo reserves capacity.",
  calm_amidst_chaos: "Sustained fire reduces recoil and improves accuracy.",
  overpressured_munitions: "Fires rounds with increased damage and physics impact.",
  stay_in_the_fight: "Defeats with this weapon initiate health regeneration.",
  kill_shot: "Dealing damage increases damage output for a short duration.",
  opening_salvo: "The first shot of an engagement has improved accuracy and range.",
  enhanced_accuracy: "Greatly increases accuracy (+10 Accuracy).",
  enhanced_blast_radius: "Greatly increases blast radius (+10 Blast Radius).",
  enhanced_charge_time: "Greatly decreases charge time (-10 Charge Time).",
  enhanced_draw_time: "Greatly decreases draw time (-10 Draw Time).",
  enhanced_handling: "Greatly increases handling (+10 Handling).",
  enhanced_heat_generated: "Greatly improves heat capacity or ventilation (+10 Heat Generated).",
  enhanced_impact: "Greatly increases impact (+10 Impact).",
  enhanced_persistence: "Greatly improves persistence and accuracy stability (+10 Persistence).",
  enhanced_projectile_speed: "Greatly increases projectile speed (+10 Projectile Speed).",
  enhanced_range: "Greatly increases range (+10 Range).",
  enhanced_reload: "Greatly increases reload speed (+10 Reload Speed).",
  enhanced_shield_duration: "Greatly increases shield duration (+10 Shield Duration).",
  enhanced_stability: "Greatly increases stability (+10 Stability).",
  enhanced_vent_speed: "Greatly increases vent speed (+10 Vent Speed)."
};

// Archetype-Specific Scaling Coefficients for Physical Formulas
const RANGE_FORMULAS = {
  'Hand Cannon': { baseHip: 14, scaleHip: 0.10, defaultZoom: 14 },
  'Auto Rifle': { baseHip: 15, scaleHip: 0.13, defaultZoom: 16 },
  'Pulse Rifle': { baseHip: 17, scaleHip: 0.16, defaultZoom: 17 },
  'Submachine Gun': { baseHip: 10, scaleHip: 0.08, defaultZoom: 14 },
  'Sidearm': { baseHip: 8, scaleHip: 0.05, defaultZoom: 12 },
  'Scout Rifle': { baseHip: 35, scaleHip: 0.25, defaultZoom: 20 },
  'Sniper Rifle': { baseHip: 40, scaleHip: 0.50, defaultZoom: 40 },
  'Shotgun': { baseHip: 5, scaleHip: 0.02, defaultZoom: 12 },
  'Fusion Rifle': { baseHip: 12, scaleHip: 0.06, defaultZoom: 15 }
};

const RELOAD_FORMULAS = {
  'Hand Cannon': { baseMax: 3.2, diff: 1.5 },
  'Auto Rifle': { baseMax: 2.6, diff: 1.1 },
  'Pulse Rifle': { baseMax: 2.8, diff: 1.2 },
  'Submachine Gun': { baseMax: 2.4, diff: 1.0 },
  'Sidearm': { baseMax: 1.9, diff: 0.9 },
  'Scout Rifle': { baseMax: 3.4, diff: 1.6 },
  'Sniper Rifle': { baseMax: 3.8, diff: 1.8 },
  'Shotgun': { baseMax: 3.5, diff: 1.7 },
  'Fusion Rifle': { baseMax: 2.9, diff: 1.3 }
};

const DAMAGE_TYPES = {
  1: 'Kinetic',
  2: 'Arc',
  3: 'Solar',
  4: 'Void',
  6: 'Stasis',
  7: 'Strand'
};

// Target allowed masterwork stat name options per weapon archetype
const ALLOWED_MASTERWORKS = {
  'Hand Cannon': ['Range', 'Stability', 'Handling', 'Reload Speed'],
  'Auto Rifle': ['Range', 'Stability', 'Handling', 'Reload Speed'],
  'Pulse Rifle': ['Range', 'Stability', 'Handling', 'Reload Speed'],
  'Submachine Gun': ['Range', 'Stability', 'Handling', 'Reload Speed'],
  'Sidearm': ['Range', 'Stability', 'Handling', 'Reload Speed'],
  'Scout Rifle': ['Range', 'Stability', 'Handling', 'Reload Speed'],
  'Sniper Rifle': ['Range', 'Stability', 'Handling', 'Reload Speed'],
  'Shotgun': ['Range', 'Stability', 'Handling', 'Reload Speed'],
  'Machine Gun': ['Range', 'Stability', 'Handling', 'Reload Speed'],
  'Rocket Launcher': ['Blast Radius', 'Velocity', 'Handling', 'Reload Speed'],
  'Grenade Launcher': ['Blast Radius', 'Velocity', 'Handling', 'Reload Speed'],
  'Fusion Rifle': ['Charge Time', 'Range', 'Stability', 'Handling', 'Reload Speed'],
  'Linear Fusion Rifle': ['Charge Time', 'Range', 'Stability', 'Handling', 'Reload Speed'],
  'Bow': ['Draw Time', 'Accuracy', 'Stability', 'Handling', 'Reload Speed'],
  'Combat Bow': ['Draw Time', 'Accuracy', 'Stability', 'Handling', 'Reload Speed'],
  'Sword': ['Impact', 'Guard Resistance', 'Guard Efficiency', 'Swing Speed'],
  'Glaive': ['Shield Duration', 'Range', 'Handling', 'Reload Speed'],
  'Trace Rifle': ['Range', 'Stability', 'Handling', 'Reload Speed']
};

// Target Core Display Stats list
const STAT_METADATA = {
  4043523819: { name: 'Impact', icon: 'Sword' },
  1240592695: { name: 'Range', icon: 'Layers' },
  155624089: { name: 'Stability', icon: 'Activity' },
  943549884: { name: 'Handling', icon: 'Zap' },
  4188031367: { name: 'Reload Speed', icon: 'Zap' },
  1345609583: { name: 'Aim Assistance', icon: 'Compass' },
  3555269338: { name: 'Zoom', icon: 'SlidersHorizontal' },
  2714457168: { name: 'Airborne Effectiveness', icon: 'Sparkles' },
  2715839340: { name: 'Recoil Direction', icon: 'Compass' },
  3871231066: { name: 'Magazine', icon: 'Layers' },
  4284893193: { name: 'RPM', icon: 'Activity' }
};

const getWeaponVersionLabel = (weapon) => {
  if (!weapon) return '';
  if (weapon.name === 'Midnight Coup') {
    if (weapon.hash === 1128225405) return 'Legacy Y1';
    if (weapon.hash === 2499720827) return 'BRAVE Shiny';
    if (weapon.hash === 2763843898) return 'BRAVE';
  }
  if (weapon.name === "Luna's Howl") {
    if (weapon.hash === 153979396) return 'Legacy Y2';
    if (weapon.hash === 3757612024) return 'BRAVE Shiny';
    if (weapon.hash === 2763843899 || weapon.hash === 276384399) return 'BRAVE';
  }
  if (weapon.name === 'The Recluse') {
    if (weapon.hash === 3354242550) return 'Legacy Y2';
    if (weapon.hash === 1050806815) return 'BRAVE Shiny';
    if (weapon.hash === 3098328572) return 'BRAVE';
  }
  if (weapon.name.includes('(Adept)')) return 'Adept';
  if (weapon.name.includes('(Timelost)')) return 'Timelost';
  if (weapon.name.includes('(Baroque)')) return 'Baroque';
  
  const hasOriginTrait = weapon.sockets?.some(s => s.cat === 'origin_trait');
  const socketsCount = weapon.sockets?.length || 0;
  if (!hasOriginTrait && socketsCount <= 7) return 'Legacy';
  return '';
};

const isModCompatibleWithWeapon = (mod, weapon) => {
  if (!weapon || !mod) return false;
  
  const weaponType = (weapon.weaponType || '').toLowerCase();
  const name = (mod.name || '').toLowerCase();
  const id = (mod.id || '').toLowerCase();
  
  if (name.includes('blast radius')) {
    return weaponType.includes('grenade launcher') || weaponType.includes('rocket launcher');
  }
  
  if (name.includes('draw time') || name.includes('accuracy') || id.includes('tension') || id.includes('shattershafts') || id.includes('bowstring')) {
    return weaponType.includes('bow');
  }
  
  if (name.includes('charge time')) {
    return weaponType.includes('fusion rifle') || weaponType.includes('linear fusion');
  }
  
  if (name.includes('impact') || id.includes('abundant_ammo')) {
    return weaponType.includes('sword');
  }
  
  if (name.includes('shield duration')) {
    return weaponType.includes('glaive');
  }
  
  if (name.includes('heat generated') || name.includes('vent speed')) {
    return weaponType.includes('trace rifle');
  }
  
  if (id.includes('aerodynamics')) {
    return weaponType.includes('grenade launcher') || weaponType.includes('rocket launcher');
  }

  if (id.includes('flight')) {
    return weaponType.includes('grenade launcher') || weaponType.includes('rocket launcher') || weaponType.includes('glaive') || weaponType.includes('bow');
  }
  
  if (mod.investmentStats && mod.investmentStats.length > 0) {
    const hasUnsupportStat = mod.investmentStats.some(stat => {
      const hash = stat.statHash;
      const restrictedStats = [
        3614673599, // Blast Radius
        2961396640, // Draw Time
        447667954,  // Draw/Charge Time
        1931675084, // Sword Ammo / Magazine
        1842278586, // Shield Duration
        4043523819, // Impact
      ];
      if (restrictedStats.includes(hash) && (!weapon.baseStats || !weapon.baseStats[hash])) {
        return true;
      }
      return false;
    });
    if (hasUnsupportStat) return false;
  }
  
  return true;
};

const getSocketLabels = (weapon) => {
  const defaults = {
    barrel: 'Barrels',
    magazine: 'Magazines'
  };
  if (!weapon) return defaults;
  
  const type = weapon.weaponType || '';
  const frame = weapon.frame || '';
  const name = weapon.name || '';
  
  // Bows
  if (type.includes('Bow') || type.includes('bow')) {
    return {
      barrel: 'Bowstrings',
      magazine: 'Arrows'
    };
  }
  // Swords
  if (type.includes('Sword') || type.includes('sword')) {
    return {
      barrel: 'Blades',
      magazine: 'Guards'
    };
  }
  // Fusion / Linear Fusion / Trace / Energy Cell weapons
  if (
    type.includes('Fusion') || 
    type.includes('Trace') || 
    frame.toLowerCase().includes('dynamic heat') ||
    frame.toLowerCase().includes('battery') ||
    frame.toLowerCase().includes('energy cell') ||
    frame.toLowerCase().includes('fusion') ||
    name.toLowerCase().includes('prometheus')
  ) {
    return {
      barrel: 'Barrels',
      magazine: 'Batteries'
    };
  }
  // Rocket / Grenade Launchers
  if (type.includes('Rocket') || type.includes('Grenade')) {
    return {
      barrel: 'Launch Tubes',
      magazine: 'Magazines'
    };
  }
  
  return defaults;
};

export default function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hash } = useParams();

  const selectedModId = useMemo(() => {
    return searchParams.get('mod') || null;
  }, [searchParams]);

  // Search, catalog, and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAmmo, setActiveAmmo] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [activeElement, setActiveElement] = useState(null);
  const [activeWeaponType, setActiveWeaponType] = useState('All');
  const [activeRarity, setActiveRarity] = useState('All');
  const [activeFrame, setActiveFrame] = useState('All');
  const [activeMobileTab, setActiveMobileTab] = useState('finder'); // finder, stats, perks
  const [hoveredPerk, setHoveredPerk] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  // Weapon mod modal selection states
  const [isModModalOpen, setIsModModalOpen] = useState(false);
  const [tempSelectedModId, setTempSelectedModId] = useState(null);
  const [modSearchQuery, setModSearchQuery] = useState('');

  useEffect(() => {
    if (!hoveredPerk) return;
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredPerk]);

  // Vault & OAuth Integration States
  const [sidebarTab, setSidebarTab] = useState('database'); // database or vault
  const [vaultSource, setVaultSource] = useState(null); // sandbox or live
  const [playerProfile, setPlayerProfile] = useState(null);
  const [vaultWeapons, setVaultWeapons] = useState([]);
  const [isFetchingVault, setIsFetchingVault] = useState(false);
  const [authStatus, setAuthStatus] = useState('idle'); // idle, authenticating, authenticated, error
  const [vaultSearchTerm, setVaultSearchTerm] = useState('');

  // 1. Process and filter connected Vault inventory
  const filteredVaultWeapons = useMemo(() => {
    return vaultWeapons.filter(w => 
      w.name.toLowerCase().includes(vaultSearchTerm.toLowerCase()) || 
      w.customRollName.toLowerCase().includes(vaultSearchTerm.toLowerCase())
    );
  }, [vaultWeapons, vaultSearchTerm]);

  // 2. Client-Side Destiny live vault details fetcher
  const fetchLiveVault = async (accessToken, profile) => {
    setIsFetchingVault(true);
    try {
      const response = await fetch(
        `https://www.bungie.net/Platform/Destiny2/${profile.membershipType}/Profile/${profile.membershipId}/?components=102,201,205,305`,
        {
          headers: {
            'X-API-Key': BUNGIE_API_KEY,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load profile data: ${response.statusText}`);
      }

      const rawData = await response.json();
      const profileData = rawData.Response;
      if (!profileData) {
        throw new Error('Empty response from Destiny API.');
      }

      const parsedWeapons = [];
      const socketComponents = profileData.itemComponents?.sockets?.data || {};

      // Helper to process a list of items
      const processItems = (itemsList, sourceLabel) => {
        if (!itemsList) return;
        itemsList.forEach(item => {
          const localWeapon = weaponsData.find(w => w.hash === item.itemHash);
          if (localWeapon) {
            const instanceId = item.itemInstanceId;
            const activePerks = {};
            
            // Resolve active socket plugs
            if (instanceId && socketComponents[instanceId]) {
              const sockets = socketComponents[instanceId].sockets || [];
              sockets.forEach((sSocket, sIdx) => {
                if (sSocket.plugHash) {
                  activePerks[sIdx] = sSocket.plugHash;
                }
              });
            } else {
              // Default perks if instanced data is not loaded
              localWeapon.sockets.forEach(socket => {
                activePerks[socket.index] = socket.plugs[0];
              });
            }

            // Custom name e.g., "Outlaw + Rampage"
            // Let's check which socket indices are the active traits
            // Most legendary weapons have Perk 1 at index 3 and Perk 2 at index 4
            const perk1Hash = activePerks[3];
            const perk2Hash = activePerks[4];
            const perk1Name = perksData[perk1Hash]?.name;
            const perk2Name = perksData[perk2Hash]?.name;
            let customRollName = "Custom Roll";
            if (perk1Name && perk2Name) {
              customRollName = `${perk1Name} + ${perk2Name}`;
            } else if (perk1Name) {
              customRollName = perk1Name;
            }

            parsedWeapons.push({
              instanceId: instanceId || item.itemHash.toString() + '_' + Math.random().toString(36).substr(2, 9),
              hash: item.itemHash,
              name: localWeapon.name,
              icon: localWeapon.icon,
              weaponType: localWeapon.weaponType,
              damageType: localWeapon.damageType,
              slot: localWeapon.slot,
              tier: localWeapon.tier,
              customRollName,
              source: sourceLabel,
              activePerks
            });
          }
        });
      };

      // Process Vault Items (Component 102)
      processItems(profileData.profileInventory?.data?.items, 'Vault');

      // Process Character carried items (Component 201)
      const charInventories = profileData.characterInventories?.data || {};
      Object.values(charInventories).forEach(inv => {
        processItems(inv.items, 'Carried');
      });

      // Process Character equipped items (Component 205)
      const charEquipment = profileData.characterEquipment?.data || {};
      Object.values(charEquipment).forEach(eq => {
        processItems(eq.items, 'Equipped');
      });

      setVaultWeapons(parsedWeapons);
    } catch (err) {
      console.error("Error fetching live vault details", err);
    } finally {
      setIsFetchingVault(false);
    }
  };

  // 3. OAuth Callback handler exchanging auth code for Access Token
  const handleOAuthTokenExchange = async (code) => {
    setAuthStatus('authenticating');
    setIsFetchingVault(true);
    try {
      const codeParam = code;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const redirectUri = isLocalhost 
        ? (window.location.origin + import.meta.env.BASE_URL) 
        : 'https://vercel.app';

      const body = new URLSearchParams();
      body.append('grant_type', 'authorization_code');
      body.append('client_id', '52277');
      body.append('code', codeParam);
      body.append('redirect_uri', redirectUri);

      console.log("OAuth token exchange keys transmitted:", Array.from(body.keys()));

      const response = await fetch('https://www.bungie.net/Platform/App/OAuth/Token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-API-Key': BUNGIE_API_KEY
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      // Save tokens
      localStorage.setItem('d2_builder_auth', JSON.stringify(tokenData));
      
      // Fetch User Membership details (Strict Search for PrazVT#7351)
      let profileInfo = null;
      try {
        const searchResponse = await fetch('https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/-1/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': BUNGIE_API_KEY
          },
          body: JSON.stringify({
            displayName: 'PrazVT',
            displayNameCode: 7351
          })
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          const searchResults = searchData.Response || [];
          if (searchResults.length > 0) {
            const matchedPlayer = searchResults[0];
            profileInfo = {
              displayName: matchedPlayer.bungieGlobalDisplayName || matchedPlayer.displayName,
              displayNameCode: matchedPlayer.bungieGlobalDisplayNameCode || '7351',
              membershipType: matchedPlayer.membershipType,
              membershipId: matchedPlayer.membershipId
            };
          }
        }
      } catch (searchErr) {
        console.error("Error searching for PrazVT#7351, trying fallback memberships fetch", searchErr);
      }

      // Fallback: Query all linked memberships for logged in user if specific search fails
      if (!profileInfo) {
        const userResponse = await fetch('https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/', {
          headers: {
            'X-API-Key': BUNGIE_API_KEY,
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user memberships: ${userResponse.statusText}`);
        }

        const userData = await userResponse.json();
        const destinyMemberships = userData.Response?.destinyMemberships;
        if (!destinyMemberships || destinyMemberships.length === 0) {
          throw new Error('No Destiny 2 accounts found on your Bungie profile.');
        }

        const primaryMembership = destinyMemberships[0];
        profileInfo = {
          displayName: primaryMembership.bungieGlobalDisplayName || primaryMembership.displayName,
          displayNameCode: primaryMembership.bungieGlobalDisplayNameCode || '',
          membershipType: primaryMembership.membershipType,
          membershipId: primaryMembership.membershipId
        };
      }

      localStorage.setItem('d2_builder_profile', JSON.stringify(profileInfo));
      setPlayerProfile(profileInfo);
      setVaultSource('live');
      setAuthStatus('authenticated');
      
      // Fetch active weapons list from vault
      await fetchLiveVault(tokenData.access_token, profileInfo);
      
      // Clear URL parameter code cleanly
      if (window.history.replaceState) {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      }
      navigate('/', { replace: true });
    } catch (err) {
      console.error("Authentication failed", err);
      setAuthStatus('error');
      setIsFetchingVault(false);
    }
  };

  // 4. Sandbox connection trigger loading simulation vault
  const handleConnectMockVault = () => {
    setIsFetchingVault(true);
    setAuthStatus('authenticated');
    setVaultSource('sandbox');
    setPlayerProfile({
      displayName: 'Cayde-6',
      displayNameCode: '1777',
      membershipType: 3,
      membershipId: 'mock-cayde'
    });
    
    // Simulate slight API fetch loading delay for premium feel
    setTimeout(() => {
      setVaultWeapons(MOCK_VAULT_WEAPONS);
      setIsFetchingVault(false);
    }, 800);
  };

  // 5. Connect live vault trigger redirecting to Bungie Portal
  const handleConnectLiveVault = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUri = isLocalhost 
      ? (window.location.origin + import.meta.env.BASE_URL) 
      : 'https://vercel.app';
    const authUrl = `${BUNGIE_OAUTH_URL}?client_id=${BUNGIE_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  };

  // 6. Logout and session clear helper
  const handleDisconnectVault = () => {
    localStorage.removeItem('d2_builder_auth');
    localStorage.removeItem('d2_builder_profile');
    setPlayerProfile(null);
    setVaultWeapons([]);
    setVaultSource(null);
    setAuthStatus('idle');
  };

  // 7. Load personal weapon roll into active builder panel
  const handleSelectVaultWeapon = (vaultWep) => {
    const localWep = weaponsData.find(w => w.hash === vaultWep.hash);
    if (localWep) {
      const perkHashes = localWep.sockets
        .map(socket => vaultWep.activePerks[socket.index] || socket.plugs[0])
        .filter(Boolean);
      navigate(`/weapon/${vaultWep.hash}?perks=${perkHashes.join(',')}`);
      setActiveMobileTab('stats');
    }
  };

  // Handle URL callback codes and storage verification on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleOAuthTokenExchange(code);
    } else {
      const savedAuth = localStorage.getItem('d2_builder_auth');
      const savedProfile = localStorage.getItem('d2_builder_profile');
      if (savedAuth && savedProfile) {
        try {
          const auth = JSON.parse(savedAuth);
          const profile = JSON.parse(savedProfile);
          setPlayerProfile(profile);
          setVaultSource('live');
          setAuthStatus('authenticated');
          fetchLiveVault(auth.access_token, profile);
        } catch (e) {
          console.error("Failed to parse saved auth details", e);
          localStorage.removeItem('d2_builder_auth');
          localStorage.removeItem('d2_builder_profile');
        }
      }
    }
  }, [searchParams]);

  // Default popular featured weapon when none selected: Midnight Coup (36289970) or Luna's Howl, etc.
  const activeWeapon = useMemo(() => {
    if (hash) {
      return weaponsData.find(w => w.hash === parseInt(hash)) || weaponsData[0];
    }
    // Default to the first Legendary Kinetic Hand Cannon or first item
    return weaponsData.find(w => w.name === 'Midnight Coup') || weaponsData[0];
  }, [hash]);

  // Reset active weapon frame when class changes
  useEffect(() => {
    setActiveFrame('All');
  }, [activeWeaponType]);

  // Compute dynamic weapon frames subset
  const availableFrames = useMemo(() => {
    if (!activeWeaponType || activeWeaponType === 'All') return [];
    const frames = new Set(
      weaponsData
        .filter(w => w.weaponType === activeWeaponType)
        .map(w => w.frame)
        .filter(Boolean)
        .filter(frameName => {
          const lower = frameName.toLowerCase();
          // Only list legitimate Destiny 2 frame archetypes relative to active class
          return lower.includes('frame') || 
                 lower.includes('burst') || 
                 lower.includes('glaive') || 
                 lower === 'shot package' || 
                 lower === 'double fire';
        })
    );
    return ['All', ...Array.from(frames).sort()];
  }, [activeWeaponType]);

  // Extract all weapon types present in our static weapons database for filter list
  const allWeaponTypes = useMemo(() => {
    const types = new Set(weaponsData.map(w => w.weaponType));
    return ['All', ...Array.from(types).sort()];
  }, []);

  // Filter Catalog logic
  const filteredWeapons = useMemo(() => {
    return weaponsData.filter(w => {
      const matchSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.frame.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAmmo = !activeAmmo || w.ammoType === activeAmmo;
      const matchSlot = !activeSlot || w.slot === activeSlot;
      const matchElement = !activeElement || w.damageType === activeElement;
      const matchType = activeWeaponType === 'All' || w.weaponType === activeWeaponType;
      const matchRarity = activeRarity === 'All' || w.tier === activeRarity;
      const matchFrame = activeFrame === 'All' || w.frame === activeFrame;
      
      return matchSearch && matchAmmo && matchSlot && matchElement && matchType && matchRarity && matchFrame;
    });
  }, [searchTerm, activeAmmo, activeSlot, activeElement, activeWeaponType, activeRarity, activeFrame]);

  // Hook up selected perks mapping state
  const activePerks = useMemo(() => {
    const perkString = searchParams.get('perks');
    const selections = {};

    if (!activeWeapon) return selections;

    // Sockets classification
    activeWeapon.sockets.forEach(socket => {
      let defaultPlug = socket.plugs[0];
      if (socket.cat === 'masterwork') {
        const seenNames = new Set();
        const filtered = socket.plugs.filter(pHash => {
          const perk = perksData[pHash];
          if (!perk) return false;
          const name = perk.name || '';
          const isOldStyle = /^(Masterwork Upgrade|Rework Weapon|Vanguard Masterwork|Crucible Masterwork)$/i.test(name);
          const isLegacyWeapon = activeWeapon.sockets.length <= 6 || !activeWeapon.sockets.some(s => s.cat === 'origin_trait');
          if (isOldStyle) return isLegacyWeapon;
          const match = name.match(/^(?:Masterwork|Masterworked|Tier 10): (Range|Stability|Handling|Reload Speed|Blast Radius|Velocity|Charge Time|Draw Time|Impact|Accuracy)$/i);
          if (!match) return false;
          const statName = match[1];
          const allowedStats = ALLOWED_MASTERWORKS[activeWeapon.weaponType] || ['Range', 'Stability', 'Handling', 'Reload Speed'];
          const isAllowed = allowedStats.includes(statName);
          if (!isAllowed) return false;
          if (perk.investmentStats && perk.investmentStats.length > 0) {
            let primaryStatHash = null;
            let highestValue = -999;
            perk.investmentStats.forEach(stat => {
              if (stat.value > highestValue) {
                highestValue = stat.value;
                primaryStatHash = stat.statHash;
              }
            });
            if (primaryStatHash) {
              const hasStat = activeWeapon.baseStats[primaryStatHash] !== undefined;
              if (!hasStat) return false;
              if (seenNames.has(name)) return false;
              seenNames.add(name);
              return true;
            }
          }
          return true;
        });
        if (filtered.length > 0) {
          defaultPlug = filtered[0];
        }
      }
      selections[socket.index] = defaultPlug; // initialize default
    });

    if (perkString) {
      const parsedHashes = perkString.split(',').map(h => parseInt(h)).filter(Boolean);
      activeWeapon.sockets.forEach(socket => {
        // Find if any parsed hash is available in this socket plugs list
        const matchingHash = parsedHashes.find(h => socket.plugs.includes(h));
        if (matchingHash) {
          selections[socket.index] = matchingHash;
        }
      });
    }

    return selections;
  }, [activeWeapon, searchParams]);

  // Toggle dynamic perk handler
  const handleTogglePerk = (socketIndex, plugHash) => {
    const updatedPerks = { ...activePerks, [socketIndex]: plugHash };
    
    // Compile search parameters to push to URL silently
    const hashes = activeWeapon.sockets
      .map(socket => updatedPerks[socket.index])
      .filter(Boolean);
      
    const newParams = new URLSearchParams();
    newParams.set('perks', hashes.join(','));
    const currentMod = searchParams.get('mod');
    if (currentMod) {
      newParams.set('mod', currentMod);
    }
    
    navigate(`/weapon/${activeWeapon.hash}?${newParams.toString()}`, { replace: true });
  };

  // Toggle dynamic weapon mod handler
  const handleToggleMod = (modId) => {
    const newParams = new URLSearchParams(searchParams);
    const currentMod = newParams.get('mod');
    if (currentMod === modId) {
      newParams.delete('mod');
    } else {
      newParams.set('mod', modId);
    }
    navigate(`/weapon/${activeWeapon.hash}?${newParams.toString()}`, { replace: true });
  };

  // Helper to determine if a socket slot can support enhanced perks
  const isSocketEligibleForEnhancement = (socket, weapon) => {
    if (!weapon || !socket) return false;
    if (socket.cat === 'origin_trait') return true;
    const nonMwOtSockets = weapon.sockets.filter(s2 => s2.cat !== 'masterwork' && s2.cat !== 'origin_trait');
    const relativeIndex = nonMwOtSockets.findIndex(s2 => s2.index === socket.index);
    return relativeIndex === 3 || relativeIndex === 4;
  };

  // Sum active perks investments and resolve dynamic clamped stats
  const calculatedStats = useMemo(() => {
    if (!activeWeapon) return {};

    const stats = {};
    const versionLabel = getWeaponVersionLabel(activeWeapon);
    const isModsEligible = activeWeapon.tier !== 'Exotic' && versionLabel !== 'Legacy Y1';
    
    // 1. Initialize base stats
    Object.entries(activeWeapon.baseStats).forEach(([sHashStr, [baseVal, minVal, maxVal]]) => {
      const sHash = parseInt(sHashStr);
      stats[sHash] = {
        base: baseVal,
        min: minVal,
        max: maxVal,
        offset: 0,
        final: baseVal
      };
    });

    // 2. Add investment stats from active perks toggled
    Object.entries(activePerks).forEach(([socketIndex, perkHash]) => {
      // Don't include frame intrinsics in deltas (they are part of weapon base stats)
      const socket = activeWeapon.sockets.find(s => s.index === parseInt(socketIndex));
      if (socket && socket.cat === 'intrinsic' && socket.index === 0) return;

      const perk = perksData[perkHash];
      if (perk && perk.investmentStats) {
        perk.investmentStats.forEach(stat => {
          if (stats[stat.statHash]) {
            stats[stat.statHash].offset += stat.value;
          }
        });
      }

      // Add +5 passive stat boost if isEnhanced is active, the perk has an enhanced block,
      // and the socket is eligible for enhancement.
      if (isEnhanced && perk && isSocketEligibleForEnhancement(socket, activeWeapon)) {
        const insight = COMMUNITY_INSIGHTS[perk.name];
        if (insight && insight.enhanced && insight.enhanced.statBoosts) {
          const boostText = insight.enhanced.statBoosts;
          let boostStatHash = null;
          if (boostText.includes('Range')) boostStatHash = 1240592695;
          else if (boostText.includes('Stability')) boostStatHash = 155624089;
          else if (boostText.includes('Handling')) boostStatHash = 943549884;
          else if (boostText.includes('Reload')) boostStatHash = 4188031367;

          if (boostStatHash && stats[boostStatHash]) {
            stats[boostStatHash].offset += 5;
          }
        }
      }
    });

    // 2.3 Add +2 Enhanced Intrinsic Frame bonus to secondary stats if enhanced is active
    if (isEnhanced && activeWeapon.tier !== 'Exotic' && versionLabel !== 'Legacy Y1') {
      const secondaryStats = [1240592695, 155624089, 943549884, 4188031367];
      secondaryStats.forEach(statHash => {
        if (stats[statHash]) {
          stats[statHash].offset += 2;
        }
      });
    }

    // 2.5 Add investment stats from active selected weapon mod
    if (selectedModId && isModsEligible) {
      const activeMod = modsData.find(m => m.id === selectedModId);
      if (activeMod && activeMod.investmentStats) {
        activeMod.investmentStats.forEach(stat => {
          if (stats[stat.statHash]) {
            stats[stat.statHash].offset += stat.value;
          }
        });
      }
    }

    // 3. Apply clamping logic: final = clamp(base + offset, min, max)
    Object.keys(stats).forEach(sHash => {
      const stat = stats[sHash];
      const rawVal = stat.base + stat.offset;
      if (stat.max > 0) {
        stat.final = Math.max(stat.min, Math.min(stat.max, rawVal));
      } else {
        stat.final = Math.max(0, rawVal);
        // Set stat.max to a reasonable display maximum for UI
        stat.max = Math.max(100, stat.base);
      }
    });

    return stats;
  }, [activeWeapon, activePerks, isEnhanced, selectedModId]);

  // Recoil Direction Gauge Math
  const recoilStats = useMemo(() => {
    const rawRecoil = calculatedStats[2715839340]?.final || 50;
    // Clamp standard Destiny 2 Recoil Direction stat to maximum of 100
    const recoilVal = Math.min(100, Math.max(0, rawRecoil));
    
    // Lean Angle calculation: values ending in 5 are vertical; 0 leans hard
    // A recoil value of exactly 100 is perfectly vertical (0 degrees deflection)
    let angle = 0;
    if (recoilVal < 100) {
      const dev = recoilVal % 10;
      const baseLean = (dev - 5) * 9; // deflection range: -45 to +36 degrees
      
      // Toggle direction lean depending on tens value
      const tens = Math.floor(recoilVal / 10);
      const leanDirection = tens % 2 === 0 ? 1 : -1;
      angle = leanDirection * baseLean;
    }

    // Horizontal bounce error (higher stat = tighter cone)
    // Non-linear scaling ensures lower stats (especially under 70/80) show a much wider visual cone,
    // and only gets tight and narrow as the stat approaches 95-100.
    const x = 100 - recoilVal;
    const errorWidth = Math.max(6, 6 + Math.pow(x, 1.1) * 1.1);

    let classification = 'Unstable Leaning';
    if (recoilVal === 100) {
      classification = 'Perfectly Vertical';
    } else if (recoilVal >= 95) {
      classification = 'Highly Vertical';
    } else if (Math.abs(angle) < 6) {
      classification = 'Highly Vertical';
    } else if (angle < 0) {
      classification = 'Leans Left';
    } else {
      classification = 'Leans Right';
    }

    return {
      value: recoilVal,
      angle,
      errorWidth,
      classification
    };
  }, [calculatedStats]);

  // Range Falloff Calculations (Meters)
  const rangeMetrics = useMemo(() => {
    if (!activeWeapon) return { hipStart: 0, hipEnd: 0, adsStart: 0, adsEnd: 0 };

    const rangeVal = calculatedStats[1240592695]?.final || 50;
    const zoomVal = calculatedStats[3555269338]?.final || 14;
    const type = activeWeapon.weaponType;

    // Get specific scaling constants or fall back to generic
    const formula = RANGE_FORMULAS[type] || { baseHip: 15, scaleHip: 0.1, defaultZoom: 15 };
    
    // Start drop off meters
    const hipStart = formula.baseHip + (rangeVal * formula.scaleHip);
    const adsStart = hipStart * (zoomVal / formula.defaultZoom);

    // End drop off meters (typical complete damage loss occurs at +10m on hip, +15m on ADS)
    const hipEnd = hipStart + 8;
    const adsEnd = adsStart + 12;

    return {
      hipStart: hipStart.toFixed(1),
      hipEnd: hipEnd.toFixed(1),
      adsStart: adsStart.toFixed(1),
      adsEnd: adsEnd.toFixed(1)
    };
  }, [activeWeapon, calculatedStats]);

  // Absolute Reload Speed timing (Seconds)
  const reloadDuration = useMemo(() => {
    if (!activeWeapon) return '0.0';
    const reloadVal = calculatedStats[4188031367]?.final || 50;
    const type = activeWeapon.weaponType;

    const formula = RELOAD_FORMULAS[type] || { baseMax: 2.8, diff: 1.2 };
    const seconds = formula.baseMax - (reloadVal / 100) * formula.diff;
    return seconds.toFixed(2);
  }, [activeWeapon, calculatedStats]);

  // Absolute Stow & Ready timings (Frames / Milliseconds)
  const handlingTimings = useMemo(() => {
    const handlingVal = calculatedStats[943549884]?.final || 50;

    // Stow is typically slightly slower than ready
    const readyMs = 380 - (handlingVal * 2.3);
    const stowMs = 430 - (handlingVal * 2.4);

    return {
      ready: Math.round(readyMs),
      stow: Math.round(stowMs)
    };
  }, [calculatedStats]);

  // Copy build Roll sharing link
  const handleCopyRollLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareSuccess(true);
    setTimeout(() => setShowShareSuccess(false), 2000);
  };

  // Color schemes for glowing element styling
  const elementStyles = useMemo(() => {
    const element = activeWeapon?.damageType || 'Kinetic';
    
    const colors = {
      Solar: {
        text: 'text-solar',
        border: 'border-solar',
        bg: 'bg-solar',
        accentGlow: 'glow-solar',
        barClass: 'bg-solar/80 shadow-[0_0_12px_rgba(245,96,37,0.4)]'
      },
      Arc: {
        text: 'text-arc',
        border: 'border-arc',
        bg: 'bg-arc',
        accentGlow: 'glow-arc',
        barClass: 'bg-arc/80 shadow-[0_0_12px_rgba(122,224,255,0.4)]'
      },
      Void: {
        text: 'text-void',
        border: 'border-void',
        bg: 'bg-void',
        accentGlow: 'glow-void',
        barClass: 'bg-void/80 shadow-[0_0_12px_rgba(181,122,255,0.4)]'
      },
      Stasis: {
        text: 'text-stasis',
        border: 'border-stasis',
        bg: 'bg-stasis',
        accentGlow: 'glow-stasis',
        barClass: 'bg-stasis/80 shadow-[0_0_12px_rgba(77,166,255,0.4)]'
      },
      Strand: {
        text: 'text-strand',
        border: 'border-strand',
        bg: 'bg-strand',
        accentGlow: 'glow-strand',
        barClass: 'bg-strand/80 shadow-[0_0_12px_rgba(51,230,102,0.4)]'
      },
      Kinetic: {
        text: 'text-kinetic',
        border: 'border-kinetic',
        bg: 'bg-kinetic',
        accentGlow: 'glow-kinetic',
        barClass: 'bg-kinetic/80 shadow-[0_0_12px_rgba(234,234,234,0.3)]'
      }
    };

    return colors[element] || colors.Kinetic;
  }, [activeWeapon]);

  // Clean filters button helper
  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveAmmo(null);
    setActiveSlot(null);
    setActiveElement(null);
    setActiveWeaponType('All');
    setActiveRarity('All');
    setActiveFrame('All');
  };

  return (
    <div className="flex flex-col min-h-screen bg-space-dark text-slate-100 antialiased font-sans select-none">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b bg-space-dark/80 backdrop-blur-md border-glass">
        <div className="flex items-center gap-3">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt="BroJo Dojo Logo" 
            className="w-10 h-10 object-contain rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.3)] border border-purple-500/25 bg-space-dark/60 p-0.5" 
          />
          <div>
            <h1 className="font-display font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent animate-pulse">
              BROJO DESTINY 2 WEAPONS STATS
            </h1>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest leading-none">
              The Bronin Warriors Clan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {playerProfile && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-glass">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {playerProfile.displayName}
                  {playerProfile.displayNameCode && (
                    <span className="text-[9px] text-slate-500 font-medium ml-0.5">#{playerProfile.displayNameCode}</span>
                  )}
                </div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">
                  {vaultSource === 'sandbox' ? 'Sandbox Mode' : 'Destiny Vault'}
                </div>
              </div>
              <button 
                onClick={handleDisconnectVault}
                title="Disconnect Vault"
                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-rose-400 transition-colors ml-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeWeapon && (
            <button 
              onClick={handleCopyRollLink}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg glass-panel hover:bg-white/5 active:scale-95 transition-all duration-200 ${elementStyles.text}`}
            >
              {showShareSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-bounce" />
                  <span>Roll Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Roll Build</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Tab Selectors Grid */}
      <div className="flex md:hidden sticky top-[68px] z-30 border-b border-glass bg-space-dark/95 backdrop-blur-sm">
        <button 
          onClick={() => setActiveMobileTab('finder')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-all ${activeMobileTab === 'finder' ? `${elementStyles.border} ${elementStyles.text} bg-white/2` : 'border-transparent text-slate-500'}`}
        >
          Weapon Finder
        </button>
        <button 
          onClick={() => setActiveMobileTab('stats')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-all ${activeMobileTab === 'stats' ? `${elementStyles.border} ${elementStyles.text} bg-white/2` : 'border-transparent text-slate-500'}`}
        >
          Stats & Mechanics
        </button>
        <button 
          onClick={() => setActiveMobileTab('perks')}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-all ${activeMobileTab === 'perks' ? `${elementStyles.border} ${elementStyles.text} bg-white/2` : 'border-transparent text-slate-500'}`}
        >
          Sockets & Perks
        </button>
      </div>

      {/* Main Core 3-Column Split */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-68px)] md:h-[calc(100vh-68px)]">
        
        {/* ======================================================== */}
        {/* COLUMN 1: WEAPON SEARCH SIDEBAR                          */}
        {/* ======================================================== */}
        <aside className={`w-full md:w-[350px] flex-shrink-0 flex flex-col border-r border-glass bg-space-panel/50 backdrop-blur-lg ${activeMobileTab === 'finder' ? 'flex' : 'hidden md:flex'}`}>
          {/* Top Login Panel */}
          <div className="p-4 border-b border-glass bg-space-dark/60 flex-shrink-0">
            {!playerProfile ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5 shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all hover:border-amber-500/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offline Sandbox</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 mb-1.5 font-display">
                  Live Destiny 2 Vault Integration
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                  Connect your Bungie account to instantly swap sandbox weapons out for your real personal vault rolls.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleConnectLiveVault}
                    className="w-full py-2 px-3 text-xs font-bold text-space-dark bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-98 rounded-md shadow-[0_0_12px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Log In with Bungie</span>
                  </button>
                  <button
                    onClick={handleConnectMockVault}
                    className="w-full py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider text-center"
                  >
                    Or Load Demo Sandbox Data
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all hover:border-emerald-500/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Vault Connected</span>
                  </div>
                  <button 
                    onClick={handleDisconnectVault}
                    className="text-[9px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {playerProfile.displayName}
                      {playerProfile.displayNameCode && (
                        <span className="text-[10px] text-slate-500 font-medium ml-0.5">#{playerProfile.displayNameCode}</span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mt-0.5">
                      {vaultSource === 'sandbox' ? "Cayde's Cache" : "Live Inventory"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Tab Switcher */}
          <div className="flex border-b border-glass bg-space-dark/40 flex-shrink-0">
            <button
              onClick={() => setSidebarTab('database')}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 flex items-center justify-center gap-2 transition-all duration-200 ${sidebarTab === 'database' ? 'border-purple-500 text-purple-400 bg-white/2' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Database</span>
            </button>
            <button
              onClick={() => setSidebarTab('vault')}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 flex items-center justify-center gap-2 transition-all duration-200 ${sidebarTab === 'vault' ? 'border-purple-500 text-purple-400 bg-white/2' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>My Vault</span>
            </button>
          </div>

          {sidebarTab === 'database' ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Fuzzy Input */}
              <div className="p-4 border-b border-glass flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search weapons or frames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-glass bg-space-dark/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 transition"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-200">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Reset */}
                {(searchTerm || activeAmmo || activeSlot || activeElement || activeWeaponType !== 'All' || activeRarity !== 'All' || activeFrame !== 'All') && (
                  <button 
                    onClick={handleResetFilters}
                    className="mt-3 text-[11px] font-semibold text-purple-400 hover:text-purple-300 hover:underline uppercase tracking-wide"
                  >
                    Clear Active Filters
                  </button>
                )}
              </div>

              {/* Expanded Filter Grids Scroll block */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                
                {/* 1. Weapon Type Dropdown */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Weapon Class
                  </label>
                  <select
                    value={activeWeaponType}
                    onChange={(e) => setActiveWeaponType(e.target.value)}
                    className="w-full bg-space-dark/70 border border-glass rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50 text-slate-300"
                  >
                    {allWeaponTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* 1b. Weapon Frame Dropdown (Conditional) */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Weapon Frame
                  </label>
                  <select
                    value={activeFrame}
                    onChange={(e) => setActiveFrame(e.target.value)}
                    disabled={activeWeaponType === 'All'}
                    className={`w-full bg-space-dark/70 border border-glass rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50 text-slate-300 transition-all duration-200 ${activeWeaponType === 'All' ? 'opacity-40 cursor-not-allowed bg-slate-900/30' : 'hover:border-purple-500/30'}`}
                  >
                    {activeWeaponType === 'All' ? (
                      <option value="All">Select a weapon class first</option>
                    ) : (
                      availableFrames.map(frame => (
                        <option key={frame} value={frame}>{frame}</option>
                      ))
                    )}
                  </select>
                  {activeWeaponType === 'All' && (
                    <p className="text-[9px] text-purple-400/80 font-medium mt-1 uppercase tracking-wider">
                      * Select a weapon class above to filter by frame.
                    </p>
                  )}
                </div>

                {/* 1c. Rarity Dropdown */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Rarity
                  </label>
                  <select
                    value={activeRarity}
                    onChange={(e) => setActiveRarity(e.target.value)}
                    className="w-full bg-space-dark/70 border border-glass rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50 text-slate-300 hover:border-purple-500/30 transition-colors"
                  >
                    <option value="All">All</option>
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Exotic">Exotic</option>
                  </select>
                </div>

                {/* 2. Ammo Types pills */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Ammo Capacity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Primary', 'Special', 'Heavy'].map(ammo => (
                      <button
                        key={ammo}
                        onClick={() => setActiveAmmo(activeAmmo === ammo ? null : ammo)}
                        className={`py-1.5 text-xs font-semibold rounded-md border transition uppercase tracking-wide ${activeAmmo === ammo ? 'bg-purple-600/30 border-purple-500 text-purple-200 glow-void' : 'bg-space-dark/30 border-glass text-slate-400 hover:border-white/10 hover:text-slate-200'}`}
                      >
                        {ammo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Slot Filters pills */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Weapon Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Kinetic', 'Energy', 'Power'].map(slot => (
                      <button
                        key={slot}
                        onClick={() => setActiveSlot(activeSlot === slot ? null : slot)}
                        className={`py-1.5 text-xs font-semibold rounded-md border transition uppercase tracking-wide ${activeSlot === slot ? 'bg-purple-600/30 border-purple-500 text-purple-200 glow-void' : 'bg-space-dark/30 border-glass text-slate-400 hover:border-white/10 hover:text-slate-200'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Element Filters grid */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Elemental Burn
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(DAMAGE_TYPES).map(id => {
                      const name = DAMAGE_TYPES[id];
                      const elementColors = {
                        Solar: 'hover:border-solar hover:text-solar border-solar/20 bg-solar/5 text-solar/80 glow-solar',
                        Arc: 'hover:border-arc hover:text-arc border-arc/20 bg-arc/5 text-arc/80 glow-arc',
                        Void: 'hover:border-void hover:text-void border-void/20 bg-void/5 text-void/80 glow-void',
                        Stasis: 'hover:border-stasis hover:text-stasis border-stasis/20 bg-stasis/5 text-stasis/80 glow-stasis',
                        Strand: 'hover:border-strand hover:text-strand border-strand/20 bg-strand/5 text-strand/80 glow-strand',
                        Kinetic: 'hover:border-kinetic hover:text-kinetic border-kinetic/20 bg-kinetic/5 text-kinetic/80 glow-kinetic'
                      };

                      const isSelected = activeElement === name;

                      return (
                        <button
                          key={name}
                          onClick={() => setActiveElement(activeElement === name ? null : name)}
                          className={`py-1.5 text-xs font-semibold rounded-md border transition uppercase tracking-wide ${isSelected ? elementColors[name] : 'bg-space-dark/30 border-glass text-slate-400 hover:border-white/15 hover:text-slate-200'}`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search list count */}
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide pt-2 border-t border-glass">
                  Results found: {filteredWeapons.length}
                </div>

                {/* Scrollable list items */}
                <div className="space-y-2 pt-2">
                  {filteredWeapons.map(weapon => {
                    const isSelected = activeWeapon?.hash === weapon.hash;
                    
                    // Element color badge
                    const elementBorderColors = {
                      Solar: 'border-l-solar/80',
                      Arc: 'border-l-arc/80',
                      Void: 'border-l-void/80',
                      Stasis: 'border-l-stasis/80',
                      Strand: 'border-l-strand/80',
                      Kinetic: 'border-l-kinetic/40'
                    };

                    const rarityOutlineColors = {
                      Legendary: 'hover:border-purple-600/30',
                      Exotic: 'hover:border-amber-500/30',
                      Rare: 'hover:border-blue-500/30'
                    };

                    return (
                      <button
                        key={weapon.hash}
                        onClick={() => {
                          navigate(`/weapon/${weapon.hash}`);
                          setActiveMobileTab('stats'); // dynamic focus shift for mobile
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left glass-panel transition-all duration-200 ${elementBorderColors[weapon.damageType]} border-l-4 ${isSelected ? 'border-glass bg-white/5 shadow-md ring-1 ring-white/10' : `bg-space-dark/20 border-glass ${rarityOutlineColors[weapon.tier] || 'hover:border-glass-border-hover'}`}`}
                      >
                        <div className="flex items-center gap-3">
                          {weapon.icon ? (
                            <img 
                              src={weapon.icon} 
                              alt="" 
                              className="w-10 h-10 rounded border border-glass bg-space-dark/60"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-800 rounded border border-glass flex items-center justify-center text-slate-600 text-xs">
                              W
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-xs text-slate-200 flex items-center gap-1.5 truncate max-w-[170px]">
                              <span className="truncate">{weapon.name}</span>
                              {getWeaponVersionLabel(weapon) && (
                                <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase tracking-wide leading-none shrink-0 scale-90">
                                  {getWeaponVersionLabel(weapon)}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {weapon.frame}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {weapon.weaponType}
                          </span>
                          <span className="text-[9px] font-medium text-slate-500">
                            {weapon.damageType}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {filteredWeapons.length === 0 && (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <ShieldAlert className="w-8 h-8 mx-auto stroke-1" />
                      <p className="text-xs font-semibold uppercase tracking-wider">No weapons found</p>
                      <p className="text-[11px] text-slate-600">Try modifying your filter parameters</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              {!playerProfile ? (
                <div className="p-6 flex-1 flex flex-col justify-center text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <Archive className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider">
                      Vault Sync Required
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                      Please use the <span className="text-amber-400 font-bold">Log In with Bungie</span> panel at the top of the sidebar to authorize access to your in-game vault weapons.
                    </p>
                  </div>
                </div>
              ) : isFetchingVault ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider animate-pulse">Syncing Inventory...</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="p-4 border-b border-glass flex-shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search vault rolls..."
                        value={vaultSearchTerm}
                        onChange={(e) => setVaultSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-glass bg-space-dark/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 transition"
                      />
                      {vaultSearchTerm && (
                        <button onClick={() => setVaultSearchTerm('')} className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-200">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex-1 overflow-y-auto space-y-2">
                    {filteredVaultWeapons.map(vaultWep => {
                      const isSelected = activeWeapon?.hash === vaultWep.hash;
                      
                      const sourceBadgeColors = {
                        Vault: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
                        Equipped: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                        Carried: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      };

                      return (
                        <button
                          key={vaultWep.instanceId}
                          onClick={() => handleSelectVaultWeapon(vaultWep)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border text-left glass-panel transition-all duration-200 hover:scale-[1.01] ${isSelected ? 'border-amber-500/50 bg-white/5 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' : 'bg-space-dark/20 border-glass hover:border-white/10'}`}
                        >
                          <div className="flex items-center gap-3">
                            {vaultWep.icon ? (
                              <img 
                                src={vaultWep.icon} 
                                alt="" 
                                className="w-10 h-10 rounded border border-glass bg-space-dark/60"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-800 rounded border border-glass flex items-center justify-center text-slate-600 text-xs">
                                W
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-xs text-slate-200 flex items-center gap-1.5 truncate max-w-[150px]">
                                <span className="truncate">{vaultWep.name}</span>
                                {getWeaponVersionLabel(vaultWep) && (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase tracking-wide leading-none shrink-0 scale-90">
                                    {getWeaponVersionLabel(vaultWep)}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-bold text-amber-400/90 tracking-wide mt-0.5">
                                {vaultWep.customRollName}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${sourceBadgeColors[vaultWep.source] || 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                              {vaultWep.source}
                            </span>
                            <span className="text-[9px] font-medium text-slate-500 uppercase">
                              {vaultWep.weaponType}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {filteredVaultWeapons.length === 0 && (
                      <div className="py-12 text-center text-slate-500 space-y-2">
                        <ShieldAlert className="w-8 h-8 mx-auto stroke-1" />
                        <p className="text-xs font-semibold uppercase tracking-wider">No rolls found</p>
                        <p className="text-[11px] text-slate-600">Try modifying your search term</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ======================================================== */}
        {/* COLUMN 2: CENTER SHOWCASE & STATS PANEL                  */}
        {/* ======================================================== */}
        <main className={`flex-1 flex flex-col overflow-y-auto bg-space-dark/10 p-6 ${activeMobileTab === 'stats' ? 'flex' : 'hidden md:flex'}`}>
          {activeWeapon ? (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              
              {/* Showcase Banner Card */}
              <div className="relative rounded-xl overflow-hidden glass-panel border border-glass flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                
                {/* Background Screenshot overlay */}
                {activeWeapon.screenshot && (
                  <div 
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-10 blur-sm pointer-events-none"
                    style={{ backgroundImage: `url(${activeWeapon.screenshot})` }}
                  />
                )}

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                  {activeWeapon.icon ? (
                    <img 
                      src={activeWeapon.icon} 
                      alt="" 
                      className={`w-20 h-20 rounded-xl border-2 bg-space-dark/80 p-1 shadow-lg ${activeWeapon.tier === 'Exotic' ? 'border-amber-500/50 glow-solar' : 'border-purple-500/40 glow-void'}`}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-lg border border-glass shadow-lg">
                      W
                    </div>
                  )}

                  <div>
                    <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-full mb-1.5 bg-white/5 border border-glass text-slate-300`}>
                      {activeWeapon.tier} Weapon
                    </span>
                    <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-100 leading-none tracking-tight flex flex-wrap items-center gap-3">
                      <span>{activeWeapon.name}</span>
                      {getWeaponVersionLabel(activeWeapon) && (
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/35 uppercase tracking-widest leading-none scale-90 shadow-sm shadow-purple-500/10">
                          {getWeaponVersionLabel(activeWeapon)}
                        </span>
                      )}
                    </h2>
                    <p className={`text-xs font-semibold tracking-wider mt-1.5 text-slate-400 uppercase flex items-center justify-center md:justify-start gap-2`}>
                      <span className={`w-2 h-2 rounded-full ${elementStyles.bg}`} />
                      {activeWeapon.damageType} &bull; {activeWeapon.weaponType} &bull; {activeWeapon.frame}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center md:items-end gap-1 px-4 py-2.5 rounded-lg bg-black/30 border border-glass">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Weapon Class Slot
                  </span>
                  <span className="font-display font-extrabold text-lg uppercase text-slate-300">
                    {activeWeapon.slot}
                  </span>
                </div>

              </div>

              {/* Grid: 2-Column Stats and Radial Dial */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Dynamic Stat bars panel */}
                <div className="lg:col-span-8 glass-panel rounded-xl border border-glass p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-glass">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      Dynamic Attributes & Bars
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Clamped Value Limits
                    </span>
                  </div>

                  {/* Progressive stat bars stack */}
                  <div className="space-y-4">
                    {Object.entries(calculatedStats).map(([sHashStr, stat]) => {
                      const sHash = parseInt(sHashStr);
                      const meta = STAT_METADATA[sHash];
                      if (!meta || sHash === 2715839340) return null; // skip Recoil in main stack (has radial compass)

                      // Calculate percentage width mapping
                      const percentBase = Math.min(100, Math.max(0, stat.base));
                      const percentFinal = Math.min(100, Math.max(0, stat.final));
                      
                      // Stat modifications deltas values
                      const isPositive = stat.offset > 0;
                      const isNegative = stat.offset < 0;

                      return (
                        <div key={sHash} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                              {meta.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-medium">
                                {stat.base}
                              </span>
                              {stat.offset !== 0 && (
                                <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>
                                  {isPositive ? `+${stat.offset}` : stat.offset}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-600">
                                &rarr;
                              </span>
                              <span className={`font-display font-extrabold text-sm ${stat.offset !== 0 ? elementStyles.text : 'text-slate-100'}`}>
                                {stat.final}
                              </span>
                              <span className="text-[9px] text-slate-600 font-bold">
                                [{stat.min}-{stat.max}]
                              </span>
                            </div>
                          </div>

                          {/* SVG/Div Horizontal Bars rendering */}
                          <div className="h-2 w-full rounded-full bg-slate-900 border border-glass/40 overflow-hidden relative">
                            {/* 1. Faint Base stat Bar background */}
                            <div 
                              className="h-full bg-slate-800 rounded-full transition-all duration-300 ease-out" 
                              style={{ width: `${percentBase}%` }}
                            />

                            {/* 2. Dynamic Final Value Bar (Neon element-colored segment) */}
                            <div 
                              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out ${elementStyles.barClass}`} 
                              style={{ width: `${percentFinal}%` }}
                            />

                            {/* 3. If Positive Perk Delta: Glow green segment */}
                            {isPositive && percentFinal > percentBase && (
                              <div 
                                className="absolute top-0 h-full bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.4)] transition-all duration-300 ease-out"
                                style={{ 
                                  left: `${percentBase}%`, 
                                  width: `${percentFinal - percentBase}%` 
                                }}
                              />
                            )}

                            {/* 4. If Negative Perk Delta: Overlay red segment */}
                            {isNegative && percentFinal < percentBase && (
                              <div 
                                className="absolute top-0 h-full bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.4)] transition-all duration-300 ease-out"
                                style={{ 
                                  left: `${percentFinal}%`, 
                                  width: `${percentBase - percentFinal}%` 
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Recoil Direction Compass dial */}
                <div className="lg:col-span-4 flex flex-col justify-between glass-panel rounded-xl border border-glass p-6 gap-4">
                  <div className="pb-3 border-b border-glass text-center lg:text-left">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center lg:justify-start gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      Recoil Physics Gauge
                    </h3>
                  </div>

                  {/* The circular radial SVG dial */}
                  <div className="flex items-center justify-center py-2 relative">
                    <svg className="w-36 h-36 relative z-10" viewBox="0 0 100 100">
                      {/* Grid Circles */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      
                      {/* Crosshairs lines */}
                      <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.06)" strokeWidth="0.75" />
                      <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="0.75" />
                      
                      {/* 10-degree marking ticks */}
                      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                        <line
                          key={deg}
                          x1="50" y1="6" x2="50" y2="10"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="0.75"
                          transform={`rotate(${deg} 50 50)`}
                        />
                      ))}

                      {/* Translucent Error/Bounce wedge (Horizontal Dispersion arc) */}
                      <path
                        d={`M 50 50 
                            L ${50 + 40 * Math.sin((recoilStats.angle - recoilStats.errorWidth/2) * Math.PI / 180)} ${50 - 40 * Math.cos((recoilStats.angle - recoilStats.errorWidth/2) * Math.PI / 180)} 
                            A 40 40 0 0 1 ${50 + 40 * Math.sin((recoilStats.angle + recoilStats.errorWidth/2) * Math.PI / 180)} ${50 - 40 * Math.cos((recoilStats.angle + recoilStats.errorWidth/2) * Math.PI / 180)} 
                            Z`}
                        fill="rgba(52, 211, 153, 0.08)"
                        stroke="rgba(52, 211, 153, 0.2)"
                        strokeWidth="0.5"
                        className="transition-all duration-300"
                      />

                      {/* Recoil Direction Vector arrow needle */}
                      <g transform={`rotate(${recoilStats.angle} 50 50)`} className="transition-all duration-300">
                        <line 
                          x1="50" y1="50" 
                          x2="50" y2="12" 
                          stroke="var(--color-solar)" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          className="glow-solar"
                        />
                        <polygon 
                          points="50,8 47,15 53,15" 
                          fill="var(--color-solar)"
                        />
                      </g>

                      {/* Compass Center Core */}
                      <circle cx="50" cy="50" r="3.5" fill="#0a0b0d" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Recoil statistics classification */}
                  <div className="text-center bg-black/25 border border-glass rounded-lg py-2.5 px-4 space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Recoil Vector Rating
                    </div>
                    <div className="font-display font-extrabold text-xl leading-none text-slate-200">
                      {recoilStats.value}
                    </div>
                    <div className={`text-xs font-semibold uppercase tracking-wider ${recoilStats.angle === 0 ? 'text-emerald-400' : 'text-amber-400/90'}`}>
                      {recoilStats.classification} ({recoilStats.angle === 0 ? '0' : (recoilStats.angle > 0 ? `+${recoilStats.angle.toFixed(0)}` : recoilStats.angle.toFixed(0))}&deg;)
                    </div>
                  </div>

                </div>

              </div>

              {/* Physical formulas panels: reload, handling, and damage meters */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* A. Absolute seconds timings card */}
                <div className="glass-panel rounded-xl border border-glass p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-glass pb-3">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Physical Mechanical Timings
                  </h3>

                  <div className="space-y-2.5">
                    {/* Reload Speed Row */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/25 border border-glass hover:bg-white/2 hover:border-glass-border-hover transition-all duration-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 flex-shrink-0 animate-pulse">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">Reload Duration</h4>
                          <p className="text-[10px] text-slate-500 font-medium truncate">Time to fully replenish magazine</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <span className="font-display font-black text-sm text-slate-100 block">{reloadDuration}s</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Stat: {calculatedStats[4188031367]?.final || 50}</span>
                      </div>
                    </div>

                    {/* Stow Speed Row */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/25 border border-glass hover:bg-white/2 hover:border-glass-border-hover transition-all duration-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 flex-shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">Stow Timing</h4>
                          <p className="text-[10px] text-slate-500 font-medium truncate">Holstering speed from active select</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <span className="font-display font-black text-sm text-slate-100 block">{handlingTimings.stow}ms</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Stat: {calculatedStats[943549884]?.final || 50}</span>
                      </div>
                    </div>

                    {/* Ready Speed Row */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/25 border border-glass hover:bg-white/2 hover:border-glass-border-hover transition-all duration-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">Ready Timing</h4>
                          <p className="text-[10px] text-slate-500 font-medium truncate">Drawing speed to raised combat ready</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <span className="font-display font-black text-sm text-slate-100 block">{handlingTimings.ready}ms</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Stat: {calculatedStats[943549884]?.final || 50}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
                    <InfoIcon className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    <span>
                      Timings represent in-game milliseconds and frame counts calibrated from actual Bungie physics data.
                    </span>
                  </p>
                </div>

                {/* B. Range falloff slider meters card */}
                <div className="glass-panel rounded-xl border border-glass p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-glass pb-3">
                    <Layers className="w-4 h-4 text-solar" />
                    Calculated Range Damage Falloff Start
                  </h3>

                  <div className="space-y-4">
                    {/* Hipfire */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Hipfire Falloff Meters</span>
                        <span className="font-display font-bold text-slate-100">{rangeMetrics.hipStart}m - {rangeMetrics.hipEnd}m</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-900 border border-glass overflow-hidden relative">
                        <div 
                          className="h-full bg-indigo-500/30 border-r border-indigo-400"
                          style={{ width: `${Math.min(100, (parseFloat(rangeMetrics.hipStart) / 50) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* ADS */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Aim Down Sights (ADS)</span>
                        <span className="font-display font-bold text-slate-100">{rangeMetrics.adsStart}m - {rangeMetrics.adsEnd}m</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-900 border border-glass overflow-hidden relative">
                        <div 
                          className={`h-full border-r ${elementStyles.barClass}`}
                          style={{ width: `${Math.min(100, (parseFloat(rangeMetrics.adsStart) / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
                    <InfoIcon className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                    <span>
                      Calculated from Zoom stat ({calculatedStats[3555269338]?.final || 14}) and scaling coefficients for {activeWeapon.weaponType}.
                    </span>
                  </p>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center py-20">
              <div className="space-y-3">
                <ShieldAlert className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
                <h3 className="font-semibold text-lg text-slate-400 uppercase tracking-wide">No Weapon Selected</h3>
                <p className="text-xs text-slate-500">Pick a weapon from the left Catalog search sidebar to get started.</p>
              </div>
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* COLUMN 3: RIGHT SOCKETS & PERKS CUSTOMIZER               */}
        {/* ======================================================== */}
        <aside className={`w-full md:w-[380px] flex-shrink-0 flex flex-col border-l border-glass bg-space-panel/50 backdrop-blur-lg ${activeMobileTab === 'perks' ? 'flex' : 'hidden md:flex'}`}>
          {activeWeapon ? (
            <div className="flex flex-col h-full">
              
              {/* Sockets header */}
              <div className="p-4 border-b border-glass flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                  Engineering Sockets Customizer
                </h3>
                <button
                  onClick={() => setIsEnhanced(!isEnhanced)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition-all duration-200 cursor-pointer ${
                    isEnhanced
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-space-dark/40 border-glass text-slate-400 hover:border-amber-500/30 hover:text-amber-500/80'
                  }`}
                >
                  <span className={isEnhanced ? 'text-amber-400 animate-pulse' : 'text-slate-500'}>✦</span>
                  Enhance Sockets
                </button>
              </div>

              {/* Sockets nodes list */}
              <div className="p-4 flex-1 overflow-y-auto space-y-5">
                
                {/* Organize by category sockets */}
                {['intrinsic', 'barrel', 'magazine', 'perk1', 'perk2', 'origin_trait', 'masterwork'].map(categoryType => {
                  const matchingSockets = activeWeapon.sockets.filter(s => {
                    if (categoryType === 'masterwork') return s.cat === 'masterwork';
                    if (categoryType === 'origin_trait') return s.cat === 'origin_trait';
                    
                    const nonMwOtSockets = activeWeapon.sockets.filter(s2 => s2.cat !== 'masterwork' && s2.cat !== 'origin_trait');
                    const relativeIndex = nonMwOtSockets.findIndex(s2 => s2.index === s.index);
                    
                    if (categoryType === 'intrinsic') return relativeIndex === 0;
                    if (categoryType === 'barrel') return relativeIndex === 1;
                    if (categoryType === 'magazine') return relativeIndex === 2;
                    if (categoryType === 'perk1') return relativeIndex === 3;
                    if (categoryType === 'perk2') return relativeIndex === 4;
                    return false;
                  });
                  if (matchingSockets.length === 0) return null;

                  const socketLabels = getSocketLabels(activeWeapon);

                  const categoryLabels = {
                    intrinsic: 'Intrinsic Frame',
                    barrel: socketLabels.barrel,
                    magazine: socketLabels.magazine,
                    perk1: 'Weapon Perks (Column 1)',
                    perk2: 'Weapon Perks (Column 2)',
                    origin_trait: 'Origin Traits',
                    masterwork: 'Masterwork Stat Bonus'
                  };

                  let renderedSocketsCount = 0;

                  const socketNodes = matchingSockets.map(socket => {
                    const activeHash = activePerks[socket.index];
                    
                    let displayedPlugs = socket.plugs;
                    if (categoryType === 'barrel' || categoryType === 'magazine') {
                      const seenHashes = new Set();
                      const seenNames = new Set();
                      displayedPlugs = socket.plugs.filter(pHash => {
                        const perk = perksData[pHash];
                        if (!perk) return false;
                        const name = perk.name || '';
                        if (seenHashes.has(pHash) || seenNames.has(name)) return false;
                        seenHashes.add(pHash);
                        seenNames.add(name);
                        return true;
                      });
                    }
                    if (categoryType === 'masterwork') {
                      const seenNames = new Set();
                      displayedPlugs = socket.plugs.filter(pHash => {
                        const perk = perksData[pHash];
                        if (!perk) return false;
                        const name = perk.name || '';
                        const isOldStyle = /^(Masterwork Upgrade|Rework Weapon|Vanguard Masterwork|Crucible Masterwork)$/i.test(name);
                        const isLegacyWeapon = activeWeapon.sockets.length <= 6 || !activeWeapon.sockets.some(s => s.cat === 'origin_trait');
                        if (isOldStyle) return isLegacyWeapon;
                        const match = name.match(/^(?:Masterwork|Masterworked|Tier 10): (Range|Stability|Handling|Reload Speed|Blast Radius|Velocity|Charge Time|Draw Time|Impact|Accuracy)$/i);
                        if (!match) return false;
                        const statName = match[1];
                        const allowedStats = ALLOWED_MASTERWORKS[activeWeapon.weaponType] || ['Range', 'Stability', 'Handling', 'Reload Speed'];
                        const isAllowed = allowedStats.includes(statName);
                        if (!isAllowed) return false;
                        if (perk.investmentStats && perk.investmentStats.length > 0) {
                          let primaryStatHash = null;
                          let highestValue = -999;
                          perk.investmentStats.forEach(stat => {
                            if (stat.value > highestValue) {
                              highestValue = stat.value;
                              primaryStatHash = stat.statHash;
                            }
                          });
                          if (primaryStatHash) {
                            const hasStat = activeWeapon.baseStats[primaryStatHash] !== undefined;
                            if (!hasStat) return false;
                            if (seenNames.has(name)) return false;
                            seenNames.add(name);
                            return true;
                          }
                        }
                        return true;
                      });
                    }

                    if (displayedPlugs.length === 0) return null;
                    renderedSocketsCount++;

                    return (
                      <div 
                        key={socket.index} 
                        className="flex items-center gap-3 bg-black/20 border border-glass/40 rounded-xl p-2.5 hover:border-glass-border-hover transition"
                      >
                        <div className="flex flex-wrap gap-2.5">
                          {displayedPlugs.map(pHash => {
                            const perk = perksData[pHash];
                            if (!perk) return null;

                            const isActive = activeHash === pHash;

                            // Determine if this perk button is eligible for and currently enhanced
                            const isEligible = (categoryType === 'perk1' || categoryType === 'perk2' || categoryType === 'origin_trait') &&
                              COMMUNITY_INSIGHTS[perk.name]?.enhanced;
                            const isPerkEnhanced = isEnhanced && isEligible;

                            // Dynamic button border & glow classes
                            let btnClasses = 'border-glass bg-space-dark/50 hover:border-white/20';
                            if (isActive) {
                              if (isPerkEnhanced) {
                                btnClasses = 'border-amber-500 bg-white/5 shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105 border-2';
                              } else {
                                btnClasses = `${elementStyles.border} bg-white/5 ${elementStyles.accentGlow} scale-105 border-2`;
                              }
                            } else if (isEnhanced && isEligible) {
                              btnClasses = 'border-amber-500/25 bg-space-dark/50 hover:border-amber-500/50';
                            }

                            return (
                              <button
                                key={pHash}
                                onClick={() => handleTogglePerk(socket.index, pHash)}
                                onMouseEnter={() => setHoveredPerk({ ...perk, socketIndex: socket.index, categoryType })}
                                onMouseLeave={() => setHoveredPerk(null)}
                                className={`w-11 h-11 rounded-full border flex items-center justify-center relative cursor-pointer active:scale-90 transition-all duration-200 ${btnClasses}`}
                              >
                                {perk.icon ? (
                                  <img src={perk.icon} alt={perk.name} className="w-7 h-7 rounded-full" />
                                ) : (
                                  <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 text-[10px]">
                                    P
                                  </div>
                                )}

                                {/* Glowing indicator dot inside if active */}
                                {isActive && !isPerkEnhanced && (
                                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${elementStyles.bg} border border-space-dark`} />
                                )}
                                {isActive && isPerkEnhanced && (
                                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 border border-space-dark shadow-[0_0_6px_#f59e0b] animate-pulse" />
                                )}

                                {/* Tiny absolute gold star/arrow badge at bottom-left if enhanced */}
                                {isPerkEnhanced && (
                                  <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center text-[8px] text-slate-900 font-extrabold shadow-sm select-none z-10">
                                    ✦
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });

                  if (renderedSocketsCount === 0) return null;

                  return (
                    <div key={categoryType} className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                        {categoryLabels[categoryType]}
                      </label>
                      
                      <div className="space-y-3">
                        {socketNodes}
                      </div>
                    </div>
                  );
                })}

                {/* Weapon Mods Section */}
                {(() => {
                  const versionLabel = getWeaponVersionLabel(activeWeapon);
                  const isExotic = activeWeapon.tier === 'Exotic';
                  const isLegacyY1 = versionLabel === 'Legacy Y1';

                  if (isExotic) {
                    return (
                      <div className="space-y-2 pt-1 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                          Weapon Mods
                        </label>
                        <div className="flex items-center gap-3 bg-black/20 border border-amber-500/20 rounded-xl p-3 text-left">
                          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-350">Exotic Frame</div>
                            <div className="text-[10px] text-slate-500 leading-normal">
                              Weapon mods are disabled on Exotic weapons.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isLegacyY1) {
                    return (
                      <div className="space-y-2 pt-1 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                          Weapon Mods
                        </label>
                        <div className="flex items-center gap-3 bg-black/20 border border-slate-700 rounded-xl p-3 text-left">
                          <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-350">Legacy Frame</div>
                            <div className="text-[10px] text-slate-500 leading-normal">
                              Modern weapon mods are disabled on Legacy Year 1 weapons.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Find active mod details for display in the socket
                  const activeMod = selectedModId ? modsData.find(m => m.id === selectedModId) : null;

                  return (
                    <div className="space-y-2 pt-1 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                        Weapon Mod
                      </label>
                      <div 
                        onClick={() => {
                          setTempSelectedModId(selectedModId);
                          setModSearchQuery('');
                          setIsModModalOpen(true);
                        }}
                        className="flex items-center gap-3 bg-black/20 border border-glass/40 rounded-xl p-2.5 hover:border-glass-border-hover transition cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-200"
                      >
                        <div className="w-11 h-11 rounded-full border border-glass bg-space-dark/50 flex items-center justify-center relative transition-all duration-200 active:scale-95 group-hover:scale-105 shrink-0">
                          {activeMod && activeMod.icon ? (
                            <img src={activeMod.icon} alt={activeMod.name} className="w-7 h-7 rounded-full bg-slate-950 object-contain" />
                          ) : (
                            <Plus className="w-5 h-5 text-slate-500 group-hover:text-slate-350 transition" />
                          )}
                          
                          {selectedModId && (
                            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${elementStyles.bg} border border-space-dark`} />
                          )}
                        </div>
                        
                        <div className="text-left overflow-hidden">
                          <div className="text-xs font-bold text-slate-200 group-hover:text-white transition truncate">
                            {activeMod ? activeMod.name : 'Empty Mod Socket'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {activeMod ? 'Click to swap or remove weapon mod' : 'Click to select and insert a weapon mod'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center py-20">
              <p className="text-xs text-slate-500">Pick a weapon to customize</p>
            </div>
          )}
        </aside>

      </div>

      {/* Floating Tooltip Component */}
      {hoveredPerk && (() => {
        const insight = COMMUNITY_INSIGHTS[hoveredPerk.name];
        const hasEnhancedVariant = insight && insight.enhanced;
        const isHoveredEnhancedActive = isEnhanced && 
          (hoveredPerk.categoryType === 'perk1' || hoveredPerk.categoryType === 'perk2' || hoveredPerk.categoryType === 'origin_trait') &&
          hasEnhancedVariant;

        const tooltipWidth = 320;
        const approxHeight = 360; // Estimated height for clamping to prevent off-screen overflow
        let left = mousePos.x + 16;
        let top = mousePos.y + 16;
        
        if (left + tooltipWidth > window.innerWidth) {
          left = mousePos.x - tooltipWidth - 16;
        }
        if (left < 8) left = 8;
        
        if (top + approxHeight > window.innerHeight) {
          top = window.innerHeight - approxHeight - 8;
        }
        if (top < 8) top = 8;

        return (
          <div 
            style={{ left: `${left}px`, top: `${top}px` }}
            className={`fixed z-50 pointer-events-none w-[320px] max-h-[85vh] overflow-y-auto rounded-lg border border-slate-800 bg-[#0e141f]/95 backdrop-blur-md shadow-2xl p-4 space-y-3 transition-all duration-75 text-left border-l-[4px] ${isHoveredEnhancedActive ? 'border-l-amber-500' : 'border-l-sky-400'}`}
          >
            {isHoveredEnhancedActive ? (
              <div className="flex items-center gap-2">
                {hoveredPerk.icon && (
                  <div className="relative">
                    <img src={hoveredPerk.icon} alt="" className="w-8 h-8 rounded-full border border-amber-500/50 bg-space-dark/80 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse" />
                    <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-amber-500 border border-slate-950 flex items-center justify-center text-[7px] text-slate-955 font-black">✦</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-extrabold text-sm text-amber-400 leading-none">
                      Enhanced {hoveredPerk.name}
                    </h4>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse flex-shrink-0" />
                  </div>
                  <p className="text-[9px] text-amber-500 uppercase tracking-widest font-semibold mt-1">
                    Enhanced Trait Socket
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {hoveredPerk.icon ? (
                  <img src={hoveredPerk.icon} alt="" className="w-8 h-8 rounded-full border border-glass bg-space-dark/80 shrink-0" />
                ) : (
                  hoveredPerk.isMod && (
                    <div className="w-8 h-8 rounded-full border border-glass bg-space-dark/80 flex items-center justify-center text-slate-350 shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                  )
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-200 leading-none">
                    {hoveredPerk.name}
                  </h4>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-1">
                    {hoveredPerk.isMod ? 'Weapon Mod Socket' : (hoveredPerk.categoryType === 'intrinsic' ? 'Archetype Intrinsic' : 'Roll Node Plug')}
                  </p>
                </div>
              </div>
            )}

            {/* Official Bungie Description */}
            <div className="text-xs text-slate-400 leading-normal space-y-1">
              {((hoveredPerk.isMod && MOD_DESCRIPTIONS[hoveredPerk.id]) || hoveredPerk.description || 'Passive bonus socket. Modifies core weapon stats.')
                .replace(/<br\s*\/?>/gi, '\n')
                .split('\n')
                .map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))
              }
            </div>

            {/* Stats Modifications list inside tooltip */}
            {hoveredPerk.investmentStats && hoveredPerk.investmentStats.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {hoveredPerk.investmentStats.map(stat => {
                  const meta = STAT_METADATA[stat.statHash];
                  if (!meta || stat.value === 0) return null;
                  return (
                    <span 
                      key={stat.statHash} 
                      className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded ${stat.value > 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}
                    >
                      {meta.name}: {stat.value > 0 ? `+${stat.value}` : stat.value}
                    </span>
                  );
                })}
                
                {/* Display +5 Passive Stat boost visually inside tag indicators if enhanced */}
                {isHoveredEnhancedActive && insight && insight.enhanced && insight.enhanced.statBoosts && (
                  (() => {
                    const boostText = insight.enhanced.statBoosts;
                    let statName = '';
                    if (boostText.includes('Range')) statName = 'Range';
                    else if (boostText.includes('Stability')) statName = 'Stability';
                    else if (boostText.includes('Handling')) statName = 'Handling';
                    else if (boostText.includes('Reload')) statName = 'Reload Speed';

                    if (statName) {
                      return (
                        <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/15 border border-amber-500/25 text-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.15)] animate-pulse">
                          Enhanced {statName}: +5 (Passive)
                        </span>
                      );
                    }
                    return null;
                  })()
                )}
              </div>
            )}

            {/* DIM/Clarity Styled Community Insight block */}
            {insight && (
              <div className="mt-2.5 p-2.5 bg-sky-950/20 border-l-[3px] border-sky-400 rounded-r-lg space-y-2 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold uppercase tracking-wider text-[9px] pb-1 border-b border-sky-900/30">
                  <InfoIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Community Insight</span>
                  {isHoveredEnhancedActive && (
                    <span className="ml-auto text-[8px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/25 px-1 py-0.2 rounded">
                      ✦ Enhanced Active
                    </span>
                  )}
                </div>

                {isHoveredEnhancedActive && insight.enhanced && (
                  <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded space-y-1 text-slate-200">
                    <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Enhanced Buff Changes</div>
                    <p className="text-amber-200/90 font-medium leading-relaxed">{insight.enhanced.changes}</p>
                    {insight.enhanced.statBoosts && (
                      <p className="text-emerald-400 font-bold text-[9px] mt-0.5">
                        Active Passive: {insight.enhanced.statBoosts}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 text-slate-300">
                  <div className="flex flex-col">
                    <span className="text-sky-300/80 font-bold uppercase text-[8px] tracking-wide">Activation:</span> 
                    <span className="mt-0.5">{insight.activation}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sky-300/80 font-bold uppercase text-[8px] tracking-wide">Stack Behavior:</span> 
                    <span className="mt-0.5">{insight.stackBehavior}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sky-300/80 font-bold uppercase text-[8px] tracking-wide">Timers & Cooldowns:</span> 
                    <span className="mt-0.5">{insight.timers}</span>
                  </div>
                  {!isHoveredEnhancedActive && insight.statBoosts && insight.statBoosts !== insight.stackBehavior && (
                    <div className="flex flex-col">
                      <span className="text-sky-300/80 font-bold uppercase text-[8px] tracking-wide">Stat Boosts:</span> 
                      <span className="mt-0.5">{insight.statBoosts}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Weapon Mods Premium Selection Modal */}
      {isModModalOpen && (() => {
        const versionLabel = getWeaponVersionLabel(activeWeapon);
        const isWeaponEligibleForModernMods = activeWeapon && 
          activeWeapon.tier !== 'Exotic' && 
          versionLabel !== 'Legacy Y1' && 
          versionLabel !== 'Legacy Y2' && 
          versionLabel !== 'Legacy';

        // Filter mods for grid
        const hasOriginTrait = activeWeapon?.sockets?.some(s => s.cat === 'origin_trait');
        const isAdeptOrTimelost = activeWeapon?.name.includes('(Adept)') || activeWeapon?.name.includes('(Timelost)');
        
        const filteredModsForGrid = modsData.filter(mod => {
          // Filter out weapon-type/stat incompatible mods
          if (!isModCompatibleWithWeapon(mod, activeWeapon)) {
            return false;
          }

          // Filter by search query if any
          if (modSearchQuery) {
            const query = modSearchQuery.toLowerCase();
            const nameMatch = mod.name.toLowerCase().includes(query);
            const descMatch = (mod.description || '').toLowerCase().includes(query);
            const insightMatch = (COMMUNITY_INSIGHTS[mod.name]?.stackBehavior || '').toLowerCase().includes(query) ||
                                 (COMMUNITY_INSIGHTS[mod.name]?.statBoosts || '').toLowerCase().includes(query);
            if (!nameMatch && !descMatch && !insightMatch) return false;
          }

          // Category eligibility
          if (mod.category === 'Adept') {
            return isAdeptOrTimelost;
          }
          if (mod.category === 'Modern') {
            return hasOriginTrait;
          }
          if (mod.category === 'Artifact') {
            return hasOriginTrait && activeWeapon?.damageType === 'Void';
          }
          if (mod.category === 'Anti-Champion') {
            const lowerName = mod.name.toLowerCase();
            const type = activeWeapon?.weaponType.toLowerCase() || '';
            if (type.includes('hand cannon') && lowerName.includes('hand cannon')) return true;
            if (type.includes('pulse rifle') && lowerName.includes('pulse rifle')) return true;
            if (type.includes('submachine gun') && lowerName.includes('submachine gun')) return true;
            if (type.includes('auto rifle') && lowerName.includes('auto rifle')) return true;
            if (type.includes('scout rifle') && lowerName.includes('scout rifle')) return true;
            if (type.includes('bow') && lowerName.includes('bow')) return true;
            if (type.includes('sidearm') && lowerName.includes('sidearm')) return true;
            if (type.includes('glaive') && lowerName.includes('glaive')) return true;
            if (type.includes('shotgun') && lowerName.includes('shotgun')) return true;
            return false;
          }
          return true; // Standard, Shaped, Enhanced are always visible
        });

        // The highlighted mod details at the bottom of the modal
        const activeHighlightedModId = tempSelectedModId || (filteredModsForGrid.length > 0 ? filteredModsForGrid[0].id : null);
        const highlightedMod = modsData.find(m => m.id === activeHighlightedModId);
        const insight = highlightedMod ? COMMUNITY_INSIGHTS[highlightedMod.name] : null;

        // Validation checking
        const isModLocked = highlightedMod && (
          (highlightedMod.category === 'Enhanced' && !isEnhanced) ||
          (highlightedMod.category === 'Shaped' && !isEnhanced && !isWeaponEligibleForModernMods)
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
            <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d1322]">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-100">
                    Weapon Mods
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModModalOpen(false)}
                  className="text-slate-400 hover:text-white hover:bg-white/5 p-1 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search input */}
              <div className="px-6 pt-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={modSearchQuery}
                    onChange={(e) => {
                      setModSearchQuery(e.target.value);
                      setTempSelectedModId(null);
                    }}
                    placeholder="Search names or descriptions"
                    className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition"
                  />
                  {modSearchQuery && (
                    <button 
                      onClick={() => setModSearchQuery('')}
                      className="absolute right-3 top-3 text-[10px] text-slate-500 hover:text-slate-350 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Mods Grid */}
              <div className="flex-1 overflow-y-auto p-6 min-h-[180px] max-h-[40vh]">
                {filteredModsForGrid.length > 0 ? (
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 gap-3">
                    {filteredModsForGrid.map(mod => {
                      const isHighlighted = activeHighlightedModId === mod.id;
                      const isEquipped = selectedModId === mod.id;
                      const isShapedOrEnhanced = mod.category === 'Shaped' || mod.category === 'Enhanced';
                      const isLocked = (
                        (mod.category === 'Enhanced' && !isEnhanced) ||
                        (mod.category === 'Shaped' && !isEnhanced && !isWeaponEligibleForModernMods)
                      );

                      let tileClasses = "border-slate-800/80 bg-slate-900/30 hover:border-slate-600/80 hover:bg-slate-900/50";
                      if (isHighlighted) {
                        tileClasses = "border-amber-500 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)] scale-105 border-2 z-10";
                      } else if (isEquipped) {
                        tileClasses = "border-sky-500 bg-sky-500/5 border-2 shadow-[0_0_6px_rgba(56,189,248,0.1)]";
                      } else if (isLocked) {
                        tileClasses = "border-slate-800 bg-slate-950/40 opacity-60 hover:opacity-100 hover:border-slate-800";
                      }

                      return (
                        <button
                          key={mod.id}
                          onClick={() => setTempSelectedModId(mod.id)}
                          title={mod.name}
                          className={`aspect-square w-full rounded-xl border flex items-center justify-center relative cursor-pointer active:scale-95 transition-all duration-150 ${tileClasses}`}
                        >
                          {mod.icon ? (
                            <img 
                              src={mod.icon} 
                              alt={mod.name} 
                              className={`w-8 h-8 rounded-lg bg-slate-950/80 p-0.5 object-contain ${isLocked ? 'grayscale opacity-70' : ''}`} 
                            />
                          ) : (
                            <Target className="w-5 h-5 text-slate-500" />
                          )}

                          {/* Top-right dot indicators */}
                          {isEquipped && !isHighlighted && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-sky-400 border border-slate-900" />
                          )}
                          {isHighlighted && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-slate-900 shadow-[0_0_4px_#f59e0b]" />
                          )}

                          {/* Locked shaped/enhanced mini lock badge */}
                          {isLocked && (
                            <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-slate-800 border border-slate-950 flex items-center justify-center text-[7px] text-slate-400 font-extrabold select-none">
                              🔒
                            </span>
                          )}
                          {/* Unlocked shaped/enhanced mini star badge */}
                          {isShapedOrEnhanced && !isLocked && (
                            <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-amber-500 border border-slate-950 flex items-center justify-center text-[8px] text-slate-900 font-extrabold select-none">
                              ✦
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-10 space-y-2">
                    <Target className="w-8 h-8 text-slate-600 animate-pulse" />
                    <p className="text-xs text-slate-500">No compatible weapon mods found matching your query.</p>
                  </div>
                )}
              </div>

              {/* Selected Mod Detail Pane */}
              {highlightedMod && (
                <div className="px-6 py-5 border-t border-slate-800 bg-[#090d16] flex flex-col gap-4 text-left">
                  
                  {/* Mod Title Info Block */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                      {highlightedMod.icon ? (
                        <img 
                          src={highlightedMod.icon} 
                          alt="" 
                          className={`w-9 h-9 rounded-xl bg-slate-950 object-contain ${isModLocked ? 'grayscale opacity-75' : ''}`} 
                        />
                      ) : (
                        <Target className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-100 font-display">
                          {highlightedMod.name}
                        </h4>
                        
                        {highlightedMod.category === 'Adept' && (
                          <span className="text-[8px] px-1 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded font-black uppercase tracking-wide">
                            Adept
                          </span>
                        )}
                        {highlightedMod.category === 'Artifact' && (
                          <span className="text-[8px] px-1 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded font-black uppercase tracking-wide">
                            Artifact
                          </span>
                        )}
                      </div>

                      {/* Subtitle with locked/unlocked validation indicator */}
                      {(highlightedMod.category === 'Shaped' || highlightedMod.category === 'Enhanced') ? (
                        <p className={`text-[10px] uppercase font-bold tracking-wider ${isModLocked ? 'text-amber-500/80 animate-pulse font-medium italic' : 'text-emerald-400 font-medium italic'}`}>
                          {isModLocked ? 'Requires Shaped or Enhanced Weapon' : '✦ Shaped / Enhanced Mod (Unlocked)'}
                        </p>
                      ) : (
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
                          {highlightedMod.category} Weapon Mod plug
                        </p>
                      )}

                      {/* Description */}
                      <p className="text-xs text-slate-400 leading-normal pt-1">
                        {highlightedMod.description || MOD_DESCRIPTIONS[highlightedMod.id] || 'Passive weapon modification. Modifies weapon stats or capabilities.'}
                      </p>
                    </div>
                  </div>

                  {/* Community Insight Box */}
                  {insight && (
                    <div className="p-3 bg-[#0d1322]/80 border-l-[3px] border-sky-400 rounded-r-xl space-y-1.5 text-[11px] leading-relaxed text-left">
                      <div className="flex items-center gap-1.5 text-sky-400 font-bold uppercase tracking-wider text-[8px] pb-1 border-b border-sky-900/30">
                        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>Community Insight</span>
                      </div>
                      <p className="text-slate-300 font-medium">{insight.stackBehavior}</p>
                      {insight.statBoosts && insight.statBoosts !== insight.stackBehavior && (
                        <p className="text-slate-400 text-[10px] mt-0.5">{insight.statBoosts}</p>
                      )}
                    </div>
                  )}

                  {/* Mod Investment Stats Deltas */}
                  {highlightedMod.investmentStats && highlightedMod.investmentStats.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {highlightedMod.investmentStats.map(stat => {
                        const meta = STAT_METADATA[stat.statHash];
                        if (!meta || stat.value === 0) return null;
                        return (
                          <span 
                            key={stat.statHash} 
                            className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded ${stat.value > 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}
                          >
                            {meta.name}: {stat.value > 0 ? `+${stat.value}` : stat.value}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800/80">
                    <div>
                      {selectedModId && (
                        <button
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('mod');
                            navigate(`?${newParams.toString()}`, { replace: true });
                            setIsModModalOpen(false);
                          }}
                          className="px-4 py-2 border border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold text-xs rounded-xl transition cursor-pointer active:scale-95"
                        >
                          Remove Equipped Mod
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsModModalOpen(false)}
                        className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95"
                      >
                        Cancel
                      </button>
                      
                      <button
                        disabled={isModLocked}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('mod', highlightedMod.id);
                          navigate(`?${newParams.toString()}`, { replace: true });
                          setIsModModalOpen(false);
                        }}
                        className={`px-5 py-2 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer ${
                          isModLocked 
                            ? 'bg-slate-800/50 border border-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                        }`}
                      >
                        Insert Mod
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        );
      })()}
    </div>
  );
}
