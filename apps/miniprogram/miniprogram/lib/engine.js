"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// build/engine.ts
var engine_exports = {};
__export(engine_exports, {
  BOARD_STEP_LOSS: () => BOARD_STEP_LOSS,
  DEFAULT_PALETTE_ID: () => DEFAULT_PALETTE_ID,
  EMPTY: () => EMPTY,
  PALETTES: () => PALETTES,
  PIXEL_ART: () => PIXEL_ART,
  adjustDetail: () => adjustDetail,
  backdropOf: () => backdropOf,
  beadCount: () => beadCount,
  chooseBoards: () => chooseBoards,
  countColors: () => countColors,
  deltaE2000: () => deltaE2000,
  despeckle: () => despeckle,
  detailLoss: () => detailLoss,
  downsampleLinear: () => downsampleLinear,
  estimate: () => estimate,
  generatePattern: () => generatePattern,
  getPalette: () => getPalette,
  gridLoss: () => gridLoss,
  kmeansLab: () => kmeansLab,
  labGrid: () => labGrid,
  linearRgbToLab: () => linearRgbToLab,
  linearToSrgb: () => linearToSrgb,
  looksLikeIllustration: () => looksLikeIllustration,
  mergeSimilarColors: () => mergeSimilarColors,
  mergeSmallRegions: () => mergeSmallRegions,
  nearestColor: () => nearestColor,
  packTotal: () => packTotal,
  pickPacks: () => pickPacks,
  recommendBoards: () => recommendBoards,
  regularColorIndices: () => regularColorIndices,
  removeBackdrop: () => removeBackdrop,
  rgbToLab: () => rgbToLab,
  sectionAt: () => sectionAt,
  sectionCellIndices: () => sectionCellIndices,
  splitSections: () => splitSections,
  srgbToLinear: () => srgbToLinear,
  subjectBox: () => subjectBox,
  withAllowance: () => withAllowance
});
module.exports = __toCommonJS(engine_exports);

// ../../packages/pattern-engine/palettes/perler.json
var perler_default = {
  _TODO: "Community-measured approximate colors, NOT official manufacturer values. Verify against physical beads from our actual supplier before launch. Bead weight is unknown: fill weightG per color once measured.",
  id: "perler",
  brand: "Perler",
  product: "Perler Beads (Midi, 5 mm)",
  beadSize: "5mm",
  status: "community",
  license: "MIT (maxcleme/beadcolors, Copyright (c) 2020 maxcleme)",
  attribution: "Color data: craft-color-codes by MakeBead (https://makebead.com); values from maxcleme/beadcolors (MIT)",
  sources: [
    {
      name: "maxcleme/beadcolors (MIT)",
      url: "https://github.com/maxcleme/beadcolors"
    }
  ],
  weightG: null,
  colors: [
    { code: "P01", name: "White", hex: "#EAEFEE", rgb: [234, 239, 238] },
    { code: "P02", name: "Creme", hex: "#E1E2BB", rgb: [225, 226, 187] },
    { code: "P03", name: "Yellow", hex: "#E7CE3E", rgb: [231, 206, 62] },
    { code: "P04", name: "Orange", hex: "#EB7B31", rgb: [235, 123, 49] },
    { code: "P05", name: "Red", hex: "#B0353C", rgb: [176, 53, 60] },
    { code: "P06", name: "Bubblegum", hex: "#D8729A", rgb: [216, 114, 154] },
    { code: "P07", name: "Purple", hex: "#684B86", rgb: [104, 75, 134] },
    { code: "P08", name: "Dark Blue", hex: "#0E5092", rgb: [14, 80, 146] },
    { code: "P09", name: "Light Blue", hex: "#278CC9", rgb: [39, 140, 201] },
    { code: "P10", name: "Dark Green", hex: "#007B4E", rgb: [0, 123, 78] },
    { code: "P11", name: "Light Green", hex: "#18C7B1", rgb: [24, 199, 177] },
    { code: "P12", name: "Brown", hex: "#674C44", rgb: [103, 76, 68] },
    { code: "P17", name: "Grey", hex: "#909497", rgb: [144, 148, 151] },
    { code: "P18", name: "Black", hex: "#323234", rgb: [50, 50, 52] },
    { code: "P20", name: "Rust", hex: "#995043", rgb: [153, 80, 67] },
    { code: "P21", name: "Light Brown", hex: "#936848", rgb: [147, 104, 72] },
    { code: "P33", name: "Peach", hex: "#E9BFB9", rgb: [233, 191, 185] },
    { code: "P35", name: "Tan", hex: "#C5AC90", rgb: [197, 172, 144] },
    { code: "P38", name: "Magenta", hex: "#E04284", rgb: [224, 66, 132] },
    { code: "P52", name: "Pastel Blue", hex: "#4A9CCF", rgb: [74, 156, 207] },
    { code: "P53", name: "Pastel Green", hex: "#6DCC94", rgb: [109, 204, 148] },
    { code: "P54", name: "Pastel Lavender", hex: "#937FBF", rgb: [147, 127, 191] },
    { code: "P56", name: "Pastel Yellow", hex: "#E9E290", rgb: [233, 226, 144] },
    { code: "P57", name: "Cheddar", hex: "#FBB146", rgb: [251, 177, 70] },
    { code: "P58", name: "Toothpaste", hex: "#96D1D4", rgb: [150, 209, 212] },
    { code: "P59", name: "Hot Coral", hex: "#DD595B", rgb: [221, 89, 91] },
    { code: "P60", name: "Plum", hex: "#A75D9D", rgb: [167, 93, 157] },
    { code: "P61", name: "Kiwi Lime", hex: "#69B845", rgb: [105, 184, 69] },
    { code: "P62", name: "Turquoise", hex: "#0098C5", rgb: [0, 152, 197] },
    { code: "P63", name: "Blush", hex: "#F99297", rgb: [249, 146, 151] },
    { code: "P70", name: "Periwinkle Blue", hex: "#6683B7", rgb: [102, 131, 183] },
    { code: "P79", name: "Light Pink", hex: "#E1BCCE", rgb: [225, 188, 206] },
    { code: "P80", name: "Green", hex: "#4DAB64", rgb: [77, 171, 100] },
    { code: "P83", name: "Pink", hex: "#D45496", rgb: [212, 84, 150] },
    { code: "P88", name: "Raspberry", hex: "#983864", rgb: [152, 56, 100] },
    { code: "P90", name: "Butterscotch", hex: "#DA9964", rgb: [218, 153, 100] },
    { code: "P91", name: "Parrot Green", hex: "#009188", rgb: [0, 145, 136] },
    { code: "P92", name: "Dark Grey", hex: "#585C61", rgb: [88, 92, 97] },
    { code: "P93", name: "Blueberry Creme", hex: "#85A8E3", rgb: [133, 168, 227] },
    { code: "P96", name: "Cranapple", hex: "#843947", rgb: [132, 57, 71] },
    { code: "P97", name: "Prickly Pear", hex: "#BBC938", rgb: [187, 201, 56] },
    { code: "P98", name: "Sand", hex: "#E5BE9E", rgb: [229, 190, 158] },
    { code: "C01", name: "Evergreen", hex: "#305545", rgb: [48, 85, 69] },
    { code: "C03", name: "Light Grey", hex: "#B3BAB8", rgb: [179, 186, 184] },
    { code: "C04", name: "Lavender", hex: "#AF9FCE", rgb: [175, 159, 206] },
    { code: "C05", name: "Shamrock", hex: "#008F53", rgb: [0, 143, 83] },
    { code: "C06", name: "Cobalt", hex: "#0065B1", rgb: [0, 101, 177] },
    { code: "C07", name: "Midnight", hex: "#2F3C55", rgb: [47, 60, 85] },
    { code: "C08", name: "Robin's Egg", hex: "#A9CDD5", rgb: [169, 205, 213] },
    { code: "C09", name: "Flamingo", hex: "#F2AFB7", rgb: [242, 175, 183] },
    { code: "C10", name: "Salmon", hex: "#E1747A", rgb: [225, 116, 122] },
    { code: "C11", name: "Fawn", hex: "#C9A385", rgb: [201, 163, 133] },
    { code: "C12", name: "Pewter", hex: "#94A19D", rgb: [148, 161, 157] },
    { code: "C13", name: "Charcoal", hex: "#4F595A", rgb: [79, 89, 90] },
    { code: "C14", name: "Toasted Marshmallow", hex: "#DEDACE", rgb: [222, 218, 206] },
    { code: "C16", name: "Orchid", hex: "#B1628E", rgb: [177, 98, 142] },
    { code: "C17", name: "Tomato", hex: "#D14337", rgb: [209, 67, 55] },
    { code: "C18", name: "Spice", hex: "#D9593A", rgb: [217, 89, 58] },
    { code: "C19", name: "Apricot", hex: "#F5A168", rgb: [245, 161, 104] },
    { code: "C20", name: "Sherbet", hex: "#D8E47C", rgb: [216, 228, 124] },
    { code: "C21", name: "Mist", hex: "#93B0BD", rgb: [147, 176, 189] },
    { code: "C22", name: "Sky", hex: "#4AC0D8", rgb: [74, 192, 216] },
    { code: "C23", name: "Lagoon", hex: "#00A4AC", rgb: [0, 164, 172] },
    { code: "C24", name: "Teal", hex: "#047F8A", rgb: [4, 127, 138] },
    { code: "C25", name: "Fern", hex: "#7F971A", rgb: [127, 151, 26] },
    { code: "C26", name: "Olive", hex: "#696E31", rgb: [105, 110, 49] },
    { code: "C40", name: "Mint", hex: "#B3EED5", rgb: [179, 238, 213] },
    { code: "C41", name: "Sour Apple", hex: "#A3DE6F", rgb: [163, 222, 111] },
    { code: "C42", name: "Cotton Candy", hex: "#F479B0", rgb: [244, 121, 176] },
    { code: "C43", name: "Grape", hex: "#503B9C", rgb: [80, 59, 156] },
    { code: "C44", name: "Rose", hex: "#D25D72", rgb: [210, 93, 114] },
    { code: "C45", name: "Iris", hex: "#4E56A3", rgb: [78, 86, 163] },
    { code: "C46", name: "Tangerine", hex: "#FD5918", rgb: [253, 89, 24] },
    { code: "C47", name: "Forest", hex: "#005D57", rgb: [0, 93, 87] },
    { code: "C48", name: "Eggplant", hex: "#6F3255", rgb: [111, 50, 85] },
    { code: "C49", name: "Honey", hex: "#DA8C2C", rgb: [218, 140, 44] },
    { code: "C50", name: "Gingerbread", hex: "#7E5446", rgb: [126, 84, 70] },
    { code: "C51", name: "Thistle", hex: "#8C8CA7", rgb: [140, 140, 167] },
    { code: "C52", name: "Slate Blue", hex: "#5E6D7B", rgb: [94, 109, 123] },
    { code: "C53", name: "Denim", hex: "#4C6388", rgb: [76, 99, 136] },
    { code: "C54", name: "Sage", hex: "#9AA98E", rgb: [154, 169, 142] },
    { code: "C55", name: "Orange Cream", hex: "#EFB79B", rgb: [239, 183, 155] },
    { code: "C56", name: "Fruit Punch", hex: "#CA3B65", rgb: [202, 59, 101] },
    { code: "C57", name: "Fuchsia", hex: "#CB59B9", rgb: [203, 89, 185] },
    { code: "C58", name: "Mulberry", hex: "#714875", rgb: [113, 72, 117] },
    { code: "C59", name: "Slime", hex: "#C8C85C", rgb: [200, 200, 92] },
    { code: "C60", name: "Stone", hex: "#988C8C", rgb: [152, 140, 140] },
    { code: "C61", name: "Dark Spruce", hex: "#14313B", rgb: [20, 49, 59] },
    { code: "C62", name: "Cocoa", hex: "#392928", rgb: [57, 41, 40] },
    { code: "C65", name: "Twilight Plum", hex: "#C685B1", rgb: [198, 133, 177] },
    { code: "C66", name: "Caribbean Sea", hex: "#6CC8AD", rgb: [108, 200, 173] },
    { code: "C67", name: "Frosted Lilac", hex: "#CDB7C3", rgb: [205, 183, 195] },
    { code: "C73", name: "Brick", hex: "#FC9574", rgb: [252, 149, 116] },
    { code: "C74", name: "Rich Butter", hex: "#F6CA69", rgb: [246, 202, 105] },
    { code: "C75", name: "Peacock", hex: "#0090AC", rgb: [0, 144, 172] },
    { code: "C76", name: "Carnation Pink", hex: "#F8C7C9", rgb: [248, 199, 201] },
    { code: "C77", name: "Cherry", hex: "#9D2B3A", rgb: [157, 43, 58] },
    { code: "N01", name: "Neon Blue", hex: "#406AE1", rgb: [64, 106, 225], specialty: "neon" },
    { code: "C68", name: "Sunflower", hex: "#DEBA0B", rgb: [222, 186, 11] },
    { code: "C69", name: "Lemon", hex: "#F6D901", rgb: [246, 217, 1] },
    { code: "C63", name: "Celery", hex: "#BED4A6", rgb: [190, 212, 166] },
    { code: "C39", name: "Mocha", hex: "#C8B693", rgb: [200, 182, 147] },
    { code: "C72", name: "Coral", hex: "#FF9A8B", rgb: [255, 154, 139] }
  ]
};

