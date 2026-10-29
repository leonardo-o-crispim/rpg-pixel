/**
 * data/sprites.js - GERADO por ferramentas/sprites.py. NAO EDITE A MAO:
 * altere o desenho no .py e rode `python ferramentas/sprites.py`.
 *
 * Formato: { contorno, cores: { letra: '#rrggbb' }, linhas: [...] }
 * '.' e transparente. O contorno de 1px e acrescentado por render/pixel.js.
 * Personagens olham para a direita; inimigos sao espelhados ao desenhar.
 */

export const SPRITES = {
  "heroi_cavaleiro": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#b9c6d8",
      "s": "#f4f8ff",
      "d": "#6e7d99",
      "b": "#3f7fe8",
      "n": "#2a56b0",
      "r": "#ff4f4f",
      "R": "#c02f3f",
      "L": "#ff9a8a",
      "y": "#ffcf3f",
      "Y": "#c8902a",
      "o": "#9a5a2a",
      "O": "#6a3a1a",
      "f": "#ffd6b0",
      "F": "#f0a888",
      "e": "#2a1830",
      "w": "#ffffff",
      "p": "#ff8a9a"
    },
    "linhas": [
      "....rrrrR.........",
      "...Rrrrmmsd....s..",
      "....rmmmmmmsd..ss.",
      "....mmmmmmmmmd.sd.",
      "...smmmmmmmmmmssd.",
      "...mmmmmfffffmmsd.",
      "..dmmmmfffffffmmd.",
      "...mmmfffwefwefsd.",
      "...dmmfffeefeeFsd.",
      "....dmmfpffffFpsd.",
      "..yyyymmfffffd.sd.",
      ".yrrrymmbbbmmd.sd.",
      ".yrLrrymbbbmmyyyyY",
      ".yrrrryooyooommoO.",
      ".Yrrrynbbnbbn..OO.",
      "..YYYY.dd.dd......",
      ".......dd.dd......",
      "......OOO.OOO....."
    ]
  },
  "heroi_mago": {
    "contorno": "#2a1830",
    "cores": {
      "p": "#8a4fe0",
      "P": "#5a2fa8",
      "q": "#b88aff",
      "h": "#ff8a4f",
      "H": "#c85a2f",
      "y": "#ffcf3f",
      "c": "#5ae8ff",
      "C": "#2aa0d8",
      "o": "#9a5a2a",
      "f": "#ffd6b0",
      "F": "#f0a888",
      "e": "#2a1830",
      "w": "#ffffff",
      "z": "#ff8a9a"
    },
    "linhas": [
      ".....qP........C..",
      ".....PpqP.....wcC.",
      "......pppqP..CcccC",
      ".....yyyyyyy..CcC.",
      "....qpppppppqP.C..",
      ".PPqppppppppppqpP.",
      "...PppppppppppPo..",
      "....hhhhhffffF.o..",
      "...hhhfffwefwe.o..",
      "...hhhfffeefee.o..",
      "...hhhffzffeF.zo..",
      "...hhhhhffffH.ff..",
      "...Hhhpyyyyypqqo..",
      "....HpppppppppPo..",
      ".....ppppppppP.o..",
      "....qpppppppppqo..",
      "....PPPPPPPPPPPo..",
      "......PP...PP..o.."
    ]
  },
  "heroi_arqueiro": {
    "contorno": "#2a1830",
    "cores": {
      "g": "#3fbf5a",
      "G": "#23853f",
      "K": "#8af07a",
      "t": "#b8743a",
      "T": "#7a4a22",
      "o": "#8a5228",
      "l": "#f4ecd8",
      "y": "#ffcf3f",
      "q": "#9a5a2a",
      "Q": "#6a3a1a",
      "a": "#ff5a4f",
      "h": "#8a4a22",
      "f": "#ffd6b0",
      "F": "#f0a888",
      "e": "#2a1830",
      "w": "#ffffff",
      "p": "#ff8a9a"
    },
    "linhas": [
      "..................",
      ".......KKKG.......",
      "..KKKKKggggKG..y..",
      "..gggggggggggG.lo.",
      "..GgggggggggggKlo.",
      "...gggghhhhhhgglo.",
      "...gggghffffffgl.o",
      "..aggggffwefwegl.o",
      "..aggggffeefeeGl.o",
      "..qqgggfpffefFplfo",
      "..qqqggggfffttttfo",
      "..qqggttttttT..l.o",
      "..qqggttttttT..lo.",
      "..qqggttttttT..lo.",
      "..QQgoooooooo..lo.",
      "....GGttTTttT..y..",
      "......TT..TT......",
      ".....ooo..ooo....."
    ]
  },
  "gosma": {
    "contorno": "#2a1830",
    "cores": {
      "g": "#5ee07a",
      "G": "#2fa85a",
      "l": "#b8ffb8",
      "e": "#2a1830",
      "w": "#ffffff",
      "p": "#ff9ab8"
    },
    "linhas": [
      "..................",
      "..................",
      "..................",
      "..................",
      "..................",
      "........lG........",
      ".......wggG.......",
      "......lggggG......",
      "...lllggggggllG...",
      "..lggwgggggggggG..",
      ".lggwgggggwegwegG.",
      ".gggwgggggeegeegG.",
      "GgggggggggeegeeggG",
      "GggggggggpgggggpgG",
      ".GggggggggggegggG.",
      ".GGGGGGGGGGGGGGGG.",
      "..GGGGGGGGGGGGGG..",
      ".................."
    ]
  },
  "lobo": {
    "contorno": "#2a1830",
    "cores": {
      "c": "#a8b0c8",
      "C": "#6a7290",
      "W": "#e8ecf8",
      "h": "#d0d6e8",
      "e": "#2a1830",
      "w": "#ffffff",
      "p": "#ff9ab8"
    },
    "linhas": [
      "..................",
      ".........C.....C..",
      ".........cC...hC..",
      ".........CpC.hpC..",
      "..........cchcC...",
      ".........hcccccC..",
      ".hWC....hccccwecC.",
      ".ccC....ccccceecC.",
      ".ccC..hhcccccccWW.",
      ".ccchhccccccccWWWe",
      ".CcccccccccccccWWW",
      "..cccccccccccCCee.",
      "..CcccWWWcccC.....",
      "...CWWWWWWWcC.....",
      "....cWWWWWcC......",
      "....CCCCCCC.......",
      "....CC...CC.......",
      "....CC...CC......."
    ]
  },
  "cogumelo": {
    "contorno": "#2a1830",
    "cores": {
      "p": "#e04ab8",
      "P": "#9a2a88",
      "q": "#ff8ae0",
      "b": "#fff0d0",
      "B": "#d8b898",
      "e": "#2a1830",
      "w": "#ffffff"
    },
    "linhas": [
      "..................",
      "....qqqqqqqqqP....",
      "...qpppppwwwwpP...",
      "..qpwwpppwwwwppP..",
      ".qppwwppppppppppP.",
      ".pppppppppppppwpP.",
      "PpppppppwppppwwppP",
      ".pppppppwppppwwpP.",
      ".PppppppppppppppP.",
      "..PPppppbbpppppP..",
      "....PPPPPPPPPPP...",
      ".....bbbebbbB.e...",
      ".....bbbbwebwe....",
      "....Bbbbbeebee....",
      ".....bbbbbbbB.....",
      ".....BbbbbbeB.....",
      "......BbbbbB......",
      ".......BBBB......."
    ]
  },
  "goblin": {
    "contorno": "#2a1830",
    "cores": {
      "g": "#8ad83f",
      "G": "#4f9a2a",
      "K": "#c8ff7a",
      "t": "#b8743a",
      "T": "#7a4a22",
      "o": "#6a3a1a",
      "r": "#ff4f4f",
      "R": "#c02f3f",
      "y": "#ffe04a",
      "s": "#e8f0ff",
      "e": "#2a1830",
      "w": "#ffffff"
    },
    "linhas": [
      "..................",
      "..................",
      "..RR..............",
      "...R.rrrrrrrR.....",
      ".G..rrrrrrrrrR..G.",
      ".GKKggrrrrrrggKKG.",
      "..GggggggyygyygG..",
      "...GgggggyegyeG...",
      "....gggggggGGG.s..",
      "....GggggggggG.s..",
      ".....GGgggewew.s..",
      ".......gggG....s..",
      ".....KtttttttGKs..",
      ".....GttttttT.gyy.",
      "......ooooooo.....",
      "......TttTttT.....",
      ".......GG.GG......",
      "......ooo.ooo....."
    ]
  },
  "javali": {
    "contorno": "#2a1830",
    "cores": {
      "b": "#b8703f",
      "B": "#7a4222",
      "a": "#e8a06a",
      "l": "#e8c098",
      "m": "#5a2a14",
      "h": "#3a2a2a",
      "p": "#ffa8a0",
      "P": "#e07a7a",
      "t": "#fff8e0",
      "e": "#2a1830",
      "w": "#ffffff"
    },
    "linhas": [
      "............................",
      "............................",
      "............................",
      "...................B........",
      ".....m..m..m..m..m.bP.......",
      "....mmmmmmmmmmmmmmmBbB......",
      ".....m..mmmmmmmmmm..bbB.....",
      "......mmmmmmmmmmmmmmbbbaB...",
      "....aammmmmmmmmmmmbbbmmmbB..",
      "...abbbbbbabbbbbbbbbbbwembB.",
      "..abbbbbbbbabbbbbbbbbbeebbB.",
      "..bbbbbbbbbbabbbbbbbbbbbbpP.",
      "..bbbbbbbbbbbbbbbbbbbbbbppet",
      "..bbbbbbbbbbbbbbbbbbbbbbppte",
      "..BbbbbbbbllllllbbbbbbbbbPt.",
      "...Bbbllllllllllllbbbbbttt..",
      "....bblllllllllllllBBbbB....",
      "....BBbllllllllllll..BBB....",
      "....BBB.BbbbBBBBbBB..BBB....",
      "....BBB..BBB....BBB..BBB....",
      "....BBB..BBB....BBB..BBB....",
      "....hhh..hhh....hhh..hhh...."
    ]
  },
  "item_espada": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#a8b0c0",
      "s": "#eef2fa",
      "g": "#5ed05a",
      "y": "#ffcf3f",
      "o": "#8a5228"
    },
    "linhas": [
      "...........s",
      "..........sm",
      ".........sm.",
      "........sm..",
      ".......sm...",
      "......sm....",
      ".....sm.....",
      ".y..sm......",
      "..ygm.......",
      "...y........",
      "..o.y.......",
      ".o.........."
    ]
  },
  "item_cajado": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#a8b0c0",
      "g": "#5ed05a",
      "o": "#9a5a2a",
      "w": "#ffffff"
    },
    "linhas": [
      "........ggg.",
      "......mgwggg",
      ".......ggggg",
      ".......ggggg",
      ".......mgggm",
      ".......om...",
      "......o.....",
      ".....o......",
      "....o.......",
      "...o........",
      "..o.........",
      ".o.........."
    ]
  },
  "item_arco": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#a8b0c0",
      "g": "#5ed05a",
      "o": "#a0662c",
      "l": "#f4ecd8"
    },
    "linhas": [
      "...l........",
      "...lo.......",
      "...l.o......",
      "...l..o.....",
      "...l...o....",
      "...l...mg...",
      "...l...m....",
      "...l...o....",
      "...l..o.....",
      "...l.o......",
      "...lo.......",
      "...l........"
    ]
  },
  "item_elmo": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#a8b0c0",
      "s": "#eef2fa",
      "d": "#5a6478",
      "g": "#5ed05a",
      "e": "#2a1830"
    },
    "linhas": [
      "............",
      "....sssd....",
      "..ssmgsmsd..",
      ".smmmssmmmd.",
      ".mmmmssmmmd.",
      ".mmeesseeed.",
      ".mmeesseeed.",
      ".mmmmssmmmd.",
      ".mmmmssmmmd.",
      ".dddddddddd.",
      "............",
      "............"
    ]
  },
  "item_armadura": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#a8b0c0",
      "s": "#eef2fa",
      "d": "#5a6478",
      "g": "#5ed05a"
    },
    "linhas": [
      "............",
      "sssd....sssd",
      "mmmmd..smmmd",
      "ddmmmssmmmdd",
      "..mmmggmmd..",
      "..mmmddmmd..",
      "..mmmddmmd..",
      "..mmmddmmd..",
      "..mmmddmmd..",
      "..dmmmmmmd..",
      "...dddddd...",
      "............"
    ]
  },
  "item_botas": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#a8b0c0",
      "d": "#5a6478",
      "g": "#5ed05a",
      "t": "#9a5a2a",
      "T": "#6a3a1a"
    },
    "linhas": [
      "............",
      ".mgmm.......",
      ".mmmm.mgmm..",
      ".tttT.mmmm..",
      ".tttT.tttT..",
      ".tttT.tttT..",
      ".tttT.tttT..",
      ".tttT.tttT..",
      ".tttT.tttT..",
      ".ttttttttttT",
      ".TTTTTTTTTTT",
      ".ddddddddddd"
    ]
  },
  "item_anel": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#a8b0c0",
      "s": "#eef2fa",
      "d": "#5a6478",
      "g": "#5ed05a",
      "w": "#ffffff"
    },
    "linhas": [
      "............",
      "....gwgg....",
      "....gggg....",
      "...sggggd...",
      "..smddddmd..",
      "..md....dd..",
      ".sd......md.",
      ".dd......md.",
      "..md....sd..",
      "..dmssssmd..",
      "...dddddd...",
      "............"
    ]
  },
  "item_amuleto": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#a8b0c0",
      "g": "#5ed05a",
      "w": "#ffffff"
    },
    "linhas": [
      ".m........m.",
      "..m......m..",
      "...m....m...",
      "....m..m....",
      ".....mm.....",
      "...mmggmm...",
      "...mgwggm...",
      "...mggggm...",
      "...mggggm...",
      "...mmggmm...",
      "....mmmm....",
      "............"
    ]
  },
  "pocao_vida": {
    "contorno": "#2a1830",
    "cores": {
      "o": "#9a5a2a",
      "v": "#d8f0ff",
      "r": "#ff4f5a",
      "R": "#c02f3f",
      "w": "#ffffff"
    },
    "linhas": [
      "....oooo....",
      "....oooo....",
      "....vvvv....",
      "....vvvv....",
      "...vvvvvv...",
      "..vvwvvvvv..",
      ".vvwrrrrrvv.",
      ".vrwrrrrrrv.",
      ".vrrrrrrrrv.",
      "..rrrrrrrR..",
      "..vRrrrrRv..",
      "....vvvv...."
    ]
  },
  "pocao_mana": {
    "contorno": "#2a1830",
    "cores": {
      "o": "#9a5a2a",
      "v": "#d8f0ff",
      "r": "#3fa8ff",
      "R": "#2a6ad0",
      "w": "#ffffff"
    },
    "linhas": [
      "....oooo....",
      "....oooo....",
      "....vvvv....",
      "....vvvv....",
      "...vvvvvv...",
      "..vvwvvvvv..",
      ".vvwrrrrrvv.",
      ".vrwrrrrrrv.",
      ".vrrrrrrrrv.",
      "..rrrrrrrR..",
      "..vRrrrrRv..",
      "....vvvv...."
    ]
  },
  "bau": {
    "contorno": "#2a1830",
    "cores": {
      "t": "#b8743a",
      "T": "#7a4a22",
      "l": "#e0a060",
      "y": "#ffcf3f",
      "e": "#2a1830"
    },
    "linhas": [
      "..............",
      ".lyllllllllyT.",
      "ltyttttttttytT",
      "ttytttyytttytT",
      "yyyyyyyyyyyyyy",
      "ttyttteytttytT",
      "ttytttyytttytT",
      "ttyttttttttytT",
      "ttyttttttttytT",
      "ttyttttttttytT",
      "TTyTTTTTTTTyTT"
    ]
  },
  "hab_golpe": {
    "contorno": "#2a1830",
    "cores": {
      "s": "#f4f8ff",
      "m": "#a8b0c0",
      "c": "#ffffff",
      "y": "#ffcf3f",
      "o": "#8a5228"
    },
    "linhas": [
      "............",
      "............",
      "......cccsm.",
      ".....cc.sm..",
      "....c..sm...",
      "...c..sm....",
      "..cc.sm.....",
      "..y.sm......",
      "..cym.......",
      "..o.y.......",
      ".o..........",
      "............"
    ]
  },
  "hab_escudo": {
    "contorno": "#2a1830",
    "cores": {
      "b": "#3f7fe8",
      "B": "#7fb2ff",
      "n": "#2a56b0",
      "w": "#ffcf3f"
    },
    "linhas": [
      "............",
      "..BBBBBBBn..",
      ".Bbbbwwbbbn.",
      ".bbbbwwbbbn.",
      ".bbwwwwwwbn.",
      ".nbbbwwbbbn.",
      "..bbbwwbbn..",
      "..nbbwwbbn..",
      "...nbwwbn...",
      "....nbbn....",
      ".....nn.....",
      "............"
    ]
  },
  "hab_grito": {
    "contorno": "#2a1830",
    "cores": {
      "r": "#ff4f4f",
      "y": "#fff4c0"
    },
    "linhas": [
      ".....r......",
      "............",
      "..r..r...r..",
      "...rrrrrr...",
      "...rryyrr...",
      "...ryyyyr...",
      "r.rryyyyr.r.",
      "...rryyrr...",
      "...rrrrrr...",
      "..r......r..",
      "......r.....",
      "............"
    ]
  },
  "hab_coracao": {
    "contorno": "#2a1830",
    "cores": {
      "r": "#ff4f5a",
      "R": "#c02f3f",
      "w": "#ffffff"
    },
    "linhas": [
      "............",
      "...rR..rR...",
      ".rrrwrrrrrR.",
      ".rrwrrrrrrR.",
      ".rrwrrrrrrR.",
      ".rrrrrrrrrR.",
      ".RrrrrrrrrR.",
      "..RrrrrrrR..",
      "...RrrrrR...",
      "....RrrR....",
      ".....RR.....",
      "............"
    ]
  },
  "hab_estrelas": {
    "contorno": "#2a1830",
    "cores": {
      "o": "#c8d0e8",
      "y": "#ffcf3f",
      "w": "#ffffff"
    },
    "linhas": [
      "............",
      "............",
      "........y...",
      ".....ooywy..",
      "..oy....yo..",
      ".oywy.....o.",
      "o..y......o.",
      ".o.....y..o.",
      "..oo..ywyo..",
      ".....ooy....",
      "............",
      "............"
    ]
  },
  "hab_fogo": {
    "contorno": "#2a1830",
    "cores": {
      "r": "#ff4f3a",
      "o": "#ff9a2a",
      "y": "#fff27a"
    },
    "linhas": [
      "............",
      "......rr....",
      ".....rrrrr..",
      "....rrrrr...",
      "...rrrrrrr..",
      "..rrrrrrrr..",
      "..rroooorr..",
      "..rooyyoor..",
      "..rooyyoor..",
      "..rroyyorr..",
      "...rrrrrr...",
      "............"
    ]
  },
  "hab_gelo": {
    "contorno": "#2a1830",
    "cores": {
      "c": "#5ac8ff",
      "w": "#ffffff"
    },
    "linhas": [
      ".....ww.....",
      "............",
      "......c.....",
      ".c........c.",
      "..ccc.cccc..",
      ".....ww.....",
      "....cwwc....",
      "...c....c...",
      ".cc...c..cc.",
      "............",
      "......c.....",
      ".....ww....."
    ]
  },
  "hab_raio": {
    "contorno": "#2a1830",
    "cores": {
      "y": "#ffe14a",
      "Y": "#d8a010",
      "w": "#ffffff"
    },
    "linhas": [
      "......wwwY..",
      ".....wyyY...",
      "....wyyY....",
      "...YYYyywY..",
      "......yyY...",
      ".....wyY....",
      "....wyY.....",
      "...wyY......",
      "..wyY.......",
      "..yY........",
      ".YY.........",
      "............"
    ]
  },
  "hab_orbe": {
    "contorno": "#2a1830",
    "cores": {
      "p": "#8a4fe0",
      "q": "#c89bff",
      "w": "#ffffff"
    },
    "linhas": [
      "............",
      "....pppp....",
      "...pwpppp...",
      "..pwqqqqpp..",
      ".ppqqqqqqpp.",
      ".ppqqwwqqpp.",
      ".ppqqwwqqpp.",
      ".ppqqqqqqpp.",
      "..ppqqqqpp..",
      "...pppppp...",
      "....pppp....",
      "............"
    ]
  },
  "hab_flecha": {
    "contorno": "#2a1830",
    "cores": {
      "o": "#a0662c",
      "s": "#e8f0ff",
      "r": "#ff5a4f"
    },
    "linhas": [
      "............",
      "............",
      ".......sss..",
      "........os..",
      ".......o.s..",
      "......o.....",
      ".....o......",
      "....o.......",
      "...o........",
      ".ro.........",
      ".rr.........",
      "............"
    ]
  },
  "hab_flechas": {
    "contorno": "#2a1830",
    "cores": {
      "o": "#a0662c",
      "s": "#e8f0ff",
      "r": "#ff5a4f"
    },
    "linhas": [
      "............",
      "............",
      ".....sss....",
      "......os....",
      ".....o.ssss.",
      "....o....os.",
      "...o....o.s.",
      "..o....o....",
      "ro....o.....",
      "rr...o......",
      "...ro.......",
      "...rr......."
    ]
  },
  "hab_gota": {
    "contorno": "#2a1830",
    "cores": {
      "g": "#7ee04a",
      "G": "#3f9a2a",
      "w": "#e8ffd8"
    },
    "linhas": [
      "............",
      ".....gG.....",
      "....gggG....",
      "...gggggG...",
      "...gggggG...",
      "...ggwggG...",
      "..ggwggggG..",
      "..ggwgggGG..",
      "..GgggGggG..",
      "...GggggG...",
      "....GGGG....",
      "............"
    ]
  },
  "hab_alvo": {
    "contorno": "#2a1830",
    "cores": {
      "r": "#ff4f5a",
      "w": "#ffffff"
    },
    "linhas": [
      ".....rr.....",
      "...rrrrrr...",
      "..rrwwwwrr..",
      ".rrwwrrwwrr.",
      ".rwwrrrrwwr.",
      "rrwrrwwrrwrr",
      "rrwrrwwrrwrr",
      ".rwwrrrrwwr.",
      ".rrwwrrwwrr.",
      "..rrwwwwrr..",
      "...rrrrrr...",
      ".....rr....."
    ]
  },
  "hab_olho": {
    "contorno": "#2a1830",
    "cores": {
      "w": "#ffffff",
      "i": "#3fa8ff",
      "e": "#2a1830"
    },
    "linhas": [
      "............",
      "............",
      "............",
      "....wwww....",
      "..wwiiiiww..",
      ".wwwiweiwww.",
      ".wwwieeiwww.",
      "..wwiiiiww..",
      "....wwww....",
      "............",
      "............",
      "............"
    ]
  },
  "hab_pena": {
    "contorno": "#2a1830",
    "cores": {
      "q": "#f4ecd8",
      "p": "#5ac8ff",
      "P": "#9ad8ff"
    },
    "linhas": [
      "............",
      ".......Pp.q.",
      "......Pp.q..",
      ".....Pp.qp..",
      "....Pp.qp...",
      "...Pp.qp....",
      "..Pp.qp.....",
      "..p.qp......",
      "...qp.......",
      "..qp........",
      ".q..........",
      "............"
    ]
  },
  "sapo": {
    "contorno": "#2a1830",
    "cores": {
      "g": "#4fc0a0",
      "G": "#2a8a70",
      "l": "#a8f0d8",
      "y": "#e8f08a",
      "p": "#b36bff",
      "e": "#2a1830",
      "w": "#ffffff"
    },
    "linhas": [
      "..................",
      "..................",
      "..................",
      "..................",
      "..................",
      "...........G......",
      ".........llgG.lG..",
      ".........ggwelggG.",
      ".....llllggeegweG.",
      "...llggpggggggeeG.",
      "..lggpgggpgggggG..",
      "..ggggggggggggG...",
      "..ggggggggggeeeee.",
      ".GggggyyyyyyygG...",
      ".GggyyyyyyyyyyG...",
      ".GGgGyyyyyyyyy....",
      "...G.GGGGGGGGGGG..",
      "............GGGG.."
    ]
  },
  "mosquito": {
    "contorno": "#2a1830",
    "cores": {
      "a": "#d8f0ff",
      "b": "#c8603a",
      "B": "#7a3a22",
      "r": "#ff3a3a",
      "e": "#2a1830"
    },
    "linhas": [
      "..................",
      "..................",
      "..................",
      ".....aaaaaaaa.....",
      ".....aaaaaaaaa....",
      ".....aaaaaaaaa....",
      ".......aa.aaa.....",
      ".........bbbbbB...",
      "..bBbBbBbbbbbbr...",
      ".bbBbBbBbbbbbBBe..",
      ".BbBbBbBbBbBe...ee",
      "..BBBBBBe.e.e.....",
      "........e.e..e....",
      ".......e..e..e....",
      ".......e..e...e...",
      "......e...e...e...",
      "......e...e.......",
      ".................."
    ]
  },
  "bruxa": {
    "contorno": "#2a1830",
    "cores": {
      "r": "#2a7a5a",
      "R": "#18503a",
      "p": "#4a2a6a",
      "P": "#2a1840",
      "q": "#7a4aa8",
      "y": "#c8f04a",
      "Y": "#8ad83f",
      "f": "#9ad86a",
      "F": "#5a9a3a",
      "h": "#c8c8d8",
      "H": "#8a8aa0",
      "o": "#6a4a2a",
      "c": "#7aff8a",
      "w": "#ffffff",
      "e": "#2a1830"
    },
    "linhas": [
      ".............P..........",
      "............qpP.........",
      "...........qppP......c..",
      "..........qppppP....cwc.",
      "..........pppppP...ccccc",
      ".........qppppppP...ccc.",
      "........qyyyyyyyy....c..",
      "....qqqqpppppppppqqP.o..",
      "...PPPPppppppppppPPPPo..",
      ".......pppppppppP....o..",
      "......hhhffffffyeF...o..",
      "......hhhffffffffF...o..",
      ".....hhhhhffffffF.F..o..",
      ".....hhhhhffffeee.F..o..",
      ".....hhhhhhffffF.....o..",
      ".....HhhrrrrrrrrrR.ffo..",
      "......hrrrrrrrrrrR.FFo..",
      "......hrrrrrrrrrrrR..o..",
      "......rrrrrrrrrrYrR..o..",
      "......rrrrYrrrrrrrrR.o..",
      ".....rrrrrrrrrrrrrrR.o..",
      ".....rrrrrrrrYrrrrrrro..",
      ".....rrrrrrrrrrrrrrrro..",
      "....rrrrrrrrrrrrrrrrro..",
      "....RrrrrrrrrrrrrrrrrR..",
      ".....RRRRRRRRRRRRRRRRo.."
    ]
  },
  "morcego": {
    "contorno": "#2a1830",
    "cores": {
      "a": "#7a4a8a",
      "A": "#4a2a5a",
      "b": "#9a6a7a",
      "B": "#5a3a4a",
      "r": "#ff4a4a",
      "w": "#ffffff"
    },
    "linhas": [
      "..................",
      "..................",
      "..................",
      "......B....B......",
      ".aA...BB..BB...aA.",
      "aaaaA..bbB...aaaaA",
      "AaaaaabbbbB.aaaaaA",
      ".aaaabbbbbbbaaaaA.",
      ".AaaabbrbbrbaaaaA.",
      "..AaabbbbbbBaaaA..",
      "...AaABbbbB.AaA...",
      "....A..wBBw..A....",
      "..................",
      "..................",
      "..................",
      ".................."
    ]
  },
  "esqueleto": {
    "contorno": "#2a1830",
    "cores": {
      "w": "#ece4d4",
      "W": "#a89a88",
      "y": "#ffcf3f",
      "Y": "#c8902a",
      "c": "#fff8a0",
      "o": "#8a5228",
      "s": "#a8b0c0",
      "e": "#2a1830"
    },
    "linhas": [
      "........yyyyyY....",
      ".......yyyyyyyY...",
      ".......yyyyyyycsss",
      ".......wwwwwwwssss",
      ".......wwwwwwW..os",
      ".......wweewee.o..",
      ".......wweewee.o..",
      ".......WWwwwWWo...",
      ".........weWe.o...",
      "........WWwWWo....",
      ".......W..W..W....",
      "......W.WWwWwW....",
      "......W...W.o.....",
      "........WwwwW.....",
      ".........wWW......",
      ".........W.W......",
      ".........W.W......",
      "........WW.WW....."
    ]
  },
  "aranha": {
    "contorno": "#2a1830",
    "cores": {
      "c": "#5ac8ff",
      "C": "#2a7ad0",
      "w": "#e8f8ff",
      "p": "#5a3a7a",
      "P": "#3a2050",
      "r": "#ff4a4a"
    },
    "linhas": [
      "..................",
      "..................",
      "..................",
      "......w...........",
      "....w...w.........",
      "...wwwwwC.........",
      "..wccccccC........",
      ".wcccwccccwppP....",
      ".cccccccccppppP...",
      ".Cccccccccppprr...",
      "..CcccccccPpprP...",
      "...ccCCcCP.pPpPP..",
      "...PP..P.P.P.P..P.",
      "..P...P.P..P..P.P.",
      "..P..P..P.P...P..P",
      ".P..P..P..P....P.P"
    ]
  },
  "golem": {
    "contorno": "#2a1830",
    "cores": {
      "g": "#8a7a7a",
      "G": "#5a4a4e",
      "l": "#b8a8a8",
      "o": "#ff7a2a",
      "y": "#ffe08a"
    },
    "linhas": [
      "............................",
      "............................",
      "...........lllllG...........",
      "...........gggggG...........",
      "...........gyogyG...........",
      "...........googoG...........",
      "...........gggggG...........",
      "...lllG....gggggG...........",
      "..lggggllllggggggllllllG....",
      "..ggggggggggggggggggggggG...",
      "..gggggggggggggoggggggggglG.",
      "..gggggggoggggggogggggggggG.",
      "..ggggggggoggggggyggggggggG.",
      "..gogggggggygggggoggggggggG.",
      "..ggogggggogggggogggggogggG.",
      "..gggoggggogggggyggggggoggG.",
      "..gggggggggogggggoggggggogG.",
      "..GGGGGgggggoggggoggggggogG.",
      "..GGGGGgggggggggggoggggoggG.",
      ".......GGggggGGggggGGGGGGGG.",
      ".......GGggggGGggggGGGGGGGG.",
      ".........gggG..gggG.........",
      ".........gggG..gggG.........",
      ".........gggG..gggG.........",
      ".........GGGG..GGGG.........",
      ".........GGGG..GGGG........."
    ]
  },
  "yeti": {
    "contorno": "#2a1830",
    "cores": {
      "w": "#f4f8ff",
      "W": "#a8c0e0",
      "f": "#7aa8d8",
      "F": "#4a78b0",
      "e": "#2a1830"
    },
    "linhas": [
      "....................",
      "....................",
      "....................",
      "..........W.........",
      "........W...W.......",
      ".......wwwwwW.......",
      ".....wwwwwfefffFe...",
      "....wwwwwwffeffe....",
      "...wwwwwwfffffffF...",
      "..wwwwwwwwffffffwW..",
      ".wwwwwwwwwffeeeewwW.",
      ".wwwwwwwwwwwwfwwwwW.",
      ".wwwwwwwwwwwwwwwwwW.",
      ".wwwwwwwwwwwwwwwwwW.",
      ".WwwwwwwwwwwwwwwwwW.",
      "..WwwwwwwwwwwwwwwwW.",
      "...WWwwwwwwwwwwWWW..",
      ".....wwwwwwwwwW.....",
      ".....WWwwWWwwWWW....",
      ".....WWWW..WWWW....."
    ]
  },
  "espirito": {
    "contorno": "#2a1830",
    "cores": {
      "c": "#8ad8ff",
      "C": "#3fa8e0",
      "w": "#e8f8ff",
      "o": "#3a6ab8",
      "e": "#2a1830"
    },
    "linhas": [
      "................",
      "................",
      ".....cwcccC.....",
      "....cwcccccC....",
      "...cccccccccC...",
      "...cccwwwwccC...",
      "...ccwewwwecC...",
      "...ccwewwwecC...",
      "...ccwwwwwwcC...",
      "...CccwwowccC...",
      "....cccccccC....",
      "....cccccccC....",
      "....ccccccC.....",
      "...ccccccC......",
      "...ccccCC.......",
      "..cccCC.........",
      "..cCC...........",
      ".CC............."
    ]
  },
  "serpe": {
    "contorno": "#2a1830",
    "cores": {
      "c": "#8ad8ff",
      "C": "#3a8ac8",
      "l": "#d8f4ff",
      "b": "#5aa8e8",
      "B": "#2a6ab0",
      "w": "#ffffff",
      "y": "#ffe14a"
    },
    "linhas": [
      "................................",
      "................................",
      ".............bB.........w.......",
      "............bbbbB......w.w......",
      "...........bBbbBbbB...w.lllC....",
      "..........bbBbbBbBbB..llcccclC..",
      ".........bbbbBbBbBbbB.cccccycC..",
      "........bbbbbBBbBbbbblcccccccclC",
      "........bbbbbBBBbbbbccccccccCCCC",
      "........bwccwccwccwcccccCCCC..w.",
      "........ccccccccccccccCC........",
      ".......lcccccccccccccC..........",
      "......lccccccccccccccC..........",
      "......cccccccccccccccC..........",
      "......cccccccwwwcccccC..........",
      "lC....CccwwwwwwwwwwwcC..........",
      "CClC...CcwwwwwwwwwwwC...........",
      "..CClC..Cwwwwwwwwwww............",
      "....CClC..ccCCCCcC..............",
      "......CC..CC....CC..............",
      "..........CC....CC..............",
      "..........CC....CC..............",
      "..........ww....ww..............",
      "................................"
    ]
  },
  "gargula": {
    "contorno": "#2a1830",
    "cores": {
      "g": "#9a9ab0",
      "G": "#5a5a70",
      "l": "#c8c8d8",
      "d": "#6a6a80",
      "D": "#44445a",
      "r": "#ff5a2a",
      "w": "#ffffff"
    },
    "linhas": [
      "....................",
      "....................",
      "....................",
      ".dD........dD..DD...",
      ".dddD......dglG.D...",
      "dddddD.....ggggG....",
      "ddddddD.lllggrgr....",
      "DdddddglgggggggG....",
      ".Dddddggggggggw.w...",
      "..DddgggggggggG.....",
      "...DDgggggggggG.....",
      ".....gggggggggG.....",
      ".....GggggggggG.....",
      "......gggggggG......",
      ".....GGggggggG......",
      "....G..gggGGggG.....",
      "..GG...ggG..ggG.....",
      ".G.....GGG..GGG....."
    ]
  },
  "rei": {
    "contorno": "#2a1830",
    "cores": {
      "m": "#4a4a6a",
      "d": "#2a2a44",
      "l": "#7a7aa0",
      "c": "#5a2a7a",
      "C": "#3a1850",
      "s": "#c8c0e0",
      "v": "#c86aff",
      "y": "#ffcf3f",
      "Y": "#c8902a",
      "o": "#4a2a1a",
      "e": "#2a1830"
    },
    "linhas": [
      "............y..y..........",
      ".........y........y..s....",
      "..........YlllldY....ss...",
      "..........lmmmmmd....sv...",
      ".........lmmmmmmmd...sv...",
      ".........mmmmmmmmd...sv...",
      ".........mmeeveeve...sv...",
      ".........mmeeeeeee...sv...",
      ".........dmmmmmmmd...sv...",
      "..........mmmmmmd....sv...",
      ".......ldlmmmmmmmlldlsv...",
      ".....clmmmmmmmmmmmmmmsv...",
      "...ccccmmmmmmmmmmmmmmsv...",
      "...cccccmmmmmmmmmmmmmmv...",
      "...ccccccmmmmyymmmmmmmv...",
      "...ccccccmmmmyymmmmddmv...",
      "...ccccccmmmmyymmmd..sv...",
      "...ccccccmmmmyymmmd..sv...",
      "...ccccccmmmmmmmmmd..sv...",
      "...ccccccmmmmmmmmmd..sv...",
      "...ccccccyyyyyyyyyy..sv...",
      "...ccccccmmmmmmmmdd..sv...",
      "...cccccccmmmcmmd....sv...",
      "...cccccccmmmcmmd..yyyyyy.",
      "...cccccccmmmcmmd....oo...",
      "...cccccccmmmcmmd....oo...",
      "...cccccccmmmcmmd....oo...",
      "...cccccccmmmcmmd.........",
      "...Cccccccmmmcddd.........",
      "....CCCCCCCCCC............"
    ]
  }
};
