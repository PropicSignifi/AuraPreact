import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

const colors = ["#FF4D80", "#00AFAA", "#AE1857", "#22F0C7", "#FF9933", "#FB5607"];

const allShapes = {
    circle1: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="198px" height="198px" viewBox="0 0 198 198" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>Outline circle</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-93.000000, -133.000000)" stroke="${t}" stroke-width="20"> <circle id="Outline-circle" cx="192" cy="232" r="89"></circle> </g> </g> </svg>`,
        shapeStyle: "outline"
    },
    circle2: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="178px" height="178px" viewBox="0 0 178 178" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>solid circle</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-615.000000, -143.000000)" fill="${t}"> <circle id="solid-circle" cx="704" cy="232" r="89"></circle> </g> </g> </svg>`,
        shapeStyle: "solid"
    },
    circle3: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="184px" height="184px" viewBox="0 0 184 184" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>lined circle</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-345.000000, -140.000000)" stroke="${t}" stroke-width="5"> <path d="M409.108175,316.541924 C400.225974,313.61318 391.962233,309.323727 384.563706,303.920317 L522.538687,256.6623 C519.944603,265.67587 515.964387,274.102424 510.843664,281.696347 L409.108172,316.541923 C417.88134,319.434716 427.257874,321 437,321 C467.748686,321 494.855355,305.406668 510.843664,281.696347 L409.108172,316.541923 L409.108175,316.541924 Z M384.563706,303.920317 C378.201608,299.27385 372.479295,293.803665 367.553668,287.666665 L525.989202,233.400673 C525.86486,241.459818 524.669321,249.259064 522.538684,256.662311 L384.563706,303.920317 Z M367.553668,287.666665 C363.297538,282.363812 359.63624,276.563095 356.670998,270.365736 L523.980514,213.060303 C522.553914,206.477873 520.399097,200.166831 517.604633,194.215748 L350.158078,251.568119 C348.745406,245.271604 348,238.722852 348,232 C348,231.759087 348.000957,231.518397 348.002868,231.277935 L506.869245,176.864374 C511.076976,182.18924 514.688972,188.006565 517.604633,194.215748 L350.158078,251.568119 C351.632131,258.138217 353.832696,264.43368 356.670998,270.365736 L523.980514,213.060303 C525.303302,219.163742 526,225.50051 526,232 C526,232.467742 525.996392,232.934642 525.989202,233.400673 L367.553668,287.666665 Z M348.002865,231.277936 C348.066666,223.249506 349.193477,215.474302 351.249476,208.086148 L490.062383,160.541132 C482.780357,155.124944 474.642041,150.795539 465.887469,147.79295 L362.573422,183.179199 C378.480662,158.977951 405.874406,143 437,143 C447.111631,143 456.829411,144.686274 465.887469,147.79295 L362.573422,183.179199 C357.593921,190.755003 353.739983,199.136609 351.249476,208.086148 L490.062383,160.541132 C496.355917,165.222104 502.009855,170.714836 506.869245,176.864374 L348.002865,231.277936 Z" id="lined-circle"></path> </g> </g> </svg>`,
        shapeStyle: "diagonal"
    },
    square1: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="145px" height="145px" viewBox="0 0 145 145" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>Outline square</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-119.000000, -384.000000)" stroke="${t}" stroke-width="20"> <rect id="Outline-square" transform="translate(191.500000, 456.500000) rotate(-180.000000) translate(-191.500000, -456.500000) " x="129" y="394" width="125" height="125" rx="30"></rect> </g> </g> </svg>`,
        shapeStyle: "outline"
    },
    square2: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="145px" height="145px" viewBox="0 0 145 145" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>solid square</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-631.000000, -384.000000)" fill="${t}" stroke="${t}" stroke-width="5"> <rect id="solid-square" transform="translate(703.500000, 456.500000) rotate(-180.000000) translate(-703.500000, -456.500000) " x="633.5" y="386.5" width="140" height="140" rx="30"></rect> </g> </g> </svg>`,
        shapeStyle: "solid"
    },
    square3: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="151px" height="151px" viewBox="0 0 151 151" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>lined square</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-362.000000, -381.000000)" stroke="${t}" stroke-width="5"> <path d="M510,431.029856 L510,460.618761 L433.629773,384 L405.541274,384 L510,488.79867 L510,499 C510,504.558522 508.488273,509.763962 505.85353,514.22761 L380.030966,387.995578 C384.436561,385.45409 389.54847,384 395,384 L405.541274,384 L510,488.79867 L510,460.618761 L433.629773,384 L463.122698,384 L510,431.029856 L510,414 C510,397.431458 496.568542,384 480,384 L463.122698,384 L510,431.029856 Z M505.85353,514.22761 C502.399604,520.079073 497.015776,524.655767 490.577731,527.082007 L367.029306,403.131514 C369.519236,396.728103 374.144661,391.391253 380.030966,387.995578 L505.85353,514.22761 Z M490.577731,527.082007 C487.28812,528.321729 483.723269,529 480,529 L464.401003,529 L365,429.275513 L365,457.455422 L436.312503,529 L406.819578,529 L365,487.044327 L365,499 C365,515.568542 378.431458,529 395,529 L406.819578,529 L365,487.044327 L365,457.455422 L436.312503,529 L464.401003,529 L365,429.275513 L365,414 C365,410.166763 365.718929,406.501441 367.029306,403.131514 L490.577731,527.082007 Z" id="lined-square"></path> </g> </g> </svg>`,
        shapeStyle: "diagonal"
    },
    star1: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="151px" height="146px" viewBox="0 0 151 146" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>outline star</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-116.000000, -1056.000000)" fill="${t}" fill-rule="nonzero"> <path d="M203.12495,1169.99024 L225.806515,1181.9497 L221.474722,1156.61916 C220.084644,1148.49056 222.771673,1140.19642 228.660138,1134.43971 L247.00991,1116.50053 L221.651149,1112.80485 C213.513491,1111.6189 206.478756,1106.49284 202.839485,1099.0972 L191.498702,1076.05071 L180.15792,1099.0972 C176.518648,1106.49284 169.483914,1111.6189 161.346255,1112.80485 L135.987495,1116.50053 L154.337266,1134.43971 C160.225731,1140.19642 162.912761,1148.49056 161.522683,1156.61916 L157.190889,1181.9497 L179.872454,1169.99024 C187.150997,1166.15244 195.846407,1166.15244 203.12495,1169.99024 Z M189.173453,1187.7338 L166.491888,1199.69326 C156.721114,1204.84516 144.636138,1201.07754 139.499339,1191.27804 C137.453838,1187.37583 136.747987,1182.90616 137.491058,1178.56098 L141.822852,1153.23044 C142.100867,1151.60472 141.563461,1149.94589 140.385768,1148.79455 L122.035997,1130.85537 C114.131275,1123.12752 113.96953,1110.43597 121.67473,1102.50802 C124.742981,1099.35106 128.763311,1097.29658 133.113328,1096.66263 L158.472088,1092.96695 C160.09962,1092.72976 161.506567,1091.70455 162.234421,1090.22542 L173.575204,1067.17893 C178.460591,1057.25096 190.445603,1053.17478 200.344478,1058.07452 C204.286261,1060.02563 207.476814,1063.22556 209.422201,1067.17893 L220.762983,1090.22542 C221.490837,1091.70455 222.897784,1092.72976 224.525316,1092.96695 L249.884076,1096.66263 C260.808133,1098.25465 268.377023,1108.42697 266.789665,1119.38314 C266.15757,1123.74595 264.109109,1127.7781 260.961408,1130.85537 L242.611636,1148.79455 C241.433943,1149.94589 240.896537,1151.60472 241.174553,1153.23044 L245.506346,1178.56098 C247.372398,1189.47288 240.065217,1199.8359 229.185301,1201.70744 C224.852861,1202.4527 220.39629,1201.74477 216.505517,1199.69326 L193.823952,1187.7338 C192.368243,1186.96624 190.629161,1186.96624 189.173453,1187.7338 Z" id="outline-star"></path> </g> </g> </svg>`,
        shapeStyle: "outline"
    },
    star2: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="136px" height="131px" viewBox="0 0 136 131" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>solid star</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-636.000000, -1064.000000)" fill="${t}" fill-rule="nonzero"> <path d="M675.506261,1193.55787 C669.399905,1196.77874 661.847262,1194.42329 658.63696,1188.29684 C657.358602,1185.85725 656.917472,1183.0629 657.381863,1180.34638 L662.823528,1148.5146 L639.772265,1125.9712 C634.832119,1121.1399 634.731035,1113.20539 639.546487,1108.24898 C641.464025,1106.27532 643.976577,1104.99089 646.695169,1104.59456 L678.551231,1099.95036 L692.797695,1070.98885 C695.850873,1064.78208 703.341042,1062.23372 709.527457,1065.29695 C711.99092,1066.51675 713.984892,1068.51728 715.200683,1070.98885 L729.447147,1099.95036 L761.303209,1104.59456 C768.130322,1105.58986 772.860586,1111.9494 771.868548,1118.79899 C771.473514,1121.52653 770.193305,1124.04735 768.226113,1125.9712 L745.17485,1148.5146 L750.616515,1180.34638 C751.782725,1187.16829 747.216019,1193.64705 740.416492,1194.8171 C737.708885,1195.28302 734.9237,1194.84044 732.492117,1193.55787 L703.999189,1178.52894 L675.506261,1193.55787 Z" id="solid-star"></path> </g> </g> </svg>`,
        shapeStyle: "solid"
    },
    star3: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="138px" height="131px" viewBox="0 0 138 131" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>lined star</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-377.000000, -1064.000000)" fill="${t}" fill-rule="nonzero"> <path d="M487.586994,1168.10362 L485.379987,1171.02053 L482.78549,1155.85594 C482.411273,1153.66867 482.455255,1151.4414 482.906861,1149.2854 L485.353799,1149.80049 L485.611112,1152.29369 L405.334713,1160.61985 L407.54172,1158.55036 L403.874424,1179.98537 L401.152791,1177.06846 L487.586994,1168.10362 Z M402.055844,1160.95993 L403.074067,1155.00851 C403.769625,1150.94303 402.425106,1146.79477 399.478672,1143.91558 L392.280787,1136.88197 L511.121276,1124.556 L491.309525,1143.91558 C489.525173,1145.65921 488.309254,1147.88789 487.800738,1150.31558 L487.42582,1152.10547 L402.055844,1160.95993 Z M503.971625,1125.29755 L502.483697,1125.99587 L506.182533,1122.38146 C507.363804,1121.22715 508.132551,1119.71465 508.369764,1118.07813 C508.842351,1114.81776 507.143588,1111.67411 504.273307,1110.25399 L384.868687,1122.63848 L399.59564,1137.02931 L397.593086,1136.33099 L503.971625,1125.29755 Z M489.913281,1167.86234 L492.049163,1180.34638 C492.909572,1185.37539 490.647794,1190.36452 486.422937,1193.05167 L485.926069,1193.3677 L475.893989,1194.40821 L475.344068,1194.20181 C474.853608,1194.01772 474.374683,1193.80273 473.910092,1193.55787 L451.211569,1181.59495 C447.569576,1179.67549 443.218621,1179.67549 439.576628,1181.59495 L416.878105,1193.55787 C410.766806,1196.77874 403.208048,1194.42329 399.995148,1188.29684 C398.715755,1185.85725 398.274268,1183.0629 398.739034,1180.34638 L399.266375,1177.26412 L489.913281,1167.86234 Z M484.196221,1188.50735 C486.438871,1186.83929 487.605317,1184.02738 487.120522,1181.1938 L485.379987,1171.02053 L488.10162,1173.09002 L401.667417,1182.05486 L401.410104,1179.56166 L403.874424,1179.98537 L403.667675,1181.1938 C403.388814,1182.82371 403.653707,1184.50032 404.421343,1185.96408 C406.349083,1189.63995 410.884337,1191.05322 414.551117,1189.1207 L437.24964,1177.15778 C442.348429,1174.47054 448.439768,1174.47054 453.538557,1177.15778 L476.23708,1189.1207 C476.353988,1189.18231 476.472398,1189.24077 476.592189,1189.29603 L484.196221,1188.50735 Z M398.388548,1182.39493 L402.933671,1155.82911 L488.504918,1146.95378 L487.800738,1150.31558 C487.478172,1151.85554 487.446768,1153.4458 487.71413,1155.00851 L490.760496,1172.81424 L398.388548,1182.39493 Z M485.096486,1147.30729 L482.906861,1149.2854 C483.618635,1145.88734 485.321206,1142.76666 487.819043,1140.32583 L502.483697,1125.99587 L504.486251,1130.28394 L398.107712,1141.31738 L399.59564,1137.02931 L402.969154,1140.32583 C407.094162,1144.35669 408.976489,1150.16427 408.002707,1155.85594 L407.54172,1158.55036 L404.820087,1155.63345 L485.096486,1147.30729 Z M396.943374,1141.43815 L381.115181,1125.9712 C379.800075,1124.68611 378.799524,1123.15138 378.158576,1121.46434 L377,1118.41484 L505.035134,1105.1352 L505.608569,1105.36575 C510.925923,1107.50351 514.153137,1113.04015 513.3184,1118.79899 C512.923045,1121.52653 511.6418,1124.04735 509.673016,1125.9712 L505.351372,1130.19421 L396.943374,1141.43815 Z M476.478079,1194.34763 L485.340757,1193.42841 L485.083444,1190.93521 L483.743952,1188.81875 C482.915587,1189.34562 481.987924,1189.70561 480.995554,1189.87623 C479.685096,1190.10155 478.339924,1189.97341 477.097476,1189.50707 L476.220766,1191.85444 L476.478079,1194.34763 Z M495.393686,1187.34596 L486.422937,1193.05167 C485.038517,1193.93221 483.488064,1194.53388 481.840882,1194.8171 C479.656788,1195.19263 477.414866,1194.97906 475.344062,1194.20181 L465.373808,1190.45958 L495.393686,1187.34596 Z M485.552667,1107.1559 L476.647708,1105.85872 C470.947088,1105.02832 466.019092,1101.43904 463.469697,1096.26059 L461.844525,1092.95947 L464.34395,1094.34337 L424.916241,1098.43276 L426.831589,1097.17999 C424.16492,1101.87396 419.483839,1105.08036 414.140489,1105.85872 L388.762769,1109.55547 C387.130293,1109.79327 385.621541,1110.56392 384.470087,1111.74812 C382.861027,1113.40294 382.136163,1115.65458 382.388037,1117.856 L485.552667,1107.1559 Z M420.080221,1098.93434 L422.486268,1094.69913 C422.608559,1094.48387 422.724614,1094.26475 422.834275,1094.04201 L433.982086,1071.39805 L455.634987,1069.15224 L456.42602,1070.63986 C456.487358,1070.75521 456.546912,1070.87155 456.604661,1070.98885 L467.919702,1093.9725 L420.080221,1098.93434 Z M463.829324,1089.35698 L461.844525,1092.95947 L452.120436,1073.20744 C452.085776,1073.13704 452.050035,1073.06722 452.013226,1072.99799 L454.219623,1071.81892 L454.476936,1074.31212 L435.870344,1076.24197 L437.855143,1074.85807 L427.3185,1096.26059 C427.165107,1096.57217 427.002728,1096.87875 426.831589,1097.17999 L424.658928,1095.93956 L424.401615,1093.44637 L463.829324,1089.35698 Z M431.367458,1076.709 L434.183536,1070.98885 C437.239186,1064.78208 444.735419,1062.23372 450.926842,1065.29695 C453.273042,1066.45774 455.19609,1068.32685 456.42602,1070.63986 L458.174786,1073.92858 L431.367458,1076.709 Z M465.559117,1089.17756 L467.953922,1094.04201 C469.774918,1097.7409 473.294916,1100.30467 477.366787,1100.89781 L502.744507,1104.59456 C503.734407,1104.73876 504.694032,1104.99807 505.608569,1105.36575 L515,1109.14143 L378.842137,1123.26354 L378.158576,1121.46434 C376.439495,1116.93953 377.457692,1111.7781 380.88922,1108.24898 C382.808311,1106.27532 385.322896,1104.99089 388.04369,1104.59456 L413.42141,1100.89781 C417.238011,1100.34185 420.581789,1098.05147 422.486268,1094.69913 L423.122607,1093.57902 L465.559117,1089.17756 Z" id="lined-star"></path> </g> </g> </svg>`,
        shapeStyle: "diagonal"
    },
    triangle1: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="156px" height="133px" viewBox="0 0 156 133" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>Outline Triangle</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-114.000000, -606.000000)" fill="${t}" fill-rule="nonzero"> <path d="M199.368953,627.716671 C194.846418,624.575171 188.631619,625.692029 185.487811,630.211242 L135.730071,701.737811 C134.602371,703.358876 133.981927,705.27812 133.947447,707.252076 C133.851321,712.755082 138.237742,717.294019 143.744793,717.390074 L239.903364,719.067295 C241.851804,719.101281 243.767517,718.564097 245.413803,717.522117 C250.066848,714.577076 251.449705,708.42038 248.502499,703.770752 L202.101668,630.566962 C201.390058,629.444298 200.46093,628.475194 199.368953,627.716671 Z M218.951836,619.902025 L265.352667,693.105816 C274.194283,707.0547 270.045714,725.524787 256.086578,734.35991 C251.147721,737.485849 245.40058,739.0974 239.555261,738.995445 L143.39669,737.318223 C126.875537,737.030057 113.716273,723.413248 114.004651,706.904229 C114.108093,700.98236 115.969425,695.224628 119.352524,690.361435 L169.110264,618.834866 C178.541689,605.277226 197.186086,601.926654 210.75369,611.351152 C214.029622,613.626721 216.817006,616.534033 218.951836,619.902025 Z" id="Outline-Triangle"></path> </g> </g> </svg>`,
        shapeStyle: "outline"
    },
    triangle2: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="138px" height="115px" viewBox="0 0 138 115" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>solid triangle</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-634.000000, -615.000000)" fill="${t}" stroke="${t}"> <path d="M721.520177,625.262449 L767.902982,698.422259 C773.795103,707.715928 771.030464,720.021922 761.727989,725.908465 C758.436697,727.991172 754.606758,729.064895 750.711393,728.996965 L654.59018,727.320751 C643.580357,727.128756 634.810922,718.056337 635.003099,707.056936 C635.072034,703.111396 636.31244,699.275214 638.566963,696.035033 L688.305372,624.551437 C694.590546,615.51844 707.015315,613.286067 716.05687,619.565292 C718.239976,621.081426 720.09751,623.018469 721.520177,625.262449 Z" id="solid-triangle"></path> </g> </g> </svg>`,
        shapeStyle: "solid"
    },
    triangle3: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="142px" height="119px" viewBox="0 0 142 119" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>lined triangle</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-366.000000, -613.000000)" stroke="${t}" stroke-width="5"> <path d="M501.902982,698.422259 L498.605316,693.220836 L376.149273,690.88657 L390.437933,670.351035 L485.251871,672.158385 L472.534304,652.098908 L404.046181,650.793383 L417.654429,631.235731 L459.816736,632.039431 L455.520177,625.262449 C454.09751,623.018469 452.239976,621.081426 450.05687,619.565292 C441.015315,613.286067 428.590546,615.51844 422.305372,624.551437 L417.654429,631.235731 L459.816736,632.039431 L472.534304,652.098908 L404.046181,650.793383 L390.437933,670.351035 L485.251871,672.158385 L498.605316,693.220836 L376.149273,690.88657 L372.566963,696.035033 C370.31244,699.275214 369.072034,703.111396 369.003099,707.056936 C368.982176,708.254496 369.067481,709.429214 369.250342,710.572116 L504.576632,713.151715 C503.512983,718.239156 500.469883,722.907827 495.727989,725.908465 C492.436697,727.991172 488.606758,729.064895 484.711393,728.996965 L388.59018,727.320751 C378.779051,727.14966 370.747024,719.92659 369.250342,710.572116 L504.576632,713.151715 C505.599612,708.258798 504.791621,702.978523 501.902982,698.422259 Z" id="lined-triangle"></path> </g> </g> </svg>`,
        shapeStyle: "diagonal"
    },
    polygon1: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="181px" height="175px" viewBox="0 0 181 175" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>outline polygon</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-101.000000, -810.000000)" fill="${t}" fill-rule="nonzero"> <path d="M188.563851,830.985138 L123.041932,878.703344 C121.291151,879.978401 120.558553,882.238492 121.227292,884.301577 L146.254438,961.511257 C146.923177,963.574341 148.841143,964.971155 151.005227,964.971155 L231.994773,964.971155 C234.158857,964.971155 236.076823,963.574341 236.745562,961.511257 L261.772708,884.301577 C262.441447,882.238492 261.708849,879.978401 259.958068,878.703344 L194.436149,830.985138 C192.685368,829.710081 190.314632,829.710081 188.563851,830.985138 Z M271.702665,862.499668 C280.456571,868.87495 284.11956,880.175408 280.775865,890.49083 L255.74872,967.70051 C252.405025,978.015933 242.815195,985 231.994773,985 L151.005227,985 C140.184805,985 130.594975,978.015933 127.25128,967.70051 L102.224135,890.49083 C98.88044,880.175408 102.543429,868.87495 111.297335,862.499668 L176.819253,814.781461 C185.573159,808.40618 197.426841,808.40618 206.180747,814.781461 L271.702665,862.499668 Z" id="outline-polygon"></path> </g> </g> </svg>`,
        shapeStyle: "outline"
    },
    polygon2: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="166px" height="159px" viewBox="0 0 166 159" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>Polygon solid</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-620.000000, -819.000000)" fill="${t}" stroke="${t}"> <path d="M711.815543,822.856349 L778.816622,871.399617 C784.073197,875.208082 786.27276,881.958749 784.264928,888.120975 L758.672793,966.665632 C756.66496,972.827859 750.906427,977 744.408944,977 L661.591056,977 C655.093573,977 649.33504,972.827859 647.327207,966.665632 L621.735072,888.120975 C619.72724,881.958749 621.926803,875.208082 627.183378,871.399617 L694.184457,822.856349 C699.441031,819.047884 706.558969,819.047884 711.815543,822.856349 Z" id="Polygon-solid"></path> </g> </g> </svg>`,
        shapeStyle: "solid"
    },
    polygon3: {
        svg: t => `<?xml version="1.0" encoding="UTF-8"?> <svg id="rootShape" width="167px" height="161px" viewBox="0 0 167 161" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>lined polygon</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="shapes" transform="translate(-355.000000, -816.000000)" stroke="${t}" stroke-width="5"> <path d="M494.709617,959.086851 L501.163298,939.171129 L375.770514,938.966878 L368.986992,918.033282 L507.939663,918.25962 L514.393345,898.343898 L362.526494,898.096524 L358.734401,886.394323 C357.849745,883.664321 357.78262,880.819354 358.434447,878.163624 L518.627144,878.42456 C519.21212,881.005158 519.121347,883.753528 518.265599,886.394323 L514.393345,898.343898 L362.526494,898.096524 L368.986992,918.033282 L507.939663,918.25962 L501.163298,939.171129 L375.770514,938.966878 L382.231012,958.903636 L494.709617,959.086851 L493.241179,963.618374 C491.235181,969.80878 485.481909,974 478.990363,974 L398.009637,974 C391.518091,974 385.764819,969.80878 383.758821,963.618374 L382.231012,958.903636 L494.709617,959.086851 Z M518.627144,878.42456 L358.434447,878.163624 C359.26067,874.797363 361.242015,871.735147 364.177728,869.596499 L379.722732,858.272066 L497.540705,858.463978 L468.756048,837.494545 L408.378953,837.396198 L429.692511,821.869411 C434.944283,818.04353 442.055717,818.04353 447.307489,821.869411 L468.756048,837.494545 L408.378953,837.396198 L379.722732,858.272066 L497.540705,858.463978 L512.822272,869.596499 C515.833665,871.79028 517.840852,874.955861 518.627144,878.42456 Z" id="lined-polygon"></path> </g> </g> </svg>`,
        shapeStyle: "diagonal"
    }
};