// ../../packages/pattern-engine/palettes/artkal-s.json
var artkal_s_default = {
  _TODO: "Community-measured approximate colors, NOT official manufacturer values. Verify against physical beads from our actual supplier before launch. Bead weight is unknown: fill weightG per color once measured.",
  id: "artkal-s",
  brand: "Artkal",
  product: "Artkal S series (Midi, 5 mm)",
  beadSize: "5mm",
  status: "community",
  license: "MIT (maxcleme/beadcolors, Copyright (c) 2020 maxcleme)",
  attribution: "Color data: craft-color-codes by MakeBead (https://makebead.com); values from maxcleme/beadcolors (MIT)",
  sources: [
    {
      name: "maxcleme/beadcolors (MIT)",
      url: "https://github.com/maxcleme/beadcolors"
    }
  ],
  weightG: null,
  colors: [
    { code: "S01", name: "White", hex: "#EAEEF3", rgb: [234, 238, 243] },
    { code: "S02", name: "Burning Sand", hex: "#EE927C", rgb: [238, 146, 124] },
    { code: "S03", name: "Tangerine", hex: "#FFA630", rgb: [255, 166, 48] },
    { code: "S04", name: "Orange", hex: "#EB6027", rgb: [235, 96, 39] },
    { code: "S05", name: "Tall Poppy", hex: "#CB3531", rgb: [203, 53, 49] },
    { code: "S06", name: "Raspberry Pink", hex: "#EF67B2", rgb: [239, 103, 178] },
    { code: "S07", name: "Gray", hex: "#959698", rgb: [149, 150, 152] },
    { code: "S08", name: "Emerald", hex: "#1FC467", rgb: [31, 196, 103] },
    { code: "S09", name: "Dark Green", hex: "#00685E", rgb: [0, 104, 94] },
    { code: "S10", name: "Baby Blue", hex: "#2EABD8", rgb: [46, 171, 216] },
    { code: "S11", name: "Dark Blue", hex: "#004FA4", rgb: [0, 79, 164] },
    { code: "S12", name: "Pastel Lavender", hex: "#9165B2", rgb: [145, 101, 178] },
    { code: "S13", name: "Black", hex: "#292A2B", rgb: [41, 42, 43] },
    { code: "S14", name: "Sandstorm", hex: "#E1C835", rgb: [225, 200, 53] },
    { code: "S15", name: "Redwood", hex: "#9A4541", rgb: [154, 69, 65] },
    { code: "S16", name: "Brown", hex: "#65463D", rgb: [101, 70, 61] },
    { code: "S17", name: "Light Brown", hex: "#895D49", rgb: [137, 93, 73] },
    { code: "S18", name: "Sand", hex: "#DCA384", rgb: [220, 163, 132] },
    { code: "S19", name: "Bubble Gun", hex: "#F2BFB8", rgb: [242, 191, 184] },
    { code: "S20", name: "Green", hex: "#009053", rgb: [0, 144, 83] },
    { code: "S21", name: "Pastel Green", hex: "#8BB23A", rgb: [139, 178, 58] },
    { code: "S22", name: "Purple", hex: "#48337E", rgb: [72, 51, 126] },
    { code: "S23", name: "Royal Purple", hex: "#644FA4", rgb: [100, 79, 164] },
    { code: "S24", name: "True Blue", hex: "#0078BF", rgb: [0, 120, 191] },
    { code: "S25", name: "Hot Pink", hex: "#DC519A", rgb: [220, 81, 154] },
    { code: "S26", name: "Magenta", hex: "#DA4383", rgb: [218, 67, 131] },
    { code: "S27", name: "Yellow", hex: "#EAC125", rgb: [234, 193, 37] },
    { code: "S28", name: "Lily Pink", hex: "#DDA1CC", rgb: [221, 161, 204] },
    { code: "S29", name: "Pastel Yellow", hex: "#E1D367", rgb: [225, 211, 103] },
    { code: "S30", name: "Shadow Green", hex: "#9EC9CD", rgb: [158, 201, 205] },
    { code: "S31", name: "Sea Mist", hex: "#B2D7CE", rgb: [178, 215, 206] },
    { code: "S32", name: "Beeswax", hex: "#EED39E", rgb: [238, 211, 158] },
    { code: "S33", name: "Maverick", hex: "#C0B7D7", rgb: [192, 183, 215] },
    { code: "S34", name: "Red", hex: "#B61927", rgb: [182, 25, 39] },
    { code: "S35", name: "Mona Lisa", hex: "#E1CCD2", rgb: [225, 204, 210] },
    { code: "S36", name: "Old Pink", hex: "#CE6D83", rgb: [206, 109, 131] },
    { code: "S37", name: "Blue-Green", hex: "#60BFCB", rgb: [96, 191, 203] },
    { code: "S38", name: "Burgundy", hex: "#A3134A", rgb: [163, 19, 74] },
    { code: "S39", name: "Yellow Orange", hex: "#E68739", rgb: [230, 135, 57] },
    { code: "S40", name: "Carnation Pink", hex: "#E182B0", rgb: [225, 130, 176] },
    { code: "S41", name: "Copper", hex: "#9D5B2E", rgb: [157, 91, 46] },
    { code: "S42", name: "Silver", hex: "#676B73", rgb: [103, 107, 115] },
    { code: "S43", name: "Dark Gray", hex: "#70757B", rgb: [112, 117, 123] },
    { code: "S44", name: "Sky Blue", hex: "#A7CDDE", rgb: [167, 205, 222] },
    { code: "S45", name: "Medium Turquoise", hex: "#00A5A1", rgb: [0, 165, 161] },
    { code: "S46", name: "Bright Green", hex: "#8EC324", rgb: [142, 195, 36] },
    { code: "S47", name: "Marigold", hex: "#B27938", rgb: [178, 121, 56] },
    { code: "S48", name: "Corn", hex: "#ECC03D", rgb: [236, 192, 61] },
    { code: "S49", name: "Mulberry Wood", hex: "#921E5D", rgb: [146, 30, 93] },
    { code: "S50", name: "Mandys Pink", hex: "#E2A488", rgb: [226, 164, 136] },
    { code: "S51", name: "Spring Sun", hex: "#DFDABD", rgb: [223, 218, 189] },
    { code: "S52", name: "Picasso", hex: "#EADE7F", rgb: [234, 222, 127] },
    { code: "S53", name: "Turquoise", hex: "#55A4D9", rgb: [85, 164, 217] },
    { code: "S54", name: "Light Blue", hex: "#0084CE", rgb: [0, 132, 206] },
    { code: "S55", name: "Pistachio", hex: "#97CF87", rgb: [151, 207, 135] },
    { code: "S56", name: "Bright Carrot", hex: "#F96F40", rgb: [249, 111, 64] },
    { code: "S57", name: "Buccaneer", hex: "#B35540", rgb: [179, 85, 64] },
    { code: "S58", name: "Paprika", hex: "#B11836", rgb: [177, 24, 54] },
    { code: "S59", name: "Butterfly Bush", hex: "#4F3989", rgb: [79, 57, 137] },
    { code: "S60", name: "Lavender", hex: "#8A7EC2", rgb: [138, 126, 194] },
    { code: "S61", name: "Key Lomen Pie", hex: "#CDC03F", rgb: [205, 192, 63] },
    { code: "S62", name: "Green Tea", hex: "#00765F", rgb: [0, 118, 95] },
    { code: "S63", name: "Metallic Gold", hex: "#696046", rgb: [105, 96, 70], specialty: "metallic" },
    { code: "S64", name: "Black Rock", hex: "#36384D", rgb: [54, 56, 77] },
    { code: "S65", name: "Canary", hex: "#E2E65D", rgb: [226, 230, 93] },
    { code: "S66", name: "Blaze Orange", hex: "#E5533C", rgb: [229, 83, 60] },
    { code: "S67", name: "Vanilla", hex: "#E9C1A6", rgb: [233, 193, 166] },
    { code: "S68", name: "Tan", hex: "#CC9B74", rgb: [204, 155, 116] },
    { code: "S69", name: "Mine Shaft", hex: "#383E44", rgb: [56, 62, 68] },
    { code: "S70", name: "Drark Algae", hex: "#ADAD29", rgb: [173, 173, 41] },
    { code: "S71", name: "Jade Green", hex: "#007D2B", rgb: [0, 125, 43] },
    { code: "S72", name: "Light Sea Blue", hex: "#68C4D2", rgb: [104, 196, 210] },
    { code: "S73", name: "Steel Blue", hex: "#5AB0BF", rgb: [90, 176, 191] },
    { code: "S74", name: "Azure", hex: "#009EC2", rgb: [0, 158, 194] },
    { code: "S75", name: "Dark Steel Blue", hex: "#0084B2", rgb: [0, 132, 178] },
    { code: "S76", name: "Sea Blue", hex: "#0093A9", rgb: [0, 147, 169] },
    { code: "S77", name: "Ghost While", hex: "#D4D8D3", rgb: [212, 216, 211] },
    { code: "S78", name: "Ash Grey", hex: "#C2C4C2", rgb: [194, 196, 194] },
    { code: "S79", name: "Light Gray", hex: "#A7ACAD", rgb: [167, 172, 173] },
    { code: "S80", name: "Dark Olive", hex: "#8F8E3C", rgb: [143, 142, 60] },
    { code: "S81", name: "Deer", hex: "#BF9168", rgb: [191, 145, 104] },
    { code: "S82", name: "Clay", hex: "#AA744E", rgb: [170, 116, 78] },
    { code: "S83", name: "Sienna", hex: "#BB6833", rgb: [187, 104, 51] },
    { code: "S84", name: "Deep Chestnut", hex: "#BE5D65", rgb: [190, 93, 101] },
    { code: "S85", name: "Red Wine", hex: "#99323A", rgb: [153, 50, 58] },
    { code: "S86", name: "Goldenrod", hex: "#E8AE00", rgb: [232, 174, 0] },
    { code: "S87", name: "Coral Red", hex: "#EC625E", rgb: [236, 98, 94] },
    { code: "S88", name: "Dark Pink", hex: "#D62779", rgb: [214, 39, 121] },
    { code: "S89", name: "Charcoal Gray", hex: "#565A5E", rgb: [86, 90, 94] },
    { code: "S90", name: "Pastel Orange", hex: "#D9B35E", rgb: [217, 179, 94] },
    { code: "S91", name: "Brunswick Green", hex: "#153838", rgb: [21, 56, 56] },
    { code: "S92", name: "Dandelion", hex: "#CEA433", rgb: [206, 164, 51] },
    { code: "S93", name: "Pale Skin", hex: "#DCB794", rgb: [220, 183, 148] },
    { code: "S94", name: "Warm Blush", hex: "#DD9285", rgb: [221, 146, 133] },
    { code: "S95", name: "Salmon", hex: "#E07B69", rgb: [224, 123, 105] },
    { code: "S96", name: "Apricot", hex: "#EF7F61", rgb: [239, 127, 97] },
    { code: "S97", name: "Papaya", hex: "#DC772B", rgb: [220, 119, 43] },
    { code: "S98", name: "Himalaya Blue", hex: "#6AAEDB", rgb: [106, 174, 219] },
    { code: "S99", name: "Waterfall", hex: "#61BBD3", rgb: [97, 187, 211] },
    { code: "S100", name: "Lagoon", hex: "#279BBE", rgb: [39, 155, 190] },
    { code: "S101", name: "Electric Blue", hex: "#00A7E3", rgb: [0, 167, 227] },
    { code: "S102", name: "Pool Blue", hex: "#0077CA", rgb: [0, 119, 202] },
    { code: "S103", name: "Caribbian Blue", hex: "#005AA9", rgb: [0, 90, 169] },
    { code: "S104", name: "Deep Water", hex: "#007F9E", rgb: [0, 127, 158] },
    { code: "S105", name: "Petrol Blue", hex: "#007D91", rgb: [0, 125, 145] },
    { code: "S106", name: "Wegdewood Blue", hex: "#00649A", rgb: [0, 100, 154] },
    { code: "S107", name: "Pond Blue", hex: "#006C9F", rgb: [0, 108, 159] },
    { code: "S108", name: "Seashell Beige", hex: "#CFC179", rgb: [207, 193, 121] },
    { code: "S109", name: "Beige", hex: "#C4AE64", rgb: [196, 174, 100] },
    { code: "S110", name: "Beach Beige", hex: "#AB9745", rgb: [171, 151, 69] },
    { code: "S111", name: "Caffe Latt\xE9", hex: "#978138", rgb: [151, 129, 56] },
    { code: "S112", name: "Oaktree Brown", hex: "#907C41", rgb: [144, 124, 65] },
    { code: "S113", name: "Khaki", hex: "#B6AE84", rgb: [182, 174, 132] },
    { code: "S114", name: "Light Greengray", hex: "#A59F65", rgb: [165, 159, 101] },
    { code: "S115", name: "Mossy Green", hex: "#938D54", rgb: [147, 141, 84] },
    { code: "S116", name: "Earth Green", hex: "#8D8B51", rgb: [141, 139, 81] },
    { code: "S117", name: "Sage Green", hex: "#7F7E49", rgb: [127, 126, 73] },
    { code: "S118", name: "Pinetree Green", hex: "#5B6E35", rgb: [91, 110, 53] },
    { code: "S119", name: "Frosty Blue", hex: "#8AD5C9", rgb: [138, 213, 201] },
    { code: "S120", name: "Polar Mint", hex: "#7CD2A5", rgb: [124, 210, 165] },
    { code: "S121", name: "Celadon Green", hex: "#72AC9A", rgb: [114, 172, 154] },
    { code: "S122", name: "Eucalyptus", hex: "#00B26F", rgb: [0, 178, 111] },
    { code: "S123", name: "Clover Field", hex: "#3EB724", rgb: [62, 183, 36] },
    { code: "S124", name: "Pooltable Felt", hex: "#0D7535", rgb: [13, 117, 53] },
    { code: "S125", name: "Snake Green", hex: "#007D6E", rgb: [0, 125, 110] },
    { code: "S126", name: "Dark Eucalyptus", hex: "#006E69", rgb: [0, 110, 105] },
    { code: "S127", name: "Marsmallow Rose", hex: "#DFC3E1", rgb: [223, 195, 225] },
    { code: "S128", name: "Light Grape", hex: "#D38ED4", rgb: [211, 142, 212] },
    { code: "S129", name: "Rosebud Pink", hex: "#D5A6BA", rgb: [213, 166, 186] },
    { code: "S130", name: "Fuschia", hex: "#D6668E", rgb: [214, 102, 142] },
    { code: "S131", name: "Candy Violet", hex: "#B8AAD9", rgb: [184, 170, 217] },
    { code: "S132", name: "Flamingo", hex: "#DF486D", rgb: [223, 72, 109] },
    { code: "S133", name: "Pink Plum", hex: "#BC3CA6", rgb: [188, 60, 166] },
    { code: "S134", name: "Amethyst", hex: "#803897", rgb: [128, 56, 151] },
    { code: "S135", name: "Moonlight Blue", hex: "#A7BAE1", rgb: [167, 186, 225] },
    { code: "S136", name: "Summer Rain", hex: "#AFB8DF", rgb: [175, 184, 223] },
    { code: "S137", name: "Azur Blue", hex: "#6B9AD4", rgb: [107, 154, 212] },
    { code: "S138", name: "Cornflower Blue", hex: "#5A89CE", rgb: [90, 137, 206] },
    { code: "S139", name: "Forget Me Not", hex: "#658AD0", rgb: [101, 138, 208] },
    { code: "S140", name: "Indigo", hex: "#566CBD", rgb: [86, 108, 189] },
    { code: "S141", name: "Horizon Blue", hex: "#4D74C6", rgb: [77, 116, 198] },
    { code: "S142", name: "Cobolt", hex: "#416DBE", rgb: [65, 109, 190] },
    { code: "S143", name: "Royal Blue", hex: "#30429E", rgb: [48, 66, 158] },
    { code: "S144", name: "Marine", hex: "#024288", rgb: [2, 66, 136] },
    { code: "S145", name: "Pale Yellow Moss", hex: "#D6CA6A", rgb: [214, 202, 106] },
    { code: "S146", name: "Bloodrose Red", hex: "#9D1A38", rgb: [157, 26, 56] },
    { code: "S147", name: "Spearmint", hex: "#80B7A1", rgb: [128, 183, 161] },
    { code: "S148", name: "Mocha", hex: "#7A594F", rgb: [122, 89, 79] },
    { code: "S149", name: "Creme", hex: "#EFDBA1", rgb: [239, 219, 161] },
    { code: "S150", name: "Iris Violet", hex: "#8884D0", rgb: [136, 132, 208] },
    { code: "S151", name: "Forrest Green", hex: "#345621", rgb: [52, 86, 33] },
    { code: "S152", name: "Lilac", hex: "#AEADDC", rgb: [174, 173, 220] },
    { code: "S153", name: "Pale Lilac", hex: "#BCC3E1", rgb: [188, 195, 225] },
    { code: "S154", name: "Sahara Sand", hex: "#E3C09A", rgb: [227, 192, 154] },
    { code: "S155", name: "Sunkissed Teint", hex: "#C58B60", rgb: [197, 139, 96] },
    { code: "S156", name: "Steel Grey", hex: "#5A5F65", rgb: [90, 95, 101] },
    { code: "S157", name: "Iron Grey", hex: "#4C5156", rgb: [76, 81, 86] },
    { code: "S158", name: "Pepper", hex: "#3A3E42", rgb: [58, 62, 66] },
    { code: "S159", name: "Oslo Gray", hex: "#82878B", rgb: [130, 135, 139] },
    { code: "SE1", name: "Moon", hex: "#F1F4FA", rgb: [241, 244, 250] },
    { code: "SE2", name: "Raincloud", hex: "#A2B2D3", rgb: [162, 178, 211] },
    { code: "SE3", name: "Winter", hex: "#83A6DC", rgb: [131, 166, 220] },
    { code: "SE4", name: "Tide", hex: "#70D8ED", rgb: [112, 216, 237] },
    { code: "SE5", name: "Aquamarine", hex: "#69E3D5", rgb: [105, 227, 213] },
    { code: "SE6", name: "Neptune", hex: "#2A63C8", rgb: [42, 99, 200] },
    { code: "SE7", name: "Rose Quartz", hex: "#D5AEC9", rgb: [213, 174, 201] },
    { code: "SE8", name: "Mauve", hex: "#AF739A", rgb: [175, 115, 154] },
    { code: "SE9", name: "Dark Mauve", hex: "#704B6D", rgb: [112, 75, 109] },
    { code: "SE10", name: "Wild Berry", hex: "#D977CD", rgb: [217, 119, 205] },
    { code: "SE11", name: "Sugar Plum", hex: "#B643AC", rgb: [182, 67, 172] },
    { code: "SE12", name: "Desert", hex: "#DEB181", rgb: [222, 177, 129] },
    { code: "SE13", name: "Peanut", hex: "#BC9D77", rgb: [188, 157, 119] },
    { code: "SE14", name: "Toffee", hex: "#AC7F5D", rgb: [172, 127, 93] },
    { code: "SE15", name: "Bark", hex: "#A37E66", rgb: [163, 126, 102] },
    { code: "SG1", name: "Glow Yellow", hex: "#C6C0B4", rgb: [198, 192, 180], specialty: "glow" },
    { code: "SG2", name: "Glow Pink", hex: "#DFABBC", rgb: [223, 171, 188], specialty: "glow" },
    { code: "SG3", name: "Glow Blue", hex: "#6FADC1", rgb: [111, 173, 193], specialty: "glow" },
    { code: "SL1", name: "Glitter Blue", hex: "#3687B2", rgb: [54, 135, 178], specialty: "glitter" },
    { code: "SL2", name: "Glitter Green", hex: "#117C52", rgb: [17, 124, 82], specialty: "glitter" },
    { code: "SL3", name: "Glitter Red", hex: "#C22933", rgb: [194, 41, 51], specialty: "glitter" },
    { code: "SL4", name: "Glitter Yellow", hex: "#CDBD00", rgb: [205, 189, 0], specialty: "glitter" },
    { code: "SN1", name: "Neon Orange", hex: "#FF7405", rgb: [255, 116, 5], specialty: "neon" },
    { code: "SN2", name: "Neon Green", hex: "#01C63E", rgb: [1, 198, 62], specialty: "neon" },
    { code: "SN3", name: "Neon Yellow", hex: "#F2F33C", rgb: [242, 243, 60], specialty: "neon" },
    { code: "SN4", name: "Neon Rose", hex: "#FF477A", rgb: [255, 71, 122], specialty: "neon" },
    { code: "SP1", name: "Pearlescent Green", hex: "#93CA87", rgb: [147, 202, 135], specialty: "pearl" },
    { code: "SP2", name: "Pearlescent Tangerine", hex: "#FE7F54", rgb: [254, 127, 84], specialty: "pearl" },
    { code: "SP3", name: "Pearlescent Orange", hex: "#F0A149", rgb: [240, 161, 73], specialty: "pearl" },
    { code: "SP4", name: "Pearlescent Pink", hex: "#DC9EA9", rgb: [220, 158, 169], specialty: "pearl" },
    { code: "SP5", name: "Pearlescent Red", hex: "#D63C53", rgb: [214, 60, 83], specialty: "pearl" },
    { code: "SP6", name: "Pearlescent Blue", hex: "#2C4E97", rgb: [44, 78, 151], specialty: "pearl" },
    { code: "SP7", name: "Pearlescent Purple", hex: "#64427E", rgb: [100, 66, 126], specialty: "pearl" },
    { code: "SP8", name: "Pearlescent White", hex: "#E0DBCA", rgb: [224, 219, 202], specialty: "pearl" },
    { code: "ST1", name: "Transparent", hex: "#C7BCB8", rgb: [199, 188, 184], specialty: "transparent" },
    { code: "ST2", name: "Transparent Pink", hex: "#F95498", rgb: [249, 84, 152], specialty: "transparent" },
    { code: "ST3", name: "Transparent Tangering", hex: "#FF7C45", rgb: [255, 124, 69], specialty: "transparent" },
    { code: "ST4", name: "Transparent Yellow", hex: "#DADF3D", rgb: [218, 223, 61], specialty: "transparent" },
    { code: "ST5", name: "Transparent Green", hex: "#0FAE58", rgb: [15, 174, 88], specialty: "transparent" },
    { code: "ST6", name: "Transparent Purple", hex: "#8477B3", rgb: [132, 119, 179], specialty: "transparent" }
  ]
};

// ../../packages/pattern-engine/palettes/hama.json
var hama_default = {
  _TODO: "Community-measured approximate colors, NOT official manufacturer values. Verify against physical beads from our actual supplier before launch. Bead weight is unknown: fill weightG per color once measured.",
  id: "hama",
  brand: "Hama",
  product: "Hama Beads (Midi, 5 mm)",
  beadSize: "5mm",
  status: "community",
  license: "MIT (maxcleme/beadcolors, Copyright (c) 2020 maxcleme)",
  attribution: "Color data: craft-color-codes by MakeBead (https://makebead.com); values from maxcleme/beadcolors (MIT)",
  sources: [
    {
      name: "maxcleme/beadcolors (MIT)",
      url: "https://github.com/maxcleme/beadcolors"
    }
  ],
  weightG: null,
  colors: [
    { code: "H01", name: "White", hex: "#E5ECF1", rgb: [229, 236, 241] },
    { code: "H02", name: "Cream", hex: "#E4E4C5", rgb: [228, 228, 197] },
    { code: "H03", name: "Yellow", hex: "#E9C704", rgb: [233, 199, 4] },
    { code: "H04", name: "Orange", hex: "#D14803", rgb: [209, 72, 3] },
    { code: "H05", name: "Red", hex: "#B4060E", rgb: [180, 6, 14] },
    { code: "H06", name: "Pink", hex: "#EA8AA5", rgb: [234, 138, 165] },
    { code: "H07", name: "Purple", hex: "#712297", rgb: [113, 34, 151] },
    { code: "H08", name: "Blue", hex: "#0239A3", rgb: [2, 57, 163] },
    { code: "H09", name: "Light Blue", hex: "#025BC3", rgb: [2, 91, 195] },
    { code: "H10", name: "Green", hex: "#027643", rgb: [2, 118, 67] },
    { code: "H11", name: "Light Green", hex: "#19CDA7", rgb: [25, 205, 167] },
    { code: "H12", name: "Brown", hex: "#3E271A", rgb: [62, 39, 26] },
    { code: "H13", name: "Transparent Red", hex: "#C02435", rgb: [192, 36, 53], specialty: "transparent" },
    { code: "H14", name: "Transparent Yellow", hex: "#E4AA32", rgb: [228, 170, 50], specialty: "transparent" },
    { code: "H16", name: "Transparent Green", hex: "#37B876", rgb: [55, 184, 118], specialty: "transparent" },
    { code: "H17", name: "Grey", hex: "#838F98", rgb: [131, 143, 152] },
    { code: "H18", name: "Black", hex: "#141315", rgb: [20, 19, 21] },
    { code: "H19", name: "Clear", hex: "#D8D2CE", rgb: [216, 210, 206] },
    { code: "H20", name: "Reddish Brown", hex: "#8D2A0F", rgb: [141, 42, 15] },
    { code: "H21", name: "Light Brown", hex: "#BE6C21", rgb: [190, 108, 33] },
    { code: "H22", name: "Dark Red", hex: "#91020A", rgb: [145, 2, 10] },
    { code: "H24", name: "Translucent Purple", hex: "#683E9A", rgb: [104, 62, 154], specialty: "transparent" },
    { code: "H25", name: "Translucent Brown", hex: "#87593D", rgb: [135, 89, 61], specialty: "transparent" },
    { code: "H26", name: "Matt Rose", hex: "#E8A498", rgb: [232, 164, 152] },
    { code: "H27", name: "Beige", hex: "#DCB18E", rgb: [220, 177, 142] },
    { code: "H28", name: "Dark Green", hex: "#1E2C1C", rgb: [30, 44, 28] },
    { code: "H29", name: "Claret", hex: "#BF0142", rgb: [191, 1, 66] },
    { code: "H30", name: "Burgundy", hex: "#4E0C1B", rgb: [78, 12, 27] },
    { code: "H31", name: "Turquoise", hex: "#489AB9", rgb: [72, 154, 185] },
    { code: "H32", name: "Neon Fuchsia", hex: "#FF208D", rgb: [255, 32, 141], specialty: "neon" },
    { code: "H33", name: "Cerise", hex: "#FF3956", rgb: [255, 57, 86] },
    { code: "H34", name: "Neon Yellow", hex: "#E5EF13", rgb: [229, 239, 19], specialty: "neon" },
    { code: "H35", name: "Neon Red", hex: "#FF2833", rgb: [255, 40, 51], specialty: "neon" },
    { code: "H36", name: "Neon Blue", hex: "#2353B0", rgb: [35, 83, 176], specialty: "neon" },
    { code: "H37", name: "Neon Green", hex: "#06B73C", rgb: [6, 183, 60], specialty: "neon" },
    { code: "H38", name: "Neon Orange", hex: "#FD8600", rgb: [253, 134, 0], specialty: "neon" },
    { code: "H39", name: "Fluorescent Yellow", hex: "#F1F21C", rgb: [241, 242, 28] },
    { code: "H40", name: "Fluorescent Orange", hex: "#FE630B", rgb: [254, 99, 11] },
    { code: "H41", name: "Fluorescent Blue", hex: "#2659B2", rgb: [38, 89, 178] },
    { code: "H42", name: "Fluorescent Green", hex: "#0CBD51", rgb: [12, 189, 81] },
    { code: "H43", name: "Pastel Yellow", hex: "#E7E45A", rgb: [231, 228, 90] },
    { code: "H44", name: "Pastel Red", hex: "#F96160", rgb: [249, 97, 96] },
    { code: "H45", name: "Pastel Purple", hex: "#8E69CD", rgb: [142, 105, 205] },
    { code: "H46", name: "Pastel Blue", hex: "#51AEE4", rgb: [81, 174, 228] },
    { code: "H47", name: "Pastel Green", hex: "#80DF96", rgb: [128, 223, 150] },
    { code: "H48", name: "Pastel Pink", hex: "#D67AD1", rgb: [214, 122, 209] },
    { code: "H49", name: "Azure", hex: "#0FACD1", rgb: [15, 172, 209] },
    { code: "H60", name: "Teddybear Brown", hex: "#F0981E", rgb: [240, 152, 30] },
    { code: "H70", name: "Light Grey", hex: "#A5B3C0", rgb: [165, 179, 192] },
    { code: "H71", name: "Dark Grey", hex: "#445059", rgb: [68, 80, 89] },
    { code: "H75", name: "Tan", hex: "#B78C6D", rgb: [183, 140, 109] },
    { code: "H76", name: "Nougat", hex: "#8A5937", rgb: [138, 89, 55] },
    { code: "H77", name: "Cloudy White", hex: "#CED1C8", rgb: [206, 209, 200] },
    { code: "H78", name: "Light Peach", hex: "#F7C1AA", rgb: [247, 193, 170] },
    { code: "H79", name: "Apricot", hex: "#F87633", rgb: [248, 118, 51] },
    { code: "H82", name: "Plum", hex: "#91175A", rgb: [145, 23, 90] },
    { code: "H83", name: "Petrol Blue", hex: "#037A9F", rgb: [3, 122, 159] },
    { code: "H84", name: "Olive Green", hex: "#687836", rgb: [104, 120, 54] },
    { code: "H95", name: "Pastel Rose", hex: "#DD9BA3", rgb: [221, 155, 163] },
    { code: "H96", name: "Pastel Lilac", hex: "#B491AD", rgb: [180, 145, 173] },
    { code: "H97", name: "Pastel Ice Blue", hex: "#8AAFC2", rgb: [138, 175, 194] },
    { code: "H98", name: "Pastel Mint", hex: "#94CCA4", rgb: [148, 204, 164] },
    { code: "H15", name: "Transparent Blue", hex: "#487ED5", rgb: [72, 126, 213], specialty: "transparent" },
    { code: "H55", name: "Green (Glow in the Dark)", hex: "#FAF8ED", rgb: [250, 248, 237], specialty: "glow" },
    { code: "H56", name: "Red (Glow in the Dark)", hex: "#EDBF9F", rgb: [237, 191, 159], specialty: "glow" },
    { code: "H57", name: "Blue (Glow in the Dark)", hex: "#C4D0E3", rgb: [196, 208, 227], specialty: "glow" },
    { code: "H61", name: "Gold", hex: "#D99350", rgb: [217, 147, 80] },
    { code: "H62", name: "Silver", hex: "#48474A", rgb: [72, 71, 74] },
    { code: "H63", name: "Bronze", hex: "#42312F", rgb: [66, 49, 47] },
    { code: "H64", name: "Pearl", hex: "#EFEBE4", rgb: [239, 235, 228], specialty: "pearl" },
    { code: "H72", name: "Translucent Pink", hex: "#F097B0", rgb: [240, 151, 176], specialty: "transparent" },
    { code: "H73", name: "Translucent Aqua", hex: "#59AEF5", rgb: [89, 174, 245], specialty: "transparent" },
    { code: "H74", name: "Translucent Lilac", hex: "#5B55BD", rgb: [91, 85, 189], specialty: "transparent" },
    { code: "H101", name: "Eucalyptus", hex: "#A9C39B", rgb: [169, 195, 155] },
    { code: "H102", name: "Forest Green", hex: "#356B2D", rgb: [53, 107, 45] },
    { code: "H103", name: "Light Yellow", hex: "#FFE660", rgb: [255, 230, 96] },
    { code: "H104", name: "Lime", hex: "#BCD122", rgb: [188, 209, 34] },
    { code: "H105", name: "Light Apricot", hex: "#FFAC78", rgb: [255, 172, 120] },
    { code: "H106", name: "Light Lavender", hex: "#CCC5ED", rgb: [204, 197, 237] },
    { code: "H107", name: "Lavender", hex: "#6A87C1", rgb: [106, 135, 193] },
    { code: "H108", name: "Aubergine", hex: "#2A2536", rgb: [42, 37, 54] },
    { code: "H109", name: "Cloudy Grey", hex: "#8A847F", rgb: [138, 132, 127] },
    { code: "H110", name: "Matcha", hex: "#838956", rgb: [131, 137, 86] },
    { code: "H111", name: "Dark Blush", hex: "#835854", rgb: [131, 88, 84] },
    { code: "H112", name: "Blush", hex: "#AD8A82", rgb: [173, 138, 130] },
    { code: "H113", name: "Aqua", hex: "#5F887B", rgb: [95, 136, 123] },
    { code: "H114", name: "Cherry Red", hex: "#9A2C31", rgb: [154, 44, 49] },
    { code: "H115", name: "Bright Green", hex: "#6E975F", rgb: [110, 151, 95] },
    { code: "H116", name: "Midnight Blue", hex: "#222838", rgb: [34, 40, 56] },
    { code: "H117", name: "Taupe Grey", hex: "#777169", rgb: [119, 113, 105] },
    { code: "H118", name: "Maroon Red", hex: "#612932", rgb: [97, 41, 50] },
    { code: "H119", name: "Sky Blue", hex: "#4167B4", rgb: [65, 103, 180] }
  ]
};