const heartShapes = {
    heart: () => `<?xml version="1.0" encoding="UTF-8"?> <svg width="187px" height="162px" viewBox="0 0 187 162" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 53 (72520) - https://sketchapp.com --> <title>Group Copy 3</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="colors-reference-only" transform="translate(-1302.000000, -555.000000)"> <g id="Group-Copy-3" transform="translate(1302.000000, 555.000000)"> <path d="M93,18.8863201 C102.711211,7.3412141 117.292798,-2.84217094e-14 133.595527,-2.84217094e-14 C162.833404,-2.84217094e-14 186.535386,23.6123337 186.535386,52.7396234 C186.535386,63.1453726 183.510345,72.8472581 178.288552,81.0201249 L93,18.8863201 Z" id="Combined-Shape-Copy-2" fill="#7F2346"></path> <path d="M-2.74447132e-13,18.8863201 C9.71121111,7.3412141 24.2927981,0 40.5955274,0 C69.833404,0 93.5353861,23.6123337 93.5353861,52.7396234 C93.5353861,63.1453726 90.5103454,72.8472581 85.2885516,81.0201249 L-2.74280598e-13,18.8863201 Z" id="Combined-Shape-Copy-3" fill="#CB94B4" transform="translate(46.767693, 40.510062) scale(-1, 1) translate(-46.767693, -40.510062) "></path> <path d="M93.2915625,18.6255503 C129.835456,18.6255503 172.941483,89.8653052 178.3425,99.6054254 C121.716873,141.201808 93.3665601,162 93.2915625,162 C93.009636,162 64.5996349,141.201808 8.06155919,99.6054254 C9.77934098,96.1255503 56.7476693,18.6255503 93.2915625,18.6255503 Z" id="Triangle-Copy-2" fill="#AE1857" transform="translate(93.202029, 90.312775) rotate(180.000000) translate(-93.202029, -90.312775) "></path> </g> </g> </g> </svg>`,
    heartLeftPart: () => `<?xml version="1.0" encoding="UTF-8"?> <svg width="99px" height="85px" viewBox="0 0 99 85" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>Combined Shape Copy</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="colors-reference-only" transform="translate(-1317.000000, -95.000000)" fill="#D491B6" stroke="#D491B6" stroke-width="4"> <g id="Group-Copy" transform="translate(1319.000000, 97.000000)"> <path d="M7.62751648,79.9999989 C2.78661106,72.0417211 0,62.7059695 0,52.7220477 C0,23.6044648 23.7019819,0 52.9398584,0 C69.3694302,0 84.050973,7.45340975 93.7611725,19.1501766 C8.29992029,78.3391784 29.524038,63.8403677 7.62751648,79.9999989 Z" id="Combined-Shape-Copy"></path> </g> </g> </g> </svg>`,
    heartRightPart: () => `<?xml version="1.0" encoding="UTF-8"?> <svg width="100px" height="85px" viewBox="0 0 100 85" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>Combined Shape Copy 2</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="colors-reference-only" transform="translate(-1411.000000, -96.000000)" fill="#891846" stroke="#891846" stroke-width="4"> <g id="Group-Copy" transform="translate(1319.000000, 97.000000)"> <path d="M95,20.6013184 C104.705166,8.64516164 119.54956,1 136.186357,1 C165.424234,1 189.126216,24.6123337 189.126216,53.7396234 C189.126216,63.715725 186.345822,73.0448873 181.514902,81.0000036 C159.586127,65.4227608 179.559323,79.1845452 95,20.6013184 Z" id="Combined-Shape-Copy-2"></path> </g> </g> </g> </svg>`,
    heartTrianglePart: () => `<?xml version="1.0" encoding="UTF-8"?> <svg width="177px" height="154px" viewBox="0 0 177 154" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <!-- Generator: Sketch 52.6 (67491) - http://www.bohemiancoding.com/sketch --> <title>Triangle Copy 2</title> <desc>Created with Sketch.</desc> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="colors-reference-only" transform="translate(-1332.000000, -121.000000)" fill="#BD0057" stroke="#BD0057" stroke-width="4"> <g id="Group-Copy" transform="translate(1326.000000, 105.000000)"> <path d="M94.1085215,19 C117.092004,19 149.407439,62.7158449 179.756584,104.826332 C157.582846,121.178974 181.124034,107.46586 94.1085215,167.699024 C7.09300903,107.46586 31.1571061,121.674392 8.82322548,105.824446 C39.4996698,62.7158449 71.1250386,19 94.1085215,19 Z" id="Triangle-Copy-2" transform="translate(94.289905, 93.349512) rotate(180.000000) translate(-94.289905, -93.349512) "></path> </g> </g> </g> </svg>`
};