// ../../packages/pattern-engine/palettes/mard-221.json
var mard_221_default = {
  _TODO: "Community-measured approximate colors, NOT official manufacturer values. Verify against physical beads from our actual supplier before launch. Bead weight is unknown: fill weightG per color once measured.",
  id: "mard-221",
  brand: "MARD",
  product: "MARD Beads (Midi, 5 mm), 221 colors",
  beadSize: "5mm",
  status: "community",
  license: "CC-BY-4.0",
  attribution: "Color data: craft-color-codes by MakeBead (https://makebead.com)",
  sources: [
    {
      name: "peiseka.com color chart",
      url: "https://peiseka.com/"
    },
    {
      name: "pixel-beads.com MARD chart",
      url: "https://pixel-beads.com/perler-bead-color-chart"
    }
  ],
  weightG: null,
  colors: [
    { code: "A1", name: "Light Amber", hex: "#FAF4C8", rgb: [250, 244, 200] },
    { code: "A2", name: "Light Yellow", hex: "#FFFFD5", rgb: [255, 255, 213] },
    { code: "A3", name: "Yellow", hex: "#FEFF8B", rgb: [254, 255, 139] },
    { code: "A4", name: "Amber", hex: "#FBED56", rgb: [251, 237, 86] },
    { code: "A5", name: "Amber", hex: "#F4D738", rgb: [244, 215, 56] },
    { code: "A6", name: "Orange", hex: "#FEAC4C", rgb: [254, 172, 76] },
    { code: "A7", name: "Vermilion", hex: "#FE8B4C", rgb: [254, 139, 76] },
    { code: "A8", name: "Amber", hex: "#FFDA45", rgb: [255, 218, 69] },
    { code: "A9", name: "Vermilion", hex: "#FF995B", rgb: [255, 153, 91] },
    { code: "A10", name: "Vermilion", hex: "#F77C31", rgb: [247, 124, 49] },
    { code: "A11", name: "Light Amber", hex: "#FFDD99", rgb: [255, 221, 153] },
    { code: "A12", name: "Vermilion", hex: "#FE9F72", rgb: [254, 159, 114] },
    { code: "A13", name: "Orange", hex: "#FFC365", rgb: [255, 195, 101] },
    { code: "A14", name: "Red", hex: "#FD543D", rgb: [253, 84, 61] },
    { code: "A15", name: "Yellow", hex: "#FFF365", rgb: [255, 243, 101] },
    { code: "A16", name: "Light Yellow", hex: "#FFFF9F", rgb: [255, 255, 159] },
    { code: "A17", name: "Amber", hex: "#FFE36E", rgb: [255, 227, 110] },
    { code: "A18", name: "Orange", hex: "#FEBE7D", rgb: [254, 190, 125] },
    { code: "A19", name: "Red", hex: "#FD7C72", rgb: [253, 124, 114] },
    { code: "A20", name: "Amber", hex: "#FFD568", rgb: [255, 213, 104] },
    { code: "A21", name: "Light Amber", hex: "#FFE395", rgb: [255, 227, 149] },
    { code: "A22", name: "Yellow", hex: "#F4F57D", rgb: [244, 245, 125] },
    { code: "A23", name: "Light Vermilion", hex: "#E6C9B7", rgb: [230, 201, 183] },
    { code: "A24", name: "Light Yellow", hex: "#F7F8A2", rgb: [247, 248, 162] },
    { code: "A25", name: "Amber", hex: "#FFD67D", rgb: [255, 214, 125] },
    { code: "A26", name: "Amber", hex: "#FFC830", rgb: [255, 200, 48] },
    { code: "B1", name: "Yellow", hex: "#E6EE31", rgb: [230, 238, 49] },
    { code: "B2", name: "Green", hex: "#63F347", rgb: [99, 243, 71] },
    { code: "B3", name: "Green", hex: "#9EF780", rgb: [158, 247, 128] },
    { code: "B4", name: "Deep Green", hex: "#5DE035", rgb: [93, 224, 53] },
    { code: "B5", name: "Deep Green", hex: "#35E352", rgb: [53, 227, 82] },
    { code: "B6", name: "Mint", hex: "#65E2A6", rgb: [101, 226, 166] },
    { code: "B7", name: "Deep Mint", hex: "#3DAF80", rgb: [61, 175, 128] },
    { code: "B8", name: "Deep Green", hex: "#1C9C4F", rgb: [28, 156, 79] },
    { code: "B9", name: "Dark Mint", hex: "#27523A", rgb: [39, 82, 58] },
    { code: "B10", name: "Mint", hex: "#95D3C2", rgb: [149, 211, 194] },
    { code: "B11", name: "Dark Lime", hex: "#5D722A", rgb: [93, 114, 42] },
    { code: "B12", name: "Dark Mint", hex: "#166F41", rgb: [22, 111, 65] },
    { code: "B13", name: "Lime", hex: "#CAEB7B", rgb: [202, 235, 123] },
    { code: "B14", name: "Lime", hex: "#ADE946", rgb: [173, 233, 70] },
    { code: "B15", name: "Dark Green", hex: "#2E5132", rgb: [46, 81, 50] },
    { code: "B16", name: "Chartreuse", hex: "#C5ED9C", rgb: [197, 237, 156] },
    { code: "B17", name: "Deep Lime", hex: "#9BB13A", rgb: [155, 177, 58] },
    { code: "B18", name: "Yellow", hex: "#E6EE49", rgb: [230, 238, 73] },
    { code: "B19", name: "Deep Mint", hex: "#24B88C", rgb: [36, 184, 140] },
    { code: "B20", name: "Light Green", hex: "#C2F0CC", rgb: [194, 240, 204] },
    { code: "B21", name: "Dark Teal", hex: "#156A6B", rgb: [21, 106, 107] },
    { code: "B22", name: "Dark Teal", hex: "#0B3C43", rgb: [11, 60, 67] },
    { code: "B23", name: "Dark Lime", hex: "#303A21", rgb: [48, 58, 33] },
    { code: "B24", name: "Light Yellow", hex: "#EEFCA5", rgb: [238, 252, 165] },
    { code: "B25", name: "Deep Mint", hex: "#4E846D", rgb: [78, 132, 109] },
    { code: "B26", name: "Chestnut", hex: "#8D7A35", rgb: [141, 122, 53] },
    { code: "B27", name: "Light Chartreuse", hex: "#CCE1AF", rgb: [204, 225, 175] },
    { code: "B28", name: "Green", hex: "#9EE5B9", rgb: [158, 229, 185] },
    { code: "B29", name: "Lime", hex: "#C5E254", rgb: [197, 226, 84] },
    { code: "B30", name: "Light Lime", hex: "#E2FCB1", rgb: [226, 252, 177] },
    { code: "B31", name: "Chartreuse", hex: "#B0E792", rgb: [176, 231, 146] },
    { code: "B32", name: "Deep Lime", hex: "#9CAB5A", rgb: [156, 171, 90] },
    { code: "C1", name: "Pale Green", hex: "#E8FFE7", rgb: [232, 255, 231] },
    { code: "C2", name: "Light Teal", hex: "#A9F9FC", rgb: [169, 249, 252] },
    { code: "C3", name: "Light Cyan", hex: "#A0E2FB", rgb: [160, 226, 251] },
    { code: "C4", name: "Cyan", hex: "#41CCFF", rgb: [65, 204, 255] },
    { code: "C5", name: "Deep Cyan", hex: "#01ACEB", rgb: [1, 172, 235] },
    { code: "C6", name: "Sky", hex: "#50AAF0", rgb: [80, 170, 240] },
    { code: "C7", name: "Deep Sky", hex: "#3677D2", rgb: [54, 119, 210] },
    { code: "C8", name: "Deep Sky", hex: "#0F54C0", rgb: [15, 84, 192] },
    { code: "C9", name: "Deep Blue", hex: "#324BCA", rgb: [50, 75, 202] },
    { code: "C10", name: "Cyan", hex: "#3EBCE2", rgb: [62, 188, 226] },
    { code: "C11", name: "Deep Teal", hex: "#28DDDE", rgb: [40, 221, 222] },
    { code: "C12", name: "Dark Sky", hex: "#1C334D", rgb: [28, 51, 77] },
    { code: "C13", name: "Light Sky", hex: "#CDE8FF", rgb: [205, 232, 255] },
    { code: "C14", name: "Light Teal", hex: "#D5FDFF", rgb: [213, 253, 255] },
    { code: "C15", name: "Deep Teal", hex: "#22C4C6", rgb: [34, 196, 198] },
    { code: "C16", name: "Deep Sky", hex: "#1557A8", rgb: [21, 87, 168] },
    { code: "C17", name: "Deep Teal", hex: "#04D1F6", rgb: [4, 209, 246] },
    { code: "C18", name: "Dark Sky", hex: "#1D3344", rgb: [29, 51, 68] },
    { code: "C19", name: "Deep Cyan", hex: "#1887A2", rgb: [24, 135, 162] },
    { code: "C20", name: "Deep Sky", hex: "#176DAF", rgb: [23, 109, 175] },
    { code: "C21", name: "Light Sky", hex: "#BEDDFF", rgb: [190, 221, 255] },
    { code: "C22", name: "Teal", hex: "#67B4BE", rgb: [103, 180, 190] },
    { code: "C23", name: "Light Sky", hex: "#C8E2FF", rgb: [200, 226, 255] },
    { code: "C24", name: "Sky", hex: "#7CC4FF", rgb: [124, 196, 255] },
    { code: "C25", name: "Light Teal", hex: "#A9E5E5", rgb: [169, 229, 229] },
    { code: "C26", name: "Deep Cyan", hex: "#3CAED8", rgb: [60, 174, 216] },
    { code: "C27", name: "Light Blue", hex: "#D3DFFA", rgb: [211, 223, 250] },
    { code: "C28", name: "Light Sky", hex: "#BBCFED", rgb: [187, 207, 237] },
    { code: "C29", name: "Deep Blue", hex: "#34488E", rgb: [52, 72, 142] },
    { code: "D1", name: "Light Blue", hex: "#AEB4F2", rgb: [174, 180, 242] },
    { code: "D2", name: "Blue", hex: "#858EDD", rgb: [133, 142, 221] },
    { code: "D3", name: "Deep Blue", hex: "#2F54AF", rgb: [47, 84, 175] },
    { code: "D4", name: "Dark Blue", hex: "#182A84", rgb: [24, 42, 132] },
    { code: "D5", name: "Deep Purple", hex: "#B843C5", rgb: [184, 67, 197] },
    { code: "D6", name: "Violet", hex: "#AC7BDE", rgb: [172, 123, 222] },
    { code: "D7", name: "Deep Violet", hex: "#8854B3", rgb: [136, 84, 179] },
    { code: "D8", name: "Light Violet", hex: "#E2D3FF", rgb: [226, 211, 255] },
    { code: "D9", name: "Light Violet", hex: "#D5B9F8", rgb: [213, 185, 248] },
    { code: "D10", name: "Dark Violet", hex: "#361851", rgb: [54, 24, 81] },
    { code: "D11", name: "Light Blue", hex: "#B9BAE1", rgb: [185, 186, 225] },
    { code: "D12", name: "Purple", hex: "#DE9AD4", rgb: [222, 154, 212] },
    { code: "D13", name: "Deep Magenta", hex: "#B90095", rgb: [185, 0, 149] },
    { code: "D14", name: "Deep Purple", hex: "#8B279B", rgb: [139, 39, 155] },
    { code: "D15", name: "Dark Indigo", hex: "#2F1F90", rgb: [47, 31, 144] },
    { code: "D16", name: "Light Indigo", hex: "#E3E1EE", rgb: [227, 225, 238] },
    { code: "D17", name: "Light Blue", hex: "#C4D4F6", rgb: [196, 212, 246] },
    { code: "D18", name: "Violet", hex: "#A45EC7", rgb: [164, 94, 199] },
    { code: "D19", name: "Light Purple", hex: "#D8C3D7", rgb: [216, 195, 215] },
    { code: "D20", name: "Deep Purple", hex: "#9C32B2", rgb: [156, 50, 178] },
    { code: "D21", name: "Dark Purple", hex: "#9A009B", rgb: [154, 0, 155] },
    { code: "D22", name: "Deep Blue", hex: "#333A95", rgb: [51, 58, 149] },
    { code: "D23", name: "Pale Violet", hex: "#EBDAFC", rgb: [235, 218, 252] },
    { code: "D24", name: "Blue", hex: "#7786E5", rgb: [119, 134, 229] },
    { code: "D25", name: "Deep Blue", hex: "#494FC7", rgb: [73, 79, 199] },
    { code: "D26", name: "Pale Violet", hex: "#DFC2F8", rgb: [223, 194, 248] },
    { code: "E1", name: "Light Red", hex: "#FDD3CC", rgb: [253, 211, 204] },
    { code: "E2", name: "Light Magenta", hex: "#FEC0DF", rgb: [254, 192, 223] },
    { code: "E3", name: "Light Magenta", hex: "#FFB7E7", rgb: [255, 183, 231] },
    { code: "E4", name: "Magenta", hex: "#E8649E", rgb: [232, 100, 158] },
    { code: "E5", name: "Magenta", hex: "#F551A2", rgb: [245, 81, 162] },
    { code: "E6", name: "Pink", hex: "#F13D74", rgb: [241, 61, 116] },
    { code: "E7", name: "Deep Magenta", hex: "#C63478", rgb: [198, 52, 120] },
    { code: "E8", name: "Pale Pink", hex: "#FFDBE9", rgb: [255, 219, 233] },
    { code: "E9", name: "Magenta", hex: "#E970CC", rgb: [233, 112, 204] },
    { code: "E10", name: "Deep Magenta", hex: "#D33793", rgb: [211, 55, 147] },
    { code: "E11", name: "Light Vermilion", hex: "#FCDDD2", rgb: [252, 221, 210] },
    { code: "E12", name: "Magenta", hex: "#F78FC3", rgb: [247, 143, 195] },
    { code: "E13", name: "Deep Magenta", hex: "#B5006D", rgb: [181, 0, 109] },
    { code: "E14", name: "Light Vermilion", hex: "#FFD1BA", rgb: [255, 209, 186] },
    { code: "E15", name: "Light Pink", hex: "#F8C7C9", rgb: [248, 199, 201] },
    { code: "E16", name: "Pale Vermilion", hex: "#FFF3EB", rgb: [255, 243, 235] },
    { code: "E17", name: "Pale Pink", hex: "#FFE2EA", rgb: [255, 226, 234] },
    { code: "E18", name: "Light Pink", hex: "#FFC7DB", rgb: [255, 199, 219] },
    { code: "E19", name: "Light Pink", hex: "#FEBAD5", rgb: [254, 186, 213] },
    { code: "E20", name: "Light Magenta", hex: "#D8C7D1", rgb: [216, 199, 209] },
    { code: "E21", name: "Pink", hex: "#BD9DA1", rgb: [189, 157, 161] },
    { code: "E22", name: "Magenta", hex: "#B785A1", rgb: [183, 133, 161] },
    { code: "E23", name: "Deep Magenta", hex: "#937A8D", rgb: [147, 122, 141] },
    { code: "E24", name: "Light Purple", hex: "#E1BCE8", rgb: [225, 188, 232] },
    { code: "F1", name: "Vermilion", hex: "#FD957B", rgb: [253, 149, 123] },
    { code: "F2", name: "Pink", hex: "#FC3D46", rgb: [252, 61, 70] },
    { code: "F3", name: "Red", hex: "#F74941", rgb: [247, 73, 65] },
    { code: "F4", name: "Pink", hex: "#FC283C", rgb: [252, 40, 60] },
    { code: "F5", name: "Deep Pink", hex: "#E7002F", rgb: [231, 0, 47] },
    { code: "F6", name: "Chestnut", hex: "#943630", rgb: [148, 54, 48] },
    { code: "F7", name: "Dark Pink", hex: "#971937", rgb: [151, 25, 55] },
    { code: "F8", name: "Deep Pink", hex: "#BC0028", rgb: [188, 0, 40] },
    { code: "F9", name: "Pink", hex: "#E2677A", rgb: [226, 103, 122] },
    { code: "F10", name: "Chestnut", hex: "#8A4526", rgb: [138, 69, 38] },
    { code: "F11", name: "Espresso", hex: "#5A2121", rgb: [90, 33, 33] },
    { code: "F12", name: "Pink", hex: "#FD4E6A", rgb: [253, 78, 106] },
    { code: "F13", name: "Red", hex: "#F35744", rgb: [243, 87, 68] },
    { code: "F14", name: "Light Pink", hex: "#FFA9AD", rgb: [255, 169, 173] },
    { code: "F15", name: "Deep Pink", hex: "#D30022", rgb: [211, 0, 34] },
    { code: "F16", name: "Light Vermilion", hex: "#FEC2A6", rgb: [254, 194, 166] },
    { code: "F17", name: "Vermilion", hex: "#E69C79", rgb: [230, 156, 121] },
    { code: "F18", name: "Vermilion", hex: "#D37C46", rgb: [211, 124, 70] },
    { code: "F19", name: "Deep Pink", hex: "#C1444A", rgb: [193, 68, 74] },
    { code: "F20", name: "Red", hex: "#CD9391", rgb: [205, 147, 145] },
    { code: "F21", name: "Light Pink", hex: "#F7B4C6", rgb: [247, 180, 198] },
    { code: "F22", name: "Light Pink", hex: "#FDC0D0", rgb: [253, 192, 208] },
    { code: "F23", name: "Red", hex: "#F67E66", rgb: [246, 126, 102] },
    { code: "F24", name: "Pink", hex: "#E698AA", rgb: [230, 152, 170] },
    { code: "F25", name: "Red", hex: "#E54B4F", rgb: [229, 75, 79] },
    { code: "G1", name: "Light Vermilion", hex: "#FFE2CE", rgb: [255, 226, 206] },
    { code: "G2", name: "Light Vermilion", hex: "#FFC4AA", rgb: [255, 196, 170] },
    { code: "G3", name: "Light Vermilion", hex: "#F4C3A5", rgb: [244, 195, 165] },
    { code: "G4", name: "Orange", hex: "#E1B383", rgb: [225, 179, 131] },
    { code: "G5", name: "Orange", hex: "#EDB045", rgb: [237, 176, 69] },
    { code: "G6", name: "Deep Orange", hex: "#E99C17", rgb: [233, 156, 23] },
    { code: "G7", name: "Brown", hex: "#9D5B3E", rgb: [157, 91, 62] },
    { code: "G8", name: "Chestnut", hex: "#753832", rgb: [117, 56, 50] },
    { code: "G9", name: "Orange", hex: "#E6B483", rgb: [230, 180, 131] },
    { code: "G10", name: "Deep Orange", hex: "#D98C39", rgb: [217, 140, 57] },
    { code: "G11", name: "Orange", hex: "#E0C593", rgb: [224, 197, 147] },
    { code: "G12", name: "Light Orange", hex: "#FFC890", rgb: [255, 200, 144] },
    { code: "G13", name: "Brown", hex: "#B7714A", rgb: [183, 113, 74] },
    { code: "G14", name: "Brown", hex: "#8D614C", rgb: [141, 97, 76] },
    { code: "G15", name: "Pale Amber", hex: "#FCF9E0", rgb: [252, 249, 224] },
    { code: "G16", name: "Light Orange", hex: "#F2D9BA", rgb: [242, 217, 186] },
    { code: "G17", name: "Chestnut", hex: "#78524B", rgb: [120, 82, 75] },
    { code: "G18", name: "Light Orange", hex: "#FFE4CC", rgb: [255, 228, 204] },
    { code: "G19", name: "Deep Vermilion", hex: "#E07935", rgb: [224, 121, 53] },
    { code: "G20", name: "Deep Vermilion", hex: "#A94023", rgb: [169, 64, 35] },
    { code: "G21", name: "Brown", hex: "#B88558", rgb: [184, 133, 88] },
    { code: "H1", name: "Pale Violet", hex: "#FDFBFF", rgb: [253, 251, 255] },
    { code: "H2", name: "Pale Teal", hex: "#FEFFFF", rgb: [254, 255, 255] },
    { code: "H3", name: "Silver", hex: "#B6B1BA", rgb: [182, 177, 186] },
    { code: "H4", name: "Grey", hex: "#89858C", rgb: [137, 133, 140] },
    { code: "H5", name: "Dark Grey", hex: "#48464E", rgb: [72, 70, 78] },
    { code: "H6", name: "Charcoal", hex: "#2F2B2F", rgb: [47, 43, 47] },
    { code: "H7", name: "Black", hex: "#000000", rgb: [0, 0, 0] },
    { code: "H8", name: "Pale Muted Red", hex: "#E7D6DB", rgb: [231, 214, 219] },
    { code: "H9", name: "White", hex: "#EDEDED", rgb: [237, 237, 237] },
    { code: "H10", name: "Pale Muted Red", hex: "#EEE9EA", rgb: [238, 233, 234] },
    { code: "H11", name: "Off White", hex: "#CECDD5", rgb: [206, 205, 213] },
    { code: "H12", name: "Pale Orange", hex: "#FFF5ED", rgb: [255, 245, 237] },
    { code: "H13", name: "Pale Yellow", hex: "#F5ECD2", rgb: [245, 236, 210] },
    { code: "H14", name: "Off White", hex: "#CFD7D3", rgb: [207, 215, 211] },
    { code: "H15", name: "Light Grey", hex: "#98A6A8", rgb: [152, 166, 168] },
    { code: "H16", name: "Deep Muted Red", hex: "#1D1414", rgb: [29, 20, 20] },
    { code: "H17", name: "Pale Muted Red", hex: "#F1EDED", rgb: [241, 237, 237] },
    { code: "H18", name: "Pale Yellow", hex: "#FFFDF0", rgb: [255, 253, 240] },
    { code: "H19", name: "Pale Orange", hex: "#F6EFE2", rgb: [246, 239, 226] },
    { code: "H20", name: "Light Grey", hex: "#949FA3", rgb: [148, 159, 163] },
    { code: "H21", name: "Pale Yellow", hex: "#FFFBE1", rgb: [255, 251, 225] },
    { code: "H22", name: "Light Muted Blue", hex: "#CACAD4", rgb: [202, 202, 212] },
    { code: "H23", name: "Grey", hex: "#9A9D94", rgb: [154, 157, 148] },
    { code: "M1", name: "Light Muted Green", hex: "#BCC6B8", rgb: [188, 198, 184] },
    { code: "M2", name: "Muted Green", hex: "#8AA386", rgb: [138, 163, 134] },
    { code: "M3", name: "Grey", hex: "#697D80", rgb: [105, 125, 128] },
    { code: "M4", name: "Light Orange", hex: "#E3D2BC", rgb: [227, 210, 188] },
    { code: "M5", name: "Light Yellow", hex: "#D0CCAA", rgb: [208, 204, 170] },
    { code: "M6", name: "Muted Yellow", hex: "#B0A782", rgb: [176, 167, 130] },
    { code: "M7", name: "Muted Orange", hex: "#B4A497", rgb: [180, 164, 151] },
    { code: "M8", name: "Muted Red", hex: "#B38281", rgb: [179, 130, 129] },
    { code: "M9", name: "Muted Orange", hex: "#A58767", rgb: [165, 135, 103] },
    { code: "M10", name: "Light Muted Pink", hex: "#C5B2BC", rgb: [197, 178, 188] },
    { code: "M11", name: "Muted Pink", hex: "#9F7594", rgb: [159, 117, 148] },
    { code: "M12", name: "Dark Muted Red", hex: "#644749", rgb: [100, 71, 73] },
    { code: "M13", name: "Orange", hex: "#D19066", rgb: [209, 144, 102] },
    { code: "M14", name: "Red", hex: "#C77362", rgb: [199, 115, 98] },
    { code: "M15", name: "Grey", hex: "#757D78", rgb: [117, 125, 120] }
  ]
};