const supportedFeature = function() {
    const userAgent = navigator.userAgent.toLowerCase();
    let a = !1;
    return userAgent.indexOf("chrome") === userAgent.indexOf("android") && -1 !== userAgent.indexOf("safari") ? a = !0 : (-1 !== userAgent.indexOf("ipad") || -1 !== userAgent.indexOf("iphone") || -1 !== userAgent.indexOf("ipod")) && (a = !0),
        a
}();

const floor = Math.floor;
const round = Math.round;

function initCmp(cmp, props) {
    const shapeStyle = props.shapeStyle,
        browserWidth = props.browserWidth;
    if ("solid" === shapeStyle)
        cmp.scale = 220 / 800;
    else if ("outline" === shapeStyle) {
        const props = randomBetween(0, 10);
        cmp.scale = 5 < props ? 120 / 800 : 160 / 800
    } else if ("diagonal" === shapeStyle) {
        const props = randomBetween(0, 10);
        if (9 < props) {
            const props = randomBetween(0, 10);
            cmp.xPos = 5 < props ? randomBetween(100, 400) : randomBetween(browserWidth - 400, browserWidth - 100),
                cmp.scale = 250 / 500
        } else
            cmp.scale = 130 / 800
    }
}

function randomBetween(start, end) {
    return floor(Math.random() * (end - start + 1)) + start
}

function transformElem(x, y, scale, rotate, elem) {
    elem.style.transform = supportedFeature ? `translate3d(${x}px, ${y}px, 0) scale(${scale}, ${scale})` : `translate3d(${x}px, ${y}px, 0) scale(${scale}, ${scale}) rotateY(${3 * rotate}deg) rotateX(${2 * rotate}deg) rotateZ(${rotate}deg)`
}

function buildConfettiList() {
    const result = [],
        confettis = document.querySelectorAll(".confetti"),
        innerWidth = window.innerWidth,
        innerHeight = window.innerHeight,
        keys = Object.keys(allShapes);
    for (let index = 0; index < confettis.length; index++) {
        const initialXPos = randomAround(50, innerWidth),
            initialYPos = randomAround(-50, -1 * innerHeight),
            speed = 20 + 100 * Math.random(),
            key = keys[floor(Math.random() * keys.length)],
            confetti = confettis[index];
        confetti.classList.add(key);
        const color = colors[floor(Math.random() * colors.length)];
        setBackgroundImage(confetti, allShapes[key].svg, color);
        const shapeStyle = allShapes[key].shapeStyle,
            elem = new Confetti({
                confettiElement: confetti,
                speed: speed,
                initialXPos: initialXPos,
                initialYPos: initialYPos,
                shapeStyle: shapeStyle,
                browserHeight: innerHeight,
                browserWidth: innerWidth
            });
        result.push(elem)
    }

    setHeartBackgroundImage();
    return result;
}