// ../../packages/pattern-engine/palettes/mard-264.json
var mard_264_default = {
  _TODO: "Community-measured approximate colors, NOT official manufacturer values. Verify against physical beads from our actual supplier before launch. Bead weight is unknown: fill weightG per color once measured. The P/Q/R/T/Y series values have no numbered maker chart (see notes).",
  id: "mard-264",
  brand: "MARD",
  product: "MARD Beads, 264-color box",
  beadSize: "5mm",
  status: "community",
  license: "CC-BY-4.0",
  attribution: "Color data: craft-color-codes by MakeBead (https://makebead.com)",
  notes: "Codes = the MARD 264 retail box (craft-color-codes data/sets/mard-kits.json); colors from craft-color-codes mard-291. The 221 plus the 70 specialty colors (P, Q, R, T, Y, ZG series) that the 240 and 264 boxes reach into. The 221 base values are the mard-221 values. For the 70 specialty colors no maker chart with numbers exists, so three data lineages were compared: where the first two agree their value is used, otherwise whichever of the two the third lineage sits closer to (7 codes: P2, P14, P19, Q2, Q5, R6, T1).",
  sources: [
    {
      name: "pixel-beads.com MARD chart (2026 revised)",
      url: "https://pixel-beads.com/perler-bead-color-chart"
    },
    {
      name: "Zippland/perler-beads colorSystemMapping.json",
      url: "https://github.com/Zippland/perler-beads"
    },
    {
      name: "HansBug/pindou-color-data (mard-291-github, from abearxiong/get-colors-from-beans)",
      url: "https://github.com/HansBug/pindou-color-data"
    }
  ],
  weightG: null,
  colors: [
    {
      code: "A1",
      name: "Light Amber",
      hex: "#FAF4C8",
      rgb: [
        250,
        244,
        200
      ]
    },
    {
      code: "A2",
      name: "Light Yellow",
      hex: "#FFFFD5",
      rgb: [
        255,
        255,
        213
      ]
    },
    {
      code: "A3",
      name: "Yellow",
      hex: "#FEFF8B",
      rgb: [
        254,
        255,
        139
      ]
    },
    {
      code: "A4",
      name: "Amber",
      hex: "#FBED56",
      rgb: [
        251,
        237,
        86
      ]
    },
    {
      code: "A5",
      name: "Amber",
      hex: "#F4D738",
      rgb: [
        244,
        215,
        56
      ]
    },
    {
      code: "A6",
      name: "Orange",
      hex: "#FEAC4C",
      rgb: [
        254,
        172,
        76
      ]
    },
    {
      code: "A7",
      name: "Vermilion",
      hex: "#FE8B4C",
      rgb: [
        254,
        139,
        76
      ]
    },
    {
      code: "A8",
      name: "Amber",
      hex: "#FFDA45",
      rgb: [
        255,
        218,
        69
      ]
    },
    {
      code: "A9",
      name: "Vermilion",
      hex: "#FF995B",
      rgb: [
        255,
        153,
        91
      ]
    },
    {
      code: "A10",
      name: "Vermilion",
      hex: "#F77C31",
      rgb: [
        247,
        124,
        49
      ]
    },
    {
      code: "A11",
      name: "Light Amber",
      hex: "#FFDD99",
      rgb: [
        255,
        221,
        153
      ]
    },
    {
      code: "A12",
      name: "Vermilion",
      hex: "#FE9F72",
      rgb: [
        254,
        159,
        114
      ]
    },
    {
      code: "A13",
      name: "Orange",
      hex: "#FFC365",
      rgb: [
        255,
        195,
        101
      ]
    },
    {
      code: "A14",
      name: "Red",
      hex: "#FD543D",
      rgb: [
        253,
        84,
        61
      ]
    },
    {
      code: "A15",
      name: "Yellow",
      hex: "#FFF365",
      rgb: [
        255,
        243,
        101
      ]
    },
    {
      code: "A16",
      name: "Light Yellow",
      hex: "#FFFF9F",
      rgb: [
        255,
        255,
        159
      ]
    },
    {
      code: "A17",
      name: "Amber",
      hex: "#FFE36E",
      rgb: [
        255,
        227,
        110
      ]
    },
    {
      code: "A18",
      name: "Orange",
      hex: "#FEBE7D",
      rgb: [
        254,
        190,
        125
      ]
    },
    {
      code: "A19",
      name: "Red",
      hex: "#FD7C72",
      rgb: [
        253,
        124,
        114
      ]
    },
    {
      code: "A20",
      name: "Amber",
      hex: "#FFD568",
      rgb: [
        255,
        213,
        104
      ]
    },
    {
      code: "A21",
      name: "Light Amber",
      hex: "#FFE395",
      rgb: [
        255,
        227,
        149
      ]
    },
    {
      code: "A22",
      name: "Yellow",
      hex: "#F4F57D",
      rgb: [
        244,
        245,
        125
      ]
    },
    {
      code: "A23",
      name: "Light Vermilion",
      hex: "#E6C9B7",
      rgb: [
        230,
        201,
        183
      ]
    },
    {
      code: "A24",
      name: "Light Yellow",
      hex: "#F7F8A2",
      rgb: [
        247,
        248,
        162
      ]
    },
    {
      code: "A25",
      name: "Amber",
      hex: "#FFD67D",
      rgb: [
        255,
        214,
        125
      ]
    },
    {
      code: "A26",
      name: "Amber",
      hex: "#FFC830",
      rgb: [
        255,
        200,
        48
      ]
    },
    {
      code: "B1",
      name: "Yellow",
      hex: "#E6EE31",
      rgb: [
        230,
        238,
        49
      ]
    },
    {
      code: "B2",
      name: "Green",
      hex: "#63F347",
      rgb: [
        99,
        243,
        71
      ]
    },
    {
      code: "B3",
      name: "Green",
      hex: "#9EF780",
      rgb: [
        158,
        247,
        128
      ]
    },
    {
      code: "B4",
      name: "Deep Green",
      hex: "#5DE035",
      rgb: [
        93,
        224,
        53
      ]
    },
    {
      code: "B5",
      name: "Deep Green",
      hex: "#35E352",
      rgb: [
        53,
        227,
        82
      ]
    },
    {
      code: "B6",
      name: "Mint",
      hex: "#65E2A6",
      rgb: [
        101,
        226,
        166
      ]
    },
    {
      code: "B7",
      name: "Deep Mint",
      hex: "#3DAF80",
      rgb: [
        61,
        175,
        128
      ]
    },
    {
      code: "B8",
      name: "Deep Green",
      hex: "#1C9C4F",
      rgb: [
        28,
        156,
        79
      ]
    },
    {
      code: "B9",
      name: "Dark Mint",
      hex: "#27523A",
      rgb: [
        39,
        82,
        58
      ]
    },
    {
      code: "B10",
      name: "Mint",
      hex: "#95D3C2",
      rgb: [
        149,
        211,
        194
      ]
    },
    {
      code: "B11",
      name: "Dark Lime",
      hex: "#5D722A",
      rgb: [
        93,
        114,
        42
      ]
    },
    {
      code: "B12",
      name: "Dark Mint",
      hex: "#166F41",
      rgb: [
        22,
        111,
        65
      ]
    },
    {
      code: "B13",
      name: "Lime",
      hex: "#CAEB7B",
      rgb: [
        202,
        235,
        123
      ]
    },
    {
      code: "B14",
      name: "Lime",
      hex: "#ADE946",
      rgb: [
        173,
        233,
        70
      ]
    },
    {
      code: "B15",
      name: "Dark Green",
      hex: "#2E5132",
      rgb: [
        46,
        81,
        50
      ]
    },
    {
      code: "B16",
      name: "Chartreuse",
      hex: "#C5ED9C",
      rgb: [
        197,
        237,
        156
      ]
    },
    {
      code: "B17",
      name: "Deep Lime",
      hex: "#9BB13A",
      rgb: [
        155,
        177,
        58
      ]
    },
    {
      code: "B18",
      name: "Yellow",
      hex: "#E6EE49",
      rgb: [
        230,
        238,
        73
      ]
    },
    {
      code: "B19",
      name: "Deep Mint",
      hex: "#24B88C",
      rgb: [
        36,
        184,
        140
      ]
    },
    {
      code: "B20",
      name: "Light Green",
      hex: "#C2F0CC",
      rgb: [
        194,
        240,
        204
      ]
    },
    {
      code: "B21",
      name: "Dark Teal",
      hex: "#156A6B",
      rgb: [
        21,
        106,
        107
      ]
    },
    {
      code: "B22",
      name: "Dark Teal",
      hex: "#0B3C43",
      rgb: [
        11,
        60,
        67
      ]
    },
    {
      code: "B23",
      name: "Dark Lime",
      hex: "#303A21",
      rgb: [
        48,
        58,
        33
      ]
    },
    {
      code: "B24",
      name: "Light Yellow",
      hex: "#EEFCA5",
      rgb: [
        238,
        252,
        165
      ]
    },
    {
      code: "B25",
      name: "Deep Mint",
      hex: "#4E846D",
      rgb: [
        78,
        132,
        109
      ]
    },
    {
      code: "B26",
      name: "Chestnut",
      hex: "#8D7A35",
      rgb: [
        141,
        122,
        53
      ]
    },
    {
      code: "B27",
      name: "Light Chartreuse",
      hex: "#CCE1AF",
      rgb: [
        204,
        225,
        175
      ]
    },
    {
      code: "B28",
      name: "Green",
      hex: "#9EE5B9",
      rgb: [
        158,
        229,
        185
      ]
    },
    {
      code: "B29",
      name: "Lime",
      hex: "#C5E254",
      rgb: [
        197,
        226,
        84
      ]
    },
    {
      code: "B30",
      name: "Light Lime",
      hex: "#E2FCB1",
      rgb: [
        226,
        252,
        177
      ]
    },
    {
      code: "B31",
      name: "Chartreuse",
      hex: "#B0E792",
      rgb: [
        176,
        231,
        146
      ]
    },
    {
      code: "B32",
      name: "Deep Lime",
      hex: "#9CAB5A",
      rgb: [
        156,
        171,
        90
      ]
    },
    {
      code: "C1",
      name: "Pale Green",
      hex: "#E8FFE7",
      rgb: [
        232,
        255,
        231
      ]
    },
    {
      code: "C2",
      name: "Light Teal",
      hex: "#A9F9FC",
      rgb: [
        169,
        249,
        252
      ]
    },
    {
      code: "C3",
      name: "Light Cyan",
      hex: "#A0E2FB",
      rgb: [
        160,
        226,
        251
      ]
    },
    {
      code: "C4",
      name: "Cyan",
      hex: "#41CCFF",
      rgb: [
        65,
        204,
        255
      ]
    },
    {
      code: "C5",
      name: "Deep Cyan",
      hex: "#01ACEB",
      rgb: [
        1,
        172,
        235
      ]
    },
    {
      code: "C6",
      name: "Sky",
      hex: "#50AAF0",
      rgb: [
        80,
        170,
        240
      ]
    },
    {
      code: "C7",
      name: "Deep Sky",
      hex: "#3677D2",
      rgb: [
        54,
        119,
        210
      ]
    },
    {
      code: "C8",
      name: "Deep Sky",
      hex: "#0F54C0",
      rgb: [
        15,
        84,
        192
      ]
    },
    {
      code: "C9",
      name: "Deep Blue",
      hex: "#324BCA",
      rgb: [
        50,
        75,
        202
      ]
    },
    {
      code: "C10",
      name: "Cyan",
      hex: "#3EBCE2",
      rgb: [
        62,
        188,
        226
      ]
    },
    {
      code: "C11",
      name: "Deep Teal",
      hex: "#28DDDE",
      rgb: [
        40,
        221,
        222
      ]
    },
    {
      code: "C12",
      name: "Dark Sky",
      hex: "#1C334D",
      rgb: [
        28,
        51,
        77
      ]
    },
    {
      code: "C13",
      name: "Light Sky",
      hex: "#CDE8FF",
      rgb: [
        205,
        232,
        255
      ]
    },
    {
      code: "C14",
      name: "Light Teal",
      hex: "#D5FDFF",
      rgb: [
        213,
        253,
        255
      ]
    },
    {
      code: "C15",
      name: "Deep Teal",
      hex: "#22C4C6",
      rgb: [
        34,
        196,
        198
      ]
    },
    {
      code: "C16",
      name: "Deep Sky",
      hex: "#1557A8",
      rgb: [
        21,
        87,
        168
      ]
    },
    {
      code: "C17",
      name: "Deep Teal",
      hex: "#04D1F6",
      rgb: [
        4,
        209,
        246
      ]
    },
    {
      code: "C18",
      name: "Dark Sky",
      hex: "#1D3344",
      rgb: [
        29,
        51,
        68
      ]
    },
    {
      code: "C19",
      name: "Deep Cyan",
      hex: "#1887A2",
      rgb: [
        24,
        135,
        162
      ]
    },
    {
      code: "C20",
      name: "Deep Sky",
      hex: "#176DAF",
      rgb: [
        23,
        109,
        175
      ]
    },
    {
      code: "C21",
      name: "Light Sky",
      hex: "#BEDDFF",
      rgb: [
        190,
        221,
        255
      ]
    },
    {
      code: "C22",
      name: "Teal",
      hex: "#67B4BE",
      rgb: [
        103,
        180,
        190
      ]
    },
    {
      code: "C23",
      name: "Light Sky",
      hex: "#C8E2FF",
      rgb: [
        200,
        226,
        255
      ]
    },
    {
      code: "C24",
      name: "Sky",
      hex: "#7CC4FF",
      rgb: [
        124,
        196,
        255
      ]
    },
    {
      code: "C25",
      name: "Light Teal",
      hex: "#A9E5E5",
      rgb: [
        169,
        229,
        229
      ]
    },
    {
      code: "C26",
      name: "Deep Cyan",
      hex: "#3CAED8",
      rgb: [
        60,
        174,
        216
      ]
    },
    {
      code: "C27",
      name: "Light Blue",
      hex: "#D3DFFA",
      rgb: [
        211,
        223,
        250
      ]
    },
    {
      code: "C28",
      name: "Light Sky",
      hex: "#BBCFED",
      rgb: [
        187,
        207,
        237
      ]
    },
    {
      code: "D1",
      name: "Light Blue",
      hex: "#AEB4F2",
      rgb: [
        174,
        180,
        242
      ]
    },
    {
      code: "D2",
      name: "Blue",
      hex: "#858EDD",
      rgb: [
        133,
        142,
        221
      ]
    },
    {
      code: "D3",
      name: "Deep Blue",
      hex: "#2F54AF",
      rgb: [
        47,
        84,
        175
      ]
    },
    {
      code: "D4",
      name: "Dark Blue",
      hex: "#182A84",
      rgb: [
        24,
        42,
        132
      ]
    },
    {
      code: "D5",
      name: "Deep Purple",
      hex: "#B843C5",
      rgb: [
        184,
        67,
        197
      ]
    },
    {
      code: "D6",
      name: "Violet",
      hex: "#AC7BDE",
      rgb: [
        172,
        123,
        222
      ]
    },
    {
      code: "D7",
      name: "Deep Violet",
      hex: "#8854B3",
      rgb: [
        136,
        84,
        179
      ]
    },
    {
      code: "D8",
      name: "Light Violet",
      hex: "#E2D3FF",
      rgb: [
        226,
        211,
        255
      ]
    },
    {
      code: "D9",
      name: "Light Violet",
      hex: "#D5B9F8",
      rgb: [
        213,
        185,
        248
      ]
    },
    {
      code: "D10",
      name: "Dark Violet",
      hex: "#361851",
      rgb: [
        54,
        24,
        81
      ]
    },
    {
      code: "D11",
      name: "Light Blue",
      hex: "#B9BAE1",
      rgb: [
        185,
        186,
        225
      ]
    },
    {
      code: "D12",
      name: "Purple",
      hex: "#DE9AD4",
      rgb: [
        222,
        154,
        212
      ]
    },
    {
      code: "D13",
      name: "Deep Magenta",
      hex: "#B90095",
      rgb: [
        185,
        0,
        149
      ]
    },
    {
      code: "D14",
      name: "Deep Purple",
      hex: "#8B279B",
      rgb: [
        139,
        39,
        155
      ]
    },
    {
      code: "D15",
      name: "Dark Indigo",
      hex: "#2F1F90",
      rgb: [
        47,
        31,
        144
      ]
    },
    {
      code: "D16",
      name: "Light Indigo",
      hex: "#E3E1EE",
      rgb: [
        227,
        225,
        238
      ]
    },
    {
      code: "D17",
      name: "Light Blue",
      hex: "#C4D4F6",
      rgb: [
        196,
        212,
        246
      ]
    },
    {
      code: "D18",
      name: "Violet",
      hex: "#A45EC7",
      rgb: [
        164,
        94,
        199
      ]
    },
    {
      code: "D19",
      name: "Light Purple",
      hex: "#D8C3D7",
      rgb: [
        216,
        195,
        215
      ]
    },
    {
      code: "D20",
      name: "Deep Purple",
      hex: "#9C32B2",
      rgb: [
        156,
        50,
        178
      ]
    },
    {
      code: "D21",
      name: "Dark Purple",
      hex: "#9A009B",
      rgb: [
        154,
        0,
        155
      ]
    },
    {
      code: "D22",
      name: "Deep Blue",
      hex: "#333A95",
      rgb: [
        51,
        58,
        149
      ]
    },
    {
      code: "D23",
      name: "Pale Violet",
      hex: "#EBDAFC",
      rgb: [
        235,
        218,
        252
      ]
    },
    {
      code: "D24",
      name: "Blue",
      hex: "#7786E5",
      rgb: [
        119,
        134,
        229
      ]
    },
    {
      code: "D25",
      name: "Deep Blue",
      hex: "#494FC7",
      rgb: [
        73,
        79,
        199
      ]
    },
    {
      code: "D26",
      name: "Pale Violet",
      hex: "#DFC2F8",
      rgb: [
        223,
        194,
        248
      ]
    },
    {
      code: "E1",
      name: "Light Red",
      hex: "#FDD3CC",
      rgb: [
        253,
        211,
        204
      ]
    },
    {
      code: "E2",
      name: "Light Magenta",
      hex: "#FEC0DF",
      rgb: [
        254,
        192,
        223
      ]
    },
    {
      code: "E3",
      name: "Light Magenta",
      hex: "#FFB7E7",
      rgb: [
        255,
        183,
        231
      ]
    },
    {
      code: "E4",
      name: "Magenta",
      hex: "#E8649E",
      rgb: [
        232,
        100,
        158
      ]
    },
    {
      code: "E5",
      name: "Magenta",
      hex: "#F551A2",
      rgb: [
        245,
        81,
        162
      ]
    },
    {
      code: "E6",
      name: "Pink",
      hex: "#F13D74",
      rgb: [
        241,
        61,
        116
      ]
    },
    {
      code: "E7",
      name: "Deep Magenta",
      hex: "#C63478",
      rgb: [
        198,
        52,
        120
      ]
    },
    {
      code: "E8",
      name: "Pale Pink",
      hex: "#FFDBE9",
      rgb: [
        255,
        219,
        233
      ]
    },
    {
      code: "E9",
      name: "Magenta",
      hex: "#E970CC",
      rgb: [
        233,
        112,
        204
      ]
    },
    {
      code: "E10",
      name: "Deep Magenta",
      hex: "#D33793",
      rgb: [
        211,
        55,
        147
      ]
    },
    {
      code: "E11",
      name: "Light Vermilion",
      hex: "#FCDDD2",
      rgb: [
        252,
        221,
        210
      ]
    },
    {
      code: "E12",
      name: "Magenta",
      hex: "#F78FC3",
      rgb: [
        247,
        143,
        195
      ]
    },
    {
      code: "E13",
      name: "Deep Magenta",
      hex: "#B5006D",
      rgb: [
        181,
        0,
        109
      ]
    },
    {
      code: "E14",
      name: "Light Vermilion",
      hex: "#FFD1BA",
      rgb: [
        255,
        209,
        186
      ]
    },
    {
      code: "E15",
      name: "Light Pink",
      hex: "#F8C7C9",
      rgb: [
        248,
        199,
        201
      ]
    },
    {
      code: "E16",
      name: "Pale Vermilion",
      hex: "#FFF3EB",
      rgb: [
        255,
        243,
        235
      ]
    },
    {
      code: "E17",
      name: "Pale Pink",
      hex: "#FFE2EA",
      rgb: [
        255,
        226,
        234
      ]
    },
    {
      code: "E18",
      name: "Light Pink",
      hex: "#FFC7DB",
      rgb: [
        255,
        199,
        219
      ]
    },
    {
      code: "E19",
      name: "Light Pink",
      hex: "#FEBAD5",
      rgb: [
        254,
        186,
        213
      ]
    },
    {
      code: "E20",
      name: "Light Magenta",
      hex: "#D8C7D1",
      rgb: [
        216,
        199,
        209
      ]
    },
    {
      code: "E21",
      name: "Pink",
      hex: "#BD9DA1",
      rgb: [
        189,
        157,
        161
      ]
    },
    {
      code: "E22",
      name: "Magenta",
      hex: "#B785A1",
      rgb: [
        183,
        133,
        161
      ]
    },
    {
      code: "E23",
      name: "Deep Magenta",
      hex: "#937A8D",
      rgb: [
        147,
        122,
        141
      ]
    },
    {
      code: "E24",
      name: "Light Purple",
      hex: "#E1BCE8",
      rgb: [
        225,
        188,
        232
      ]
    },
    {
      code: "F1",
      name: "Vermilion",
      hex: "#FD957B",
      rgb: [
        253,
        149,
        123
      ]
    },
    {
      code: "F2",
      name: "Pink",
      hex: "#FC3D46",
      rgb: [
        252,
        61,
        70
      ]
    },
    {
      code: "F3",
      name: "Red",
      hex: "#F74941",
      rgb: [
        247,
        73,
        65
      ]
    },
    {
      code: "F4",
      name: "Pink",
      hex: "#FC283C",
      rgb: [
        252,
        40,
        60
      ]
    },
    {
      code: "F5",
      name: "Deep Pink",
      hex: "#E7002F",
      rgb: [
        231,
        0,
        47
      ]
    },
    {
      code: "F6",
      name: "Chestnut",
      hex: "#943630",
      rgb: [
        148,
        54,
        48
      ]
    },
    {
      code: "F7",
      name: "Dark Pink",
      hex: "#971937",
      rgb: [
        151,
        25,
        55
      ]
    },
    {
      code: "F8",
      name: "Deep Pink",
      hex: "#BC0028",
      rgb: [
        188,
        0,
        40
      ]
    },
    {
      code: "F9",
      name: "Pink",
      hex: "#E2677A",
      rgb: [
        226,
        103,
        122
      ]
    },
    {
      code: "F10",
      name: "Chestnut",
      hex: "#8A4526",
      rgb: [
        138,
        69,
        38
      ]
    },
    {
      code: "F11",
      name: "Espresso",
      hex: "#5A2121",
      rgb: [
        90,
        33,
        33
      ]
    },
    {
      code: "F12",
      name: "Pink",
      hex: "#FD4E6A",
      rgb: [
        253,
        78,
        106
      ]
    },
    {
      code: "F13",
      name: "Red",
      hex: "#F35744",
      rgb: [
        243,
        87,
        68
      ]
    },
    {
      code: "F14",
      name: "Light Pink",
      hex: "#FFA9AD",
      rgb: [
        255,
        169,
        173
      ]
    },
    {
      code: "F15",
      name: "Deep Pink",
      hex: "#D30022",
      rgb: [
        211,
        0,
        34
      ]
    },
    {
      code: "F16",
      name: "Light Vermilion",
      hex: "#FEC2A6",
      rgb: [
        254,
        194,
        166
      ]
    },
    {
      code: "F17",
      name: "Vermilion",
      hex: "#E69C79",
      rgb: [
        230,
        156,
        121
      ]
    },
    {
      code: "F18",
      name: "Vermilion",
      hex: "#D37C46",
      rgb: [
        211,
        124,
        70
      ]
    },
    {
      code: "F19",
      name: "Deep Pink",
      hex: "#C1444A",
      rgb: [
        193,
        68,
        74
      ]
    },
    {
      code: "F20",
      name: "Red",
      hex: "#CD9391",
      rgb: [
        205,
        147,
        145
      ]
    },
    {
      code: "F21",
      name: "Light Pink",
      hex: "#F7B4C6",
      rgb: [
        247,
        180,
        198
      ]
    },
    {
      code: "F22",
      name: "Light Pink",
      hex: "#FDC0D0",
      rgb: [
        253,
        192,
        208
      ]
    },
    {
      code: "F23",
      name: "Red",
      hex: "#F67E66",
      rgb: [
        246,
        126,
        102
      ]
    },
    {
      code: "F24",
      name: "Pink",
      hex: "#E698AA",
      rgb: [
        230,
        152,
        170
      ]
    },
    {
      code: "F25",
      name: "Red",
      hex: "#E54B4F",
      rgb: [
        229,
        75,
        79
      ]
    },
    {
      code: "G1",
      name: "Light Vermilion",
      hex: "#FFE2CE",
      rgb: [
        255,
        226,
        206
      ]
    },
    {
      code: "G2",
      name: "Light Vermilion",
      hex: "#FFC4AA",
      rgb: [
        255,
        196,
        170
      ]
    },
    {
      code: "G3",
      name: "Light Vermilion",
      hex: "#F4C3A5",
      rgb: [
        244,
        195,
        165
      ]
    },
    {
      code: "G4",
      name: "Orange",
      hex: "#E1B383",
      rgb: [
        225,
        179,
        131
      ]
    },
    {
      code: "G5",
      name: "Orange",
      hex: "#EDB045",
      rgb: [
        237,
        176,
        69
      ]
    },
    {
      code: "G6",
      name: "Deep Orange",
      hex: "#E99C17",
      rgb: [
        233,
        156,
        23
      ]
    },
    {
      code: "G7",
      name: "Brown",
      hex: "#9D5B3E",
      rgb: [
        157,
        91,
        62
      ]
    },
    {
      code: "G8",
      name: "Chestnut",
      hex: "#753832",
      rgb: [
        117,
        56,
        50
      ]
    },
    {
      code: "G9",
      name: "Orange",
      hex: "#E6B483",
      rgb: [
        230,
        180,
        131
      ]
    },
    {
      code: "G10",
      name: "Deep Orange",
      hex: "#D98C39",
      rgb: [
        217,
        140,
        57
      ]
    },
    {
      code: "G11",
      name: "Orange",
      hex: "#E0C593",
      rgb: [
        224,
        197,
        147
      ]
    },
    {
      code: "G12",
      name: "Light Orange",
      hex: "#FFC890",
      rgb: [
        255,
        200,
        144
      ]
    },
    {
      code: "G13",
      name: "Brown",
      hex: "#B7714A",
      rgb: [
        183,
        113,
        74
      ]
    },
    {
      code: "G14",
      name: "Brown",
      hex: "#8D614C",
      rgb: [
        141,
        97,
        76
      ]
    },
    {
      code: "G15",
      name: "Pale Amber",
      hex: "#FCF9E0",
      rgb: [
        252,
        249,
        224
      ]
    },
    {
      code: "G16",
      name: "Light Orange",
      hex: "#F2D9BA",
      rgb: [
        242,
        217,
        186
      ]
    },
    {
      code: "G17",
      name: "Chestnut",
      hex: "#78524B",
      rgb: [
        120,
        82,
        75
      ]
    },
    {
      code: "G18",
      name: "Light Orange",
      hex: "#FFE4CC",
      rgb: [
        255,
        228,
        204
      ]
    },
    {
      code: "G19",
      name: "Deep Vermilion",
      hex: "#E07935",
      rgb: [
        224,
        121,
        53
      ]
    },
    {
      code: "G20",
      name: "Deep Vermilion",
      hex: "#A94023",
      rgb: [
        169,
        64,
        35
      ]
    },
    {
      code: "G21",
      name: "Brown",
      hex: "#B88558",
      rgb: [
        184,
        133,
        88
      ]
    },
    {
      code: "H1",
      name: "Pale Violet",
      hex: "#FDFBFF",
      rgb: [
        253,
        251,
        255
      ]
    },
    {
      code: "H2",
      name: "Pale Teal",
      hex: "#FEFFFF",
      rgb: [
        254,
        255,
        255
      ]
    },
    {
      code: "H3",
      name: "Silver",
      hex: "#B6B1BA",
      rgb: [
        182,
        177,
        186
      ]
    },
    {
      code: "H4",
      name: "Grey",
      hex: "#89858C",
      rgb: [
        137,
        133,
        140
      ]
    },
    {
      code: "H5",
      name: "Dark Grey",
      hex: "#48464E",
      rgb: [
        72,
        70,
        78
      ]
    },
    {
      code: "H6",
      name: "Charcoal",
      hex: "#2F2B2F",
      rgb: [
        47,
        43,
        47
      ]
    },
    {
      code: "H7",
      name: "Black",
      hex: "#000000",
      rgb: [
        0,
        0,
        0
      ]
    },
    {
      code: "H8",
      name: "Pale Muted Red",
      hex: "#E7D6DB",
      rgb: [
        231,
        214,
        219
      ]
    },
    {
      code: "H9",
      name: "White",
      hex: "#EDEDED",
      rgb: [
        237,
        237,
        237
      ]
    },
    {
      code: "H10",
      name: "Pale Muted Red",
      hex: "#EEE9EA",
      rgb: [
        238,
        233,
        234
      ]
    },
    {
      code: "H11",
      name: "Off White",
      hex: "#CECDD5",
      rgb: [
        206,
        205,
        213
      ]
    },
    {
      code: "H12",
      name: "Pale Orange",
      hex: "#FFF5ED",
      rgb: [
        255,
        245,
        237
      ]
    },
    {
      code: "H13",
      name: "Pale Yellow",
      hex: "#F5ECD2",
      rgb: [
        245,
        236,
        210
      ]
    },
    {
      code: "H14",
      name: "Off White",
      hex: "#CFD7D3",
      rgb: [
        207,
        215,
        211
      ]
    },
    {
      code: "H15",
      name: "Light Grey",
      hex: "#98A6A8",
      rgb: [
        152,
        166,
        168
      ]
    },
    {
      code: "H16",
      name: "Deep Muted Red",
      hex: "#1D1414",
      rgb: [
        29,
        20,
        20
      ]
    },
    {
      code: "H17",
      name: "Pale Muted Red",
      hex: "#F1EDED",
      rgb: [
        241,
        237,
        237
      ]
    },
    {
      code: "H18",
      name: "Pale Yellow",
      hex: "#FFFDF0",
      rgb: [
        255,
        253,
        240
      ]
    },
    {
      code: "H19",
      name: "Pale Orange",
      hex: "#F6EFE2",
      rgb: [
        246,
        239,
        226
      ]
    },
    {
      code: "H20",
      name: "Light Grey",
      hex: "#949FA3",
      rgb: [
        148,
        159,
        163
      ]
    },
    {
      code: "H21",
      name: "Pale Yellow",
      hex: "#FFFBE1",
      rgb: [
        255,
        251,
        225
      ]
    },
    {
      code: "H22",
      name: "Light Muted Blue",
      hex: "#CACAD4",
      rgb: [
        202,
        202,
        212
      ]
    },
    {
      code: "H23",
      name: "Grey",
      hex: "#9A9D94",
      rgb: [
        154,
        157,
        148
      ]
    },
    {
      code: "M1",
      name: "Light Muted Green",
      hex: "#BCC6B8",
      rgb: [
        188,
        198,
        184
      ]
    },
    {
      code: "M2",
      name: "Muted Green",
      hex: "#8AA386",
      rgb: [
        138,
        163,
        134
      ]
    },
    {
      code: "M3",
      name: "Grey",
      hex: "#697D80",
      rgb: [
        105,
        125,
        128
      ]
    },
    {
      code: "M4",
      name: "Light Orange",
      hex: "#E3D2BC",
      rgb: [
        227,
        210,
        188
      ]
    },
    {
      code: "M5",
      name: "Light Yellow",
      hex: "#D0CCAA",
      rgb: [
        208,
        204,
        170
      ]
    },
    {
      code: "M6",
      name: "Muted Yellow",
      hex: "#B0A782",
      rgb: [
        176,
        167,
        130
      ]
    },
    {
      code: "M7",
      name: "Muted Orange",
      hex: "#B4A497",
      rgb: [
        180,
        164,
        151
      ]
    },
    {
      code: "M8",
      name: "Muted Red",
      hex: "#B38281",
      rgb: [
        179,
        130,
        129
      ]
    },
    {
      code: "M9",
      name: "Muted Orange",
      hex: "#A58767",
      rgb: [
        165,
        135,
        103
      ]
    },
    {
      code: "M10",
      name: "Light Muted Pink",
      hex: "#C5B2BC",
      rgb: [
        197,
        178,
        188
      ]
    },
    {
      code: "M11",
      name: "Muted Pink",
      hex: "#9F7594",
      rgb: [
        159,
        117,
        148
      ]
    },
    {
      code: "M12",
      name: "Dark Muted Red",
      hex: "#644749",
      rgb: [
        100,
        71,
        73
      ]
    },
    {
      code: "M13",
      name: "Orange",
      hex: "#D19066",
      rgb: [
        209,
        144,
        102
      ]
    },
    {
      code: "M14",
      name: "Red",
      hex: "#C77362",
      rgb: [
        199,
        115,
        98
      ]
    },
    {
      code: "M15",
      name: "Grey",
      hex: "#757D78",
      rgb: [
        117,
        125,
        120
      ]
    },
    {
      code: "P1",
      name: "Pale Pink",
      hex: "#FCF8F9",
      rgb: [
        252,
        248,
        249
      ]
    },
    {
      code: "P2",
      name: "Silver",
      hex: "#B0A9AC",
      rgb: [
        176,
        169,
        172
      ]
    },
    {
      code: "P3",
      name: "Green",
      hex: "#AFDCAB",
      rgb: [
        175,
        220,
        171
      ]
    },
    {
      code: "P4",
      name: "Light Red",
      hex: "#FEA49F",
      rgb: [
        254,
        164,
        159
      ]
    },
    {
      code: "P5",
      name: "Orange",
      hex: "#EC8D3D",
      rgb: [
        236,
        141,
        61
      ]
    },
    {
      code: "P6",
      name: "Mint",
      hex: "#5FD0A7",
      rgb: [
        95,
        208,
        167
      ]
    },
    {
      code: "P7",
      name: "Vermilion",
      hex: "#EB9271",
      rgb: [
        235,
        146,
        113
      ]
    },
    {
      code: "P8",
      name: "Amber",
      hex: "#F0D958",
      rgb: [
        240,
        217,
        88
      ]
    },
    {
      code: "P9",
      name: "Light Grey",
      hex: "#D9D9D9",
      rgb: [
        217,
        217,
        217
      ]
    },
    {
      code: "P10",
      name: "Light Violet",
      hex: "#D9C7EA",
      rgb: [
        217,
        199,
        234
      ]
    },
    {
      code: "P11",
      name: "Light Amber",
      hex: "#F3ECC9",
      rgb: [
        243,
        236,
        201
      ]
    },
    {
      code: "P12",
      name: "Pale Cyan",
      hex: "#E6EEF1",
      rgb: [
        230,
        238,
        241
      ]
    },
    {
      code: "P13",
      name: "Light Sky",
      hex: "#AACBEF",
      rgb: [
        170,
        203,
        239
      ]
    },
    {
      code: "P14",
      name: "Deep Sky",
      hex: "#3177B0",
      rgb: [
        49,
        119,
        176
      ]
    },
    {
      code: "P15",
      name: "Deep Mint",
      hex: "#668575",
      rgb: [
        102,
        133,
        117
      ]
    },
    {
      code: "P16",
      name: "Orange",
      hex: "#FFBE46",
      rgb: [
        255,
        190,
        70
      ]
    },
    {
      code: "P17",
      name: "Orange",
      hex: "#FEA324",
      rgb: [
        254,
        163,
        36
      ]
    },
    {
      code: "P18",
      name: "Light Vermilion",
      hex: "#FEB89F",
      rgb: [
        254,
        184,
        159
      ]
    },
    {
      code: "P19",
      name: "Pale Pink",
      hex: "#FFE0E8",
      rgb: [
        255,
        224,
        232
      ]
    },
    {
      code: "P20",
      name: "Light Pink",
      hex: "#FEBECF",
      rgb: [
        254,
        190,
        207
      ]
    },
    {
      code: "P21",
      name: "Light Pink",
      hex: "#ECBEC0",
      rgb: [
        236,
        190,
        192
      ]
    },
    {
      code: "P22",
      name: "Red",
      hex: "#E4A89F",
      rgb: [
        228,
        168,
        159
      ]
    },
    {
      code: "P23",
      name: "Deep Pink",
      hex: "#A56269",
      rgb: [
        165,
        98,
        105
      ]
    },
    {
      code: "Q2",
      name: "Yellow",
      hex: "#E9EC91",
      rgb: [
        233,
        236,
        145
      ]
    },
    {
      code: "Q5",
      name: "Teal",
      hex: "#76CEDE",
      rgb: [
        118,
        206,
        222
      ]
    },
    {
      code: "R1",
      name: "Deep Pink",
      hex: "#D50E21",
      rgb: [
        213,
        14,
        33
      ]
    },
    {
      code: "R2",
      name: "Pink",
      hex: "#F92F83",
      rgb: [
        249,
        47,
        131
      ]
    },
    {
      code: "R3",
      name: "Orange",
      hex: "#FD8225",
      rgb: [
        253,
        130,
        37
      ]
    },
    {
      code: "R4",
      name: "Yellow",
      hex: "#F8EC31",
      rgb: [
        248,
        236,
        49
      ]
    },
    {
      code: "R5",
      name: "Deep Green",
      hex: "#34C75B",
      rgb: [
        52,
        199,
        91
      ]
    },
    {
      code: "R6",
      name: "Deep Mint",
      hex: "#25B891",
      rgb: [
        37,
        184,
        145
      ]
    },
    {
      code: "R7",
      name: "Deep Cyan",
      hex: "#19779D",
      rgb: [
        25,
        119,
        157
      ]
    },
    {
      code: "R8",
      name: "Deep Sky",
      hex: "#1A60C3",
      rgb: [
        26,
        96,
        195
      ]
    },
    {
      code: "R9",
      name: "Deep Violet",
      hex: "#9A56B4",
      rgb: [
        154,
        86,
        180
      ]
    },
    {
      code: "R10",
      name: "Amber",
      hex: "#FFDB4D",
      rgb: [
        255,
        219,
        77
      ]
    },
    {
      code: "R11",
      name: "Pale Magenta",
      hex: "#FFEBFA",
      rgb: [
        255,
        235,
        250
      ]
    },
    {
      code: "R12",
      name: "Light Amber",
      hex: "#D8D5CE",
      rgb: [
        216,
        213,
        206
      ]
    },
    {
      code: "R13",
      name: "Charcoal",
      hex: "#55514C",
      rgb: [
        85,
        81,
        76
      ]
    },
    {
      code: "T1",
      name: "White",
      hex: "#FFFFFF",
      rgb: [
        255,
        255,
        255
      ]
    },
    {
      code: "Y1",
      name: "Magenta",
      hex: "#FD6FB4",
      rgb: [
        253,
        111,
        180
      ]
    },
    {
      code: "Y2",
      name: "Vermilion",
      hex: "#FEB481",
      rgb: [
        254,
        180,
        129
      ]
    },
    {
      code: "Y3",
      name: "Light Lime",
      hex: "#D7FAA0",
      rgb: [
        215,
        250,
        160
      ]
    },
    {
      code: "Y4",
      name: "Cyan",
      hex: "#8BDBFA",
      rgb: [
        139,
        219,
        250
      ]
    },
    {
      code: "Y5",
      name: "Purple",
      hex: "#E987EA",
      rgb: [
        233,
        135,
        234
      ]
    }
  ]
};