function setHeartBackgroundImage() {
    const heartLeft = document.querySelector(".heartLeft"),
        heartRight = document.querySelector(".heartRight"),
        heartTriangle = document.querySelector(".heartTriangle"),
        heart = document.querySelector(".heart");
    setBackgroundImage(heart, heartShapes.heart),
        setBackgroundImage(heartLeft, heartShapes.heartLeftPart),
        setBackgroundImage(heartRight, heartShapes.heartRightPart),
        setBackgroundImage(heartTriangle, heartShapes.heartTrianglePart)
}

function randomAround(radius, pivot) {
    return round(-1 * radius + Math.random() * (pivot + 2 * radius))
}

function setBackgroundImage(elem, imageFn, color) {
    elem.style.backgroundImage = "url('data:image/svg+xml;base64," + window.btoa(imageFn(color)) + "')"
}

function update() {
    const list = buildConfettiList();
    return updateConfettiList(list)
}

function updateConfettiList(list) {
    return new Promise(resolve => {
        let index = 0;
        for (let idx = 0; idx < list.length; idx++) {
            const elem = list[idx];
            elem.exists ? elem.update() : index++
        }
        index < list.length ? requestAnimationFrame(() => {
            updateConfettiList(list).then(() => {
                resolve()
            })
        }) : resolve()
    })
}