// ../../packages/pattern-engine/src/palettes.ts
var PALETTES = [perler_default, artkal_s_default, hama_default, mard_221_default, mard_264_default];
var DEFAULT_PALETTE_ID = "perler";
function getPalette(id) {
  var _a;
  return (_a = PALETTES.find((p) => p.id === id)) != null ? _a : PALETTES[0];
}
function regularColorIndices(palette) {
  const out = [];
  palette.colors.forEach((c, i) => {
    if (!c.specialty) out.push(i);
  });
  return out;
}

// ../../packages/pattern-engine/src/sections.ts
var ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function splitSections(width, height, board = 29) {
  if (width <= 0 || height <= 0 || board <= 0) return [];
  const out = [];
  const rows = Math.ceil(height / board);
  const cols = Math.ceil(width / board);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * board;
      const y = r * board;
      const label = `${ROW_LETTERS[r % 26]}${c + 1}`;
      out.push({ id: label, label, x, y, w: Math.min(board, width - x), h: Math.min(board, height - y) });
    }
  }
  return out;
}
function sectionCellIndices(section, width) {
  const out = [];
  for (let y = section.y; y < section.y + section.h; y++) {
    for (let x = section.x; x < section.x + section.w; x++) out.push(y * width + x);
  }
  return out;
}
function sectionAt(sections, x, y) {
  return sections.find((s) => x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h);
}