class Confetti {
    constructor(t) {
        const {
            confettiElement: element,
            speed: speed,
            initialXPos: initialXPos,
            initialYPos: initialYPos,
            shapeStyle: shapeStyle,
            browserHeight: browserHeight
        } = t;

        this.element = element;
        this.speed = speed;
        this.xPos = initialXPos;
        this.yPos = initialYPos;
        this.shapeStyle = shapeStyle;
        this.browserHeight = browserHeight;
        initCmp(this, t);
        this.counter = 0;
        this.sign = .5 > Math.random() ? 1 : -1;
        this.r1 = randomBetween(20, 50);
        this.r2 = randomBetween(1, 3);
        this.rotation = randomBetween(0, 360);
        this.exists = true;
    }

    update() {
        this.yPos < this.browserHeight + 100 ? (this.counter += this.speed / 1e3,
            this.xPos += 1.5 * (this.sign * this.r2) * Math.cos(this.counter),
            this.yPos += 7 + 2 * Math.sin(this.counter),
            this.rotation += this.speed / 30,
            transformElem(round(this.xPos), round(this.yPos), round(100 * this.scale) / 100, round(this.rotation), this.element)) : this.exists = !1
    }
}

const NUM_OF_CONFETTI = 54;

export default class Celebration extends BaseComponent {
    constructor() {
        super();
    }

    componentDidMount() {
        super.componentDidMount();

        update().then(() => {
            if(_.isFunction(this.prop('onFinish'))) {
                this.prop('onFinish')();
            }
        });
    }

    render(props, state) {
        const [{
            className,
        }, rest] = this.getPropValues();

        return (
            <div id={ this.id() } className={ className }>
                <span custom-celebration="" role="alert" class="slds-assistive-text">It's a celebration!</span>
                <svg custom-celebration="" xmlns="http://www.w3.org/2000/svg" width="572" height="1480" viewBox="0 0 572 1180" class="ribbon">
                    <path custom-celebration="" d="M487.966 0C121.216 410.34-5.124 465 1.226 569.39c4.34 71.33 116.56 131.22 157.03 149.55 188.15 85.21 321.52 27.17 228.7-19.11-44.98-22.43-94.07-12.16-122.33 13.39-32.36 29.26-39.58 77.96-19.29 109.89 58.82 92.57 315.27 39.56 325.47 111.86 17.1 121.26-422.53 124.92-450.7 271.86-16.19 84.45 46.52 268.87 46.52 272.21" class="path"></path>
                </svg>
                <div custom-celebration="" class="confettiContainer">
                    {
                        _.map(_.range(NUM_OF_CONFETTI), n => {
                            return (
                                <div custom-celebration="" class="confetti"></div>
                            );
                        })
                    }
                    <div custom-celebration="" class="heartWrap2">
                        <div custom-celebration="" class="heartWrapper">
                            <div custom-celebration="" class="heart"></div>
                        </div>
                    </div>
                    <div custom-celebration="" class="heartTotal">
                        <div custom-celebration="" class="heartLeftContainer">
                            <div custom-celebration="" class="heartPieces heartLeft"></div>
                        </div>
                        <div custom-celebration="" class="heartRightContainer">
                            <div custom-celebration="" class="heartPieces heartRight"></div>
                        </div>
                        <div custom-celebration="" class="heartTriangleContainer">
                            <div custom-celebration="" class="heartPieces heartTriangle"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Celebration.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    onFinish: PropTypes.isFunction('onFinish'),
};

Celebration.propTypesRest = true;
Celebration.displayName = "Celebration";