// ../../packages/pattern-engine/src/stats.ts
function countColors(cells) {
  var _a;
  const map = /* @__PURE__ */ new Map();
  for (let i = 0; i < cells.length; i++) if (cells[i] >= 0) map.set(cells[i], ((_a = map.get(cells[i])) != null ? _a : 0) + 1);
  return [...map.entries()].map(([color, count]) => ({ color, count })).sort((a, b) => b.count - a.count || a.color - b.color);
}
function estimate(pattern, colorCount) {
  const beads = beadCount(pattern);
  let changes = 0;
  for (let y = 0; y < pattern.height; y++) {
    for (let x = 1; x < pattern.width; x++) {
      const i = y * pattern.width + x;
      if (pattern.cells[i] >= 0 && pattern.cells[i - 1] >= 0 && pattern.cells[i] !== pattern.cells[i - 1]) changes++;
    }
  }
  const pairs = Math.max(1, pattern.height * (pattern.width - 1));
  const frag = changes / pairs;
  const secondsPerBead = 2.5 + frag * 4 + colorCount * 0.05;
  const minutes = Math.round(beads * secondsPerBead / 60 / 5) * 5;
  const score = beads / 1e3 + colorCount / 8 + frag * 4;
  const difficulty = score < 3 ? "easy" : score < 7 ? "medium" : "hard";
  return { difficulty, minutes: Math.max(5, minutes) };
}
function beadCount(pattern) {
  let n = 0;
  for (const c of pattern.cells) if (c >= 0) n++;
  return n;
}

// ../../packages/pattern-engine/src/packs.ts
function withAllowance(count, allowance) {
  return Math.ceil(Math.round(count * (1 + allowance) * 1e6) / 1e6);
}
function pickPacks(need, packSizes) {
  var _a;
  const sizes = [...new Set(packSizes)].filter((s) => s > 0).sort((a, b) => b - a);
  if (need <= 0 || sizes.length === 0) return [];
  const smallest = sizes[sizes.length - 1];
  const limit = need + smallest;
  const best = new Array(limit + 1).fill(Infinity);
  const from = new Array(limit + 1).fill(-1);
  best[0] = 0;
  for (let t = 1; t <= limit; t++) {
    for (const s of sizes) {
      if (s <= t && best[t - s] + 1 < best[t]) {
        best[t] = best[t - s] + 1;
        from[t] = s;
      }
    }
  }
  let total = need;
  while (total <= limit && best[total] === Infinity) total++;
  const counts = /* @__PURE__ */ new Map();
  for (let t = total; t > 0; t -= from[t]) counts.set(from[t], ((_a = counts.get(from[t])) != null ? _a : 0) + 1);
  return sizes.filter((s) => counts.has(s)).map((s) => ({ size: s, qty: counts.get(s) }));
}
function packTotal(picks) {
  return picks.reduce((sum, p) => sum + p.size * p.qty, 0);
}

// ../../packages/pattern-engine/src/color.ts
function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function linearToSrgb(v) {
  const c = v <= 31308e-7 ? v * 12.92 : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(c * 255)));
}
var XN = 0.95047;
var YN = 1;
var ZN = 1.08883;
var f = (t) => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
function linearRgbToLab(r, g, b) {
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / XN;
  const y = (0.2126729 * r + 0.7151522 * g + 0.072175 * b) / YN;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / ZN;
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function rgbToLab([r, g, b]) {
  return linearRgbToLab(srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
}
var RAD = Math.PI / 180;
var POW25_7 = 25 ** 7;
function deltaE2000(l1, l2) {
  const [L1, a1, b1] = l1;
  const [L2, a2, b2] = l2;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar7 = ((C1 + C2) / 2) ** 7;
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + POW25_7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h1p = C1p === 0 ? 0 : (Math.atan2(b1, a1p) / RAD + 360) % 360;
  const h2p = C2p === 0 ? 0 : (Math.atan2(b2, a2p) / RAD + 360) % 360;
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2 * RAD);
  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;
  let hbarp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbarp /= 2;
    else hbarp = h1p + h2p < 360 ? (hbarp + 360) / 2 : (hbarp - 360) / 2;
  }
  const T = 1 - 0.17 * Math.cos((hbarp - 30) * RAD) + 0.24 * Math.cos(2 * hbarp * RAD) + 0.32 * Math.cos((3 * hbarp + 6) * RAD) - 0.2 * Math.cos((4 * hbarp - 63) * RAD);
  const dTheta = 30 * Math.exp(-(((hbarp - 275) / 25) ** 2));
  const Cbarp7 = Cbarp ** 7;
  const Rc = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + POW25_7));
  const Sl = 1 + 0.015 * (Lbarp - 50) ** 2 / Math.sqrt(20 + (Lbarp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbarp;
  const Sh = 1 + 0.015 * Cbarp * T;
  const Rt = -Math.sin(2 * dTheta * RAD) * Rc;
  const l = dLp / Sl;
  const c = dCp / Sc;
  const h = dHp / Sh;
  return Math.sqrt(l * l + c * c + h * h + Rt * c * h);
}

// ../../packages/pattern-engine/src/background.ts
var EMPTY = -1;
function backdropOf(lab, w, h, tol = 10) {
  const edge = [];
  for (let x = 0; x < w; x++) edge.push(x, (h - 1) * w + x);
  for (let y = 1; y < h - 1; y++) edge.push(y * w, y * w + w - 1);
  const median = (k) => {
    const v = edge.map((i) => lab[i * 3 + k]).sort((a, b) => a - b);
    return v[v.length >> 1];
  };
  const bg = [median(0), median(1), median(2)];
  const near = edge.filter((i) => Math.hypot(lab[i * 3] - bg[0], lab[i * 3 + 1] - bg[1], lab[i * 3 + 2] - bg[2]) <= tol).length;
  return near >= edge.length * 0.6 ? bg : null;
}
function labGrid(img, width, height) {
  const rgb = downsampleLinear(img, width, height);
  const out = new Float32Array(rgb.length);
  for (let i = 0; i < rgb.length; i += 3) {
    const [L, a, b] = linearRgbToLab(rgb[i], rgb[i + 1], rgb[i + 2]);
    out[i] = L;
    out[i + 1] = a;
    out[i + 2] = b;
  }
  return out;
}
function floodFromEdge(width, height, isBg) {
  const mask = new Uint8Array(width * height);
  const queue = [];
  const push = (i) => {
    if (!mask[i] && isBg(i)) {
      mask[i] = 1;
      queue.push(i);
    }
  };
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    if (x > 0) push(i - 1);
    if (x < width - 1) push(i + 1);
    if (i >= width) push(i - width);
    if (i < (height - 1) * width) push(i + width);
  }
  return mask;
}
function removeBackdrop(cells, width, height, paletteLabs, tol = 6) {
  var _a;
  const edge = [];
  for (let x = 0; x < width; x++) edge.push(cells[x], cells[(height - 1) * width + x]);
  for (let y = 1; y < height - 1; y++) edge.push(cells[y * width], cells[y * width + width - 1]);
  const freq = /* @__PURE__ */ new Map();
  for (const c of edge) if (c >= 0) freq.set(c, ((_a = freq.get(c)) != null ? _a : 0) + 1);
  let bg = -1;
  let best = 0;
  for (const [c, n] of freq) if (n > best) [bg, best] = [c, n];
  if (bg < 0) return cells;
  const memo = /* @__PURE__ */ new Map();
  const near = (c) => {
    if (c === bg) return true;
    if (c < 0) return false;
    let v = memo.get(c);
    if (v === void 0) {
      v = deltaE2000(paletteLabs[c], paletteLabs[bg]) <= tol;
      memo.set(c, v);
    }
    return v;
  };
  if (edge.filter(near).length < edge.length * 0.6) return cells;
  const mask = floodFromEdge(width, height, (i) => near(cells[i]));
  return cells.map((c, i) => mask[i] ? EMPTY : c);
}
function subjectBox(img, pad = 0.05) {
  const long = 128;
  const gw = img.width >= img.height ? long : Math.max(1, Math.round(long * img.width / img.height));
  const gh = img.width >= img.height ? Math.max(1, Math.round(long * img.height / img.width)) : long;
  const lab = labGrid(img, gw, gh);
  const bg = backdropOf(lab, gw, gh);
  if (!bg) return null;
  const mask = floodFromEdge(gw, gh, (i) => Math.hypot(lab[i * 3] - bg[0], lab[i * 3 + 1] - bg[1], lab[i * 3 + 2] - bg[2]) <= 10);
  let x0 = gw;
  let y0 = gh;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < gh; y++)
    for (let x = 0; x < gw; x++)
      if (!mask[y * gw + x]) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return null;
  const sx = img.width / gw;
  const sy = img.height / gh;
  let bx = x0 * sx;
  let by = y0 * sy;
  let bw = (x1 + 1) * sx - bx;
  let bh = (y1 + 1) * sy - by;
  const p = pad * Math.max(bw, bh);
  bx -= p;
  by -= p;
  bw += 2 * p;
  bh += 2 * p;
  const aspect = img.width / img.height;
  if (bw / bh < aspect) {
    const nw = bh * aspect;
    bx -= (nw - bw) / 2;
    bw = nw;
  } else {
    const nh = bw / aspect;
    by -= (nh - bh) / 2;
    bh = nh;
  }
  if (bw >= img.width * 0.92 || bh >= img.height * 0.92) return null;
  bx = Math.min(Math.max(0, bx), img.width - bw);
  by = Math.min(Math.max(0, by), img.height - bh);
  return { x: Math.round(bx), y: Math.round(by), w: Math.round(bw), h: Math.round(bh) };
}

// ../../packages/pattern-engine/src/pixel.ts
var PIXEL_ART = {
  /** Upper bound on colors. */
  maxColors: 16,
  /** Colors closer than this (CIEDE2000) are always merged into one, even under maxColors. */
  similarDeltaE: 6,
  /** Regions (4-connected, same color) smaller than this are merged into their surroundings… */
  minRegion: 3,
  /** …but only when the surrounding color is this close (CIEDE2000): high-contrast details stay. */
  mergeDeltaE: 12
};
function mergeSimilarColors(cells, paletteLabs, maxColors = PIXEL_ART.maxColors, similarDeltaE = PIXEL_ART.similarDeltaE) {
  var _a;
  const counts = /* @__PURE__ */ new Map();
  for (const c of cells) if (c >= 0) counts.set(c, ((_a = counts.get(c)) != null ? _a : 0) + 1);
  const into = /* @__PURE__ */ new Map();
  for (; ; ) {
    const used = [...counts.keys()];
    if (used.length <= 1) break;
    let a = -1;
    let b = -1;
    let best = Infinity;
    for (let i = 0; i < used.length; i++)
      for (let j = i + 1; j < used.length; j++) {
        const d = deltaE2000(paletteLabs[used[i]], paletteLabs[used[j]]);
        if (d < best) {
          best = d;
          a = used[i];
          b = used[j];
        }
      }
    if (used.length <= maxColors && best > similarDeltaE) break;
    const [keep, drop] = counts.get(a) >= counts.get(b) ? [a, b] : [b, a];
    counts.set(keep, counts.get(keep) + counts.get(drop));
    counts.delete(drop);
    into.set(drop, keep);
    for (const [k, v] of into) if (v === drop) into.set(k, keep);
  }
  return cells.map((c) => {
    var _a2;
    return c >= 0 ? (_a2 = into.get(c)) != null ? _a2 : c : c;
  });
}
function mergeSmallRegions(cells, width, height, paletteLabs, minSize = PIXEL_ART.minRegion, maxDeltaE = PIXEL_ART.mergeDeltaE) {
  var _a;
  const out = cells.slice();
  const n = width * height;
  const region = new Int32Array(n);
  for (let pass = 0; pass < 3; pass++) {
    region.fill(-1);
    let changed = false;
    for (let start = 0; start < n; start++) {
      if (region[start] !== -1) continue;
      const color = out[start];
      const cellsOf = [start];
      region[start] = start;
      for (let k = 0; k < cellsOf.length; k++) {
        const i = cellsOf[k];
        const x = i % width;
        const nb = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i >= width ? i - width : -1, i < n - width ? i + width : -1];
        for (const j of nb) {
          if (j >= 0 && region[j] === -1 && out[j] === color) {
            region[j] = start;
            cellsOf.push(j);
          }
        }
      }
      if (color < 0 || cellsOf.length >= minSize) continue;
      const border = /* @__PURE__ */ new Map();
      for (const i of cellsOf) {
        const x = i % width;
        for (const j of [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i >= width ? i - width : -1, i < n - width ? i + width : -1]) {
          if (j < 0) continue;
          const c = out[j];
          if (c >= 0 && c !== color) border.set(c, ((_a = border.get(c)) != null ? _a : 0) + 1);
        }
      }
      let best = -1;
      let bestCount = 0;
      let bestD = Infinity;
      for (const [c, count] of border) {
        const d = deltaE2000(paletteLabs[color], paletteLabs[c]);
        if (count > bestCount || count === bestCount && d < bestD) {
          best = c;
          bestCount = count;
          bestD = d;
        }
      }
      if (best < 0 || bestD > maxDeltaE) continue;
      for (const i of cellsOf) out[i] = best;
      changed = true;
    }
    if (!changed) break;
  }
  return out;
}

// ../../packages/pattern-engine/src/generate.ts
var SHARPEN = [-0.7, -0.35, 0, 0.45, 0.9];
var MIN_SHARE = [0.012, 7e-3, 4e-3, 2e-3, 1e-3];
var LINE_BOOST = [0, 0.8, 1.6, 2.6, 4];
var DESPECKLE_MAX_DETAIL = 3;
function downsampleLinear(img, width, height) {
  const out = new Float32Array(width * height * 3);
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) lut[i] = srgbToLinear(i);
  const sx = img.width / width;
  const sy = img.height / height;
  for (let gy = 0; gy < height; gy++) {
    const y0 = Math.floor(gy * sy);
    const y1 = Math.max(y0 + 1, Math.floor((gy + 1) * sy));
    for (let gx = 0; gx < width; gx++) {
      const x0 = Math.floor(gx * sx);
      const x1 = Math.max(x0 + 1, Math.floor((gx + 1) * sx));
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let y = y0; y < y1 && y < img.height; y++) {
        for (let x = x0; x < x1 && x < img.width; x++) {
          const p = (y * img.width + x) * 4;
          const a = img.data[p + 3] / 255;
          r += lut[img.data[p]] * a + (1 - a);
          g += lut[img.data[p + 1]] * a + (1 - a);
          b += lut[img.data[p + 2]] * a + (1 - a);
          n++;
        }
      }
      const o = (gy * width + gx) * 3;
      out[o] = r / Math.max(1, n);
      out[o + 1] = g / Math.max(1, n);
      out[o + 2] = b / Math.max(1, n);
    }
  }
  return out;
}
function adjustDetail(rgb, width, height, amount) {
  if (amount === 0) return rgb;
  const out = new Float32Array(rgb.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= height) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= width) continue;
            sum += rgb[(yy * width + xx) * 3 + c];
            n++;
          }
        }
        const i = (y * width + x) * 3 + c;
        const blur = sum / n;
        const v = amount < 0 ? rgb[i] + (blur - rgb[i]) * -amount : rgb[i] + (rgb[i] - blur) * amount;
        out[i] = Math.min(1, Math.max(0, v));
      }
    }
  }
  return out;
}
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
function kmeansLab(points, k, iterations = 12, seed = 1) {
  if (points.length === 0) return [];
  const rand = mulberry32(seed);
  k = Math.min(k, points.length);
  const centers = [points[Math.floor(rand() * points.length)].slice()];
  const d = new Float64Array(points.length).fill(Infinity);
  while (centers.length < k) {
    const last = centers[centers.length - 1];
    let total = 0;
    for (let i = 0; i < points.length; i++) {
      d[i] = Math.min(d[i], dist2(points[i], last));
      total += d[i];
    }
    if (total === 0) break;
    let r = rand() * total;
    let pick = 0;
    for (; pick < points.length - 1; pick++) {
      r -= d[pick];
      if (r <= 0) break;
    }
    centers.push(points[pick].slice());
  }
  const assign = new Int32Array(points.length);
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < points.length; i++) {
      let best = 0;
      let bd = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const dd = dist2(points[i], centers[c]);
        if (dd < bd) {
          bd = dd;
          best = c;
        }
      }
      assign[i] = best;
    }
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < points.length; i++) {
      const s = sums[assign[i]];
      s[0] += points[i][0];
      s[1] += points[i][1];
      s[2] += points[i][2];
      s[3]++;
    }
    sums.forEach((s, c) => {
      if (s[3]) centers[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]];
    });
  }
  return centers;
}
function nearestColor(lab, candidates, paletteLabs) {
  let best = candidates[0];
  let bd = Infinity;
  for (const c of candidates) {
    const d = deltaE2000(lab, paletteLabs[c]);
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  return best;
}
function imageLab(img) {
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) lut[i] = srgbToLinear(i);
  const n = img.width * img.height;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = img.data[i * 4 + 3] / 255;
    const lab = linearRgbToLab(
      lut[img.data[i * 4]] * a + (1 - a),
      lut[img.data[i * 4 + 1]] * a + (1 - a),
      lut[img.data[i * 4 + 2]] * a + (1 - a)
    );
    out[i * 3] = lab[0];
    out[i * 3 + 1] = lab[1];
    out[i * 3 + 2] = lab[2];
  }
  return out;
}
function looksLikeIllustration(img) {
  var _a;
  const step = Math.max(1, Math.floor(Math.max(img.width, img.height) / 200));
  const w = Math.floor(img.width / step);
  const h = Math.floor(img.height / step);
  const lab = imageLab(img);
  const L = new Float32Array(w * h);
  const bins = /* @__PURE__ */ new Map();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * step * img.width + x * step) * 3;
      L[y * w + x] = lab[p];
      const key = (Math.floor(lab[p] / 6) * 64 + Math.floor(lab[p + 1] / 6) + 32) * 64 + Math.floor(lab[p + 2] / 6) + 32;
      bins.set(key, ((_a = bins.get(key)) != null ? _a : 0) + 1);
    }
  }
  const D = 3;
  let lines = 0;
  let total = 0;
  for (let y = D; y < h - D; y++) {
    for (let x = D; x < w - D; x++) {
      const v = L[y * w + x];
      const horiz = v < L[y * w + x - D] - 20 && v < L[y * w + x + D] - 20;
      const vert = v < L[(y - D) * w + x] - 20 && v < L[(y + D) * w + x] - 20;
      if (horiz || vert) lines++;
      total++;
    }
  }
  if (lines / Math.max(1, total) >= 0.015) return true;
  const counts = [...bins.values()].sort((a, b) => b - a);
  let covered = 0;
  for (let k = 0; k < Math.min(12, counts.length); k++) covered += counts[k];
  return covered / (w * h) >= 0.8;
}
function despeckle(cells, width, height) {
  var _a;
  const out = cells.slice();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const nb = [];
      if (x > 0) nb.push(cells[i - 1]);
      if (x < width - 1) nb.push(cells[i + 1]);
      if (y > 0) nb.push(cells[i - width]);
      if (y < height - 1) nb.push(cells[i + width]);
      if (nb.includes(cells[i])) continue;
      const counts = /* @__PURE__ */ new Map();
      for (const c of nb) counts.set(c, ((_a = counts.get(c)) != null ? _a : 0) + 1);
      for (const [c, n] of counts) if (n >= 3 || n >= 2 && nb.length === 2) out[i] = c;
    }
  }
  return out;
}
function chooseColors(points, weights, regular, paletteLabs, maxColors, minCount) {
  const k = Math.min(256, Math.max(maxColors + 4, Math.round(maxColors * 1.6)));
  let chosen = [...new Set(kmeansLab(points, k).map((c) => nearestColor(c, regular, paletteLabs)))];
  for (; ; ) {
    if (chosen.length <= 1) return chosen;
    const counts = weights(chosen);
    const used = chosen.filter((c) => {
      var _a;
      return ((_a = counts.get(c)) != null ? _a : 0) > 0;
    }).sort((a, b) => counts.get(a) - counts.get(b));
    const rare = used.filter((c) => counts.get(c) < minCount);
    const over = used.length - maxColors;
    if (over <= 0 && rare.length === 0 && used.length === chosen.length) return chosen;
    const drop = Math.max(rare.length ? 1 : 0, over > 0 ? Math.max(1, Math.ceil(over / 3)) : 0);
    chosen = used.slice(Math.min(drop, used.length - 1));
  }
}
function generatePattern(img, opts) {
  var _a;
  const { palette, width: W, height: H } = opts;
  const pixel = !!opts.pixelArt;
  const detail = Math.min(5, Math.max(1, Math.round(opts.detail)));
  const maxColors = Math.max(1, Math.floor(opts.maxColors));
  const dithering = opts.dithering && !pixel;
  const share = (_a = opts.minShare) != null ? _a : MIN_SHARE[detail - 1] * Math.min(1, 28 / maxColors);
  const minCount = Math.max(1, Math.round(W * H * share));
  const style = opts.style && opts.style !== "auto" ? opts.style : looksLikeIllustration(img) ? "illustration" : "photo";
  const paletteLabs = palette.colors.map((c) => rgbToLab(c.rgb));
  const regular = regularColorIndices(palette);
  const cache = /* @__PURE__ */ new Map();
  const nearestCached = (lab, set, tag) => {
    const key = `${tag}|${Math.round(lab[0] * 2)},${Math.round(lab[1] * 2)},${Math.round(lab[2] * 2)}`;
    let v = cache.get(key);
    if (v === void 0) {
      v = nearestColor(lab, set, paletteLabs);
      cache.set(key, v);
    }
    return v;
  };
  let cells;
  if (style === "illustration") {
    const src = imageLab(img);
    const n = img.width * img.height;
    const px = (i) => [src[i * 3], src[i * 3 + 1], src[i * 3 + 2]];
    const owner = new Int32Array(n);
    const sx = W / img.width;
    const sy = H / img.height;
    for (let y = 0; y < img.height; y++) {
      const gy = Math.min(H - 1, Math.floor(y * sy));
      for (let x = 0; x < img.width; x++) owner[y * img.width + x] = gy * W + Math.min(W - 1, Math.floor(x * sx));
    }
    const boost = LINE_BOOST[detail - 1];
    const lightness = Array.from({ length: W * H }, () => []);
    for (let i = 0; i < n; i++) lightness[owner[i]].push(src[i * 3]);
    const median = lightness.map((ls) => {
      ls.sort((a, b) => a - b);
      return ls.length ? ls[ls.length >> 1] : 50;
    });
    const weight = new Float32Array(n);
    for (let i = 0; i < n; i++) weight[i] = 1 + boost * Math.max(0, Math.min(1.5, (median[owner[i]] - src[i * 3]) / 25));
    const keyIndex = /* @__PURE__ */ new Map();
    const uniq = [];
    const pixU = new Int32Array(n);
    for (let i = 0; i < n; i++) {
      const key = (Math.round(src[i * 3] * 2) * 513 + Math.round(src[i * 3 + 1] * 2) + 256) * 513 + Math.round(src[i * 3 + 2] * 2) + 256;
      let u = keyIndex.get(key);
      if (u === void 0) {
        u = uniq.length;
        keyIndex.set(key, u);
        uniq.push(px(i));
      }
      pixU[i] = u;
    }
    const vote = (set) => {
      const nearestU = new Int32Array(uniq.length);
      for (let u = 0; u < uniq.length; u++) {
        let best = 0;
        let bd = Infinity;
        for (let j = 0; j < set.length; j++) {
          const d = dist2(uniq[u], paletteLabs[set[j]]);
          if (d < bd) {
            bd = d;
            best = j;
          }
        }
        nearestU[u] = best;
      }
      const k = set.length;
      const tally = new Float32Array(W * H * k);
      for (let i = 0; i < n; i++) tally[owner[i] * k + nearestU[pixU[i]]] += weight[i];
      const out = new Array(W * H);
      for (let c = 0; c < W * H; c++) {
        let best = 0;
        for (let j = 1; j < k; j++) if (tally[c * k + j] > tally[c * k + best]) best = j;
        out[c] = set[best];
      }
      return out;
    };
    const sample = [];
    const stride = Math.max(1, Math.floor(n / 8e3));
    for (let i = 0; i < n; i += stride) sample.push(px(i));
    const chosen = chooseColors(
      sample,
      (set) => {
        var _a2;
        const counts = /* @__PURE__ */ new Map();
        for (const c of vote(set)) counts.set(c, ((_a2 = counts.get(c)) != null ? _a2 : 0) + 1);
        return counts;
      },
      regular,
      paletteLabs,
      maxColors,
      minCount
    );
    cells = vote(chosen);
  } else {
    const rgb = adjustDetail(downsampleLinear(img, W, H), W, H, SHARPEN[detail - 1]);
    const labs = new Array(W * H);
    for (let i = 0; i < W * H; i++) labs[i] = linearRgbToLab(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
    let version = 0;
    const chosen = chooseColors(
      labs,
      (set) => {
        var _a2;
        const tag = `p${version++}`;
        const counts = /* @__PURE__ */ new Map();
        for (const l of labs) {
          const c = nearestCached(l, set, tag);
          counts.set(c, ((_a2 = counts.get(c)) != null ? _a2 : 0) + 1);
        }
        return counts;
      },
      regular,
      paletteLabs,
      maxColors,
      minCount
    );
    if (dithering && chosen.length > 1) cells = ditherLab(labs, W, H, chosen, paletteLabs);
    else cells = labs.map((l) => nearestCached(l, chosen, "final"));
  }
  if (detail <= DESPECKLE_MAX_DETAIL && !dithering) cells = despeckle(cells, W, H);
  if (pixel) cells = mergeSmallRegions(mergeSimilarColors(cells, paletteLabs), W, H, paletteLabs);
  if (opts.removeBackground) cells = removeBackdrop(cells, W, H, paletteLabs);
  return { width: W, height: H, paletteId: palette.id, cells };
}
var DITHER_REACH = 8;
function ditherLab(labs, W, H, chosen, paletteLabs) {
  const err = labs.map((l) => l.slice());
  const out = new Array(W * H);
  for (let y = 0; y < H; y++) {
    const ltr = y % 2 === 0;
    for (let s = 0; s < W; s++) {
      const x = ltr ? s : W - 1 - s;
      const i = y * W + x;
      const target = err[i];
      let nearest = Infinity;
      for (const c2 of chosen) nearest = Math.min(nearest, dist2(labs[i], paletteLabs[c2]));
      const reach = (Math.sqrt(nearest) + DITHER_REACH) ** 2;
      const allowed = chosen.filter((c2) => dist2(labs[i], paletteLabs[c2]) <= reach);
      const c = nearestColor(target, allowed, paletteLabs);
      out[i] = c;
      const p = paletteLabs[c];
      const e = [0, 1, 2].map((j) => Math.max(-20, Math.min(20, target[j] - p[j])));
      const dir = ltr ? 1 : -1;
      const spread = (dx, dy, w) => {
        const xx = x + dx * dir;
        const yy = y + dy;
        if (xx < 0 || xx >= W || yy >= H) return;
        const t = err[yy * W + xx];
        t[0] += e[0] * w;
        t[1] += e[1] * w;
        t[2] += e[2] * w;
      };
      spread(1, 0, 7 / 16);
      spread(-1, 1, 3 / 16);
      spread(0, 1, 5 / 16);
      spread(1, 1, 1 / 16);
    }
  }
  return out;
}

// ../../packages/pattern-engine/src/detail.ts
function detailLoss(img, width, height, deltaE = 10) {
  return measure(img, width, height, deltaE).loss;
}
function measure(img, width, height, deltaE) {
  const fw = width * 2;
  const fh = height * 2;
  const fine = labGrid(img, fw, fh);
  const coarse = labGrid(img, width, height);
  const bg = backdropOf(fine, fw, fh, deltaE);
  let lost = 0;
  let subject = 0;
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      const f2 = (y * fw + x) * 3;
      if (!bg || Math.hypot(fine[f2] - bg[0], fine[f2 + 1] - bg[1], fine[f2 + 2] - bg[2]) > deltaE) subject++;
      const cx = x >> 1;
      const cy = y >> 1;
      let best = Infinity;
      for (let dy = -1; dy <= 1 && best > deltaE; dy++) {
        const yy = cy + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = cx + dx;
          if (xx < 0 || xx >= width) continue;
          const c = (yy * width + xx) * 3;
          const d = Math.hypot(fine[f2] - coarse[c], fine[f2 + 1] - coarse[c + 1], fine[f2 + 2] - coarse[c + 2]);
          if (d < best) best = d;
        }
      }
      if (best > deltaE) lost++;
    }
  }
  return { loss: lost / Math.max(subject, fw * fh * 0.15), subject: subject / (fw * fh) };
}
function recommendBoards(img, board, aspect, maxPerSide = 3, maxLoss = 0.05) {
  const losses = [];
  let subjectShare = 1;
  for (let n = 1; n <= maxPerSide; n++) {
    const long = board * n;
    const w = aspect >= 1 ? long : Math.max(1, Math.round(long * aspect));
    const h = aspect >= 1 ? Math.max(1, Math.round(long / aspect)) : long;
    const m = measure(img, w, h, 10);
    if (n === 1) subjectShare = m.subject;
    losses.push(m.loss);
    if (m.loss < maxLoss) return { perSide: n, losses, subjectShare };
  }
  return { perSide: maxPerSide, losses, subjectShare };
}
function gridLoss(coarse, fine, paletteLabs, deltaE = 10) {
  var _a;
  const memo = /* @__PURE__ */ new Map();
  const near = (a, b) => {
    if (a === b) return true;
    const key = a < b ? a * 65536 + b : b * 65536 + a;
    let v = memo.get(key);
    if (v === void 0) {
      v = deltaE2000(paletteLabs[a], paletteLabs[b]) <= deltaE;
      memo.set(key, v);
    }
    return v;
  };
  const edge = [];
  for (let x = 0; x < fine.width; x++) edge.push(fine.cells[x], fine.cells[(fine.height - 1) * fine.width + x]);
  for (let y = 1; y < fine.height - 1; y++) edge.push(fine.cells[y * fine.width], fine.cells[y * fine.width + fine.width - 1]);
  const freq = /* @__PURE__ */ new Map();
  for (const c of edge) if (c >= 0) freq.set(c, ((_a = freq.get(c)) != null ? _a : 0) + 1);
  let bg = -1;
  let best = 0;
  for (const [c, n] of freq) if (n > best) [bg, best] = [c, n];
  const nearBg = bg < 0 ? 0 : edge.filter((c) => c >= 0 && near(c, bg)).length;
  if (nearBg < edge.length * 0.6) bg = -1;
  const sx = coarse.width / fine.width;
  const sy = coarse.height / fine.height;
  const lostAt = new Uint8Array(fine.width * fine.height);
  let subject = 0;
  for (let y = 0; y < fine.height; y++) {
    const cy0 = Math.max(0, Math.min(coarse.height - 2, Math.floor((y + 0.5) * sy - 0.5)));
    for (let x = 0; x < fine.width; x++) {
      const c = fine.cells[y * fine.width + x];
      if (c < 0 || bg >= 0 && near(c, bg)) continue;
      subject++;
      const cx0 = Math.max(0, Math.min(coarse.width - 2, Math.floor((x + 0.5) * sx - 0.5)));
      const around = [];
      for (let yy = cy0; yy <= Math.min(coarse.height - 1, cy0 + 1); yy++)
        for (let xx = cx0; xx <= Math.min(coarse.width - 1, cx0 + 1); xx++) {
          const k = coarse.cells[yy * coarse.width + xx];
          if (k >= 0 && !around.includes(k)) around.push(k);
        }
      let kept = around.some((k) => near(k, c));
      for (let i = 0; i < around.length && !kept; i++)
        for (let j = i + 1; j < around.length && !kept; j++) kept = segmentDistance(paletteLabs[c], paletteLabs[around[i]], paletteLabs[around[j]]) <= deltaE;
      if (!kept) lostAt[y * fine.width + x] = 1;
    }
  }
  let lost = 0;
  for (let i = 0; i < lostAt.length; i++) {
    if (!lostAt[i]) continue;
    const x = i % fine.width;
    if (x > 0 && lostAt[i - 1] || x < fine.width - 1 && lostAt[i + 1] || lostAt[i - fine.width] || lostAt[i + fine.width]) lost++;
    else lost += 0.5;
  }
  return lost / Math.max(subject, fine.width * fine.height * 0.15);
}
function segmentDistance(p, a, b) {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / len2));
  return Math.hypot(p[0] - a[0] - t * ab[0], p[1] - a[1] - t * ab[1], p[2] - a[2] - t * ab[2]);
}
var BOARD_STEP_LOSS = [0.05, 0.1];
function chooseBoards(imageLosses, gridLosses, maxPerSide, steps = BOARD_STEP_LOSS) {
  let n = 1;
  while (n < maxPerSide) {
    const limit = steps[Math.min(n - 1, steps.length - 1)];
    if (!(imageLosses[n - 1] > limit && gridLosses[n - 1] > limit)) break;
    n++;
  }
  return n;
}
