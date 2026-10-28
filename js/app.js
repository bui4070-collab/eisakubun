
'use strict';
/* =====================================================================
   まなびタウン  v0.2  フェーズ①漢字モード ＋ フェーズ②ポイント・ボーナス・きろく
   ---------------------------------------------------------------------
   ・イラストは DEFAULT_ART（埋め込み）→ ART_CONFIG（パス指定）→ 設定画面アップロード
     の順に上書きされます。
   ・ポイントのルールは POINT_RULES、ボーナス問題の条件は BONUS_RULES で調整できます。
   ・判定パラメータは JUDGE_PRESETS で調整できます。
   ===================================================================== */
const APP_VERSION = '5.4.0';
const STORE_KEY = 'manabiTown.v1';
const ART_KEY = 'manabiTown.art.v1';

/* ---------- イラスト（埋め込み済みの初期イラスト） ---------- */
const DEFAULT_ART = {"bird_wave":"./assets/images/image_005_2983c660.webp","bird_jump":"./assets/images/image_006_fa3b31cb.webp","bird_thumb":"./assets/images/image_007_f19aa008.webp","bird_think":"./assets/images/image_008_5a9cd47f.webp","bird_cheer":"./assets/images/image_009_9b84ac39.webp","bird_gold":"./assets/images/image_010_edb614ae.webp","icon_kokugo":"./assets/images/image_011_bd889892.webp","icon_sansu":"./assets/images/image_012_0d0394aa.webp","icon_rika":"./assets/images/image_013_dfdff297.webp","icon_shakai":"./assets/images/image_014_8104da75.webp","icon_town":"./assets/images/image_015_8cf9b455.webp","icon_shop":"./assets/images/image_016_1f357128.webp","icon_write":"./assets/images/image_017_9b8ef0d9.webp","icon_read":"./assets/images/image_018_08245efa.webp","icon_test":"./assets/images/image_019_5c6e21fd.webp","bg_town":"./assets/images/image_020_3a68f4e2.jpg","res_cat":"./assets/images/image_021_99339796.webp","res_dog":"./assets/images/image_022_185d4417.webp","res_sparrow":"./assets/images/image_023_bd34d084.webp","res_rabbit":"./assets/images/image_024_244af166.webp","res_tanuki":"./assets/images/image_025_fdad0c15.webp","res_bear":"./assets/images/image_026_f597d666.webp","res_squirrel":"./assets/images/image_027_105ad55e.webp","res_fox":"./assets/images/image_028_bc0853e5.webp","res_panda":"./assets/images/image_029_d92e351b.webp","bld_house":"./assets/images/image_030_975a9d17.webp","bld_field":"./assets/images/image_031_7a3ab724.webp","bld_flower":"./assets/images/image_032_54066fe1.webp","bld_tree":"./assets/images/image_033_34f46a64.webp","bld_bakery":"./assets/images/image_034_aaf40722.webp","bld_market":"./assets/images/image_035_d07cd64e.webp","bld_park":"./assets/images/image_036_cf92a00b.webp","bld_fountain":"./assets/images/image_037_788b0305.webp","bld_school":"./assets/images/image_038_596aa310.webp","bld_library":"./assets/images/image_039_8b9dc7f2.webp","bld_clinic":"./assets/images/image_040_92bcb1c5.webp","bld_post":"./assets/images/image_041_465759e0.webp","itm_ticket":"./assets/images/image_042_55f89916.webp","itm_rankbook":"./assets/images/image_043_9ecc3c6c.webp","itm_letter":"./assets/images/image_044_ec2cd5de.webp","itm_goldletter":"./assets/images/image_045_8883b410.webp","itm_bench":"./assets/images/image_046_e4c92cfc.webp","itm_lamp":"./assets/images/image_047_6b359042.webp","itm_well":"./assets/images/image_048_b284c432.webp","itm_windmill":"./assets/images/image_049_f6ebf6dc.webp","itm_pond":"./assets/images/image_050_3d830818.webp","veh_bicycle":"./assets/images/image_051_e0910e60.webp","veh_scooter":"./assets/images/image_052_c01eb5ba.webp","veh_kei":"./assets/images/image_053_85fc21df.webp","veh_sedan":"./assets/images/image_054_99bcbfb0.webp","veh_taxi":"./assets/images/image_055_70686993.webp","veh_bus":"./assets/images/image_056_45bd4abb.webp","veh_fire":"./assets/images/image_057_242e95f2.webp","veh_ambulance":"./assets/images/image_058_eef216a8.webp","veh_police":"./assets/images/image_059_b546a73d.webp","veh_garbage":"./assets/images/image_060_26b2bd8c.webp","veh_mail":"./assets/images/image_061_27590f3f.webp","veh_truck":"./assets/images/image_062_52421dad.webp","veh_mixer":"./assets/images/image_063_7605902a.webp","veh_crane":"./assets/images/image_064_7729a618.webp","veh_excavator":"./assets/images/image_065_9d013f82.webp","veh_camper":"./assets/images/image_066_fee3e837.webp","veh_sports":"./assets/images/image_067_7e761ee4.webp","veh_foodtruck":"./assets/images/image_068_95b8a5e6.webp","veh_ev":"./assets/images/image_069_713400d9.webp","veh_doubledecker":"./assets/images/image_070_b6934b29.webp","veh_tractor":"./assets/images/image_071_56d22d32.webp","veh_icecream":"./assets/images/image_072_a9829c09.webp","veh_schoolbus":"./assets/images/image_073_6706a3a5.webp","veh_limo":"./assets/images/image_074_db5b93cf.webp","trn_steam":"./assets/images/image_075_614cd5f9.webp","trn_local":"./assets/images/image_076_bd07f312.webp","trn_express":"./assets/images/image_077_87a432f3.webp","trn_shinkansen":"./assets/images/image_078_77263632.webp","trn_tram":"./assets/images/image_079_9eb0f236.webp","trn_freight":"./assets/images/image_080_ae988c65.webp","trn_station":"./assets/images/image_081_45fa23df.webp","trn_bigstation":"./assets/images/image_082_d437157a.webp","bld_office":"./assets/images/image_083_a4ae0a1f.webp","bld_apartment":"./assets/images/image_084_5d4ccc6b.webp","bld_dept":"./assets/images/image_085_97b24f84.webp","bld_tower":"./assets/images/image_086_d90271ee.webp","bld_hotel":"./assets/images/image_087_8c3a5841.webp","bld_museum":"./assets/images/image_088_90128c28.webp","bld_stadium":"./assets/images/image_089_40f2eb8a.webp","bld_airport":"./assets/images/image_090_f5fc780d.webp","bld_harbor":"./assets/images/image_091_5ecd22d2.webp","bld_ferris":"./assets/images/image_092_fe328936.webp","bld_cityhall":"./assets/images/image_093_f78ee421.webp","bld_parking":"./assets/images/image_094_17351381.webp","res_hamster":"./assets/images/image_095_803ca492.webp","res_penguin":"./assets/images/image_096_f4b41547.webp","res_sheep":"./assets/images/image_097_ff821f38.webp","res_pig":"./assets/images/image_098_3a31f973.webp","res_frog":"./assets/images/image_099_4098f265.webp","res_owl":"./assets/images/image_100_8bc6d446.webp","res_koala":"./assets/images/image_101_457237f9.webp","res_seal":"./assets/images/image_102_87683e3d.webp","res_hedgehog":"./assets/images/image_103_3c6319a4.webp","res_otter":"./assets/images/image_104_9aee9177.webp","res_redpanda":"./assets/images/image_105_9b89dd12.webp","res_alpaca":"./assets/images/image_106_1a5e46ff.webp","bld_birdhouse":"./assets/images/image_107_b9cf61bb.webp","bld_treehouse":"./assets/images/image_108_e0ebb619.webp","bld_logcabin":"./assets/images/image_109_228bc7f5.webp","bld_bamboo":"./assets/images/image_110_ee075109.webp","bld_waterhouse":"./assets/images/image_111_d6601a7a.webp","bld_heliport":"./assets/images/image_112_c8aa7eab.webp","bld_landmark":"./assets/images/image_113_0d290ee1.webp","bld_observatory":"./assets/images/image_114_397535a7.webp","bld_aquarium":"./assets/images/image_115_44426eec.webp","bld_zoo":"./assets/images/image_116_a249ced5.webp","bld_castle":"./assets/images/image_117_80c8becd.webp","bld_space":"./assets/images/image_118_6bb4294a.webp","veh_rally":"./assets/images/image_119_7abaa114.webp","veh_crossover":"./assets/images/image_120_f226dcf5.webp","trn_linear":"./assets/images/image_121_6acc955a.webp","prop_can":"./assets/images/image_122_4fdf1288.webp","fur_bed":"./assets/images/image_123_037f04f8.webp","fur_sofa":"./assets/images/image_124_b06551d2.webp","fur_table":"./assets/images/image_125_1f003d70.webp","fur_chair":"./assets/images/image_126_98cae1c4.webp","fur_shelf":"./assets/images/image_127_91a49d68.webp","fur_desk":"./assets/images/image_128_588fd13b.webp","fur_tv":"./assets/images/image_129_11ea8810.webp","fur_plant":"./assets/images/image_130_ea421f92.webp","fur_rug":"./assets/images/image_131_939f1fea.webp","fur_piano":"./assets/images/image_132_8f75228f.webp","fur_wardrobe":"./assets/images/image_133_a8250803.webp","fur_kitchen":"./assets/images/image_134_71394b86.webp","fur_teddy":"./assets/images/image_135_4e2e19af.webp","fur_clock":"./assets/images/image_136_e9c7708a.webp","fur_aquarium":"./assets/images/image_137_035b241c.webp","fur_globe":"./assets/images/image_138_9bd8d4e9.webp","fur_painting":"./assets/images/image_139_d52b18f6.webp","fur_toybox":"./assets/images/image_140_9384d8a2.webp","fur_lamp":"./assets/images/image_141_52fd8195.webp","fur_fridge":"./assets/images/image_142_657762e7.webp","fur_trainset":"./assets/images/image_143_d822f6bb.webp","fur_shimaplush":"./assets/images/image_144_c232bfb8.webp","fur_dollhouse":"./assets/images/image_145_514068eb.webp","fur_starlight":"./assets/images/image_146_b6f9b429.webp","act_farm":"./assets/images/image_147_a0d05e87.webp","act_rest":"./assets/images/image_148_d2dd3df3.webp","act_read":"./assets/images/image_149_2b82b2fe.webp","act_study":"./assets/images/image_150_d059155c.webp","act_look":"./assets/images/image_151_ec7d3471.webp","act_star":"./assets/images/image_152_6b9e5315.webp","act_bread":"./assets/images/image_153_5b32d284.webp","act_shop":"./assets/images/image_154_5dc8bb1f.webp","act_music":"./assets/images/image_155_2f81be6d.webp","act_zoo":"./assets/images/image_156_252bb343.webp","act_fish":"./assets/images/image_157_2098cb4f.webp","act_fishing":"./assets/images/image_158_500c05fe.webp","act_splash":"./assets/images/image_159_aa6b6ec0.webp","act_mail":"./assets/images/image_160_963d4933.webp","act_clinic":"./assets/images/image_161_75b46c01.webp","act_train":"./assets/images/image_162_5c16f8ec.webp","act_work":"./assets/images/image_163_78b82eca.webp","act_trip":"./assets/images/image_164_17f14ec9.webp","act_king":"./assets/images/image_165_b0395abb.webp","act_home":"./assets/images/image_166_b9977641.webp","act_chat":"./assets/images/image_167_79cd3a04.webp","act_love":"./assets/images/image_168_0c820806.webp","act_wave":"./assets/images/image_169_9ea36dd3.webp","act_fly":"./assets/images/image_170_06f0ed0e.webp","acc_gradcap":"./assets/images/image_171_f5e0ca73.webp","acc_hardhat":"./assets/images/image_172_ecd499ea.webp","acc_tophat":"./assets/images/image_173_35e901a6.webp","acc_flowercrown":"./assets/images/image_174_e19a7a8a.webp","acc_drivercap":"./assets/images/image_175_71bd272a.webp","acc_crown":"./assets/images/image_176_8e189638.webp","acc_tiara":"./assets/images/image_177_110f7116.webp","acc_glasses":"./assets/images/image_178_94f8578c.webp","acc_bowtie":"./assets/images/image_179_24958747.webp","acc_medal":"./assets/images/image_180_6ff4ff5f.webp","acc_cape":"./assets/images/image_181_44bfb53a.webp","acc_star":"./assets/images/image_182_d7fcbf76.webp","x_ghost":"./assets/images/image_183_4db498e8.webp","x_secret":"./assets/images/image_184_9531bb68.webp","x_door":"./assets/images/image_185_92dd14e0.webp","x_gift":"./assets/images/image_186_228a29bd.webp","act_visit":"./assets/images/image_185_92dd14e0.webp","mi_blocks":"./assets/images/image_187_95f49497.webp","mi_mul":"./assets/images/image_188_3b1b2871.webp","mi_pizza":"./assets/images/image_189_99475efa.webp","mi_calc":"./assets/images/image_190_dd055b95.webp","mi_cookie":"./assets/images/image_191_3fd544fe.webp","mi_ruler":"./assets/images/image_192_02959eb8.webp","mi_scale":"./assets/images/image_193_2be4d0ea.webp","mi_clock":"./assets/images/image_194_13fa86e0.webp","mi_line":"./assets/images/image_195_812a8ba4.webp","mi_qbox":"./assets/images/image_196_95f74c2f.webp","mi_cake":"./assets/images/image_197_7fb5e556.webp","mi_cup":"./assets/images/image_198_de18693c.webp","mi_graph":"./assets/images/image_199_5325e33d.webp","mi_tri":"./assets/images/image_200_5d9f9610.webp","mi_coins":"./assets/images/image_201_1e8d5e06.webp","mi_area":"./assets/images/image_202_266dfc52.webp","mi_cube":"./assets/images/image_203_fcb532d8.webp","mi_seesaw":"./assets/images/image_204_99bea9be.webp","mi_pie":"./assets/images/image_205_4864e0de.webp","mi_medal":"./assets/images/image_206_d1b654e6.webp","bm_abacus":"./assets/images/image_207_599ad8b0.webp","bm_ruler":"./assets/images/image_208_afe05e1c.webp","bm_book":"./assets/images/image_209_5fb7ee78.webp","bm_phones":"./assets/images/image_210_c73c5014.webp","ft_bed":"./assets/images/image_211_b6338b69.webp","ft_sofa":"./assets/images/image_212_21899c8c.webp","ft_table":"./assets/images/image_213_b98964cc.webp","ft_chair":"./assets/images/image_214_2d5f1766.webp","ft_shelf":"./assets/images/image_215_f2ebe6db.webp","ft_desk":"./assets/images/image_216_2c198f6b.webp","ft_tv":"./assets/images/image_217_772dcd78.webp","ft_plant":"./assets/images/image_218_22bbb2ad.webp","ft_rug":"./assets/images/image_219_dc09e81a.webp","ft_piano":"./assets/images/image_220_1c309aa0.webp","ft_wardrobe":"./assets/images/image_221_7c18392d.webp","ft_kitchen":"./assets/images/image_222_6c44798a.webp","ft_teddy":"./assets/images/image_223_e4a11ecc.webp","ft_clock":"./assets/images/image_224_6082c6ec.webp","ft_aquarium":"./assets/images/image_225_6ba7bc9b.webp","ft_globe":"./assets/images/image_226_c90cdd9b.webp","ft_painting":"./assets/images/image_227_d697c676.webp","ft_toybox":"./assets/images/image_228_efb4bfcb.webp","ft_lamp":"./assets/images/image_229_c2bd132b.webp","ft_fridge":"./assets/images/image_230_ba698dbd.webp","ft_trainset":"./assets/images/image_231_002af647.webp","ft_shimaplush":"./assets/images/image_232_842db93c.webp","ft_dollhouse":"./assets/images/image_233_66c737de.webp","ft_starlight":"./assets/images/image_234_5895340d.webp","fs_bed":"./assets/images/image_235_92863af7.webp","fs_sofa":"./assets/images/image_236_23318475.webp","fs_table":"./assets/images/image_237_5f34689b.webp","fs_chair":"./assets/images/image_238_3f4715ea.webp","fs_shelf":"./assets/images/image_239_4f5b4742.webp","fs_desk":"./assets/images/image_240_55de50f8.webp","fs_tv":"./assets/images/image_241_044b68e7.webp","fs_plant":"./assets/images/image_242_1b8ff1bf.webp","fs_rug":"./assets/images/image_243_0982b9cf.webp","fs_piano":"./assets/images/image_244_60db86b9.webp","fs_wardrobe":"./assets/images/image_245_14b49ac6.webp","fs_kitchen":"./assets/images/image_246_a5854637.webp","fs_teddy":"./assets/images/image_247_1a906a5e.webp","fs_clock":"./assets/images/image_248_0112e80a.webp","fs_aquarium":"./assets/images/image_249_43edf9d6.webp","fs_globe":"./assets/images/image_250_dac8f909.webp","fs_painting":"./assets/images/image_251_c990ae9d.webp","fs_toybox":"./assets/images/image_252_3ee06603.webp","fs_lamp":"./assets/images/image_253_fa98659d.webp","fs_fridge":"./assets/images/image_254_f68db361.webp","fs_trainset":"./assets/images/image_255_5f66a018.webp","fs_shimaplush":"./assets/images/image_256_9fc2d4c9.webp","fs_dollhouse":"./assets/images/image_257_a1134728.webp","fs_starlight":"./assets/images/image_258_9e7f7126.webp","res_mouse":"./assets/images/image_259_01be2958.webp","res_cow":"./assets/images/image_260_b0bf74c3.webp","res_horse":"./assets/images/image_261_77223e07.webp","res_goat":"./assets/images/image_262_679b68e5.webp","res_hen":"./assets/images/image_263_d9076169.webp","res_duck":"./assets/images/image_264_cee3ba11.webp","res_donkey":"./assets/images/image_265_a256d0a6.webp","res_guinea":"./assets/images/image_266_02b90410.webp","res_ferret":"./assets/images/image_267_da7fa321.webp","res_parrot":"./assets/images/image_268_3a51225b.webp","res_budgie":"./assets/images/image_269_be9be952.webp","res_turtle":"./assets/images/image_270_03f3e81f.webp","res_gecko":"./assets/images/image_271_d6c13efd.webp","res_chipmunk":"./assets/images/image_272_b191ba03.webp","res_mole":"./assets/images/image_273_5a27cc79.webp","res_bat":"./assets/images/image_274_19d518b7.webp","res_raccoon":"./assets/images/image_275_5748fb4b.webp","res_skunk":"./assets/images/image_276_838727f7.webp","res_beaver":"./assets/images/image_277_80972916.webp","res_porcupine":"./assets/images/image_278_d83b4916.webp","res_deer":"./assets/images/image_279_e47a6df8.webp","res_boar":"./assets/images/image_280_c7f69602.webp","res_wolf":"./assets/images/image_281_27206226.webp","res_lynx":"./assets/images/image_282_d54255d6.webp","res_badger":"./assets/images/image_283_3f026a6e.webp","res_macaque":"./assets/images/image_284_96bfe7ca.webp","res_gorilla":"./assets/images/image_285_a889f9ff.webp","res_orangutan":"./assets/images/image_286_1c932bef.webp","res_lemur":"./assets/images/image_287_b0987bd9.webp","res_sloth":"./assets/images/image_288_10de34fd.webp","res_armadillo":"./assets/images/image_289_c65e88e2.webp","res_opossum":"./assets/images/image_290_5dfc6825.webp","res_moose":"./assets/images/image_291_ca08f767.webp","res_bison":"./assets/images/image_292_f398f0b8.webp","res_reindeer":"./assets/images/image_293_d59d4ce6.webp","res_polarbear":"./assets/images/image_294_805f846d.webp","res_fennec":"./assets/images/image_295_0ca10bf1.webp","res_arcticfox":"./assets/images/image_296_d1de441b.webp","res_mongoose":"./assets/images/image_297_f1e0ca43.webp","res_sunbear":"./assets/images/image_298_2fe31b23.webp","res_lion":"./assets/images/image_299_0a8f82ae.webp","res_tiger":"./assets/images/image_300_babcc74b.webp","res_cheetah":"./assets/images/image_301_5e76014a.webp","res_leopard":"./assets/images/image_302_aa4f24ac.webp","res_giraffe":"./assets/images/image_303_7d2b8b11.webp","res_elephant":"./assets/images/image_304_02d5571e.webp","res_zebra":"./assets/images/image_305_1ce167f0.webp","res_hippo":"./assets/images/image_306_bb8e8185.webp","res_rhino":"./assets/images/image_307_3df8d289.webp","res_camel":"./assets/images/image_308_4e408666.webp","res_kangaroo":"./assets/images/image_309_8eed2f4d.webp","res_wallaby":"./assets/images/image_310_99cf58e1.webp","res_meerkat":"./assets/images/image_311_edae061e.webp","res_hyena":"./assets/images/image_312_da963380.webp","res_warthog":"./assets/images/image_313_1109e3b9.webp","res_ostrich":"./assets/images/image_314_c608bc57.webp","res_flamingo":"./assets/images/image_315_95a49ab3.webp","res_toucan":"./assets/images/image_316_1b4c8d06.webp","res_peacock":"./assets/images/image_317_6777c748.webp","res_gazelle":"./assets/images/image_318_aba19fde.webp","res_dolphin":"./assets/images/image_319_4b2ddef1.webp","res_whale":"./assets/images/image_320_8c9f3527.webp","res_shark":"./assets/images/image_321_de151911.webp","res_octopus":"./assets/images/image_322_1a0f7437.webp","res_squid":"./assets/images/image_323_ab1ba6bc.webp","res_crab":"./assets/images/image_324_9abfaa79.webp","res_lobster":"./assets/images/image_325_a2d90c4f.webp","res_jelly":"./assets/images/image_326_36651e41.webp","res_starfish":"./assets/images/image_327_2f764710.webp","res_seaturtle":"./assets/images/image_328_5d29adeb.webp","res_clownfish":"./assets/images/image_329_fb1bc528.webp","res_puffer":"./assets/images/image_330_e4e0f01e.webp","res_seahorse":"./assets/images/image_331_3d116945.webp","res_walrus":"./assets/images/image_332_f181ce79.webp","res_sealion":"./assets/images/image_333_8ddd149b.webp","res_manatee":"./assets/images/image_334_af00e14c.webp","res_axolotl":"./assets/images/image_335_3dbecef7.webp","res_hermit":"./assets/images/image_336_75fa373e.webp","res_narwhal":"./assets/images/image_337_247a2a4a.webp","res_beluga":"./assets/images/image_338_c5f7de1d.webp","res_eagle":"./assets/images/image_339_34f682cf.webp","res_hawk":"./assets/images/image_340_d8e6cab3.webp","res_crow":"./assets/images/image_341_1ff6920b.webp","res_pigeon":"./assets/images/image_342_df94e5ab.webp","res_swallow":"./assets/images/image_343_b5e86d4b.webp","res_robin":"./assets/images/image_344_5cf03660.webp","res_bluebird":"./assets/images/image_345_00378e40.webp","res_hummingbird":"./assets/images/image_346_4cd6b721.webp","res_woodpecker":"./assets/images/image_347_34fcd241.webp","res_kingfisher":"./assets/images/image_348_97aba3a9.webp","res_crane":"./assets/images/image_349_b1401752.webp","res_swan":"./assets/images/image_350_039fb826.webp","res_stork":"./assets/images/image_351_88207084.webp","res_cockatoo":"./assets/images/image_352_1e67dd1f.webp","res_cardinal":"./assets/images/image_353_5c8d57c1.webp","res_mejiro":"./assets/images/image_354_c89d3c03.webp","res_bunchou":"./assets/images/image_355_03889c36.webp","res_snowyowl":"./assets/images/image_356_42f75c6b.webp","res_puffin":"./assets/images/image_357_84ada2c1.webp","res_pelican":"./assets/images/image_358_34944c98.webp","res_capybara":"./assets/images/image_359_b4510972.webp","res_tapir":"./assets/images/image_360_882bfbae.webp","res_okapi":"./assets/images/image_361_3b127fe5.webp","res_pangolin":"./assets/images/image_362_5edeb3b8.webp","res_quokka":"./assets/images/image_363_2dedd219.webp","res_wombat":"./assets/images/image_364_5727ee75.webp","res_platypus":"./assets/images/image_365_8bc075b2.webp","res_kiwi":"./assets/images/image_366_3b310731.webp","res_sugarglider":"./assets/images/image_367_ed85d458.webp","res_chinchilla":"./assets/images/image_368_845e7542.webp","res_tasdevil":"./assets/images/image_369_5ace8a49.webp","res_binturong":"./assets/images/image_370_d6c0004b.webp","res_whitetiger":"./assets/images/image_371_2b642cc2.webp","res_snowleopard":"./assets/images/image_372_ace6b66a.webp","res_goldmonkey":"./assets/images/image_373_fd27c157.webp","res_anteater":"./assets/images/image_374_06b4b2d1.webp","res_corgi":"./assets/images/image_375_2d3e4ea1.webp","res_poodle":"./assets/images/image_376_502a13d0.webp","res_mike":"./assets/images/image_377_2256b724.webp","res_kuroneko":"./assets/images/image_378_d6addf20.webp","res_orca":"./assets/images/image_379_edb4ebfd.webp","res_namazu":"./assets/images/image_380_6b23e1e4.webp","res_girl":"./assets/images/image_381_ddb9be3c.webp","res_girl_party":"./assets/images/image_382_13ee41c3.webp","res_girl_explore":"./assets/images/image_383_0890af16.webp","res_girl_pajama":"./assets/images/image_384_33169f65.webp","ui_study":"./assets/images/image_385_a4153781.webp","ui_town":"./assets/images/image_386_1b4b2fb4.webp","ui_shop":"./assets/images/image_387_a64c128b.webp","ui_myhome":"./assets/images/image_388_26abdd9d.webp","ui_record":"./assets/images/image_389_1b4a374e.webp","ui_zukan":"./assets/images/image_390_af7ae5b6.webp","ui_gear":"./assets/images/image_391_ec6a5533.webp","ui_house":"./assets/images/image_392_973b8fe2.webp","ui_building":"./assets/images/image_393_5eb09928.webp","ui_deco":"./assets/images/image_394_a8b05712.webp","ui_road":"./assets/images/image_395_986ae235.webp","ui_car":"./assets/images/image_396_07e4913d.webp","ui_train":"./assets/images/image_397_8991a6c1.webp","ui_sofa":"./assets/images/image_398_f6696cb4.webp","ui_letter":"./assets/images/image_399_6a42d220.webp","ui_chest":"./assets/images/image_400_fe05b208.webp","ui_paw":"./assets/images/image_401_979ee245.webp","ui_tools":"./assets/images/image_402_ec721a7f.webp","ui_coins":"./assets/images/image_403_1a074cf2.webp","ui_bulb":"./assets/images/image_404_6a17f5cc.webp","hb_study":"./assets/images/image_405_c36cfde4.webp","hb_town":"./assets/images/image_406_4aaa928d.webp","hb_shop":"./assets/images/image_407_db83b485.webp","so_japan":"./assets/images/image_408_a0e5f75a.webp","so_map":"./assets/images/image_409_90b63a17.webp","so_compass":"./assets/images/image_410_9b187dac.webp","so_food":"./assets/images/image_411_a38d8be6.webp","so_firepol":"./assets/images/image_412_be61ad83.webp","so_oldtools":"./assets/images/image_413_b40e7c73.webp","so_shop":"./assets/images/image_414_6c0acf1c.webp","so_factory":"./assets/images/image_415_92f63497.webp","ft_armchair":"./assets/images/image_416_8dfaf2d1.webp","ft_rocking":"./assets/images/image_417_01dac498.webp","ft_beanbag":"./assets/images/image_418_95a62b7b.webp","ft_stool":"./assets/images/image_419_d138c64b.webp","ft_bunkbed":"./assets/images/image_420_c5500e1c.webp","ft_crib":"./assets/images/image_421_96e6bea7.webp","ft_futon":"./assets/images/image_422_1d2b93e0.webp","ft_hammock":"./assets/images/image_423_2e24455d.webp","ft_chabudai":"./assets/images/image_424_bc9c5b34.webp","ft_kotatsu":"./assets/images/image_425_e70d2e2d.webp","ft_wdesk":"./assets/images/image_426_38793e16.webp","ft_pcdesk":"./assets/images/image_427_5a71493c.webp","ft_drawers":"./assets/images/image_428_33d4d36e.webp","ft_cabinet":"./assets/images/image_429_11a8d0ce.webp","ft_coatrack":"./assets/images/image_430_c4a4973f.webp","ft_mirror":"./assets/images/image_431_94b82818.webp","ft_dresser":"./assets/images/image_432_dbf06005.webp","ft_shoerack":"./assets/images/image_433_2182fc47.webp","ft_umbrella":"./assets/images/image_434_2d6498e8.webp","ft_benchin":"./assets/images/image_435_20997259.webp","fs_armchair":"./assets/images/image_436_f32a1d20.webp","fs_rocking":"./assets/images/image_437_19483fc5.webp","fs_beanbag":"./assets/images/image_438_a3f28637.webp","fs_stool":"./assets/images/image_439_75e6eae7.webp","fs_bunkbed":"./assets/images/image_440_81e3b03b.webp","fs_crib":"./assets/images/image_441_7dbf94a2.webp","fs_futon":"./assets/images/image_442_6492a111.webp","fs_hammock":"./assets/images/image_443_207ab33d.webp","fs_chabudai":"./assets/images/image_444_f49a72d3.webp","fs_kotatsu":"./assets/images/image_445_6383e6a0.webp","fs_wdesk":"./assets/images/image_446_c33c9cc0.webp","fs_pcdesk":"./assets/images/image_447_e97f79c8.webp","fs_drawers":"./assets/images/image_448_dbdd96fb.webp","fs_cabinet":"./assets/images/image_449_c626b858.webp","fs_coatrack":"./assets/images/image_450_503e3479.webp","fs_mirror":"./assets/images/image_451_c5e7f0aa.webp","fs_dresser":"./assets/images/image_452_44f848c4.webp","fs_shoerack":"./assets/images/image_453_f1e1bcaa.webp","fs_umbrella":"./assets/images/image_454_0fee8225.webp","fs_benchin":"./assets/images/image_455_945c5d6a.webp","ft_bathtub":"./assets/images/image_456_049597a9.webp","ft_toilet":"./assets/images/image_457_e87a5320.webp","ft_washbasin":"./assets/images/image_458_6dbca411.webp","ft_washer":"./assets/images/image_459_7afb947b.webp","ft_microwave":"./assets/images/image_460_904d7a60.webp","ft_ricecooker":"./assets/images/image_461_de364e78.webp","ft_oven":"./assets/images/image_462_b1d4c549.webp","ft_coffee":"./assets/images/image_463_452c6c51.webp","ft_waterdisp":"./assets/images/image_464_0f37e087.webp","ft_robovac":"./assets/images/image_465_ffa555b5.webp","ft_fan":"./assets/images/image_466_a21cd53d.webp","ft_heater":"./assets/images/image_467_6373dec5.webp","ft_humidifier":"./assets/images/image_468_9ac13f14.webp","ft_speaker":"./assets/images/image_469_4a311a6e.webp","ft_stereo":"./assets/images/image_470_048150da.webp","ft_gametv":"./assets/images/image_471_3aef2982.webp","ft_arcade":"./assets/images/image_472_712bfe76.webp","ft_jukebox":"./assets/images/image_473_738be8ce.webp","ft_popcorn":"./assets/images/image_474_a958b460.webp","ft_cottoncandy":"./assets/images/image_475_11f2cba9.webp","fs_bathtub":"./assets/images/image_476_99997a71.webp","fs_toilet":"./assets/images/image_477_b0983a26.webp","fs_washbasin":"./assets/images/image_478_b72d4a15.webp","fs_washer":"./assets/images/image_479_e5c43238.webp","fs_microwave":"./assets/images/image_480_2aca1abb.webp","fs_ricecooker":"./assets/images/image_481_090d0995.webp","fs_oven":"./assets/images/image_482_9173beb5.webp","fs_coffee":"./assets/images/image_483_faa53d7b.webp","fs_waterdisp":"./assets/images/image_484_88beca75.webp","fs_robovac":"./assets/images/image_485_41034dd0.webp","fs_fan":"./assets/images/image_486_c4262423.webp","fs_heater":"./assets/images/image_487_597fb188.webp","fs_humidifier":"./assets/images/image_488_5468c3fe.webp","fs_speaker":"./assets/images/image_489_5ecedf57.webp","fs_stereo":"./assets/images/image_490_547759a6.webp","fs_gametv":"./assets/images/image_491_2230cb50.webp","fs_arcade":"./assets/images/image_492_c30393c1.webp","fs_jukebox":"./assets/images/image_493_52fef2c6.webp","fs_popcorn":"./assets/images/image_494_de9091ac.webp","fs_cottoncandy":"./assets/images/image_495_31567a30.webp","ft_grandpiano":"./assets/images/image_496_5165cc54.webp","ft_guitar":"./assets/images/image_497_7fff29ec.webp","ft_drums":"./assets/images/image_498_4715761a.webp","ft_harp":"./assets/images/image_499_ef343e31.webp","ft_telescope":"./assets/images/image_500_179ecd60.webp","ft_sewing":"./assets/images/image_501_91033275.webp","ft_easel":"./assets/images/image_502_e2e1b002.webp","ft_pottery":"./assets/images/image_503_7a7cdb5c.webp","ft_workbench":"./assets/images/image_504_7df7698a.webp","ft_treadmill":"./assets/images/image_505_f7b15ab6.webp","ft_punchbag":"./assets/images/image_506_2aad9ca6.webp","ft_goldfish":"./assets/images/image_507_f5970af4.webp","ft_birdcage":"./assets/images/image_508_07c089e2.webp","ft_cattree":"./assets/images/image_509_2f8c83e2.webp","ft_dogbed":"./assets/images/image_510_483e224d.webp","ft_hamcage":"./assets/images/image_511_3c142067.webp","ft_terrarium":"./assets/images/image_512_36bc8be6.webp","ft_bonsai":"./assets/images/image_513_09162f64.webp","ft_cactus":"./assets/images/image_514_01c7b27b.webp","ft_hangflower":"./assets/images/image_515_8fc2adc0.webp","fs_grandpiano":"./assets/images/image_516_9e6594ff.webp","fs_guitar":"./assets/images/image_517_c641ea8a.webp","fs_drums":"./assets/images/image_518_5498d3ad.webp","fs_harp":"./assets/images/image_519_5ce6817f.webp","fs_telescope":"./assets/images/image_520_d019ef27.webp","fs_sewing":"./assets/images/image_521_1ed96f39.webp","fs_easel":"./assets/images/image_522_c346df8e.webp","fs_pottery":"./assets/images/image_523_7ae3ec50.webp","fs_workbench":"./assets/images/image_524_7dc3809b.webp","fs_treadmill":"./assets/images/image_525_ac6b75c9.webp","fs_punchbag":"./assets/images/image_526_a0c7042f.webp","fs_goldfish":"./assets/images/image_527_cc110fb7.webp","fs_birdcage":"./assets/images/image_528_d7d6387d.webp","fs_cattree":"./assets/images/image_529_21cf4ead.webp","fs_dogbed":"./assets/images/image_530_ad3e4dde.webp","fs_hamcage":"./assets/images/image_531_dd6afc9b.webp","fs_terrarium":"./assets/images/image_532_58406f22.webp","fs_bonsai":"./assets/images/image_533_7cdfaf2b.webp","fs_cactus":"./assets/images/image_534_63e0235d.webp","fs_hangflower":"./assets/images/image_535_bf9e5990.webp","ft_fireplace":"./assets/images/image_536_0965dd2d.webp","ft_xmastree":"./assets/images/image_537_b1802dae.webp","ft_snowplush":"./assets/images/image_538_ff5a989a.webp","ft_pumpkinlamp":"./assets/images/image_539_4d56f459.webp","ft_hina":"./assets/images/image_540_1cbfb80f.webp","ft_samurai":"./assets/images/image_541_a8e3962e.webp","ft_tansu":"./assets/images/image_542_3c56d061.webp","ft_andon":"./assets/images/image_543_2a4fbb6e.webp","ft_byobu":"./assets/images/image_544_78fe80c3.webp","ft_throne":"./assets/images/image_545_c4ff18b5.webp","ft_canopybed":"./assets/images/image_546_d68ce801.webp","ft_treasure":"./assets/images/image_547_969a4588.webp","ft_knight":"./assets/images/image_548_3c9adf2b.webp","ft_robot":"./assets/images/image_549_91e99335.webp","ft_rocket":"./assets/images/image_550_e5b622ee.webp","ft_dino":"./assets/images/image_551_3aa5a5a3.webp","ft_unicorn":"./assets/images/image_552_df57ea64.webp","ft_bigteddy":"./assets/images/image_553_6b560aec.webp","ft_crystal":"./assets/images/image_554_5055e705.webp","ft_trophy":"./assets/images/image_555_7857cbea.webp","fs_fireplace":"./assets/images/image_556_0d87ed16.webp","fs_xmastree":"./assets/images/image_557_dd85cd39.webp","fs_snowplush":"./assets/images/image_558_2e4ebbe6.webp","fs_pumpkinlamp":"./assets/images/image_559_e2a9d0c3.webp","fs_hina":"./assets/images/image_560_d5462817.webp","fs_samurai":"./assets/images/image_561_1eaedb0e.webp","fs_tansu":"./assets/images/image_562_b595c060.webp","fs_andon":"./assets/images/image_563_1188d20d.webp","fs_byobu":"./assets/images/image_564_e0696f8c.webp","fs_throne":"./assets/images/image_565_29964a4e.webp","fs_canopybed":"./assets/images/image_566_8090e938.webp","fs_treasure":"./assets/images/image_567_93993971.webp","fs_knight":"./assets/images/image_568_84dd6001.webp","fs_robot":"./assets/images/image_569_525523b1.webp","fs_rocket":"./assets/images/image_570_d153688d.webp","fs_dino":"./assets/images/image_571_264d5267.webp","fs_unicorn":"./assets/images/image_572_19a2afc4.webp","fs_bigteddy":"./assets/images/image_573_73c511e1.webp","fs_crystal":"./assets/images/image_574_6e89f58c.webp","fs_trophy":"./assets/images/image_575_f3b1addd.webp","dc_sakura":"./assets/images/image_576_205f9309.webp","dc_maple":"./assets/images/image_577_c6b70796.webp","dc_pine":"./assets/images/image_578_0e7aef01.webp","dc_palm":"./assets/images/image_579_48460aa5.webp","dc_bamboo":"./assets/images/image_580_5c1a1ceb.webp","dc_sunflower":"./assets/images/image_581_678f6085.webp","dc_rosearch":"./assets/images/image_582_80566e28.webp","dc_tulip":"./assets/images/image_583_b30b48a8.webp","dc_hedge":"./assets/images/image_584_9c247405.webp","dc_mushroom":"./assets/images/image_585_9b3a324e.webp","dc_rocks":"./assets/images/image_586_13d20119.webp","dc_bridge":"./assets/images/image_587_34f324bb.webp","dc_fence":"./assets/images/image_588_df533656.webp","dc_stonelamp":"./assets/images/image_589_4a4dba45.webp","dc_torii":"./assets/images/image_590_072ab48c.webp","dc_birdbath":"./assets/images/image_591_44296ef2.webp","dc_flowercart":"./assets/images/image_592_6f408dbf.webp","dc_scarecrow":"./assets/images/image_593_7cd572ad.webp","dc_signpost":"./assets/images/image_594_e78329e1.webp","dc_catstatue":"./assets/images/image_595_d4721306.webp","dc_clocktower":"./assets/images/image_596_ac7fc913.webp","dc_pennant":"./assets/images/image_597_99428f7a.webp","dc_mailbox":"./assets/images/image_598_a7f4147f.webp","dc_phonebooth":"./assets/images/image_599_7fcecdb9.webp","dc_vending":"./assets/images/image_600_1235e520.webp","dc_busstop":"./assets/images/image_601_677dd59f.webp","dc_bikerack":"./assets/images/image_602_a8a30a5f.webp","dc_recycle":"./assets/images/image_603_637873f2.webp","dc_hydrant":"./assets/images/image_604_202b7f76.webp","dc_picnic":"./assets/images/image_605_4403e93c.webp","dc_parasol":"./assets/images/image_606_637f148b.webp","dc_swing":"./assets/images/image_607_de1ea371.webp","dc_slide":"./assets/images/image_608_915c3cd8.webp","dc_sandbox":"./assets/images/image_609_c54396ca.webp","dc_seesaw":"./assets/images/image_610_c462e37c.webp","dc_junglegym":"./assets/images/image_611_e235196b.webp","dc_trampoline":"./assets/images/image_612_3bf32d68.webp","dc_carousel":"./assets/images/image_613_b5dabec2.webp","dc_balloon":"./assets/images/image_614_2403bcea.webp","dc_springhorse":"./assets/images/image_615_af45a62d.webp","dc_snowman":"./assets/images/image_616_b48f17f0.webp","dc_xmasout":"./assets/images/image_617_8464e1b0.webp","dc_pumpkins":"./assets/images/image_618_98692ea8.webp","dc_tanabata":"./assets/images/image_619_bb72958c.webp","dc_koinobori":"./assets/images/image_620_25fef5fc.webp","dc_kadomatsu":"./assets/images/image_621_b72b7f0b.webp","dc_campfire":"./assets/images/image_622_df79b83e.webp","dc_tent":"./assets/images/image_623_7f805648.webp","dc_onsen":"./assets/images/image_624_6b27efab.webp","dc_gazebo":"./assets/images/image_625_d0fd6b55.webp","dc_totem":"./assets/images/image_626_3c107b84.webp","dc_bigpot":"./assets/images/image_627_1c38fec1.webp","dc_topiary":"./assets/images/image_628_b9d7036b.webp","dc_waterfall":"./assets/images/image_629_8fb78d76.webp","dc_koipond":"./assets/images/image_630_b70b11d0.webp","dc_duckpond":"./assets/images/image_631_0ebfc9a8.webp","dc_rainbow":"./assets/images/image_632_62de75c1.webp","dc_hotair":"./assets/images/image_633_990440c6.webp","dc_lighthouse":"./assets/images/image_634_c61321f6.webp","dc_beehive":"./assets/images/image_635_468f65ad.webp","dc_coop":"./assets/images/image_636_19cd0df8.webp","dc_doghouse":"./assets/images/image_637_92d9cb45.webp","dc_vegstand":"./assets/images/image_638_059c5576.webp","dc_icestand":"./assets/images/image_639_4913aab8.webp","dc_takoyaki":"./assets/images/image_640_da45aa7c.webp","dc_crepe":"./assets/images/image_641_2c596b60.webp","dc_omikuji":"./assets/images/image_642_f9e7d6a6.webp","dc_hokora":"./assets/images/image_643_4943fde8.webp","dc_jizo":"./assets/images/image_644_b87e5fde.webp","dc_daruma":"./assets/images/image_645_2ae95029.webp","dc_shimastatue":"./assets/images/image_646_be5e90b1.webp","dc_trophystat":"./assets/images/image_647_a1dcef77.webp","dc_stardeck":"./assets/images/image_648_f2cfe7c1.webp","dc_flowerclock":"./assets/images/image_649_7f2b8b58.webp","dc_mushhouse":"./assets/images/image_650_5413ac3f.webp","dc_crystaltower":"./assets/images/image_651_01ada96f.webp","dc_rainbowfount":"./assets/images/image_652_fbd08a4d.webp","dc_bellarch":"./assets/images/image_653_be0d235b.webp","sq_washboard":"./assets/images/image_654_c885d57d.webp","sq_hibachi":"./assets/images/image_655_22245edd.webp","sq_kamado":"./assets/images/image_656_a8e22c62.webp","sq_chabudai":"./assets/images/image_657_afef6578.webp","sq_abacus":"./assets/images/image_658_a48e99ae.webp","sq_dialphone":"./assets/images/image_659_bc1a0094.webp","sq_icebox":"./assets/images/image_660_ddce33f8.webp","sq_oldiron":"./assets/images/image_661_2dde6a38.webp","sq_washer":"./assets/images/image_662_7948d011.webp","sq_aircon":"./assets/images/image_663_00cfd189.webp","sq_fireman":"./assets/images/image_664_f356bea1.webp","sq_police":"./assets/images/image_665_eb585b80.webp","sq_farmer":"./assets/images/image_666_9d549c54.webp","sq_fisher":"./assets/images/image_667_9032450b.webp","sq_worker":"./assets/images/image_668_2e551e54.webp","sq_hydrant":"./assets/images/image_669_a24452be.webp","sq_pricetag":"./assets/images/image_670_99fdea52.webp","sq_flyer":"./assets/images/image_671_c60c665a.webp","sq_fuji":"./assets/images/image_672_1461976e.webp","sq_river":"./assets/images/image_673_8af03aeb.webp","dc_manekineko":"./assets/images/image_674_51d86229.webp","dc_minicastle":"./assets/images/image_675_d23d586a.webp","jp_0":"./assets/images/image_676_c03cd031.webp","jp_1":"./assets/images/image_677_4821b3a5.webp","jp_2":"./assets/images/image_678_c846ddd4.webp","jp_3":"./assets/images/image_679_6428c267.webp","jp_4":"./assets/images/image_680_da9fba2d.webp","jp_5":"./assets/images/image_681_a88223bc.webp","jp_6":"./assets/images/image_682_ccaa5307.webp","jp_7":"./assets/images/image_683_97a2a561.webp","jp_8":"./assets/images/image_684_83752a08.webp","jp_9":"./assets/images/image_685_e9388a68.webp","jp_10":"./assets/images/image_686_8e02fa17.webp","jp_11":"./assets/images/image_687_46d9f7e8.webp","jp_12":"./assets/images/image_688_cb4d7d7c.webp","jp_13":"./assets/images/image_689_4628bddd.webp","jp_14":"./assets/images/image_690_c8622952.webp","jp_15":"./assets/images/image_691_50fd52d9.webp","jp_16":"./assets/images/image_692_f8a5a5f7.webp","jp_17":"./assets/images/image_693_3afbc37d.webp","jp_18":"./assets/images/image_694_96f6d5fa.webp","jp_19":"./assets/images/image_695_3fe8dd7c.webp","wp_0":"./assets/images/image_696_e210dc53.webp","wp_1":"./assets/images/image_697_5971a5ca.webp","wp_2":"./assets/images/image_698_c513789b.webp","wp_3":"./assets/images/image_699_b86245ed.webp","wp_4":"./assets/images/image_700_a5bad0fb.webp","wp_5":"./assets/images/image_701_16e7fd61.webp","wp_6":"./assets/images/image_702_1a830591.webp","wp_7":"./assets/images/image_703_09594945.webp","wp_8":"./assets/images/image_704_15dc06ff.webp","wp_9":"./assets/images/image_705_70594544.webp","wp_10":"./assets/images/image_706_2f40093f.webp","wp_11":"./assets/images/image_707_e7935c6c.webp","wp_12":"./assets/images/image_708_18a5c76f.webp","wp_13":"./assets/images/image_709_ced9365d.webp","wp_14":"./assets/images/image_710_864ebd20.webp","wp_15":"./assets/images/image_711_38ae67df.webp","wp_16":"./assets/images/image_712_d9c92880.webp","wp_17":"./assets/images/image_713_56241d90.webp","wp_18":"./assets/images/image_714_1b1b297c.webp","wp_19":"./assets/images/image_715_b4921bee.webp","wh_0":"./assets/images/image_716_6a3bca57.webp","wh_1":"./assets/images/image_717_77223f9c.webp","wh_2":"./assets/images/image_718_f6bab704.webp","wh_3":"./assets/images/image_719_30fdea32.webp","wh_4":"./assets/images/image_720_3fc60f70.webp","wh_5":"./assets/images/image_721_dc0af776.webp","wh_6":"./assets/images/image_722_78d8132c.webp","wh_7":"./assets/images/image_723_45c106c8.webp","wh_8":"./assets/images/image_724_8cb0f82c.webp","wh_9":"./assets/images/image_725_c5af9395.webp","wh_10":"./assets/images/image_726_ac5f32b6.webp","wh_11":"./assets/images/image_727_8c1a9d15.webp","wh_12":"./assets/images/image_728_1bed60e0.webp","wh_13":"./assets/images/image_729_037b436f.webp","wh_14":"./assets/images/image_730_3a6b1923.webp","wh_15":"./assets/images/image_731_3c4ac88a.webp","wh_16":"./assets/images/image_732_6962edbe.webp","wh_18":"./assets/images/image_733_6cdd26b7.webp","wh_19":"./assets/images/image_734_83a77336.webp","jh_0":"./assets/images/image_735_1f777a7b.webp","jh_1":"./assets/images/image_736_be859c94.webp","jh_2":"./assets/images/image_737_3bfcad48.webp","jh_3":"./assets/images/image_738_42fa2a35.webp","jh_4":"./assets/images/image_739_5db82a32.webp","jh_5":"./assets/images/image_740_a2838d55.webp","jh_6":"./assets/images/image_741_2e13ded0.webp","jh_7":"./assets/images/image_742_f7285f53.webp","jh_8":"./assets/images/image_743_6b831a4d.webp","jh_9":"./assets/images/image_744_7bb4b53a.webp","jh_10":"./assets/images/image_745_f99f0ffa.webp","jh_11":"./assets/images/image_746_b59698dc.webp","jh_12":"./assets/images/image_747_867781ed.webp","jh_13":"./assets/images/image_748_d0cd5cdf.webp","jh_14":"./assets/images/image_749_5402de48.webp","jh_15":"./assets/images/image_750_b8aef0d8.webp","jh_16":"./assets/images/image_751_cc15461b.webp","jh_17":"./assets/images/image_752_26688488.webp","jh_18":"./assets/images/image_753_4859df58.webp","jh_19":"./assets/images/image_754_964ec2bb.webp","wh_17":"./assets/images/image_755_3237c949.webp","logo_main":"./assets/images/image_004_fe46abb5.webp","logo_home":"./assets/images/image_756_6f3f5b01.webp","bg_myhome":"./assets/images/image_757_71a0194a.jpg","ri_butterfly":"./assets/images/image_758_425d7453.webp","ri_ladybug":"./assets/images/image_759_235bae07.webp","ri_sunflower":"./assets/images/image_760_88a9cff9.webp","ri_frog":"./assets/images/image_761_12f90cad.webp","ri_loupe":"./assets/images/image_762_4ec9f582.webp","ri_magnet":"./assets/images/image_763_0c155365.webp","ri_circuit":"./assets/images/image_764_be5327f8.webp","ri_shadow":"./assets/images/image_765_3aede00f.webp","ri_thermo":"./assets/images/image_766_ebbd94d7.webp","ri_beaker":"./assets/images/image_767_3dd2ded9.webp","ri_earth":"./assets/images/image_768_fcc4a4cb.webp","ri_water":"./assets/images/image_769_9bf1b510.webp","ri_volcano":"./assets/images/image_770_d2e27e60.webp","ri_body":"./assets/images/image_771_3a820ccc.webp","ri_scope":"./assets/images/image_772_6b752a7d.webp","ri_balance":"./assets/images/image_773_20a5309b.webp","ri_lever":"./assets/images/image_774_a780746a.webp","ri_stars":"./assets/images/image_775_a6571fe2.webp","ri_flower":"./assets/images/image_776_2ee9888d.webp","ri_fossil":"./assets/images/image_777_2c5c946d.webp","rp_bee":"./assets/images/image_778_1cdca990.webp","rp_ant":"./assets/images/image_779_e577df52.webp","rp_dragonfly":"./assets/images/image_780_5e2fa4e5.webp","rp_grasshopper":"./assets/images/image_781_bb03bf6f.webp","rp_spider":"./assets/images/image_782_ebb07276.webp","rp_kabuto":"./assets/images/image_783_9fcb47cf.webp","rp_cicada":"./assets/images/image_784_e44b4e40.webp","rp_mantis":"./assets/images/image_785_25dc80a6.webp","rp_caterpillar":"./assets/images/image_786_c717d826.webp","rp_pupa":"./assets/images/image_787_ce48263c.webp","rp_tulip":"./assets/images/image_788_6583c059.webp","rp_dandelion":"./assets/images/image_789_29cb74a7.webp","rp_asagao":"./assets/images/image_790_d9c2cd1f.webp","rp_tomato":"./assets/images/image_791_4914b2e5.webp","rp_rice":"./assets/images/image_792_b54b20f7.webp","rp_halfmoon":"./assets/images/image_793_b3e66ee1.webp","rp_fullmoon":"./assets/images/image_794_663862a5.webp","rp_crescent":"./assets/images/image_795_5092d627.webp","rp_saturn":"./assets/images/image_796_01099175.webp","rp_dipper":"./assets/images/image_797_12466de2.webp","boss_king":"./assets/images/image_798_36e98a8f.webp","boss_ice":"./assets/images/image_799_7ccc0daa.webp","boss_fire":"./assets/images/image_800_1c1414f4.webp","boss_rainbow":"./assets/images/image_801_9eec0e36.webp","ev_pumpkins":"./assets/images/image_802_4deb7ec6.webp","ev_ghostlamp":"./assets/images/image_803_3f1f636c.webp","ev_witchhat":"./assets/images/image_804_384884cf.webp","ev_candy":"./assets/images/image_805_c19157d3.webp","ev_santa":"./assets/images/image_806_a252fed6.webp","ev_presents":"./assets/images/image_807_1a8c4c45.webp","ev_wreath":"./assets/images/image_808_c69f614f.webp","ev_sled":"./assets/images/image_809_80f8e093.webp","ev_omikuji":"./assets/images/image_810_27749719.webp","ev_kagami":"./assets/images/image_811_924ab9f9.webp","ev_hagoita":"./assets/images/image_812_e0624883.webp","ev_dragonkite":"./assets/images/image_813_ff6c203f.webp","en_eat":"./assets/images/image_814_46bb13d9.webp","en_run":"./assets/images/image_815_87e9da02.webp","en_swim":"./assets/images/image_816_3d1a555e.webp","en_sleep":"./assets/images/image_817_8527c019.webp","en_read":"./assets/images/image_818_d1436d04.webp","en_sing":"./assets/images/image_819_1bf7e551.webp","en_happy":"./assets/images/image_820_784e8f22.webp","en_sad":"./assets/images/image_821_ebdb914e.webp","en_angry":"./assets/images/image_822_59de15ea.webp","en_sleepy":"./assets/images/image_823_b2d21830.webp","en_hungry":"./assets/images/image_824_25504cba.webp","en_surprised":"./assets/images/image_825_fb041dc1.webp","en_sunny":"./assets/images/image_826_81f3d02e.webp","en_rainy":"./assets/images/image_827_9c901498.webp","en_snowy":"./assets/images/image_828_fc764dc0.webp","en_cloudy":"./assets/images/image_829_a2d83629.webp","en_windy":"./assets/images/image_830_4d4d52de.webp","en_rainbow":"./assets/images/image_831_4edda18c.webp","en_tshirt":"./assets/images/image_832_d931545a.webp","en_cap":"./assets/images/image_833_a8fc98fe.webp","en_shoes":"./assets/images/image_834_a1be2922.webp","en_socks":"./assets/images/image_835_0a214ea1.webp","en_skirt":"./assets/images/image_836_5468b482.webp","en_coat":"./assets/images/image_837_3e6f64a7.webp","en_soccer":"./assets/images/image_838_1f32fe79.webp","en_baseball":"./assets/images/image_839_dc957427.webp","en_tennis":"./assets/images/image_840_abe8fd0e.webp","en_basketball":"./assets/images/image_841_ad5b2547.webp","en_piano":"./assets/images/image_842_d96f3fb1.webp","en_guitar":"./assets/images/image_843_2135c8d2.webp","en_apple":"./assets/images/image_844_52bdff7b.webp","en_banana":"./assets/images/image_845_2c2f7341.webp","en_orange":"./assets/images/image_846_a92379f3.webp","en_strawberry":"./assets/images/image_847_6bdb74f5.webp","en_grapes":"./assets/images/image_848_e0fd774c.webp","en_watermelon":"./assets/images/image_849_34bc1b86.webp","en_dog":"./assets/images/image_850_6ea50baa.webp","en_cat":"./assets/images/image_851_5904709f.webp","en_rabbit":"./assets/images/image_852_70f6c195.webp","en_bird":"./assets/images/image_853_8c0167ff.webp","en_fish":"./assets/images/image_854_0db43276.webp","en_elephant":"./assets/images/image_855_e75c1723.webp","en_car":"./assets/images/image_856_cf2dc756.webp","en_bus":"./assets/images/image_857_dd69ac74.webp","en_bike":"./assets/images/image_858_ae22f93c.webp","en_airplane":"./assets/images/image_859_d0996f7a.webp","en_boat":"./assets/images/image_860_d85b0c09.webp","en_train":"./assets/images/image_861_62b72e4f.webp","en_book":"./assets/images/image_862_d4166bc1.webp","en_pencil":"./assets/images/image_863_6c4c853f.webp","en_bag":"./assets/images/image_864_73e8e184.webp","en_chair":"./assets/images/image_865_ba98a6c3.webp","en_clock":"./assets/images/image_866_788500c9.webp","en_umbrella":"./assets/images/image_867_4fa47b91.webp","en_sun":"./assets/images/image_868_3f2de484.webp","en_moon":"./assets/images/image_869_a5a7a264.webp","en_star":"./assets/images/image_870_c6211a66.webp","en_tree":"./assets/images/image_871_d3f745d0.webp","en_flower":"./assets/images/image_872_cf6b576c.webp","en_house":"./assets/images/image_873_a5f41b76.webp","logo_study":"./assets/images/image_874_bf94b6b5.webp","logo_town":"./assets/images/image_875_582e8701.webp","logo_shop":"./assets/images/image_876_08f6d94a.webp","logo_record":"./assets/images/image_877_9d0d28fc.webp","logo_zukan":"./assets/images/image_878_002bddd5.webp","hd_back":"./assets/images/image_879_ee702dd9.webp","hd_coin":"./assets/images/image_880_1b8add1a.webp","hd_homebtn":"./assets/images/image_881_16648999.webp","hd_gear":"./assets/images/image_882_cb100d17.webp","veh_whitebike":"./assets/images/image_883_885bb3a0.webp","veh_ladder":"./assets/images/image_884_54be3261.webp","veh_tow":"./assets/images/image_885_b5b5fc96.webp","veh_compactor":"./assets/images/image_886_11adddfc.webp","veh_vanblue":"./assets/images/image_887_2082e8ac.webp","veh_minivan":"./assets/images/image_888_3288196f.webp","veh_convert":"./assets/images/image_889_1104e001.webp","veh_pickup":"./assets/images/image_890_c9dd4f8f.webp","veh_wagon":"./assets/images/image_891_ec67310c.webp","veh_jeep":"./assets/images/image_892_1dc589f6.webp","veh_kart":"./assets/images/image_893_470eef23.webp","veh_trolley":"./assets/images/image_894_b9c0c194.webp","veh_luxvan":"./assets/images/image_895_e71bc59b.webp","veh_dump":"./assets/images/image_896_faa4a1f7.webp","veh_tanker":"./assets/images/image_897_8892bf0f.webp","veh_beetle":"./assets/images/image_898_70cebb8b.webp","veh_retroscoot":"./assets/images/image_899_b33da894.webp","veh_camperbus":"./assets/images/image_900_d57f3e4b.webp","veh_blacktaxi":"./assets/images/image_901_22a97006.webp","veh_sightbus":"./assets/images/image_902_39b100d9.webp","veh_snowplow":"./assets/images/image_903_8d867125.webp","veh_shuttle":"./assets/images/image_904_3e6a2158.webp","veh_forklift":"./assets/images/image_905_8b630fd7.webp","veh_baketrike":"./assets/images/image_906_60880eda.webp","veh_roller":"./assets/images/image_907_6095ae09.webp","veh_sweeper":"./assets/images/image_908_d43aefb3.webp","veh_rescue":"./assets/images/image_909_a8f09e0a.webp","veh_command":"./assets/images/image_910_63422f52.webp","veh_carriage":"./assets/images/image_911_4fc8a597.webp","veh_partybus":"./assets/images/image_912_a3682cc2.webp","bld_firestation":"./assets/images/image_913_b0d0642a.webp","bld_koban":"./assets/images/image_914_f4b43d10.webp","bld_gasstation":"./assets/images/image_915_d4f96f3f.webp","bld_dealer":"./assets/images/image_916_0aeb1622.webp","fx_pumpkin":"./assets/images/image_917_fcf96a5b.webp","fx_ghost":"./assets/images/image_918_7d0e8770.webp","fx_candy":"./assets/images/image_919_7992092e.webp","fx_bat":"./assets/images/image_920_9908fd58.webp","fx_snow":"./assets/images/image_921_8dfcd3c2.webp","fx_star":"./assets/images/image_922_1429e262.webp","fx_gift":"./assets/images/image_923_ad0ec8b7.webp","fx_holly":"./assets/images/image_924_81b427c3.webp","fx_sakura":"./assets/images/image_925_3f8f36ab.webp","fx_momiji":"./assets/images/image_926_8e5ae1b5.webp","fx_sunflower":"./assets/images/image_927_20a3fd64.webp","fx_lantern":"./assets/images/image_928_8bec7d82.webp","hb_spring":"./assets/images/image_929_67e68030.jpg","hb_summer":"./assets/images/image_930_a85dc99c.jpg","hb_autumn":"./assets/images/image_931_ce13d2d0.jpg","hb_winter":"./assets/images/image_932_08d41ca3.jpg","hb_city":"./assets/images/image_933_12e31f4e.jpg","hb_citywinter":"./assets/images/image_934_08bedaa4.jpg","tx_road":"./assets/images/image_935_eb8abe3d.jpg","tx_road_brick":"./assets/images/image_936_fd0badff.jpg","tx_road_stone":"./assets/images/image_937_171e6a90.jpg","tx_road_dirt":"./assets/images/image_938_3a440157.jpg","tx_road_pastel":"./assets/images/image_939_e8f8c2c8.jpg","tx_f_oak":"./assets/images/image_940_be1c4b7f.jpg","tx_f_herring":"./assets/images/image_941_9504954f.jpg","tx_f_tatami":"./assets/images/image_942_8fc4b57a.jpg","tx_f_marble":"./assets/images/image_943_f715783d.jpg","tx_f_carpet":"./assets/images/image_944_ae827779.jpg","tx_f_checker":"./assets/images/image_945_bb09d138.jpg","tx_w_flower":"./assets/images/image_946_bcee1891.jpg","tx_w_mint":"./assets/images/image_947_a01ddc09.jpg","tx_w_star":"./assets/images/image_948_a5eb4d04.jpg","tx_w_heart":"./assets/images/image_949_4017a1e0.jpg","tx_w_wood":"./assets/images/image_950_93d31600.jpg","tx_w_brick":"./assets/images/image_951_6893b39d.jpg","tx_w_cloud":"./assets/images/image_952_d66018ee.jpg","tx_w_wave":"./assets/images/image_953_32fd0db0.jpg","tx_w_damask":"./assets/images/image_954_0cd376d0.jpg","sc_tree":"./assets/images/image_955_8e1735dd.jpg","sc_sakura":"./assets/images/image_956_78f8365f.jpg","sc_library":"./assets/images/image_957_94637d04.jpg","sc_bakery":"./assets/images/image_958_29682551.jpg","sc_pond":"./assets/images/image_959_47af51f7.jpg","sc_stars":"./assets/images/image_960_53d10014.jpg","sc_harbor":"./assets/images/image_961_69c083e8.jpg","sc_snow":"./assets/images/image_962_c3b63cb7.jpg","sc_fountain":"./assets/images/image_963_8fa997df.jpg","sc_flowers":"./assets/images/image_964_8c6f5c5e.jpg","sc_festival":"./assets/images/image_965_73bcb555.jpg","sc_castle":"./assets/images/image_966_8b8dfd93.jpg","sc_onsen":"./assets/images/image_967_bd9508f1.jpg","sc_park":"./assets/images/image_968_8a021f5c.jpg","scu_redpanda_park":"./assets/images/image_969_0b83ea3c.jpg","scu_redpanda_fountain":"./assets/images/image_970_8d09ecf2.jpg","scu_redpanda_library":"./assets/images/image_971_6891588a.jpg","scu_redpanda_festival":"./assets/images/image_972_5769b60c.jpg","scu_redpanda_onsen":"./assets/images/image_973_b03d31b1.jpg","scu_shima_tree":"./assets/images/image_974_47e9a644.jpg","scu_shima_library":"./assets/images/image_975_e80b4568.jpg","scu_shima_festival":"./assets/images/image_976_3ff52001.jpg","scu_shima_pond":"./assets/images/image_977_3c7dd5a7.jpg","scu_shima_onsen":"./assets/images/image_978_da34f2d8.jpg","scu_whitetiger_onsen":"./assets/images/image_979_b7dc33b9.jpg","scu_whitetiger_festival":"./assets/images/image_980_562b121f.jpg","scu_whitetiger_pond":"./assets/images/image_981_5ff59887.jpg","scu_whitetiger_library":"./assets/images/image_982_f1a2e7cf.jpg","scu_whitetiger_tree":"./assets/images/image_983_d854771a.jpg","bld_platform":"./assets/images/image_984_668a413a.webp","scu_girl_sakura":"./assets/images/image_985_94a0d28f.jpg","scu_girl_festival":"./assets/images/image_986_51a8044a.jpg","scu_girl_bakery":"./assets/images/image_987_d7e77158.jpg","scu_girl_stars":"./assets/images/image_988_b64f30c0.jpg","scu_girl_snow":"./assets/images/image_989_e4173f93.jpg","ud_field":"./assets/images/image_990_bd16d165.jpg","bread_melon":"./assets/images/image_991_f6b60b3c.webp","bread_croissant":"./assets/images/image_992_176adc10.webp","bread_anpan":"./assets/images/image_993_9cd341c6.webp","bread_curry":"./assets/images/image_994_0c982b43.webp","bread_choco":"./assets/images/image_995_f9c9052c.webp","bread_cake":"./assets/images/image_996_94c8bfe0.webp","bread_baguette":"./assets/images/image_997_f0b809f2.webp","bread_cream":"./assets/images/image_998_e307c11d.webp","bread_sand":"./assets/images/image_999_212b8801.webp","bread_donut":"./assets/images/image_1000_79d48db9.webp","bread_cinna":"./assets/images/image_1001_52d2d32d.webp","bread_toast":"./assets/images/image_1002_deafe186.webp","ud_trophy":"./assets/images/image_1003_12cebed6.webp","ud_medal":"./assets/images/image_1004_6618b1ab.webp","ud_ball":"./assets/images/image_1005_ec3153e8.webp","ud_rope":"./assets/images/image_1006_358ee343.webp","ud_hachimaki":"./assets/images/image_1007_244bb11d.webp","ud_podium":"./assets/images/image_1008_ec349fd4.webp","ud_flag":"./assets/images/image_1009_3338efaa.webp","ud_pompom":"./assets/images/image_1010_e1d5bb9e.webp","ud_ghost":"./assets/images/image_1011_01b6c0c9.webp","ic_review":"./assets/images/image_1012_5e5fb5ba.webp","ic_snack":"./assets/images/image_1013_5e0357e0.webp","bld_crossing":"./assets/images/image_1014_452bb4d9.webp","udi_ball":"./assets/images/image_1015_c4301f28.webp","udi_run":"./assets/images/image_1016_09490dfa.webp","udi_bread":"./assets/images/image_1017_ea18a9b0.webp","udi_toss":"./assets/images/image_1018_2edfbb02.webp","udi_tug":"./assets/images/image_1019_e9b75e92.webp","bld_takoyaki":"./assets/images/image_1020_4c742b8b.webp","bld_crepe":"./assets/images/image_1021_92194d41.webp","bld_icecream":"./assets/images/image_1022_a4a9575e.webp","bld_ramen":"./assets/images/image_1023_47ad9034.webp","veg_tomato":"./assets/images/image_1024_c1183dbe.webp","veg_carrot":"./assets/images/image_1025_f49bf4df.webp","veg_eggplant":"./assets/images/image_1026_0599f000.webp","veg_cabbage":"./assets/images/image_1027_895b9e9b.webp","veg_corn":"./assets/images/image_1028_f1d2d71e.webp","veg_grapes":"./assets/images/image_1029_ac3e6f83.webp","veg_apple":"./assets/images/image_1030_53ef889a.webp","veg_banana":"./assets/images/image_1031_840672ab.webp","veg_watermelon":"./assets/images/image_1032_4de5c590.webp","veg_strawberry":"./assets/images/image_1033_078c6ad7.webp","veg_pumpkin":"./assets/images/image_1034_3352fd59.webp","veg_daikon":"./assets/images/image_1035_08975d10.webp","scu_koala_park":"./assets/images/image_1036_f8d56abb.jpg","scu_koala_festival":"./assets/images/image_1037_ca9cbac8.jpg","scu_koala_pond":"./assets/images/image_1038_7b90aafa.jpg","scu_alpaca_library":"./assets/images/image_1039_5c3a7ef4.jpg","scu_alpaca_onsen":"./assets/images/image_1040_65b2e2e2.jpg","scu_alpaca_festival":"./assets/images/image_1041_56006321.jpg","scu_panda_onsen":"./assets/images/image_1042_2c92507e.jpg","scu_panda_fountain":"./assets/images/image_1043_894ab40a.jpg","scu_panda_tree":"./assets/images/image_1044_c4724b01.jpg","scu_peacock_stars":"./assets/images/image_1045_366c96f2.jpg","scu_peacock_library":"./assets/images/image_1046_708db7c5.jpg","scu_peacock_tree":"./assets/images/image_1047_7bc1b5a5.jpg","scu_narwhal_harbor":"./assets/images/image_1048_c21d8a3a.jpg","scu_narwhal_library":"./assets/images/image_1049_ed570af9.jpg","scu_narwhal_tree":"./assets/images/image_1050_acea251b.jpg","scu_crane_pond":"./assets/images/image_1051_a766b51e.jpg","scu_crane_harbor":"./assets/images/image_1052_6bd4879b.jpg","scu_crane_fountain":"./assets/images/image_1053_ad98e56c.jpg","scu_snowyowl_sakura":"./assets/images/image_1054_2286b849.jpg","scu_snowyowl_library":"./assets/images/image_1055_118bd806.jpg","scu_snowyowl_harbor":"./assets/images/image_1056_77240f6a.jpg","sf_takoyaki":"./assets/images/image_1057_c37c0e2c.webp","sf_crepe_st":"./assets/images/image_1058_f0186809.webp","sf_crepe_ba":"./assets/images/image_1059_fe238d0b.webp","sf_icecream":"./assets/images/image_1060_ecb3e914.webp","sf_parfait":"./assets/images/image_1061_cd9e2d71.webp","sf_ramen":"./assets/images/image_1062_b9930871.webp","sf_misoramen":"./assets/images/image_1063_957ce130.webp","sf_gyoza":"./assets/images/image_1064_52af9c38.webp","gt_talk":"./assets/images/image_1065_60f84040.jpg","gt_quiz":"./assets/images/image_1066_bc2c01e3.jpg","gt_bread":"./assets/images/image_1067_79bc494d.jpg","scu_okapi_park":"./assets/images/image_1068_38efc758.jpg","scu_okapi_pond":"./assets/images/image_1069_c64a66b9.jpg","scu_okapi_library":"./assets/images/image_1070_ef409839.jpg","scu_quokka_pond":"./assets/images/image_1071_72a7aa51.jpg","scu_quokka_library":"./assets/images/image_1072_d71f5c41.jpg","scu_quokka_tree":"./assets/images/image_1073_9fafc968.jpg","scu_platypus_onsen":"./assets/images/image_1074_0ab0e5ba.jpg","scu_platypus_fountain":"./assets/images/image_1075_a77ae2d6.jpg","scu_platypus_tree":"./assets/images/image_1076_1eb8ed55.jpg","scu_snowleopard_tree":"./assets/images/image_1077_a387d056.jpg","scu_snowleopard_fountain":"./assets/images/image_1078_065f2895.jpg","scu_snowleopard_onsen":"./assets/images/image_1079_507631cd.jpg","scu_goldmonkey_park":"./assets/images/image_1080_501d2812.jpg","scu_goldmonkey_fountain":"./assets/images/image_1081_4d519f72.jpg","scu_goldmonkey_festival":"./assets/images/image_1082_58c498fc.jpg","scu_orca_onsen":"./assets/images/image_1083_4a1a0b9c.jpg","scu_orca_library":"./assets/images/image_1084_78462d27.jpg","scu_orca_tree":"./assets/images/image_1085_25d4784d.jpg","scu_namazu_pond":"./assets/images/image_1086_c616b905.jpg","scu_namazu_fountain":"./assets/images/image_1087_a798c7dc.jpg","scu_namazu_library":"./assets/images/image_1088_bca8cd74.jpg","pg_rock":"./assets/images/image_1089_3c62705a.webp","pg_water":"./assets/images/image_002_a02e8847.webp","pg_box":"./assets/images/image_1090_d8b76a24.webp","pg_boxbrk":"./assets/images/image_1091_7f17a3e5.webp","pg_splash":"./assets/images/image_1092_adb5281b.webp","pg_dizzy":"./assets/images/image_1093_2c438fc2.webp","st_1":"./assets/images/image_1094_eaa21ccd.jpg","st_2":"./assets/images/image_1095_ded00e75.jpg","st_3":"./assets/images/image_1096_769b602a.jpg","st_4":"./assets/images/image_1097_60ae280b.jpg","st_5":"./assets/images/image_1098_1ba962f8.jpg","st_6":"./assets/images/image_1099_8f7f3e14.jpg","st_7":"./assets/images/image_1100_dfcb9cb0.jpg"};
/* ここに画像パスを書くと差し替わります（例: bird_wave: "img/bird_wave.png"） */
const ART_CONFIG = {
  bg_town:'', bird_wave:'', bird_jump:'', bird_thumb:'', bird_think:'', bird_cheer:'', bird_gold:'',
  icon_kokugo:'', icon_sansu:'', icon_rika:'', icon_shakai:'', icon_town:'', icon_shop:'', icon_write:'', icon_read:'', icon_test:''
};
const ART_LABELS = {
  bg_town:'背景（まち）', bird_wave:'シマエナガ あいさつ', bird_jump:'シマエナガ 大よろこび', bird_thumb:'シマエナガ グッド',
  bird_think:'シマエナガ かんがえ中', bird_cheer:'シマエナガ おうえん', bird_gold:'シマエナガ ボーナス',
  icon_kokugo:'アイコン こくご', icon_sansu:'アイコン さんすう', icon_rika:'アイコン りか', icon_shakai:'アイコン しゃかい',
  icon_town:'アイコン まちづくり', icon_shop:'アイコン ショップ', icon_write:'アイコン 書き', icon_read:'アイコン 読み', icon_test:'アイコン テスト'
};

/* ---------- ポイントのルール ---------- */
const POINT_RULES = {
  correct:10,      // 1問せいかい
  neat100:5,       // きれいさ100%
  fast:3,          // めやす時間より はやく せいかい
  combo5:10,       // 5問れんぞく せいかいごと
  weakBeat:15,     // にがてな問題を せいかい
  setDone:20,      // 5問以上のセットを さいごまで
  perfect:30,      // 5問以上で ぜんもん せいかい
  daily:10,        // その日 はじめての 勉強
  streak7:50,      // 7日れんぞくごと
  bonus:50,        // ボーナス問題（時間内）
  bonusLate:20,    // ボーナス問題（時間ぎれ後に せいかい）
  superBonus:100,  // スーパーボーナス（時間内）
  fix:10           // おうちの人の はんてい なおし
};
/* ---------- ボーナス問題の出る条件 ---------- */
const BONUS_RULES = {
  minCombo:3,      // れんぞく せいかい数
  needFast:2,      // 直近3問のうち めやす時間内の数
  minNeat:60,      // 書き問題：直近3問の きれいさ平均
  chance:0.45,     // 条件を満たしたときに出る確率
  cooldown:4,      // 前のボーナスから あける問題数
  maxPerSet:2,     // 1セットの最大回数
  superChance:0.12,// スーパーボーナスになる確率
  timeFactor:1.6,  // 制限時間 = めやす時間 × この値
  minTime:15       // 制限時間の最小（秒）
};
/* ---------- めやす時間（秒） ---------- */
const TARGET_TIME = {writeBase:6, writePerKanji:7, readBase:5, readPerKana:0.8};

/* ---------- 判定パラメータ ----------
   ok     : 形の一致度(位置・大きさを補正後の 線の向き×場所 の類似度)がこれ以上なら正解
   border : これ以上 ok未満なら「自分で判定」
   neatFull: 補正なし一致度がこの値以上で きれいさ100%            */
const JUDGE_PRESETS = {
  easy:   {ok:0.68, border:0.55, neatFull:0.82},
  normal: {ok:0.74, border:0.60, neatFull:0.88},
  hard:   {ok:0.80, border:0.68, neatFull:0.94}
};
const NEAT_FLOOR = 0.55;   // 位置一致度がこれ以下で きれいさ0%

const PEN_W = {thin:0.024, normal:0.034, thick:0.048};
const MATCH_FONT = '"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","YuGothic","Meiryo","Noto Sans JP","Noto Sans CJK JP",sans-serif';
const SHOW_FONT  = '"UD Digi Kyokasho N-R","UDデジタル教科書体 N-R","Klee","YuKyokasho","Hiragino Mincho ProN","Yu Mincho",serif';
const GLYPH_SCALE = 0.80;   // マスに対する手本の字の大きさ
const G = 64;               // 判定用の解像度
const R0 = G*0.035, R1 = G*0.10; // 距離の許容（これ以内は満点、ここまでで0点）

/* ---------- 初期問題（小学3年 配当漢字200字） ---------- */
const BUILTIN_RAW = `悪|[悪]い ことを したら あやまろう。|わる
安|この お店の やさいは [安]い。|やす
暗|夜の 道は [暗]い。|くら
医|おなかが いたいので [医者]に 行く。|いしゃ
委|学級[委員]に えらばれた。|いいん
意|友だちの [意見]を 聞く。|いけん
育|花を 大切に [育]てる。|そだ
員|お店の [店員]さんに 聞く。|てんいん
院|けがを して [病院]へ 行く。|びょういん
飲|つめたい 水を [飲]む。|の
運|みんなで つくえを [運]ぶ。|はこ
泳|プールで [泳]ぐ。|およ
駅|[駅]で 電車を まつ。|えき
央|校庭の [中央]に 立つ。|ちゅうおう
横|ねこが いぬの [横]に すわる。|よこ
屋|[屋上]から 町を 見る。|おくじょう
温|[温]かい スープを のむ。|あたた
化|川原で 貝の [化石]を 見つけた。|かせき
荷|おもい [荷物]を はこぶ。|にもつ
界|[世界]地図を ひろげる。|せかい
開|まどを [開]ける。|あ
階|[階]だんを 上がる。|かい
寒|冬の 朝は [寒]い。|さむ
感|本を 読んで [感想]文を 書く。|かんそう
漢|[漢字]の テストが ある。|かんじ
館|[図書館]で 本を かりる。|としょかん
岸|川の [岸]で 魚を つる。|きし
起|朝 六時に [起]きる。|お
期|二[学期]が 始まった。|がっき
客|お[客]さんが 来た。|きゃく
究|こん虫の [研究]を する。|けんきゅう
急|[急]いで 学校へ 行く。|いそ
級|[学級]会で 話し合う。|がっきゅう
宮|お[宮]に おまいりする。|みや
球|[地球]は まるい。|ちきゅう
去|[去年]の 夏休みの 思い出。|きょねん
橋|[橋]を わたる。|はし
業|お店の [作業]を 手伝う。|さぎょう
曲|すきな [曲]を 聞く。|きょく
局|ゆうびん[局]へ 行く。|きょく
銀|[銀]色の 車が 走る。|ぎん
区|となりの [区]に すんで いる。|く
苦|この くすりは [苦]い。|にが
具|[道具]を 大切に する。|どうぐ
君|田中[君]と あそぶ。|くん
係|生き物[係]に なった。|がかり
軽|この かばんは [軽]い。|かる
血|ゆびから [血]が 出た。|ち
決|クラスの 目ひょうを [決]める。|き
研|自由[研究]を まとめる。|けんきゅう
県|日本には [県]が たくさん ある。|けん
庫|やさいを れいぞう[庫]に 入れる。|こ
湖|大きな [湖]で ボートに のる。|みずうみ
向|前を [向]いて 歩く。|む
幸|みんなで [幸]せに くらす。|しあわ
港|船が [港]に つく。|みなと
号|[番号]を よばれる。|ばんごう
根|木の [根]が 長く のびる。|ね
祭|夏[祭]りに 行く。|まつ
皿|お[皿]を あらう。|さら
仕|父は [仕事]に 出かけた。|しごと
死|かっていた 虫が [死]んで しまった。|し
使|はさみを [使]う。|つか
始|じゅぎょうが [始]まる。|はじ
指|[指]で 数を かぞえる。|ゆび
歯|ねる前に [歯]を みがく。|は
詩|[詩]を 声に 出して 読む。|し
次|[次]の 人 どうぞ。|つぎ
事|大[事]な やくそくを まもる。|じ
持|かさを [持]って 出かける。|も
式|入学[式]に 出る。|しき
実|木の [実]が なる。|み
写|[写真]を とる。|しゃしん
者|学[者]の 話を 聞く。|しゃ
主|この 話の [主人公]は ねこだ。|しゅじんこう
守|やくそくを [守]る。|まも
取|たなの 上の 本を [取]る。|と
酒|お[酒]は 大人の のみものだ。|さけ
受|かん字の テストを [受]ける。|う
州|夏休みに [九州]へ 行く。|きゅうしゅう
拾|ごみを [拾]う。|ひろ
終|じゅぎょうが [終]わる。|お
習|ピアノを [習]う。|なら
集|切手を [集]める。|あつ
住|この 町に [住]む。|す
重|この 石は [重]い。|おも
宿|[宿題]を すませる。|しゅくだい
所|[台所]で 手伝いを する。|だいどころ
暑|夏は とても [暑]い。|あつ
助|こまって いる 人を [助]ける。|たす
昭|祖父は [昭和]の 生まれだ。|しょうわ
消|けしゴムで 字を [消]す。|け
商|[商店]がいで 買いものを する。|しょうてん
章|みじかい [文章]を 書く。|ぶんしょう
勝|しあいに [勝]つ。|か
乗|バスに [乗]る。|の
植|花だんに 花を [植]える。|う
申|わたしは 山田と [申]します。|もう
身|[身長]を はかる。|しんちょう
神|[神]さまに おいのりする。|かみ
真|へやの [真]ん中に 立つ。|ま
深|この 池は [深]い。|ふか
進|前へ [進]む。|すす
世|金魚の [世話]を する。|せわ
整|つくえの 中を [整理]する。|せいり
昔|[昔]話を 読んで もらう。|むかし
全|きゅう食を [全]部 食べた。|ぜん
相|友だちに [相談]する。|そうだん
送|手紙を [送]る。|おく
想|あしたの 天気を [予想]する。|よそう
息|大きく [息]を すう。|いき
速|弟は 走るのが [速]い。|はや
族|[家族]で 出かける。|かぞく
他|[他]の 本も 読みたい。|ほか
打|バットで ボールを [打]つ。|う
対|ぼくは その 考えに [反対]だ。|はんたい
待|バスていで バスを [待]つ。|ま
代|父の [代]わりに 行く。|か
第|[第]一回の 大会が ひらかれた。|だい
題|算数の [問題]を とく。|もんだい
炭|[炭]で 火を おこす。|すみ
短|[短]い えんぴつ。|みじか
談|先生と [面談]を する。|めんだん
着|新しい ふくを [着]る。|き
注|コップに 水を [注]ぐ。|そそ
柱|[電柱]に 鳥が とまる。|でんちゅう
丁|とうふを 一[丁] 買う。|ちょう
帳|れんらく[帳]を 出す。|ちょう
調|図かんで [調]べる。|しら
追|ねこが ねずみを [追]いかける。|お
定|夏休みの [予定]を 立てる。|よてい
庭|[庭]で あそぶ。|にわ
笛|[笛]を ふく。|ふえ
鉄|[鉄]ぼうで さか上がりを する。|てつ
転|走って いて [転]ぶ。|ころ
都|[都会]の くらし。|とかい
度|もう 一[度] やって みる。|ど
投|ボールを [投]げる。|な
豆|せつ分に [豆]まきを する。|まめ
島|船で [島]に わたる。|しま
湯|やかんで お[湯]を わかす。|ゆ
登|山に [登]る。|のぼ
等|かけっこで [一等]に なった。|いっとう
動|[動物]園に 行く。|どうぶつ
童|[童話]を 読む。|どうわ
農|[農家]の 人に 話を 聞く。|のうか
波|海の [波]が よせる。|なみ
配|プリントを [配]る。|くば
倍|二[倍]の 大きさに なった。|ばい
箱|おもちゃを [箱]に 入れる。|はこ
畑|[畑]で やさいを そだてる。|はたけ
発|朝 早く [出発]する。|しゅっぱつ
反|紙の はしが [反]る。|そ
坂|[坂道]を のぼる。|さかみち
板|先生が [黒板]に 書く。|こくばん
皮|みかんの [皮]を むく。|かわ
悲|[悲]しい 話を 聞いた。|かな
美|[美]しい 花が さく。|うつく
鼻|ティッシュで [鼻]を かむ。|はな
筆|[筆]で 字を 書く。|ふで
氷|池の [氷]が とける。|こおり
表|紙の [表]と うら。|おもて
秒|百メートルを 二十[秒]で 走る。|びょう
病|[病気]が なおる。|びょうき
品|図工の [作品]を 見せる。|さくひん
負|しあいに [負]けて くやしい。|ま
部|自分の [部屋]を かたづける。|へや
服|新しい [洋服]を 買う。|ようふく
福|[福]は うち、おには そと。|ふく
物|むかしの [物語]を 読む。|ものがたり
平|[平]らな 道を 歩く。|たい
返|図書館に 本を [返]す。|かえ
勉|毎日 [勉強]する。|べんきょう
放|つかまえた 鳥を [放]す。|はな
味|スープの [味]見を する。|あじ
命|[命]を 大切に する。|いのち
面|[地面]に 線を ひく。|じめん
問|先生の [問]いに 答える。|と
役|人の [役]に 立つ。|やく
薬|かぜの [薬]を のむ。|くすり
由|休み時間は [自由]に あそぶ。|じゆう
油|[油]で てんぷらを あげる。|あぶら
有|[有名]な 人に 会った。|ゆうめい
遊|公園で [遊]ぶ。|あそ
予|あしたの じゅぎょうの [予習]を する。|よしゅう
羊|[羊]の 毛で セーターを 作る。|ひつじ
洋|[西洋]の おしろ。|せいよう
葉|木の [葉]が 赤く なる。|は
陽|[太陽]が のぼる。|たいよう
様|王[様]の 話を 読む。|さま
落|木の 葉が [落]ちる。|お
流|川の 水が [流]れる。|なが
旅|家族で [旅]に 出る。|たび
両|[両手]を 上げる。|りょうて
緑|[緑]色の はっぱ。|みどり
礼|先生に お[礼]を 言う。|れい
列|[列]に ならぶ。|れつ
練|なわとびの [練習]を する。|れんしゅう
路|[道路]を わたる。|どうろ
和|[平和]な 世界に したい。|へいわ`;

/* =====================================================================
   ユーティリティ
   ===================================================================== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;
const KANJI_RE = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF々〆ヶ]/;
const isTouchDevice = matchMedia('(pointer:coarse)').matches;
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }
function toHira(s){ return String(s ?? '').replace(/[\u30A1-\u30F6]/g, c => String.fromCharCode(c.charCodeAt(0)-0x60)); }
function normAns(s){ return toHira(s).replace(/[\s\u3000・、。]/g,'').trim(); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.tm); toast.tm=setTimeout(()=>t.classList.remove('show'),2000); }
function kanjiOf(word){ return [...word].filter(c => KANJI_RE.test(c)); }
function fmtTime(ms){ const s=Math.round(ms/1000); return s<60 ? `${s}びょう` : `${Math.floor(s/60)}ふん${s%60}びょう`; }

/* =====================================================================
   保存データ
   ===================================================================== */
const DEF_SETTINGS = {judge:'normal', selfJudge:false, pen:'normal', penOnly:true, sound:true, bonus:true};
const DEF_MENU = {mode:'practice', kind:'write', grade:'all', count:'10', order:'weak'};
function freshSave(){ return {ver:2, settings:{...DEF_SETTINGS}, menu:{...DEF_MENU}, custom:[], stats:{}, history:[]}; }
function loadSave(){
  let s = null;
  try{ s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); }catch(e){}
  if(!s || !s.ver) s = freshSave();
  s.settings = Object.assign({}, DEF_SETTINGS, s.settings);
  s.menu = Object.assign({}, DEF_MENU, s.menu);
  s.custom = s.custom || []; s.stats = s.stats || {}; s.history = s.history || [];
  s.points = Object.assign({bal:0, earned:0, log:[]}, s.points);
  s.daily = Object.assign({last:'', streak:0, best:0}, s.daily);
  s.days = s.days || {}; s.badges = s.badges || {};
  s.counters = Object.assign({perfect:0, bonus:0, superBonus:0}, s.counters);
  s.ver = 2;
  return s;
}
let save = loadSave();
let artStore = {};
try{ localStorage.removeItem(ART_KEY); }catch(e){}
function persist(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(save)); }catch(e){ toast('ほぞんできませんでした（ようりょう不足）'); } }
function persistArt(){ try{ localStorage.setItem(ART_KEY, JSON.stringify(artStore)); return true; }catch(e){ toast('画像が大きすぎて ほぞんできません'); return false; } }

/* =====================================================================
   問題データ
   ===================================================================== */
function parseSentence(s){
  const m = String(s).match(/^(.*?)[\[［【](.+?)[\]］】](.*)$/);
  return m ? {pre:m[1], word:m[2], post:m[3]} : null;
}
function normType(t){ t=String(t||''); if(/書|かき|write/i.test(t)) return 'write'; if(/読|よみ|read/i.test(t)) return 'read'; return 'both'; }
function buildQ(o){
  const p = parseSentence(o.text); if(!p) return null;
  const reading = toHira(String(o.reading||'').trim()); if(!reading) return null;
  const ks = kanjiOf(p.word); if(!ks.length) return null;
  return {id:String(o.id), subject:o.subject||'漢字', grade:Number(o.grade)||0, type:normType(o.type),
    text:o.text, reading, kanji:(o.kanji && String(o.kanji).trim()) || ks[0], note:o.note||'',
    pre:p.pre, word:p.word, post:p.post, custom:!!o.custom};
}
const BUILTIN = BUILTIN_RAW.trim().split('\n').map((line,i) => {
  const [k,t,r] = line.split('|');
  return buildQ({id:'K3-'+String(i+1).padStart(3,'0'), grade:3, kanji:k, text:t, reading:r, type:'両方'});
}).filter(Boolean);
let customQs = [];
function rebuildCustom(){ customQs = save.custom.map(o => buildQ({...o, custom:true})).filter(Boolean); }
rebuildCustom();
const allQs = () => BUILTIN.concat(customQs);
const qKey = (text, reading) => String(text).replace(/[［【]/g,'[').replace(/[］】]/g,']').replace(/\s/g,'') + '|' + toHira(reading).trim();
function poolFor(kind, grade){
  return allQs().filter(q => (q.type==='both' || q.type===kind) && (grade==='all' || String(q.grade)===String(grade)));
}

/* ---------- 成績 ---------- */
function stat(id){ return save.stats[id] || (save.stats[id] = {w:[0,0], r:[0,0]}); }
function addStat(q, kind, correct, sign=1){
  const s = stat(q.id), k = kind==='write' ? 'w' : 'r';
  s[k][correct?0:1] = Math.max(0, s[k][correct?0:1] + sign); s.t = Date.now();
}

/* ---------- 出題 ---------- */
function pickQuestions(kind, count, order, grade){
  const pool = poolFor(kind, grade); const k = kind==='write' ? 'w' : 'r';
  const weight = q => {
    const s = save.stats[q.id]; const c = s ? s[k][0] : 0, w = s ? s[k][1] : 0;
    if(order==='random') return 1;
    if(order==='new') return (c+w)===0 ? 100 : 1;
    return Math.max(0.1, ((c+w)===0 ? 1.2 : 0.4) + w*1.6 - Math.min(c,5)*0.05 + (w>c ? 1.5 : 0));
  };
  const items = pool.map(q => ({q, w:weight(q)})); const out = [];
  const n = Math.min(count, items.length);
  while(out.length < n){
    const tot = items.reduce((a,b)=>a+b.w,0); let r = Math.random()*tot, i = 0;
    for(; i<items.length-1; i++){ r -= items[i].w; if(r<=0) break; }
    out.push(items[i].q); items.splice(i,1);
  }
  return out;
}

/* =====================================================================
   手書き判定
   ===================================================================== */
function drawGlyph(ctx, ch, size, font, color){
  ctx.save(); ctx.fillStyle = color;
  const fs = size*GLYPH_SCALE; ctx.font = `${fs}px ${font}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText(ch);
  const L = m.actualBoundingBoxLeft ?? 0, Rr = m.actualBoundingBoxRight ?? fs;
  const A = m.actualBoundingBoxAscent ?? fs*0.88, D = m.actualBoundingBoxDescent ?? fs*0.12;
  ctx.fillText(ch, size/2 - (Rr-L)/2, size/2 + (A-D)/2);
  ctx.restore();
}
let _wc = null;
function workCtx(){ if(!_wc){ const c=document.createElement('canvas'); c.width=c.height=G; _wc=c.getContext('2d',{willReadFrequently:true}); } _wc.clearRect(0,0,G,G); return _wc; }
function toMask(ctx){ const d=ctx.getImageData(0,0,G,G).data; const m=new Uint8Array(G*G); for(let i=0;i<G*G;i++) m[i] = d[i*4+3]>110 ? 1 : 0; return m; }
function distMap(mask){
  const INF=1e6, d=new Float32Array(G*G), S2=1.4142;
  for(let i=0;i<G*G;i++) d[i] = mask[i] ? 0 : INF;
  for(let y=0;y<G;y++) for(let x=0;x<G;x++){ const i=y*G+x; let v=d[i]; if(!v) continue;
    if(x>0) v=Math.min(v,d[i-1]+1); if(y>0){ v=Math.min(v,d[i-G]+1); if(x>0) v=Math.min(v,d[i-G-1]+S2); if(x<G-1) v=Math.min(v,d[i-G+1]+S2); } d[i]=v; }
  for(let y=G-1;y>=0;y--) for(let x=G-1;x>=0;x--){ const i=y*G+x; let v=d[i]; if(!v) continue;
    if(x<G-1) v=Math.min(v,d[i+1]+1); if(y<G-1){ v=Math.min(v,d[i+G]+1); if(x<G-1) v=Math.min(v,d[i+G+1]+S2); if(x>0) v=Math.min(v,d[i+G-1]+S2); } d[i]=v; }
  return d;
}
function maskBBox(m){
  let x0=G,y0=G,x1=-1,y1=-1;
  for(let y=0;y<G;y++) for(let x=0;x<G;x++) if(m[y*G+x]){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  if(x1<0) return {x0:.1,y0:.1,x1:.9,y1:.9};
  return {x0:x0/G, y0:y0/G, x1:(x1+1)/G, y1:(y1+1)/G};
}
const glyphCache = {};
function targetData(ch){
  if(glyphCache[ch]) return glyphCache[ch];
  const ctx = workCtx(); drawGlyph(ctx, ch, G, MATCH_FONT, '#000');
  const mask = toMask(ctx);
  return glyphCache[ch] = {mask, dist:distMap(mask), bbox:maskBBox(mask)};
}
function strokesMask(strokes, lw){
  const ctx = workCtx(); ctx.strokeStyle='#000'; ctx.fillStyle='#000'; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.lineJoin='round';
  for(const st of strokes) drawStrokePath(ctx, st, G, lw);
  return toMask(ctx);
}
function normalizeStrokes(strokes, tb){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  strokes.forEach(st => st.forEach(([x,y]) => { if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }));
  const pad = 0.03; x0-=pad; y0-=pad; x1+=pad; y1+=pad;
  const uw=Math.max(x1-x0,0.02), uh=Math.max(y1-y0,0.02), tw=tb.x1-tb.x0, th=tb.y1-tb.y0;
  let sx=tw/uw, sy=th/uh;
  if(uw<0.3*uh || uh<0.3*uw || tw<0.3*th || th<0.3*tw){ sx = sy = Math.max(tw,th)/Math.max(uw,uh); }
  else { const gm=Math.sqrt(sx*sy), r=clamp(sx/sy, 1/1.6, 1.6); sx=gm*Math.sqrt(r); sy=gm/Math.sqrt(r); }
  const ucx=(x0+x1)/2, ucy=(y0+y1)/2, tcx=(tb.x0+tb.x1)/2, tcy=(tb.y0+tb.y1)/2;
  return strokes.map(st => st.map(([x,y]) => [tcx+(x-ucx)*sx, tcy+(y-ucy)*sy]));
}
const sc = d => d<=R0 ? 1 : d>=R1 ? 0 : 1-(d-R0)/(R1-R0);
/* 位置のずれ（きれいさ用）：線どうしの距離で比べる */
function compareDist(U, T){
  const Ud = distMap(U); let ps=0,pn=0,rs=0,rn=0;
  for(let i=0;i<G*G;i++){ if(U[i]){ pn++; ps+=sc(T.dist[i]); } if(T.mask[i]){ rn++; rs+=sc(Ud[i]); } }
  const P = pn?ps/pn:0, R = rn?rs/rn:0;
  return P+R ? 2*P*R/(P+R) : 0;
}
/* 細線化（Zhang-Suen） */
function thin(src){
  const m = Uint8Array.from(src); let changed = true; const del = [];
  const at = (x,y) => (x<0||y<0||x>=G||y>=G) ? 0 : m[y*G+x];
  while(changed){
    changed = false;
    for(let pass=0; pass<2; pass++){
      del.length = 0;
      for(let y=0;y<G;y++) for(let x=0;x<G;x++){
        if(!m[y*G+x]) continue;
        const p2=at(x,y-1),p3=at(x+1,y-1),p4=at(x+1,y),p5=at(x+1,y+1),p6=at(x,y+1),p7=at(x-1,y+1),p8=at(x-1,y),p9=at(x-1,y-1);
        const B = p2+p3+p4+p5+p6+p7+p8+p9; if(B<2 || B>6) continue;
        const seq = [p2,p3,p4,p5,p6,p7,p8,p9,p2]; let A = 0; for(let k=0;k<8;k++) if(!seq[k] && seq[k+1]) A++;
        if(A!==1) continue;
        if(pass===0){ if(p2*p4*p6 || p4*p6*p8) continue; } else { if(p2*p4*p8 || p2*p6*p8) continue; }
        del.push(y*G+x);
      }
      if(del.length){ changed = true; del.forEach(i => m[i]=0); }
    }
  }
  return m;
}
/* 方向特徴（4方向 × 8×8マス） */
const FCELL = 8, GK = (() => { const s=2, r=6, k=[]; for(let i=-r;i<=r;i++) k.push(Math.exp(-i*i/(2*s*s))); return k; })();
function dirFeature(sk){
  const planes = [0,1,2,3].map(() => new Float32Array(G*G));
  for(let y=0;y<G;y++) for(let x=0;x<G;x++){
    if(!sk[y*G+x]) continue;
    let sxx=0, syy=0, sxy=0, n=0;
    for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++){
      const xx=x+dx, yy=y+dy; if((dx||dy) && xx>=0 && yy>=0 && xx<G && yy<G && sk[yy*G+xx]){ sxx+=dx*dx; syy+=dy*dy; sxy+=dx*dy; n++; }
    }
    if(n<2) continue;
    let th = 0.5*Math.atan2(2*sxy, sxx-syy); if(th<0) th += Math.PI;
    const b = th/(Math.PI/4), i0 = Math.floor(b)%4, f = b-Math.floor(b);
    planes[i0][y*G+x] += 1-f; planes[(i0+1)%4][y*G+x] += f;
  }
  const r = (GK.length-1)/2, tmp = new Float32Array(G*G), c = G/FCELL, feat = new Float32Array(4*FCELL*FCELL);
  planes.forEach((p, d) => {
    for(let y=0;y<G;y++) for(let x=0;x<G;x++){ let v=0; for(let k=-r;k<=r;k++){ const xx=x+k; if(xx>=0&&xx<G) v+=p[y*G+xx]*GK[k+r]; } tmp[y*G+x]=v; }
    for(let y=0;y<G;y++) for(let x=0;x<G;x++){ let v=0; for(let k=-r;k<=r;k++){ const yy=y+k; if(yy>=0&&yy<G) v+=tmp[yy*G+x]*GK[k+r]; }
      feat[d*FCELL*FCELL + Math.floor(y/c)*FCELL + Math.floor(x/c)] += v; }
  });
  let nn = 0; for(const v of feat) nn += v*v; nn = Math.sqrt(nn) || 1;
  for(let i=0;i<feat.length;i++) feat[i] /= nn;
  return feat;
}
function cosine(a, b){ let s=0; for(let i=0;i<a.length;i++) s += a[i]*b[i]; return s; }
function matchChar(strokes, ch){
  const T = targetData(ch);
  if(!T.feat) T.feat = dirFeature(thin(T.mask));
  const fRaw = compareDist(strokesMask(strokes, G*0.06), T);                       // きれいさ（位置ずれ）
  const fNorm = cosine(dirFeature(thin(strokesMask(normalizeStrokes(strokes, T.bbox), G*0.035))), T.feat); // 形の一致度
  return {fRaw, fNorm};
}

/* =====================================================================
   描画（線）
   ===================================================================== */
function drawStrokePath(ctx, pts, size, lw){
  if(!pts.length) return;
  if(pts.length===1){ ctx.beginPath(); ctx.arc(pts[0][0]*size, pts[0][1]*size, lw/2, 0, Math.PI*2); ctx.fill(); return; }
  ctx.beginPath(); ctx.moveTo(pts[0][0]*size, pts[0][1]*size);
  for(let i=1;i<pts.length-1;i++){
    const mx=(pts[i][0]+pts[i+1][0])/2*size, my=(pts[i][1]+pts[i+1][1])/2*size;
    ctx.quadraticCurveTo(pts[i][0]*size, pts[i][1]*size, mx, my);
  }
  const l = pts[pts.length-1]; ctx.lineTo(l[0]*size, l[1]*size); ctx.stroke();
}
function drawGuides(ctx, s){
  ctx.save(); ctx.strokeStyle='#E6DACA'; ctx.lineWidth=Math.max(1,s/180); ctx.setLineDash([s/40, s/40]);
  ctx.beginPath(); ctx.moveTo(s/2,0); ctx.lineTo(s/2,s); ctx.moveTo(0,s/2); ctx.lineTo(s,s/2); ctx.stroke(); ctx.restore();
}
function paintBox(ctx, s, strokes, overlayCh, ink){
  ctx.clearRect(0,0,s,s); ctx.fillStyle='#fff'; ctx.fillRect(0,0,s,s);
  drawGuides(ctx, s);
  if(overlayCh) drawGlyph(ctx, overlayCh, s, MATCH_FONT, 'rgba(232,65,75,.28)');
  const lw = s*PEN_W[save.settings.pen];
  ctx.strokeStyle = ink || '#2B2420'; ctx.fillStyle = ink || '#2B2420';
  ctx.lineWidth = lw; ctx.lineCap='round'; ctx.lineJoin='round';
  strokes.forEach(st => drawStrokePath(ctx, st, s, lw));
}
function paintCanvas(canvas, cssSize, strokes, overlayCh){
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = canvas.style.height = cssSize+'px';
  canvas.width = canvas.height = Math.round(cssSize*dpr);
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  paintBox(ctx, cssSize, strokes, overlayCh);
}

/* =====================================================================
   書き込みマス
   ===================================================================== */
let penSeen = false;
class WriteBox{
  constructor(wrap, strokes, onStart){
    this.wrap = wrap; this.canvas = wrap.querySelector('canvas'); this.ctx = this.canvas.getContext('2d');
    this.strokes = strokes; this.onStart = onStart; this.cur = null; this.locked = false; this.overlay = null; this.size = 200;
    const c = this.canvas;
    c.addEventListener('pointerdown', e => this.down(e));
    c.addEventListener('pointermove', e => this.move(e));
    c.addEventListener('pointerup', e => this.up(e));
    c.addEventListener('pointercancel', e => this.up(e));
    c.addEventListener('touchstart', e => e.preventDefault(), {passive:false});
  }
  setSize(px){
    const dpr = window.devicePixelRatio || 1; this.size = px;
    this.canvas.style.width = this.canvas.style.height = px+'px';
    this.canvas.width = this.canvas.height = Math.round(px*dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0); this.redraw();
  }
  redraw(){ paintBox(this.ctx, this.size, this.strokes, this.overlay); }
  pt(e){ const r=this.canvas.getBoundingClientRect(); return [+clamp((e.clientX-r.left)/r.width,0,1).toFixed(4), +clamp((e.clientY-r.top)/r.height,0,1).toFixed(4)]; }
  down(e){
    if(this.locked) return;
    if(e.pointerType==='pen') penSeen = true;
    if(save.settings.penOnly && penSeen && e.pointerType==='touch') return;
    if(this.cur) return;
    e.preventDefault();
    try{ this.canvas.setPointerCapture(e.pointerId); }catch(_){}
    this.pid = e.pointerId; this.cur = [this.pt(e)]; this.strokes.push(this.cur);
    this.onStart && this.onStart(this); this.redraw();
  }
  move(e){
    if(!this.cur || e.pointerId!==this.pid) return; e.preventDefault();
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    const ctx = this.ctx, s = this.size, lw = s*PEN_W[save.settings.pen];
    ctx.strokeStyle='#2B2420'; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.lineJoin='round';
    for(const ev of evs){
      const p = this.pt(ev), q = this.cur[this.cur.length-1];
      if(Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1]) < 0.002) continue;
      this.cur.push(p);
      ctx.beginPath(); ctx.moveTo(q[0]*s, q[1]*s); ctx.lineTo(p[0]*s, p[1]*s); ctx.stroke();
    }
  }
  up(e){ if(!this.cur || e.pointerId!==this.pid) return; this.cur = null; this.redraw(); }
}

/* =====================================================================
   日付・ポイント・バッジ
   ===================================================================== */
const dayKey = (d=new Date()) => { d = new Date(d); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const dayAdd = (key, n) => { const [y,m,d] = key.split('-').map(Number); return dayKey(new Date(y, m-1, d+n)); };
const fmtDT = t => { const d = new Date(t); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
const nf = n => Number(n||0).toLocaleString('ja-JP');
function dayRec(key=dayKey()){ return save.days[key] || (save.days[key] = {n:0, c:0, pt:0}); }
function curStreak(){ const t = dayKey(); return (save.daily.last===t || save.daily.last===dayAdd(t,-1)) ? save.daily.streak : 0; }

function addPoints(pt, reason, silent){
  if(!pt) return 0;
  const p = save.points;
  if(pt < 0) pt = -Math.min(-pt, p.bal);
  if(!pt) return 0;
  p.bal += pt; if(pt > 0) p.earned += pt;
  p.log.unshift({t:Date.now(), pt, r:reason}); if(p.log.length > 300) p.log.length = 300;
  dayRec().pt += pt;
  if(S){ S.pts.push([reason, pt]); }
  persist(); updatePill(!silent);
  return pt;
}
function updatePill(bump){
  $('#ptNum').textContent = nf(save.points.bal);
  if(bump){ const el = $('#ptPill'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}
function checkDaily(){
  const t = dayKey(), d = save.daily;
  if(d.last === t) return;
  d.streak = (d.last === dayAdd(t,-1)) ? d.streak + 1 : 1;
  d.best = Math.max(d.best, d.streak); d.last = t;
  addPoints(POINT_RULES.daily, 'きょう はじめての 勉強');
  if(d.streak % 7 === 0){ addPoints(POINT_RULES.streak7, `${d.streak}日 れんぞく 勉強！`); toast(`🔥 ${d.streak}日 れんぞく！ +${POINT_RULES.streak7}pt`); }
  else if(d.streak > 1) toast(`🔥 ${d.streak}日 れんぞく 勉強中！`);
}

/* ---------- 漢字ごとの 習得度 ---------- */
function kanjiMastery(){
  const map = new Map();
  allQs().forEach(q => {
    const m = map.get(q.kanji) || {k:q.kanji, wc:0, ww:0, rc:0, rw:0};
    const s = save.stats[q.id]; if(s){ m.wc+=s.w[0]; m.ww+=s.w[1]; m.rc+=s.r[0]; m.rw+=s.r[1]; }
    map.set(q.kanji, m);
  });
  map.forEach(m => {
    const c = m.wc+m.rc, w = m.ww+m.rw;
    m.c = c; m.w = w;
    m.lv = (c+w)===0 ? 0 : (w > c ? -1 : (m.wc>=3 && m.rc>=2 && w*4<=c) ? 3 : (c>=2 && w*2<=c) ? 2 : 1);
  });
  return map;
}
const learnedCount = map => [...map.values()].filter(m => m.lv>=2).length;

/* ---------- バッジ ---------- */
function totals(){ let n=0, c=0; Object.values(save.stats).forEach(s => { n += s.w[0]+s.w[1]+s.r[0]+s.r[1]; c += s.w[0]+s.r[0]; }); return {n, c}; }
const BADGES = [
  {id:'first',  i:'🌱', n:'はじめの一歩',      f:t=>t.n>=1},
  {id:'q50',    i:'✏️', n:'50問 といた',        f:t=>t.n>=50},
  {id:'q200',   i:'📚', n:'200問 といた',       f:t=>t.n>=200},
  {id:'q1000',  i:'🏆', n:'1000問 といた',      f:t=>t.n>=1000},
  {id:'st3',    i:'🔥', n:'3日 れんぞく',       f:()=>save.daily.best>=3},
  {id:'st7',    i:'🌈', n:'7日 れんぞく',       f:()=>save.daily.best>=7},
  {id:'st30',   i:'👑', n:'30日 れんぞく',      f:()=>save.daily.best>=30},
  {id:'perfect',i:'💮', n:'パーフェクト',        f:()=>save.counters.perfect>=1},
  {id:'perf10', i:'🌸', n:'パーフェクト10回',    f:()=>save.counters.perfect>=10},
  {id:'bonus',  i:'⭐', n:'ボーナス せいかい',   f:()=>save.counters.bonus>=1},
  {id:'super',  i:'🌟', n:'スーパーボーナス',    f:()=>save.counters.superBonus>=1},
  {id:'pt1000', i:'🪙', n:'1000pt あつめた',    f:()=>save.points.earned>=1000},
  {id:'pt10000',i:'💰', n:'10000pt あつめた',   f:()=>save.points.earned>=10000},
  {id:'k50',    i:'🀄', n:'漢字 50字 おぼえた',  f:t=>t.learned>=50},
  {id:'k100',   i:'🎓', n:'漢字 100字 おぼえた', f:t=>t.learned>=100},
  {id:'kall',   i:'🐦', n:'漢字 ぜんぶ おぼえた',f:t=>t.learned>=t.all && t.all>0}
];
function checkBadges(){
  const t = totals(), mm = kanjiMastery(); t.learned = learnedCount(mm); t.all = mm.size;
  const got = [];
  BADGES.forEach(b => { if(!save.badges[b.id] && b.f(t)){ save.badges[b.id] = Date.now(); got.push(b); } });
  if(got.length){ persist(); setTimeout(() => toast(`🏅 バッジ ゲット！「${got.map(b=>b.n).join('」「')}」`), 900); }
  return got;
}

/* =====================================================================
   イラスト
   ===================================================================== */
function artSrc(key){ return artStore[key] || ART_CONFIG[key] || DEFAULT_ART[key] || ''; }
function applyArt(root=document){
  root.querySelectorAll('img[data-art]').forEach(img => {
    const k = img.dataset.art, s = artSrc(k);
    if(img.getAttribute('src') !== s) img.src = s;
    img.onerror = () => { if(DEFAULT_ART[k] && img.src !== DEFAULT_ART[k]) img.src = DEFAULT_ART[k]; };
  });
  const bg = artSrc('bg_town');
  $('#bg').style.backgroundImage = bg ? `url("${bg}")` : '';
  $('#homeHero').style.backgroundImage = bg ? `url("${bg}")` : 'linear-gradient(#BDE3FA,#DFF3D8)';
}

/* =====================================================================
   画面遷移
   ===================================================================== */
const PARENT = {math:'subject', mathplay:'math', eng:'subject', engplay:'eng', engres:'eng', myhome:'home', zukan:'home', town:'home', shop:'town', residents:'town', subject:'home', kmode:'subject', ksetup:'kmode', tsel:'kmode', record:'home', settings:'home', result:'kmode', quiz:'kmode'};
let curScreen = 'home';
function show(name){
  if(curScreen==='myhome' && name!=='myhome'){ if(homeEdit) endHomeEdit(true); stopVisitor(); }
  if(curScreen==='town' && name!=='town'){ if(townEdit) endEdit(true); stopWalk(); }
  $$('.screen').forEach(s => s.classList.toggle('active', s.id==='scr-'+name));
  curScreen = name;
  document.body.className = 'scr-' + name + (name==='quiz' && S?.inBonus ? ' bonusMode' : '');
  $('#btnBack').style.visibility = name==='home' ? 'hidden' : 'visible';
  $('#btnHome').classList.toggle('hidden', name==='home');
  $('#btnSettings').classList.toggle('hidden', name==='quiz');
  window.scrollTo(0,0);
  ({home:renderHome, kmode:renderKmode, ksetup:renderSetup, record:renderRecord, zukan:renderZukan, town:renderTown, shop:renderShop, residents:renderResidents, eng:renderEng, math:renderMath, myhome:()=>{ ensureHome(); maybeVisit(); requestAnimationFrame(renderMyHome); }})[name]?.();
}
function leaveQuizOk(){
  if(curScreen!=='quiz' || !S) return true;
  if(!confirm('とちゅうで やめますか？（ここまでの ポイントは もらえます）')) return false;
  stopTimer(); Pad.close(); S = null; return true;
}
$('#btnBack').onclick = () => { if(curScreen==='engplay' && !engLeave()) return; if(!leaveQuizOk()) return; show(PARENT[curScreen] || 'home'); };
$('#btnHome').onclick = () => { if(curScreen==='engplay' && !engLeave()) return; if(!leaveQuizOk()) return; Pad.close(); S = null; show('home'); };
const openSettings = () => parentGate(() => { renderSettings(); show('settings'); });
$('#btnSettings').onclick = openSettings;

$('#goStudy').onclick = () => show('subject');
$('#goRecord').onclick = () => show('record');
$('#goTown').onclick = () => show('town');
$('#goShop').onclick = () => show('shop');
$('#goZukan').onclick = () => show('zukan');
$$('.subjCard[data-soon]').forEach(b => b.onclick = () => toast('もうすぐ できるよ！'));
$('#subjKanji').onclick = () => show('kmode');

/* =====================================================================
   ホーム
   ===================================================================== */
function renderHome(){
  ensureTown(); $('#homeTownLv').textContent = `Lv${save.town.lv+1} ${townCalc().L.name}`;
  const td = save.days[dayKey()] || {n:0, c:0, pt:0}, st = curStreak();
  const mm = kanjiMastery();
  $('#homeStats').innerHTML =
    `<div class="stat pk"><b>${td.n}</b><span>きょう といた 問題</span></div>
     <div class="stat or"><b>${st}<small style="font-size:16px">日</small></b><span>れんぞく 勉強</span></div>
     <div class="stat"><b>+${nf(td.pt)}</b><span>きょうの ポイント</span></div>
     <div class="stat gr"><b>${learnedCount(mm)}<small style="font-size:16px">/${mm.size}</small></b><span>おぼえた 漢字</span></div>`;
  $('#homeMsg').innerHTML = td.n===0 ? (st>0 ? `${st}日 れんぞく 中！<br>きょうも やってみよう！` : 'きょうも いっしょに<br>がんばろう！')
    : td.n<10 ? `きょうは ${td.n}問 といたよ！<br>その ちょうし！` : `${td.n}問も といたの！？<br>すごすぎる〜！`;
}

/* =====================================================================
   漢字モード選択・出題設定
   ===================================================================== */
function bindSeg(id, obj, key, after){
  const el = $('#'+id);
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x===b));
    let v = b.dataset.v; if(v==='true') v=true; else if(v==='false') v=false;
    obj()[key] = v; persist(); after && after();
  });
}
function syncSeg(id, val){ $('#'+id).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v===String(val))); }
const grades = () => [...new Set(allQs().map(q=>q.grade))].filter(Boolean).sort((a,b)=>a-b);
function renderKmode(){
  const gs = grades();
  if(save.menu.grade!=='all' && !gs.map(String).includes(String(save.menu.grade))) save.menu.grade = 'all';
  const tabs = gs.length>1 ? `<button data-v="all">ぜんぶ</button>` + gs.map(g=>`<button data-v="${g}">${g}年</button>`).join('') : '';
  $('#gradeTabs').innerHTML = tabs; syncSeg('gradeTabs', save.menu.grade);
  const g = save.menu.grade;
  $('#nbGrade').innerHTML = g==='all' ? (gs.length===1 ? `${gs[0]}<small>年生</small>` : `ぜんぶ`) : `${g}<small>年生</small>`;
  const mm = kanjiMastery(); const ks = new Set(allQs().filter(q => g==='all' || String(q.grade)===String(g)).map(q=>q.kanji));
  const learned = [...ks].filter(k => (mm.get(k)?.lv||0) >= 2).length;
  $('#nbCount').textContent = `漢字 ${ks.size}字`;
  $('#nbMaster').innerHTML = `おぼえた 漢字 ${learned} / ${ks.size}<div class="mbar"><i style="width:${ks.size? learned/ks.size*100 : 0}%"></i></div>`;
}
$('#gradeTabs').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; save.menu.grade = b.dataset.v; persist(); renderKmode(); });
$$('.modeBtn').forEach(b => b.onclick = () => {
  const v = b.dataset.go;
  if(v==='test'){ save.menu.mode = 'test'; persist(); openTestSelect(); }
  else { save.menu.mode = 'practice'; save.menu.kind = v; persist(); show('ksetup'); }
});
function renderSetup(){
  const gs = grades();
  $('#segGrade').innerHTML = `<button data-v="all">ぜんぶ</button>` + gs.map(g=>`<button data-v="${g}">${g}年生</button>`).join('');
  syncSeg('segCount', save.menu.count); syncSeg('segOrder', save.menu.order); syncSeg('segGrade', save.menu.grade);
  const w = save.menu.kind==='write';
  $('#setupKind').textContent = w ? '✏️ 書き問題' : '📖 読み問題';
  $('#setupKind').classList.toggle('read', !w);
}
const M = () => save.menu;
bindSeg('segCount', M, 'count'); bindSeg('segOrder', M, 'order'); bindSeg('segGrade', M, 'grade');
$('#btnStart').onclick = () => {
  const m = save.menu;
  const list = pickQuestions(m.kind, Number(m.count)||10, m.order, m.grade);
  if(!list.length){ toast('問題が ありません'); return; }
  startSession('practice', m.kind, list);
};

/* =====================================================================
   テスト対象の選択
   ===================================================================== */
let tselMap = new Map(), tsel = new Set(), tselTab = 'all';
function openTestSelect(){ buildTselMap(); tselTab = 'all'; renderTsel(); show('tsel'); }
function buildTselMap(){
  const m = save.menu; tselMap = new Map();
  poolFor(m.kind, m.grade).forEach(q => { if(!tselMap.has(q.kanji)) tselMap.set(q.kanji, []); tselMap.get(q.kanji).push(q); });
  [...tsel].forEach(k => { if(!tselMap.has(k)) tsel.delete(k); });
}
function kanjiState(k){
  const kk = save.menu.kind==='write' ? 'w' : 'r'; let c=0,w=0;
  (tselMap.get(k)||[]).forEach(q => { const s=save.stats[q.id]; if(s){ c+=s[kk][0]; w+=s[kk][1]; } });
  return w>c ? 'weak' : (c>0 && w===0 ? 'good' : (c+w===0 ? 'new' : ''));
}
function visibleKanji(){
  const keys = [...tselMap.keys()];
  if(tselTab==='all') return keys;
  if(tselTab==='weak') return keys.filter(k => kanjiState(k)==='weak');
  if(tselTab==='new') return keys.filter(k => kanjiState(k)==='new');
  const s = +tselTab.slice(1); return keys.slice(s, s+40);
}
function renderTsel(){
  const keys = [...tselMap.keys()];
  let tabs = [['all','すべて'],['weak','にがて'],['new','まだ やってない']];
  for(let i=0;i<keys.length;i+=40) tabs.push(['r'+i, `${i+1}〜${Math.min(i+40,keys.length)}`]);
  $('#tselTabs').innerHTML = tabs.map(([v,l]) => `<button data-v="${v}" class="${v===tselTab?'on':''}">${l}</button>`).join('');
  syncSeg('tselKind', save.menu.kind);
  const vis = visibleKanji();
  $('#kgrid').innerHTML = vis.length ? vis.map(k => `<button class="kc ${tsel.has(k)?'on':''} ${kanjiState(k)}" data-k="${esc(k)}">${esc(k)}</button>`).join('')
    : `<div class="note" style="grid-column:1/-1;padding:20px;text-align:center">ここには 漢字が ないよ</div>`;
  const n = tsel.size, b = $('#btnTestStart');
  b.disabled = !n; b.textContent = n ? `この ${n}字で テストを はじめる！` : '漢字を えらんでね';
}
$('#tselTabs').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; tselTab = b.dataset.v; renderTsel(); });
$('#tselKind').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; save.menu.kind = b.dataset.v; persist(); buildTselMap(); renderTsel(); });
$('#kgrid').addEventListener('click', e => { const b = e.target.closest('.kc'); if(!b) return; const k = b.dataset.k; tsel.has(k) ? tsel.delete(k) : tsel.add(k); renderTsel(); });
$('#tselAll').onclick = () => { visibleKanji().forEach(k => tsel.add(k)); renderTsel(); };
$('#tselNone').onclick = () => { const v = visibleKanji(); v.forEach(k => tsel.delete(k)); renderTsel(); };
$('#btnTestStart').onclick = () => {
  const list = shuffle([...tsel].map(k => { const qs = tselMap.get(k); return qs[Math.random()*qs.length|0]; }));
  if(list.length) startSession('test', save.menu.kind, list);
};

/* =====================================================================
   出題
   ===================================================================== */
let S = null;    // セッション
let cur = null;  // 現在の問題
function targetSec(q, kind){
  return kind==='write' ? TARGET_TIME.writeBase + TARGET_TIME.writePerKanji*kanjiOf(q.word).length
                        : TARGET_TIME.readBase + TARGET_TIME.readPerKana*q.reading.length;
}
function startSession(mode, kind, list){
  S = {mode, kind, list, idx:0, results:[], bonus:[], pts:[], combo:0, maxCombo:0, start:Date.now(),
       inBonus:false, pendingBonus:false, bonusCount:0, lastBonusIdx:-99, bonusQ:null};
  show('quiz'); renderQ();
}
function sentenceHTML(q, kind, reveal, correct){
  const pre = esc(q.pre), post = esc(q.post);
  if(kind==='write'){
    let boxes = '', ki = 0;
    for(const ch of q.word){
      if(KANJI_RE.test(ch)){ boxes += reveal ? `<span class="kbox rv">${esc(ch)}</span>` : `<button class="kbox" data-k="${ki}"><canvas></canvas></button>`; ki++; }
      else boxes += `<span class="okuri">${esc(ch)}</span>`;
    }
    return `${pre}<span class="tgt"><span class="rubyTxt">${esc(q.reading)}</span><span class="boxes">${boxes}</span></span>${post}`;
  }
  if(reveal) return `${pre}<span class="tgt"><span class="rubyTxt ${correct?'':'ngR'}">${esc(q.reading)}</span><span class="tgtR">${esc(q.word)}</span></span>${post}`;
  return `${pre}<span class="tgtR">${esc(q.word)}</span>${post}`;
}
function renderChips(pop){
  if(!S) return;
  let h = '';
  if(S.inBonus) h += `<span class="qchip" id="qTimer">⏱</span>`;
  if(S.mode==='practice' && S.combo>=2) h += `<span class="qchip combo ${pop?'pop':''}">🔥 ${S.combo}れんぞく</span>`;
  h += kanjiHintBtn();
  $('#qChips').innerHTML = h;
}
function renderQ(){
  const bonus = S.inBonus, q = bonus ? S.bonusQ.q : S.list[S.idx];
  cur = {q, strokes: kanjiOf(q.word).map(()=>[]), done:false, t0:Date.now(), ans:'', padState:'writing', judge:null};
  document.body.classList.toggle('bonusMode', bonus);
  $('#qCard').classList.toggle('bonusCard', bonus);
  const tag = $('#qTag');
  tag.className = 'qtag' + (bonus ? ' bonus' : S.mode==='test' ? ' test' : '');
  tag.textContent = bonus ? (S.bonusQ.sup ? '🌟 スーパーボーナス' : '⭐ ボーナス') : S.mode==='test' ? 'テスト' : 'れんしゅう';
  $('#qProg').textContent = bonus ? 'ボーナス！' : `${S.idx+1} / ${S.list.length}`;
  $('#qBar').style.width = (S.idx/S.list.length*100)+'%';
  $('#qLabel').textContent = S.kind==='write' ? '□を タッチして 漢字を 書こう' : '線の ところの 読みがなを 書こう';
  $('#qSentence').innerHTML = sentenceHTML(q, S.kind, false);
  $('#qFeedback').innerHTML = '';
  $('#qBuddy').querySelector('img').dataset.art = bonus ? 'bird_gold' : 'bird_cheer'; applyArt($('#qBuddy'));
  $('#readArea').classList.toggle('hidden', S.kind!=='read');
  $('#qBuddy').classList.toggle('hidden', S.kind==='read');
  if(S.kind==='read'){ const inp=$('#ansInput'); inp.value=''; inp.readOnly=isTouchDevice; if(!isTouchDevice) setTimeout(()=>inp.focus(),50); }
  $$('#qSentence button.kbox').forEach(b => b.onclick = () => Pad.open(+b.dataset.k));
  renderChips(false);
  $('#timerBar').classList.toggle('hidden', !bonus);
  if(bonus) startTimer(S.bonusQ.limit);
  updateQButtons(); requestAnimationFrame(drawThumbs);
}
function drawThumbs(){
  if(!cur || cur.done || S?.kind!=='write') return;
  $$('#qSentence button.kbox').forEach(b => {
    const i = +b.dataset.k, cv = b.querySelector('canvas'); const s = Math.round(b.clientWidth) || 50;
    paintCanvas(cv, s, cur.strokes[i] || [], null);
  });
}
const isLastQ = () => !S.inBonus && !S.pendingBonus && S.idx+1>=S.list.length;
function updateQButtons(){
  const done = cur.done, w = S.kind==='write';
  $('#btnDontKnow').classList.toggle('hidden', done);
  $('#btnWrite').classList.toggle('hidden', done || !w);
  $('#btnAnswer').classList.toggle('hidden', done || w);
  $('#btnNext').classList.toggle('hidden', !done);
  $('#btnNext').textContent = isLastQ() ? 'けっかを 見る ▶' : 'つぎへ ▶';
}
$('#btnWrite').onclick = () => Pad.open(0);
$('#btnAnswer').onclick = () => judgeRead();
$('#btnNext').onclick = () => nextQ();
$('#btnDontKnow').onclick = () => dontKnow();

/* ---------- ボーナスのタイマー ---------- */
let timer = null;
function startTimer(sec){
  stopTimer(); const t0 = Date.now(); cur.limit = sec*1000;
  const tick = () => {
    if(!cur || cur.done){ stopTimer(); return; }
    const left = Math.max(0, cur.limit - (Date.now()-t0));
    $('#timerFill').style.width = (left/cur.limit*100)+'%';
    const txt = left>0 ? `⏱ のこり ${Math.ceil(left/1000)}びょう` : '⏱ じかんぎれ（でも こたえてOK）';
    const a = $('#qTimer'); if(a) a.textContent = txt;
    const b = $('#padTimer'); if(b) b.textContent = txt;
    if(left<=0) stopTimer();
  };
  tick(); timer = setInterval(tick, 200);
}
function stopTimer(){ if(timer){ clearInterval(timer); timer = null; } }

/* ---------- 判定 ---------- */
function dontKnow(){
  if(cur.done) return;
  if(S.kind==='write'){ cur.judge = {per:null, verdict:'ng', neat:null}; }
  finalize(false, {skipped:true});
}
function judgeWrite(){
  if(cur.done) return;
  const chars = kanjiOf(cur.q.word);
  if(cur.strokes.some(s => !s.length)){ toast('まだ 書いていない マスが あるよ'); return; }
  const P = JUDGE_PRESETS[save.settings.judge] || JUDGE_PRESETS.normal;
  const per = chars.map((ch,i) => {
    const r = matchChar(cur.strokes[i], ch);
    const st = r.fNorm>=P.ok ? 'ok' : r.fNorm>=P.border ? 'border' : 'ng';
    const neat = Math.round(clamp((r.fRaw-NEAT_FLOOR)/(P.neatFull-NEAT_FLOOR),0,1)*100);
    return {...r, st, neat};
  });
  let verdict = per.every(p=>p.st==='ok') ? 'ok' : per.some(p=>p.st==='ng') ? 'ng' : 'border';
  const neat = Math.round(avg(per.map(p=>p.neat)));
  cur.judge = {per, verdict, neat};
  cur.tAns = Date.now();
  if(S.mode==='test'){ finalize(verdict!=='ng', {neat, flag:verdict==='border'}); return; }
  if(save.settings.selfJudge && verdict!=='border') verdict = 'border';
  Pad.reveal();
  if(verdict==='border'){ cur.padState='border'; Pad.renderSide(); Pad.renderFoot(); Pad.layout(); return; }
  finalize(verdict==='ok', {neat});
}
function judgeRead(){
  if(cur.done) return;
  const a = normAns($('#ansInput').value);
  if(!a){ toast('こたえを 入れてね'); return; }
  cur.ans = $('#ansInput').value;
  finalize(a===normAns(cur.q.reading));
}
function finalize(correct, opt={}){
  if(cur.done) return;
  cur.done = true; stopTimer();
  const q = cur.q, kind = S.kind, k = kind==='write' ? 'w' : 'r';
  const time = (cur.tAns || Date.now()) - cur.t0;
  const s0 = save.stats[q.id]; const wasWeak = !!s0 && s0[k][1] > s0[k][0];
  const fast = correct && time <= targetSec(q, kind)*1000;
  const r = {q, kind, correct, neat:(opt.neat ?? null), flag:!!opt.flag, skipped:!!opt.skipped, fast, time,
    strokes: cur.strokes.map(s => s.map(st => st.slice())), ans:cur.ans, pt:0};
  addStat(q, kind, correct, 1); if(!S.inBonus) setTimeout(() => qhRec('k'+kind[0]+':'+q.id, correct), 0);
  const dr = dayRec(); dr.n++; if(correct) dr.c++;
  checkDaily();
  // ---- ポイント ----
  const gain = [];
  if(S.inBonus){
    r.bonus = true; r.sup = S.bonusQ.sup;
    const inTime = time <= cur.limit;
    if(correct){
      save.counters.bonus++; if(r.sup && inTime) save.counters.superBonus++;
      gain.push([r.sup ? 'スーパーボーナス' : 'ボーナス問題', inTime ? (r.sup ? POINT_RULES.superBonus : POINT_RULES.bonus) : POINT_RULES.bonusLate]);
    }
    S.bonus.push(r);
  }else{
    S.results.push(r);
    if(correct){
      S.combo++; S.maxCombo = Math.max(S.maxCombo, S.combo);
      { const dm = diffMult('k'+kind[0]+':'+q.id); r.dm = dm; gain.push(['せいかい', Math.round(POINT_RULES.correct*Math.min(dm,1))]); if(dm > 1.05){ gain.push(['🔥 チャレンジ ボーナス', Math.round(POINT_RULES.correct*(dm-1))]); save.chalCnt = (save.chalCnt||0)+1; } }
      if(kind==='write' && r.neat>=100) gain.push(['きれいさ100%', POINT_RULES.neat100]);
      if(fast && S.mode==='practice') gain.push(['はやい！', POINT_RULES.fast]);
      if(wasWeak) gain.push(['にがて こくふく', POINT_RULES.weakBeat]);
      if(S.mode==='practice' && S.combo%5===0) gain.push([`${S.combo}れんぞく せいかい`, POINT_RULES.combo5]);
    }else S.combo = 0;
  }
  const kr = townKnowRate(), gsum = gain.reduce((a,g)=>a+g[1],0);
  if(kr>0 && gsum>0) gain.push(['じゅうみんの ちしき', Math.max(1, Math.round(gsum*kr))]);
  const smul = skillMult(); if(smul>1 && gsum>0) gain.push(['レア住民の ちから', Math.max(1, Math.round(gsum*(smul-1)))]);
  gain.forEach(([l,p]) => r.pt += addPoints(p, l, S.mode==='test'));
  persist();
  if(S.mode==='test'){ sound('tap'); Pad.close(); setTimeout(nextQ, 250); return; }
  // ---- ボーナス判定 ----
  if(!S.inBonus && correct && shouldBonus()) S.pendingBonus = true;
  // ---- 表示 ----
  if(correct) celebrate(kind==='write' ? r.neat : null, r.pt, r.bonus ? 'gold' : 'jump'); else sound('ng');
  $('#qSentence').innerHTML = sentenceHTML(q, kind, true, correct);
  const note = q.note ? `<span class="noteTxt">💡 ${esc(q.note)}</span>` : '';
  const ptH = r.pt ? `<span class="ptFloat">+${r.pt}pt</span>` : '';
  const extra = [r.neat!=null && correct ? `きれいさ ${r.neat}%` : '', fast && !r.bonus ? '⚡はやい！' : ''].filter(Boolean).join('　');
  $('#qFeedback').innerHTML = correct
    ? `<span class="okTxt">⭕ せいかい！</span>　${extra}${ptH}${note}`
    : `<span class="ngTxt">❌ ざんねん…</span>　こたえは「${esc(q.word)}（${esc(q.reading)}）」${note}`;
  renderChips(correct && S.combo>=2);
  updateQButtons();
  if(kind==='write'){ cur.padState='done'; if(Pad.isOpen){ Pad.reveal(); Pad.renderSide(); Pad.renderFoot(); Pad.layout(); } }
}
function shouldBonus(){
  const B = BONUS_RULES;
  if(!save.settings.bonus || S.mode!=='practice' || S.bonusCount>=B.maxPerSet) return false;
  if(S.idx - S.lastBonusIdx < B.cooldown || S.combo < B.minCombo) return false;
  const last = S.results.slice(-3);
  if(last.length<3 || !last.every(r=>r.correct)) return false;
  if(last.filter(r=>r.fast).length < B.needFast) return false;
  if(S.kind==='write' && avg(last.map(r=>r.neat||0)) < B.minNeat) return false;
  return Math.random() < Math.min(0.95, B.chance*bonusBoost());
}
function pickBonusQ(){
  const used = new Set(S.list.map(q=>q.id)), k = S.kind==='write' ? 'w' : 'r';
  let pool = poolFor(S.kind, 'all').filter(q => !used.has(q.id));
  if(!pool.length) pool = poolFor(S.kind, 'all');
  const score = q => { const s = save.stats[q.id]; return kanjiOf(q.word).length*2 + q.reading.length*0.3 + (s ? s[k][1]*1.5 - s[k][0]*0.3 : 1) + Math.random()*2; };
  pool.sort((a,b) => score(b)-score(a));
  return pool[Math.random()*Math.min(8,pool.length)|0];
}
function openBonus(){
  const q = pickBonusQ(); if(!q){ nextQ(); return; }
  const sup = Math.random() < BONUS_RULES.superChance;
  const limit = Math.max(BONUS_RULES.minTime, Math.round(targetSec(q, S.kind)*BONUS_RULES.timeFactor));
  S.bonusQ = {q, sup, limit};
  $('#bonusTitle').textContent = sup ? '🌟 スーパーボーナス！' : '⭐ ボーナスもんだい！';
  $('#bonusDesc').innerHTML = `${limit}びょう 以内に せいかいで <b>+${sup ? POINT_RULES.superBonus : POINT_RULES.bonus}pt</b>！<br><small>じかんぎれでも せいかいなら +${POINT_RULES.bonusLate}pt</small>`;
  $('#bonusIntro').classList.add('show'); sound('fan'); confetti(1200);
}
$('#bonusGo').onclick = () => {
  $('#bonusIntro').classList.remove('show');
  S.inBonus = true; S.bonusCount++; S.lastBonusIdx = S.idx; renderQ();
};
function nextQ(){
  Pad.close(); if(!S) return; stopTimer();
  if(S.inBonus){ S.inBonus = false; document.body.classList.remove('bonusMode'); }
  else if(S.pendingBonus){ S.pendingBonus = false; openBonus(); return; }
  S.idx++;
  if(S.idx >= S.list.length) showResult(); else renderQ();
}

/* =====================================================================
   書き込みパッド
   ===================================================================== */
const Pad = {
  isOpen:false, boxes:[], active:0,
  open(focus){
    if(!S || S.kind!=='write') return;
    const q = cur.q, chars = kanjiOf(q.word);
    $('#padReading').innerHTML = `<span class="prd">「<b>${esc(q.reading)}</b>」を 書いてみよう</span><span class="pc">${esc(q.pre)}<b>${'□'.repeat(chars.length)}</b>${esc(q.post)}</span>`
      + (S.inBonus ? `<span class="qchip" id="padTimer" style="display:inline-block;margin-top:4px">⏱</span>` : '');
    $('#padBoxes').innerHTML = chars.map(() => `<div class="wbox"><canvas></canvas><div class="wscore"></div></div>`).join('');
    this.boxes = $$('#padBoxes .wbox').map((w,i) => new WriteBox(w, cur.strokes[i], () => this.setActive(i)));
    $$('#padBoxes .wbox').forEach((w,i) => w.addEventListener('pointerdown', () => this.setActive(i)));
    this.isOpen = true; $('#pad').classList.add('show'); document.body.classList.add('noscroll');
    this.setActive(focus||0);
    if(cur.done || cur.padState!=='writing') this.reveal();
    this.renderSide(); this.renderFoot();
    requestAnimationFrame(() => this.layout());
  },
  close(){
    if(!this.isOpen) return;
    this.isOpen = false; $('#pad').classList.remove('show'); document.body.classList.remove('noscroll');
    drawThumbs();
  },
  setActive(i){ this.active = i; $$('#padBoxes .wbox').forEach((w,k) => w.classList.toggle('active', k===i && !cur.done && cur.padState==='writing')); },
  layout(){
    if(!this.isOpen) return;
    const n = this.boxes.length, area = $('#padBoxes');
    area.style.gridTemplateColumns = '';
    const vw = area.clientWidth - 8, vh = area.clientHeight - 16;
    let best = 0, bestCols = n;
    for(let rows=1; rows<=Math.min(n,3); rows++){
      const cols = Math.ceil(n/rows);
      const s = Math.min((vw-(cols-1)*16)/cols, (vh-(rows-1)*16)/rows, 440);
      if(s > best){ best = s; bestCols = cols; }
    }
    best = Math.max(110, Math.floor(best) - 10);
    area.style.gridTemplateColumns = `repeat(${bestCols}, ${best+8}px)`;
    this.boxes.forEach(b => b.setSize(best));
  },
  reveal(){
    const chars = kanjiOf(cur.q.word), per = cur.judge?.per;
    this.boxes.forEach((b,i) => {
      b.locked = true; b.overlay = chars[i]; b.redraw();
      const w = b.wrap; w.classList.remove('active');
      const p = per?.[i];
      w.classList.toggle('okB', !!p && p.st!=='ng'); w.classList.toggle('ngB', !p || p.st==='ng');
      w.querySelector('.wscore').innerHTML = p ? `<span>${p.st==='ng' ? 'おてほんと くらべよう' : `きれいさ ${p.neat}%`}</span>` : '<span>おてほん</span>';
    });
  },
  renderSide(){
    $('#padSide').innerHTML = cur.padState==='writing'
      ? `<button class="btn white small" data-a="undo">↩ ひとつ もどす</button>
         <button class="btn white small" data-a="clear">🧽 けす</button>
         ${this.boxes.length>1 ? '<button class="btn white small" data-a="clearAll">ぜんぶ けす</button>' : ''}` : '';
    $('#padBuddy').classList.toggle('hidden', cur.padState!=='writing');
  },
  renderFoot(){
    const f = $('#padFoot');
    if(cur.padState==='writing'){
      f.innerHTML = `<div class="padBtns"><button class="btn white" data-a="dk">わからない</button><button class="btn pink big" data-a="answer" style="min-width:240px">こたえる</button></div>`;
    }else if(cur.padState==='border'){
      f.innerHTML = `<div class="padMsg">おてほんと くらべてみよう。あっていたかな？<small>赤い うすい字が おてほんだよ</small></div>
        <div class="padBtns"><button class="btn orange" data-a="selfNg">ちがった</button><button class="btn green" data-a="selfOk">あってた！</button></div>`;
    }else{
      const r = S.inBonus ? S.bonus[S.bonus.length-1] : S.results[S.results.length-1];
      const msg = r && r.correct ? `<span class="okTxt">⭕ せいかい！</span>${r.neat!=null?`　きれいさ ${r.neat}%`:''}${r.pt?`<span class="ptFloat">+${r.pt}pt</span>`:''}`
        : `<span class="ngTxt">❌ ざんねん…</span>　こたえは「${esc(cur.q.word)}」`;
      const note = cur.q.note ? `<small>💡 ${esc(cur.q.note)}</small>` : '';
      f.innerHTML = `<div class="padMsg">${msg}${note}</div>
        <div class="padBtns"><button class="btn" data-a="next">${isLastQ() ? 'けっかを 見る ▶' : 'つぎへ ▶'}</button></div>`;
    }
  }
};
function padAction(e){
  const b = e.target.closest('button'); if(!b) return; const a = b.dataset.a; const box = Pad.boxes[Pad.active];
  if(a==='undo'){ if(box && box.strokes.length){ box.strokes.pop(); box.redraw(); } }
  else if(a==='clear'){ if(box){ box.strokes.length = 0; box.redraw(); } }
  else if(a==='clearAll'){ Pad.boxes.forEach(b => { b.strokes.length = 0; b.redraw(); }); }
  else if(a==='answer') judgeWrite();
  else if(a==='dk') dontKnow();
  else if(a==='selfOk') finalize(true, {neat:cur.judge?.neat});
  else if(a==='selfNg') finalize(false, {neat:cur.judge?.neat});
  else if(a==='next') nextQ();
}
$('#padFoot').addEventListener('click', padAction);
$('#padSide').addEventListener('click', padAction);
$('#padClose').onclick = () => Pad.close();

/* =====================================================================
   リザルト
   ===================================================================== */
function showResult(){
  const R = S.results, n = R.length, c = R.filter(r=>r.correct).length;
  if(n>=5) addPoints(POINT_RULES.setDone, 'セット さいごまで できた');
  if(n>=5 && c===n){ addPoints(POINT_RULES.perfect, 'パーフェクト！'); save.counters.perfect++; }
  S.hist = {d:Date.now(), mode:S.mode, kind:S.kind, n, c, neat:null, time:Date.now()-S.start, pt:0, b:S.bonus.filter(b=>b.correct).length};
  save.history.push(S.hist); if(save.history.length>1000) save.history.shift();
  renderResult(true); show('result');
  checkBadges();
}
function renderResult(first){
  const R = S.results, n = R.length, c = R.filter(r=>r.correct).length, acc = n ? Math.round(c/n*100) : 0;
  const neats = R.filter(r=>r.correct && r.neat!=null).map(r=>r.neat);
  const neat = neats.length ? Math.round(avg(neats)) : null;
  const ptTotal = S.pts.reduce((a,p)=>a+p[1],0);
  Object.assign(S.hist, {c, neat, pt:ptTotal}); persist();
  const tier = acc===100 ? 'perfect' : acc>=80 ? 'great' : acc>=60 ? 'good' : 'try';
  $('#resRibbon').textContent = {perfect:'パーフェクト！', great:'すごい！ よくできました！', good:'よく がんばったね！', try:'ナイス チャレンジ！'}[tier];
  $('#resImg').dataset.art = {perfect:'bird_jump', great:'bird_jump', good:'bird_thumb', try:'bird_cheer'}[tier]; applyArt($('#scr-result'));
  $('#resMsg').innerHTML = {perfect:'ぜんぶ せいかい！<br>天才かも〜！', great:'すごい！<br>シマエナガも 大よろこび！', good:'あと少しで パーフェクト！<br>その ちょうし！', try:'だいじょうぶ！<br>ふくしゅうすれば ぐんぐん のびるよ！'}[tier];
  const bOk = S.bonus.filter(b=>b.correct).length;
  $('#resTable').innerHTML =
    `<tr><td>正答率</td><td>${acc}% <small>（${c}/${n}問）</small></td></tr>` +
    (S.kind==='write' ? `<tr><td>きれいさの 平均</td><td>${neat ?? '-'}${neat!=null?'%':''}</td></tr>` : '') +
    `<tr><td>かかった 時間</td><td>${fmtTime(S.hist.time)}</td></tr>` +
    (S.mode==='practice' ? `<tr><td>さいこう れんぞく</td><td>${S.maxCombo}<small>問</small></td></tr>` : '') +
    (S.bonus.length ? `<tr><td>ボーナス問題</td><td>${bOk} / ${S.bonus.length}</td></tr>` : '') +
    `<tr><td>ゲットした ポイント</td><td style="color:var(--gold-d)">+${nf(ptTotal)} pt</td></tr>`;
  const agg = new Map(); S.pts.forEach(([l,p]) => agg.set(l, (agg.get(l)||0) + p));
  $('#ptList').innerHTML = agg.size ? [...agg].map(([l,p]) => `<div><span>${esc(l)}</span><b>${p>0?'+':''}${p}pt</b></div>`).join('') : '<div>こんどは ポイントを ゲットしよう！</div>';
  const row = (r, i, isB) => {
    const mk = isB ? (r.correct ? '★' : '×') : r.correct ? (r.flag ? '△' : '○') : '×';
    const cls = r.correct ? (r.flag ? 'fl' : '') : 'ng';
    const right = r.kind==='write'
      ? `<div class="rt" data-i="${i}" data-b="${isB?1:0}">${kanjiOf(r.q.word).map(()=>'<canvas></canvas>').join('')}</div>`
      : `<div class="ua">${r.skipped ? 'わからない' : esc(r.ans)}</div>`;
    return `<div class="ri ${isB?'bonusRow':''}"><button class="mk ${cls}" ${isB?'disabled':''} data-i="${i}">${mk}</button>
      <div><div class="rw">${esc(r.q.word)}</div><div class="rr">${esc(r.q.reading)}${r.neat!=null && r.correct ? `・きれいさ ${r.neat}%` : ''}${r.pt?`・+${r.pt}pt`:''}</div></div>${right}</div>`;
  };
  $('#resList').innerHTML = R.map((r,i) => row(r,i,false)).join('') + S.bonus.map((r,i) => row(r,i,true)).join('');
  $$('#resList .rt').forEach(el => { const r = (el.dataset.b==='1' ? S.bonus : R)[+el.dataset.i]; const ch = kanjiOf(r.q.word);
    el.querySelectorAll('canvas').forEach((cv,k) => paintCanvas(cv, 52, r.strokes[k]||[], ch[k])); });
  $('#btnRetryWrong').classList.toggle('hidden', !R.some(r=>!r.correct));
  if(first){ if(acc===100 && n>0) setTimeout(()=>{ confetti(2600); sound('fan'); }, 300); }
}
$('#resList').addEventListener('click', e => {
  const b = e.target.closest('.mk'); if(!b || b.disabled) return; const r = S.results[+b.dataset.i];
  addStat(r.q, r.kind, r.correct, -1);
  const d = dayRec(dayKey(S.hist.d)); if(r.correct) d.c = Math.max(0, d.c-1); else d.c++;
  r.correct = !r.correct; r.flag = false; addStat(r.q, r.kind, r.correct, 1);
  addPoints(r.correct ? POINT_RULES.fix : -POINT_RULES.fix, r.correct ? 'はんてい なおし（せいかい）' : 'はんてい なおし（まちがい）');
  renderResult(false);
});
$('#btnRetryWrong').onclick = () => { const l = S.results.filter(r=>!r.correct).map(r=>r.q); startSession('practice', S.kind, shuffle(l)); };
$('#btnAgain').onclick = () => {
  if(S.mode==='test') startSession('test', S.kind, shuffle(S.list.slice()));
  else { const m=save.menu; startSession('practice', S.kind, pickQuestions(S.kind, Number(m.count)||10, m.order, m.grade)); }
};
$('#btnToMenu').onclick = () => { S = null; show('kmode'); };
$('#btnResHome').onclick = () => { S = null; show('home'); };

/* =====================================================================
   きろく
   ===================================================================== */
function renderRecord(){
  checkBadges();
  const t = totals(), mm = kanjiMastery(), learned = learnedCount(mm), st = curStreak();
  $('#recTop').innerHTML = [
    ['or', nf(save.points.bal), 'もっている pt'], ['', nf(save.points.earned), 'これまでの pt'],
    ['pk', `${st}<small style="font-size:15px">日</small>`, `れんぞく（さいこう ${save.daily.best}日）`],
    ['', nf(t.n), 'といた 問題'], ['gr', `${t.n ? Math.round(t.c/t.n*100) : 0}%`, 'せいかいりつ'],
    ['gr', `${learned}<small style="font-size:15px">/${mm.size}</small>`, 'おぼえた 漢字']
  ].map(([c,v,l]) => `<div class="stat ${c}"><b>${v}</b><span>${l}</span></div>`).join('');
  // ---- 14日グラフ ----
  const today = dayKey(), days = [];
  for(let i=13;i>=0;i--){ const k = dayAdd(today,-i); days.push({k, ...(save.days[k] || {n:0,c:0,pt:0})}); }
  const W = 700, H = 260, L = 34, Rm = 34, T = 16, B = 40, cw = (W-L-Rm)/14;
  const maxN = Math.max(10, ...days.map(d=>d.n)); const yN = v => T + (H-T-B)*(1 - v/maxN), yA = v => T + (H-T-B)*(1 - v/100);
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">`;
  [0,.5,1].forEach(f => { const y = T + (H-T-B)*f; svg += `<line x1="${L}" x2="${W-Rm}" y1="${y}" y2="${y}" stroke="#EADFCF" stroke-dasharray="4 4"/>
    <text x="${L-6}" y="${y+4}" text-anchor="end" fill="#8A7B6C">${Math.round(maxN*(1-f))}</text><text x="${W-Rm+6}" y="${y+4}" fill="#3E9B5C">${Math.round(100*(1-f))}%</text>`; });
  const pts = [];
  days.forEach((d,i) => {
    const x = L + cw*i, bw = cw*0.62, y = yN(d.n), isT = d.k===today;
    if(d.n) svg += `<rect x="${x+(cw-bw)/2}" y="${y}" width="${bw}" height="${H-B-y}" rx="6" fill="${isT ? '#FF7E9D' : '#8FD0F7'}"/>
      <text x="${x+cw/2}" y="${y-4}" text-anchor="middle" fill="#4A3F35" font-weight="bold">${d.n}</text>`;
    const [,m,dd] = d.k.split('-').map(Number);
    svg += `<text x="${x+cw/2}" y="${H-B+18}" text-anchor="middle" fill="${isT?'#E0577A':'#8A7B6C'}" font-weight="${isT?'bold':'normal'}">${m}/${dd}</text>`;
    if(d.n) pts.push([x+cw/2, yA(d.c/d.n*100)]);
  });
  if(pts.length>1) svg += `<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#5CBF7A" stroke-width="3" stroke-linejoin="round"/>`;
  pts.forEach(p => svg += `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#fff" stroke="#5CBF7A" stroke-width="3"/>`);
  svg += `</svg>`;
  $('#recChart').innerHTML = days.some(d=>d.n) ? svg : '<div class="note" style="text-align:center;padding:40px">まだ きろくが ないよ。勉強すると グラフが のびていくよ！</div>';
  // ---- カレンダー（4週） ----
  const t0 = new Date(); const start = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() - 21 - t0.getDay());
  let cal = '日月火水木金土'.split('').map(w => `<div class="wd">${w}</div>`).join('');
  for(let i=0;i<28;i++){
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate()+i), k = dayKey(d), r = save.days[k];
    const cls = [r && r.n>=20 ? 'on2' : r && r.n ? 'on' : '', k===today ? 'today' : ''].join(' ');
    cal += k > today ? `<div style="opacity:.35">${d.getDate()}</div>` : `<div class="${cls}">${d.getDate()}${r && r.n ? `<span style="font-size:10px">${r.n}問</span>` : ''}</div>`;
  }
  $('#recCal').innerHTML = cal; $('#calNote').textContent = `みどり：勉強した日／オレンジ：20問いじょう`;
  // ---- マスターマップ ----
  const arr = [...mm.values()];
  $('#recMap').innerHTML = arr.map(m => `<button class="${m.lv===-1?'wk':m.lv>0?'m'+m.lv:''}" data-k="${esc(m.k)}">${esc(m.k)}</button>`).join('');
  $('#mapNote').textContent = `マスター ${arr.filter(m=>m.lv===3).length}字`;
  // ---- にがて ----
  const weak = arr.filter(m => m.w>0 && m.w >= m.c*0.5).sort((a,b) => (b.w-b.c*0.5)-(a.w-a.c*0.5)).slice(0,15);
  $('#recWeak').innerHTML = weak.length ? weak.map(m => `<span>${esc(m.k)}</span>`).join('') : '<div class="note">にがてな 漢字は ないよ。すごい！</div>';
  $('#weakWrite').disabled = $('#weakRead').disabled = !weak.length;
  // ---- バッジ ----
  $('#recBadges').innerHTML = BADGES.map(b => `<div class="badge ${save.badges[b.id]?'got':''}"><i>${b.i}</i>${b.n}</div>`).join('');
  // ---- ポイント ----
  $('#recPts').innerHTML = save.points.log.slice(0,40).map(l => `<div><span class="d">${fmtDT(l.t)}</span>${esc(l.r)}<span class="v ${l.pt>0?'plus':'minus'}">${l.pt>0?'+':''}${l.pt}pt</span></div>`).join('')
    || '<div class="note">まだ ないよ</div>';
  // ---- 勉強の履歴 ----
  $('#recHist').innerHTML = save.history.slice(-20).reverse().map(h =>
    `<div><span class="d">${fmtDT(h.d)}</span>${h.mode==='test'?'📝 テスト':'✏️ れんしゅう'}・${h.kind==='write'?'書き':'読み'}　${h.c}/${h.n}問 せいかい${h.b?`・⭐${h.b}`:''}<span class="v plus">+${h.pt||0}pt</span></div>`).join('')
    || '<div class="note">まだ ないよ</div>';
}
$('#recMap').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return; const m = kanjiMastery().get(b.dataset.k);
  toast(`${m.k}　書き ○${m.wc} ×${m.ww}　読み ○${m.rc} ×${m.rw}`);
});
function weakSession(kind){
  const mm = kanjiMastery();
  const weakK = new Set([...mm.values()].filter(m => m.w>0 && m.w >= m.c*0.5).sort((a,b) => (b.w-b.c*0.5)-(a.w-a.c*0.5)).slice(0,10).map(m=>m.k));
  const list = []; const seen = new Set();
  shuffle(poolFor(kind,'all')).forEach(q => { if(weakK.has(q.kanji) && !seen.has(q.kanji)){ seen.add(q.kanji); list.push(q); } });
  if(!list.length){ toast('ふくしゅうする 問題が ないよ'); return; }
  startSession('practice', kind, list);
}
$('#weakWrite').onclick = () => weakSession('write');
$('#weakRead').onclick = () => weakSession('read');

/* =====================================================================
   読み問題：ひらがなキーボード
   ===================================================================== */
const KANA_COLS = ['あいうえお','かきくけこ','さしすせそ','たちつてと','なにぬねの','はひふへほ','まみむめも','や ゆ よ','らりるれろ','わ を ー','ん    '];
const DAKU = {'か':'が','き':'ぎ','く':'ぐ','け':'げ','こ':'ご','さ':'ざ','し':'じ','す':'ず','せ':'ぜ','そ':'ぞ','た':'だ','ち':'ぢ','つ':'づ','て':'で','と':'ど','は':'ば','ひ':'び','ふ':'ぶ','へ':'べ','ほ':'ぼ','う':'ゔ'};
const HANDAKU = {'は':'ぱ','ひ':'ぴ','ふ':'ぷ','へ':'ぺ','ほ':'ぽ'};
const SMALL = {'あ':'ぁ','い':'ぃ','う':'ぅ','え':'ぇ','お':'ぉ','つ':'っ','や':'ゃ','ゆ':'ゅ','よ':'ょ','わ':'ゎ'};
const inv = m => Object.fromEntries(Object.entries(m).map(([a,b])=>[b,a]));
const DAKU_I = inv(DAKU), HANDAKU_I = inv(HANDAKU), SMALL_I = inv(SMALL);
function baseKana(c){ return DAKU_I[c] || HANDAKU_I[c] || SMALL_I[c] || c; }
function modLast(type){
  const inp = $('#ansInput'); const v = inp.value; if(!v) return;
  const c = v.slice(-1), base = baseKana(c);
  const map = type==='daku' ? DAKU : type==='handaku' ? HANDAKU : SMALL;
  let n = c;
  if(map[base] === c) n = base; else if(map[base]) n = map[base];
  inp.value = v.slice(0,-1) + n;
}
function buildKana(){
  let h = '';
  for(let r=0;r<5;r++) for(let c=0;c<KANA_COLS.length;c++){
    const ch = KANA_COLS[c][r] || ' ';
    h += ch===' ' ? `<button class="blank" tabindex="-1"></button>` : `<button data-c="${ch}">${ch}</button>`;
  }
  h += `<button class="fn wide2" data-f="daku">゛ てんてん</button><button class="fn wide2" data-f="handaku">゜ まる</button>
        <button class="fn wide2" data-f="small">小さく</button><button class="fn wide2" data-f="bs">⌫ 1字けす</button>
        <button class="fn wide3" data-f="clr">ぜんぶ けす</button>`;
  $('#kana').innerHTML = h;
}
buildKana();
$('#kana').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b || !cur || cur.done) return; const inp = $('#ansInput');
  if(b.dataset.c) inp.value += b.dataset.c;
  else if(b.dataset.f==='bs') inp.value = inp.value.slice(0,-1);
  else if(b.dataset.f==='clr') inp.value = '';
  else if(b.dataset.f) modLast(b.dataset.f);
});
$('#ansInput').addEventListener('keydown', e => { if(e.key==='Enter' && !e.isComposing){ e.preventDefault(); if(cur && !cur.done) judgeRead(); else if(cur && cur.done) nextQ(); } });
$('#btnSysKb').onclick = () => { const inp=$('#ansInput'); inp.readOnly = !inp.readOnly; if(!inp.readOnly) inp.focus(); else inp.blur(); };

/* =====================================================================
   演出：はなまる・紙吹雪・効果音
   ===================================================================== */
(function buildHanamaru(){
  const cx=100, cy=100; let d='';
  for(let i=0;i<=160;i++){ const t=i/160, a=-Math.PI/2+t*Math.PI*2*2.2, r=8+t*46; d+=(i?'L':'M')+(cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1); }
  const a0 = -Math.PI/2+Math.PI*2*2.2;
  for(let i=0;i<=360;i++){ const t=i/360, a=a0+t*Math.PI*2; const base=66, petal=8;
    const r = base + 14*Math.abs(Math.sin((a-a0)*petal/2));
    d+='L'+(cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1); }
  $('#hmPath').setAttribute('d', d);
})();
function celebrate(neat, pt, pose='jump'){
  const el = $('#celebrate'), p = $('#hmPath');
  $('#celeTxt').textContent = 'はなまる！' + (neat!=null ? `  きれいさ ${neat}%` : '');
  $('#celePt').textContent = pt ? `+${pt}pt` : ''; $('#celePt').classList.toggle('hidden', !pt);
  const img = $('#celebrate .celeArt img'); img.dataset.art = pose==='gold' ? 'bird_gold' : 'bird_jump'; applyArt($('#celebrate'));
  el.classList.add('show');
  const L = p.getTotalLength(); p.style.transition='none'; p.style.strokeDasharray=L; p.style.strokeDashoffset=L;
  p.getBoundingClientRect(); p.style.transition='stroke-dashoffset .7s ease-out'; p.style.strokeDashoffset=0;
  confetti(1500); sound('ok');
  clearTimeout(celebrate.tm); celebrate.tm = setTimeout(() => el.classList.remove('show'), 1500);
}
function confetti(ms=1500){
  const cv = $('#confetti'), dpr = window.devicePixelRatio||1, W = innerWidth, H = innerHeight;
  cv.width = W*dpr; cv.height = H*dpr; const ctx = cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  const cols = ['#FF7A7A','#FFC93C','#4BA3E3','#4CB782','#B98CF5','#FF9ED2'];
  const ps = Array.from({length:140}, () => ({x:Math.random()*W, y:-20-Math.random()*H*0.5, vx:(Math.random()-.5)*3, vy:2+Math.random()*4,
    r:Math.random()*Math.PI, vr:(Math.random()-.5)*0.3, w:6+Math.random()*7, h:4+Math.random()*6, c:cols[Math.random()*cols.length|0]}));
  const t0 = performance.now(); cancelAnimationFrame(confetti.raf);
  (function f(t){
    const e = t-t0; ctx.clearRect(0,0,W,H);
    ps.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.r+=p.vr; ctx.save(); ctx.globalAlpha=Math.max(0,1-Math.max(0,e-ms*0.7)/(ms*0.3));
      ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle=p.c; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore(); });
    if(e<ms) confetti.raf = requestAnimationFrame(f); else ctx.clearRect(0,0,W,H);
  })(t0);
}
let actx = null;
function sound(type){
  if(!save.settings.sound) return;
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    if(actx.state==='suspended') actx.resume();
    const notes = type==='ok' ? [523,659,784,1047] : type==='ng' ? [392,294] : type==='fan' ? [523,659,784,1047,1319] : [880];
    notes.forEach((f,i) => {
      const o = actx.createOscillator(), g = actx.createGain(); o.type='triangle'; o.frequency.value=f;
      const t = actx.currentTime + i*0.1; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.22,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t+0.3);
    });
  }catch(e){}
}

/* =====================================================================
   設定
   ===================================================================== */
let gateFn = null, gateAns = 0;
function parentGate(fn){
  const a = 3+(Math.random()*7|0), b = 3+(Math.random()*7|0); gateAns = a*b; gateFn = fn;
  $('#gateQ').textContent = `${a} × ${b} = ?`; $('#gateIn').value = ''; $('#gate').classList.add('show');
  setTimeout(()=>$('#gateIn').focus(), 50);
}
$('#gateCancel').onclick = () => $('#gate').classList.remove('show');
$('#gateOk').onclick = () => { if(Number($('#gateIn').value)===gateAns){ $('#gate').classList.remove('show'); gateFn && gateFn(); } else toast('ちがいます'); };
$('#gateIn').addEventListener('keydown', e => { if(e.key==='Enter') $('#gateOk').click(); });

const ST = () => save.settings;
bindSeg('segJudge', ST, 'judge'); bindSeg('segSelf', ST, 'selfJudge'); bindSeg('segPen', ST, 'pen');
bindSeg('segPenOnly', ST, 'penOnly'); bindSeg('segSound', ST, 'sound'); bindSeg('segBonus', ST, 'bonus');
function renderSettings(){
  const s = save.settings;
  syncSeg('segJudge', s.judge); syncSeg('segSelf', s.selfJudge); syncSeg('segPen', s.pen); syncSeg('segPenOnly', s.penOnly);
  syncSeg('segSound', s.sound); syncSeg('segBonus', s.bonus);
  $('#importLog').textContent = `いまの問題数：${allQs().length}問（初期 ${BUILTIN.length}問 ＋ 追加 ${customQs.length}問）`;
  $('#verNote').textContent = `まなびタウン v${APP_VERSION}`; void `（フェーズ① かんじ ＋ フェーズ② ポイント・ボーナス・きろく ＋ フェーズ③ まちづくり ＋ フェーズ④ 乗り物・鉄道・ずかん）`;
}
function adjustPoints(sign){
  const v = Math.floor(Number($('#ptAdjust').value)); if(!(v>0)){ toast('数を 入れてください'); return; }
  const keep = S; S = null; addPoints(sign*v, sign>0 ? 'おうちの人から' : 'おうちの人が へらした'); S = keep;
  $('#ptAdjust').value = ''; toast(`${sign>0?'+':'-'}${v}pt`);
}
$('#ptAdd').onclick = () => adjustPoints(1);
$('#ptSub').onclick = () => adjustPoints(-1);
/* ---------- 問題の取り込み ---------- */
function loadXLSX(){
  return new Promise((res, rej) => {
    if(window.XLSX) return res(window.XLSX);
    const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload = () => res(window.XLSX); s.onerror = () => rej(new Error('Excel読み込み用のライブラリを取得できませんでした。インターネット接続を確認するか、CSVで取り込んでください。'));
    document.head.appendChild(s);
  });
}
function parseCSV(text){
  const rows = []; let row = [], f = '', q = false;
  for(let i=0;i<text.length;i++){ const ch = text[i];
    if(q){ if(ch==='"'){ if(text[i+1]==='"'){ f+='"'; i++; } else q=false; } else f+=ch; }
    else if(ch==='"') q = true; else if(ch===','){ row.push(f); f=''; }
    else if(ch==='\n'){ row.push(f); rows.push(row); row=[]; f=''; } else if(ch!=='\r') f+=ch; }
  if(f || row.length){ row.push(f); rows.push(row); }
  return rows;
}
function importRows(rows){
  const hi = rows.findIndex(r => r.some(c => String(c).trim()==='問題文'));
  if(hi<0) throw new Error('「問題文」という見出しの列が見つかりません。');
  const H = rows[hi].map(c => String(c).trim());
  const col = names => H.findIndex(h => names.includes(h));
  const ci = {id:col(['ID','id']), subject:col(['教科']), grade:col(['学年']), type:col(['種別','種類']), text:col(['問題文']),
    reading:col(['読みがな','よみがな','読み','ふりがな']), kanji:col(['対象漢字','漢字']), note:col(['解説','メモ'])};
  if(ci.reading<0) throw new Error('「読みがな」の列が見つかりません。');
  const keys = new Set(allQs().map(q => qKey(q.text, q.reading))); const ids = new Set(allQs().map(q=>q.id));
  let add=0, dup=0, err=0; const errs = [];
  rows.slice(hi+1).forEach((r, k) => {
    const g = i => i>=0 ? String(r[i] ?? '').trim() : '';
    if(!g(ci.text) && !g(ci.reading)) return;
    const subject = g(ci.subject) || '漢字'; if(subject!=='漢字') return;
    let id = g(ci.id); if(!id || ids.has(id)) id = 'C-' + Date.now().toString(36) + '-' + k;
    const o = {id, subject, grade:g(ci.grade).replace(/[^0-9]/g,''), type:g(ci.type), text:g(ci.text), reading:g(ci.reading), kanji:g(ci.kanji), note:g(ci.note)};
    const key = qKey(o.text, o.reading);
    if(keys.has(key)){ dup++; return; }
    if(!buildQ(o)){ err++; if(errs.length<5) errs.push(`${hi+k+2}行目：${o.text||'(空)'}`); return; }
    save.custom.push(o); keys.add(key); ids.add(id); add++;
  });
  persist(); rebuildCustom();
  return `追加 ${add}問／重複でスキップ ${dup}問／形式エラー ${err}問` + (errs.length ? '\n' + errs.join('\n') + '\n（[ ]で囲んだ漢字と読みがなが必要です）' : '');
}
$('#fileImport').addEventListener('change', async e => {
  const file = e.target.files[0]; if(!file) return; const log = $('#importLog'); log.textContent = 'よみこみ中…';
  try{
    let rows;
    if(/\.csv$/i.test(file.name)){ rows = parseCSV(await file.text()); }
    else{
      const X = await loadXLSX(); const wb = X.read(await file.arrayBuffer(), {type:'array'});
      const name = wb.SheetNames.find(n => /漢字|問題/.test(n)) || wb.SheetNames[0];
      rows = X.utils.sheet_to_json(wb.Sheets[name], {header:1, defval:''});
    }
    log.textContent = importRows(rows) + `\nいまの問題数：${allQs().length}問`;
  }catch(err){ log.textContent = '⚠ ' + err.message; }
  e.target.value = '';
});
$('#btnClearCustom').onclick = () => { if(!save.custom.length){ toast('ついかした問題は ありません'); return; }
  if(confirm(`追加した ${save.custom.length}問を 消しますか？`)){ save.custom = []; persist(); rebuildCustom(); renderSettings(); } };
$('#btnResetStats').onclick = () => { if(confirm('せいせき・きろく・ポイントを すべて消しますか？')){ save.stats = {}; save.history = []; save.days = {}; save.badges = {}; save.daily = {last:'', streak:0, best:0}; save.counters = {perfect:0, bonus:0, superBonus:0}; save.points = {bal:0, earned:0, log:[]}; persist(); updatePill(); toast('リセットしました'); } };
$('#btnBackup').onclick = () => {
  const blob = new Blob([JSON.stringify({app:'manabiTown', ver:APP_VERSION, save, art:artStore})], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `manabitown_backup_${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
};
$('#fileRestore').addEventListener('change', async e => {
  const file = e.target.files[0]; if(!file) return;
  try{ const d = JSON.parse(await file.text()); if(d.app!=='manabiTown' || !d.save) throw 0;
    if(!confirm('いまの データを バックアップで 上書きしますか？')) return;
    localStorage.setItem(STORE_KEY, JSON.stringify(d.save)); save = loadSave();  ensureTown(); rebuildCustom(); renderSettings(); applyArt(); updatePill(); toast('もどしました');
  }catch(err){ toast('バックアップファイルを よみこめませんでした'); }
  e.target.value = '';
});

/* =====================================================================
   まちづくり（v0.5）
   ---------------------------------------------------------------------
   ・TOWN_LEVELS（発展段階）・TOWN_ITEMS（アイテム）・SPECIES（住民）・TOWN_RULES（ルール）を
     書きかえるか、設定画面の「まちの拡張データ(JSON)」で追加・上書きできます。
   ・アイテムの req で「○○が ないと 買えない」などの 購入条件を つけられます。
       req:{has:{office:2}, res:20, species:12, know:60, trains:['shinkansen'], veh:['sports'], traffic:100}
   ===================================================================== */
const rint = (a,b) => a + Math.floor(Math.random()*(b-a+1));
let TOWN_LEVELS = [
  {name:'小さな村',       earned:0,      dev:0,     traffic:0,   cols:6,  rows:4,  maxRes:4,  maxVeh:2},
  {name:'村',             earned:400,    dev:60,    traffic:0,   cols:7,  rows:5,  maxRes:6,  maxVeh:3},
  {name:'にぎやかな村',   earned:1500,   dev:150,   traffic:0,   cols:8,  rows:5,  maxRes:9,  maxVeh:4},
  {name:'小さな町',       earned:4000,   dev:320,   traffic:3,   cols:8,  rows:6,  maxRes:12, maxVeh:5},
  {name:'町',             earned:8000,   dev:600,   traffic:10,  cols:9,  rows:6,  maxRes:15, maxVeh:6},
  {name:'大きな町',       earned:15000,  dev:1000,  traffic:25,  cols:10, rows:7,  maxRes:19, maxVeh:8},
  {name:'都市',           earned:30000,  dev:1600,  traffic:50,  cols:12, rows:8,  maxRes:24, maxVeh:10},
  {name:'にぎやかな都市', earned:50000,  dev:2400,  traffic:80,  cols:12, rows:8,  maxRes:28, maxVeh:12},
  {name:'大都市',         earned:80000,  dev:3500,  traffic:120, cols:13, rows:9,  maxRes:33, maxVeh:14},
  {name:'みなと大都市',   earned:120000, dev:5000,  traffic:170, cols:14, rows:9,  maxRes:38, maxVeh:16},
  {name:'未来都市',       earned:170000, dev:7000,  traffic:230, cols:15, rows:10, maxRes:44, maxVeh:18},
  {name:'ゆめの都',       earned:250000, dev:10000, traffic:300, cols:16, rows:10, maxRes:50, maxVeh:20}
];
/* 住民の 家の しゅるい */
let HOME_TYPES = {
  house: {n:'家',              item:'house'},
  bird:  {n:'とりの おうち',   item:'birdhouse'},
  tree:  {n:'木の おうち',     item:'treehouse'},
  log:   {n:'ログハウス',      item:'logcabin'},
  bamboo:{n:'たけの おうち',   item:'bamboo'},
  water: {n:'みずべの おうち', item:'waterhouse'}
};
let SPECIES = [
  {id:'cat',      name:'ネコ',       art:'res_cat',      emoji:'🐱', rar:1, w:20,  bias:'know',  home:'house'},
  {id:'dog',      name:'イヌ',       art:'res_dog',      emoji:'🐶', rar:1, w:20,  bias:'work',  home:'house'},
  {id:'rabbit',   name:'ウサギ',     art:'res_rabbit',   emoji:'🐰', rar:1, w:18,  bias:'biz',   home:'house'},
  {id:'hamster',  name:'ハムスター', art:'res_hamster',  emoji:'🐹', rar:1, w:18,  bias:'biz',   home:'house'},
  {id:'pig',      name:'ブタ',       art:'res_pig',      emoji:'🐷', rar:1, w:16,  bias:'work',  home:'house'},
  {id:'sheep',    name:'ヒツジ',     art:'res_sheep',    emoji:'🐑', rar:1, w:16,  bias:'pop',   home:'house'},
  {id:'sparrow',  name:'スズメ',     art:'res_sparrow',  emoji:'🐦', rar:1, w:20,  bias:'pop',   home:'bird'},
  {id:'tanuki',   name:'タヌキ',     art:'res_tanuki',   emoji:'🦝', rar:1, w:16,  bias:'biz',   home:'log'},
  {id:'frog',     name:'カエル',     art:'res_frog',     emoji:'🐸', rar:1, w:16,  bias:'drive', home:'water'},
  {id:'owl',      name:'フクロウ',   art:'res_owl',      emoji:'🦉', rar:2, w:8,   bias:'know',  home:'bird'},
  {id:'squirrel', name:'リス',       art:'res_squirrel', emoji:'🐿️', rar:2, w:8,   bias:'know',  home:'tree'},
  {id:'bear',     name:'クマ',       art:'res_bear',     emoji:'🐻', rar:2, w:8,   bias:'work',  home:'log'},
  {id:'fox',      name:'キツネ',     art:'res_fox',      emoji:'🦊', rar:2, w:8,   bias:'drive', home:'log'},
  {id:'hedgehog', name:'ハリネズミ', art:'res_hedgehog', emoji:'🦔', rar:2, w:8,   bias:'know',  home:'log'},
  {id:'otter',    name:'カワウソ',   art:'res_otter',    emoji:'🦦', rar:2, w:8,   bias:'biz',   home:'water'},
  {id:'penguin',  name:'ペンギン',   art:'res_penguin',  emoji:'🐧', rar:2, w:7,   bias:'drive', home:'water'},
  {id:'seal',     name:'アザラシ',   art:'res_seal',     emoji:'🦭', rar:2, w:7,   bias:'pop',   home:'water'},
  {id:'koala',    name:'コアラ',     art:'res_koala',    emoji:'🐨', rar:3, w:3,   bias:'pop',   home:'tree'},
  {id:'redpanda', name:'レッサーパンダ', art:'res_redpanda', emoji:'🐾', rar:3, w:3, bias:'drive', home:'tree'},
  {id:'alpaca',   name:'アルパカ',   art:'res_alpaca',   emoji:'🦙', rar:3, w:3,   bias:'pop',   home:'log'},
  {id:'panda',    name:'パンダ',     art:'res_panda',    emoji:'🐼', rar:3, w:3,   bias:'pop',   home:'bamboo'},
  {id:'shima',    name:'シマエナガ', art:'bird_wave',    emoji:'🕊️', rar:4, w:0.8, bias:'all',   home:'bird'}
];
const RARITY = {1:{n:'ふつう', c:'#8A7B6C', bg:'#F3ECE1'}, 2:{n:'ちょっとレア', c:'#2F86C6', bg:'#E1F1FC'},
                3:{n:'レア', c:'#9B4FD0', bg:'#F1E4FB'}, 4:{n:'ちょうレア', c:'#C8901A', bg:'#FFF1C2'}};
const ABILITIES = [
  {id:'work',  n:'はたらく',   i:'🔨', d:'まちの 発展度が 上がる'},
  {id:'biz',   n:'しょうばい', i:'💰', d:'お店の うりあげが ふえる'},
  {id:'know',  n:'ちしき',     i:'📘', d:'勉強で もらえる ポイントが ふえる'},
  {id:'pop',   n:'にんき',     i:'💖', d:'レアな じゅうみんが 来やすくなる'},
  {id:'drive', n:'うんてん',   i:'🚗', d:'乗り物の こうつうが ふえる'}
];
/* type: bld=マップに置く / veh=車 / train=電車 / use=つかうアイテム
   cat: home=家 bld=たてもの deco=かざり road=みち rail=えき
   dev=発展度 income=うりあげ/日 cap=すめる数 home=家の種類 know=ちしき% pop=レア住民% traffic=こうつう
   park=のりもの+台 station=電車+本 lv=かいほうLv priceStep=住民1人ごとの ねあがり req=購入条件 */
let TOWN_ITEMS = [
  /* ---- 家 ---- */
  {id:'house',     type:'bld', cat:'home', name:'家',              art:'bld_house',      emoji:'🏠', price:150,  lv:1, dev:8,  cap:2, home:'house'},
  {id:'birdhouse', type:'bld', cat:'home', name:'とりの おうち',   art:'bld_birdhouse',  emoji:'🐦', price:250,  lv:1, dev:8,  cap:2, home:'bird'},
  {id:'logcabin',  type:'bld', cat:'home', name:'ログハウス',      art:'bld_logcabin',   emoji:'🪵', price:350,  lv:2, dev:10, cap:2, home:'log'},
  {id:'waterhouse',type:'bld', cat:'home', name:'みずべの おうち', art:'bld_waterhouse', emoji:'🏞️', price:450,  lv:3, dev:12, cap:2, home:'water'},
  {id:'treehouse', type:'bld', cat:'home', name:'木の おうち',     art:'bld_treehouse',  emoji:'🌳', price:500,  lv:3, dev:12, cap:2, home:'tree'},
  {id:'bamboo',    type:'bld', cat:'home', name:'たけの おうち',   art:'bld_bamboo',     emoji:'🎋', price:900,  lv:4, dev:15, cap:1, home:'bamboo'},
  {id:'apartment', type:'bld', cat:'home', name:'マンション',      art:'bld_apartment',  emoji:'🏢', price:1800, lv:6, dev:30, cap:6, home:'any'},
  /* ---- みち ---- */
  {id:'road',        type:'bld', cat:'road', name:'アスファルトの みち', emoji:'🛣️', price:20, lv:1, dev:1, desc:'車が はしれる・5マスごとに のりもの+1台'},
  {id:'road_dirt',   type:'bld', cat:'road', name:'つちの みち',   emoji:'🟫', price:10, lv:1, dev:1, desc:'車が はしれる'},
  {id:'road_brick',  type:'bld', cat:'road', name:'レンガの みち', emoji:'🧱', price:35, lv:2, dev:2, desc:'車が はしれる'},
  {id:'road_stone',  type:'bld', cat:'road', name:'いしだたみ',     emoji:'🪨', price:45, lv:3, dev:3, desc:'車が はしれる'},
  {id:'road_pastel', type:'bld', cat:'road', name:'パステルの みち', emoji:'🌈', price:60, lv:4, dev:4, desc:'車が はしれる'},
  /* ---- かざり ---- */
  {id:'tree',     type:'bld', cat:'deco', name:'木',         art:'bld_tree',     emoji:'🌳', price:30,   lv:1, dev:2},
  {id:'flower',   type:'bld', cat:'deco', name:'花だん',     art:'bld_flower',   emoji:'🌷', price:40,   lv:1, dev:3},
  {id:'bench',    type:'bld', cat:'deco', name:'ベンチ',     art:'itm_bench',    emoji:'🪑', price:60,   lv:1, dev:3},
  {id:'lamp',     type:'bld', cat:'deco', name:'がいとう',   art:'itm_lamp',     emoji:'💡', price:60,   lv:2, dev:3},
  {id:'well',     type:'bld', cat:'deco', name:'井戸',       art:'itm_well',     emoji:'🪣', price:120,  lv:2, dev:6},
  {id:'pond',     type:'bld', cat:'deco', name:'池',         art:'itm_pond',     emoji:'🪷', price:150,  lv:2, dev:8},
  {id:'fountain', type:'bld', cat:'deco', name:'ふんすい',   art:'bld_fountain', emoji:'⛲', price:500,  lv:4, dev:30},
  /* ---- たてもの ---- */
  {id:'field',    type:'bld', cat:'bld', name:'畑',           art:'bld_field',    emoji:'🥕', price:80,   lv:1,  dev:6,   income:5},
  {id:'bakery',   type:'bld', cat:'bld', name:'パン屋',       art:'bld_bakery',   emoji:'🍞', price:250,  lv:2,  dev:15,  income:15},
  {id:'market',   type:'bld', cat:'bld', name:'八百屋',       art:'bld_market',   emoji:'🍎', price:300,  lv:3,  dev:15,  income:20},
  {id:'windmill', type:'bld', cat:'bld', name:'風車',         art:'itm_windmill', emoji:'🌬️', price:450,  lv:3,  dev:20,  income:10},
  {id:'park',     type:'bld', cat:'bld', name:'公園',         art:'bld_park',     emoji:'🛝', price:400,  lv:3,  dev:25},
  {id:'post',     type:'bld', cat:'bld', name:'ゆうびん局',   art:'bld_post',     emoji:'📮', price:600,  lv:4,  dev:35,  income:10},
  {id:'library',  type:'bld', cat:'bld', name:'図書館',       art:'bld_library',  emoji:'📚', price:800,  lv:5,  dev:45,  know:0.05},
  {id:'school',   type:'bld', cat:'bld', name:'学校',         art:'bld_school',   emoji:'🏫', price:900,  lv:5,  dev:50,  know:0.05},
  {id:'parking',  type:'bld', cat:'bld', name:'パーキング',   art:'bld_parking',  emoji:'🅿️', price:500,  lv:5,  dev:10,  park:3},
  {id:'clinic',   type:'bld', cat:'bld', name:'病院',         art:'bld_clinic',   emoji:'🏥', price:1000, lv:6,  dev:55},
  {id:'office',   type:'bld', cat:'bld', name:'高層ビル',     art:'bld_office',   emoji:'🏙️', price:1500, lv:6,  dev:60,  income:30},
  {id:'dept',     type:'bld', cat:'bld', name:'デパート',     art:'bld_dept',     emoji:'🏬', price:2000, lv:7,  dev:70,  income:40},
  {id:'hotel',    type:'bld', cat:'bld', name:'ホテル',       art:'bld_hotel',    emoji:'🏨', price:2200, lv:7,  dev:70,  income:20, pop:0.04},
  {id:'museum',   type:'bld', cat:'bld', name:'はくぶつかん', art:'bld_museum',   emoji:'🏛️', price:2200, lv:7,  dev:70,  know:0.05},
  {id:'cityhall', type:'bld', cat:'bld', name:'市やくしょ',   art:'bld_cityhall', emoji:'🏛️', price:3000, lv:8,  dev:120},
  {id:'tower',    type:'bld', cat:'bld', name:'テレビとう',   art:'bld_tower',    emoji:'🗼', price:3500, lv:8,  dev:150, pop:0.05},
  {id:'stadium',  type:'bld', cat:'bld', name:'スタジアム',   art:'bld_stadium',  emoji:'🏟️', price:4500, lv:9,  dev:180, pop:0.06},
  {id:'harbor',   type:'bld', cat:'bld', name:'みなと',       art:'bld_harbor',   emoji:'⚓', price:5000, lv:10, dev:180, income:80},
  {id:'ferris',   type:'bld', cat:'bld', name:'ゆうえんち',   art:'bld_ferris',   emoji:'🎡', price:6000, lv:10, dev:220, pop:0.06},
  {id:'airport',  type:'bld', cat:'bld', name:'くうこう',     art:'bld_airport',  emoji:'✈️', price:9000, lv:11, dev:300, income:120, pop:0.08},
  /* ---- とくべつな たてもの（購入条件あり） ---- */
  {id:'heliport',   type:'bld', cat:'bld', name:'ヘリポート',         art:'bld_heliport',    emoji:'🚁', price:2500,  lv:7,  dev:90,  traffic:10, special:1, req:{has:{office:1}}},
  {id:'observatory',type:'bld', cat:'bld', name:'てんもんだい',       art:'bld_observatory', emoji:'🔭', price:4000,  lv:8,  dev:120, know:0.08, special:1, req:{has:{library:1, museum:1}, know:60}},
  {id:'zoo',        type:'bld', cat:'bld', name:'どうぶつえん',       art:'bld_zoo',         emoji:'🦒', price:5000,  lv:8,  dev:180, pop:0.08, special:1, req:{species:12}},
  {id:'aquarium',   type:'bld', cat:'bld', name:'すいぞくかん',       art:'bld_aquarium',    emoji:'🐳', price:6000,  lv:9,  dev:200, income:50, pop:0.05, special:1, req:{has:{harbor:1, pond:2}}},
  {id:'landmark',   type:'bld', cat:'bld', name:'ランドマークタワー', art:'bld_landmark',    emoji:'🗼', price:8000,  lv:9,  dev:300, income:60, pop:0.06, special:1, req:{has:{office:3, tower:1}}},
  {id:'castle',     type:'bld', cat:'bld', name:'おしろ',             art:'bld_castle',      emoji:'🏰', price:15000, lv:11, dev:500, pop:0.1, special:1, req:{has:{cityhall:1, landmark:1}, res:30}},
  {id:'space',      type:'bld', cat:'bld', name:'うちゅうセンター',   art:'bld_space',       emoji:'🚀', price:20000, lv:12, dev:600, know:0.1, special:1, req:{has:{airport:1, observatory:1}, trains:['shinkansen']}},
  /* ---- 鉄道の駅 ---- */
  {id:'station',   type:'bld', cat:'rail', name:'えき',        art:'trn_station',    emoji:'🚉', price:800,  lv:4, dev:30, station:2},
  {id:'bigstation',type:'bld', cat:'rail', name:'大きな えき', art:'trn_bigstation', emoji:'🚉', price:3000, lv:8, dev:80, station:4},
  /* ---- 住民アイテム（レターは 住民が ふえるほど 高くなる） ---- */
  {id:'letter',    type:'use', name:'おまねきレター',   art:'itm_letter',     emoji:'💌', price:400,  priceStep:80,  lv:1, desc:'あたらしい じゅうみんを よぶ（すむ 家が ひつよう）'},
  {id:'goldletter',type:'use', name:'きらきらレター',   art:'itm_goldletter', emoji:'✨', price:1500, priceStep:150, lv:3, desc:'ちょっとレア いじょうの じゅうみんが 来る'},
  {id:'ticket',    type:'use', name:'引っこしチケット', art:'itm_ticket',     emoji:'🎫', price:300,  lv:1, desc:'じゅうみんを 入れかえる'},
  {id:'rankbook',  type:'use', name:'ランクアップの本', art:'itm_rankbook',   emoji:'📘', price:400,  lv:2, desc:'じゅうみんの ★を 1つ 上げる'},
  /* ---- 乗り物 ---- */
  {id:'bicycle',   type:'veh', name:'じてんしゃ',         art:'veh_bicycle',      emoji:'🚲', price:50,   lv:1, traffic:1},
  {id:'scooter',   type:'veh', name:'はいたつバイク',     art:'veh_scooter',      emoji:'🛵', price:120,  lv:2, traffic:2, income:3},
  {id:'kei',       type:'veh', name:'けいトラ',           art:'veh_kei',          emoji:'🛻', price:150,  lv:2, traffic:2, income:2},
  {id:'sedan',     type:'veh', name:'じょうよう車',       art:'veh_sedan',        emoji:'🚗', price:250,  lv:3, traffic:3},
  {id:'crossover', type:'veh', name:'ミニSUV',            art:'veh_crossover',    emoji:'🚙', price:350,  lv:3, traffic:4, pop:0.02},
  {id:'taxi',      type:'veh', name:'タクシー',           art:'veh_taxi',         emoji:'🚕', price:300,  lv:3, traffic:3, income:6},
  {id:'tractor',   type:'veh', name:'トラクター',         art:'veh_tractor',      emoji:'🚜', price:300,  lv:3, traffic:2, income:5},
  {id:'bus',       type:'veh', name:'バス',               art:'veh_bus',          emoji:'🚌', price:500,  lv:4, traffic:6},
  {id:'mail',      type:'veh', name:'ゆうびん車',         art:'veh_mail',         emoji:'📮', price:400,  lv:4, traffic:3, income:4},
  {id:'garbage',   type:'veh', name:'ごみ しゅうしゅう車', art:'veh_garbage',     emoji:'🚛', price:400,  lv:4, traffic:3, dev:10},
  {id:'truck',     type:'veh', name:'トラック',           art:'veh_truck',        emoji:'🚚', price:450,  lv:4, traffic:4, income:6},
  {id:'icecream',  type:'veh', name:'アイスクリーム車',   art:'veh_icecream',     emoji:'🍦', price:500,  lv:5, traffic:3, pop:0.03},
  {id:'foodtruck', type:'veh', name:'キッチンカー',       art:'veh_foodtruck',    emoji:'🍔', price:550,  lv:5, traffic:3, income:10},
  {id:'fire',      type:'veh', name:'しょうぼう車',       art:'veh_fire',         emoji:'🚒', price:600,  lv:5, traffic:4, dev:15},
  {id:'ambulance', type:'veh', name:'きゅうきゅう車',     art:'veh_ambulance',    emoji:'🚑', price:600,  lv:5, traffic:4, dev:15},
  {id:'police',    type:'veh', name:'パトカー',           art:'veh_police',       emoji:'🚓', price:600,  lv:5, traffic:4, dev:15},
  {id:'schoolbus', type:'veh', name:'スクールバス',       art:'veh_schoolbus',    emoji:'🚌', price:650,  lv:5, traffic:5, know:0.03},
  {id:'camper',    type:'veh', name:'キャンピングカー',   art:'veh_camper',       emoji:'🚐', price:700,  lv:6, traffic:4, pop:0.03},
  {id:'ev',        type:'veh', name:'でんき自動車',       art:'veh_ev',           emoji:'🔋', price:700,  lv:6, traffic:5},
  {id:'mixer',     type:'veh', name:'ミキサー車',         art:'veh_mixer',        emoji:'🏗️', price:750,  lv:6, traffic:4, dev:20},
  {id:'crane',     type:'veh', name:'クレーン車',         art:'veh_crane',        emoji:'🏗️', price:800,  lv:6, traffic:4, dev:25},
  {id:'excavator', type:'veh', name:'ショベルカー',       art:'veh_excavator',    emoji:'🚧', price:800,  lv:6, traffic:4, dev:25},
  {id:'rally',     type:'veh', name:'ラリーカー',         art:'veh_rally',        emoji:'🏁', price:1500, lv:6, traffic:8, pop:0.04, special:1, req:{has:{parking:1}, veh:['sports']}},
  {id:'sports',    type:'veh', name:'スポーツカー',       art:'veh_sports',       emoji:'🏎️', price:1200, lv:7, traffic:6, pop:0.04},
  {id:'doubledecker', type:'veh', name:'2かいだてバス',   art:'veh_doubledecker', emoji:'🚌', price:1300, lv:7, traffic:10, pop:0.03},
  {id:'limo',      type:'veh', name:'リムジン',           art:'veh_limo',         emoji:'🚘', price:2000, lv:8, traffic:6, income:15, pop:0.05, special:1, req:{has:{hotel:1}}},
  /* ---- 電車（えきが ひつよう） ---- */
  {id:'steam',     type:'train', name:'SL（じょうき きかんしゃ）', art:'trn_steam', emoji:'🚂', price:1000,  lv:4,  traffic:15, pop:0.03},
  {id:'local',     type:'train', name:'ローカル線',        art:'trn_local',      emoji:'🚃', price:1200,  lv:5,  traffic:20},
  {id:'tram',      type:'train', name:'ろめん電車',        art:'trn_tram',       emoji:'🚋', price:1500,  lv:6,  traffic:18, income:10},
  {id:'freight',   type:'train', name:'かもつ列車',        art:'trn_freight',    emoji:'🚂', price:2000,  lv:7,  traffic:25, income:30},
  {id:'express',   type:'train', name:'とっきゅう',        art:'trn_express',    emoji:'🚄', price:3000,  lv:8,  traffic:35, income:20},
  {id:'shinkansen',type:'train', name:'新かんせん',        art:'trn_shinkansen', emoji:'🚅', price:5000,  lv:9,  traffic:50, pop:0.08},
  {id:'linear',    type:'train', name:'リニアモーターカー', art:'trn_linear',    emoji:'🚄', price:12000, lv:12, traffic:80, pop:0.06, special:1, req:{has:{bigstation:1}, trains:['shinkansen']}}
];
let TOWN_RULES = {
  harvestMinQ:5, resDev:5, workRate:0.01, bizRate:0.02, knowRate:0.004, knowCap:0.5, popRate:0.03,
  maxStar:5, starRate:0.25, levelGift:'letter', driveRate:0.01, trafficDev:1, roadPerVeh:5,
  zukanPt:20, zukanCompletePt:300
};
const NAMES = ['モモ','ソラ','ハル','コタ','ミミ','ポン','チャチャ','ルル','ココ','ムギ','キキ','ナナ','タロ','ハナ','リン','ポポ','マル','ユキ','レオ','ニコ',
  'サクラ','フク','ピノ','モカ','ラテ','クー','トト','メイ','ゴン','ププ','アズキ','キナコ','ダイズ','ミント','ペコ','コロ','ベル','ルナ','テン','ショコラ',
  'マロン','クルミ','チョコ','ミルク','ソーダ','ハッカ','ノノ','リリ','ポテト','ワサビ','シロ','クロ','ハチ','ゴマ','アメ','ユズ','カボス','タビ','モチ','オハギ'];

/* ---------- 拡張データ（開発者向け） ---------- */
const TOWN_CFG_KEY = 'manabiTown.townConfig.v1';
function mergeById(base, add){ const m = new Map(base.map(x=>[x.id,x])); (add||[]).forEach(x => { if(x && x.id) m.set(x.id, Object.assign({}, m.get(x.id)||{}, x)); }); return [...m.values()]; }
function applyTownConfig(cfg){
  if(!cfg) return;
  if(Array.isArray(cfg.levels) && cfg.levels.length) TOWN_LEVELS = cfg.levels.map((l,i) => Object.assign({}, TOWN_LEVELS[i] || TOWN_LEVELS[TOWN_LEVELS.length-1], l));
  if(Array.isArray(cfg.items)) TOWN_ITEMS = mergeById(TOWN_ITEMS, cfg.items);
  if(Array.isArray(cfg.species)) SPECIES = mergeById(SPECIES, cfg.species);
  if(cfg.homeTypes) HOME_TYPES = Object.assign({}, HOME_TYPES, cfg.homeTypes);
  if(cfg.rules) TOWN_RULES = Object.assign({}, TOWN_RULES, cfg.rules);
}
try{ applyTownConfig(JSON.parse(localStorage.getItem(TOWN_CFG_KEY) || 'null')); }catch(e){}
const ITEM = id => TOWN_ITEMS.find(i => i.id===id);
const SP = id => SPECIES.find(s => s.id===id) || SPECIES[0];
function picHTML(o, cls=''){
  if(o && isRoadId(o.id)) return `<span class="roadIcon rt-${o.id} ${cls}"></span>`;
  const src = o.img || artSrc(o.art);
  return src ? `<img class="${cls}" src="${esc(src)}" alt="">` : `<span class="emo ${cls}">${o.emoji||'❓'}</span>`;
}
const homeName = h => h==='any' ? 'だれでも' : (HOME_TYPES[h]?.n || h);

/* =====================================================================
   まちのデータ
   ===================================================================== */
function ensureTown(){
  let t = save.town;
  if(!t || !t.ver){
    t = save.town = {ver:2, lv:0, cells:{}, inv:{}, bag:{letter:1, goldletter:0, ticket:0, rankbook:0}, res:[], veh:[], trains:[], harvest:'', seq:0};
    [['tree',0,0],['house',1,1],['house',3,1],['tree',5,0],['road',0,2],['road',1,2],['road',2,2],['road',3,2],['road',4,2],['field',5,3],['flower',2,3],['tree',0,3]]
      .forEach(([id,x,y]) => t.cells[`${x},${y}`] = id);
    const used = new Set(); let guard = 0;
    while(t.res.length < 3 && guard++ < 200){
      const sp = pickSpecies({maxRar:1, homeOnly:'house'}); if(!sp || used.has(sp.id)) continue;
      used.add(sp.id); const r = newResident(sp); r.home = findHome(sp).key; t.res.push(r);
    }
    persist();
  }
  t.veh = t.veh || []; t.trains = t.trains || []; t.inv = t.inv || {}; t.bag = t.bag || {};
  if(t.ver < 2){   // v0.4 までの まち：住民に 家を わりあてる
    t.ver = 2; t.res.forEach(r => r.home = null);
    const need = {};
    t.res.forEach(r => { const h = findHome(SP(r.sp)); if(h) r.home = h.key; else { const ht = SP(r.sp).home; need[ht] = (need[ht]||0) + 1; } });
    Object.entries(need).forEach(([ht, n]) => { const it = ITEM(HOME_TYPES[ht]?.item); if(it) t.inv[it.id] = (t.inv[it.id]||0) + Math.ceil(n/(it.cap||1)); });
    t.migrated = Object.keys(need).length ? Date.now() : 0;
    persist();
  }
  zukanSync();
}
function pickSpecies(o={}){
  const t = save.town, tot = t && t.res ? townTotals() : {pop:0};
  const ipop = t && t.cells ? townCalc().pop : 0;
  const pool = SPECIES.filter(s => (s.w||0) > 0 && (s.rar||1) >= (o.minRar||1) && (s.rar||1) <= (o.maxRar||9)
    && (!o.homeOnly || s.home===o.homeOnly) && (!o.needHome || findHome(s)));
  if(!pool.length) return null;
  const wt = s => (s.w||1) * ((s.rar||1)>=2 ? (1 + (tot.pop||0)*TOWN_RULES.popRate + ipop) * (o.boost||1) : 1);
  let r = Math.random() * pool.reduce((a,s)=>a+wt(s),0);
  for(const s of pool){ r -= wt(s); if(r<=0) return s; }
  return pool[pool.length-1];
}
function newResident(sp){
  const t = save.town, ab = {};
  ABILITIES.forEach(a => { const v = rint(1,4) + (sp.bias===a.id ? 4 : sp.bias==='all' ? 3 : 0) + ((sp.rar||1)-1); ab[a.id] = clamp(v,1,10); });
  const usedN = new Set((t?.res||[]).map(x=>x.name));
  const names = NAMES.filter(n => !usedN.has(n));
  const name = names.length ? names[Math.random()*names.length|0] : NAMES[Math.random()*NAMES.length|0] + (Math.random()*90+10|0);
  if(t) t.seq = (t.seq||0) + 1;
  return {id:'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), sp:sp.id, name, star:Math.max(1,(sp.rar||1)-1), ab, at:Date.now(), home:null};
}
/* ---------- 家 ---------- */
function homeCells(){
  const t = save.town, out = [];
  Object.entries(t.cells).forEach(([key,id]) => { const it = ITEM(id); if(it && it.home && it.cap) out.push({key, it, used:t.res.filter(r=>r.home===key).length}); });
  return out;
}
function findHome(sp, except){
  const hs = homeCells().filter(h => h.used < h.it.cap && h.key!==except);
  return hs.find(h => h.it.home===sp.home) || hs.find(h => h.it.home==='any') || null;
}
function rehouse(){
  let n = 0;
  save.town.res.forEach(r => { if(!r.home || !save.town.cells[r.home]){ r.home = null; const h = findHome(SP(r.sp)); if(h){ r.home = h.key; n++; } } });
  return n;
}
const homeless = () => save.town.res.filter(r => !r.home);
/* ---------- 計算 ---------- */
const effAb = (r,k) => (r.ab[k]||0) * (1 + TOWN_RULES.starRate*(r.star-1));
function townTotals(){ const tot = {}; ABILITIES.forEach(a => tot[a.id] = 0); (save.town?.res||[]).forEach(r => ABILITIES.forEach(a => tot[a.id] += effAb(r,a.id))); return tot; }
function townCalc(){
  const t = save.town, tot = townTotals(), R = TOWN_RULES;
  let base=0, income=0, cap=0, know=0, count=0, park=0, stn=0, pop=0, rawTr=0, roads=0;
  const add = it => { base += it.dev||0; income += it.income||0; know += it.know||0; pop += it.pop||0; rawTr += it.traffic||0; };
  Object.values(t.cells).forEach(id => { const it = ITEM(id); if(!it) return; count++; add(it); cap += it.cap||0; park += it.park||0; stn += it.station||0; if(isRoadId(id)) roads++; });
  (t.veh||[]).concat(t.trains||[]).forEach(id => { const it = ITEM(id); if(it) add(it); });
  const traffic = Math.round(rawTr * (1 + tot.drive*R.driveRate));
  const dev = Math.round(base*(1 + tot.work*R.workRate)) + t.res.length*R.resDev + Math.round(traffic*R.trafficDev);
  const L = TOWN_LEVELS[Math.min(t.lv, TOWN_LEVELS.length-1)];
  return {tot, dev, cap, count, income, traffic, pop, roads,
    knowRate: Math.min(R.knowCap, tot.know*R.knowRate + know),
    harvest: Math.round(income*(1 + tot.biz*R.bizRate)),
    maxRes: L.maxRes, vehCap: (L.maxVeh||2) + park + Math.floor(roads/(R.roadPerVeh||5)), trainCap: stn, L};
}
function townKnowRate(){ try{ return save.town ? Math.min(TOWN_RULES.knowCap, townCalc().knowRate + (save.myhome ? homeKnow() : 0)) : 0; }catch(e){ return 0; } }
function nextLevel(){ return TOWN_LEVELS[save.town.lv+1] || null; }
function canLevelUp(){ const n = nextLevel(); if(!n) return false; const c = townCalc(); return save.points.earned >= n.earned && c.dev >= n.dev && c.traffic >= (n.traffic||0); }
const priceOf = it => (it.price||0) + (it.priceStep||0) * (save.town?.res.length||0);
const placedCount = id => Object.values(save.town.cells).filter(x => x===id).length;
function reqList(it){
  const R = it.req, t = save.town, out = []; if(!R) return out;
  Object.entries(R.has||{}).forEach(([id,n]) => { const c = placedCount(id); out.push({t:`${ITEM(id)?.name||id}が ${n}つ`, ok:c>=n, p:`${Math.min(c,n)}/${n}`}); });
  if(R.res) out.push({t:`じゅうみん ${R.res}人`, ok:t.res.length>=R.res, p:`${Math.min(t.res.length,R.res)}/${R.res}`});
  if(R.species){ const n = new Set(t.res.map(r=>r.sp)).size; out.push({t:`ちがう どうぶつ ${R.species}しゅるい`, ok:n>=R.species, p:`${Math.min(n,R.species)}/${R.species}`}); }
  if(R.know){ const k = Math.round(townTotals().know); out.push({t:`じゅうみんの ちしき ごうけい ${R.know}`, ok:k>=R.know, p:`${Math.min(k,R.know)}/${R.know}`}); }
  if(R.traffic){ const k = townCalc().traffic; out.push({t:`こうつう ${R.traffic}`, ok:k>=R.traffic, p:`${Math.min(k,R.traffic)}/${R.traffic}`}); }
  (R.trains||[]).forEach(id => out.push({t:`${ITEM(id)?.name||id}を もっている`, ok:(t.trains||[]).includes(id)}));
  (R.veh||[]).forEach(id => out.push({t:`${ITEM(id)?.name||id}を もっている`, ok:(t.veh||[]).includes(id)}));
  return out;
}
const reqOk = it => reqList(it).every(r => r.ok);

/* ---------- ダイアログ ---------- */
function dialog(html, buttons=[{label:'OK', cls:'', v:true}], cls=''){
  return new Promise(res => {
    $('#dlgBody').innerHTML = html;
    $('#dlgCard').className = 'card dlgCard ' + cls;
    $('#dlgBtns').innerHTML = buttons.map((b,i) => `<button class="btn ${b.cls||''}" data-i="${i}">${b.label}</button>`).join('');
    $('#dlg').classList.add('show');
    $('#dlgBtns').onclick = e => { const b = e.target.closest('button'); if(!b) return; $('#dlg').classList.remove('show'); res(buttons[+b.dataset.i].v); };
  });
}

/* =====================================================================
   まち画面
   ===================================================================== */
let townEdit = false, hand = null;
function bar(v, max, cls=''){ const p = max ? clamp(v/max*100,0,100) : 100; return `<div class="tbar ${cls}"><i style="width:${p}%"></i></div>`; }
function renderTown(){
  ensureTown();
  const t = save.town, c = townCalc(), n = nextLevel(), L = c.L;
  const td = save.days[dayKey()] || {n:0};
  let prog;
  if(n){
    prog = `<div class="tprog"><span>つぎの「${esc(n.name)}」まで</span>
      <div class="pr"><b>📚 勉強ポイント</b>${bar(save.points.earned, n.earned)}<em>${nf(Math.min(save.points.earned,n.earned))} / ${nf(n.earned)}</em></div>
      <div class="pr"><b>🏗️ 発展度</b>${bar(c.dev, n.dev, 'g')}<em>${nf(Math.min(c.dev,n.dev))} / ${nf(n.dev)}</em></div>
      ${n.traffic ? `<div class="pr"><b>🚗 こうつう</b>${bar(c.traffic, n.traffic, 'o')}<em>${nf(Math.min(c.traffic,n.traffic))} / ${nf(n.traffic)}</em></div>` : ''}</div>`;
  } else prog = `<div class="tprog"><span>いまの さいこう レベル！ これからの アップデートを おたのしみに</span></div>`;
  $('#townHead').innerHTML = `<div class="lvBadge"><small>Lv</small><b>${t.lv+1}</b></div>
    <div class="tInfo"><div class="tName">${esc(L.name)} <small class="tSize">${L.cols}×${L.rows}マス</small></div>${prog}</div>
    ${canLevelUp() ? `<button class="btn gold lvUpBtn" id="btnLvUp">⬆ レベルアップ！</button>` : ''}`;
  $('#townStats').innerHTML = [
    ['🐾','じゅうみん',`${t.res.length} / ${c.maxRes}`], ['🏗️','発展度',nf(c.dev)],
    ['🚗','こうつう',nf(c.traffic)], ['🚙','のりもの',`${t.veh.length} / ${c.vehCap}`],
    ['📘','ちしき ボーナス',`+${Math.round(c.knowRate*100)}%`], ['💰','うりあげ',`${c.harvest}pt/日`]
  ].map(([i,l,v]) => `<div class="tstat"><span>${i} ${l}</span><b>${v}</b></div>`).join('');
  const hb = $('#btnHarvest');
  if(!c.income){ hb.disabled = true; hb.innerHTML = '🎁 お店を たてると うりあげが もらえる'; }
  else if(t.harvest===dayKey()){ hb.disabled = true; hb.innerHTML = '🎁 きょうの うりあげは うけとったよ'; }
  else if(td.n < TOWN_RULES.harvestMinQ){ hb.disabled = true; hb.innerHTML = `🎁 あと ${TOWN_RULES.harvestMinQ-td.n}問 勉強すると うりあげ +${c.harvest}pt`; }
  else { hb.disabled = false; hb.innerHTML = `🎁 うりあげを うけとる +${c.harvest}pt`; }
  $('#btnEdit').textContent = townEdit ? '✔ もようがえ おわり' : '🛠 もようがえ';
  $('#btnEdit').classList.toggle('pink', townEdit);
  renderMap(); renderTray();
  const lb = $('#btnLvUp'); if(lb) lb.onclick = doLevelUp;
  if(t.migrated){ t.migrated = 0; persist();
    setTimeout(() => dialog(`<div class="dlgArt">${picHTML({art:'bird_think',emoji:'🏠'})}</div><h2 class="dlgT">あたらしい おうちが とどいたよ</h2>
      <p class="dlgP">どうぶつごとに すむ 家が かわったよ！<br>「もようがえ」の もちものに 家が 入っているので、まちに おいてあげてね。</p>`), 300); }
}
function cellSize(){ return cellSizeFixed(); }
function roadHTML_v6(x, y){
  const c = save.town.cells, isR = (a,b) => c[`${a},${b}`]==='road';
  const n = isR(x,y-1), s = isR(x,y+1), w = isR(x-1,y), e = isR(x+1,y);
  let h = '<div class="rd"><i class="c"></i>' + (n?'<i class="n"></i>':'') + (s?'<i class="s"></i>':'') + (w?'<i class="w"></i>':'') + (e?'<i class="e"></i>':'');
  const horiz = (w||e) && !(n||s), vert = (n||s) && !(w||e), zebra = ((x*7 + y*3) % 4) === 0;
  if(horiz) h += zebra ? '<i class="zh"></i>' : `<i class="lnh" style="--l:${w?0:'22%'};--r:${e?0:'22%'}"></i>`;
  else if(vert) h += zebra ? '<i class="zv"></i>' : `<i class="lnv" style="--t:${n?0:'22%'};--b:${s?0:'22%'}"></i>`;
  return h + '</div>';
}
function renderMap(){
  const t = save.town, c0 = townCalc(), L = c0.L, cs = cellSize(), map = $('#townMap');
  Object.keys(t.cells).forEach(k => { const [x,y] = k.split(',').map(Number); if(x>=L.cols || y>=L.rows){ t.inv[t.cells[k]] = (t.inv[t.cells[k]]||0)+1; delete t.cells[k]; t.res.forEach(r => { if(r.home===k) r.home = null; }); persist(); } });
  $('#townWorld').style.width = (L.cols*cs) + 'px';
  renderStrips(cs, c0);
  map.style.setProperty('--cell', cs+'px');
  map.style.gridTemplateColumns = `repeat(${L.cols}, ${cs}px)`;
  map.classList.toggle('edit', townEdit);
  const occ = {}; t.res.forEach(r => { if(r.home) occ[r.home] = (occ[r.home]||0) + 1; });
  let h = '';
  for(let y=0;y<L.rows;y++) for(let x=0;x<L.cols;x++){
    const key = `${x},${y}`, id = t.cells[key], it = id && ITEM(id);
    const inner = !it ? '' : isRoadId(id) ? roadHTML(x,y) : (it.home ? stubHTML(key) : '') + picHTML(it,'bimg') + (it.cap && townEdit ? `<span class="homeTag">${occ[key]||0}/${it.cap}</span>` : '');
    h += `<div class="cell ${it?'has':''} ${isRoadId(id)?'road':''}" data-x="${x}" data-y="${y}" style="--cx:${x};--cy:${y};z-index:${isRoadId(id)?1:y*10+2}">${inner}</div>`;
  }
  map.innerHTML = h;
  buildWalkers(cs, L);
}

/* =====================================================================
   住民の うごき（たてものの となりで いろいろな ことを する）
   ===================================================================== */
const ACTS = {
  water:{h:'can', cls:'water'}, farm:{h:'🥕', cls:'work'}, rest:{h:'🍃'}, read:{h:'📖'}, study:{h:'✏️'}, look:{h:'✨'},
  star:{h:'🔭'}, bread:{h:'🍞'}, shop:{h:'🛍️'}, play:{h:'🎵', cls:'jump'}, zoo:{h:'🦒'}, fish:{h:'🐟'}, fishing:{h:'🎣'},
  splash:{h:'💧', cls:'jump'}, mail:{h:'✉️'}, clinic:{h:'🩹'}, train:{h:'🎫'}, work:{h:'💼', cls:'work'}, trip:{h:'🧳'},
  king:{h:'👑', cls:'jump'}, home:{h:'💤', cls:'sleep'}, chat:{h:'💬'}, love:{h:'💕'}, wave:{h:'👋'}, fly:{h:'🚁'}, music:{h:'🎶', cls:'jump'}
};
ACTS.visit = {h:'🚪', cls:'jump'};
const ACT_OF = {flower:'water', field:'farm', windmill:'farm', tree:'rest', lamp:'rest', bench:'read', library:'read', school:'study',
  museum:'look', tower:'look', landmark:'look', observatory:'star', space:'star', bakery:'bread', market:'shop', dept:'shop',
  park:'play', ferris:'play', stadium:'music', zoo:'zoo', aquarium:'fish', pond:'fishing', harbor:'fishing', fountain:'splash', well:'splash',
  post:'mail', clinic:'clinic', station:'train', bigstation:'train', office:'work', cityhall:'work', hotel:'trip', airport:'trip',
  castle:'king', heliport:'fly', parking:'wave'};
const WK = {st:new Map(), timer:null, cs:60, L:null};
function isWalk(x, y){ const L = WK.L; if(x<0||y<0||x>=L.cols||y>=L.rows) return false; const id = save.town.cells[`${x},${y}`]; return !id || isRoadId(id); }
function bfs(sx, sy, goal){
  const L = WK.L, key = (x,y) => y*L.cols+x, prev = new Map([[key(sx,sy), -1]]), q = [[sx,sy]];
  if(goal(sx,sy)) return [];
  while(q.length){
    const [x,y] = q.shift();
    for(const [dx,dy] of shuffle([[1,0],[-1,0],[0,1],[0,-1]])){
      const nx = x+dx, ny = y+dy, k = key(nx,ny);
      if(prev.has(k) || !isWalk(nx,ny) || railBlock(x,y,nx,ny)) continue;
      prev.set(k, key(x,y));
      if(goal(nx,ny)){ const path = []; let c = k; while(c !== key(sx,sy)){ path.unshift([c%L.cols, Math.floor(c/L.cols)]); c = prev.get(c); } return path; }
      q.push([nx,ny]);
    }
  }
  return null;
}
function walkPos(s){
  const cs = WK.cs, W = cs*0.62;
  return {left: s.x*cs + (cs-W)/2 + s.jx*cs, top: s.y*cs + cs - W*1.12 - 2, z: (s.zy ?? s.y)*10 + 5};
}
function buildWalkers(cs, L){
  WK.cs = cs; WK.L = L;
  const map = $('#townMap'), t = save.town, ids = new Set(t.res.map(r=>r.id));
  [...WK.st.keys()].forEach(k => { if(!ids.has(k)) WK.st.delete(k); });
  const free = []; for(let y=0;y<L.rows;y++) for(let x=0;x<L.cols;x++) if(isWalk(x,y)) free.push([x,y]);
  t.res.forEach(r => {
    let s = WK.st.get(r.id);
    if(!s || !isWalk(s.x, s.y)){
      let p = null;
      if(r.home && r.home!=='me'){ const [hx,hy] = r.home.split(',').map(Number); p = [[hx,hy+1],[hx-1,hy],[hx+1,hy],[hx,hy-1]].find(([x,y]) => isWalk(x,y)); }
      if(!p && free.length) p = free[Math.random()*free.length|0];
      if(!p) p = [0,0];
      s = {x:p[0], y:p[1], path:[], act:null, left:0, pend:null, jx:(Math.random()-.5)*0.2, flip:false, wait:rint(0,3)};
      WK.st.set(r.id, s);
    }
    s.path = []; s.pend = null;
    const el = document.createElement('button'); el.className = 'walker'; el.dataset.id = r.id;
    el.style.width = Math.round(cs*0.62) + 'px';
    el.innerHTML = `${resPic(r,'wimg')}<span class="wname">${esc(r.name)}</span><span class="wact hidden"></span>`;
    map.appendChild(el); s.el = el; place(s, true);
    if(s.act) showAct(s, s.act);
    if(r.id===ghosted()){ el.classList.add('ghosted'); el.insertAdjacentHTML('beforeend', `<img class="gh" src="${esc(artSrc('x_ghost'))}" alt="">`); }
  });
  buildCars(cs);
  startWalk();
}
function place(s, instant){
  const p = walkPos(s), el = s.el; if(!el) return;
  if(instant) el.style.transition = 'none';
  el.style.left = p.left + 'px'; el.style.top = p.top + 'px'; el.style.zIndex = p.z;
  el.querySelector('.wimg')?.classList.toggle('flip', s.flip);
  el.classList.toggle('onroad', isRoadId(save.town.cells[`${s.x},${s.y}`]));
  if(instant){ void el.offsetWidth; el.style.transition = ''; }
}
function showAct(s, a){
  const A = ACTS[a] || ACTS.wave, el = s.el; if(!el) return;
  const b = el.querySelector('.wact');
  const art = A.h==='can' ? '' : artSrc('act_'+a);
  b.innerHTML = A.h==='can' ? `<img src="${esc(artSrc('prop_can'))}" alt=""><span class="drop">💧</span>` : art ? `<img class="actImg" src="${esc(art)}" alt="">` : A.h;
  b.classList.toggle('pic', !!art || A.h==='can');
  b.classList.remove('hidden');
  el.className = 'walker' + (A.cls ? ' act-'+A.cls : '');
}
function clearAct(s){ s.act = null; if(!s.el) return; s.el.querySelector('.wact').classList.add('hidden'); s.el.className = 'walker'; }
function chooseGoal(s, r){
  if(Math.random() < 0.2){ const fh = friendHomes(r); if(fh.length){ const k = choice(fh), [bx,by] = k.split(',').map(Number);
    const path = bfs(s.x, s.y, (x,y) => Math.abs(x-bx)+Math.abs(y-by)===1); if(path){ s.path = path; s.pend = {a:'visit', fx:bx}; return; } } }
  const t = save.town, L = WK.L, roll = Math.random();
  if(roll < 0.62){
    const targets = Object.entries(t.cells).filter(([k,id]) => ACT_OF[id] || (k===r.home));
    if(targets.length){
      const [k,id] = targets[Math.random()*targets.length|0], [bx,by] = k.split(',').map(Number);
      const path = bfs(s.x, s.y, (x,y) => Math.abs(x-bx)+Math.abs(y-by)===1);
      if(path){ s.path = path; s.pend = {a: k===r.home ? 'home' : ACT_OF[id], fx:bx}; return; }
    }
  }
  if(roll < 0.88){
    const gx = rint(0, L.cols-1), gy = rint(0, L.rows-1);
    const path = bfs(s.x, s.y, (x,y) => x===gx && y===gy) || bfs(s.x, s.y, (x,y) => Math.abs(x-s.x)+Math.abs(y-s.y)>=2);
    if(path && path.length){ s.path = path.slice(0, 8); return; }
  }
  for(const [, s2] of WK.st){ if(s2!==s && !s2.act && !s2.path.length && Math.abs(s2.x-s.x)+Math.abs(s2.y-s.y)<=1){
    const a = Math.random()<0.5 ? 'chat' : 'love'; s.act = a; s.left = 4; showAct(s, a); s2.act = a; s2.left = 4; showAct(s2, a); return; } }
  s.act = 'wave'; s.left = 2; showAct(s, 'wave');
}
function walkTick(){
  if(curScreen!=='town' || document.hidden || townEdit || $('#dlg').classList.contains('show')) return;
  moveCars();
  const t = save.town;
  t.res.forEach(r => {
    const s = WK.st.get(r.id); if(!s || !s.el) return;
    if(r.id===ghosted()) return;
    if(s.wait > 0){ s.wait--; return; }
    if(s.act){ if(--s.left <= 0){ clearAct(s); s.wait = rint(0,2); } return; }
    if(s.path.length){
      const [nx,ny] = s.path.shift();
      if(!isWalk(nx,ny)){ s.path = []; return; }
      const wasRoad = isRoadId(t.cells[`${s.x},${s.y}`]), toRoad = isRoadId(t.cells[`${nx},${ny}`]);
      s.zy = Math.max(s.y, ny); const mv = s.mv = (s.mv||0)+1; setTimeout(() => { if(s.mv===mv){ s.zy = null; if(s.el) s.el.style.zIndex = s.y*10+5; } }, 720);
      if(nx !== s.x) s.flip = nx < s.x;
      s.x = nx; s.y = ny; s.el.classList.add('moving'); place(s);
      const b = s.el.querySelector('.wact');
      if(toRoad && !wasRoad && Math.random()<0.7){ b.textContent = '🚸'; b.classList.remove('hidden'); }
      else if(!s.act) b.classList.add('hidden');
      if(!s.path.length){
        s.el.classList.remove('moving');
        if(s.pend){ if(s.pend.fx !== s.x) s.flip = s.pend.fx < s.x; place(s); s.act = s.pend.a; s.left = rint(4,7); showAct(s, s.act); s.pend = null; }
        else s.wait = rint(1,3);
      }
      return;
    }
    s.el.classList.remove('moving');
    chooseGoal(s, r);
  });
}
function startWalk(){ stopWalk(); WK.timer = setInterval(walkTick, 700); }
function stopWalk(){ if(WK.timer){ clearInterval(WK.timer); WK.timer = null; } }

/* ---------- 乗り物・線路 ---------- */
function renderStrips(cs, c){
  const t = save.town;
  const rail = $('#railStrip'), showRail = c.trainCap > 0 || t.trains.length > 0;
  rail.classList.toggle('hidden', !showRail);
  rail.style.height = Math.round(cs*0.85) + 'px';
  rail.innerHTML = showRail ? `<div class="rails"></div>` + (t.trains.length
    ? t.trains.map((id,i) => { const it = ITEM(id); if(!it) return ''; const d = 18 + (i%3)*4;
        return `<button class="mover train" data-id="${id}" style="height:${Math.round(cs*0.62)}px;animation-duration:${d}s;animation-delay:-${(i*d/Math.max(1,t.trains.length)+Math.random()*3).toFixed(1)}s">${picHTML(it)}</button>`; }).join('')
    : `<div class="stripHint">ショップの「てつどう」で 電車を かうと ここを はしるよ</div>`) : '';
  const road = $('#roadStrip'); road.style.height = Math.round(cs*0.95) + 'px'; road.classList.toggle('hidden', mapCarsOn());
  const vs = t.veh;
  road.innerHTML = `<div class="roadLine"></div>` + (vs.length
    ? vs.map((id,i) => { const it = ITEM(id); if(!it) return ''; const d = 11 + (i*7)%9, lane = i%2;
        const h = Math.round(cs*(id==='bicycle'||id==='scooter' ? 0.36 : 0.44));
        return `<button class="mover car lane${lane}" data-id="${id}" style="height:${h}px;animation-duration:${d}s;animation-delay:-${(i*d/vs.length+Math.random()*2).toFixed(1)}s">${picHTML(it)}</button>`; }).join('')
    : `<div class="stripHint">車を かって「みち」を 2マス いじょう おくと、まちの 中を はしるよ</div>`);
}
function moverTap(e){ const b = e.target.closest('.mover'); if(!b) return; const it = ITEM(b.dataset.id); if(it){ toast(`${it.name}：${itemEffect(it)}`); sound('tap'); } }
$('#railStrip').addEventListener('click', moverTap);
$('#roadStrip').addEventListener('click', moverTap);

/* ---------- もようがえ ---------- */
function renderTray(){
  const tray = $('#townTray'); tray.classList.toggle('hidden', !townEdit);
  if(!townEdit) return;
  const inv = save.town.inv, ids = Object.keys(inv).filter(k => inv[k] > 0 && ITEM(k));
  $('#trayItems').innerHTML = ids.length ? ids.map(id => { const it = ITEM(id);
    return `<button class="trayIt ${hand && hand.from==='inv' && hand.id===id ? 'on':''}" data-id="${id}">${picHTML(it)}<span>${esc(it.name)}</span><b>×${inv[id]}</b></button>`; }).join('')
    : `<div class="note" style="padding:10px">もちものは ないよ。ショップで かってね！</div>`;
  $('#trayHand').innerHTML = hand ? `<span class="hand">${picHTML(ITEM(hand.id))}</span> ${esc(ITEM(hand.id).name)}を もっているよ。あいている マスを タッチして おこう` :
    'おきたい ものを えらんで マスを タッチ。おいてある ものを タッチすると うごかせるよ';
  $('#btnStore').disabled = !hand;
}
$('#btnEdit').onclick = () => { if(townEdit) endEdit(); else { townEdit = true; renderTown(); } };
function endEdit(silent){
  const t = save.town;
  if(hand && hand.from==='map'){
    if(hand.key && !t.cells[hand.key]) t.cells[hand.key] = hand.id;
    else { t.inv[hand.id] = (t.inv[hand.id]||0)+1; t.res.forEach(r => { if(r.home===hand.key) r.home = null; }); }
  }
  hand = null; townEdit = false; rehouse(); persist(); if(!silent) renderTown();
}
$('#btnStore').onclick = () => {
  if(!hand) return; const t = save.town;
  if(hand.from==='map' && t.res.some(r => r.home===hand.key)){ toast('じゅうみんが すんでいるので しまえないよ'); return; }
  t.inv[hand.id] = (t.inv[hand.id]||0)+1; hand = null; persist(); renderTray();
};
$('#trayItems').addEventListener('click', e => {
  const b = e.target.closest('.trayIt'); if(!b) return;
  if(hand && hand.from==='map'){ toast('もっている ものを さきに おいてね'); return; }
  hand = (hand && hand.id===b.dataset.id) ? null : {id:b.dataset.id, from:'inv'};
  renderTray();
});
$('#townMap').addEventListener('click', e => {
  const w = e.target.closest('.walker');
  if(w && !townEdit){ if(w.dataset.id===ghosted()) ghostAlert(); else talkTo(w.dataset.id); return; }
  const c = e.target.closest('.cell'); if(!c) return;
  const t = save.town, key = `${c.dataset.x},${c.dataset.y}`, curId = t.cells[key];
  if(!townEdit){
    if(curId && ITEM(curId)?.home){ openHouse(key); return; }
    if(curId && !isRoadId(curId)){ openBuilding(key); return; }
    if(curId){ const it = ITEM(curId), who = t.res.filter(r => r.home===key).map(r => r.name);
      toast(`${it.name}：${itemEffect(it)}${who.length ? `（${who.join('・')}が すんでいる）` : ''}`); }
    else toast('「もようがえ」で たてものや みちを おけるよ');
    return;
  }
  if(hand){
    if(curId){ toast('あいている マスに おいてね'); return; }
    t.cells[key] = hand.id; sound('tap');
    if(hand.from==='map'){ if(t.glv && t.glv[hand.key]){ t.glv[key] = t.glv[hand.key]; delete t.glv[hand.key]; } t.res.forEach(r => { if(r.home===hand.key) r.home = key; }); hand = null; }
    else { t.inv[hand.id]--; if(t.inv[hand.id] <= 0){ delete t.inv[hand.id]; hand = null; } }
    const moved = rehouse(); if(moved) toast(`🏠 ${moved}人が あたらしい 家に すみはじめたよ！`);
    persist(); renderTown();
  } else if(curId){
    const it = ITEM(curId);
    if(it && it.park){ const c2 = townCalc(); if(c2.vehCap - it.park < t.veh.length){ toast('のりものを とめる ばしょが たりなくなるよ'); return; } }

    delete t.cells[key]; hand = {id:curId, from:'map', key}; persist(); renderTown();
  }
});
function itemEffect(it){
  if(it.type==='use') return it.desc || '';
  if(it.type==='fur') return `すてき度+${it.sty}` + (it.know ? `・ちしき +${Math.round(it.know*100)}%` : '');
  const a = [];
  if(it.home) a.push(it.home==='any' ? `だれでも ${it.cap}人 すめる` : `${it.cap}人 すめる`);
  if(it.traffic) a.push(`こうつう+${it.traffic}`);
  if(it.dev) a.push(`発展度+${it.dev}`);
  if(it.park) a.push(`のりもの+${it.park}台`);
  if(it.station) a.push(`電車が ${it.station}本 とまる`);
  if(it.income) a.push(`うりあげ ${it.income}pt/日`);
  if(it.know) a.push(`ちしき +${Math.round(it.know*100)}%`);
  if(it.pop) a.push(`レア住民 +${Math.round(it.pop*100)}%`);
  if(it.type==='train') a.push('えきが ひつよう');
  if(it.desc) a.push(it.desc);
  return a.join('・') || 'まちが かわいくなる';
}
const speciesFor = h => SPECIES.filter(s => s.home===h);

/* ---------- うりあげ・レベルアップ ---------- */
$('#btnHarvest').onclick = () => {
  const t = save.town, c = townCalc();
  if(t.harvest===dayKey() || !c.income) return;
  t.harvest = dayKey(); addPoints(c.harvest, 'お店の うりあげ'); sound('ok'); confetti(1000);
  toast(`🎁 うりあげ +${c.harvest}pt！`); renderTown();
};
async function doLevelUp(){
  if(!canLevelUp()) return;
  const t = save.town; t.lv++;
  const L = TOWN_LEVELS[t.lv], gift = ITEM(TOWN_RULES.levelGift);
  if(gift) t.bag[gift.id] = (t.bag[gift.id]||0) + 1;
  persist(); sound('fan'); confetti(2600);
  const unlocked = TOWN_ITEMS.filter(i => i.lv === t.lv+1);
  await dialog(`<div class="dlgArt big">${picHTML({art:'bird_jump',emoji:'🎉'})}</div>
    <h2 class="dlgT">レベルアップ！</h2><p class="dlgP">まちが「<b>${esc(L.name)}</b>」に なったよ！<br>まちが <b>${L.cols}×${L.rows}マス</b>に ひろがったよ！<br>じゅうみん ${L.maxRes}人・のりもの ${L.maxVeh||2}台まで ふえたよ！</p>
    ${unlocked.length ? `<div class="unl"><div>あたらしく かえるように なったもの</div>${unlocked.map(i=>`<span>${picHTML(i)}${esc(i.name)}</span>`).join('')}</div>` : ''}
    ${gift ? `<p class="dlgP">プレゼント：${esc(gift.name)} ×1</p>` : ''}`, [{label:'やったー！', cls:'gold', v:1}], 'gold');
  checkBadges(); renderTown();
}

/* =====================================================================
   ショップ
   ===================================================================== */
let shopTab = 'home';
function shopList(){
  if(shopTab==='fur') return FURNITURE;
  return TOWN_ITEMS.filter(i => shopTab==='use' ? i.type==='use' : shopTab==='veh' ? i.type==='veh'
    : shopTab==='rail' ? (i.type==='train' || (i.type==='bld' && i.cat==='rail')) : (i.type==='bld' && (i.cat||'bld')===shopTab));
}
function ownedCount(it){
  const t = save.town;
  if(it.type==='fur'){ const H = ensureHome(); return (H.inv[it.id]||0) + H.items.filter(i=>i.id===it.id).length; }
  return it.type==='use' ? (t.bag[it.id]||0) : it.type==='veh' ? t.veh.filter(x=>x===it.id).length : it.type==='train' ? t.trains.filter(x=>x===it.id).length
    : (t.inv[it.id]||0) + placedCount(it.id);
}
function renderShop_v7(){
  ensureTown();
  const t = save.town, c = townCalc();
  $$('#shopTabs button').forEach(b => b.classList.toggle('on', b.dataset.v===shopTab));
  $('#shopInfo').innerHTML = {
    veh:`🚙 のりもの ${t.veh.length} / ${c.vehCap}台 <small>（パーキング・みち${TOWN_RULES.roadPerVeh}マスごとに ふえるよ）</small>`,
    rail:`🚃 電車 ${t.trains.length} / ${c.trainCap}本 <small>（えきを おくと 電車が かえるよ）</small>`,
    home:`🏡 どうぶつに よって すむ 家が ちがうよ <small>（家が ないと じゅうみんは 来られない）</small>`,
    road:`🛣️ みちを つなげると じゅうみんが わたって あるくよ <small>（いま ${c.roads}マス）</small>`,
    fur:`🛋️ 家具は「わたしの家」に かざれるよ <small>（すてき度が 上がると おきゃくさんが 来やすい）</small>`,
    use:`💌 レターの ねだんは じゅうみんが ふえるほど 上がるよ <small>（いま ${t.res.length}人）</small>`}[shopTab] || '';
  $('#shopGrid').innerHTML = shopList().map(it => {
    const locked = (it.lv||1) > t.lv+1, price = priceOf(it), poor = save.points.bal < price;
    const reqs = reqList(it), rOk = reqs.every(r=>r.ok);
    const homeFor = it.home ? `<div class="homeFor">${it.home==='any' ? 'だれでも すめる' : spNames(it.home)}</div>` : '';
    const reqH = reqs.length ? `<div class="reqList">🔑 かう じょうけん${reqs.map(r => `<div class="${r.ok?'ok':'ng'}">${r.ok?'✅':'⬜'} ${esc(r.t)}${r.p&&!r.ok?`（${r.p}）`:''}</div>`).join('')}</div>` : '';
    const dis = locked || poor || !rOk;
    return `<div class="shopCard ${locked?'locked':''} ${it.special?'special':''}">
      <div class="sImg">${picHTML(it)}${locked ? `<div class="lock">🔒 Lv${it.lv}で かいほう</div>` : ''}</div>
      <div class="sName">${it.special?'⭐ ':''}${esc(it.name)}</div><div class="sEff">${esc(itemEffect(it))}</div>${homeFor}${reqH}
      <div class="sOwn">もっている：${ownedCount(it)}</div>
      <button class="btn ${dis?'white':'orange'} small" data-buy="${it.id}" ${dis?'disabled':''}><span class="coin sm">P</span> ${nf(price)}${it.cat==='road'?' /1マス':''}</button></div>`;
  }).join('');
}
$('#shopTabs').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; shopTab = b.dataset.v; renderShop(); });
$('#shopGrid').addEventListener('click', async e => {
  const b = e.target.closest('[data-buy]'); if(!b) return;
  const it = ITEM(b.dataset.buy) || FUR(b.dataset.buy), t = save.town, price = priceOf(it);
  if(!reqOk(it)){ toast('かう じょうけんが まだ そろっていないよ'); return; }
  if(save.points.bal < price){ toast('ポイントが たりないよ'); return; }
  if(!(await canHoldVehicle(it))) return;
  let qty = 1;
  if(it.cat==='road'){
    const opts = [1,5,10,20].filter(n => n*price <= save.points.bal);
    qty = await dialog(`<div class="dlgArt">${picHTML(it)}</div><h2 class="dlgT">${esc(it.name)}を かう</h2><p class="dlgP">1マス ${price}pt。なんマス かう？</p>`,
      opts.map(n => ({label:`${n}マス（${n*price}pt）`, cls:'orange', v:n})).concat([{label:'やめる', cls:'white', v:0}]));
    if(!qty) return;
  } else {
    const ok = await dialog(`<div class="dlgArt">${picHTML(it)}</div><h2 class="dlgT">${esc(it.name)}</h2><p class="dlgP">${esc(itemEffect(it))}</p>
      <p class="dlgP"><span class="coin sm">P</span> <b>${nf(price)}</b>pt で かいますか？<br><small>のこり ${nf(save.points.bal - price)}pt</small></p>`,
      [{label:'やめる', cls:'white', v:false}, {label:'かう！', cls:'orange', v:true}]);
    if(!ok) return;
  }
  addPoints(-price*qty, `${it.name}を かった${qty>1?` ×${qty}`:''}`); sound('ok');
  if(it.type==='use'){ t.bag[it.id] = (t.bag[it.id]||0)+1; persist(); toast(`${it.name}を かったよ！「じゅうみん」で つかえるよ`); renderShop(); return; }
  if(it.type==='fur'){
    const H = ensureHome(); H.inv[it.id] = (H.inv[it.id]||0)+1; persist(); renderShop(); checkBadges();
    const go = await dialog(`<div class="dlgArt">${picHTML(it)}</div><h2 class="dlgT">かったよ！</h2><p class="dlgP">さっそく わたしの家に おく？</p>`,
      [{label:'あとで', cls:'white', v:false}, {label:'家に おく', cls:'green', v:true}]);
    if(go){ homeEdit = true; homeTab = 'fur'; homeHand = {id:it.id, from:'inv'}; show('myhome'); }
    return;
  }
  if(it.type==='veh' || it.type==='train'){
    (it.type==='veh' ? t.veh : t.trains).push(it.id); persist(); discover(it.id); renderShop(); checkBadges();
    const go = await dialog(`<div class="dlgArt">${picHTML(it)}</div><h2 class="dlgT">かったよ！</h2><p class="dlgP">${esc(it.name)}が まちを はしるよ！<br><small>${esc(itemEffect(it))}</small></p>`,
      [{label:'ショップに もどる', cls:'white', v:false}, {label:'まちで 見る', cls:'green', v:true}]);
    if(go) show('town');
    return;
  }
  t.inv[it.id] = (t.inv[it.id]||0)+qty; persist(); discover(it.id); renderShop(); checkBadges();
  const go = await dialog(`<div class="dlgArt">${picHTML(it)}</div><h2 class="dlgT">かったよ！</h2><p class="dlgP">さっそく まちに おく？${it.cat==='road'?'<br><small>マスを つぎつぎ タッチすると つづけて おけるよ</small>':''}</p>`,
    [{label:'あとで', cls:'white', v:false}, {label:'まちに おく', cls:'green', v:true}]);
  if(go){ townEdit = true; hand = {id:it.id, from:'inv'}; show('town'); }
});
async function canHoldVehicle(it){
  if(it.type!=='veh' && it.type!=='train') return true;
  const t = save.town, c = townCalc();
  if(it.type==='veh' && t.veh.length >= c.vehCap){
    await dialog(`<div class="dlgArt">${picHTML(ITEM('parking')||{emoji:'🅿️'})}</div><h2 class="dlgT">ちゅうしゃじょうが いっぱい</h2>
      <p class="dlgP">いまは ${c.vehCap}台まで。<br>「パーキング」や「みち」を おくか、まちを レベルアップすると ふえるよ！</p>`); return false;
  }
  if(it.type==='train' && c.trainCap===0){
    await dialog(`<div class="dlgArt">${picHTML(ITEM('station')||{emoji:'🚉'})}</div><h2 class="dlgT">えきが ないよ</h2><p class="dlgP">電車を はしらせるには、さきに「えき」を かって まちに おこう！</p>`); return false;
  }
  if(it.type==='train' && t.trains.length >= c.trainCap){
    await dialog(`<div class="dlgArt">${picHTML(ITEM('station')||{emoji:'🚉'})}</div><h2 class="dlgT">えきが いっぱい</h2><p class="dlgP">いまは 電車 ${c.trainCap}本まで。えきを ふやすと もっと はしらせられるよ！</p>`); return false;
  }
  return true;
}

/* =====================================================================
   じゅうみん
   ===================================================================== */
const stars = n => '★'.repeat(n) + '<i>' + '★'.repeat(Math.max(0, TOWN_RULES.maxStar-n)) + '</i>';
function abBars(r){
  return ABILITIES.map(a => { const v = effAb(r,a.id); return `<div class="abRow"><span>${a.i} ${a.n}</span><div class="abBar"><i style="width:${clamp(v/15*100,4,100)}%"></i></div><b>${Math.round(v*10)/10}</b></div>`; }).join('');
}
function homeLabel(r){ if(!r.home) return '<div class="rHome none">🏚️ すむ 家が ないよ</div>'; const it = ITEM(save.town.cells[r.home]); return `<div class="rHome">🏠 ${esc(it?.name||'')}に すんでいる</div>`; }
function renderResidents(){
  ensureTown();
  const t = save.town, c = townCalc();
  $('#resHead').innerHTML = `<div class="tstat"><span>🐾 じゅうみん</span><b>${t.res.length} / ${c.maxRes}</b></div>` +
    ABILITIES.map(a => `<div class="tstat"><span>${a.i} ${a.n}</span><b>${Math.round(c.tot[a.id])}</b></div>`).join('');
  $('#resBag').innerHTML = ['letter','goldletter','ticket','rankbook'].map(id => { const it = ITEM(id); if(!it) return '';
    const n = t.bag[id]||0, usable = (id==='letter'||id==='goldletter') && n>0;
    return `<div class="bagIt">${picHTML(it)}<div><b>${esc(it.name)} ×${n}</b><small>${esc(it.desc||'')}</small></div>
      ${usable ? `<button class="btn small green" data-use="${id}">つかう</button>` : (id==='ticket'||id==='rankbook') && n ? '<small class="hint">じゅうみんを タッチして つかう</small>' : ''}</div>`; }).join('');
  const hl = homeless();
  $('#resHomeless').innerHTML = hl.length ? `<div class="homeless">🏚️ すむ 家を さがしている じゅうみんが いるよ：${hl.map(r => `${esc(r.name)}（${esc(SP(r.sp).name)}→${esc(homeName(SP(r.sp).home))}）`).join('、')}<br><small>ショップで 家を かうか、もちものの 家を「もようがえ」で おいてね。</small></div>` : '';
  $('#resGrid').innerHTML = t.res.map(r => { const s = SP(r.sp), R = RARITY[s.rar||1];
    return `<button class="resCard rk${R.k}" data-id="${r.id}" style="--rb:${R.bg}">
      <div class="rImg">${resPic(r)}</div><div class="rName">${esc(r.name)}</div>
      <div class="rSp">${esc(s.name)}・<span style="color:${R.c}">${R.n}</span></div><div class="stars">${stars(r.star)}</div>${homeLabel(r)}
      <div class="abMini">${abBars(r)}</div></button>`; }).join('');
}
$('#resGrid').addEventListener('click', e => { const b = e.target.closest('.resCard'); if(b) openResident(b.dataset.id); });
$('#resBag').addEventListener('click', e => { const b = e.target.closest('[data-use]'); if(b) inviteResident(b.dataset.use==='goldletter'); });
async function needHomeDialog(gold){
  const types = [...new Set(SPECIES.filter(s => (s.w||0)>0 && (!gold || (s.rar||1)>=2)).map(s => s.home))];
  await dialog(`<div class="dlgArt">${picHTML({art:'bird_think',emoji:'🏠'})}</div><h2 class="dlgT">すめる 家が いっぱい</h2>
    <p class="dlgP">あいている 家が ないので、だれも 来られないよ。<br>ショップで 家を かって まちに おこう！</p>
    <div class="homeList">${types.map(h => { const it = ITEM(HOME_TYPES[h]?.item); return it ? `<span>${picHTML(it)}${esc(it.name)}<small>${speciesFor(h).filter(s=>!gold||(s.rar||1)>=2).map(s=>s.name).join('・')}</small></span>` : ''; }).join('')}</div>`);
}
async function inviteResident(gold){
  const t = save.town, c = townCalc(), id = gold ? 'goldletter' : 'letter';
  if(!(t.bag[id] > 0)) return;
  if(t.res.length >= c.maxRes){
    await dialog(`<div class="dlgArt">${picHTML({art:'bird_think',emoji:'🏘️'})}</div><h2 class="dlgT">まちが いっぱい</h2><p class="dlgP">いまの まちには ${c.maxRes}人までしか すめないよ。<br>まちを レベルアップしよう！</p>`); return;
  }
  const sp = pickSpecies(gold ? {minRar:2, boost:3, needHome:true} : {needHome:true});
  if(!sp){ await needHomeDialog(gold); return; }
  t.bag[id]--;
  const r = newResident(sp); r.home = findHome(sp).key;
  t.res.push(r); persist(); discover(r.sp);
  await arrival(r); checkBadges(); renderCurrent();
}
async function arrival(r, title='あたらしい じゅうみんが やってきた！'){
  const s = SP(r.sp), R = RARITY[s.rar||1];
  sound((s.rar||1)>=3 ? 'fan' : 'ok'); confetti((s.rar||1)>=3 ? 2600 : 1400);
  await dialog(`<div class="arrBg rk${R.k}" style="--rb:${R.bg}"><div class="dlgArt big pop">${resPic(r)}</div></div>
    <div class="rarTag rt${R.k}" style="background:${R.c}">${R.n}</div><h2 class="dlgT">${title}</h2>
    <p class="dlgP"><b>${esc(s.name)}の「${esc(r.name)}」</b> <span class="stars">${stars(r.star)}</span><br><small>${esc(ITEM(save.town.cells[r.home])?.name||'')}に すむよ</small></p><div class="abList">${abBars(r)}</div>`,
    [{label:'よろしくね！', cls:'pink', v:1}]);
}
async function openResident(id){
  const t = save.town, r = t.res.find(x => x.id===id); if(!r) return;
  const s = SP(r.sp), R = RARITY[s.rar||1];
  const nb = t.bag.rankbook||0, nt = t.bag.ticket||0, maxed = r.star >= TOWN_RULES.maxStar;
  const v = await dialog(`<div class="arrBg rk${R.k}" style="--rb:${R.bg}"><div class="dlgArt big">${resPic(r)}</div></div>
    <div class="rarTag rt${R.k}" style="background:${R.c}">${R.n}</div><h2 class="dlgT">${esc(r.name)} <small>（${esc(s.name)}）</small></h2>
    <div class="stars big">${stars(r.star)}</div>${homeLabel(r)}<div class="abList">${abBars(r)}</div>
    ${skillHTML(s.id)}${persHTML(r)}<div class="abNote">すむ 家：${esc(homeName(s.home))}<br>${ABILITIES.map(a=>`${a.i}${a.n}：${a.d}`).join('<br>')}</div>`,
    [{label:'✏️ なまえ', cls:'white', v:'name'}, {label:`📘 ランクアップ（${nb}）`, cls: nb && !maxed ? 'orange' : 'white', v:'rank'},
     {label:`🎫 引っこし（${nt}）`, cls:'white', v:'move'}, {label:'とじる', cls:'', v:null}], 'wide');
  if(v==='name'){
    const n = prompt('あたらしい なまえ（10文字まで）', r.name);
    if(n && n.trim()){ r.name = n.trim().slice(0,10); persist(); renderCurrent(); }
  }else if(v==='rank'){
    if(maxed){ toast('もう さいこうランクだよ！'); return; }
    if(!nb){ toast('ランクアップの本を ショップで かってね'); return; }
    t.bag.rankbook--; r.star++; persist(); sound('fan'); confetti(1800);
    await dialog(`<div class="dlgArt big pop">${resPic(r)}</div><h2 class="dlgT">ランクアップ！</h2><div class="stars big">${stars(r.star)}</div>${RANK_LOOK[r.star] ? `<div class="lookNew">✨ みためが かわった！ ${RANK_LOOK[r.star]}</div>` : ""}<div class="abList">${abBars(r)}</div>`,
      [{label:'すごい！', cls:'gold', v:1}], 'gold');
    renderCurrent();
  }else if(v==='move'){
    if(!nt){ toast('引っこしチケットを ショップで かってね'); return; }
    const ok = await dialog(`<div class="dlgArt">${resPic(r)}</div><h2 class="dlgT">${esc(r.name)}が 引っこすよ</h2>
      <p class="dlgP">かわりに あたらしい じゅうみんが やってくるよ。<br>ほんとうに いい？</p>`,
      [{label:'やめる', cls:'white', v:false}, {label:'引っこす', cls:'pink', v:true}]);
    if(!ok) return;
    const idx = t.res.indexOf(r); t.res.splice(idx,1);
    const sp2 = pickSpecies({needHome:true});
    if(!sp2){ t.res.splice(idx,0,r); await needHomeDialog(false); return; }
    t.bag.ticket--; WK.st.delete(r.id);
    const nr = newResident(sp2); nr.home = findHome(sp2).key; t.res.splice(idx,0,nr); persist(); discover(nr.sp);
    await dialog(`<div class="dlgArt">${resPic(r)}</div><p class="dlgP">${esc(r.name)}「いままで ありがとう！ またね〜」</p>`, [{label:'またね！', cls:'', v:1}]);
    await arrival(nr); checkBadges(); renderCurrent();
  }
}
function renderCurrent(){ if(curScreen==='town') renderTown(); else if(curScreen==='residents') renderResidents(); else if(curScreen==='shop') renderShop(); }
$('#btnToShop').onclick = () => show('shop');
$('#btnToRes').onclick = () => show('residents');
$('#shopToTown').onclick = () => show('town');
$('#resToShop').onclick = () => { shopTab = 'use'; show('shop'); };

/* =====================================================================
   ずかん
   ===================================================================== */
const ZUKAN_INFO = {
  cat:'ひなたぼっこが 大すき。じつは ものしりで、本を よむのが とくい。', dog:'はたらきもので、まちの みんなを たすけるのが すき。',
  sparrow:'朝 いちばんに あいさつする、みんなの にんきもの。', rabbit:'おみせを 開くのが ゆめ。おしゃべりが じょうず。',
  tanuki:'しょうばい じょうず。はっぱを あたまに のせると やる気 アップ！', bear:'力もち。たてものを つくるのが だいとくい。',
  squirrel:'どんぐりを あつめるように ちしきを あつめる 勉強家。', fox:'うんてんが じょうずで、のりもの大すき。',
  panda:'たけの おうちで のんびり くらす レアな じゅうみん。', shima:'「雪の ようせい」と よばれる 北海道の 小鳥。とっても レア！',
  hamster:'ほっぺに たねを つめこむ ちょきん名人。', pig:'きれいずきで はたらきもの。', sheep:'ふわふわの けで みんなを いやす。',
  frog:'あめの日が 大すき。みずべの おうちに すむ。', owl:'夜ふかしの ものしり はかせ。', otter:'かいがらを つかう かしこい どうぶつ。',
  penguin:'あるくのは ゆっくり、およぐのは はやい！', seal:'ごろごろ ねるのが とくい。', hedgehog:'とげとげだけど やさしい。',
  koala:'1日の ほとんどを ねて すごす。', redpanda:'しましまの しっぽが じまん。', alpaca:'ふわふわの もこもこ。',
  house:'ネコや イヌたちが すむ 家。', birdhouse:'小鳥たちの おうち。', logcabin:'森の どうぶつが すむ 木の 家。', waterhouse:'水が 大すきな どうぶつの おうち。',
  treehouse:'木の 上の ひみつきち。', bamboo:'パンダの ための たけの おうち。', apartment:'だれでも すめる 大きな たてもの。',
  tree:'木が あると まちが すずしくて 気もちいい。', flower:'じょうろで 水を あげて もらえるよ。', bench:'ちょっと ひとやすみ。',
  lamp:'夜の 道を あかるく てらす。', well:'むかしの 人は 井戸の 水を つかっていたよ。', pond:'メダカや カエルが すんでいる 池。',
  fountain:'まちの 広場の シンボル。', field:'やさいを そだてる 畑。', bakery:'朝 やきたての パンの いいにおい。',
  market:'しんせんな やさいや くだものが ならぶ。', windmill:'風の 力で こなを ひく。', park:'子どもたちの あそび場。',
  post:'手紙や 小づつみを とどける。', library:'本が たくさん。ちしきボーナスが ふえる。', school:'みんなで 勉強する ところ。',
  clinic:'けがや びょうきを なおす。', station:'電車が とまる えき。', bigstation:'たくさんの 電車が とまる 大きな えき。', parking:'のりものを とめる ばしょが ふえる。',
  office:'たくさんの 人が はたらく 高い ビル。', dept:'なんでも そろう 大きな おみせ。', hotel:'とおくから 来た 人が とまる。',
  museum:'むかしの ものや きょうりゅうの ほねが 見られる。', cityhall:'まちの ことを きめる ところ。', tower:'テレビの 電波を とどける 高い とう。',
  stadium:'スポーツの しあいで もりあがる！', harbor:'船が 出入りする みなと。', ferris:'かんらん車から まちが 見わたせる。', airport:'ひこうきで 世界へ！',
  heliport:'高層ビルの 上に ヘリコプターが とまる。', observatory:'ほしを かんさつする ところ。', zoo:'いろんな どうぶつに 会える。',
  aquarium:'海の いきものが いっぱい。', landmark:'まちで いちばん 高い タワー。', castle:'みんなの あこがれ。ゆめの おしろ。', space:'ロケットで うちゅうへ！',
  bicycle:'エンジンなしで はしる エコな のりもの。', scooter:'ごはんや にもつを とどける。', kei:'小さいけれど にもつが たくさん つめる。',
  sedan:'家族で おでかけ。', crossover:'小さくて 四角い かわいい 車。どこへでも 行ける。', taxi:'行きたい ところへ つれて いってくれる。', tractor:'畑を たがやす 力もち。',
  bus:'たくさんの 人を いっぺんに はこぶ。', mail:'ゆうびんを あつめて とどける。', garbage:'ごみを あつめて まちを きれいに。', truck:'おみせに しなものを はこぶ。',
  icecream:'音楽を ならしながら やってくる。', foodtruck:'いろんな ばしょで おいしい りょうりを うる。', fire:'火じを けす ヒーロー。',
  ambulance:'びょういんへ いそいで はこぶ。', police:'まちの あんぜんを まもる。', schoolbus:'子どもたちを 学校へ はこぶ。',
  camper:'中で ねとまり できる 車。', ev:'でんきで はしる しずかな 車。', mixer:'コンクリートを まぜながら はこぶ。', crane:'おもい ものを もちあげる。',
  excavator:'土を ほる。キャタピラで どこでも 行ける。', rally:'でこぼこ道も へっちゃら！ 大きな ウイングが かっこいい レース用の 車。', sports:'はやく はしるのが とくい。',
  doubledecker:'2かいだての バス。上の せきは ながめが さいこう。', limo:'とっても ながい とくべつな 車。',
  steam:'石炭を もやした じょうきで はしる。けむりが もくもく。', local:'えきに ていねいに とまる ふだんの 電車。', tram:'道路の 上を はしる 電車。',
  freight:'コンテナで たくさんの にもつを はこぶ。', express:'大きな えきだけに とまる はやい 電車。', shinkansen:'じそく 300km いじょうで はしる 日本の ほこり！',
  linear:'じしゃくの 力で うかんで はしる みらいの 電車。'
};
const ZUKAN_CATS = [
  {id:'res',   n:'じゅうみん', i:'🐾', list:() => SPECIES},
  {id:'veh',   n:'のりもの',   i:'🚗', list:() => TOWN_ITEMS.filter(x => x.type==='veh')},
  {id:'train', n:'てつどう',   i:'🚃', list:() => TOWN_ITEMS.filter(x => x.type==='train' || (x.type==='bld' && x.cat==='rail'))},
  {id:'bld',   n:'たてもの',   i:'🏠', list:() => TOWN_ITEMS.filter(x => x.type==='bld' && x.cat!=='rail' && x.cat!=='road')},
  {id:'kanji', n:'かんじ',     i:'🀄'}
];
function zk(){ return save.zukan || (save.zukan = {f:{}, done:{}}); }
function zukanSync(){
  const z = zk(), t = save.town; if(!t) return;
  const mark = id => { if(id && !z.f[id]) z.f[id] = Date.now(); };
  t.res.forEach(r => mark(r.sp));
  Object.values(t.cells).forEach(mark); Object.keys(t.inv).forEach(k => t.inv[k] > 0 && mark(k));
  t.veh.forEach(mark); t.trains.forEach(mark);
  ZUKAN_CATS.forEach(c => { if(c.list && c.list().every(x => z.f[x.id])) z.done[c.id] = z.done[c.id] || Date.now(); });
}
function discover(id){
  const z = zk(); if(!id) return;
  if(isRoadId(id)){ z.f[id] = z.f[id] || Date.now(); return; }
  if(z.f[id]) return;
  z.f[id] = Date.now();
  const o = SPECIES.find(s => s.id===id) || ITEM(id);
  const keep = S; S = null;
  addPoints(TOWN_RULES.zukanPt, `ずかん とうろく：${o ? o.name : id}`);
  setTimeout(() => toast(`📖 ずかんに「${o ? o.name : id}」が のったよ！ +${TOWN_RULES.zukanPt}pt`), 700);
  ZUKAN_CATS.forEach(c => {
    if(!c.list || z.done[c.id]) return;
    if(c.list().every(x => z.f[x.id])){ z.done[c.id] = Date.now(); addPoints(TOWN_RULES.zukanCompletePt, `ずかん「${c.n}」コンプリート！`);
      setTimeout(() => { toast(`🎉 ずかん「${c.n}」コンプリート！ +${TOWN_RULES.zukanCompletePt}pt`); confetti(2400); }, 2600); }
  });
  S = keep; persist();
}
function zukanProgress(){
  const z = zk(), mm = kanjiMastery(), out = {};
  ZUKAN_CATS.forEach(c => {
    if(c.id==='kanji') out.kanji = {got:[...mm.values()].filter(m=>m.lv>=2).length, all:mm.size};
    else { const l = c.list(); out[c.id] = {got:l.filter(x=>z.f[x.id]).length, all:l.length}; }
  });
  return out;
}
let zukanTab = 'res';
function renderZukan(){
  ensureTown();
  const P = zukanProgress(), z = zk();
  const allG = Object.values(P).reduce((a,p)=>a+p.got,0), allA = Object.values(P).reduce((a,p)=>a+p.all,0);
  $('#zukanHead').innerHTML = `<div class="zkAll"><div class="zkRing" style="background:conic-gradient(var(--pink) ${allA?allG/allA*360:0}deg,#F1E9DC 0)"><div><b>${allA?Math.round(allG/allA*100):0}%</b><span>ぜんたい</span></div></div>
    <div class="zkMsg"><b>${allG} / ${allA}</b> あつめたよ！<br><small>はじめて 見つけると +${TOWN_RULES.zukanPt}pt、1ページ そろうと +${TOWN_RULES.zukanCompletePt}pt</small></div></div>`;
  $('#zukanTabs').innerHTML = ZUKAN_CATS.map(c => `<button data-v="${c.id}" class="${c.id===zukanTab?'on':''}">${c.i} ${c.n}<small>${P[c.id].got}/${P[c.id].all}${(z.done[c.id] || (c.id==='kanji' && P.kanji.got===P.kanji.all && P.kanji.all)) ? ' 👑' : ''}</small></button>`).join('');
  const grid = $('#zukanGrid');
  if(zukanTab==='kanji'){
    const mm = kanjiMastery();
    grid.className = 'zkGrid kanji';
    grid.innerHTML = [...mm.values()].map((m,i) => `<button class="zkK ${m.lv>=2?'got':''} ${m.lv===3?'master':''}" data-k="${esc(m.k)}"><span class="no">${i+1}</span>${esc(m.k)}</button>`).join('');
    $('#zukanNote').textContent = '漢字を「おぼえた」いじょうに すると ずかんに のるよ。金色は マスター！';
    return;
  }
  const list = ZUKAN_CATS.find(c => c.id===zukanTab).list();
  grid.className = 'zkGrid';
  grid.innerHTML = list.map((o,i) => { const got = !!z.f[o.id];
    const rar = zukanTab==='res' ? RARITY[o.rar||1] : null;
    return `<button class="zkCard ${got?'got':''} ${rar?'rk'+rar.k:''}" data-id="${o.id}" ${rar && got ? `style="--rb:${rar.bg}"` : ''}><span class="no">No.${String(i+1).padStart(2,'0')}</span>
      <div class="zkImg">${picHTML(o)}</div><div class="zkName">${got ? esc(o.name) : '？？？'}</div>
      ${rar ? `<div class="zkRar" style="color:${rar.c}">${rar.n}</div>` : `<div class="zkRar">${got ? '' : `Lv${o.lv||1}〜`}</div>`}</button>`; }).join('');
  $('#zukanNote').textContent = zukanTab==='res' ? 'おまねきレターで あたらしい じゅうみんを よぶと とうろくされるよ。' : 'ショップで かうと ずかんに とうろくされるよ。';
}
$('#zukanTabs').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; zukanTab = b.dataset.v; renderZukan(); });
$('#zukanGrid').addEventListener('click', async e => {
  const k = e.target.closest('.zkK');
  if(k){
    const m = kanjiMastery().get(k.dataset.k);
    const words = allQs().filter(q => q.kanji===m.k).map(q => { const ok = (q.post.match(/^[ぁ-ん]+/)||[''])[0];
      return `<span class="zkWord">${esc(q.word)}<i>${esc(ok)}</i><small>${esc(q.reading)}${esc(ok)}</small></span>`; }).join('');
    const lvN = m.lv===-1 ? 'にがて' : ['まだ','れんしゅう中','おぼえた','マスター'][m.lv];
    await dialog(`<div class="zkBig">${esc(m.k)}</div><div class="rarTag" style="background:${m.lv>=2?'var(--green)':'#B5A893'}">${lvN}</div>
      <div class="zkWords">${words}</div><p class="dlgP" style="font-size:15px">書き ○${m.wc} ×${m.ww}　読み ○${m.rc} ×${m.rw}</p>`, [{label:'とじる', v:1}]);
    return;
  }
  const b = e.target.closest('.zkCard'); if(!b) return;
  const id = b.dataset.id, z = zk(), got = !!z.f[id];
  const sp = SPECIES.find(s => s.id===id), it = sp ? null : ITEM(id), o = sp || it;
  if(!got){
    const hint = sp ? `レアど：${RARITY[sp.rar||1].n}<br>すむ 家：${esc(homeName(sp.home))}<br>おまねきレターで 会えるかも？`
      : `Lv${it.lv||1}に なると ショップで かえるよ<br>（${nf(priceOf(it))}pt）` + (it.req ? '<br>🔑 かう じょうけんが あるよ' : '');
    await dialog(`<div class="dlgArt zkLock">${picHTML(o)}</div><h2 class="dlgT">？？？</h2><p class="dlgP">${hint}</p>`, [{label:'とじる', v:1}]);
    return;
  }
  const t = save.town;
  let extra;
  if(sp){
    const n = t.res.filter(r => r.sp===id).length, ab = ABILITIES.find(a => a.id===sp.bias);
    extra = `<div class="rarTag" style="background:${RARITY[sp.rar||1].c}">${RARITY[sp.rar||1].n}</div>
      <p class="dlgP" style="font-size:15px">とくいな こと：${ab ? ab.i+' '+ab.n : '🌟 ぜんぶ'}<br>すむ 家：${esc(homeName(sp.home))}<br>まちに いる 数：${n}人</p>`;
  } else extra = `<p class="dlgP" style="font-size:15px">${esc(itemEffect(it))}<br>もっている 数：${ownedCount(it)}　/　${nf(priceOf(it))}pt</p>`;
  const d = new Date(z.f[id]);
  await dialog(`<div class="dlgArt big">${picHTML(o)}</div><h2 class="dlgT">${esc(o.name)}</h2>${extra}
    <div class="zkInfo">${esc(o.info || ZUKAN_INFO[id] || '')}</div><p class="note">はじめて 見つけた日：${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}</p>`, [{label:'とじる', v:1}], 'wide');
});

/* ---------- バッジ追加 ---------- */
BADGES.push(
  {id:'town3', i:'🏘️', n:'にぎやかな村に なった', f:()=>(save.town?.lv||0)>=2},
  {id:'town5', i:'🏙️', n:'町に なった',          f:()=>(save.town?.lv||0)>=4},
  {id:'res10', i:'🐾', n:'じゅうみん 10人',       f:()=>(save.town?.res.length||0)>=10},
  {id:'res30', i:'🎪', n:'じゅうみん 30人',       f:()=>(save.town?.res.length||0)>=30},
  {id:'rare',  i:'🐼', n:'レアな じゅうみん',     f:()=>(save.town?.res||[]).some(r=>(SP(r.sp).rar||1)>=3)},
  {id:'shima', i:'🕊️', n:'シマエナガが すんでる', f:()=>(save.town?.res||[]).some(r=>r.sp==='shima')},
  {id:'homes', i:'🏡', n:'6しゅるいの 家',        f:()=>Object.keys(HOME_TYPES).every(h => Object.values(save.town?.cells||{}).includes(HOME_TYPES[h].item))},
  {id:'road20',i:'🛣️', n:'みち 20マス',          f:()=>Object.values(save.town?.cells||{}).filter(x=>isRoadId(x)).length>=20},
  {id:'special',i:'⭐', n:'とくべつな たてもの',  f:()=>Object.values(save.town?.cells||{}).some(id => ITEM(id)?.special)},
  {id:'veh1',  i:'🚲', n:'はじめての のりもの',   f:()=>(save.town?.veh||[]).length>=1},
  {id:'veh10', i:'🚌', n:'のりもの 10台',         f:()=>(save.town?.veh||[]).length>=10},
  {id:'train1',i:'🚃', n:'電車が はしった',       f:()=>(save.town?.trains||[]).length>=1},
  {id:'shink', i:'🚅', n:'新かんせん',            f:()=>(save.town?.trains||[]).includes('shinkansen')},
  {id:'city',  i:'🌆', n:'にぎやかな都市',        f:()=>(save.town?.lv||0)>=7},
  {id:'dream', i:'🌈', n:'ゆめの都',              f:()=>(save.town?.lv||0)>=11},
  {id:'zk50',  i:'📖', n:'ずかん 50%',            f:()=>{ const P = zukanProgress(); const g = Object.values(P).reduce((a,p)=>a+p.got,0), a = Object.values(P).reduce((x,p)=>x+p.all,0); return a && g/a>=0.5; }}
);

/* ---------- 拡張データ（設定画面） ---------- */
$('#fileTownCfg').addEventListener('change', async e => {
  const f = e.target.files[0]; if(!f) return;
  try{ const cfg = JSON.parse(await f.text()); if(!cfg || typeof cfg!=='object') throw 0;
    localStorage.setItem(TOWN_CFG_KEY, JSON.stringify(cfg)); toast('よみこみました。アプリを 開きなおします'); setTimeout(() => location.reload(), 900);
  }catch(err){ toast('JSONを よみこめませんでした'); }
  e.target.value = '';
});
$('#btnTownCfgOut').onclick = () => {
  const cfg = {levels:TOWN_LEVELS, items:TOWN_ITEMS, species:SPECIES, homeTypes:HOME_TYPES, rules:TOWN_RULES};
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(cfg, null, 2)], {type:'application/json'}));
  a.download = 'manabitown_town_config.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
};
$('#btnTownCfgReset').onclick = () => { if(confirm('拡張データを 消して はじめの 設定に もどしますか？')){ localStorage.removeItem(TOWN_CFG_KEY); location.reload(); } };
$('#btnTownReset').onclick = () => { if(confirm('まちを さいしょの 村に もどしますか？（ポイントは そのまま）')){ delete save.town; WK.st.clear(); ensureTown(); persist(); toast('まちを もどしました'); } };


/* =====================================================================
   v0.6：住民と おはなし・わたしの家（家具・もようがえ・おきゃくさん）
   ===================================================================== */
/* ---------- 住民の セリフ ---------- */
const TALK = {
  hello:['やっほー！ 会えて うれしいな♪','こんにちは！ きょうも いい天気だね','あっ、きてくれたんだ！','わーい！ あそぼう あそぼう！'],
  morning:['おはよう！ 朝ごはん 食べた？','朝の 空気って 気もちいいね！'],
  noon:['おひるの あとは ねむくなるよね〜','きょうの おやつ なにかなあ'],
  evening:['ゆうやけ きれいだね！','きょうも 1日 おつかれさま！'],
  night:['ふあ〜 そろそろ ねる 時間かな','夜ふかしは ほどほどにね！'],
  study0:['きょうは まだ 勉強してないの？ いっしょに がんばろう！','漢字を 1問 といたら、まちが もっと にぎやかに なるよ！'],
  study1:['きょうも 勉強 がんばってるね！ すごい！','いっぱい 勉強したね！ ぼくも ほこらしいよ！','漢字 じょうずに 書けてたって うわさだよ♪'],
  streak:['毎日 つづけてて えらいなあ！','れんぞく 勉強、そんけいしちゃう！'],
  bias:{
    work:['きょうも はたらくぞ〜！ まちを もっと 大きくしたいな','力しごとなら まかせて！'],
    biz:['お店を ひらくのが ゆめなんだ！','うりあげ ふえるかな？ わくわく！'],
    know:['本を よむのが 大すき！ きみも 読書 すき？','しってる？ 勉強すると あたまの 中に 宝石が ふえるんだって'],
    pop:['みんなと おしゃべりするのが すき！','あたらしい おともだち、ふえると いいね！'],
    drive:['のりものって かっこいいよね！','いつか 新かんせんに のってみたいな〜'],
    all:['いつも ありがとう！ この まち、だいすき！','きみの がんばりで まちが キラキラしてるよ']
  },
  friend:['きみと はなすと 元気が でるよ！','ずっと 友だちで いてね！','また あした も 会いに きてね♪'],
  visit:['おじゃましまーす！ すてきな お部屋だね！','わあ、この お部屋 いごこちが いいね〜','あそびに きちゃった！','この 家具 いいなあ！ どこで かったの？'],
  gift:['いつも ありがとう！ これ、おみやげだよ！','よかったら これ もらってね♪']
};
const pick = a => a[Math.random()*a.length|0];
function talkLine(r, ctx){
  const s = SP(r.sp), h = new Date().getHours(), td = save.days[dayKey()] || {n:0};
  const pool = [...TALK.hello];
  pool.push(...(h<10 ? TALK.morning : h<16 ? TALK.noon : h<19 ? TALK.evening : TALK.night));
  pool.push(...(td.n ? TALK.study1 : TALK.study0), ...(td.n ? TALK.study1 : TALK.study0));
  if(curStreak() >= 3) pool.push(...TALK.streak);
  pool.push(...(TALK.bias[s.bias] || []), ...(TALK.bias[s.bias] || []));
  if((r.fr||0) >= 5) pool.push(...TALK.friend);
  if(ctx==='visit') return pick(TALK.visit);
  return pick(pool);
}
const frLv = r => Math.min(5, Math.floor((r.fr||0)/3));
const hearts = r => '💗'.repeat(frLv(r)) + '<i>' + '♡'.repeat(5-frLv(r)) + '</i>';
/* 住民を タッチ → 笑顔で はなしかける */
async function talkTo(id, ctx){
  const t = save.town, r = t.res.find(x => x.id===id); if(!r) return;
  const s = SP(r.sp), R = RARITY[s.rar||1];
  const st = WK.st.get(id);
  if(st && st.el){ st.el.classList.add('happy'); setTimeout(() => st.el && st.el.classList.remove('happy'), 1600); }
  const today = dayKey();
  let gain = '';
  if(r.talked !== today){ r.talked = today; r.fr = (r.fr||0) + 1; persist(); gain = `<div class="frUp">💗 なかよし アップ！</div>`; }
  sound('ok');
  let line = talkLine(r, ctx);
  const html = () => `<div class="talkWrap rk${R.k}" style="--rb:${R.bg}">
      <div class="talkPic happy">${resPic(r)}<span class="spark s1">✨</span><span class="spark s2">💕</span><span class="spark s3">✨</span></div>
      <div class="talkBubble"><b>${esc(r.name)}</b><span id="talkLine">${esc(line)}</span></div></div>
    <div class="frRow">なかよし ${hearts(r)}</div>${gain}`;
  if(ctx!=='visit' && Math.random() < 0.35){
    const v0 = await dialog(`<div class="talkWrap rk${R.k}" style="--rb:${R.bg}"><div class="talkPic happy">${resPic(r)}<span class="spark s1">❓</span><span class="spark s2">✨</span></div>
      <div class="talkBubble"><b>${esc(r.name)}</b>ねえねえ！ 問題を 出してもいい？<br><small>ちょうせん するだけで ポイントが もらえるよ！</small></div></div>`,
      [{label:'🎲 チャレンジ！', cls:'orange', v:'go'}, {label:'また こんど', cls:'white', v:'skip'}], 'wide talk');
    if(v0==='go'){ await residentQuiz(r); return; }
    line = 'そっか、また こんどね！';
  }
  while(true){
    const v = await dialog(html(), [{label:'💬 もっと はなす', cls:'pink', v:'more'}, {label:'📋 くわしく', cls:'white', v:'info'}, {label:'またね！', cls:'', v:null}], 'wide talk');
    gain = '';
    if(v==='more'){ let n; do{ n = talkLine(r, ctx); }while(n===line && Math.random()<0.8); line = n; sound('tap'); continue; }
    if(v==='info') await openResident(id);
    break;
  }
}

/* =====================================================================
   まちの 広さ（レベルが 上がるほど 広くなる）
   ===================================================================== */
function townZoom(){ return save.town.zoom || 1; }
function cellSizeFixed(){
  const base = innerWidth <= 600 ? 64 : 92;
  return Math.round(base * townZoom());
}
function setZoom(z){ save.town.zoom = clamp(Math.round(z*100)/100, 0.5, 1.6); persist(); renderMap(); }

/* =====================================================================
   わたしの家
   ===================================================================== */
let FURNITURE = [
  {id:'bed',       name:'ベッド',           art:'fur_bed',        type:'fur', price:300, lv:1, sty:6,  kind:'bed'},
  {id:'table',     name:'まるテーブル',     art:'fur_table',      type:'fur', price:150, lv:1, sty:3},
  {id:'chair',     name:'いす',             art:'fur_chair',      type:'fur', price:80,  lv:1, sty:2},
  {id:'rug',       name:'ふわふわラグ',     art:'fur_rug',        type:'fur', price:120, lv:1, sty:3, floor:1},
  {id:'plant',     name:'かんようしょくぶつ', art:'fur_plant',    type:'fur', price:100, lv:1, sty:3},
  {id:'lamp',      name:'スタンドライト',   art:'fur_lamp',       type:'fur', price:120, lv:1, sty:3},
  {id:'teddy',     name:'くまの ぬいぐるみ', art:'fur_teddy',     type:'fur', price:150, lv:1, sty:4},
  {id:'sofa',      name:'ソファ',           art:'fur_sofa',       type:'fur', price:400, lv:2, sty:7},
  {id:'shelf',     name:'本だな',           art:'fur_shelf',      type:'fur', price:350, lv:2, sty:6, know:0.01},
  {id:'desk',      name:'勉強づくえ',       art:'fur_desk',       type:'fur', price:450, lv:2, sty:7, know:0.02},
  {id:'globe',     name:'ちきゅうぎ',       art:'fur_globe',      type:'fur', price:250, lv:2, sty:4, know:0.01},
  {id:'toybox',    name:'おもちゃばこ',     art:'fur_toybox',     type:'fur', price:200, lv:2, sty:4},
  {id:'painting',  name:'えのぐの 絵',      art:'fur_painting',   type:'fur', price:300, lv:3, sty:6},
  {id:'clock',     name:'はしら時計',       art:'fur_clock',      type:'fur', price:400, lv:3, sty:6},
  {id:'tv',        name:'テレビ',           art:'fur_tv',         type:'fur', price:500, lv:3, sty:7},
  {id:'fridge',    name:'れいぞうこ',       art:'fur_fridge',     type:'fur', price:450, lv:3, sty:6},
  {id:'kitchen',   name:'キッチン',         art:'fur_kitchen',    type:'fur', price:700, lv:4, sty:9},
  {id:'wardrobe',  name:'ようふくダンス',   art:'fur_wardrobe',   type:'fur', price:500, lv:4, sty:7},
  {id:'starlight', name:'おほしさま ライト', art:'fur_starlight', type:'fur', price:350, lv:4, sty:6},
  {id:'aquarium',  name:'すいそう',         art:'fur_aquarium',   type:'fur', price:800, lv:5, sty:10},
  {id:'piano',     name:'ピアノ',           art:'fur_piano',      type:'fur', price:1200, lv:6, sty:14},
  {id:'trainset',  name:'てつどう もけい',  art:'fur_trainset',   type:'fur', price:1000, lv:6, sty:12},
  {id:'dollhouse', name:'ドールハウス',     art:'fur_dollhouse',  type:'fur', price:1100, lv:7, sty:13},
  {id:'shimaplush',name:'シマエナガの ぬいぐるみ', art:'fur_shimaplush', type:'fur', price:2000, lv:8, sty:20, special:1, req:{has:{}, res:15}}
];
let WALLS = [
  {id:'cream',  name:'クリーム',     type:'fur', price:0,   css:'linear-gradient(#FFF6E3,#F7E6C4)'},
  {id:'pink',   name:'さくら',       type:'fur', price:200, css:'repeating-linear-gradient(90deg,#FFE3EA 0 22px,#FFD3DE 22px 44px)'},
  {id:'mint',   name:'ミント',       type:'fur', price:200, css:'repeating-linear-gradient(90deg,#E3F5E7 0 22px,#D3EEDB 22px 44px)'},
  {id:'sky',    name:'おそら',       type:'fur', price:300, css:'radial-gradient(circle at 20% 40%,#fff 0 10px,transparent 11px),radial-gradient(circle at 70% 30%,#fff 0 14px,transparent 15px),linear-gradient(#BFE4FF,#E6F4FF)'},
  {id:'dot',    name:'ドット',       type:'fur', price:300, css:'radial-gradient(#FFB6C8 3px,transparent 4px) 0 0/22px 22px,#FFF8EC'},
  {id:'wood',   name:'ログ',         type:'fur', price:400, css:'repeating-linear-gradient(#D9B07E 0 18px,#C99A63 18px 20px)'},
  {id:'star',   name:'ほしぞら',     type:'fur', price:600, css:'radial-gradient(#FFE58A 2px,transparent 3px) 0 0/26px 26px,radial-gradient(#fff 1px,transparent 2px) 13px 13px/26px 26px,linear-gradient(#2E3A7A,#4A5AA8)'}
];
let FLOORS = [
  {id:'wood',   name:'フローリング', type:'fur', price:0,   css:'repeating-linear-gradient(90deg,#E8C99A 0 46px,#DDBB88 46px 48px)'},
  {id:'tatami', name:'たたみ',       type:'fur', price:250, css:'repeating-linear-gradient(90deg,#D8DFA0 0 4px,#CDD593 4px 8px)'},
  {id:'check',  name:'チェック',     type:'fur', price:250, css:'repeating-conic-gradient(#FFFFFF 0 25%,#F3E3EA 0 50%) 0 0/48px 48px'},
  {id:'carpet', name:'あおカーペット', type:'fur', price:300, css:'radial-gradient(#9CC8EE 1.5px,transparent 2px) 0 0/12px 12px,#BBDDF8'},
  {id:'grass',  name:'しばふ',       type:'fur', price:500, css:'radial-gradient(#7FC46B 2px,transparent 3px) 0 0/14px 14px,#A8DC8E'}
];
const ROOM = {cols:7, rows:5};
const FUR = id => FURNITURE.find(f => f.id===id);
function ensureHome(){
  if(save.myhome) return save.myhome;
  save.myhome = {items:[{id:'bed',x:0,y:0},{id:'table',x:3,y:2},{id:'chair',x:2,y:2},{id:'rug',x:3,y:3}], inv:{}, wall:'cream', floor:'wood', walls:['cream'], floors:['wood'], visit:null, lastVisit:''};
  persist(); return save.myhome;
}
let homeStyle = () => ensureHome().items.reduce((a,i) => a + (FUR(i.id)?.sty||0), 0);
const homeKnow = () => Math.min(0.1, ensureHome().items.reduce((a,i) => a + (FUR(i.id)?.know||0), 0));
let homeEdit = false, homeHand = null, homeTab = 'fur', vTimer = null;
function renderMyHome_v6(){
  const H = ensureHome(), sty = homeStyle();
  const W = WALLS.find(w=>w.id===H.wall) || WALLS[0], F = FLOORS.find(f=>f.id===H.floor) || FLOORS[0];
  $('#homeHead').innerHTML = `<div class="hmTitle">🏡 わたしの家</div>
    <div class="hmStats"><span>✨ すてき度 <b>${sty}</b></span><span>📘 ちしき <b>+${Math.round(homeKnow()*100)}%</b></span><span>🪑 家具 <b>${H.items.length}</b></span></div>`;
  const cs = Math.min(Math.floor(($('#roomWrap').clientWidth - 16) / ROOM.cols), 110);
  const room = $('#room');
  room.style.setProperty('--rc', cs+'px');
  $('#roomWall').style.background = W.css;
  room.style.background = F.css;
  room.style.gridTemplateColumns = `repeat(${ROOM.cols}, ${cs}px)`;
  room.classList.toggle('edit', homeEdit);
  let h = '';
  for(let y=0;y<ROOM.rows;y++) for(let x=0;x<ROOM.cols;x++){
    const its = H.items.filter(i => i.x===x && i.y===y);
    h += `<div class="rcell" data-x="${x}" data-y="${y}" style="z-index:${y*10+2}">${its.map(i => { const f = FUR(i.id); return f ? `<img class="fimg ${f.floor?'flr':''}" src="${esc(artSrc(f.art))}" alt="">` : ''; }).join('')}</div>`;
  }
  room.innerHTML = h;
  $('#btnHomeEdit').textContent = homeEdit ? '✔ もようがえ おわり' : '🛠 もようがえ';
  $('#btnHomeEdit').classList.toggle('pink', homeEdit);
  renderHomeTray();
  if(!homeEdit) placeVisitor(true);
}
function renderHomeTray_v6(){
  const tr = $('#homeTray'); tr.classList.toggle('hidden', !homeEdit);
  if(!homeEdit) return;
  const H = ensureHome();
  $$('#homeTabs button').forEach(b => b.classList.toggle('on', b.dataset.v===homeTab));
  let h = '';
  if(homeTab==='fur'){
    const ids = Object.keys(H.inv).filter(k => H.inv[k] > 0 && FUR(k));
    h = ids.length ? ids.map(id => `<button class="trayIt ${homeHand && homeHand.from==='inv' && homeHand.id===id ? 'on':''}" data-id="${id}"><img src="${esc(artSrc(FUR(id).art))}" alt=""><span>${esc(FUR(id).name)}</span><b>×${H.inv[id]}</b></button>`).join('')
      : `<div class="note" style="padding:10px">もちものの 家具は ないよ。「家具を かう」で そろえよう！</div>`;
  } else {
    const list = homeTab==='wall' ? WALLS : FLOORS, owned = homeTab==='wall' ? H.walls : H.floors, curId = homeTab==='wall' ? H.wall : H.floor;
    h = list.map(w => `<button class="trayIt sw ${w.id===curId?'on':''}" data-sw="${w.id}"><span class="swatch" style="background:${w.css}"></span><span>${esc(w.name)}</span>${owned.includes(w.id) ? '' : `<b class="pr">${w.price}pt</b>`}</button>`).join('');
  }
  $('#homeTrayItems').innerHTML = h;
  $('#homeHand').innerHTML = homeTab!=='fur' ? (homeTab==='wall' ? 'かべがみを えらんでね' : 'ゆかを えらんでね')
    : homeHand ? `<img class="handImg" src="${esc(artSrc(FUR(homeHand.id).art))}" alt=""> ${esc(FUR(homeHand.id).name)}を もっているよ。おきたい マスを タッチ！`
    : 'おく 家具を えらぶか、おいてある 家具を タッチして うごかそう';
  $('#btnHomeStore').disabled = !homeHand;
}
$('#homeTabs').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; homeTab = b.dataset.v; renderHomeTray(); });
$('#homeTrayItems').addEventListener('click', async e => {
  const H = ensureHome();
  const sw = e.target.closest('[data-sw]');
  if(sw){
    const isW = homeTab==='wall', list = isW ? WALLS : FLOORS, owned = isW ? H.walls : H.floors, w = list.find(x => x.id===sw.dataset.sw);
    if(!owned.includes(w.id)){
      if(save.points.bal < w.price){ toast('ポイントが たりないよ'); return; }
      const ok = await dialog(`<div class="swatch big" style="background:${w.css}"></div><h2 class="dlgT">${esc(w.name)}の ${isW?'かべがみ':'ゆか'}</h2><p class="dlgP">${w.price}pt で かいますか？</p>`,
        [{label:'やめる', cls:'white', v:false}, {label:'かう！', cls:'orange', v:true}]);
      if(!ok) return;
      addPoints(-w.price, `${w.name}の ${isW?'かべがみ':'ゆか'}`); owned.push(w.id);
    }
    if(isW) H.wall = w.id; else H.floor = w.id; persist(); sound('tap'); renderMyHome(); return;
  }
  const b = e.target.closest('.trayIt'); if(!b) return;
  if(homeHand && homeHand.from==='map'){ toast('もっている 家具を さきに おいてね'); return; }
  homeHand = (homeHand && homeHand.id===b.dataset.id) ? null : {id:b.dataset.id, from:'inv'};
  renderHomeTray();
});
$('#btnHomeStore').onclick = () => { const H = ensureHome(); if(homeHand){ H.inv[homeHand.id] = (H.inv[homeHand.id]||0)+1; homeHand = null; } else if(H.items[homeSel]){ const it = H.items.splice(homeSel,1)[0]; H.inv[it.id] = (H.inv[it.id]||0)+1; homeSel = -1; } persist(); renderMyHome(); };
$('#btnHomeEdit').onclick = () => { if(homeEdit) endHomeEdit(); else { homeEdit = true; homeSel = -1; stopVisitor(); renderMyHome(); } };
function endHomeEdit(silent){
  const H = ensureHome();
  if(homeHand && homeHand.from==='map') H.items.push({id:homeHand.id, x:homeHand.x, y:homeHand.y, f:homeHand.f||0});
  homeSel = -1;
  homeHand = null; homeEdit = false; persist(); if(!silent) renderMyHome();
}
$('#btnFurShop').onclick = () => { shopTab = 'fur'; show('shop'); };

/* ---------- おきゃくさん（住民が あそびに くる） ---------- */
function visitChance(){
  const td = save.days[dayKey()] || {n:0};
  return clamp(0.25 + Math.min(td.n, 30)*0.015 + homeStyle()*0.004, 0, 0.85);
}
function maybeVisit(){
  const H = ensureHome(), t = save.town; if(!t.res.length) return;
  const now = Date.now();
  if(H.visit && now - H.visit.at < 20*60*1000) return;        // 20分は 同じ おきゃくさん
  H.visit = null;
  if(H.lastTry && now - H.lastTry < 3*60*1000) return;        // 3分に 1回 ちゅうせん
  H.lastTry = now;
  if(Math.random() < visitChance()){
    const r = t.res[Math.random()*t.res.length|0];
    H.visit = {id:r.id, at:now, gift:Math.random() < 0.25, x:rint(0,ROOM.cols-1), y:ROOM.rows-1};
    H.lastVisit = dayKey(); H.visits = (H.visits||0) + 1;
    setTimeout(() => { if(curScreen==='myhome'){ toast(`🔔 ピンポーン！ ${r.name}が あそびに きたよ！`); sound('fan'); } }, 500);
  }
  persist();
}
const VS = {el:null, x:0, y:0, timer:null};
function stopVisitor(){ if(VS.timer){ clearInterval(VS.timer); VS.timer = null; } }
function placeVisitor(){
  stopVisitor();
  const H = ensureHome(), room = $('#room'); room.querySelectorAll('.visitor').forEach(e => e.remove());
  const v = H.visit; if(!v) return;
  const r = save.town.res.find(x => x.id===v.id); if(!r){ H.visit = null; return; }
  const el = document.createElement('button'); el.className = 'visitor';
  el.innerHTML = `${resPic(r,'wimg')}<span class="wname">${esc(r.name)}</span><span class="vb">${v.gift ? '🎁' : '💬'}</span>`;
  room.appendChild(el); VS.el = el; VS.x = v.x; VS.y = v.y; moveVisitor(true);
  VS.timer = setInterval(() => {
    if(curScreen!=='myhome' || homeEdit || $('#dlg').classList.contains('show')) return;
    if(Math.random() < 0.35) return;
    const dirs = shuffle([[1,0],[-1,0],[0,1],[0,-1]]);
    for(const [dx,dy] of dirs){ const nx = VS.x+dx, ny = VS.y+dy; if(nx>=0 && ny>=0 && nx<ROOM.cols && ny<ROOM.rows){ if(dx) VS.flip = dx<0; VS.x = nx; VS.y = ny; break; } }
    v.x = VS.x; v.y = VS.y; moveVisitor();
  }, 1400);
}
function moveVisitor_v6(instant){
  const el = VS.el; if(!el) return; const cs = parseFloat($('#room').style.getPropertyValue('--rc')) || 80, W = cs*0.95;
  if(instant) el.style.transition = 'none';
  el.style.width = W+'px'; el.style.left = (VS.x*cs + (cs-W)/2)+'px'; el.style.top = (VS.y*cs + cs - W*1.15)+'px'; el.style.zIndex = VS.y*10 + 6;
  el.querySelector('.wimg')?.classList.toggle('flip', !!VS.flip);
  if(instant){ void el.offsetWidth; el.style.transition = ''; }
}
async function talkVisitor(){
  const H = ensureHome(), v = H.visit; if(!v) return;
  const r = save.town.res.find(x => x.id===v.id); if(!r) return;
  const s = SP(r.sp), R = RARITY[s.rar||1];
  VS.el?.classList.add('happy'); setTimeout(() => VS.el?.classList.remove('happy'), 1600);
  sound('ok');
  let giftHTML = '';
  if(v.gift){
    v.gift = false;
    const cheap = FURNITURE.filter(f => !f.special && (f.lv||1) <= save.town.lv+2 && f.price <= 500);
    if(Math.random() < 0.3 && cheap.length){
      const f = pick(cheap); H.inv[f.id] = (H.inv[f.id]||0) + 1;
      giftHTML = `<div class="giftBox"><img src="${esc(artSrc(f.art))}" alt=""><div>おみやげ：<b>${esc(f.name)}</b>を もらった！<br><small>「もようがえ」で おけるよ</small></div></div>`;
    } else {
      const p = rint(2,6)*10; addPoints(p, `${r.name}から おみやげ`);
      giftHTML = `<div class="giftBox"><span class="coin">P</span><div>おみやげ：<b>${p}pt</b> もらった！</div></div>`;
    }
    r.fr = (r.fr||0) + 1; confetti(1400);
    const b = VS.el?.querySelector('.vb'); if(b) b.textContent = '💬';
  }
  persist();
  const line = giftHTML ? pick(TALK.gift) : talkLine(r, 'visit');
  const go = await dialog(`<div class="talkWrap rk${R.k}" style="--rb:${R.bg}">
      <div class="talkPic happy">${resPic(r)}<span class="spark s1">✨</span><span class="spark s2">💕</span><span class="spark s3">✨</span></div>
      <div class="talkBubble"><b>${esc(r.name)}</b><span>${esc(line)}</span></div></div>${giftHTML}
    <div class="frRow">なかよし ${hearts(r)}</div>`,
    [{label:'またね！', cls:'', v:false}, {label:'👋 おみおくり', cls:'white', v:true}], 'wide talk');
  if(go){ H.visit = null; persist(); toast(`${r.name}「また あそびに くるね〜！」`); placeVisitor(); }
}

/* ---------- 画面のつなぎ ---------- */
$('#zoomIn').onclick = () => setZoom(townZoom()+0.15);
$('#zoomOut').onclick = () => setZoom(townZoom()-0.15);
$('#goMyHome').onclick = () => show('myhome');
$('#btnToHome').onclick = () => show('myhome');
window.addEventListener('resize', () => { if(curScreen==='myhome') setTimeout(renderMyHome, 160); });
BADGES.push(
  {id:'myhome1', i:'🛋️', n:'家具 10こ',     f:()=>(save.myhome?.items.length||0)>=10},
  {id:'myhome2', i:'🏰', n:'すてき度 100',  f:()=>save.myhome && homeStyle()>=100},
  {id:'visit1',  i:'🔔', n:'はじめての おきゃくさん', f:()=>(save.myhome?.visits||0)>=1},
  {id:'friend5', i:'💗', n:'なかよし MAX',  f:()=>(save.town?.res||[]).some(r=>frLv(r)>=5)}
);


/* =====================================================================
   v0.7：みちの しゅるい・車が まちを はしる・住民の ランクアップ衣装・
         家具の むき／へやの 立体表示・えいご（瞬間英作文）
   ===================================================================== */
function isRoadId(id){ return !!id && (id==='road' || String(id).startsWith('road_')); }

/* ---------- みち（しゅるいごとの 見た目） ---------- */
function roadHTML(x, y){
  const c = save.town.cells, me = c[`${x},${y}`], isR = (a,b) => isRoadId(c[`${a},${b}`]);
  const n = isR(x,y-1), s = isR(x,y+1), w = isR(x-1,y), e = isR(x+1,y);
  let h = `<div class="rd t-${me}"><i class="c"></i>` + (n?'<i class="n"></i>':'') + (s?'<i class="s"></i>':'') + (w?'<i class="w"></i>':'') + (e?'<i class="e"></i>':'');
  if(me==='road'){
    const horiz = (w||e) && !(n||s), vert = (n||s) && !(w||e), zebra = ((x*7 + y*3) % 4) === 0;
    if(horiz) h += zebra ? '<i class="zh"></i>' : `<i class="lnh" style="--l:${w?0:'22%'};--r:${e?0:'22%'}"></i>`;
    else if(vert) h += zebra ? '<i class="zv"></i>' : `<i class="lnv" style="--t:${n?0:'22%'};--b:${s?0:'22%'}"></i>`;
  }
  return h + '</div>';
}

/* ---------- 車が まちの みちを はしる ---------- */
const CAR = {list:[], cs:60};
const roadCells = () => Object.entries(save.town.cells).filter(([k,id]) => isRoadId(id)).map(([k]) => k.split(',').map(Number));
const mapCarsOn = () => roadCells().length >= 2;
function buildCars(cs){
  CAR.cs = cs;
  const map = $('#townMap'); map.querySelectorAll('.car2').forEach(e => e.remove());
  CAR.list = [];
  const t = save.town, rc = roadCells();
  if(rc.length < 2) return;
  t.veh.slice(0, 60).forEach((id, i) => {
    const it = ITEM(id); if(!it) return;
    const [x,y] = rc[(i*7 + rint(0, rc.length-1)) % rc.length];
    const el = document.createElement('button'); el.className = 'car2'; el.dataset.id = id;
    el.innerHTML = picHTML(it);
    const small = id==='bicycle' || id==='scooter';
    el.style.height = Math.round(cs*(small ? 0.36 : 0.44)) + 'px';
    map.appendChild(el);
    const c = {id, x, y, px:null, py:null, dx:1, dy:0, flip:false, el, wait:rint(0,2)};
    CAR.list.push(c); placeCar(c, true);
  });
}
function placeCar(c, instant){
  const cs = CAR.cs, el = c.el; if(!el) return;
  let lx = c.x*cs + cs/2, ly = c.y*cs + cs*0.66;
  if(c.dy===0) ly += (c.dx>0 ? 0.1 : -0.06)*cs; else lx += (c.dy>0 ? -0.12 : 0.12)*cs;
  if(instant) el.style.transition = 'none';
  el.style.left = lx + 'px'; el.style.top = ly + 'px';
  el.style.zIndex = Math.max(c.y, c.py ?? c.y)*10 + 4;
  el.classList.toggle('flip', c.flip); el.classList.toggle('vert', c.dy!==0);
  if(instant){ void el.offsetWidth; el.style.transition = ''; }
}
function moveCars(){
  const cells = save.town.cells;
  CAR.list.forEach(c => {
    if(c.wait > 0){ c.wait--; return; }
    const opts = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy]) => isRoadId(cells[`${c.x+dx},${c.y+dy}`]) && !railBlock(c.x,c.y,c.x+dx,c.y+dy));
    if(!opts.length) return;
    let ch = opts.filter(([dx,dy]) => !(dx===-c.dx && dy===-c.dy));
    if(!ch.length) ch = opts;
    const straight = ch.find(([dx,dy]) => dx===c.dx && dy===c.dy);
    const [dx,dy] = (straight && Math.random() < 0.65) ? straight : ch[Math.random()*ch.length|0];
    c.py = c.y; c.x += dx; c.y += dy; c.dx = dx; c.dy = dy;
    if(dx) c.flip = dx < 0;
    placeCar(c);
    if(Math.random() < 0.06) c.wait = rint(1,3);
  });
}
$('#townMap').addEventListener('click', e => {
  const b = e.target.closest('.car2'); if(!b) return;
  const it = ITEM(b.dataset.id); if(it){ toast(`${it.name}：${itemEffect(it)}`); sound('tap'); }
});

/* =====================================================================
   住民の ランクアップ衣装
   ===================================================================== */
const HEADS = {"res_cat": {"top": 0.085, "hw": 0.831, "cx": 0.491, "ar": 1.25}, "res_dog": {"top": 0.08, "hw": 0.731, "cx": 0.417, "ar": 1.143}, "res_sparrow": {"top": 0.0, "hw": 0.485, "cx": 0.502, "ar": 0.88, "hs": 0.75}, "res_rabbit": {"top": 0.15, "hw": 0.617, "cx": 0.505, "ar": 1.869, "hs": 0.95, "dy": 0.13}, "res_tanuki": {"top": 0.0, "hw": 0.685, "cx": 0.449, "ar": 1.015}, "res_bear": {"top": 0.035, "hw": 0.756, "cx": 0.466, "ar": 1.25}, "res_squirrel": {"top": 0.0, "hw": 0.806, "cx": 0.565, "ar": 1.047}, "res_fox": {"top": 0.09, "hw": 0.683, "cx": 0.407, "ar": 1.005}, "res_panda": {"top": 0.045, "hw": 0.786, "cx": 0.398, "ar": 1.02}, "res_hamster": {"top": 0.01, "hw": 0.802, "cx": 0.517, "ar": 1.163}, "res_penguin": {"top": 0.0, "hw": 0.633, "cx": 0.494, "ar": 1.111}, "res_sheep": {"top": 0.0, "hw": 0.571, "cx": 0.533, "ar": 1.01}, "res_pig": {"top": 0.0, "hw": 0.99, "cx": 0.5, "ar": 0.97, "hs": 0.42, "dy": 0.12}, "res_frog": {"top": 0.0, "hw": 0.84, "cx": 0.5, "ar": 1.143}, "res_owl": {"top": 0.04, "hw": 0.828, "cx": 0.471, "ar": 1.149}, "res_koala": {"top": 0.033, "hw": 0.96, "cx": 0.495, "ar": 0.905, "hs": 0.45}, "res_seal": {"top": 0.0, "hw": 0.46, "cx": 0.42, "ar": 0.74, "hs": 0.75}, "res_hedgehog": {"top": 0.0, "hw": 0.713, "cx": 0.494, "ar": 1.149}, "res_otter": {"top": 0.0, "hw": 0.598, "cx": 0.41, "ar": 1.005}, "res_redpanda": {"top": 0.017, "hw": 0.69, "cx": 0.36, "ar": 0.89}, "res_alpaca": {"top": 0.005, "hw": 0.724, "cx": 0.414, "ar": 1.493}, "bird_wave": {"top": 0.033, "hw": 0.571, "cx": 0.648, "ar": 0.794, "hs": 0.7, "dy": 0.08}};
const RANK_HAT = {know:'gradcap', work:'hardhat', biz:'tophat', pop:'flowercrown', drive:'drivercap', all:'tiara'};
const RANK_LOOK = {3:'ちしきの ぼうしで かしこく なったよ！', 4:'メダルを もらって りっぱに なったよ！', 5:'おうかんと マントで ゴージャスに なったよ！'};
function resPic(r, cls=''){
  const s = SP(r.sp), src = s.img || artSrc(s.art);
  if(!src) return picHTML(s, cls);
  const H = Object.assign({top:.05, hw:.7, cx:.5, dy:.10, hs:.62, capeY:.45}, HEADS[s.art] || {});
  const st = r.star || 1;
  let back = '', front = '';
  if(st >= 5){
    back += `<img class="acc cape" src="${esc(artSrc('acc_cape'))}" alt="" style="left:${H.cx*100}%;top:${H.capeY*100}%;width:105%">`;
  }
  if(st >= 3){
    const hat = st >= 5 ? 'crown' : (RANK_HAT[s.bias] || 'gradcap');
    const w = H.hw * H.hs * (st >= 5 ? 1.0 : 1.05) * 100;
    front += `<img class="acc hat" src="${esc(artSrc('acc_'+hat))}" alt="" style="left:${H.cx*100}%;top:${(H.top+H.dy)*100}%;width:${w}%">`;
  }
  if(st >= 4) front += `<img class="acc medal" src="${esc(artSrc('acc_medal'))}" alt="" style="left:${(H.cx+0.18)*100}%;top:${(H.medY||0.62)*100}%;width:20%">`;
  return `<span class="rpic r${Math.min(st,5)} ${cls}">${back}<img class="rb" src="${esc(src)}" alt="">${front}${st>=5?'<i class="aura"></i>':''}</span>`;
}

/* =====================================================================
   わたしの家：立体の へや・家具の むき
   ===================================================================== */
const FUR_SIZE = {bed:1.7, sofa:1.6, table:1.25, chair:.95, rug:1.75, plant:1.05, lamp:1.0, teddy:.95, shelf:1.25, desk:1.5, globe:.8,
  toybox:1.0, painting:1.0, clock:1.05, tv:1.3, fridge:1.0, kitchen:1.7, wardrobe:1.3, starlight:.7, aquarium:1.4, piano:1.6,
  trainset:1.4, dollhouse:1.2, shimaplush:.9};
let homeSel = -1;
function roomGeo(){
  const W = Math.max(280, $('#roomWrap').clientWidth - 6), bk = 0.72, wallH = W*0.24, floorH = W*0.56, R = ROOM.rows;
  const se = e => bk + (1-bk)*e/R;
  const raw = []; for(let i=0;i<R;i++) raw.push((se(i)+se(i+1))/2);
  const sum = raw.reduce((a,b)=>a+b,0), ys = [wallH];
  raw.forEach(v => ys.push(ys[ys.length-1] + floorH*v/sum));
  return {W, bk, wallH, floorH, H:wallH+floorH+6, se, ys,
    sAt(py){ const t = clamp((py-wallH)/floorH, 0, 1); return bk + (1-bk)*t; }};
}
function cellCenter(g, x, y){
  const s = (g.se(y)+g.se(y+1))/2, cw = g.W*s/ROOM.cols;
  return {cx: g.W/2 + (x+0.5-ROOM.cols/2)*cw, by: g.ys[y] + (g.ys[y+1]-g.ys[y])*0.8, cw, s};
}
function cellFromPoint(g, px, py){
  if(py < g.ys[0] || py > g.ys[ROOM.rows]) return null;
  let y = 0; while(y < ROOM.rows-1 && py >= g.ys[y+1]) y++;
  const s = g.sAt(py), rw = g.W*s, x0 = (g.W-rw)/2, x = Math.floor((px-x0)/(rw/ROOM.cols));
  return (x<0 || x>=ROOM.cols) ? null : {x, y};
}
function renderMyHome(){
  const H = ensureHome(), sty = homeStyle();
  const Wl = WALLS.find(w=>w.id===H.wall) || WALLS[0], F = FLOORS.find(f=>f.id===H.floor) || FLOORS[0];
  $('#homeHead').innerHTML = `<div class="hmTitle">🏡 わたしの家</div>
    <div class="hmStats"><span>✨ すてき度 <b>${sty}</b></span><span>📘 ちしき <b>+${Math.round(homeKnow()*100)}%</b></span><span>🪑 家具 <b>${H.items.length}</b></span></div>`;
  const g = roomGeo(), bl = (g.W - g.W*g.bk)/2, box = $('#room3d');
  box.style.width = g.W+'px'; box.style.height = g.H+'px';
  const pct = (x,y) => `${x}px ${y}px`;
  box.querySelector('.rwall.back').style.cssText = `left:${bl}px;top:0;width:${g.W-2*bl}px;height:${g.wallH}px;background:${Wl.css}`;
  box.querySelector('.rwall.left').style.cssText = `inset:0;background:${Wl.css};clip-path:polygon(${pct(0,0)},${pct(bl,0)},${pct(bl,g.wallH)},${pct(0,g.ys[ROOM.rows])})`;
  box.querySelector('.rwall.right').style.cssText = `inset:0;background:${Wl.css};clip-path:polygon(${pct(g.W-bl,0)},${pct(g.W,0)},${pct(g.W,g.ys[ROOM.rows])},${pct(g.W-bl,g.wallH)})`;
  box.querySelector('.rfloor').style.cssText = `inset:0;background:${F.css};clip-path:polygon(${pct(bl,g.wallH)},${pct(g.W-bl,g.wallH)},${pct(g.W,g.ys[ROOM.rows])},${pct(0,g.ys[ROOM.rows])})`;
  box.querySelector('.rlight').style.cssText = `inset:0;clip-path:polygon(${pct(bl,g.wallH)},${pct(g.W-bl,g.wallH)},${pct(g.W,g.ys[ROOM.rows])},${pct(0,g.ys[ROOM.rows])})`;
  box.querySelector('.rbase').style.cssText = `left:${bl}px;top:${g.wallH-6}px;width:${g.W-2*bl}px`;
  // マス目（もようがえ中だけ）
  let svg = '';
  if(homeEdit){
    for(let e=0;e<=ROOM.rows;e++){ const s = g.se(e), x0 = (g.W-g.W*s)/2; svg += `<line x1="${x0}" y1="${g.ys[e]}" x2="${g.W-x0}" y2="${g.ys[e]}"/>`; }
    for(let c=0;c<=ROOM.cols;c++){ const xb = bl + (g.W-2*bl)*c/ROOM.cols, xf = g.W*c/ROOM.cols; svg += `<line x1="${xb}" y1="${g.ys[0]}" x2="${xf}" y2="${g.ys[ROOM.rows]}"/>`; }
  }
  const gr = box.querySelector('.rgrid'); gr.setAttribute('viewBox', `0 0 ${g.W} ${g.H}`); gr.innerHTML = svg;
  // 家具
  let h = '';
  H.items.forEach((it, idx) => {
    const f = FUR(it.id); if(!f) return;
    const c = cellCenter(g, it.x, it.y), size = FUR_SIZE[f.id] || 1, w = c.cw*size;
    const dim = (0.9 + 0.1*(it.y/(ROOM.rows-1))).toFixed(3);
    if(!f.floor) h += `<i class="fshadow" style="left:${c.cx}px;top:${c.by}px;width:${w*0.78}px;height:${w*0.2}px;z-index:${it.y*10+3}"></i>`;
    h += `<img class="fimg2 ${f.floor?'flr':''} ${it.f?'flip':''} ${homeEdit && idx===homeSel?'sel':''}" data-idx="${idx}" src="${esc(artSrc(f.art))}" alt=""
      style="left:${c.cx}px;top:${c.by + (f.floor ? c.cw*0.35 : 0)}px;width:${w}px;z-index:${f.floor ? 2 : it.y*10+5};filter:brightness(${dim})${homeEdit && idx===homeSel ? ' drop-shadow(0 0 6px #FF7E9D) drop-shadow(0 0 3px #fff)' : ' drop-shadow(0 3px 2px rgba(0,0,0,.12))'}">`;
  });
  $('#room').innerHTML = h;
  $('#btnHomeEdit').textContent = homeEdit ? '✔ もようがえ おわり' : '🛠 もようがえ';
  $('#btnHomeEdit').classList.toggle('pink', homeEdit);
  renderHomeTray();
  if(!homeEdit) placeVisitor(true);
}
function renderHomeTray(){
  const tr = $('#homeTray'); tr.classList.toggle('hidden', !homeEdit);
  if(!homeEdit) return;
  const H = ensureHome();
  $$('#homeTabs button').forEach(b => b.classList.toggle('on', b.dataset.v===homeTab));
  let h = '';
  if(homeTab==='fur'){
    const ids = Object.keys(H.inv).filter(k => H.inv[k] > 0 && FUR(k));
    h = ids.length ? ids.map(id => `<button class="trayIt ${homeHand && homeHand.from==='inv' && homeHand.id===id ? 'on':''}" data-id="${id}"><img src="${esc(artSrc(FUR(id).art))}" alt=""><span>${esc(FUR(id).name)}</span><b>×${H.inv[id]}</b></button>`).join('')
      : `<div class="note" style="padding:10px">もちものの 家具は ないよ。「家具を かう」で そろえよう！</div>`;
  } else {
    const list = homeTab==='wall' ? WALLS : FLOORS, owned = homeTab==='wall' ? H.walls : H.floors, curId = homeTab==='wall' ? H.wall : H.floor;
    h = list.map(w => `<button class="trayIt sw ${w.id===curId?'on':''}" data-sw="${w.id}"><span class="swatch" style="background:${w.css}"></span><span>${esc(w.name)}</span>${owned.includes(w.id) ? '' : `<b class="pr">${w.price}pt</b>`}</button>`).join('');
  }
  $('#homeTrayItems').innerHTML = h;
  const sel = H.items[homeSel];
  let msg;
  if(homeTab!=='fur') msg = homeTab==='wall' ? 'かべがみを えらんでね' : 'ゆかを えらんでね';
  else if(homeHand) msg = `<img class="handImg ${homeHand.f?'flip':''}" src="${esc(artSrc(FUR(homeHand.id).art))}" alt=""> ${esc(FUR(homeHand.id).name)}を もっているよ。マスを タッチして おこう
      <span class="selBtns"><button class="btn small white" data-act="flipHand">🔄 むき</button></span>`;
  else if(sel) msg = `<img class="handImg ${sel.f?'flip':''}" src="${esc(artSrc(FUR(sel.id).art))}" alt=""> ${esc(FUR(sel.id).name)}を えらんだよ。あいている マスを タッチすると いどう
      <span class="selBtns"><button class="btn small orange" data-act="flip">🔄 むきを かえる</button><button class="btn small white" data-act="store">🗃 しまう</button><button class="btn small white" data-act="unsel">✕</button></span>`;
  else msg = 'おく 家具を えらぶか、へやの 家具を タッチしてね（もう一度 タッチで むきが かわるよ）';
  $('#homeHand').innerHTML = msg;
  $('#btnHomeStore').disabled = !homeHand && !sel;
}
$('#homeHand').addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if(!b) return;
  const H = ensureHome(), a = b.dataset.act, sel = H.items[homeSel];
  if(a==='flipHand' && homeHand){ homeHand.f = homeHand.f ? 0 : 1; renderHomeTray(); return; }
  if(a==='flip' && sel){ sel.f = sel.f ? 0 : 1; sound('tap'); persist(); renderMyHome(); }
  if(a==='store' && sel){ H.items.splice(homeSel,1); H.inv[sel.id] = (H.inv[sel.id]||0)+1; homeSel = -1; persist(); renderMyHome(); }
  if(a==='unsel'){ homeSel = -1; renderMyHome(); }
});
function roomClick(e){
  const v = e.target.closest('.visitor');
  if(v && !homeEdit){ talkVisitor(); return; }
  const H = ensureHome(), box = $('#room3d').getBoundingClientRect(), g = roomGeo();
  const px = (e.clientX - box.left) * (g.W/box.width), py = (e.clientY - box.top) * (g.H/box.height);
  const imgEl = e.target.closest('.fimg2');
  let cell = imgEl ? {x:H.items[+imgEl.dataset.idx]?.x, y:H.items[+imgEl.dataset.idx]?.y} : cellFromPoint(g, px, py);
  if(!cell || cell.x==null) return;
  const {x, y} = cell;
  const hereIdx = H.items.map((it,i) => [it,i]).filter(([it]) => it.x===x && it.y===y);
  const topIdx = (hereIdx.find(([it]) => !FUR(it.id)?.floor) || hereIdx[0] || [null,-1])[1];
  if(!homeEdit){ if(topIdx>=0){ const f = FUR(H.items[topIdx].id); toast(`${f.name}（すてき度 +${f.sty}）`); } else toast('「もようがえ」で 家具を おけるよ'); return; }
  if(homeHand){
    const f = FUR(homeHand.id);
    if(hereIdx.some(([it]) => !!FUR(it.id)?.floor === !!f.floor)){ toast('ここには もう おいてあるよ'); return; }
    H.items.push({id:homeHand.id, x, y, f:homeHand.f||0}); sound('tap');
    if(homeHand.from==='inv'){ H.inv[homeHand.id]--; if(H.inv[homeHand.id] <= 0){ delete H.inv[homeHand.id]; homeHand = null; } } else homeHand = null;
    persist(); renderMyHome(); return;
  }
  if(topIdx >= 0){
    if(topIdx === homeSel){ const it = H.items[topIdx]; it.f = it.f ? 0 : 1; sound('tap'); persist(); }
    else homeSel = topIdx;
    renderMyHome(); return;
  }
  const sel = H.items[homeSel];
  if(sel){
    const f = FUR(sel.id);
    if(hereIdx.some(([it]) => !!FUR(it.id)?.floor === !!f.floor)){ toast('ここには もう おいてあるよ'); return; }
    sel.x = x; sel.y = y; sound('tap'); persist(); renderMyHome();
  }
}

function moveVisitor(instant){
  const el = VS.el; if(!el) return; const g = roomGeo(), c = cellCenter(g, VS.x, VS.y), W = c.cw*0.95;
  if(instant) el.style.transition = 'none';
  el.style.width = W+'px'; el.style.left = (c.cx - W/2)+'px'; el.style.top = (c.by - W*1.12)+'px'; el.style.zIndex = VS.y*10 + 6;
  el.querySelector('.wimg')?.classList.toggle('flip', !!VS.flip);
  if(instant){ void el.offsetWidth; el.style.transition = ''; }
}

/* =====================================================================
   えいご：瞬間英作文（おとなの 自己学習むけ）
   ===================================================================== */
const ENG_SEED = [["今から出かけます。", "I'm leaving now.", "I'm going out now. でもOK", "日常"], ["電車が少し遅れています。", "The train is running a little late.", "be running late＝遅れている", "日常"], ["昨日はとても疲れていました。", "I was very tired yesterday.", "", "日常"], ["コーヒーをもう一杯ください。", "Could I have another cup of coffee?", "another＝もう一つ", "日常"], ["明日は家でゆっくりする予定です。", "I'm going to relax at home tomorrow.", "予定は be going to", "日常"], ["その映画はまだ見ていません。", "I haven't seen that movie yet.", "現在完了＋yet", "日常"], ["私は毎朝6時に起きます。", "I get up at six every morning.", "習慣は現在形", "日常"], ["昼ご飯はもう食べました。", "I've already had lunch.", "have already＋過去分詞", "日常"], ["今日は少し忙しいです。", "I'm a little busy today.", "", "日常"], ["財布を家に忘れました。", "I left my wallet at home.", "場所がある時は forget でなく leave", "日常"], ["それは面白そうですね。", "That sounds interesting.", "sound＋形容詞＝～そう", "感想"], ["私もそう思います。", "I think so, too.", "I agree. でもOK", "感想"], ["それは良いアイデアだと思います。", "I think that's a good idea.", "", "感想"], ["その話は初めて聞きました。", "This is the first time I've heard that.", "I've never heard that before. でもOK", "感想"], ["それには驚きました。", "I was surprised by that.", "", "感想"], ["その店は思ったより高かったです。", "That shop was more expensive than I expected.", "than I expected＝思ったより", "感想"], ["私はその本がとても気に入りました。", "I really liked that book.", "", "感想"], ["それは必ずしも正しいとは限りません。", "That's not necessarily true.", "not necessarily＝必ずしも～ない", "感想"], ["私には少し難しすぎます。", "It's a little too difficult for me.", "too＋形容詞＋for 人", "感想"], ["その方が簡単だと思います。", "I think that would be easier.", "would で控えめに", "感想"], ["どちらの出身ですか？", "Where are you from?", "", "旅行・雑談"], ["仕事でここに来ています。", "I'm here on business.", "on business＝仕事で", "旅行・雑談"], ["日本には来たことがありますか？", "Have you ever been to Japan?", "経験は have been to", "旅行・雑談"], ["おすすめのレストランはありますか？", "Can you recommend a good restaurant?", "", "旅行・雑談"], ["写真を撮ってもらえますか？", "Could you take a picture for me?", "Could you～？＝丁寧な依頼", "旅行・雑談"], ["どのくらい滞在する予定ですか？", "How long are you planning to stay?", "", "旅行・雑談"], ["道に迷ってしまいました。", "I got lost.", "I'm lost. でもOK", "旅行・雑談"], ["今日は天気がいいですね。", "It's a nice day today, isn't it?", "付加疑問で同意を求める", "旅行・雑談"], ["私は週末によく散歩します。", "I often take a walk on weekends.", "", "旅行・雑談"], ["あなたの趣味は何ですか？", "What do you do in your free time?", "What are your hobbies? より自然", "旅行・雑談"], ["もう少し詳しく説明してもらえますか？", "Could you explain that in a little more detail?", "in detail＝詳しく", "会話をつなぐ"], ["つまりこういうことですか？", "So, you mean ...?", "Do you mean that ...? でもOK", "会話をつなぐ"], ["なるほど、分かりました。", "I see. That makes sense.", "", "会話をつなぐ"], ["その点についてはよく分かりません。", "I'm not sure about that point.", "", "会話をつなぐ"], ["少し考えさせてください。", "Let me think about it for a moment.", "Let me＋動詞＝～させて", "会話をつなぐ"], ["別の言い方をしてもらえますか？", "Could you rephrase that?", "Could you say that another way? でもOK", "会話をつなぐ"], ["私が言いたいのはこういうことです。", "What I'm trying to say is this.", "What I mean is ... でもOK", "会話をつなぐ"], ["例えばこんなケースです。", "For example, here's a case.", "Let me give you an example.", "会話をつなぐ"], ["それについては確認が必要です。", "I need to check on that.", "", "会話をつなぐ"], ["後で連絡します。", "I'll get back to you later.", "get back to＝折り返す", "会話をつなぐ"], ["この部品は在庫が不足しています。", "We're running short of this part.", "run short of＝不足する", "実務"], ["納期が予定より長くなっています。", "The lead time is longer than planned.", "than planned＝予定より", "実務"], ["原因を調査しています。", "We're investigating the cause.", "look into でもOK", "実務"], ["サプライヤーと調整中です。", "We're coordinating with the supplier.", "", "実務"], ["来週までに結論を出す予定です。", "We plan to reach a conclusion by next week.", "by＝～までに（期限）", "実務"], ["この工程は自動化できます。", "This process can be automated.", "受動態＋can", "実務"], ["品質に大きな問題はありません。", "There are no major quality issues.", "", "実務"], ["もう少しデータが必要です。", "We need a bit more data.", "", "実務"], ["リスクを事前に洗い出したいです。", "We want to identify the risks in advance.", "identify＝洗い出す", "実務"], ["まず現状を整理しましょう。", "Let's start by summarizing where we are.", "start by ～ing＝まず～から始める", "実務"], ["朝ごはんは食べましたか？", "Did you have breakfast?", "食事は eat より have が自然。「〜を食べた？」は Did you have 〜? が定番。Have you had breakfast yet?（もう食べた？）も可。", "日常"], ["今日は早く帰ります。", "I'm going home early today.", "確定した近い予定は現在進行形で表す。go home の home は副詞なので to は不要（× go to home）。", "日常"], ["傘を持ってくるのを忘れました。", "I forgot to bring my umbrella.", "forget to 〜＝（これからすること）を忘れる。forget 〜ing は「〜したことを忘れる」で意味が変わる。bring＝持ってくる、take＝持っていく。", "日常"], ["最近よく眠れていません。", "I haven't been sleeping well lately.", "現在完了進行形（have been 〜ing）で「最近ずっと〜している」。lately／recently は現在完了と相性が良い。", "日常"], ["週末は家族と過ごしました。", "I spent the weekend with my family.", "spend＋時間＋with 人＝〜と時間を過ごす。spend＋時間＋〜ing なら「〜して過ごす」（I spent the weekend reading.）。", "日常"], ["駅まで歩いて10分です。", "It's a ten-minute walk to the station.", "数字＋名詞をハイフンでつなぐと形容詞になり、名詞は単数形（ten-minute）。It takes ten minutes to walk to the station. でも同じ意味。", "日常"], ["雨が降りそうです。", "It looks like it's going to rain.", "It looks like＋文＝（見た感じ）〜しそう。根拠があるときは be going to が自然。It might rain.（降るかも）は確信度が低い。", "日常"], ["少し休憩しましょう。", "Let's take a short break.", "take a break＝休憩する。会議では Let's take a five-minute break. のように時間を入れると具体的。", "日常"], ["もうすぐ着きます。", "I'll be there soon.", "相手のいる場所へ「行く」ときは be there。I'm coming. も「今行きます」の意味で使える（go ではなく come）。", "日常"], ["道が混んでいます。", "The traffic is heavy.", "渋滞は traffic で表し、heavy／light で量を言う。I'm stuck in traffic.（渋滞にはまっている）もよく使う。× The road is crowded. は不自然。", "日常"], ["最近、運動不足です。", "I haven't been getting enough exercise lately.", "「運動不足」は I don't get enough exercise. で表す。exercise は不可算名詞なので a は付けない。", "日常"], ["今夜は外食するつもりです。", "I'm planning to eat out tonight.", "eat out＝外食する。plan to 〜＝〜するつもり。I'm going to eat out tonight. でも可。", "日常"], ["鍵をどこに置いたか覚えていません。", "I don't remember where I put my keys.", "疑問文が文の中に入ると平叙文の語順になる（where I put）。× where did I put とはしない。", "日常"], ["スマホの充電が切れそうです。", "My phone is about to die.", "be about to＝今にも〜しそう。die＝（電池が）切れる、の口語表現。My battery is running low. も可。", "日常"], ["今日は在宅勤務です。", "I'm working from home today.", "work from home（WFH）＝在宅勤務。remote work も同じ意味。I'm working remotely today. でも可。", "日常"], ["寝坊してしまいました。", "I overslept.", "oversleep（過去形 overslept）＝寝坊する。遅刻の理由なら I overslept, so I'm running late.", "日常"], ["風邪をひいたみたいです。", "I think I caught a cold.", "catch a cold＝風邪をひく。I have a cold.（風邪をひいている）は状態を表す。I think で断定を和らげる。", "日常"], ["もう少しで終わります。", "I'm almost done.", "almost done＝ほぼ終わった。done は形容詞的に使う。Almost there. も「もう少し」の口語表現。", "日常"], ["エアコンをつけてもいいですか？", "Do you mind if I turn on the air conditioner?", "Do you mind if 〜？は直訳すると「〜したら嫌ですか？」。OKなら Not at all. や No, go ahead. と否定で答えるのに注意。", "日常"], ["この近くにコンビニはありますか？", "Is there a convenience store near here?", "Is there 〜 near here?＝この近くに〜はありますか？場所を聞くときの基本形。around here でも可。", "日常"], ["今日は何曜日ですか？", "What day is it today?", "曜日は What day、日付は What's the date。What day is it today? に対して It's Friday. のように答える。", "日常"], ["最近、料理を始めました。", "I recently started cooking.", "recently は過去形とも現在完了とも使える。start 〜ing／start to 〜 はどちらも可。I've started cooking recently. も可。", "日常"], ["子どもを迎えに行かなければなりません。", "I have to pick up my kids.", "pick up＝（人を）迎えに行く、（物を）取りに行く。have to＝（事情があって）〜しなければならない。", "日常"], ["その時間なら空いています。", "I'm free at that time.", "free＝空いている、予定がない。I'm available at that time. はビジネス向けの言い方。", "日常"], ["夜はいつも何時に寝ますか？", "What time do you usually go to bed?", "go to bed＝寝る（床につく）。sleep は「眠っている」状態。usually の位置は do you の後ろ、動詞の前。", "日常"], ["朝は弱いです。", "I'm not a morning person.", "a morning person＝朝型の人。逆は a night owl（夜型の人）。× I'm weak in the morning. とは言わない。", "日常"], ["お腹が空きました。", "I'm hungry.", "I'm hungry. は状態を表すので現在形。I'm starving.（腹ペコ）は強調表現。", "日常"], ["少し寒くなってきました。", "It's getting a little cold.", "be getting＋形容詞＝だんだん〜になってきている。It's getting dark／late. などにも使える。", "日常"], ["ちょうど出るところです。", "I'm just about to leave.", "be just about to 〜＝ちょうど〜するところ。I'm on my way out. も「今出るところ」の口語表現。", "日常"], ["もう少しゆっくり話してもらえますか？", "Could you speak a little more slowly?", "Could you 〜？は丁寧な依頼。slowly は副詞で、比較級は more slowly。聞き取れないときに必須の表現。", "日常"], ["それは残念ですね。", "That's too bad.", "相手の残念な話への定番の返し。I'm sorry to hear that. はより丁寧で、深刻な話にも使える。", "感想・意見"], ["それは良かったですね。", "I'm glad to hear that.", "glad to hear＝聞いてうれしい。Good for you! はカジュアルで、相手の成功を祝うときに使う。", "感想・意見"], ["本当ですか？信じられません。", "Really? I can't believe it.", "驚きの定番表現。良い意味にも悪い意味にも使える。No way!（まさか！）はよりカジュアル。", "感想・意見"], ["それは大変でしたね。", "That must have been hard.", "must have＋過去分詞＝〜だったに違いない（過去の推量）。That sounds tough. も同じ場面で使える。", "感想・意見"], ["楽しみにしています。", "I'm looking forward to it.", "look forward to の to は前置詞なので、後ろは名詞か 〜ing（× look forward to see）。ビジネスメールでも頻出。", "感想・意見"], ["それは知りませんでした。", "I didn't know that.", "知らなかった情報を聞いたときの返し。I had no idea.（全然知らなかった）は驚きが強い。", "感想・意見"], ["私はそうは思いません。", "I don't think so.", "英語は否定を前に出すのが自然（× I think it's not so.）。柔らかく言うなら I'm not sure about that.", "感想・意見"], ["場合によります。", "It depends.", "It depends.＝場合による。何によるかを言うときは It depends on the situation／the cost. のように on を付ける。", "感想・意見"], ["それは理にかなっています。", "That makes sense.", "make sense＝筋が通っている、納得できる。会議での相づちに便利。逆は That doesn't make sense.", "感想・意見"], ["正直に言うと、あまり好きではありません。", "To be honest, I don't really like it.", "To be honest＝正直に言うと。not really は「あまり〜ない」と柔らかい否定。Honestly, 〜 でも可。", "感想・意見"], ["意外と簡単でした。", "It was easier than I thought.", "than I thought＝思ったより。than I expected でも同じ。「意外と」は比較級＋than I thought で表すと楽。", "感想・意見"], ["それは私のせいです。", "That's my fault.", "fault＝責任、落ち度。It's my fault. で非を認める。It's not your fault.（あなたのせいじゃない）とセットで覚える。", "感想・意見"], ["気にしないでください。", "Don't worry about it.", "謝られたときや礼を言われたときの返し。No worries. はカジュアル版。", "感想・意見"], ["それはいい質問ですね。", "That's a good question.", "質問を受けたときの定番。答えを考える時間を稼ぐクッションとしても使える。", "感想・意見"], ["おっしゃる通りです。", "You're absolutely right.", "absolutely で強調。That's right. や Exactly. も同意の表現。", "感想・意見"], ["半分は賛成です。", "I partly agree.", "partly＝部分的に。I agree to some extent.（ある程度は賛成）も可。続けて but 〜 で懸念点を言う。", "感想・意見"], ["それは私には合わないと思います。", "I don't think it suits me.", "suit＝（人に）合う、似合う。It's not for me. は「私向きではない」というカジュアルな言い方。", "感想・意見"], ["期待していたほどではありませんでした。", "It wasn't as good as I expected.", "not as 〜 as …＝…ほど〜ない。than I expected を使って It was worse than I expected. とも言える。", "感想・意見"], ["それはもったいないです。", "That's a waste.", "waste＝無駄。What a waste! は感嘆の形。時間の無駄なら It's a waste of time.", "感想・意見"], ["どちらでもいいです。", "Either is fine with me.", "Either is fine＝どちらでもOK。I don't mind either way. も可。Whatever. は投げやりに聞こえるので避ける。", "感想・意見"], ["それは助かります。", "That would be a big help.", "would で「（そうしてもらえたら）助かる」という仮定の気持ちを出す。That would be great. も可。", "感想・意見"], ["すごいですね！", "That's amazing!", "amazing＝すばらしい。Wow, that's impressive.（感心した）も使える。", "感想・意見"], ["もう少し考えてみます。", "I'll think about it a bit more.", "I'll think about it. は断る前置きとしても使われる。前向きなら I'll consider it carefully.", "感想・意見"], ["それは言い過ぎだと思います。", "I think that's going too far.", "go too far＝行き過ぎる、言い過ぎる。That's an exaggeration.（大げさだ）も可。", "感想・意見"], ["それは悪くないですね。", "That's not bad.", "not bad は「悪くない＝結構良い」という控えめな褒め言葉。言い方次第でかなり好意的に聞こえる。", "感想・意見"], ["どのくらい日本に住んでいますか？", "How long have you lived in Japan?", "現在完了で「今まで継続している期間」を聞く。How long do you live? は誤り。答えは For three years. など。", "旅行・雑談"], ["大阪は初めてですか？", "Is this your first time in Osaka?", "Is this your first time in／to 〜?＝〜は初めてですか？訪問先で頻出の質問。", "旅行・雑談"], ["この料理は何ですか？", "What is this dish?", "dish＝（一品の）料理。cuisine は「〜料理」全般（Japanese cuisine）。", "旅行・雑談"], ["辛いものは大丈夫ですか？", "Can you eat spicy food?", "spicy＝辛い（唐辛子系）。hot も使えるが「熱い」と紛らわしい。Are you okay with spicy food? も可。", "旅行・雑談"], ["お会計をお願いします。", "Can I have the check, please?", "米国では check、英国では bill。Check, please. だけでも通じる。", "旅行・雑談"], ["空港までどのくらいかかりますか？", "How long does it take to get to the airport?", "How long does it take to 〜?＝〜するのにどのくらいかかる？答えは It takes about 30 minutes.", "旅行・雑談"], ["チェックインは何時からですか？", "What time is check-in?", "check-in は名詞（ハイフンあり）、動詞は check in。When can I check in? でも可。", "旅行・雑談"], ["窓側の席をお願いできますか？", "Could I have a window seat?", "Could I have 〜?＝〜をいただけますか？通路側は an aisle seat。", "旅行・雑談"], ["英語は少しだけ話せます。", "I can speak a little English.", "a little は「少しはある」という肯定のニュアンス。little（aなし）だと「ほとんどない」になる。", "旅行・雑談"], ["日本の食べ物はどうですか？", "How do you like Japanese food?", "How do you like 〜?＝〜は気に入りましたか？（感想を聞く）。How is 〜? より相手の好みに焦点がある。", "旅行・雑談"], ["休みの日は何をしていますか？", "What do you do on your days off?", "day off＝休みの日（複数形 days off）。習慣を聞くので現在形。", "旅行・雑談"], ["出身はどこですか？大阪です。", "Where are you from? I'm from Osaka.", "Where are you from? の答えは I'm from 〜。Where do you come from? も同じ意味。", "旅行・雑談"], ["京都には行きましたか？", "Have you been to Kyoto?", "have been to＝行ったことがある（経験）。have gone to は「行ってしまって今いない」なので注意。", "旅行・雑談"], ["観光で来ていますか？", "Are you here for sightseeing?", "for sightseeing＝観光で。仕事なら on business。入国審査でも聞かれる質問。", "旅行・雑談"], ["これはいくらですか？", "How much is this?", "How much is 〜?＝〜はいくら？複数なら How much are these? と be動詞を変える。", "旅行・雑談"], ["カードで払えますか？", "Can I pay by card?", "支払手段は by card、現金は in cash。Do you accept credit cards? も可。", "旅行・雑談"], ["タクシーを呼んでもらえますか？", "Could you call a taxi for me?", "call a taxi＝タクシーを呼ぶ。for me を付けると自分のために頼む感じが出る。", "旅行・雑談"], ["時差ぼけがひどいです。", "I have terrible jet lag.", "jet lag＝時差ぼけ（不可算名詞）。have jet lag／be jet-lagged の2通りの言い方がある。", "旅行・雑談"], ["ご家族はお元気ですか？", "How's your family?", "How's＝How is。単に家族の近況を気遣う挨拶。答えは They're doing well, thanks.", "旅行・雑談"], ["最近どうですか？", "How have you been?", "How have you been?＝（前回会ってから）どうしてた？しばらく会っていない相手に使う。普段は How are you?", "旅行・雑談"], ["お久しぶりです。", "It's been a long time.", "It's been a long time.＝久しぶり。Long time no see. はカジュアルで、ビジネスでは前者が無難。", "旅行・雑談"], ["お名前をもう一度伺ってもいいですか？", "Could I have your name again?", "Could I have 〜?＝〜を教えてもらえますか？What's your name? より丁寧。Sorry, I didn't catch your name. も可。", "旅行・雑談"], ["お会いできてうれしいです。", "It's nice to meet you.", "初対面の挨拶。別れ際は It was nice meeting you. と過去形・〜ing に変わる。", "旅行・雑談"], ["またお会いしましょう。", "Let's meet again.", "社交辞令としても使える。I hope to see you again. はより丁寧。", "旅行・雑談"], ["良い週末を。", "Have a nice weekend.", "Have a nice 〜. は別れ際の定番。返しは You too.", "旅行・雑談"], ["気をつけて帰ってください。", "Have a safe trip home.", "英語には「気をつけて」の直訳がないので、Have a safe trip home.（無事に帰ってね）で表す。Take care. も可。", "旅行・雑談"], ["お土産を買いたいです。", "I'd like to buy some souvenirs.", "souvenir＝自分用・記念品のお土産。人に配るものなら gift も使う。I'd like to 〜 は want to より丁寧。", "旅行・雑談"], ["おすすめは何ですか？", "What do you recommend?", "レストランや店員への定番の質問。What would you recommend? はさらに丁寧。", "旅行・雑談"], ["予約をしています。前田です。", "I have a reservation under Maeda.", "under＋名前＝〜の名前で（予約している）。I made a reservation for 7 o'clock. のように時間も添えられる。", "旅行・雑談"], ["トイレはどこですか？", "Where is the restroom?", "米国では restroom が無難。toilet は便器そのものを指すことがある。英国では toilet で問題ない。", "旅行・雑談"], ["もう一度言っていただけますか？", "Could you say that again?", "聞き返しの基本。Pardon? や Sorry? だけでも通じる。会議では Could you repeat that? も可。", "会話をつなぐ"], ["すみません、聞き取れませんでした。", "Sorry, I didn't catch that.", "catch＝聞き取る。正直に聞き取れなかったと伝える方が誤解を防げる。", "会話をつなぐ"], ["ちょっと待ってください。", "Hold on a second.", "Hold on.／Just a second. は会話や電話で使う。ビジネスでは One moment, please.", "会話をつなぐ"], ["えーと、何と言えばいいかな。", "Well, how should I put it?", "put＝言葉で表現する。言葉を探す間をつなぐ表現。Let me see... や How can I say... も使える。", "会話をつなぐ"], ["つまり、ポイントは何ですか？", "So, what's the point?", "point＝要点。言い方次第できつく聞こえるので、What's the main point? と柔らかく言うのも手。", "会話をつなぐ"], ["話を戻しましょう。", "Let's get back to the topic.", "get back to＝〜に戻る。会議の脱線を戻すときに便利。Let's get back on track. も可。", "会話をつなぐ"], ["それで思い出しました。", "That reminds me.", "remind＝思い出させる。話題を変えるきっかけとしても使える。That reminds me, 〜 と続ける。", "会話をつなぐ"], ["ところで、", "By the way,", "話題を変えるときの定番。By the way は BTW と略してチャットでも使う。", "会話をつなぐ"], ["要するに、", "In short,", "In short＝要するに。In summary（まとめると）、Basically（基本的に）も同様に使える。", "会話をつなぐ"], ["私の理解が正しければ、", "If I understand correctly,", "If I understand correctly, 〜 で自分の理解を確認する。確認したい内容を続けて言う。", "会話をつなぐ"], ["それはどういう意味ですか？", "What do you mean by that?", "mean by 〜＝〜で何を意味しているか。相手の意図を確認するときの定番。", "会話をつなぐ"], ["質問してもいいですか？", "Can I ask you a question?", "May I ask 〜? はより丁寧。会議中なら Can I ask a quick question? が便利。", "会話をつなぐ"], ["正確には分かりませんが、", "I'm not exactly sure, but", "不確かな情報を伝える前のクッション。I'm not 100% sure, but 〜 も可。", "会話をつなぐ"], ["一言で言うと、", "In a word,", "In a word＝一言で言えば。In short より短く要約するニュアンス。", "会話をつなぐ"], ["言い換えると、", "In other words,", "In other words＝言い換えると。説明を分かりやすく言い直すときに使う。", "会話をつなぐ"], ["一方で、", "On the other hand,", "On the other hand＝一方で。比較・対比するときに使う。On the one hand 〜 とセットにもできる。", "会話をつなぐ"], ["それに加えて、", "In addition to that,", "In addition＝さらに。Also や Plus（口語）も同じ意味で使える。", "会話をつなぐ"], ["念のため確認させてください。", "Just to make sure, let me confirm.", "Just to make sure＝念のため。Just to be safe, 〜 や Let me double-check. も可。", "会話をつなぐ"], ["話の途中ですみません。", "Sorry to interrupt.", "会議で割り込むときのクッション。Sorry to interrupt, but 〜 と続けて用件を言う。", "会話をつなぐ"], ["どうぞ続けてください。", "Please go ahead.", "go ahead＝どうぞ（進めて）。相手と話し出しがかぶったときにも使える。", "会話をつなぐ"], ["スペルを教えてもらえますか？", "Could you spell that for me?", "spell は動詞で「つづりを言う」。How do you spell that? も同じ意味。", "会話をつなぐ"], ["簡単に言うと、", "To put it simply,", "To put it simply＝簡単に言うと。複雑な話を要約する前に使う。Simply put, 〜 も可。", "会話をつなぐ"], ["私の知る限りでは、", "As far as I know,", "As far as I know＝私の知る限り。情報に確証がないときの予防線になる。", "会話をつなぐ"], ["結論から言うと、", "To get straight to the point,", "get straight to the point＝すぐ本題に入る。The bottom line is 〜（要は〜だ）も使える。", "会話をつなぐ"], ["例を挙げてもらえますか？", "Could you give me an example?", "give an example＝例を挙げる。For example?（例えば？）と短く聞くこともできる。", "会話をつなぐ"], ["始めましょうか。", "Shall we get started?", "Shall we 〜?＝〜しましょうか。get started＝始める。Let's get started. も定番。", "会議"], ["今日の議題は3つあります。", "We have three items on today's agenda.", "item＝議題の項目、agenda＝議題全体。on the agenda で「議題に載っている」。", "会議"], ["まず背景から説明します。", "Let me start by explaining the background.", "start by 〜ing＝まず〜から始める。by は「〜という方法で」の意味。", "会議"], ["資料を画面共有します。", "Let me share my screen.", "share my screen＝画面を共有する。オンライン会議の定番。Let me pull up the slides. も可。", "会議"], ["画面は見えていますか？", "Can you see my screen?", "Can you see my screen? は画面共有後の確認の定番。Is my screen visible? も可。", "会議"], ["音声は聞こえていますか？", "Can you hear me?", "オンライン会議の冒頭の確認。聞こえにくければ You're breaking up.（音が途切れている）。", "会議"], ["次のスライドをご覧ください。", "Please take a look at the next slide.", "take a look at＝〜を見る。Moving on to the next slide. も進行でよく使う。", "会議"], ["何か質問はありますか？", "Do you have any questions?", "any questions は複数形。Any questions? だけでも通じる。", "会議"], ["ご意見をいただけますか？", "Could I get your opinion?", "Could I get 〜?＝〜をもらえますか？What do you think? より丁寧に意見を求める。", "会議"], ["この点について議論しましょう。", "Let's discuss this point.", "discuss は他動詞なので about は不要（× discuss about）。talk about とは区別する。", "会議"], ["時間がないので、次に進みます。", "We're running out of time, so let's move on.", "run out of＝〜がなくなる、move on＝次に進む。会議の進行で頻出。", "会議"], ["この件は後で話しましょう。", "Let's talk about this later.", "later＝後で。具体的にするなら after the meeting など。", "会議"], ["この件はオフラインで話しましょう。", "Let's take this offline.", "take 〜 offline＝（会議の外で）個別に話す。会議を脱線させないための定番表現。", "会議"], ["決定事項を確認します。", "Let me go over what we decided.", "go over＝確認する、ざっと見直す。what we decided＝決めたこと（関係代名詞 what）。", "会議"], ["次回の会議はいつにしますか？", "When should we have the next meeting?", "should で「いつにすべきか」と提案を求める。When is good for the next meeting? も可。", "会議"], ["今日はここまでにしましょう。", "Let's wrap it up for today.", "wrap up＝締めくくる。Let's call it a day. も「今日は終わりにしよう」の意味。", "会議"], ["ご参加ありがとうございました。", "Thank you for joining.", "join＝（会議に）参加する。Thank you for your time. も会議の締めの定番。", "会議"], ["アクションアイテムを確認しましょう。", "Let's review the action items.", "action item＝宿題、次の行動項目。review＝確認する、見直す。", "会議"], ["誰が担当しますか？", "Who will be in charge of this?", "be in charge of＝〜を担当する。Who's going to handle this? も可。", "会議"], ["私が担当します。", "I'll take care of it.", "take care of＝対応する、引き受ける。I'll handle it. も同じ意味。", "会議"], ["いつまでにできますか？", "By when can you finish it?", "期限は By when で聞く。When can you finish it? でも通じる。", "会議"], ["金曜日までに対応します。", "I'll get it done by Friday.", "get 〜 done＝〜を終わらせる。by＝期限（〜までに）、until＝継続（〜までずっと）。", "会議"], ["会議の議事録を共有します。", "I'll share the meeting minutes.", "議事録は minutes（常に複数形）。take minutes＝議事録を取る。", "会議"], ["その案に賛成です。", "I'm in favor of that proposal.", "in favor of＝〜に賛成。I support that proposal. や I agree with that idea. も可。", "会議"], ["懸念点が一つあります。", "I have one concern.", "concern＝懸念。反対を柔らかく伝えられる。My concern is that 〜 と続ける。", "会議"], ["別の案を提案してもいいですか？", "Can I suggest another option?", "suggest＝提案する。May I propose an alternative? はより丁寧。", "会議"], ["優先順位をつけましょう。", "Let's prioritize.", "prioritize＝優先順位をつける。Let's set priorities. も可。", "会議"], ["合意できたと思います。", "I think we've reached an agreement.", "reach an agreement＝合意に達する。We're on the same page.（認識が一致している）も便利。", "会議"], ["もう少し時間をください。", "Please give me a little more time.", "Could you give me a little more time? はより丁寧。具体的に期限を添えると良い。", "会議"], ["社内で検討してから返事します。", "We'll discuss it internally and get back to you.", "internally＝社内で。get back to you＝折り返し連絡する。即答を避けるときの定番。", "会議"], ["今の説明で分かりましたか？", "Does that make sense?", "Does that make sense?＝分かりましたか？Do you understand? は上から目線に聞こえやすいので避ける。", "会議"], ["少し補足させてください。", "Let me add a few points.", "add＝付け加える。Let me add one thing.（一点だけ補足）も可。", "会議"], ["結論は来週出します。", "We'll make a decision next week.", "make a decision＝決定する。come to a conclusion も同様の意味。", "会議"], ["その件はまだ決まっていません。", "That hasn't been decided yet.", "受動態の現在完了（has been decided）＋yet。It's still under discussion. も可。", "会議"], ["ご指摘ありがとうございます。", "Thank you for pointing that out.", "point out＝指摘する。Good point. と軽く受けることもできる。", "会議"], ["添付ファイルをご確認ください。", "Please find the attached file.", "Please find attached 〜 はビジネスメールの決まり文句。I've attached 〜 も可。", "メール・電話"], ["ご確認をお願いします。", "Could you please check it?", "Could you please 〜? は丁寧な依頼。Please review the document. も可。", "メール・電話"], ["お返事が遅くなりすみません。", "Sorry for the late reply.", "late reply＝遅い返信。Sorry for the delayed response. もビジネス向け。", "メール・電話"], ["ご連絡ありがとうございます。", "Thank you for reaching out.", "reach out＝連絡する。最初の返信の書き出しに使える。Thank you for your email. も可。", "メール・電話"], ["引き続きよろしくお願いします。", "I look forward to continuing to work with you.", "「よろしくお願いします」の直訳はないので、場面に応じて言い換える。メール末尾なら Best regards でも十分。", "メール・電話"], ["ご不明点があればお知らせください。", "Please let me know if you have any questions.", "let me know＝知らせて。メールの締めの定番。Feel free to contact me if 〜 も可。", "メール・電話"], ["至急対応をお願いします。", "Please handle this as soon as possible.", "as soon as possible は ASAP と略せる。urgent を使えば緊急度がさらに伝わる。", "メール・電話"], ["このメールは参考までに送ります。", "I'm sending this for your reference.", "for your reference＝ご参考までに。FYI（for your information）も同様の意味。", "メール・電話"], ["前田と申します。", "This is Maeda speaking.", "電話の名乗りは This is 〜 (speaking). が自然。× I am Maeda. は電話では不自然。", "メール・電話"], ["田中さんはいらっしゃいますか？", "May I speak to Mr. Tanaka?", "電話の取り次ぎ依頼の定番。Is Mr. Tanaka available? も可。", "メール・電話"], ["少々お待ちください。", "Please hold on a moment.", "電話で保留にするときに使う。hold on＝電話を切らずに待つ。", "メール・電話"], ["折り返しお電話します。", "I'll call you back.", "call back＝折り返し電話する。get back to you はメールにも使える。", "メール・電話"], ["伝言をお願いできますか？", "Could I leave a message?", "leave a message＝伝言を残す。相手が「伝言を承りましょうか？」は Can I take a message?", "メール・電話"], ["今お時間よろしいですか？", "Do you have a minute?", "Do you have a minute?＝少し時間ある？Is now a good time? も可。", "メール・電話"], ["会議の日程を調整させてください。", "Let me arrange a time for the meeting.", "arrange＝手配・調整する。schedule a meeting も同様の意味。", "メール・電話"], ["ご都合の良い日時を教えてください。", "Please let me know when is convenient for you.", "convenient は人ではなく時間を主語にする（× when you are convenient）。", "メール・電話"], ["その日は都合が悪いです。", "That day doesn't work for me.", "work＝（予定が）合う。That works for me.（その日でOK）とセットで覚える。", "メール・電話"], ["来週の火曜日はいかがですか？", "How about next Tuesday?", "How about 〜?＝〜はどう？日程提案の定番。Would next Tuesday work? も可。", "メール・電話"], ["会議の招待を送りました。", "I sent you a meeting invitation.", "meeting invitation（invite）＝会議の招待。Did you get the invite? も頻出。", "メール・電話"], ["資料を事前に送ります。", "I'll send you the materials in advance.", "in advance＝事前に。materials＝資料（複数形が一般的）。", "メール・電話"], ["不良率が上がっています。", "The defect rate is increasing.", "defect＝不良、defect rate＝不良率。rising も可。", "生産・品質"], ["不良の原因はまだ分かっていません。", "We haven't identified the cause of the defect yet.", "identify＝特定する。root cause（真因）もよく使う。", "生産・品質"], ["対策を検討しています。", "We're considering countermeasures.", "countermeasure＝対策。consider＋名詞＝〜を検討する。", "生産・品質"], ["再発防止策を考えます。", "We'll come up with measures to prevent recurrence.", "come up with＝（案を）考え出す。recurrence＝再発、prevent＝防ぐ。", "生産・品質"], ["この工程がボトルネックです。", "This process is the bottleneck.", "bottleneck＝ボトルネック（制約工程）。英語でも同じ意味で通じる。", "生産・品質"], ["サイクルタイムを短縮したいです。", "We want to reduce the cycle time.", "reduce／shorten＝短縮する。cycle time は英語でもそのまま通じる。", "生産・品質"], ["設備の立ち上げが遅れています。", "The equipment start-up is behind schedule.", "behind schedule＝予定より遅れて。start-up／ramp-up＝立ち上げ。", "生産・品質"], ["試作は順調に進んでいます。", "The prototype is going well.", "go well＝順調にいく。prototype＝試作品。on track（順調）も可。", "生産・品質"], ["量産は来年4月に開始予定です。", "Mass production is scheduled to start next April.", "be scheduled to 〜＝〜する予定。mass production＝量産。", "生産・品質"], ["歩留まりを改善する必要があります。", "We need to improve the yield.", "yield＝歩留まり。improve＝改善する。", "生産・品質"], ["検査工程を自動化したいです。", "We want to automate the inspection process.", "automate＝自動化する。inspection process＝検査工程。", "生産・品質"], ["治具を新しく設計しました。", "We designed a new jig.", "jig＝治具。fixture も同様の意味で使う。", "生産・品質"], ["この部品は組み立てにくいです。", "This part is difficult to assemble.", "be difficult to 〜＝〜しにくい。assemble＝組み立てる。", "生産・品質"], ["設計変更が必要です。", "A design change is needed.", "design change＝設計変更。受動態で主語を物にすると客観的に聞こえる。", "生産・品質"], ["生産能力が足りません。", "We don't have enough production capacity.", "capacity＝生産能力。lack capacity でも同じ意味。", "生産・品質"], ["稼働率は約80%です。", "The operating rate is about 80 percent.", "operating rate／utilization rate＝稼働率。percent は単数形のまま使う。", "生産・品質"], ["ラインが止まっています。", "The line is down.", "be down＝停止中。The line has stopped. も可。", "生産・品質"], ["復旧の見込みは明日です。", "We expect to recover by tomorrow.", "recover＝復旧する。expect to 〜＝〜する見込み。", "生産・品質"], ["品質基準を満たしていません。", "It doesn't meet the quality standards.", "meet＝（基準を）満たす。quality standards＝品質基準。", "生産・品質"], ["サンプルを評価しています。", "We're evaluating the samples.", "evaluate＝評価する。test the samples も同様の意味。", "生産・品質"], ["測定データを共有します。", "I'll share the measurement data.", "measurement data＝測定データ。share＝共有する。", "生産・品質"], ["ばらつきが大きいです。", "There's a lot of variation.", "variation＝ばらつき。high variation とも言える。", "生産・品質"], ["公差内に収まっています。", "It's within tolerance.", "within tolerance＝公差内。out of tolerance＝公差外。", "生産・品質"], ["作業者の負担を減らしたいです。", "We want to reduce the burden on operators.", "burden on 〜＝〜への負担。operator／worker＝作業者。", "生産・品質"], ["標準作業を見直しましょう。", "Let's review the standard work.", "standard work＝標準作業。review＝見直す。", "生産・品質"], ["現場を確認させてください。", "Let me check the shop floor.", "shop floor＝現場。gemba も製造業では通じることがある。", "生産・品質"], ["工場の見学をお願いできますか？", "Could we tour the factory?", "tour＝見学する（動詞でも使える）。visit the factory も可。", "生産・品質"], ["設備投資の効果を説明します。", "I'll explain the return on the equipment investment.", "return on investment（ROI）＝投資効果。", "生産・品質"], ["コストを10%削減したいです。", "We want to cut costs by 10 percent.", "by＝差（〜だけ）を表す。cut／reduce＝削減する。", "生産・品質"], ["この方法なら工数を半分にできます。", "This method can cut the man-hours in half.", "cut 〜 in half＝〜を半分にする。man-hours＝工数。", "生産・品質"], ["部品の納期を確認してください。", "Please check the delivery date of the parts.", "delivery date＝納期。lead time は期間、delivery date は日付。", "SCM・調達"], ["納期を前倒しできますか？", "Can you move up the delivery date?", "move up＝前倒しする。bring forward も同じ意味。", "SCM・調達"], ["納期が2週間遅れます。", "The delivery will be two weeks late.", "be 〜 late＝〜遅れる。be delayed by two weeks も可。", "SCM・調達"], ["在庫は十分にあります。", "We have enough stock.", "stock／inventory＝在庫。in stock＝在庫あり。", "SCM・調達"], ["在庫が残り少ないです。", "We're running low on stock.", "run low on＝〜が少なくなる。run out of は「なくなる」。", "SCM・調達"], ["代替部品を探しています。", "We're looking for alternative parts.", "alternative＝代替の。substitute も同様の意味。", "SCM・調達"], ["発注量を増やす必要があります。", "We need to increase the order quantity.", "order quantity＝発注量。increase＝増やす。", "SCM・調達"], ["見積もりをお願いできますか？", "Could you send us a quote?", "quote／quotation＝見積もり。estimate は概算のニュアンス。", "SCM・調達"], ["価格交渉をしています。", "We're negotiating the price.", "negotiate＝交渉する。negotiate with 人 で交渉相手を表す。", "SCM・調達"], ["供給リスクを減らしたいです。", "We want to reduce supply risks.", "supply risk＝供給リスク。mitigate（緩和する）もよく使う。", "SCM・調達"], ["複数の取引先から調達します。", "We'll source from multiple suppliers.", "source＝調達する（動詞）。multi-sourcing＝複数購買。", "SCM・調達"], ["需要予測が変わりました。", "The demand forecast has changed.", "demand forecast＝需要予測。現在完了で「変わって今に至る」ことを表す。", "SCM・調達"], ["生産計画を見直します。", "We'll revise the production plan.", "revise＝修正する。update the plan も可。", "SCM・調達"], ["輸送費が上がっています。", "Shipping costs are rising.", "shipping costs＝輸送費。freight costs も同様。", "SCM・調達"], ["船便から航空便に切り替えます。", "We'll switch from sea freight to air freight.", "switch from A to B＝AからBに切り替える。sea freight＝船便、air freight＝航空便。", "SCM・調達"], ["リードタイムを短縮したいです。", "We want to shorten the lead time.", "shorten＝短くする。reduce も可。", "SCM・調達"], ["部品の過不足を確認しました。", "We checked for shortages and surpluses of parts.", "shortage＝不足、surplus＝余剰。過不足をこの2語の組み合わせで表す。", "SCM・調達"], ["必要数は1500セットです。", "We need 1,500 sets.", "need＝必要とする。The required quantity is 1,500 sets. も可。", "SCM・調達"], ["GATE4までに部品を確保します。", "We'll secure the parts by GATE4.", "secure＝確保する。by＝期限（〜までに）。", "SCM・調達"], ["サプライヤーに確認中です。", "We're checking with the supplier.", "check with＋人＝〜に確認する。現在進行形で「確認中」を表す。", "SCM・調達"], ["進捗を報告します。", "Let me give you a progress update.", "progress update＝進捗報告。give an update＝報告する。", "プロジェクト・報告"], ["予定通り進んでいます。", "We're on schedule.", "on schedule＝予定通り。on track も同様の意味。", "プロジェクト・報告"], ["少し遅れていますが、挽回できます。", "We're a little behind, but we can catch up.", "behind＝遅れて。catch up＝追いつく、挽回する。", "プロジェクト・報告"], ["課題が二つあります。", "There are two issues.", "issue＝課題、問題点。problem より中立的で、ビジネスでよく使う。", "プロジェクト・報告"], ["リスクは低いと考えています。", "We think the risk is low.", "We think 〜 で断定を避ける。The risk is low. と言い切ることもできる。", "プロジェクト・報告"], ["次のステップはテストです。", "The next step is testing.", "next step＝次のステップ。testing は動名詞。", "プロジェクト・報告"], ["目標は達成できました。", "We achieved our goal.", "achieve＝達成する。meet our target も可。", "プロジェクト・報告"], ["計画を修正する必要があります。", "We need to adjust the plan.", "adjust＝調整する。revise はより大きな見直しのニュアンス。", "プロジェクト・報告"], ["これは上司の承認が必要です。", "This needs my manager's approval.", "approval＝承認。need approval from 〜 も可。", "プロジェクト・報告"], ["関係部署と調整します。", "We'll coordinate with the related departments.", "coordinate with＝〜と調整する。related departments＝関係部署。", "プロジェクト・報告"], ["来月までに方針を決めます。", "We'll decide on the direction by next month.", "decide on＝〜について決める。direction＝方針、方向性。", "プロジェクト・報告"], ["予算内に収まっています。", "We're within budget.", "within budget＝予算内。under budget＝予算以下。", "プロジェクト・報告"], ["予算を超えそうです。", "We're likely to go over budget.", "go over budget＝予算を超える。be likely to＝〜しそう。", "プロジェクト・報告"], ["スケジュールに余裕がありません。", "The schedule is tight.", "tight＝余裕がない。There's no buffer in the schedule. も可。", "プロジェクト・報告"], ["もう少しリソースが必要です。", "We need a few more resources.", "resources＝人員・資源（通常は複数形）。more people（もっと人が必要）も可。", "プロジェクト・報告"], ["前回からの変更点を説明します。", "I'll explain what has changed since last time.", "what has changed＝変わったこと（関係代名詞 what）。since last time＝前回から。", "プロジェクト・報告"], ["この数字はまだ暫定です。", "These numbers are still tentative.", "tentative＝暫定の。preliminary（予備的な）も可。", "プロジェクト・報告"], ["詳細は資料をご覧ください。", "Please see the document for details.", "see 〜 for details＝詳細は〜を参照。refer to も可。", "プロジェクト・報告"], ["上期の振り返りをします。", "Let's look back on the first half of the year.", "look back on＝振り返る。review も可。first half＝上期（H1）。", "プロジェクト・報告"], ["下期の計画を説明します。", "I'll explain the plan for the second half.", "second half＝下期（H2）。plan for 〜＝〜の計画。", "プロジェクト・報告"], ["お手伝いしましょうか？", "Can I help you?", "Can I help you? は店員の決まり文句でもある。Do you need any help? も可。", "気持ち・依頼・お礼"], ["手伝ってもらえますか？", "Could you give me a hand?", "give 人 a hand＝〜を手伝う。Could you help me? も可。", "気持ち・依頼・お礼"], ["お願いがあるのですが。", "Can I ask you a favor?", "ask 人 a favor＝お願いをする。Could you do me a favor? も可。", "気持ち・依頼・お礼"], ["助かりました、ありがとう。", "Thanks, you saved me.", "you saved me＝助かった（口語）。That was a big help. も可。", "気持ち・依頼・お礼"], ["いろいろとありがとうございました。", "Thank you for everything.", "Thank you for everything. は別れ際やプロジェクト終了時に使う。", "気持ち・依頼・お礼"], ["ご迷惑をおかけしてすみません。", "I'm sorry for the trouble.", "trouble＝迷惑。I apologize for the inconvenience. はよりフォーマル。", "気持ち・依頼・お礼"], ["遅れてすみません。", "Sorry I'm late.", "Sorry I'm late. は到着時の謝罪の定番。Sorry for being late. も可。", "気持ち・依頼・お礼"], ["大丈夫ですよ。", "No problem.", "No problem.＝問題ない。お礼への返しにも使える。", "気持ち・依頼・お礼"], ["どういたしまして。", "You're welcome.", "You're welcome. のほか、No problem. や My pleasure.（喜んで）も使える。", "気持ち・依頼・お礼"], ["お先に失礼します。", "I'm heading out now.", "head out＝出る、帰る。I'm leaving for the day. も可。", "気持ち・依頼・お礼"], ["お疲れさまでした。", "Good job today.", "英語に直訳はない。Good job today. や Thanks for your hard work. で気持ちを伝える。", "気持ち・依頼・お礼"], ["ご心配なく。", "Don't worry.", "Don't worry.＝心配しないで。No need to worry. も可。", "気持ち・依頼・お礼"], ["お気遣いありがとうございます。", "Thank you for your concern.", "concern＝気遣い、心配。Thank you for asking. も可。", "気持ち・依頼・お礼"], ["無理しないでください。", "Don't push yourself too hard.", "push oneself＝無理をする。Take it easy. もカジュアルに使える。", "気持ち・依頼・お礼"], ["頑張ってください。", "Good luck.", "「頑張って」の直訳はない。試験・発表前は Good luck.、努力を励ますなら Keep it up.", "気持ち・依頼・お礼"], ["確認してみます。", "I'll check.", "I'll check.＝確認します。Let me check. もよく使う。", "気持ち・依頼・お礼"], ["分かり次第連絡します。", "I'll let you know as soon as I find out.", "as soon as＝〜したらすぐ。find out＝分かる、知る。", "気持ち・依頼・お礼"], ["今手が離せません。", "I'm tied up right now.", "be tied up＝忙しくて手が離せない。I'm busy right now. より柔らかい。", "気持ち・依頼・お礼"], ["後で手伝います。", "I'll help you later.", "later＝後で。I'll give you a hand later. も可。", "気持ち・依頼・お礼"], ["誘ってくれてありがとう。", "Thanks for inviting me.", "invite＝誘う。Thanks for having me.（招いてくれてありがとう）も可。", "気持ち・依頼・お礼"], ["AはBより安いです。", "A is cheaper than B.", "比較級＋than。cheap の比較級は cheaper（y→ier にはならない）。", "比較・説明"], ["これが一番効率的な方法です。", "This is the most efficient way.", "最上級。長い形容詞は most＋形容詞。efficient＝効率的な。", "比較・説明"], ["前より良くなりました。", "It's better than before.", "better than before＝前より良い。It has improved. も可。", "比較・説明"], ["思ったほど難しくありません。", "It's not as difficult as I thought.", "not as 〜 as I thought＝思ったほど〜ない。", "比較・説明"], ["両方ともメリットがあります。", "Both have advantages.", "advantage＝メリット。英語の merit は「長所・価値」でやや硬い。", "比較・説明"], ["メリットとデメリットを比べましょう。", "Let's compare the pros and cons.", "pros and cons＝良い点と悪い点。advantages and disadvantages も可。", "比較・説明"], ["その違いは何ですか？", "What's the difference?", "What's the difference between A and B? と比較対象を加えられる。", "比較・説明"], ["これはあれと似ています。", "This is similar to that.", "be similar to＝〜と似ている。This is like that. はカジュアル。", "比較・説明"], ["コストはほぼ同じです。", "The cost is almost the same.", "almost the same＝ほぼ同じ。roughly the same も可。", "比較・説明"], ["これの方がずっと速いです。", "This is much faster.", "比較級の強調は much／far。× very faster は誤り。", "比較・説明"], ["ポイントは3つあります。", "There are three key points.", "key point＝要点。There are three main points. も可。", "比較・説明"], ["理由は二つあります。", "There are two reasons.", "There are two reasons. の後、First, 〜 Second, 〜 と続ける。", "比較・説明"], ["その結果、コストが下がりました。", "As a result, the cost went down.", "As a result＝その結果。go down＝下がる。", "比較・説明"], ["なぜなら納期が短いからです。", "That's because the lead time is short.", "That's because＝それは〜だからです。理由を後から説明するときに使う。", "比較・説明"], ["そのため、計画を変更しました。", "That's why we changed the plan.", "That's why＝それが〜の理由です。結果を述べるときに使う。", "比較・説明"], ["もし時間があれば、確認してください。", "If you have time, please check it.", "If 〜, please 〜. で条件付きの依頼。when you have time も可。", "比較・説明"], ["もしそれが本当なら、問題です。", "If that's true, it's a problem.", "If that's true＝もしそれが本当なら。条件文の基本形。", "比較・説明"], ["以前は手作業で行っていました。", "We used to do it by hand.", "used to＝以前は〜していた（今はしていない）。by hand＝手作業で。", "比較・説明"], ["今は自動化されています。", "It's automated now.", "受動態（be＋過去分詞）。automated＝自動化された。", "比較・説明"], ["これは使い方が簡単です。", "This is easy to use.", "easy to use＝使いやすい。user-friendly も可。", "比較・説明"], ["何時に会いましょうか？", "What time shall we meet?", "Shall we 〜?＝〜しましょうか。What time works for you? も可。", "時間・予定"], ["10分ほど遅れます。", "I'll be about ten minutes late.", "be 〜 late＝〜遅れる。running late も「遅れている」の意味。", "時間・予定"], ["明日の朝一番に送ります。", "I'll send it first thing tomorrow morning.", "first thing＝真っ先に。first thing in the morning も可。", "時間・予定"], ["今週中に終わらせます。", "I'll finish it by the end of this week.", "by the end of 〜＝〜の終わりまでに。within this week も可。", "時間・予定"], ["来月出張に行きます。", "I'm going on a business trip next month.", "go on a business trip＝出張に行く。travel for work も可。", "時間・予定"], ["3日間の予定です。", "It's for three days.", "for 〜 days＝〜日間。It's a three-day trip. も可。", "時間・予定"], ["予定が変わりました。", "My plans have changed.", "現在完了で「変わって今に至る」ことを表す。There's been a change of plans. も可。", "時間・予定"], ["会議が延期になりました。", "The meeting has been postponed.", "postpone＝延期する。put off も同じ意味。", "時間・予定"], ["会議がキャンセルになりました。", "The meeting was canceled.", "cancel＝中止する。受動態で表す。call off も可。", "時間・予定"], ["1時間ほどかかります。", "It'll take about an hour.", "take＝（時間が）かかる。It'll take about an hour.", "時間・予定"], ["締め切りはいつですか？", "When is the deadline?", "deadline＝締め切り。due date も可。", "時間・予定"], ["締め切りに間に合いそうです。", "I think we can meet the deadline.", "meet the deadline＝締め切りに間に合わせる。miss the deadline＝間に合わない。", "時間・予定"], ["もう少し早くできますか？", "Can you do it a bit sooner?", "sooner＝もっと早く。earlier も可。", "時間・予定"], ["時間通りに始めましょう。", "Let's start on time.", "on time＝時間通りに。in time は「間に合って」で意味が違う。", "時間・予定"], ["来週は休暇を取ります。", "I'm taking a vacation next week.", "take a vacation＝休暇を取る。take a day off＝1日休む。", "時間・予定"], ["私は生産技術を担当しています。", "I'm in charge of production engineering.", "production engineering＝生産技術。be in charge of＝担当する。", "自己紹介・仕事"], ["オムロンで働いています。", "I work for OMRON.", "work for＋会社＝〜に勤める。work at も可。", "自己紹介・仕事"], ["センサーの生産ラインを設計しています。", "I design production lines for sensors.", "design＝設計する。production line＝生産ライン。", "自己紹介・仕事"], ["この仕事は10年以上しています。", "I've been doing this job for more than ten years.", "現在完了進行形で継続を表す。for more than ten years＝10年以上。", "自己紹介・仕事"], ["今は新製品のプロジェクトを担当しています。", "I'm currently working on a new product project.", "work on＝〜に取り組む。currently＝現在。", "自己紹介・仕事"], ["私のチームは8人です。", "There are eight people on my team.", "on my team（米）／in my team（英）。My team has eight members. も可。", "自己紹介・仕事"], ["主に工場の自動化を進めています。", "I'm mainly working on factory automation.", "work on＝〜に取り組む。factory automation（FA）＝工場の自動化。", "自己紹介・仕事"], ["海外の工場ともよく仕事をします。", "I often work with our overseas factories.", "overseas＝海外の。work with＝〜と仕事をする。", "自己紹介・仕事"], ["英語はまだ勉強中です。", "I'm still learning English.", "still learning＝まだ勉強中。謙遜として会議の冒頭で使える。", "自己紹介・仕事"], ["仕事は大変ですが、やりがいがあります。", "My job is tough, but rewarding.", "rewarding＝やりがいのある。tough but rewarding はセットでよく使う。", "自己紹介・仕事"]];
const ENG_KEY = 'manabiTown.eng.v1', ENG_OLD_KEY = 'shunkan_eisakubun_v1';
const ENG_DEF = {count:10, mode:'smart', cat:'', tBase:2, tPer:0.5, tMin:3, tMax:15, pts:true};
function engLoad(){
  let d = null; try{ d = JSON.parse(localStorage.getItem(ENG_KEY) || 'null'); }catch(e){}
  if(!d || !d.qs){ d = {qs:[], hist:[], sess:[], set:{...ENG_DEF}, nextId:1}; ENG_SEED.forEach(r => d.qs.push({id:d.nextId++, jp:r[0], en:r[1], note:r[2], cat:r[3]})); }
  d.set = Object.assign({}, ENG_DEF, d.set); if(!d.ptsOn){ d.set.pts = true; d.ptsOn = 1; } return d;
}
let E = engLoad();
const engSave = () => { try{ localStorage.setItem(ENG_KEY, JSON.stringify(E)); }catch(e){ toast('ほぞんできませんでした'); } };
const ES = {active:false};
const wcount = t => (String(t||'').match(/[A-Za-z0-9]+(?:['’][A-Za-z]+)?/g)||[]).length;
const engTgt = q => Math.round(Math.min(E.set.tMax, Math.max(E.set.tMin, E.set.tBase + E.set.tPer*wcount(q.en)))*10)/10;
function engStats(){
  const m = {}; E.qs.forEach(q => m[q.id] = {n:0, o:0, t:0, x:0, sum:0, recent:[], last:null});
  E.hist.forEach(h => { const s = m[h.qid]; if(!s) return; s.n++; s.sum += h.sec; s[h.res]++; s.recent.push(h); s.last = h; });
  const now = Date.now();
  E.qs.forEach(q => { const s = m[q.id], r3 = s.recent.slice(-3);
    s.master = r3.length===3 && r3.every(h => h.res==='o' && h.sec <= (h.tgt||engTgt(q)));
    s.recent = s.recent.slice(-5);
    let w = 3;
    if(s.n){
      w = 1 + Math.min(4, s.x*0.8 + s.t*0.4) + 3*(s.x+0.5*s.t)/s.n;
      s.recent.forEach((h,i,a) => { const k = (i+1)/a.length; w += (h.res==='x'?2.5:h.res==='t'?1.2:0)*k; const r = h.sec/(h.tgt||engTgt(q)); if(r>1) w += Math.min(2,(r-1)*2)*k; });
      w *= 1 + Math.min((now - s.last.ts)/864e5, 14)/14*0.6;
      if(s.master) w *= 0.15;
    }
    s.w = w; });
  return m;
}
const engCats = () => [...new Set(E.qs.map(q => q.cat || '未分類'))];
function renderEng(){
  const st = engStats(), n = E.qs.length, mastered = E.qs.filter(q => st[q.id].master).length, tried = E.qs.filter(q => st[q.id].n).length;
  const today = dayKey(), todayN = E.hist.filter(h => dayKey(h.ts)===today).length;
  const last = E.sess.slice(-10), avgT = last.length ? last.reduce((a,s)=>a+s.total/s.n,0)/last.length : null;
  $('#engTop').innerHTML = [['📚', n, '問題数'], ['🏅', mastered, 'マスター'], ['✏️', tried, 'ちょうせんずみ'], ['📅', todayN, 'きょうの回答'], ['⏱', avgT==null ? '-' : avgT.toFixed(1)+'秒', '平均タイム（直近10回）']]
    .map(([i,v,l]) => `<div class="stat"><b>${v}</b><span>${i} ${l}</span></div>`).join('');
  syncSeg('engCount', E.set.count); syncSeg('engMode', E.set.mode); syncSeg('engPts', E.set.pts);
  $('#engCat').innerHTML = `<option value="">すべてのカテゴリ</option>` + engCats().map(c => `<option ${c===E.set.cat?'selected':''}>${esc(c)}</option>`).join('');
  $('#engCatList').innerHTML = engCats().map(c => { const qs = E.qs.filter(q => (q.cat||'未分類')===c), m = qs.filter(q => st[q.id].master).length, tr = qs.filter(q => st[q.id].n).length;
    return `<div class="ecRow"><span>${esc(c)}</span><div class="ecBar"><i class="t" style="width:${tr/qs.length*100}%"></i><i class="m" style="width:${m/qs.length*100}%"></i></div><b>${m}/${qs.length}</b></div>`; }).join('');
  const old = localStorage.getItem(ENG_OLD_KEY);
  $('#engMigrate').classList.toggle('hidden', !old || E.migrated);
  $('#engLog').textContent = '';
}
const EM = () => E.set;
['engCount','engMode','engPts'].forEach(id => $('#'+id).addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  let v = b.dataset.v; if(v==='true') v = true; else if(v==='false') v = false; else if(id==='engCount') v = +v;
  E.set[{engCount:'count', engMode:'mode', engPts:'pts'}[id]] = v; engSave(); renderEng();
}));
$('#engCat').onchange = e => { E.set.cat = e.target.value; engSave(); };
function engPick(){
  const st = engStats(), s = E.set;
  let pool = E.qs.filter(q => !s.cat || (q.cat||'未分類')===s.cat);
  if(s.mode==='new'){ const nw = pool.filter(q => !st[q.id].n); if(nw.length) pool = nw; }
  const k = Math.min(s.count, pool.length);
  if(s.mode==='random') return shuffle(pool.slice()).slice(0, k);
  return pool.map(q => ({q, key: Math.pow(Math.random(), 1/Math.max(st[q.id].w, 0.01))})).sort((a,b) => b.key-a.key).slice(0,k).map(x => x.q);
}
function engStart(qs){
  if(!qs.length){ toast('問題が ありません'); return; }
  Object.assign(ES, {active:true, qs, i:0, res:[], sid:Date.now(), phase:'ask'});
  show('engplay'); engNext();
}
function engNext(){
  const q = ES.qs[ES.i];
  $('#epNo').innerHTML = `第 ${ES.i+1} 問 / ${ES.qs.length} <span class="etag">${esc(q.cat||'未分類')}</span>`;
  $('#epBar').style.width = (ES.i/ES.qs.length*100) + '%';
  $('#epJp').textContent = q.jp;
  $('#epAsk').classList.remove('hidden'); $('#epAns').classList.add('hidden');
  ES.tgt = engTgt(q); ES.phase = 'ask'; ES.t0 = performance.now(); ES.el = 0;
  clearInterval(ES.iv); ES.iv = setInterval(engTick, 50); engTick();
}
function engTick(){
  const e = ES.phase==='ask' ? (performance.now()-ES.t0)/1000 : ES.el, tg = ES.tgt;
  $('#epTime').textContent = e.toFixed(1); $('#epTime').classList.toggle('over', e > tg);
  $('#epTgt').firstElementChild.style.width = Math.min(100, e/tg*100) + '%'; $('#epTgt').classList.toggle('over', e > tg);
  $('#epTgtL').textContent = `目標 ${tg} 秒（${wcount(ES.qs[ES.i].en)}語）` + (e > tg ? `　+${(e-tg).toFixed(1)}秒 オーバー` : '');
}
function engOK(){
  if(ES.phase!=='ask') return;
  ES.el = (performance.now()-ES.t0)/1000; ES.phase = 'judge'; clearInterval(ES.iv); engTick();
  const q = ES.qs[ES.i];
  $('#epEn').textContent = q.en; $('#epNote').textContent = q.note || ''; $('#epNote').classList.toggle('hidden', !q.note);
  $('#epAsk').classList.add('hidden'); $('#epAns').classList.remove('hidden');
}
function engJudge(r){
  if(ES.phase!=='judge') return;
  const q = ES.qs[ES.i], sec = Math.round(ES.el*10)/10;
  const h = {qid:q.id, ts:Date.now(), sec, res:r, sid:ES.sid, tgt:ES.tgt}; E.hist.push(h); ES.res.push({...h, q}); engSave();
  if(E.set.pts){ const p = Math.round((r==='o' ? (sec <= ES.tgt ? 6 : 4) : r==='t' ? 2 : 0) * engDiff(q.id)); if(p){ const keep = S; S = null; addPoints(p, 'えいご 瞬間英作文', true); S = keep; } }
  sound(r==='o' ? 'ok' : r==='x' ? 'ng' : 'tap');
  ES.i++; if(ES.i < ES.qs.length) engNext(); else engFinish();
}
function engFinish(){
  ES.active = false; clearInterval(ES.iv);
  const r = ES.res, n = r.length; if(!n){ show('eng'); return; }
  const tot = r.reduce((a,x)=>a+x.sec,0), ts = r.reduce((a,x)=>a+x.tgt,0), c = k => r.filter(x => x.res===k).length, inT = r.filter(x => x.sec <= x.tgt).length;
  E.sess.push({sid:ES.sid, ts:Date.now(), n, total:tot, tgtSum:ts, o:c('o'), t:c('t'), x:c('x'), inT}); if(E.sess.length > 500) E.sess.shift(); engSave();
  const rate = c('o')/n, tier = rate>=0.9 && inT>=n*0.8 ? 'S' : rate>=0.7 ? 'A' : rate>=0.5 ? 'B' : 'C';
  $('#erRibbon').textContent = {S:'Excellent!', A:'Great job!', B:'Good!', C:'Keep going!'}[tier];
  $('#erImg').dataset.art = {S:'bird_jump', A:'bird_jump', B:'bird_thumb', C:'bird_cheer'}[tier]; applyArt($('#scr-engres'));
  $('#erMsg').innerHTML = {S:'カンペキ！ 英語が 口から すらすら 出てるね！', A:'いい調子！ あと少しで マスター！', B:'着実に 力が ついてるよ！', C:'くり返すほど 速くなるよ。苦手だけ もう一度！'}[tier];
  $('#erKpi').innerHTML = [['合計タイム', tot.toFixed(1)+'秒', `目標 ${ts.toFixed(1)}`], ['平均', (tot/n).toFixed(1)+'秒', `目標 ${(ts/n).toFixed(1)}`], ['目標内', `${inT}/${n}`, '問'], ['〇', c('o'), '問'], ['△', c('t'), '問'], ['×', c('x'), '問']]
    .map(([l,v,s]) => `<div class="stat"><b>${v}</b><span>${l} <small>${s}</small></span></div>`).join('');
  $('#erList').innerHTML = r.map((x,i) => `<div class="erRow"><span class="mk r-${x.res}">${{o:'〇',t:'△',x:'×'}[x.res]}</span>
    <div class="erQ"><div>${esc(x.q.jp)}</div><b>${esc(x.q.en)}</b></div><span class="erSec ${x.sec>x.tgt?'over':''}">${x.sec.toFixed(1)}<small>/${x.tgt}</small></span></div>`).join('');
  $('#erWeak').disabled = !r.some(x => x.res!=='o');
  show('engres'); if(tier==='S') confetti(2000);
}
function engLeave(){ if(!ES.active) return true; if(!confirm('練習を中断しますか？（回答済みの記録は保存されます）')) return false; ES.active = false; clearInterval(ES.iv); return true; }
$('#subjEng').onclick = () => show('eng');
$('#engStart').onclick = () => engStart(engPick());
$('#epOK').onclick = engOK;
$$('#epAns [data-r]').forEach(b => b.onclick = () => engJudge(b.dataset.r));
$('#epQuit').onclick = () => { if(!engLeave()) return; if(ES.res.length) engFinish(); else show('eng'); };
$('#erWeak').onclick = () => engStart(shuffle(ES.res.filter(x => x.res!=='o').map(x => x.q)));
$('#erAgain').onclick = () => engStart(engPick());
$('#erHome').onclick = () => show('eng');
document.addEventListener('keydown', e => {
  if(curScreen!=='engplay' || !ES.active) return;
  if(ES.phase==='ask' && (e.code==='Space' || e.key==='Enter')){ e.preventDefault(); engOK(); }
  else if(ES.phase==='judge'){ const m = {'1':'o','2':'t','3':'x'}; if(m[e.key]){ e.preventDefault(); engJudge(m[e.key]); } }
});
$('#engMigrate').onclick = () => {
  try{
    const d = JSON.parse(localStorage.getItem(ENG_OLD_KEY) || 'null'); if(!d || !d.questions) throw 0;
    const byEn = new Map(E.qs.map(q => [q.en.trim().toLowerCase(), q])), idMap = {};
    let addQ = 0, addH = 0;
    d.questions.forEach(q => { const k = String(q.en||'').trim().toLowerCase(); if(!k) return; let m = byEn.get(k);
      if(!m){ m = {id:E.nextId++, jp:q.jp, en:q.en, note:q.note||'', cat:q.cat||'未分類'}; E.qs.push(m); byEn.set(k, m); addQ++; } idMap[q.id] = m.id; });
    (d.history||[]).forEach(h => { if(idMap[h.qid]){ E.hist.push({qid:idMap[h.qid], ts:h.ts, sec:h.sec, res:h.res, sid:h.sid, tgt:h.tgt}); addH++; } });
    (d.sessions||[]).forEach(s => E.sess.push(s));
    E.hist.sort((a,b) => a.ts-b.ts); E.sess.sort((a,b) => a.ts-b.ts); E.migrated = Date.now(); engSave(); renderEng();
    toast(`引きつぎ完了：問題 +${addQ}・記録 ${addH}件`);
  }catch(err){ toast('引きつげませんでした'); }
};
$('#engFile').addEventListener('change', async e => {
  const file = e.target.files[0]; if(!file) return; const log = $('#engLog'); log.textContent = 'よみこみ中…';
  try{
    let rows;
    if(/\.csv$/i.test(file.name)) rows = parseCSV(await file.text());
    else { const X = await loadXLSX(); const wb = X.read(await file.arrayBuffer(), {type:'array'}); rows = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1, defval:''}); }
    const hi = rows.findIndex(r => r.some(c => String(c).trim()==='英語')); if(hi<0) throw new Error('「日本語」「英語」の見出しが見つかりません');
    const Hh = rows[hi].map(c => String(c).trim()), col = n => Hh.findIndex(h => n.includes(h));
    const ci = {jp:col(['日本語']), en:col(['英語']), note:col(['解説','メモ','補足']), cat:col(['カテゴリ','カテゴリー','分類'])};
    const have = new Set(E.qs.map(q => q.en.trim().toLowerCase())); let add = 0, dup = 0;
    rows.slice(hi+1).forEach(r => { const g = i => i>=0 ? String(r[i] ?? '').trim() : ''; const jp = g(ci.jp), en = g(ci.en); if(!jp || !en) return;
      if(have.has(en.toLowerCase())){ dup++; return; } have.add(en.toLowerCase()); E.qs.push({id:E.nextId++, jp, en, note:g(ci.note), cat:g(ci.cat)||'未分類'}); add++; });
    engSave(); renderEng(); $('#engLog').textContent = `追加 ${add}問／重複スキップ ${dup}問　いまの問題数 ${E.qs.length}問`;
  }catch(err){ log.textContent = '⚠ ' + (err.message || 'よみこめませんでした'); }
  e.target.value = '';
});


/* =====================================================================
   v0.8：家と みち・おじゃま・住民クイズ・とくしゅ能力・おばけ・ひみつの たからばこ・さんすう
   ===================================================================== */
const ri = (a,b) => a + Math.floor(Math.random()*(b-a+1));
const choice = a => a[Math.random()*a.length|0];

/* ---------- ごほうび ---------- */
function rewardFurniture(maxPrice=600){
  const H = ensureHome();
  const pool = FURNITURE.filter(f => !f.special && f.price <= maxPrice);
  const f = choice(pool); H.inv[f.id] = (H.inv[f.id]||0) + 1; persist();
  return f;
}
function rewardHTML(list){ return `<div class="rwList">${list.map(x => `<div class="rwIt">${x}</div>`).join('')}</div>`; }
function givePts(p, why){ const keep = S; S = null; const g = addPoints(p, why); S = keep; return g; }

/* =====================================================================
   とくしゅ能力（レア いじょう）
   ===================================================================== */
const SKILLS = {
  hint:  {n:'ヒント',         i:'💡', d:'問題を といている とき、ヒントを おしえてくれる'},
  mult:  {n:'ポイント アップ', i:'💰', d:'問題を とくたびに もらえる ポイントが ふえる'},
  bonus: {n:'ボーナス よびこみ', i:'⭐', d:'ボーナス問題が 出やすくなる'},
  gift:  {n:'しあわせの おみやげ', i:'🎁', d:'クイズや おばけ退治の ごほうびが ふえる'},
  guard: {n:'おばけ よけ',     i:'🛡️', d:'おばけに さらわれにくくなる'}
};
const SP_SKILL = {koala:['hint'], redpanda:['bonus'], alpaca:['gift'], panda:['mult'], shima:['hint','mult','bonus','guard']};
const rareRes = () => (save.town?.res||[]).filter(r => (SP(r.sp).rar||1) >= 3);
function skillOwners(k){ return rareRes().filter(r => (SP_SKILL[r.sp]||[]).includes(k)); }
const hasSkill = k => skillOwners(k).length > 0;
function skillMult(){ return 1 + skillOwners('mult').reduce((a,r) => a + 0.1 + 0.05*(r.star||1), 0); }
function bonusBoost(){ return 1 + skillOwners('bonus').reduce((a,r) => a + 0.3 + 0.1*(r.star||1), 0); }
function giftBoost(){ return 1 + skillOwners('gift').length*0.5; }
function skillHTML(sp){
  const ks = SP_SKILL[sp]; if(!ks) return '';
  return `<div class="skillBox"><b>✨ とくしゅ能力</b>${ks.map(k => `<div>${SKILLS[k].i} <b>${SKILLS[k].n}</b>：${SKILLS[k].d}</div>`).join('')}</div>`;
}
/* ヒント（漢字の 問題） */
function kanjiHintBtn(){
  if(!S || !hasSkill('hint') || !cur || cur.done || cur.hinted) return '';
  const r = skillOwners('hint')[0];
  return `<button class="qchip hintChip" id="hintBtn">💡 ${esc(r.name)}の ヒント</button>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('#hintBtn'); if(!b || !cur || cur.done) return;
  const q = cur.q, r = skillOwners('hint')[0];
  let msg;
  if(S.kind==='read') msg = `「${q.reading[0]}」から はじまる ${q.reading.length}文字だよ`;
  else { const ks = kanjiOf(q.word); msg = ks.length > 1 ? `1文字目は「${ks[0]}」だよ！` : `${q.kanji}… ${q.word.length>1?'':'まわりの ことばも ヒントだよ'}`; }
  if(S.kind==='write' && kanjiOf(q.word).length===1){ msg = `おてほんを 1びょう 見せるね`; flashModel(); }
  cur.hinted = true; b.remove();
  dialog(`<div class="talkWrap"><div class="talkPic happy">${resPic(r)}</div><div class="talkBubble"><b>${esc(r.name)}</b>${esc(msg)}</div></div>`, [{label:'ありがとう！', cls:'pink', v:1}], 'wide talk');
});
function flashModel(){
  const k = $('#qSentence button.kbox'); if(!k) return;
  const span = document.createElement('span'); span.className = 'flashK'; span.textContent = kanjiOf(cur.q.word)[0];
  k.appendChild(span); setTimeout(() => span.remove(), 1200);
}

/* =====================================================================
   みちと 家：つながった 家どうしで おじゃま
   ===================================================================== */
const DIRS = [[0,-1,'n'],[0,1,'s'],[-1,0,'w'],[1,0,'e']];
function homeLinked(key){
  const [x,y] = key.split(',').map(Number), c = save.town.cells;
  return DIRS.filter(([dx,dy]) => isRoadId(c[`${x+dx},${y+dy}`])).map(d => d[2]);
}
function linkedHomes(){ return homeCells().filter(h => homeLinked(h.key).length); }
function roadNet(){
  // みちで つながった 家の グループ
  const c = save.town.cells, seen = {}, comp = {};
  let n = 0;
  Object.keys(c).forEach(k => {
    if(!isRoadId(c[k]) || seen[k] != null) return;
    const q = [k]; seen[k] = n;
    while(q.length){ const [x,y] = q.shift().split(',').map(Number);
      DIRS.forEach(([dx,dy]) => { const kk = `${x+dx},${y+dy}`; if(isRoadId(c[kk]) && seen[kk]==null){ seen[kk] = n; q.push(kk); } }); }
    n++;
  });
  homeCells().forEach(h => { const [x,y] = h.key.split(',').map(Number);
    DIRS.forEach(([dx,dy]) => { const g = seen[`${x+dx},${y+dy}`]; if(g!=null) (comp[h.key] = comp[h.key] || new Set()).add(g); }); });
  return comp;
}
function friendHomes(r){
  if(!r.home) return [];
  const net = roadNet(), mine = net[r.home]; if(!mine) return [];
  return Object.keys(net).filter(k => k!==r.home && [...net[k]].some(g => mine.has(g)) && save.town.res.some(o => o.home===k));
}
function stubHTML(key){ return homeLinked(key).map(d => `<i class="stub d-${d}"></i>`).join(''); }
/* 家を タッチ */
async function openHouse(key){
  const t = save.town, it = ITEM(t.cells[key]); if(!it) return;
  const who = t.res.filter(r => r.home===key);
  const linked = homeLinked(key).length > 0;
  const v = await dialog(`<div class="dlgArt">${picHTML(it)}</div><h2 class="dlgT">${who.length ? who.map(r => esc(r.name)).join('・')+'の 家' : 'だれも すんでいない 家'}</h2>
    <p class="dlgP" style="font-size:14px">${esc(it.name)}・${it.cap}人 すめる　${linked ? '🛣️ みちと つながっているよ' : '<small>みちと つなげると 友だちが あそびに 来るよ</small>'}</p>
    <div class="whoRow">${who.map(r => `<div class="whoIt">${resPic(r)}<span>${esc(r.name)}</span></div>`).join('') || '<small>もうすぐ だれか 引っこしてくるかも</small>'}</div>`,
    (who.length ? [{label:'🚪 おじゃまする', cls:'pink', v:'in'}] : []).concat([{label:'とじる', cls:'white', v:null}]), 'wide');
  if(v==='in') visitHouse(key);
}
const ROOM_SETS = {
  know:['shelf','desk','globe','lamp','plant'], work:['table','chair','clock','plant','fridge'], biz:['kitchen','table','chair','painting','fridge'],
  pop:['sofa','teddy','rug','starlight','tv'], drive:['trainset','toybox','tv','rug','lamp'], all:['piano','aquarium','dollhouse','shimaplush','starlight']
};
const WALL_OF = {know:'mint', work:'wood', biz:'cream', pop:'pink', drive:'sky', all:'star'};
async function visitHouse(key, hostId){
  const t = save.town, who = t.res.filter(r => r.home===key); if(!who.length) return;
  /* v5.4：マンションなど ふくすうの 住民が すむ 家は、タッチした 住民と はなせる */
  const host = who.find(r => r.id===hostId) || who[0], sp = SP(host.sp), set = ROOM_SETS[sp.bias] || ROOM_SETS.pop;
  const wall = WALLS.find(w => w.id===(WALL_OF[sp.bias]||'cream')) || WALLS[0], floor = FLOORS[host.name.length % FLOORS.length];
  const pos = [[14,58,30],[78,60,28],[30,88,24],[68,90,26],[50,64,22]];
  const furn = set.map((id,i) => { const f = FUR(id); if(!f) return ''; const [x,y,w] = pos[i]; return `<img class="vfur" src="${esc(artSrc(f.art))}" style="left:${x}%;top:${y}%;width:${w}%;z-index:${y}" alt="">`; }).join('');
  const multi = who.length > 1, step = multi ? Math.min(16, 80/who.length) : 16, x0 = multi ? 50 - step*(who.length-1)/2 : 42;
  const people = who.map((r,i) => multi
    ? `<button class="vres vres54 ${r.id===host.id?'on':''}" data-vh54="${r.id}" style="left:${x0+i*step}%;top:94%">${resPic(r)}</button>`
    : `<div class="vres" style="left:${42+i*16}%;top:94%">${resPic(r)}</div>`).join('');
  const chips = multi ? `<div class="vhWho54"><small>だれと はなす？（タッチで かわるよ）</small><div>${who.map(r => `<button class="${r.id===host.id?'on':''}" data-vh54="${r.id}">${resPic(r)}<span>${esc(r.name)}</span></button>`).join('')}</div></div>` : '';
  sound('fan');
  let msg = pick(['いらっしゃい！ ゆっくりしていってね♪','わあ、来てくれたの！？ うれしい！','ちょうど お茶を いれたところだよ！']);
  const first = host.visitedBy !== dayKey();
  if(first){ host.visitedBy = dayKey(); host.fr = (host.fr||0) + 1; persist(); }
  const v = await new Promise(res => {
    let done = false; const end = x => { if(done) return; done = true; $('#dlgBody').onclick = null; res(x); };
    dialog(`<div class="vroom"><div class="vwall" style="background:${wall.css}"><i class="win"></i></div><div class="vfloor" style="background:${floor.css}"></div>${furn}${people}</div>
    <div class="talkBubble" style="margin:10px auto 0"><b>${esc(host.name)}</b>${esc(msg)}</div>${first ? '<div class="frUp">💗 なかよし アップ！</div>' : ''}${chips}`,
    [{label:multi ? `💬 ${esc(host.name)}と はなす` : '💬 はなす', cls:'pink', v:'talk'}, {label:'🎲 クイズを ちょうだい', cls:'orange', v:'quiz'}, {label:'おいとまする', cls:'white', v:null}], 'wide').then(end);
    if(multi) $('#dlgBody').onclick = e => { const b = e.target.closest('[data-vh54]'); if(!b || b.dataset.vh54===host.id) return; $('#dlg').classList.remove('show'); end('vh:' + b.dataset.vh54); };
  });
  if(typeof v==='string' && v.startsWith('vh:')) return visitHouse(key, v.slice(3));
  if(v==='talk') talkTo(host.id, 'home');
  if(v==='quiz') residentQuiz(host, true);
}

/* =====================================================================
   住民からの クイズ
   ===================================================================== */
function makeMiniQ(){
  if(Math.random() < 0.5){
    const q = choice(BUILTIN);
    const others = shuffle(BUILTIN.filter(x => x.reading!==q.reading)).slice(0, 12).map(x => x.reading);
    const opts = shuffle([q.reading, ...shuffle(others.filter(r => Math.abs(r.length-q.reading.length)<=1)).slice(0,3)]);
    while(opts.length < 4) opts.push(others.pop());
    return {kind:'kanji', html:`<div class="mqSent">${esc(q.pre)}<u>${esc(q.word)}</u>${esc(q.post)}</div><div class="mqAsk">せんの ことばの 読みは？</div>`,
      ans:q.reading, opts:shuffle([...new Set(opts)]).slice(0,4), hint:`「${q.reading[0]}」から はじまるよ`};
  }
  const gens = ['big','mul1','box','div','big'];
  for(let k=0;k<20;k++){
    const p = MATH_UNITS[choice(gens)].gen();
    if(p.type!=='num') continue;
    const a = Number(normNum(p.ans)); if(!isFinite(a)) continue;
    const set = new Set([a]); let g = 0;
    while(set.size < 4 && g++ < 40){ const d = choice([1,2,10,-1,-2,-10,100,-100]) * (a >= 1000 ? choice([1,10,100]) : 1); const v = a + d; if(v >= 0) set.add(v); }
    return {kind:'math', html:`<div class="mqSent math">${p.q}</div>${p.disp||''}`, ans:String(a), opts:shuffle([...set].map(String)).map(fmtNumOpt), ansF:fmtNumOpt(String(a)), hint:p.hint||''};
  }
}
const fmtNumOpt = s => Number(s).toLocaleString('ja-JP');
async function miniQuiz(who, title){
  const m = makeMiniQ(); const hint = hasSkill('hint');
  const ans = m.ansF || m.ans;
  let showHint = false, v;
  while(true){
    v = await dialog(`<div class="mqHead">${who ? `<span class="mqWho">${resPic(who)}</span>` : ''}<b>${esc(title)}</b></div>${m.html}${showHint && m.hint ? `<div class="mqHint">💡 ${esc(m.hint)}</div>` : ''}`,
      m.opts.map(o => ({label:esc(o), cls:'white big', v:o})).concat(hint && !showHint && m.hint ? [{label:'💡 ヒント', cls:'gold', v:'__hint'}] : []), 'wide quiz');
    if(v==='__hint'){ showHint = true; continue; }
    break;
  }
  const ok = v===ans;
  sound(ok ? 'ok' : 'ng');
  return {ok, ans};
}
async function residentQuiz(r, fromHouse){
  const res = await miniQuiz(r, `${r.name}からの もんだい！`);
  const gb = giftBoost(), got = [];
  const p1 = givePts(Math.round(10*gb), `${r.name}の クイズに ちょうせん`); got.push(`🪙 ちょうせん +${p1}pt`);
  if(res.ok){
    const p2 = givePts(Math.round(40*gb), `${r.name}の クイズに せいかい`); got.push(`⭐ せいかい +${p2}pt`);
    r.fr = (r.fr||0) + 1; got.push('💗 なかよし アップ');
    if(Math.random() < 0.1*gb){ const f = rewardFurniture(700); got.push(`<img src="${esc(artSrc(f.art))}" alt=""> ${esc(f.name)}`); }
    confetti(1600);
  } else if(Math.random() < 0.02*gb){ const f = rewardFurniture(250); got.push(`<img src="${esc(artSrc(f.art))}" alt=""> ${esc(f.name)}`); }
  persist();
  await dialog(`<div class="talkWrap"><div class="talkPic happy">${resPic(r)}</div>
    <div class="talkBubble"><b>${esc(r.name)}</b>${res.ok ? pick(['せいかい！ すごーい！','さすが！ ばっちりだね！','ぼくより かしこいかも！']) : `ざんねん！ こたえは「${esc(res.ans)}」だよ。でも ちょうせん してくれて うれしい！`}</div></div>
    ${rewardHTML(got)}`, [{label:'やったー！', cls:'pink', v:1}], 'wide talk');
  checkBadges();
}

/* =====================================================================
   おばけ
   ===================================================================== */
function ghostCheck(){
  const t = save.town; if(!t || t.res.length < 2) return;
  const g = save.ghost || (save.ghost = {id:null, day:'', saved:0});
  if(g.id){ if(!t.res.some(r => r.id===g.id)) g.id = null; return; }
  if(g.day === dayKey()) return;
  g.day = dayKey();
  const chance = hasSkill('guard') ? 0.12 : 0.3;
  if(Math.random() < chance){ g.id = choice(t.res).id; persist(); setTimeout(() => { if(curScreen==='town') ghostAlert(); }, 700); }
  persist();
}
const ghosted = () => save.ghost?.id || null;
async function ghostAlert(){
  const r = save.town.res.find(x => x.id===ghosted()); if(!r) return;
  const v = await dialog(`<div class="ghostScene"><img class="ghostImg" src="${esc(artSrc('x_ghost'))}" alt=""><div class="ghostVictim">${resPic(r)}</div></div>
    <h2 class="dlgT">たいへん！ ${esc(r.name)}が おばけに さらわれた！</h2><p class="dlgP">おばけの 問題に 3問 こたえて（2問 せいかいで）たすけよう！</p>`,
    [{label:'🛡️ たすけに いく！', cls:'pink', v:1}, {label:'あとで', cls:'white', v:0}], 'wide');
  if(v) rescue();
}
async function rescue(){
  const r = save.town.res.find(x => x.id===ghosted()); if(!r) return;
  let ok = 0;
  for(let i=0;i<3;i++){ const res = await miniQuiz(null, `👻 おばけの 問題 ${i+1}/3`); if(res.ok) ok++; else toast(`こたえは「${res.ans}」`); }
  if(ok >= 2){
    save.ghost.id = null; save.ghost.saved = (save.ghost.saved||0) + 1; r.fr = (r.fr||0) + 3;
    const gb = giftBoost(), got = [`💗 なかよし 大アップ！`];
    got.push(`🪙 +${givePts(Math.round(100*gb), `${r.name}を たすけた`)}pt`);
    if(Math.random() < 0.35){ const f = rewardFurniture(900); got.push(`<img src="${esc(artSrc(f.art))}" alt=""> ${esc(f.name)}`); }
    persist(); confetti(2600); sound('fan');
    await dialog(`<div class="talkWrap"><div class="talkPic happy">${resPic(r)}<span class="spark s1">✨</span><span class="spark s2">💕</span></div>
      <div class="talkBubble"><b>${esc(r.name)}</b>たすけてくれて ありがとう！ きみは ヒーローだよ！</div></div>${rewardHTML(got)}`, [{label:'よかった！', cls:'gold', v:1}], 'wide talk');
    checkBadges(); renderCurrent();
  } else {
    await dialog(`<img class="ghostImg sm" src="${esc(artSrc('x_ghost'))}" alt=""><h2 class="dlgT">おばけ「まだまだ！ ケケケ〜」</h2><p class="dlgP">${ok}問 せいかい。もう一度 ちょうせんしよう！</p>`, [{label:'つぎは まけない！', cls:'', v:1}]);
  }
}

/* =====================================================================
   ホーム画面に レアな 住民
   ===================================================================== */
function renderHomeRares(){
  const box = $('#homeRares'); if(!box) return;
  const rs = shuffle(rareRes().slice()).slice(0, 3);
  box.innerHTML = rs.map((r,i) => `<button class="homeRare" data-id="${r.id}" style="left:${8+i*20}%;animation-delay:${i*0.4}s">${resPic(r)}<span class="wname">${esc(r.name)}</span></button>`).join('');
}
$('#homeHero').addEventListener('click', e => { const b = e.target.closest('.homeRare'); if(b) talkTo(b.dataset.id, 'title'); });

/* =====================================================================
   ひみつの たからばこ（リアルの ごほうびと こうかん）
   ===================================================================== */
const SECRET_PRICES = [3000, 5000, 10000, 20000];
const secretPrice = n => n < SECRET_PRICES.length ? SECRET_PRICES[n] : SECRET_PRICES[SECRET_PRICES.length-1] * Math.pow(2, n - SECRET_PRICES.length + 1);
function sec(){ return save.secret || (save.secret = {n:0, log:[]}); }
function renderSecretShop(){
  const s = sec(), price = secretPrice(s.n), poor = save.points.bal < price;
  $('#shopInfo').innerHTML = `🎁 ひみつの たからばこ <small>（おうちの人が ほんものの ごほうびと こうかんしてくれるよ）</small>`;
  $('#shopGrid').innerHTML = `<div class="shopCard special secretCard">
      <div class="sImg">${picHTML({art:'x_secret',emoji:'🎁'})}</div>
      <div class="sName">⭐ ひみつの たからばこ</div>
      <div class="sEff">中みは ないしょ…！ おうちの人に みせると、すてきな ものと こうかんできるかも？</div>
      <div class="sOwn">これまで ${s.n}こ ゲット</div>
      <button class="btn ${poor?'white':'gold'} small" data-secret="1" ${poor?'disabled':''}><span class="coin sm">P</span> ${nf(price)}</button>
      <div class="note" style="font-size:12px">つぎは ${nf(secretPrice(s.n+1))}pt</div></div>`;
}
$('#shopGrid').addEventListener('click', async e => {
  const b = e.target.closest('[data-secret]'); if(!b) return;
  const s = sec(), price = secretPrice(s.n);
  if(save.points.bal < price){ toast('ポイントが たりないよ'); return; }
  const ok = await dialog(`<div class="dlgArt">${picHTML({art:'x_secret'})}</div><h2 class="dlgT">ひみつの たからばこ</h2><p class="dlgP"><b>${nf(price)}</b>pt で かいますか？</p>`,
    [{label:'やめる', cls:'white', v:false}, {label:'かう！', cls:'gold', v:true}]);
  if(!ok) return;
  givePts(-price, 'ひみつの たからばこ');
  s.n++; const no = `No.${String(s.n).padStart(3,'0')}`;
  s.log.push({no, t:Date.now(), pt:price, done:false}); persist();
  sound('fan'); confetti(3000);
  await dialog(`<div class="secretOpen"><img src="${esc(artSrc('x_secret'))}" alt=""><span class="ray"></span></div>
    <h2 class="dlgT">🎉 ひみつの たからばこ ゲット！</h2>
    <div class="ticket"><b>ごほうび こうかんけん</b><span>${no}</span><small>${new Date().toLocaleDateString('ja-JP')}</small></div>
    <p class="dlgP">この 画面を <b>おうちの人に みせてね！</b><br>おこづかい 500円ぶんの おもちゃなどと こうかんできるよ</p>`, [{label:'みせに いく！', cls:'gold', v:1}], 'wide gold');
  renderShop();
});
function renderSecretLog(){
  const s = sec();
  $('#secretLog').innerHTML = s.log.length ? s.log.slice().reverse().map((l,i) => `<div class="secRow ${l.done?'done':''}"><b>${l.no}</b><span>${new Date(l.t).toLocaleDateString('ja-JP')}・${nf(l.pt)}pt</span>
    <button class="btn small ${l.done?'white':'green'}" data-sx="${s.log.length-1-i}">${l.done?'こうかんずみ ✓':'こうかんした'}</button></div>`).join('')
    : '<div class="note">まだ ありません</div>';
  $('#secretNext').textContent = `つぎの ねだん：${nf(secretPrice(s.n))}pt（3000 → 5000 → 10000 → 20000 → 以降 2倍）`;
}
$('#secretLog').addEventListener('click', e => { const b = e.target.closest('[data-sx]'); if(!b) return; const l = sec().log[+b.dataset.sx]; l.done = !l.done; persist(); renderSecretLog(); });

/* =====================================================================
   さんすう
   ===================================================================== */
const KD = ['','一','二','三','四','五','六','七','八','九'];
function kan4(n){ let s = ''; [[1000,'千'],[100,'百'],[10,'十']].forEach(([u,c]) => { const d = Math.floor(n/u)%10; if(d) s += (d===1?'':KD[d]) + c; }); return s + KD[n%10]; }
function kanNum(n){ if(n===0) return '〇'; const o = Math.floor(n/1e8), m = Math.floor(n/1e4)%1e4, l = n%1e4; return (o?kan4(o)+'億':'') + (m?kan4(m)+'万':'') + (l?kan4(l):''); }
function manStr(n){ const m = Math.floor(n/1e4), l = n%1e4; return m ? `${m}万${l?l:''}` : String(n); }
function normNum(s){
  s = String(s).replace(/[０-９．／]/g, c => String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/[,\s、]/g,'');
  if(/万/.test(s)){ const [a,b] = s.split('万'); return String((Number(a||0))*1e4 + Number(b||0)); }
  return s;
}
const PLACES = ['一','十','百','千','一万','十万','百万','千万'];
let hissan = (a, b, op='×') => { const A = String(a), B = String(b), w = Math.max(A.length, B.length+1)+1;
  const cell = (s) => s.padStart(w,' ').split('').map(c => `<i>${c===' '?'':c}</i>`).join('');
  return `<div class="hissan"><div>${cell(A)}</div><div class="op">${cell(op+B.padStart(w-1,' ').trimStart().padStart(w-1,' '))}</div><div class="line">${'<i></i>'.repeat(w)}</div></div>`; };
const frac = (n,d) => `<span class="frac"><b>${n}</b><b>${d}</b></span>`;
function numLine(max, step, val, unit){
  const W = 520, x0 = 30, x1 = 490, n = max/step, xs = v => x0 + (x1-x0)*v/max;
  let t = '';
  for(let i=0;i<=n;i++){ const v = i*step, big = i % 10 === 0; t += `<line x1="${xs(v)}" x2="${xs(v)}" y1="${big?32:40}" y2="56" stroke="#C0392B" stroke-width="${big?2.5:1.3}"/>`; }
  for(let i=0;i<=n;i+=10){ const v = i*step; t += `<text x="${xs(v)}" y="78" text-anchor="middle" font-size="15" font-weight="bold">${v===0?0:manStr(v)}</text>`; }
  t += `<path d="M${xs(val)} 6 L${xs(val)} 30" stroke="#2F86C6" stroke-width="3"/><path d="M${xs(val)-7} 22 L${xs(val)} 32 L${xs(val)+7} 22" fill="#2F86C6"/>`;
  return `<svg class="nline" viewBox="0 0 ${W} 86"><line x1="${x0}" x2="${x1}" y1="56" y2="56" stroke="#C0392B" stroke-width="3"/>${t}</svg>`;
}
const MATH_UNITS = {
  big:{n:'10000より 大きい 数', g:'now', i:'🔢', gen(){
    const k = ri(0,8);
    if(k===0){ const n = ri(10000000, 99999999), p = ri(0,7), d = Math.floor(n/10**p)%10;
      return {type:'num', q:`<b>${n}</b> の <b>${PLACES[p]}の位</b>の 数字は？`, ans:String(d), hint:'右から 一・十・百・千・一万… と 数えよう'}; }
    if(k===1){ const n = ri(1,9)*10**ri(4,7) + ri(0,9999)*(Math.random()<.5?1:100);
      return {type:'num', q:`<b>${kanNum(n)}</b> を 数字で 書きましょう`, ans:String(n), hint:'「万」の 前と 後ろに 分けて 考えよう'}; }
    if(k===2){ const n = ri(1000000, 99999999), opts = new Set([kanNum(n)]);
      while(opts.size<4){ const p = ri(0,7), d = Math.floor(n/10**p)%10, m = n + ((d+ri(1,8))%10 - d)*10**p; if(m>0) opts.add(kanNum(m)); }
      return {type:'choice', q:`<b>${n}</b> の 読み方は？`, ans:kanNum(n), opts:shuffle([...opts]), hint:'4けたずつ 区切って「万」を つけよう'}; }
    if(k===3){ const a = ri(1,9), b = ri(1,9), ua = choice([[1e7,'1000万'],[1e6,'100万']]), ub = choice([[1e5,'10万'],[1e4,'1万']]);
      return {type:'num', q:`<b>${ua[1]}</b> を <b>${a}</b>こ、<b>${ub[1]}</b> を <b>${b}</b>こ 合わせた 数は？`, ans:String(a*ua[0]+b*ub[0]), hint:`${ua[1]}が ${a}こで ${manStr(a*ua[0])}`}; }
    if(k===4){ const c = ri(12,99);
      return Math.random()<.5 ? {type:'num', q:`<b>1000</b> を <b>${c}</b>こ 集めた 数は？`, ans:String(c*1000), hint:'1000が 10こで 10000'}
        : {type:'num', q:`<b>${c*1000}</b> は、1000を □こ 集めた 数`, ans:String(c), hint:'下の 0を 3つ とってみよう'}; }
    if(k===5){ const pick2 = [() => { const a = ri(2,9)*10000, b = a + choice([-1,1])*ri(1,9)*1000; return [String(a), String(b), a, b]; },
        () => { const a = ri(20,60)*100, b = ri(2,9)*100; return [`${a}+${b}`, String(a+b+choice([0,0,100,-100])), a+b, null]; },
        () => { const a = ri(20,40), b = ri(1,9); return [`${a*10}万`, `${a*10+b*10}万−${b*10}万`, a, a]; }];
      let [L, R, lv, rv] = choice(pick2)(); if(rv==null) rv = Number(R);
      const ans = lv > rv ? '>' : lv < rv ? '<' : '=';
      return {type:'cmp', q:`□に あてはまる 等号か 不等号は？`, disp:`<div class="cmpQ">${L} <span class="qbox">□</span> ${R}</div>`, ans, hint:'それぞれ 計算してから くらべよう'}; }
    if(k===6){ const [m, ml] = choice([[10,'10倍'],[100,'100倍'],[1000,'1000倍']]), n = ri(2,999);
      return {type:'num', q:`<b>${n}</b> を <b>${ml}</b>した 数は？`, ans:String(n*m), hint:`右に 0を ${String(m).length-1}つ つけよう`}; }
    if(k===7){ const n = ri(2,999)*10; return {type:'num', q:`<b>${n}</b> を <b>10で わった</b> 数は？`, ans:String(n/10), hint:'一の位の 0を 1つ とろう'}; }
    const [max, step] = choice([[3000000,100000],[5000000,100000],[50000000,1000000]]), val = ri(1, max/step-1)*step;
    return {type:'num', q:`↓の めもりが あらわす 数は？`, disp:numLine(max, step, val), ans:String(val), hint:`小さい 1めもりは ${manStr(step)}`};
  }},
  mul1:{n:'かけ算の 筆算（×1けた）', g:'now', i:'✖️', gen(){
    const a = Math.random()<.7 ? ri(12,99) : ri(101,999), b = ri(2,9);
    return {type:'num', q:`<b>${a} × ${b}</b>`, disp:hissan(a,b), ans:String(a*b), hint:`一の位から：${a%10}×${b}=${(a%10)*b}`};
  }},
  mul2:{n:'かけ算の 筆算（×2けた）', g:'next', i:'✖️', gen(){
    const a = ri(12,99), b = ri(12,99);
    return {type:'num', q:`<b>${a} × ${b}</b>`, disp:hissan(a,b), ans:String(a*b), hint:`${a}×${b%10}=${a*(b%10)}、${a}×${Math.floor(b/10)*10}=${a*Math.floor(b/10)*10}`};
  }},
  div:{n:'あまりの ある わり算', g:'next', i:'➗', gen(){
    const b = ri(2,9), qn = ri(2,9), r = ri(0,b-1), a = b*qn + r;
    return {type:'rem', q:`<b>${a} ÷ ${b}</b>`, ans:`${qn}|${r}`, hint:`${b}の だんの 九九で ${a}を こえない 一番大きい 数は？`};
  }},
  dec:{n:'小数', g:'next', i:'🔟', gen(){
    const k = ri(0,3), a = ri(1,49), b = ri(1,49), f = v => (v/10).toFixed(1).replace(/\.0$/,'');
    if(k===0) return {type:'num', q:`<b>${f(a)} + ${f(b)}</b>`, ans:f(a+b), hint:'0.1が いくつ分か 考えよう'};
    if(k===1){ const [x,y] = a>=b ? [a,b] : [b,a]; return {type:'num', q:`<b>${f(x)} − ${f(y)}</b>`, ans:f(x-y), hint:'小数点を そろえて 計算しよう'}; }
    if(k===2) return {type:'num', q:`<b>0.1</b> を <b>${a}</b>こ 集めた 数は？`, ans:f(a), hint:'0.1が 10こで 1'};
    const x = ri(1,50), y = ri(1,50); return {type:'cmp', q:'□に あてはまる 不等号は？', disp:`<div class="cmpQ">${f(x)} <span class="qbox">□</span> ${f(y)}</div>`, ans: x>y?'>':x<y?'<':'=', hint:'まず 整数の 部分を くらべよう'};
  }},
  frac:{n:'分数', g:'next', i:'🍰', gen(){
    const d = ri(3,10), k = ri(0,3);
    if(k===0){ const a = ri(1,d-2), b = ri(1,d-1-a); return {type:'num', q:`${frac(a,d)} ＋ ${frac(b,d)}`, ans:`${a+b}/${d}`, hint:'分母は そのまま、分子を たそう（こたえは ○/○ で）'}; }
    if(k===1){ const a = ri(2,d), b = ri(1,a-1); return {type:'num', q:`${a===d?'1':frac(a,d)} − ${frac(b,d)}`, ans:`${a-b}/${d}`, hint:`1 = ${d}/${d} だよ`}; }
    if(k===2){ const a = ri(1,d-1); return {type:'num', q:`1を <b>${d}等分</b>した <b>${a}こ分</b>の 長さは？（○/○で）`, ans:`${a}/${d}`, hint:'分母が 等分した 数、分子が いくつ分'}; }
    const a = ri(1,d-1), b = ri(1,d-1); return {type:'cmp', q:'□に あてはまる 不等号は？', disp:`<div class="cmpQ">${frac(a,d)} <span class="qbox">□</span> ${frac(b,d)}</div>`, ans:a>b?'>':a<b?'<':'=', hint:'分母が 同じなら 分子で くらべよう'};
  }},
  unit:{n:'重さ・長さの たんい', g:'next', i:'⚖️', gen(){
    const k = ri(0,4), a = ri(1,9), b = ri(1,999);
    if(k===0) return {type:'num', q:`<b>${a}kg ${b}g</b> は 何g？`, ans:String(a*1000+b), hint:'1kg = 1000g'};
    if(k===1) return {type:'num', q:`<b>${a*1000+b}g</b> は ${a}kg と 何g？`, ans:String(b), hint:'1000gで 1kg'};
    if(k===2) return {type:'num', q:`<b>${a}t</b> は 何kg？`, ans:String(a*1000), hint:'1t = 1000kg'};
    if(k===3) return {type:'num', q:`<b>${a}km ${b}m</b> は 何m？`, ans:String(a*1000+b), hint:'1km = 1000m'};
    return {type:'num', q:`<b>${a*1000+b}m</b> は ${a}km と 何m？`, ans:String(b), hint:'1000mで 1km'};
  }},
  box:{n:'□を つかった 式', g:'next', i:'🔲', gen(){
    const k = ri(0,2);
    if(k===0){ const x = ri(2,9), b = ri(2,9); return {type:'num', q:`<b>□ × ${b} = ${x*b}</b>　□は？`, ans:String(x), hint:`${b}の だんの 九九で ${x*b}に なるのは？`}; }
    if(k===1){ const x = ri(10,90), b = ri(10,90); return {type:'num', q:`<b>□ ＋ ${b} = ${x+b}</b>　□は？`, ans:String(x), hint:`${x+b} − ${b} を 計算しよう`}; }
    const x = ri(30,99), b = ri(5,x-5); return {type:'num', q:`<b>□ − ${b} = ${x-b}</b>　□は？`, ans:String(x), hint:`${x-b} ＋ ${b} を 計算しよう`};
  }}
};
const MS = {units:['big','mul1'], count:10};
function mSave(){ return save.math || (save.math = {stats:{}, best:{}}); }
function renderMath(){
  const M = mSave();
  const btn = (k) => { const u = MATH_UNITS[k], s = M.stats[k] || {n:0, c:0}; return `<button class="mUnit ${MS.units.includes(k)?'on':''}" data-u="${k}"><span class="mi">${u.i}</span><b>${u.n}</b><small>${s.n ? `${s.c}/${s.n} せいかい（${Math.round(s.c/s.n*100)}%）` : 'まだ やってない'}</small></button>`; };
  $('#mNow').innerHTML = Object.keys(MATH_UNITS).filter(k => MATH_UNITS[k].g==='now').map(btn).join('');
  $('#mLater').innerHTML = Object.keys(MATH_UNITS).filter(k => MATH_UNITS[k].g==='next').map(btn).join('');
  syncSeg('mCount', MS.count);
}
$('#scr-math').addEventListener('click', e => {
  const u = e.target.closest('.mUnit'); if(u){ const k = u.dataset.u; MS.units = MS.units.includes(k) ? MS.units.filter(x => x!==k) : [...MS.units, k]; if(!MS.units.length) MS.units = [k]; renderMath(); }
});
$('#mCount').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; MS.count = +b.dataset.v; renderMath(); });
let MQ = null;
$('#mStart').onclick = () => {
  const list = buildSet(MS.units, MS.count);
  MQ = {list, i:0, res:[], pts:0, t0:Date.now(), combo:0}; show('mathplay'); mRender();
};
function mRender(){
  const p = MQ.list[MQ.i]; MQ.inp = ''; MQ.inp2 = ''; MQ.field = 0; MQ.done = false; MQ.hint = false; MQ.qt = Date.now();
  $('#mProg').textContent = `${MQ.i+1} / ${MQ.list.length}`; $('#mBar').style.width = (MQ.i/MQ.list.length*100)+'%';
  $('#mTag').innerHTML = `<img src="${esc(artSrc(MATH_UNITS[p.u].art))}" alt="" style="height:22px;vertical-align:middle"> ${MATH_UNITS[p.u].n}`;
  $('#mQ').innerHTML = p.q; $('#mDisp').innerHTML = p.disp || '';
  $('#mFb').innerHTML = '';
  const hs = hasSkill('hint') ? skillOwners('hint')[0] : null;
  $('#mHint').innerHTML = hs ? `<button class="qchip hintChip" id="mHintBtn">💡 ${esc(hs.name)}の ヒント</button>` : '';
  mPad(); mShow();
  $('#mNext').classList.add('hidden'); $('#mAns').classList.remove('hidden');
}
function mPad(){
  const p = MQ.list[MQ.i]; let h = '';
  if(p.type==='cmp') h = ['>','=','<'].map(c => `<button class="mk big" data-c="${c}">${c}</button>`).join('');
  else if(p.type==='choice') h = p.opts.map(o => `<button class="mk opt" data-c="${esc(o)}">${esc(o)}</button>`).join('');
  else { const keys = ['7','8','9','4','5','6','1','2','3','0', MATH_UNITS[p.u].key||'00','⌫'];
    h = keys.map(k => `<button class="mk" data-k="${k}">${k}</button>`).join(''); }
  $('#mPad').className = 'mPad ' + p.type; $('#mPad').innerHTML = h;
  $('#mAns').classList.toggle('hidden', p.type==='cmp' || p.type==='choice');
}
function mShow(){
  const p = MQ.list[MQ.i];
  if(p.type==='rem') $('#mInput').innerHTML = `<span class="mBox ${MQ.field===0?'on':''}" data-f="0">${MQ.inp||'&nbsp;'}</span> あまり <span class="mBox ${MQ.field===1?'on':''}" data-f="1">${MQ.inp2||'&nbsp;'}</span>`;
  else if(p.type==='num') $('#mInput').innerHTML = `<span class="mBox on wide">${MQ.inp||'&nbsp;'}</span>`;
  else $('#mInput').innerHTML = '';
}
$('#mInput').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if(b){ MQ.field = +b.dataset.f; mShow(); } });
$('#mPad').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b || MQ.done) return;
  if(b.dataset.c){ mJudge(b.dataset.c); return; }
  const k = b.dataset.k, key = MQ.field ? 'inp2' : 'inp';
  if(k==='⌫') MQ[key] = MQ[key].slice(0,-1); else if(MQ[key].length < 12) MQ[key] += k;
  mShow();
});
$('#mAns').onclick = () => {
  const p = MQ.list[MQ.i]; if(MQ.done) return;
  if(!MQ.inp && p.type!=='rem'){ toast('こたえを 入れてね'); return; }
  mJudge(p.type==='rem' ? `${MQ.inp||0}|${MQ.inp2||0}` : MQ.inp);
};
document.addEventListener('click', e => {
  const b = e.target.closest('#mHintBtn'); if(!b || !MQ) return;
  const p = MQ.list[MQ.i], r = skillOwners('hint')[0]; MQ.hint = true; b.remove();
  dialog(`<div class="talkWrap"><div class="talkPic happy">${resPic(r)}</div><div class="talkBubble"><b>${esc(r.name)}</b>${esc(p.hint || 'ゆっくり 考えてみて！')}</div></div>`, [{label:'ありがとう！', cls:'pink', v:1}], 'wide talk');
});
function mEq(p, v){
  if(p.type==='cmp' || p.type==='choice') return v===p.ans;
  if(p.type==='rem'){ const [a,b] = v.split('|').map(Number), [x,y] = p.ans.split('|').map(Number); return a===x && b===y; }
  const n = normNum(v), a = normNum(p.ans);
  if(a.includes('/')){ if(!n.includes('/')) return false; const [p1,q1] = n.split('/').map(Number), [p2,q2] = a.split('/').map(Number); return q1 && p1*q2===p2*q1; }
  return Math.abs(Number(n) - Number(a)) < 1e-9 && n!=='';
}
function mJudge(v){
  const p = MQ.list[MQ.i]; MQ.done = true;
  const ok = mEq(p, v), sec = (Date.now()-MQ.qt)/1000; const dkey = qKeyOf(p), dm = diffMult(dkey, p.u); qhRec(dkey, ok); if(ok && dm > 1.05) save.chalCnt = (save.chalCnt||0)+1;
  const M = mSave(), st = M.stats[p.u] || (M.stats[p.u] = {n:0, c:0}); st.n++; if(ok) st.c++;
  const dr = dayRec(); dr.n++; if(ok) dr.c++; checkDaily();
  let pt = 0;
  if(ok){ MQ.combo++; pt = Math.round(10*dm) + (sec < 15 ? 3 : 0) + (MQ.combo%5===0 ? 10 : 0); const kr = townKnowRate(); pt = Math.round(pt*(1+kr)*skillMult()); pt = givePts(pt, window.MQBUN ? 'ぶんしょう せいかい' : window.MQEK ? 'えいご せいかい' : window.MQSCI ? 'りか せいかい' : window.MQSOC ? 'しゃかい せいかい' : 'さんすう せいかい'); MQ.pts += pt; celebrate(null, pt); }
  else { MQ.combo = 0; sound('ng'); }
  MQ.res.push({p, ok, v});
  persist();
  const shw = p.type==='rem' ? p.ans.replace('|',' あまり ') : p.type==='num' && /^\d+$/.test(p.ans) ? Number(p.ans).toLocaleString('ja-JP') : p.ans;
  $('#mFb').innerHTML = ok ? `<span class="okTxt">⭕ せいかい！</span> <span class="ptFloat">+${pt}pt</span>${diffTag(dm)}` : `<span class="ngTxt">❌ ざんねん</span> こたえは <b>${esc(shw)}</b>${p.hint ? `<span class="noteTxt">💡 ${esc(p.hint)}</span>` : ''}`;
  $('#mAns').classList.add('hidden'); $('#mNext').classList.remove('hidden');
  $('#mNext').textContent = MQ.i+1 >= MQ.list.length ? 'けっかを 見る ▶' : 'つぎへ ▶';
}
$('#mNext').onclick = () => {
  MQ.i++;
  if(MQ.i < MQ.list.length){ mRender(); return; }
  const n = MQ.res.length, c = MQ.res.filter(r => r.ok).length;
  if(n>=5) MQ.pts += givePts(20, 'さんすう セット さいごまで');
  if(n>=5 && c===n){ MQ.pts += givePts(30, 'さんすう パーフェクト！'); save.counters.perfect++; }
  save.history.push({d:Date.now(), mode:'math', kind:'math', subj:(window.MQREV?'rev':window.MQBUN?'bun':window.MQEK?'ek':window.MQSCI?'sci':window.MQSOC?'soc':'math'), n, c, pt:MQ.pts, time:Date.now()-MQ.t0}); persist(); checkBadges();
  const tier = c===n ? 'bird_jump' : c/n>=0.6 ? 'bird_thumb' : 'bird_cheer';
  if(c===n) confetti(2600);
  dialog(`<div class="dlgArt big"><img src="${esc(artSrc(tier))}" alt=""></div><h2 class="dlgT">${c===n?'パーフェクト！':c/n>=0.6?'よく できました！':'ナイス チャレンジ！'}</h2>
    <div class="chalNote">🔥 まちがえた 問題・はじめての 問題に チャレンジすると ポイントが ふえるよ！</div><p class="dlgP" style="font-size:22px"><b>${c} / ${n}</b> せいかい　<span class="ptFloat">+${MQ.pts}pt</span></p>
    <div class="mResList">${MQ.res.map((r,i) => `<div class="${r.ok?'ok':'ng'}">${r.ok?'⭕':'❌'} ${i+1}. ${r.p.q.replace(/<[^>]+>/g,'').slice(0,26)}</div>`).join('')}</div>`,
    [{label:'もう一度', cls:'orange', v:'again'}, {label:(window.MQREV?'ホームへ':window.MQBUN?'ぶんしょうメニュー':window.MQEK?'えいごメニュー':window.MQSCI?'りかメニュー':window.MQSOC?'しゃかいメニュー':'さんすうメニュー'), cls:'white', v:'menu'}], 'wide').then(v => { if(v==='again') (window.MQREV ? reviewStart() : window.MQBUN ? bunStart() : window.MQEK ? ekStart() : window.MQSCI ? sciStart() : window.MQSOC ? socStart() : $('#mStart').click()); else show(window.MQREV ? 'home' : window.MQBUN ? 'bun' : window.MQEK ? 'ekid' : window.MQSCI ? 'sci' : window.MQSOC ? 'soc' : 'math'); });
};
$('#mQuit').onclick = () => { if(confirm('とちゅうで やめますか？（ここまでの ポイントは もらえます）')) show(window.MQREV ? 'home' : window.MQBUN ? 'bun' : window.MQEK ? 'ekid' : window.MQSCI ? 'sci' : window.MQSOC ? 'soc' : 'math'); };
$('#subjMath').onclick = () => show('math');

/* ---------- バッジ ---------- */
BADGES.push(
  {id:'ghost1', i:'👻', n:'おばけ たいじ',      f:()=>(save.ghost?.saved||0)>=1},
  {id:'ghost5', i:'🦸', n:'まちの ヒーロー',    f:()=>(save.ghost?.saved||0)>=5},
  {id:'secret1',i:'🎁', n:'ひみつの たからばこ', f:()=>(save.secret?.n||0)>=1},
  {id:'math50', i:'🔢', n:'さんすう 50問',      f:()=>Object.values(save.math?.stats||{}).reduce((a,s)=>a+s.c,0)>=50},
  {id:'math300',i:'🧮', n:'さんすう 300問',     f:()=>Object.values(save.math?.stats||{}).reduce((a,s)=>a+s.c,0)>=300}
);

/* ---------- つなぎ ---------- */
const _rh = renderHome; renderHome = function(){ _rh(); renderHomeRares(); };
const _rt = renderTown; renderTown = function(){ ensureTown(); ghostCheck(); _rt();
  if(ghosted()){ const r = save.town.res.find(x => x.id===ghosted()); if(r) $('#townHead').insertAdjacentHTML('beforeend', `<button class="btn pink ghostBtn" id="btnGhost"><img src="${esc(artSrc('x_ghost'))}" alt=""> ${esc(r.name)}を たすける！</button>`); }
  const gb = $('#btnGhost'); if(gb) gb.onclick = ghostAlert; };
const _rs = renderSettings; renderSettings = function(){ _rs(); renderSecretLog(); };
function renderShop(){
  if(shopTab==='secret'){ ensureTown(); $$('#shopTabs button').forEach(b => b.classList.toggle('on', b.dataset.v==='secret')); renderSecretShop(); return; }
  renderShop_v7();
}


/* =====================================================================
   v0.9：さんすう（3〜5年）・わたしの家（うえから／よこから）
   ===================================================================== */
/* ---------- さんすう：数の よみかた（兆・億・万） ---------- */
function normNum(s){
  s = String(s).replace(/[０-９．／]/g, c => String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/[,\s、]/g,'');
  if(/[兆億万]/.test(s)){
    let total = 0, rest = s;
    [['兆',1e12],['億',1e8],['万',1e4]].forEach(([u,v]) => { const i = rest.indexOf(u); if(i>=0){ total += Number(rest.slice(0,i)||0)*v; rest = rest.slice(i+1); } });
    return String(total + Number(rest||0));
  }
  return s;
}
function manOku(n){ // 350000000 → 3億5000万
  const t = Math.floor(n/1e12), o = Math.floor(n/1e8)%1e4, m = Math.floor(n/1e4)%1e4, l = n%1e4;
  return (t?t+'兆':'') + (o?o+'億':'') + (m?m+'万':'') + (l?l:'') || '0';
}
function kanBig(n){ const t = Math.floor(n/1e12), r = n%1e12; return (t?kan4(t)+'兆':'') + (r?kanNum(r):''); }
const f2 = v => String(Math.round(v*100)/100);
const fmtHM = (h,m) => `${h}時${m?m+'分':''}`;
const gcd = (a,b) => b ? gcd(b, a%b) : a;

Object.assign(MATH_UNITS, {
  big:   Object.assign(MATH_UNITS.big,   {g:3, art:'mi_blocks', key:'万'}),
  mul1:  Object.assign(MATH_UNITS.mul1,  {g:3, art:'mi_mul'}),
  mul2:  Object.assign(MATH_UNITS.mul2,  {g:3, art:'mi_calc'}),
  div:   Object.assign(MATH_UNITS.div,   {g:3, art:'mi_cookie'}),
  dec:   Object.assign(MATH_UNITS.dec,   {g:3, art:'mi_cup', key:'.'}),
  frac:  Object.assign(MATH_UNITS.frac,  {g:3, art:'mi_cake', key:'/'}),
  unit:  Object.assign(MATH_UNITS.unit,  {g:3, art:'mi_scale', n:'重さ・長さの たんい'}),
  box:   Object.assign(MATH_UNITS.box,   {g:3, art:'mi_qbox'}),
  addsub:{n:'たし算・ひき算の 筆算', g:3, art:'mi_seesaw', gen(){
    const plus = Math.random()<.5;
    if(plus){ const a = ri(100,4999), b = ri(100,4999); return {type:'num', q:`<b>${a} ＋ ${b}</b>`, disp:hissan(a,b,'+'), ans:String(a+b), hint:'一の位から じゅんに たそう。くり上がりに 気をつけて'}; }
    const a = ri(300,9999), b = ri(100,a-1); return {type:'num', q:`<b>${a} − ${b}</b>`, disp:hissan(a,b,'−'), ans:String(a-b), hint:'ひけない ときは 上の位から 1 かりよう'};
  }},
  time:{n:'時こくと 時間', g:3, art:'mi_clock', gen(){
    const k = ri(0,2);
    if(k===0){ const h = ri(1,10), m = ri(1,11)*5, d = ri(2,11)*5, after = Math.random()<.6;
      const t0 = h*60+m, t1 = after ? t0+d : t0-d, show = t => fmtHM(Math.floor(t/60), t%60);
      const set = new Set([show(t1)]); [5,10,-5,-10,60,-60].forEach(x => { if(set.size<4) set.add(show(t1+x)); });
      return {type:'choice', q:`<b>${fmtHM(h,m)}</b> の <b>${d}分${after?'後':'前'}</b>の 時こくは？`, ans:show(t1), opts:shuffle([...set]).slice(0,4), hint:'ちょうどの 時こく（○時）を 間に はさんで 考えよう'}; }
    if(k===1){ const h = ri(1,2), m = ri(1,11)*5; return {type:'num', q:`<b>${h}時間${m}分</b> は 何分？`, ans:String(h*60+m), hint:'1時間 = 60分'}; }
    const s = ri(2,9)*10 + ri(0,5); return {type:'num', q:`<b>${s+60}びょう</b> は 1分 何びょう？`, ans:String(s), hint:'1分 = 60びょう'};
  }},
  len:{n:'長さ（mm・cm・m・km）', g:3, art:'mi_ruler', gen(){
    const k = ri(0,3), a = ri(1,9), b = ri(1,9);
    if(k===0) return {type:'num', q:`<b>${a}cm ${b}mm</b> は 何mm？`, ans:String(a*10+b), hint:'1cm = 10mm'};
    if(k===1){ const c = ri(1,99); return {type:'num', q:`<b>${a}m ${c}cm</b> は 何cm？`, ans:String(a*100+c), hint:'1m = 100cm'}; }
    if(k===2){ const c = ri(1,999); return {type:'num', q:`<b>${a}km ${c}m</b> は 何m？`, ans:String(a*1000+c), hint:'1km = 1000m'}; }
    const x = ri(100,900), y = ri(100,900); return {type:'num', q:`<b>${a}km ${x}m ＋ ${y}m</b> は 何m？`, ans:String(a*1000+x+y), hint:'ぜんぶ mに そろえてから たそう'};
  }},
  /* ---------- 4年生 ---------- */
  oku:{n:'大きな 数（億・兆）', g:4, art:'mi_coins', key:'億', gen(){
    const k = ri(0,3);
    if(k===0){ const n = ri(1e9, 9.99e11), P = ['一','十','百','千','一万','十万','百万','千万','一億','十億','百億','千億'], p = ri(4,11);
      return {type:'num', q:`<b>${n}</b> の <b>${P[p]}の位</b>の 数字は？`, ans:String(Math.floor(n/10**p)%10), hint:'右から 4けたずつ 区切ると 万・億が 見えてくるよ'}; }
    if(k===1){ const n = ri(1,999)*1e8 + ri(0,9999)*1e4; return {type:'num', q:`<b>${kanBig(n)}</b> を 数字で 書こう`, ans:String(n), hint:'「億」「万」の キーを つかっても いいよ'}; }
    if(k===2){ const base = ri(2,99), u = choice([[1e8,'億'],[1e12,'兆']]), m = choice([10,100]);
      const v = base*u[0]*m, opts = new Set([manOku(v)]); [10,100,0.1].forEach(x => opts.add(manOku(Math.round(base*u[0]*x))));
      return {type:'choice', q:`<b>${base}${u[1]}</b> を <b>${m}倍</b>した 数は？`, ans:manOku(v), opts:shuffle([...opts]).slice(0,4), hint:`${m}倍すると 位が ${String(m).length-1}つ 上がる`}; }
    const a = ri(10,99)*1e8 + ri(0,9999)*1e4, b = a + choice([-1,1])*ri(1,9)*1e4*choice([1,1000]);
    return {type:'cmp', q:'□に あてはまる 不等号は？', disp:`<div class="cmpQ">${manOku(a)} <span class="qbox">□</span> ${manOku(b)}</div>`, ans:a>b?'>':a<b?'<':'=', hint:'大きい 位から くらべよう'};
  }},
  div2:{n:'わり算の 筆算', g:4, art:'mi_pizza', gen(){
    if(Math.random()<.55){ const b = ri(2,9), q = ri(12,199), r = ri(0,b-1), a = b*q+r; if(a>999) return MATH_UNITS.div2.gen(); return {type:'rem', q:`<b>${a} ÷ ${b}</b>`, ans:`${q}|${r}`, hint:'大きい 位から「たてる・かける・ひく・おろす」'}; }
    const b = ri(11,49), q = ri(2,19), r = ri(0,b-1), a = b*q+r;
    return {type:'rem', q:`<b>${a} ÷ ${b}</b>`, ans:`${q}|${r}`, hint:`${b}を ${Math.round(b/10)*10}と みて 見当を つけよう`};
  }},
  gaisu:{n:'がい数（四捨五入）', g:4, art:'mi_line', gen(){
    const n = ri(1000, 99999), k = ri(0,2);
    if(k===0) return {type:'num', q:`<b>${n}</b> を 四捨五入して <b>百の位</b>までの がい数に`, ans:String(Math.round(n/100)*100), hint:'十の位を 見て 0〜4は 切りすて、5〜9は 切り上げ'};
    if(k===1) return {type:'num', q:`<b>${n}</b> を 四捨五入して <b>千の位</b>までの がい数に`, ans:String(Math.round(n/1000)*1000), hint:'百の位を 見よう'};
    const d = 10**(String(n).length-1); return {type:'num', q:`<b>${n}</b> を 四捨五入して <b>上から 1けた</b>の がい数に`, ans:String(Math.round(n/d)*d), hint:'上から 2けためを 見よう'};
  }},
  rules:{n:'計算の じゅんじょ', g:4, art:'mi_medal', gen(){
    const a = ri(2,30), b = ri(2,12), c = ri(2,9), k = ri(0,3);
    if(k===0) return {type:'num', q:`<b>${a} ＋ ${b} × ${c}</b>`, ans:String(a+b*c), hint:'かけ算を さきに 計算しよう'};
    if(k===1) return {type:'num', q:`<b>(${a} ＋ ${b}) × ${c}</b>`, ans:String((a+b)*c), hint:'( ) の 中を さきに'};
    if(k===2){ const x = b*c + ri(1,40); return {type:'num', q:`<b>${x} − ${b} × ${c}</b>`, ans:String(x-b*c), hint:'かけ算を さきに 計算しよう'}; }
    const y = c*ri(2,9); return {type:'num', q:`<b>${a} ＋ ${y} ÷ ${c}</b>`, ans:String(a+y/c), hint:'わり算を さきに 計算しよう'};
  }},
  dec2:{n:'小数の 計算', g:4, art:'mi_graph', key:'.', gen(){
    const k = ri(0,2);
    if(k===0){ const a = ri(101,999), b = ri(11,999); return {type:'num', q:`<b>${f2(a/100)} ＋ ${f2(b/100)}</b>`, ans:f2((a+b)/100), hint:'小数点の 位置を そろえよう'}; }
    if(k===1){ const a = ri(200,999), b = ri(11,a-1); return {type:'num', q:`<b>${f2(a/100)} − ${f2(b/100)}</b>`, ans:f2((a-b)/100), hint:'小数点の 位置を そろえよう'}; }
    const a = ri(11,99), b = ri(2,9); return {type:'num', q:`<b>${f2(a/10)} × ${b}</b>`, ans:f2(a*b/10), hint:`${a}×${b}を 計算して、小数点を 1けた うごかそう`};
  }},
  area:{n:'面積', g:4, art:'mi_area', gen(){
    const k = ri(0,3), a = ri(2,15), b = ri(2,15);
    if(k===0) return {type:'num', q:`たて <b>${a}cm</b>、よこ <b>${b}cm</b> の 長方形の 面積は？（cm²）`, disp:`<div class="rectFig" style="width:${b*12}px;height:${a*12}px"></div>`, ans:String(a*b), hint:'長方形の 面積 = たて × よこ'};
    if(k===1) return {type:'num', q:`1辺 <b>${a}cm</b> の 正方形の 面積は？（cm²）`, disp:`<div class="rectFig" style="width:${a*12}px;height:${a*12}px"></div>`, ans:String(a*a), hint:'正方形の 面積 = 1辺 × 1辺'};
    if(k===2) return {type:'num', q:`面積が <b>${a*b}cm²</b> で たてが <b>${a}cm</b> の 長方形。よこは 何cm？`, ans:String(b), hint:`□ × ${a} = ${a*b}`};
    const m = ri(2,9); return {type:'num', q:`<b>${m}m²</b> は 何cm²？`, ans:String(m*10000), hint:'1m² = 100cm × 100cm = 10000cm²'};
  }},
  frac2:{n:'分数（帯分数・仮分数）', g:4, art:'mi_cake', key:'/', gen(){
    const d = ri(3,9), w = ri(1,3), n = ri(1,d-1), k = ri(0,2);
    if(k===0) return {type:'num', q:`<b>${w}</b>${frac(n,d)} を 仮分数に（○/○で）`, ans:`${w*d+n}/${d}`, hint:`${w} = ${w*d}/${d} だよ`};
    if(k===1){ const set = new Set([`${w}と${n}/${d}`]); [[w+1,n],[w,(n%(d-1))+1],[w-1>0?w-1:w+2,n]].forEach(([x,y]) => set.add(`${x}と${y}/${d}`));
      return {type:'choice', q:`${frac(w*d+n,d)} を 帯分数に すると？`, ans:`${w}と${n}/${d}`, opts:shuffle([...set]).slice(0,4), hint:`${w*d+n} ÷ ${d} を 計算しよう`}; }
    const a = ri(1,d-1), b = ri(1,d-1); return {type:'num', q:`${frac(a,d)} ＋ ${frac(b,d)}（仮分数で）`, ans:`${a+b}/${d}`, hint:'分母は そのまま、分子を たそう'};
  }},
  /* ---------- 5年生 ---------- */
  decmd:{n:'小数の かけ算・わり算', g:5, art:'mi_calc', key:'.', gen(){
    if(Math.random()<.5){ const a = ri(11,49), b = ri(11,49); return {type:'num', q:`<b>${f2(a/10)} × ${f2(b/10)}</b>`, ans:f2(a*b/100), hint:`${a}×${b}を して、小数点を 2けた うごかそう`}; }
    const b = ri(11,49), q = ri(2,9); return {type:'num', q:`<b>${f2(b*q/10)} ÷ ${f2(b/10)}</b>`, ans:String(q), hint:'わる数と わられる数を どちらも 10倍しよう'};
  }},
  fracadd:{n:'分母の ちがう 分数', g:5, art:'mi_pie', key:'/', gen(){
    const D = [2,3,4,5,6,8,10], d1 = choice(D); let d2 = choice(D); if(d2===d1) d2 = d1===2 ? 3 : 2;
    const a = ri(1,d1-1), b = ri(1,d2-1), x = a*d2, y = b*d1;
    if(Math.random()<.5 || x===y) return {type:'num', q:`${frac(a,d1)} ＋ ${frac(b,d2)}`, ans:`${x+y}/${d1*d2}`, hint:'通分して 分母を そろえよう'};
    const [p,q] = x>y ? [[a,d1],[b,d2]] : [[b,d2],[a,d1]];
    return {type:'num', q:`${frac(p[0],p[1])} − ${frac(q[0],q[1])}`, ans:`${Math.abs(x-y)}/${d1*d2}`, hint:'通分して 分母を そろえよう'};
  }},
  divisor:{n:'約数と 倍数', g:5, art:'mi_blocks', gen(){
    const k = ri(0,2), a = ri(2,9)*ri(2,6), b = ri(2,9)*ri(2,6);
    if(k===0){ const g = gcd(a,b); return {type:'num', q:`<b>${a}</b> と <b>${b}</b> の 最大公約数は？`, ans:String(g), hint:'どちらも わりきれる 一番 大きい 数'}; }
    if(k===1){ const x = ri(2,9), y = ri(2,9); return {type:'num', q:`<b>${x}</b> と <b>${y}</b> の 最小公倍数は？`, ans:String(x*y/gcd(x,y)), hint:'大きい ほうの 数の 倍数を じゅんに しらべよう'}; }
    const n = choice([12,18,20,24,30,36,16,28]); let c = 0; for(let i=1;i<=n;i++) if(n%i===0) c++;
    return {type:'num', q:`<b>${n}</b> の 約数は ぜんぶで いくつ？`, ans:String(c), hint:'1と 自分も 約数だよ。ペアで さがそう'};
  }},
  ave:{n:'平均', g:5, art:'mi_seesaw', gen(){
    const n = ri(3,5), v = Array.from({length:n}, () => ri(40,95)); const s = v.reduce((a,b)=>a+b,0); v[n-1] += (n - s%n) % n;
    const avgV = v.reduce((a,b)=>a+b,0)/n;
    return {type:'num', q:`<b>${v.join('、')}</b> の 平均は？`, ans:String(avgV), hint:'ぜんぶ たして、こ数で わろう'};
  }},
  ratio:{n:'割合（百分率）', g:5, art:'mi_pie', key:'.', gen(){
    const k = ri(0,2), base = ri(2,20)*10, p = ri(1,9)*10;
    if(k===0) return {type:'num', q:`<b>${base}円</b> の <b>${p}%</b> は 何円？`, ans:String(base*p/100), hint:'もとに する量 × 割合（%は 100で わる）'};
    if(k===1) return {type:'num', q:`<b>${base}人</b> の うち <b>${base*p/100}人</b> は 何%？`, ans:String(p), hint:'くらべる量 ÷ もとに する量 × 100'};
    return {type:'num', q:`<b>${p}%</b> を 小数で あらわすと？`, ans:f2(p/100), hint:'100%が 1 だよ'};
  }},
  vol:{n:'体積', g:5, art:'mi_cube', gen(){
    const k = ri(0,2), a = ri(2,10), b = ri(2,10), c = ri(2,10);
    if(k===0) return {type:'num', q:`たて <b>${a}cm</b>、よこ <b>${b}cm</b>、高さ <b>${c}cm</b> の 直方体の 体積は？（cm³）`, ans:String(a*b*c), hint:'たて × よこ × 高さ'};
    if(k===1) return {type:'num', q:`1辺 <b>${a}cm</b> の 立方体の 体積は？（cm³）`, ans:String(a*a*a), hint:'1辺 × 1辺 × 1辺'};
    return {type:'num', q:`<b>${a}L</b> は 何cm³？`, ans:String(a*1000), hint:'1L = 1000cm³'};
  }}
});
const GRADE_UNITS = g => Object.keys(MATH_UNITS).filter(k => MATH_UNITS[k].g===g);
function renderMath(){
  const M = mSave();
  if(!MS.loaded){ MS.loaded = 1; if(M.sel) MS.units = M.sel.filter(k => MATH_UNITS[k]); }
  if(!MS.units.length) MS.units = ['big','mul1'];
  const gr = M.grade || 3;
  $('#mGradeTabs').innerHTML = [3,4,5].map(g => `<button data-g="${g}" class="${g===gr?'on':''}">${g}年生</button>`).join('');
  $('#mUnitsAll').innerHTML = GRADE_UNITS(gr).map(k => { const u = MATH_UNITS[k], s = M.stats[k] || {n:0, c:0};
    const rate = s.n ? Math.round(s.c/s.n*100) : null;
    return `<button class="mUnit ${MS.units.includes(k)?'on':''}" data-u="${k}"><img class="mIco" src="${esc(artSrc(u.art))}" alt="">
      <span class="mTxt"><b>${u.n}</b><small>${s.n ? `${s.c}/${s.n} せいかい` : 'まだ やってない'}</small>${rate!=null ? `<i class="mBar"><i style="width:${rate}%"></i></i>` : ''}</span>
      ${MS.units.includes(k) ? '<span class="mChk">✓</span>' : ''}</button>`; }).join('');
  $('#mSelNote').innerHTML = `えらんだ たんげん：<b>${MS.units.length}</b>こ（${MS.units.map(k => MATH_UNITS[k].n).join('・')}）`;
  syncSeg('mCount', MS.count);
  M.sel = MS.units.slice(); persist();
}
$('#mGradeTabs').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if(!b) return; mSave().grade = +b.dataset.g; persist(); renderMath(); });

/* =====================================================================
   わたしの家：うえから／よこから
   ===================================================================== */
ROOM.cols = 8; ROOM.rows = 8;
const FOOT = {bed:[1,2], sofa:[2,1], shelf:[2,1], desk:[2,1], tv:[2,1], rug:[2,2], piano:[2,1], wardrobe:[2,1], kitchen:[2,1], aquarium:[2,1], trainset:[2,1]};
const SIDE_W = {bed:2.1, sofa:2, table:1.3, chair:.85, shelf:1.3, desk:2, tv:1.7, plant:1.1, rug:2.1, piano:1.9, wardrobe:1.3, kitchen:2.2,
  teddy:.9, clock:.85, aquarium:1.8, globe:.9, painting:1.1, toybox:1.15, lamp:.85, fridge:1, trainset:1.8, shimaplush:.9, dollhouse:1.3, starlight:.8};
let homeView = 'top';
const fpOf = (id, r) => { const [w,h] = FOOT[id] || [1,1]; return (r||0)%2 ? [h,w] : [w,h]; };
function occGrid(skipIdx){
  const H = ensureHome(), g = {};
  H.items.forEach((it,i) => { if(i===skipIdx) return; const f = FUR(it.id); if(!f) return; const [w,h] = fpOf(it.id, it.r);
    for(let dx=0;dx<w;dx++) for(let dy=0;dy<h;dy++) g[`${f.floor?'F':'N'}${it.x+dx},${it.y+dy}`] = i; });
  return g;
}
function canPlace(id, x, y, r, skipIdx){
  const f = FUR(id), [w,h] = fpOf(id, r), g = occGrid(skipIdx);
  if(x<0 || y<0 || x+w>ROOM.cols || y+h>ROOM.rows) return false;
  for(let dx=0;dx<w;dx++) for(let dy=0;dy<h;dy++) if(g[`${f.floor?'F':'N'}${x+dx},${y+dy}`]!=null) return false;
  return true;
}
function fitXY(id, x, y, r, skipIdx){ // はみ出す ときは 左上に ずらす
  const [w,h] = fpOf(id, r); x = Math.min(x, ROOM.cols-w); y = Math.min(y, ROOM.rows-h);
  return canPlace(id, x, y, r, skipIdx) ? [x,y] : null;
}
function migrateHome(){
  const H = ensureHome(); if(H.v9) return;
  const old = H.items; H.items = [];
  old.forEach(it => { const r = 0, p = fitXY(it.id, it.x, it.y, r);
    if(p) H.items.push({id:it.id, x:p[0], y:p[1], r}); else H.inv[it.id] = (H.inv[it.id]||0) + 1; });
  H.v9 = 1; if(H.visit){ H.visit.x = Math.min(H.visit.x, 7); H.visit.y = Math.min(H.visit.y, 7); } persist();
}
function roomSize(){ return Math.min(Math.max(280, $('#roomWrap').clientWidth - 8), 640); }
function renderMyHome(){
  migrateHome();
  const H = ensureHome(), sty = homeStyle();
  const Wl = WALLS.find(w=>w.id===H.wall) || WALLS[0], Fl = FLOORS.find(f=>f.id===H.floor) || FLOORS[0];
  $('#homeHead').innerHTML = `<div class="hmTitle">🏡 わたしの家</div>
    <div class="hmStats"><span>✨ すてき度 <b>${sty}</b></span><span>📘 ちしき <b>+${Math.round(homeKnow()*100)}%</b></span><span>🪑 家具 <b>${H.items.length}</b></span></div>`;
  if(homeEdit) homeView = 'top';
  $$('#viewSeg button').forEach(b => b.classList.toggle('on', b.dataset.v===homeView));
  $('#viewSeg').classList.toggle('hidden', homeEdit);
  const S0 = roomSize(), box = $('#roomBox');
  box.className = 'roomBox v-' + homeView + (homeEdit ? ' edit' : '');
  let h = '';
  if(homeView==='top'){
    const wallT = Math.round(S0*0.07), cs = (S0 - 2*Math.round(S0*0.035)) / ROOM.cols, side = Math.round(S0*0.035);
    box.style.width = S0+'px'; box.style.height = (S0 - 2*side + wallT + side)+'px';
    box.style.setProperty('--cs', cs+'px');
    h += `<div class="tWall" style="background:${Wl.css};left:0;right:0;top:0;height:${wallT}px"><i class="tWin" style="left:22%"></i><i class="tWin" style="right:22%"></i></div>
      <div class="tWall sideW" style="background:${Wl.css};left:0;width:${side}px;top:${wallT}px;bottom:0"></div>
      <div class="tWall sideW" style="background:${Wl.css};right:0;width:${side}px;top:${wallT}px;bottom:0"></div>
      <div class="tWall sideW" style="background:${Wl.css};left:0;right:0;height:${side}px;bottom:0"></div>
      <div class="tFloor" id="room" style="left:${side}px;top:${wallT}px;width:${cs*ROOM.cols}px;height:${cs*ROOM.rows}px;background:${Fl.css}">`;
    if(homeEdit) for(let y=0;y<ROOM.rows;y++) for(let x=0;x<ROOM.cols;x++) h += `<i class="tCell" style="left:${x*cs}px;top:${y*cs}px;width:${cs}px;height:${cs}px"></i>`;
    H.items.forEach((it,i) => {
      const f = FUR(it.id); if(!f) return; const [w0,h0] = FOOT[it.id] || [1,1], [w,hh] = fpOf(it.id, it.r);
      const z = f.floor ? 2 : (it.y+hh)*10 + 5;
      h += `<div class="tItem ${f.floor?'flr':''} ${homeEdit && i===homeSel?'sel':''}" data-idx="${i}" style="left:${it.x*cs}px;top:${it.y*cs}px;width:${w*cs}px;height:${hh*cs}px;z-index:${z}">
        <img src="${esc(artSrc('ft_'+it.id) || artSrc(f.art))}" alt="" style="width:${w0*cs*0.94}px;height:${h0*cs*0.94}px;transform:translate(-50%,-50%) rotate(${(it.r||0)*90}deg)"></div>`;
    });
    h += `</div>`;
  } else {
    const W = S0, wallH = Math.round(W*0.36), depth = Math.round(W*0.42), cw = W / ROOM.cols;
    box.style.width = W+'px'; box.style.height = (wallH+depth+8)+'px';
    h += `<div class="sWall" style="background:${Wl.css};height:${wallH}px"><i class="sWin" style="left:18%"></i><i class="sWin" style="right:18%"></i><i class="sBase"></i></div>
      <div class="sFloor" style="top:${wallH}px;height:${depth+8}px;background:${Fl.css}"></div><div id="room" class="sLayer">`;
    const items = H.items.map((it,i) => ({it,i})).sort((a,b) => (a.it.y+fpOf(a.it.id,a.it.r)[1]) - (b.it.y+fpOf(b.it.id,b.it.r)[1]));
    items.forEach(({it,i}) => {
      const f = FUR(it.id); if(!f) return; const [w,hh] = fpOf(it.id, it.r);
      const t = (it.y+hh)/ROOM.rows, s = 0.62 + 0.38*t, base = wallH + depth*t, cx = (it.x + w/2)*cw;
      const width = (SIDE_W[it.id]||1)*cw*s;
      h += `<img class="sItem ${f.floor?'flr':''} ${it.r===3?'flip':''}" data-idx="${i}" src="${esc(artSrc('fs_'+it.id) || artSrc(f.art))}" alt=""
        style="left:${cx}px;top:${f.floor ? base - depth*0.06 : base}px;width:${width}px;z-index:${f.floor ? 1 : Math.round(t*100)+5}">`;
    });
    h += `</div>`;
  }
  box.innerHTML = h;
  $('#btnHomeEdit').textContent = homeEdit ? '✔ もようがえ おわり' : '🛠 もようがえ';
  $('#btnHomeEdit').classList.toggle('pink', homeEdit);
  renderHomeTray();
  if(!homeEdit) placeVisitor(true);
}
$('#viewSeg').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if(!b) return; homeView = b.dataset.v; renderMyHome(); });
function renderHomeTray(){
  const tr = $('#homeTray'); tr.classList.toggle('hidden', !homeEdit);
  if(!homeEdit) return;
  const H = ensureHome();
  $$('#homeTabs button').forEach(b => b.classList.toggle('on', b.dataset.v===homeTab));
  let h = '';
  if(homeTab==='fur'){
    const ids = Object.keys(H.inv).filter(k => H.inv[k] > 0 && FUR(k));
    h = ids.length ? ids.map(id => `<button class="trayIt ${homeHand && homeHand.from==='inv' && homeHand.id===id ? 'on':''}" data-id="${id}"><img src="${esc(artSrc('ft_'+id) || artSrc(FUR(id).art))}" alt=""><span>${esc(FUR(id).name)}</span><b>×${H.inv[id]}</b></button>`).join('')
      : `<div class="note" style="padding:10px">もちものの 家具は ないよ。「家具を かう」で そろえよう！</div>`;
  } else {
    const list = homeTab==='wall' ? WALLS : FLOORS, owned = homeTab==='wall' ? H.walls : H.floors, curId = homeTab==='wall' ? H.wall : H.floor;
    h = list.map(w => `<button class="trayIt sw ${w.id===curId?'on':''}" data-sw="${w.id}"><span class="swatch" style="background:${w.css}"></span><span>${esc(w.name)}</span>${owned.includes(w.id) ? '' : `<b class="pr">${w.price}pt</b>`}</button>`).join('');
  }
  $('#homeTrayItems').innerHTML = h;
  const sel = H.items[homeSel], img = (id, r) => `<img class="handImg" src="${esc(artSrc('ft_'+id))}" alt="" style="transform:rotate(${(r||0)*90}deg)">`;
  let msg;
  if(homeTab!=='fur') msg = homeTab==='wall' ? 'かべがみを えらんでね' : 'ゆかを えらんでね';
  else if(homeHand) msg = `${img(homeHand.id, homeHand.r)} ${esc(FUR(homeHand.id).name)}を もっているよ。おきたい マスを タッチ！
      <span class="selBtns"><button class="btn small orange" data-act="rotHand">🔄 まわす</button></span>`;
  else if(sel) msg = `${img(sel.id, sel.r)} ${esc(FUR(sel.id).name)}を えらんだよ。あいている マスを タッチで いどう
      <span class="selBtns"><button class="btn small orange" data-act="rot">🔄 まわす</button><button class="btn small white" data-act="store">🗃 しまう</button><button class="btn small white" data-act="unsel">✕</button></span>`;
  else msg = 'おく 家具を えらぶか、へやの 家具を タッチしてね（もう一度 タッチで まわるよ）';
  $('#homeHand').innerHTML = msg;
  $('#btnHomeStore').disabled = !homeHand && !sel;
}
function rotateSel(){
  const H = ensureHome(), it = H.items[homeSel]; if(!it) return;
  for(let k=1;k<=3;k++){ const r = ((it.r||0)+k)%4, p = fitXY(it.id, it.x, it.y, r, homeSel); if(p){ it.r = r; it.x = p[0]; it.y = p[1]; sound('tap'); persist(); renderMyHome(); return; } }
  toast('ここでは まわせないよ。ひろい ところに うごかしてね');
}
$('#homeHand').addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if(!b) return; e.stopImmediatePropagation();
  const H = ensureHome(), a = b.dataset.act, sel = H.items[homeSel];
  if(a==='rotHand' && homeHand){ homeHand.r = ((homeHand.r||0)+1)%4; renderHomeTray(); return; }
  if(a==='rot') rotateSel();
  if(a==='store' && sel){ H.items.splice(homeSel,1); H.inv[sel.id] = (H.inv[sel.id]||0)+1; homeSel = -1; persist(); renderMyHome(); }
  if(a==='unsel'){ homeSel = -1; renderMyHome(); }
}, true);
$('#roomBox').addEventListener('click', e => {
  const v = e.target.closest('.visitor');
  if(v && !homeEdit){ talkVisitor(); return; }
  const H = ensureHome();
  const itEl = e.target.closest('[data-idx]');
  if(!homeEdit){
    if(itEl){ const f = FUR(H.items[+itEl.dataset.idx]?.id); if(f) toast(`${f.name}（すてき度 +${f.sty}）`); }
    else toast('「もようがえ」で 家具を おけるよ');
    return;
  }
  const fl = $('#room').getBoundingClientRect(), cs = fl.width / ROOM.cols;
  const x = Math.floor((e.clientX - fl.left)/cs), y = Math.floor((e.clientY - fl.top)/cs);
  if(x<0 || y<0 || x>=ROOM.cols || y>=ROOM.rows) return;
  if(homeHand){
    const r = homeHand.r||0, p = fitXY(homeHand.id, x, y, r);
    if(!p){ toast('ここには おけないよ（ほかの 家具と かさなる）'); return; }
    H.items.push({id:homeHand.id, x:p[0], y:p[1], r}); sound('tap');
    if(homeHand.from==='inv'){ H.inv[homeHand.id]--; if(H.inv[homeHand.id] <= 0){ delete H.inv[homeHand.id]; homeHand = null; } } else homeHand = null;
    persist(); renderMyHome(); return;
  }
  if(itEl){ const idx = +itEl.dataset.idx; if(idx===homeSel) rotateSel(); else { homeSel = idx; renderMyHome(); } return; }
  const sel = H.items[homeSel];
  if(sel){ const p = fitXY(sel.id, x, y, sel.r, homeSel); if(!p){ toast('ここには うごかせないよ'); return; } sel.x = p[0]; sel.y = p[1]; sound('tap'); persist(); renderMyHome(); }
});
function endHomeEdit(silent){ homeSel = -1; homeHand = null; homeEdit = false; persist(); if(!silent) renderMyHome(); }
/* ---------- おきゃくさん ---------- */
function freeCell(x, y){ const g = occGrid(); return x>=0 && y>=0 && x<ROOM.cols && y<ROOM.rows && g[`N${x},${y}`]==null; }
function placeVisitor(){
  stopVisitor();
  const H = ensureHome(), room = $('#room'); if(!room) return;
  room.querySelectorAll('.visitor').forEach(e => e.remove());
  const v = H.visit; if(!v) return;
  const r = save.town.res.find(x => x.id===v.id); if(!r){ H.visit = null; return; }
  if(!freeCell(v.x, v.y)){ outer: for(let y=ROOM.rows-1;y>=0;y--) for(let x=0;x<ROOM.cols;x++) if(freeCell(x,y)){ v.x = x; v.y = y; break outer; } }
  const el = document.createElement('button'); el.className = 'visitor';
  el.innerHTML = `${resPic(r,'wimg')}<span class="wname">${esc(r.name)}</span><span class="vb">${v.gift ? '🎁' : '💬'}</span>`;
  room.appendChild(el); VS.el = el; VS.x = v.x; VS.y = v.y; moveVisitor(true);
  VS.timer = setInterval(() => {
    if(curScreen!=='myhome' || homeEdit || $('#dlg').classList.contains('show')) return;
    if(Math.random() < 0.35) return;
    for(const [dx,dy] of shuffle([[1,0],[-1,0],[0,1],[0,-1]])){ const nx = VS.x+dx, ny = VS.y+dy; if(freeCell(nx,ny)){ if(dx) VS.flip = dx<0; VS.x = nx; VS.y = ny; break; } }
    v.x = VS.x; v.y = VS.y; moveVisitor();
  }, 1400);
}
function moveVisitor(instant){
  const el = VS.el; if(!el) return;
  const S0 = roomSize();
  let W, left, top, z;
  if(homeView==='top'){ const cs = $('#room').clientWidth / ROOM.cols; W = cs*1.0; left = VS.x*cs + (cs-W)/2; top = (VS.y+1)*cs - W*1.15; z = (VS.y+1)*10 + 6; }
  else { const wallH = Math.round(S0*0.36), depth = Math.round(S0*0.42), cw = S0/ROOM.cols, t = (VS.y+1)/ROOM.rows, s = 0.62+0.38*t;
    W = cw*1.1*s; left = (VS.x+.5)*cw - W/2; top = wallH + depth*t - W*1.15; z = Math.round(t*100)+6; }
  if(instant) el.style.transition = 'none';
  el.style.width = W+'px'; el.style.left = left+'px'; el.style.top = top+'px'; el.style.zIndex = z;
  el.querySelector('.wimg')?.classList.toggle('flip', !!VS.flip);
  if(instant){ void el.offsetWidth; el.style.transition = ''; }
}


/* =====================================================================
   v1.0：きょうの ミッション・住民の おねがい・筆算メモ・漢字の はんてい なおし・みち
   ===================================================================== */

/* ---------- みち：となりの たてものの きわまで のばす ---------- */
const _roadHTML = roadHTML;
roadHTML = function(x, y){
  const c = save.town.cells, isB = (a,b) => { const id = c[`${a},${b}`]; return !!id && !isRoadId(id); };
  let h = _roadHTML(x, y);
  const ext = [['n',0,-1],['s',0,1],['w',-1,0],['e',1,0]].filter(([d,dx,dy]) => isB(x+dx,y+dy)).map(([d]) => `<i class="x x-${d}"></i>`).join('');
  return h.replace(/<\/div>$/, ext + '</div>');
};
stubHTML = function(){ return ''; };

/* =====================================================================
   きょうの ミッション
   ===================================================================== */
const MISSIONS = {
  kanji5:  {ev:'kanji',  n:5,  i:'✏️', t:'漢字を 5問 とこう'},
  kanji10: {ev:'kanji',  n:10, i:'✏️', t:'漢字を 10問 とこう'},
  math5:   {ev:'math',   n:5,  i:'🔢', t:'さんすうを 5問 とこう'},
  math10:  {ev:'math',   n:10, i:'🔢', t:'さんすうを 10問 とこう'},
  correct: {ev:'correct',n:15, i:'⭕', t:'15問 せいかい しよう'},
  perfect: {ev:'perfect',n:1,  i:'💮', t:'パーフェクトを とろう'},
  talk:    {ev:'talk',   n:3,  i:'💬', t:'じゅうみんと 3回 はなそう'},
  quiz:    {ev:'quiz',   n:1,  i:'🎲', t:'じゅうみんの クイズに ちょうせん'},
  harvest: {ev:'harvest',n:1,  i:'🎁', t:'お店の うりあげを うけとろう'},
  visit:   {ev:'visit',  n:1,  i:'🚪', t:'友だちの 家に おじゃましよう'},
  req:     {ev:'req',    n:1,  i:'📮', t:'じゅうみんの おねがいを かなえよう'}
};
const MIS_PT = 30, STAMP_GOAL = 7;
function misData(){
  const m = save.mis || (save.mis = {day:'', list:[], stamps:0, total:0, done:''});
  if(m.day !== dayKey()){
    const t = save.town, c = t ? townCalc() : {income:0};
    const study = shuffle(['kanji5','kanji10','math5','math10','correct','soc5','sci5','ek5','prog1']);
    const a = study[0], b = study.find(k => MISSIONS[k].ev !== MISSIONS[a].ev) || study[1];
    const play = ['talk','quiz','perfect'].concat(c.income ? ['harvest'] : []).concat(t && t.res.some(r => r.home) ? ['visit'] : []).concat((save.reqs?.list||[]).length ? ['req'] : []);
    m.day = dayKey(); m.list = [a, b, choice(play)].map(id => ({id, p:0, got:false})); m.done = '';
    persist();
  }
  return m;
}
function misEv(ev, k=1){
  const m = misData(); let hit = false;
  m.list.forEach(x => { const d = MISSIONS[x.id]; if(d && d.ev===ev && x.p < d.n){ x.p = Math.min(d.n, x.p + k); if(x.p >= d.n){ hit = true; setTimeout(() => toast(`🎯 ミッション たっせい！「${d.t}」 ホームで うけとってね`), 1200); } } });
  if(hit || k) persist();
  if(curScreen==='home') renderMissions();
}
function renderMissions(){
  const box = $('#missionCard'); if(!box) return;
  const m = misData(), allGot = m.list.every(x => x.got);
  const stamps = Array.from({length:STAMP_GOAL}, (_,i) => `<span class="stamp ${i < m.stamps ? 'on' : ''}">${i < m.stamps ? `<img src="${esc(artSrc('bird_thumb'))}" alt="">` : i+1}</span>`).join('');
  box.innerHTML = `<div class="misHead"><b>🎯 きょうの ミッション</b><small>${allGot ? 'ぜんぶ クリア！ また あした！' : 'ぜんぶ クリアで スタンプ 1こ'}</small></div>
    ${m.list.map((x,i) => { const d = MISSIONS[x.id], ok = x.p >= d.n;
      return `<div class="misRow ${x.got?'got':ok?'ok':''}"><span class="misI">${d.i}</span><div class="misT"><b>${d.t}</b>
        <div class="misBar"><i style="width:${Math.min(100, x.p/d.n*100)}%"></i></div><small>${x.p} / ${d.n}</small></div>
        ${x.got ? '<span class="misDone">✔</span>' : ok ? `<button class="btn small gold" data-mis="${i}">+${MIS_PT}pt</button>` : `<span class="misPt">+${MIS_PT}pt</span>`}</div>`; }).join('')}
    <div class="stampRow"><span>スタンプ</span>${stamps}<small>7こで 🎁 きらきらレター</small></div>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-mis]'); if(!b) return;
  const m = misData(), x = m.list[+b.dataset.mis]; if(!x || x.got || x.p < MISSIONS[x.id].n) return;
  x.got = true; givePts(MIS_PT, `ミッション：${MISSIONS[x.id].t}`); sound('ok');
  if(m.list.every(y => y.got) && m.done !== m.day){
    m.done = m.day; m.stamps++; m.total++; persist(); confetti(1800);
    if(m.stamps >= STAMP_GOAL){
      m.stamps = 0; const t = save.town; t.bag.goldletter = (t.bag.goldletter||0) + 1; persist(); sound('fan');
      await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('itm_goldletter'))}" alt=""></div><h2 class="dlgT">スタンプ 7こ コンプリート！</h2>
        <p class="dlgP">ごほうびに <b>きらきらレター</b>を もらったよ！<br>ちょっとレア いじょうの じゅうみんが 来てくれるよ</p>`, [{label:'やったー！', cls:'gold', v:1}], 'gold');
    } else {
      await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('bird_jump'))}" alt=""></div><h2 class="dlgT">きょうの ミッション ぜんぶ クリア！</h2>
        <p class="dlgP">スタンプを 1こ ゲット！（${m.stamps} / ${STAMP_GOAL}）<br>また あしたも がんばろう！</p>`, [{label:'うん！', cls:'pink', v:1}]);
    }
  }
  persist(); renderMissions(); checkBadges();
});

/* =====================================================================
   住民の おねがい
   ===================================================================== */
const REQ_GAP = 2*60*60*1000;   // あたらしい おねがいが 出る まで（2時間）
function reqData(){ return save.reqs || (save.reqs = {list:[], last:0, done:0}); }
const reqFor = rid => reqData().list.find(q => q.rid===rid);
function reqProg(q){
  const t = save.town;
  if(q.kind==='has') return [Math.min(placedCount(q.id), q.target), q.target];
  if(q.kind==='road') return [Math.min(townCalc().roads, q.target), q.target];
  if(q.kind==='veh') return [t.veh.includes(q.id) ? 1 : 0, 1];
  return [0,1];
}
const reqDone = q => { const [a,b] = reqProg(q); return a >= b; };
function reqText(q){
  const it = ITEM(q.id), [a,b] = reqProg(q);
  if(q.kind==='has') return q.base > 0 ? `${it.name}を あと ${Math.max(0,b-a)}つ おいてほしいな` : `まちに ${it.name}が ほしいな〜`;
  if(q.kind==='road') return `みちを あと ${Math.max(0,b-a)}マス ふやしてほしいな`;
  if(q.kind==='veh') return `${it.name}が はしってるのを 見てみたいな！`;
  return '';
}
function makeReq(r){
  const t = save.town, lv = t.lv + 1, c = townCalc(), opts = [];
  ['flower','tree','bench','lamp','well','pond','fountain'].forEach(id => { const it = ITEM(id); if(it && (it.lv||1) <= lv) opts.push({w:3, f:() => { const base = placedCount(id), n = ri(1,3); return {kind:'has', id, base, target:base+n, pt:60+n*it.price/4}; }}); });
  TOWN_ITEMS.filter(it => it.type==='bld' && (it.cat==='bld' || it.cat==='rail') && !it.req && (it.lv||1) <= lv && !placedCount(it.id) && it.price <= Math.max(800, save.points.earned/8))
    .forEach(it => opts.push({w:2, f:() => ({kind:'has', id:it.id, base:0, target:1, pt:Math.round(80 + it.price*0.25)})}));
  opts.push({w:1, f:() => ({kind:'road', id:'road', base:c.roads, target:c.roads + 5, pt:90})});
  TOWN_ITEMS.filter(it => it.type==='veh' && !it.req && (it.lv||1) <= lv && !t.veh.includes(it.id)).slice(0, 8)
    .forEach(it => opts.push({w:1, f:() => ({kind:'veh', id:it.id, base:0, target:1, pt:Math.round(70 + it.price*0.2)})}));
  const busy = new Set(reqData().list.map(q => q.kind+q.id));
  const pool = opts.map(o => ({o, q:o.f()})).filter(x => !busy.has(x.q.kind+x.q.id));
  if(!pool.length) return null;
  let s = Math.random() * pool.reduce((a,x) => a + x.o.w, 0);
  for(const x of pool){ s -= x.o.w; if(s <= 0) return Object.assign(x.q, {rid:r.id, at:Date.now(), pt:Math.min(400, Math.round(x.q.pt/10)*10)}); }
  return Object.assign(pool[0].q, {rid:r.id, at:Date.now()});
}
function reqTick(){
  const t = save.town, D = reqData(); if(!t || !t.res.length) return;
  D.list = D.list.filter(q => t.res.some(r => r.id===q.rid));
  const max = Math.min(3, t.res.length), now = Date.now();
  const want = D.last===0 ? Math.min(2, max) : (now - D.last > REQ_GAP ? Math.min(max, D.list.length + 1) : D.list.length);
  let guard = 0;
  while(D.list.length < want && guard++ < 4){
    const free = t.res.filter(r => !reqFor(r.id) && r.id !== ghosted()); if(!free.length) break;
    const q = makeReq(choice(free)); if(!q) break;
    D.list.push(q);
  }
  if(D.list.length && (D.last===0 || now - D.last > REQ_GAP)) D.last = now;
  persist();
}
function renderReqPanel(){
  const box = $('#reqPanel'); if(!box) return;
  const D = reqData(), t = save.town;
  if(!D.list.length){ box.innerHTML = `<div class="reqEmpty">📮 いまは おねがいは ないよ。しばらく すると 住民が たのみに くるかも？</div>`; return; }
  box.innerHTML = `<div class="reqTitle">📮 じゅうみんの おねがい <small>かなえると ごほうびが もらえるよ</small></div>` +
    D.list.map(q => { const r = t.res.find(x => x.id===q.rid); if(!r) return ''; const [a,b] = reqProg(q), done = a >= b, it = ITEM(q.id);
      return `<div class="reqRow ${done?'done':''}"><span class="reqWho">${resPic(r)}</span>
        <div class="reqT"><b>${esc(r.name)}</b>「${esc(reqText(q))}」<div class="misBar"><i style="width:${a/b*100}%"></i></div><small>${a} / ${b}　ごほうび +${q.pt}pt</small></div>
        ${done ? `<button class="btn small gold" data-reqdone="${q.rid}">🎁 ほうこく</button>` : `<span class="reqIt">${q.kind==='road' ? '<span class="roadIcon"></span>' : picHTML(it)}</span>`}</div>`; }).join('');
}
$('#reqPanel') && $('#reqPanel').addEventListener('click', e => { const b = e.target.closest('[data-reqdone]'); if(b) completeReq(reqFor(b.dataset.reqdone)); });
function markRequests(){
  reqData().list.forEach(q => { const s = WK.st.get(q.rid); if(!s || !s.el) return;
    s.el.querySelector('.reqMark')?.remove();
    s.el.insertAdjacentHTML('beforeend', `<span class="reqMark ${reqDone(q)?'done':''}">${reqDone(q) ? '★' : '！'}</span>`); });
}
async function completeReq(q){
  if(!q || !reqDone(q)) return;
  const t = save.town, r = t.res.find(x => x.id===q.rid); if(!r) return;
  const D = reqData(); D.list = D.list.filter(x => x !== q); D.done++;
  const gb = typeof giftBoost==='function' ? giftBoost() : 1, got = [];
  got.push(`🪙 +${givePts(Math.round(q.pt*gb), `${r.name}の おねがいを かなえた`)}pt`);
  r.fr = (r.fr||0) + 2; got.push('💗 なかよし 大アップ');
  if(Math.random() < 0.2*gb){ const f = rewardFurniture(800); got.push(`<img src="${esc(artSrc(f.art))}" alt=""> ${esc(f.name)}`); }
  persist(); sound('fan'); confetti(2200); misEv('req');
  await dialog(`<div class="talkWrap"><div class="talkPic happy">${resPic(r)}<span class="spark s1">✨</span><span class="spark s2">💕</span><span class="spark s3">✨</span></div>
    <div class="talkBubble"><b>${esc(r.name)}</b>${pick(['ありがとう！ ずっと ほしかったんだ！','わあ！ ほんとうに かなえてくれたんだね！','きみって さいこう！ これ、お礼だよ！'])}</div></div>${rewardHTML(got)}`,
    [{label:'どういたしまして！', cls:'gold', v:1}], 'wide talk');
  checkBadges(); renderCurrent();
}

/* ---------- 既存の 関数に ミッション・おねがいを つなぐ ---------- */
const _talkTo = talkTo;
talkTo = async function(id, ctx){
  const q = reqFor(id);
  if(q && ctx!=='visit'){
    if(reqDone(q)){ await completeReq(q); misEv('talk'); return; }
    const r = save.town.res.find(x => x.id===id), it = ITEM(q.id), R = RARITY[SP(r.sp).rar||1];
    const v = await dialog(`<div class="talkWrap rk${R.k}" style="--rb:${R.bg}"><div class="talkPic happy">${resPic(r)}<span class="spark s1">📮</span></div>
      <div class="talkBubble"><b>${esc(r.name)}の おねがい</b>${esc(reqText(q))}<br><small>かなえてくれたら +${q.pt}pt と おれいを あげるね！</small></div></div>
      <div class="reqBig">${q.kind==='road' ? '<span class="roadIcon"></span>' : picHTML(it)}</div>`,
      [{label:'🛒 ショップへ', cls:'orange', v:'shop'}, {label:'💬 ふつうに はなす', cls:'white', v:'talk'}, {label:'まかせて！', cls:'pink', v:null}], 'wide talk');
    if(v==='shop'){ shopTab = q.kind==='veh' ? 'veh' : q.kind==='road' ? 'road' : (ITEM(q.id)?.cat || 'bld'); show('shop'); return; }
    if(v!=='talk') return;
  }
  misEv('talk');
  return _talkTo(id, ctx);
};
const _rq = residentQuiz; residentQuiz = async function(r, h){ misEv('quiz'); return _rq(r, h); };
const _vh = visitHouse; visitHouse = async function(key, hostId){ if(!hostId) misEv('visit'); return _vh(key, hostId); };
const _ap = addPoints;
addPoints = function(pt, reason, silent){
  if(reason==='パーフェクト！' || reason==='さんすう パーフェクト！') setTimeout(() => misEv('perfect'), 0);
  if(reason==='お店の うりあげ') setTimeout(() => misEv('harvest'), 0);
  return _ap(pt, reason, silent);
};
const _rh10 = renderHome; renderHome = function(){ _rh10(); renderMissions(); };
const _rt10 = renderTown; renderTown = function(){ reqTick(); _rt10(); renderReqPanel(); markRequests(); };
const _rm10 = renderMap; renderMap = function(){ _rm10(); markRequests(); };

/* =====================================================================
   漢字：はんてい なおし（あっていたのに × に なった とき）
   ===================================================================== */
const _fin = finalize;
finalize = function(correct, opt={}){
  const was = !cur || cur.done;
  const out = _fin(correct, opt);
  if(!was){
    misEv('kanji'); if(correct) misEv('correct');
    if(!correct && S && S.mode==='practice' && S.kind==='write' && !opt.skipped){
      $('#qFeedback').insertAdjacentHTML('beforeend', `<div class="fixRow"><button class="btn small green" data-fixok="1">✅ あってたよ！（せいかいに する）</button></div>`);
      if(Pad.isOpen) Pad.renderFoot();
    }
  }
  return out;
};
const _rf = Pad.renderFoot;
Pad.renderFoot = function(){
  _rf.call(this);
  const r = S && (S.inBonus ? S.bonus[S.bonus.length-1] : S.results[S.results.length-1]);
  if(cur && cur.padState==='done' && r && !r.correct && !r.skipped && S.mode==='practice' && S.kind==='write' && !r.bonus)
    $('#padFoot').insertAdjacentHTML('afterbegin', `<div class="fixRow"><button class="btn small green" data-fixok="1">✅ あってたよ！（せいかいに する）</button></div>`);
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-fixok]'); if(!b || !S) return;
  const r = S.results[S.results.length-1]; if(!r || r.correct) return;
  addStat(r.q, r.kind, false, -1); r.correct = true; r.flag = false; r.fixed = true; addStat(r.q, r.kind, true, 1);
  const d = dayRec(); d.c++;
  const p = givePts(POINT_RULES.correct, 'はんてい なおし（せいかい）'); r.pt = (r.pt||0) + p;
  S.combo++; misEv('correct'); persist(); sound('ok');
  $('#qSentence').innerHTML = sentenceHTML(r.q, r.kind, true, true);
  $('#qFeedback').innerHTML = `<span class="okTxt">⭕ せいかいに なおしたよ！</span> <span class="ptFloat">+${p}pt</span><span class="noteTxt">はんていが まちがっていて ごめんね</span>`;
  if(Pad.isOpen){ Pad.renderFoot(); }
});

/* =====================================================================
   さんすう：筆算メモ（問題の 上に 手書き）
   ===================================================================== */
const SCR = {on:true, strokes:[], cur:null, ctx:null};
function scrSize(){
  const w = $('#mWork'), cv = $('#mScratch'); if(!w || !cv) return;
  const r = w.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  cv.width = Math.round(r.width*dpr); cv.height = Math.round(r.height*dpr);
  cv.style.width = r.width+'px'; cv.style.height = r.height+'px';
  SCR.ctx = cv.getContext('2d'); SCR.ctx.setTransform(dpr,0,0,dpr,0,0); scrDraw();
}
function scrDraw(){
  const c = SCR.ctx; if(!c) return; const cv = $('#mScratch');
  c.clearRect(0,0,cv.width,cv.height);
  c.strokeStyle = '#E8414B'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
  SCR.strokes.forEach(s => { if(!s.length) return; c.beginPath(); c.moveTo(s[0][0], s[0][1]); s.forEach(p => c.lineTo(p[0], p[1])); if(s.length===1) c.lineTo(s[0][0]+.1, s[0][1]); c.stroke(); });
}
function scrPt(e){ const r = $('#mScratch').getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
(function(){
  const cv = $('#mScratch'); if(!cv) return;
  cv.addEventListener('pointerdown', e => { if(!SCR.on) return; e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){} SCR.cur = [scrPt(e)]; SCR.strokes.push(SCR.cur); scrDraw(); });
  cv.addEventListener('pointermove', e => { if(!SCR.cur) return; e.preventDefault(); const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; evs.forEach(ev => SCR.cur.push(scrPt(ev))); scrDraw(); });
  const up = () => { SCR.cur = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('touchstart', e => { if(SCR.on) e.preventDefault(); }, {passive:false});
})();
function scrSync(){ $('#scrPen').classList.toggle('on', SCR.on); $('#mScratch').classList.toggle('off', !SCR.on); }
$('#scrPen').onclick = () => { SCR.on = !SCR.on; scrSync(); };
$('#scrUndo').onclick = () => { SCR.strokes.pop(); scrDraw(); };
$('#scrClr').onclick = () => { SCR.strokes = []; scrDraw(); };
const _mr = mRender;
mRender = function(){ _mr(); SCR.strokes = []; scrSync(); requestAnimationFrame(scrSize); };
window.addEventListener('resize', () => { if(curScreen==='mathplay') setTimeout(scrSize, 150); });
const _mj = mJudge;
mJudge = function(v){ const was = MQ && MQ.done; const out = _mj(v); if(!was){ misEv(window.MQREV ? 'home' : window.MQBUN ? 'bun' : window.MQEK ? 'ekid' : window.MQSCI ? 'sci' : window.MQSOC ? 'soc' : 'math'); if(MQ.res[MQ.res.length-1]?.ok) misEv('correct'); } return out; };

/* ---------- バッジ ---------- */
BADGES.push(
  {id:'mis1',  i:'🎯', n:'はじめての ミッション', f:()=>(save.mis?.total||0)>=1},
  {id:'mis7',  i:'🏅', n:'スタンプ コンプリート', f:()=>(save.mis?.total||0)>=7},
  {id:'req1',  i:'📮', n:'おねがい かなえた',     f:()=>(save.reqs?.done||0)>=1},
  {id:'req10', i:'💌', n:'おねがい 10こ',         f:()=>(save.reqs?.done||0)>=10}
);


/* =====================================================================
   v1.1：住民150しゅるい・女の子・個性・いろちがい・レア演出・おうちに いる住民・
         なめらか アニメ・おねがい見直し・まなびの力／グレードアップ・しゃかい・ナビ など
   ===================================================================== */
const hashN = s => { let h = 7; for(const c of String(s)) h = (h*31 + c.charCodeAt(0)) >>> 0; return h; };

/* ---------- 住民 150しゅるい ---------- */
const NEW_SP = [{"id": "mouse", "name": "ネズミ", "art": "res_mouse", "emoji": "🐾", "rar": 1, "w": 12, "bias": "know", "home": "house"}, {"id": "cow", "name": "ウシ", "art": "res_cow", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "log"}, {"id": "horse", "name": "ウマ", "art": "res_horse", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "log"}, {"id": "goat", "name": "ヤギ", "art": "res_goat", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "log"}, {"id": "hen", "name": "ニワトリ", "art": "res_hen", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "bird"}, {"id": "duck", "name": "アヒル", "art": "res_duck", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "water"}, {"id": "donkey", "name": "ロバ", "art": "res_donkey", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "log"}, {"id": "guinea", "name": "モルモット", "art": "res_guinea", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "house"}, {"id": "ferret", "name": "フェレット", "art": "res_ferret", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "house"}, {"id": "parrot", "name": "インコ", "art": "res_parrot", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "bird"}, {"id": "budgie", "name": "セキセイインコ", "art": "res_budgie", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "bird"}, {"id": "turtle", "name": "カメ", "art": "res_turtle", "emoji": "🐾", "rar": 1, "w": 12, "bias": "know", "home": "water"}, {"id": "gecko", "name": "ヤモリ", "art": "res_gecko", "emoji": "🐾", "rar": 1, "w": 12, "bias": "know", "home": "house"}, {"id": "chipmunk", "name": "シマリス", "art": "res_chipmunk", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "tree"}, {"id": "mole", "name": "モグラ", "art": "res_mole", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "log"}, {"id": "bat", "name": "コウモリ", "art": "res_bat", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "tree"}, {"id": "raccoon", "name": "アライグマ", "art": "res_raccoon", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "log"}, {"id": "skunk", "name": "スカンク", "art": "res_skunk", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "log"}, {"id": "beaver", "name": "ビーバー", "art": "res_beaver", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "water"}, {"id": "porcupine", "name": "ヤマアラシ", "art": "res_porcupine", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "log"}, {"id": "deer", "name": "シカ", "art": "res_deer", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "log"}, {"id": "boar", "name": "イノシシ", "art": "res_boar", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "log"}, {"id": "wolf", "name": "オオカミ", "art": "res_wolf", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "log"}, {"id": "lynx", "name": "オオヤマネコ", "art": "res_lynx", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "tree"}, {"id": "badger", "name": "アナグマ", "art": "res_badger", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "log"}, {"id": "macaque", "name": "ニホンザル", "art": "res_macaque", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "tree"}, {"id": "gorilla", "name": "ゴリラ", "art": "res_gorilla", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "tree"}, {"id": "orangutan", "name": "オランウータン", "art": "res_orangutan", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "tree"}, {"id": "lemur", "name": "ワオキツネザル", "art": "res_lemur", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "tree"}, {"id": "sloth", "name": "ナマケモノ", "art": "res_sloth", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "tree"}, {"id": "armadillo", "name": "アルマジロ", "art": "res_armadillo", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "log"}, {"id": "opossum", "name": "オポッサム", "art": "res_opossum", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "tree"}, {"id": "moose", "name": "ヘラジカ", "art": "res_moose", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "log"}, {"id": "bison", "name": "バイソン", "art": "res_bison", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "log"}, {"id": "reindeer", "name": "トナカイ", "art": "res_reindeer", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "log"}, {"id": "polarbear", "name": "シロクマ", "art": "res_polarbear", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "water"}, {"id": "fennec", "name": "フェネック", "art": "res_fennec", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "house"}, {"id": "arcticfox", "name": "ホッキョクギツネ", "art": "res_arcticfox", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "log"}, {"id": "mongoose", "name": "マングース", "art": "res_mongoose", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "log"}, {"id": "sunbear", "name": "マレーグマ", "art": "res_sunbear", "emoji": "🐾", "rar": 2, "w": 6, "bias": "biz", "home": "tree"}, {"id": "lion", "name": "ライオン", "art": "res_lion", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "house"}, {"id": "tiger", "name": "トラ", "art": "res_tiger", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "house"}, {"id": "cheetah", "name": "チーター", "art": "res_cheetah", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "house"}, {"id": "leopard", "name": "ヒョウ", "art": "res_leopard", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "tree"}, {"id": "giraffe", "name": "キリン", "art": "res_giraffe", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "house"}, {"id": "elephant", "name": "ゾウ", "art": "res_elephant", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "house"}, {"id": "zebra", "name": "シマウマ", "art": "res_zebra", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "house"}, {"id": "hippo", "name": "カバ", "art": "res_hippo", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "water"}, {"id": "rhino", "name": "サイ", "art": "res_rhino", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "house"}, {"id": "camel", "name": "ラクダ", "art": "res_camel", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "house"}, {"id": "kangaroo", "name": "カンガルー", "art": "res_kangaroo", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "house"}, {"id": "wallaby", "name": "ワラビー", "art": "res_wallaby", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "house"}, {"id": "meerkat", "name": "ミーアキャット", "art": "res_meerkat", "emoji": "🐾", "rar": 1, "w": 12, "bias": "know", "home": "log"}, {"id": "hyena", "name": "ハイエナ", "art": "res_hyena", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "log"}, {"id": "warthog", "name": "イボイノシシ", "art": "res_warthog", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "log"}, {"id": "ostrich", "name": "ダチョウ", "art": "res_ostrich", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "bird"}, {"id": "flamingo", "name": "フラミンゴ", "art": "res_flamingo", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "water"}, {"id": "toucan", "name": "オオハシ", "art": "res_toucan", "emoji": "🐾", "rar": 2, "w": 6, "bias": "biz", "home": "bird"}, {"id": "peacock", "name": "クジャク", "art": "res_peacock", "emoji": "🐾", "rar": 3, "w": 2, "bias": "pop", "home": "bird"}, {"id": "gazelle", "name": "ガゼル", "art": "res_gazelle", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "house"}, {"id": "dolphin", "name": "イルカ", "art": "res_dolphin", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "water"}, {"id": "whale", "name": "クジラ", "art": "res_whale", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "water"}, {"id": "shark", "name": "サメ", "art": "res_shark", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "water"}, {"id": "octopus", "name": "タコ", "art": "res_octopus", "emoji": "🐾", "rar": 1, "w": 12, "bias": "know", "home": "water"}, {"id": "squid", "name": "イカ", "art": "res_squid", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "water"}, {"id": "crab", "name": "カニ", "art": "res_crab", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "water"}, {"id": "lobster", "name": "エビ", "art": "res_lobster", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "water"}, {"id": "jelly", "name": "クラゲ", "art": "res_jelly", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "water"}, {"id": "starfish", "name": "ヒトデ", "art": "res_starfish", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "water"}, {"id": "seaturtle", "name": "ウミガメ", "art": "res_seaturtle", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "water"}, {"id": "clownfish", "name": "クマノミ", "art": "res_clownfish", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "water"}, {"id": "puffer", "name": "フグ", "art": "res_puffer", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "water"}, {"id": "seahorse", "name": "タツノオトシゴ", "art": "res_seahorse", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "water"}, {"id": "walrus", "name": "セイウチ", "art": "res_walrus", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "water"}, {"id": "sealion", "name": "アシカ", "art": "res_sealion", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "water"}, {"id": "manatee", "name": "マナティー", "art": "res_manatee", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "water"}, {"id": "axolotl", "name": "ウーパールーパー", "art": "res_axolotl", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "water"}, {"id": "hermit", "name": "ヤドカリ", "art": "res_hermit", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "water"}, {"id": "narwhal", "name": "イッカク", "art": "res_narwhal", "emoji": "🐾", "rar": 3, "w": 2, "bias": "know", "home": "water"}, {"id": "beluga", "name": "シロイルカ", "art": "res_beluga", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "water"}, {"id": "eagle", "name": "ワシ", "art": "res_eagle", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "bird"}, {"id": "hawk", "name": "タカ", "art": "res_hawk", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "bird"}, {"id": "crow", "name": "カラス", "art": "res_crow", "emoji": "🐾", "rar": 1, "w": 12, "bias": "know", "home": "bird"}, {"id": "pigeon", "name": "ハト", "art": "res_pigeon", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "bird"}, {"id": "swallow", "name": "ツバメ", "art": "res_swallow", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "bird"}, {"id": "robin", "name": "コマドリ", "art": "res_robin", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "bird"}, {"id": "bluebird", "name": "ルリツグミ", "art": "res_bluebird", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "bird"}, {"id": "hummingbird", "name": "ハチドリ", "art": "res_hummingbird", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "bird"}, {"id": "woodpecker", "name": "キツツキ", "art": "res_woodpecker", "emoji": "🐾", "rar": 1, "w": 12, "bias": "work", "home": "bird"}, {"id": "kingfisher", "name": "カワセミ", "art": "res_kingfisher", "emoji": "🐾", "rar": 2, "w": 6, "bias": "biz", "home": "bird"}, {"id": "crane", "name": "タンチョウ", "art": "res_crane", "emoji": "🐾", "rar": 3, "w": 2, "bias": "know", "home": "water"}, {"id": "swan", "name": "ハクチョウ", "art": "res_swan", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "water"}, {"id": "stork", "name": "コウノトリ", "art": "res_stork", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "water"}, {"id": "cockatoo", "name": "オウム", "art": "res_cockatoo", "emoji": "🐾", "rar": 2, "w": 6, "bias": "biz", "home": "bird"}, {"id": "cardinal", "name": "ショウジョウコウカンチョウ", "art": "res_cardinal", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "bird"}, {"id": "mejiro", "name": "メジロ", "art": "res_mejiro", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "bird"}, {"id": "bunchou", "name": "ブンチョウ", "art": "res_bunchou", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "bird"}, {"id": "snowyowl", "name": "シロフクロウ", "art": "res_snowyowl", "emoji": "🐾", "rar": 3, "w": 2, "bias": "know", "home": "bird"}, {"id": "puffin", "name": "ニシツノメドリ", "art": "res_puffin", "emoji": "🐾", "rar": 2, "w": 6, "bias": "biz", "home": "water"}, {"id": "pelican", "name": "ペリカン", "art": "res_pelican", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "water"}, {"id": "capybara", "name": "カピバラ", "art": "res_capybara", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "water"}, {"id": "tapir", "name": "バク", "art": "res_tapir", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "log"}, {"id": "okapi", "name": "オカピ", "art": "res_okapi", "emoji": "🐾", "rar": 3, "w": 2, "bias": "know", "home": "tree"}, {"id": "pangolin", "name": "センザンコウ", "art": "res_pangolin", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "log"}, {"id": "quokka", "name": "クオッカ", "art": "res_quokka", "emoji": "🐾", "rar": 3, "w": 2, "bias": "pop", "home": "log"}, {"id": "wombat", "name": "ウォンバット", "art": "res_wombat", "emoji": "🐾", "rar": 2, "w": 6, "bias": "work", "home": "log"}, {"id": "platypus", "name": "カモノハシ", "art": "res_platypus", "emoji": "🐾", "rar": 3, "w": 2, "bias": "know", "home": "water"}, {"id": "kiwi", "name": "キーウィ", "art": "res_kiwi", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "bird"}, {"id": "sugarglider", "name": "フクロモモンガ", "art": "res_sugarglider", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "tree"}, {"id": "chinchilla", "name": "チンチラ", "art": "res_chinchilla", "emoji": "🐾", "rar": 2, "w": 6, "bias": "pop", "home": "house"}, {"id": "tasdevil", "name": "タスマニアデビル", "art": "res_tasdevil", "emoji": "🐾", "rar": 2, "w": 6, "bias": "drive", "home": "log"}, {"id": "binturong", "name": "ビントロング", "art": "res_binturong", "emoji": "🐾", "rar": 2, "w": 6, "bias": "biz", "home": "tree"}, {"id": "whitetiger", "name": "ホワイトタイガー", "art": "res_whitetiger", "emoji": "🐾", "rar": 4, "w": 0.6, "bias": "work", "home": "house"}, {"id": "snowleopard", "name": "ユキヒョウ", "art": "res_snowleopard", "emoji": "🐾", "rar": 3, "w": 2, "bias": "drive", "home": "log"}, {"id": "goldmonkey", "name": "キンシコウ", "art": "res_goldmonkey", "emoji": "🐾", "rar": 3, "w": 2, "bias": "pop", "home": "tree"}, {"id": "anteater", "name": "オオアリクイ", "art": "res_anteater", "emoji": "🐾", "rar": 2, "w": 6, "bias": "know", "home": "log"}, {"id": "corgi", "name": "コーギー", "art": "res_corgi", "emoji": "🐾", "rar": 1, "w": 12, "bias": "drive", "home": "house"}, {"id": "poodle", "name": "プードル", "art": "res_poodle", "emoji": "🐾", "rar": 1, "w": 12, "bias": "pop", "home": "house"}, {"id": "mike", "name": "ミケネコ", "art": "res_mike", "emoji": "🐾", "rar": 1, "w": 12, "bias": "biz", "home": "house"}, {"id": "kuroneko", "name": "クロネコ", "art": "res_kuroneko", "emoji": "🐾", "rar": 1, "w": 12, "bias": "know", "home": "house"}, {"id": "orca", "name": "シャチ", "art": "res_orca", "emoji": "🐋", "rar": 3, "w": 2, "bias": "drive", "home": "water"}, {"id": "namazu", "name": "ナマズ", "art": "res_namazu", "emoji": "🐟", "rar": 3, "w": 2, "bias": "know", "home": "water"}, {"id": "girl", "name": "おんなのこ", "art": "res_girl", "emoji": "👧", "rar": 5, "w": 0, "bias": "all", "home": "human", "human": 1}];
NEW_SP.forEach(s => { if(!SPECIES.some(x => x.id===s.id)) SPECIES.push(s); });
SPECIES.forEach(s => { if(s.id==='redpanda'){ s.rar = 4; s.w = 0.6; } });
HOME_TYPES.human = {n:'わたしの家（いっしょに くらす）', item:null};
Object.assign(RARITY, {
  1:{n:'ふつう', c:'#7A6A5A', bg:'#F3ECE1'}, 2:{n:'ちょっとレア', c:'#1C6AAE', bg:'#D9ECFB'},
  3:{n:'レア', c:'#C8901A', bg:'#FFE9A8'}, 4:{n:'ちょうレア', c:'#8E44D8', bg:'#F1E4FB'}, 5:{n:'とくべつ', c:'#E0577A', bg:'#FFE3EA'}
});
Object.keys(RARITY).forEach(k => RARITY[k].k = k);
SP_SKILL.whitetiger = ['mult']; SP_SKILL.orca = ['bonus']; SP_SKILL.namazu = ['hint']; SP_SKILL.narwhal = ['gift'];
SP_SKILL.snowyowl = ['hint']; SP_SKILL.crane = ['gift']; SP_SKILL.peacock = ['bonus']; SP_SKILL.platypus = ['guard'];
SP_SKILL.okapi = ['mult']; SP_SKILL.quokka = ['gift']; SP_SKILL.snowleopard = ['bonus']; SP_SKILL.goldmonkey = ['hint'];
const _rareRes = rareRes;
skillOwners = function(k){ return (save.town?.res||[]).filter(r => (SP(r.sp).rar||1) >= 3 && (SP_SKILL[r.sp]||[]).includes(k)); };

/* ---------- 個性（話し方・方言・ごび・しゅみ） ---------- */
const PERSONAS = [
  {id:'kansai', n:'関西弁', rep:[['だよ','やで'],['だね','やな'],['ありがとう','おおきに'],['すごく','めっちゃ'],['とても','めっちゃ'],['じゃない','やない'],['だから','やから'],['だ！','や！']]},
  {id:'hakata', n:'博多弁', rep:[['だよ','ったい'],['だね','やね'],['とても','ばり'],['すごく','ばり'],['だから','やけん']]},
  {id:'nagoya', n:'名古屋弁', rep:[['だよ','だがや'],['だね','だなも'],['とても','でら'],['すごく','でら'],['だから','だで']]},
  {id:'tohoku', n:'東北弁', rep:[['だよ','だべ'],['だね','だべな'],['とても','いっぺぇ'],['すごく','いっぺぇ'],['だから','だがら']]},
  {id:'okinawa', n:'沖縄ことば', rep:[['ありがとう','にふぇーでーびる'],['とても','でーじ'],['すごく','でーじ'],['だよ','さー']]},
  {id:'ojou', n:'おじょうさま', rep:[['だよ','ですわ'],['だね','ですわね'],['うれしい','うれしゅうございます'],['ありがとう','ありがとうございますわ'],['すごい','すばらしいですわ']]},
  {id:'bushi', n:'さむらい', rep:[['だよ','でござる'],['だね','でござるな'],['ありがとう','かたじけない'],['ぼく','せっしゃ'],['すごい','あっぱれ']]},
  {id:'teinei', n:'ていねい', rep:[['だよ','です'],['だね','ですね'],['ありがとう','ありがとうございます'],['しよう','しましょう']]},
  {id:'genki', n:'げんき いっぱい', rep:[['！','っ！！'],['だよ','だよっ']]},
  {id:'nonbiri', n:'のんびりや', rep:[['！','〜…'],['だよ','だよぉ〜'],['だね','だねぇ〜']]},
  {id:'cool', n:'クール', rep:[['だよ','だ'],['だね','だな'],['！','。'],['すごい','やるな']]}
];
const HOBBIES = ['つり','おりょうり','サッカー','ピアノ','おえかき','読書','むしとり','ダンス','ガーデニング','てつどう','星を 見ること','おかしづくり','しょうぎ','おさんぽ','カラオケ','キャンプ','パズル','おしゃれ','かいもの','ひるね','うんどう','こうさく','しゃしん','めいろ あそび'];
const KUCHI = {cat:'にゃ', kuroneko:'にゃ', mike:'にゃ', dog:'わん', corgi:'わん', poodle:'わん', sparrow:'ちゅん', hen:'こけっ', duck:'ガァ', frog:'ケロ', sheep:'メェ', goat:'メェ',
  cow:'モ〜', pig:'ブー', rabbit:'ぴょん', hamster:'ハム', mouse:'チュー', crow:'カァ', owl:'ホー', snowyowl:'ホー', fox:'コン', tanuki:'ポン', bear:'クマ', panda:'パン', penguin:'ペン', seal:'アザ', lion:'ガオ', tiger:'ガオ', elephant:'パオ', monkey:'ウキ', macaque:'ウキ', duck2:'ガァ'};
const KUCHI_POOL = ['ぽよ','もふ','なのだ','っす','でし','ぴ','ぞい','だっぴ','もきゅ','にょ'];
function persOf(r){
  if(!r.pers){ const h = hashN(r.id); r.pers = PERSONAS[h % PERSONAS.length].id; r.hobby = HOBBIES[(h>>>5) % HOBBIES.length]; r.kuchi = KUCHI[r.sp] || KUCHI_POOL[(h>>>9) % KUCHI_POOL.length]; }
  return PERSONAS.find(p => p.id===r.pers) || PERSONAS[0];
}
function speak(r, line){
  if(SP(r.sp).human) return line;
  const P = persOf(r); let s = line;
  P.rep.forEach(([a,b]) => { s = s.split(a).join(b); });
  if(r.kuchi && Math.random() < 0.6 && !s.includes(r.kuchi)) s = s.replace(/([！!。？?〜♪…]*)$/, m => `${r.kuchi}${m || '！'}`);
  return s;
}
function persHTML(r){ if(SP(r.sp).human) return ''; const P = persOf(r); return `<div class="persBox"><span>🗣 話し方：<b>${esc(P.n)}</b></span><span>🎨 しゅみ：<b>${esc(r.hobby)}</b></span><span>💬 口ぐせ：<b>〜${esc(r.kuchi)}</b></span></div>`; }
const _talkLine0 = talkLine;
talkLine = function(r, ctx){
  if(SP(r.sp).human) return girlLine(r);
  persOf(r);
  let line;
  if(ctx!=='visit' && Math.random() < 0.25) line = pick([`さいきん ${r.hobby}に はまってるんだ！`, `${r.hobby}って たのしいよね！ きみも すき？`, `こんど いっしょに ${r.hobby} しようよ！`, `${r.hobby}の 話なら 1日中 できるよ！`]);
  else line = _talkLine0(r, ctx);
  return speak(r, line);
};

/* ---------- 女の子（人間の 住民） ---------- */
const OUTFITS = [
  {art:'res_girl', n:'いつもの ふく', ok:() => true, cond:'さいしょから'},
  {art:'res_girl_pajama', n:'パジャマ', ok:() => save.daily.best >= 3, cond:'3日 れんぞく 勉強'},
  {art:'res_girl_explore', n:'たんけんたい', ok:() => totals().n >= 100, cond:'ぜんぶで 100問 とく'},
  {art:'res_girl_party', n:'パーティードレス', ok:() => totals().n >= 300 || (save.counters.perfect||0) >= 10, cond:'300問 とく か パーフェクト10回'}
];
function girl(){ return save.town?.res.find(r => SP(r.sp).human); }
function girlStar(){ const n = totals().n + Object.values(mSave().stats||{}).reduce((a,s)=>a+s.n,0); return Math.min(5, 1 + Math.floor(n/150)); }
function girlLine(r){
  const td = save.days[dayKey()] || {n:0};
  return pick([
    td.n ? `きょうは もう ${td.n}問も といたんだね！ すごいなあ` : 'きょうは なにを 勉強する？ いっしょに がんばろう！',
    'わたし、この まちが 大すき！ もっと すてきに しようね',
    'ねえねえ、つぎは どんな たてものを たてる？',
    'あたらしい ふく、にあうかな？ えへへ',
    'どうぶつの みんなと なかよく なれて うれしいな',
    'わたしは まちで ゆいいつの にんげんなんだよ。だから きみの きもち、よく わかるんだ',
    'まちがえても だいじょうぶ！ つぎは きっと できるよ',
    `${td.n >= 10 ? 'がんばった きみに' : 'きょうも'} おうえんの パワーを おくるね！`
  ]);
}
function ensureGirl(){
  const t = save.town; if(!t) return;
  if(!t.res.some(r => r.sp==='girl')){
    const r = newResident(SP('girl')); r.name = 'ハナ'; r.home = 'me'; r.star = 1; r.outfit = 'res_girl'; r.ab = {work:5, biz:5, know:6, pop:6, drive:4};
    t.res.unshift(r); persist();
  }
  const g = girl(); if(g){ g.home = 'me'; g.star = Math.max(g.star||1, girlStar()); }
}
const _ensureTown11 = ensureTown;
ensureTown = function(){ _ensureTown11(); ensureGirl(); };
rehouse = function(){
  let n = 0;
  save.town.res.forEach(r => { if(SP(r.sp).human){ r.home = 'me'; return; } if(!r.home || !save.town.cells[r.home]){ r.home = null; const h = findHome(SP(r.sp)); if(h){ r.home = h.key; n++; } } });
  return n;
};
const _homeLabel = homeLabel;
homeLabel = function(r){ if(SP(r.sp).human) return '<div class="rHome">🏡 わたしの家で いっしょに くらしている</div>'; return _homeLabel(r); };
const _skillMult = skillMult;
skillMult = function(){ return _skillMult() + (girl() ? 0.1 : 0); };

/* ---------- 住民の 絵（女の子の ふく・いろちがい） ---------- */
const _resPic = resPic;
resPic = function(r, cls=''){
  const s = SP(r.sp);
  if(s.human) return `<span class="rpic r1 human ${cls}"><img class="rb" src="${esc(artSrc(r.outfit || 'res_girl'))}" alt=""></span>`;
  let h = _resPic(r, cls);
  if(r.hue) h = h.replace('<img class="rb"', `<img class="rb" style="filter:hue-rotate(${r.hue}deg) saturate(1.15)"`).replace('class="rpic', 'class="rpic variant');
  return h;
};

/* ---------- 住民を まねく（かぶったら いろちがいの きょうだいに） ---------- */
const nonHuman = () => save.town.res.filter(r => !SP(r.sp).human);
inviteResident = async function(gold){
  const t = save.town, c = townCalc(), id = gold ? 'goldletter' : 'letter';
  if(!(t.bag[id] > 0)) return;
  if(nonHuman().length >= c.maxRes){
    await dialog(`<div class="dlgArt">${picHTML({art:'bird_think',emoji:'🏘️'})}</div><h2 class="dlgT">まちが いっぱい</h2><p class="dlgP">いまの まちには ${c.maxRes}人までしか すめないよ。<br>まちを レベルアップしよう！</p>`); return;
  }
  const o = gold ? {minRar:2, boost:3, needHome:true} : {needHome:true};
  let sp = pickSpecies(o);
  if(!sp){ await needHomeDialog(gold); return; }
  for(let i=0; i<2 && t.res.some(x => x.sp===sp.id); i++){ const s2 = pickSpecies(o); if(s2) sp = s2; }  // なるべく かぶらない
  t.bag[id]--;
  const dup = t.res.filter(x => x.sp===sp.id).length;
  const r = newResident(sp); r.home = findHome(sp).key;
  if(dup){ r.hue = [150, 210, 300, 60, 100, 260][(dup-1) % 6] + rint(-15,15); r.star = Math.min(TOWN_RULES.maxStar, (r.star||1) + 1); }
  persOf(r);
  t.res.push(r); persist(); discover(r.sp);
  await arrival(r, dup ? `${SP(r.sp).name}の きょうだい（いろちがい）が やってきた！` : undefined); checkBadges(); renderCurrent();
};
const _arrival = arrival;
arrival = async function(r, title){
  const s = SP(r.sp), k = s.rar||1;
  if(k >= 3){
    await dialog(`<div class="rareIntro rk${k}"><div class="rays"></div><img src="${esc(artSrc(k>=4 ? 'bird_gold' : 'itm_goldletter'))}" alt=""><b>${k>=4 ? '✨ ちょうレア ✨' : '★ レア ★'}</b></div>`, [{label:'あける！', cls:'gold', v:1}], 'rareCard rk'+k);
  }
  return _arrival(r, title || 'あたらしい じゅうみんが やってきた！');
};
const _openResident = openResident;
openResident = async function(id){
  const t = save.town, r = t.res.find(x => x.id===id); if(!r) return;
  if(!SP(r.sp).human) return _openResident(id);
  r.star = Math.max(r.star||1, girlStar());
  const v = await dialog(`<div class="arrBg rk5"><div class="dlgArt big">${resPic(r)}</div></div>
    <div class="rarTag rt5">とくべつ（にんげん）</div><h2 class="dlgT">${esc(r.name)}</h2>
    <div class="stars big">${stars(r.star)}</div><div class="rHome">🏡 わたしの家で いっしょに くらしている</div>
    <div class="skillBox"><b>✨ にんげんだけの ちから</b>
      <div>📣 <b>おうえん</b>：勉強の ポイントが いつも +10%</div>
      <div>👗 <b>きがえ</b>：勉強を がんばると あたらしい ふくが ふえる</div>
      <div>🌱 <b>いっしょに せいちょう</b>：きみが 問題を とくほど ★が ふえる（150問ごと）</div>
      <div>🎁 <b>まいにちの おうえん</b>：1日1回 はなすと ポイントを くれる</div></div>
    <div class="outfitRow">${OUTFITS.map(o => `<div class="ofIt ${o.ok()?'':'ofLock'} ${r.outfit===o.art?'on':''}"><img src="${esc(artSrc(o.art))}" alt=""><span>${esc(o.n)}</span>${o.ok()?'':`<small>🔒${esc(o.cond)}</small>`}</div>`).join('')}</div>`,
    [{label:'👗 きがえる', cls:'pink', v:'dress'}, {label:'✏️ なまえ', cls:'white', v:'name'}, {label:'とじる', cls:'', v:null}], 'wide');
  if(v==='dress'){
    const ok = OUTFITS.filter(o => o.ok()); const i = ok.findIndex(o => o.art===r.outfit);
    r.outfit = ok[(i+1) % ok.length].art; persist(); sound('fan'); toast(`👗 「${OUTFITS.find(o=>o.art===r.outfit).n}」に きがえたよ！`); renderCurrent(); openResident(id);
  } else if(v==='name'){
    const n = prompt('あたらしい なまえ（10文字まで）', r.name); if(n && n.trim()){ r.name = n.trim().slice(0,10); persist(); renderCurrent(); }
  }
};

/* =====================================================================
   なめらかな うごき（フラッシュアニメ風）＋ おうちに いる 住民
   ===================================================================== */
const MOV = {raf:0, last:0};
const outCap = () => clamp(Math.ceil(save.town.res.length*0.5), 3, 7);
function paintW(s){
  const el = s.el; if(!el) return; const W = WK.cs*0.62;
  el.style.transform = `translate3d(${s.px.toFixed(1)}px,${s.py.toFixed(1)}px,0)`;
  const feet = (s.py + W*1.12 + 2)/WK.cs - 1;
  el.style.zIndex = Math.max(0, Math.ceil(feet - 0.02))*10 + 5;
}
place = function(s, instant){
  const p = walkPos(s), el = s.el; if(!el) return;
  s.tx = p.left; s.ty = p.top;
  if(instant || s.px==null || s.elv !== el){ s.px = p.left; s.py = p.top; s.elv = el; }
  el.querySelector('.wimg')?.classList.toggle('flip', !!s.flip);
  el.classList.toggle('onroad', isRoadId(save.town.cells[`${s.x},${s.y}`]));
  paintW(s); startMov();
};
function startMov(){ if(!MOV.raf){ MOV.last = performance.now(); MOV.raf = requestAnimationFrame(movLoop); } }
function movLoop(t){
  const dt = Math.min(0.05, (t - MOV.last)/1000); MOV.last = t;
  const sp = WK.cs/0.66;
  WK.st.forEach(s => {
    if(!s.el || s.tx==null) return;
    const dx = s.tx - s.px, dy = s.ty - s.py, d = Math.hypot(dx, dy);
    if(d < 0.4){ if(s.mvg){ s.mvg = false; s.el.classList.remove('moving'); } s.px = s.tx; s.py = s.ty; }
    else { const st = Math.min(d, sp*dt); s.px += dx/d*st; s.py += dy/d*st; if(!s.mvg){ s.mvg = true; s.el.classList.add('moving'); } }
    paintW(s);
  });
  if(curScreen==='town') MOV.raf = requestAnimationFrame(movLoop); else MOV.raf = 0;
}
function doorOf(r){ if(!r.home || r.home==='me') return null; const [hx,hy] = r.home.split(',').map(Number); return [[hx,hy+1],[hx-1,hy],[hx+1,hy],[hx,hy-1]].find(([x,y]) => isWalk(x,y)) || null; }
function enterHome(s){ s.inside = rint(14, 40); s.path = []; s.pend = null; s.act = null; if(s.el){ s.el.classList.add('inside'); s.el.querySelector('.wact')?.classList.add('hidden'); } updateHomeBadges(); }
function exitHome(s, r){
  const d = doorOf(r); s.inside = 0; if(d){ s.x = d[0]; s.y = d[1]; }
  if(s.el){ s.el.classList.remove('inside'); place(s, true); } updateHomeBadges();
}
function updateHomeBadges(){
  $$('#townMap .inHome').forEach(e => e.remove());
  const cnt = {};
  save.town.res.forEach(r => { const s = WK.st.get(r.id); if(s && s.inside && r.home) cnt[r.home] = (cnt[r.home]||0) + 1; });
  Object.entries(cnt).forEach(([k,n]) => { const [x,y] = k.split(','); const c = $(`#townMap .cell[data-x="${x}"][data-y="${y}"]`); if(c) c.insertAdjacentHTML('beforeend', `<span class="inHome">💡${n}</span>`); });
}
const _buildWalkers = buildWalkers;
buildWalkers = function(cs, L){
  _buildWalkers(cs, L);
  const t = save.town, cap = outCap();
  let out = t.res.filter(r => { const s = WK.st.get(r.id); return s && !s.inside; }).length;
  shuffle(t.res.slice()).forEach(r => {
    const s = WK.st.get(r.id); if(!s) return;
    if(!s.init){ s.init = 1; if(out > cap && r.home && r.home!=='me' && r.id!==ghosted()){ s.inside = rint(5, 40); out--; } }
    if(s.inside && s.el) s.el.classList.add('inside');
  });
  updateHomeBadges();
};
walkTick = function(){
  if(curScreen!=='town' || document.hidden || townEdit || $('#dlg').classList.contains('show')) return;
  moveCars();
  const t = save.town, cap = outCap();
  const outside = t.res.filter(r => { const s = WK.st.get(r.id); return s && !s.inside; });
  if(outside.length > cap && Math.random() < 0.35){
    const c = outside.filter(r => r.home && r.home!=='me' && r.id!==ghosted() && !reqFor(r.id));
    const r = c.length ? choice(c) : null, s = r && WK.st.get(r.id);
    if(s && !s.act && !(s.pend && s.pend.a==='home')){
      const [bx,by] = r.home.split(',').map(Number), path = bfs(s.x, s.y, (x,y) => Math.abs(x-bx)+Math.abs(y-by)===1);
      if(path){ s.path = path; s.pend = {a:'home', fx:bx, enter:1}; s.wait = 0; }
    }
  }
  t.res.forEach(r => {
    const s = WK.st.get(r.id); if(!s || !s.el) return;
    if(r.id===ghosted()) return;
    if(s.inside){ if(--s.inside <= 0){ const nOut = t.res.filter(x => { const q = WK.st.get(x.id); return q && !q.inside; }).length; if(nOut < cap) exitHome(s, r); else s.inside = rint(6, 20); } return; }
    if(s.wait > 0){ s.wait--; return; }
    if(s.act){ if(--s.left <= 0){ clearAct(s); s.wait = rint(0,2); } return; }
    if(s.path.length){
      const [nx,ny] = s.path.shift();
      if(!isWalk(nx,ny)){ s.path = []; return; }
      const wasRoad = isRoadId(t.cells[`${s.x},${s.y}`]), toRoad = isRoadId(t.cells[`${nx},${ny}`]);
      if(nx !== s.x) s.flip = nx < s.x;
      s.x = nx; s.y = ny; place(s);
      const b = s.el.querySelector('.wact');
      if(toRoad && !wasRoad && Math.random()<0.6){ b.textContent = '🚸'; b.classList.remove('hidden'); b.classList.remove('pic'); }
      else if(!s.act) b.classList.add('hidden');
      if(!s.path.length){
        if(s.pend){
          if(s.pend.a==='home' && (s.pend.enter || Math.random() < 0.6) && r.home && r.home!=='me'){ s.pend = null; setTimeout(() => enterHome(s), 650); return; }
          if(s.pend.fx !== s.x) s.flip = s.pend.fx < s.x; place(s); s.act = s.pend.a; s.left = rint(4,7); setTimeout(() => s.act && showAct(s, s.act), 600); s.pend = null;
        } else s.wait = rint(1,3);
      }
      return;
    }
    chooseGoal(s, r);
  });
};

/* =====================================================================
   まなびの力・たてものの グレードアップ（ものを ふやさずに 発展）
   ===================================================================== */
let _lpCache = {k:'', v:0};
function learnCorrect(){
  const mc = Object.values(mSave().stats||{}).reduce((a,s)=>a+(s.c||0),0), eo = (typeof E!=='undefined' ? E.hist.length : 0);
  const key = `${Object.keys(save.stats).length}|${mc}|${eo}|${save.points.earned}`;
  if(_lpCache.k === key) return _lpCache.v;
  const ec = typeof E!=='undefined' ? E.hist.filter(h => h.res==='o').length : 0;
  _lpCache = {k:key, v: totals().c + mc + ec}; return _lpCache.v;
}
const learnDev = () => Math.floor(learnCorrect()/10);
const glvBonus = it => Math.max(2, Math.round((it.dev||0)*0.5));
const _townCalc11 = townCalc;
townCalc = function(){
  const c = _townCalc11(), t = save.town;
  let g = 0; Object.entries(t.glv||{}).forEach(([k,n]) => { const it = ITEM(t.cells[k]); if(it) g += glvBonus(it)*n; });
  c.gradeDev = g; c.learnDev = learnDev(); c.dev += g + c.learnDev;
  return c;
};
let openBuilding = async function(key){
  const t = save.town, it = ITEM(t.cells[key]); if(!it) return;
  t.glv = t.glv || {}; const lv = t.glv[key] || 0, max = 3;
  const cost = Math.max(50, Math.round((it.price||100)*(lv+1)*0.6/10)*10), add = glvBonus(it);
  const v = await dialog(`<div class="dlgArt">${picHTML(it)}</div><h2 class="dlgT">${esc(it.name)} <small class="glvT">${'★'.repeat(lv)}${'☆'.repeat(max-lv)}</small></h2>
    <p class="dlgP" style="font-size:14px">${esc(itemEffect(it))}</p>
    ${lv < max ? `<div class="skillBox"><b>⬆ グレードアップ</b><div>たてものを ふやさずに、まちの 発展度を <b>+${add}</b> できるよ（さいだい ★3）</div></div>` : '<div class="skillBox"><b>🌟 さいこうグレード！</b></div>'}`,
    (lv < max ? [{label:`⬆ グレードアップ<span class="nw">（${nf(cost)}pt）</span>`, cls: save.points.bal >= cost ? 'gold' : 'white', v:'up'}] : []).concat([{label:'とじる', cls:'white', v:null}]), 'wide');
  if(v==='up'){
    if(save.points.bal < cost){ toast('ポイントが たりないよ'); return; }
    givePts(-cost, `${it.name}を グレードアップ`); t.glv[key] = lv + 1; persist(); sound('fan'); confetti(1400);
    toast(`⬆ ${it.name}が ★${lv+1}に なった！ 発展度 +${add}`); renderTown();
  }
}

/* =====================================================================
   住民の おねがい（へんな おねがいを なくす）
   ===================================================================== */
const REQ_KINDS = ['fur','quiz','study','visit','has'];
makeReq = function(r){
  const t = save.town, lv = t.lv + 1, H = ensureHome(), opts = [];
  const furs = FURNITURE.filter(f => !f.special && f.price <= 700 && (f.lv||1) <= lv + 2);
  if(furs.length) opts.push({w:3, f:() => { const f = choice(furs); return {kind:'fur', id:f.id, pt:Math.round((60 + f.price*0.3)/10)*10}; }});
  opts.push({w:3, f:() => ({kind:'quiz', id:'quiz', pt:80})});
  opts.push({w:2, f:() => ({kind:'study', id:'study', day:dayKey(), base:(save.days[dayKey()]||{n:0}).n, pt:70})});
  if(r.home && r.home!=='me') opts.push({w:2, f:() => ({kind:'visit', id:'visit', pt:60})});
  const blds = TOWN_ITEMS.filter(it => it.type==='bld' && it.cat==='bld' && !it.req && (it.lv||1) <= lv && !placedCount(it.id) && it.price <= Math.max(600, save.points.earned/10));
  if(blds.length) opts.push({w:1, f:() => { const it = choice(blds); return {kind:'has', id:it.id, base:0, target:1, pt:Math.round((80 + it.price*0.2)/10)*10}; }});
  let s = Math.random() * opts.reduce((a,o) => a+o.w, 0);
  for(const o of opts){ s -= o.w; if(s <= 0) return Object.assign(o.f(), {rid:r.id, at:Date.now()}); }
  return Object.assign(opts[0].f(), {rid:r.id, at:Date.now()});
};
reqProg = function(q){
  const H = ensureHome();
  if(q.kind==='fur') return [((H.inv[q.id]||0) > 0 || H.items.some(i => i.id===q.id)) ? 1 : 0, 1];
  if(q.kind==='quiz') return [q.solved ? 1 : 0, 1];
  if(q.kind==='visit') return [q.visited ? 1 : 0, 1];
  if(q.kind==='study'){ const n = (save.days[dayKey()]||{n:0}).n - (q.day===dayKey() ? q.base : 0); return [clamp(n,0,5), 5]; }
  if(q.kind==='has') return [Math.min(placedCount(q.id), 1), 1];
  return [0,1];
};
reqText = function(q){
  if(q.kind==='fur') return `${FUR(q.id)?.name||'家具'}が ほしいなあ… もっていたら ゆずってくれる？`;
  if(q.kind==='quiz') return 'わからない 問題が あるの… いっしょに といてくれる？';
  if(q.kind==='visit') return 'うちに あそびに きてほしいな！ おいしい おかし あるよ';
  if(q.kind==='study'){ const [a,b] = reqProg(q); return `きみが 勉強してる ところ 見たいな！ あと ${Math.max(0,b-a)}問 といてみて`; }
  if(q.kind==='has') return `まちに ${ITEM(q.id)?.name||''}が あったら うれしいなあ`;
  return '';
};
const reqPic = q => q.kind==='fur' ? `<img src="${esc(artSrc(FUR(q.id)?.art))}" alt="">` : q.kind==='quiz' ? `<img src="${esc(artSrc('ui_bulb'))}" alt="">`
  : q.kind==='study' ? `<img src="${esc(artSrc('ui_study'))}" alt="">` : q.kind==='visit' ? `<img src="${esc(artSrc('ui_myhome'))}" alt="">` : picHTML(ITEM(q.id)||{emoji:'🏠'});
function reqClean(){ const D = reqData(); D.list = D.list.filter(q => REQ_KINDS.includes(q.kind) && !(q.kind==='has' && q.target > 1) && (q.kind!=='fur' || FUR(q.id))); }
renderReqPanel = function(){
  const box = $('#reqPanel'); if(!box) return; reqClean();
  const D = reqData(), t = save.town;
  if(!D.list.length){ box.innerHTML = `<div class="reqEmpty"><img class="uiIco" src="${esc(artSrc('ui_letter'))}" alt=""> いまは おねがいは ないよ。しばらく すると 住民が たのみに くるかも？</div>`; return; }
  box.innerHTML = `<div class="reqTitle"><img class="uiIco" src="${esc(artSrc('ui_letter'))}" alt=""> じゅうみんの おねがい <small>住民を タッチして かなえよう</small></div>` +
    D.list.map(q => { const r = t.res.find(x => x.id===q.rid); if(!r) return ''; const [a,b] = reqProg(q), done = a >= b;
      return `<div class="reqRow ${done?'done':''}" data-reqrow="${q.rid}"><span class="reqWho">${resPic(r)}</span>
        <div class="reqT"><b>${esc(r.name)}</b>「${esc(speak(r, reqText(q)))}」<div class="misBar"><i style="width:${a/b*100}%"></i></div><small>${a} / ${b}　ごほうび +${q.pt}pt</small></div>
        ${done ? `<button class="btn small gold" data-reqdone="${q.rid}">🎁 ほうこく</button>` : `<span class="reqIt">${reqPic(q)}</span>`}</div>`; }).join('');
};
document.addEventListener('click', e => { const row = e.target.closest('[data-reqrow]'); if(row && !e.target.closest('[data-reqdone],[data-reqtalk]')) talkTo(row.dataset.reqrow); }, true);
const _completeReq = completeReq;
completeReq = async function(q){
  if(!q || !reqDone(q)) return;
  if(q.kind==='fur'){ const H = ensureHome(); if((H.inv[q.id]||0) > 0){ H.inv[q.id]--; if(!H.inv[q.id]) delete H.inv[q.id]; } else { const i = H.items.findIndex(x => x.id===q.id); if(i>=0) H.items.splice(i,1); } persist(); }
  return _completeReq(q);
};
talkTo = async function(id, ctx){
  const t = save.town, r = t.res.find(x => x.id===id); if(!r) return;
  reqClean();
  const q = reqFor(id);
  if(SP(r.sp).human && !q){
    misEv('talk');
    const today = dayKey();
    if(r.cheer !== today){ r.cheer = today; persist(); const p = givePts(20, `${r.name}の おうえん`); toast(`📣 ${r.name}から おうえん +${p}pt`); }
    return _talkTo(id, ctx);
  }
  if(q && ctx!=='visit'){
    if(reqDone(q)){ await completeReq(q); misEv('talk'); return; }
    const R = RARITY[SP(r.sp).rar||1];
    const acts = {fur:[{label:'🛋 家具を かいに いく', cls:'orange', v:'shop'}], quiz:[{label:'✏️ いっしょに とく', cls:'orange', v:'quiz'}],
      visit:[{label:'🚪 あそびに いく', cls:'orange', v:'visit'}], study:[{label:'📚 勉強する', cls:'orange', v:'study'}], has:[{label:'🛒 ショップへ', cls:'orange', v:'shop'}]}[q.kind] || [];
    const v = await dialog(`<div class="talkWrap rk${R.k}" style="--rb:${R.bg}"><div class="talkPic happy">${resPic(r)}<span class="spark s1">📮</span></div>
      <div class="talkBubble"><b>${esc(r.name)}の おねがい</b>${esc(speak(r, reqText(q)))}<br><small>かなえてくれたら +${q.pt}pt と おれいを あげるね！</small></div></div>
      <div class="reqBig">${reqPic(q)}</div>`,
      acts.concat([{label:'💬 ふつうに はなす', cls:'white', v:'talk'}, {label:'またね', cls:'', v:null}]), 'wide talk');
    if(v==='shop'){ shopTab = q.kind==='fur' ? 'fur' : (ITEM(q.id)?.cat || 'bld'); show('shop'); return; }
    if(v==='study'){ show('subject'); return; }
    if(v==='visit'){ visitHouse(r.home); return; }
    if(v==='quiz'){
      const res = await miniQuiz(r, `${r.name}の わからない 問題`);
      if(res.ok){ q.solved = true; persist(); await completeReq(q); }
      else { toast(`ざんねん！ こたえは「${res.ans}」。また ちょうせんしてね`); }
      return;
    }
    if(v!=='talk') return;
  }
  misEv('talk');
  return _talkTo(id, ctx);
};
const _vh11 = visitHouse;
visitHouse = async function(key, hostId){
  (reqData().list||[]).forEach(q => { if(q.kind==='visit'){ const r = save.town.res.find(x => x.id===q.rid); if(r && r.home===key) q.visited = true; } });
  persist(); return _vh11(key, hostId);
};

/* =====================================================================
   しゃかい
   ===================================================================== */
const PREF = [
 ['北海道','札幌市','北海道',43.06,141.35,['じゃがいも','さっぽろ雪まつり']],['青森県','青森市','東北',40.82,140.74,['りんご','ねぶた祭']],
 ['岩手県','盛岡市','東北',39.70,141.15,['わんこそば','南部鉄器']],['宮城県','仙台市','東北',38.27,140.87,['牛たん','仙台七夕まつり']],
 ['秋田県','秋田市','東北',39.72,140.10,['きりたんぽ','なまはげ']],['山形県','山形市','東北',38.24,140.36,['さくらんぼ','将棋の こま']],
 ['福島県','福島市','東北',37.75,140.47,['赤べこ','会津の お城（鶴ヶ城）']],['茨城県','水戸市','関東',36.34,140.45,['なっとう','ほしいも']],
 ['栃木県','宇都宮市','関東',36.57,139.88,['ぎょうざ','日光東照宮']],['群馬県','前橋市','関東',36.39,139.06,['こんにゃく','草津温泉']],
 ['埼玉県','さいたま市','関東',35.86,139.65,['草加せんべい','川越の 町なみ']],['千葉県','千葉市','関東',35.61,140.12,['らっかせい','成田空港']],
 ['東京都','東京','関東',35.69,139.69,['東京スカイツリー','国会議事堂']],['神奈川県','横浜市','関東',35.45,139.64,['横浜中華街','鎌倉の 大仏']],
 ['新潟県','新潟市','中部',37.90,139.02,['コシヒカリ（お米）','ささだんご']],['富山県','富山市','中部',36.70,137.21,['ホタルイカ','黒部ダム']],
 ['石川県','金沢市','中部',36.59,136.63,['兼六園','輪島ぬり']],['福井県','福井市','中部',36.07,136.22,['めがねの フレーム','きょうりゅうの 化石']],
 ['山梨県','甲府市','中部',35.66,138.57,['ぶどう','ほうとう']],['長野県','長野市','中部',36.65,138.18,['レタス','信州そば']],
 ['岐阜県','岐阜市','中部',35.39,136.72,['白川郷の 合掌造り','長良川の 鵜飼い']],['静岡県','静岡市','中部',34.98,138.38,['お茶','うなぎ（浜名湖）']],
 ['愛知県','名古屋市','中部',35.18,136.91,['自動車づくり','名古屋城']],['三重県','津市','近畿',34.73,136.51,['伊勢神宮','真珠']],
 ['滋賀県','大津市','近畿',35.00,135.87,['琵琶湖','信楽焼の たぬき']],['京都府','京都市','近畿',35.02,135.76,['金閣寺','八つ橋']],
 ['大阪府','大阪市','近畿',34.69,135.52,['たこ焼き','通天閣']],['兵庫県','神戸市','近畿',34.69,135.18,['姫路城','甲子園球場']],
 ['奈良県','奈良市','近畿',34.69,135.83,['東大寺の 大仏','奈良公園の 鹿']],['和歌山県','和歌山市','近畿',34.23,135.17,['梅干し','熊野古道']],
 ['鳥取県','鳥取市','中国',35.50,134.24,['鳥取砂丘','二十世紀なし']],['島根県','松江市','中国',35.47,133.05,['出雲大社','しじみ']],
 ['岡山県','岡山市','中国',34.66,133.93,['きびだんご','マスカット']],['広島県','広島市','中国',34.40,132.46,['かき（貝）','宮島の 厳島神社']],
 ['山口県','山口市','中国',34.19,131.47,['ふぐ','錦帯橋']],['徳島県','徳島市','四国',34.07,134.56,['阿波おどり','すだち']],
 ['香川県','高松市','四国',34.34,134.04,['さぬきうどん','オリーブ']],['愛媛県','松山市','四国',33.84,132.77,['いよかん','道後温泉']],
 ['高知県','高知市','四国',33.56,133.53,['かつおの たたき','坂本龍馬']],['福岡県','福岡市','九州',33.61,130.42,['めんたいこ','博多ラーメン']],
 ['佐賀県','佐賀市','九州',33.25,130.30,['有田焼','のり']],['長崎県','長崎市','九州',32.74,129.87,['カステラ','出島']],
 ['熊本県','熊本市','九州',32.79,130.74,['熊本城','トマト']],['大分県','大分市','九州',33.24,131.61,['別府温泉','かぼす']],
 ['宮崎県','宮崎市','九州',31.91,131.42,['マンゴー','日向夏']],['鹿児島県','鹿児島市','九州',31.56,130.56,['桜島','さつまいも']],
 ['沖縄県','那覇市','九州',26.21,127.68,['シーサー','ゴーヤー']]
];
const REGIONS = ['北海道','東北','関東','中部','近畿','中国','四国','九州'];
const JP_PATH = 'M136.8 326.2 C140.0 328.8 141.3 331.4 139.7 335.8 C138.0 340.2 130.6 351.4 126.9 352.8 C123.3 354.1 121.1 344.2 117.6 343.8 C114.1 343.4 109.0 346.5 106.0 350.3 C103.1 354.1 103.5 365.3 100.0 366.7 C96.5 368.1 87.7 362.2 85.2 358.7 C82.8 355.2 83.3 350.4 85.4 345.4 C87.5 340.4 93.7 331.0 98.0 328.7 C102.2 326.5 107.1 333.4 110.8 332.0 C114.5 330.5 115.8 321.1 120.2 320.2 C124.5 319.2 133.5 323.6 136.8 326.2Z M280.4 242.4 C279.0 251.0 272.6 258.7 271.8 264.8 C271.1 270.8 277.1 273.2 275.8 278.8 C274.5 284.4 270.8 293.0 264.0 298.5 C257.2 304.0 246.5 309.2 235.0 311.7 C223.6 314.2 207.2 307.8 195.2 313.4 C183.2 319.0 170.9 341.9 162.9 345.4 C155.0 348.9 150.4 339.9 147.7 334.6 C145.0 329.3 153.5 316.2 146.8 313.7 C140.1 311.2 118.4 316.6 107.4 319.9 C96.3 323.1 89.5 330.8 80.6 333.1 C71.7 335.3 54.6 330.1 54.1 333.6 C53.5 337.1 75.7 342.8 77.0 354.2 C78.3 365.6 66.9 391.9 61.9 401.8 C56.9 411.7 51.5 413.4 47.3 413.6 C43.0 413.7 37.2 408.7 36.3 402.7 C35.4 396.7 43.3 383.0 41.9 377.5 C40.4 371.9 31.4 373.9 27.5 369.3 C23.6 364.8 16.3 354.7 18.3 350.1 C20.3 345.5 34.2 345.9 39.7 341.5 C45.3 337.1 45.8 329.2 51.6 323.9 C57.4 318.5 67.8 315.0 74.4 309.4 C81.0 303.8 80.7 294.8 91.0 290.3 C101.3 285.7 124.6 282.4 136.1 281.9 C147.7 281.5 152.3 295.0 160.3 287.6 C168.3 280.3 177.6 243.9 184.0 237.9 C190.5 231.8 191.1 253.7 199.1 251.2 C207.2 248.8 224.7 229.7 232.4 223.2 C240.0 216.8 240.7 219.9 245.2 212.4 C249.8 204.8 257.8 189.1 259.5 178.1 C261.2 167.2 254.6 154.8 255.6 146.6 C256.5 138.4 259.6 132.7 265.2 128.9 C270.8 125.1 283.2 118.2 289.2 123.8 C295.3 129.4 299.7 152.4 301.6 162.6 C303.5 172.9 304.5 176.9 300.9 185.3 C297.3 193.8 283.4 204.0 280.0 213.5 C276.5 223.0 281.7 233.9 280.4 242.4Z M346.8 45.5 C352.4 48.1 357.4 52.5 362.7 51.5 C368.1 50.5 375.3 36.4 378.8 39.6 C382.3 42.9 388.6 64.5 383.8 71.1 C379.0 77.6 359.1 72.8 350.2 78.7 C341.3 84.6 339.6 105.1 330.4 106.5 C321.1 108.0 302.7 85.5 294.7 87.4 C286.8 89.3 288.7 112.9 282.4 118.0 C276.2 123.2 261.9 123.0 257.2 118.5 C252.5 113.9 252.8 98.8 254.1 90.6 C255.5 82.4 259.4 72.9 265.3 69.1 C271.2 65.2 284.4 74.2 289.5 67.5 C294.6 60.8 293.9 38.9 296.1 28.8 C298.3 18.7 297.3 5.7 302.8 7.0 C308.4 8.2 322.1 29.7 329.4 36.1 C336.8 42.5 341.3 43.0 346.8 45.5Z';
function jpXY(lat, lng){ const k = Math.cos(36*Math.PI/180); return [(lng-128.6)*k*28, (45.8-lat)*28]; }
function jpMap(p){
  let x, y, inset = p[0]==='沖縄県';
  if(inset){ x = 40 + (p[4]-127)*40; y = 330 + (27.2-p[3])*40; } else [x, y] = jpXY(p[3], p[4]);
  return `<svg class="jpMap" viewBox="0 0 400 420"><rect width="400" height="420" rx="18" fill="#CFEBFF"/>
    <path d="${JP_PATH}" fill="#9BD58A" stroke="#4E9A47" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="10" y="300" width="110" height="100" rx="10" fill="none" stroke="#7FA9C9" stroke-dasharray="5 4"/><text x="16" y="318" font-size="12" fill="#4F7896">おきなわ</text>
    <circle cx="${40+(127.68-127)*40}" cy="${330+(27.2-26.21)*40}" r="7" fill="#9BD58A" stroke="#4E9A47" stroke-width="2"/>
    <circle cx="${x}" cy="${y}" r="13" fill="#E8414B" opacity=".25"><animate attributeName="r" values="10;18;10" dur="1.4s" repeatCount="indefinite"/></circle>
    <circle cx="${x}" cy="${y}" r="7" fill="#E8414B" stroke="#fff" stroke-width="2.5"/></svg>`;
}
const fourOpts = (ans, pool) => shuffle([ans, ...shuffle(pool.filter(x => x!==ans)).slice(0,3)]);
const prefPick = () => choice(PREF);
const MAPSYM = [
  ['文','小・中学校'],['<span class="ring">文</span>','高等学校'],['<span class="ring">〒</span>','ゆうびん局'],['卍','お寺'],
  ['<svg viewBox="0 0 40 40"><path d="M6 10 Q20 6 34 10 M9 16 H31 M13 10 V34 M27 10 V34" stroke="#222" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>','神社'],
  ['×','交番'],['<span class="ring">×</span>','警察署'],['◎','市役所'],['○','町や村の 役場'],['♨','温泉'],['⚙','工場'],
  ['<svg viewBox="0 0 40 40"><path d="M5 30 L20 25 L35 30 V12 L20 8 L5 12 Z M20 8 V25" stroke="#222" stroke-width="3" fill="none" stroke-linejoin="round"/></svg>','図書館'],
  ['<svg viewBox="0 0 40 40"><path d="M5 34 H35 M8 30 H32 M10 14 V30 M17 14 V30 M23 14 V30 M30 14 V30 M6 14 L20 5 L34 14 Z" stroke="#222" stroke-width="2.8" fill="none" stroke-linejoin="round"/></svg>','博物館']
];
const DIR8 = ['北','北東','東','南東','南','南西','西','北西'];
function compassSVG(i){ const a = i*45*Math.PI/180, x = 60 + Math.sin(a)*40, y = 60 - Math.cos(a)*40;
  return `<svg class="cmp" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="#FFF8E7" stroke="#C99A63" stroke-width="4"/>
    ${[0,1,2,3,4,5,6,7].map(k => { const b = k*45*Math.PI/180; return `<line x1="${60+Math.sin(b)*30}" y1="${60-Math.cos(b)*30}" x2="${60+Math.sin(b)*48}" y2="${60-Math.cos(b)*48}" stroke="#D8C3A0" stroke-width="2"/>`; }).join('')}
    <text x="60" y="19" text-anchor="middle" font-size="15" font-weight="900" fill="#C0392B">北</text>
    <line x1="60" y1="60" x2="${x}" y2="${y}" stroke="#1C6AAE" stroke-width="6" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="7" fill="#1C6AAE"/><circle cx="60" cy="60" r="5" fill="#333"/></svg>`; }
const SOC_QA = {
  life:[['火事や きゅうきゅうの ときに かける 電話番号は？','119',['110','119','117','177']],['じけんや じこの ときに かける 電話番号は？','110',['110','119','104','177']],
    ['火事の とき 火を けすために 出動する 車は？','しょうぼう車',['しょうぼう車','パトカー','ゴミ収集車','バス']],['まちの 交番で はたらく 人は？','けいさつかん',['けいさつかん','しょうぼうし','かんごし','うんてんし']],
    ['スーパーの 品物に ついている、ねだんが 書かれた ものは？','ねふだ',['ねふだ','ちらし','レシート','かんばん']],['品物が どこで とれたかを しめす ものは？','産地の ひょうじ',['産地の ひょうじ','ねだん','バーコード','わりびき']],
    ['安い 品物などを お客さんに 知らせる 紙は？','ちらし',['ちらし','レシート','ねふだ','ポスター']],['野さいや 米を そだてる 仕事を する 人は？','農家',['農家','漁師','大工','店員']],
    ['魚を とる 仕事を する 人は？','漁師',['漁師','農家','パン屋','けいさつかん']],['工場で 品物を つくることを 何という？','生産',['生産','しょうひ','ゆそう','はんばい']],
    ['火事を ふせぐために まちに ある、水を とりだす せつびは？','消火せん',['消火せん','信号','ガードレール','マンホール']],['けいさつしょと しょうぼうしょ、119番の 電話を うけるのは？','しょうぼう（通信指令センター）',['しょうぼう（通信指令センター）','けいさつしょ','市役所','学校']],
    ['お店で 買い物を するとき、ふくろを もっていくと へらせる ものは？','ごみ',['ごみ','お金','時間','品物']],['田や 畑が 多い ところは、まちの どこに 多い？','まわりの ほう（こうがい）',['まわりの ほう（こうがい）','駅の 前','デパートの 中','学校の 中']]],
  old:[['むかし せんたくに つかった、なみなみの いたの 道具は？','せんたくいた',['せんたくいた','まないた','すずりばこ','そろばん']],['せんたくいたの かわりに 今 つかっている ものは？','せんたくき',['せんたくき','れいぞうこ','そうじき','テレビ']],
    ['むかし ごはんを たいた ところは？','かまど',['かまど','いろり','ひばち','たんす']],['むかしの へやを あたためた、炭を 入れる 道具は？','ひばち',['ひばち','せんたくいた','うちわ','ちゃぶだい']],
    ['ひばちの かわりに 今 つかう ものは？','ストーブ・エアコン',['ストーブ・エアコン','せんぷうき','れいぞうこ','ドライヤー']],['むかしの 家族で かこんだ、ひくい 丸い つくえは？','ちゃぶだい',['ちゃぶだい','こたつ','ベッド','ソファ']],
    ['むかし 計算に つかった 道具は？','そろばん',['そろばん','ものさし','けんばんハーモニカ','コンパス']],['ダイヤルを まわして かけた むかしの 電話は？','黒電話',['黒電話','スマートフォン','ファックス','トランシーバー']],
    ['むかし ものを ひやすのに 氷を 入れて つかったのは？','氷の れいぞうこ',['氷の れいぞうこ','電子レンジ','オーブン','ポット']],['むかしの アイロンは 何を 入れて あたためた？','炭',['炭','電気','ガス','石油']]],
  japan:[['日本で いちばん 高い 山は？','富士山',['富士山','北岳','浅間山','阿蘇山']],['日本で いちばん 長い 川は？','信濃川',['信濃川','利根川','石狩川','木曽川']],
    ['日本で いちばん 大きな 湖は？','琵琶湖',['琵琶湖','霞ヶ浦','猪苗代湖','十和田湖']],['日本の 首都は？','東京',['東京','大阪','京都','名古屋']],
    ['日本の 東がわに 広がる 大きな 海は？','太平洋',['太平洋','日本海','東シナ海','オホーツク海']],['都道府県は ぜんぶで いくつ？','47',['47','43','50','45']],
    ['「都」が つくのは どこ？','東京都',['東京都','京都府','大阪府','北海道']],['「府」が つく 都道府県は 京都府と どこ？','大阪府',['大阪府','兵庫県','奈良県','東京都']],
    ['日本で いちばん 面積が 大きい 都道府県は？','北海道',['北海道','岩手県','長野県','新潟県']],['日本で いちばん 面積が 小さい 都道府県は？','香川県',['香川県','大阪府','東京都','沖縄県']],
    ['お米づくりが さかんで「米どころ」と よばれる 県は？','新潟県',['新潟県','東京都','沖縄県','香川県']],['日本の まわりの 海で、北海道の 北に ある 海は？','オホーツク海',['オホーツク海','日本海','太平洋','東シナ海']]]
};
Object.assign(MATH_UNITS, {
  s_loc:{n:'地図で 都道府県', g:'soc', art:'so_japan', gen(){ const p = prefPick(), same = PREF.filter(x => x[2]===p[2] && x!==p);
    const opts = shuffle([p[0], ...(same.length ? [choice(same)[0]] : []), ...shuffle(PREF.filter(x => x!==p && x[2]!==p[2])).slice(0,3).map(x=>x[0])].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4));
    return {type:'choice', q:'<b>赤い ●</b> の 都道府県は どこ？', disp:jpMap(p), ans:p[0], opts, hint:`${p[2]}地方に あるよ`}; }},
  s_cap:{n:'県庁所在地', g:'soc', art:'ui_building', gen(){ const p = prefPick(); return {type:'choice', q:`<b>${p[0]}</b> の 県庁所在地は？`, disp:jpMap(p), ans:p[1], opts:fourOpts(p[1], PREF.map(x=>x[1])), hint:`「${p[1][0]}」から はじまるよ`}; }},
  s_food:{n:'都道府県の 有名な もの', g:'soc', art:'so_food', gen(){ const p = prefPick(), it = choice(p[5]);
    return Math.random()<.6 ? {type:'choice', q:`<b>「${it}」</b> で 有名な 都道府県は？`, ans:p[0], opts:fourOpts(p[0], PREF.map(x=>x[0])), hint:`${p[2]}地方だよ`}
      : {type:'choice', q:`<b>${p[0]}</b> で 有名な ものは？`, disp:jpMap(p), ans:it, opts:fourOpts(it, PREF.filter(x=>x!==p).flatMap(x=>x[5])), hint:`${p[0]}の 地図を 思い出そう`}; }},
  s_region:{n:'地方の 区分', g:'soc', art:'so_map', gen(){ const p = prefPick(); return {type:'choice', q:`<b>${p[0]}</b> は 何地方？`, disp:jpMap(p), ans:p[2], opts:fourOpts(p[2], REGIONS), hint:'日本は 8つの 地方に 分けられるよ'}; }},
  s_sym:{n:'地図記号', g:'soc', art:'so_map', gen(){ const m = choice(MAPSYM); return {type:'choice', q:'この 地図記号は 何を あらわしている？', disp:`<div class="mapSym">${m[0]}</div>`, ans:m[1], opts:fourOpts(m[1], MAPSYM.map(x=>x[1])), hint:'形の もとに なった ものを 考えよう'}; }},
  s_dir:{n:'方位（八方位）', g:'soc', art:'so_compass', gen(){
    if(Math.random()<.7){ const i = ri(0,7); return {type:'choice', q:'青い やじるしの 方位は？', disp:compassSVG(i), ans:DIR8[i], opts:fourOpts(DIR8[i], DIR8), hint:'北と 東の あいだは「北東」'}; }
    const i = ri(0,7), j = (i+4)%8; return {type:'choice', q:`<b>${DIR8[i]}</b> の 反対の 方位は？`, ans:DIR8[j], opts:fourOpts(DIR8[j], DIR8), hint:'ま反対は 180度 回ったところ'}; }},
  s_life:{n:'くらしと 仕事', g:'soc', art:'so_firepol', gen(){ const q = choice(SOC_QA.life); return {type:'choice', q:q[0], ans:q[1], opts:shuffle(q[2].slice()), hint:''}; }},
  s_old:{n:'むかしの くらし', g:'soc', art:'so_oldtools', gen(){ const q = choice(SOC_QA.old); return {type:'choice', q:q[0], ans:q[1], opts:shuffle(q[2].slice()), hint:''}; }},
  s_jp:{n:'日本の 地理', g:'soc', art:'so_factory', gen(){ const q = choice(SOC_QA.japan); return {type:'choice', q:q[0], ans:q[1], opts:shuffle(q[2].slice()), hint:''}; }}
});
const SS = {units:['s_loc','s_food'], count:10};
const SOC_GROUPS = [['🗾 都道府県',['s_loc','s_cap','s_food','s_region']],['🧭 地図の 見方',['s_sym','s_dir']],['🏘 くらし・むかし',['s_life','s_old']],['🇯🇵 日本の 地理',['s_jp']]];
function renderSoc(){
  const M = mSave(); if(M.socSel && !SS.loaded){ SS.loaded = 1; SS.units = M.socSel.filter(k => MATH_UNITS[k]); } if(!SS.units.length) SS.units = ['s_loc'];
  $('#sUnits').innerHTML = SOC_GROUPS.map(([gn, ks]) => `<h4 class="sGrp">${gn}</h4><div class="sGrid">${ks.map(k => { const u = MATH_UNITS[k], s = M.stats[k] || {n:0, c:0}, rate = s.n ? Math.round(s.c/s.n*100) : null;
    return `<button class="mUnit soc ${SS.units.includes(k)?'on':''}" data-su="${k}"><img class="mIco" src="${esc(artSrc(u.art))}" alt=""><span class="mTxt"><b>${u.n}</b><small>${s.n ? `${s.c}/${s.n} せいかい` : 'まだ やってない'}</small>${rate!=null?`<i class="mBar"><i style="width:${rate}%"></i></i>`:''}</span>${SS.units.includes(k)?'<span class="mChk">✓</span>':''}</button>`; }).join('')}</div>`).join('');
  syncSeg('sCount', SS.count); M.socSel = SS.units.slice(); persist();
}
$('#sUnits').addEventListener('click', e => { const b = e.target.closest('[data-su]'); if(!b) return; const k = b.dataset.su; SS.units = SS.units.includes(k) ? SS.units.filter(x => x!==k) : [...SS.units, k]; if(!SS.units.length) SS.units = [k]; renderSoc(); });
$('#sCount').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; SS.count = +b.dataset.v; renderSoc(); });
function socStart(){
  const list = buildSet(SS.units, SS.count);
  window.MQSOC = true; $('#mPlayTag').textContent = 'しゃかい'; $('#mPlayTag').style.background = 'var(--orange)';
  MQ = {list, i:0, res:[], pts:0, t0:Date.now(), combo:0, soc:true}; show('mathplay'); mRender();
}
$('#sStart').onclick = socStart;
const _mStart = $('#mStart').onclick;
$('#mStart').onclick = () => { window.MQSOC = false; $('#mPlayTag').textContent = 'さんすう'; $('#mPlayTag').style.background = 'var(--blue)'; _mStart(); };
const _mr11 = mRender;
mRender = function(){ _mr11(); const pt = MQ.list[MQ.i].type; $('#mAns').classList.toggle('hidden', pt==='choice' || pt==='cmp'); const soc = !!window.MQSOC; $('.scrTools').classList.toggle('hidden', soc); if(soc){ SCR.on = false; scrSync(); } };
$('#subjSoc').onclick = () => show('soc');
MISSIONS.soc5 = {ev:'soc', n:5, i:'🗾', t:'しゃかいを 5問 とこう'};

/* =====================================================================
   ナビ・ホーム・せってい・まちの なまえ
   ===================================================================== */
$('#navStudy').onclick = () => show('subject');
$('#navTown').onclick = () => show('town');
$('#navShop').onclick = () => show('shop');
const _show11 = show;
show = function(name){
  _show11(name);
  $('#btnSettings').classList.toggle('hidden', name!=='home');
  const navMap = {subject:'navStudy', kmode:'navStudy', ksetup:'navStudy', tsel:'navStudy', math:'navStudy', soc:'navStudy', eng:'navStudy', town:'navTown', residents:'navTown', shop:'navShop', myhome:'goMyHome', record:'goRecord', zukan:'goZukan'};
  $$('#bnav button').forEach(b => b.classList.toggle('on', b.id===navMap[name]));
};
$('#btnBack').onclick = () => {
  if(curScreen==='engplay' && !engLeave()) return; if(!leaveQuizOk()) return;
  if(curScreen==='mathplay'){ if(!confirm('とちゅうで やめますか？（ここまでの ポイントは もらえます）')) return; show(window.MQREV ? 'home' : window.MQBUN ? 'bun' : window.MQEK ? 'ekid' : window.MQSCI ? 'sci' : window.MQSOC ? 'soc' : 'math'); return; }
  show(PARENT[curScreen] || 'home');
};
const townName = () => save.town?.name || 'まなびタウン';
async function renameTown(){
  const n = prompt('まちの なまえを きめてね（12文字まで）', townName());
  if(n && n.trim()){ save.town.name = n.trim().slice(0,12); persist(); toast(`🏷 まちの なまえを「${save.town.name}」に したよ！`); renderCurrent(); if(curScreen==='home') renderHome(); if(curScreen==='settings') renderSettings(); }
}
const BIRD_POSES = ['bird_wave','bird_jump','bird_thumb','bird_think','bird_cheer','bm_abacus','bm_ruler','bm_book','bm_phones'];
const BIRD_MSG = ['きょうも いっしょに がんばろう！','タッチ ありがとう！ くすぐったいよ〜','シマエナガは「雪の ようせい」って よばれてるんだよ','まちがえた 問題は、もう一度 とくと 力に なるよ！',
  '1日 10分でも 毎日 つづけるのが ひみつだよ','さんすうの 筆算は、メモを かくと まちがいが へるよ','しってる？ 日本には 47の 都道府県が あるんだ','住民の おねがいを かなえると いいこと あるかも♪',
  'ミッションを ぜんぶ クリアすると スタンプが もらえるよ','漢字は「とめ・はね・はらい」に 気を つけてね','がんばってる きみを いつも おうえんしてるよ！','ふわふわ〜 ぼくの 羽、さわってみる？'];
let birdI = 0;
$('#homeBird').addEventListener('click', () => {
  birdI = (birdI + 1 + ri(0,2)) % BIRD_POSES.length;
  const gold = Math.random() < 0.05, img = $('#homeBird img');
  img.dataset.art = gold ? 'bird_gold' : BIRD_POSES[birdI]; applyArt($('#homeBird'));
  $('#homeMsg').innerHTML = gold ? 'わあ！ きんいろの ぼくを 見つけたね！ きょうは いいこと あるかも ✨' : choice(BIRD_MSG);
  img.classList.remove('boing'); void img.offsetWidth; img.classList.add('boing'); sound('tap');
});
const _rh11 = renderHome;
renderHome = function(){ _rh11(); $('#homeTownLv').textContent = `${townName()}　Lv${save.town.lv+1} ${townCalc().L.name}`; };
/* せってい：パスワード */
parentGate = function(fn){
  gateFn = fn; $('#gateQ').textContent = '🔒 パスワード（6けた）'; $('#gateIn').value = ''; $('#gateIn').type = 'password'; $('#gateIn').setAttribute('inputmode','numeric'); $('#gateIn').maxLength = 12;
  $('#gate').classList.add('show'); setTimeout(() => $('#gateIn').focus(), 50);
};
$('#gateOk').onclick = () => { if($('#gateIn').value === (save.pw || '000000')){ $('#gate').classList.remove('show'); gateFn && gateFn(); } else toast('パスワードが ちがいます'); };
const _rs11 = renderSettings;
renderSettings = function(){ _rs11(); $('#setTownName').value = townName(); };
$('#btnSetTown').onclick = () => { const v = $('#setTownName').value.trim(); if(!v){ toast('なまえを 入れてください'); return; } save.town.name = v.slice(0,12); persist(); toast('まちの なまえを かえました'); };
$('#btnSetPw').onclick = () => {
  const a = $('#pw1').value, b = $('#pw2').value;
  if(!/^\d{4,12}$/.test(a)){ toast('4〜12けたの 数字に してください'); return; } if(a!==b){ toast('2つの パスワードが ちがいます'); return; }
  save.pw = a; persist(); $('#pw1').value = $('#pw2').value = ''; toast('パスワードを かえました');
};

/* ---------- まち：なまえ・まなびの力・アイコン ---------- */
const EMO_ICON = {'🐾':'ui_paw','🏗️':'ui_tools','🚗':'ui_car','🚙':'ui_car','📘':'ui_bulb','💰':'ui_coins','📚':'ui_study'};
function iconize(el){ if(!el) return; let h = el.innerHTML; Object.entries(EMO_ICON).forEach(([e,a]) => { h = h.split(e).join(`<img class="uiIco" src="${esc(artSrc(a))}" alt="">`); }); el.innerHTML = h; }
const _rt11 = renderTown;
renderTown = function(){
  reqClean(); _rt11();
  const c = townCalc();
  $('#townStats').insertAdjacentHTML('beforeend', `<div class="tstat learn"><span>📚 まなびの力</span><b>+${nf(c.learnDev)}</b></div>`);
  iconize($('#townStats')); iconize($('#townHead'));
  $('#townHead .tInfo')?.insertAdjacentHTML('afterbegin', `<div class="townName"><span>🏷 ${esc(townName())}</span><button class="iconMini" id="btnRename">✏️</button></div>`);
  const b = $('#btnRename'); if(b) b.onclick = renameTown;
};
const _rm11 = renderMap;
renderMap = function(){
  _rm11();
  const t = save.town;
  Object.entries(t.glv||{}).forEach(([k,n]) => { if(!n || !t.cells[k]) return; const [x,y] = k.split(','); const c = $(`#townMap .cell[data-x="${x}"][data-y="${y}"]`); if(c) c.insertAdjacentHTML('beforeend', `<span class="glvBadge">${'★'.repeat(n)}</span>`); });
  updateHomeBadges();
};
BADGES.push(
  {id:'res50sp', i:'🦁', n:'50しゅるいの なかま', f:()=>new Set((save.town?.res||[]).map(r=>r.sp)).size>=50},
  {id:'variant', i:'🎨', n:'いろちがいの きょうだい', f:()=>(save.town?.res||[]).some(r=>r.hue)},
  {id:'grade3',  i:'🌟', n:'たてもの ★3', f:()=>Object.values(save.town?.glv||{}).some(n=>n>=3)},
  {id:'soc50',   i:'🗾', n:'しゃかい 50問', f:()=>Object.entries(save.math?.stats||{}).filter(([k])=>k.startsWith('s_')).reduce((a,[,s])=>a+s.c,0)>=50}
);
PARENT.shop = 'home'; PARENT.soc = 'subject'; PARENT.residents = 'town';
const _show11b = show;
show = function(name){ _show11b(name); if(name==='soc') renderSoc(); };

function spNames(h){ const a = speciesFor(h).map(s=>s.name); return a.length > 8 ? a.slice(0,8).join('・') + ` ほか${a.length-8}しゅるい` : a.join('・'); }


/* =====================================================================
   v1.2：リアルな 日本地図・世界地図・国旗・問題の かぶり防止・
         にがて問題ほど ポイントアップ・家具／かざり 大ぞうりょう
   ===================================================================== */
const stripTags = s => String(s||'').replace(/<[^>]+>/g,'');

/* ---------- 問題の かぶり防止 ---------- */
function qKeyOf(p){ return p.u + ':' + stripTags(p.q) + '|' + p.ans + '|' + (p.dk||''); }
function buildSet(units, count){
  const list = [], seen = new Set();
  for(let i=0;i<count;i++){
    let p = null;
    for(let t=0;t<40;t++){ const k = choice(units), c = {u:k, ...MATH_UNITS[k].gen()}; if(!seen.has(qKeyOf(c))){ p = c; break; } }
    if(!p){ const k = choice(units); p = {u:k, ...MATH_UNITS[k].gen()}; }
    seen.add(qKeyOf(p)); list.push(p);
  }
  return list;
}
const _pickQ12 = pickQuestions;
pickQuestions = function(kind, count, order, grade){
  const out = _pickQ12(kind, Math.min(count*2, 999), order, grade), seen = new Set(), res = [];
  for(const q of out){ const k = q.word + '|' + q.reading; if(seen.has(k)) continue; seen.add(k); res.push(q); if(res.length >= count) break; }
  return res;
};

/* ---------- にがて問題ほど ポイントアップ ---------- */
function qh(){ return save.qh || (save.qh = {}); }
function qhRec(key, ok){
  const H = qh(), r = H[key] || (H[key] = {c:0, w:0, s:0});
  if(ok){ r.c++; r.s++; } else { r.w++; r.s = 0; }
  const ks = Object.keys(H); if(ks.length > 4000) ks.slice(0, 500).forEach(k => delete H[k]);
}
function diffMult(key, unit){
  const r = qh()[key];
  let m;
  if(!r || (r.c + r.w) === 0){
    m = 1.3;
    const st = unit && mSave().stats[unit];
    if(st && st.n >= 10){ const acc = st.c/st.n; m = acc >= 0.95 ? 0.8 : acc >= 0.85 ? 1.0 : acc < 0.6 ? 1.6 : 1.3; }
  } else if(r.w > 0 && r.s === 0) m = Math.min(2.0, 1.6 + 0.2*Math.min(r.w,2));
  else if(r.w > 0) m = Math.max(1.0, 1.6 - 0.25*r.s);
  else m = Math.max(0.5, 1.2 - 0.2*r.s);
  return Math.round(m*10)/10;
}
const diffTag = dm => dm > 1.05 ? `<span class="chal">🔥 チャレンジ ×${dm.toFixed(1)}</span>` : dm < 0.95 ? `<span class="easy">✓ なれた問題 ×${dm.toFixed(1)}</span>` : '';
function engDiff(qid){
  const hs = E.hist.filter(h => h.qid===qid).slice(0,-1);
  if(!hs.length) return 1.3;
  const last3 = hs.slice(-3), wrong = hs.filter(h => h.res!=='o').length;
  if(last3.length===3 && last3.every(h => h.res==='o')) return 0.5;
  if(hs[hs.length-1].res!=='o') return 1.8;
  return wrong ? 1.4 : 0.8;
}

/* =====================================================================
   リアルな 日本地図
   ===================================================================== */
const JP_REAL = {"jp": "M169.8 333.8 L167.3 340.2 L166.3 340.4 L166.6 341.0 L166.0 341.3 L166.7 342.1 L163.1 344.4 L163.0 345.9 L162.0 346.2 L162.3 344.9 L158.4 344.5 L155.1 343.0 L153.8 341.7 L153.9 340.4 L152.5 339.7 L154.0 338.2 L150.3 336.5 L148.2 333.6 L146.3 333.7 L146.9 332.9 L146.5 332.3 L147.6 331.6 L146.5 331.0 L148.9 329.5 L146.8 328.3 L148.3 327.3 L147.9 326.6 L148.8 326.7 L149.7 326.2 L149.2 326.3 L149.2 324.9 L148.1 325.1 L148.7 323.7 L147.9 324.1 L146.4 323.0 L146.6 322.0 L150.9 319.9 L154.6 315.6 L155.0 314.8 L154.2 314.4 L155.5 314.1 L154.3 312.5 L155.4 313.2 L155.4 312.0 L154.6 312.2 L155.3 311.5 L154.3 312.1 L155.0 311.0 L152.6 310.1 L149.3 311.2 L149.2 312.1 L145.9 312.8 L140.7 309.4 L140.4 309.8 L140.1 309.0 L139.5 309.4 L137.0 308.1 L133.1 309.3 L132.8 307.8 L132.9 309.0 L131.7 310.0 L130.4 309.3 L127.9 310.3 L126.5 309.6 L127.9 310.8 L125.6 312.5 L126.6 312.5 L126.2 313.2 L124.4 314.1 L123.6 314.0 L123.1 312.7 L123.1 313.4 L121.2 312.9 L121.6 313.7 L120.2 313.6 L120.6 314.2 L119.7 314.8 L120.7 314.3 L121.0 314.9 L121.8 313.7 L123.4 314.2 L122.4 315.2 L122.4 316.1 L121.4 315.8 L120.9 317.8 L118.6 317.1 L118.0 317.4 L118.3 318.4 L117.5 318.2 L117.1 316.1 L116.6 316.6 L116.4 315.7 L116.4 316.9 L115.7 316.6 L115.5 314.6 L115.3 316.0 L114.8 315.5 L112.7 317.4 L111.9 317.5 L110.7 316.0 L109.7 316.9 L109.8 317.9 L109.0 316.9 L109.0 318.2 L107.9 317.4 L108.9 318.3 L108.0 320.0 L105.2 319.5 L105.8 319.0 L105.2 318.0 L104.4 320.4 L103.5 319.5 L104.4 318.9 L101.6 319.3 L101.4 320.8 L97.8 321.1 L96.3 322.2 L95.1 321.7 L94.1 322.5 L94.3 323.6 L92.5 324.5 L90.5 323.9 L88.9 326.0 L89.7 326.1 L89.3 327.4 L90.0 326.8 L90.4 327.2 L89.6 328.5 L89.1 327.5 L87.1 327.7 L88.5 326.6 L88.3 325.4 L89.6 323.7 L88.8 323.6 L88.2 321.6 L88.9 320.1 L87.6 320.9 L87.2 319.7 L86.9 320.5 L86.9 319.7 L86.1 319.9 L82.1 323.5 L82.7 325.7 L81.6 327.1 L81.9 330.4 L81.3 331.5 L79.3 331.5 L80.6 334.4 L80.2 335.1 L79.7 333.8 L78.0 332.9 L78.6 332.2 L77.6 333.2 L76.3 332.7 L73.7 330.0 L72.4 330.8 L72.9 331.3 L71.9 331.0 L73.1 329.5 L71.3 328.4 L68.2 329.8 L67.7 329.0 L66.7 330.5 L65.9 330.2 L65.7 329.1 L64.4 330.8 L64.0 329.9 L63.4 330.8 L63.4 328.4 L62.5 331.3 L60.3 332.5 L59.3 331.3 L58.5 332.3 L58.3 330.5 L55.3 328.6 L52.2 332.8 L51.5 331.9 L52.3 331.7 L52.4 329.0 L51.2 327.2 L52.8 324.5 L51.3 322.2 L52.1 320.2 L52.7 320.8 L55.1 319.9 L54.7 319.0 L52.9 319.4 L53.7 318.0 L54.6 318.8 L57.3 318.6 L58.1 319.9 L63.7 318.4 L63.3 317.5 L64.8 316.8 L64.6 315.6 L66.4 314.6 L67.0 313.1 L68.0 312.9 L68.1 311.8 L69.0 312.4 L69.5 311.4 L73.6 310.5 L73.9 309.2 L75.8 308.2 L77.2 306.1 L78.3 305.9 L79.6 303.7 L84.0 300.8 L86.5 297.0 L91.3 294.3 L92.3 291.9 L91.3 290.2 L94.1 289.8 L93.5 289.2 L96.4 288.1 L99.0 287.9 L99.0 287.2 L100.3 287.3 L100.8 286.2 L101.9 286.1 L101.8 285.4 L102.9 286.7 L107.0 286.5 L105.3 287.0 L105.4 288.1 L108.7 289.7 L112.5 287.5 L117.6 288.3 L126.1 287.5 L134.5 283.6 L136.3 284.5 L139.7 283.5 L143.3 284.3 L146.9 281.6 L150.1 280.5 L151.6 282.1 L151.8 283.8 L151.0 283.7 L148.5 286.9 L149.6 287.3 L150.8 285.6 L151.2 286.7 L150.4 287.3 L152.5 287.9 L152.0 289.7 L152.9 288.6 L154.1 288.5 L152.8 288.2 L152.7 286.9 L155.4 285.4 L155.6 287.5 L156.8 287.0 L156.7 288.5 L158.0 288.6 L160.0 287.1 L159.2 288.7 L158.2 288.7 L161.2 288.8 L162.3 287.4 L161.2 287.8 L160.6 287.1 L161.2 286.4 L163.1 287.6 L163.9 287.3 L163.2 286.4 L164.0 286.6 L164.4 285.7 L163.5 284.4 L164.6 285.3 L167.1 284.8 L166.6 282.1 L168.0 281.0 L168.6 282.9 L168.2 283.3 L169.2 283.9 L169.9 280.6 L167.5 277.6 L166.7 274.7 L168.8 270.7 L170.7 268.3 L171.0 268.7 L170.4 267.3 L172.6 266.6 L177.0 262.7 L183.6 253.4 L184.9 249.7 L185.1 246.4 L184.0 244.8 L184.0 242.5 L182.8 242.2 L184.8 236.2 L187.3 235.0 L188.8 235.2 L196.2 231.5 L198.1 232.0 L198.4 233.8 L196.0 234.6 L195.7 235.8 L196.3 237.0 L195.8 237.8 L192.9 238.3 L190.5 241.3 L189.0 240.3 L189.4 239.8 L188.3 240.0 L188.6 240.8 L187.6 241.9 L188.0 242.7 L187.1 244.1 L188.8 243.9 L189.9 245.0 L191.6 243.4 L191.6 247.3 L190.0 249.9 L191.8 252.1 L191.5 252.6 L195.3 252.9 L195.3 253.8 L195.5 253.0 L197.8 253.0 L199.2 251.7 L200.1 248.3 L210.8 244.8 L215.1 241.6 L217.9 241.7 L225.2 236.1 L229.8 229.5 L232.1 223.4 L237.2 219.7 L238.6 219.8 L242.0 217.9 L245.2 214.2 L245.9 207.5 L247.8 202.7 L249.7 199.3 L252.6 196.6 L253.4 194.7 L254.0 194.8 L253.4 194.5 L253.9 192.5 L254.7 193.5 L254.0 192.3 L256.1 185.4 L255.8 184.4 L256.4 182.5 L257.4 182.1 L259.1 179.4 L259.6 171.1 L260.6 171.4 L257.2 165.3 L257.7 164.7 L259.3 165.6 L259.8 162.4 L258.6 164.5 L257.1 164.0 L257.6 163.3 L257.0 164.0 L256.5 163.4 L257.1 165.3 L255.1 165.3 L254.1 166.4 L252.7 166.3 L251.5 164.4 L251.4 162.2 L253.6 163.6 L255.7 162.4 L258.6 156.2 L258.8 152.5 L256.8 150.5 L256.6 146.3 L255.3 146.1 L255.1 145.2 L256.6 144.4 L258.2 141.5 L259.5 140.9 L261.0 141.6 L263.9 139.9 L265.5 133.4 L266.0 134.3 L267.6 133.7 L265.5 133.4 L265.5 131.8 L263.8 130.9 L265.6 130.1 L265.9 127.1 L268.7 129.3 L270.7 128.0 L272.7 129.2 L273.2 135.7 L273.7 138.1 L274.7 139.1 L276.3 139.0 L277.7 137.5 L278.0 136.0 L277.2 135.7 L277.9 133.9 L283.9 138.0 L285.9 135.3 L286.9 129.0 L285.0 126.4 L282.2 129.3 L280.4 128.9 L275.9 130.8 L275.6 128.9 L277.1 122.7 L278.6 121.1 L278.9 119.1 L280.9 120.8 L283.3 121.3 L287.2 124.5 L289.8 123.8 L291.4 122.3 L289.7 130.1 L289.8 137.7 L290.8 143.5 L292.2 147.1 L293.8 147.1 L295.0 148.2 L299.4 154.8 L299.8 156.3 L299.0 157.2 L300.7 158.4 L299.7 160.0 L302.5 162.8 L302.2 164.6 L303.7 168.6 L302.3 173.9 L304.1 172.0 L304.2 174.2 L305.1 175.1 L303.8 177.0 L302.5 177.2 L303.0 178.0 L304.7 176.8 L304.5 178.4 L303.0 178.4 L302.1 179.6 L302.7 179.8 L302.5 180.4 L301.2 180.9 L303.4 180.6 L302.9 181.6 L301.1 181.8 L301.9 182.8 L300.8 182.8 L301.1 183.4 L302.9 183.4 L302.4 184.3 L300.5 184.6 L301.8 185.4 L299.9 186.3 L301.8 187.5 L300.8 188.0 L299.3 187.2 L299.6 188.3 L300.7 188.6 L299.4 188.8 L300.1 189.6 L297.5 189.8 L297.3 188.4 L297.0 189.7 L297.7 190.7 L297.0 190.5 L296.9 192.1 L296.1 190.3 L295.2 190.2 L296.2 194.3 L294.1 192.9 L294.6 195.2 L292.6 196.8 L293.7 197.7 L293.6 199.0 L292.8 198.3 L292.0 199.6 L290.9 199.6 L290.9 200.3 L292.9 200.5 L291.3 202.3 L292.0 203.4 L292.9 203.0 L293.0 204.7 L291.6 203.9 L292.2 205.0 L291.7 205.4 L292.5 205.8 L291.1 206.0 L291.5 207.3 L293.1 207.3 L291.8 207.9 L293.0 208.9 L292.8 210.7 L291.1 209.6 L291.3 208.6 L290.3 208.7 L291.2 207.9 L290.6 207.3 L289.3 207.7 L289.0 206.8 L286.5 206.7 L284.4 208.4 L282.5 207.9 L281.5 209.4 L282.9 210.1 L281.3 210.7 L280.0 213.5 L279.1 212.8 L279.9 213.5 L279.6 213.9 L280.0 213.6 L279.1 217.0 L278.5 215.9 L278.7 217.0 L279.2 217.0 L278.6 217.5 L279.1 217.5 L279.4 221.9 L281.1 225.5 L281.8 232.4 L280.5 246.5 L279.2 248.2 L278.2 248.0 L276.2 249.7 L276.5 251.2 L275.2 252.4 L274.5 255.9 L272.1 261.1 L272.4 264.1 L270.9 266.6 L273.7 276.6 L277.4 281.7 L274.6 280.2 L276.7 281.7 L277.8 281.6 L277.8 283.0 L273.8 282.9 L270.3 285.4 L267.5 289.7 L267.0 297.1 L265.3 298.6 L260.9 299.2 L257.8 302.2 L257.0 304.7 L255.7 305.2 L252.7 303.4 L255.0 302.5 L254.0 301.4 L254.7 299.9 L254.1 297.6 L255.3 295.9 L254.8 294.3 L253.0 293.5 L254.6 293.4 L255.0 292.1 L256.3 292.1 L256.1 290.3 L258.3 289.6 L259.7 287.2 L260.8 287.2 L261.1 286.4 L258.0 283.1 L256.8 283.0 L255.8 284.9 L255.8 283.9 L254.9 284.4 L253.3 283.6 L252.5 285.9 L253.4 287.8 L252.7 287.5 L249.9 289.6 L251.1 290.1 L250.8 291.1 L249.7 291.3 L250.3 291.6 L250.0 294.1 L252.5 295.3 L250.5 297.2 L251.0 298.5 L249.4 298.4 L249.2 296.9 L249.8 296.4 L248.0 293.8 L243.3 293.6 L239.5 295.3 L238.8 297.0 L239.2 298.4 L238.2 298.3 L237.1 300.8 L237.9 301.1 L237.8 303.0 L238.9 303.7 L238.8 305.4 L235.7 309.5 L235.3 312.0 L234.5 311.5 L232.1 313.6 L229.7 311.1 L230.5 309.2 L230.1 305.7 L230.8 305.0 L230.2 303.3 L230.8 301.5 L233.2 301.9 L233.4 301.0 L229.8 298.7 L225.9 299.4 L224.1 301.7 L225.0 301.9 L224.6 302.9 L221.0 304.9 L220.6 307.3 L217.5 311.5 L218.1 313.7 L212.9 311.9 L210.4 311.5 L208.1 312.4 L203.9 311.5 L203.7 310.9 L205.1 311.1 L204.2 310.6 L205.0 309.1 L203.5 310.4 L205.0 307.9 L202.0 309.2 L203.8 311.4 L190.6 314.2 L191.9 311.8 L192.8 312.2 L192.2 312.1 L192.6 312.8 L196.5 310.4 L197.2 311.3 L198.6 310.3 L197.6 308.9 L198.8 308.6 L194.9 307.3 L194.3 309.0 L192.7 308.2 L190.9 308.7 L190.2 307.7 L190.5 306.7 L189.8 307.2 L191.1 305.6 L189.7 307.2 L189.3 306.4 L189.9 303.4 L188.4 308.6 L189.7 310.9 L187.8 310.3 L186.7 309.1 L187.3 306.9 L186.2 305.2 L187.8 299.7 L187.1 300.8 L186.7 299.8 L185.4 301.4 L184.3 300.7 L184.1 301.7 L183.8 300.9 L183.8 301.8 L182.4 302.6 L181.8 306.1 L179.4 309.7 L179.4 311.4 L180.1 311.7 L179.0 312.1 L180.1 312.7 L179.5 313.3 L180.2 313.8 L181.7 313.6 L184.0 315.2 L183.3 316.1 L184.3 315.5 L184.3 316.3 L184.7 315.7 L186.2 316.8 L186.6 316.2 L186.7 317.4 L187.5 317.1 L187.5 318.4 L188.5 317.9 L188.3 319.8 L186.0 320.1 L187.3 320.8 L188.2 320.2 L187.5 321.1 L188.0 322.7 L186.8 323.5 L185.0 323.1 L187.0 322.9 L186.4 322.4 L187.2 322.3 L185.9 321.2 L185.7 322.3 L184.9 321.6 L184.9 322.2 L183.2 322.5 L184.0 320.8 L183.0 321.3 L183.2 320.7 L182.6 320.7 L182.9 321.3 L182.0 321.7 L182.9 321.6 L181.3 323.2 L180.6 322.7 L181.0 322.2 L180.0 322.5 L180.0 323.4 L179.0 322.6 L179.4 323.6 L178.8 323.2 L178.8 324.2 L178.1 323.2 L177.9 324.2 L175.0 324.9 L174.0 325.9 L174.1 327.1 L174.8 327.2 L174.4 328.1 L173.3 327.9 L173.7 326.8 L172.2 328.3 L174.0 329.8 L173.1 330.0 L173.8 331.2 L172.4 330.5 L172.0 331.2 L172.9 331.9 L171.7 332.8 L171.0 332.4 L170.8 333.6 L169.8 333.8Z M333.5 103.2 L331.7 108.5 L329.2 105.6 L325.3 103.1 L322.1 102.5 L314.7 98.9 L307.9 93.8 L304.2 92.9 L301.4 90.3 L295.1 88.7 L296.1 88.2 L288.9 91.2 L283.9 94.4 L281.0 98.0 L279.3 96.9 L280.3 97.4 L281.0 96.6 L278.8 95.9 L278.1 93.7 L275.8 92.4 L275.7 91.3 L274.3 90.1 L271.4 90.6 L269.0 89.9 L265.4 94.5 L264.5 97.4 L264.8 99.4 L267.1 100.2 L270.6 103.2 L274.2 102.5 L275.5 103.1 L280.0 108.7 L284.2 110.4 L285.1 112.0 L280.1 114.6 L276.0 112.7 L274.1 113.7 L274.5 111.9 L272.7 111.5 L271.8 113.6 L268.3 115.3 L267.9 119.5 L264.1 120.9 L262.7 123.3 L259.1 121.9 L257.9 118.8 L258.4 115.1 L259.8 111.9 L260.9 111.5 L261.5 108.4 L258.9 103.4 L256.3 102.6 L255.4 100.5 L253.2 99.3 L253.3 96.5 L255.0 94.7 L254.2 89.2 L255.9 87.3 L259.5 86.8 L261.5 85.3 L262.5 83.2 L264.1 85.0 L265.1 84.6 L265.2 83.2 L266.9 82.1 L266.4 81.8 L267.1 80.5 L270.1 78.7 L270.2 77.6 L268.0 74.5 L265.6 72.2 L266.0 69.0 L268.0 69.1 L269.3 67.9 L272.8 70.9 L275.8 72.1 L276.1 73.3 L281.3 71.7 L281.3 73.1 L284.5 74.3 L289.2 70.9 L288.8 71.9 L290.3 69.4 L290.5 66.7 L289.0 63.9 L289.6 61.5 L288.3 58.1 L289.7 55.8 L293.6 54.3 L295.5 51.9 L295.5 41.6 L297.9 38.1 L298.8 33.2 L297.6 25.2 L294.1 17.8 L293.9 15.8 L295.8 12.4 L295.5 9.8 L296.4 11.2 L299.0 11.0 L300.3 10.2 L301.6 7.9 L302.6 8.0 L304.7 11.2 L307.4 12.8 L314.9 20.7 L320.1 28.8 L325.9 34.6 L337.8 42.9 L336.6 42.4 L337.6 42.9 L337.2 43.3 L338.0 42.9 L338.9 43.4 L338.6 43.8 L343.9 45.3 L341.4 45.1 L343.4 47.6 L346.8 47.3 L347.5 48.0 L348.1 46.8 L344.2 45.3 L353.2 47.5 L351.5 47.9 L351.1 49.6 L351.8 50.1 L353.2 49.2 L353.3 47.5 L354.4 47.2 L354.7 49.4 L357.6 52.4 L358.9 52.6 L357.1 51.6 L362.2 52.6 L366.4 52.4 L375.8 44.9 L379.3 40.8 L379.8 42.8 L379.4 44.2 L374.4 51.8 L372.9 55.8 L374.6 60.1 L378.6 61.5 L379.4 62.2 L379.4 62.8 L378.2 63.0 L379.2 62.1 L376.9 61.9 L377.5 61.3 L375.9 60.9 L377.8 67.2 L380.3 70.1 L377.8 68.4 L376.7 69.0 L378.9 69.7 L378.2 69.8 L378.6 70.6 L382.4 70.7 L382.9 72.4 L383.5 71.5 L382.6 70.9 L383.3 69.7 L386.2 67.4 L390.0 67.6 L388.5 69.1 L384.3 70.5 L384.1 72.3 L383.0 73.2 L383.3 73.8 L381.0 73.1 L374.8 74.4 L374.0 75.8 L375.4 76.3 L373.8 76.2 L372.2 77.6 L371.3 76.8 L372.2 78.1 L370.9 78.9 L367.7 78.0 L368.1 77.2 L369.3 77.9 L370.2 77.1 L368.3 75.8 L368.3 77.1 L366.5 76.9 L365.3 78.5 L366.6 80.3 L359.7 80.1 L357.0 79.3 L357.6 78.9 L356.9 78.4 L354.4 78.4 L348.7 80.4 L340.9 87.0 L336.1 93.0 L333.4 98.1 L333.5 103.2Z M46.9 414.4 L46.5 412.4 L48.7 410.5 L49.9 405.0 L48.8 402.5 L47.5 401.5 L47.6 398.9 L46.2 399.2 L45.1 397.9 L47.1 396.8 L48.0 397.5 L47.9 398.8 L49.1 398.6 L50.4 396.0 L49.8 394.8 L46.2 393.9 L43.4 400.4 L44.7 405.6 L46.9 406.9 L46.2 409.1 L45.0 410.0 L43.4 409.8 L42.2 407.4 L36.6 407.5 L36.9 406.6 L36.2 406.2 L36.8 405.8 L35.7 405.4 L36.4 404.7 L34.1 402.9 L35.3 402.1 L36.9 403.2 L38.9 402.0 L38.3 401.7 L39.3 398.5 L39.0 396.2 L35.5 392.3 L36.1 390.6 L37.3 391.1 L36.2 390.6 L36.8 388.9 L36.3 386.8 L35.6 386.7 L36.4 384.7 L35.7 383.5 L37.8 382.8 L38.0 383.8 L39.4 383.0 L40.3 380.5 L41.7 379.8 L41.4 379.0 L42.9 377.9 L42.3 377.5 L42.8 376.1 L44.7 374.3 L44.8 373.0 L44.0 372.4 L45.8 372.4 L43.9 371.7 L45.5 369.8 L46.4 370.0 L45.7 369.2 L46.7 368.7 L41.9 368.9 L45.1 366.5 L46.2 366.8 L45.4 366.2 L45.7 364.3 L44.7 362.5 L43.6 362.5 L44.0 361.0 L43.6 361.7 L41.8 360.6 L41.4 358.5 L40.8 358.3 L41.7 357.0 L41.0 356.0 L41.5 355.3 L40.5 355.7 L39.9 352.5 L41.9 350.7 L42.1 350.0 L39.4 352.6 L39.2 354.4 L38.2 354.2 L37.5 352.6 L36.1 352.7 L36.9 353.1 L36.7 353.8 L35.2 355.2 L34.4 354.8 L36.8 359.7 L33.7 362.3 L35.3 363.3 L37.2 361.9 L39.4 362.4 L40.3 364.4 L39.7 367.5 L35.5 369.9 L34.6 367.1 L35.5 367.0 L36.4 365.3 L35.8 364.2 L33.6 364.2 L32.3 365.2 L30.7 364.9 L29.4 367.9 L26.7 370.5 L25.8 370.5 L27.5 368.1 L26.9 367.1 L28.0 367.1 L28.7 365.5 L27.5 366.3 L27.9 365.8 L26.4 364.1 L26.8 363.3 L25.7 363.8 L23.4 360.5 L24.4 355.7 L26.3 357.0 L25.7 357.9 L25.8 358.7 L26.4 357.8 L27.7 358.9 L27.3 360.9 L26.9 359.9 L27.5 361.4 L27.0 362.1 L28.3 363.1 L29.0 361.7 L31.9 362.7 L30.1 360.6 L30.6 358.7 L30.0 357.5 L28.9 356.6 L27.7 357.4 L28.0 356.7 L26.4 356.3 L26.5 355.6 L26.3 357.0 L25.6 355.5 L26.8 354.3 L25.5 354.9 L25.0 353.8 L25.2 355.2 L24.2 355.5 L24.0 354.6 L24.9 354.5 L24.1 353.2 L23.5 353.7 L23.5 352.1 L23.3 353.1 L23.1 352.4 L22.6 352.8 L23.0 352.1 L21.6 352.3 L23.1 349.7 L22.2 349.9 L21.8 349.1 L22.0 347.8 L23.7 348.1 L24.3 347.2 L24.5 348.6 L26.9 348.0 L27.6 349.9 L28.6 350.5 L27.8 349.6 L28.5 348.0 L27.4 348.7 L27.1 346.8 L28.5 347.9 L28.6 346.9 L26.8 345.8 L27.3 344.7 L28.5 345.6 L27.8 344.3 L28.3 342.8 L29.0 343.4 L30.2 342.9 L31.0 344.1 L30.3 345.1 L32.5 345.8 L32.8 344.4 L34.6 344.1 L35.4 342.9 L34.3 343.1 L34.8 342.5 L33.7 342.0 L35.1 341.6 L36.5 339.7 L37.9 342.1 L40.7 341.6 L41.4 339.1 L39.8 340.4 L38.3 339.1 L39.5 339.9 L41.8 338.1 L42.4 335.8 L41.9 336.4 L41.8 335.6 L43.6 333.5 L46.7 333.2 L47.1 334.1 L47.1 333.4 L46.6 332.9 L47.2 332.1 L48.9 332.6 L50.8 331.8 L48.8 333.8 L49.9 333.9 L50.5 332.5 L51.9 333.5 L53.5 331.4 L54.4 331.4 L54.8 332.7 L53.4 335.2 L54.3 335.7 L54.3 337.4 L56.6 341.1 L62.6 342.2 L62.3 343.6 L62.8 342.2 L64.2 342.6 L64.0 341.8 L66.2 339.3 L69.4 339.7 L71.2 342.7 L71.1 345.2 L70.3 347.0 L68.4 346.8 L69.1 347.6 L67.8 348.7 L65.7 348.3 L65.9 350.7 L67.8 351.5 L70.0 350.6 L70.1 351.9 L70.1 350.8 L71.6 351.7 L74.8 350.9 L72.4 355.0 L74.8 354.6 L73.9 356.2 L75.3 356.5 L75.7 355.7 L76.4 356.7 L77.1 355.7 L77.4 356.7 L75.5 356.9 L74.6 358.6 L75.3 359.7 L74.2 359.6 L76.2 359.9 L76.5 359.4 L77.1 360.3 L77.8 359.7 L79.0 360.3 L76.5 360.6 L77.4 361.5 L75.8 363.0 L77.2 363.3 L75.7 364.4 L74.6 363.9 L73.8 366.9 L72.0 367.5 L71.3 369.8 L70.3 369.2 L69.7 370.1 L70.6 369.8 L69.8 372.3 L70.6 371.9 L71.0 372.6 L69.1 373.4 L69.0 374.1 L70.1 374.5 L68.7 374.7 L68.7 376.8 L68.1 376.8 L66.6 382.7 L66.1 382.6 L66.7 382.8 L64.9 389.3 L63.5 388.6 L64.8 389.4 L64.3 391.6 L65.5 392.5 L64.6 395.4 L65.0 396.3 L63.0 398.9 L63.2 400.8 L61.9 403.2 L62.3 404.2 L60.1 403.7 L59.3 401.7 L56.1 401.5 L54.4 404.4 L56.8 405.1 L56.1 406.5 L57.3 406.7 L56.0 408.0 L54.8 408.0 L53.7 410.4 L48.6 412.7 L46.9 414.4Z M100.1 357.5 L99.9 361.8 L98.6 362.3 L98.5 363.4 L99.8 364.4 L100.2 366.2 L98.9 366.0 L98.9 364.7 L98.3 364.4 L96.7 365.0 L96.6 364.4 L94.9 365.5 L93.1 364.1 L91.3 365.1 L91.9 362.5 L93.3 361.8 L93.3 360.5 L90.6 360.9 L90.7 360.0 L88.6 359.9 L89.0 360.3 L88.3 360.7 L89.0 360.8 L88.2 361.3 L87.5 360.1 L88.4 359.7 L87.7 359.2 L89.6 359.5 L88.6 359.1 L88.0 357.1 L86.3 356.8 L86.3 357.6 L85.6 357.7 L86.1 356.4 L87.9 356.8 L87.1 354.9 L88.4 355.0 L87.0 354.6 L86.8 353.6 L87.5 353.6 L85.9 352.6 L87.4 352.5 L88.1 353.8 L88.7 353.6 L88.3 352.6 L89.7 352.2 L88.8 351.4 L89.3 350.8 L87.8 350.7 L88.9 349.6 L85.4 349.5 L86.5 348.4 L86.4 347.7 L85.7 348.3 L85.6 346.8 L86.6 345.4 L85.0 344.8 L84.2 345.8 L83.9 345.1 L80.5 347.9 L79.4 348.3 L79.7 347.5 L79.2 347.6 L77.4 348.7 L79.8 346.6 L80.8 346.8 L80.4 346.2 L81.0 345.9 L82.9 345.8 L82.9 345.1 L86.6 343.1 L87.9 341.1 L91.8 338.9 L92.9 337.1 L92.8 333.8 L94.1 332.8 L94.4 330.4 L97.8 328.6 L98.0 327.3 L97.2 327.1 L98.3 326.4 L102.7 332.9 L106.9 330.5 L112.0 330.8 L113.9 328.9 L114.4 326.8 L114.4 325.0 L112.3 323.1 L114.9 323.5 L115.3 324.4 L118.3 321.6 L118.2 320.5 L119.1 320.3 L118.5 321.2 L119.4 321.5 L119.9 319.7 L124.3 320.8 L124.4 319.6 L125.1 320.3 L125.6 319.2 L126.1 321.2 L127.0 320.1 L128.0 320.5 L128.2 322.4 L130.9 323.0 L132.2 324.5 L135.7 323.7 L135.6 324.7 L136.3 325.2 L136.0 327.4 L135.5 326.8 L136.0 328.1 L134.3 327.5 L135.9 328.4 L135.0 329.2 L135.9 329.4 L136.1 330.8 L136.8 330.2 L138.1 331.8 L137.3 332.2 L138.3 332.3 L137.5 332.3 L138.2 333.0 L136.8 334.0 L136.6 334.6 L139.3 335.0 L135.5 336.8 L135.2 337.9 L130.6 340.8 L131.1 341.0 L129.9 342.0 L130.6 342.2 L129.4 342.2 L127.1 347.2 L126.3 351.6 L120.4 344.5 L116.3 343.3 L112.6 344.3 L112.8 343.2 L112.3 342.9 L112.1 343.8 L112.7 344.5 L107.6 346.7 L109.1 346.1 L110.0 346.7 L107.5 347.2 L106.9 348.5 L106.4 347.5 L105.6 348.1 L104.9 349.2 L105.7 351.2 L104.5 353.1 L104.8 354.1 L103.9 353.8 L101.9 357.8 L100.1 357.5Z M220.0 218.5 L218.1 219.1 L218.4 216.0 L220.4 212.8 L222.8 211.1 L223.4 209.3 L224.6 209.1 L224.1 212.7 L222.5 216.6 L222.9 217.1 L222.8 216.1 L225.9 216.2 L224.3 220.6 L221.1 223.1 L217.9 223.8 L217.6 223.3 L219.0 222.7 L219.4 220.7 L220.7 219.4 L220.0 218.5Z M12.1 491.3 L16.0 490.8 L13.8 489.8 L16.7 488.1 L18.2 488.4 L18.0 487.6 L19.2 487.7 L19.5 486.7 L20.3 487.7 L21.3 485.4 L23.1 485.0 L22.4 486.8 L23.1 485.7 L23.5 486.7 L23.7 485.3 L24.3 485.7 L23.7 484.4 L24.7 483.6 L25.4 485.5 L24.1 487.3 L23.0 487.2 L21.3 489.8 L19.4 490.1 L19.1 491.5 L18.4 491.3 L19.9 492.4 L18.3 493.0 L18.1 494.1 L16.7 493.7 L17.4 494.1 L17.6 495.4 L15.8 494.2 L15.5 492.8 L15.0 493.2 L15.7 492.1 L14.8 491.9 L14.6 492.7 L12.1 491.3Z M144.9 313.4 L145.5 314.6 L142.7 318.7 L142.6 320.6 L144.0 322.9 L138.9 325.1 L138.2 324.3 L138.6 323.2 L137.3 323.7 L137.2 322.1 L137.9 321.1 L138.9 321.2 L140.4 317.8 L144.9 313.4Z M31.1 376.4 L32.7 372.7 L32.2 371.4 L32.7 372.0 L34.4 371.0 L36.2 371.4 L36.5 377.0 L35.8 377.7 L35.3 377.0 L34.9 378.0 L35.4 378.3 L32.2 381.1 L31.5 380.8 L31.9 379.6 L30.9 379.6 L32.0 378.0 L33.1 378.6 L33.5 377.5 L31.6 377.8 L31.1 376.4Z M40.2 432.0 L43.0 429.2 L46.9 431.9 L46.6 433.8 L45.4 435.4 L43.6 436.1 L41.6 435.7 L40.2 432.0Z M14.2 320.3 L15.4 319.9 L15.2 318.0 L16.2 317.4 L15.3 317.3 L16.3 315.3 L16.9 315.5 L15.6 314.8 L16.3 312.2 L18.0 312.5 L18.3 311.4 L18.9 311.5 L18.5 310.8 L20.0 310.9 L19.9 313.2 L18.9 313.1 L20.0 313.6 L19.8 314.9 L17.5 317.7 L17.8 318.5 L17.1 319.5 L18.1 318.9 L17.7 321.6 L17.0 322.1 L15.7 321.3 L17.0 321.5 L17.1 319.9 L16.1 321.0 L16.2 319.6 L15.6 319.5 L15.6 320.9 L14.2 320.3Z M55.2 426.6 L53.5 428.9 L53.6 431.9 L51.4 432.7 L50.9 429.3 L52.3 428.3 L53.3 425.8 L53.0 423.6 L55.6 418.9 L56.1 422.9 L55.2 426.6Z M-0.0 369.2 L0.3 368.3 L1.0 369.5 L1.5 368.8 L0.8 369.0 L1.7 367.6 L1.1 367.4 L1.2 364.6 L1.9 364.6 L2.4 365.7 L3.6 364.9 L3.8 365.9 L4.8 364.1 L6.7 368.1 L3.9 368.4 L4.4 369.6 L3.9 370.3 L3.0 369.4 L1.2 369.9 L-0.0 369.2Z M36.4 374.0 L39.8 371.6 L40.6 372.6 L41.3 371.6 L40.6 369.9 L42.1 369.2 L42.0 370.9 L41.3 371.0 L41.4 371.9 L42.2 371.6 L40.9 375.3 L39.7 375.9 L39.6 374.6 L37.0 375.6 L36.4 374.0Z M12.8 327.5 L13.7 321.1 L14.1 322.2 L15.0 322.2 L15.1 321.2 L16.1 321.8 L16.0 322.6 L17.0 322.1 L15.5 326.8 L13.9 328.1 L13.9 327.3 L12.8 327.5Z M103.8 268.5 L103.8 266.2 L105.9 264.6 L108.4 266.9 L108.1 268.6 L106.7 268.8 L107.4 269.7 L106.1 269.2 L105.4 269.9 L103.8 268.5Z M283.8 17.2 L285.4 15.1 L287.8 16.4 L288.4 18.2 L286.2 19.7 L283.8 17.2Z M9.0 359.5 L10.5 358.9 L10.0 357.6 L10.6 357.1 L11.0 357.7 L10.7 356.7 L11.7 353.8 L11.0 358.8 L12.8 358.2 L13.3 359.0 L12.3 360.1 L11.4 359.5 L11.4 362.3 L10.6 362.3 L10.5 363.5 L9.9 360.9 L10.6 361.1 L9.0 359.5Z M16.8 353.3 L17.2 352.6 L18.1 353.3 L17.6 352.1 L18.9 351.8 L18.2 350.8 L19.2 350.3 L19.0 348.6 L20.7 347.7 L20.9 348.4 L21.5 347.7 L20.8 347.2 L21.7 346.9 L22.0 348.4 L20.7 349.2 L21.1 349.7 L20.1 350.4 L20.5 350.9 L19.6 352.4 L18.0 353.6 L16.8 353.3Z M125.5 317.2 L126.4 316.7 L125.9 316.3 L126.2 315.6 L130.3 314.6 L130.0 318.3 L128.6 317.9 L129.3 317.0 L127.7 318.8 L127.5 316.9 L125.5 317.2Z M244.7 101.4 L245.5 100.3 L248.3 99.3 L247.1 103.6 L245.8 105.0 L245.1 104.4 L244.7 101.4Z M23.6 336.9 L24.5 337.1 L23.8 335.7 L24.6 335.8 L24.3 334.9 L25.0 334.2 L26.5 334.7 L25.9 335.7 L27.2 336.3 L26.2 336.7 L27.2 337.0 L26.9 337.6 L25.7 337.7 L25.3 338.7 L23.6 336.9Z M80.9 332.5 L82.4 331.3 L84.6 333.1 L86.5 331.7 L87.7 331.8 L85.5 332.9 L85.5 334.2 L84.5 334.4 L84.7 333.7 L83.4 333.2 L83.3 334.1 L81.7 334.4 L80.9 332.5Z", "oki": "M79.9 67.6 L80.1 68.7 L77.6 69.7 L78.0 70.5 L74.7 69.8 L73.3 70.8 L77.0 76.0 L75.9 75.8 L74.5 74.3 L73.4 74.9 L73.9 75.5 L72.5 76.1 L72.7 76.8 L70.3 79.8 L71.1 81.1 L72.9 80.4 L73.3 81.4 L69.0 84.4 L66.4 84.8 L66.9 82.0 L65.4 80.1 L66.2 79.4 L67.7 80.3 L66.6 79.3 L67.3 79.0 L68.2 77.1 L69.1 77.3 L70.5 75.7 L68.5 70.4 L69.6 71.1 L70.9 70.2 L72.0 70.6 L73.9 68.7 L73.8 67.8 L75.5 68.0 L76.7 67.3 L77.3 66.3 L78.6 66.3 L79.4 64.9 L77.1 63.6 L75.9 63.6 L75.2 62.3 L75.8 61.6 L74.9 60.6 L75.0 59.5 L76.2 60.1 L78.2 59.7 L79.0 60.5 L78.9 60.1 L80.4 60.5 L79.3 62.0 L80.3 62.8 L83.2 62.2 L84.5 61.2 L85.1 61.7 L84.0 60.7 L86.4 59.0 L86.1 58.1 L87.3 58.0 L89.2 56.1 L90.1 54.3 L89.9 53.3 L90.6 53.0 L91.6 54.3 L92.4 54.3 L92.9 58.4 L91.7 59.3 L91.1 61.0 L89.4 62.8 L85.9 62.8 L86.1 64.1 L84.9 63.8 L86.0 65.3 L85.5 65.9 L83.8 66.6 L81.4 65.9 L82.2 67.1 L79.9 67.6Z"};
function jpBase(){
  return `<rect width="400" height="440" rx="18" fill="#BFE3FB"/>
    <path d="${JP_REAL.jp}" fill="#A8DC8E" stroke="#4E9A47" stroke-width="1.4" stroke-linejoin="round"/>
    <rect x="10" y="12" width="118" height="96" rx="10" fill="#D7EEFC" stroke="#7FA9C9" stroke-dasharray="5 4"/>
    <text x="18" y="30" font-size="12" fill="#4F7896" font-weight="bold">おきなわ</text>
    <path d="${JP_REAL.oki}" fill="#A8DC8E" stroke="#4E9A47" stroke-width="1.4" stroke-linejoin="round"/>`;
}
function prefXY(p){ return p[0]==='沖縄県' ? [40 + (p[4]-127)*40, 40 + (27.2-p[3])*40] : jpXY(p[3], p[4]); }
function pinSVG(x, y, col='#E8414B'){ return `<circle cx="${x}" cy="${y}" r="13" fill="${col}" opacity=".25"><animate attributeName="r" values="9;17;9" dur="1.4s" repeatCount="indefinite"/></circle><circle cx="${x}" cy="${y}" r="7" fill="${col}" stroke="#fff" stroke-width="2.5"/>`; }
jpMap = function(p){ const [x,y] = prefXY(p); return `<svg class="jpMap" viewBox="0 0 400 440">${jpBase()}${pinSVG(x,y)}</svg>`; };
function jpRegionMap(reg){
  const dots = PREF.filter(p => p[2]===reg).map(p => { const [x,y] = prefXY(p); return `<circle cx="${x}" cy="${y}" r="8" fill="#F28F1C" stroke="#fff" stroke-width="2"/>`; }).join('');
  return `<svg class="jpMap" viewBox="0 0 400 440">${jpBase()}${dots}</svg>`;
}
const _sRegionGen = MATH_UNITS.s_region.gen;
MATH_UNITS.s_region.gen = function(){
  if(Math.random() < 0.45){ const reg = choice(REGIONS); return {type:'choice', q:'<b>オレンジの ●</b> が あつまっている 地方は？', disp:jpRegionMap(reg), ans:reg, opts:fourOpts(reg, REGIONS), hint:'日本は 8つの 地方に 分けられるよ', dk:'map'}; }
  return _sRegionGen();
};
MATH_UNITS.s_food.gen = function(){
  const p = prefPick(), it = choice(p[5]);
  if(Math.random()<.6) return {type:'choice', q:`<b>「${it}」</b> で 有名な 都道府県は？`, disp:`<img class="qPic" src="${esc(artSrc('so_food'))}" alt="">`, ans:p[0], opts:fourOpts(p[0], PREF.map(x=>x[0])), hint:`${p[2]}地方だよ`};
  return {type:'choice', q:`<b>赤い ●</b> の 都道府県で 有名な ものは？`, disp:jpMap(p), ans:it, opts:fourOpts(it, PREF.filter(x=>x!==p).flatMap(x=>x[5])), hint:`ここは ${p[0]}`};
};

/* ---------- 絵つきの しゃかい問題 ---------- */
const PIC = k => `<img class="qPic" src="${esc(artSrc(k))}" alt="">`;
const JOBS = [['sq_fireman','しょうぼうし','火事を けしたり、きゅうきゅうで 人を たすける'],['sq_police','けいさつかん','まちの あんぜんを まもる'],['sq_farmer','農家','野さいや お米を そだてる'],['sq_fisher','漁師','海で 魚を とる'],['sq_worker','工場で はたらく人','工場で 品物を つくる']];
const OLDS = [['sq_washboard','せんたくいた','せんたく','せんたくき'],['sq_hibachi','ひばち','へやを あたためる','ストーブ・エアコン'],['sq_kamado','かまど','ごはんを たく','すいはんき・ガスコンロ'],
  ['sq_chabudai','ちゃぶだい','家族で ごはんを 食べる','ダイニングテーブル'],['sq_abacus','そろばん','計算を する','電たく'],['sq_dialphone','黒電話','電話を かける','スマートフォン'],
  ['sq_icebox','氷の れいぞうこ','食べものを ひやす','電気れいぞうこ'],['sq_oldiron','炭の アイロン','ふくの しわを のばす','電気アイロン']];
const LIFE_PIC = ['sq_fireman','sq_police','sq_fireman','sq_police','sq_pricetag','sq_pricetag','sq_flyer','sq_farmer','sq_fisher','sq_worker','sq_hydrant','sq_fireman','so_shop','sq_farmer'];
MATH_UNITS.s_life.gen = function(){
  if(Math.random() < 0.45){ const j = choice(JOBS);
    return Math.random()<.5 ? {type:'choice', q:'絵の 人の 仕事は 何？', disp:PIC(j[0]), ans:j[1], opts:fourOpts(j[1], JOBS.map(x=>x[1])), hint:'ふくそうや 道具を よく 見よう'}
      : {type:'choice', q:`<b>${j[2]}</b> 仕事を する 人は？`, disp:PIC(j[0]), ans:j[1], opts:fourOpts(j[1], JOBS.map(x=>x[1])), hint:''}; }
  const i = ri(0, SOC_QA.life.length-1), q = SOC_QA.life[i];
  return {type:'choice', q:q[0], disp:LIFE_PIC[i] ? PIC(LIFE_PIC[i]) : '', ans:q[1], opts:shuffle(q[2].slice()), hint:''};
};
MATH_UNITS.s_old.gen = function(){
  const o = choice(OLDS), k = ri(0,2);
  if(k===0) return {type:'choice', q:'絵の むかしの 道具の 名前は？', disp:PIC(o[0]), ans:o[1], opts:fourOpts(o[1], OLDS.map(x=>x[1])), hint:'くらしの 中で つかった 道具だよ'};
  if(k===1) return {type:'choice', q:`絵の <b>${o[1]}</b> は 何に つかった？`, disp:PIC(o[0]), ans:o[2], opts:fourOpts(o[2], OLDS.map(x=>x[2])), hint:''};
  return {type:'choice', q:`<b>${o[1]}</b> の かわりに 今 つかう ものは？`, disp:PIC(o[0]), ans:o[3], opts:fourOpts(o[3], OLDS.map(x=>x[3])), hint:''};
};
const JP_PIC = {'富士山':'sq_fuji','信濃川':'sq_river'};
MATH_UNITS.s_jp.gen = function(){
  const q = choice(SOC_QA.japan);
  const pic = JP_PIC[q[1]] ? PIC(JP_PIC[q[1]]) : `<svg class="jpMap sm" viewBox="0 0 400 440">${jpBase()}</svg>`;
  return {type:'choice', q:q[0], disp:pic, ans:q[1], opts:shuffle(q[2].slice()), hint:''};
};

/* =====================================================================
   世界地図・国旗
   ===================================================================== */
const WORLD = {"Fiji": ["M720 200 L720 201 L717 202 L717 201 L720 200Z M715 203 L717 203 L717 204 L715 204 L715 203Z", 163.9, -17.3, "Oceania"], "Tanzania": ["M428 170 L435 174 L436 175 L438 177 L437 180 L438 181 L439 182 L438 185 L441 189 L439 190 L433 191 L429 191 L427 187 L421 185 L419 181 L419 177 L422 175 L421 173 L422 171 L421 170 L428 170Z", 34.8, -6.3, "Africa"], "W. Sahara": ["M343 113 L343 116 L336 116 L336 121 L334 121 L334 125 L326 125 L326 126 L326 125 L330 125 L332 121 L335 118 L336 116 L337 114 L342 114 L343 113Z", -12.1, 24.3, "Africa"], "Canada": ["M114 70 L109 67 L105 66 L104 65 L104 63 L102 62 L101 61 L99 59 L100 56 L97 55 L93 51 L89 48 L85 50 L82 48 L78 47 L78 29 L87 30 L91 29 L94 29 L100 28 L102 28 L104 27 L108 29 L111 28 L111 29 L117 28 L130 30 L132 31 L129 32 L133 33 L140 32 L142 33 L144 32 L142 31 L144 31 L148 30 L151 32 L157 33 L163 32 L163 31 L165 31 L168 32 L168 33 L169 32 L171 32 L172 30 L167 28 L167 26 L170 24 L174 25 L177 28 L175 29 L179 29 L179 31 L182 29 L184 31 L183 32 L185 34 L189 30 L189 28 L195 29 L197 30 L198 31 L196 32 L197 33 L197 34 L193 35 L188 35 L185 38 L183 40 L179 41 L178 42 L176 42 L172 46 L171 50 L174 50 L175 54 L178 53 L190 57 L195 58 L196 61 L197 64 L200 66 L202 65 L203 63 L202 60 L200 59 L204 58 L207 55 L205 52 L203 50 L205 48 L204 43 L212 43 L217 46 L221 46 L221 50 L225 52 L228 50 L231 47 L237 54 L236 55 L241 58 L245 59 L246 60 L248 61 L249 64 L240 68 L227 68 L223 70 L218 74 L219 74 L223 71 L227 70 L230 70 L232 71 L230 72 L231 76 L234 77 L237 76 L239 74 L239 75 L240 76 L229 81 L228 81 L228 79 L231 77 L226 78 L224 77 L224 74 L222 73 L219 77 L217 78 L210 78 L206 81 L203 81 L202 81 L202 82 L195 85 L194 84 L196 81 L195 77 L190 74 L183 71 L177 72 L171 71 L170 69 L170 69 L170 70 L114 70Z M192 43 L193 42 L196 42 L194 44 L192 43Z M200 22 L198 21 L198 21 L204 21 L207 22 L200 22Z M199 44 L200 43 L201 44 L201 45 L199 44Z M173 18 L172 19 L166 18 L170 17 L173 18Z M172 13 L168 13 L167 12 L171 12 L172 13Z M163 10 L169 11 L168 12 L165 12 L164 12 L163 10Z M184 19 L175 18 L174 16 L172 15 L166 14 L167 14 L177 14 L179 15 L178 16 L182 17 L198 17 L200 18 L196 19 L184 19Z M137 12 L140 12 L136 13 L133 13 L137 12Z M137 10 L141 11 L135 11 L137 10Z M249 65 L246 68 L248 68 L249 68 L248 69 L253 70 L252 71 L254 71 L255 73 L254 75 L252 74 L252 73 L252 72 L249 74 L248 74 L249 73 L247 73 L241 73 L241 72 L242 71 L242 71 L245 67 L248 65 L249 65Z M188 37 L197 39 L197 40 L200 41 L198 41 L195 41 L194 40 L189 42 L188 41 L186 41 L187 40 L188 37Z M199 24 L204 23 L212 24 L212 25 L216 25 L218 26 L222 27 L226 30 L222 31 L230 32 L233 34 L236 34 L236 36 L232 38 L227 35 L224 35 L224 37 L229 39 L231 41 L230 43 L222 41 L228 44 L222 43 L210 39 L210 39 L205 40 L203 39 L204 37 L212 37 L211 36 L212 35 L215 33 L213 32 L206 30 L208 30 L202 28 L197 29 L183 27 L181 26 L183 26 L180 26 L180 24 L181 22 L183 21 L188 20 L187 22 L188 23 L190 21 L195 20 L199 23 L199 24Z M171 20 L175 20 L179 20 L171 24 L169 24 L168 21 L171 20Z M114 16 L122 13 L128 13 L127 14 L126 15 L117 16 L114 16Z M94 60 L97 60 L96 62 L98 64 L94 61 L94 60Z M149 9 L158 10 L161 12 L150 11 L152 11 L149 10 L149 9Z M113 71 L109 70 L106 68 L104 68 L103 66 L108 67 L113 71Z M110 19 L125 20 L129 21 L122 23 L119 24 L119 25 L114 26 L108 24 L112 21 L110 19Z M144 16 L148 16 L149 17 L147 18 L136 19 L133 19 L132 19 L136 18 L125 18 L129 15 L142 17 L139 15 L141 14 L143 15 L144 16Z M143 22 L149 23 L151 26 L158 28 L158 29 L155 29 L156 30 L155 30 L148 30 L133 31 L132 30 L128 30 L125 28 L135 27 L124 27 L123 26 L128 25 L121 25 L124 23 L130 21 L132 22 L131 23 L135 22 L138 23 L140 22 L142 23 L144 25 L145 24 L143 22Z M159 23 L157 21 L159 20 L165 20 L166 21 L164 22 L167 23 L167 25 L163 25 L155 23 L155 22 L159 23Z M146 21 L149 21 L151 21 L149 22 L146 21Z M163 15 L165 15 L164 18 L160 18 L158 18 L158 17 L155 17 L155 15 L163 15Z M167 8 L171 6 L171 6 L175 5 L178 7 L184 7 L188 9 L182 11 L174 11 L172 10 L172 10 L174 9 L170 9 L167 8Z M177 4 L189 3 L194 3 L195 2 L201 2 L214 2 L236 3 L236 3 L225 5 L229 5 L221 7 L218 8 L206 9 L209 10 L208 10 L209 11 L200 14 L204 14 L199 16 L181 15 L181 14 L184 14 L183 12 L190 13 L187 12 L184 11 L190 9 L187 9 L186 7 L193 8 L196 7 L185 7 L181 6 L177 4Z M210 33 L206 34 L206 33 L206 32 L208 31 L210 32 L210 33Z M164 28 L169 30 L167 30 L160 29 L164 28Z M231 68 L234 69 L236 70 L233 69 L231 68Z M232 74 L233 75 L236 75 L234 76 L232 75 L231 75 L232 74Z", -98.1, 61.5, "North America"], "United States of America": ["M114 70 L170 70 L170 69 L170 69 L171 71 L177 72 L183 71 L190 74 L195 77 L196 81 L194 84 L195 85 L202 82 L202 81 L203 81 L206 81 L210 78 L217 78 L219 77 L222 73 L224 74 L224 77 L226 78 L220 81 L218 83 L219 84 L220 84 L220 84 L220 84 L220 85 L213 86 L216 86 L212 86 L212 89 L210 90 L209 89 L210 91 L208 94 L209 92 L208 91 L207 90 L207 92 L206 92 L207 92 L209 97 L207 98 L202 101 L197 105 L197 108 L200 114 L199 118 L198 118 L197 116 L194 112 L195 111 L193 108 L190 109 L187 107 L181 108 L181 110 L174 108 L171 109 L166 112 L166 116 L165 116 L162 115 L158 109 L155 108 L154 110 L152 109 L147 104 L144 104 L144 105 L138 105 L131 103 L126 103 L123 100 L119 99 L111 87 L112 84 L111 82 L112 77 L111 72 L114 72 L115 74 L115 73 L114 70Z M48 127 L50 129 L49 130 L48 129 L48 127Z M48 126 L47 127 L47 126 L47 126 L48 126Z M44 125 L45 125 L45 125 L44 125 L44 125Z M25 48 L29 47 L29 48 L28 48 L25 48Z M54 52 L56 53 L52 55 L51 54 L51 53 L54 52Z M78 29 L78 47 L82 48 L85 50 L89 48 L93 51 L97 55 L100 56 L100 57 L99 58 L96 57 L95 55 L93 54 L92 52 L87 52 L80 49 L72 48 L66 46 L64 47 L64 48 L57 50 L56 49 L57 47 L59 46 L59 45 L52 49 L53 50 L52 52 L47 53 L43 56 L34 59 L30 59 L36 56 L39 56 L43 54 L45 53 L46 50 L42 51 L41 50 L40 51 L39 50 L36 51 L36 49 L35 48 L32 48 L29 47 L29 46 L28 45 L29 44 L31 42 L34 42 L38 40 L37 39 L38 38 L34 39 L30 39 L27 39 L24 37 L31 35 L33 35 L32 36 L37 36 L29 32 L26 31 L28 30 L31 30 L36 27 L47 25 L51 27 L56 26 L59 27 L78 29Z M17 40 L19 41 L23 41 L21 42 L17 41 L17 40Z", -112.6, 45.7, "North America"], "Kazakhstan": ["M535 70 L533 71 L532 71 L531 73 L530 74 L526 73 L525 77 L520 78 L522 82 L520 82 L521 83 L518 82 L511 82 L508 81 L507 82 L507 83 L502 83 L502 83 L498 85 L497 87 L496 86 L493 86 L493 84 L492 84 L492 82 L490 81 L484 81 L482 79 L477 77 L472 78 L472 85 L471 85 L468 83 L465 84 L465 82 L463 82 L461 79 L463 79 L463 78 L466 77 L466 74 L462 74 L458 75 L457 75 L457 74 L456 73 L455 73 L453 71 L455 67 L457 68 L457 67 L462 65 L465 65 L471 67 L474 66 L477 66 L479 67 L480 66 L483 66 L483 65 L480 64 L482 63 L481 63 L483 62 L482 61 L483 60 L490 59 L498 57 L502 58 L502 60 L504 59 L507 60 L507 61 L514 59 L513 60 L516 61 L520 66 L521 65 L524 66 L527 66 L531 69 L534 68 L535 70Z", 67.3, 48.2, "Asia"], "Uzbekistan": ["M472 85 L472 78 L477 77 L482 79 L484 81 L490 81 L492 82 L492 84 L493 84 L493 86 L496 86 L497 87 L502 83 L503 84 L501 85 L506 86 L504 88 L501 88 L501 86 L499 87 L497 89 L495 89 L495 90 L496 90 L497 92 L496 94 L493 93 L493 92 L488 90 L485 88 L484 86 L481 86 L480 85 L480 84 L477 82 L474 84 L474 85 L472 85Z", 63.2, 41.7, "Asia"], "Papua New Guinea": ["M642 173 L649 176 L652 178 L652 179 L655 180 L656 181 L654 181 L654 183 L657 186 L659 186 L659 187 L662 189 L661 189 L656 188 L652 184 L649 183 L647 184 L647 186 L645 187 L642 186 L642 173Z M665 175 L666 177 L666 178 L665 176 L661 173 L662 173 L665 175Z M663 180 L659 181 L657 179 L657 179 L660 179 L660 178 L660 179 L662 179 L663 178 L663 176 L664 176 L665 178 L663 180Z M669 178 L672 181 L672 182 L670 181 L669 178Z", 145.3, -6.5, "Oceania"], "Indonesia": ["M642 173 L642 186 L640 185 L635 185 L636 183 L637 183 L636 179 L627 175 L626 176 L626 175 L624 174 L628 173 L627 172 L624 172 L621 170 L625 169 L628 170 L629 174 L631 175 L633 173 L635 171 L642 173Z M610 186 L610 187 L609 188 L607 188 L608 187 L610 186Z M628 182 L628 180 L629 179 L629 180 L628 182Z M596 160 L595 162 L596 163 L596 164 L598 166 L596 166 L595 170 L593 171 L592 176 L592 175 L590 176 L589 175 L587 174 L584 175 L583 174 L580 174 L580 171 L578 169 L578 167 L578 165 L579 164 L581 166 L584 166 L586 165 L588 166 L589 165 L592 159 L596 160Z M616 174 L621 174 L622 176 L620 175 L616 175 L616 174Z M614 176 L612 175 L612 174 L614 174 L614 175 L614 176Z M616 164 L616 165 L617 165 L617 166 L617 167 L616 167 L616 169 L617 170 L616 170 L615 166 L616 164Z M602 165 L608 166 L610 165 L610 165 L609 167 L607 168 L600 168 L600 169 L602 171 L603 170 L607 169 L607 170 L606 170 L603 172 L605 174 L605 175 L606 177 L606 179 L605 179 L604 179 L605 177 L603 178 L603 177 L603 176 L602 175 L602 173 L601 174 L601 179 L600 179 L599 179 L599 175 L598 175 L598 174 L600 168 L602 165Z M601 189 L598 187 L600 187 L602 188 L601 189Z M601 184 L604 185 L606 184 L606 185 L600 186 L600 185 L601 184Z M596 184 L598 185 L598 185 L593 186 L596 184Z M577 181 L577 182 L581 182 L582 181 L585 182 L586 183 L591 185 L589 186 L577 184 L571 182 L572 180 L577 181Z M569 170 L570 173 L571 173 L572 174 L572 180 L569 180 L565 176 L559 168 L557 164 L551 158 L551 157 L555 158 L561 164 L563 164 L565 165 L568 168 L567 169 L569 170Z", 117.4, -2.2, "Asia"], "Argentina": ["M223 273 L224 276 L230 277 L229 278 L227 278 L226 278 L223 278 L223 273Z M245 228 L243 237 L246 239 L245 240 L247 241 L246 242 L245 244 L242 245 L235 246 L236 249 L235 250 L232 250 L231 250 L230 250 L230 252 L231 253 L232 252 L233 253 L230 255 L229 258 L227 258 L225 259 L225 261 L229 262 L228 264 L226 265 L224 268 L222 269 L222 272 L224 273 L216 272 L215 269 L213 269 L213 267 L215 264 L217 258 L218 258 L216 256 L217 256 L216 255 L216 253 L217 252 L216 250 L217 246 L218 245 L218 241 L219 240 L219 238 L220 236 L219 231 L220 229 L221 225 L223 222 L223 221 L223 217 L225 216 L226 213 L227 212 L230 212 L231 214 L232 212 L234 212 L238 216 L244 218 L245 219 L243 222 L249 223 L250 221 L251 219 L252 219 L253 220 L253 222 L245 228Z", -65.2, -35.4, "South America"], "Chile": ["M223 273 L223 278 L226 278 L224 279 L218 278 L211 274 L218 276 L219 274 L223 273Z M221 203 L223 207 L222 209 L224 214 L226 214 L225 216 L223 217 L223 221 L223 222 L221 225 L220 229 L219 231 L220 236 L219 238 L219 240 L218 241 L218 245 L217 246 L216 250 L217 252 L216 253 L216 255 L217 256 L216 256 L218 258 L217 258 L215 264 L213 267 L213 269 L215 269 L216 272 L223 273 L218 274 L218 276 L217 276 L210 273 L209 265 L210 263 L212 262 L209 261 L211 260 L211 256 L214 257 L215 253 L213 252 L213 255 L211 254 L213 248 L214 247 L213 242 L214 242 L217 233 L217 226 L218 223 L220 211 L219 205 L221 203Z", -71.5, -39.0, "South America"], "Dem. Rep. Congo": ["M418 174 L419 181 L421 185 L417 185 L417 192 L419 193 L419 192 L419 195 L418 194 L414 191 L413 192 L409 191 L409 190 L404 190 L403 183 L401 183 L401 182 L400 182 L399 182 L398 184 L395 184 L393 180 L385 180 L384 180 L385 178 L387 177 L389 178 L392 175 L393 171 L395 169 L397 160 L399 158 L405 160 L406 159 L411 157 L415 158 L417 159 L419 159 L422 161 L422 163 L422 164 L420 167 L418 174Z", 23.6, -2.9, "Africa"], "Somalia": ["M443 171 L442 170 L442 162 L444 160 L446 159 L447 158 L450 158 L458 149 L458 145 L462 144 L461 150 L457 157 L453 162 L446 167 L443 171Z", 45.7, 4.8, "Africa"], "Kenya": ["M438 177 L436 175 L435 174 L428 170 L428 168 L430 164 L428 160 L431 157 L432 157 L432 159 L434 159 L436 161 L439 161 L442 159 L444 160 L442 162 L442 170 L443 171 L441 173 L438 177Z", 37.8, 0.6, "Africa"], "Sudan": ["M409 152 L408 151 L407 150 L407 148 L405 143 L404 143 L406 137 L408 137 L408 128 L410 128 L410 124 L434 124 L435 131 L437 132 L434 134 L433 141 L429 147 L428 151 L427 147 L426 147 L426 144 L425 144 L424 144 L425 146 L423 148 L422 149 L420 147 L418 149 L414 149 L412 147 L410 147 L409 150 L408 151 L409 152Z", 29.9, 16.0, "Africa"], "Chad": ["M408 129 L408 137 L406 137 L404 143 L405 143 L406 146 L403 147 L402 149 L398 150 L398 151 L396 152 L391 153 L390 150 L388 149 L388 148 L391 148 L390 146 L389 141 L388 141 L387 139 L388 137 L390 135 L392 127 L390 125 L390 122 L392 121 L408 129Z", 18.6, 15.3, "Africa"], "Haiti": ["M217 129 L217 132 L212 132 L211 131 L211 131 L215 131 L214 129 L213 129 L214 128 L217 129Z", -72.7, 18.9, "North America"], "Dominican Rep.": ["M217 133 L216 131 L217 128 L220 129 L223 131 L223 132 L219 131 L217 133Z", -70.5, 18.9, "North America"], "Russia": ["M717 26 L720 25 L720 26 L718 26 L717 26Z M458 75 L453 79 L457 84 L456 86 L451 83 L440 81 L433 78 L435 77 L436 76 L435 75 L438 74 L436 74 L437 73 L439 72 L440 69 L431 67 L430 66 L428 65 L429 64 L428 63 L424 64 L423 62 L425 61 L422 58 L422 57 L416 56 L416 54 L415 53 L415 52 L415 51 L416 49 L418 48 L416 47 L423 42 L420 41 L421 40 L419 38 L420 36 L418 34 L420 33 L417 31 L417 30 L424 28 L428 29 L433 30 L442 33 L442 34 L437 36 L426 35 L430 36 L430 39 L434 40 L434 39 L433 38 L434 38 L439 39 L441 38 L440 37 L444 35 L448 36 L449 34 L447 33 L448 32 L447 31 L453 32 L454 33 L451 33 L451 34 L453 35 L456 34 L456 33 L467 30 L469 30 L467 32 L469 32 L478 30 L480 31 L482 30 L480 29 L481 28 L487 29 L497 32 L498 31 L496 29 L494 29 L495 28 L493 26 L500 22 L505 22 L506 24 L504 25 L506 27 L505 30 L507 31 L503 35 L505 36 L510 32 L509 31 L510 30 L508 30 L507 29 L509 27 L506 25 L510 24 L509 22 L511 23 L511 25 L513 26 L512 24 L515 23 L519 23 L523 24 L521 23 L521 21 L534 20 L532 19 L534 18 L546 16 L553 16 L562 15 L564 13 L569 13 L572 13 L569 14 L574 14 L574 15 L582 15 L588 16 L588 17 L579 20 L586 20 L587 21 L591 20 L598 21 L598 22 L606 22 L607 21 L614 21 L617 22 L618 23 L617 24 L623 26 L625 24 L628 25 L640 25 L638 23 L641 22 L659 24 L666 26 L678 26 L680 27 L679 29 L682 29 L696 29 L699 31 L702 30 L700 29 L701 28 L711 28 L720 30 L720 38 L717 39 L715 39 L719 42 L718 43 L715 43 L707 45 L701 48 L698 47 L693 48 L692 48 L690 49 L687 48 L684 52 L684 52 L686 53 L686 56 L684 56 L683 57 L684 58 L681 59 L680 62 L677 62 L676 64 L674 66 L671 57 L672 54 L674 53 L674 52 L677 52 L687 46 L689 43 L687 43 L685 45 L680 47 L679 44 L673 45 L668 48 L670 50 L663 50 L663 49 L660 49 L657 50 L644 50 L630 59 L633 59 L634 60 L636 60 L638 59 L640 60 L643 62 L643 64 L641 66 L640 71 L630 81 L627 82 L625 81 L622 84 L621 82 L622 82 L623 80 L622 78 L624 77 L626 78 L630 71 L625 72 L622 72 L621 71 L619 69 L615 68 L612 62 L607 61 L602 61 L600 62 L601 63 L601 64 L599 67 L599 68 L596 69 L589 68 L586 69 L581 70 L577 69 L574 67 L567 68 L565 67 L564 65 L558 64 L556 66 L556 67 L555 69 L544 66 L535 70 L534 68 L531 69 L527 66 L524 66 L521 65 L520 66 L516 61 L513 60 L514 59 L507 61 L507 60 L504 59 L502 60 L502 58 L498 57 L490 59 L483 60 L482 61 L483 62 L481 63 L482 63 L480 64 L483 65 L483 66 L480 66 L479 67 L477 66 L474 66 L471 67 L465 65 L462 65 L457 67 L457 68 L455 67 L453 71 L455 73 L456 73 L457 74 L457 75 L458 75Z M542 7 L552 5 L560 8 L560 10 L556 10 L547 9 L545 8 L542 7Z M563 10 L571 11 L570 11 L559 12 L563 10Z M635 16 L643 16 L650 17 L649 18 L638 19 L634 17 L635 16Z M653 17 L661 18 L659 19 L652 18 L653 17Z M640 21 L644 20 L647 22 L644 22 L640 21Z M450 7 L457 6 L457 7 L460 6 L463 7 L455 8 L453 8 L454 7 L450 7Z M405 59 L402 59 L399 59 L400 58 L403 58 L406 58 L405 59Z M467 21 L472 19 L471 18 L482 15 L496 14 L498 15 L483 17 L477 19 L471 23 L471 25 L475 27 L467 26 L467 26 L463 25 L463 24 L465 24 L465 22 L469 21 L467 21Z M645 59 L646 64 L649 70 L646 69 L645 72 L647 74 L647 76 L645 75 L644 76 L644 66 L643 64 L643 61 L645 60 L644 60 L645 59Z M10 34 L10 35 L11 35 L11 34 L16 34 L20 36 L15 37 L15 39 L14 39 L8 38 L8 37 L3 37 L2 37 L3 36 L0 36 L1 37 L0 38 L0 30 L10 34Z M5 25 L0 26 L0 25 L5 25Z M425 77 L427 76 L431 77 L433 77 L433 78 L428 79 L427 79 L427 78 L425 77Z", 96.8, 62.0, "Europe"], "Bahamas": ["M202 114 L204 114 L204 115 L202 115 L202 114Z M204 114 L206 115 L206 116 L205 115 L204 114Z M204 118 L204 118 L205 120 L203 119 L204 118Z", -77.9, 25.5, "North America"], "Falkland Is.": ["M238 272 L240 270 L242 271 L243 270 L244 271 L241 272 L240 272 L239 273 L238 272Z", -59.4, -51.7, "South America"], "Norway": ["M390 9 L391 8 L394 8 L403 10 L398 11 L397 12 L395 13 L394 14 L392 14 L388 13 L389 13 L382 10 L381 9 L386 8 L387 9 L390 9Z M422 29 L417 30 L418 28 L415 28 L412 28 L411 30 L409 31 L405 30 L402 29 L400 30 L400 31 L396 31 L395 32 L394 32 L387 38 L388 39 L387 40 L385 40 L384 42 L384 44 L385 45 L385 48 L382 50 L381 49 L377 51 L374 52 L371 51 L370 44 L381 39 L390 32 L398 28 L406 28 L409 26 L416 26 L423 27 L420 28 L422 29Z M415 8 L412 9 L406 9 L400 9 L395 7 L406 7 L415 8Z M409 12 L405 13 L401 13 L403 12 L402 11 L406 11 L409 12Z", 15.5, 69.2, "Europe"], "Greenland": ["M266 3 L283 1 L306 1 L318 3 L315 3 L296 4 L310 4 L314 4 L316 5 L314 6 L328 4 L334 5 L336 5 L326 7 L320 8 L325 8 L321 10 L321 13 L323 14 L317 15 L320 16 L321 18 L319 18 L321 19 L317 20 L319 20 L318 21 L313 21 L315 23 L315 24 L311 23 L310 23 L316 25 L316 27 L313 27 L309 25 L310 26 L307 28 L315 28 L305 31 L296 32 L292 35 L280 37 L279 38 L278 41 L274 43 L275 44 L273 48 L270 48 L267 46 L263 46 L257 41 L255 38 L253 36 L253 34 L252 34 L254 31 L257 31 L258 28 L253 29 L251 29 L251 26 L257 27 L252 25 L248 25 L251 23 L245 19 L243 18 L243 17 L237 16 L223 16 L217 14 L226 13 L213 12 L214 11 L229 9 L229 8 L224 8 L236 5 L235 4 L246 4 L254 4 L259 3 L271 5 L266 4 L266 3Z", -41.5, 74.8, "North America"], "Fr. S. Antarctic Lands": ["M498 265 L501 266 L501 267 L501 267 L497 268 L498 265Z", 69.5, -49.3, "Seven seas (open ocean)"], "Timor-Leste": ["M610 186 L612 185 L615 185 L610 187 L610 186Z", 126.0, -8.8, "Asia"], "South Africa": ["M393 225 L394 224 L395 226 L397 226 L400 225 L400 218 L402 220 L402 222 L403 221 L407 219 L408 219 L411 219 L412 217 L413 217 L414 215 L419 212 L422 213 L424 217 L424 220 L422 219 L421 221 L423 223 L424 221 L426 221 L424 226 L416 234 L412 236 L405 236 L400 238 L397 236 L396 233 L396 233 L396 231 L393 225Z", 25.0, -28.9, "Africa"], "Lesotho": ["M417 225 L419 227 L416 229 L415 229 L414 228 L416 226 L417 225Z", 28.2, -29.6, "Africa"], "Mexico": ["M126 103 L131 103 L138 105 L144 105 L144 104 L147 104 L152 109 L154 110 L155 108 L157 108 L161 113 L162 115 L166 116 L164 123 L166 127 L168 130 L171 132 L177 130 L178 129 L179 126 L186 125 L186 126 L185 129 L184 131 L183 131 L182 132 L178 132 L178 133 L177 133 L179 136 L177 136 L176 139 L172 136 L171 136 L167 137 L153 131 L149 128 L149 127 L149 127 L149 125 L148 122 L143 118 L141 117 L141 115 L139 114 L139 112 L136 110 L134 106 L130 104 L130 105 L131 108 L137 115 L139 119 L140 119 L141 121 L140 122 L136 119 L135 116 L130 113 L131 113 L132 111 L129 109 L126 103Z", -102.6, 23.9, "North America"], "Uruguay": ["M245 228 L246 228 L252 232 L254 233 L253 234 L253 236 L252 237 L250 238 L248 238 L244 237 L243 236 L245 228Z", -56.0, -32.8, "South America"], "Brazil": ["M253 236 L253 234 L254 233 L252 232 L246 228 L245 228 L253 222 L253 220 L252 219 L251 219 L251 216 L249 216 L248 213 L244 212 L244 208 L245 204 L243 203 L244 201 L240 201 L239 196 L231 193 L229 191 L229 188 L227 188 L223 190 L219 190 L219 187 L217 188 L216 188 L215 187 L214 187 L214 186 L212 183 L214 181 L214 179 L218 177 L220 177 L221 170 L220 167 L221 167 L222 166 L220 166 L220 165 L224 165 L225 164 L226 166 L229 166 L233 164 L231 163 L231 160 L230 160 L234 160 L238 159 L239 158 L240 158 L240 159 L241 160 L240 162 L241 164 L242 165 L245 164 L248 164 L248 163 L254 164 L257 160 L259 164 L260 165 L260 166 L259 168 L259 168 L263 168 L263 170 L264 169 L270 171 L271 172 L271 173 L273 173 L280 174 L286 178 L289 178 L291 183 L290 186 L283 194 L281 204 L278 212 L276 213 L276 214 L271 215 L265 218 L263 220 L262 225 L253 236Z", -53.1, -10.8, "South America"], "Bolivia": ["M221 190 L223 190 L227 188 L229 188 L229 191 L231 193 L239 196 L240 201 L244 201 L243 203 L245 204 L244 208 L244 208 L242 207 L236 207 L235 212 L232 212 L231 214 L230 212 L227 212 L226 213 L224 214 L222 209 L223 207 L221 203 L222 201 L221 198 L223 193 L221 190Z", -64.6, -16.7, "South America"], "Peru": ["M220 177 L218 177 L214 179 L214 181 L212 183 L214 186 L214 187 L215 187 L216 188 L217 188 L219 187 L219 190 L221 190 L223 193 L221 198 L222 201 L220 204 L219 205 L208 197 L207 195 L200 182 L198 180 L198 179 L197 177 L199 175 L199 177 L201 177 L202 178 L203 177 L204 174 L207 173 L209 171 L210 168 L213 171 L214 173 L218 173 L220 173 L219 175 L220 177Z", -74.4, -9.2, "South America"], "Colombia": ["M226 165 L225 164 L224 165 L220 165 L220 166 L222 166 L221 167 L220 167 L221 170 L220 177 L219 175 L220 173 L218 173 L214 173 L213 171 L210 168 L205 167 L202 165 L206 160 L205 160 L205 156 L204 154 L206 152 L205 151 L209 149 L209 147 L210 146 L213 146 L217 143 L217 144 L216 145 L214 147 L213 150 L214 150 L215 153 L216 154 L220 154 L221 156 L225 156 L224 159 L225 161 L224 162 L226 165Z", -73.1, 3.9, "South America"], "Panama": ["M205 151 L206 152 L204 154 L203 152 L204 151 L202 150 L199 151 L200 153 L198 154 L198 152 L197 153 L197 152 L194 152 L194 149 L197 150 L202 149 L205 151Z", -80.1, 8.5, "North America"], "Costa Rica": ["M195 149 L194 149 L194 152 L190 148 L190 149 L189 148 L188 146 L189 146 L193 146 L195 149Z", -84.2, 10.0, "North America"], "Nicaragua": ["M193 146 L189 146 L185 142 L187 141 L186 140 L188 140 L190 138 L194 138 L192 145 L193 146Z", -85.0, 12.8, "North America"], "Honduras": ["M194 138 L190 138 L188 140 L186 140 L187 141 L185 142 L184 140 L183 140 L181 139 L182 138 L184 136 L190 136 L194 138Z", -86.6, 14.8, "North America"], "El Salvador": ["M181 139 L185 140 L184 142 L180 141 L181 139Z", -88.9, 13.7, "North America"], "Guatemala": ["M176 139 L177 136 L179 136 L177 133 L178 133 L178 132 L182 132 L182 136 L184 137 L182 138 L181 139 L180 141 L176 139Z", -90.4, 15.7, "North America"], "Belize": ["M182 132 L183 131 L184 131 L183 135 L182 136 L182 136 L182 132Z", -88.7, 17.2, "North America"], "Venezuela": ["M239 158 L238 159 L234 160 L230 160 L231 160 L231 163 L233 164 L229 166 L227 167 L224 162 L225 161 L224 159 L225 156 L221 156 L220 154 L216 154 L215 153 L214 150 L213 150 L214 147 L216 145 L217 144 L216 145 L217 147 L216 148 L217 150 L217 150 L218 148 L217 146 L220 145 L219 144 L220 144 L221 145 L222 145 L224 147 L228 147 L230 148 L231 147 L236 147 L235 147 L235 148 L238 149 L239 151 L240 151 L239 152 L239 154 L238 155 L237 156 L239 158Z", -66.2, 7.2, "South America"], "Guyana": ["M247 164 L245 164 L243 165 L241 164 L240 162 L241 160 L240 159 L240 158 L239 158 L237 156 L238 155 L239 154 L239 152 L240 151 L246 156 L244 160 L247 164Z", -59.0, 4.8, "South America"], "Suriname": ["M251 163 L248 163 L248 164 L247 164 L245 161 L245 161 L244 160 L246 156 L252 156 L251 158 L252 161 L251 163Z", -55.9, 4.1, "South America"], "France": ["M257 160 L254 164 L251 163 L252 161 L251 158 L252 156 L254 157 L257 160Z M369 68 L376 70 L375 73 L373 73 L372 75 L372 75 L373 75 L374 76 L374 77 L373 78 L374 79 L375 80 L375 81 L373 82 L369 81 L366 82 L366 83 L364 83 L357 82 L356 81 L357 80 L358 76 L354 73 L351 72 L351 71 L357 71 L356 68 L358 69 L363 68 L363 66 L365 66 L369 68Z M377 83 L379 82 L379 84 L378 85 L378 85 L377 83Z", -2.9, 42.5, "Europe"], "Ecuador": ["M209 168 L209 171 L207 173 L204 174 L203 177 L202 178 L201 177 L199 177 L200 173 L200 172 L199 173 L198 172 L198 170 L199 170 L200 166 L202 165 L205 167 L207 167 L209 168Z", -78.4, -1.5, "South America"], "Puerto Rico": ["M226 131 L229 132 L226 132 L226 131Z", -66.5, 18.2, "North America"], "Jamaica": ["M203 132 L206 131 L208 132 L206 133 L203 132Z", -77.3, 18.1, "North America"], "Cuba": ["M192 122 L199 122 L201 123 L203 123 L207 126 L209 126 L209 127 L212 127 L210 128 L204 128 L206 127 L204 127 L203 125 L196 123 L196 123 L194 123 L192 124 L190 124 L192 122Z", -79.0, 21.6, "North America"], "Zimbabwe": ["M422 213 L419 212 L416 211 L415 209 L412 207 L411 203 L414 204 L418 200 L421 199 L421 200 L422 200 L426 201 L425 209 L422 213Z", 29.8, -18.9, "Africa"], "Botswana": ["M419 212 L414 215 L413 217 L412 217 L411 219 L408 219 L407 219 L403 221 L402 222 L402 220 L400 218 L400 212 L402 212 L402 205 L406 204 L407 205 L411 203 L412 207 L415 209 L416 211 L419 212Z", 23.8, -22.1, "Africa"], "Namibia": ["M400 212 L400 225 L397 226 L395 226 L394 224 L393 225 L390 222 L389 212 L384 204 L383 203 L387 202 L388 203 L397 203 L398 204 L403 204 L408 203 L410 203 L407 205 L406 204 L402 205 L402 212 L400 212Z", 17.2, -22.1, "Africa"], "Senegal": ["M327 141 L325 139 L328 135 L331 135 L333 136 L336 139 L337 143 L327 143 L326 142 L332 141 L330 140 L327 141Z", -14.5, 14.4, "Africa"], "Mali": ["M337 144 L336 139 L337 137 L339 138 L341 137 L349 137 L349 136 L347 118 L350 118 L366 129 L366 130 L369 130 L369 134 L367 137 L363 137 L362 138 L358 138 L354 141 L352 141 L350 145 L349 147 L344 148 L342 143 L340 144 L337 144Z", -3.5, 17.3, "Africa"], "Mauritania": ["M326 126 L326 125 L334 125 L334 121 L336 121 L336 116 L343 116 L343 113 L350 118 L347 118 L349 136 L349 137 L341 137 L339 138 L337 137 L336 139 L333 136 L331 135 L327 136 L327 128 L326 126Z", -10.3, 20.2, "Africa"], "Benin": ["M365 155 L364 156 L363 150 L362 147 L363 145 L366 144 L367 145 L368 147 L365 151 L365 155Z", 2.3, 9.6, "Africa"], "Niger": ["M390 122 L390 125 L392 127 L390 135 L388 137 L387 139 L388 141 L389 141 L388 143 L386 141 L385 142 L382 141 L378 142 L376 141 L374 142 L371 140 L368 141 L367 145 L366 144 L364 144 L364 143 L362 142 L361 138 L367 137 L369 134 L369 130 L371 129 L384 121 L387 122 L388 123 L390 122Z", 9.3, 17.3, "Africa"], "Nigeria": ["M365 155 L365 151 L367 148 L367 143 L369 141 L371 140 L374 142 L376 141 L378 142 L382 141 L385 142 L386 141 L389 144 L387 146 L383 154 L382 155 L380 154 L378 155 L377 158 L372 159 L369 155 L365 155Z", 8.0, 9.5, "Africa"], "Cameroon": ["M389 142 L391 148 L388 148 L388 149 L390 150 L391 153 L389 156 L389 159 L392 162 L392 165 L389 164 L379 163 L380 162 L377 159 L378 157 L378 155 L380 154 L382 155 L383 154 L387 146 L389 145 L389 144 L388 143 L389 142Z", 12.6, 5.7, "Africa"], "Togo": ["M362 146 L362 147 L363 150 L364 156 L362 156 L361 154 L361 148 L360 147 L360 146 L362 146Z", 1.0, 8.4, "Africa"], "Ghana": ["M360 146 L361 151 L361 154 L362 156 L356 159 L354 158 L354 155 L355 152 L354 146 L360 146Z", -1.2, 7.9, "Africa"], "C\u00f4te d'Ivoire": ["M344 148 L346 148 L348 147 L348 148 L349 147 L351 149 L353 148 L354 149 L355 152 L354 155 L354 158 L351 158 L345 159 L345 157 L343 155 L343 151 L344 151 L343 148 L344 148Z", -5.6, 7.6, "Africa"], "Guinea": ["M333 143 L337 143 L337 144 L340 144 L342 143 L344 148 L343 148 L344 151 L343 151 L343 153 L342 153 L340 151 L339 151 L338 148 L335 148 L334 150 L330 146 L333 144 L333 143Z", -11.1, 10.4, "Africa"], "Guinea-Bissau": ["M327 143 L333 143 L333 144 L330 146 L328 145 L327 143Z", -15.1, 12.0, "Africa"], "Liberia": ["M343 153 L343 155 L345 157 L345 159 L342 158 L337 154 L340 151 L340 151 L342 153 L343 153Z", -9.4, 6.4, "Africa"], "Sierra Leone": ["M334 150 L335 148 L338 148 L339 151 L340 151 L337 154 L334 152 L334 150Z", -11.8, 8.5, "Africa"], "Burkina Faso": ["M349 147 L350 145 L351 142 L354 141 L358 138 L361 138 L362 142 L364 143 L364 145 L362 146 L354 146 L354 149 L353 148 L351 149 L349 147Z", -1.8, 12.3, "Africa"], "Central African Rep.": ["M415 158 L409 158 L406 159 L405 160 L399 158 L397 160 L397 161 L394 161 L392 163 L392 162 L389 159 L389 157 L391 153 L396 152 L398 151 L398 150 L402 149 L403 147 L406 146 L407 148 L407 150 L410 152 L415 158Z", 20.4, 6.5, "Africa"], "Congo": ["M397 161 L395 169 L393 171 L392 175 L389 178 L388 177 L387 178 L385 177 L384 178 L382 176 L384 175 L383 174 L385 173 L385 172 L386 173 L388 173 L389 171 L388 168 L389 166 L387 165 L386 163 L392 165 L394 161 L397 161Z", 15.1, -0.8, "Africa"], "Gabon": ["M383 163 L386 163 L387 165 L389 166 L388 168 L389 171 L388 173 L386 173 L385 172 L385 173 L383 174 L384 175 L382 176 L378 170 L379 166 L383 166 L383 163Z", 11.7, -0.6, "Africa"], "Eq. Guinea": ["M379 163 L383 163 L383 166 L379 166 L379 163Z", 10.4, 1.6, "Africa"], "Zambia": ["M421 185 L426 187 L427 193 L425 195 L426 196 L420 198 L421 199 L418 200 L414 204 L409 203 L406 203 L404 200 L404 194 L408 194 L408 190 L411 191 L412 192 L414 191 L418 194 L419 195 L419 192 L419 193 L417 192 L417 186 L418 185 L421 185Z", 27.7, -13.4, "Africa"], "Malawi": ["M426 186 L427 187 L429 188 L429 195 L431 196 L431 197 L432 200 L430 202 L429 200 L429 197 L425 195 L427 193 L426 191 L427 189 L426 186Z", 34.2, -13.2, "Africa"], "Mozambique": ["M429 191 L435 191 L441 189 L442 197 L439 201 L435 203 L430 208 L429 209 L431 212 L431 216 L426 219 L425 219 L426 221 L424 221 L424 217 L422 213 L425 209 L426 201 L422 200 L421 200 L420 198 L426 196 L429 197 L429 200 L430 202 L432 200 L431 197 L431 196 L429 195 L429 193 L429 191Z", 35.5, -17.2, "Africa"], "eSwatini": ["M424 221 L423 223 L421 221 L422 219 L424 220 L424 221Z", 31.4, -26.5, "Africa"], "Angola": ["M386 178 L385 178 L384 180 L384 178 L385 177 L386 178Z M385 180 L393 180 L395 184 L398 184 L399 182 L400 182 L401 182 L401 183 L403 183 L404 190 L407 190 L408 190 L408 194 L404 194 L404 200 L406 203 L403 204 L398 204 L397 203 L388 203 L387 202 L383 203 L384 197 L387 191 L386 186 L386 185 L385 180Z", 17.5, -12.2, "Africa"], "Burundi": ["M421 173 L422 175 L419 177 L418 174 L421 173Z", 29.9, -3.4, "Africa"], "Israel": ["M431 103 L430 103 L430 104 L430 104 L430 105 L431 105 L431 106 L430 109 L429 106 L430 102 L432 101 L431 103Z", 35.0, 31.5, "Asia"], "Lebanon": ["M432 101 L430 102 L432 99 L433 99 L433 100 L432 101Z", 35.9, 33.9, "Asia"], "Madagascar": ["M458 192 L461 199 L460 200 L460 199 L459 199 L460 202 L454 218 L451 219 L448 218 L447 214 L447 211 L448 210 L449 207 L448 203 L449 200 L453 200 L455 197 L456 195 L457 196 L458 192Z", 46.7, -19.4, "Africa"], "Palestine": ["M431 105 L430 105 L430 103 L431 103 L431 105Z", 35.3, 31.9, "Asia"], "Gambia": ["M327 141 L330 140 L332 141 L326 142 L327 141Z", -15.4, 13.5, "Africa"], "Tunisia": ["M379 107 L378 104 L375 101 L375 100 L376 99 L377 94 L379 93 L380 94 L380 95 L382 94 L381 95 L382 98 L380 99 L381 100 L383 102 L383 103 L380 105 L380 107 L379 107Z", 9.5, 34.2, "Africa"], "Algeria": ["M343 113 L343 110 L350 108 L353 106 L353 105 L357 103 L358 103 L356 98 L358 97 L363 95 L371 95 L373 94 L377 94 L376 99 L375 100 L375 101 L378 104 L380 109 L379 115 L379 116 L381 119 L382 119 L384 121 L371 129 L366 130 L366 129 L343 113Z", 2.6, 28.2, "Africa"], "Jordan": ["M430 109 L431 103 L434 103 L438 101 L438 104 L434 105 L436 107 L432 110 L430 109Z", 36.8, 31.2, "Asia"], "United Arab Emirates": ["M463 120 L468 120 L472 116 L473 117 L473 118 L472 118 L472 120 L471 120 L470 123 L464 122 L463 120Z", 54.2, 23.9, "Asia"], "Qatar": ["M462 118 L461 117 L463 116 L463 118 L463 119 L462 118Z", 51.2, 25.3, "Asia"], "Kuwait": ["M456 108 L457 111 L453 110 L455 108 L456 108Z", 47.6, 29.3, "Asia"], "Iraq": ["M438 104 L438 101 L442 99 L443 95 L446 93 L450 94 L451 96 L452 97 L452 98 L451 100 L452 102 L455 103 L456 105 L455 106 L457 108 L455 108 L453 110 L449 110 L444 106 L438 104Z", 43.8, 33.0, "Asia"], "Oman": ["M470 123 L471 120 L472 120 L472 118 L473 118 L475 120 L477 121 L480 123 L477 127 L476 128 L475 130 L473 131 L473 132 L471 132 L470 134 L466 135 L464 130 L470 128 L471 124 L470 123Z M473 117 L472 116 L473 115 L473 115 L473 117Z", 56.1, 20.6, "Asia"], "Vanuatu": ["M694 200 L696 201 L695 201 L694 200Z M695 199 L693 199 L693 197 L694 198 L695 199Z", 167.1, -15.5, "Oceania"], "Cambodia": ["M567 147 L565 141 L566 140 L569 139 L572 140 L573 139 L575 140 L575 141 L575 143 L572 145 L572 146 L567 147Z", 104.9, 12.7, "Asia"], "Thailand": ["M570 139 L566 140 L565 141 L565 144 L562 143 L562 141 L560 141 L558 150 L560 150 L561 153 L564 156 L562 157 L562 156 L560 155 L557 151 L557 152 L556 151 L559 144 L558 140 L556 138 L558 136 L555 131 L557 129 L560 127 L561 129 L563 129 L562 133 L564 132 L566 132 L566 131 L568 132 L569 133 L570 135 L571 137 L570 139Z", 101.0, 15.0, "Asia"], "Laos": ["M575 140 L573 139 L572 140 L570 139 L571 137 L568 132 L564 132 L562 133 L563 129 L561 129 L560 127 L562 125 L564 126 L563 123 L564 123 L566 126 L569 126 L570 128 L568 129 L570 131 L575 136 L575 140Z", 103.8, 18.4, "Asia"], "Myanmar": ["M560 127 L557 129 L555 131 L558 136 L556 138 L558 140 L559 144 L557 148 L557 142 L554 134 L551 137 L548 136 L549 133 L549 132 L547 129 L547 129 L545 127 L545 125 L545 125 L545 124 L546 123 L547 120 L548 120 L550 115 L553 113 L554 114 L555 111 L556 111 L557 113 L557 116 L555 118 L555 120 L557 120 L558 122 L559 122 L558 124 L561 125 L562 124 L562 125 L560 127Z", 96.5, 21.0, "Asia"], "Vietnam": ["M569 147 L572 146 L572 145 L575 143 L575 138 L570 131 L568 129 L570 128 L569 126 L566 126 L564 123 L569 122 L571 121 L573 122 L573 124 L574 124 L576 125 L573 127 L571 130 L578 137 L579 141 L578 145 L570 151 L570 150 L570 148 L569 147Z", 106.3, 16.7, "Asia"], "North Korea": ["M621 83 L619 85 L619 86 L615 88 L615 90 L617 91 L616 91 L611 93 L609 92 L611 89 L609 88 L610 87 L614 84 L616 85 L616 84 L619 83 L620 82 L621 83Z", 127.2, 40.1, "Asia"], "South Korea": ["M612 93 L617 91 L619 94 L619 97 L618 98 L613 99 L613 97 L612 95 L614 94 L612 93Z", 127.8, 36.4, "Asia"], "Mongolia": ["M536 69 L544 66 L555 69 L556 67 L556 66 L558 64 L564 65 L565 67 L567 68 L574 67 L577 69 L581 70 L586 69 L589 68 L591 68 L593 68 L591 72 L591 73 L595 73 L596 72 L600 74 L599 75 L595 75 L587 78 L584 78 L583 79 L584 81 L581 82 L572 84 L570 85 L562 83 L553 83 L551 80 L547 78 L542 77 L541 77 L542 74 L541 73 L536 71 L536 69Z", 102.9, 46.8, "Asia"], "India": ["M555 111 L554 114 L553 113 L550 115 L548 120 L547 120 L546 123 L545 124 L544 121 L543 122 L542 121 L545 118 L540 117 L540 116 L537 115 L536 116 L538 118 L536 119 L537 120 L538 125 L534 125 L534 127 L533 128 L530 129 L524 134 L524 135 L521 136 L520 147 L519 147 L518 149 L518 150 L517 150 L515 152 L513 150 L510 143 L509 139 L507 136 L505 125 L502 126 L501 126 L498 124 L499 123 L499 122 L496 121 L498 119 L502 119 L500 115 L499 114 L501 112 L504 112 L509 106 L509 105 L511 103 L509 102 L507 99 L508 99 L514 99 L516 97 L518 99 L518 101 L518 102 L518 103 L517 103 L517 105 L522 108 L520 110 L527 113 L536 115 L536 112 L537 112 L538 114 L539 115 L544 114 L544 113 L543 112 L545 112 L549 109 L551 110 L552 109 L553 110 L552 111 L555 111Z", 79.6, 22.9, "Asia"], "Bangladesh": ["M545 124 L545 127 L543 122 L541 122 L541 124 L538 124 L537 121 L537 120 L536 119 L538 118 L536 116 L537 115 L540 116 L540 117 L545 118 L542 121 L543 122 L544 121 L545 124Z", 90.3, 23.8, "Asia"], "Bhutan": ["M540 111 L544 113 L544 114 L539 115 L538 114 L540 111Z", 90.5, 27.4, "Asia"], "Nepal": ["M536 112 L536 115 L534 115 L527 113 L520 110 L521 109 L523 107 L532 112 L536 112Z", 84.0, 28.2, "Asia"], "Pakistan": ["M516 97 L514 99 L508 99 L507 99 L509 102 L511 103 L509 105 L509 106 L504 112 L501 112 L499 114 L500 115 L502 119 L498 119 L496 121 L495 120 L493 117 L483 118 L484 116 L487 114 L486 113 L485 111 L484 111 L482 108 L485 109 L493 108 L493 107 L494 105 L499 104 L499 103 L501 101 L500 100 L502 100 L503 98 L503 96 L504 95 L510 94 L512 95 L512 96 L516 97Z", 69.4, 30.0, "Asia"], "Afghanistan": ["M491 93 L498 94 L499 93 L500 93 L502 91 L503 91 L503 94 L504 95 L507 93 L510 94 L504 95 L503 96 L503 98 L502 100 L500 100 L501 101 L499 103 L499 104 L494 105 L493 107 L493 108 L485 109 L482 108 L484 107 L483 105 L482 105 L481 102 L482 101 L481 101 L482 97 L486 97 L486 96 L489 95 L489 94 L491 93Z", 66.1, 33.9, "Asia"], "Tajikistan": ["M496 94 L497 92 L496 90 L495 90 L495 89 L497 89 L499 87 L501 86 L501 87 L502 88 L501 88 L499 88 L499 89 L507 89 L508 91 L510 91 L510 93 L507 93 L504 95 L503 94 L503 91 L502 91 L500 93 L499 93 L498 94 L496 94Z", 71.0, 38.6, "Asia"], "Kyrgyzstan": ["M502 83 L504 82 L507 83 L507 82 L508 81 L511 82 L518 82 L521 83 L516 86 L514 86 L513 87 L510 87 L508 88 L507 89 L499 89 L499 88 L504 88 L506 86 L501 85 L503 84 L502 83Z", 74.6, 41.5, "Asia"], "Turkmenistan": ["M465 84 L468 83 L471 85 L474 85 L474 84 L477 82 L480 84 L480 85 L481 86 L484 86 L485 88 L488 90 L493 92 L493 93 L491 93 L489 94 L489 95 L484 97 L482 97 L482 95 L475 92 L471 92 L468 94 L468 90 L466 89 L467 88 L465 88 L466 86 L468 87 L469 86 L467 84 L466 84 L466 86 L465 84Z", 59.3, 39.1, "Asia"], "Iran": ["M457 108 L455 106 L456 105 L455 103 L452 102 L451 100 L452 98 L452 97 L451 96 L448 92 L448 89 L450 89 L451 90 L452 91 L456 89 L457 89 L456 90 L458 91 L458 93 L462 94 L468 94 L471 92 L473 92 L482 95 L482 97 L481 101 L482 101 L481 102 L482 105 L483 105 L484 107 L482 108 L484 111 L485 111 L486 113 L487 114 L484 116 L483 118 L475 117 L474 114 L473 114 L469 115 L467 114 L463 112 L460 108 L458 107 L457 108Z", 54.3, 32.5, "Asia"], "Syria": ["M431 103 L432 100 L433 100 L432 99 L432 97 L433 94 L439 95 L445 94 L443 95 L442 99 L434 103 L431 103Z", 38.5, 35.0, "Asia"], "Armenia": ["M453 90 L452 91 L451 89 L447 87 L447 86 L450 86 L451 86 L451 87 L452 88 L451 88 L453 89 L453 90Z", 45.0, 40.2, "Asia"], "Sweden": ["M382 50 L385 48 L385 45 L384 44 L384 42 L385 40 L387 40 L388 39 L387 38 L394 32 L395 32 L396 31 L400 31 L400 30 L401 30 L407 32 L407 35 L408 36 L404 37 L402 38 L403 39 L396 43 L394 45 L398 48 L396 50 L394 51 L392 56 L389 56 L388 57 L386 57 L382 50Z", 16.6, 62.8, "Europe"], "Belarus": ["M416 56 L422 57 L422 58 L425 61 L423 62 L424 64 L422 64 L421 65 L411 64 L407 65 L406 63 L408 63 L407 60 L411 59 L412 58 L413 58 L413 57 L416 56Z", 28.0, 53.5, "Europe"], "Ukraine": ["M422 64 L428 63 L429 64 L428 65 L430 66 L431 67 L440 69 L439 72 L438 72 L436 74 L430 75 L430 77 L423 75 L423 75 L421 75 L419 77 L417 77 L416 77 L418 75 L420 75 L417 72 L415 71 L410 73 L405 72 L404 71 L406 70 L405 69 L408 67 L407 65 L411 64 L421 65 L422 64Z", 31.2, 49.1, "Europe"], "Poland": ["M407 60 L408 63 L406 63 L408 67 L405 69 L406 70 L403 69 L400 70 L395 67 L392 67 L392 67 L390 66 L388 62 L389 62 L388 60 L395 58 L397 59 L405 59 L407 60Z", 19.3, 52.1, "Europe"], "Austria": ["M394 71 L394 73 L393 73 L393 73 L392 75 L389 75 L385 74 L384 74 L382 74 L379 74 L380 73 L381 73 L384 73 L386 73 L386 71 L387 70 L389 71 L391 70 L393 70 L394 71Z", 14.1, 47.6, "Europe"], "Hungary": ["M404 71 L405 72 L404 73 L402 75 L397 76 L392 74 L393 73 L394 73 L394 72 L396 72 L402 71 L404 71Z", 19.4, 47.2, "Europe"], "Moldova": ["M413 72 L415 71 L417 72 L420 75 L418 75 L416 77 L416 74 L413 72Z", 28.4, 47.2, "Europe"], "Romania": ["M416 77 L419 77 L418 78 L417 81 L414 80 L411 81 L406 80 L405 79 L405 79 L403 78 L400 76 L402 75 L404 73 L406 72 L410 73 L413 72 L416 74 L416 77Z", 24.9, 45.9, "Europe"], "Lithuania": ["M413 57 L413 58 L412 58 L411 59 L407 60 L405 59 L406 58 L403 58 L402 56 L410 55 L413 57Z", 23.9, 55.3, "Europe"], "Latvia": ["M410 52 L416 54 L416 56 L413 57 L410 55 L402 56 L403 53 L405 52 L407 54 L408 54 L409 52 L410 52Z", 24.8, 56.8, "Europe"], "Estonia": ["M416 49 L415 51 L415 52 L415 53 L410 52 L409 52 L409 51 L407 51 L407 50 L412 49 L416 49Z", 25.8, 58.6, "Europe"], "Germany": ["M388 60 L389 62 L388 62 L390 66 L384 67 L385 69 L387 70 L386 71 L386 73 L375 73 L376 70 L373 70 L372 68 L372 64 L374 64 L374 61 L376 61 L378 60 L377 58 L380 58 L380 59 L382 59 L382 60 L385 59 L388 60Z", 10.3, 51.1, "Europe"], "Bulgaria": ["M405 80 L406 80 L411 81 L414 80 L417 81 L415 83 L416 84 L412 84 L412 85 L409 85 L406 85 L406 84 L405 83 L406 82 L405 81 L405 80Z", 25.2, 42.8, "Europe"], "Greece": ["M413 97 L412 98 L409 98 L407 97 L407 97 L413 97Z M402 86 L409 85 L412 85 L412 84 L413 85 L412 86 L407 87 L409 88 L405 87 L407 90 L406 90 L408 92 L408 93 L406 92 L407 93 L406 93 L406 95 L405 95 L403 94 L400 89 L402 86Z", 22.7, 39.1, "Europe"], "Turkey": ["M450 94 L446 93 L439 95 L433 94 L432 96 L432 95 L432 95 L429 94 L428 96 L425 96 L423 95 L421 95 L419 96 L417 95 L415 95 L413 92 L414 90 L412 89 L415 87 L418 87 L418 86 L422 86 L427 84 L430 84 L437 86 L445 85 L447 86 L447 87 L450 89 L448 89 L448 92 L450 94Z M412 84 L416 84 L418 85 L415 86 L413 88 L412 86 L413 85 L412 84Z", 35.1, 39.1, "Asia"], "Albania": ["M402 86 L400 89 L399 87 L399 84 L399 83 L401 84 L401 86 L402 86Z", 20.0, 41.1, "Europe"], "Croatia": ["M393 75 L395 76 L398 76 L399 78 L398 78 L392 78 L392 78 L397 83 L392 81 L390 80 L390 78 L389 78 L388 78 L387 78 L387 77 L391 77 L392 76 L393 75Z", 16.6, 45.0, "Europe"], "Switzerland": ["M379 73 L379 74 L381 74 L381 75 L375 76 L373 75 L372 75 L373 73 L377 72 L379 73Z", 8.1, 46.8, "Europe"], "Luxembourg": ["M372 68 L372 69 L371 69 L372 68Z", 6.0, 49.8, "Europe"], "Belgium": ["M372 66 L371 69 L369 68 L365 66 L370 65 L372 66Z", 4.6, 50.7, "Europe"], "Netherlands": ["M374 61 L374 64 L372 64 L372 66 L370 65 L367 65 L369 62 L374 61Z", 5.5, 52.3, "Europe"], "Portugal": ["M342 84 L343 83 L344 84 L347 84 L347 85 L346 86 L346 89 L345 89 L346 92 L344 94 L342 94 L342 91 L341 91 L342 86 L342 84Z", -8.1, 39.6, "Europe"], "Spain": ["M345 94 L346 92 L345 89 L346 89 L346 86 L347 85 L347 84 L344 84 L343 83 L342 84 L342 83 L341 82 L344 81 L356 81 L361 83 L366 83 L366 84 L364 86 L362 86 L359 89 L360 91 L359 93 L357 93 L356 95 L351 95 L349 96 L348 96 L347 94 L345 94Z", -3.6, 40.3, "Europe"], "Ireland": ["M348 60 L348 62 L346 63 L343 65 L340 64 L342 62 L341 60 L345 58 L345 60 L348 60Z", -8.0, 53.2, "Europe"], "New Caledonia": ["M688 208 L694 212 L693 213 L691 211 L688 208Z", 165.5, -21.3, "Oceania"], "Solomon Is.": ["M683 188 L685 190 L683 190 L683 188Z M682 185 L683 188 L681 185 L682 185Z M682 188 L680 188 L679 186 L681 187 L682 188Z M677 183 L680 185 L676 183 L677 183Z", 160.0, -8.9, "Oceania"], "New Zealand": ["M714 246 L712 251 L710 251 L709 251 L710 249 L710 248 L708 247 L709 246 L709 243 L705 237 L709 239 L711 242 L711 241 L712 242 L712 243 L715 244 L717 243 L716 246 L714 246Z M694 258 L702 253 L706 249 L706 251 L708 250 L708 251 L708 252 L705 255 L706 256 L703 256 L701 260 L699 261 L693 260 L693 260 L694 258Z", 172.7, -41.7, "Oceania"], "Australia": ["M653 250 L657 250 L657 252 L656 254 L655 254 L654 255 L652 255 L649 249 L653 250Z M612 232 L608 234 L607 236 L600 236 L596 238 L593 238 L590 236 L590 235 L591 235 L592 232 L590 227 L587 220 L588 221 L587 219 L588 221 L587 217 L587 213 L588 212 L588 213 L589 212 L593 209 L602 207 L604 204 L605 203 L606 201 L607 203 L608 202 L607 201 L608 200 L609 201 L609 199 L611 196 L614 196 L617 198 L619 198 L619 197 L621 193 L625 192 L625 191 L624 191 L625 190 L631 192 L633 192 L634 193 L632 195 L631 198 L640 203 L642 203 L643 201 L643 198 L643 193 L645 189 L648 197 L649 196 L651 198 L653 206 L658 209 L659 213 L661 213 L662 215 L666 219 L666 223 L667 224 L666 231 L661 239 L660 243 L657 244 L653 246 L650 245 L650 244 L647 246 L641 244 L640 243 L639 240 L636 239 L637 238 L636 237 L635 238 L634 239 L636 235 L636 234 L633 236 L632 238 L630 237 L630 236 L628 234 L629 233 L623 231 L612 232Z", 134.5, -25.7, "Oceania"], "Sri Lanka": ["M524 153 L523 155 L521 156 L519 152 L520 148 L524 153Z", 80.7, 7.7, "Asia"], "China": ["M579 132 L577 131 L577 129 L578 128 L582 128 L582 129 L581 131 L579 132Z M521 83 L520 82 L522 82 L520 78 L525 77 L526 73 L530 74 L531 73 L532 71 L536 69 L536 71 L541 73 L542 74 L541 77 L542 77 L547 78 L551 80 L553 83 L562 83 L570 85 L572 84 L578 83 L584 81 L583 79 L584 78 L587 78 L595 75 L599 75 L600 74 L596 72 L595 73 L591 73 L591 72 L593 68 L596 69 L599 68 L599 67 L601 64 L601 63 L600 62 L604 61 L607 61 L612 62 L615 68 L619 69 L621 71 L622 72 L625 72 L630 71 L626 78 L624 77 L622 78 L622 82 L621 82 L621 83 L620 82 L619 83 L616 84 L616 85 L614 84 L609 88 L602 90 L604 87 L603 86 L598 89 L596 90 L595 91 L599 94 L602 92 L605 93 L605 94 L602 95 L598 98 L600 99 L604 105 L604 106 L603 107 L604 108 L603 112 L602 112 L597 119 L592 122 L588 124 L588 123 L586 124 L582 125 L581 127 L580 127 L580 125 L574 124 L573 124 L573 122 L571 121 L569 122 L563 123 L564 126 L563 126 L562 124 L561 125 L558 124 L559 122 L558 122 L557 120 L555 120 L555 118 L557 116 L557 113 L556 111 L552 111 L553 110 L552 109 L551 110 L549 109 L545 112 L543 112 L540 111 L538 113 L537 112 L532 112 L525 108 L523 107 L522 108 L517 105 L517 103 L518 103 L518 102 L518 101 L518 99 L516 97 L512 96 L510 93 L510 91 L508 91 L507 89 L508 88 L510 87 L513 87 L514 86 L516 86 L521 83Z", 103.9, 36.6, "Asia"], "Taiwan": ["M604 118 L602 122 L601 124 L600 121 L603 117 L604 118Z", 121.0, 23.7, "Asia"], "Italy": ["M381 74 L384 74 L388 75 L388 77 L385 77 L385 80 L390 84 L392 84 L392 85 L392 85 L397 87 L397 88 L394 87 L393 88 L394 89 L394 90 L391 92 L392 90 L391 88 L382 83 L381 82 L380 80 L378 79 L375 81 L375 80 L374 79 L373 78 L374 77 L374 76 L378 76 L378 75 L381 75 L381 74Z M385 92 L391 92 L390 95 L385 93 L385 92Z M376 86 L378 86 L380 87 L379 90 L378 90 L377 90 L376 86Z", 12.1, 42.8, "Europe"], "Denmark": ["M380 58 L377 58 L376 55 L377 54 L381 53 L381 54 L382 55 L379 57 L380 58Z M385 56 L385 57 L384 58 L382 57 L382 56 L385 56Z", 9.9, 56.1, "Europe"], "United Kingdom": ["M348 60 L345 60 L345 58 L347 58 L349 59 L348 60Z M354 61 L354 60 L353 59 L350 58 L351 57 L350 56 L349 57 L349 55 L348 54 L350 51 L354 51 L352 53 L356 53 L354 56 L356 56 L358 59 L359 59 L361 62 L363 63 L363 64 L362 64 L363 65 L361 66 L354 67 L353 68 L348 68 L353 65 L350 65 L349 64 L352 63 L350 62 L351 61 L354 61Z", -2.9, 53.9, "Europe"], "Iceland": ["M331 35 L331 36 L333 38 L330 39 L323 41 L314 40 L316 39 L312 38 L316 38 L316 37 L311 37 L313 35 L316 35 L319 37 L322 35 L324 36 L328 35 L331 35Z", -18.8, 65.1, "Europe"], "Azerbaijan": ["M452 85 L456 86 L457 84 L459 87 L461 87 L459 88 L458 91 L456 90 L457 89 L456 89 L453 90 L453 89 L451 88 L452 88 L450 86 L453 86 L452 85Z M452 91 L451 90 L450 89 L451 89 L452 91Z", 47.6, 40.2, "Asia"], "Georgia": ["M440 81 L451 83 L453 84 L452 85 L453 86 L450 85 L447 86 L445 85 L443 85 L443 83 L440 81Z", 43.5, 42.2, "Asia"], "Philippines": ["M603 144 L601 141 L603 142 L603 144Z M605 149 L606 146 L607 146 L607 147 L608 146 L608 147 L606 150 L605 149Z M612 149 L613 154 L612 155 L612 153 L611 154 L611 156 L611 157 L608 156 L608 154 L608 153 L607 152 L604 154 L604 154 L605 152 L607 151 L608 152 L609 151 L610 150 L611 150 L611 148 L612 149Z M599 147 L594 151 L599 145 L599 147Z M605 132 L605 134 L605 135 L603 136 L603 139 L608 140 L608 143 L606 141 L605 142 L604 140 L601 140 L602 139 L601 138 L601 139 L600 137 L600 135 L601 136 L601 131 L605 132Z M604 147 L604 144 L606 145 L606 146 L604 147Z M610 143 L612 146 L610 145 L611 147 L610 148 L609 145 L610 145 L610 144 L609 143 L610 143Z", 122.9, 11.8, "Asia"], "Malaysia": ["M560 155 L562 156 L562 157 L564 156 L566 157 L567 158 L567 162 L568 165 L567 166 L563 162 L560 157 L560 155Z M596 160 L592 159 L589 165 L586 165 L584 166 L581 166 L580 165 L579 164 L581 165 L582 164 L583 163 L586 162 L588 159 L589 160 L591 159 L591 157 L593 154 L594 154 L595 156 L598 157 L598 158 L597 158 L597 159 L596 160Z", 109.7, 3.7, "Asia"], "Brunei": ["M591 157 L591 159 L589 160 L588 159 L591 157Z", 114.9, 4.7, "Asia"], "Slovenia": ["M388 75 L392 74 L393 75 L392 76 L391 77 L387 77 L388 75Z", 14.9, 46.1, "Europe"], "Finland": ["M418 28 L417 31 L420 33 L418 34 L420 36 L419 38 L421 40 L420 41 L423 42 L422 43 L416 47 L406 48 L403 47 L403 45 L402 43 L403 42 L411 38 L411 37 L407 35 L407 32 L401 30 L402 29 L405 30 L409 31 L411 30 L412 28 L415 28 L418 28Z", 26.2, 64.5, "Europe"], "Slovakia": ["M405 70 L404 71 L402 71 L396 72 L394 71 L397 69 L400 70 L403 69 L405 70Z", 19.5, 48.7, "Europe"], "Czechia": ["M390 66 L393 68 L395 67 L398 69 L394 71 L391 70 L389 71 L385 69 L384 67 L390 66Z", 15.3, 49.8, "Europe"], "Eritrea": ["M433 139 L434 134 L437 132 L439 136 L446 143 L445 143 L442 140 L440 139 L437 139 L436 138 L435 140 L433 139Z", 38.7, 15.4, "Africa"], "Japan": ["M644 90 L642 92 L642 96 L641 98 L634 99 L632 101 L630 100 L630 99 L622 100 L624 102 L623 105 L621 106 L620 105 L621 103 L619 101 L621 101 L625 97 L631 97 L633 93 L635 94 L639 92 L640 89 L640 87 L641 86 L643 85 L644 90Z M649 80 L651 79 L651 81 L648 82 L646 84 L643 83 L642 85 L640 85 L640 83 L641 81 L643 81 L644 77 L646 79 L649 80Z M625 101 L628 99 L630 100 L628 102 L628 101 L627 101 L626 103 L625 102 L625 101Z", 138.1, 37.7, "Asia"], "Paraguay": ["M244 208 L244 212 L248 213 L249 216 L251 216 L250 221 L249 223 L243 222 L245 219 L244 218 L238 216 L235 212 L236 207 L242 207 L244 208Z", -58.4, -23.2, "South America"], "Yemen": ["M464 130 L466 135 L465 135 L464 137 L459 139 L457 140 L451 141 L450 143 L447 143 L445 138 L447 133 L453 133 L454 134 L458 131 L464 130Z", 47.5, 15.9, "Asia"], "Saudi Arabia": ["M430 109 L432 110 L433 108 L435 108 L436 107 L434 105 L438 104 L444 106 L449 110 L455 110 L455 111 L457 111 L458 113 L460 115 L460 117 L462 118 L463 119 L464 122 L470 123 L471 124 L470 128 L464 130 L458 131 L454 134 L453 133 L447 133 L446 135 L446 135 L442 129 L438 125 L438 123 L437 121 L435 119 L430 112 L429 112 L430 109Z", 44.5, 24.1, "Asia"], "N. Cyprus": ["M425 98 L426 97 L429 97 L428 98 L425 98Z", 33.6, 35.3, "Asia"], "Cyprus": ["M425 98 L427 98 L428 98 L426 99 L425 98Z", 33.0, 34.9, "Asia"], "Morocco": ["M356 98 L358 103 L357 103 L353 105 L353 106 L350 108 L343 110 L342 114 L337 114 L335 118 L332 121 L330 125 L326 125 L331 115 L335 112 L337 112 L341 108 L340 106 L343 102 L346 100 L348 96 L356 98Z", -8.4, 29.9, "Africa"], "Egypt": ["M434 124 L410 124 L410 110 L409 108 L410 105 L413 105 L418 106 L422 105 L423 105 L424 106 L424 105 L428 106 L429 106 L430 109 L428 112 L428 113 L426 111 L425 108 L428 116 L431 120 L431 122 L434 124Z", 29.8, 26.5, "Africa"], "Libya": ["M410 104 L410 128 L408 128 L408 129 L392 121 L388 123 L387 122 L384 121 L382 119 L381 119 L379 116 L379 115 L380 110 L379 107 L380 107 L380 105 L383 103 L383 102 L390 103 L391 105 L398 107 L400 106 L400 104 L402 103 L406 103 L406 104 L410 104Z", 18.0, 27.0, "Africa"], "Ethiopia": ["M456 152 L450 158 L447 158 L444 160 L442 159 L439 161 L432 159 L429 155 L427 153 L426 152 L427 151 L428 151 L429 147 L432 143 L433 139 L435 140 L436 138 L437 139 L440 139 L443 141 L445 143 L443 145 L444 146 L446 146 L445 147 L447 150 L456 152Z", 39.6, 8.7, "Africa"], "Djibouti": ["M445 143 L446 143 L447 143 L447 144 L445 145 L446 145 L446 146 L444 146 L443 145 L445 143Z", 42.5, 11.8, "Africa"], "Somaliland": ["M458 145 L458 149 L456 152 L447 150 L445 147 L446 145 L448 147 L458 145Z", 46.2, 9.8, "Africa"], "Uganda": ["M428 170 L419 171 L420 167 L422 164 L422 163 L422 161 L422 160 L427 160 L428 160 L429 161 L430 164 L428 168 L428 170Z", 32.4, 1.3, "Africa"], "Rwanda": ["M421 170 L422 173 L420 173 L419 174 L418 174 L419 171 L421 170Z", 29.9, -2.0, "Africa"], "Bosnia and Herz.": ["M397 83 L393 80 L392 78 L392 78 L399 78 L398 79 L399 80 L399 81 L397 82 L397 83Z", 17.8, 44.2, "Europe"], "Macedonia": ["M405 83 L406 84 L406 85 L402 86 L401 86 L402 84 L405 83Z", 21.7, 41.6, "Europe"], "Serbia": ["M398 76 L400 76 L403 78 L405 79 L405 80 L406 82 L405 83 L403 84 L404 83 L402 81 L401 82 L398 81 L399 80 L398 79 L399 78 L398 76Z", 20.8, 44.2, "Europe"], "Montenegro": ["M401 82 L399 83 L399 84 L397 83 L398 81 L401 82Z", 19.3, 42.8, "Europe"], "Kosovo": ["M401 84 L400 83 L401 82 L404 83 L401 84Z", 20.9, 42.6, "Europe"], "Trinidad and Tobago": ["M237 146 L238 146 L238 148 L236 148 L237 146Z", -61.3, 10.4, "North America"], "S. Sudan": ["M422 161 L419 159 L416 159 L410 152 L408 151 L409 150 L410 147 L412 147 L414 149 L418 149 L420 147 L422 149 L423 148 L425 146 L424 144 L426 144 L426 147 L427 147 L428 151 L426 152 L428 154 L431 157 L427 160 L422 161Z", 30.2, 7.3, "Africa"]};
const CONT_JP = {'Asia':'アジア','Europe':'ヨーロッパ','Africa':'アフリカ','North America':'北アメリカ','South America':'南アメリカ','Oceania':'オセアニア'};
const CONTS = ['アジア','ヨーロッパ','アフリカ','北アメリカ','南アメリカ','オセアニア'];
// [世界地図の名前, 日本語, 首都, 大陸]
const COUNTRIES = [
 ['Japan','日本','東京','アジア'],['China','中国','ペキン','アジア'],['South Korea','韓国','ソウル','アジア'],['North Korea','北朝鮮','ピョンヤン','アジア'],
 ['Mongolia','モンゴル','ウランバートル','アジア'],['India','インド','ニューデリー','アジア'],['Thailand','タイ','バンコク','アジア'],['Vietnam','ベトナム','ハノイ','アジア'],
 ['Philippines','フィリピン','マニラ','アジア'],['Indonesia','インドネシア','ジャカルタ','アジア'],['Malaysia','マレーシア','クアラルンプール','アジア'],['Saudi Arabia','サウジアラビア','リヤド','アジア'],
 ['Turkey','トルコ','アンカラ','アジア'],['Iran','イラン','テヘラン','アジア'],['Pakistan','パキスタン','イスラマバード','アジア'],['Bangladesh','バングラデシュ','ダッカ','アジア'],
 ['Nepal','ネパール','カトマンズ','アジア'],['Myanmar','ミャンマー','ネピドー','アジア'],['Kazakhstan','カザフスタン','アスタナ','アジア'],['United Arab Emirates','アラブ首長国連邦','アブダビ','アジア'],
 ['United Kingdom','イギリス','ロンドン','ヨーロッパ'],['France','フランス','パリ','ヨーロッパ'],['Germany','ドイツ','ベルリン','ヨーロッパ'],['Italy','イタリア','ローマ','ヨーロッパ'],
 ['Spain','スペイン','マドリード','ヨーロッパ'],['Portugal','ポルトガル','リスボン','ヨーロッパ'],['Netherlands','オランダ','アムステルダム','ヨーロッパ'],['Belgium','ベルギー','ブリュッセル','ヨーロッパ'],
 ['Switzerland','スイス','ベルン','ヨーロッパ'],['Austria','オーストリア','ウィーン','ヨーロッパ'],['Sweden','スウェーデン','ストックホルム','ヨーロッパ'],['Norway','ノルウェー','オスロ','ヨーロッパ'],
 ['Finland','フィンランド','ヘルシンキ','ヨーロッパ'],['Denmark','デンマーク','コペンハーゲン','ヨーロッパ'],['Poland','ポーランド','ワルシャワ','ヨーロッパ'],['Greece','ギリシャ','アテネ','ヨーロッパ'],
 ['Ireland','アイルランド','ダブリン','ヨーロッパ'],['Ukraine','ウクライナ','キーウ','ヨーロッパ'],['Russia','ロシア','モスクワ','ヨーロッパ'],['Iceland','アイスランド','レイキャビク','ヨーロッパ'],
 ['United States of America','アメリカ','ワシントンD.C.','北アメリカ'],['Canada','カナダ','オタワ','北アメリカ'],['Mexico','メキシコ','メキシコシティ','北アメリカ'],['Cuba','キューバ','ハバナ','北アメリカ'],
 ['Brazil','ブラジル','ブラジリア','南アメリカ'],['Argentina','アルゼンチン','ブエノスアイレス','南アメリカ'],['Chile','チリ','サンティアゴ','南アメリカ'],['Peru','ペルー','リマ','南アメリカ'],
 ['Colombia','コロンビア','ボゴタ','南アメリカ'],['Egypt','エジプト','カイロ','アフリカ'],['South Africa','南アフリカ','プレトリア','アフリカ'],['Kenya','ケニア','ナイロビ','アフリカ'],
 ['Nigeria','ナイジェリア','アブジャ','アフリカ'],['Ethiopia','エチオピア','アディスアベバ','アフリカ'],['Morocco','モロッコ','ラバト','アフリカ'],['Ghana','ガーナ','アクラ','アフリカ'],
 ['Madagascar','マダガスカル','アンタナナリボ','アフリカ'],['Australia','オーストラリア','キャンベラ','オセアニア'],['New Zealand','ニュージーランド','ウェリントン','オセアニア']
].filter(c => WORLD[c[0]]);
function wxy(lng, lat){ return [(lng+180)*2, (84-lat)*2]; }
function worldSVG(hi, opt={}){
  const hs = new Set(Array.isArray(hi) ? hi : hi ? [hi] : []);
  let h = '';
  for(const n in WORLD){ const on = hs.has(n); h += `<path d="${WORLD[n][0]}" fill="${on ? (opt.col||'#E8414B') : '#A8DC8E'}" stroke="${on ? '#9C1F28' : '#fff'}" stroke-width="${on ? 1 : .6}"/>`; }
  let pin = '';
  if(hs.size===1 && !opt.nopin){ const w = WORLD[[...hs][0]], [x,y] = wxy(w[1], w[2]); pin = pinSVG(x, y); }
  if(opt.pt){ const [x,y] = wxy(opt.pt[0], opt.pt[1]); pin += `<circle cx="${x}" cy="${y}" r="16" fill="#1C6AAE" opacity=".25"><animate attributeName="r" values="12;22;12" dur="1.4s" repeatCount="indefinite"/></circle><text x="${x}" y="${y+7}" text-anchor="middle" font-size="22" font-weight="900" fill="#1C6AAE">？</text>`; }
  let vb = '0 0 720 300';
  if(opt.zoom && hs.size===1){ const w = WORLD[[...hs][0]], [x,y] = wxy(w[1], w[2]); const W = 300, H = 170; vb = `${clamp(x-W/2,0,720-W).toFixed(0)} ${clamp(y-H/2,0,300-H).toFixed(0)} ${W} ${H}`; }
  return `<svg class="wMap" viewBox="${vb}"><rect width="720" height="300" rx="14" fill="#BFE3FB"/>${h}${pin}</svg>`;
}
/* ---------- 国旗（SVG） ---------- */
function star(cx, cy, r, col, rot=0){ let p = ''; for(let i=0;i<10;i++){ const rr = i%2 ? r*0.4 : r, a = (rot - 90 + i*36)*Math.PI/180; p += `${(cx+rr*Math.cos(a)).toFixed(2)},${(cy+rr*Math.sin(a)).toFixed(2)} `; } return `<polygon points="${p}" fill="${col}"/>`; }
const vS = (a,b,c) => `<rect width="10" height="20" fill="${a}"/><rect x="10" width="10" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c}"/>`;
const hS = (cols, hs) => { hs = hs || cols.map(() => 1); const t = hs.reduce((a,b)=>a+b,0); let y = 0; return cols.map((c,i) => { const h = 20*hs[i]/t, r = `<rect y="${y.toFixed(2)}" width="30" height="${(h+.05).toFixed(2)}" fill="${c}"/>`; y += h; return r; }).join(''); };
const nordic = (bg, cr, inner) => `<rect width="30" height="20" fill="${bg}"/><rect x="8" width="${inner?5:4}" height="20" fill="${cr}"/><rect y="${inner?7.5:8}" width="30" height="${inner?5:4}" fill="${cr}"/>` + (inner ? `<rect x="9" width="3" height="20" fill="${inner}"/><rect y="8.5" width="30" height="3" fill="${inner}"/>` : '');
const UJ = (w=30, h=20) => `<svg x="0" y="0" width="${w}" height="${h}" viewBox="0 0 60 30" preserveAspectRatio="none"><rect width="60" height="30" fill="#012169"/><path d="M0,0 60,30 M60,0 0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" stroke-width="2"/><path d="M30,0 V30 M0,15 H60" stroke="#fff" stroke-width="10"/><path d="M30,0 V30 M0,15 H60" stroke="#C8102E" stroke-width="6"/></svg>`;
const FLAGS = {
  '日本':'<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>',
  '中国':'<rect width="30" height="20" fill="#DE2910"/>'+star(5,5,3,'#FFDE00')+star(10,2,1,'#FFDE00',20)+star(12,4,1,'#FFDE00',40)+star(12,7,1,'#FFDE00')+star(10,9,1,'#FFDE00',20),
  '韓国':'<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5" fill="#0047A0"/><path d="M10,10 A5,5 0 0,1 20,10 A2.5,2.5 0 0,1 15,10 A2.5,2.5 0 0,0 10,10Z" fill="#CD2E3A"/><g stroke="#000" stroke-width="1.1"><path d="M4,4 l3,-2 M4.6,5 l3,-2 M5.2,6 l3,-2"/><path d="M22,2 l3,2 M22.6,1 l3,2 M21.4,3 l3,2" /><path d="M4,16 l3,2 M4.6,15 l3,2 M5.2,14 l3,2"/><path d="M22,18 l3,-2 M22.6,19 l3,-2 M21.4,17 l3,-2"/></g>',
  'アメリカ':hS(['#B22234','#fff','#B22234','#fff','#B22234','#fff','#B22234','#fff','#B22234','#fff','#B22234','#fff','#B22234'])+'<rect width="12" height="10.8" fill="#3C3B6E"/>'+[...Array(20)].map((_,i)=>`<circle cx="${1.3+(i%5)*2.35}" cy="${1.3+Math.floor(i/5)*2.6}" r=".55" fill="#fff"/>`).join(''),
  'イギリス':UJ(),
  'フランス':vS('#002395','#fff','#ED2939'), 'イタリア':vS('#009246','#fff','#CE2B37'), 'アイルランド':vS('#169B62','#fff','#FF883E'), 'ベルギー':vS('#000','#FAE042','#ED2939'),
  'ナイジェリア':vS('#008751','#fff','#008751'), 'ペルー':vS('#D91023','#fff','#D91023'),
  'メキシコ':vS('#006847','#fff','#CE1126')+'<circle cx="15" cy="10" r="2.6" fill="#8C5A2B"/><circle cx="15" cy="10" r="1.4" fill="#4C7A2E"/>',
  'カナダ':'<rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#D52B1E"/><rect x="22.5" width="7.5" height="20" fill="#D52B1E"/><path d="M15,3.2 l1,2 1.6,-.8 -.5,3 1.8,-1.6 .6,1.2 1.8,-.3 -.6,2 .8,.4 -3,2.4 .3,1 -2.6,-.4 .1,2.8 h-.8 l.1,-2.8 -2.6,.4 .3,-1 -3,-2.4 .8,-.4 -.6,-2 1.8,.3 .6,-1.2 1.8,1.6 -.5,-3 1.6,.8z" fill="#D52B1E"/>',
  'ドイツ':hS(['#000','#DD0000','#FFCE00']), 'ロシア':hS(['#fff','#0039A6','#D52B1E']), 'オランダ':hS(['#AE1C28','#fff','#21468B']), 'オーストリア':hS(['#ED2939','#fff','#ED2939']),
  'コロンビア':hS(['#FCD116','#003893','#CE1126'],[2,1,1]), 'ウクライナ':hS(['#0057B7','#FFD700']), 'ポーランド':hS(['#fff','#DC143C']), 'インドネシア':hS(['#CE1126','#fff']),
  'タイ':hS(['#A51931','#F4F5F8','#2D2A4A','#F4F5F8','#A51931'],[1,1,2,1,1]), 'スペイン':hS(['#AA151B','#F1BF00','#AA151B'],[1,2,1]),
  'エジプト':hS(['#CE1126','#fff','#000'])+'<circle cx="15" cy="10" r="2" fill="#C09300"/>',
  'アルゼンチン':hS(['#74ACDF','#fff','#74ACDF'])+'<circle cx="15" cy="10" r="2" fill="#F6B40E"/>',
  'インド':hS(['#FF9933','#fff','#138808'])+'<circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width=".6"/><circle cx="15" cy="10" r=".5" fill="#000080"/>',
  'ガーナ':hS(['#CE1126','#FCD116','#006B3F'])+star(15,10,3,'#000'),
  'エチオピア':hS(['#078930','#FCDD09','#DA121A'])+'<circle cx="15" cy="10" r="4" fill="#0F47AF"/>'+star(15,10,2.8,'#FCDD09'),
  'スウェーデン':nordic('#006AA7','#FECC00'), 'フィンランド':nordic('#fff','#003580'), 'デンマーク':nordic('#C8102E','#fff'),
  'ノルウェー':nordic('#BA0C2F','#fff','#00205B'), 'アイスランド':nordic('#02529C','#fff','#DC1E35'),
  'スイス':'<rect width="30" height="20" fill="#DA291C"/><rect x="13" y="4" width="4" height="12" fill="#fff"/><rect x="9" y="8" width="12" height="4" fill="#fff"/>',
  'バングラデシュ':'<rect width="30" height="20" fill="#006A4E"/><circle cx="13.5" cy="10" r="6" fill="#F42A41"/>',
  'トルコ':'<rect width="30" height="20" fill="#E30A17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#E30A17"/>'+star(17.5,10,2.3,'#fff',-18),
  'ベトナム':'<rect width="30" height="20" fill="#DA251D"/>'+star(15,10.5,6,'#FFFF00'),
  'ブラジル':'<rect width="30" height="20" fill="#009C3B"/><polygon points="15,2 28,10 15,18 2,10" fill="#FFDF00"/><circle cx="15" cy="10" r="4.5" fill="#002776"/><path d="M10.7,9 Q15,7.6 19.3,10.6" stroke="#fff" stroke-width=".8" fill="none"/>',
  'オーストラリア':'<rect width="30" height="20" fill="#012169"/>'+UJ(15,10)+star(7.5,15.5,2.2,'#fff')+star(23,4,1.1,'#fff')+star(20,9,1.1,'#fff')+star(26,8,1.1,'#fff')+star(23,16,1.1,'#fff'),
  'ニュージーランド':'<rect width="30" height="20" fill="#012169"/>'+UJ(15,10)+star(23,4,1.3,'#C8102E')+star(20,9,1.3,'#C8102E')+star(26,8,1.3,'#C8102E')+star(23,16,1.3,'#C8102E'),
  'ギリシャ':hS(['#0D5EAF','#fff','#0D5EAF','#fff','#0D5EAF','#fff','#0D5EAF','#fff','#0D5EAF'])+'<rect width="11.1" height="11.1" fill="#0D5EAF"/><rect x="4.4" width="2.2" height="11.1" fill="#fff"/><rect y="4.4" width="11.1" height="2.2" fill="#fff"/>',
  'チリ':hS(['#fff','#D52B1E'])+'<rect width="10" height="10" fill="#0039A6"/>'+star(5,5,2.4,'#fff'),
  'キューバ':hS(['#002A8F','#fff','#002A8F','#fff','#002A8F'])+'<polygon points="0,0 11,10 0,20" fill="#CF142B"/>'+star(4,10,2.3,'#fff'),
  'フィリピン':hS(['#0038A8','#CE1126'])+'<polygon points="0,0 17,10 0,20" fill="#fff"/><circle cx="6" cy="10" r="2.3" fill="#FCD116"/>'+star(1.8,3,.8,'#FCD116')+star(1.8,17,.8,'#FCD116')+star(14,10,.8,'#FCD116'),
  '南アフリカ':'<rect width="30" height="20" fill="#fff"/><rect width="30" height="7" fill="#E03C31"/><rect y="13" width="30" height="7" fill="#001489"/><path d="M0,0 L13,10 L0,20 M13,10 H30" stroke="#007A4D" stroke-width="4" fill="none"/><polygon points="0,2.5 9.5,10 0,17.5" fill="#FFB612"/><polygon points="0,4.3 7.2,10 0,15.7" fill="#000"/>',
  'ポルトガル':'<rect width="30" height="20" fill="#DA291C"/><rect width="12" height="20" fill="#046A38"/><circle cx="12" cy="10" r="3.6" fill="#FFE900"/><circle cx="12" cy="10" r="2.2" fill="#DA291C" stroke="#fff" stroke-width=".5"/>',
  'モロッコ':'<rect width="30" height="20" fill="#C1272D"/><polygon points="15,5.3 16.4,9.6 20.9,9.6 17.3,12.3 18.7,16.6 15,13.9 11.3,16.6 12.7,12.3 9.1,9.6 13.6,9.6" fill="none" stroke="#006233" stroke-width=".9"/>',
  'ケニア':hS(['#000','#fff','#BB0000','#fff','#006600'],[6,1,6,1,6])+'<ellipse cx="15" cy="10" rx="2.6" ry="5" fill="#BB0000" stroke="#000" stroke-width=".5"/><rect x="14.7" y="5" width=".6" height="10" fill="#fff"/>'
};
const flagSVG = (jp, cls='') => `<svg class="flag ${cls}" viewBox="0 0 30 20"><g>${FLAGS[jp]}</g><rect width="30" height="20" fill="none" stroke="rgba(0,0,0,.25)" stroke-width=".4"/></svg>`;
const FLAG_C = COUNTRIES.filter(c => FLAGS[c[1]]);
const OCEANS = [['太平洋',[-150,10]],['太平洋',[170,25]],['大西洋',[-35,25]],['大西洋',[-20,-25]],['インド洋',[78,-22]],['北極海',[0,80]]];
Object.assign(MATH_UNITS, {
  w_loc:{n:'世界地図で 国さがし', g:'soc', art:'so_map', gen(){ const c = choice(COUNTRIES), near = COUNTRIES.filter(x => x[3]===c[3] && x!==c);
    const opts = shuffle([c[1], ...shuffle(near).slice(0,2).map(x=>x[1]), ...shuffle(COUNTRIES.filter(x => x[3]!==c[3])).slice(0,3).map(x=>x[1])].filter((v,i,a)=>a.indexOf(v)===i).slice(0,4));
    return {type:'choice', q:'<b>赤く ぬられた 国</b> は どこ？', disp:worldSVG(c[0], {zoom:true}), ans:c[1], opts, hint:`${c[3]}に ある 国だよ`}; }},
  w_flag:{n:'国旗', g:'soc', art:'so_compass', gen(){ const c = choice(FLAG_C);
    if(Math.random() < 0.55) return {type:'choice', q:'この 国旗は どこの 国？', disp:`<div class="flagBig">${flagSVG(c[1])}</div>`, ans:c[1], opts:fourOpts(c[1], FLAG_C.map(x=>x[1])), hint:`${c[3]}の 国だよ`};
    const opts = fourOpts(c[1], FLAG_C.map(x=>x[1]));
    return {type:'choice', q:`<b>${c[1]}</b> の 国旗は どれ？`, ans:c[1], opts, optHtml:Object.fromEntries(opts.map(o => [o, flagSVG(o,'opt')])), hint:`${c[1]}は ${c[3]}の 国`}; }},
  w_cap:{n:'世界の 首都', g:'soc', art:'ui_building', gen(){ const c = choice(COUNTRIES);
    return {type:'choice', q:`<b>${c[1]}</b> の 首都は？`, disp:worldSVG(c[0], {zoom:true}), ans:c[2], opts:fourOpts(c[2], COUNTRIES.map(x=>x[2])), hint:`「${c[2][0]}」から はじまるよ`}; }},
  w_cont:{n:'6大陸と 3大洋', g:'soc', art:'so_japan', gen(){
    const k = ri(0,2);
    if(k===0){ const c = choice(COUNTRIES); return {type:'choice', q:`<b>赤い 国（${c[1]}）</b> が ある 大陸・地いきは？`, disp:worldSVG(c[0]), ans:c[3], opts:fourOpts(c[3], CONTS), hint:'大陸の 形を 思い出そう'}; }
    if(k===1){ const ct = choice(Object.keys(CONT_JP)), jp = CONT_JP[ct], ns = Object.keys(WORLD).filter(n => WORLD[n][3]===ct);
      return {type:'choice', q:'<b>オレンジ色の ところ</b> は 何大陸（地いき）？', disp:worldSVG(ns, {col:'#F28F1C', nopin:true}), ans:jp, opts:fourOpts(jp, CONTS), hint:'6大陸と オセアニアを 思い出そう', dk:ct}; }
    const o = choice(OCEANS); return {type:'choice', q:'<b>？</b> の 海の 名前は？', disp:worldSVG(null, {pt:o[1]}), ans:o[0], opts:shuffle(['太平洋','大西洋','インド洋','北極海']), hint:'3大洋は 太平洋・大西洋・インド洋', dk:o[1].join()}; }}
});
SOC_GROUPS.push(['🌏 世界', ['w_loc','w_flag','w_cap','w_cont']]);
const _mPad12 = mPad;
mPad = function(){
  _mPad12();
  const p = MQ.list[MQ.i];
  if(p.type==='choice' && p.optHtml){ $$('#mPad .mk.opt').forEach(b => { const h = p.optHtml[b.dataset.c]; if(h){ b.innerHTML = h; b.classList.add('flagOpt'); } }); $('#mPad').classList.add('flags'); }
  else $('#mPad').classList.remove('flags');
};

/* ---------- 家具・かざり ぞうりょう ---------- */
const DEFS12 = {"fur": [{"id": "armchair", "name": "ひとりがけソファ", "art": "fs_armchair", "type": "fur", "price": 80, "lv": 1, "sty": 2}, {"id": "rocking", "name": "ロッキングチェア", "art": "fs_rocking", "type": "fur", "price": 100, "lv": 1, "sty": 2}, {"id": "beanbag", "name": "ビーズクッション", "art": "fs_beanbag", "type": "fur", "price": 120, "lv": 1, "sty": 2}, {"id": "stool", "name": "まるいす", "art": "fs_stool", "type": "fur", "price": 150, "lv": 1, "sty": 2}, {"id": "bunkbed", "name": "2だんベッド", "art": "fs_bunkbed", "type": "fur", "price": 170, "lv": 2, "sty": 2}, {"id": "crib", "name": "ベビーベッド", "art": "fs_crib", "type": "fur", "price": 190, "lv": 2, "sty": 2}, {"id": "futon", "name": "ふとん", "art": "fs_futon", "type": "fur", "price": 210, "lv": 2, "sty": 2}, {"id": "hammock", "name": "ハンモック", "art": "fs_hammock", "type": "fur", "price": 230, "lv": 2, "sty": 3}, {"id": "chabudai", "name": "ちゃぶだい", "art": "fs_chabudai", "type": "fur", "price": 260, "lv": 2, "sty": 3}, {"id": "kotatsu", "name": "こたつ", "art": "fs_kotatsu", "type": "fur", "price": 280, "lv": 2, "sty": 3}, {"id": "wdesk", "name": "つくえ（ひきだしつき）", "art": "fs_wdesk", "type": "fur", "price": 300, "lv": 3, "sty": 3, "know": 0.01}, {"id": "pcdesk", "name": "パソコンデスク", "art": "fs_pcdesk", "type": "fur", "price": 320, "lv": 3, "sty": 4, "know": 0.01}, {"id": "drawers", "name": "たんす", "art": "fs_drawers", "type": "fur", "price": 350, "lv": 3, "sty": 4}, {"id": "cabinet", "name": "しょっきだな", "art": "fs_cabinet", "type": "fur", "price": 370, "lv": 3, "sty": 4}, {"id": "coatrack", "name": "コートかけ", "art": "fs_coatrack", "type": "fur", "price": 390, "lv": 3, "sty": 4}, {"id": "mirror", "name": "すがたみ", "art": "fs_mirror", "type": "fur", "price": 410, "lv": 3, "sty": 5}, {"id": "dresser", "name": "ドレッサー", "art": "fs_dresser", "type": "fur", "price": 430, "lv": 4, "sty": 5}, {"id": "shoerack", "name": "くつばこ", "art": "fs_shoerack", "type": "fur", "price": 460, "lv": 4, "sty": 5}, {"id": "umbrella", "name": "かさたて", "art": "fs_umbrella", "type": "fur", "price": 480, "lv": 4, "sty": 5}, {"id": "benchin", "name": "木の ベンチ", "art": "fs_benchin", "type": "fur", "price": 500, "lv": 4, "sty": 6}, {"id": "bathtub", "name": "おふろ", "art": "fs_bathtub", "type": "fur", "price": 150, "lv": 1, "sty": 2}, {"id": "toilet", "name": "トイレ", "art": "fs_toilet", "type": "fur", "price": 190, "lv": 1, "sty": 2}, {"id": "washbasin", "name": "せんめんだい", "art": "fs_washbasin", "type": "fur", "price": 230, "lv": 2, "sty": 3}, {"id": "washer", "name": "せんたくき", "art": "fs_washer", "type": "fur", "price": 270, "lv": 2, "sty": 3}, {"id": "microwave", "name": "でんしレンジ", "art": "fs_microwave", "type": "fur", "price": 310, "lv": 2, "sty": 3}, {"id": "ricecooker", "name": "すいはんき", "art": "fs_ricecooker", "type": "fur", "price": 350, "lv": 2, "sty": 4}, {"id": "oven", "name": "ガスコンロ", "art": "fs_oven", "type": "fur", "price": 390, "lv": 3, "sty": 4}, {"id": "coffee", "name": "コーヒーメーカー", "art": "fs_coffee", "type": "fur", "price": 430, "lv": 3, "sty": 5}, {"id": "waterdisp", "name": "ウォーターサーバー", "art": "fs_waterdisp", "type": "fur", "price": 470, "lv": 3, "sty": 5}, {"id": "robovac", "name": "おそうじロボット", "art": "fs_robovac", "type": "fur", "price": 510, "lv": 3, "sty": 6}, {"id": "fan", "name": "せんぷうき", "art": "fs_fan", "type": "fur", "price": 540, "lv": 4, "sty": 6}, {"id": "heater", "name": "ヒーター", "art": "fs_heater", "type": "fur", "price": 580, "lv": 4, "sty": 6}, {"id": "humidifier", "name": "かしつき", "art": "fs_humidifier", "type": "fur", "price": 620, "lv": 4, "sty": 7}, {"id": "speaker", "name": "スピーカー", "art": "fs_speaker", "type": "fur", "price": 660, "lv": 4, "sty": 7}, {"id": "stereo", "name": "ステレオ", "art": "fs_stereo", "type": "fur", "price": 700, "lv": 5, "sty": 8}, {"id": "gametv", "name": "ゲームと テレビ", "art": "fs_gametv", "type": "fur", "price": 740, "lv": 5, "sty": 8}, {"id": "arcade", "name": "ゲームき", "art": "fs_arcade", "type": "fur", "price": 780, "lv": 5, "sty": 10}, {"id": "jukebox", "name": "ジュークボックス", "art": "fs_jukebox", "type": "fur", "price": 820, "lv": 5, "sty": 10}, {"id": "popcorn", "name": "ポップコーンき", "art": "fs_popcorn", "type": "fur", "price": 860, "lv": 6, "sty": 10}, {"id": "cottoncandy", "name": "わたあめき", "art": "fs_cottoncandy", "type": "fur", "price": 900, "lv": 6, "sty": 10}, {"id": "grandpiano", "name": "グランドピアノ", "art": "fs_grandpiano", "type": "fur", "price": 200, "lv": 2, "sty": 16}, {"id": "guitar", "name": "ギター", "art": "fs_guitar", "type": "fur", "price": 270, "lv": 2, "sty": 3}, {"id": "drums", "name": "ドラム", "art": "fs_drums", "type": "fur", "price": 340, "lv": 3, "sty": 4}, {"id": "harp", "name": "ハープ", "art": "fs_harp", "type": "fur", "price": 410, "lv": 3, "sty": 5}, {"id": "telescope", "name": "ぼうえんきょう", "art": "fs_telescope", "type": "fur", "price": 470, "lv": 3, "sty": 5, "know": 0.01}, {"id": "sewing", "name": "ミシン", "art": "fs_sewing", "type": "fur", "price": 540, "lv": 3, "sty": 6}, {"id": "easel", "name": "イーゼル", "art": "fs_easel", "type": "fur", "price": 610, "lv": 4, "sty": 7, "know": 0.01}, {"id": "pottery", "name": "とうげいの ろくろ", "art": "fs_pottery", "type": "fur", "price": 680, "lv": 4, "sty": 8}, {"id": "workbench", "name": "こうさくだい", "art": "fs_workbench", "type": "fur", "price": 750, "lv": 4, "sty": 8}, {"id": "treadmill", "name": "ランニングマシン", "art": "fs_treadmill", "type": "fur", "price": 820, "lv": 4, "sty": 9}, {"id": "punchbag", "name": "サンドバッグ", "art": "fs_punchbag", "type": "fur", "price": 880, "lv": 5, "sty": 10}, {"id": "goldfish", "name": "きんぎょばち", "art": "fs_goldfish", "type": "fur", "price": 950, "lv": 5, "sty": 11}, {"id": "birdcage", "name": "とりかご", "art": "fs_birdcage", "type": "fur", "price": 1020, "lv": 5, "sty": 11}, {"id": "cattree", "name": "キャットタワー", "art": "fs_cattree", "type": "fur", "price": 1090, "lv": 5, "sty": 12}, {"id": "dogbed", "name": "いぬの ベッド", "art": "fs_dogbed", "type": "fur", "price": 1160, "lv": 6, "sty": 13}, {"id": "hamcage", "name": "ハムスターの おうち", "art": "fs_hamcage", "type": "fur", "price": 1230, "lv": 6, "sty": 14}, {"id": "terrarium", "name": "テラリウム", "art": "fs_terrarium", "type": "fur", "price": 1290, "lv": 6, "sty": 14}, {"id": "bonsai", "name": "ぼんさい", "art": "fs_bonsai", "type": "fur", "price": 1360, "lv": 6, "sty": 15}, {"id": "cactus", "name": "サボテン", "art": "fs_cactus", "type": "fur", "price": 1430, "lv": 7, "sty": 16}, {"id": "hangflower", "name": "つりはち", "art": "fs_hangflower", "type": "fur", "price": 1500, "lv": 7, "sty": 17}, {"id": "fireplace", "name": "だんろ", "art": "fs_fireplace", "type": "fur", "price": 500, "lv": 3, "sty": 10}, {"id": "xmastree", "name": "クリスマスツリー", "art": "fs_xmastree", "type": "fur", "price": 610, "lv": 3, "sty": 12}, {"id": "snowplush", "name": "ゆきだるまの ぬいぐるみ", "art": "fs_snowplush", "type": "fur", "price": 710, "lv": 4, "sty": 8}, {"id": "pumpkinlamp", "name": "かぼちゃランプ", "art": "fs_pumpkinlamp", "type": "fur", "price": 820, "lv": 4, "sty": 9}, {"id": "hina", "name": "ひなにんぎょう", "art": "fs_hina", "type": "fur", "price": 920, "lv": 4, "sty": 12}, {"id": "samurai", "name": "よろいかぶと", "art": "fs_samurai", "type": "fur", "price": 1030, "lv": 5, "sty": 12}, {"id": "tansu", "name": "わだんす", "art": "fs_tansu", "type": "fur", "price": 1130, "lv": 5, "sty": 13}, {"id": "andon", "name": "あんどん", "art": "fs_andon", "type": "fur", "price": 1240, "lv": 5, "sty": 14}, {"id": "byobu", "name": "びょうぶ", "art": "fs_byobu", "type": "fur", "price": 1340, "lv": 6, "sty": 15}, {"id": "throne", "name": "おうさまの いす", "art": "fs_throne", "type": "fur", "price": 2250, "lv": 6, "sty": 14, "special": 1}, {"id": "canopybed", "name": "おひめさまベッド", "art": "fs_canopybed", "type": "fur", "price": 2350, "lv": 6, "sty": 14, "special": 1}, {"id": "treasure", "name": "たからばこ", "art": "fs_treasure", "type": "fur", "price": 2460, "lv": 6, "sty": 12, "special": 1}, {"id": "knight", "name": "きしの よろい", "art": "fs_knight", "type": "fur", "price": 1760, "lv": 7, "sty": 20}, {"id": "robot", "name": "ロボット", "art": "fs_robot", "type": "fur", "price": 1870, "lv": 7, "sty": 21}, {"id": "rocket", "name": "ロケットの もけい", "art": "fs_rocket", "type": "fur", "price": 1970, "lv": 7, "sty": 22}, {"id": "dino", "name": "きょうりゅうの ほね", "art": "fs_dino", "type": "fur", "price": 2880, "lv": 8, "sty": 13, "special": 1}, {"id": "unicorn", "name": "ユニコーンの もくば", "art": "fs_unicorn", "type": "fur", "price": 2180, "lv": 8, "sty": 11}, {"id": "bigteddy", "name": "おおきな くま", "art": "fs_bigteddy", "type": "fur", "price": 2290, "lv": 8, "sty": 25}, {"id": "crystal", "name": "すいしょうだま", "art": "fs_crystal", "type": "fur", "price": 3190, "lv": 9, "sty": 11, "special": 1}, {"id": "trophy", "name": "トロフィー", "art": "fs_trophy", "type": "fur", "price": 3300, "lv": 9, "sty": 12, "special": 1}], "deco": [{"id": "d_sakura", "type": "bld", "cat": "deco", "name": "さくら", "art": "dc_sakura", "emoji": "🌼", "price": 30, "lv": 1, "dev": 2}, {"id": "d_maple", "type": "bld", "cat": "deco", "name": "もみじ", "art": "dc_maple", "emoji": "🌼", "price": 40, "lv": 1, "dev": 2}, {"id": "d_pine", "type": "bld", "cat": "deco", "name": "まつ", "art": "dc_pine", "emoji": "🌼", "price": 60, "lv": 1, "dev": 3}, {"id": "d_palm", "type": "bld", "cat": "deco", "name": "ヤシの木", "art": "dc_palm", "emoji": "🌼", "price": 70, "lv": 1, "dev": 4}, {"id": "d_bamboo", "type": "bld", "cat": "deco", "name": "たけやぶ", "art": "dc_bamboo", "emoji": "🌼", "price": 90, "lv": 2, "dev": 5}, {"id": "d_sunflower", "type": "bld", "cat": "deco", "name": "ひまわり", "art": "dc_sunflower", "emoji": "🌼", "price": 100, "lv": 2, "dev": 6}, {"id": "d_rosearch", "type": "bld", "cat": "deco", "name": "バラの アーチ", "art": "dc_rosearch", "emoji": "🌼", "price": 120, "lv": 2, "dev": 7}, {"id": "d_tulip", "type": "bld", "cat": "deco", "name": "チューリップ", "art": "dc_tulip", "emoji": "🌼", "price": 130, "lv": 2, "dev": 7}, {"id": "d_hedge", "type": "bld", "cat": "deco", "name": "いけがき", "art": "dc_hedge", "emoji": "🌼", "price": 140, "lv": 2, "dev": 8}, {"id": "d_mushroom", "type": "bld", "cat": "deco", "name": "きのこ", "art": "dc_mushroom", "emoji": "🌼", "price": 160, "lv": 2, "dev": 9}, {"id": "d_rocks", "type": "bld", "cat": "deco", "name": "いわ", "art": "dc_rocks", "emoji": "🌼", "price": 170, "lv": 3, "dev": 9}, {"id": "d_bridge", "type": "bld", "cat": "deco", "name": "木の はし", "art": "dc_bridge", "emoji": "🌼", "price": 190, "lv": 3, "dev": 11}, {"id": "d_fence", "type": "bld", "cat": "deco", "name": "さく", "art": "dc_fence", "emoji": "🌼", "price": 200, "lv": 3, "dev": 11}, {"id": "d_stonelamp", "type": "bld", "cat": "deco", "name": "いしどうろう", "art": "dc_stonelamp", "emoji": "🌼", "price": 210, "lv": 3, "dev": 12}, {"id": "d_torii", "type": "bld", "cat": "deco", "name": "とりい", "art": "dc_torii", "emoji": "🌼", "price": 230, "lv": 3, "dev": 13}, {"id": "d_birdbath", "type": "bld", "cat": "deco", "name": "ことりの みずのみば", "art": "dc_birdbath", "emoji": "🌼", "price": 240, "lv": 3, "dev": 13}, {"id": "d_flowercart", "type": "bld", "cat": "deco", "name": "はなぐるま", "art": "dc_flowercart", "emoji": "🌼", "price": 260, "lv": 4, "dev": 14}, {"id": "d_scarecrow", "type": "bld", "cat": "deco", "name": "かかし", "art": "dc_scarecrow", "emoji": "🌼", "price": 270, "lv": 4, "dev": 15}, {"id": "d_signpost", "type": "bld", "cat": "deco", "name": "あんないばん", "art": "dc_signpost", "emoji": "🌼", "price": 290, "lv": 4, "dev": 16}, {"id": "d_catstatue", "type": "bld", "cat": "deco", "name": "ねこの せきぞう", "art": "dc_catstatue", "emoji": "🌼", "price": 300, "lv": 4, "dev": 17}, {"id": "d_clocktower", "type": "bld", "cat": "deco", "name": "とけいとう", "art": "dc_clocktower", "emoji": "🌼", "price": 80, "lv": 2, "dev": 4}, {"id": "d_pennant", "type": "bld", "cat": "deco", "name": "フラッグガーランド", "art": "dc_pennant", "emoji": "🌼", "price": 110, "lv": 2, "dev": 6}, {"id": "d_mailbox", "type": "bld", "cat": "deco", "name": "ポスト", "art": "dc_mailbox", "emoji": "🌼", "price": 130, "lv": 2, "dev": 7}, {"id": "d_phonebooth", "type": "bld", "cat": "deco", "name": "でんわボックス", "art": "dc_phonebooth", "emoji": "🌼", "price": 160, "lv": 3, "dev": 9}, {"id": "d_vending", "type": "bld", "cat": "deco", "name": "じどうはんばいき", "art": "dc_vending", "emoji": "🌼", "price": 190, "lv": 3, "dev": 11}, {"id": "d_busstop", "type": "bld", "cat": "deco", "name": "バスてい", "art": "dc_busstop", "emoji": "🌼", "price": 220, "lv": 3, "dev": 12}, {"id": "d_bikerack", "type": "bld", "cat": "deco", "name": "じてんしゃおきば", "art": "dc_bikerack", "emoji": "🌼", "price": 240, "lv": 3, "dev": 13}, {"id": "d_recycle", "type": "bld", "cat": "deco", "name": "リサイクルばこ", "art": "dc_recycle", "emoji": "🌼", "price": 270, "lv": 3, "dev": 15}, {"id": "d_hydrant", "type": "bld", "cat": "deco", "name": "しょうかせん", "art": "dc_hydrant", "emoji": "🌼", "price": 300, "lv": 4, "dev": 17}, {"id": "d_picnic", "type": "bld", "cat": "deco", "name": "ピクニックテーブル", "art": "dc_picnic", "emoji": "🌼", "price": 330, "lv": 4, "dev": 18}, {"id": "d_parasol", "type": "bld", "cat": "deco", "name": "パラソルテーブル", "art": "dc_parasol", "emoji": "🌼", "price": 350, "lv": 4, "dev": 19}, {"id": "d_swing", "type": "bld", "cat": "deco", "name": "ブランコ", "art": "dc_swing", "emoji": "🌼", "price": 380, "lv": 4, "dev": 21}, {"id": "d_slide", "type": "bld", "cat": "deco", "name": "すべりだい", "art": "dc_slide", "emoji": "🌼", "price": 410, "lv": 5, "dev": 23}, {"id": "d_sandbox", "type": "bld", "cat": "deco", "name": "すなば", "art": "dc_sandbox", "emoji": "🌼", "price": 440, "lv": 5, "dev": 24}, {"id": "d_seesaw", "type": "bld", "cat": "deco", "name": "シーソー", "art": "dc_seesaw", "emoji": "🌼", "price": 460, "lv": 5, "dev": 26}, {"id": "d_junglegym", "type": "bld", "cat": "deco", "name": "ジャングルジム", "art": "dc_junglegym", "emoji": "🌼", "price": 490, "lv": 5, "dev": 27}, {"id": "d_trampoline", "type": "bld", "cat": "deco", "name": "トランポリン", "art": "dc_trampoline", "emoji": "🌼", "price": 520, "lv": 5, "dev": 29}, {"id": "d_carousel", "type": "bld", "cat": "deco", "name": "メリーゴーランド", "art": "dc_carousel", "emoji": "🌼", "price": 550, "lv": 6, "dev": 31}, {"id": "d_balloon", "type": "bld", "cat": "deco", "name": "ふうせんやさん", "art": "dc_balloon", "emoji": "🌼", "price": 570, "lv": 6, "dev": 32}, {"id": "d_springhorse", "type": "bld", "cat": "deco", "name": "スプリングのりもの", "art": "dc_springhorse", "emoji": "🌼", "price": 600, "lv": 6, "dev": 33}, {"id": "d_snowman", "type": "bld", "cat": "deco", "name": "ゆきだるま", "art": "dc_snowman", "emoji": "🌼", "price": 100, "lv": 2, "dev": 6}, {"id": "d_xmasout", "type": "bld", "cat": "deco", "name": "クリスマスツリー（そと）", "art": "dc_xmasout", "emoji": "🌼", "price": 160, "lv": 2, "dev": 9}, {"id": "d_pumpkins", "type": "bld", "cat": "deco", "name": "ハロウィンかぼちゃ", "art": "dc_pumpkins", "emoji": "🌼", "price": 220, "lv": 3, "dev": 12}, {"id": "d_tanabata", "type": "bld", "cat": "deco", "name": "たなばた", "art": "dc_tanabata", "emoji": "🌼", "price": 270, "lv": 3, "dev": 15}, {"id": "d_koinobori", "type": "bld", "cat": "deco", "name": "こいのぼり", "art": "dc_koinobori", "emoji": "🌼", "price": 330, "lv": 3, "dev": 18}, {"id": "d_kadomatsu", "type": "bld", "cat": "deco", "name": "かどまつ", "art": "dc_kadomatsu", "emoji": "🌼", "price": 390, "lv": 4, "dev": 22}, {"id": "d_campfire", "type": "bld", "cat": "deco", "name": "キャンプファイヤー", "art": "dc_campfire", "emoji": "🌼", "price": 450, "lv": 4, "dev": 25}, {"id": "d_tent", "type": "bld", "cat": "deco", "name": "テント", "art": "dc_tent", "emoji": "🌼", "price": 510, "lv": 4, "dev": 28}, {"id": "d_onsen", "type": "bld", "cat": "deco", "name": "おんせん", "art": "dc_onsen", "emoji": "🌼", "price": 560, "lv": 5, "dev": 31}, {"id": "d_gazebo", "type": "bld", "cat": "deco", "name": "ガゼボ", "art": "dc_gazebo", "emoji": "🌼", "price": 620, "lv": 5, "dev": 34}, {"id": "d_totem", "type": "bld", "cat": "deco", "name": "トーテムポール", "art": "dc_totem", "emoji": "🌼", "price": 680, "lv": 5, "dev": 38}, {"id": "d_bigpot", "type": "bld", "cat": "deco", "name": "おおきな うえきばち", "art": "dc_bigpot", "emoji": "🌼", "price": 740, "lv": 5, "dev": 41}, {"id": "d_topiary", "type": "bld", "cat": "deco", "name": "うさぎの トピアリー", "art": "dc_topiary", "emoji": "🌼", "price": 790, "lv": 6, "dev": 44}, {"id": "d_waterfall", "type": "bld", "cat": "deco", "name": "たき", "art": "dc_waterfall", "emoji": "🌼", "price": 850, "lv": 6, "dev": 47}, {"id": "d_koipond", "type": "bld", "cat": "deco", "name": "こいの いけ", "art": "dc_koipond", "emoji": "🌼", "price": 910, "lv": 6, "dev": 51}, {"id": "d_duckpond", "type": "bld", "cat": "deco", "name": "アヒルの いけ", "art": "dc_duckpond", "emoji": "🌼", "price": 970, "lv": 7, "dev": 54}, {"id": "d_rainbow", "type": "bld", "cat": "deco", "name": "にじの アーチ", "art": "dc_rainbow", "emoji": "🌼", "price": 1030, "lv": 7, "dev": 57}, {"id": "d_hotair", "type": "bld", "cat": "deco", "name": "ききゅう", "art": "dc_hotair", "emoji": "🌼", "price": 1080, "lv": 7, "dev": 60}, {"id": "d_lighthouse", "type": "bld", "cat": "deco", "name": "とうだい", "art": "dc_lighthouse", "emoji": "🌼", "price": 1140, "lv": 8, "dev": 63}, {"id": "d_beehive", "type": "bld", "cat": "deco", "name": "みつばちの すばこ", "art": "dc_beehive", "emoji": "🌼", "price": 1200, "lv": 8, "dev": 67}, {"id": "d_coop", "type": "bld", "cat": "deco", "name": "にわとりごや", "art": "dc_coop", "emoji": "🌼", "price": 200, "lv": 3, "dev": 11}, {"id": "d_doghouse", "type": "bld", "cat": "deco", "name": "いぬごや", "art": "dc_doghouse", "emoji": "🌼", "price": 320, "lv": 3, "dev": 18}, {"id": "d_vegstand", "type": "bld", "cat": "deco", "name": "やさいの むじんはんばい", "art": "dc_vegstand", "emoji": "🌼", "price": 440, "lv": 4, "dev": 24}, {"id": "d_icestand", "type": "bld", "cat": "deco", "name": "アイスやさん", "art": "dc_icestand", "emoji": "🌼", "price": 560, "lv": 4, "dev": 31}, {"id": "d_takoyaki", "type": "bld", "cat": "deco", "name": "たこやきやさん", "art": "dc_takoyaki", "emoji": "🌼", "price": 680, "lv": 4, "dev": 38}, {"id": "d_crepe", "type": "bld", "cat": "deco", "name": "クレープやさん", "art": "dc_crepe", "emoji": "🌼", "price": 810, "lv": 5, "dev": 45}, {"id": "d_omikuji", "type": "bld", "cat": "deco", "name": "おみくじ", "art": "dc_omikuji", "emoji": "🌼", "price": 930, "lv": 5, "dev": 52}, {"id": "d_hokora", "type": "bld", "cat": "deco", "name": "ほこら", "art": "dc_hokora", "emoji": "🌼", "price": 1050, "lv": 6, "dev": 58}, {"id": "d_jizo", "type": "bld", "cat": "deco", "name": "おじぞうさま", "art": "dc_jizo", "emoji": "🌼", "price": 1170, "lv": 6, "dev": 65}, {"id": "d_daruma", "type": "bld", "cat": "deco", "name": "だるま", "art": "dc_daruma", "emoji": "🌼", "price": 1290, "lv": 6, "dev": 72}, {"id": "d_manekineko", "type": "bld", "cat": "deco", "name": "まねきねこ", "art": "dc_manekineko", "emoji": "🌼", "price": 1410, "lv": 7, "dev": 78, "pop": 0.01}, {"id": "d_shimastatue", "type": "bld", "cat": "deco", "name": "シマエナガの ぞう", "art": "dc_shimastatue", "emoji": "🌼", "price": 1530, "lv": 7, "dev": 85, "pop": 0.01}, {"id": "d_trophystat", "type": "bld", "cat": "deco", "name": "トロフィーの モニュメント", "art": "dc_trophystat", "emoji": "🌼", "price": 1650, "lv": 7, "dev": 92, "pop": 0.01}, {"id": "d_stardeck", "type": "bld", "cat": "deco", "name": "ほしぞら デッキ", "art": "dc_stardeck", "emoji": "🌼", "price": 1770, "lv": 8, "dev": 98, "pop": 0.01}, {"id": "d_flowerclock", "type": "bld", "cat": "deco", "name": "はなどけい", "art": "dc_flowerclock", "emoji": "🌼", "price": 1890, "lv": 8, "dev": 105, "pop": 0.01}, {"id": "d_mushhouse", "type": "bld", "cat": "deco", "name": "きのこの おうち", "art": "dc_mushhouse", "emoji": "🌼", "price": 2020, "lv": 9, "dev": 112, "pop": 0.01}, {"id": "d_crystaltower", "type": "bld", "cat": "deco", "name": "クリスタルタワー", "art": "dc_crystaltower", "emoji": "🌼", "price": 2140, "lv": 9, "dev": 119, "pop": 0.01}, {"id": "d_rainbowfount", "type": "bld", "cat": "deco", "name": "にじの ふんすい", "art": "dc_rainbowfount", "emoji": "🌼", "price": 2260, "lv": 9, "dev": 126, "pop": 0.01}, {"id": "d_minicastle", "type": "bld", "cat": "deco", "name": "ちいさな おしろ", "art": "dc_minicastle", "emoji": "🌼", "price": 2380, "lv": 10, "dev": 132, "pop": 0.01}, {"id": "d_bellarch", "type": "bld", "cat": "deco", "name": "しあわせの かね", "art": "dc_bellarch", "emoji": "🌼", "price": 2500, "lv": 10, "dev": 139, "pop": 0.01}], "foot": {"bunkbed": [1, 2], "futon": [1, 2], "hammock": [2, 1], "kotatsu": [2, 2], "wdesk": [2, 1], "pcdesk": [2, 1], "drawers": [2, 1], "cabinet": [2, 1], "benchin": [2, 1], "bathtub": [2, 1], "gametv": [2, 1], "stereo": [2, 1], "grandpiano": [2, 2], "drums": [2, 1], "sewing": [2, 1], "workbench": [2, 1], "treadmill": [1, 2], "fireplace": [2, 1], "hina": [2, 1], "byobu": [2, 1], "canopybed": [2, 2], "dino": [2, 1], "popcorn": [1, 1]}, "act": {"d_sakura": "rest", "d_maple": "rest", "d_pine": "rest", "d_palm": "rest", "d_bamboo": "rest", "d_sunflower": "water", "d_rosearch": "water", "d_tulip": "water", "d_hedge": "water", "d_bigpot": "water", "d_flowerclock": "water", "d_topiary": "water", "d_swing": "play", "d_slide": "play", "d_sandbox": "play", "d_seesaw": "play", "d_junglegym": "play", "d_trampoline": "play", "d_carousel": "play", "d_springhorse": "play", "d_balloon": "play", "d_picnic": "read", "d_parasol": "read", "d_onsen": "splash", "d_waterfall": "splash", "d_rainbowfount": "splash", "d_koipond": "fishing", "d_duckpond": "fishing", "d_campfire": "music", "d_tent": "music", "d_vegstand": "shop", "d_icestand": "shop", "d_takoyaki": "shop", "d_crepe": "shop", "d_vending": "shop", "d_stardeck": "star", "d_mailbox": "mail", "d_busstop": "train", "d_torii": "look", "d_hokora": "look", "d_jizo": "look", "d_omikuji": "look", "d_clocktower": "look", "d_lighthouse": "look", "d_minicastle": "king", "d_crystaltower": "look", "d_bellarch": "love", "d_coop": "farm", "d_beehive": "farm", "d_doghouse": "love"}};
DEFS12.fur.forEach(f => { if(!FURNITURE.some(x => x.id===f.id)) FURNITURE.push(f); });
Object.assign(FOOT, DEFS12.foot);
DEFS12.fur.forEach(f => { const ft = DEFS12.foot[f.id]; SIDE_W[f.id] = ft ? Math.max(ft[0], 1)*0.95 + (ft[0]>1 ? 0.1 : 0) : 1; });
DEFS12.deco.forEach(d => { if(!TOWN_ITEMS.some(x => x.id===d.id)) TOWN_ITEMS.push(d); });
Object.assign(ACT_OF, DEFS12.act);
BADGES.push(
  {id:'fur30', i:'🛋️', n:'家具 30しゅるい', f:()=>{ const H = save.myhome; if(!H) return false; return new Set(H.items.map(i=>i.id).concat(Object.keys(H.inv))).size >= 30; }},
  {id:'deco30',i:'🌸', n:'かざり 30しゅるい', f:()=>new Set(Object.values(save.town?.cells||{}).filter(id => ITEM(id)?.cat==='deco')).size >= 30},
  {id:'world', i:'🌏', n:'せかいはかせ', f:()=>['w_loc','w_flag','w_cap','w_cont'].reduce((a,k)=>a+((save.math?.stats||{})[k]?.c||0),0) >= 50},
  {id:'chal',  i:'🔥', n:'チャレンジャー', f:()=>(save.chalCnt||0) >= 30}
);


/* =====================================================================
   v1.3：しゃかい 大ぞうりょう（レベル別・偉人）・こたえ かぶり防止・
         ボーナス問題（ぜんぶの 教科）・おねがいは 話しかけて かなえる・もようがえ表示
   ===================================================================== */
const uniq = a => [...new Set(a)];
function optsFrom(ans, pool, n=4){ return shuffle([ans, ...shuffle(uniq(pool).filter(x => x && x!==ans)).slice(0, n-1)]); }

/* ---------- 日本の 偉人 [名前, したこと, 時代] ---------- */
const JP_PEOPLE = [
 ['卑弥呼','邪馬台国の 女王として 国を おさめた','弥生'],['小野妹子','遣隋使として 中国に わたった','飛鳥'],['聖徳太子','十七条の 憲法を 定めた','飛鳥'],
 ['中大兄皇子','大化の改新を 始めた','飛鳥'],['聖武天皇','東大寺に 大仏を つくらせた','奈良'],['行基','人々と 大仏づくりに 協力した 僧','奈良'],
 ['鑑真','唐から 来日して 唐招提寺を 開いた','奈良'],['菅原道真','遣唐使の 廃止を 提案した','平安'],['空海','真言宗を 開いた','平安'],['最澄','天台宗を 開いた','平安'],
 ['藤原道長','摂関政治で 大きな 力を もった','平安'],['紫式部','源氏物語を 書いた','平安'],['清少納言','枕草子を 書いた','平安'],
 ['平清盛','武士で 初めて 太政大臣に なった','平安'],['源頼朝','鎌倉幕府を 開いた','鎌倉'],['北条政子','承久の乱で 御家人を まとめた','鎌倉'],
 ['北条時宗','元の 襲来（元寇）と 戦った 執権','鎌倉'],['法然','浄土宗を 開いた','鎌倉'],['親鸞','浄土真宗を 開いた','鎌倉'],['日蓮','日蓮宗を 開いた','鎌倉'],
 ['運慶','東大寺の 金剛力士像を つくった','鎌倉'],['足利義満','金閣を 建てた','室町'],['足利義政','銀閣を 建てた','室町'],['雪舟','水墨画を 大成した','室町'],
 ['織田信長','楽市・楽座を 行った','安土桃山'],['豊臣秀吉','検地と 刀狩を 行い 全国を 統一した','安土桃山'],['千利休','わび茶を 大成した','安土桃山'],
 ['徳川家康','江戸幕府を 開いた','江戸'],['徳川家光','参勤交代を 制度に した','江戸'],['天草四郎','島原・天草一揆の 中心人物','江戸'],
 ['徳川吉宗','享保の改革を 行った','江戸'],['近松門左衛門','人形浄瑠璃の 脚本を 書いた','江戸'],['松尾芭蕉','奥の細道を あらわした 俳人','江戸'],
 ['葛飾北斎','富嶽三十六景を えがいた','江戸'],['歌川広重','東海道五十三次を えがいた','江戸'],['本居宣長','古事記伝を あらわし 国学を 大成した','江戸'],
 ['杉田玄白','解体新書を 出版した','江戸'],['伊能忠敬','歩いて 正確な 日本地図を つくった','江戸'],['吉田松陰','松下村塾で 多くの 人を 育てた','江戸'],
 ['坂本龍馬','薩長同盟を 仲立ちした','江戸'],['勝海舟','咸臨丸で 太平洋を わたった','江戸'],['西郷隆盛','江戸城の 無血開城を 実現した','江戸'],
 ['大久保利通','廃藩置県を 進めた 明治政府の 中心人物','明治'],['木戸孝允','五箇条の御誓文の 作成に かかわった','明治'],['福沢諭吉','学問のすゝめを 書いた','明治'],
 ['伊藤博文','初代 内閣総理大臣に なった','明治'],['板垣退助','自由民権運動を 進めた','明治'],['大隈重信','早稲田大学を つくった','明治'],
 ['陸奥宗光','領事裁判権を なくした 外務大臣','明治'],['小村寿太郎','関税自主権を 回復した','明治'],['東郷平八郎','日本海海戦で 勝利した','明治'],
 ['北里柴三郎','破傷風の 治療法を 発見した','明治'],['樋口一葉','たけくらべを 書いた 女性作家','明治'],['夏目漱石','吾輩は猫であるを 書いた','明治'],
 ['与謝野晶子','君死にたまふことなかれを よんだ','明治'],['津田梅子','女子英学塾を つくった','明治'],['渋沢栄一','多くの 会社を つくり 日本経済の父と よばれる','明治'],
 ['野口英世','黄熱病の 研究を した','大正'],['平塚らいてう','女性の 地位向上を 目指した','大正'],['新渡戸稲造','国際連盟の 事務次長を つとめた','大正'],
 ['宮沢賢治','銀河鉄道の夜を 書いた','大正'],['湯川秀樹','日本人で 初めて ノーベル賞を うけた','昭和'],['手塚治虫','鉄腕アトムを えがいた 漫画家','昭和']
];
const ERAS = ['弥生','古墳','飛鳥','奈良','平安','鎌倉','室町','安土桃山','江戸','明治','大正','昭和'];
/* ---------- 世界の 偉人 [名前, したこと, 国] ---------- */
const W_PEOPLE = [
 ['エジソン','電球を 実用化した','アメリカ'],['ライト兄弟','動力飛行機で 初めて 空を 飛んだ','アメリカ'],['ニュートン','万有引力を 発見した','イギリス'],
 ['アインシュタイン','相対性理論を 発表した','ドイツ'],['ガリレオ・ガリレイ','望遠鏡で 木星の 衛星を 発見した','イタリア'],['ダーウィン','進化論を となえた','イギリス'],
 ['キュリー夫人','ラジウムを 発見した',''],['ナイチンゲール','看護の 母と よばれる','イギリス'],['ベートーベン','交響曲第9番を 作曲した','ドイツ'],
 ['モーツァルト','魔笛を 作曲した','オーストリア'],['バッハ','音楽の 父と よばれる','ドイツ'],['ショパン','ピアノの 詩人と よばれる 作曲家','ポーランド'],
 ['レオナルド・ダ・ヴィンチ','モナ・リザを えがいた','イタリア'],['ゴッホ','ひまわりを えがいた','オランダ'],['ピカソ','ゲルニカを えがいた','スペイン'],
 ['シェイクスピア','ロミオとジュリエットを 書いた','イギリス'],['アンデルセン','人魚姫などの 童話を 書いた','デンマーク'],['グリム兄弟','白雪姫などの 昔話を 集めた','ドイツ'],
 ['ファーブル','昆虫記を 書いた','フランス'],['ヘレン・ケラー','障がいを のりこえ 福祉に つくした','アメリカ'],['リンカーン','奴隷解放宣言を 出した','アメリカ'],
 ['ワシントン','アメリカの 初代大統領に なった','アメリカ'],['ナポレオン','フランスの 皇帝に なった','フランス'],['ジャンヌ・ダルク','百年戦争で フランスを すくった','フランス'],
 ['ガンディー','非暴力で インド独立運動を 指導した','インド'],['マザー・テレサ','インドで まずしい 人々を たすけた',''],['キング牧師','アメリカで 公民権運動を 指導した','アメリカ'],
 ['マンデラ','南アフリカで アパルトヘイトと 戦った','南アフリカ'],['ザビエル','日本に キリスト教を 伝えた','スペイン'],['ペリー','黒船で 浦賀に 来航した','アメリカ'],
 ['マルコ・ポーロ','東方見聞録で 日本を 黄金の国と しょうかいした','イタリア'],['マゼラン','船隊が 初めて 世界一周を なしとげた','ポルトガル'],
 ['ベル','電話を 発明した',''],['ノーベル','ダイナマイトを 発明した','スウェーデン'],['パスツール','狂犬病の ワクチンを つくった','フランス'],
 ['フレミング','ペニシリンを 発見した','イギリス'],['アームストロング','初めて 月面を 歩いた','アメリカ'],['ガガーリン','初めて 宇宙飛行を した',''],
 ['孔子','儒教を おこした','中国'],['始皇帝','中国を 初めて 統一した','中国'],['チンギス・ハン','モンゴル帝国を つくった','モンゴル'],
 ['ルター','宗教改革を 始めた','ドイツ'],['メンデル','遺伝の 法則を 発見した',''],['ウォルト・ディズニー','ミッキーマウスを 生み出した','アメリカ'],
 ['スティーブ・ジョブズ','iPhoneを 生み出した','アメリカ'],['コロンブス','大西洋を わたり アメリカ大陸に 到達した',''],['ゲーテ','ファウストを 書いた','ドイツ']
];
/* ---------- 日本の 歴史 [できごと, 時代, 年] ---------- */
const J_EVENTS = [
 ['米づくりが 広まる','弥生',0],['大きな 古墳が つくられる','古墳',0],['法隆寺が 建てられる','飛鳥',607],['大化の改新','飛鳥',645],['大宝律令が できる','飛鳥',701],
 ['平城京に 都を うつす','奈良',710],['東大寺の 大仏が 完成','奈良',752],['平安京に 都を うつす','平安',794],['遣唐使の 廃止','平安',894],['壇ノ浦の戦い','平安',1185],
 ['元寇（文永の役）','鎌倉',1274],['室町幕府が 開かれる','室町',1338],['応仁の乱','室町',1467],['鉄砲が 伝わる','室町',1543],['キリスト教が 伝わる','室町',1549],
 ['長篠の戦い','安土桃山',1575],['本能寺の変','安土桃山',1582],['関ヶ原の戦い','安土桃山',1600],['江戸幕府が 開かれる','江戸',1603],['島原・天草一揆','江戸',1637],
 ['ペリーが 来航','江戸',1853],['大政奉還','江戸',1867],['五箇条の御誓文','明治',1868],['廃藩置県','明治',1871],['大日本帝国憲法の 発布','明治',1889],
 ['日清戦争','明治',1894],['日露戦争','明治',1904],['第一次世界大戦','大正',1914],['関東大震災','大正',1923],['普通選挙法','大正',1925],
 ['太平洋戦争が 始まる','昭和',1941],['戦争が 終わる（終戦）','昭和',1945],['日本国憲法の 公布','昭和',1946],['東京オリンピック（1回目）','昭和',1964]
];
/* ---------- 問題バンク [問題, 正解, ちがう こたえ×3] ---------- */
const BANK = {
 jgeo:[ // 日本の 地理（小5・6）
  ['日本で いちばん 広い 平野は？','関東平野','石狩平野','越後平野','濃尾平野'],['日本で いちばん 流域面積が 広い 川は？','利根川','信濃川','石狩川','木曽川'],
  ['「日本の 屋根」と よばれる 山脈の あつまりは？','日本アルプス','奥羽山脈','中国山地','四国山地'],['東北地方を 南北に はしる 山脈は？','奥羽山脈','日高山脈','飛騨山脈','鈴鹿山脈'],
  ['日本の 最も 北に ある 島は？','択捉島','与那国島','沖ノ鳥島','南鳥島'],['日本の 最も 西に ある 島は？','与那国島','択捉島','沖ノ鳥島','南鳥島'],
  ['日本の 最も 南に ある 島は？','沖ノ鳥島','与那国島','択捉島','南鳥島'],['日本の 最も 東に ある 島は？','南鳥島','択捉島','与那国島','沖ノ鳥島'],
  ['日本海側の 冬に 多い 天気は？','雪が 多い','雨が 少ない','とても あつい','台風が 多い'],['太平洋側の 冬の 天気の とくちょうは？','かんそうして 晴れが 多い','雪が とても 多い','毎日 雨','台風が 多い'],
  ['夏から 秋に 沖縄や 九州に 多く くる ものは？','台風','流氷','黄砂','やませ'],['北海道の オホーツク海に 冬に やってくる ものは？','流氷','台風','黄砂','梅雨前線'],
  ['米の 生産量が 多い 地方は？','東北地方','四国地方','近畿地方','沖縄県'],['りんごの 生産量 日本一の 県は？','青森県','長野県','山形県','岩手県'],
  ['みかんの 生産量が 多い 県は？','和歌山県','青森県','北海道','新潟県'],['茶の 生産量が 多い 県は？','静岡県','青森県','北海道','新潟県'],
  ['自動車の 生産が さかんな 工業地帯は？','中京工業地帯','北九州工業地帯','京葉工業地域','北陸工業地域'],['日本最大の 工業地帯（出荷額）は？','中京工業地帯','阪神工業地帯','京浜工業地帯','北九州工業地帯'],
  ['太平洋ベルトに ふくまれない 地域は？','北海道の 内陸','東海','瀬戸内','阪神'],['冬でも あたたかく ビニールハウスで 野菜を つくる 方法は？','促成栽培','抑制栽培','二毛作','輪作'],
  ['夏でも すずしい 高原で レタスなどを つくる 方法は？','抑制栽培','促成栽培','養殖','二期作'],['魚や 貝を 育てて とる 漁業は？','養殖業','遠洋漁業','沖合漁業','沿岸漁業'],
  ['たまごから 育てた 稚魚を 川や 海に 放す 漁業は？','栽培漁業','遠洋漁業','養殖業','沖合漁業'],['日本で いちばん 人口が 多い 都道府県は？','東京都','大阪府','神奈川県','愛知県'],
  ['日本で いちばん 人口が 少ない 都道府県は？','鳥取県','島根県','高知県','徳島県'],['日本の 人口は おおよそ 何人？','約1億2千万人','約5千万人','約3億人','約8千万人'],
  ['世界遺産 白神山地が ある 地方は？','東北地方','九州地方','中国地方','四国地方'],['世界遺産 屋久島が ある 県は？','鹿児島県','沖縄県','宮崎県','長崎県'],
  ['原爆ドームが ある 県は？','広島県','長崎県','岡山県','山口県'],['日本で いちばん 深い 湖は？','田沢湖','琵琶湖','摩周湖','霞ヶ浦'],
  ['日本三景に ふくまれる ものは？','天橋立','富士山','琵琶湖','阿蘇山'],['火山の 熱を 利用する 発電は？','地熱発電','火力発電','原子力発電','水力発電'],
  ['ダムの 水の 力で 電気を つくる 発電は？','水力発電','火力発電','地熱発電','風力発電'],['日本の 発電で いちばん 多い 方法は？','火力発電','水力発電','風力発電','地熱発電'],
  ['日本が 多く 輸入している 燃料は？','原油','米','木材だけ','たまご'],['日本の 輸出品で 多い ものは？','自動車','原油','石炭','鉄鉱石'],
  ['海に かこまれた 日本の まわりの 浅い 海底を 何という？','大陸だな','海溝','カルデラ','扇状地'],['川が 山から 平地に 出る ところに できる 地形は？','扇状地','三角州','カルデラ','リアス海岸'],
  ['川の 河口に できる 三角形の 地形は？','三角州','扇状地','台地','盆地'],['入り組んだ 海岸線で 三陸海岸などに 見られる 地形は？','リアス海岸','砂浜海岸','扇状地','三角州'],
  ['まわりを 山に かこまれた 平らな 土地は？','盆地','平野','台地','半島'],['北海道で 牛を 育て 牛乳を つくる 農業は？','酪農','稲作','果樹栽培','養蚕'],
  ['日本の 国土の 約何割が 森林？','約7割','約3割','約1割','約9割'],['日本の 標準時子午線が 通る 市は？','明石市','東京都','大阪市','札幌市']
 ],
 civ1:[ // くらしと 政治（小5・6）
  ['日本国憲法の 三つの 原則に ふくまれる ものは？','平和主義','天皇主権','鎖国','身分制度'],['国の 政治の 主人公は 国民で あるという 考えは？','国民主権','平和主義','三権分立','地方自治'],
  ['日本国憲法が 施行された 日（5月3日）は 何の 日？','憲法記念日','文化の日','こどもの日','みどりの日'],['日本国憲法が 公布された 日（11月3日）は 今の 何の 日？','文化の日','憲法記念日','建国記念の日','勤労感謝の日'],
  ['国の 法律を つくる ところは？','国会','内閣','裁判所','市役所'],['国の 政治を 実際に 行う ところは？','内閣','国会','裁判所','警察'],
  ['争いごとや 犯罪を 法律に もとづいて 判断する ところは？','裁判所','国会','内閣','税務署'],['国会・内閣・裁判所に 国の 力を 分ける しくみは？','三権分立','国民主権','地方自治','議院内閣制'],
  ['内閣の 長は？','内閣総理大臣','天皇','最高裁判所長官','衆議院議長'],['国会に ある 2つの 議院は 衆議院と？','参議院','貴族院','市議会','県議会'],
  ['選挙で 投票できる 年れいは？','18さい以上','20さい以上','16さい以上','25さい以上'],['税金の うち 買い物の ときに はらう 税は？','消費税','所得税','住民税','法人税'],
  ['市や 町が 住民の ために 行う 政治は？','地方自治','三権分立','国際連合','鎖国'],['天皇は 日本国の 何と 定められている？','象徴','元首','首相','国王'],
  ['憲法で 子どもに 教育を 受けさせる ことは 国民の？','義務','権利だけ','自由','趣味'],['国民の 三大義務に ふくまれない ものは？','選挙に 行く 義務','納税の 義務','勤労の 義務','教育を 受けさせる 義務'],
  ['世界の 平和を 守るために つくられた 国際機関は？','国際連合','国際連盟','NATO','EU'],['国際連合の 本部が ある 都市は？','ニューヨーク','ジュネーブ','パリ','東京'],
  ['子どもの 権利を 守る 国際的な 約束は？','子どもの権利条約','日米安保条約','ポツダム宣言','下関条約'],['ユニセフ（UNICEF）は 何を する 機関？','子どもを 守る','お金を 貸す','スポーツを する','宇宙を 調べる'],
  ['ごみを へらす 3Rに ふくまれる ものは？','リデュース','リターン','リセット','リメイク'],['地球の 気温が 上がる 問題は？','地球温暖化','酸性雨だけ','オゾン層の 増加','流氷の 増加'],
  ['温室効果ガスの 代表は？','二酸化炭素','酸素','ちっ素','水素'],['災害の ときに 危険な 場所を しめした 地図は？','ハザードマップ','観光マップ','路線図','天気図'],
  ['地震の あとに 海から おしよせる 大波は？','津波','高潮','台風','竜巻'],['災害の ときに 地域で 助け合うことを 何という？','共助','自助','公助','互換'],
  ['食料の うち 国内で つくられる 割合を 何という？','食料自給率','人口密度','出生率','失業率'],['日本の 食料自給率（カロリー）は およそ？','約4割','約8割','約1割','約10割']
 ],
 civ2:[ // 公民（中学）
  ['日本国憲法の 基本原理に ふくまれない ものは？','天皇主権','国民主権','基本的人権の尊重','平和主義'],['憲法 第9条に 定められている ことは？','戦争の 放棄','納税の 義務','選挙権','表現の 自由'],
  ['国会で 予算を 先に 審議する 議院は？','衆議院','参議院','どちらでも よい','最高裁判所'],['衆議院議員の 任期は？','4年','6年','3年','2年'],
  ['参議院議員の 任期は？','6年','4年','3年','5年'],['内閣が 国会に 対して 責任を もつ しくみは？','議院内閣制','大統領制','三審制','地方自治'],
  ['裁判を 3回まで 受けられる しくみは？','三審制','三権分立','議院内閣制','陪審制'],['国民が 裁判に 参加する 日本の 制度は？','裁判員制度','陪審員制度','国民審査','直接請求'],
  ['最高裁判所の 裁判官を 国民が 審査する しくみは？','国民審査','国民投票','弾劾裁判','住民投票'],['憲法改正に 必要な 国民の 手続きは？','国民投票','国民審査','住民投票','世論調査'],
  ['法律が 憲法に 違反して いないかを 判断する 権限は？','違憲審査権','弾劾裁判','国政調査権','条例制定権'],['地方公共団体が 定める きまりは？','条例','法律','政令','条約'],
  ['住民が 首長の 解職を 求める ことを 何という？','リコール','イニシアティブ','レファレンダム','ロビー活動'],['国の 収入と 支出の 計画は？','予算','決算','税制','条例'],
  ['所得が 多いほど 税率が 高くなる しくみは？','累進課税','消費税','間接税','関税'],['日本の 中央銀行は？','日本銀行','ゆうちょ銀行','国際通貨基金','世界銀行'],
  ['物価が 上がり続ける 現象は？','インフレーション','デフレーション','バブル','リセッション'],['物価が 下がり続ける 現象は？','デフレーション','インフレーション','好景気','円安'],
  ['円の 価値が 上がる ことを 何という？','円高','円安','インフレ','デフレ'],['需要が 供給より 多いと 価格は ふつう どうなる？','上がる','下がる','変わらない','なくなる'],
  ['働く 人の 権利を 守る 法律で 労働時間などを 定めたものは？','労働基準法','独占禁止法','製造物責任法','消費者契約法'],['企業どうしの 不公正な 競争を ふせぐ 法律は？','独占禁止法','労働基準法','民法','刑法'],
  ['商品の 欠陥で けがを したとき 製造者に 責任を 問える 法律は？','製造物責任法','独占禁止法','労働組合法','消費税法'],['訪問販売などで 一定期間 契約を 解除できる 制度は？','クーリング・オフ','リコール','セーフガード','インフォームド・コンセント'],
  ['国連の 安全保障理事会で 常任理事国が もつ 権限は？','拒否権','選挙権','請願権','黙秘権'],['安全保障理事会の 常任理事国に ふくまれない 国は？','日本','アメリカ','中国','フランス'],
  ['ヨーロッパの 国々が つくる 共同体は？','EU','ASEAN','APEC','NAFTA'],['東南アジアの 国々の 協力組織は？','ASEAN','EU','OPEC','NATO'],
  ['持続可能な 開発目標の 略称は？','SDGs','ODA','NGO','PKO'],['政府の 開発援助の 略称は？','ODA','NGO','PKO','WHO'],
  ['新しい 人権に ふくまれる ものは？','環境権','選挙権','請願権','財産権'],['自分の 情報を 守る 権利は？','プライバシーの権利','知る権利','参政権','労働基本権'],
  ['すべての 国民に 健康で 文化的な 最低限度の 生活を 保障する 権利は？','生存権','自由権','参政権','請求権'],['社会保障の 4つの 柱に ふくまれない ものは？','防衛','社会保険','公的扶助','公衆衛生']
 ],
 wgeo:[ // 世界の 地理（中学）
  ['世界で いちばん 長い 川は？','ナイル川','アマゾン川','長江','ミシシッピ川'],['世界で いちばん 流域面積が 広い 川は？','アマゾン川','ナイル川','長江','ボルガ川'],
  ['世界で いちばん 高い 山は？','エベレスト','キリマンジャロ','マッキンリー','富士山'],['世界で いちばん 面積が 大きい 国は？','ロシア','カナダ','中国','アメリカ'],
  ['世界で いちばん 面積が 小さい 国は？','バチカン市国','モナコ','シンガポール','ルクセンブルク'],['世界で いちばん 人口が 多い 国（2023年〜）は？','インド','中国','アメリカ','インドネシア'],
  ['世界で いちばん 大きな 砂漠は（極地を のぞく）？','サハラ砂漠','ゴビ砂漠','アタカマ砂漠','カラハリ砂漠'],['世界で いちばん 大きな 大陸は？','ユーラシア大陸','アフリカ大陸','北アメリカ大陸','南極大陸'],
  ['世界で いちばん 小さな 大陸は？','オーストラリア大陸','南極大陸','南アメリカ大陸','アフリカ大陸'],['世界で いちばん 広い 海洋は？','太平洋','大西洋','インド洋','北極海'],
  ['赤道が 通らない 国は？','日本','ブラジル','ケニア','インドネシア'],['本初子午線が 通る 都市は？','ロンドン','パリ','東京','ニューヨーク'],
  ['日本と 時差が 約14時間ある 都市は？','ニューヨーク','北京','ロンドン','シドニー'],['経度 15度で 何時間の 時差？','1時間','2時間','15時間','30分'],
  ['インドで 多くの 人が 信仰する 宗教は？','ヒンドゥー教','仏教','キリスト教','神道'],['イスラム教の 聖地が ある 国は？','サウジアラビア','インド','イタリア','タイ'],
  ['アメリカで 大規模に 行われる 農業の 特色は？','適地適作','焼畑農業','二期作だけ','遊牧'],['オーストラリアで 多く 産出し 日本が 輸入する 資源は？','鉄鉱石','原油','米','綿花'],
  ['南アメリカで 多く 話される 言語は？','スペイン語','英語','中国語','ロシア語'],['ブラジルで 主に 話される 言語は？','ポルトガル語','スペイン語','英語','フランス語'],
  ['アフリカで 多く 産出する レアメタルなどの 鉱産資源を 何という？','レアメタル','原油','石灰石','米'],['中国で 外国企業を まねくために つくった 地区は？','経済特区','保護区','自治区','特別区'],
  ['ヨーロッパで 多く 使われる 共通通貨は？','ユーロ','ドル','ポンド','元'],['北極に 近い 地域で 見られる 白夜とは？','夏に 夜も 暗くならない','冬に 雨が 多い','一日中 暑い','雪が ふらない']
 ]
};
/* ---------- 問題を つくる ---------- */
const mk = (q, ans, opts, extra={}) => Object.assign({type:'choice', q, ans, opts, hint:''}, extra);
function bankGen(key, art){ return function(){ const r = choice(BANK[key]); return mk(r[0], r[1], shuffle(r.slice(1)), {disp: art ? PIC(art) : '', sub:r[0]}); }; }
Object.assign(MATH_UNITS, {
  j_person:{n:'日本の 偉人（だれ？）', g:'soc', lv:2, art:'sq_worker', gen(){ const p = choice(JP_PEOPLE);
    return mk(`<b>${p[1]}</b> 人物は？`, p[0], optsFrom(p[0], JP_PEOPLE.map(x=>x[0])), {hint:`${p[2]}時代の 人だよ`, sub:p[0]}); }},
  j_person2:{n:'日本の 偉人（何を した？）', g:'soc', lv:3, art:'sq_worker', gen(){ const p = choice(JP_PEOPLE), k = ri(0,1);
    if(k===0) return mk(`<b>${p[0]}</b> が したことは？`, p[1], optsFrom(p[1], JP_PEOPLE.map(x=>x[1])), {hint:`${p[2]}時代の 人`, sub:p[0]});
    return mk(`<b>${p[0]}</b> が 活やくした 時代は？`, p[2], optsFrom(p[2], ERAS), {sub:p[0]}); }},
  w_person:{n:'世界の 偉人', g:'soc', lv:2, art:'sq_fireman', gen(){ const p = choice(W_PEOPLE), k = ri(0,2);
    if(k===0) return mk(`<b>${p[1]}</b> 人物は？`, p[0], optsFrom(p[0], W_PEOPLE.map(x=>x[0])), {sub:p[0]});
    if(k===1 || !p[2]) return mk(`<b>${p[0]}</b> が したことは？`, p[1], optsFrom(p[1], W_PEOPLE.map(x=>x[1])), {sub:p[0]});
    return mk(`<b>${p[0]}</b> は どこの 国の 人？`, p[2], optsFrom(p[2], W_PEOPLE.map(x=>x[2])), {sub:p[0]}); }},
  j_era:{n:'歴史の できごと（時代）', g:'soc', lv:2, art:'sq_oldiron', gen(){ const e = choice(J_EVENTS);
    return mk(`<b>${e[0]}</b> は 何時代の できごと？`, e[1], optsFrom(e[1], ERAS), {sub:e[0]}); }},
  j_year:{n:'歴史の 年号', g:'soc', lv:3, art:'sq_oldiron', gen(){ const ev = J_EVENTS.filter(x => x[2]), e = choice(ev);
    return mk(`<b>${e[0]}</b> は 何年？`, e[2]+'年', optsFrom(e[2]+'年', ev.map(x => x[2]+'年')), {hint:`${e[1]}時代の できごと`, sub:e[0]}); }},
  j_order:{n:'歴史の じゅんばん', g:'soc', lv:3, art:'sq_oldiron', gen(){
    const ev = J_EVENTS.filter(x => x[2]); let a, b; do{ a = choice(ev); b = choice(ev); }while(a===b || a[2]===b[2]);
    const first = a[2] < b[2] ? a : b;
    return mk(`<b>${a[0]}</b> と <b>${b[0]}</b>、先に 起きたのは？`, first[0], shuffle([a[0], b[0]]), {sub:a[0]+b[0]}); }},
  j_geo:{n:'日本の 地理（くわしく）', g:'soc', lv:2, art:'so_factory', gen:bankGen('jgeo', null)},
  civ1:{n:'くらしと 政治', g:'soc', lv:2, art:'so_firepol', gen:bankGen('civ1', null)},
  civ2:{n:'公民（政治・経済）', g:'soc', lv:3, art:'ui_building', gen:bankGen('civ2', null)},
  w_geo:{n:'世界の 地理', g:'soc', lv:3, art:'so_compass', gen:bankGen('wgeo', null)}
});
/* 地理の 問題に 地図を つける */
const _jg = MATH_UNITS.j_geo.gen; MATH_UNITS.j_geo.gen = function(){ const p = _jg(); p.disp = `<svg class="jpMap sm" viewBox="0 0 400 440">${jpBase()}</svg>`; return p; };
const _wg = MATH_UNITS.w_geo.gen; MATH_UNITS.w_geo.gen = function(){ const p = _wg(); p.disp = worldSVG(null, {}); return p; };
/* レベル */
const SOC_LV = {s_sym:1, s_dir:1, s_life:1, s_old:1, s_loc:1, s_region:1, s_food:1, w_flag:1,
  s_cap:2, s_jp:2, j_geo:2, j_era:2, j_person:2, w_person:2, civ1:2, w_loc:2, w_cont:2,
  j_year:3, j_order:3, j_person2:3, civ2:3, w_cap:3, w_geo:3};
Object.entries(SOC_LV).forEach(([k,l]) => { if(MATH_UNITS[k]) MATH_UNITS[k].lv = l; });
const SOC_LEVELS = [[1,'小学3・4年'],[2,'小学5・6年'],[3,'中学生']];
const SOC_CAT = {s_loc:'🗾 都道府県', s_region:'🗾 都道府県', s_food:'🗾 都道府県', s_cap:'🗾 都道府県', s_sym:'🧭 地図', s_dir:'🧭 地図',
  s_life:'🏘 くらし', s_old:'🏘 くらし', s_jp:'🏔 日本の 地理', j_geo:'🏔 日本の 地理', j_era:'📜 歴史', j_year:'📜 歴史', j_order:'📜 歴史',
  j_person:'👤 日本の 偉人', j_person2:'👤 日本の 偉人', w_person:'🌍 世界の 偉人', civ1:'⚖️ 政治', civ2:'⚖️ 政治', w_loc:'🌏 世界', w_flag:'🌏 世界', w_cont:'🌏 世界', w_cap:'🌏 世界', w_geo:'🌏 世界'};
renderSoc = function(){
  const M = mSave(); if(M.socSel && !SS.loaded){ SS.loaded = 1; SS.units = M.socSel.filter(k => MATH_UNITS[k]); } if(!SS.units.length) SS.units = ['s_loc'];
  const lv = M.socLv || 1;
  const ks = Object.keys(SOC_LV).filter(k => SOC_LV[k]===lv && MATH_UNITS[k]);
  const cats = uniq(ks.map(k => SOC_CAT[k]));
  $('#sUnits').innerHTML = `<div class="miniSeg" id="sLvTabs">${SOC_LEVELS.map(([l,n]) => `<button data-sl="${l}" class="${l===lv?'on':''}">${n}</button>`).join('')}</div>` +
    cats.map(c => `<h4 class="sGrp">${c}</h4><div class="sGrid">${ks.filter(k => SOC_CAT[k]===c).map(k => { const u = MATH_UNITS[k], s = M.stats[k] || {n:0, c:0}, rate = s.n ? Math.round(s.c/s.n*100) : null;
      return `<button class="mUnit soc ${SS.units.includes(k)?'on':''}" data-su="${k}"><img class="mIco" src="${esc(artSrc(u.art))}" alt=""><span class="mTxt"><b>${u.n}</b><small>${s.n ? `${s.c}/${s.n} せいかい` : 'まだ やってない'}</small>${rate!=null?`<i class="mBar"><i style="width:${rate}%"></i></i>`:''}</span>${SS.units.includes(k)?'<span class="mChk">✓</span>':''}</button>`; }).join('')}</div>`).join('') +
    `<div class="note" style="margin-top:8px">えらんだ たんげん：${SS.units.map(k => MATH_UNITS[k]?.n).filter(Boolean).join('・')}</div>`;
  syncSeg('sCount', SS.count); M.socSel = SS.units.slice(); persist();
};
document.addEventListener('click', e => { const b = e.target.closest('[data-sl]'); if(!b) return; mSave().socLv = +b.dataset.sl; persist(); renderSoc(); });

/* ---------- こたえ かぶり防止 ---------- */
buildSet = function(units, count){
  const list = [], seenQ = new Set(), seenA = new Set(), seenS = new Set();
  for(let i=0;i<count;i++){
    let p = null, best = null;
    for(let t=0;t<60;t++){
      const k = choice(units), c = {u:k, ...MATH_UNITS[k].gen()};
      const kq = qKeyOf(c), ka = c.u.startsWith('s_')||c.u.startsWith('w_')||c.u.startsWith('j_')||c.u.startsWith('civ') ? 'A:'+c.ans : null, ks = c.sub ? 'S:'+c.sub : null;
      if(seenQ.has(kq)) continue;
      if(!best) best = c;
      if((ka && seenA.has(ka)) || (ks && seenS.has(ks))) continue;
      p = c; break;
    }
    p = p || best || {u:units[0], ...MATH_UNITS[units[0]].gen()};
    seenQ.add(qKeyOf(p)); if(p.sub) seenS.add('S:'+p.sub); seenA.add('A:'+p.ans); list.push(p);
  }
  return list;
};
/* 都道府県・国の 問題にも「何の 話題か」を つける（同じ 県・国が 2回 出ない） */
['s_loc','s_cap','s_food','s_region','w_loc','w_flag','w_cap','w_cont'].forEach(k => { const g = MATH_UNITS[k].gen; MATH_UNITS[k].gen = function(){ const p = g();
  const bm = (p.q.match(/<b>(.*?)<\/b>/)||[])[1] || '';
  p.sub = /[都道府県]$/.test(bm) || ((k==='w_cap') && bm) ? bm : p.ans;
  const m = bm.match(/（(.+?)）/); if(m) p.sub = m[1];
  return p; }; });

/* =====================================================================
   ボーナス問題（さんすう・しゃかい・えいご）：にがて＆むずかしい 問題
   ===================================================================== */
function hardUnits(units, soc){
  if(soc){ const lv = Math.max(...units.map(k => MATH_UNITS[k].lv || 1)); const up = Math.min(3, lv + 1);
    const ks = Object.keys(SOC_LV).filter(k => SOC_LV[k]===up && MATH_UNITS[k]); return ks.length ? ks : units; }
  const gs = units.map(k => MATH_UNITS[k].g).filter(g => typeof g==='number'), g = gs.length ? Math.max(...gs) : 3;
  const up = Object.keys(MATH_UNITS).filter(k => MATH_UNITS[k].g === Math.min(5, g+1));
  return up.length ? up : units;
}
function pickHardQ(units, soc){
  const H = qh(), used = new Set(MQ.list.map(qKeyOf));
  const weak = Object.entries(H).filter(([k,r]) => r.w > 0 && r.s === 0).map(([k]) => k.split(':')[0]);
  const pool = uniq(hardUnits(units, soc).concat(units.filter(u => weak.includes(u))));
  let best = null, bs = -1;
  for(let t=0;t<16;t++){
    const k = choice(pool), c = {u:k, ...MATH_UNITS[k].gen()}; if(used.has(qKeyOf(c))) continue;
    const r = H[qKeyOf(c)], sc = (r ? r.w*3 : 1) + (hardUnits(units, soc).includes(k) ? 2 : 0) + Math.random();
    if(sc > bs){ bs = sc; best = c; }
  }
  return best;
}
const BONUS_PT = 50;
const _mJudge13 = mJudge;
mJudge = function(v){
  const was = MQ && MQ.done, p = MQ.list[MQ.i];
  const out = _mJudge13(v);
  if(was) return out;
  const ok = MQ.res[MQ.res.length-1]?.ok;
  if(p.bonus){
    if(ok){ const b = givePts(Math.round(BONUS_PT*bonusBoost()), 'ボーナス問題 せいかい'); MQ.pts += b; save.counters.bonus++; persist();
      $('#mFb').insertAdjacentHTML('beforeend', `<div class="bonusGot">⭐ ボーナス +${b}pt！</div>`); }
    MQ.bonusOn = false;
  } else if(ok && save.settings.bonus && !MQ.bonusOn && (MQ.bonusN||0) < 2 && MQ.combo >= 3 && MQ.i - (MQ.lastB ?? -9) >= 3 && Math.random() < Math.min(.9, .4*bonusBoost())){
    const units = window.MQREV ? uniq(MQ.list.map(x => x.u)) : window.MQBUN ? BS.units : window.MQEK ? KS.units : window.MQSCI ? RS.units : window.MQSOC ? SS.units : MS.units, q = pickHardQ(units, !!window.MQSOC);
    if(q){ q.bonus = true; MQ.list.splice(MQ.i+1, 0, q); MQ.bonusN = (MQ.bonusN||0)+1; MQ.lastB = MQ.i; MQ.bonusOn = true; $('#mNext').textContent = '⭐ ボーナスへ ▶'; }
  }
  return out;
};
const _mRender13 = mRender;
mRender = function(){
  const p = MQ.list[MQ.i];
  if(p && p.bonus && !p.intro){
    p.intro = 1;
    $('#bonusTitle').textContent = '⭐ ボーナスもんだい！';
    $('#bonusDesc').innerHTML = `にがてな 問題・むずかしい 問題だよ！<br>せいかいで <b>+${BONUS_PT}pt</b>`;
    $('#bonusIntro').classList.add('show'); sound('fan'); confetti(1200);
    $('#bonusGo').onclick = () => { $('#bonusIntro').classList.remove('show'); mRender(); };
    return;
  }
  _mRender13();
  $('.mCard').classList.toggle('bonusCard', !!(p && p.bonus));
  document.body.classList.toggle('bonusMode', !!(p && p.bonus));
  if(p && p.bonus) $('#mTag').insertAdjacentHTML('afterbegin', '<span class="bonusTag">⭐ ボーナス</span> ');
  $('#mProg').textContent = `${MQ.list.slice(0, MQ.i+1).filter(x => !x.bonus).length} / ${MQ.list.filter(x => !x.bonus).length}`;
};
/* かんじの ボンボーナスの もとの ボタンを もどす */
const _bonusGoKanji = $('#bonusGo').onclick;
const _openBonus13 = openBonus;
openBonus = function(){ $('#bonusGo').onclick = _bonusGoKanji; $('#bonusDesc').innerHTML = ''; _openBonus13(); $('#bonusDesc').insertAdjacentHTML('afterbegin', 'にがてな 漢字に チャレンジ！<br>'); };
/* かんじ：テスト モード いがい ぜんぶで ボーナス・にがて優先 */
pickBonusQ = function(){
  const used = new Set(S.list.map(q=>q.id)), k = S.kind==='write' ? 'w' : 'r';
  let pool = poolFor(S.kind, 'all').filter(q => !used.has(q.id)); if(!pool.length) pool = poolFor(S.kind, 'all');
  const score = q => { const s = save.stats[q.id]; const w = s ? s[k][1] : 0, c = s ? s[k][0] : 0;
    return w*4 - c*0.5 + kanjiOf(q.word).length*1.5 + (q.grade > 3 ? 3 : 0) + Math.random()*2; };
  pool.sort((a,b) => score(b)-score(a));
  return pool[Math.random()*Math.min(5,pool.length)|0];
};

/* えいご：ボーナス（にがてな 文） */
const _engJudge13 = engJudge;
engJudge = function(r){
  if(ES.phase!=='judge') return;
  const q = ES.qs[ES.i];
  const res = _engJudge13(r);
  if(q.bonus && r==='o'){ const b = givePts(30, 'えいご ボーナス せいかい'); toast(`⭐ ボーナス +${b}pt！`); save.counters.bonus++; persist(); }
  const last = ES.res.slice(-3);
  if(!q.bonus && E.set.pts && (ES.bn||0) < 2 && last.length===3 && last.every(x => x.res==='o') && Math.random() < .35 && ES.i < ES.qs.length){
    /* v5.4：いつも 同じ 文に ならないように、とけなかった 文の 中から ランダム（にがてほど 出やすい） */
    const used = new Set(ES.qs.map(x => x.id)), cnt = {}, last = {};
    E.hist.forEach(h => { if(h.res!=='o') cnt[h.qid] = (cnt[h.qid]||0) + 1; last[h.qid] = h.res; });
    const recent = new Set(E.bRecent || []);
    const notUsed = E.qs.filter(x => !used.has(x.id));
    let cand = notUsed.filter(x => cnt[x.id] && last[x.id]!=='o');          // まだ とけていない 文
    if(!cand.length) cand = notUsed.filter(x => cnt[x.id]);                // いちどでも まちがえた 文
    const fresh = cand.filter(x => !recent.has(x.id)); if(fresh.length) cand = fresh;
    let pick = null;
    if(cand.length){ let w = Math.random() * cand.reduce((a,x) => a + 1 + cnt[x.id], 0); for(const x of cand){ w -= 1 + cnt[x.id]; if(w <= 0){ pick = x; break; } } pick = pick || cand[cand.length-1]; }
    else { const L = notUsed.filter(x => wcount(x.en) >= 8 && !recent.has(x.id)); pick = L.length ? choice(L) : choice(notUsed.length ? notUsed : E.qs); }
    if(pick){ E.bRecent = [pick.id, ...(E.bRecent || []).filter(id => id!==pick.id)].slice(0, Math.max(3, Math.min(20, Math.floor(cand.length/2)))); engSave(); }
    if(pick){ ES.qs.splice(ES.i, 0, {...pick, bonus:true}); ES.bn = (ES.bn||0) + 1; if(ES.phase==='ask'){ engNext(); } }
  }
  return res;
};
const _engNext13 = engNext;
engNext = function(){
  _engNext13();
  const q = ES.qs[ES.i];
  $('.epCard').classList.toggle('bonusCard', !!q.bonus);
  if(q.bonus){ $('#epNo').insertAdjacentHTML('afterbegin', '<span class="bonusTag">⭐ ボーナス（にがてな 文）+30pt</span> '); sound('fan'); }
};

/* =====================================================================
   住民の おねがい：話しかけて かなえる
   ===================================================================== */
const _reqProg13 = reqProg;
reqProg = function(q){ if(q.kind==='fur') return [(q.given || (ensureHome().inv[q.id]||0) > 0 || ensureHome().items.some(i => i.id===q.id)) ? 1 : 0, 1]; return _reqProg13(q); };
completeReq = async function(q){
  if(!q || !reqDone(q)) return;
  if(q.kind==='fur' && !q.given){
    const H = ensureHome();
    if((H.inv[q.id]||0) > 0){ H.inv[q.id]--; if(!H.inv[q.id]) delete H.inv[q.id]; } else { const i = H.items.findIndex(x => x.id===q.id); if(i>=0) H.items.splice(i,1); }
    q.given = true; persist();
  }
  return _completeReq(q);
};
const _renderReqPanel13 = renderReqPanel;
renderReqPanel = function(){
  _renderReqPanel13();
  $$('#reqPanel [data-reqdone]').forEach(b => { const rid = b.dataset.reqdone; b.outerHTML = `<button class="btn small gold" data-reqtalk="${rid}">💬 はなしかける</button>`; });
};
document.addEventListener('click', e => { const b = e.target.closest('[data-reqtalk]'); if(!b) return; e.stopImmediatePropagation(); e.stopPropagation(); talkTo(b.dataset.reqtalk); }, true);


/* =====================================================================
   v1.4：世界地図の 自動ズーム・偉人／世界遺産の 絵の 問題・
         たんげんは 1つ（ふくすうも OK）・スマホ表示の 修正
   ===================================================================== */
/* ---------- 世界地図：国の 大きさに あわせて ズーム ---------- */
const WBOX = {};
function wbox(n){
  if(WBOX[n]) return WBOX[n];
  const nums = (WORLD[n][0].match(/-?\d+(\.\d+)?/g)||[]).map(Number); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let i=0;i+1<nums.length;i+=2){ const x = nums[i], y = nums[i+1]; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  if(x1 - x0 > 300){ const w = WORLD[n], [cx,cy] = wxy(w[1], w[2]); x0 = cx-40; x1 = cx+40; y0 = cy-30; y1 = cy+30; }
  return WBOX[n] = {x0,y0,x1,y1};
}
const _worldSVG14 = worldSVG;
worldSVG = function(hi, opt={}){
  let s = _worldSVG14(hi, Object.assign({}, opt, {zoom:false}));
  const hs = Array.isArray(hi) ? hi : hi ? [hi] : [];
  if(opt.zoom && hs.length===1){
    const b = wbox(hs[0]), bw = b.x1-b.x0, bh = b.y1-b.y0, AR = 1.76;
    let W = Math.max(bw*3, bh*3*AR, 46); W = Math.min(W, 360); const H = W/AR;
    const cx = (b.x0+b.x1)/2, cy = (b.y0+b.y1)/2;
    const vx = clamp(cx - W/2, 0, 720 - W), vy = clamp(cy - H/2, 0, 300 - H);
    s = s.replace('viewBox="0 0 720 300"', `viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${W.toFixed(1)} ${H.toFixed(1)}"`);
    const sw = (W/300).toFixed(2), r = Math.max(bw, bh)/2 + W*0.05;
    s = s.replace(/stroke-width="\.6"/g, `stroke-width="${(0.6*sw).toFixed(2)}"`).replace(/stroke-width="1"/g, `stroke-width="${(1*sw).toFixed(2)}"`);
    s = s.replace(/<circle cx="([\d.]+)" cy="([\d.]+)" r="13"[^]*?<\/circle><circle[^>]*\/>/, '');
    const ring = `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="#E8414B" stroke-width="${(2.2*sw).toFixed(2)}" stroke-dasharray="${(5*sw).toFixed(1)} ${(3*sw).toFixed(1)}"><animate attributeName="r" values="${r.toFixed(1)};${(r*1.15).toFixed(1)};${r.toFixed(1)}" dur="1.6s" repeatCount="indefinite"/></circle>`;
    s = s.replace('</svg>', ring + `<text x="${(vx+6*sw).toFixed(1)}" y="${(vy+14*sw).toFixed(1)}" font-size="${(11*sw).toFixed(1)}" fill="#4F7896" font-weight="bold">🔍 ${W < 200 ? 'かくだい' : ''}</text></svg>`);
  }
  return s;
};

/* ---------- 偉人・世界遺産の 絵 ---------- */
const JPP_PIC = ['卑弥呼','聖徳太子','紫式部','源頼朝','足利義満','織田信長','豊臣秀吉','徳川家康','葛飾北斎','伊能忠敬','坂本龍馬','西郷隆盛','福沢諭吉','伊藤博文','野口英世','樋口一葉','夏目漱石','津田梅子','渋沢栄一','宮沢賢治'];
const W_PIC = ['エジソン','ニュートン','アインシュタイン','キュリー夫人','ナイチンゲール','ベートーベン','モーツァルト','レオナルド・ダ・ヴィンチ','ゴッホ','リンカーン','ナポレオン','ガンディー','マザー・テレサ','ガリレオ・ガリレイ','コロンブス','シェイクスピア','ヘレン・ケラー','アームストロング','ダーウィン','ライト兄弟'];
// [名前, 国／都道府県, 一言]
const W_HER = [['ピラミッド','エジプト','王の 墓として つくられた'],['万里の長城','中国','北からの 敵を ふせぐ 長い かべ'],['タージ・マハル','インド','王が 妃の ために 建てた 白い 墓'],['マチュピチュ','ペルー','山の 上の インカ帝国の 都市'],
 ['コロッセオ','イタリア','古代ローマの 円形闘技場'],['エッフェル塔','フランス','パリの シンボルの 鉄の 塔'],['自由の女神','アメリカ','フランスから おくられた 像'],['アンコール・ワット','カンボジア','巨大な 石づくりの 寺院'],
 ['モアイ像','チリ（イースター島）','島に ならぶ 大きな 石の 顔'],['ストーンヘンジ','イギリス','大昔の 石の 遺跡'],['パルテノン神殿','ギリシャ','アテネの 丘に 建つ 神殿'],['シドニー・オペラハウス','オーストラリア','貝がらのような 屋根の 劇場'],
 ['ペトラ','ヨルダン','岩を ほって つくった 都市'],['チチェン・イッツァ','メキシコ','マヤ文明の ピラミッド'],['ピサの斜塔','イタリア','かたむいた 塔'],['モン・サン・ミッシェル','フランス','海に うかぶ 修道院'],
 ['グランド・キャニオン','アメリカ','川が けずった 大きな 谷'],['聖ワシリイ大聖堂','ロシア','たまねぎ形の 屋根の 教会'],['サグラダ・ファミリア','スペイン','ガウディが 設計した 教会'],['ガラパゴス諸島','エクアドル','ゾウガメなど めずらしい 生き物の 島']];
const J_HER = [['富士山','静岡県・山梨県','日本で いちばん 高い 山'],['姫路城','兵庫県','白鷺城と よばれる 白い 城'],['法隆寺','奈良県','世界で 最も 古い 木造建築'],['金閣（鹿苑寺）','京都府','足利義満が 建てた 金色の 建物'],
 ['厳島神社','広島県','海に 立つ 大鳥居'],['原爆ドーム','広島県','平和を ねがう 負の世界遺産'],['白川郷','岐阜県','合掌造りの 集落'],['日光東照宮','栃木県','徳川家康を まつる'],
 ['屋久島','鹿児島県','縄文杉が ある 島'],['知床','北海道','流氷と ヒグマの 自然遺産'],['白神山地','青森県・秋田県','ブナの 原生林'],['東大寺の 大仏','奈良県','聖武天皇が つくらせた'],
 ['清水寺','京都府','「清水の舞台」で 有名'],['首里城','沖縄県','琉球王国の 城'],['小笠原諸島','東京都','「東洋の ガラパゴス」'],['富岡製糸場','群馬県','明治時代の 生糸工場'],
 ['石見銀山','島根県','世界に 知られた 銀山'],['大仙古墳','大阪府','日本最大の 前方後円墳'],['熊野古道','和歌山県など','山の 中の 参詣道'],['平等院鳳凰堂','京都府','10円玉に えがかれている']];
const pp = (k, cls='') => `<img class="qPic portrait ${cls}" src="${esc(artSrc(k))}" alt="">`;
Object.assign(MATH_UNITS, {
  j_face:{n:'日本の 偉人（絵を 見て）', g:'soc', lv:2, art:'jp_7', gen(){ const i = ri(0, JPP_PIC.length-1), nm = JPP_PIC[i], p = JP_PEOPLE.find(x => x[0]===nm);
    if(Math.random() < .6) return mk('この 人物は だれ？', nm, optsFrom(nm, JPP_PIC), {disp:pp('jp_'+i), hint:p ? `${p[1]} 人だよ` : '', sub:nm});
    return mk(`絵の 人物が したことは？`, p[1], optsFrom(p[1], JP_PEOPLE.map(x=>x[1])), {disp:pp('jp_'+i), hint:`この 人は ${nm}`, sub:nm}); }},
  w_face:{n:'世界の 偉人（絵を 見て）', g:'soc', lv:2, art:'wp_0', gen(){ const i = ri(0, W_PIC.length-1), nm = W_PIC[i], p = W_PEOPLE.find(x => x[0]===nm);
    if(Math.random() < .6 || !p) return mk('この 人物は だれ？', nm, optsFrom(nm, W_PIC), {disp:pp('wp_'+i), hint:p ? `${p[1]} 人だよ` : '', sub:nm});
    return mk(`絵の 人物が したことは？`, p[1], optsFrom(p[1], W_PEOPLE.map(x=>x[1])), {disp:pp('wp_'+i), hint:`この 人は ${nm}`, sub:nm}); }},
  w_her:{n:'世界遺産（世界）', g:'soc', lv:2, art:'wh_0', gen(){ const i = ri(0, W_HER.length-1), h = W_HER[i], k = ri(0,2);
    if(k===0) return mk('この 世界遺産の 名前は？', h[0], optsFrom(h[0], W_HER.map(x=>x[0])), {disp:PIC('wh_'+i), hint:h[2], sub:h[0]});
    if(k===1) return mk('この 世界遺産が ある 国は？', h[1], optsFrom(h[1], W_HER.map(x=>x[1])), {disp:PIC('wh_'+i), hint:h[0], sub:h[0]});
    return mk(`<b>${h[2]}</b> 世界遺産は？`, h[0], optsFrom(h[0], W_HER.map(x=>x[0])), {disp:'', sub:h[0]}); }},
  j_her:{n:'世界遺産（日本）', g:'soc', lv:1, art:'jh_0', gen(){ const i = ri(0, J_HER.length-1), h = J_HER[i], k = ri(0,2);
    if(k===0) return mk('この 世界遺産の 名前は？', h[0], optsFrom(h[0], J_HER.map(x=>x[0])), {disp:PIC('jh_'+i), hint:h[2], sub:h[0]});
    if(k===1) return mk('この 世界遺産が ある 都道府県は？', h[1], optsFrom(h[1], J_HER.map(x=>x[1])), {disp:PIC('jh_'+i), hint:h[0], sub:h[0]});
    return mk(`<b>${h[2]}</b> 世界遺産は？`, h[0], optsFrom(h[0], J_HER.map(x=>x[0])), {sub:h[0]}); }}
});
Object.assign(SOC_LV, {j_her:1, j_face:2, w_face:2, w_her:2});
Object.assign(SOC_CAT, {j_her:'🏯 世界遺産', w_her:'🏯 世界遺産', j_face:'👤 日本の 偉人', w_face:'🌍 世界の 偉人'});
/* 文章の 偉人問題にも、絵が あれば 出す */
['j_person','j_person2','w_person'].forEach(k => { const g = MATH_UNITS[k].gen; MATH_UNITS[k].gen = function(){ const p = g();
  const nm = p.sub, i = (k==='w_person' ? W_PIC : JPP_PIC).indexOf(nm);
  if(i>=0 && !stripTags(p.q).includes('人物は？')) p.disp = pp((k==='w_person'?'wp_':'jp_')+i, 'sm');
  return p; }; });

/* =====================================================================
   たんげんは 1つ（「ふくすう えらぶ」で 複数OK）
   ===================================================================== */
const multiOn = kind => !!(mSave().multi||{})[kind];
function multiBtn(kind){ return `<button class="multiBtn ${multiOn(kind)?'on':''}" data-multi="${kind}">${multiOn(kind)?'☑':'☐'} ふくすう えらぶ</button>`; }
function pickUnit(arr, k, kind){
  if(multiOn(kind)){ const a = arr.includes(k) ? arr.filter(x => x!==k) : [...arr, k]; return a.length ? a : [k]; }
  return [k];
}
document.addEventListener('click', e => {
  const m = e.target.closest('[data-multi]');
  if(m){ e.stopImmediatePropagation(); const M = mSave(); M.multi = M.multi || {}; const kd = m.dataset.multi; M.multi[kd] = !M.multi[kd];
    if(!M.multi[kd]){ if(kd==='math') MS.units = MS.units.slice(0,1); else SS.units = SS.units.slice(0,1); }
    persist(); kd==='math' ? renderMath() : renderSoc(); return; }
  const u = e.target.closest('#mUnitsAll .mUnit[data-u]');
  if(u){ e.stopImmediatePropagation(); MS.units = pickUnit(MS.units, u.dataset.u, 'math'); sound('tap'); renderMath(); return; }
  const s = e.target.closest('#sUnits [data-su]');
  if(s){ e.stopImmediatePropagation(); SS.units = pickUnit(SS.units, s.dataset.su, 'soc'); sound('tap'); renderSoc(); return; }
}, true);
const _renderMath14 = renderMath;
renderMath = function(){
  if(!multiOn('math') && MS.units.length > 1 && !MS.single){ MS.single = 1; MS.units = MS.units.slice(0,1); }
  _renderMath14();
  $('#scr-math .multiRow')?.remove();
  $('#mGradeTabs').insertAdjacentHTML('afterend', `<div class="multiRow">${multiBtn('math')}<small>${multiOn('math') ? 'いくつでも えらべるよ' : 'タッチした たんげんだけ 出るよ'}</small></div>`);
};
const _renderSoc14 = renderSoc;
renderSoc = function(){
  if(!multiOn('soc') && SS.units.length > 1 && !SS.single){ SS.single = 1; SS.units = SS.units.slice(0,1); }
  _renderSoc14();
  $('#sLvTabs')?.insertAdjacentHTML('afterend', `<div class="multiRow">${multiBtn('soc')}<small>${multiOn('soc') ? 'いくつでも えらべるよ' : 'タッチした たんげんだけ 出るよ'}</small></div>`);
};


/* =====================================================================
   v1.5：ローディング・レベルアップ修正・苦手中心の 突発問題・わたしの家 強化・
         家具ドラッグ・ロゴ・筆算メモ・地図記号・ホームのレア住民・みちの上に かざり・車庫
   ===================================================================== */
const today15 = () => dayKey();

/* ---------- ボタンを 作り直しても 反応するように（レベルアップ・おばけ） ---------- */
document.addEventListener('click', e => {
  if(e.target.closest('#btnLvUp')){ e.stopImmediatePropagation(); doLevelUp(); return; }
  if(e.target.closest('#btnGhost')){ e.stopImmediatePropagation(); ghostAlert(); return; }
  if(e.target.closest('#btnRename')){ e.stopImmediatePropagation(); renameTown(); return; }
}, true);

/* ---------- 女の子が みちの 下に かくれる（位置が こわれていた）---------- */
const _bw15 = buildWalkers;
buildWalkers = function(cs, L){
  _bw15(cs, L);
  WK.st.forEach((s, id) => {
    if(isFinite(s.x) && isFinite(s.y) && isWalk(s.x, s.y)) return;
    const free = []; for(let y=0;y<L.rows;y++) for(let x=0;x<L.cols;x++) if(isWalk(x,y)) free.push([x,y]);
    const p = free.length ? choice(free) : [0,0]; s.x = p[0]; s.y = p[1]; s.path = []; s.pend = null; s.px = null; place(s, true);
  });
};

/* =====================================================================
   にがて問題の きろく → 住民クイズ・おばけ・ボーナスで 出す
   ===================================================================== */
function weakQ(){ return save.weakQ || (save.weakQ = []); }
function addWeak(p){
  if(!p || p.bonus) return; const k = qKeyOf(p), W = weakQ();
  if(W.some(x => x.k===k)) return;
  const disp = p.disp || ''; if(disp.length > 9000) return;
  W.push({k, u:p.u, type:p.type, q:p.q, ans:p.ans, opts:p.opts, disp, hint:p.hint||'', optHtml:p.optHtml});
  if(W.length > 40) W.shift();
}
function delWeak(k){ save.weakQ = weakQ().filter(x => x.k!==k); }
const _mJ15 = mJudge;
mJudge = function(v){
  const was = MQ && MQ.done, p = MQ.list[MQ.i];
  const out = _mJ15(v);
  if(!was){ const ok = MQ.res[MQ.res.length-1]?.ok; if(ok) delWeak(qKeyOf(p)); else addWeak(p); persist(); }
  return out;
};
function weakKanji(){
  const k = 'r';
  return BUILTIN.concat(customQs||[]).filter(q => { const s = save.stats[q.id]; return s && (s.r[1] > s.r[0] || s.w[1] > s.w[0]); });
}
let LASTMQ = null;
const _makeMiniQ15 = makeMiniQ;
makeMiniQ = function(){
  const W = weakQ().filter(x => x.type==='choice' || x.type==='num' || x.type==='cmp'), WK_ = weakKanji();
  const r = Math.random();
  if(W.length && r < 0.5){
    const w = choice(W); let m;
    if(w.type==='choice') m = {kind:'weak', html:`<div class="mqSent math">${w.q}</div>${w.disp||''}`, ans:w.ans, opts:shuffle(w.opts.slice()), hint:w.hint};
    else if(w.type==='cmp') m = {kind:'weak', html:`<div class="mqSent math">${w.q}</div>${w.disp||''}`, ans:w.ans, opts:['>','=','<'], hint:w.hint};
    else { const a = Number(normNum(w.ans)); if(isFinite(a)){ const set = new Set([a]); let g = 0;
        while(set.size < 4 && g++ < 40){ const d = choice([1,2,10,-1,-2,-10,100,-100]) * (a >= 1000 ? choice([1,10,100]) : 1); const v = a + d; if(v >= 0) set.add(v); }
        m = {kind:'weak', html:`<div class="mqSent math">${w.q}</div>${w.disp||''}`, ans:String(a), opts:shuffle([...set].map(String)).map(fmtNumOpt), ansF:fmtNumOpt(String(a)), hint:w.hint}; } }
    if(m){ m.wk = w.k; m.html = `<div class="weakTag">🔥 まえに まちがえた 問題</div>` + m.html; LASTMQ = m; return m; }
  }
  if(WK_.length && r < 0.85){
    const q = choice(WK_);
    const others = shuffle(BUILTIN.filter(x => x.reading!==q.reading)).slice(0, 20).map(x => x.reading);
    const opts = shuffle([q.reading, ...shuffle(others.filter(x => Math.abs(x.length-q.reading.length)<=1)).slice(0,3)]);
    while(opts.length < 4) opts.push(others.pop());
    LASTMQ = {kind:'kanji', html:`<div class="weakTag">🔥 にがてな 漢字</div><div class="mqSent">${esc(q.pre)}<u>${esc(q.word)}</u>${esc(q.post)}</div><div class="mqAsk">せんの ことばの 読みは？</div>`,
      ans:q.reading, opts:shuffle([...new Set(opts)]).slice(0,4), hint:`「${q.reading[0]}」から はじまるよ`, kq:q};
    return LASTMQ;
  }
  LASTMQ = _makeMiniQ15(); return LASTMQ;
};
const _miniQuiz15 = miniQuiz;
miniQuiz = async function(who, title){
  const res = await _miniQuiz15(who, title);
  const m = LASTMQ;
  if(m){ if(m.wk && res.ok) delWeak(m.wk); if(m.kq){ addStat(m.kq, 'read', res.ok, 1); } persist(); }
  return res;
};
const _pickHardQ15 = pickHardQ;
pickHardQ = function(units, soc){
  const used = new Set(MQ.list.map(qKeyOf));
  const pool = uniq(units.concat(hardUnits(units, soc)));
  const W = weakQ().filter(w => pool.includes(w.u) && !used.has(w.k));
  if(W.length){ const w = choice(W); const q = {u:w.u, type:w.type, q:w.q, ans:w.ans, opts:w.opts ? w.opts.slice() : undefined, disp:w.disp, hint:w.hint, optHtml:w.optHtml}; return q; }
  return _pickHardQ15(units, soc);
};

/* =====================================================================
   スピーチ：口ぐせ・方言を かならず 反映
   ===================================================================== */
speak = function(r, line){
  if(!r || SP(r.sp).human) return line;
  const P = persOf(r); let s = String(line);
  P.rep.forEach(([a,b]) => { s = s.split(a).join(b); });
  if(r.kuchi && !s.includes(r.kuchi)){
    if(/[！!。？?〜♪…]+$/.test(s)) s = s.replace(/([！!。？?〜♪…]+)$/, `${r.kuchi}$1`); else s = s + r.kuchi + '！';
  }
  return s;
};
const _dialog15 = dialog;
dialog = function(html, btns, cls){
  const pr = _dialog15(html, btns, cls);
  try{
    $$('#dlgBody .talkBubble').forEach(tb => {
      const b = tb.querySelector('b'); if(!b) return;
      const nm = b.textContent.replace(/の (おねがい|わからない 問題)$/,'').trim();
      const r = save.town?.res.find(x => x.name===nm); if(!r || SP(r.sp).human) return;
      [...tb.childNodes].forEach(n => { if(n.nodeType===3 && n.textContent.trim().length > 1) n.textContent = speak(r, n.textContent); });
    });
  }catch(e){}
  return pr;
};

/* =====================================================================
   地図記号（白黒の 正しい 形に）
   ===================================================================== */
const SYM_SVG = {
  '神社':'<svg viewBox="0 0 40 40"><path d="M4 9 H36 M9 16 H31 M13 9 V35 M27 9 V35" stroke="#222" stroke-width="3.4" fill="none" stroke-linecap="butt"/></svg>',
  '温泉':'<svg viewBox="0 0 40 40"><path d="M8 26 Q8 35 20 35 Q32 35 32 26" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M13 23 Q10 18 13 14 Q16 10 13 5 M20 23 Q17 18 20 14 Q23 10 20 5 M27 23 Q24 18 27 14 Q30 10 27 5" stroke="#222" stroke-width="2.8" fill="none" stroke-linecap="round"/></svg>',
  '工場':'<svg viewBox="0 0 40 40"><g fill="none" stroke="#222" stroke-width="2.8"><circle cx="20" cy="20" r="9"/></g><g fill="#222">' +
    [0,45,90,135,180,225,270,315].map(a => `<rect x="17.5" y="5" width="5" height="6" transform="rotate(${a} 20 20)"/>`).join('') + '</g></svg>'
};
MAPSYM.forEach(m => { if(SYM_SVG[m[1]]) m[0] = SYM_SVG[m[1]]; });

/* =====================================================================
   筆算：線の 下に 書きこむ スペース
   ===================================================================== */
const _hissan15 = hissan;
hissan = function(a, b, op='×'){
  let h = _hissan15(a, b, op);
  const A = String(a), B = String(b), w = Math.max(A.length, B.length+1)+1;
  const rows = op==='×' ? (B.length >= 2 ? 3 : 1) : 1;
  let extra = '';
  for(let i=0;i<rows;i++){
    extra += `<div class="ans${rows>1 && i===rows-2 ? ' pre' : ''}">${'<i></i>'.repeat(w)}</div>`;
    if(rows > 1 && i===rows-2) extra += `<div class="line">${'<i></i>'.repeat(w)}</div>`;
  }
  return h.replace(/<\/div>$/, extra + '</div>');
};

/* =====================================================================
   ホーム：レア住民を えらぶ・ふきだしと かさならない
   ===================================================================== */
const homeRareList = () => (save.town?.res||[]).filter(r => (SP(r.sp).rar||1) >= 3);
renderHomeRares = function(){
  const box = $('#homeRares'); if(!box) return;
  const all = homeRareList(), sel = (save.homeShow||[]).map(id => all.find(r => r.id===id)).filter(Boolean);
  const rs = sel.length ? sel.slice(0,3) : shuffle(all.slice()).slice(0,3);
  box.innerHTML = rs.map((r,i) => `<button class="homeRare" data-id="${r.id}" style="left:${3+i*15}%;animation-delay:${i*0.4}s">${resPic(r)}<span class="wname">${esc(r.name)}</span></button>`).join('')
    + (all.length ? `<button class="rareSel" id="btnRareSel">⭐ よぶ なかまを えらぶ</button>` : '');
};
document.addEventListener('click', async e => {
  if(!e.target.closest('#btnRareSel')) return; e.stopImmediatePropagation();
  const all = homeRareList(), sel = (save.homeShow||[]).filter(id => all.some(r => r.id===id)); save.homeShow = sel.slice();
  const v = await dialog(`<h2 class="dlgT">⭐ ホームに よぶ なかま</h2><p class="dlgP" style="font-size:14px">さいだい 3人まで えらべるよ（えらばないと ランダム）</p>
    <div class="rsGrid">${all.map(r => `<button class="rsIt ${sel.includes(r.id)?'on':''}" data-rs="${r.id}">${resPic(r)}<span>${esc(r.name)}</span></button>`).join('')}</div>`,
    [{label:'ランダムに する', cls:'white', v:'rand'}, {label:'けってい', cls:'pink', v:'ok'}], 'wide');
  if(v==='rand') save.homeShow = [];
  persist(); renderHomeRares();
}, true);
document.addEventListener('click', e => {
  const b = e.target.closest('[data-rs]'); if(!b) return; e.stopImmediatePropagation();
  const id = b.dataset.rs, on = b.classList.contains('on'), cur = $$('#dlgBody .rsIt.on').length;
  if(!on && cur >= 3){ toast('3人まで だよ'); return; }
  b.classList.toggle('on');
  save.homeShow = $$('#dlgBody .rsIt.on').map(x => x.dataset.rs);
}, true);

/* =====================================================================
   わたしの家：ロゴ・背景・すてき度ランク・ピカピカ（グレード）・おそうじ・ドラッグ
   ===================================================================== */
const WALL_ADD = [
  {id:'lemon', name:'レモン', price:250, css:'repeating-linear-gradient(90deg,#FFF6C8 0 22px,#FFEFA0 22px 44px)'},
  {id:'lavender', name:'ラベンダー', price:250, css:'repeating-linear-gradient(90deg,#EFE4FF 0 22px,#E3D3FF 22px 44px)'},
  {id:'peach', name:'ピーチ', price:250, css:'linear-gradient(#FFE1D2,#FFD0BC)'},
  {id:'heart', name:'ハート', price:350, css:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M14 21s-7-4.3-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 21 12c0 4.7-7 9-7 9z' fill='%23FFB3C7'/%3E%3C/svg%3E\") 0 0/28px 28px,#FFF0F4"},
  {id:'starw', name:'おほしさま', price:350, css:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cpath d='M15 6l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z' fill='%23FFD966'/%3E%3C/svg%3E\") 0 0/30px 30px,#EAF4FF"},
  {id:'check', name:'ギンガム', price:300, css:'repeating-linear-gradient(0deg,rgba(255,150,170,.35) 0 10px,transparent 10px 20px),repeating-linear-gradient(90deg,rgba(255,150,170,.35) 0 10px,transparent 10px 20px),#fff'},
  {id:'mintstripe', name:'ミントストライプ', price:300, css:'repeating-linear-gradient(90deg,#fff 0 10px,#CDEFE0 10px 20px)'},
  {id:'brick', name:'レンガ', price:450, css:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='20'%3E%3Crect width='40' height='20' fill='%23D98C6A'/%3E%3Cpath d='M0 .5H40M0 10.5H40M.5 0V10M20.5 0V10M10.5 10V20M30.5 10V20' stroke='%23F3DCCB' stroke-width='1.4'/%3E%3C/svg%3E\") 0 0/40px 20px"},
  {id:'japanese', name:'わふう', price:500, css:'linear-gradient(#F5EBD3 0 70%,#B98D5A 70% 72%,#E9DBB9 72%)'},
  {id:'forest', name:'もりの なか', price:600, css:'linear-gradient(180deg,#CFEFC7,#9AD08A)'},
  {id:'sea', name:'うみの なか', price:600, css:'radial-gradient(circle at 20% 70%,rgba(255,255,255,.6) 0 4px,transparent 5px) 0 0/40px 40px,linear-gradient(#9FE0FF,#3AA6E0)'},
  {id:'candy', name:'キャンディ', price:600, css:'repeating-linear-gradient(45deg,#FFD6E4 0 12px,#FFFFFF 12px 24px,#D6F0FF 24px 36px,#FFFFFF 36px 48px)'},
  {id:'galaxy', name:'ぎんが', price:900, css:'radial-gradient(#fff 1px,transparent 2px) 0 0/22px 22px,radial-gradient(#FFE58A 1.5px,transparent 2px) 11px 7px/31px 31px,linear-gradient(135deg,#1E1B4B,#5B3E9E,#1F3A7A)'},
  {id:'rainbow', name:'にじいろ', price:1200, css:'linear-gradient(90deg,#FFB3B3,#FFD9A0,#FFF3A0,#BFF0B8,#B3DBFF,#D8C2FF)'},
  {id:'gold', name:'きんいろ', price:2000, css:'repeating-linear-gradient(90deg,#F7D774 0 18px,#EFC54A 18px 36px)'}
];
const FLOOR_ADD = [
  {id:'darkwood', name:'こげちゃの 木', price:250, css:'repeating-linear-gradient(90deg,#9A6A3F 0 46px,#87592F 46px 48px)'},
  {id:'whitewood', name:'しろい 木', price:250, css:'repeating-linear-gradient(90deg,#F4EBDD 0 46px,#E6D9C3 46px 48px)'},
  {id:'parquet', name:'よせぎ', price:350, css:'repeating-linear-gradient(45deg,#D9AE77 0 12px,#C99A63 12px 24px)'},
  {id:'marble', name:'だいりせき', price:500, css:'linear-gradient(135deg,rgba(0,0,0,.05) 25%,transparent 25% 50%,rgba(0,0,0,.05) 50% 75%,transparent 75%) 0 0/60px 60px,#F7F5F2'},
  {id:'pinkcarpet', name:'ピンクカーペット', price:300, css:'radial-gradient(#FFB6C8 1.5px,transparent 2px) 0 0/12px 12px,#FFD6E1'},
  {id:'mintcarpet', name:'ミントカーペット', price:300, css:'radial-gradient(#9FDCC0 1.5px,transparent 2px) 0 0/12px 12px,#CFF1E1'},
  {id:'tile', name:'タイル', price:350, css:'linear-gradient(#fff 0 2px,transparent 2px) 0 0/30px 30px,linear-gradient(90deg,#fff 0 2px,transparent 2px) 0 0/30px 30px,#BFE3F2'},
  {id:'checkbw', name:'チェッカー', price:400, css:'repeating-conic-gradient(#333 0 25%,#F2F2F2 0 50%) 0 0/48px 48px'},
  {id:'sand', name:'すなはま', price:500, css:'radial-gradient(#E8D29E 1px,transparent 1.5px) 0 0/8px 8px,#F6E7BE'},
  {id:'cloud', name:'くもの うえ', price:800, css:'radial-gradient(circle at 30% 40%,#fff 0 18px,transparent 19px) 0 0/80px 60px,#DCEFFF'},
  {id:'flowerf', name:'おはなばたけ', price:800, css:'radial-gradient(#FF9EB8 3px,transparent 4px) 0 0/22px 22px,radial-gradient(#FFE07A 2.5px,transparent 3.5px) 11px 11px/22px 22px,#B9E3A2'},
  {id:'starfloor', name:'ほしの ゆか', price:1200, css:'radial-gradient(#FFE58A 2px,transparent 3px) 0 0/26px 26px,linear-gradient(#2A3570,#3E4FA0)'}
];
WALL_ADD.forEach(w => { if(!WALLS.some(x => x.id===w.id)) WALLS.push(w); });
FLOOR_ADD.forEach(w => { if(!FLOORS.some(x => x.id===w.id)) FLOORS.push(w); });
WALLS.concat(FLOORS).forEach(w => { if(w.sty==null) w.sty = Math.max(1, Math.round((w.price||0)/60)); });

const HRANKS = [[0,'ふつうの へや'],[40,'すてきな へや'],[90,'おしゃれな へや'],[160,'かわいい おへや'],[260,'ときめきルーム'],[400,'ゆめの おへや'],[600,'おうさまの おへや'],[900,'でんせつの おへや']];
const furGradeBonus = it => { const f = FUR(it.id); return f ? Math.max(1, Math.round((f.sty||1)*0.5))*(it.g||0) : 0; };
homeStyle = () => {
  const H = ensureHome();
  let s = H.items.reduce((a,i) => a + (FUR(i.id)?.sty||0) + furGradeBonus(i), 0);
  s += (WALLS.find(w => w.id===H.wall)?.sty||0) + (FLOORS.find(w => w.id===H.floor)?.sty||0);
  if(H.cleanDay === today15()) s = Math.round(s*1.1);
  return s;
};
const hRank = () => { const s = homeStyle(); let r = 0; HRANKS.forEach(([t],i) => { if(s >= t) r = i; }); return r; };
const homeBonusPt = r => 10 + r*15;
function checkHomeRank(){
  const H = ensureHome(), r = hRank();
  if(r > (H.rankMax||0)){
    const prev = H.rankMax||0; H.rankMax = r; persist();
    const got = [`🪙 +${givePts(100*r, 'すてき度ランク アップ')}pt`];
    if(r===3 || r===6){ save.town.bag.goldletter = (save.town.bag.goldletter||0) + 1; got.push('✨ きらきらレター'); }
    if(r===5 && !H.walls.includes('rainbow')){ H.walls.push('rainbow'); got.push('🌈 かべがみ「にじいろ」'); }
    persist(); sound('fan'); confetti(2200);
    setTimeout(() => dialog(`<div class="dlgArt big"><img src="${esc(artSrc('logo_home'))}" alt="" style="max-width:90%"></div><h2 class="dlgT">すてき度ランク アップ！</h2>
      <p class="dlgP">「<b>${HRANKS[r][1]}</b>」に なったよ！<br>おうちボーナスが 1日 +${homeBonusPt(r)}pt に！</p>${rewardHTML(got)}`, [{label:'やったー！', cls:'gold', v:1}], 'gold'), 300);
  }
}
const _renderMyHome15 = renderMyHome;
renderMyHome = function(){
  _renderMyHome15();
  const H = ensureHome(), sty = homeStyle(), r = hRank(), nx = HRANKS[r+1];
  const prog = nx ? Math.round((sty - HRANKS[r][0]) / (nx[0] - HRANKS[r][0]) * 100) : 100;
  const claimed = H.bonusDay === today15();
  $('#homeHead').innerHTML = `<img class="homeLogo" src="${esc(artSrc('logo_home'))}" alt="わたしのいえ">
    <div class="hRank"><div class="hrTop"><span class="hrName">🏅 ${HRANKS[r][1]}</span><span class="hrSty">✨ すてき度 <b>${sty}</b>${H.cleanDay===today15()?' <small>（ピカピカ +10%）</small>':''}</span></div>
      <div class="misBar"><i style="width:${prog}%"></i></div><small>${nx ? `つぎの「${nx[1]}」まで あと ${nx[0]-sty}` : 'さいこうランク！'}</small></div>
    <div class="hmStats"><span>📘 ちしき <b>+${Math.round(homeKnow()*100)}%</b></span><span>🪑 家具 <b>${H.items.length}</b></span><span>🔔 おきゃくさん <b>${Math.round(visitChance()*100)}%</b></span></div>
    <div class="hBtns"><button class="btn small ${claimed?'white':'gold'}" id="btnHomeBonus" ${claimed?'disabled':''}>🎁 おうちボーナス ${claimed?'うけとりずみ':'+'+homeBonusPt(r)+'pt'}</button>
      <button class="btn small white" id="btnHomeTips">💡 すてき度を 上げるには？</button></div>`;
  // ピカピカの ★
  if(homeView==='top') H.items.forEach((it,i) => { if(!it.g) return; const el = $(`#roomBox .tItem[data-idx="${i}"]`); if(el) el.insertAdjacentHTML('beforeend', `<span class="fStar">${'★'.repeat(it.g)}</span>`); });
  // おそうじ
  if(!homeEdit && homeView==='top' && H.cleanDay !== today15()){
    if(H.dustDay !== today15()){ H.dustDay = today15(); H.dust = []; for(let i=0;i<5;i++) H.dust.push([ri(0,ROOM.cols-1), ri(0,ROOM.rows-1)]); persist(); }
    const cs = $('#room').clientWidth / ROOM.cols;
    (H.dust||[]).forEach(([x,y],i) => $('#room').insertAdjacentHTML('beforeend', `<button class="dust" data-dust="${i}" style="left:${x*cs+cs*.1}px;top:${y*cs+cs*.1}px;width:${cs*.8}px;height:${cs*.8}px">💨</button>`));
  }
  checkHomeRank();
};
document.addEventListener('click', e => {
  const d = e.target.closest('[data-dust]');
  if(d){ e.stopImmediatePropagation(); const H = ensureHome(); H.dust.splice(+d.dataset.dust, 1); sound('tap'); d.classList.add('poof');
    if(!H.dust.length){ H.cleanDay = today15(); const p = givePts(20, 'おそうじ かんりょう'); persist(); confetti(1400); toast(`🧹 ピカピカ！ きょうは すてき度 +10%（+${p}pt）`); }
    persist(); setTimeout(renderMyHome, 250); return; }
  if(e.target.closest('#btnHomeBonus')){ e.stopImmediatePropagation(); const H = ensureHome(); if(H.bonusDay===today15()) return;
    H.bonusDay = today15(); const p = givePts(homeBonusPt(hRank()), 'おうちボーナス'); persist(); sound('ok'); confetti(1200); toast(`🎁 おうちボーナス +${p}pt！`); renderMyHome(); return; }
  if(e.target.closest('#btnHomeTips')){ e.stopImmediatePropagation();
    dialog(`<h2 class="dlgT">💡 すてき度を 上げるには？</h2><div class="tipList">
      <div>🪑 <b>家具を おく</b>：家具ごとに すてき度が つくよ</div>
      <div>✨ <b>家具を みがく</b>：おいてある 家具を タッチすると ★3まで ピカピカに できる（家具を ふやさなくて OK）</div>
      <div>🖼️ <b>かべがみ・ゆか</b>：ねだんが 高いほど すてき度が 高いよ</div>
      <div>🧹 <b>おそうじ</b>：へやの 💨 を ぜんぶ タッチすると、その日は すてき度 +10%</div></div>
      <h2 class="dlgT" style="font-size:18px">🎁 すてき度が 高いと…</h2><div class="tipList">
      <div>🏅 ランクが 上がるたびに ポイント（ときどき きらきらレター・とくべつな かべがみ）</div>
      <div>🎁 まいにちの おうちボーナスが ふえる（いま 1日 +${homeBonusPt(hRank())}pt）</div>
      <div>🔔 住民が あそびに 来やすくなり、おみやげも もらいやすくなる</div></div>`, [{label:'わかった！', cls:'pink', v:1}], 'wide'); return; }
}, true);
/* 家具を タッチ（もようがえ 以外）→ ピカピカに みがく */
document.addEventListener('click', async e => {
  if(homeEdit || curScreen!=='myhome') return;
  const it = e.target.closest('#roomBox [data-idx]'); if(!it || e.target.closest('.visitor')) return;
  e.stopImmediatePropagation();
  const H = ensureHome(), idx = +it.dataset.idx, item = H.items[idx], f = FUR(item?.id); if(!f) return;
  const g = item.g||0, cost = Math.max(50, Math.round(f.price*0.35*(g+1)/10)*10), add = Math.max(1, Math.round((f.sty||1)*0.5));
  const v = await dialog(`<div class="dlgArt"><img src="${esc(artSrc('fs_'+f.id) || artSrc(f.art))}" alt=""></div><h2 class="dlgT">${esc(f.name)} <small class="glvT">${'★'.repeat(g)}${'☆'.repeat(3-g)}</small></h2>
    <p class="dlgP">すてき度 +${(f.sty||0) + furGradeBonus(item)}</p>
    ${g < 3 ? `<div class="skillBox"><b>✨ ピカピカに みがく</b><div>家具を ふやさずに すてき度 <b>+${add}</b>（さいだい ★3）</div></div>` : '<div class="skillBox"><b>🌟 さいこうに ピカピカ！</b></div>'}`,
    (g < 3 ? [{label:`✨ みがく（${nf(cost)}pt）`, cls: save.points.bal >= cost ? 'gold' : 'white', v:'up'}] : []).concat([{label:'とじる', cls:'white', v:null}]), 'wide');
  if(v==='up'){ if(save.points.bal < cost){ toast('ポイントが たりないよ'); return; }
    givePts(-cost, `${f.name}を みがいた`); item.g = g + 1; persist(); sound('fan'); confetti(1200); toast(`✨ ${f.name}が ★${g+1}に！ すてき度 +${add}`); renderMyHome(); }
}, true);
/* おきゃくさん：ランクで おみやげ アップ */
const _maybeVisit15 = maybeVisit;
maybeVisit = function(){ const H = ensureHome(), had = H.visit; _maybeVisit15(); if(H.visit && H.visit!==had && !H.visit.gift && Math.random() < hRank()*0.03){ H.visit.gift = true; persist(); } };
/* 家具を ドラッグで いどう */
const DRG = {on:false};
$('#roomBox').addEventListener('pointerdown', e => {
  if(!homeEdit || homeView!=='top') return;
  const it = e.target.closest('.tItem[data-idx]'); if(!it) return;
  const r = it.getBoundingClientRect();
  Object.assign(DRG, {on:true, moved:false, idx:+it.dataset.idx, sx:e.clientX, sy:e.clientY, ox:e.clientX - r.left, oy:e.clientY - r.top, el:it, pid:e.pointerId});
  try{ $('#roomBox').setPointerCapture(e.pointerId); }catch(_){}
});
$('#roomBox').addEventListener('pointermove', e => {
  if(!DRG.on || e.pointerId!==DRG.pid) return;
  const dx = e.clientX - DRG.sx, dy = e.clientY - DRG.sy;
  if(!DRG.moved && Math.hypot(dx, dy) < 8) return;
  e.preventDefault();
  if(!DRG.moved){ DRG.moved = true; DRG.el.classList.add('dragging'); homeSel = DRG.idx; }
  DRG.el.style.transform = `translate(${dx}px,${dy}px) scale(1.08)`;
  const fl = $('#room').getBoundingClientRect(), cs = fl.width/ROOM.cols, H = ensureHome(), item = H.items[DRG.idx];
  const [w,h] = fpOf(item.id, item.r);
  const x = Math.round((e.clientX - DRG.ox - fl.left)/cs), y = Math.round((e.clientY - DRG.oy - fl.top)/cs);
  let g = $('#dropGhost'); if(!g){ $('#room').insertAdjacentHTML('beforeend', '<i id="dropGhost"></i>'); g = $('#dropGhost'); }
  const ok = !!(x>=0 && y>=0 && x+w<=ROOM.cols && y+h<=ROOM.rows && canPlace(item.id, x, y, item.r, DRG.idx));
  Object.assign(g.style, {left:x*cs+'px', top:y*cs+'px', width:w*cs+'px', height:h*cs+'px'}); g.className = ok ? 'ok' : 'ng';
  DRG.tx = x; DRG.ty = y; DRG.ok = ok;
});
function dragEnd(e){
  if(!DRG.on) return; DRG.on = false;
  if(!DRG.moved) return;
  const H = ensureHome(), item = H.items[DRG.idx];
  if(DRG.ok){ item.x = DRG.tx; item.y = DRG.ty; sound('tap'); persist(); } else toast('そこには おけないよ');
  DRG.block = Date.now(); renderMyHome();
}
$('#roomBox').addEventListener('pointerup', dragEnd);
$('#roomBox').addEventListener('pointercancel', dragEnd);
$('#roomBox').addEventListener('click', e => { if(DRG.block && Date.now() - DRG.block < 350){ e.stopImmediatePropagation(); e.preventDefault(); } }, true);
/* 背景 */
const _show15 = show;
show = function(name){
  _show15(name);
  const bg = name==='myhome' ? artSrc('bg_myhome') : artSrc('bg_town');
  $('#bg').style.backgroundImage = bg ? `url("${bg}")` : '';
};

/* =====================================================================
   まち：みちの 上に かざり・車庫（のりものを しまう）
   ===================================================================== */
function over(){ return save.town.over || (save.town.over = {}); }
function garage(){ return save.town.garage || (save.town.garage = []); }
const _townCalc15 = townCalc;
townCalc = function(){
  const c = _townCalc15(), t = save.town;
  Object.values(t.over||{}).forEach(id => { const it = ITEM(id); if(it) c.dev += it.dev||0; });
  let gt = 0; (t.garage||[]).forEach(id => { gt += ITEM(id)?.traffic||0; });
  if(gt){ const add = Math.round(gt*(1 + c.tot.drive*TOWN_RULES.driveRate)); c.traffic += add; c.dev += add*TOWN_RULES.trafficDev; }
  return c;
};
const _renderMap15 = renderMap;
renderMap = function(){
  _renderMap15();
  Object.entries(over()).forEach(([k,id]) => { const [x,y] = k.split(','), c = $(`#townMap .cell[data-x="${x}"][data-y="${y}"]`), it = ITEM(id);
    if(!c || !it || !isRoadId(save.town.cells[k])){ if(!isRoadId(save.town.cells[k])){ save.town.inv[id] = (save.town.inv[id]||0)+1; delete over()[k]; persist(); } return; }
    c.insertAdjacentHTML('beforeend', `<img class="overImg" src="${esc(artSrc(it.art))}" alt="">`); });
};
document.addEventListener('click', e => {
  if(!townEdit || curScreen!=='town') return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const t = save.town, key = `${c.dataset.x},${c.dataset.y}`;
  if(!isRoadId(t.cells[key])) return;
  const O = over();
  if(hand && ITEM(hand.id)?.cat==='deco'){
    e.stopImmediatePropagation();
    if(hand.id==='d_signal' && window.sigPlaceOK && !window.sigPlaceOK(key)){ toast('🚦 信号は 十字路・T字路・横断歩道だけに おけるよ'); return; }
    if(O[key]){ toast('もう かざりが あるよ'); return; }
    O[key] = hand.id; sound('tap');
    if(hand.from==='inv'){ t.inv[hand.id]--; if(t.inv[hand.id] <= 0){ delete t.inv[hand.id]; hand = null; } } else hand = null;
    persist(); renderTown(); return;
  }
  if(!hand && O[key]){
    e.stopImmediatePropagation();
    const id = O[key]; delete O[key]; t.inv[id] = (t.inv[id]||0) + 1; hand = {id, from:'inv'}; persist(); renderTown(); toast(`${ITEM(id).name}を もったよ`); return;
  }
}, true);
const _renderTray15 = renderTray;
renderTray = function(){
  _renderTray15();
  if(!townEdit) return;
  const t = save.town, G = garage();
  let box = $('#trayCars'); if(!box){ $('#townTray').insertAdjacentHTML('beforeend', '<div id="trayCars"></div>'); box = $('#trayCars'); }
  if(!t.veh.length && !G.length){ box.innerHTML = ''; return; }
  box.innerHTML = `<div class="tcHead">🚗 のりもの <small>タッチで「はしる ⇄ しゃこに しまう」</small></div><div class="trayRow">` +
    t.veh.map((id,i) => `<button class="trayIt car on" data-run="${i}">${picHTML(ITEM(id))}<span>${esc(ITEM(id)?.name||'')}</span><b>はしる</b></button>`).join('') +
    G.map((id,i) => `<button class="trayIt car" data-gar="${i}">${picHTML(ITEM(id))}<span>${esc(ITEM(id)?.name||'')}</span><b>しゃこ</b></button>`).join('') + '</div>';
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-run]'), b = e.target.closest('[data-gar]'); if(!a && !b) return;
  e.stopImmediatePropagation(); const t = save.town, G = garage();
  if(a){ const id = t.veh.splice(+a.dataset.run, 1)[0]; G.push(id); toast(`${ITEM(id).name}を しゃこに しまったよ`); }
  else { const c = townCalc(); if(t.veh.length >= c.vehCap){ toast('はしれる 台数が いっぱいだよ'); return; } const id = G.splice(+b.dataset.gar, 1)[0]; t.veh.push(id); toast(`${ITEM(id).name}が はしりだした！`); }
  persist(); sound('tap'); renderTown();
}, true);
const _ownedCount15 = ownedCount;
ownedCount = function(it){ let n = _ownedCount15(it); if(it.type==='veh') n += garage().filter(x => x===it.id).length; if(it.cat==='deco') n += Object.values(over()).filter(x => x===it.id).length; return n; };

/* =====================================================================
   ローディング画面
   ===================================================================== */
async function bootLoader(){
  const ld = $('#loader'); if(!ld) return;
  const imgs = [...document.images].filter(i => i.src);
  let done = 0; const total = imgs.length + 1;
  const tick = () => { done++; const p = Math.min(100, Math.round(done/total*100)); $('#ldBar').style.width = p+'%'; $('#ldPct').textContent = p+'%'; };
  const ps = imgs.map(img => (img.complete ? Promise.resolve() : new Promise(r => { img.addEventListener('load', r, {once:true}); img.addEventListener('error', r, {once:true}); }))
    .then(() => img.decode ? img.decode().catch(()=>{}) : null).then(tick));
  ps.push((document.fonts?.ready || Promise.resolve()).then(tick));
  await Promise.race([Promise.all(ps), new Promise(r => setTimeout(r, 9000))]);
  $('#ldBar').style.width = '100%'; $('#ldPct').textContent = '100%';
  setTimeout(() => { ld.classList.add('done'); setTimeout(() => ld.remove(), 600); }, 250);
}


/* =====================================================================
   v1.6：りか（小3〜中3）・ローディング画面・もようがえトレイ コンパクト化
   ===================================================================== */
/* ---------- りか 問題バンク [問題, 正解, ちがう こたえ×3] ---------- */
const SCI_BANK = {
 /* ===== 小学3・4年 ===== */
 bug:[
  ['こん虫の からだは いくつに 分かれている？','3つ','2つ','4つ','5つ'],['こん虫の あしは 何本？','6本','4本','8本','10本'],
  ['こん虫の あしが ついているのは からだの どこ？','むね','あたま','はら','せなか'],['こん虫の 目や しょっ角が あるのは？','あたま','むね','はら','あし'],
  ['クモが こん虫では ない りゆうは？','あしが 8本','はねが ない','小さい','あたまが ない'],['チョウの そだち方の じゅんばんは？','たまご→よう虫→さなぎ→せい虫','たまご→さなぎ→よう虫→せい虫','よう虫→たまご→さなぎ→せい虫','たまご→よう虫→せい虫'],
  ['さなぎに ならない こん虫は？','バッタ','チョウ','カブトムシ','テントウムシ'],['トンボの よう虫の よび名は？','ヤゴ','アオムシ','イモムシ','ボウフラ'],
  ['モンシロチョウが たまごを うむ 植物は？','キャベツ','ヒマワリ','イネ','サクラ'],['カブトムシの よう虫が くらす ところは？','土の 中','水の 中','木の 葉の 上','花の 中'],
  ['セミの よう虫が くらす ところは？','土の 中','水の 中','花の 中','空の 上'],['こん虫が 息を する あなが あるのは？','はら','あたま','あし','はね'],
  ['冬を たまごで すごす こん虫は？','カマキリ','テントウムシ','アゲハ（さなぎ）','カブトムシ'],['冬を せい虫で すごす こん虫は？','テントウムシ','カマキリ','モンシロチョウ','セミ'],
  ['春に なると 生き物の 活動は？','さかんに なる','にぶく なる','止まる','かわらない'],['ツバメが 南の 国へ 行くのは いつ？','秋','春','夏の はじめ','1年中'],
  ['ダンゴムシは こん虫？','こん虫では ない','こん虫','チョウの なかま','トンボの なかま'],['アリの あしの 本数は？','6本','8本','4本','10本']
 ],
 plant:[
  ['植物の たねから 最初に 出る 葉は？','子葉','本葉','花びら','がく'],['ホウセンカの 根の 形に 近いのは？','太い 根から 細い 根','ひげのような 根だけ','根が ない','葉と 同じ 形'],
  ['植物の からだの つくりで ないものは？','あし','根','くき','葉'],['ヒマワリの たねが できるのは どこ？','花が さいた あと','根の 先','くきの 中','葉の うら'],
  ['ヘチマや ヒョウタンの くきが のびる 季節は？','夏','冬','秋の おわり','いつも 同じ'],['秋に なると サクラの 葉は？','色が かわり おちる','大きく なる','花に なる','白く なる'],
  ['冬の サクラの 枝には 何が ついている？','芽','花','実','葉が たくさん'],['植物が 育つのに 日光は？','ひつよう','いらない','夜だけ いる','少しも いらない'],
  ['アサガオの つるは 何に まきつく？','ぼう','水','石','土の 中'],['春に 花が さく 植物は？','チューリップ','ヒマワリ','アサガオ','コスモス'],
  ['夏に 花が さく 植物は？','ヒマワリ','チューリップ','ナノハナ','サクラ'],['秋に 花が さく 植物は？','コスモス','チューリップ','ナノハナ','ヒマワリ'],
  ['タンポポの たねの とくちょうは？','わた毛で とぶ','水に うく','動物に くっつく','はじけて とぶ'],['植物が 水を すい上げる ところは？','根','花','葉の 先','実']
 ],
 sunlight:[
  ['かげが できるのは 太陽と どちら がわ？','太陽の 反対がわ','太陽と 同じ がわ','真上','いつも 北だけ'],['太陽は どの 方位から のぼる？','東','西','南','北'],
  ['太陽が しずむ 方位は？','西','東','南','北'],['太陽が 一番 高く なる 方位は？','南','北','東','西'],
  ['かげの 向きは 時間と ともに？','かわる','かわらない','なくなる','いつも 北'],['日なたと 日かげ、地面が あたたかいのは？','日なた','日かげ','同じ','夜の 方'],
  ['日光を 1か所に あつめる 道具は？','虫めがね','方位じしん','温度計','ものさし'],['虫めがねで 光を 小さく あつめると？','明るく あつくなる','暗く つめたくなる','かわらない','光が きえる'],
  ['かがみで はね返した 日光は？','まっすぐ すすむ','まがって すすむ','きえる','つめたくなる'],['光を 当てた ものは？','あたたかく なる','つめたく なる','重く なる','かわらない'],
  ['方位じしんの 色の ついた はりが さす 方位は？','北','南','東','西'],['音が 出ている ものは？','ふるえている','止まっている','光っている','つめたい'],
  ['音が 大きいと ふるえ方は？','大きい','小さい','かわらない','止まる'],['糸電話で 音を つたえるのは？','糸の ふるえ','光','電気','風']
 ],
 magelec:[
  ['じしゃくに つく ものは？','鉄の くぎ','アルミかん','10円玉','プラスチック'],['じしゃくの 力が 強いのは？','両はしの きょく','まん中','どこも 同じ','力は ない'],
  ['N極と N極を 近づけると？','しりぞけ合う','引き合う','何も おこらない','光る'],['N極と S極を 近づけると？','引き合う','しりぞけ合う','何も おこらない','あつくなる'],
  ['じしゃくに ついた 鉄は？','じしゃくに なる','とける','重く なる','金に なる'],['自由に 動く じしゃくの N極が さす 方位は？','北','南','東','西'],
  ['電気を 通す ものは？','鉄','紙','ゴム','木'],['電気を 通さない ものは？','プラスチック','アルミニウム','銅','鉄'],
  ['かん電池の でっぱりが あるのは？','+極','−極','どちらも','どちらでも ない'],['豆電球が つく つなぎ方は？','わの ように つなぐ','+極だけに つなぐ','−極だけに つなぐ','つながない'],
  ['電気の 通り道の 名前は？','回路','線路','水路','通路'],['かん電池2この 直列つなぎでは モーターは？','速く 回る','おそく 回る','回らない','同じ'],
  ['かん電池2この へい列つなぎでは 豆電球は？','1この ときと 同じくらい','とても 明るい','つかない','暗い'],['電流の 向きを 反対に すると モーターは？','反対に 回る','止まる','速く なる','こわれる'],
  ['光電池に 光を 強く 当てると？','電流が 強く なる','電流が 弱く なる','かわらない','止まる'],['ゴムを 長く のばすほど ものを 動かす 力は？','大きく なる','小さく なる','かわらない','なくなる'],
  ['風が 強いほど 風車の 回り方は？','速い','おそい','止まる','かわらない']
 ],
 sky:[
  ['月が 光って 見えるのは？','太陽の 光を はね返す','自分で 光る','電気で 光る','星の 光'],['月は どの 方位から のぼる？','東','西','南','北'],
  ['満月は 夕方 どの 方位に 見える？','東','西','南','北'],['半月から 満月まで およそ 何日？','約1週間','約1日','約1か月','約1年'],
  ['星の 明るさは？','星に よって ちがう','どれも 同じ','色で きまる','大きさで きまる'],['夏の 大三角に ふくまれる 星は？','ベガ','シリウス','ベテルギウス','北極星'],
  ['冬の 大三角に ふくまれる 星は？','シリウス','ベガ','アルタイル','デネブ'],['北極星を 見つける 手がかりに なる 星座は？','北斗七星','オリオン座','さそり座','はくちょう座'],
  ['時間が たつと 星の ならび方は？','かわらない','かわる','ばらばらに なる','きえる'],['時間が たつと 星の 位置は？','かわる','かわらない','きえる','ふえる'],
  ['星の 色で 赤い 星は？','ベテルギウス','シリウス','ベガ','リゲル'],['月の 形が かわって 見える 理由は？','光る 部分の 見え方が かわる','月が こわれる','雲が かくす','月が 小さく なる']
 ],
 body:[
  ['体を ささえたり 守ったり するのは？','ほね','かみの毛','つめ','あせ'],['ほねと ほねの つなぎめで 曲がる ところは？','関節','筋肉','けん','皮ふ'],
  ['うでを 曲げると ちぢむのは？','うちがわの 筋肉','そとがわの 筋肉','ほね','関節'],['のうを 守る ほねは？','頭の ほね','せぼね','ろっ骨','こつばん'],
  ['心ぞうや はいを 守る ほねは？','ろっ骨','頭の ほね','うでの ほね','あしの ほね'],['人の 体に ある ほねは およそ 何こ？','約200こ','約20こ','約2000こ','約50こ'],
  ['筋肉が ちぢんだり ゆるんだり して できるのは？','体を 動かす','ものを 見る','においを かぐ','音を 聞く']
 ],
 water:[
  ['水が こおる 温度は？','0℃','100℃','10℃','−100℃'],['水が ふっとう する 温度は？','約100℃','0℃','50℃','約200℃'],
  ['水が こおると 体積は？','ふえる','へる','かわらない','なくなる'],['水を 熱した ときに 出る あわの 正体は？','水じょう気','空気','酸素','けむり'],
  ['空気を 温めると 体積は？','ふえる','へる','かわらない','なくなる'],['金ぞくを 温めると 体積は？','少し ふえる','へる','大きく へる','かわらない'],
  ['とじこめた 空気を おすと？','体積が 小さく なり おし返す','体積が ふえる','なくなる','水に なる'],['とじこめた 水を おすと 体積は？','ほとんど かわらない','小さく なる','大きく なる','なくなる'],
  ['金ぞくの ぼうを 熱すると 熱の つたわり方は？','熱した ところから じゅんに','全体が 同時に','はしから','つたわらない'],['水を 温めると 温かい 水は？','上へ 動く','下へ 動く','動かない','きえる'],
  ['水が 水じょう気に なることを？','じょう発','ふっとう','ぎょう固','ゆう解'],['空気中の 水じょう気が 冷えて 水てきに なるのは？','けつろ','じょう発','ふっとう','とける'],
  ['晴れの 日の 気温の 変化は？','大きい','小さい','かわらない','夜が 高い'],['1日で 気温が 一番 高く なるのは？','午後2時ごろ','朝6時ごろ','真夜中','夕方7時'],
  ['気温を はかる 高さは？','地面から 1.2〜1.5m','地面すれすれ','屋根の 上','5m'],['雨水は 高い ところと ひくい ところ どちらへ 流れる？','ひくい ところ','高い ところ','どちらも','流れない']
 ],
 /* ===== 小学5・6年 ===== */
 flower:[
  ['花粉が めしべの 先に つくことを？','受粉','発芽','光合成','じょう散'],['アサガオの めしべの もとが 育つと？','実に なる','花びらに なる','根に なる','葉に なる'],
  ['ヘチマの めばなに あって おばなに ないのは？','めしべ','おしべ','花びら','がく'],['花粉を 作るのは？','おしべ','めしべ','がく','花びら'],
  ['種子の 発芽に ひつような 条件の 組み合わせは？','水・空気・適当な 温度','水・日光・肥料','土・日光・肥料','水・土・日光'],['インゲンマメの 種子に ある でんぷんを 調べる 薬は？','ヨウ素液','石灰水','リトマス紙','BTB液'],
  ['でんぷんに ヨウ素液を つけると？','青むらさき色','赤色','黄色','白色'],['植物が よく 育つ ために ひつような ものは？','日光と 肥料','暗さと 水だけ','氷','塩'],
  ['葉に 日光が 当たると できるのは？','でんぷん','脂肪','たんぱく質','塩'],['植物の 葉から 水が 水じょう気として 出ることを？','じょう散','呼吸','光合成','受粉'],
  ['じょう散の 出口に なる 葉の 小さな あなは？','気こう','根毛','道管','花粉']
 ],
 life:[
  ['メダカの おすの せびれの とくちょうは？','切れこみが ある','切れこみが ない','丸い','ない'],['メダカの たまごが 育つのに 必要な 養分は？','たまごの 中の 養分','水の 中の 肥料','日光','空気だけ'],
  ['人の 子どもが 母親の 体内で 育つ ところは？','子宮','胃','心ぞう','はい'],['母親と たい児を つなぐ ものは？','へそのお','気管','血管だけ','ほね'],
  ['人が 生まれるまで およそ 何週？','約38週','約4週','約100週','約10週'],['たまごと せい子が むすびつくことを？','受せい','受粉','発芽','じょう散'],
  ['ヒキガエルの 子どもの よび名は？','オタマジャクシ','ヤゴ','ボウフラ','アオムシ'],['水中の 小さな 生き物を 見る 道具は？','けんび鏡','望遠鏡','温度計','方位じしん'],
  ['けんび鏡で 最初に 使うのは？','低い ばいりつ','高い ばいりつ','どちらでも','いちばん 高い']
 ],
 sol:[
  ['食塩を 水に とかすと 全体の 重さは？','水と 食塩の 合計','水だけの 重さ','へる','0に なる'],['水の 温度を 上げると ミョウバンの とける 量は？','ふえる','へる','かわらない','0に なる'],
  ['水の 温度を 上げても とける 量が あまり かわらないのは？','食塩','ミョウバン','ホウ酸','さとう'],['水よう液の とくちょうは？','すきとおっている','にごっている','かならず 色が ある','かならず においが ある'],
  ['とけ残りを 取り出す 方法は？','ろ過','じょう発','ふっとう','受粉'],['水よう液から 水を じょう発させると？','とけていた ものが 出てくる','何も 残らない','重く なる','色が きえる'],
  ['青色リトマス紙を 赤く する 水よう液は？','酸性','アルカリ性','中性','どれでも ない'],['赤色リトマス紙を 青く する 水よう液は？','アルカリ性','酸性','中性','食塩水'],
  ['食塩水は 何性？','中性','酸性','アルカリ性','どれでも ない'],['塩酸は 何性？','酸性','アルカリ性','中性','どれでも ない'],
  ['石灰水は 何性？','アルカリ性','酸性','中性','どれでも ない'],['炭酸水に とけている 気体は？','二酸化炭素','酸素','ちっ素','水素'],
  ['塩酸に アルミニウムを 入れると 出る 気体は？','水素','酸素','二酸化炭素','ちっ素'],['二酸化炭素を 通すと 白く にごるのは？','石灰水','食塩水','塩酸','アンモニア水'],
  ['アンモニア水は 何性？','アルカリ性','酸性','中性','どれでも ない'],['酢（す）は 何性？','酸性','アルカリ性','中性','どれでも ない']
 ],
 pend:[
  ['ふりこの 1往復の 時間を かえるのは？','ふりこの 長さ','おもりの 重さ','ふれはば','色'],['ふりこを 長く すると 1往復の 時間は？','長く なる','短く なる','かわらない','0に なる'],
  ['おもりを 重く すると ふりこの 1往復の 時間は？','かわらない','長く なる','短く なる','止まる'],['てこで 力を 加える ところは？','力点','支点','作用点','重心'],
  ['てこを 支える ところは？','支点','力点','作用点','中心'],['てこで ものに 力が はたらく ところは？','作用点','力点','支点','中心'],
  ['小さな 力で 持ち上げるには 力点を 支点から？','遠ざける','近づける','同じ','はなさない'],['はさみの 支点は どこ？','真ん中の じく','持つ ところ','切る ところ','先'],
  ['てこが 水平に つり合う 条件は？','左右の「重さ×きょり」が 等しい','左右の 重さが 等しい','左右の きょりが 等しい','左が 重い'],['くぎぬきの ように 支点が 間に ある 道具は？','はさみ','ピンセット','せんぬき','トング']
 ],
 emag:[
  ['電磁石を 強く する 方法は？','コイルの まき数を ふやす','電流を 弱く する','鉄しんを 抜く','導線を 短く する'],['電磁石の 極を 反対に するには？','電流の 向きを かえる','まき数を ふやす','鉄しんを かえる','電池を ふやす'],
  ['電流を 流した ときだけ じしゃくに なるのは？','電磁石','ぼうじしゃく','U字じしゃく','方位じしん'],['電流の 強さを はかる 道具は？','電流計','温度計','電圧計だけ','ばねばかり'],
  ['発電機を 回すと 作られるのは？','電気','水','光だけ','音だけ'],['コンデンサーに できることは？','電気を ためる','電気を 消す','光を ためる','水を ためる'],
  ['電気を 光に かえる 道具は？','LED','モーター','スピーカー','ヒーター'],['電気を 音に かえる ものは？','スピーカー','LED','電熱線','手回し発電機'],
  ['同じ 明かりで 電気の 使用量が 少ないのは？','LED','豆電球','同じ','どちらも 使わない'],['電熱線は 電気を 何に かえる？','熱','光だけ','音','動き']
 ],
 weather:[
  ['日本付近の 天気は どの 方角から かわる？','西から 東','東から 西','北から 南','南から 北'],['台風が 多く 近づく 季節は？','夏から 秋','冬','春の はじめ','1年中 同じ'],
  ['雲の ようすを 宇宙から 調べる ものは？','気象衛星','アメダス','温度計','望遠鏡'],['雨量などを 自動で はかる しくみは？','アメダス','気象衛星','ひゃくよう箱','てんびん'],
  ['流れる 水が 土を けずる はたらきは？','しん食','運ぱん','たい積','ふん火'],['流れる 水が 土を 運ぶ はたらきは？','運ぱん','しん食','たい積','受粉'],
  ['流れる 水が 土を つもらせる はたらきは？','たい積','しん食','運ぱん','けつろ'],['川の 曲がった ところで 流れが 速いのは？','外がわ','内がわ','まん中だけ','どこも 同じ'],
  ['川の 上流の 石の 形は？','大きく 角ばっている','小さく 丸い','砂だけ','どろだけ'],['川の 下流の 石の 形は？','小さく 丸い','大きく 角ばっている','岩ばかり','とがっている'],
  ['しま模様に 見える 地層の でき方は？','水の はたらきで つもる','風で こわれる','雪で できる','雷で できる'],['地層の 中に 見つかる 大昔の 生き物の あとは？','化石','結しょう','岩石','鉱物'],
  ['火山の はたらきで できた 地層に 多いのは？','角ばった つぶ','丸い つぶ','貝の 化石','どろだけ'],['大きな 地しんで 土地に できる ずれは？','断層','地層','化石','台地']
 ],
 burn:[
  ['ものが 燃えるのに ひつような 気体は？','酸素','ちっ素','二酸化炭素','水素'],['ものが 燃えると ふえる 気体は？','二酸化炭素','酸素','ちっ素','水素'],
  ['空気中に いちばん 多い 気体は？','ちっ素','酸素','二酸化炭素','水素'],['空気中の 酸素の 割合は？','約21%','約78%','約0.04%','約50%'],
  ['ろうそくが よく 燃えるのは？','空気が 入れかわる とき','ふたを した とき','水に つけた とき','冷やした とき'],['酸素の 中で ろうそくを 燃やすと？','激しく 燃える','すぐ 消える','かわらない','こおる'],
  ['人が はく 息に 多く ふくまれる ように なるのは？','二酸化炭素','酸素','水素','ちっ素だけ'],['気体検知管で 調べられるのは？','気体の 割合','水の 温度','電流','光']
 ],
 hbody:[
  ['食べた ものを 消化する 液は？','消化液','血液','あせ','なみだ'],['だ液が でんぷんを 何に かえる？','別の もの（あまい もの）','脂肪','たんぱく質','水だけ'],
  ['養分を 吸収する おもな ところは？','小腸','胃','食道','大腸'],['血液を 全身に 送る ところは？','心ぞう','はい','かん臓','じん臓'],
  ['酸素を とり入れ 二酸化炭素を 出す ところは？','はい','心ぞう','胃','小腸'],['血液から いらない ものを こし出すのは？','じん臓','はい','心ぞう','胃'],
  ['養分を たくわえる はたらきが ある 臓器は？','かん臓','心ぞう','はい','ぼうこう'],['心ぞうの はく動が 血管に つたわったものは？','脈はく','呼吸','消化','反射'],
  ['食べものが 通る 道すじで 正しいのは？','口→食道→胃→小腸→大腸','口→胃→食道→小腸','口→小腸→胃→大腸','口→大腸→胃'],['生き物どうしの「食べる・食べられる」の つながりは？','食物連さ','光合成','受粉','じょう散']
 ],
 moonsun:[
  ['月の 形が 日によって かわる 理由は？','月と 太陽の 位置関係が かわる','月が ちぢむ','地球の かげだけ','雲の せい'],['満月の とき 月は 太陽の？','反対がわに ある','同じ がわに ある','真横','見えない'],
  ['新月の とき 月は？','太陽と 同じ がわに ある','太陽の 反対がわ','真夜中に 見える','いちばん 明るい'],['月の 表面に ある 丸い くぼみは？','クレーター','火山','海','川'],
  ['夕方 西の 空に 見えて 右がわが 光る 月は？','三日月','満月','下弦の 月','新月'],['月が 光る 理由は？','太陽の 光を はね返す','自分で 光る','地球の 光','星の 光']
 ],
 /* ===== 中学 ===== */
 bio:[
  ['植物の 細胞に あって 動物の 細胞に ないのは？','細胞かべ','核','細胞まく','細胞質'],['光合成が 行われる つぶは？','葉緑体','核','液ほう','細胞かべ'],
  ['遺伝子の 本体の 物質は？','DNA','でんぷん','ATP','ブドウ糖'],['被子植物の 胚珠は？','子房の 中に ある','むき出し','根に ある','葉に ある'],
  ['マツの なかまは？','裸子植物','被子植物','シダ植物','コケ植物'],['種子を つくらず 胞子で ふえるのは？','シダ植物','被子植物','裸子植物','単子葉類'],
  ['単子葉類の 葉脈は？','平行脈','網状脈','ない','円形'],['双子葉類の 根の つくりは？','主根と 側根','ひげ根','根が ない','気根'],
  ['背骨の ある 動物を 何という？','セキツイ動物','無セキツイ動物','節足動物','軟体動物'],['一生 えらで 呼吸する セキツイ動物は？','魚類','両生類','は虫類','ほ乳類'],
  ['子を うむ（胎生の）なかまは？','ほ乳類','鳥類','は虫類','魚類'],['イカや タコの なかまは？','軟体動物','節足動物','ほ乳類','魚類'],
  ['だ液に ふくまれる 消化酵素は？','アミラーゼ','ペプシン','リパーゼ','トリプシン'],['たんぱく質が 最終的に 分解されて できるのは？','アミノ酸','ブドウ糖','脂肪酸','でんぷん'],
  ['小腸の 内側の ひだに ある 突起は？','柔毛','肺ほう','ネフロン','気こう'],['酸素を 運ぶ 血液の 成分は？','赤血球','白血球','血小板','血しょう'],
  ['刺激に 対して 無意識に おこる 反応は？','反射','消化','呼吸','光合成'],['体細胞分裂で 染色体の 数は？','もとと 同じ','半分','2倍','0'],
  ['生殖細胞が できる ときの 分裂は？','減数分裂','体細胞分裂','二分裂','出芽'],['親と 同じ 遺伝子を もつ ふえ方は？','無性生殖','有性生殖','受精','交配'],
  ['メンデルが 実験に 使った 植物は？','エンドウ','アサガオ','イネ','ヒマワリ'],['生態系で 光合成を する 生物の 役わりは？','生産者','消費者','分解者','捕食者'],
  ['落ち葉や 死がいを 分解する 生物は？','分解者','生産者','消費者','寄生者']
 ],
 chem:[
  ['物質 1cm³あたりの 質量を？','密度','体積','溶解度','濃度'],['水素の 性質は？','燃えて 水が できる','ものを 燃やす','石灰水を にごらせる','刺激臭が ある'],
  ['酸素を 発生させる 組み合わせは？','二酸化マンガン＋オキシドール','石灰石＋塩酸','亜鉛＋塩酸','塩化アンモニウム＋水酸化カルシウム'],['二酸化炭素を 発生させる 組み合わせは？','石灰石＋塩酸','亜鉛＋塩酸','二酸化マンガン＋オキシドール','鉄＋硫黄'],
  ['水に とけやすく 空気より 軽い 気体の 集め方は？','上方置換法','下方置換法','水上置換法','どれでも'],['水に とけにくい 気体の 集め方は？','水上置換法','上方置換法','下方置換法','ろ過'],
  ['固体が 液体に なる 温度は？','融点','沸点','凝固点だけ','露点'],['液体が ふっとうする 温度は？','沸点','融点','露点','凝固点'],
  ['液体の 混合物を 沸点の ちがいで 分ける 方法は？','蒸留','ろ過','再結晶','中和'],['物質が 酸素と 結びつく 化学変化は？','酸化','還元','中和','分解'],
  ['酸化物から 酸素を うばう 化学変化は？','還元','酸化','燃焼','溶解'],['化学変化の 前後で 全体の 質量は？','かわらない','ふえる','へる','0に なる'],
  ['物質を つくる いちばん 小さな つぶは？','原子','分子','イオン','電子'],['水の 化学式は？','H₂O','CO₂','O₂','NaCl'],
  ['二酸化炭素の 化学式は？','CO₂','H₂O','CO','O₂'],['塩化ナトリウムの 化学式は？','NaCl','HCl','NaOH','CaCO₃'],
  ['炭酸水素ナトリウムを 加熱すると 出る 気体は？','二酸化炭素','酸素','水素','アンモニア'],['鉄と 硫黄を 加熱して できる 物質は？','硫化鉄','酸化鉄','塩化鉄','炭酸鉄'],
  ['酸と アルカリが 打ち消し合う 反応は？','中和','酸化','還元','電気分解'],['中和で 水と 一緒に できる 物質は？','塩','酸素','金属','気体だけ'],
  ['BTB液が 酸性で 示す 色は？','黄色','青色','緑色','赤色'],['BTB液が アルカリ性で 示す 色は？','青色','黄色','緑色','白色'],
  ['電気を 帯びた 原子を？','イオン','分子','電子','中性子'],['水を 電気分解すると 陰極に 出る 気体は？','水素','酸素','塩素','二酸化炭素'],
  ['原子の 中心に ある ものは？','原子核','電子','分子','イオン'],['酸性の 水溶液に 共通して ふくまれる イオンは？','水素イオン','水酸化物イオン','塩化物イオン','ナトリウムイオン'],
  ['アンモニアの 集め方は？','上方置換法','下方置換法','水上置換法','蒸留']
 ],
 phys:[
  ['光が 鏡で はね返ることを？','反射','屈折','分散','吸収'],['光が 水から 空気に 進むとき 折れ曲がることを？','屈折','反射','全反射だけ','回折'],
  ['入射角と 反射角の 関係は？','等しい','入射角が 大きい','反射角が 大きい','関係ない'],['凸レンズで 実像が できるのは 物体が？','焦点より 外側','焦点の 内側','レンズに くっつく','どこでも'],
  ['虫めがねで 見える 拡大された 像は？','虚像','実像','影','反射像'],['音の 高さを 決めるのは？','振動数','振幅','音の 速さ','温度'],
  ['音の 大きさを 決めるのは？','振幅','振動数','音色','速さ'],['空気中の 音の 速さは 約？','秒速340m','秒速30万km','秒速3m','秒速3000m'],
  ['真空中で 音は？','伝わらない','速く 伝わる','ゆっくり 伝わる','大きく なる'],['ばねの のびが 力の 大きさに 比例する 法則は？','フックの法則','オームの法則','慣性の法則','作用反作用'],
  ['力の 単位は？','N（ニュートン）','J（ジュール）','W（ワット）','Pa（パスカル）'],['圧力の 単位は？','Pa（パスカル）','N','J','V'],
  ['電圧の 単位は？','V（ボルト）','A（アンペア）','Ω（オーム）','W'],['電気抵抗の 単位は？','Ω（オーム）','V','A','J'],
  ['電流と 電圧が 比例する 法則は？','オームの法則','フックの法則','慣性の法則','アルキメデスの原理'],['直列回路で 各部分に 流れる 電流は？','どこも 等しい','部分ごとに ちがう','抵抗が 大きいほど 大きい','0'],
  ['並列回路で 各部分に かかる 電圧は？','どこも 等しい','部分ごとに ちがう','合計が 等しい','0'],['電力の 単位は？','W（ワット）','J','N','Pa'],
  ['磁界の 中で 電流が 受ける 力を 使った ものは？','モーター','発電機','電熱線','LED'],['コイルの 中の 磁界を 変化させて 電流を 得る 現象は？','電磁誘導','静電気','放電','屈折'],
  ['物体が 運動を 続けようと する 性質は？','慣性','摩擦','重力','浮力'],['水中の 物体が 上向きに 受ける 力は？','浮力','重力','摩擦力','磁力'],
  ['仕事の 単位は？','J（ジュール）','W','N','Pa'],['道具を 使っても 仕事の 量が かわらないことを？','仕事の原理','慣性の法則','エネルギー保存','作用反作用']
 ],
 earth:[
  ['地震が 発生した 地下の 場所は？','震源','震央','断層','活火山'],['震源の 真上の 地表の 地点は？','震央','震源','震度','海溝'],
  ['地震の ゆれの 大きさを あらわすのは？','震度','マグニチュード','気圧','湿度'],['地震の 規模（エネルギー）を あらわすのは？','マグニチュード','震度','震央','初期微動'],
  ['はじめの 小さな ゆれを？','初期微動','主要動','余震','津波'],['P波と S波で 速いのは？','P波','S波','同じ','場合による'],
  ['マグマが 地表付近で 急に 冷えて できる 岩石は？','火山岩','深成岩','堆積岩','変成岩'],['マグマが 地下深くで ゆっくり 冷えて できる 岩石は？','深成岩','火山岩','堆積岩','れき岩'],
  ['花こう岩は？','深成岩','火山岩','堆積岩','化石'],['安山岩は？','火山岩','深成岩','堆積岩','鉱物'],
  ['塩酸を かけると 二酸化炭素が 出る 堆積岩は？','石灰岩','チャート','砂岩','泥岩'],['火山灰が 固まって できた 岩石は？','凝灰岩','石灰岩','花こう岩','玄武岩'],
  ['地層が できた 時代を 知る 化石は？','示準化石','示相化石','生きた化石','化石燃料'],['地層が できた 環境を 知る 化石は？','示相化石','示準化石','鉱物','結晶'],
  ['恐竜の 化石は 何時代？','中生代','古生代','新生代','先カンブリア時代'],['空気が 上昇すると 気温は？','下がる','上がる','かわらない','2倍'],
  ['雲が できる ときの 空気の 動きは？','上昇気流','下降気流','水平な 風','無風'],['寒冷前線が 通過した あとの 気温は？','下がる','上がる','かわらない','急に 30℃'],
  ['温暖前線の 前に 広がる 雲は？','乱層雲','積乱雲','積雲','雲が ない'],['積乱雲が もたらす 雨は？','短時間の 強い 雨','長時間の 弱い 雨','雪だけ','ない'],
  ['高気圧の 中心付近の 天気は？','晴れやすい','雨が 多い','台風','雷'],['冬の 日本の 典型的な 気圧配置は？','西高東低','南高北低','東高西低','北高南低'],
  ['地球の 自転で 起こる 現象は？','1日の 昼と 夜','季節の 変化','月の 満ち欠け','潮の 満ち引きだけ'],['地球の 公転で 起こる 現象は？','季節の 変化','昼と 夜','月の 満ち欠け','地震'],
  ['太陽系で いちばん 大きい 惑星は？','木星','土星','地球','海王星'],['太陽系で 太陽に いちばん 近い 惑星は？','水星','金星','地球','火星'],
  ['明けの 明星・よいの 明星と よばれる 惑星は？','金星','火星','木星','水星'],['自ら 光を 出す 天体は？','恒星','惑星','衛星','すい星']
 ]
};
/* ---------- 絵で 答える ---------- */
const BUGS = [['rp_bee','ミツバチ'],['rp_ant','アリ'],['rp_dragonfly','トンボ'],['rp_grasshopper','バッタ'],['rp_spider','クモ'],['rp_kabuto','カブトムシ'],['rp_cicada','セミ'],['rp_mantis','カマキリ'],['rp_caterpillar','アオムシ（よう虫）'],['rp_pupa','さなぎ']];
const NOTBUG = {'rp_spider':1};
const PLANTS = [['rp_tulip','チューリップ','春'],['rp_dandelion','タンポポ','春'],['rp_asagao','アサガオ','夏'],['rp_tomato','ミニトマト','夏'],['rp_rice','イネ','秋'],['rp_sunflower2','ヒマワリ','夏']];
const SKY = [['rp_fullmoon','満月'],['rp_halfmoon','半月'],['rp_crescent','三日月'],['rp_saturn','土星'],['rp_dipper','北斗七星']];
const SPIC = k => `<img class="qPic" src="${esc(artSrc(k))}" alt="">`;
const sciMk = (q, ans, opts, extra={}) => Object.assign({type:'choice', q, ans, opts, hint:''}, extra);
function sciBank(key, pic){ return function(){ const r = choice(SCI_BANK[key]); return sciMk(r[0], r[1], shuffle(r.slice(1)), {disp: pic ? SPIC(pic) : '', sub:r[0]}); }; }
const RI = {
  r_bugpic:{n:'こん虫・生き物（絵）', lv:1, cat:'🐛 生き物', art:'ri_butterfly', gen(){ const b = choice(BUGS), k = ri(0,1);
    if(k===0 || b[0]==='rp_pupa' || b[0]==='rp_caterpillar') return sciMk('この 生き物の 名前は？', b[1], optsFrom(b[1], BUGS.map(x=>x[1])), {disp:SPIC(b[0]), sub:b[1]});
    const ans = NOTBUG[b[0]] ? 'こん虫では ない' : 'こん虫';
    return sciMk(`絵の <b>${b[1]}</b> は こん虫？`, ans, ['こん虫','こん虫では ない'], {disp:SPIC(b[0]), hint:'あしが 6本なら こん虫', sub:b[1]}); }},
  r_bug:{n:'こん虫の からだと 育ち', lv:1, cat:'🐛 生き物', art:'ri_ladybug', gen:sciBank('bug', null)},
  r_plantpic:{n:'植物（絵）', lv:1, cat:'🌱 植物', art:'ri_sunflower', gen(){ const p = choice(PLANTS.filter(x => x[0]!=='rp_sunflower2')), k = ri(0,1);
    if(k===0) return sciMk('この 植物の 名前は？', p[1], optsFrom(p[1], PLANTS.map(x=>x[1])), {disp:SPIC(p[0]), sub:p[1]});
    return sciMk(`<b>${p[1]}</b> の 花が さく（みのる） 季節は？`, p[2], ['春','夏','秋','冬'], {disp:SPIC(p[0]), sub:p[1]}); }},
  r_plant:{n:'植物の つくりと 育ち', lv:1, cat:'🌱 植物', art:'ri_sunflower', gen:sciBank('plant', null)},
  r_sun:{n:'太陽と 光・音', lv:1, cat:'☀️ 光・太陽', art:'ri_shadow', gen:sciBank('sunlight', 'ri_shadow')},
  r_mag:{n:'じしゃく・電気・風とゴム', lv:1, cat:'🧲 じしゃく・電気', art:'ri_magnet', gen(){ const p = sciBank('magelec', null)(); p.disp = SPIC(/じしゃく|極/.test(p.q) ? 'ri_magnet' : 'ri_circuit'); return p; }},
  r_sky:{n:'月と 星', lv:1, cat:'🌙 月と 星', art:'ri_stars', gen(){ if(Math.random() < .35){ const s = choice(SKY); return sciMk('絵の 天体（星・月）の 名前は？', s[1], optsFrom(s[1], SKY.map(x=>x[1]).concat(['オリオン座','新月'])), {disp:SPIC(s[0]), sub:s[1]}); }
    return sciBank('sky', null)(); }},
  r_body:{n:'人の 体（ほねと 筋肉）', lv:1, cat:'💪 人の 体', art:'ri_body', gen:sciBank('body', 'ri_body')},
  r_water:{n:'水・空気・温度・天気', lv:1, cat:'💧 水と 温度', art:'ri_thermo', gen(){ const p = sciBank('water', null)(); p.disp = SPIC(/気温|天気|雨/.test(p.q) ? 'ri_water' : 'ri_thermo'); return p; }},
  r_flower:{n:'花・実・種子・光合成', lv:2, cat:'🌸 植物', art:'ri_flower', gen:sciBank('flower', 'ri_flower')},
  r_life:{n:'生命の たんじょう', lv:2, cat:'🐟 生命', art:'ri_frog', gen:sciBank('life', 'ri_scope')},
  r_sol:{n:'もののとけ方・水よう液', lv:2, cat:'🧪 水よう液', art:'ri_beaker', gen:sciBank('sol', 'ri_beaker')},
  r_lever:{n:'ふりこ・てこ', lv:2, cat:'⚖️ ふりこ・てこ', art:'ri_lever', gen(){
    if(Math.random() < .45){ const w1 = ri(1,6)*10, d1 = ri(1,6), d2 = choice([1,2,3,4,5,6].filter(x => (w1*d1) % x===0 && x!==d1)) || 2, w2 = w1*d1/d2;
      return {type:'num', q:`てこの 左に <b>${w1}g</b> を 支点から <b>${d1}</b> の 位置、右の <b>${d2}</b> の 位置に 何g つるすと つり合う？`, disp:SPIC('ri_lever'), ans:String(w2), hint:`${w1}×${d1} ＝ □×${d2}`, sub:'lever'}; }
    return sciBank('pend', 'ri_lever')(); }},
  r_emag:{n:'電磁石・電気の 利用', lv:2, cat:'⚡ 電気', art:'ri_circuit', gen:sciBank('emag', 'ri_circuit')},
  r_land:{n:'天気・流れる水・大地', lv:2, cat:'🌋 大地と 天気', art:'ri_volcano', gen(){ const p = sciBank('weather', null)(); p.disp = SPIC(/天気|台風|雨|気象/.test(p.q) ? 'ri_water' : /化石/.test(p.q) ? 'ri_fossil' : 'ri_volcano'); return p; }},
  r_burn:{n:'ものの 燃え方と 空気', lv:2, cat:'🔥 燃焼', art:'ri_beaker', gen:sciBank('burn', null)},
  r_hbody:{n:'人の 体の はたらき', lv:2, cat:'💪 人の 体', art:'ri_body', gen:sciBank('hbody', 'ri_body')},
  r_moon:{n:'月と 太陽', lv:2, cat:'🌙 月と 太陽', art:'ri_earth', gen(){ if(Math.random() < .3){ const s = choice(SKY.slice(0,3)); return sciMk('絵の 月の よび名は？', s[1], optsFrom(s[1], ['満月','半月','三日月','新月']), {disp:SPIC(s[0]), sub:s[1]}); } return sciBank('moonsun', 'ri_earth')(); }},
  r_bio:{n:'生物（細胞・分類・遺伝）', lv:3, cat:'🔬 生物', art:'ri_scope', gen:sciBank('bio', 'ri_scope')},
  r_chem:{n:'化学（物質・化学変化）', lv:3, cat:'⚗️ 化学', art:'ri_beaker', gen:sciBank('chem', 'ri_beaker')},
  r_phys:{n:'物理（光・音・力・電気）', lv:3, cat:'💡 物理', art:'ri_circuit', gen:sciBank('phys', null)},
  r_earth:{n:'地学（地震・岩石・天気・天体）', lv:3, cat:'🌍 地学', art:'ri_earth', gen(){ const p = sciBank('earth', null)(); p.disp = SPIC(/地震|岩|化石|マグマ/.test(p.q) ? 'ri_volcano' : /惑星|天体|自転|公転|明星/.test(p.q) ? 'ri_earth' : 'ri_water'); return p; }},
  r_calc:{n:'計算（オーム・密度・濃度・圧力）', lv:3, key:'.', cat:'🧮 計算', art:'ri_balance', gen(){ const k = ri(0,3);
    if(k===0){ const R = choice([2,4,5,10,20,25,50]), I = choice([0.2,0.4,0.5,1,2]), V = Math.round(R*I*100)/100; const t = ri(0,2);
      if(t===0) return {type:'num', q:`抵抗 <b>${R}Ω</b> に <b>${I}A</b> の 電流。電圧は 何V？`, ans:String(V), hint:'電圧 = 抵抗 × 電流', sub:'ohm'+R+I};
      if(t===1) return {type:'num', q:`<b>${V}V</b> の 電圧で <b>${I}A</b> 流れた。抵抗は 何Ω？`, ans:String(R), hint:'抵抗 = 電圧 ÷ 電流', sub:'ohm'+R+I};
      return {type:'num', q:`抵抗 <b>${R}Ω</b> に <b>${V}V</b> を かけた。電流は 何A？`, ans:String(I), hint:'電流 = 電圧 ÷ 抵抗', sub:'ohm'+R+I}; }
    if(k===1){ const d = choice([0.8,1,2.7,7.9,8.9,11.3,13.6,2,3]), v = ri(2,20), m = Math.round(d*v*100)/100;
      return {type:'num', q:`質量 <b>${m}g</b>、体積 <b>${v}cm³</b> の 物質の 密度は 何g/cm³？`, ans:String(d), hint:'密度 = 質量 ÷ 体積', sub:'den'+d+v}; }
    if(k===2){ const s = ri(1,9)*5, w = choice([45,95,195,70,80,90,180]); const tot = s + w; const c = Math.round(s/tot*1000)/10;
      if(Number.isInteger(s*100/tot)) return {type:'num', q:`水 <b>${w}g</b> に 食塩 <b>${s}g</b> を とかした。質量パーセント濃度は 何%？`, ans:String(s*100/tot), hint:'溶質 ÷ 溶液 × 100', sub:'con'+s+w};
      const T = choice([100,200,250,400]), P = choice([5,10,15,20]); return {type:'num', q:`<b>${P}%</b> の 食塩水 <b>${T}g</b> に とけている 食塩は 何g？`, ans:String(T*P/100), hint:'溶液 × 濃度 ÷ 100', sub:'con'+T+P}; }
    const F = choice([10,20,30,40,50,60,100]), S = choice([0.01,0.02,0.05,0.1,0.2]), P = Math.round(F/S);
    return {type:'num', q:`<b>${F}N</b> の 力が <b>${S}m²</b> に はたらく。圧力は 何Pa？`, ans:String(P), hint:'圧力 = 力 ÷ 面積', sub:'pre'+F+S}; }}
};
PLANTS.push(['ri_sunflower','ヒマワリ','夏']); PLANTS.splice(PLANTS.findIndex(x => x[0]==='rp_sunflower2'), 1);
Object.entries(RI).forEach(([k,u]) => { MATH_UNITS[k] = Object.assign(u, {g:'sci'}); });
const SCI_LV = Object.fromEntries(Object.entries(RI).map(([k,u]) => [k, u.lv]));
const RS = {units:['r_bugpic'], count:10};
function renderSci(){
  const M = mSave(); if(M.sciSel && !RS.loaded){ RS.loaded = 1; RS.units = M.sciSel.filter(k => MATH_UNITS[k]); } if(!RS.units.length) RS.units = ['r_bugpic'];
  if(!multiOn('sci') && RS.units.length > 1) RS.units = RS.units.slice(0,1);
  const lv = M.sciLv || 1, ks = Object.keys(SCI_LV).filter(k => SCI_LV[k]===lv), cats = uniq(ks.map(k => RI[k].cat));
  $('#rUnits').innerHTML = `<div class="miniSeg" id="rLvTabs">${SOC_LEVELS.map(([l,n]) => `<button data-rl="${l}" class="${l===lv?'on':''}">${n}</button>`).join('')}</div>
    <div class="multiRow">${multiBtn('sci')}<small>${multiOn('sci') ? 'いくつでも えらべるよ' : 'タッチした たんげんだけ 出るよ'}</small></div>` +
    cats.map(c => `<h4 class="sGrp">${c}</h4><div class="sGrid">${ks.filter(k => RI[k].cat===c).map(k => { const u = RI[k], s = M.stats[k] || {n:0, c:0}, rate = s.n ? Math.round(s.c/s.n*100) : null;
      return `<button class="mUnit soc sci ${RS.units.includes(k)?'on':''}" data-ru="${k}"><img class="mIco" src="${esc(artSrc(u.art))}" alt=""><span class="mTxt"><b>${u.n}</b><small>${s.n ? `${s.c}/${s.n} せいかい` : 'まだ やってない'}</small>${rate!=null?`<i class="mBar"><i style="width:${rate}%"></i></i>`:''}</span>${RS.units.includes(k)?'<span class="mChk">✓</span>':''}</button>`; }).join('')}</div>`).join('') +
    `<div class="note" style="margin-top:8px">えらんだ たんげん：${RS.units.map(k => MATH_UNITS[k]?.n).filter(Boolean).join('・')}</div>`;
  syncSeg('rCount', RS.count); M.sciSel = RS.units.slice(); persist();
}
document.addEventListener('click', e => {
  const l = e.target.closest('[data-rl]'); if(l){ e.stopImmediatePropagation(); mSave().sciLv = +l.dataset.rl; persist(); renderSci(); return; }
  const m = e.target.closest('[data-multi="sci"]'); if(m){ e.stopImmediatePropagation(); const M = mSave(); M.multi = M.multi || {}; M.multi.sci = !M.multi.sci; if(!M.multi.sci) RS.units = RS.units.slice(0,1); persist(); renderSci(); return; }
  const u = e.target.closest('#rUnits [data-ru]'); if(u){ e.stopImmediatePropagation(); RS.units = pickUnit(RS.units, u.dataset.ru, 'sci'); sound('tap'); renderSci(); return; }
}, true);
$('#rCount').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; RS.count = +b.dataset.v; renderSci(); });
function sciStart(){
  const list = buildSet(RS.units, RS.count);
  window.MQSOC = true; window.MQSCI = true; $('#mPlayTag').textContent = 'りか'; $('#mPlayTag').style.background = 'var(--green)';
  MQ = {list, i:0, res:[], pts:0, t0:Date.now(), combo:0, soc:true}; show('mathplay'); mRender();
}
$('#rStart').onclick = sciStart;
$('#subjSci').onclick = () => show('sci');
const _socStart16 = socStart; socStart = function(){ window.MQSCI = false; _socStart16(); };
$('#sStart').onclick = socStart;
const _mStart16 = $('#mStart').onclick; $('#mStart').onclick = () => { window.MQSCI = false; _mStart16(); };
const _hardUnits16 = hardUnits;
hardUnits = function(units, soc){
  if(window.MQSCI){ const lv = Math.max(...units.map(k => SCI_LV[k] || 1)), up = Math.min(3, lv+1); const ks = Object.keys(SCI_LV).filter(k => SCI_LV[k]===up); return ks.length ? ks : units; }
  return _hardUnits16(units, soc);
};
PARENT.sci = 'subject';
const _show16 = show; show = function(name){ _show16(name); if(name==='sci') renderSci(); };
MISSIONS.sci5 = {ev:'sci', n:5, i:'🔬', t:'りかを 5問 とこう'};
BADGES.push({id:'sci50', i:'🔬', n:'りか 50問', f:()=>Object.entries(save.math?.stats||{}).filter(([k])=>k.startsWith('r_')).reduce((a,[,s])=>a+s.c,0)>=50});

/* =====================================================================
   もようがえトレイ：コンパクト・たためる
   ===================================================================== */
const TRAY = {mini:false, cars:false};
function trayUI(id){
  const tr = $(id); if(!tr) return;
  tr.classList.toggle('mini', TRAY.mini);
  if(!tr.querySelector('.trayGrip')) tr.insertAdjacentHTML('afterbegin', `<button class="trayGrip" data-grip="1">${TRAY.mini ? '▲ ひらく' : '▼ たたむ'}</button>`);
  else tr.querySelector('.trayGrip').textContent = TRAY.mini ? '▲ ひらく' : '▼ たたむ';
}
const _renderTray16 = renderTray;
renderTray = function(){
  _renderTray16();
  if(!townEdit) return;
  trayUI('#townTray');
  const box = $('#trayCars'); if(box){ box.classList.toggle('closed', !TRAY.cars); const h = box.querySelector('.tcHead'); if(h) h.innerHTML = `🚗 のりもの ${TRAY.cars ? '▼' : '▶'} <small>${TRAY.cars ? 'タッチで「はしる ⇄ しゃこ」' : 'タッチで ひらく'}</small>`; }
};
const _renderHomeTray16 = renderHomeTray;
renderHomeTray = function(){ _renderHomeTray16(); if(homeEdit) trayUI('#homeTray'); };
document.addEventListener('click', e => {
  if(e.target.closest('[data-grip]')){ e.stopImmediatePropagation(); TRAY.mini = !TRAY.mini; curScreen==='town' ? renderTray() : renderHomeTray(); return; }
  if(e.target.closest('#trayCars .tcHead')){ e.stopImmediatePropagation(); TRAY.cars = !TRAY.cars; renderTray(); }
}, true);


/* =====================================================================
   v1.7：住民クイズの バランス・えいご（こども）・プログラミング・季節イベント・にがておばけ ボス戦
   ===================================================================== */
const EW = {
  en_apple:['apple','りんご','food'],en_banana:['banana','バナナ','food'],en_orange:['orange','オレンジ','food'],en_strawberry:['strawberry','いちご','food'],en_grapes:['grapes','ぶどう','food'],en_watermelon:['watermelon','すいか','food'],
  en_dog:['dog','いぬ','animal'],en_cat:['cat','ねこ','animal'],en_rabbit:['rabbit','うさぎ','animal'],en_bird:['bird','とり','animal'],en_fish:['fish','さかな','animal'],en_elephant:['elephant','ぞう','animal'],
  en_car:['car','くるま','vehicle'],en_bus:['bus','バス','vehicle'],en_bike:['bike','じてんしゃ','vehicle'],en_airplane:['airplane','ひこうき','vehicle'],en_boat:['boat','ふね','vehicle'],en_train:['train','でんしゃ','vehicle'],
  en_book:['book','ほん','things'],en_pencil:['pencil','えんぴつ','things'],en_bag:['bag','かばん','things'],en_chair:['chair','いす','things'],en_clock:['clock','とけい','things'],en_umbrella:['umbrella','かさ','things'],
  en_sun:['sun','たいよう','nature'],en_moon:['moon','つき','nature'],en_star:['star','ほし','nature'],en_tree:['tree','き','nature'],en_flower:['flower','はな','nature'],en_house:['house','いえ','nature'],
  en_sunny:['sunny','はれ','weather'],en_rainy:['rainy','あめ','weather'],en_snowy:['snowy','ゆき','weather'],en_cloudy:['cloudy','くもり','weather'],en_windy:['windy','かぜが つよい','weather'],en_rainbow:['rainbow','にじ','weather'],
  en_happy:['happy','うれしい','feel'],en_sad:['sad','かなしい','feel'],en_angry:['angry','おこっている','feel'],en_sleepy:['sleepy','ねむい','feel'],en_hungry:['hungry','おなかが すいた','feel'],en_surprised:['surprised','びっくり','feel'],
  en_tshirt:['T-shirt','Tシャツ','clothes'],en_cap:['cap','ぼうし','clothes'],en_shoes:['shoes','くつ','clothes'],en_socks:['socks','くつした','clothes'],en_skirt:['skirt','スカート','clothes'],en_coat:['coat','コート','clothes'],
  en_soccer:['soccer','サッカー','sports'],en_baseball:['baseball','やきゅう','sports'],en_tennis:['tennis','テニス','sports'],en_basketball:['basketball','バスケットボール','sports'],en_piano:['piano','ピアノ','sports'],en_guitar:['guitar','ギター','sports'],
  en_eat:['eat','たべる','action'],en_run:['run','はしる','action'],en_swim:['swim','およぐ','action'],en_sleep:['sleep','ねる','action'],en_read:['read','よむ','action'],en_sing:['sing','うたう','action']
};
const EWK = c => Object.keys(EW).filter(k => EW[k][2]===c);
const sayBtn = w => `<button class="sayBtn" data-say="${esc(w)}">🔊 きく</button>`;
const ekPic = k => `<div class="ekPic"><img class="qPic" src="${esc(artSrc(k))}" alt="">${sayBtn(EW[k][0])}</div>`;
const ekImgOpts = opts => Object.fromEntries(opts.map(o => [o, `<img class="ekOpt" src="${esc(artSrc(Object.keys(EW).find(x => EW[x][0]===o)))}" alt="">`]));
function ekWordUnit(cats, n, art, lv){ return {n, lv, art, gen(){
  const ks = cats.flatMap(EWK), k = choice(ks), w = EW[k], t = ri(0,2);
  if(t===0) return {type:'choice', q:'この 絵は えいごで なんという？', disp:ekPic(k), ans:w[0], opts:optsFrom(w[0], ks.map(x => EW[x][0])), say:w[0], sub:w[0], hint:`「${w[0][0]}」から はじまるよ`};
  if(t===1) return {type:'choice', q:`<b class="enW">${esc(w[0])}</b> は にほんごで？`, disp:sayBtn(w[0]), ans:w[1], opts:optsFrom(w[1], ks.map(x => EW[x][1])), say:w[0], sub:w[0]};
  const opts = optsFrom(w[0], ks.map(x => EW[x][0]));
  return {type:'choice', q:`<b class="enW">${esc(w[0])}</b> の 絵は どれ？`, disp:sayBtn(w[0]), ans:w[0], opts, optHtml:ekImgOpts(opts), say:w[0], sub:w[0]};
}}; }
const COLORS = [['red','あか','#E8414B'],['blue','あお','#2E8BD6'],['yellow','きいろ','#F6C744'],['green','みどり','#36A85C'],['pink','ピンク','#FF9DB6'],['orange','オレンジ','#F28F1C'],['purple','むらさき','#8E44D8'],['black','くろ','#222'],['white','しろ','#fff'],['brown','ちゃいろ','#8B5A2B']];
const NUMW = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const DAYS = [['Sunday','にちようび'],['Monday','げつようび'],['Tuesday','かようび'],['Wednesday','すいようび'],['Thursday','もくようび'],['Friday','きんようび'],['Saturday','どようび']];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const GREET = [['Good morning.','おはよう'],['Hello.','こんにちは'],['Good evening.','こんばんは'],['Good night.','おやすみなさい'],['Thank you.','ありがとう'],['I\'m sorry.','ごめんなさい'],['Goodbye.','さようなら'],['Excuse me.','すみません'],['Nice to meet you.','はじめまして'],['See you tomorrow.','また あした']];
const TALKS = [['How are you?','I\'m fine, thank you.'],['What\'s your name?','My name is Hana.'],['How old are you?','I\'m nine.'],['What color do you like?','I like blue.'],
  ['Do you like apples?','Yes, I do.'],['What time is it?','It\'s seven o\'clock.'],['What sport do you like?','I like soccer.'],['Can you swim?','Yes, I can.'],['What\'s this?','It\'s a pencil.'],
  ['Thank you.','You\'re welcome.'],['What do you want?','I want an apple.'],['When is your birthday?','My birthday is May 5th.'],['What day is it today?','It\'s Monday.'],['How\'s the weather?','It\'s sunny.'],
  ['Where is the cat?','It\'s on the chair.'],['Who is he?','He is my brother.']];
const plural = k => { const w = EW[k][0]; return EW[k][2]==='food' && !w.endsWith('s') ? w+'s' : w; };
const EKU = {
  ek_abc:{n:'ABC（アルファベット）', lv:1, art:'en_book', gen(){ const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i = ri(0,23), c = A[i], t = ri(0,2);
    if(t===0) return {type:'choice', q:`大文字 <b class="enW">${c}</b> の 小文字は？`, ans:c.toLowerCase(), opts:optsFrom(c.toLowerCase(), 'abcdefghijklmnopqrstuvwxyz'.split('')), sub:'abc'+c, say:c};
    if(t===1) return {type:'choice', q:`<b class="enW">${A[i]} ${A[i+1]} ？</b>　つぎに くる 文字は？`, ans:A[i+2], opts:optsFrom(A[i+2], A.split('')), sub:'nx'+c, say:`${A[i]}, ${A[i+1]}, ${A[i+2]}`};
    const k = choice(Object.keys(EW)), f = EW[k][0][0].toUpperCase();
    return {type:'choice', q:'この 絵の えいごの さいしょの 文字は？', disp:ekPic(k), ans:f, opts:optsFrom(f, A.split('')), sub:'f'+k, say:EW[k][0]}; }},
  ek_color:{n:'いろ（colors）', lv:1, art:'en_rainbow', gen(){ const c = choice(COLORS);
    if(Math.random()<.5) return {type:'choice', q:'この いろは えいごで？', disp:`<div class="swatchQ" style="background:${c[2]}"></div>`, ans:c[0], opts:optsFrom(c[0], COLORS.map(x=>x[0])), say:c[0], sub:c[0]};
    return {type:'choice', q:`<b class="enW">${c[0]}</b> は どんな いろ？`, disp:sayBtn(c[0]), ans:c[1], opts:optsFrom(c[1], COLORS.map(x=>x[1])), say:c[0], sub:c[0]}; }},
  ek_num:{n:'かず（1〜10）', lv:1, art:'en_star', gen(){ const n = ri(1,10);
    if(Math.random()<.5) return {type:'choice', q:`かずの <b>${n}</b> は えいごで？`, disp:`<div class="numDots">${'⭐'.repeat(n)}</div>`, ans:NUMW[n], opts:optsFrom(NUMW[n], NUMW.slice(1,11)), say:NUMW[n], sub:'n'+n};
    return {type:'choice', q:`<b class="enW">${NUMW[n]}</b> は いくつ？`, disp:sayBtn(NUMW[n]), ans:String(n), opts:optsFrom(String(n), [...Array(10)].map((_,i)=>String(i+1))), say:NUMW[n], sub:'n'+n}; }},
  ek_food:ekWordUnit(['food'], 'くだもの（fruits）', 'en_apple', 1),
  ek_animal:ekWordUnit(['animal'], 'どうぶつ（animals）', 'en_dog', 1),
  ek_greet:{n:'あいさつ', lv:1, art:'en_happy', gen(){ const g = choice(GREET);
    if(Math.random()<.5) return {type:'choice', q:`「<b>${g[1]}</b>」は えいごで？`, ans:g[0], opts:optsFrom(g[0], GREET.map(x=>x[0])), say:g[0], sub:g[0]};
    return {type:'choice', q:`<b class="enW">${esc(g[0])}</b> の いみは？`, disp:sayBtn(g[0]), ans:g[1], opts:optsFrom(g[1], GREET.map(x=>x[1])), say:g[0], sub:g[0]}; }},
  ek_vehicle:ekWordUnit(['vehicle'], 'のりもの（vehicles）', 'en_car', 2),
  ek_things:ekWordUnit(['things','nature'], 'もちもの・しぜん', 'en_pencil', 2),
  ek_weather:ekWordUnit(['weather'], 'てんき（weather）', 'en_sunny', 2),
  ek_feel:ekWordUnit(['feel'], 'きもち（feelings）', 'en_happy', 2),
  ek_clothes:ekWordUnit(['clothes'], 'ふく（clothes）', 'en_tshirt', 2),
  ek_num2:{n:'かず（11〜20・100まで）', lv:2, art:'en_clock', gen(){ if(Math.random()<.7){ const n = ri(11,20); return {type:'choice', q:`かずの <b>${n}</b> は えいごで？`, ans:NUMW[n], opts:optsFrom(NUMW[n], NUMW.slice(11)), say:NUMW[n], sub:'n'+n}; }
    const T = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'], d = ri(2,9); return {type:'choice', q:`かずの <b>${d*10}</b> は えいごで？`, ans:T[d], opts:optsFrom(T[d], T.filter(Boolean)), say:T[d], sub:'t'+d}; }},
  ek_listen:{n:'リスニング（きいて 絵を えらぶ）', lv:2, art:'en_sing', gen(){ const k = choice(Object.keys(EW)), pool = EWK(EW[k][2]), opts = optsFrom(EW[k][0], pool.map(x=>EW[x][0]));
    return {type:'choice', q:'🔊 きこえた ことばの 絵は どれ？', disp:sayBtn(EW[k][0]), ans:EW[k][0], opts, optHtml:ekImgOpts(opts), say:EW[k][0], sub:EW[k][0], listen:1}; }},
  ek_action:ekWordUnit(['action'], 'うごき（actions）', 'en_run', 3),
  ek_sports:ekWordUnit(['sports'], 'スポーツ・がっき', 'en_soccer', 3),
  ek_week:{n:'ようび・つき', lv:3, art:'en_clock', gen(){ if(Math.random()<.55){ const d = choice(DAYS); return Math.random()<.5 ? {type:'choice', q:`「<b>${d[1]}</b>」は えいごで？`, ans:d[0], opts:optsFrom(d[0], DAYS.map(x=>x[0])), say:d[0], sub:d[0]}
      : {type:'choice', q:`<b class="enW">${d[0]}</b> は なんようび？`, disp:sayBtn(d[0]), ans:d[1], opts:optsFrom(d[1], DAYS.map(x=>x[1])), say:d[0], sub:d[0]}; }
    const m = ri(0,11); return {type:'choice', q:`<b>${m+1}月</b> は えいごで？`, ans:MONTHS[m], opts:optsFrom(MONTHS[m], MONTHS), say:MONTHS[m], sub:MONTHS[m]}; }},
  ek_talk:{n:'かいわ（しつもんと へんじ）', lv:3, art:'en_sing', gen(){ const t = choice(TALKS);
    return {type:'choice', q:`<b class="enW">${esc(t[0])}</b><br>へんじに あう ものは？`, disp:sayBtn(t[0]), ans:t[1], opts:optsFrom(t[1], TALKS.map(x=>x[1])), say:t[0], sub:t[0]}; }},
  ek_sentence:{n:'えいごの 文（I like / I can）', lv:3, art:'en_read', gen(){ const t = ri(0,2);
    if(t===0){ const ks = EWK('sports').concat(EWK('food')), k = choice(ks), s = `I like ${plural(k)}.`;
      return {type:'choice', q:'絵に あう 文は どれ？', disp:ekPic(k), ans:s, opts:optsFrom(s, ks.map(x => `I like ${plural(x)}.`)), say:s, sub:s}; }
    if(t===1){ const k = choice(EWK('action')), s = `I can ${EW[k][0]}.`; return {type:'choice', q:'絵に あう 文は どれ？', disp:ekPic(k), ans:s, opts:optsFrom(s, EWK('action').map(x => `I can ${EW[x][0]}.`)), say:s, sub:s}; }
    const k = choice(EWK('feel')), s = `I'm ${EW[k][0]}.`; return {type:'choice', q:'絵に あう 文は どれ？', disp:ekPic(k), ans:s, opts:optsFrom(s, EWK('feel').map(x => `I'm ${EW[x][0]}.`)), say:s, sub:s}; }}
};
Object.entries(EKU).forEach(([k,u]) => { MATH_UNITS[k] = Object.assign(u, {g:'ek'}); });
const EK_LV = Object.fromEntries(Object.entries(EKU).map(([k,u]) => [k, u.lv]));
const EK_LEVELS = [[1,'はじめて'],[2,'小学3・4年'],[3,'小学5・6年']];
const KS = {units:['ek_food'], count:10};
let enVoice = null;
function pickVoice(){ try{ const vs = speechSynthesis.getVoices(); enVoice = vs.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Google|Female|Karen/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang)) || null; }catch(e){} }
if('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function sayEn(text){ try{ if(!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.85; if(enVoice) u.voice = enVoice; speechSynthesis.speak(u); }catch(e){} }
document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if(!b) return; e.stopPropagation(); sayEn(b.dataset.say); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }, true);
function renderEk(){
  const M = mSave(); if(M.ekSel && !KS.loaded){ KS.loaded = 1; KS.units = M.ekSel.filter(k => MATH_UNITS[k]); } if(!KS.units.length) KS.units = ['ek_food'];
  if(!multiOn('ek') && KS.units.length > 1) KS.units = KS.units.slice(0,1);
  const lv = M.ekLv || 1, ks = Object.keys(EK_LV).filter(k => EK_LV[k]===lv);
  $('#kUnits').innerHTML = `<div class="miniSeg" id="kLvTabs">${EK_LEVELS.map(([l,n]) => `<button data-kl="${l}" class="${l===lv?'on':''}">${n}</button>`).join('')}</div>
    <div class="multiRow">${multiBtn('ek')}<small>${multiOn('ek') ? 'いくつでも えらべるよ' : 'タッチした たんげんだけ 出るよ'}</small></div><div class="sGrid">` +
    ks.map(k => { const u = EKU[k], s = M.stats[k] || {n:0, c:0}, rate = s.n ? Math.round(s.c/s.n*100) : null;
      return `<button class="mUnit soc ek ${KS.units.includes(k)?'on':''}" data-ku="${k}"><img class="mIco" src="${esc(artSrc(u.art))}" alt=""><span class="mTxt"><b>${u.n}</b><small>${s.n ? `${s.c}/${s.n} せいかい` : 'まだ やってない'}</small>${rate!=null?`<i class="mBar"><i style="width:${rate}%"></i></i>`:''}</span>${KS.units.includes(k)?'<span class="mChk">✓</span>':''}</button>`; }).join('') +
    `</div><div class="note" style="margin-top:8px">🔊 ボタンで えいごの はつおんが きけるよ（音を 出してね）</div>`;
  syncSeg('kCount', KS.count); M.ekSel = KS.units.slice(); persist();
}
document.addEventListener('click', e => {
  const l = e.target.closest('[data-kl]'); if(l){ e.stopImmediatePropagation(); mSave().ekLv = +l.dataset.kl; persist(); renderEk(); return; }
  const m = e.target.closest('[data-multi="ek"]'); if(m){ e.stopImmediatePropagation(); const M = mSave(); M.multi = M.multi || {}; M.multi.ek = !M.multi.ek; if(!M.multi.ek) KS.units = KS.units.slice(0,1); persist(); renderEk(); return; }
  const u = e.target.closest('#kUnits [data-ku]'); if(u){ e.stopImmediatePropagation(); KS.units = pickUnit(KS.units, u.dataset.ku, 'ek'); sound('tap'); renderEk(); return; }
}, true);
$('#kCount').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; KS.count = +b.dataset.v; renderEk(); });
function ekStart(){
  const list = buildSet(KS.units, KS.count);
  window.MQSOC = true; window.MQSCI = false; window.MQEK = true; $('#mPlayTag').textContent = 'えいご'; $('#mPlayTag').style.background = '#8E44D8';
  MQ = {list, i:0, res:[], pts:0, t0:Date.now(), combo:0, soc:true}; show('mathplay'); mRender();
}
$('#kStart').onclick = ekStart;
$('#subjEk').onclick = () => show('ekid');
const _socStart17 = socStart; socStart = function(){ window.MQEK = false; _socStart17(); }; $('#sStart').onclick = socStart;
const _sciStart17 = sciStart; sciStart = function(){ window.MQEK = false; _sciStart17(); }; $('#rStart').onclick = sciStart;
const _mStart17 = $('#mStart').onclick; $('#mStart').onclick = () => { window.MQEK = false; _mStart17(); };
const _hardUnits17 = hardUnits;
hardUnits = function(units, soc){
  if(window.MQEK){ const lv = Math.max(...units.map(k => EK_LV[k] || 1)), up = Math.min(3, lv+1); const ks = Object.keys(EK_LV).filter(k => EK_LV[k]===up); return ks.length ? ks : units; }
  return _hardUnits17(units, soc);
};
const _mRender17 = mRender;
mRender = function(){ _mRender17(); const p = MQ && MQ.list[MQ.i]; if(window.MQEK && p && p.say && !MQ.done && $('#mPad .mk')) setTimeout(() => sayEn(p.say), 250); };
PARENT.ekid = 'subject'; PARENT.prog = 'subject';
MISSIONS.ek5 = {ev:'ekid', n:5, i:'🔤', t:'えいごを 5問 とこう'};
BADGES.push({id:'ek50', i:'🔤', n:'えいご 50問', f:()=>Object.entries(save.math?.stats||{}).filter(([k])=>k.startsWith('ek_')).reduce((a,[,s])=>a+s.c,0)>=50});

/* =====================================================================
   プログラミング
   ===================================================================== */
const PSTAGES = [
  {w:3,h:1,s:[0,0],g:[2,0],sol:'R R',slack:1,tip:'➡ を ならべて ゴールの 🏁 まで すすもう'},
  {w:3,h:3,s:[0,0],g:[2,2],sol:'R R D D',slack:1,tip:'➡ と ⬇ を くみあわせよう'},
  {w:3,h:3,s:[0,0],g:[2,0],walls:[[1,0],[1,1]],sol:'D D R R U U',slack:1,tip:'🪨 は とおれないよ。まわりみち しよう'},
  {w:3,h:3,s:[0,0],g:[0,2],gems:[[2,0]],sol:'R R D D L L',slack:1,tip:'💎 を ぜんぶ ひろってから ゴールしよう'},
  {w:6,h:1,s:[0,0],g:[5,0],sol:'5(R)',slack:0,tip:'🔁「くりかえし」を つかうと 同じ うごきを まとめられるよ（ブロックは 2こまで）'},
  {w:5,h:5,s:[0,0],g:[4,4],sol:'4(R D)',slack:0,tip:'かいだんの 形。➡⬇ を くりかえそう'},
  {w:8,h:1,s:[0,0],g:[7,0],gems:[[2,0],[4,0],[6,0]],sol:'7(R)',slack:0,tip:'くりかえしで 💎 も まとめて ひろおう'},
  {w:5,h:5,s:[0,0],g:[4,4],gems:[[1,1],[2,2],[3,3]],sol:'4(R D)',slack:0,tip:'💎が ななめに ならんでいるね'},
  {w:6,h:3,s:[0,0],g:[5,2],walls:[[2,0],[0,1],[4,1],[2,2],[4,2]],sol:'R D R R U R R D D',slack:1,tip:'めいろだよ。よく 見て すすもう'},
  {w:5,h:4,s:[0,0],g:[4,3],walls:[[1,0],[1,1],[1,2],[3,1],[3,2],[3,3]],sol:'3(D) 2(R) 3(U) 2(R) 3(D)',slack:0,tip:'ジグザグ！ くりかえしを いくつも つかおう'},
  {w:6,h:5,s:[0,0],g:[5,4],sol:'5(R) 4(D)',slack:0,tip:'2つの くりかえしで いけるかな？'},
  {w:5,h:3,s:[0,0],g:[4,2],sol:'2(R R D)',slack:0,tip:'くりかえしの 中に いくつも ブロックを 入れられるよ'},
  {w:7,h:4,s:[0,0],g:[6,3],gems:[[2,0],[4,1],[6,2]],sol:'3(R R D)',slack:0,tip:'➡➡⬇ の セットを 3かい'},
  {w:7,h:4,s:[0,3],g:[6,3],gems:[[3,0]],sol:'3(R U) 3(R D)',slack:0,tip:'山を のぼって おりよう'},
  {w:5,h:5,s:[0,0],g:[0,1],walls:[[1,1],[2,1],[3,1],[1,2],[2,2],[3,2],[1,3],[2,3],[3,3]],gems:[[4,0],[4,4],[0,4]],sol:'4(R) 4(D) 4(L) 3(U)',slack:0,tip:'まわりを ぐるっと 1しゅう'},
  {w:7,h:7,s:[0,0],g:[6,6],walls:[[1,0],[1,1],[3,2],[3,3],[5,4],[5,5]],gems:[[2,2],[4,4]],sol:'3(2(D) 2(R))',slack:0,tip:'さいごの ステージ！ くりかえしの 中に くりかえし…は できないから、よく 考えて！'}
];
PSTAGES[15].sol = '2(D) 2(R) 2(D) 2(R) 2(D) 2(R)'; PSTAGES[15].slack = 1; PSTAGES[15].tip = 'さいごの ステージ！ 🔁を 6こ つかえば いけるよ';
const DIRV = {U:[0,-1], D:[0,1], L:[-1,0], R:[1,0]}, DARROW = {U:'⬆',D:'⬇',L:'⬅',R:'➡'};
function parseSol(s){ const out = []; const re = /(\d+)\(([^)]*)\)|([UDLR])/g; let m; while((m = re.exec(s))){ if(m[1]) out.push({t:'loop', n:+m[1], body:m[2].trim().split(/\s+/).map(t => ({t}))}); else out.push({t:m[3]}); } return out; }
const pCount = prog => prog.reduce((a,c) => a + (c.t==='loop' ? 1 + c.body.length : 1), 0);
const pFlat = prog => prog.flatMap(c => c.t==='loop' ? [...Array(c.n)].flatMap(() => c.body.map(b => b.t)) : [c.t]);
PSTAGES.forEach(st => { st.max = pCount(parseSol(st.sol)) + (st.slack||0); });
function pSim(st, steps){
  let [x,y] = st.s; const gems = new Set((st.gems||[]).map(g => g.join())), walls = new Set((st.walls||[]).map(w => w.join())), path = [[x,y]];
  for(const d of steps){ const [dx,dy] = DIRV[d], nx = x+dx, ny = y+dy;
    if(nx<0 || ny<0 || nx>=st.w || ny>=st.h || walls.has(nx+','+ny)) return {ok:false, path, crash:[nx,ny], why: walls.has(nx+','+ny) ? 'いわに ぶつかった！' : 'そとに 出ちゃった！'};
    x = nx; y = ny; gems.delete(x+','+y); path.push([x,y]); }
  const goal = x===st.g[0] && y===st.g[1];
  return {ok: goal && !gems.size, path, why: !goal ? 'ゴールに とどかなかった…' : 'まだ 💎が のこっているよ'};
}
const PG = {stage:0, prog:[], open:-1, running:false};
function pData(){ return save.prog || (save.prog = {stars:{}}); }
function renderProgSel(){
  const P = pData();
  $('#pView').innerHTML = `<div class="pSel">${PSTAGES.map((st,i) => { const s = P.stars[i]||0, lock = i > 0 && !P.stars[i-1];
    return `<button class="pStage ${lock?'plock':''} ${s?'done':''}" data-ps="${i}" ${lock?'disabled':''}><b>${lock ? '🔒' : i+1}</b><span>${'★'.repeat(s)}${'☆'.repeat(3-s)}</span></button>`; }).join('')}</div>
    <div class="note">ステージを クリアすると つぎに すすめるよ。★3は ブロックが いちばん 少ない とき！</div>`;
}
function openStage(i){ PG.stage = i; PG.prog = []; PG.open = -1; PG.running = false; renderStage(); }
function boardHTML(st, pos, fx={}){
  const walls = new Set((st.walls||[]).map(w => w.join())), gems = new Set((st.gems||[]).map(g => g.join())), got = fx.got || new Set();
  const cs = Math.min(64, Math.floor(Math.min(340, innerWidth - 60) / Math.max(st.w, 4)));
  let h = `<div class="pBoard" style="grid-template-columns:repeat(${st.w},${cs}px);--pc:${cs}px">`;
  for(let y=0;y<st.h;y++) for(let x=0;x<st.w;x++){ const k = x+','+y;
    h += `<div class="pCell ${(x+y)%2?'a':'b'}">${walls.has(k)?'<span class="pRock">🪨</span>':''}${gems.has(k)&&!got.has(k)?'<span class="pGem">💎</span>':''}${st.g[0]===x&&st.g[1]===y?'<span class="pGoal">🏁</span>':''}</div>`; }
  const [px,py] = pos; h += `<img class="pBird" id="pBird" src="${esc(artSrc('bird_wave'))}" style="left:${px*cs}px;top:${py*cs}px;width:${cs}px">`;
  return h + '</div>';
}
function progHTML(){
  if(!PG.prog.length) return '<div class="pEmpty">下の ブロックを タッチして ならべよう（ブロックを タッチで けせるよ）</div>';
  return PG.prog.map((c,i) => c.t==='loop'
    ? `<div class="pLoop ${PG.open===i?'open':''}"><button class="pLoopN" data-ln="${i}">🔁 ${c.n}かい</button>${c.body.map((b,j) => `<button class="pBlk" data-del="${i}.${j}">${DARROW[b.t]}</button>`).join('')}${PG.open===i?'<span class="pCaret">｜</span>':''}<button class="pBlk x" data-del="${i}">✕</button></div>`
    : `<button class="pBlk" data-del="${i}">${DARROW[c.t]}</button>`).join('');
}
function renderStage(){
  const st = PSTAGES[PG.stage], n = pCount(PG.prog);
  $('#pView').innerHTML = `<div class="pHead"><b>ステージ ${PG.stage+1}</b><span class="pTip">💡 ${esc(st.tip)}</span></div>
    <div class="pWrap" id="pBoardBox">${boardHTML(st, st.s)}</div>
    <div class="pProgHead">プログラム <small class="${n > st.max ? 'over' : ''}">ブロック ${n} / ${st.max}</small>${PG.open>=0 ? '<small class="pLoopNote">🔁 の 中に 入れているよ</small>' : ''}</div>
    <div class="pProg" id="pProg">${progHTML()}</div>
    <div class="pPal">${['U','D','L','R'].map(d => `<button class="pKey" data-k="${d}">${DARROW[d]}</button>`).join('')}
      <button class="pKey loop" data-k="loop">${PG.open>=0 ? '🔁 ここまで' : '🔁 くりかえし'}</button></div>
    <div class="pBtns"><button class="btn white small" data-pa="clear">🧽 ぜんぶ けす</button><button class="btn white small" data-pa="back">ステージ えらび</button><button class="btn green" data-pa="run">▶ うごかす</button></div>
    <div id="pMsg" class="pMsg"></div>`;
}
document.addEventListener('click', e => {
  if(curScreen!=='prog') return;
  const s = e.target.closest('[data-ps]'); if(s){ openStage(+s.dataset.ps); return; }
  if(PG.running) return;
  const k = e.target.closest('[data-k]');
  if(k){ const v = k.dataset.k; sound('tap');
    if(v==='loop'){ if(PG.open>=0) PG.open = -1; else { PG.prog.push({t:'loop', n:2, body:[]}); PG.open = PG.prog.length-1; } }
    else if(PG.open>=0) PG.prog[PG.open].body.push({t:v}); else PG.prog.push({t:v});
    renderStage(); return; }
  const ln = e.target.closest('[data-ln]'); if(ln){ const c = PG.prog[+ln.dataset.ln]; c.n = c.n >= 9 ? 2 : c.n + 1; renderStage(); return; }
  const d = e.target.closest('[data-del]'); if(d){ const [i,j] = d.dataset.del.split('.').map(Number);
    if(!isNaN(j)) PG.prog[i].body.splice(j,1); else { PG.prog.splice(i,1); if(PG.open===i) PG.open = -1; else if(PG.open>i) PG.open--; }
    renderStage(); return; }
  const a = e.target.closest('[data-pa]'); if(!a) return;
  if(a.dataset.pa==='clear'){ PG.prog = []; PG.open = -1; renderStage(); }
  if(a.dataset.pa==='back') renderProgSel();
  if(a.dataset.pa==='run') runProg();
  if(a.dataset.pa==='retry') renderStage();
});
async function runProg(){
  const st = PSTAGES[PG.stage], steps = pFlat(PG.prog);
  if(!steps.length){ toast('ブロックを ならべてね'); return; }
  if(pCount(PG.prog) > st.max){ $('#pMsg').innerHTML = `<span class="ngTxt">ブロックが ${st.max}こ より 多いよ。🔁を つかって へらそう</span>`; return; }
  PG.running = true; PG.open = -1;
  const r = pSim(st, steps), got = new Set(), cs = parseFloat(getComputedStyle($('.pBoard')).getPropertyValue('--pc'));
  for(let i=1;i<r.path.length;i++){ const [x,y] = r.path[i], gk = x+','+y;
    if((st.gems||[]).some(g => g.join()===gk) && !got.has(gk)){ got.add(gk); $('#pBoardBox').innerHTML = boardHTML(st, r.path[i-1], {got}); }
    const bird = $('#pBird'); void bird.offsetWidth; bird.style.left = x*cs+'px'; bird.style.top = y*cs+'px'; sound('tap');
    await new Promise(z => setTimeout(z, 340)); }
  if(r.crash){ $('#pBird').classList.add('crash'); }
  PG.running = false;
  if(!r.ok){ sound('ng'); $('#pMsg').innerHTML = `<span class="ngTxt">😵 ${r.why}</span> <button class="btn small white" data-pa="retry">もういちど</button>`; return; }
  const n = pCount(PG.prog), best = st.max - (st.slack||0), stars = n <= best ? 3 : n <= best + 1 ? 2 : 1;
  const P = pData(), prev = P.stars[PG.stage]||0; P.stars[PG.stage] = Math.max(prev, stars);
  let pt = 0; if(!prev) pt += 30; if(stars > prev) pt += (stars - prev)*10;
  if(pt) pt = givePts(pt, `プログラミング ステージ${PG.stage+1}`);
  persist(); confetti(1800); sound('fan'); misEv('prog'); checkBadges();
  const next = PG.stage + 1 < PSTAGES.length;
  const v = await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('bird_jump'))}" alt=""></div><h2 class="dlgT">ステージ ${PG.stage+1} クリア！</h2>
    <div class="stars big">${'★'.repeat(stars)}<i>${'★'.repeat(3-stars)}</i></div><p class="dlgP">ブロック ${n}こ ${stars<3 ? `（★3は ${best}こ いか）` : 'で パーフェクト！'}${pt ? `<br><span class="ptFloat">+${pt}pt</span>` : ''}</p>`,
    (next ? [{label:'つぎの ステージ ▶', cls:'pink', v:'next'}] : []).concat([{label:'もういちど', cls:'white', v:'again'}, {label:'ステージ えらび', cls:'white', v:'sel'}]), 'wide');
  if(v==='next') openStage(PG.stage+1); else if(v==='again') renderStage(); else renderProgSel();
}
$('#subjProg').onclick = () => { show('prog'); renderProgSel(); };
MISSIONS.prog1 = {ev:'prog', n:1, i:'🤖', t:'プログラミングを 1ステージ クリア'};
BADGES.push({id:'prog8', i:'🤖', n:'プログラマー', f:()=>Object.keys(save.prog?.stars||{}).length>=8}, {id:'progall', i:'💻', n:'ぜんステージ クリア', f:()=>Object.keys(save.prog?.stars||{}).length>=PSTAGES.length});

/* =====================================================================
   住民の 問題：にがて中心 ＋ いろいろな 教科・かぶらない
   ===================================================================== */
function mqFromP(p, u){
  if(!p || p.optHtml || p.type==='rem' || p.listen) return null;
  const html = `<div class="mqSent math">${p.q}</div>${p.disp||''}`;
  let m = null;
  if(p.type==='choice') m = {html, ans:p.ans, opts:shuffle(p.opts.slice())};
  else if(p.type==='cmp') m = {html, ans:p.ans, opts:['>','=','<']};
  else { const a = Number(normNum(p.ans)); if(!isFinite(a) || !Number.isInteger(a)) return null; const set = new Set([a]); let g = 0;
    while(set.size < 4 && g++ < 40){ const d = choice([1,2,10,-1,-2,-10,100,-100]) * (a >= 1000 ? choice([1,10,100]) : 1); const v = a + d; if(v >= 0) set.add(v); }
    m = {html, ans:String(a), opts:shuffle([...set].map(String)).map(fmtNumOpt), ansF:fmtNumOpt(String(a))}; }
  m.hint = p.hint||''; m.key = u+':'+stripTags(p.q)+'|'+p.ans; m.say = p.say; return m;
}
function kanjiMQ(q, weak){
  const others = shuffle(BUILTIN.filter(x => x.reading!==q.reading)).slice(0, 24).map(x => x.reading);
  const opts = uniq([q.reading, ...shuffle(others.filter(x => Math.abs(x.length-q.reading.length)<=1)).slice(0,3), ...others]).slice(0,4);
  return {kind:'kanji', html:`${weak ? '<div class="weakTag">🔥 にがてな 漢字</div>' : ''}<div class="mqSent">${esc(q.pre)}<u>${esc(q.word)}</u>${esc(q.post)}</div><div class="mqAsk">せんの ことばの 読みは？</div>`,
    ans:q.reading, opts:shuffle(opts), hint:`「${q.reading[0]}」から はじまるよ`, kq:q, key:'kq:'+q.id};
}
const played = pre => Object.keys(MATH_UNITS).filter(k => k.startsWith(pre) && (mSave().stats[k]?.n||0) > 0);
function srcUnits(kind){
  if(kind==='math'){ const p = Object.keys(MATH_UNITS).filter(k => typeof MATH_UNITS[k].g==='number' && (mSave().stats[k]?.n||0) > 0); return p.length ? p : ['big','mul1','addsub','time','len','box']; }
  if(kind==='soc'){ const p = Object.keys(SOC_LV).filter(k => (mSave().stats[k]?.n||0) > 0); return p.length ? p : Object.keys(SOC_LV).filter(k => SOC_LV[k]===1); }
  if(kind==='sci'){ const p = played('r_'); return p.length ? p : Object.keys(SCI_LV).filter(k => SCI_LV[k]===1); }
  if(kind==='ek'){ const p = played('ek_'); return p.length ? p : Object.keys(EK_LV).filter(k => EK_LV[k]===1); }
  return [];
}
const MQ_KINDS = [['kanji',1.1],['math',1],['soc',1],['sci',1],['ek',.8]];
const kindOfKey = k => k.startsWith('kq:') ? 'kanji' : k.startsWith('ek_') ? 'ek' : k.startsWith('r_') ? 'sci' : /^(s_|w_|j_|civ)/.test(k) ? 'soc' : 'math';
function mqMem(){ return save.mqMem || (save.mqMem = {recent:[], kinds:[], seen:{}}); }
function noteMQ(m, kind){
  const M = mqMem(); M.recent.unshift(m.key); M.recent = M.recent.slice(0, 30); M.kinds.unshift(kind); M.kinds = M.kinds.slice(0, 4); M.seen[m.key] = Date.now();
  const ks = Object.keys(M.seen); if(ks.length > 600) ks.sort((a,b) => M.seen[a]-M.seen[b]).slice(0,200).forEach(k => delete M.seen[k]);
}
function weakItems(){
  const M = mqMem(), out = [];
  weakQ().forEach(w => { if(w.optHtml) return; out.push({key:w.k, kind:kindOfKey(w.u||''), w}); });
  weakKanji().forEach(q => out.push({key:'kq:'+q.id, kind:'kanji', q}));
  return out.filter(x => !M.recent.slice(0, 8).includes(x.key));
}
function weakToMQ(it){
  if(it.q) return kanjiMQ(it.q, true);
  const w = it.w, m = mqFromP({type:w.type, q:w.q, ans:w.ans, opts:w.opts, disp:w.disp, hint:w.hint}, '');
  if(!m) return null; m.key = w.k; m.wk = w.k; m.html = '<div class="weakTag">🔥 まえに まちがえた 問題</div>' + m.html; return m;
}
function makeMQ(opt={}){
  const M = mqMem(), W = weakItems();
  const weakRate = opt.weakOnly ? 1 : W.length >= 4 ? 0.55 : W.length ? 0.4 : 0;
  if(W.length && Math.random() < weakRate){
    const sc = it => (M.seen[it.key]||0) + (M.kinds.slice(0,2).includes(it.kind) ? 3e12 : 0) + Math.random()*6e4;
    for(const pick of W.sort((a,b) => sc(a) - sc(b)).slice(0,5)){ const m = weakToMQ(pick); if(m){ noteMQ(m, pick.kind); return m; } }
  }
  const kinds = MQ_KINDS.map(([k,w]) => [k, w * (M.kinds[0]===k ? 0.15 : M.kinds[1]===k ? 0.5 : 1)]);
  for(let tries=0; tries<40; tries++){
    let r = Math.random()*kinds.reduce((a,[,w])=>a+w,0), kind = kinds[0][0];
    for(const [k,w] of kinds){ r -= w; if(r<=0){ kind = k; break; } }
    let m;
    if(kind==='kanji') m = kanjiMQ(choice(BUILTIN.concat(customQs||[])), false);
    else { const us = srcUnits(kind); if(!us.length) continue; const u = choice(us); try{ m = mqFromP(MATH_UNITS[u].gen(), u); }catch(e){ m = null; } }
    if(!m || M.recent.includes(m.key)) continue;
    noteMQ(m, kind); return m;
  }
  const m = kanjiMQ(choice(BUILTIN), false); noteMQ(m, 'kanji'); return m;
}
makeMiniQ = function(opt){ LASTMQ = makeMQ(opt||{}); return LASTMQ; };
async function askMQ(m, head){
  const hint = hasSkill('hint'), ans = m.ansF || m.ans; let showHint = false, v;
  while(true){
    v = await dialog(`<div class="mqHead">${head}</div>${m.html}${m.say ? sayBtn(m.say) : ''}${showHint && m.hint ? `<div class="mqHint">💡 ${esc(m.hint)}</div>` : ''}`,
      m.opts.map(o => ({label:esc(o), cls:'white big', v:o})).concat(hint && !showHint && m.hint ? [{label:'💡 ヒント', cls:'gold', v:'__hint'}] : []), 'wide quiz');
    if(v==='__hint'){ showHint = true; continue; } break;
  }
  const ok = v===ans; sound(ok ? 'ok' : 'ng');
  if(m.wk && ok) delWeak(m.wk); if(m.kq) addStat(m.kq, 'read', ok, 1); persist();
  return {ok, ans};
}

/* =====================================================================
   にがておばけ ボス戦
   ===================================================================== */
const BOSSES = [['boss_king','にがて大王'],['boss_ice','こおりの にがておばけ'],['boss_fire','ほのおの にがておばけ'],['boss_rainbow','にじいろ にがてキング']];
function bossData(){ return save.boss || (save.boss = {n:0, last:''}); }
const weakCount = () => weakQ().length + weakKanji().length;
function bossCard(){
  const B = bossData(), b = BOSSES[B.n % BOSSES.length], wc = weakCount();
  if(wc < 3) return `<div class="card bossCard calm"><img src="${esc(artSrc(b[0]))}" alt=""><div><b>👾 にがておばけ</b><small>まちがえた 問題が 3こ たまると あらわれるよ（いま ${wc}こ）</small></div></div>`;
  if(B.last === dayKey()) return `<div class="card bossCard calm"><img src="${esc(artSrc(b[0]))}" alt=""><div><b>💤 ${b[1]}は ねむっている…</b><small>あした また あらわれるよ（にがて ${wc}こ）</small></div></div>`;
  return `<div class="card bossCard"><img class="bossFloat" src="${esc(artSrc(b[0]))}" alt=""><div><b>⚠️ ${b[1]} が あらわれた！</b><small>にがてな 問題 ${wc}こ から 生まれたよ。たおすと すごい ごほうび！</small>
    <button class="btn pink" data-boss="1">⚔️ たたかう</button></div></div>`;
}
async function bossFight(){
  const B = bossData(), b = BOSSES[B.n % BOSSES.length], maxHp = clamp(weakCount(), 3, 8);
  let hp = maxHp, life = 3, combo = 0;
  sound('fan');
  await dialog(`<div class="bossIntro"><img src="${esc(artSrc(b[0]))}" alt=""></div><h2 class="dlgT">${b[1]} が あらわれた！</h2><p class="dlgP">にがてな 問題に せいかいして HPを 0に しよう！<br>❤️が 3かい なくなると にげられちゃう</p>`, [{label:'⚔️ いくぞ！', cls:'pink', v:1}], 'wide boss');
  while(hp > 0 && life > 0){
    const m = makeMQ({weakOnly:true});
    const head = `<div class="bossBar"><img src="${esc(artSrc(b[0]))}" alt=""><div class="bHp"><b>${b[1]}</b><i><i style="width:${hp/maxHp*100}%"></i></i><small>HP ${hp}/${maxHp}</small></div><span class="bLife">${'❤️'.repeat(life)}${'🤍'.repeat(3-life)}</span></div>`;
    const res = await askMQ(m, head);
    if(res.ok){ combo++; const dmg = combo >= 3 ? 2 : 1; hp = Math.max(0, hp - dmg); toast(dmg > 1 ? `💥 れんぞく こうげき！ ${dmg}ダメージ` : '⚔️ こうげき！ 1ダメージ'); }
    else { combo = 0; life--; toast(`😱 こたえは「${res.ans}」 ダメージを うけた！`); }
  }
  B.last = dayKey();
  if(hp <= 0){
    B.n++; save.counters.boss = (save.counters.boss||0) + 1;
    const got = [`🪙 +${givePts(150 + 30*Math.min(B.n,10), `${b[1]}を たおした`)}pt`];
    const sp = FURNITURE.filter(f => f.special || f.price >= 1000), f = choice(sp.length ? sp : FURNITURE); const H = ensureHome(); H.inv[f.id] = (H.inv[f.id]||0) + 1;
    got.push(`<img src="${esc(artSrc(f.art))}" alt=""> ${esc(f.name)}`);
    if(B.n % 3 === 0){ save.town.bag.goldletter = (save.town.bag.goldletter||0) + 1; got.push('✨ きらきらレター'); }
    persist(); confetti(3000); sound('fan');
    await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('bird_jump'))}" alt=""></div><h2 class="dlgT">🎉 ${b[1]}を たおした！</h2><p class="dlgP">にがてを のりこえたね！ すごい！</p>${rewardHTML(got)}`, [{label:'やったー！', cls:'gold', v:1}], 'gold');
  } else {
    persist();
    await dialog(`<div class="bossIntro"><img src="${esc(artSrc(b[0]))}" alt=""></div><h2 class="dlgT">${b[1]}に にげられた…</h2><p class="dlgP">のこり HP ${hp}。あした また ちょうせんしよう！<br><small>まちがえた 問題を ふくしゅうすると つよく なれるよ</small></p>`, [{label:'つぎは まけない！', cls:'', v:1}]);
  }
  checkBadges(); if(curScreen==='home') renderHome();
}
document.addEventListener('click', e => { if(e.target.closest('[data-boss]')){ e.stopImmediatePropagation(); bossFight(); } }, true);
BADGES.push({id:'boss1', i:'👾', n:'にがておばけ たいじ', f:()=>(save.counters?.boss||0)>=1}, {id:'boss5', i:'🛡️', n:'にがて ハンター', f:()=>(save.counters?.boss||0)>=5});

/* =====================================================================
   季節イベント
   ===================================================================== */
const EVENTS = {
  halloween:{n:'ハロウィン フェスティバル', i:'🎃', from:[10,1], to:[10,31], fx:['🎃','👻','🍬','🦇'], bg:'linear-gradient(135deg,#3B2457,#F28F1C)',
    items:[['ev_pumpkins','ジャックオーランタン',600],['ev_ghostlamp','おばけランタン',700],['ev_witchhat','まじょの ぼうしと おかし',800],['ev_candy','おかしバケツ',900]],
    talk:['トリック・オア・トリート！ おかし くれる？','おばけの かそう、なんに しようかな〜','かぼちゃって おいしいよね！'], quest:'おばけが 出やすいよ！ 問題を といて ごほうびを あつめよう'},
  christmas:{n:'クリスマス', i:'🎄', from:[12,1], to:[12,25], fx:['❄️','⛄','✨','🎁'], bg:'linear-gradient(135deg,#1F6B3A,#E8414B)',
    items:[['ev_presents','プレゼントの 山',600],['ev_wreath','クリスマスリース',700],['ev_sled','トナカイの そり',900],['ev_santa','サンタさん',1200]],
    talk:['サンタさん、くるかなあ？','ゆきが ふったら いいね！','プレゼント なにを たのんだ？'], quest:'クリスマスまでに 問題を といて プレゼントを もらおう'},
  newyear:{n:'おしょうがつ', i:'🎍', from:[12,31], to:[1,15], fx:['✨','🎍','🧧','🐉'], bg:'linear-gradient(135deg,#C93A63,#F2B91E)',
    items:[['ev_kagami','かがみもち',600],['ev_omikuji','おみくじかけ',700],['ev_hagoita','はごいた',800],['ev_dragonkite','りゅうの たこ',1200]],
    talk:['あけまして おめでとう！ ことしも よろしくね','おぞうに たべた？','かきぞめ、なんて かいた？'], quest:'まいにち おみくじを ひこう！ 問題も がんばろう', omikuji:true},
  summer:{n:'なつやすみ むしとり たいかい', i:'🌻', from:[7,20], to:[8,31], fx:['🌻','🦋','🍉','✨'], bg:'linear-gradient(135deg,#2E8BD6,#36A85C)',
    items:[['rp_kabuto','カブトムシの オブジェ',600],['rp_dragonfly','トンボの オブジェ',600],['ri_butterfly','チョウの オブジェ',700],['rp_cicada','セミの オブジェ',700]],
    talk:['なつやすみ だね！ むしとり いこうよ','すいか たべたいな〜','じゆうけんきゅう、なにに する？'], quest:'りか（生き物）など 問題を といて むしを あつめよう'}
};
Object.entries(EVENTS).forEach(([eid, E]) => E.items.forEach(([art, name, price], i) => {
  const id = 'evi_'+eid+'_'+i; if(!TOWN_ITEMS.some(x => x.id===id)) TOWN_ITEMS.push({id, type:'bld', cat:'deco', name, art, emoji:E.i, price, lv:1, dev:Math.round(price/12), ev:eid, pop:0.01});
}));
const md = d => (d.getMonth()+1)*100 + d.getDate();
function curEvent(){
  const ov = save.evOverride; if(ov==='none') return null; if(ov && EVENTS[ov]) return ov;
  const t = md(new Date());
  for(const [k,E] of Object.entries(EVENTS)){ const a = E.from[0]*100+E.from[1], b = E.to[0]*100+E.to[1]; if(a <= b ? (t >= a && t <= b) : (t >= a || t <= b)) return k; }
  return null;
}
function evDaysLeft(eid){
  const E = EVENTS[eid], now = new Date(); let end = new Date(now.getFullYear(), E.to[0]-1, E.to[1], 23, 59);
  if(end < now) end = new Date(now.getFullYear()+1, E.to[0]-1, E.to[1], 23, 59);
  return Math.max(0, Math.ceil((end - now)/864e5));
}
const evKey = eid => eid + ':' + (eid==='newyear' && new Date().getMonth()===11 ? new Date().getFullYear()+1 : new Date().getFullYear());
function evProg(){ const eid = curEvent(); if(!eid) return null; save.evp = save.evp || {}; const k = evKey(eid); return save.evp[k] || (save.evp[k] = {n:0, got:[]}); }
const EV_GOALS = [10, 25, 50];
const _misEv17 = misEv;
misEv = function(ev, k=1){
  _misEv17(ev, k);
  if(['kanji','math','soc','sci','ekid','prog'].includes(ev)){ const P = evProg(); if(P){ P.n += k; persist(); const g = EV_GOALS.find(x => P.n === x); if(g) setTimeout(() => toast(`${EVENTS[curEvent()].i} イベント ごほうびが もらえるよ！ ホームで うけとってね`), 1400); } }
};
function evCard(){
  const eid = curEvent(); if(!eid) return '';
  const E = EVENTS[eid], P = evProg(), top = EV_GOALS[EV_GOALS.length-1];
  const marks = EV_GOALS.map((g,i) => { const got = P.got.includes(g), ok = P.n >= g;
    return `<button class="evGoal ${got?'got':ok?'ok':''}" data-evg="${g}" style="left:${g/top*100}%" ${ok&&!got?'':'disabled'}>${got ? '✔' : i===2 ? '👑' : '🎁'}<small>${g}</small></button>`; }).join('');
  const om = E.omikuji ? `<button class="btn small gold" data-omikuji="1" ${save.omikuji===dayKey()?'disabled':''}>🎴 おみくじ${save.omikuji===dayKey()?'（ひいたよ）':'を ひく'}</button>` : '';
  return `<div class="card evCard" style="background:${E.bg}"><div class="evTop"><span class="evI">${E.i}</span><div><b>${E.n}</b><small>のこり ${evDaysLeft(eid)}日・${esc(E.quest)}</small></div></div>
    <div class="evItems">${E.items.map(([a]) => `<img src="${esc(artSrc(a))}" alt="">`).join('')}</div>
    <div class="evTrack"><i style="width:${Math.min(100, P.n/top*100)}%"></i>${marks}</div><div class="evNum">イベント中に といた 問題 <b>${P.n}</b></div>
    <div class="evBtns"><button class="btn small white" data-evshop="1">🎉 イベントショップ</button>${om}</div></div>`;
}
document.addEventListener('click', async e => {
  const g = e.target.closest('[data-evg]');
  if(g){ e.stopImmediatePropagation(); const eid = curEvent(), E = EVENTS[eid], P = evProg(), v = +g.dataset.evg; if(!P || P.got.includes(v) || P.n < v) return;
    P.got.push(v); const i = EV_GOALS.indexOf(v), got = [], give = n => { const it = TOWN_ITEMS.find(x => x.id==='evi_'+eid+'_'+n); save.town.inv[it.id] = (save.town.inv[it.id]||0)+1; got.push(`<img src="${esc(artSrc(it.art))}" alt=""> ${esc(it.name)}`); };
    if(i===0) give(0);
    if(i===1){ got.push(`🪙 +${givePts(150, 'イベント ごほうび')}pt`); give(1); }
    if(i===2){ give(3); save.town.bag.goldletter = (save.town.bag.goldletter||0)+1; got.push('✨ きらきらレター'); }
    persist(); confetti(2400); sound('fan');
    await dialog(`<div class="dlgArt big"><img src="${esc(artSrc(E.items[i===2?3:i][0]))}" alt=""></div><h2 class="dlgT">${E.i} イベント ごほうび！</h2>${rewardHTML(got)}<p class="note">「もようがえ」で まちに かざろう</p>`, [{label:'やったー！', cls:'gold', v:1}], 'gold');
    renderHome(); return; }
  if(e.target.closest('[data-evshop]')){ e.stopImmediatePropagation(); shopTab = 'ev'; show('shop'); return; }
  if(e.target.closest('[data-omikuji]')){ e.stopImmediatePropagation(); if(save.omikuji===dayKey()) return; save.omikuji = dayKey();
    const R = [['大吉',100,'さいこうの 1年に なるよ！'],['中吉',60,'いいこと たくさん！'],['小吉',40,'コツコツが 大事'],['吉',30,'にこにこ すごそう'],['末吉',20,'これから どんどん よくなるよ']], r = choice(R);
    const p = givePts(r[1], `おみくじ ${r[0]}`); persist(); sound('fan'); confetti(1500);
    await dialog(`<div class="omikuji"><b>${r[0]}</b></div><p class="dlgP">${r[2]}<br><span class="ptFloat">+${p}pt</span></p>`, [{label:'やったー！', cls:'gold', v:1}]); renderHome(); }
}, true);
const _shopList17 = shopList;
shopList = function(){ if(shopTab==='ev'){ const eid = curEvent(); return eid ? TOWN_ITEMS.filter(x => x.ev===eid) : []; } return _shopList17().filter(x => !x.ev); };
const _renderShop17 = renderShop;
renderShop = function(){
  _renderShop17();
  if(shopTab==='ev'){ const eid = curEvent();
    $('#shopInfo').innerHTML = eid ? `${EVENTS[eid].i} <b>${EVENTS[eid].n}</b> の げんてい アイテム <small>（のこり ${evDaysLeft(eid)}日）</small>` : '<small>いまは イベントを やっていないよ。つぎの イベントを おたのしみに！</small>'; }
};
const _talkLine17 = talkLine;
talkLine = function(r, ctx){ const eid = curEvent(); if(eid && Math.random() < 0.3) return speak(r, choice(EVENTS[eid].talk)); return _talkLine17(r, ctx); };
const _ghostCheck17 = ghostCheck;
ghostCheck = function(){ const g = save.ghost || (save.ghost = {id:null, day:'', saved:0});
  if(curEvent()==='halloween' && !g.id && g.day !== dayKey() && save.town.res.length >= 2 && Math.random() < 0.35){ const c = save.town.res.filter(r => !SP(r.sp).human); if(c.length){ g.day = dayKey(); g.id = choice(c).id; persist(); return; } }
  _ghostCheck17(); };
function evFx(){
  const box = $('#evFx'), eid = curEvent();
  if(!eid || !['home','town'].includes(curScreen)){ box.innerHTML = ''; box.dataset.e = ''; return; }
  if(box.dataset.e === eid) return; box.dataset.e = eid;
  const E = EVENTS[eid]; box.innerHTML = [...Array(14)].map((_,i) => `<i style="left:${(i*7.3+3)%100}%;animation-duration:${9+(i%5)*2.3}s;animation-delay:-${(i*1.7)%11}s;font-size:${16+(i%4)*5}px">${E.fx[i%E.fx.length]}</i>`).join('');
}
const _rh17 = renderHome;
renderHome = function(){ _rh17(); $('#evArea').innerHTML = evCard() + bossCard(); };
const _show17 = show;
show = function(name){ _show17(name); if(name==='ekid') renderEk(); evFx(); };
const _rs17 = renderSettings;
renderSettings = function(){ _rs17(); syncSeg('segEv', save.evOverride || 'auto'); };
$('#segEv').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; save.evOverride = b.dataset.v==='auto' ? '' : b.dataset.v; persist(); syncSeg('segEv', b.dataset.v); toast('イベントの せっていを かえました'); });


/* =====================================================================
   v1.8：スクロール改善・ぶんしょう・ロゴ・ヘッダー・季節の ホーム背景・習得度・
         季節かざり・のりもの30種＋条件・道の 改善・テクスチャ・ショップ・なかよし度・あたらしい まち
   ===================================================================== */
const now18 = () => Date.now();
const monthNow = () => new Date().getMonth() + 1;

/* ---------- ホーム背景（季節 × まちの 大きさ） ---------- */
function seasonNow(){ const m = monthNow(); return m>=3&&m<=5 ? 'spring' : m>=6&&m<=8 ? 'summer' : m>=9&&m<=11 ? 'autumn' : 'winter'; }
function homeBgKey(){ const s = seasonNow(), city = (save.town?.lv||0) >= 6; return city ? (s==='winter' ? 'hb_citywinter' : 'hb_city') : 'hb_'+s; }
const _show18 = show;
show = function(name){
  _show18(name);
  if(name==='home'){ const k = homeBgKey(); $('#bg').style.backgroundImage = `url("${artSrc(k)}")`; document.body.dataset.season = seasonNow(); }
  syncHeader();
};

/* ---------- ヘッダー ---------- */
function syncHeader(){
  const b = $('#btnBack'); if(b && !b.querySelector('img')) b.innerHTML = `<img src="${esc(artSrc('hd_back'))}" alt=""><span>もどる</span>`;
  const c = $('#ptPill .coin'); if(c && c.tagName!=='IMG') c.outerHTML = `<img class="coin coinImg" src="${esc(artSrc('hd_coin'))}" alt="">`;
  const h = $('#btnHome'); if(h && !h.querySelector('img')) h.innerHTML = `<img src="${esc(artSrc('hd_homebtn'))}" alt="ホーム">`;
  const s = $('#btnSettings'); if(s && !s.querySelector('img')) s.innerHTML = `<img src="${esc(artSrc('hd_gear'))}" alt="せってい">`;
}

/* ---------- 季節の かざり（その 季節だけ 買える） ---------- */
const SEASON_DECO = {d_snowman:[12,1,2], d_xmasout:[11,12], d_pumpkins:[9,10], d_tanabata:[6,7], d_koinobori:[4,5], d_kadomatsu:[12,1], ev_snow:[12,1,2]};
const mText = ms => ms.map(m => m+'月').join('・');
/* ---------- のりもの・たてもの 追加 ---------- */
const NEW_BLD = [
  {id:'gasstation', type:'bld', cat:'bld', name:'ガソリンスタンド', art:'bld_gasstation', emoji:'⛽', price:600, lv:3, dev:15, income:10},
  {id:'koban',      type:'bld', cat:'bld', name:'こうばん',         art:'bld_koban',      emoji:'👮', price:700, lv:4, dev:25},
  {id:'firestation',type:'bld', cat:'bld', name:'しょうぼうしょ',   art:'bld_firestation',emoji:'🚒', price:1200, lv:5, dev:40},
  {id:'dealer',     type:'bld', cat:'bld', name:'くるまやさん',     art:'bld_dealer',     emoji:'🚗', price:1800, lv:6, dev:40, income:20}
];
NEW_BLD.forEach(b => { if(!TOWN_ITEMS.some(x => x.id===b.id)) TOWN_ITEMS.push(b); });
const NV = [ // id, 名前, ねだん, lv, こうつう, 追加, ひつような もの
  ['whitebike','白バイ',900,5,4,{dev:10},{koban:1}],['ladder','はしご車',1400,6,5,{dev:20},{firestation:1}],['tow','レッカー車',800,5,4,{},{gasstation:1}],
  ['compactor','パッカー車',600,4,3,{dev:8},{d_recycle:1}],['vanblue','はいたつバン',500,3,3,{income:6},{post:1}],['minivan','ミニバン',400,3,4,{},{}],
  ['convert','オープンカー',1200,6,6,{pop:0.03},{dealer:1}],['pickup','ピックアップトラック',500,4,4,{income:4},{gasstation:1}],['wagon','けいワゴン',350,2,3,{},{}],
  ['jeep','オフロードカー',900,5,5,{},{gasstation:1}],['kart','ゴーカート',600,4,3,{pop:0.02},{park:1}],['trolley','トロリーバス',1500,7,9,{},{d_busstop:1}],
  ['luxvan','こうきゅうワゴン',1600,7,6,{income:10},{hotel:1}],['dump','ダンプカー',900,5,4,{dev:15},{gasstation:1}],['tanker','タンクローリー',1100,6,5,{income:12},{gasstation:1}],
  ['beetle','まるい クラシックカー',800,4,4,{pop:0.02},{dealer:1}],['retroscoot','レトロスクーター',300,2,2,{},{}],['camperbus','ワーゲンバス',1000,5,5,{pop:0.02},{d_tent:1}],
  ['blacktaxi','ロンドンタクシー',900,6,5,{income:8},{station:1}],['sightbus','かんこうバス',1800,7,10,{pop:0.03},{d_busstop:1, hotel:1}],['snowplow','じょせつ車',1000,5,4,{dev:12},{gasstation:1}],
  ['shuttle','くうこうシャトル',2000,9,10,{income:15},{airport:1}],['forklift','フォークリフト',500,4,2,{income:5},{post:1}],['baketrike','パンやさんの 三輪車',600,3,3,{income:8},{bakery:1}],
  ['roller','ロードローラー',800,5,3,{dev:15},{gasstation:1}],['sweeper','どうろ そうじ車',700,4,3,{dev:10},{d_recycle:1}],['rescue','きゅうじょ 工作車',1300,6,5,{dev:20},{firestation:1}],
  ['command','しょうぼう 指揮車',1200,6,5,{dev:15},{firestation:1}],['carriage','かぼちゃの 馬車',3000,8,6,{pop:0.08},{d_minicastle:1}],['partybus','パーティーバス',2500,8,10,{pop:0.05},{d_busstop:1, d_carousel:1}]
];
NV.forEach(([id,name,price,lv,traffic,ex,has]) => { if(!TOWN_ITEMS.some(x => x.id===id)) TOWN_ITEMS.push(Object.assign({id, type:'veh', name, art:'veh_'+id, emoji:'🚗', price, lv, traffic, req: Object.keys(has).length ? {has} : undefined}, ex)); });
const VEH_NEED = {bus:{d_busstop:1}, doubledecker:{d_busstop:1}, schoolbus:{school:1}, taxi:{station:1}, fire:{firestation:1}, ambulance:{clinic:1}, police:{koban:1},
  mail:{post:1}, garbage:{d_recycle:1}, icecream:{park:1}, foodtruck:{park:1}, sports:{dealer:1}, limo:{dealer:1}, ev:{dealer:1}, camper:{gasstation:1},
  mixer:{gasstation:1}, crane:{gasstation:1}, excavator:{gasstation:1}, truck:{gasstation:1}, tractor:{field:1}};
Object.entries(VEH_NEED).forEach(([id, has]) => { const it = ITEM(id); if(!it) return; it.req = Object.assign({}, it.req, {has:Object.assign({}, it.req?.has, has)}); });
Object.assign(ZUKAN_INFO, {gasstation:'くるまに ガソリンを 入れる ところ。', koban:'おまわりさんが まちを まもる 小さな たてもの。', firestation:'しょうぼう車が まっている。', dealer:'あたらしい くるまが ならぶ お店。',
  whitebike:'白い オートバイで パトロール。', ladder:'高い ところの 火事も まかせて！', tow:'こしょうした 車を はこぶ。', trolley:'電線から 電気を もらって はしる バス。', carriage:'まほうで うまれた かぼちゃの 馬車。'});
const _reqList18 = reqList;
reqList = function(it){
  const out = _reqList18(it).map(r => { const id = Object.keys(it.req?.has||{}).find(k => r.t.startsWith(ITEM(k)?.name||'#')); return id ? Object.assign(r, {t: r.t + ' ' + '（まちに おく）'}) : r; });
  const ms = SEASON_DECO[it.id]; if(ms) out.push({t:`${mText(ms)}だけ かえる`, ok:ms.includes(monthNow())});
  return out;
};

/* =====================================================================
   みち：たてもの・かざりが あっても おける ／ 2×2 の すきまを うめる
   ===================================================================== */
document.addEventListener('click', e => {
  if(!townEdit || curScreen!=='town' || !hand || !isRoadId(hand.id)) return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const t = save.town, key = `${c.dataset.x},${c.dataset.y}`, cur = t.cells[key];
  if(!cur || isRoadId(cur)) return;
  e.stopImmediatePropagation();
  const it = ITEM(cur);
  if(it?.cat!=='deco'){ toast('たてものの 上には みちを おけないよ（かざりなら OK）'); return; }
  const O = over(); if(O[key]){ t.inv[O[key]] = (t.inv[O[key]]||0) + 1; }
  O[key] = cur; t.cells[key] = hand.id; sound('tap');
  if(hand.from==='inv'){ t.inv[hand.id]--; if(t.inv[hand.id] <= 0){ delete t.inv[hand.id]; hand = null; } } else hand = null;
  persist(); renderTown(); toast(`${it.name}の 下に みちを しいたよ`);
}, true);
const _roadHTML18 = roadHTML;
roadHTML = function(x, y){
  const c = save.town.cells, R = (a,b) => isRoadId(c[`${a},${b}`]);
  let h = _roadHTML18(x, y);
  const q = [];
  if(R(x,y-1) && R(x+1,y) && R(x+1,y-1)) q.push('ne');
  if(R(x,y-1) && R(x-1,y) && R(x-1,y-1)) q.push('nw');
  if(R(x,y+1) && R(x+1,y) && R(x+1,y+1)) q.push('se');
  if(R(x,y+1) && R(x-1,y) && R(x-1,y+1)) q.push('sw');
  if(q.length) h = h.replace(/<\/div>$/, q.map(d => `<i class="q q-${d}"></i>`).join('') + '</div>');
  if(q.length) h = h.replace(/<i class="(lnh|lnv|zh|zv)"[^>]*><\/i>/g, '');
  return h;
};
/* テクスチャの スタイル */
function texCSS(){
  const r = k => `url("${artSrc('tx_'+k)}")`;
  return `.cell.road .rd i:is(.c,.n,.s,.w,.e,.x,.q){background-size:calc(var(--cell)*2) calc(var(--cell)*2)!important;background-blend-mode:normal!important;
      background-position:calc(-1*(var(--cx)*var(--cell) + var(--pl)*var(--cell))) calc(-1*(var(--cy)*var(--cell) + var(--pt)*var(--cell)))!important;border-radius:0!important}
    .rd.t-road i:is(.c,.n,.s,.w,.e,.x,.q){background-image:${r('road')}!important;background-color:#7A7E86!important}
    .rd.t-road_brick i:is(.c,.n,.s,.w,.e,.x,.q){background-image:${r('road_brick')}!important}
    .rd.t-road_stone i:is(.c,.n,.s,.w,.e,.x,.q){background-image:${r('road_stone')}!important}
    .rd.t-road_dirt i:is(.c,.n,.s,.w,.e,.x,.q){background-image:${r('road_dirt')}!important}
    .rd.t-road_pastel i:is(.c,.n,.s,.w,.e,.x,.q){background-image:${r('road_pastel')}!important}
    .roadIcon{background:${r('road')} center/cover!important}.roadIcon.rt-road_brick{background:${r('road_brick')} center/cover!important}
    .roadIcon.rt-road_stone{background:${r('road_stone')} center/cover!important}.roadIcon.rt-road_dirt{background:${r('road_dirt')} center/cover!important}
    .roadIcon.rt-road_pastel{background:${r('road_pastel')} center/cover!important}.roadIcon::after{display:none!important}`;
}
document.head.insertAdjacentHTML('beforeend', `<style id="texStyle">${texCSS()}</style>`);
/* かべがみ・ゆか（テクスチャ） */
const TEXW = [['w_flower','さくらもよう',300],['w_mint','ミントストライプ（あたらしい）',300],['w_star','ほしぞら ブルー',350],['w_heart','ハート ピーチ',350],['w_wood','きの かべ',400],['w_brick','れんがの かべ',450],['w_cloud','くもの かべ',500],['w_wave','せいがいは',600],['w_damask','ゴールド ダマスク',1200]];
const TEXF = [['f_oak','オークの フローリング',0],['f_herring','ヘリンボーン',400],['f_tatami','たたみ（あたらしい）',350],['f_marble','だいりせき（あたらしい）',700],['f_carpet','ふわふわ カーペット',350],['f_checker','ピンクの タイル',400]];
const texCss = (k, sz) => `url("${artSrc('tx_'+k)}") 0 0/${sz}px ${sz}px`;
TEXW.forEach(([k,n,p]) => { if(!WALLS.some(w => w.id==='t_'+k)) WALLS.unshift({id:'t_'+k, name:n, price:p, css:texCss(k,90), sty:Math.max(2,Math.round(p/50))}); });
TEXF.forEach(([k,n,p]) => { if(!FLOORS.some(w => w.id==='t_'+k)) FLOORS.unshift({id:'t_'+k, name:n, price:p, css:texCss(k,110), sty:Math.max(1,Math.round(p/50))}); });
{ const H = ensureHome(); if(!H.floors.includes('t_f_oak')) H.floors.push('t_f_oak'); if(H.floor==='wood' && !H.t18){ H.floor = 't_f_oak'; H.t18 = 1; } persist(); }

/* =====================================================================
   スクロール：わたしの家で 家具を うごかしても 画面が とばない
   ===================================================================== */
const _renderMyHome18 = renderMyHome;
renderMyHome = function(){
  const y = window.scrollY, box = $('#roomBox'), h = box ? box.offsetHeight : 0;
  if(box && h) box.style.minHeight = h + 'px';
  _renderMyHome18();
  if(box) requestAnimationFrame(() => { box.style.minHeight = ''; });
  if(Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
  requestAnimationFrame(() => { if(Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y); });
};

/* =====================================================================
   ショップ：コンパクト表示（じょうけんは たたむ）
   ===================================================================== */
const _renderShop18 = renderShop;
renderShop = function(){
  _renderShop18();
  $$('#shopGrid .reqList').forEach(r => { const rows = [...r.querySelectorAll('div')], ok = rows.filter(d => d.classList.contains('ok')).length;
    r.outerHTML = `<details class="reqD ${ok===rows.length?'allok':''}"><summary>🔑 じょうけん ${ok}/${rows.length}</summary><div class="reqList">${r.innerHTML.replace(/^🔑 かう じょうけん/,'')}</div></details>`; });
  $$('#shopGrid .homeFor').forEach(h => h.title = h.textContent);
};

/* =====================================================================
   なかよし度：しばらく はなさないと さがる
   ===================================================================== */
function idleDays(r){ return Math.floor((now18() - (r.talkedAt || r.at || now18())) / 864e5); }
function frDecay(){
  const t = save.town; if(!t) return; const d = dayKey();
  if(t.frDay === d) return; t.frDay = d;
  let n = 0; t.res.forEach(r => { if(SP(r.sp).human) return; if(!r.talkedAt) r.talkedAt = r.at || now18(); if(idleDays(r) >= 3 && (r.fr||0) > 0){ r.fr = r.fr - 1; n++; } });
  persist(); if(n) setTimeout(() => toast(`💧 ${n}人の 住民が さびしがっているよ。はなしかけてあげよう`), 1500);
}
const _talkTo18 = talkTo;
talkTo = async function(id, ctx){
  const r = save.town.res.find(x => x.id===id);
  if(r && !SP(r.sp).human && idleDays(r) >= 3){ r.talkedAt = now18(); persist(); toast(`${r.name}「ひさしぶり！ さびしかったよ〜」`); }
  else if(r) { r.talkedAt = now18(); persist(); }
  return _talkTo18(id, ctx);
};
function markLonely(){ (save.town?.res||[]).forEach(r => { if(SP(r.sp).human || idleDays(r) < 3) return; const s = WK.st.get(r.id); if(s && s.el && !s.el.querySelector('.lonely')) s.el.insertAdjacentHTML('beforeend', '<span class="lonely">💧</span>'); }); }
const _openResident18 = openResident;
openResident = async function(id){
  const r = save.town.res.find(x => x.id===id);
  if(r && !SP(r.sp).human && idleDays(r) >= 3) toast(`💧 ${r.name}は ${idleDays(r)}日 はなしていないので さびしそう…`);
  return _openResident18(id);
};

/* =====================================================================
   あたらしい まち
   ===================================================================== */
const isMaxTown = () => (save.town?.lv||0) >= TOWN_LEVELS.length - 1;
const medals = () => save.townMedals || 0;
function townSlot(){ return {town:save.town, reqs:save.reqs, ghost:save.ghost}; }
function ensureList(){ if(!save.townList){ save.townList = [townSlot()]; save.townIdx = 0; } return save.townList; }
function switchTown(i){
  const L = ensureList(); L[save.townIdx] = townSlot();
  const s = L[i]; save.town = s.town; save.reqs = s.reqs; save.ghost = s.ghost; save.townIdx = i;
  WK.st.clear(); townEdit = false; hand = null; persist(); renderTown(); toast(`🗺 「${townName()}」へ いどうしたよ`);
}
async function newTown(){
  const ok = await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('logo_town'))}" alt="" style="max-width:90%"></div><h2 class="dlgT">あたらしい まちを つくる？</h2>
    <p class="dlgP">「${esc(townName())}」は さいこうの まちに なったよ！<br>このまちは のこるので、いつでも もどってこられるよ。<br>あたらしい 村から もういちど まちづくりを はじめよう！</p>
    <div class="skillBox"><b>🏅 ゆめの都 メダル</b><div>まちを 1つ かんせい させるごとに、ぜんぶの まちで 発展度と うりあげ +10%</div></div>`,
    [{label:'やめる', cls:'white', v:false}, {label:'🌱 つくる！', cls:'gold', v:true}], 'wide gold');
  if(!ok) return;
  const L = ensureList(); L[save.townIdx] = townSlot();
  save.townMedals = medals() + 1;
  const n = prompt('あたらしい まちの なまえ', 'まなびタウン ' + (L.length + 1));
  delete save.town; save.reqs = {list:[], last:0, done:0}; save.ghost = {id:null, day:dayKey(), saved:0};
  WK.st.clear(); ensureTown(); if(n && n.trim()) save.town.name = n.trim().slice(0,12);
  save.town.bag.letter = (save.town.bag.letter||0) + 2;
  L.push(townSlot()); save.townIdx = L.length - 1; persist(); sound('fan'); confetti(3000);
  renderTown(); toast('🌱 あたらしい まちが できたよ！ おまねきレター 2まい プレゼント');
}
const _townCalc18 = townCalc;
townCalc = function(){ const c = _townCalc18(), m = medals(); if(m){ c.dev = Math.round(c.dev*(1 + 0.1*m)); c.harvest = Math.round(c.harvest*(1 + 0.1*m)); } return c; };
async function pickTown(){
  const L = ensureList(); L[save.townIdx] = townSlot();
  const v = await dialog(`<h2 class="dlgT">🗺 まちを えらぶ</h2><div class="townPick">${L.map((s,i) => `<button class="tpIt ${i===save.townIdx?'on':''}" data-tp="${i}"><b>${esc(s.town.name||'まなびタウン')}</b><small>Lv${s.town.lv+1}・住民 ${s.town.res.length}人</small></button>`).join('')}</div>`,
    [{label:'とじる', cls:'white', v:null}], 'wide');
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tp]'); if(t){ e.stopImmediatePropagation(); $('#dlg').classList.remove('show'); const i = +t.dataset.tp; if(i!==save.townIdx) switchTown(i); return; }
  if(e.target.closest('#btnNewTown')){ e.stopImmediatePropagation(); newTown(); return; }
  if(e.target.closest('#btnPickTown')){ e.stopImmediatePropagation(); pickTown(); return; }
}, true);
const _renderTown18 = renderTown;
renderTown = function(){
  frDecay(); _renderTown18();
  const head = $('#townHead');
  if(isMaxTown()) head.insertAdjacentHTML('beforeend', `<button class="btn gold newTownBtn" id="btnNewTown">🌱 あたらしい まちを つくる</button>`);
  if((save.townList||[]).length > 1 || medals()) head.insertAdjacentHTML('beforeend', `<div class="townMeta">${medals() ? `<span>🏅 メダル ${medals()}（+${medals()*10}%）</span>` : ''}${(save.townList||[]).length > 1 ? `<button class="btn small white" id="btnPickTown">🗺 まちを えらぶ（${save.townList.length}）</button>` : ''}</div>`);
  markLonely();
};
const _renderMap18 = renderMap; renderMap = function(){ _renderMap18(); markLonely(); };
/* のりもの：しゃこから 出すときも じょうけんが ひつよう */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-gar]'); if(!b) return;
  const id = garage()[+b.dataset.gar], it = ITEM(id);
  if(it && !reqOk(it)){ e.stopImmediatePropagation(); const need = reqList(it).filter(r => !r.ok).map(r => r.t).join('、'); toast(`🚫 ${it.name}を はしらせるには：${need}`); }
}, true);

/* =====================================================================
   イベントの ふってくる アイコン（イラスト・ひかえめ）
   ===================================================================== */
const FX_ART = {halloween:['pumpkin','ghost','candy','bat'], christmas:['snow','star','gift','holly'], newyear:['star','lantern','gift','sakura'], summer:['sunflower','star','momiji','lantern']};
evFx = function(){
  const box = $('#evFx'), eid = curEvent();
  if(!eid || !['home','town'].includes(curScreen)){ box.innerHTML = ''; box.dataset.e = ''; return; }
  if(box.dataset.e === eid) return; box.dataset.e = eid;
  const arts = FX_ART[eid] || ['star'];
  box.innerHTML = [...Array(8)].map((_,i) => `<img class="fxI" src="${esc(artSrc('fx_'+arts[i%arts.length]))}" style="left:${(i*12.7+5)%96}%;width:${16+(i%3)*5}px;animation-duration:${14+(i%4)*3.5}s;animation-delay:-${(i*2.3)%14}s" alt="">`).join('');
};

/* =====================================================================
   えいご（おとな）：ぜんぶ もう一度
   ===================================================================== */
document.addEventListener('click', e => { if(e.target.closest('#erAll')){ e.stopImmediatePropagation(); engStart(shuffle(ES.res.map(x => x.q))); } }, true);

/* =====================================================================
   ぶんしょう（作文の 力）
   ===================================================================== */
const JOSHI = [['わたし[は] 小学生です。','は'],['ねこ[が] ねて います。','が'],['ごはん[を] 食べます。','を'],['学校[へ] 行きます。','へ'],['公園[で] あそびます。','で'],
  ['友だち[と] 話します。','と'],['駅[まで] 歩きます。','まで'],['お母さん[に] 手紙を 書きます。','に'],['ぼく[も] 行きたい。','も'],['3時[から] 始まります。','から'],
  ['りんご[と] みかんを 買った。','と'],['空[が] 青い。','が'],['犬[に] えさを あげる。','に'],['えんぴつ[で] 書く。','で'],['妹[は] 7さいです。','は'],
  ['本[を] 読んだ。','を'],['朝 6時[に] 起きる。','に'],['東京[から] 大阪[まで] 行く。','から'],['花[が] さいた。','が'],['ボール[を] けった。','を']];
const JOSHI_ALL = ['は','が','を','に','へ','で','と','も','から','まで'];
const SETSU = [['雨が ふって きた。[だから]、かさを さした。','だから'],['いっしょうけんめい 走った。[しかし]、まに あわなかった。','しかし'],['顔を あらった。[そして]、歯を みがいた。','そして'],
  ['ジュースに する？[それとも]、お茶に する？','それとも'],['おなかが すいた。[だから]、パンを 食べた。','だから'],['テストは むずかしかった。[でも]、さいごまで がんばった。','でも'],
  ['くだものが すきだ。[たとえば]、いちごや メロンだ。','たとえば'],['宿題を した。[それから]、テレビを 見た。','それから'],['かぜを ひいた。[だから]、学校を 休んだ。','だから'],
  ['れんしゅうした。[けれども]、しあいに まけた。','けれども'],['きょうは 晴れだ。[しかも]、とても あたたかい。','しかも'],['早く ねた。[なぜなら]、あしたは 遠足だからだ。','なぜなら']];
const SETSU_ALL = ['だから','しかし','そして','それとも','でも','たとえば','それから','けれども','しかも','なぜなら'];
const SVO = [['赤い 花が きれいに さいた。','花が','さいた'],['ぼくは きのう 本を 読んだ。','ぼくは','読んだ'],['小さな 子犬が 元気に 走る。','子犬が','走る'],['妹は とても かわいい。','妹は','かわいい'],
  ['空に 白い 雲が うかんで いる。','雲が','うかんで いる'],['先生が 黒板に 字を 書いた。','先生が','書いた'],['わたしの 父は 医者です。','父は','医者です'],['大きな 船が 港に ついた。','船が','ついた'],
  ['兄は 毎朝 走って いる。','兄は','走って いる'],['きれいな 鳥が 木の 上で 鳴いた。','鳥が','鳴いた'],['この ケーキは とても あまい。','ケーキは','あまい'],['ねこが こたつで ねむる。','ねこが','ねむる']];
const TEN = [['きのう、ぼくは 公園で あそんだ。','きのう ぼくは、公園で あそんだ。','きのうぼくは公園で、あそんだ。','きのう、ぼくは公園であそんだ'],
  ['わたしは、いちごと メロンが すきです。','わたしはいちごと、メロンが すきです','わたしは、いちごとメロンがすきです','わたし、はいちごとメロンがすきです。'],
  ['雨が ふったので、試合は 中止に なった。','雨がふったので試合は中止になった','雨が、ふったので試合は中止になった。','雨がふったので試合は、中止に、なった'],
  ['「おはよう。」と、母が 言った。','「おはよう」と母が言った','「おはよう。と」、母が言った。','おはよう。と母が、言った。'],
  ['朝、早く 起きて、ジョギングを した。','朝早く起きてジョギングをした','朝、早く、起きて、ジョギングを、した','朝早く、起きてジョギングをした']];
const TSUNAGU = [['雨が ふった。','かさを さした。','雨が ふったので、かさを さした。',['雨が ふったけれど、かさを さした。','雨が ふって、かさを さしたので。','かさを さしたので、雨が ふった。']],
  ['いっしょうけんめい 走った。','まに あわなかった。','いっしょうけんめい 走ったが、まに あわなかった。',['いっしょうけんめい 走ったので、まに あわなかった。','まに あわなかったので、走った。','走ったし、まに あわなかったから。']],
  ['宿題を した。','あそびに 行った。','宿題を してから、あそびに 行った。',['宿題を したのに、あそびに 行った。','あそびに 行ってから、宿題を したので。','宿題を すると、行った。']],
  ['おなかが すいた。','おにぎりを 食べた。','おなかが すいたので、おにぎりを 食べた。',['おなかが すいたのに、おにぎりを 食べた。','おにぎりを 食べたので、おなかが すいた。','おなかが すいて、食べたので。']],
  ['テストは むずかしかった。','100点を とった。','テストは むずかしかったが、100点を とった。',['テストは むずかしかったので、100点を とった。','100点を とったので、むずかしかった。','むずかしかったし、とったから。']],
  ['春に なった。','さくらが さいた。','春に なって、さくらが さいた。',['春に なったのに、さくらが さいた。','さくらが さいたので、春に なった。','春に なるが、さいた。']]];
function blankQ(src, all, title){ const [s,a] = choice(src); const q = s.replace(/\[(.+?)\]/, '<span class="blankBox">　</span>');
  return {type:'choice', q:`${title}<div class="bunSent">${q}</div>`, ans:a, opts:optsFrom(a, all), sub:s, hint:'文を 声に 出して 読んで みよう'}; }
Object.assign(MATH_UNITS, {
  b_joshi:{n:'「は・が・を・に」（じょし）', g:'bun', lv:1, art:'icon_write', gen(){ return blankQ(JOSHI, JOSHI_ALL, '<b>□</b>に 入る ことばは？'); }},
  b_setsu:{n:'文と 文を つなぐ ことば', g:'bun', lv:2, art:'icon_read', gen(){ return blankQ(SETSU, SETSU_ALL, '<b>□</b>に 入る つなぎことばは？'); }},
  b_svo:{n:'主語と 述語', g:'bun', lv:2, art:'icon_kokugo', gen(){ const [s,sb,pr] = choice(SVO), k = Math.random()<.5;
    const words = s.replace('。','').split(' '); const opts = optsFrom(k?sb:pr, words.concat(SVO.map(x => k?x[1]:x[2])).filter(w => w.length));
    return {type:'choice', q:`<div class="bunSent">${esc(s)}</div>この 文の <b>${k?'主語（だれが・なにが）':'述語（どうする・どんなだ）'}</b>は？`, ans:k?sb:pr, opts, sub:s, hint:k ? '「〜は」「〜が」を さがそう' : '文の さいごの ほうに あるよ'}; }},
  b_ten:{n:'「、」と「。」の つけかた', g:'bun', lv:2, art:'icon_write', gen(){ const r = choice(TEN);
    return {type:'choice', q:'「、」と「。」が ただしく ついているのは？', ans:r[0], opts:shuffle(r.slice()), sub:r[0], hint:'文の おわりには「。」、いみの 切れめに「、」'}; }},
  b_tsunagu:{n:'2つの 文を 1つに', g:'bun', lv:3, art:'icon_read', gen(){ const [a,b,ans,ng] = choice(TSUNAGU);
    return {type:'choice', q:`<div class="bunSent">${esc(a)}<br>${esc(b)}</div>2つの 文を 1つに すると？`, ans, opts:shuffle([ans, ...ng]), sub:a, hint:'じゅんばんと つなぎかたに 気を つけて'}; }}
});
const BUN_LV = {b_joshi:1, b_setsu:2, b_svo:2, b_ten:2, b_tsunagu:3};
/* ならべかえ */
const NARABE = [['きのう','ぼくは','公園で','サッカーを','しました。'],['わたしは','毎朝','パンを','食べます。'],['ねこが','まどの そばで','気持ちよさそうに','ねて います。'],
  ['夏休みに','家族で','海へ','行きました。'],['先生が','やさしく','教えて','くれました。'],['日曜日に','おばあちゃんの 家で','カレーを','作りました。'],
  ['弟は','大きな 声で','元気に','歌いました。'],['雨が','ふって いたので','かさを','持って 行きました。'],['友だちと','いっしょに','図書館で','本を 読みました。'],
  ['ぼくの','ゆめは','サッカー選手に','なる ことです。'],['きのうの','テストで','100点を','とりました。'],['秋に なると','山の','木の葉が','赤く なります。']];
/* かいてみよう */
const WPICS = [['en_swim','プールで およぐ'],['en_run','はしる'],['en_eat','ごはんを 食べる'],['en_read','本を 読む'],['en_sing','歌を うたう'],['en_sleep','ねる'],
  ['en_soccer','サッカー'],['en_piano','ピアノ'],['en_rainy','雨の日'],['en_snowy','雪の日'],['en_dog','いぬ'],['en_bike','じてんしゃ']];
const W5 = [['itsu','いつ？','きのう・けさ・日曜日に'],['doko','どこで？','公園で・家で・学校で'],['dare','だれが？','ぼくは・わたしは・友だちと'],['nani','なにを した？','〜を した'],['kimochi','どう 思った？','たのしかった・うれしかった']];
const FEEL = ['たのしかった','うれしかった','わくわくした','くやしかった','びっくりした','つかれたけど がんばった','また やりたい'];
function bun(){ return save.bun || (save.bun = {notes:[], day:'', n:0}); }
const BS = {units:['b_joshi'], count:10, mode:'menu'};
function renderBun(){
  const M = mSave(); if(!BS.units.length) BS.units = ['b_joshi'];
  if(!multiOn('bun') && BS.units.length > 1) BS.units = BS.units.slice(0,1);
  const B = bun();
  $('#bunView').innerHTML = `<div class="bunBig"><button class="bunMode" data-bm="narabe"><span>🧩</span><b>ことばを ならべよう</b><small>ばらばらの ことばを 正しい 文に</small></button>
    <button class="bunMode w" data-bm="kaku"><span>✍️</span><b>文を 書いてみよう</b><small>絵を 見て「いつ・どこで・だれが」</small></button>
    <button class="bunMode d" data-bm="nikki"><span>📔</span><b>3文 日記</b><small>きょうの ことを 3つの 文で</small></button></div>
    <h4 class="sGrp">📝 ことばの きまり（えらんで こたえる）</h4>
    <div class="multiRow">${multiBtn('bun')}<small>${multiOn('bun') ? 'いくつでも えらべるよ' : 'タッチした たんげんだけ 出るよ'}</small></div>
    <div class="sGrid">${Object.keys(BUN_LV).map(k => { const u = MATH_UNITS[k], s = M.stats[k] || {n:0,c:0};
      return `<button class="mUnit soc bun ${BS.units.includes(k)?'on':''}" data-bu="${k}"><img class="mIco" src="${esc(artSrc(u.art))}" alt=""><span class="mTxt"><b>${u.n}</b><small>${s.n ? `${s.c}/${s.n} せいかい` : 'まだ やってない'}</small></span>${BS.units.includes(k)?'<span class="mChk">✓</span>':''}</button>`; }).join('')}</div>
    <div class="row"><div class="lab">問題の かず</div><div class="seg" id="bCount"><button data-v="5">5問</button><button data-v="10">10問</button></div></div>
    <button class="btn big pink" id="bStart" style="width:100%">はじめる！</button>
    <h4 class="sGrp">📒 ぶんしょう ノート（${B.notes.length}）</h4>
    <div class="noteList">${B.notes.slice().reverse().slice(0,10).map(n => `<div class="noteIt"><small>${fmtDT(n.t)}　${n.kind==='nikki'?'📔 日記':'✍️ 作文'}　${n.len}文字</small><p>${esc(n.text)}</p></div>`).join('') || '<div class="note">まだ ないよ。書いた 文は ここに のこるよ</div>'}</div>`;
  syncSeg('bCount', BS.count);
}
function bunStart(){
  const list = buildSet(BS.units, BS.count);
  window.MQSOC = true; window.MQSCI = false; window.MQEK = false; window.MQBUN = true; $('#mPlayTag').textContent = 'ぶんしょう'; $('#mPlayTag').style.background = 'var(--pink)';
  MQ = {list, i:0, res:[], pts:0, t0:Date.now(), combo:0, soc:true}; show('mathplay'); mRender();
}
['socStart','sciStart','ekStart'].forEach(fn => { const f = window[fn]; if(typeof f === 'function'){ window[fn] = function(){ window.MQBUN = false; return f.apply(this, arguments); }; } });
socStart = window.socStart; sciStart = window.sciStart; ekStart = window.ekStart;
$('#sStart').onclick = socStart; $('#rStart').onclick = sciStart; $('#kStart').onclick = ekStart;
const _mStart18 = $('#mStart').onclick; $('#mStart').onclick = () => { window.MQBUN = false; _mStart18(); };
const NB = {};
function narabeNew(){ const s = choice(NARABE); NB.ans = s; NB.pool = shuffle(s.map((w,i) => ({w,i}))); while(NB.pool.every((x,i) => x.i===i)) NB.pool = shuffle(NB.pool); NB.pick = []; NB.done = false; renderNarabe(); }
function renderNarabe(){
  $('#bunView').innerHTML = `<div class="pHead"><b>🧩 ことばを ならべよう</b><span class="pTip">💡 ことばを タッチして、正しい じゅんばんに ならべてね</span></div>
    <div class="nbAns">${NB.pick.map((x,j) => `<button class="nbChip on" data-nu="${j}">${esc(x.w)}</button>`).join('') || '<span class="pEmpty">ここに 文が できるよ</span>'}</div>
    <div class="nbPool">${NB.pool.map((x,j) => NB.pick.includes(x) ? `<span class="nbChip used">${esc(x.w)}</span>` : `<button class="nbChip" data-np="${j}">${esc(x.w)}</button>`).join('')}</div>
    <div id="nbMsg" class="pMsg"></div>
    <div class="pBtns"><button class="btn white small" data-bm="menu">もどる</button><button class="btn white small" data-nb="clear">やりなおす</button><button class="btn green" data-nb="check" ${NB.pick.length===NB.ans.length?'':'disabled'}>こたえあわせ</button></div>`;
}
let kakuP = null;
function kakuNew(kind){
  kakuP = {kind, pic: kind==='kaku' ? choice(WPICS) : null, parts:{}, feel:''};
  renderKaku();
}
function renderKaku(){
  const P = kakuP, isN = P.kind==='nikki';
  const qs = isN ? [['nani','きょう なにを した？','れい：友だちと 公園で おにごっこを した'],['kimochi','どう だった？（気もち）','れい：さいごに つかまらなくて うれしかった'],['tsugi','つぎは どう したい？','れい：あしたも みんなで あそびたい']] : W5;
  $('#bunView').innerHTML = `<div class="pHead"><b>${isN ? '📔 3文 日記' : '✍️ 文を 書いてみよう'}</b><span class="pTip">💡 ${isN ? '1つの 文に 1つの ことを 書こう。さいごは「。」で おわろう' : '絵を 見て、じぶんが したと おもって 書こう！'}</span></div>
    ${P.pic ? `<div class="wPic"><img src="${esc(artSrc(P.pic[0]))}" alt=""><small>テーマ：${esc(P.pic[1])}</small></div>` : ''}
    <div class="wForm">${qs.map(([k,l,ph]) => `<label class="wRow"><b>${l}</b><input data-wk="${k}" value="${esc(P.parts[k]||'')}" placeholder="${esc(ph)}"></label>`).join('')}
      ${isN ? '' : `<div class="feelRow">${FEEL.map(f => `<button class="feelChip ${P.parts.kimochi===f?'on':''}" data-feel="${esc(f)}">${f}</button>`).join('')}</div>`}</div>
    <button class="btn" data-kk="build" style="width:100%">⬇ 文に まとめる</button>
    <textarea id="wText" class="wText" placeholder="ここに 文しょうが できるよ。じぶんで なおしても いいよ">${esc(P.text||'')}</textarea>
    <div id="wCheck" class="wCheck"></div>
    <div class="pBtns"><button class="btn white small" data-bm="menu">もどる</button><button class="btn pink" data-kk="done">✅ できた！</button></div>`;
  wCheck();
}
function wCheck(){
  const t = ($('#wText')?.value || '').trim(), n = t.replace(/\s/g,'').length, maru = (t.match(/。/g)||[]).length;
  const items = [[n >= 30, `30文字 いじょう（いま ${n}文字）`], [maru >= (kakuP.kind==='nikki' ? 3 : 2), `「。」が ${kakuP.kind==='nikki' ? 3 : 2}つ いじょう（いま ${maru}こ）`],
    [/[、]/.test(t), '「、」を つかった'], [/(た|だ|です|ます|たい)。/.test(t), '文の おわりが「〜た。」「〜です。」に なっている'],
    [kakuP.kind==='nikki' ? /(たい|よう|つもり)/.test(t) : /(しかった|うれし|たのし|わくわく|くやし|びっくり|おもった|思った|がんばった)/.test(t), kakuP.kind==='nikki' ? '「つぎは〜したい」が 書けた' : '気もちが 書けた']];
  if($('#wCheck')) $('#wCheck').innerHTML = items.map(([ok,l]) => `<div class="${ok?'ok':''}">${ok?'✅':'⬜'} ${l}</div>`).join('');
  return items.filter(x => x[0]).length;
}
document.addEventListener('input', e => {
  const w = e.target.closest('[data-wk]'); if(w && kakuP){ kakuP.parts[w.dataset.wk] = w.value; }
  if(e.target.id==='wText' && kakuP){ kakuP.text = e.target.value; wCheck(); }
});
document.addEventListener('click', e => {
  if(curScreen!=='bun') return;
  const m = e.target.closest('[data-bm]'); if(m){ const v = m.dataset.bm; if(v==='menu') renderBun(); else if(v==='narabe') narabeNew(); else kakuNew(v); return; }
  const u = e.target.closest('[data-bu]'); if(u){ BS.units = pickUnit(BS.units, u.dataset.bu, 'bun'); sound('tap'); renderBun(); return; }
  const mm = e.target.closest('[data-multi="bun"]'); if(mm){ e.stopImmediatePropagation(); const M = mSave(); M.multi = M.multi || {}; M.multi.bun = !M.multi.bun; if(!M.multi.bun) BS.units = BS.units.slice(0,1); persist(); renderBun(); return; }
  if(e.target.closest('#bStart')){ bunStart(); return; }
  const bc = e.target.closest('#bCount button'); if(bc){ BS.count = +bc.dataset.v; renderBun(); return; }
  const np = e.target.closest('[data-np]'); if(np && !NB.done){ NB.pick.push(NB.pool[+np.dataset.np]); sound('tap'); renderNarabe(); return; }
  const nu = e.target.closest('[data-nu]'); if(nu && !NB.done){ NB.pick.splice(+nu.dataset.nu, 1); renderNarabe(); return; }
  const nb = e.target.closest('[data-nb]');
  if(nb){ if(nb.dataset.nb==='clear'){ NB.pick = []; NB.done = false; renderNarabe(); return; }
    if(nb.dataset.nb==='next'){ narabeNew(); return; }
    const got = NB.pick.map(x => x.w), exact = got.join('')===NB.ans.join(''), endOk = got[got.length-1]===NB.ans[NB.ans.length-1];
    NB.done = true; let p = 0;
    if(exact){ p = givePts(12, 'ぶんしょう ならべかえ'); sound('ok'); confetti(1000); misEv('kanji'); }
    else if(endOk){ p = givePts(5, 'ぶんしょう ならべかえ（おしい）'); sound('tap'); }
    else sound('ng');
    renderNarabe();
    $('#nbMsg').innerHTML = exact ? `<span class="okTxt">⭕ せいかい！ 正しい 文が できたね</span> <span class="ptFloat">+${p}pt</span>`
      : endOk ? `<span class="warnTxt">△ それでも 文に なるね！ おてほんは「${esc(NB.ans.join(' '))}」</span> <span class="ptFloat">+${p}pt</span>`
      : `<span class="ngTxt">❌ おしい！ こたえは「${esc(NB.ans.join(' '))}」</span><small class="noteTxt">「〜ました。」「〜です。」は 文の さいごに くるよ</small>`;
    $('.pBtns [data-nb="check"]').outerHTML = '<button class="btn green" data-nb="next">つぎの 問題 ▶</button>';
    return; }
  const f = e.target.closest('[data-feel]'); if(f && kakuP){ kakuP.parts.kimochi = f.dataset.feel; renderKaku(); return; }
  const kk = e.target.closest('[data-kk]'); if(!kk || !kakuP) return;
  if(kk.dataset.kk==='build'){
    const P = kakuP.parts, end = s => s ? (/[。！？]$/.test(s) ? s : s + '。') : '';
    let t;
    if(kakuP.kind==='nikki') t = [P.nani, P.kimochi, P.tsugi].map(end).join('');
    else { const s1 = [P.itsu, P.doko, P.dare].filter(Boolean).join('、'); const s2 = P.nani ? (s1 ? s1 + '、' : '') + P.nani : s1; t = end(s2) + (P.kimochi ? end('とても ' + P.kimochi) : ''); }
    kakuP.text = t.replace(/、、/g,'、'); renderKaku(); toast('文に まとめたよ！ じぶんの ことばで なおしても いいよ'); return; }
  if(kk.dataset.kk==='done'){
    const t = ($('#wText').value||'').trim(); if(t.replace(/\s/g,'').length < 10){ toast('もう すこし 書いてみよう'); return; }
    const sc = wCheck(), B = bun();
    if(B.day !== dayKey()){ B.day = dayKey(); B.n = 0; }
    B.n++; let p = 0;
    if(B.n <= 3){ p = givePts(15 + sc*7, kakuP.kind==='nikki' ? '3文 日記' : '作文'); }
    B.notes.push({t:Date.now(), kind:kakuP.kind, text:t, len:t.replace(/\s/g,'').length}); if(B.notes.length > 100) B.notes.shift();
    persist(); sound('fan'); confetti(1500); misEv('kanji'); checkBadges();
    dialog(`<div class="dlgArt big"><img src="${esc(artSrc('bird_jump'))}" alt=""></div><h2 class="dlgT">${sc >= 5 ? 'はなまる！ すてきな 文しょう！' : sc >= 3 ? 'よく 書けたね！' : '書けたね！ つぎは チェックを ふやそう'}</h2>
      <div class="stars big">${'★'.repeat(Math.min(5,sc))}<i>${'★'.repeat(5-Math.min(5,sc))}</i></div><div class="notePrev">${esc(t)}</div>
      ${p ? `<span class="ptFloat">+${p}pt</span>` : '<small class="note">ポイントは 1日 3回まで だよ</small>'}`, [{label:'ノートに のこったよ', cls:'pink', v:1}], 'wide').then(() => renderBun());
  }
});
BADGES.push({id:'bun10', i:'✍️', n:'作文 10かい', f:()=>(save.bun?.notes.length||0)>=10});

/* =====================================================================
   習得度（教科・たんげん）
   ===================================================================== */
const MASTER_REW = [0, 30, 60, 150];
function unitStar(k){ const s = mSave().stats[k]; if(!s || !s.n) return 0; const acc = s.c/s.n; return s.c >= 30 && acc >= .85 ? 3 : s.c >= 15 && acc >= .75 ? 2 : s.c >= 5 && acc >= .6 ? 1 : 0; }
function unitPct(k){ const s = mSave().stats[k]; if(!s || !s.n) return 0; return Math.round(Math.min(1, s.c/30) * Math.min(1, (s.c/s.n)/.85) * 100); }
function nextHint(k){ const s = mSave().stats[k] || {n:0,c:0}, st = unitStar(k); if(st>=3) return 'マスター！';
  const need = [5,15,30][st], acc = [.6,.75,.85][st]; const left = Math.max(0, need - s.c); return left ? `あと ${left}問 せいかいで ★${st+1}` : `せいかいりつ ${Math.round(acc*100)}% で ★${st+1}`; }
const SUBJ = {
  kanji:{n:'こくご', id:'subjKanji', pct(){ const mm = kanjiMastery(), u = Object.keys(BUN_LV); const kp = mm.size ? [...mm.values()].filter(m=>m.lv>=2).length/mm.size*100 : 0; return Math.round((kp*2 + u.reduce((a,k)=>a+unitPct(k),0)/u.length)/3); }, units:()=>Object.keys(BUN_LV)},
  math:{n:'さんすう', id:'subjMath', units:()=>Object.keys(MATH_UNITS).filter(k => typeof MATH_UNITS[k].g==='number')},
  soc:{n:'しゃかい', id:'subjSoc', units:()=>Object.keys(SOC_LV)},
  sci:{n:'りか', id:'subjSci', units:()=>Object.keys(SCI_LV)},
  ek:{n:'えいご', id:'subjEk', units:()=>Object.keys(EK_LV)},
  prog:{n:'プログラミング', id:'subjProg', pct(){ const P = save.prog?.stars||{}; return Math.round(Object.values(P).reduce((a,b)=>a+b,0)/(PSTAGES.length*3)*100); }},
  eng:{n:'えいご（おとな）', id:'subjEng', pct(){ try{ const st = engStats(); return Math.round(E.qs.filter(q => st[q.id].master).length / E.qs.length * 100); }catch(e){ return 0; } }}
};
function subjPct(s){ const S = SUBJ[s]; if(S.pct) return S.pct(); const u = S.units(); return u.length ? Math.round(u.reduce((a,k)=>a+unitPct(k),0)/u.length) : 0; }
function subjStars(s){ const S = SUBJ[s]; if(!S.units) return null; const u = S.units(); return [u.reduce((a,k)=>a+unitStar(k),0), u.length*3]; }
const TIERS = [[10,'🥉','ブロンズ'],[30,'🥈','シルバー'],[60,'🥇','ゴールド'],[100,'👑','マスター']];
function decorateUnits(sel, attr){
  $$(sel).forEach(b => { const k = b.dataset[attr]; if(!k || b.querySelector('.mMast')) return; const st = unitStar(k), pc = unitPct(k);
    b.insertAdjacentHTML('beforeend', `<span class="mMast s${st}"><i class="mStars">${'★'.repeat(st)}<em>${'★'.repeat(3-st)}</em></i><i class="mPct"><i style="width:${pc}%"></i></i><small>${nextHint(k)}</small></span>`);
    if(st===3) b.classList.add('mastered'); else if(st < 3 && unitPct(k) >= 60) b.classList.add('almost'); });
}
function boardHead(s){
  const pc = subjPct(s), ss = subjStars(s), tier = [...TIERS].reverse().find(t => pc >= t[0]), nx = TIERS.find(t => pc < t[0]);
  return `<div class="mBoard"><div class="mbRing" style="--p:${pc}"><b>${pc}%</b><small>習得度</small></div><div class="mbTxt"><b>${tier ? tier[1]+' '+SUBJ[s].n+' '+tier[2] : SUBJ[s].n+' 見習い'}</b>
    ${ss ? `<small>★ ${ss[0]} / ${ss[1]} あつめた</small>` : ''}<small>${nx ? `${nx[0]}% で ${nx[1]} ${nx[2]}メダル！ ごほうびが あるよ` : 'すべて マスター！ すごい！'}</small></div></div>`;
}
const _renderMath18 = renderMath; renderMath = function(){ _renderMath18(); decorateUnits('#mUnitsAll .mUnit[data-u]', 'u'); $('#scr-math .mBoard')?.remove(); $('#mGradeTabs').insertAdjacentHTML('beforebegin', boardHead('math')); };
const _renderSoc18 = renderSoc; renderSoc = function(){ _renderSoc18(); decorateUnits('#sUnits [data-su]', 'su'); $('#scr-soc .mBoard')?.remove(); $('#sUnits').insertAdjacentHTML('beforebegin', boardHead('soc')); };
const _renderSci18 = renderSci; renderSci = function(){ _renderSci18(); decorateUnits('#rUnits [data-ru]', 'ru'); $('#scr-sci .mBoard')?.remove(); $('#rUnits').insertAdjacentHTML('beforebegin', boardHead('sci')); };
const _renderEk18 = renderEk; renderEk = function(){ _renderEk18(); decorateUnits('#kUnits [data-ku]', 'ku'); $('#scr-ekid .mBoard')?.remove(); $('#kUnits').insertAdjacentHTML('beforebegin', boardHead('ek')); };
const _renderBun18 = renderBun; renderBun = function(){ _renderBun18(); decorateUnits('#bunView [data-bu]', 'bu'); $('#bunView').insertAdjacentHTML('afterbegin', boardHead('kanji')); };
function renderSubjMastery(){
  Object.entries(SUBJ).forEach(([s,S]) => { const c = $('#'+S.id); if(!c) return; c.querySelector('.subjM')?.remove(); const pc = subjPct(s), tier = [...TIERS].reverse().find(t => pc >= t[0]);
    c.insertAdjacentHTML('beforeend', `<div class="subjM"><span>${tier ? tier[1] : '🔰'} 習得度 <b>${pc}%</b></span><i><i style="width:${pc}%"></i></i></div>`); });
}
function checkMastery(){
  const M = save.mast || (save.mast = {u:{}, s:{}}); const msgs = [];
  Object.keys(SUBJ).forEach(s => { const S = SUBJ[s];
    (S.units ? S.units() : []).forEach(k => { const st = unitStar(k), was = M.u[k]||0; if(st > was){ M.u[k] = st; const p = givePts(MASTER_REW[st], `習得 ★${st}：${MATH_UNITS[k]?.n||k}`); msgs.push(`★${st}「${MATH_UNITS[k]?.n||k}」+${p}pt`); } });
    const pc = subjPct(s), was = M.s[s]||0, ti = TIERS.filter(t => pc >= t[0]).length;
    if(ti > was){ M.s[s] = ti; const t = TIERS[ti-1], got = [];
      got.push(`🪙 +${givePts([0,100,200,400,800][ti], `${S.n} ${t[2]}メダル`)}pt`);
      if(ti>=2){ save.town.bag.goldletter = (save.town.bag.goldletter||0) + 1; got.push('✨ きらきらレター'); }
      if(ti>=3){ const H = ensureHome(), fid = ti===4 ? 'crystal' : 'trophy'; H.inv[fid] = (H.inv[fid]||0) + 1; got.push(`🏆 ${FUR(fid)?.name||'トロフィー'}`); }
      persist(); setTimeout(() => dialog(`<div class="mbRing big" style="--p:${pc}"><b>${t[1]}</b></div><h2 class="dlgT">${S.n} ${t[2]}メダル ゲット！</h2><p class="dlgP">習得度が ${t[0]}% を こえたよ！</p>${rewardHTML(got)}`, [{label:'やったー！', cls:'gold', v:1}], 'gold'), 600); }
  });
  persist(); if(msgs.length){ toast('🌟 ' + msgs.join(' / ')); confetti(1600); }
}
const _mJudge18 = mJudge;
mJudge = function(v){ const was = MQ && MQ.done; const out = _mJudge18(v); if(!was) setTimeout(checkMastery, 300); return out; };
const _show18b = show;
show = function(name){
  _show18b(name);
  if(name==='subject'){ renderSubjMastery(); checkMastery(); }
  if(name==='bun') renderBun();
  const lg = {town:'logo_town', shop:'logo_shop', record:'logo_record', zukan:'logo_zukan', subject:'logo_study'}[name];
  if(lg){ const sec = $('#scr-'+name); if(sec && !sec.querySelector('.scrLogo')) sec.insertAdjacentHTML('afterbegin', `<img class="scrLogo" src="${esc(artSrc(lg))}" alt="">`); }
};
PARENT.bun = 'kmode';
$('#goBun') && ($('#goBun').onclick = () => show('bun'));
const _hardUnits18 = hardUnits;
hardUnits = function(units, soc){ if(window.MQBUN) return Object.keys(BUN_LV).filter(k => BUN_LV[k] >= Math.max(...units.map(u => BUN_LV[u]||1))); return _hardUnits18(units, soc); };
syncHeader();


/* =====================================================================
   v1.9：2しゃせんの みち・車と 住民が かさならない
   ===================================================================== */
const LANE_CAR = 0.15, LANE_PED = 0.36;
const roadAt = (x,y) => isRoadId(save.town.cells[`${x},${y}`]);
function roadAxis(x, y){ const h = roadAt(x-1,y) || roadAt(x+1,y), v = roadAt(x,y-1) || roadAt(x,y+1); return h && !v ? 'h' : v && !h ? 'v' : h && v ? 'x' : 'h'; }
/* ---------- 車：むきで しゃせんを わける（ひだり がわ つうこう） ---------- */
const laneKey = (x,y,dx,dy) => `${x},${y},${dy===0 ? (dx>0?'E':'W') : (dy>0?'S':'N')}`;
placeCar = function(c, instant){
  const cs = CAR.cs, el = c.el; if(!el) return;
  let lx = c.x*cs + cs/2, ly = c.y*cs + cs*0.5;
  if(c.dy===0) ly += (c.dx>0 ? LANE_CAR : -LANE_CAR)*cs + cs*0.12; else lx += (c.dy>0 ? -LANE_CAR : LANE_CAR)*cs, ly += cs*0.12;
  if(instant) el.style.transition = 'none';
  el.style.left = lx + 'px'; el.style.top = ly + 'px';
  el.style.zIndex = Math.max(c.y, c.py ?? c.y)*10 + 4;
  el.classList.toggle('flip', c.flip); el.classList.toggle('vert', c.dy!==0);
  if(instant){ void el.offsetWidth; el.style.transition = ''; }
};
moveCars = function(){
  const cells = save.town.cells, occ = new Set(CAR.list.map(c => laneKey(c.x,c.y,c.dx,c.dy)));
  shuffle(CAR.list.slice()).forEach(c => {
    if(c.wait > 0){ c.wait--; return; }
    const opts = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy]) => isRoadId(cells[`${c.x+dx},${c.y+dy}`]) && !railBlock(c.x,c.y,c.x+dx,c.y+dy));
    if(!opts.length) return;
    let ch = opts.filter(([dx,dy]) => !(dx===-c.dx && dy===-c.dy)); if(!ch.length) ch = opts;
    const free = ch.filter(([dx,dy]) => !occ.has(laneKey(c.x+dx, c.y+dy, dx, dy)));
    if(!free.length){ c.block = (c.block||0) + 1; if(c.block < 3) return; ch = opts.filter(([dx,dy]) => !occ.has(laneKey(c.x+dx, c.y+dy, dx, dy))); if(!ch.length) return; }
    else ch = free;
    c.block = 0;
    const straight = ch.find(([dx,dy]) => dx===c.dx && dy===c.dy);
    const [dx,dy] = (straight && Math.random() < 0.7) ? straight : ch[Math.random()*ch.length|0];
    occ.delete(laneKey(c.x,c.y,c.dx,c.dy));
    c.py = c.y; c.x += dx; c.y += dy; c.dx = dx; c.dy = dy; if(dx) c.flip = dx < 0;
    occ.add(laneKey(c.x,c.y,dx,dy)); placeCar(c);
    if(Math.random() < 0.02) c.wait = 1;
  });
};
const _buildCars19 = buildCars;
buildCars = function(cs){
  _buildCars19(cs);
  const used = new Set(), rc = roadCells();
  CAR.list.forEach((c,i) => {
    const ax = roadAxis(c.x, c.y); if(ax==='v'){ c.dx = 0; c.dy = i%2 ? 1 : -1; } else { c.dx = i%2 ? 1 : -1; c.dy = 0; }
    let k = laneKey(c.x,c.y,c.dx,c.dy), t = 0;
    while(used.has(k) && t++ < rc.length){ const [x,y] = rc[(i*5+t) % rc.length]; c.x = x; c.y = y; k = laneKey(x,y,c.dx,c.dy); }
    used.add(k); c.flip = c.dx < 0; placeCar(c, true);
  });
};
/* ---------- 住民：マスの 中で ばしょを わけあう ---------- */
const SLOTS = [[-0.22,-0.16],[0.22,-0.16],[-0.22,0.14],[0.22,0.14],[0,0]];
function pedSlot(s, id){
  const taken = new Set(); WK.st.forEach((o, oid) => { if(oid!==id && !o.inside && o.x===s.x && o.y===s.y && o.slot!=null) taken.add(o.slot); });
  if(roadAt(s.x, s.y)){ // みちの はしっこ（ほどう）を あるく
    const ax = roadAxis(s.x, s.y), side = s.side ?? (Math.random()<.5 ? 0 : 1);
    const cand = [side, 1-side, side+2, 3-side].filter(k => !taken.has(k));
    s.side = side; return cand.length ? cand[0] : side;
  }
  const cand = [0,1,2,3,4].filter(k => !taken.has(k));
  if(s.slot!=null && !taken.has(s.slot)) return s.slot;
  return cand.length ? choice(cand) : rint(0,4);
}
walkPos = function(s){
  const cs = WK.cs, W = cs*0.62; let ox = 0, oy = 0;
  if(roadAt(s.x, s.y)){
    const ax = roadAxis(s.x, s.y), k = s.slot ?? 0, sgn = k%2 ? 1 : -1, along = k >= 2 ? 0.2 : -0.12;
    if(ax==='v'){ ox = sgn*LANE_PED; oy = along*0.6; } else { oy = sgn*LANE_PED*0.85; ox = along; }
  } else { const sl = SLOTS[s.slot ?? 4]; ox = sl[0]; oy = sl[1]; }
  return {left: s.x*cs + (cs-W)/2 + ox*cs, top: s.y*cs + cs*0.5 - W*1.12 + cs*0.42 + oy*cs, z:(s.zy ?? s.y)*10 + 5};
};
const _place19 = place;
place = function(s, instant){
  let id = null; WK.st.forEach((o,k) => { if(o===s) id = k; });
  const key = s.x+','+s.y;
  if(s.slotAt !== key){ s.slotAt = key; s.slot = pedSlot(s, id); }
  return _place19(s, instant);
};
/* 目的地が かさなる ときは となりの マスを えらぶ */
const _chooseGoal19 = chooseGoal;
chooseGoal = function(s, r){
  _chooseGoal19(s, r);
  if(!s.path.length) return;
  const [gx,gy] = s.path[s.path.length-1]; let n = 0;
  WK.st.forEach(o => { if(o!==s && !o.inside){ const t = o.path.length ? o.path[o.path.length-1] : [o.x,o.y]; if(t[0]===gx && t[1]===gy) n++; } });
  if(n >= 2){ const alt = [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy]) => [gx+dx, gy+dy]).find(([x,y]) => isWalk(x,y));
    if(alt){ const p = bfs(s.x, s.y, (x,y) => x===alt[0] && y===alt[1]); if(p) s.path = p; } }
};
const _roadHTML19 = roadHTML;
roadHTML = function(x, y){
  let h = _roadHTML19(x, y); const ax = roadAxis(x, y);
  const lane = ax==='h' ? '<i class="lane h"></i><i class="curb t"></i><i class="curb b"></i>' : ax==='v' ? '<i class="lane v"></i><i class="curb l"></i><i class="curb r"></i>' : '';
  return h.replace(/<\/div>$/, lane + '</div>');
};


/* =====================================================================
   v2.0：かべがみ・ゆかの 白い バグ修正・3Dルームツアー・はたらく お店
   ===================================================================== */
/* ---------- かべがみ・ゆか：HTMLの "" と ぶつかって 白く なっていた ---------- */
function fixCss(css){ return String(css).replace(/url\("([^"]*)"\)/g, (m,u) => `url(${u.replace(/'/g,'%27').replace(/ /g,'%20').replace(/"/g,'%22')})`); }
WALLS.concat(FLOORS).forEach(w => { w.css = fixCss(w.css); });

/* =====================================================================
   3Dルームツアー
   ===================================================================== */
const T3 = {on:false, yaw:0, pitch:-6, x:0, z:300, raf:0, keys:{}, drag:null, P:620, C:100, H:300, auto:false};
function tourOpen(){
  const H = ensureHome(), Wl = WALLS.find(w=>w.id===H.wall) || WALLS[0], Fl = FLOORS.find(f=>f.id===H.floor) || FLOORS[0];
  const C = T3.C, R = ROOM.cols*C/2, Hh = T3.H;
  let items = '';
  H.items.forEach((it,i) => {
    const f = FUR(it.id); if(!f) return; const [w,h] = fpOf(it.id, it.r);
    const cx = (it.x + w/2)*C - R, cz = (it.y + h/2)*C - R;
    if(f.floor){ const [w0,h0] = FOOT[it.id] || [1,1];
      items += `<img class="t3flat" src="${esc(artSrc('ft_'+it.id) || artSrc(f.art))}" style="width:${w0*C*.94}px;height:${h0*C*.94}px;left:${-w0*C*.47}px;top:${-h0*C*.47}px;transform:translate3d(${cx}px,-1px,${cz}px) rotateX(90deg) rotateZ(${-(it.r||0)*90}deg)" alt="">`; return; }
    const sw = (SIDE_W[it.id]||1)*C*1.05;
    items += `<div class="t3bb" data-x="${cx}" data-z="${cz}" style="width:${sw}px;left:${-sw/2}px"><img class="${it.r===3?'flip':''}" src="${esc(artSrc('fs_'+it.id) || artSrc(f.art))}" alt=""><i class="t3sh"></i></div>`;
  });
  const v = H.visit && save.town.res.find(x => x.id===H.visit.id);
  if(v){ const cx = (H.visit.x+.5)*C - R, cz = (H.visit.y+.5)*C - R; items += `<div class="t3bb t3res" data-x="${cx}" data-z="${cz}" style="width:${C*.9}px;left:${-C*.45}px">${resPic(v)}<i class="t3sh"></i></div>`; }
  const wallCss = Wl.css, floorCss = Fl.css;
  $('#tourWorld').innerHTML = `
    <div class="t3floor" style="width:${2*R}px;height:${2*R}px;left:${-R}px;top:${-R}px;background:${floorCss};transform:rotateX(90deg)"><i class="t3fShade"></i></div>
    <div class="t3ceil" style="width:${2*R}px;height:${2*R}px;left:${-R}px;top:${-R}px;transform:translateY(${-Hh}px) rotateX(90deg)"></div>
    <div class="t3wall" style="width:${2*R}px;height:${Hh}px;left:${-R}px;top:${-Hh}px;background:${wallCss};transform:translateZ(${-R}px)"><i class="t3win" style="left:18%"></i><i class="t3win" style="right:18%"></i><i class="t3base"></i></div>
    <div class="t3wall dk" style="width:${2*R}px;height:${Hh}px;left:${-R}px;top:${-Hh}px;background:${wallCss};transform:translateX(${-R}px) rotateY(90deg)"><i class="t3door"></i><i class="t3base"></i></div>
    <div class="t3wall dk" style="width:${2*R}px;height:${Hh}px;left:${-R}px;top:${-Hh}px;background:${wallCss};transform:translateX(${R}px) rotateY(-90deg)"><i class="t3pic"></i><i class="t3base"></i></div>
    <div class="t3wall dk2" style="width:${2*R}px;height:${Hh}px;left:${-R}px;top:${-Hh}px;background:${wallCss};transform:translateZ(${R}px) rotateY(180deg)"><i class="t3win" style="left:40%"></i><i class="t3base"></i></div>
    ${items}`;
  T3.bbs = $$('#tourWorld .t3bb');
  T3.P = Math.round(clamp(innerWidth*0.5, 200, 480)); $('#tourView').style.perspective = T3.P+'px'; T3.on = true; T3.x = 0; T3.z = R - 30; T3.yaw = 0; T3.pitch = -8; T3.auto = false;
  $('#tour').classList.add('show'); document.body.classList.add('noscroll');
  t3Frame(); cancelAnimationFrame(T3.raf); T3.last = performance.now(); T3.raf = requestAnimationFrame(t3Loop);
  setTimeout(() => toast('👆 ゆびで ドラッグして 見まわそう。やじるしで あるけるよ'), 400);
}
function tourClose(){ T3.on = false; cancelAnimationFrame(T3.raf); $('#tour').classList.remove('show'); document.body.classList.remove('noscroll'); $('#tourWorld').innerHTML = ''; }
function t3Frame(){
  const eye = 135, P = T3.P;
  $('#tourWorld').style.transform = `translateZ(${P*0.98}px) rotateX(${T3.pitch}deg) rotateY(${T3.yaw}deg) translate3d(${-T3.x}px,${eye}px,${-T3.z}px)`;
  (T3.bbs||[]).forEach(el => { el.style.transform = `translate3d(${el.dataset.x}px,0px,${el.dataset.z}px) rotateY(${-T3.yaw}deg)`; });
}
function t3Loop(t){
  if(!T3.on) return;
  const dt = Math.min(.05, (t - T3.last)/1000); T3.last = t;
  const K = T3.keys, R = ROOM.cols*T3.C/2 - 40;
  let mv = (K.f?1:0) - (K.b?1:0), tr = (K.r?1:0) - (K.l?1:0);
  if(T3.auto){ tr = 0.35; }
  T3.yaw += tr*80*dt;
  if(mv){ const a = T3.yaw*Math.PI/180, sp = 220*dt*mv; T3.x = clamp(T3.x + Math.sin(a)*sp, -R, R); T3.z = clamp(T3.z - Math.cos(a)*sp, -R, R); }
  t3Frame(); T3.raf = requestAnimationFrame(t3Loop);
}
(function(){
  const v = $('#tourView');
  v.addEventListener('pointerdown', e => { if(e.target.closest('button')) return; T3.drag = {x:e.clientX, y:e.clientY, yaw:T3.yaw, pitch:T3.pitch}; T3.auto = false; try{ v.setPointerCapture(e.pointerId); }catch(_){} });
  v.addEventListener('pointermove', e => { if(!T3.drag) return; T3.yaw = T3.drag.yaw - (e.clientX - T3.drag.x)*0.35; T3.pitch = clamp(T3.drag.pitch + (e.clientY - T3.drag.y)*0.2, -35, 25); });
  const up = () => { T3.drag = null; }; v.addEventListener('pointerup', up); v.addEventListener('pointercancel', up);
  $$('#tourPad [data-t3]').forEach(b => {
    const k = b.dataset.t3;
    const on = e => { e.preventDefault(); T3.keys[k] = true; T3.auto = false; b.classList.add('on'); }, off = () => { T3.keys[k] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
  });
  document.addEventListener('keydown', e => { if(!T3.on) return; const m = {ArrowUp:'f',ArrowDown:'b',ArrowLeft:'l',ArrowRight:'r',w:'f',s:'b',a:'l',d:'r'}[e.key]; if(m){ T3.keys[m] = true; e.preventDefault(); } if(e.key==='Escape') tourClose(); });
  document.addEventListener('keyup', e => { const m = {ArrowUp:'f',ArrowDown:'b',ArrowLeft:'l',ArrowRight:'r',w:'f',s:'b',a:'l',d:'r'}[e.key]; if(m) T3.keys[m] = false; });
  $('#tourClose').onclick = tourClose;
  $('#tourAuto').onclick = () => { T3.auto = !T3.auto; T3.x = 0; T3.z = 0; };
  $('#tourShot').onclick = () => { $('#tour').classList.add('flash'); sound('ok'); setTimeout(() => $('#tour').classList.remove('flash'), 300); toast('📸 パシャ！ スクリーンショットで 思い出に のこそう'); };
})();
const _renderMyHome20 = renderMyHome;
renderMyHome = function(){
  _renderMyHome20();
  if(!$('#viewSeg [data-v="tour"]')) $('#viewSeg').insertAdjacentHTML('beforeend', '<button data-v="tour" class="tourBtn">🎥 3Dルームツアー</button>');
};
document.addEventListener('click', e => { const b = e.target.closest('#viewSeg [data-v="tour"]'); if(!b) return; e.stopImmediatePropagation(); tourOpen(); }, true);

/* =====================================================================
   はたらく お店（住民が はたらく・店で 買いもの）
   ===================================================================== */
const SHOPS = {
  bakery:  {n:'パン屋', i:'🍞', greet:['いらっしゃいませ！ やきたてだよ〜','きょうの おすすめは メロンパン！'], fur:['coffee','popcorn','cottoncandy','ricecooker','kitchen','oven','microwave','fridge'], only:['coffee','popcorn','cottoncandy','ricecooker']},
  market:  {n:'八百屋', i:'🍎', greet:['しんせんな やさい あるよ！','いらっしゃい！ 草花も そだててるよ'], fur:['bonsai','terrarium','hangflower','cactus','plant','goldfish'], only:['bonsai','terrarium','hangflower']},
  dept:    {n:'デパート', i:'🏬', greet:['いらっしゃいませ。ごゆっくり どうぞ','おもちゃ売り場は 3かいです！'], fur:['arcade','jukebox','bigteddy','robot','unicorn','dollhouse','dresser','wardrobe','mirror','armchair','gametv','toybox'], only:['arcade','jukebox','bigteddy','robot','unicorn']},
  library: {n:'図書館', i:'📚', greet:['しずかに たのしんでね','本の すきな 家具も あるよ'], fur:['telescope','globe','wdesk','shelf','desk','rocking'], only:['telescope','globe']},
  post:    {n:'ゆうびん局', i:'📮', greet:['お手紙 だしますか？','レターが ちょっと おトクだよ！'], use:['letter','goldletter','ticket'], disc:0.1},
  dealer:  {n:'くるまやさん', i:'🚗', greet:['ピカピカの 車が そろってるよ！','いい 車 あるよ〜'], veh:['convert','beetle','sports','limo','ev'], only:['convert','beetle']},
  hotel:   {n:'ホテル', i:'🏨', greet:['ようこそ！ ゆっくりして いってね','すてきな 家具を おいてあります'], fur:['throne','canopybed','crystal','fireplace','grandpiano'], only:['throne','canopybed']}
};
const SHOP_ONLY = {}; Object.entries(SHOPS).forEach(([b,S]) => (S.only||[]).forEach(id => SHOP_ONLY[id] = b));
const isShopB = id => !!SHOPS[id];
function workers(){ const t = save.town; return t.workers || (t.workers = {}); }
function workerOf(key){ const rid = workers()[key]; const r = rid && save.town.res.find(x => x.id===rid); return r && !SP(r.sp).human ? r : null; }
const isWorking = r => Object.values(workers()).includes(r.id);
function shopOpen(key){ const r = workerOf(key); return !!r && r.id !== ghosted(); }
function autoAssign(){
  const t = save.town, W = workers(); let ch = false;
  Object.keys(W).forEach(k => { if(!isShopB(t.cells[k]) || !workerOf(k)){ delete W[k]; ch = true; } });
  Object.entries(t.cells).forEach(([k,id]) => {
    if(!isShopB(id) || W[k]) return;
    const free = t.res.filter(r => !SP(r.sp).human && !isWorking(r));
    if(!free.length) return;
    const pref = free.filter(r => SP(r.sp).bias==='biz' || SP(r.sp).bias==='work');
    W[k] = (pref.length ? choice(pref) : choice(free)).id; ch = true;
  });
  if(ch) persist();
}
/* うりあげは あいている お店だけ */
const _townCalc20 = townCalc;
townCalc = function(){
  const c = _townCalc20(), t = save.town; let lost = 0;
  Object.entries(t.cells).forEach(([k,id]) => { if(isShopB(id) && !shopOpen(k)) lost += ITEM(id)?.income||0; });
  if(lost){ const ratio = c.income ? Math.max(0, (c.income - lost)/c.income) : 1; c.income = Math.max(0, c.income - lost); c.harvest = Math.round(c.harvest*ratio); }
  return c;
};
/* まちの 上の 表示 */
const _renderMap20 = renderMap;
renderMap = function(){
  autoAssign(); _renderMap20();
  Object.entries(save.town.cells).forEach(([k,id]) => {
    if(!isShopB(id)) return; const [x,y] = k.split(','), c = $(`#townMap .cell[data-x="${x}"][data-y="${y}"]`); if(!c) return;
    const r = workerOf(k), open = shopOpen(k);
    c.classList.toggle('shopClosed', !open);
    c.insertAdjacentHTML('beforeend', open ? `<span class="shopSign open">OPEN</span><span class="shopWorker">${resPic(r)}</span>` : `<span class="shopSign closed">CLOSED</span>`);
  });
};
/* はたらいている 住民は お店の 中 */
const _walkTick20 = walkTick;
walkTick = function(){
  const ids = new Set(Object.values(workers()));
  WK.st.forEach((s,id) => { if(ids.has(id) && s.el){ s.inside = 99; s.path = []; s.el.classList.add('inside'); } });
  return _walkTick20();
};
const _buildWalkers20 = buildWalkers;
buildWalkers = function(cs, L){ _buildWalkers20(cs, L); const ids = new Set(Object.values(workers())); WK.st.forEach((s,id) => { if(ids.has(id) && s.el){ s.inside = 99; s.el.classList.add('inside'); } }); };
/* ショップ画面から お店限定の ものを はずす */
const _shopList20 = shopList;
shopList = function(){ return _shopList20().filter(it => !SHOP_ONLY[it.id]); };
const _renderShop20 = renderShop;
renderShop = function(){
  _renderShop20();
  const only = Object.entries(SHOP_ONLY).filter(([id]) => { const it = FUR(id) || ITEM(id); return it && (shopTab==='fur' ? it.type==='fur' : shopTab==='veh' ? it.type==='veh' : false); });
  if(only.length) $('#shopGrid').insertAdjacentHTML('beforeend', `<div class="shopCard onlyNote"><div class="sImg"><span class="emo">🏪</span></div><div class="sName">お店 げんてい</div><div class="sEff">${uniq(only.map(([,b]) => SHOPS[b].n)).join('・')}で しか かえない ものが あるよ！ まちの お店に 入ってみよう</div></div>`);
};
/* お店に 入る */
let catalog = function(b){
  const S = SHOPS[b], out = [];
  (S.fur||[]).forEach(id => { const f = FUR(id); if(f) out.push({id, kind:'fur', name:f.name, art:f.art, price:f.price, only:SHOP_ONLY[id]===b}); });
  (S.use||[]).forEach(id => { const it = ITEM(id); if(it) out.push({id, kind:'use', name:it.name, art:it.art, price:Math.round(priceOf(it)*(1-(S.disc||0))/10)*10, only:false}); });
  (S.veh||[]).forEach(id => { const it = ITEM(id); if(it) out.push({id, kind:'veh', name:it.name, art:it.art, price:it.price, only:SHOP_ONLY[id]===b}); });
  return out;
}
let openShop = async function(key){
  const t = save.town, b = t.cells[key], S = SHOPS[b], it = ITEM(b);
  if(!shopOpen(key)){
    const free = t.res.filter(r => !SP(r.sp).human && !isWorking(r) && r.id!==ghosted());
    const v = await dialog(`<div class="dlgArt"><img src="${esc(artSrc(it.art))}" alt="" style="filter:grayscale(.6) brightness(.85)"></div><h2 class="dlgT">${S.i} ${S.n}は しまっています…</h2>
      <p class="dlgP">はたらく 住民が いないよ。<br>${free.length ? 'だれかに おねがいして みよう！' : 'あたらしい 住民を まねくか、ほかの お店から きてもらおう'}</p>
      <div class="whoRow">${free.slice(0,8).map(r => `<button class="whoIt pickW" data-pw="${r.id}">${resPic(r)}<span>${esc(r.name)}</span></button>`).join('')}</div>`,
      [{label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'とじる', cls:'white', v:null}], 'wide');
    if(v==='grade') openBuilding(key);
    return;
  }
  const r = workerOf(key);
  const draw = () => `<div class="shopIn"><div class="siTop"><span class="siWorker">${resPic(r)}</span><div class="talkBubble"><b>${esc(r.name)}（${S.n}の 店員）</b>${esc(speak(r, choice(S.greet)))}</div></div>
    <div class="siGrid">${catalog(b).map(c => { const owned = c.kind==='fur' ? (ensureHome().inv[c.id]||0) + ensureHome().items.filter(i=>i.id===c.id).length : c.kind==='use' ? (t.bag[c.id]||0) : t.veh.concat(garage()).filter(x=>x===c.id).length;
      return `<div class="siIt ${c.only?'only':''}">${c.only?'<span class="siOnly">お店げんてい</span>':''}<img src="${esc(artSrc(c.art))}" alt=""><b>${esc(c.name)}</b><small>もっている ${owned}</small>
      <button class="btn small ${save.points.bal>=c.price?'orange':'white'}" data-sbuy="${c.kind}:${c.id}:${c.price}" ${save.points.bal>=c.price?'':'disabled'}><span class="coin sm">P</span> ${nf(c.price)}</button></div>`; }).join('')}</div></div>`;
  const v = await dialog(draw(), [{label:'💬 はなす', cls:'white', v:'talk'}, {label:'🔄 店員を かえる', cls:'white', v:'swap'}, {label:'⬆ グレードアップ', cls:'white', v:'grade'}, {label:'おみせを 出る', cls:'', v:null}], 'wide shopDlg');
  if(v==='talk') talkTo(r.id);
  if(v==='grade') openBuilding(key);
  if(v==='swap'){ delete workers()[key]; persist(); renderTown(); openShop(key); }
}
document.addEventListener('click', async e => {
  const pw = e.target.closest('[data-pw]');
  if(pw){ e.stopImmediatePropagation(); const key = SHOP_KEY; workers()[key] = pw.dataset.pw; persist(); $('#dlg').classList.remove('show'); sound('fan'); toast('🏪 お店が あいたよ！'); renderTown(); openShop(key); return; }
  const sb = e.target.closest('[data-sbuy]');
  if(sb){ e.stopImmediatePropagation(); const [kind,id,price] = sb.dataset.sbuy.split(':'), p = +price, t = save.town;
    if(save.points.bal < p){ toast('ポイントが たりないよ'); return; }
    if(kind==='veh'){ const it = ITEM(id); if(t.veh.length >= townCalc().vehCap){ garage().push(id); (t.autoGar = t.autoGar || []).push(id); toast(`${it.name}は はしれる だいすうが いっぱいなので しゃこで まっているよ（わくが ふえたら じどうで はしるよ）`); } else t.veh.push(id); }
    else if(kind==='use') t.bag[id] = (t.bag[id]||0) + 1;
    else { const H = ensureHome(); H.inv[id] = (H.inv[id]||0) + 1; }
    givePts(-p, `${SHOPS[t.cells[SHOP_KEY]]?.n||'お店'}で ${(FUR(id)||ITEM(id)).name}を かった`); discover(id); persist(); sound('ok'); confetti(900);
    sb.closest('.siIt').classList.add('bought'); sb.closest('.siIt').querySelector('small').textContent = 'かったよ！'; checkBadges(); return; }
}, true);
let SHOP_KEY = null;
document.addEventListener('click', e => {
  if(townEdit || curScreen!=='town' || e.target.closest('.walker')) return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const key = `${c.dataset.x},${c.dataset.y}`, id = save.town.cells[key];
  if(!isShopB(id)) return;
  e.stopImmediatePropagation(); SHOP_KEY = key; openShop(key);
}, true);
BADGES.push({id:'shop3', i:'🏪', n:'お店 3けん オープン', f:()=>Object.keys(save.town?.workers||{}).length>=3});


/* =====================================================================
   v2.1：3Dルームツアーの 家具を 立体に（スライスで あつみを 出す）
   ===================================================================== */
const FUR_DEPTH = {bed:1.7, sofa:.8, table:.9, chair:.8, shelf:.45, desk:.7, tv:.5, plant:.7, piano:.6, wardrobe:.6, kitchen:.7, fridge:.75, clock:.4,
  aquarium:.5, teddy:.6, globe:.6, painting:.35, toybox:.7, lamp:.5, trainset:.9, dollhouse:.7, bunkbed:1.7, futon:1.7, canopybed:1.8, grandpiano:1.6, bathtub:.9, kotatsu:1.4, hammock:.9};
function solidHTML(it, f, C){
  const [w0,h0] = FOOT[it.id] || [1,1], sw = (SIDE_W[it.id]||w0)*C*1.0;
  const dep = Math.round((FUR_DEPTH[it.id] ?? Math.min(h0, 1)*0.7) * C * (h0 > 1 && !FUR_DEPTH[it.id] ? h0 : 1));
  const n = clamp(Math.round(dep/2.4), 10, 44), src = esc(artSrc('fs_'+it.id) || artSrc(f.art));
  let s = '';
  for(let i=0;i<n;i++){
    const z = -dep/2 + dep*i/(n-1), edge = i===0 || i===n-1, br = edge ? 1 : 0.78 + 0.1*Math.sin(i/n*Math.PI);
    s += `<img class="sl${edge?' ed':''}" src="${src}" style="transform:translateZ(${z.toFixed(1)}px)${i===0?' rotateY(180deg)':''};${edge?'':`filter:brightness(${br.toFixed(2)}) saturate(.9)`}" alt="">`;
  }
  return {html:s, w:sw, dep};
}
const _tourOpen21 = tourOpen;
tourOpen = function(){
  _tourOpen21();
  const H = ensureHome(), C = T3.C, R = ROOM.cols*C/2, W = $('#tourWorld');
  W.querySelectorAll('.t3bb:not(.t3res)').forEach(e => e.remove());
  let html = '';
  H.items.forEach(it => {
    const f = FUR(it.id); if(!f || f.floor) return; const [w,h] = fpOf(it.id, it.r);
    const cx = (it.x + w/2)*C - R, cz = (it.y + h/2)*C - R;
    const S = solidHTML(it, f, C), rot = -(it.r||0)*90;
    html += `<div class="t3solid" style="transform:translate3d(${cx}px,0,${cz}px) rotateY(${rot}deg)"><div class="t3body" style="width:${S.w}px;left:${-S.w/2}px">${S.html}</div>
      <i class="t3shadow" style="width:${S.w*1.05}px;height:${S.dep*1.1}px;left:${-S.w*0.525}px;top:${-S.dep*0.55}px"></i></div>`;
  });
  W.insertAdjacentHTML('beforeend', html);
  T3.bbs = $$('#tourWorld .t3bb');
};


/* =====================================================================
   v2.2：3D家具を はこ型モデルに（前・うしろ・よこ・上に 絵を はる）
   ===================================================================== */
const IMG_AR = {};
function imgAR(src){ return IMG_AR[src] ? Promise.resolve(IMG_AR[src]) : new Promise(r => { const i = new Image(); i.onload = () => { IMG_AR[src] = i.naturalHeight / i.naturalWidth; r(IMG_AR[src]); }; i.onerror = () => r(1); i.src = src; }); }
const COL = {};
function avgColor(src){
  if(COL[src]) return COL[src];
  try{ const i = new Image(); i.src = src; const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d'); x.drawImage(i, 0, 0, 16, 16);
    const d = x.getImageData(0,0,16,16).data; let r=0,g=0,b=0,n=0; for(let k=0;k<d.length;k+=4){ if(d[k+3]>200){ r+=d[k]; g+=d[k+1]; b+=d[k+2]; n++; } }
    COL[src] = n ? `rgb(${r/n|0},${g/n|0},${b/n|0})` : '#C99A63'; }catch(e){ COL[src] = '#C99A63'; }
  return COL[src];
}
/* 上の 面を はる 家具（上から 見ると たいらな もの） */
const TOP_SOLID = new Set(['bed','sofa','table','desk','shelf','wardrobe','fridge','kitchen','piano','tv','drawers','cabinet','bathtub','kotatsu','chabudai','futon','wdesk','pcdesk',
  'bunkbed','canopybed','grandpiano','toybox','aquarium','trainset','dresser','tansu','washer','oven','microwave','ricecooker','gametv','stereo','arcade','jukebox','fireplace','treasure','workbench','sewing','benchin','shoerack','armchair','beanbag','throne','dogbed','hina','dollhouse']);
function face(cls, w, h, tf, bg, extra=''){ return `<i class="fc ${cls}" style="width:${w}px;height:${h}px;left:${-w/2}px;top:${-h/2}px;transform:${tf};${bg}${extra}"></i>`; }
async function modelHTML(it, f, C){
  const side = artSrc('fs_'+it.id) || artSrc(f.art), top = artSrc('ft_'+it.id);
  const [w0,h0] = FOOT[it.id] || [1,1];
  const W = (SIDE_W[it.id] || w0) * C * 0.98, ar = await imgAR(side), H = W * ar;
  const D = Math.max(18, Math.round((FUR_DEPTH[it.id] ?? Math.min(h0,1)*0.75) * C * (h0 > 1 && !FUR_DEPTH[it.id] ? h0 : 1)));
  const col = avgColor(side), sImg = `background:url(${side}) center bottom/100% 100% no-repeat;`;
  let s = '';
  s += face('fr', W, H, `translateZ(${D/2}px)`, sImg);
  s += face('bk', W, H, `rotateY(180deg) translateZ(${D/2}px)`, sImg, 'filter:brightness(.82);');
  s += face('sd', D, H, `rotateY(90deg) translateZ(${W/2}px)`, sImg, 'filter:brightness(.72);');
  s += face('sd', D, H, `rotateY(-90deg) translateZ(${W/2}px)`, sImg, 'filter:brightness(.72);');
  const n = Math.max(2, Math.min(10, Math.round(D/14)));
  for(let k=1;k<n;k++){ const z = -D/2 + D*k/n; s += face('sl2', W, H, `translateZ(${z.toFixed(1)}px)`, sImg, `filter:brightness(${(0.7+0.12*Math.sin(k/n*Math.PI)).toFixed(2)});`); }
  if(top && TOP_SOLID.has(it.id)){
    const tw = W, td = D, tH = H * (['bed','bunkbed','canopybed','sofa','armchair','throne','piano','grandpiano','fireplace','hina','dollhouse'].includes(it.id) ? 0.55 : 0.98);
    s += `<i class="fc tp" style="width:${tw}px;height:${td}px;left:${-tw/2}px;top:${-td/2}px;transform:translateY(${H/2 - tH}px) rotateX(90deg);background:url(${top}) center/100% 100% no-repeat,${col};border-radius:6px"></i>`;
  }
  return {html:`<div class="mdl" style="transform:translateY(${-H/2}px)">${s}</div>`, W, D, H};
}
tourOpen = async function(){
  _tourOpen21();
  const H = ensureHome(), C = T3.C, R = ROOM.cols*C/2, Wd = $('#tourWorld');
  Wd.querySelectorAll('.t3bb:not(.t3res), .t3solid').forEach(e => e.remove());
  let html = '';
  for(const it of H.items){
    const f = FUR(it.id); if(!f || f.floor) continue; const [w,h] = fpOf(it.id, it.r);
    const cx = (it.x + w/2)*C - R, cz = (it.y + h/2)*C - R, M = await modelHTML(it, f, C);
    html += `<div class="t3solid" style="transform:translate3d(${cx}px,0,${cz}px) rotateY(${-(it.r||0)*90}deg)">${M.html}
      <i class="t3shadow" style="width:${M.W*1.1}px;height:${M.D*1.2+20}px;left:${-M.W*0.55}px;top:${-(M.D*1.2+20)/2}px"></i></div>`;
  }
  Wd.insertAdjacentHTML('beforeend', html);
  T3.bbs = $$('#tourWorld .t3bb');
};


/* v2.3：3Dルームツアー 廃止 */
tourOpen = function(){};
{ const _rmh23 = renderMyHome; renderMyHome = function(){ _rmh23(); $$('#viewSeg [data-v="tour"]').forEach(b => b.remove()); }; }

/* =====================================================================
   v2.4：住民の とくべつな シーン・お店の グレード・ロゴ／ナビ／習得度バーの 修正
   ===================================================================== */
const SCENES = {
  tree:    {n:'木かげの おひるね', items:['tree','d_maple','d_pine','d_palm','d_bamboo'], pose:'nap', fx:'💤', lines:['ふあぁ… 木の かげって きもちいいね。ちょっとだけ おひるね…','そよかぜが ここちいいなあ… ねむく なっちゃった']},
  sakura:  {n:'さくら ふぶき', items:['d_sakura'], pose:'happy', fx:'🌸', lines:['わあ！ さくらの はなびらが ふってきたよ！','はなびら つかまえた！ ねがいごと しちゃおう']},
  library: {n:'本の せかい', items:['library','school'], pose:'read', fx:'📖', lines:['この 本、すっごく おもしろいんだ！','本を 読んでたら じかんを わすれちゃった']},
  bakery:  {n:'やきたて パン', items:['bakery','market'], pose:'eat', fx:'🥐', lines:['やきたての パン、いい においだね〜！','いっこ たべる？ はんぶんこ しよう！']},
  pond:    {n:'ゆうやけの 池', items:['pond','d_koipond','d_duckpond','d_waterfall'], pose:'look', fx:'✨', lines:['池に ゆうひが うつって きれいだね','トンボが いっぱい とんでるよ']},
  stars:   {n:'ほしぞら かんさつ', items:['observatory','d_stardeck','tower'], pose:'look', fx:'⭐', night:true, lines:['ながれぼし！ ねがいごと できた？','あの 星、きみの 名前を つけちゃおう']},
  harbor:  {n:'みなとの ゆうひ', items:['harbor','d_lighthouse'], pose:'wave', fx:'🌅', lines:['うみの むこうには なにが あるのかな','ふねに のって たびに 出たいなあ']},
  snow:    {n:'ゆきの こうえん', items:['d_snowman','evi_christmas_0','evi_christmas_1','evi_christmas_2'], pose:'happy', fx:'❄️', lines:['ゆきだ〜！ いっしょに ゆきがっせん しよう！','はく いきが まっしろ！']},
  fountain:{n:'にじの ふんすい', items:['fountain','d_rainbowfount'], pose:'happy', fx:'🌈', lines:['見て！ ふんすいに にじが できてる！','きらきらで まぶしいね']},
  flowers: {n:'おはなばたけ', items:['flower','d_tulip','d_sunflower','d_flowerclock','d_rosearch'], pose:'happy', fx:'🌷', lines:['いい においの おはなばたけ！','おはなの かんむり つくって あげる！']},
  festival:{n:'なつまつりの よる', items:['d_takoyaki','d_omikuji','d_crepe','d_icestand','d_carousel'], pose:'eat', fx:'🎆', lines:['はなびだ〜！ ドーン！','たこやき あつあつ！ ふーふー']},
  castle:  {n:'おしろの バルコニー', items:['castle','d_minicastle','landmark'], pose:'wave', fx:'👑', lines:['まちが ぜんぶ 見わたせるよ！','この まちの おうさまに なった きぶん！']},
  onsen:   {n:'もみじの おんせん', items:['d_onsen'], pose:'nap', fx:'♨️', lines:['ふぃ〜 ごくらく ごくらく…','おんせんで ぽかぽか〜']},
  park:    {n:'こうえんで あそぼう', items:['park','d_swing','d_slide','d_seesaw','d_junglegym'], pose:'happy', fx:'🎈', lines:['ブランコ どっちが 高く こげるか きょうそう！','すべりだい、もう いっかい！']}
};
const SC_N = {2:1, 3:3, 4:5};
const isNight = () => { const h = new Date().getHours(); return h >= 18 || h < 6; };
function speciesScenes(sp){
  const s = SP(sp), n = SC_N[s.rar||1] || 0; if(!n || s.human) return [];
  const keys = Object.keys(SCENES), pref = s.home==='water' ? ['pond','harbor','onsen'] : s.home==='bird' ? ['tree','sakura','stars'] : s.home==='tree' ? ['tree','flowers','park'] : [];
  let h = hashN(sp); const out = [];
  if(pref.length) out.push(pref[h % pref.length]);
  while(out.length < n){ h = (h*1103515245 + 12345) >>> 0; const k = keys[h % keys.length]; if(!out.includes(k)) out.push(k); }
  return out;
}
function scSave(){ return save.scenes || (save.scenes = {}); }
const scSeen = (sp, k) => (scSave()[sp]||[]).includes(k);
function scHint(k){ const S = SCENES[k]; const names = S.items.map(id => ITEM(id)?.name).filter(Boolean).slice(0,3).join('・');
  return `まちに すんでいる ときに「${names}」を タッチ${S.night ? '（よる 6時〜あさ 6時）' : ''}`; }
function sceneCard(r, sp, k, isNew){
  const S = SCENES[k], s = SP(sp), R = RARITY[s.rar||1];
  const who = r || {id:'z_'+sp, sp, name:s.name, star:1, ab:{}};
  const line = r ? speak(r, choice(S.lines)) : choice(S.lines);
  return `<div class="scCard pose-${S.pose} rk${R.k}"><img class="scBg" src="${esc(artSrc('sc_'+k))}" alt="">
    <div class="scFx">${(S.fx+' ').repeat(5)}</div>
    <div class="scChar">${resPic(who)}</div>
    <div class="scTitle">${isNew ? '✨ NEW ' : ''}${esc(S.n)}</div>
    <div class="scLine"><b>${esc(who.name)}</b>${esc(line)}</div></div>`;
}
async function showScene(r, k){
  const isNew = !scSeen(r.sp, k);
  if(isNew){ const A = scSave(); (A[r.sp] = A[r.sp] || []).push(k); r.fr = (r.fr||0) + 1; persist(); }
  sound('fan'); if(isNew) confetti(1800);
  const all = speciesScenes(r.sp), got = (scSave()[r.sp]||[]).length;
  await dialog(sceneCard(r, r.sp, k, isNew) + `<p class="dlgP" style="font-size:13px">${isNew ? `とくべつな 1まいを 見つけた！（${esc(SP(r.sp).name)} ${got}/${all.length}）<br>ずかんで いつでも 見られるよ` : `${esc(SP(r.sp).name)}の とくべつな 1まい（${got}/${all.length}）`}</p>`,
    [{label:'すてき！', cls:'gold', v:1}], 'wide scDlg');
  checkBadges();
}
async function tryScene(itemId){
  const t = save.town; if(!t) return false;
  const cands = [];
  t.res.forEach(r => { if(r.id===ghosted()) return; speciesScenes(r.sp).forEach(k => { const S = SCENES[k]; if(S.items.includes(itemId) && (!S.night || isNight())) cands.push({r, k, seen:scSeen(r.sp, k)}); }); });
  if(!cands.length) return false;
  const nw = cands.filter(c => !c.seen), c = nw.length ? choice(nw) : (Math.random() < 0.12 ? choice(cands) : null);
  if(!c) return false;
  await showScene(c.r, c.k); return true;
}
const _openBuilding24 = openBuilding;
openBuilding = async function(key){ const id = save.town.cells[key]; if(await tryScene(id)) return; return _openBuilding24(key); };
const _openShop24 = openShop;
openShop = async function(key){ const id = save.town.cells[key]; if(await tryScene(id)) return; return _openShop24(key); };
/* みちの 上の かざりも */
document.addEventListener('click', async e => {
  if(townEdit || curScreen!=='town') return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const key = `${c.dataset.x},${c.dataset.y}`, oid = (save.town.over||{})[key];
  if(oid && isRoadId(save.town.cells[key]) && !e.target.closest('.walker')){ e.stopImmediatePropagation(); if(!(await tryScene(oid))) toast(`${ITEM(oid)?.name||''}`); }
}, true);
/* ずかん：とくべつな シーン */
document.addEventListener('click', async e => {
  if(curScreen!=='zukan') return;
  const v = e.target.closest('[data-scv]');
  if(v){ e.stopImmediatePropagation(); const [sp,k] = v.dataset.scv.split('|'), r = save.town.res.find(x => x.sp===sp);
    await dialog(sceneCard(r, sp, k, false), [{label:'とじる', v:1}], 'wide scDlg'); return; }
  const b = e.target.closest('#zukanGrid .zkCard'); if(!b) return;
  const id = b.dataset.id, sp = SPECIES.find(s => s.id===id); if(!sp || (sp.rar||1) < 2 || sp.human || !zk().f[id]) return;
  e.stopImmediatePropagation();
  const R = RARITY[sp.rar||1], ab = ABILITIES.find(a => a.id===sp.bias), n = save.town.res.filter(r => r.sp===id).length, list = speciesScenes(id);
  const gallery = list.map(k => scSeen(id, k)
    ? `<button class="scThumb" data-scv="${id}|${k}"><img src="${esc(artSrc('sc_'+k))}" alt=""><span>${esc(SCENES[k].n)}</span></button>`
    : `<div class="scThumb lock"><i>🔒</i><span>？？？</span><small>💡 ${esc(scHint(k))}</small></div>`).join('');
  await dialog(`<div class="arrBg rk${R.k}"><div class="dlgArt big">${picHTML(sp)}</div></div><div class="rarTag rt${R.k}" style="background:${R.c}">${R.n}</div>
    <h2 class="dlgT">${esc(sp.name)}</h2><p class="dlgP" style="font-size:14px">とくいな こと：${ab ? ab.i+' '+ab.n : '🌟 ぜんぶ'}・すむ 家：${esc(homeName(sp.home))}・まちに ${n}人</p>
    <div class="zkInfo">${esc(sp.info || ZUKAN_INFO[id] || '')}</div>
    <h3 class="scHead">📸 とくべつな シーン（${(scSave()[id]||[]).length}/${list.length}）</h3><div class="scGal">${gallery}</div>`, [{label:'とじる', v:1}], 'wide');
}, true);
BADGES.push({id:'scene1', i:'📸', n:'とくべつな 1まい', f:()=>Object.values(save.scenes||{}).some(a=>a.length)}, {id:'scene10', i:'🖼️', n:'シーン 10まい', f:()=>Object.values(save.scenes||{}).reduce((a,b)=>a+b.length,0)>=10});

/* =====================================================================
   お店の グレードで しなぞろえが ふえる
   ===================================================================== */
const SHOP_MORE = {
  bakery:['waterdisp','chabudai','popcorn','cottoncandy'], market:['birdcage','hamcage','bigpot','hangflower'], dept:['beanbag','stool','canopybed','unicorn','bigteddy'],
  library:['easel','sewing','pottery','globe','telescope'], dealer:['kart','jeep','carriage'], hotel:['bathtub','washbasin','jukebox','crystal'], post:['rankbook']
};
const SHOP_BASE = 3, SHOP_STEP = 2;
const _catalog24 = catalog;
catalog = function(b){
  const S = SHOPS[b]; let list = _catalog24(b); const have = new Set(list.map(c => c.id));
  (SHOP_MORE[b]||[]).forEach(id => { if(have.has(id)) return; const f = FUR(id), it = ITEM(id);
    if(f) list.push({id, kind:'fur', name:f.name, art:f.art, price:f.price, only:SHOP_ONLY[id]===b});
    else if(it && it.type==='veh') list.push({id, kind:'veh', name:it.name, art:it.art, price:it.price, only:false});
    else if(it && it.type==='use') list.push({id, kind:'use', name:it.name, art:it.art, price:priceOf(it), only:false}); });
  const g = (save.town.glv||{})[SHOP_KEY] || 0, avail = SHOP_BASE + SHOP_STEP*g;
  return list.map((c,i) => Object.assign(c, {lockG: i >= avail ? Math.ceil((i + 1 - SHOP_BASE)/SHOP_STEP) : 0}));
};
const _openShop24b = openShop;
openShop = async function(key){
  SHOP_KEY = key;
  const p = _openShop24b(key);
  setTimeout(() => {
    const g = (save.town.glv||{})[key] || 0;
    catalog(save.town.cells[key]).forEach(c => { if(!c.lockG) return;
      const b = document.querySelector(`[data-sbuy="${c.kind}:${c.id}:${c.price}"]`); if(!b) return; const card = b.closest('.siIt');
      card.classList.add('glock'); b.outerHTML = `<span class="gneed">🔒 ★${c.lockG}で 入荷</span>`; });
    const top = document.querySelector('.shopIn .siTop'); if(top && !top.querySelector('.gTag')) top.insertAdjacentHTML('beforeend', `<span class="gTag">お店 ${'★'.repeat(g)}${'☆'.repeat(3-g)}</span>`);
  }, 30);
  return p;
};

/* =====================================================================
   画面の 回転で 下の ナビが ずれる ／ 設定アイコンが 見えない
   ===================================================================== */
function relayout(){
  const n = $('#bnav'); if(!n) return;
  n.style.display = 'none'; void n.offsetHeight; n.style.display = '';
  const y = window.scrollY; window.scrollTo(0, y + 1); window.scrollTo(0, y);
  document.documentElement.style.setProperty('--vh', (window.innerHeight*0.01) + 'px');
}
window.addEventListener('orientationchange', () => { setTimeout(relayout, 250); setTimeout(relayout, 700); });
window.addEventListener('resize', () => { clearTimeout(window._rl24); window._rl24 = setTimeout(relayout, 200); });
if(window.visualViewport) visualViewport.addEventListener('resize', () => { clearTimeout(window._rl24b); window._rl24b = setTimeout(relayout, 250); });


/* =====================================================================
   v2.5：ホーム背景の 固定・下ナビの ずれ・ちょうレア専用の 絵・お店げんてい 追加・
         レア住民の おうえん・わたしの家の 部屋ふやし／2かい
   ===================================================================== */
/* ---------- ホーム背景：シマエナガを タッチしても かわらない ---------- */
const _applyArt25 = applyArt;
applyArt = function(root){
  _applyArt25(root);
  if(curScreen==='home') $('#bg').style.backgroundImage = `url("${artSrc(homeBgKey())}")`;
  else if(curScreen==='myhome' && artSrc('bg_myhome')) $('#bg').style.backgroundImage = `url("${artSrc('bg_myhome')}")`;
};

/* ---------- 下の ナビ：画面を まわしても ずれない ---------- */
function navFix(){
  const n = $('#bnav'), vv = window.visualViewport; if(!n) return;
  if(!vv){ n.style.transform = ''; return; }
  const off = (vv.offsetTop + vv.height) - window.innerHeight;
  n.style.transform = Math.abs(off) > 0.5 ? `translateY(${off.toFixed(1)}px)` : '';
  n.style.width = vv.width + 'px'; n.style.left = vv.offsetLeft + 'px'; n.style.right = 'auto';
}
function resetZoom(){
  const m = document.querySelector('meta[name="viewport"]'); if(!m) return;
  const c = m.getAttribute('content');
  m.setAttribute('content', 'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
  setTimeout(() => m.setAttribute('content', c), 60);
  window.scrollTo(window.scrollX ? 0 : 0, window.scrollY);
}
if(window.visualViewport){ visualViewport.addEventListener('resize', navFix); visualViewport.addEventListener('scroll', navFix); }
window.addEventListener('scroll', navFix, {passive:true});
window.addEventListener('orientationchange', () => { resetZoom(); [50, 200, 450, 800, 1200].forEach(t => setTimeout(() => { navFix(); relayout(); navFix(); }, t)); });
window.addEventListener('resize', () => setTimeout(navFix, 60));
setTimeout(navFix, 500);

/* ---------- ちょうレア：専用の 絵 ---------- */
const _sceneCard25 = sceneCard;
sceneCard = function(r, sp, k, isNew){
  const art = 'scu_'+sp+'_'+k;
  if(!artSrc(art)) return _sceneCard25(r, sp, k, isNew);
  const S = SCENES[k], s = SP(sp), who = r || {name:s.name}, line = r ? speak(r, choice(S.lines)) : choice(S.lines);
  return `<div class="scCard rk4 own"><img class="scBg" src="${esc(artSrc(art))}" alt="">
    <div class="scTitle">${isNew ? '✨ NEW ' : ''}${esc(S.n)}</div><i class="scGlow"></i>
    <div class="scLine"><b>${esc(who.name)}</b>${esc(line)}</div></div>`;
};
/* ずかんの サムネも 専用の 絵に */
document.addEventListener('click', () => setTimeout(() => {
  $$('.scThumb[data-scv]').forEach(b => { const [sp,k] = b.dataset.scv.split('|'), a = artSrc('scu_'+sp+'_'+k); const im = b.querySelector('img'); if(a && im && im.src !== a) im.src = a; });
}, 60), true);

/* ---------- お店げんてい：しなぞろえを ふやす ---------- */
const SHOP_EXTRA = {
  bakery:  ['waterdisp','chabudai','microwave'],
  market:  ['birdcage','hamcage','cattree','dogbed','d_flowercart','d_topiary','d_bigpot'],
  dept:    ['beanbag','gametv','canopybed','dresser','mirror','d_balloon'],
  library: ['easel','sewing','pottery','harp','workbench'],
  hotel:   ['bathtub','washbasin','jukebox','crystal','andon','byobu'],
  dealer:  ['kart','jeep','carriage','camperbus'],
  post:    ['rankbook']
};
const SHOP_ONLY2 = {bakery:['waterdisp','chabudai'], market:['birdcage','hamcage','cattree','d_flowercart','d_topiary'], dept:['beanbag','gametv','canopybed','d_balloon'],
  library:['easel','sewing','pottery','harp'], hotel:['jukebox','crystal','andon','byobu'], dealer:['kart','jeep','carriage']};
Object.entries(SHOP_ONLY2).forEach(([b,ids]) => ids.forEach(id => { SHOP_ONLY[id] = b; (SHOPS[b].only = SHOPS[b].only || []).push(id); }));
const _catalog25 = catalog;
catalog = function(b){
  const list = _catalog25(b), have = new Set(list.map(c => c.id));
  (SHOP_EXTRA[b]||[]).forEach(id => { if(have.has(id)) return; const f = FUR(id), it = ITEM(id);
    if(f) list.push({id, kind:'fur', name:f.name, art:f.art, price:f.price, only:SHOP_ONLY[id]===b});
    else if(it && it.type==='veh') list.push({id, kind:'veh', name:it.name, art:it.art, price:it.price, only:SHOP_ONLY[id]===b});
    else if(it && it.type==='use') list.push({id, kind:'use', name:it.name, art:it.art, price:priceOf(it), only:false});
    else if(it && it.cat==='deco') list.push({id, kind:'deco', name:it.name, art:it.art, price:it.price, only:SHOP_ONLY[id]===b}); });
  list.forEach(c => c.only = SHOP_ONLY[c.id]===b);
  list.sort((a,b2) => (a.only?1:0) - (b2.only?1:0) || a.price - b2.price);
  const g = (save.town.glv||{})[SHOP_KEY] || 0, base = 4, step = Math.max(2, Math.ceil((list.length - base)/3)), avail = base + step*g;
  return list.map((c,i) => Object.assign(c, {lockG: i >= avail ? Math.min(3, Math.ceil((i + 1 - base)/step)) : 0}));
};
window.addEventListener('click', e => {
  const sb = e.target.closest('[data-sbuy^="deco:"]'); if(!sb) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const [,id,price] = sb.dataset.sbuy.split(':'), p = +price, t = save.town, it = ITEM(id);
  if(save.points.bal < p){ toast('ポイントが たりないよ'); return; }
  t.inv[id] = (t.inv[id]||0) + 1; givePts(-p, `${SHOPS[t.cells[SHOP_KEY]]?.n||'お店'}で ${it.name}を かった`); discover(id); persist(); sound('ok'); confetti(900);
  const card = sb.closest('.siIt'); card.classList.add('bought'); card.querySelector('small').textContent = 'かったよ！「もようがえ」で おいてね';
}, true);
const _shopList25 = shopList;
shopList = function(){ return _shopList25().filter(it => !SHOP_ONLY[it.id]); };

/* ---------- レア いじょうの 住民が 勉強を おうえん ---------- */
const CHEER = {
  ok:['すごい！ その ちょうし！','せいかい！ さすがだね！','やったね！ どんどん いこう！','かっこいい〜！','てんさいかも！？'],
  ng:['だいじょうぶ！ つぎは できるよ','まちがえても いいんだよ。おぼえれば つよくなる！','ドンマイ！ いっしょに がんばろ！','おしい！ あと ちょっと！'],
  combo:['れんぞく せいかい！ とまらないね！','ノリノリだね〜！','ぼくも まけて られないな！']
};
let cheerLast = 0;
function cheer(kind){
  const rs = (save.town?.res||[]).filter(r => (SP(r.sp).rar||1) >= 3 && (SP(r.sp).rar||1) <= 4 && !SP(r.sp).human && r.id !== ghosted()); if(!rs.length) return;
  const now = Date.now(); if(now - cheerLast < 9000) return;
  const p = kind==='combo' ? .7 : kind==='ng' ? .3 : .16; if(Math.random() > p) return;
  cheerLast = now;
  const r = choice(rs), R = RARITY[SP(r.sp).rar||1], line = speak(r, choice(CHEER[kind]));
  let el = $('#cheerBox'); if(!el){ document.body.insertAdjacentHTML('beforeend', '<div id="cheerBox"></div>'); el = $('#cheerBox'); }
  el.className = 'show rk'+R.k; el.innerHTML = `<span class="chPic">${resPic(r)}</span><div class="chMsg"><b>${esc(r.name)}</b>${esc(line)}</div>`;
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2800);
  if(kind!=='ng' && Math.random() < .3){ const pt = givePts(2, `${r.name}の おうえん`); setTimeout(() => toast(`📣 ${r.name}の おうえん +${pt}pt`), 600); }
}
const _mJudge25 = mJudge;
mJudge = function(v){ const was = MQ && MQ.done; const out = _mJudge25(v); if(!was){ const ok = MQ.res[MQ.res.length-1]?.ok; cheer(!ok ? 'ng' : MQ.combo >= 4 && MQ.combo % 4 === 0 ? 'combo' : 'ok'); } return out; };
const _finalize25 = finalize;
finalize = function(correct, opt={}){ const was = !cur || cur.done; const out = _finalize25(correct, opt); if(!was && S) cheer(!correct ? 'ng' : S.combo >= 4 && S.combo % 4 === 0 ? 'combo' : 'ok'); return out; };
const _engJudge25 = engJudge;
engJudge = function(r){ const ph = ES.phase; const out = _engJudge25(r); if(ph==='judge') cheer(r==='o' ? 'ok' : 'ng'); return out; };

/* =====================================================================
   わたしの家：部屋を ふやす・2かい
   ===================================================================== */
const ROOMS = [
  {id:'living', n:'リビング', fl:1, rank:0, price:0, i:'🛋️'},
  {id:'kids',   n:'こどもべや', fl:1, rank:2, price:1500, i:'🧸'},
  {id:'bed',    n:'しんしつ', fl:2, rank:3, price:3000, i:'🛏️'},
  {id:'hobby',  n:'しゅみの へや', fl:2, rank:4, price:5000, i:'🎨'},
  {id:'attic',  n:'やねうら', fl:3, rank:6, price:9000, i:'⭐'}
];
function roomData(){ const H = ensureHome(); if(!H.rooms){ H.rooms = {}; H.roomOpen = ['living']; H.roomCur = 'living'; } return H; }
function saveCurRoom(){ const H = roomData(); H.rooms[H.roomCur] = {items:H.items, wall:H.wall, floor:H.floor, g:null}; }
function switchRoom(id){
  const H = roomData(); if(id===H.roomCur) return;
  saveCurRoom();
  const R = H.rooms[id] || {items:[], wall:'cream', floor:H.floors.includes('t_f_oak') ? 't_f_oak' : 'wood'};
  H.items = R.items; H.wall = R.wall; H.floor = R.floor; H.roomCur = id;
  if(H.visit && H.visit.room && H.visit.room!==id) {} 
  homeSel = -1; homeHand = null; persist(); renderMyHome();
}
const _homeStyle25 = homeStyle;
homeStyle = () => {
  const H = roomData(); let s = _homeStyle25();
  Object.entries(H.rooms).forEach(([id,R]) => { if(id===H.roomCur || !R) return;
    s += (R.items||[]).reduce((a,i) => a + (FUR(i.id)?.sty||0) + furGradeBonus(i), 0) + (WALLS.find(w => w.id===R.wall)?.sty||0) + (FLOORS.find(w => w.id===R.floor)?.sty||0); });
  s += (H.roomOpen.length - 1) * 15;
  return s;
};
async function unlockRoom(id){
  const H = roomData(), R = ROOMS.find(x => x.id===id), r = hRank();
  if(r < R.rank){ toast(`🔒 すてき度ランク「${HRANKS[R.rank][1]}」に なると つくれるよ`); return; }
  const newFloor = !H.roomOpen.some(x => ROOMS.find(y => y.id===x).fl === R.fl);
  const ok = await dialog(`<div class="dlgArt big"><span class="roomBig">${R.i}</span></div><h2 class="dlgT">${R.fl}かいに「${R.n}」を つくる？</h2>
    <p class="dlgP">${newFloor ? `<b>${R.fl}かい</b>が できるよ！<br>` : ''}<span class="coin sm">P</span> <b>${nf(R.price)}</b>pt</p>`,
    [{label:'やめる', cls:'white', v:false}, {label:'🔨 つくる！', cls:'gold', v:true}], 'wide');
  if(!ok) return;
  if(save.points.bal < R.price){ toast('ポイントが たりないよ'); return; }
  givePts(-R.price, `わたしの家：${R.n}を つくった`); H.roomOpen.push(id); persist(); sound('fan'); confetti(2600);
  await dialog(`<div class="dlgArt big"><span class="roomBig">${newFloor ? '🏠' : R.i}</span></div><h2 class="dlgT">${newFloor ? `${R.fl}かいだてに なった！` : 'へやが ふえた！'}</h2><p class="dlgP">「${R.n}」が できたよ。すきな 家具で かざろう！<br><small>へやが ふえると すてき度 +15</small></p>`, [{label:'見に いく！', cls:'pink', v:1}], 'gold');
  switchRoom(id); checkBadges();
}
function roomBar(){
  const H = roomData(), r = hRank(), floors = [...new Set(ROOMS.map(x => x.fl))].sort((a,b) => b-a);
  const opened = new Set(H.roomOpen), maxFl = Math.max(...H.roomOpen.map(id => ROOMS.find(x => x.id===id).fl));
  return `<div class="roomBar"><div class="rbHouse">${floors.filter(f => f <= maxFl + 1).map(f => `<div class="rbFloor"><span class="rbF">${f}F</span>${ROOMS.filter(x => x.fl===f).map(x => {
      const on = x.id===H.roomCur, has = opened.has(x.id), can = r >= x.rank;
      return `<button class="rbRoom ${on?'on':''} ${has?'':'rlock'} ${!has && can?'rcan':''}" data-room="${x.id}"><i>${has ? x.i : can ? '🔨' : '🔒'}</i><span>${x.n}</span>${has ? '' : `<small>${can ? nf(x.price)+'pt' : HRANKS[x.rank][1]}</small>`}</button>`; }).join('')}</div>`).join('')}</div></div>`;
}
const _renderMyHome25 = renderMyHome;
renderMyHome = function(){
  roomData();
  _renderMyHome25();
  $('#roomBarBox')?.remove();
  $('#viewSeg').insertAdjacentHTML('beforebegin', `<div id="roomBarBox">${roomBar()}</div>`);
  const R = ROOMS.find(x => x.id===roomData().roomCur);
  const hl = $('#homeHead .hrName'); if(hl && !hl.dataset.rm){ hl.dataset.rm = 1; hl.insertAdjacentHTML('afterend', `<span class="rmNow">${R.fl}F・${R.n}</span>`); }
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-room]'); if(!b) return; e.stopImmediatePropagation();
  const H = roomData(), id = b.dataset.room;
  if(H.roomOpen.includes(id)){ if(homeEdit) endHomeEdit(true); switchRoom(id); sound('tap'); } else unlockRoom(id);
}, true);
/* おきゃくさんは リビングに */
const _maybeVisit25 = maybeVisit;
maybeVisit = function(){ const H = roomData(); if(H.roomCur !== 'living' && H.visit) return; return _maybeVisit25(); };
const _placeVisitor25 = placeVisitor;
placeVisitor = function(a){ const H = roomData(); if(H.roomCur !== 'living'){ stopVisitor(); $$('#room .visitor').forEach(e => e.remove()); return; } return _placeVisitor25(a); };
BADGES.push({id:'room3', i:'🏠', n:'3つの へや', f:()=>(save.myhome?.roomOpen||[]).length>=3}, {id:'floor2', i:'🏡', n:'2かいだて', f:()=>(save.myhome?.roomOpen||[]).some(id => ROOMS.find(x=>x.id===id)?.fl>=2)});


/* v2.6：下ナビは 見えている 画面（visualViewport）の いちばん下に 置く */
navFix = function(){
  const n = $('#bnav'); if(!n) return;
  const vv = window.visualViewport;
  const vh = vv ? vv.height : window.innerHeight, top0 = vv ? vv.offsetTop : 0, left0 = vv ? vv.offsetLeft : 0, vw = vv ? vv.width : document.documentElement.clientWidth;
  const S = (k,v) => n.style.setProperty(k, v, 'important');
  S('transform','none'); S('left', left0+'px'); S('right','auto'); S('width', vw+'px'); S('bottom','auto');
  S('top', Math.round(top0 + vh - n.offsetHeight) + 'px');
};
function navFixSoon(){ navFix(); requestAnimationFrame(navFix); [80,250,500,900,1500].forEach(t => setTimeout(navFix, t)); }
window.addEventListener('orientationchange', navFixSoon);
window.addEventListener('resize', navFixSoon);
window.addEventListener('pageshow', navFixSoon);
document.addEventListener('visibilitychange', () => { if(!document.hidden) navFixSoon(); });
if(window.visualViewport){ visualViewport.addEventListener('resize', navFix); visualViewport.addEventListener('scroll', navFix); }
window.addEventListener('scroll', navFix, {passive:true});
if(window.ResizeObserver) new ResizeObserver(navFix).observe(document.documentElement);
navFixSoon();

/* =====================================================================
   v2.7：2せんの 線路・えきの ホーム・プログラミング 100ステージ（ジャンプ・こわす）・
         えいご（こども）問題 ぞうりょう
   ===================================================================== */
/* ---------- 線路を 2せんに ---------- */
const _renderStrips26 = renderStrips;
renderStrips = function(cs, c){
  _renderStrips26(cs, c);
  const rail = $('#railStrip'); if(!rail || rail.classList.contains('hidden')) return;
  const H = Math.round(cs*1.45); rail.style.height = H + 'px';
  rail.querySelectorAll('.rails').forEach(e => e.remove());
  rail.insertAdjacentHTML('afterbegin', '<div class="rails r0"></div><div class="rails r1"></div><div class="railMid"></div>');
  const tr = [...rail.querySelectorAll('.mover.train')], n0 = Math.ceil(tr.length/2), n1 = tr.length - n0, D = 22;
  tr.forEach((el,i) => {
    const lane = i%2, k = Math.floor(i/2), n = lane ? n1 : n0;
    el.classList.add('lane'+lane); el.style.height = Math.round(cs*0.5) + 'px';
    el.style.animationDuration = D + 's'; el.style.animationDelay = `-${(k*D/Math.max(1,n) + lane*D/4).toFixed(1)}s`;
  });
};
/* ---------- えきの ホーム（Lv7） ---------- */
if(!TOWN_ITEMS.some(x => x.id==='platform')) TOWN_ITEMS.push({id:'platform', type:'bld', cat:'rail', name:'えきの ホーム', art:'bld_platform', emoji:'🚉', price:2500, lv:7, dev:60, station:3, pop:0.02});
ZUKAN_INFO.platform = '屋根つきの ホーム。電車を まつ ひとで にぎわう。';
ACT_OF.platform = 'train';

/* =====================================================================
   プログラミング：100ステージ・ジャンプ・こわす
   ===================================================================== */
const PST_NEW = [{"w":5,"h":4,"s":[2,2],"g":[0,3],"walls":[[4,1]],"water":[[1,0],[1,1],[1,2],[1,3]],"boxes":[],"gems":[[0,1]],"useJ":true,"useB":false,"best":6,"max":7,"tip":"ジャンプの まえに むきを あわせよう"},{"w":4,"h":5,"s":[0,1],"g":[1,3],"walls":[[3,3]],"water":[[0,2],[1,2],[2,2],[3,2]],"boxes":[],"gems":[],"useJ":true,"useB":false,"best":4,"max":5,"tip":"ジャンプは さいごに すすんだ むきに 2マス とぶよ"},{"w":4,"h":3,"s":[0,1],"g":[3,0],"walls":[],"water":[[1,0],[1,1],[1,2]],"boxes":[],"gems":[[3,2]],"useJ":true,"useB":false,"best":5,"max":6,"tip":"🌊 みずは あるけないよ。⤴ジャンプで とびこえよう！"},{"w":5,"h":4,"s":[1,3],"g":[4,2],"walls":[[3,2],[4,0]],"water":[[3,0],[3,1],[3,3]],"boxes":[],"gems":[[1,2]],"useJ":true,"useB":false,"best":5,"max":6,"tip":"ジャンプは さいごに すすんだ むきに 2マス とぶよ"},{"w":5,"h":5,"s":[1,2],"g":[3,3],"walls":[[4,2]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4]],"boxes":[],"gems":[[3,4]],"useJ":true,"useB":false,"best":4,"max":5,"tip":"ジャンプは さいごに すすんだ むきに 2マス とぶよ"},{"w":4,"h":3,"s":[0,1],"g":[2,0],"walls":[[1,2]],"water":[[1,0],[1,1]],"boxes":[],"gems":[[3,2]],"useJ":true,"useB":false,"best":6,"max":7,"tip":"ジャンプは さいごに すすんだ むきに 2マス とぶよ"},{"w":4,"h":3,"s":[3,1],"g":[0,1],"walls":[[1,1]],"water":[[1,0],[1,2]],"boxes":[],"gems":[[2,2]],"useJ":true,"useB":false,"best":4,"max":5,"tip":"ジャンプは さいごに すすんだ むきに 2マス とぶよ"},{"w":5,"h":5,"s":[0,2],"g":[4,4],"walls":[[0,1]],"water":[[1,0],[1,1],[1,2],[1,3],[1,4]],"boxes":[],"gems":[[2,0]],"useJ":true,"useB":false,"best":8,"max":9,"tip":"🌊 みずは あるけないよ。⤴ジャンプで とびこえよう！"},{"w":4,"h":3,"s":[2,1],"g":[0,1],"walls":[[1,0]],"water":[[1,1],[1,2]],"boxes":[],"gems":[[3,2]],"useJ":true,"useB":false,"best":5,"max":6,"tip":"🌊 みずは あるけないよ。⤴ジャンプで とびこえよう！"},{"w":5,"h":3,"s":[1,2],"g":[3,2],"walls":[[2,1]],"water":[[2,0],[2,2]],"boxes":[],"gems":[[3,0]],"useJ":true,"useB":false,"best":5,"max":6,"tip":"ジャンプは さいごに すすんだ むきに 2マス とぶよ"},{"w":5,"h":3,"s":[4,1],"g":[0,0],"walls":[[4,2]],"water":[[1,0],[1,1],[1,2]],"boxes":[],"gems":[],"useJ":true,"useB":false,"best":4,"max":5,"tip":"ジャンプの まえに むきを あわせよう"},{"w":4,"h":4,"s":[2,2],"g":[0,0],"walls":[[2,0]],"water":[[1,0],[1,1],[1,2],[1,3]],"boxes":[],"gems":[],"useJ":true,"useB":false,"best":5,"max":6,"tip":"ジャンプは さいごに すすんだ むきに 2マス とぶよ"},{"w":6,"h":3,"s":[5,2],"g":[0,0],"walls":[[1,2],[5,0]],"water":[[1,0],[1,1]],"boxes":[],"gems":[[0,2]],"useJ":true,"useB":false,"best":7,"max":8,"tip":"🌊 みずは あるけないよ。⤴ジャンプで とびこえよう！"},{"w":6,"h":4,"s":[0,3],"g":[5,0],"walls":[[4,0],[3,2]],"water":[[4,1],[4,2],[4,3]],"boxes":[],"gems":[],"useJ":true,"useB":false,"best":5,"max":6,"tip":"ジャンプは さいごに すすんだ むきに 2マス とぶよ"},{"w":5,"h":5,"s":[0,3],"g":[4,3],"walls":[[2,1],[2,2],[2,3],[2,4],[1,2]],"water":[],"boxes":[[2,0]],"gems":[[4,1]],"useJ":false,"useB":true,"best":9,"max":12,"tip":"はこを こわして みちを つくろう"},{"w":5,"h":4,"s":[2,3],"g":[4,3],"walls":[[3,0],[3,1],[3,2],[1,3]],"water":[],"boxes":[[3,3]],"gems":[[0,2]],"useJ":false,"useB":true,"best":9,"max":10,"tip":"はこを こわして みちを つくろう"},{"w":5,"h":6,"s":[1,0],"g":[0,3],"walls":[[0,2],[2,2],[3,2],[4,2],[0,4],[3,0]],"water":[],"boxes":[[1,2]],"gems":[[3,5]],"useJ":false,"useB":true,"best":10,"max":14,"tip":"はこを こわして みちを つくろう"},{"w":5,"h":6,"s":[0,4],"g":[0,0],"walls":[[2,3],[3,3],[4,3],[1,0],[4,4]],"water":[],"boxes":[[0,3],[1,3]],"gems":[],"useJ":false,"useB":true,"best":5,"max":8,"tip":"📦 はこは 🔨こわすで こわせるよ！"},{"w":5,"h":6,"s":[4,5],"g":[1,0],"walls":[[1,1],[3,1],[4,1],[2,5],[3,2]],"water":[],"boxes":[[0,1],[2,1]],"gems":[[0,4]],"useJ":false,"useB":true,"best":9,"max":12,"tip":"こわすは むいている ほうの はこを こわすよ"},{"w":5,"h":4,"s":[4,0],"g":[1,3],"walls":[[2,1],[2,2],[2,3],[4,1]],"water":[],"boxes":[[2,0]],"gems":[],"useJ":false,"useB":true,"best":6,"max":8,"tip":"こわすは むいている ほうの はこを こわすよ"},{"w":5,"h":5,"s":[4,3],"g":[0,3],"walls":[[2,0],[2,1],[2,4],[1,4],[3,0]],"water":[],"boxes":[[2,2],[2,3]],"gems":[[3,2]],"useJ":false,"useB":true,"best":7,"max":8,"tip":"📦 はこは 🔨こわすで こわせるよ！"},{"w":5,"h":5,"s":[3,1],"g":[0,4],"walls":[[2,1],[2,2],[2,3],[2,4],[4,2],[3,2]],"water":[],"boxes":[[2,0]],"gems":[[1,3],[3,0]],"useJ":false,"useB":true,"best":9,"max":12,"tip":"はこを こわして みちを つくろう"},{"w":6,"h":5,"s":[1,2],"g":[5,4],"walls":[[4,1],[4,2],[4,3],[1,4],[5,3]],"water":[],"boxes":[[4,0],[4,4]],"gems":[],"useJ":false,"useB":true,"best":6,"max":8,"tip":"📦 はこは 🔨こわすで こわせるよ！"},{"w":6,"h":5,"s":[4,4],"g":[0,2],"walls":[[3,1],[3,3],[3,4],[1,1],[0,1]],"water":[],"boxes":[[3,0],[3,2]],"gems":[[2,1],[2,3]],"useJ":false,"useB":true,"best":13,"max":14,"tip":"こわすは むいている ほうの はこを こわすよ"},{"w":7,"h":4,"s":[6,0],"g":[1,0],"walls":[[2,0],[2,2],[3,2],[3,1]],"water":[],"boxes":[[2,1],[2,3]],"gems":[[3,0],[4,0]],"useJ":false,"useB":true,"best":11,"max":15,"tip":"はこを こわして みちを つくろう"},{"w":7,"h":6,"s":[1,0],"g":[5,2],"walls":[[2,1],[2,2],[2,3],[2,4],[4,0],[0,1],[0,5],[1,3]],"water":[],"boxes":[[2,0],[2,5]],"gems":[[4,1]],"useJ":false,"useB":true,"best":6,"max":8,"tip":"こわすは むいている ほうの はこを こわすよ"},{"w":6,"h":6,"s":[4,1],"g":[0,2],"walls":[[2,0],[2,1],[2,2],[2,5],[4,2],[0,4],[5,2]],"water":[],"boxes":[[2,3],[2,4]],"gems":[],"useJ":false,"useB":true,"best":10,"max":11,"tip":"📦 はこは 🔨こわすで こわせるよ！"},{"w":6,"h":5,"s":[0,1],"g":[4,3],"walls":[[2,0],[2,1],[2,4],[5,1],[5,4],[0,3]],"water":[],"boxes":[[2,2],[2,3]],"gems":[[3,4]],"useJ":false,"useB":true,"best":9,"max":10,"tip":"📦 はこは 🔨こわすで こわせるよ！"},{"w":7,"h":6,"s":[6,2],"g":[0,3],"walls":[[2,1],[3,1],[3,2],[3,3],[3,5],[5,1],[6,3],[1,1]],"water":[[2,0],[2,2],[2,3],[2,4],[2,5]],"boxes":[[3,0],[3,4]],"gems":[[5,2]],"useJ":true,"useB":true,"best":9,"max":10,"tip":"よく 見て じゅんばんを かんがえよう"},{"w":6,"h":5,"s":[0,1],"g":[5,4],"walls":[[4,0],[4,2],[4,3],[4,4],[1,0],[5,0]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4]],"boxes":[[4,1]],"gems":[[3,2]],"useJ":true,"useB":true,"best":9,"max":10,"tip":"ジャンプと こわすを つかいわけよう！"},{"w":7,"h":5,"s":[5,4],"g":[1,2],"walls":[[2,4],[3,0],[3,2],[3,3],[3,4],[0,3],[4,0],[4,4]],"water":[[2,0],[2,1],[2,2],[2,3]],"boxes":[[3,1]],"gems":[[5,1],[4,3]],"useJ":true,"useB":true,"best":10,"max":11,"tip":"🌊は ジャンプ、📦は こわす！"},{"w":6,"h":6,"s":[4,3],"g":[0,0],"walls":[[2,0],[2,1],[2,2],[2,3],[2,4],[5,0],[3,3],[5,3]],"water":[[1,0],[1,1],[1,2],[1,3],[1,4],[1,5]],"boxes":[[2,5]],"gems":[],"useJ":true,"useB":true,"best":9,"max":10,"tip":"よく 見て じゅんばんを かんがえよう"},{"w":7,"h":7,"s":[6,4],"g":[1,6],"walls":[[2,6],[3,0],[3,1],[3,2],[3,3],[3,4],[3,6],[6,3],[1,2],[5,4],[0,3]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5]],"boxes":[[3,5]],"gems":[[6,5]],"useJ":true,"useB":true,"best":7,"max":8,"tip":"ジャンプと こわすを つかいわけよう！"},{"w":6,"h":5,"s":[4,0],"g":[0,4],"walls":[[1,4],[2,0],[2,1],[2,3],[2,4],[3,4],[5,2]],"water":[[1,0],[1,1],[1,2],[1,3]],"boxes":[[2,2]],"gems":[[5,1]],"useJ":true,"useB":true,"best":10,"max":11,"tip":"🌊は ジャンプ、📦は こわす！"},{"w":6,"h":5,"s":[4,4],"g":[1,1],"walls":[[3,2],[3,3],[3,4],[1,2],[5,1]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4]],"boxes":[[3,0],[3,1]],"gems":[[1,4],[5,3]],"useJ":true,"useB":true,"best":19,"max":20,"tip":"ジャンプと こわすを つかいわけよう！"},{"w":7,"h":6,"s":[5,2],"g":[0,1],"walls":[[4,0],[4,1],[4,3],[4,4],[4,5],[6,3],[6,0],[0,5],[0,4]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5]],"boxes":[[4,2]],"gems":[[3,1]],"useJ":true,"useB":true,"best":11,"max":12,"tip":"よく 見て じゅんばんを かんがえよう"},{"w":7,"h":5,"s":[6,2],"g":[0,2],"walls":[[3,1],[3,2],[3,3],[1,1],[5,1],[4,2]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4]],"boxes":[[3,0],[3,4]],"gems":[[6,0]],"useJ":true,"useB":true,"best":10,"max":11,"tip":"よく 見て じゅんばんを かんがえよう"},{"w":8,"h":6,"s":[3,4],"g":[7,4],"walls":[[6,0],[6,1],[6,3],[6,4],[6,5],[1,2],[0,4],[5,0],[3,1],[2,1]],"water":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5]],"boxes":[[6,2]],"gems":[[3,2],[5,4]],"useJ":true,"useB":true,"best":14,"max":15,"tip":"🌊は ジャンプ、📦は こわす！"},{"w":7,"h":6,"s":[6,3],"g":[0,2],"walls":[[3,2],[4,0],[4,1],[4,2],[4,3],[5,1],[2,0],[1,3],[1,5]],"water":[[3,0],[3,1],[3,3],[3,4],[3,5]],"boxes":[[4,4],[4,5]],"gems":[],"useJ":true,"useB":true,"best":8,"max":9,"tip":"よく 見て じゅんばんを かんがえよう"},{"w":7,"h":5,"s":[1,0],"g":[6,3],"walls":[[4,0],[4,1],[4,2],[4,3],[6,0],[5,0],[3,1]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4]],"boxes":[[4,4]],"gems":[[1,1],[3,2]],"useJ":true,"useB":true,"best":14,"max":15,"tip":"よく 見て じゅんばんを かんがえよう"},{"w":7,"h":6,"s":[5,1],"g":[0,3],"walls":[[2,0],[2,1],[2,2],[2,4],[6,0],[3,4],[3,2],[5,4]],"water":[[1,0],[1,1],[1,2],[1,3],[1,4],[1,5]],"boxes":[[2,3],[2,5]],"gems":[[4,5],[0,2]],"useJ":true,"useB":true,"best":11,"max":12,"tip":"よく 見て じゅんばんを かんがえよう"},{"w":7,"h":6,"s":[4,1],"g":[1,4],"walls":[[3,0],[3,1],[3,4],[3,5],[4,4],[6,0],[1,0],[0,0]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5]],"boxes":[[3,2],[3,3]],"gems":[[6,4],[0,5]],"useJ":true,"useB":true,"best":14,"max":15,"tip":"ジャンプと こわすを つかいわけよう！"},{"w":7,"h":6,"s":[6,4],"g":[1,5],"walls":[[4,2],[5,1],[2,0],[0,4],[6,3],[0,5]],"water":[],"boxes":[],"gems":[[1,2],[3,5]],"useJ":false,"useB":false,"best":9,"max":10,"tip":"おなじ うごきを さがしてみよう"},{"w":8,"h":8,"s":[6,0],"g":[0,5],"walls":[[1,6],[5,6],[2,0],[7,2],[5,3],[6,7],[3,2],[3,7],[4,2],[4,3]],"water":[],"boxes":[],"gems":[],"useJ":false,"useB":false,"best":4,"max":5,"tip":"🔁 くりかえしで ブロックを へらそう！"},{"w":7,"h":6,"s":[6,4],"g":[1,5],"walls":[[2,2],[4,1],[2,3],[4,3],[5,5],[1,2]],"water":[],"boxes":[],"gems":[[3,2],[0,0],[5,2]],"useJ":false,"useB":false,"best":11,"max":12,"tip":"🔁 くりかえしで ブロックを へらそう！"},{"w":7,"h":7,"s":[2,1],"g":[6,6],"walls":[[5,3],[1,4],[4,4],[0,4],[4,1],[1,2],[5,0]],"water":[],"boxes":[],"gems":[],"useJ":false,"useB":false,"best":4,"max":5,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":6,"s":[0,0],"g":[5,1],"walls":[[2,5],[0,3],[2,2],[5,3],[5,0],[6,0],[6,3]],"water":[],"boxes":[],"gems":[[0,5],[4,3],[1,0]],"useJ":false,"useB":false,"best":12,"max":13,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":8,"s":[1,3],"g":[7,4],"walls":[[5,0],[2,1],[2,7],[3,6],[1,6],[3,2],[6,4],[7,1],[2,3],[4,3]],"water":[],"boxes":[],"gems":[],"useJ":false,"useB":false,"best":5,"max":6,"tip":"おなじ うごきを さがしてみよう"},{"w":8,"h":7,"s":[3,3],"g":[7,4],"walls":[[3,6],[1,5],[2,6],[5,6],[6,4],[3,5],[3,4],[7,2],[4,4]],"water":[],"boxes":[],"gems":[[1,4],[5,1],[3,1]],"useJ":false,"useB":false,"best":12,"max":13,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":7,"s":[3,4],"g":[7,0],"walls":[[7,4],[2,1],[4,1],[1,1],[0,0],[0,5],[7,6],[3,6],[5,5]],"water":[],"boxes":[],"gems":[[0,1]],"useJ":false,"useB":false,"best":12,"max":13,"tip":"おなじ うごきを さがしてみよう"},{"w":8,"h":7,"s":[2,4],"g":[7,5],"walls":[[3,0],[3,6],[7,3],[2,1],[0,3],[7,4],[7,6],[0,1],[0,2]],"water":[],"boxes":[],"gems":[[4,2],[4,6],[1,6]],"useJ":false,"useB":false,"best":12,"max":13,"tip":"🔁 くりかえしで ブロックを へらそう！"},{"w":8,"h":6,"s":[5,5],"g":[3,0],"walls":[[2,2],[3,1],[1,0],[3,3],[6,4],[2,0],[6,0],[1,2]],"water":[],"boxes":[],"gems":[[7,1],[6,2],[4,2]],"useJ":false,"useB":false,"best":10,"max":11,"tip":"おなじ うごきを さがしてみよう"},{"w":8,"h":8,"s":[6,1],"g":[2,7],"walls":[[6,7],[4,2],[1,5],[3,5],[1,0],[7,2],[3,4],[7,0],[0,7],[2,2],[2,4]],"water":[],"boxes":[],"gems":[[0,5]],"useJ":false,"useB":false,"best":10,"max":11,"tip":"🔁 くりかえしで ブロックを へらそう！"},{"w":8,"h":6,"s":[0,5],"g":[7,2],"walls":[[5,5],[0,0],[6,1],[0,4],[2,1],[0,2],[3,5],[6,5]],"water":[],"boxes":[],"gems":[],"useJ":false,"useB":false,"best":5,"max":6,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":6,"s":[7,2],"g":[2,2],"walls":[[2,5],[6,2],[7,0],[1,2],[0,2],[2,4],[4,4],[7,4]],"water":[],"boxes":[],"gems":[[5,5],[0,3],[7,5]],"useJ":false,"useB":false,"best":14,"max":15,"tip":"おなじ うごきを さがしてみよう"},{"w":8,"h":7,"s":[7,5],"g":[1,0],"walls":[[0,6],[3,3],[4,2],[1,5],[2,1],[5,2],[7,3],[3,5],[4,5],[7,6]],"water":[],"boxes":[],"gems":[],"useJ":false,"useB":false,"best":6,"max":7,"tip":"🔁 くりかえしで ブロックを へらそう！"},{"w":8,"h":8,"s":[6,6],"g":[1,5],"walls":[[2,0],[3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[7,7],[1,1],[1,3],[0,1],[0,7],[6,7],[5,3],[4,0]],"water":[[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7]],"boxes":[[3,7]],"gems":[[6,5],[5,1]],"useJ":true,"useB":true,"best":15,"max":17,"tip":"ジャンプと こわすを つかいわけよう！"},{"w":8,"h":7,"s":[6,6],"g":[3,2],"walls":[[7,6],[1,6],[5,5],[2,4],[7,5],[6,1],[0,4],[5,2],[6,0],[7,4]],"water":[],"boxes":[],"gems":[[0,2]],"useJ":false,"useB":false,"best":9,"max":10,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":7,"s":[6,5],"g":[0,0],"walls":[[4,4],[5,0],[5,1],[5,2],[5,4],[5,5],[5,6],[7,6],[7,5],[3,5],[6,6],[3,1],[1,3],[0,1]],"water":[[4,0],[4,1],[4,2],[4,3],[4,5],[4,6]],"boxes":[[5,3]],"gems":[[1,2],[2,4]],"useJ":true,"useB":true,"best":13,"max":14,"tip":"さいごまで あきらめないで！"},{"w":8,"h":8,"s":[5,0],"g":[3,1],"walls":[[0,7],[1,4],[3,4],[1,1],[6,7],[2,7],[3,2],[5,4],[4,3],[4,0],[0,0],[2,6]],"water":[],"boxes":[],"gems":[[7,4],[4,4],[2,2]],"useJ":false,"useB":false,"best":14,"max":15,"tip":"おなじ うごきを さがしてみよう"},{"w":8,"h":8,"s":[7,0],"g":[0,6],"walls":[[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[0,1],[2,1],[2,0],[2,7],[1,7],[0,0],[3,4],[1,1],[1,3]],"water":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7]],"boxes":[[5,0]],"gems":[[6,4],[7,5],[0,2]],"useJ":true,"useB":true,"best":16,"max":17,"tip":"さいごまで あきらめないで！"},{"w":8,"h":8,"s":[7,0],"g":[3,7],"walls":[[5,0],[5,1],[5,2],[5,4],[5,5],[5,6],[3,1],[2,0],[0,7],[7,4],[6,5],[0,5],[0,0],[6,1],[3,6]],"water":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7]],"boxes":[[5,3],[5,7]],"gems":[[2,2],[0,1]],"useJ":true,"useB":true,"best":15,"max":16,"tip":"さいごまで あきらめないで！"},{"w":8,"h":7,"s":[7,0],"g":[2,1],"walls":[[5,0],[5,1],[5,3],[5,4],[5,5],[5,6],[7,3],[2,4],[6,1],[0,2],[0,3],[3,6],[3,5],[3,0]],"water":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6]],"boxes":[[5,2]],"gems":[[6,2],[0,1],[6,3]],"useJ":true,"useB":true,"best":11,"max":12,"tip":"ぜんぶの わざを つかう むずかしい ステージ！"},{"w":8,"h":8,"s":[7,7],"g":[0,0],"walls":[[4,5],[5,1],[5,2],[5,3],[5,4],[5,5],[5,7],[0,7],[0,6],[3,4],[1,1],[1,0],[1,2],[2,0],[7,5],[6,5]],"water":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,6],[4,7]],"boxes":[[5,0],[5,6]],"gems":[],"useJ":true,"useB":true,"best":9,"max":10,"tip":"ぜんぶの わざを つかう むずかしい ステージ！"},{"w":8,"h":7,"s":[7,5],"g":[1,0],"walls":[[5,0],[5,1],[5,2],[5,5],[5,6],[3,3],[3,6],[0,4],[2,5],[0,0],[2,6],[7,3],[0,2]],"water":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6]],"boxes":[[5,3],[5,4]],"gems":[[2,2],[1,2]],"useJ":true,"useB":true,"best":9,"max":10,"tip":"ぜんぶの わざを つかう むずかしい ステージ！"},{"w":8,"h":8,"s":[6,7],"g":[1,0],"walls":[[3,0],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[1,6],[4,3],[7,3],[5,5],[0,6],[4,5],[7,2],[6,5],[1,3]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7]],"boxes":[[3,1]],"gems":[],"useJ":true,"useB":true,"best":10,"max":11,"tip":"ぜんぶの わざを つかう むずかしい ステージ！"},{"w":8,"h":7,"s":[5,0],"g":[3,3],"walls":[[4,2],[0,5],[4,0],[7,2],[5,3],[6,5],[6,1],[1,0],[0,6],[1,3]],"water":[],"boxes":[],"gems":[[3,0],[3,1],[7,3]],"useJ":false,"useB":false,"best":12,"max":13,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":7,"s":[2,6],"g":[7,4],"walls":[[1,5],[0,0],[5,0],[7,5],[3,2],[1,4],[7,3],[5,2],[7,1],[4,4]],"water":[],"boxes":[],"gems":[[7,6],[6,0],[4,3]],"useJ":false,"useB":false,"best":14,"max":15,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":8,"s":[6,6],"g":[3,1],"walls":[[2,0],[5,6],[0,0],[2,5],[7,6],[7,7],[7,4],[1,4],[6,5],[4,2],[2,6],[5,1]],"water":[],"boxes":[],"gems":[[3,4],[3,6]],"useJ":false,"useB":false,"best":7,"max":8,"tip":"おなじ うごきを さがしてみよう"},{"w":8,"h":8,"s":[2,7],"g":[7,1],"walls":[[0,4],[3,4],[0,3],[7,3],[3,1],[3,2],[5,7],[0,7],[6,6],[4,0],[0,5],[4,1]],"water":[],"boxes":[],"gems":[[4,4],[1,0],[1,6]],"useJ":false,"useB":false,"best":14,"max":15,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":8,"s":[7,1],"g":[3,3],"walls":[[5,0],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[7,2],[3,0],[6,7],[0,4],[3,2],[0,7],[0,1],[2,4],[2,2]],"water":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7]],"boxes":[[5,1]],"gems":[],"useJ":true,"useB":true,"best":9,"max":10,"tip":"🌊は ジャンプ、📦は こわす！"},{"w":8,"h":8,"s":[6,6],"g":[0,4],"walls":[[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[7,4],[1,5],[0,7],[3,5],[2,2],[2,0],[6,0],[6,5],[1,0]],"water":[[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7]],"boxes":[[5,7]],"gems":[],"useJ":true,"useB":true,"best":9,"max":10,"tip":"ぜんぶの わざを つかう むずかしい ステージ！"},{"w":8,"h":8,"s":[5,6],"g":[0,7],"walls":[[1,0],[2,0],[2,1],[2,2],[2,3],[2,4],[2,7],[6,1],[3,1],[0,0],[0,2],[3,4],[5,2],[7,4],[5,7],[3,2]],"water":[[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7]],"boxes":[[2,5],[2,6]],"gems":[[6,3],[5,3],[7,2]],"useJ":true,"useB":true,"best":15,"max":16,"tip":"よく 見て じゅんばんを かんがえよう"},{"w":8,"h":8,"s":[6,7],"g":[2,5],"walls":[[3,1],[4,0],[4,3],[4,4],[4,5],[4,6],[4,7],[7,1],[0,1],[2,4],[6,3],[5,3],[5,1],[1,6],[1,4],[5,7]],"water":[[3,0],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7]],"boxes":[[4,1],[4,2]],"gems":[[1,2]],"useJ":true,"useB":true,"best":15,"max":16,"tip":"ジャンプと こわすを つかいわけよう！"},{"w":8,"h":8,"s":[5,7],"g":[0,6],"walls":[[3,0],[3,1],[3,2],[3,3],[3,5],[3,7],[7,5],[1,4],[1,7],[6,7],[7,6],[1,0],[0,2],[0,7],[5,1]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7]],"boxes":[[3,4],[3,6]],"gems":[[6,0],[4,1],[6,2]],"useJ":true,"useB":true,"best":15,"max":16,"tip":"さいごまで あきらめないで！"},{"w":8,"h":8,"s":[5,4],"g":[0,7],"walls":[[3,2],[7,7],[1,3],[1,5],[1,4],[4,5],[4,3],[6,7],[7,1],[7,4],[1,1],[5,2]],"water":[],"boxes":[],"gems":[[3,3],[3,1]],"useJ":false,"useB":false,"best":11,"max":12,"tip":"🔁 くりかえしで ブロックを へらそう！"},{"w":8,"h":8,"s":[5,0],"g":[3,3],"walls":[[7,6],[7,5],[0,0],[1,4],[4,7],[6,1],[6,6],[3,1],[4,0],[6,4],[7,0],[6,5]],"water":[],"boxes":[],"gems":[[6,7],[3,6],[3,7]],"useJ":false,"useB":false,"best":10,"max":11,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":8,"s":[5,7],"g":[1,2],"walls":[[3,0],[3,1],[3,2],[3,4],[3,6],[3,7],[4,1],[4,3],[6,2],[4,0],[7,4],[7,5],[4,4],[0,3],[0,0]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7]],"boxes":[[3,3],[3,5]],"gems":[[7,3],[5,2],[7,1]],"useJ":true,"useB":true,"best":18,"max":19,"tip":"ジャンプと こわすを つかいわけよう！"},{"w":8,"h":8,"s":[5,5],"g":[2,7],"walls":[[5,7],[7,2],[7,5],[4,4],[4,6],[2,0],[3,4],[1,1],[1,6],[4,3],[3,7],[2,1]],"water":[],"boxes":[],"gems":[[6,4],[0,5],[6,2]],"useJ":false,"useB":false,"best":11,"max":12,"tip":"くりかえしの 中に いくつも 入れられるよ"},{"w":8,"h":8,"s":[6,7],"g":[0,7],"walls":[[3,3],[5,0],[5,2],[5,3],[5,4],[5,5],[5,6],[7,5],[6,3],[0,6],[1,3],[4,6],[4,3],[6,4],[6,1],[2,4]],"water":[[3,0],[3,1],[3,2],[3,4],[3,5],[3,6],[3,7]],"boxes":[[5,1],[5,7]],"gems":[[4,2],[2,3],[2,2]],"useJ":true,"useB":true,"best":28,"max":29,"tip":"さいごまで あきらめないで！"},{"w":8,"h":8,"s":[5,0],"g":[0,5],"walls":[[3,0],[3,1],[3,3],[3,4],[3,5],[3,6],[3,7],[0,0],[5,7],[6,6],[0,7],[1,4],[4,0],[7,6],[0,1],[4,6]],"water":[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7]],"boxes":[[3,2]],"gems":[[4,1]],"useJ":true,"useB":true,"best":11,"max":12,"tip":"よく 見て じゅんばんを かんがえよう"},{"w":8,"h":8,"s":[5,1],"g":[0,4],"walls":[[0,6],[1,7],[4,4],[2,4],[6,2],[6,4],[3,5],[6,6],[2,7],[2,5],[0,2],[7,0]],"water":[],"boxes":[],"gems":[[7,2]],"useJ":false,"useB":false,"best":8,"max":9,"tip":"🔁 くりかえしで ブロックを へらそう！"},{"w":8,"h":8,"s":[0,7],"g":[5,6],"walls":[[0,1],[3,5],[6,3],[2,5],[1,4],[0,3],[7,7],[0,5],[4,6],[2,4],[6,7],[4,2]],"water":[],"boxes":[],"gems":[[6,2],[4,4]],"useJ":false,"useB":false,"best":12,"max":13,"tip":"おなじ うごきを さがしてみよう"},{"w":8,"h":8,"s":[3,0],"g":[0,1],"walls":[[2,0],[2,2],[2,3],[2,4],[2,5],[2,7],[4,2],[6,3],[6,5],[6,7],[4,7],[6,6],[5,4],[5,5],[7,3]],"water":[[1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7]],"boxes":[[2,1],[2,6]],"gems":[[3,6]],"useJ":true,"useB":true,"best":12,"max":13,"tip":"よく 見て じゅんばんを かんがえよう"}];
PST_NEW.forEach(s => { if(PSTAGES.length < 100) PSTAGES.push(s); });
DARROW.J = '⤴'; DARROW.B = '🔨';
parseSol = function(s){ const out = []; const re = /(\d+)\(([^)]*)\)|([UDLRJB])/g; let m; while((m = re.exec(s))){ if(m[1]) out.push({t:'loop', n:+m[1], body:m[2].trim().split(/\s+/).map(t => ({t}))}); else out.push({t:m[3]}); } return out; };
pSim = function(st, steps){
  let [x,y] = st.s, f = 'R';
  const gems = new Set((st.gems||[]).map(g => g.join())), walls = new Set((st.walls||[]).map(w => w.join())), water = new Set((st.water||[]).map(w => w.join())), boxes = new Set((st.boxes||[]).map(w => w.join()));
  const path = [[x,y]], ev = [null], inb = (a,b) => a>=0 && b>=0 && a<st.w && b<st.h;
  const free = (a,b) => inb(a,b) && !walls.has(a+','+b) && !water.has(a+','+b) && !boxes.has(a+','+b);
  for(const d of steps){
    if(d==='B'){ const [dx,dy] = DIRV[f], k = (x+dx)+','+(y+dy); if(boxes.has(k)){ boxes.delete(k); path.push([x,y]); ev.push({brk:k}); } else { path.push([x,y]); ev.push({miss:1}); } continue; }
    if(d==='J'){ const [dx,dy] = DIRV[f], mx = x+dx, my = y+dy, nx = x+2*dx, ny = y+2*dy;
      if(!inb(mx,my) || walls.has(mx+','+my)) return {ok:false, path, ev, crash:[mx,my], why:'いわが 高くて とびこえられない！'};
      if(!free(nx,ny)) return {ok:false, path, ev, crash:[nx,ny], why: water.has(nx+','+ny) ? 'みずに おちちゃった！' : 'ちゃくちできない！'};
      x = nx; y = ny; gems.delete(x+','+y); path.push([x,y]); ev.push({jump:1}); continue; }
    const [dx,dy] = DIRV[d], nx = x+dx, ny = y+dy; f = d;
    if(!free(nx,ny)){ const k = nx+','+ny;
      return {ok:false, path, ev, crash:[nx,ny], why: water.has(k) ? 'みずに おちちゃった！ ⤴ジャンプで とぼう' : boxes.has(k) ? 'はこが じゃま！ 🔨こわすを つかおう' : walls.has(k) ? 'いわに ぶつかった！' : 'そとに 出ちゃった！'}; }
    x = nx; y = ny; gems.delete(x+','+y); path.push([x,y]); ev.push(null);
  }
  const goal = x===st.g[0] && y===st.g[1];
  return {ok: goal && !gems.size, path, ev, why: !goal ? 'ゴールに とどかなかった…' : 'まだ 💎が のこっているよ'};
};
boardHTML = function(st, pos, fx={}){
  const walls = new Set((st.walls||[]).map(w => w.join())), gems = new Set((st.gems||[]).map(g => g.join())), water = new Set((st.water||[]).map(w => w.join())), boxes = new Set((st.boxes||[]).map(w => w.join()));
  const got = fx.got || new Set(), brk = fx.brk || new Set();
  const cs = Math.min(64, Math.floor(Math.min(340, innerWidth - 60) / Math.max(st.w, 4)));
  let h = `<div class="pBoard" style="grid-template-columns:repeat(${st.w},${cs}px);--pc:${cs}px">`;
  for(let y=0;y<st.h;y++) for(let x=0;x<st.w;x++){ const k = x+','+y;
    h += `<div class="pCell ${(x+y)%2?'a':'b'} ${water.has(k)?'wat':''}">${walls.has(k)?'<span class="pRock">🪨</span>':''}${boxes.has(k)&&!brk.has(k)?'<span class="pBox">📦</span>':''}${water.has(k)?'<span class="pWat">🌊</span>':''}${gems.has(k)&&!got.has(k)?'<span class="pGem">💎</span>':''}${st.g[0]===x&&st.g[1]===y?'<span class="pGoal">🏁</span>':''}</div>`; }
  const [px,py] = pos; h += `<img class="pBird" id="pBird" src="${esc(artSrc('bird_wave'))}" style="left:${px*cs}px;top:${py*cs}px;width:${cs}px">`;
  return h + '</div>';
};
const _renderStage26 = renderStage;
renderStage = function(){
  _renderStage26();
  const st = PSTAGES[PG.stage], pal = $('.pPal'); if(!pal) return;
  const loop = pal.querySelector('[data-k="loop"]');
  if(st.useJ || PG.stage >= 16) loop.insertAdjacentHTML('beforebegin', `<button class="pKey act ${st.useJ?'':'dim'}" data-k="J">⤴<small>ジャンプ</small></button>`);
  if(st.useB || PG.stage >= 30) loop.insertAdjacentHTML('beforebegin', `<button class="pKey act ${st.useB?'':'dim'}" data-k="B">🔨<small>こわす</small></button>`);
  if(PG.stage >= 16 && !$('#pLegend')) $('.pWrap').insertAdjacentHTML('afterend', `<div id="pLegend" class="pLegend"><span>🪨 とおれない</span><span>🌊 ジャンプで こえる</span><span>📦 こわせる</span><span>👉 ジャンプ・こわすは さいごに うごいた むき（さいしょは ➡）</span></div>`);
};
runProg = async function(){
  const st = PSTAGES[PG.stage], steps = pFlat(PG.prog);
  if(!steps.length){ toast('ブロックを ならべてね'); return; }
  if(pCount(PG.prog) > st.max){ $('#pMsg').innerHTML = `<span class="ngTxt">ブロックが ${st.max}こ より 多いよ。🔁を つかって へらそう</span>`; return; }
  PG.running = true; PG.open = -1;
  const r = pSim(st, steps), got = new Set(), brk = new Set(), cs = parseFloat(getComputedStyle($('.pBoard')).getPropertyValue('--pc'));
  for(let i=1;i<r.path.length;i++){ const [x,y] = r.path[i], gk = x+','+y, e = r.ev[i];
    let redraw = false;
    if((st.gems||[]).some(g => g.join()===gk) && !got.has(gk)){ got.add(gk); redraw = true; }
    if(e && e.brk){ brk.add(e.brk); redraw = true; }
    if(redraw) $('#pBoardBox').innerHTML = boardHTML(st, r.path[i-1], {got, brk});
    const bird = $('#pBird'); void bird.offsetWidth;
    if(e && e.jump){ bird.classList.remove('jmp'); void bird.offsetWidth; bird.classList.add('jmp'); }
    if(e && (e.brk || e.miss)){ bird.classList.remove('hit'); void bird.offsetWidth; bird.classList.add('hit'); }
    bird.style.left = x*cs+'px'; bird.style.top = y*cs+'px'; sound(e && e.brk ? 'ok' : 'tap');
    await new Promise(z => setTimeout(z, e && e.jump ? 460 : 340)); }
  if(r.crash){ $('#pBird').classList.add('crash'); }
  PG.running = false;
  if(!r.ok){ sound('ng'); $('#pMsg').innerHTML = `<span class="ngTxt">😵 ${r.why}</span> <button class="btn small white" data-pa="retry">もういちど</button>`; return; }
  const n = pCount(PG.prog), best = st.best ?? (st.max - (st.slack||0)), stars = n <= best ? 3 : n <= best + 1 ? 2 : 1;
  const P = pData(), prev = P.stars[PG.stage]||0; P.stars[PG.stage] = Math.max(prev, stars);
  let pt = 0; if(!prev) pt += 30 + Math.floor(PG.stage/10)*5; if(stars > prev) pt += (stars - prev)*10;
  if(pt) pt = givePts(pt, `プログラミング ステージ${PG.stage+1}`);
  persist(); confetti(1800); sound('fan'); misEv('prog'); checkBadges();
  const next = PG.stage + 1 < PSTAGES.length;
  const v = await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('bird_jump'))}" alt=""></div><h2 class="dlgT">ステージ ${PG.stage+1} クリア！</h2>
    <div class="stars big">${'★'.repeat(stars)}<i>${'★'.repeat(3-stars)}</i></div><p class="dlgP">ブロック ${n}こ ${stars<3 ? `（★3は ${best}こ いか）` : 'で パーフェクト！'}${pt ? `<br><span class="ptFloat">+${pt}pt</span>` : ''}</p>`,
    (next ? [{label:'つぎの ステージ ▶', cls:'pink', v:'next'}] : []).concat([{label:'もういちど', cls:'white', v:'again'}, {label:'ステージ えらび', cls:'white', v:'sel'}]), 'wide');
  if(v==='next') openStage(PG.stage+1); else if(v==='again') renderStage(); else renderProgSel();
};
const PWORLD = [[0,'🌱 はじめの もり'],[16,'🌊 ジャンプの みずうみ'],[30,'📦 はこの どうくつ'],[44,'⚡ わざの とう'],[58,'🔁 くりかえしの 山'],[72,'🏰 さいごの おしろ']];
const _renderProgSel26 = renderProgSel;
renderProgSel = function(){
  const P = pData(), tot = Object.values(P.stars).reduce((a,b)=>a+b,0);
  let h = `<div class="pTotal">⭐ ${tot} / ${PSTAGES.length*3}　クリア ${Object.keys(P.stars).length} / ${PSTAGES.length}</div>`;
  PWORLD.forEach(([from, name], wi) => { const to = (PWORLD[wi+1]||[PSTAGES.length])[0];
    h += `<h4 class="sGrp">${name}</h4><div class="pSel">${PSTAGES.slice(from, to).map((st,j) => { const i = from + j, s = P.stars[i]||0, lock = i > 0 && !P.stars[i-1];
      return `<button class="pStage ${lock?'plock':''} ${s?'done':''}" data-ps="${i}" ${lock?'disabled':''}><b>${lock ? '🔒' : i+1}</b><span>${'★'.repeat(s)}${'☆'.repeat(3-s)}</span></button>`; }).join('')}</div>`; });
  $('#pView').innerHTML = h + '<div class="note">★3は ブロックが いちばん 少ない とき！ 🌊ジャンプ・📦こわす の わざも おぼえよう</div>';
};
BADGES.push({id:'prog50', i:'🤖', n:'プログラミング 50ステージ', f:()=>Object.keys(save.prog?.stars||{}).length>=50});

/* =====================================================================
   えいご（こども）：たんご・文の 問題 ぞうりょう
   ===================================================================== */
const EW2 = {
  family:[['father','おとうさん'],['mother','おかあさん'],['brother','きょうだい（おとこ）'],['sister','きょうだい（おんな）'],['grandfather','おじいさん'],['grandmother','おばあさん'],['baby','あかちゃん'],['family','かぞく'],['friend','ともだち'],['teacher','せんせい'],['uncle','おじさん'],['aunt','おばさん']],
  body:[['head','あたま'],['face','かお'],['eye','め'],['ear','みみ'],['nose','はな'],['mouth','くち'],['hand','て'],['foot','あし（足くび から した）'],['leg','あし'],['arm','うで'],['hair','かみのけ'],['tooth','は（歯）'],['finger','ゆび'],['knee','ひざ'],['shoulder','かた']],
  food2:[['rice','ごはん'],['bread','パン'],['egg','たまご'],['milk','ぎゅうにゅう'],['water','みず'],['juice','ジュース'],['tea','おちゃ'],['cake','ケーキ'],['pizza','ピザ'],['curry','カレー'],['ice cream','アイスクリーム'],['candy','あめ'],['cookie','クッキー'],['sandwich','サンドイッチ'],['salad','サラダ'],['soup','スープ'],['noodles','めん'],['hamburger','ハンバーガー'],['spaghetti','スパゲッティ'],['chocolate','チョコレート']],
  veg:[['tomato','トマト'],['potato','じゃがいも'],['carrot','にんじん'],['onion','たまねぎ'],['cabbage','キャベツ'],['corn','とうもろこし'],['cucumber','きゅうり'],['green pepper','ピーマン'],['pumpkin','かぼちゃ'],['lemon','レモン'],['peach','もも'],['melon','メロン'],['pineapple','パイナップル'],['cherry','さくらんぼ'],['kiwi fruit','キウイ']],
  animal2:[['lion','ライオン'],['tiger','トラ'],['bear','クマ'],['monkey','サル'],['panda','パンダ'],['koala','コアラ'],['giraffe','キリン'],['zebra','シマウマ'],['horse','ウマ'],['cow','ウシ'],['pig','ブタ'],['sheep','ヒツジ'],['mouse','ネズミ'],['fox','キツネ'],['wolf','オオカミ'],['frog','カエル'],['snake','ヘビ'],['penguin','ペンギン'],['dolphin','イルカ'],['whale','クジラ'],['shark','サメ'],['turtle','カメ'],['owl','フクロウ'],['duck','アヒル'],['chicken','ニワトリ'],['butterfly','チョウ'],['ant','アリ'],['bee','ハチ'],['spider','クモ'],['octopus','タコ']],
  school:[['school','がっこう'],['classroom','きょうしつ'],['desk','つくえ'],['eraser','けしゴム'],['ruler','じょうぎ'],['notebook','ノート'],['textbook','きょうかしょ'],['pencil case','ふでばこ'],['scissors','はさみ'],['glue','のり'],['crayon','クレヨン'],['blackboard','こくばん'],['library','としょかん'],['gym','たいいくかん'],['music room','おんがくしつ'],['playground','うんどうじょう']],
  subject:[['Japanese','こくご'],['math','さんすう'],['science','りか'],['social studies','しゃかい'],['English','えいご'],['music','おんがく'],['P.E.','たいいく'],['arts and crafts','ずこう'],['home economics','かてい科'],['moral education','どうとく']],
  town:[['park','こうえん'],['station','えき'],['hospital','びょういん'],['zoo','どうぶつえん'],['aquarium','すいぞくかん'],['supermarket','スーパー'],['bookstore','ほんや'],['bakery','パンや'],['restaurant','レストラン'],['post office','ゆうびんきょく'],['police station','けいさつしょ'],['fire station','しょうぼうしょ'],['museum','はくぶつかん'],['amusement park','ゆうえんち'],['bank','ぎんこう'],['flower shop','はなや'],['convenience store','コンビニ'],['swimming pool','プール']],
  job:[['doctor','いしゃ'],['nurse','かんごし'],['police officer','けいさつかん'],['firefighter','しょうぼうし'],['cook','りょうりにん'],['baker','パンや さん'],['farmer','のうか'],['pilot','パイロット'],['singer','かしゅ'],['soccer player','サッカーせんしゅ'],['scientist','かがくしゃ'],['vet','じゅうい'],['florist','はなや さん'],['astronaut','うちゅうひこうし'],['zookeeper','しいくいん'],['dentist','はいしゃ']],
  nature:[['sky','そら'],['cloud','くも'],['sea','うみ'],['river','かわ'],['mountain','やま'],['lake','みずうみ'],['island','しま'],['forest','もり'],['beach','すなはま'],['rain','あめ'],['snow','ゆき'],['wind','かぜ'],['leaf','はっぱ'],['rock','いわ'],['earth','ちきゅう']],
  season:[['spring','はる'],['summer','なつ'],['fall','あき'],['winter','ふゆ'],['morning','あさ'],['afternoon','ごご'],['evening','ゆうがた'],['night','よる'],['today','きょう'],['tomorrow','あした'],['yesterday','きのう'],['week','しゅう'],['year','とし（ねん）'],['birthday','たんじょうび']],
  shape:[['circle','まる'],['triangle','さんかく'],['square','しかく'],['star','ほし'],['heart','ハート'],['diamond','ひしがた'],['rectangle','ながしかく'],['oval','だえん']],
  verb2:[['walk','あるく'],['jump','とぶ（ジャンプ）'],['dance','おどる'],['cook','りょうりする'],['play','あそぶ'],['study','べんきょうする'],['write','かく'],['draw','（絵を）かく'],['listen','きく'],['speak','はなす'],['open','あける'],['close','しめる'],['wash','あらう'],['clean','そうじする'],['buy','かう'],['make','つくる'],['go','いく'],['come','くる'],['see','みる'],['like','すき'],['want','ほしい'],['have','もっている'],['help','てつだう'],['sit','すわる'],['stand','たつ'],['ride','のる'],['fly','とぶ（そら）'],['catch','つかまえる'],['throw','なげる'],['skate','スケートする']],
  adj:[['big','おおきい'],['small','ちいさい'],['long','ながい'],['short','みじかい'],['hot','あつい'],['cold','つめたい・さむい'],['new','あたらしい'],['old','ふるい'],['fast','はやい'],['slow','おそい'],['high','たかい'],['low','ひくい'],['good','よい'],['bad','わるい'],['beautiful','うつくしい'],['cute','かわいい'],['cool','かっこいい'],['funny','おもしろい'],['strong','つよい'],['kind','やさしい'],['busy','いそがしい'],['easy','かんたん'],['difficult','むずかしい'],['heavy','おもい'],['light','かるい']],
  country:[['Japan','にほん'],['America','アメリカ'],['China','ちゅうごく'],['Korea','かんこく'],['India','インド'],['France','フランス'],['Italy','イタリア'],['Germany','ドイツ'],['Spain','スペイン'],['Brazil','ブラジル'],['Australia','オーストラリア'],['Canada','カナダ'],['the U.K.','イギリス'],['Egypt','エジプト'],['Kenya','ケニア'],['Russia','ロシア']]
};
const OPP = [['big','small'],['long','short'],['hot','cold'],['new','old'],['fast','slow'],['high','low'],['good','bad'],['heavy','light'],['easy','difficult'],['open','close'],['up','down'],['in','out'],['day','night'],['happy','sad'],['come','go'],['buy','sell'],['left','right'],['early','late']];
const WH = [['What','なに'],['Who','だれ'],['Where','どこ'],['When','いつ'],['Why','なぜ'],['How','どうやって・どう'],['Which','どちら'],['How many','いくつ'],['How much','いくら'],['What time','なんじ']];
const WHQ = [['___ is your name?','What'],['___ is he? — He is my brother.','Who'],['___ do you live? — I live in Osaka.','Where'],['___ is your birthday? — It\'s May 5th.','When'],['___ are you? — I\'m fine.','How'],['___ apples do you have? — I have three.','How many'],['___ is this pen? — It\'s 100 yen.','How much'],['___ is it? — It\'s 7 o\'clock.','What time'],['___ do you like, dogs or cats?','Which'],['___ are you sad? — Because I lost my pen.','Why'],['___ sport do you like?','What'],['___ is the station?','Where'],['___ is your teacher?','Who'],['___ old are you?','How']];
const PREP = [['The cat is ___ the box.（はこの 中）','in'],['The ball is ___ the table.（つくえの 上）','on'],['The dog is ___ the chair.（いすの 下）','under'],['The bag is ___ the desk.（つくえの そば）','by'],['I go to school ___ 8 o\'clock.（8時に）','at'],['My birthday is ___ May.（5月に）','in'],['I play soccer ___ Sunday.（日曜日に）','on'],['I come ___ Japan.（日本から）','from'],['This is a present ___ you.（あなたへ）','for'],['I go to the park ___ my friend.（ともだちと）','with']];
const PREPS = ['in','on','under','by','at','from','for','with'];
const SENT = [['I ___ soccer.（サッカーを する）','play',['play','eat','go','have']],['I ___ breakfast every day.（あさごはんを 食べる）','eat',['eat','play','swim','read']],['I ___ to school.（学校へ 行く）','go',['go','come','see','make']],['I ___ a dog.（犬を かっている）','have',['have','want','like','see']],['I ___ to be a doctor.（医者に なりたい）','want',['want','like','go','have']],['I can ___ fast.（はやく 走れる）','run',['run','eat','read','sleep']],['She ___ the piano.（ピアノを ひく）','plays',['plays','play','playing','played']],['He ___ in Tokyo.（東京に 住んでいる）','lives',['lives','live','living','lived']],['I ___ to the zoo yesterday.（きのう 行った）','went',['went','go','goes','going']],['I ___ ice cream yesterday.（きのう 食べた）','ate',['ate','eat','eats','eating']],['It was ___ .（たのしかった）','fun',['fun','big','cold','old']],['I ___ my homework.（宿題を する）','do',['do','go','see','buy']],['Let\'s ___ to the park.（公園へ 行こう）','go',['go','goes','went','going']],['I ___ swim.（およげない）','can\'t',['can\'t','can','am','is']],['This ___ my bag.（これは 私の かばん）','is',['is','am','are','be']],['I ___ hungry.（おなかが すいた）','am',['am','is','are','be']],['They ___ my friends.（かれらは 友だち）','are',['are','is','am','be']],['___ you like cats? — Yes, I do.','Do',['Do','Are','Is','Can']],['___ you swim? — Yes, I can.','Can',['Can','Do','Are','Is']],['I usually ___ up at 6.（6時に おきる）','get',['get','go','eat','see']]];
const ekTxt = (cat, n, art, lv) => ({n, lv, art, gen(){
  const L = EW2[cat], w = choice(L), t = ri(0,3);
  if(t===0) return {type:'choice', q:`<b class="enW">${esc(w[0])}</b> は にほんごで？`, disp:sayBtn(w[0]), ans:w[1], opts:optsFrom(w[1], L.map(x=>x[1])), say:w[0], sub:cat+w[0]};
  if(t===1) return {type:'choice', q:`「<b>${esc(w[1])}</b>」は えいごで？`, ans:w[0], opts:optsFrom(w[0], L.map(x=>x[0])), say:w[0], sub:cat+w[0]};
  if(t===2 && w[0].length >= 3 && /^[a-z]+$/i.test(w[0])){ const i = ri(1, w[0].length-2), c = w[0][i].toLowerCase();
    return {type:'choice', q:`「${esc(w[1])}」<br><b class="enW">${esc(w[0].slice(0,i))}<span class="blankBox">?</span>${esc(w[0].slice(i+1))}</b>　？に 入る 文字は？`, ans:c, opts:optsFrom(c, 'abcdefghijklmnopqrstuvwxyz'.split('')), say:w[0], sub:cat+w[0]+'s'}; }
  return {type:'choice', q:'🔊 きこえた ことばの いみは？', disp:sayBtn(w[0]), ans:w[1], opts:optsFrom(w[1], L.map(x=>x[1])), say:w[0], sub:cat+w[0]+'l', listen2:1};
}});
const EKU2 = {
  ek_family:ekTxt('family','かぞく（family）','en_happy',1), ek_bodyp:ekTxt('body','からだ（body）','en_run',1),
  ek_food2:ekTxt('food2','たべもの・のみもの','en_apple',1), ek_veg:ekTxt('veg','やさい・くだもの','en_strawberry',1),
  ek_animal2:ekTxt('animal2','どうぶつ（もっと）','en_elephant',2), ek_school:ekTxt('school','がっこう・ぶんぼうぐ','en_pencil',2),
  ek_subject:ekTxt('subject','きょうか（subjects）','en_book',2), ek_town:ekTxt('town','まちの ばしょ','en_house',2),
  ek_season:ekTxt('season','きせつ・じかん','en_sun',2), ek_shape:ekTxt('shape','かたち（shapes）','en_star',1),
  ek_nature:ekTxt('nature','しぜん（nature）','en_tree',2), ek_job:ekTxt('job','しごと（jobs）','en_cap',3),
  ek_verb2:ekTxt('verb2','うごき（もっと）','en_swim',3), ek_adj:ekTxt('adj','ようすを あらわす ことば','en_surprised',3),
  ek_country:ekTxt('country','くに（countries）','en_airplane',3),
  ek_opp:{n:'はんたいの ことば', lv:3, art:'en_sad', gen(){ const p = choice(OPP), r = Math.random()<.5, a = r ? p[0] : p[1], b = r ? p[1] : p[0];
    return {type:'choice', q:`<b class="enW">${a}</b> の はんたいの いみの ことばは？`, disp:sayBtn(a), ans:b, opts:optsFrom(b, OPP.flat()), say:a, sub:'opp'+a}; }},
  ek_wh:{n:'しつもんの ことば（What / Where…）', lv:3, art:'en_sing', gen(){ if(Math.random()<.4){ const w = choice(WH); return {type:'choice', q:`<b class="enW">${w[0]}</b> の いみは？`, ans:w[1], opts:optsFrom(w[1], WH.map(x=>x[1])), say:w[0], sub:'wh'+w[0]}; }
    const q = choice(WHQ); return {type:'choice', q:`<b class="enW">${esc(q[0]).replace('___','<span class="blankBox">　</span>')}</b><br>□に 入る ことばは？`, ans:q[1], opts:optsFrom(q[1], WH.map(x=>x[0])), say:q[0].replace('___', q[1]), sub:'whq'+q[0]}; }},
  ek_prep:{n:'ばしょ・じかんの ことば（in / on…）', lv:3, art:'en_house', gen(){ const q = choice(PREP);
    return {type:'choice', q:`<b class="enW">${esc(q[0]).replace('___','<span class="blankBox">　</span>')}</b><br>□に 入る ことばは？`, ans:q[1], opts:optsFrom(q[1], PREPS), say:q[0].replace(/（.*）/,'').replace('___', q[1]), sub:'prep'+q[0]}; }},
  ek_sent2:{n:'文を かんせい させよう', lv:3, art:'en_read', gen(){ const q = choice(SENT);
    return {type:'choice', q:`<b class="enW">${esc(q[0]).replace('___','<span class="blankBox">　</span>')}</b><br>□に 入る ことばは？`, ans:q[1], opts:shuffle(q[2].slice()), say:q[0].replace(/（.*）/,'').replace('___', q[1]), sub:'s'+q[0]}; }},
  ek_spell:{n:'つづり チャレンジ', lv:3, art:'en_pencil', gen(){ const cats = Object.keys(EW2).filter(c => c!=='country'), L = EW2[choice(cats)].filter(w => /^[a-z]+$/.test(w[0]) && w[0].length>=4), w = choice(L);
    const wrong = new Set(); const sw = (s,i) => s.slice(0,i)+s[i+1]+s[i]+s.slice(i+2);
    let g = 0; while(wrong.size < 3 && g++ < 30){ const i = ri(0, w[0].length-2), v = Math.random()<.5 ? sw(w[0], i) : w[0].slice(0,i)+choice('aeiou')+w[0].slice(i+1); if(v!==w[0]) wrong.add(v); }
    return {type:'choice', q:`「<b>${esc(w[1])}</b>」の ただしい つづりは？`, ans:w[0], opts:shuffle([w[0], ...wrong]), say:w[0], sub:'sp'+w[0]}; }}
};
Object.entries(EKU2).forEach(([k,u]) => { MATH_UNITS[k] = Object.assign(u, {g:'ek'}); EKU[k] = u; EK_LV[k] = u.lv; });


/* =====================================================================
   v2.8：パン屋の パン（たべると ポイントアップ）・女の子の とくべつな 5まい・
         どうぶつ運動会・わたしの家に 女の子・きろく リニューアル・
         まちがえた問題の やりなおし・住民の 問題でも 筆算メモ
   ===================================================================== */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* =====================================================================
   パン屋：パンを 売る・たべると 一定時間 ポイント×
   ===================================================================== */
const FOOD = [
  ['melon','メロンパン',60,1.2,15],['anpan','あんパン',60,1.2,15],['croissant','クロワッサン',90,1.3,15],['curry','カレーパン',90,1.3,20],
  ['choco','チョココロネ',120,1.3,25],['sand','サンドイッチ',150,1.4,20],['baguette','フランスパン',150,1.3,40],['donut','ドーナツ',180,1.5,15],
  ['cream','シュークリーム',200,1.5,20],['cinna','シナモンロール',250,1.5,30],['cake','いちごショートケーキ',350,1.8,20],['toast','はちみつトースト',400,2.0,15]
].map(([id,n,p,m,min]) => ({id, n, price:p, m, min, art:'bread_'+id}));
const FD = id => FOOD.find(f => f.id===id);
function foodBag(){ return save.food || (save.food = {}); }
function buffNow(){ const b = save.buff; return b && b.until > Date.now() ? b : null; }
['coffee','popcorn','cottoncandy','ricecooker','waterdisp','chabudai'].forEach(id => { if(SHOP_ONLY[id]==='bakery') delete SHOP_ONLY[id]; });
SHOPS.bakery.only = []; SHOPS.bakery.fur = []; SHOP_EXTRA.bakery = [];
SHOPS.bakery.greet = ['いらっしゃいませ！ やきたてだよ〜','パンを たべると べんきょうの パワーが 出るよ！','きょうの おすすめは メロンパン！'];
const _catalog28 = catalog;
catalog = function(b){
  if(b!=='bakery') return _catalog28(b);
  const g = (save.town.glv||{})[SHOP_KEY] || 0, avail = 4 + g*3;
  return FOOD.map((f,i) => ({id:f.id, kind:'food', name:`${f.n}（×${f.m}・${f.min}分）`, art:f.art, price:f.price, only:true, lockG: i >= avail ? Math.min(3, Math.ceil((i + 1 - 4)/3)) : 0}));
};
async function eatFood(id){
  const f = FD(id), B = foodBag(); if(!f || !(B[id] > 0)) return;
  B[id]--; if(!B[id]) delete B[id];
  const cur = buffNow(), now = Date.now();
  if(cur && cur.m >= f.m) cur.until += f.min*60000;
  else save.buff = {m:f.m, until: now + f.min*60000, n:f.n, art:f.art};
  persist(); sound('fan'); confetti(1200); buffTick();
  const b = buffNow();
  await dialog(`<div class="dlgArt big"><img src="${esc(artSrc(f.art))}" alt=""></div><h2 class="dlgT">もぐもぐ… おいしい！</h2>
    <p class="dlgP">べんきょうで もらえる ポイントが <b>×${b.m}</b>！<br>のこり <b>${Math.ceil((b.until-now)/60000)}分</b></p>`, [{label:'がんばるぞ！', cls:'gold', v:1}], 'gold');
}
async function openFoodBag(){
  const B = foodBag(), ids = Object.keys(B).filter(k => B[k] > 0), b = buffNow();
  const v = await dialog(`<h2 class="dlgT">🍞 おやつ</h2>${b ? `<div class="buffNow"><img src="${esc(artSrc(b.art))}" alt="">いま ポイント ×${b.m}（のこり ${Math.ceil((b.until-Date.now())/60000)}分）</div>` : '<p class="dlgP" style="font-size:14px">たべると しばらく べんきょうの ポイントが ふえるよ</p>'}
    <div class="foodGrid">${ids.length ? ids.map(id => { const f = FD(id); return `<button class="foodIt" data-eat="${id}"><img src="${esc(artSrc(f.art))}" alt=""><b>${esc(f.n)}</b><small>×${f.m}・${f.min}分</small><i>×${B[id]}</i></button>`; }).join('') : '<div class="note">おやつが ないよ。まちの パン屋さんで かってね！</div>'}</div>`,
    [{label:'とじる', cls:'white', v:null}], 'wide');
}
document.addEventListener('click', e => { const b = e.target.closest('[data-eat]'); if(!b) return; e.stopImmediatePropagation(); $('#dlg').classList.remove('show'); eatFood(b.dataset.eat); }, true);
window.addEventListener('click', async e => {
  const sb = e.target.closest('[data-sbuy^="food:"]'); if(!sb) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const [,id,price] = sb.dataset.sbuy.split(':'), p = +price, f = FD(id);
  if(save.points.bal < p){ toast('ポイントが たりないよ'); return; }
  const B = foodBag(); B[id] = (B[id]||0) + 1; givePts(-p, `パン屋で ${f.n}を かった`); persist(); sound('ok');
  const card = sb.closest('.siIt'); card.classList.add('bought'); card.querySelector('small').textContent = `もっている ${B[id]}`;
  toast(`🍞 ${f.n}を かったよ！ ホームの「おやつ」で たべられるよ`);
}, true);
const STUDY_RX = /せいかい|ボーナス問題|パーフェクト|さいごまで|ステージ|ならべかえ|作文|日記|おうえん|チャレンジ/;
const _addPoints28 = addPoints;
addPoints = function(pt, reason, silent){
  const b = buffNow();
  if(b && pt > 0 && STUDY_RX.test(String(reason||''))){ const extra = Math.round(pt*(b.m - 1)); if(extra > 0){ pt += extra; reason = `${reason}（🍞×${b.m}）`; } }
  return _addPoints28(pt, reason, silent);
};
function buffTick(){
  let el = $('#buffChip'); const b = buffNow();
  if(!b){ if(el) el.remove(); return; }
  if(!el){ document.body.insertAdjacentHTML('beforeend', '<button id="buffChip"></button>'); el = $('#buffChip'); el.onclick = openFoodBag; }
  const s = Math.ceil((b.until - Date.now())/1000);
  el.innerHTML = `<img src="${esc(artSrc(b.art))}" alt=""><b>×${b.m}</b><small>${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}</small>`;
}
setInterval(buffTick, 1000);

/* =====================================================================
   女の子：とくべつな 5まい
   ===================================================================== */
const GIRL_SC = ['sakura','festival','bakery','stars','snow'];
const _speciesScenes28 = speciesScenes;
speciesScenes = function(sp){ if(sp==='girl') return GIRL_SC.slice(); return _speciesScenes28(sp); };
document.addEventListener('click', async e => {
  if(curScreen!=='zukan') return;
  const b = e.target.closest('#zukanGrid .zkCard[data-id="girl"]'); if(!b) return;
  e.stopImmediatePropagation(); const g = girl();
  const gallery = GIRL_SC.map(k => scSeen('girl', k) ? `<button class="scThumb" data-scv="girl|${k}"><img src="${esc(artSrc('scu_girl_'+k))}" alt=""><span>${esc(SCENES[k].n)}</span></button>`
    : `<div class="scThumb lock"><i>🔒</i><span>？？？</span><small>💡 ${esc(scHint(k))}</small></div>`).join('');
  await dialog(`<div class="arrBg rk5"><div class="dlgArt big">${g ? resPic(g) : ''}</div></div><h2 class="dlgT">${esc(g?.name||'おんなのこ')}</h2>
    <div class="scGal"><b>📸 とくべつな シーン（${(scSave().girl||[]).length}/5）</b><div class="scGrid">${gallery}</div></div>`, [{label:'とじる', v:1}], 'wide');
}, true);

/* =====================================================================
   わたしの家に 女の子
   ===================================================================== */
const HG = {x:3, y:5, timer:null, flip:false};
function placeHomeGirl(){
  clearInterval(HG.timer); $$('#room .homeGirl').forEach(e => e.remove());
  const g = girl(), room = $('#room'); if(!g || !room || homeView!=='top' || homeEdit) return;
  const ok = (x,y) => freeCell(x,y) && !(VS.el && VS.x===x && VS.y===y);
  if(!ok(HG.x, HG.y)){ outer: for(let y=ROOM.rows-1;y>=0;y--) for(let x=0;x<ROOM.cols;x++) if(ok(x,y)){ HG.x = x; HG.y = y; break outer; } }
  room.insertAdjacentHTML('beforeend', `<button class="homeGirl">${resPic(g)}<span class="hgName">${esc(g.name)}</span></button>`);
  const pos = instant => { const el = $('#room .homeGirl'); if(!el) return; const cs = room.clientWidth/ROOM.cols, W = cs*1.05;
    if(instant) el.style.transition = 'none'; el.style.width = W+'px'; el.style.left = (HG.x*cs + (cs-W)/2)+'px'; el.style.top = ((HG.y+1)*cs - W*1.25)+'px'; el.style.zIndex = (HG.y+1)*10 + 6;
    el.classList.toggle('flip', HG.flip); if(instant){ void el.offsetWidth; el.style.transition = ''; } };
  pos(true);
  HG.timer = setInterval(() => {
    if(curScreen!=='myhome' || homeEdit || $('#dlg').classList.contains('show') || Math.random() < 0.4) return;
    for(const [dx,dy] of shuffle([[1,0],[-1,0],[0,1],[0,-1]])){ if(ok(HG.x+dx, HG.y+dy)){ if(dx) HG.flip = dx<0; HG.x += dx; HG.y += dy; break; } }
    pos();
  }, 2200);
}
const _renderMyHome28 = renderMyHome;
renderMyHome = function(){ _renderMyHome28(); placeHomeGirl(); };
document.addEventListener('click', e => { const b = e.target.closest('#room .homeGirl'); if(!b || homeEdit) return; e.stopImmediatePropagation(); const g = girl(); if(g) talkTo(g.id); }, true);

/* =====================================================================
   住民の 問題でも 筆算メモ
   ===================================================================== */
function attachDlgMemo(){
  const h = $('#dlgBody .hissan'); if(!h || $('#dlgBody .dlgMemo')) return;
  const box = document.createElement('div'); box.className = 'dlgMemo';
  h.parentNode.insertBefore(box, h); box.appendChild(h);
  box.insertAdjacentHTML('beforebegin', `<div class="dmTools"><button data-dm="pen" class="on">✏️ メモ</button><button data-dm="undo">↩</button><button data-dm="clr">🧽</button></div>`);
  box.insertAdjacentHTML('beforeend', '<canvas class="dmCv"></canvas>');
  const cv = box.querySelector('canvas'), st = {on:true, strokes:[], cur:null};
  const size = () => { const r = box.getBoundingClientRect(), d = devicePixelRatio||1; cv.width = r.width*d; cv.height = r.height*d; cv.style.width = r.width+'px'; cv.style.height = r.height+'px'; cv.getContext('2d').setTransform(d,0,0,d,0,0); draw(); };
  const draw = () => { const c = cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height); c.strokeStyle = '#E8414B'; c.lineWidth = 3; c.lineCap = c.lineJoin = 'round';
    st.strokes.forEach(s => { c.beginPath(); c.moveTo(s[0][0], s[0][1]); s.forEach(p => c.lineTo(p[0], p[1])); if(s.length===1) c.lineTo(s[0][0]+.1, s[0][1]); c.stroke(); }); };
  const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { if(!st.on) return; e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){} st.cur = [pt(e)]; st.strokes.push(st.cur); draw(); });
  cv.addEventListener('pointermove', e => { if(!st.cur) return; e.preventDefault(); (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(ev => st.cur.push(pt(ev))); draw(); });
  ['pointerup','pointercancel'].forEach(t => cv.addEventListener(t, () => st.cur = null));
  cv.addEventListener('touchstart', e => { if(st.on) e.preventDefault(); }, {passive:false});
  $('#dlgBody .dmTools').addEventListener('click', e => { const b = e.target.closest('[data-dm]'); if(!b) return; e.stopPropagation();
    if(b.dataset.dm==='pen'){ st.on = !st.on; b.classList.toggle('on', st.on); cv.classList.toggle('off', !st.on); }
    if(b.dataset.dm==='undo'){ st.strokes.pop(); draw(); } if(b.dataset.dm==='clr'){ st.strokes = []; draw(); } });
  requestAnimationFrame(size);
}
const _dialog28 = dialog;
dialog = function(html, btns, cls){ const p = _dialog28(html, btns, cls); setTimeout(attachDlgMemo, 20); return p; };

/* =====================================================================
   まちがえた 問題を やりなおす
   ===================================================================== */
function reviewItems(){ return weakQ().filter(w => MATH_UNITS[w.u]); }
function reviewStart(){
  const W = shuffle(reviewItems().slice()).slice(0, 10);
  if(!W.length){ toast('まちがえた 問題は ないよ！ すごい！'); return; }
  const list = W.map(w => ({u:w.u, type:w.type, q:w.q, ans:w.ans, opts:w.opts ? w.opts.slice() : undefined, disp:w.disp, hint:w.hint, optHtml:w.optHtml}));
  window.MQREV = true; window.MQSCI = window.MQEK = window.MQBUN = false; window.MQSOC = !list.some(p => typeof MATH_UNITS[p.u].g === 'number');
  $('#mPlayTag').textContent = 'ふくしゅう'; $('#mPlayTag').style.background = '#E0577A';
  MQ = {list, i:0, res:[], pts:0, t0:Date.now(), combo:0, soc:window.MQSOC}; show('mathplay'); mRender();
}
document.addEventListener('click', e => { if(e.target.closest('#mStart,#sStart,#rStart,#kStart,#bStart')) window.MQREV = false; }, true);
async function openReview(){
  const nq = reviewItems().length, nk = weakKanji().length;
  if(!nq && !nk){ await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('bird_jump'))}" alt=""></div><h2 class="dlgT">まちがえた 問題は ないよ！</h2><p class="dlgP">この ちょうしで がんばろう！</p>`, [{label:'うん！', cls:'pink', v:1}]); return; }
  const by = {}; reviewItems().forEach(w => { const k = kindOfKey(w.u); by[k] = (by[k]||0) + 1; });
  const NM = {math:'🔢 さんすう', soc:'🗾 しゃかい', sci:'🔬 りか', ek:'🔤 えいご', kanji:'🀄 かんじ'};
  const v = await dialog(`<h2 class="dlgT">🔁 まちがえた 問題を やりなおそう</h2>
    <div class="revSum">${Object.entries(by).map(([k,n]) => `<span>${NM[k]||k} <b>${n}</b></span>`).join('')}${nk ? `<span>🀄 にがてな 漢字 <b>${nk}</b></span>` : ''}</div>
    <p class="dlgP" style="font-size:13px">せいかいすると リストから きえるよ。ぜんぶ きえたら はなまる！</p>`,
    (nq ? [{label:`📚 まちがえた 問題（${Math.min(10,nq)}問）`, cls:'pink', v:'q'}] : []).concat(nk ? [{label:`🀄 にがてな 漢字`, cls:'orange', v:'k'}] : []).concat([{label:'あとで', cls:'white', v:null}]), 'wide');
  if(v==='q') reviewStart();
  if(v==='k') weakSession('read');
}

/* =====================================================================
   どうぶつ運動会
   ===================================================================== */
const UD_EVENTS = [
  {id:'ball', n:'たまころがし', i:'🔴', w:[.6,.4], q:2, desc:'大きな 玉を ころがして ゴールを めざせ！'},
  {id:'run',  n:'かけっこ', i:'🏃', w:[.8,.2], q:2, desc:'ヨーイ ドン！ さいごまで 走りぬけ！'},
  {id:'bread',n:'パンくい きょうそう', i:'🥐', w:[.5,.5], q:2, desc:'つるされた パンを くわえて ゴール！'},
  {id:'toss', n:'たまいれ', i:'🧺', w:[.3,.7], q:2, desc:'かごに たくさん 玉を 入れよう！'},
  {id:'tug',  n:'おばけと つなひき', i:'👻', team:true, q:3, desc:'みんなで 力を 合わせて 大きな おばけに かて！'}
];
const UD_ITEMS = [
  {id:'ud_flag', type:'bld', cat:'deco', name:'おうえんフラッグ', art:'ud_flag', emoji:'🚩', price:0, lv:1, dev:30, udOnly:1, pop:0.01},
  {id:'ud_podium', type:'bld', cat:'deco', name:'ひょうしょうだい', art:'ud_podium', emoji:'🏆', price:0, lv:1, dev:40, udOnly:1, pop:0.02},
  {id:'ud_ball', type:'bld', cat:'deco', name:'うんどうかいの 大玉', art:'ud_ball', emoji:'🔴', price:0, lv:1, dev:30, udOnly:1},
  {id:'ud_pompom', type:'bld', cat:'deco', name:'おうえん ポンポン', art:'ud_pompom', emoji:'🎀', price:0, lv:1, dev:25, udOnly:1},
  {id:'ud_rope', type:'bld', cat:'deco', name:'つなひきの つな', art:'ud_rope', emoji:'🪢', price:0, lv:1, dev:25, udOnly:1}
];
UD_ITEMS.forEach(it => { if(!TOWN_ITEMS.some(x => x.id===it.id)) TOWN_ITEMS.push(it); });
const UD_FUR = [{id:'ud_trophy', name:'うんどうかい トロフィー', art:'ud_trophy', type:'fur', price:0, lv:1, sty:25, udOnly:1, special:1},
  {id:'ud_medal', name:'きんメダル', art:'ud_medal', type:'fur', price:0, lv:1, sty:18, udOnly:1, special:1}];
UD_FUR.forEach(f => { if(!FURNITURE.some(x => x.id===f.id)) FURNITURE.push(f); });
Object.assign(ZUKAN_INFO, {ud_flag:'運動会で もらえる おうえんの はた。', ud_podium:'運動会の 1・2・3いの だい。', ud_ball:'大玉ころがしの 大きな 玉。', ud_pompom:'おうえんで ふりふり。', ud_rope:'おばけとの つなひきで つかった つな。'});
const _shopList28 = shopList;
shopList = function(){ return _shopList28().filter(it => !it.udOnly); };
function udData(){ return save.ud || (save.ud = {day:'', n:0, wins:0, best:0, got:[]}); }
const udDoneToday = () => udData().day === dayKey();
/* ---------- おんがく ---------- */
const UDM = {ctx:null, timer:null, on:true, step:0};
function udCtx(){ if(!UDM.ctx) UDM.ctx = new (window.AudioContext||window.webkitAudioContext)(); if(UDM.ctx.state==='suspended') UDM.ctx.resume(); return UDM.ctx; }
function tone(f, t, d, type='square', vol=0.06){ const c = udCtx(), o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t+0.01); g.gain.exponentialRampToValueAtTime(0.0001, t+d); o.connect(g).connect(c.destination); o.start(t); o.stop(t+d+0.02); }
function noise(t, d, vol=0.12){ const c = udCtx(), n = c.createBuffer(1, c.sampleRate*d, c.sampleRate), a = n.getChannelData(0); for(let i=0;i<a.length;i++) a[i] = (Math.random()*2-1)*(1-i/a.length);
  const s = c.createBufferSource(), g = c.createGain(); s.buffer = n; g.gain.value = vol; s.connect(g).connect(c.destination); s.start(t); }
const N = {C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784,A5:880,B5:988,C6:1047,R:0};
const UD_MEL = 'G5 E5 G5 E5 G5 A5 G5 E5 F5 D5 F5 D5 F5 G5 F5 D5 E5 C5 E5 G5 C6 B5 A5 G5 A5 G5 F5 E5 D5 R D5 R G5 E5 G5 E5 G5 A5 G5 E5 F5 D5 F5 D5 F5 G5 F5 D5 E5 G5 C6 G5 A5 F5 D5 B4 C5 R C5 R C5 R R R'.split(' ');
const UD_BASS = ['C4','G4','C4','G4','F4','C5','F4','C5','D4','A4','G4','B4','G4','D5','G4','B4'];
function musicStart(){
  if(!save.settings.sound || !UDM.on || UDM.timer) return;
  const c = udCtx(), spb = 0.16; UDM.next = c.currentTime + 0.05; UDM.step = 0;
  UDM.timer = setInterval(() => {
    while(UDM.next < c.currentTime + 0.25){
      const i = UDM.step % UD_MEL.length, m = UD_MEL[i];
      if(m!=='R') tone(N[m], UDM.next, spb*0.9, 'square', 0.035);
      if(i % 2 === 0) tone(N[UD_BASS[(i/2|0) % UD_BASS.length]]/2, UDM.next, spb*1.6, 'triangle', 0.08);
      if(i % 4 === 0) noise(UDM.next, 0.05, 0.05);
      UDM.next += spb; UDM.step++;
    }
  }, 60);
}
function musicStop(){ clearInterval(UDM.timer); UDM.timer = null; }
function sfx(k){
  if(!save.settings.sound) return; const c = udCtx(), t = c.currentTime;
  if(k==='whistle'){ tone(2600, t, 0.12, 'sine', 0.12); tone(2600, t+0.16, 0.45, 'sine', 0.12); }
  if(k==='pan'){ noise(t, 0.08, 0.25); tone(140, t, 0.2, 'triangle', 0.25); }
  if(k==='cheer'){ for(let i=0;i<10;i++) noise(t+i*0.04, 0.3, 0.05); [784,988,1175].forEach((f,i) => tone(f, t+0.05*i, 0.4, 'triangle', 0.06)); }
  if(k==='win'){ [523,659,784,1047,784,1047].forEach((f,i) => tone(f, t+i*0.11, 0.18, 'square', 0.07)); }
  if(k==='lose'){ [523,494,466,440].forEach((f,i) => tone(f, t+i*0.18, 0.2, 'triangle', 0.08)); }
  if(k==='step'){ tone(180+Math.random()*60, t, 0.05, 'triangle', 0.05); }
  if(k==='pop'){ tone(900+Math.random()*300, t, 0.06, 'sine', 0.08); }
}
/* ---------- もんだい（ちょっと むずかしい） ---------- */
function udQ(){
  if(Math.random() < 0.3 && weakItems().length){ const m = makeMQ({weakOnly:true}); if(m) return m; }
  for(let t=0;t<30;t++){
    const k = choice(['kanji','math','math','soc','sci','ek']); let m = null;
    if(k==='kanji'){ const pool = BUILTIN.concat(customQs||[]).filter(q => q.grade >= 3); m = kanjiMQ(choice(pool.length ? pool : BUILTIN), false); }
    else {
      const us = k==='math' ? ['mul2','div','dec','frac','box','time','len','unit','addsub','big'].filter(u => MATH_UNITS[u])
        : k==='soc' ? Object.keys(SOC_LV).filter(u => SOC_LV[u]===2) : k==='sci' ? Object.keys(SCI_LV).filter(u => SCI_LV[u]===2) : Object.keys(EK_LV).filter(u => EK_LV[u]>=2);
      const u = choice(us); try{ m = mqFromP(MATH_UNITS[u].gen(), u); }catch(e){ m = null; }
    }
    if(m) return m;
  }
  return kanjiMQ(choice(BUILTIN), false);
}
/* ---------- がめん ---------- */
const UD = {};
const crowd = () => shuffle(save.town.res.filter(r => r.id!==UD.me?.id && r.id!==UD.rival?.id).slice()).slice(0, 7);
function stageHTML(inner, cls=''){
  const cr = crowd();
  return `<div class="udStage ${cls}" style="background-image:url(${artSrc('ud_field')})">
    <div class="udFlags"></div>
    <div class="udCrowd">${cr.map((r,i) => `<span class="udFan" style="animation-delay:${(i*0.13).toFixed(2)}s">${resPic(r)}</span>`).join('')}<img class="udPom" src="${esc(artSrc('ud_pompom'))}" alt=""></div>
    <div class="udAnn"><img src="${esc(artSrc('bird_wave'))}" alt=""><div class="udSay" id="udSay"></div></div>
    ${inner}
    <button class="udMute" id="udMute">${UDM.on ? '🔊' : '🔇'}</button></div>`;
}
const say = t => { const s = $('#udSay'); if(s){ s.textContent = t; s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); } };
function udPower(r, ev, correct){ const [a,b] = ev.w || [.5,.5]; return effAb(r,'work')*a*1.2 + effAb(r,'know')*b*1.2 + correct*4.5; }
async function udOpen(){
  const t = save.town, cand = t.res.filter(r => !SP(r.sp).human);
  if(!cand.length){ toast('住民が いないと 運動会が できないよ'); return; }
  if(udDoneToday()){ await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('ud_trophy'))}" alt=""></div><h2 class="dlgT">きょうの 運動会は おわったよ</h2><p class="dlgP">きょうの けっか：<b>${udData().last||0}しょう</b><br>また あした さんかしよう！</p>`, [{label:'うん！', cls:'pink', v:1}]); return; }
  Object.assign(UD, {me:null, rival:null, ev:0, wins:[], correct:0, total:0});
  show('ud'); musicStart();
  $('#udView').innerHTML = `<div class="udTitle"><img src="${esc(artSrc('ud_trophy'))}" alt=""><div><b>どうぶつ運動会</b><small>だいひょうの 住民を えらんでね！ 「はたらく」と「ちしき」が 強いと 有利。問題に せいかいすると パワーアップ！</small></div></div>
    <div class="udPick">${cand.sort((a,b) => (effAb(b,'work')+effAb(b,'know')) - (effAb(a,'work')+effAb(a,'know'))).map(r => `<button class="udPickIt" data-udp="${r.id}">${resPic(r)}<b>${esc(r.name)}</b>
      <small>🔨 ${Math.round(effAb(r,'work')*10)/10}　📘 ${Math.round(effAb(r,'know')*10)/10}</small></button>`).join('')}</div>
    <div class="udEvList">${UD_EVENTS.map(e => `<span>${e.i} ${e.n}</span>`).join('')}</div>
    <button class="btn white" id="udQuit">やめる</button>`;
}
document.addEventListener('click', e => {
  if(curScreen!=='ud') return;
  const p = e.target.closest('[data-udp]'); if(p){ e.stopImmediatePropagation(); udBegin(p.dataset.udp); return; }
  if(e.target.closest('#udQuit')){ e.stopImmediatePropagation(); musicStop(); show('home'); return; }
  if(e.target.closest('#udMute')){ e.stopImmediatePropagation(); UDM.on = !UDM.on; if(UDM.on) musicStart(); else musicStop(); e.target.closest('#udMute').textContent = UDM.on ? '🔊' : '🔇'; }
}, true);
async function udBegin(id){
  const t = save.town; UD.me = t.res.find(r => r.id===id);
  const others = t.res.filter(r => r.id!==id && !SP(r.sp).human);
  if(others.length) UD.rival = choice(others);
  else { const sp = choice(SPECIES.filter(s => (s.rar||1) <= 2 && !s.human)); UD.rival = {id:'rv', sp:sp.id, name:'となりまちの '+sp.name, star:2, ab:{work:ri(4,8), know:ri(4,8), biz:3, pop:3, drive:3}}; }
  $('#udView').innerHTML = stageHTML(`<div class="udVs"><div class="udSide me">${resPic(UD.me)}<b>${esc(UD.me.name)}</b><small>きみの チーム</small></div><div class="udVsMark">VS</div><div class="udSide rv">${resPic(UD.rival)}<b>${esc(UD.rival.name)}</b><small>ライバル</small></div></div>`, 'intro');
  say('せんしゅ にゅうじょう！ がんばれ〜！'); sfx('cheer');
  await sleep(2400);
  for(UD.ev = 0; UD.ev < UD_EVENTS.length; UD.ev++){ await udEvent(UD_EVENTS[UD.ev]); }
  await udFinish();
}
async function udEvent(ev){
  $('#udView').innerHTML = stageHTML(`<div class="udEvTitle"><span>${UD.ev+1} / 5</span><i>${ev.i}</i><b>${ev.n}</b><small>${ev.desc}</small></div>`, 'title');
  say(`だい${UD.ev+1}しゅもく「${ev.n}」！`); sfx('pan'); await sleep(1800);
  let correct = 0;
  for(let i=0;i<ev.q;i++){
    const m = udQ();
    const head = `<div class="udQHead"><span>${ev.i} ${ev.n}</span><b>⚡ パワーアップ チャンス ${i+1}/${ev.q}</b><span class="udPw">${'⚡'.repeat(correct)}${'・'.repeat(ev.q-correct)}</span></div>`;
    const res = await askMQ(m, head);
    UD.total++; if(res.ok){ correct++; UD.correct++; toast('⚡ パワーアップ！'); } else toast(`こたえは「${res.ans}」`);
  }
  let win;
  if(ev.team){
    const team = save.town.res.filter(r => !SP(r.sp).human).slice(0, 8), teamShow = team.slice(0, 5), avg = team.reduce((a,r) => a + effAb(r,'work'), 0) / Math.max(1, team.length);
    const mine = avg*1.3 + Math.min(team.length, 8)*0.6 + correct*4, ghost = 9 + UD.ev + Math.random()*4 + Math.min(udData().n, 10)*0.3;
    win = Math.random() < 1/(1+Math.exp(-(mine-ghost)/2.2));
    await animTug(win, teamShow);
  } else {
    const rc = [...Array(ev.q)].filter(() => Math.random() < 0.55).length;
    const mine = udPower(UD.me, ev, correct), rv = udPower(UD.rival, ev, rc);
    win = Math.random() < 1/(1+Math.exp(-(mine-rv)/2.6));
    if(ev.id==='toss') await animToss(win, correct); else await animRace(ev, win);
  }
  UD.wins.push(win);
  $('#udView .udStage').insertAdjacentHTML('beforeend', `<div class="udRes ${win?'w':'l'}"><b>${win ? 'かち！' : 'まけ…'}</b><small>${win ? 'やったね！' : 'つぎは がんばろう！'}</small></div>`);
  if(win){ sfx('win'); confetti(1800); say('やった〜！ だいかつやく！'); } else { sfx('lose'); say('おしい！ つぎで ばんかいだ！'); }
  await sleep(2200);
}
async function animRace(ev, win){
  const prop = ev.id==='ball' ? `<img class="udProp ball" src="${esc(artSrc('ud_ball'))}" alt="">` : '';
  const bread = ev.id==='bread' ? `<div class="udBread"><img src="${esc(artSrc('bread_melon'))}" alt=""><img src="${esc(artSrc('bread_anpan'))}" alt=""></div>` : '';
  $('#udView').innerHTML = stageHTML(`<div class="udTrack ${ev.id}">${bread}
    <div class="udLane"><div class="udRunner" id="udA">${prop}${resPic(UD.me)}<span class="udTag me">${esc(UD.me.name)}</span></div></div>
    <div class="udLane"><div class="udRunner" id="udB">${prop}${resPic(UD.rival)}<span class="udTag rv">${esc(UD.rival.name)}</span></div></div>
    <div class="udGoal"><span>GOAL</span></div></div>`, 'race');
  say('いちについて… よーい…'); await sleep(1100); sfx('pan'); say('ドン！！'); sfx('cheer');
  const A = $('#udA'), B = $('#udB'), FIN = 84; let pa = 2, pb = 2, va = 0, vb = 0, t0 = performance.now(), done = false, winT = 3800 + Math.random()*700;
  const ta = win ? winT : winT + 500 + Math.random()*500, tb = win ? winT + 500 + Math.random()*500 : winT;
  await new Promise(res => {
    let lastStep = 0;
    const loop = now => {
      const t = now - t0;
      const ease = (tt, T) => { const x = Math.min(1, tt/T); return x + Math.sin(x*Math.PI*3 + (T%7))*0.03*(1-x); };
      pa = 2 + (FIN-2)*ease(t, ta); pb = 2 + (FIN-2)*ease(t, tb);
      if(ev.id==='bread'){ [A,B].forEach((el,i) => { const p = i ? pb : pa; el.classList.toggle('jumping', p > 44 && p < 54); }); }
      A.style.left = pa + '%'; B.style.left = pb + '%';
      if(now - lastStep > 180){ lastStep = now; sfx('step'); }
      if(t > Math.max(ta, tb) + 200){ res(); return; }
      if(!done && t > Math.min(ta, tb)){ done = true; sfx('whistle'); say(win ? `${UD.me.name}、1いで ゴール！` : `${UD.rival.name}、さきに ゴール！`); }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
  (win ? A : B).classList.add('winner');
  await sleep(500);
}
async function animToss(win, correct){
  $('#udView').innerHTML = stageHTML(`<div class="udToss"><div class="udBasket me"><i></i><b id="udCa">0</b></div><div class="udBasket rv"><i></i><b id="udCb">0</b></div>
    <div class="udThrower me">${resPic(UD.me)}</div><div class="udThrower rv">${resPic(UD.rival)}</div><div id="udBalls"></div></div>`, 'toss');
  say('たまいれ スタート！ どんどん なげろ〜！'); sfx('pan'); sfx('cheer');
  const fa = win ? ri(16,24) + correct : ri(9,15), fb = win ? ri(8,fa-2) : ri(fa+2, fa+8);
  let ca = 0, cb = 0; const box = $('#udBalls');
  for(let i=0;i<38;i++){
    const side = i%2 ? 'rv' : 'me', inA = side==='me' && ca < fa && Math.random() < 0.75, inB = side==='rv' && cb < fb && Math.random() < 0.75, inn = inA || inB;
    const b = document.createElement('i'); b.className = `udTb ${side} ${inn?'in':'out'} c${i%3}`; box.appendChild(b); setTimeout(() => b.remove(), 900);
    if(inA){ ca++; setTimeout(() => { $('#udCa').textContent = ca; sfx('pop'); }, 600); } if(inB){ cb++; setTimeout(() => { $('#udCb').textContent = cb; sfx('pop'); }, 600); }
    await sleep(120);
  }
  await sleep(700);
  while(ca < fa){ ca++; } while(cb < fb){ cb++; }
  $('#udCa').textContent = fa; $('#udCb').textContent = fb; sfx('whistle');
  say(`${fa} たい ${fb}！`); await sleep(900);
}
async function animTug(win, team){
  $('#udView').innerHTML = stageHTML(`<div class="udTug"><div class="udRopeWrap" id="udRope"><div class="udRope"></div><i class="udFlagMk"></i>
    <div class="udTeam">${team.map((r,i) => `<span class="udPull" style="animation-delay:${(i*0.08).toFixed(2)}s">${resPic(r)}</span>`).join('')}</div>
    <img class="udGhost" src="${esc(artSrc('ud_ghost'))}" alt=""></div><div class="udLine"></div></div>`, 'tug');
  say('せーの！ オーエス！ オーエス！'); sfx('pan'); sfx('cheer');
  const rope = $('#udRope'); let x = 0;
  for(let i=0;i<26;i++){
    const bias = (win ? -1 : 1) * (i/26) * 2.4;
    x = clamp(x + (Math.random()-0.5)*7 + bias, -46, 46); rope.style.transform = `translateX(${x}px)`;
    if(i%3===0) sfx('step'); if(i===12) say(win ? 'いいぞ！ ひっぱれ〜！' : 'おばけが つよい！ がんばれ！');
    await sleep(170);
  }
  rope.style.transition = 'transform .9s cubic-bezier(.3,1.4,.5,1)'; rope.style.transform = `translateX(${win ? -120 : 120}px)`;
  sfx('whistle'); await sleep(1000);
  say(win ? 'おばけに かった〜！！' : 'おばけに まけちゃった…');
  if(win) $('#udView .udGhost').classList.add('fly');
}
async function udFinish(){
  musicStop();
  const D = udData(), w = UD.wins.filter(Boolean).length, got = [];
  D.day = dayKey(); D.n++; misEv('ud'); D.wins += w; D.best = Math.max(D.best, w); D.last = w;
  got.push(`🪙 +${givePts(30*UD_EVENTS.length + 60*w + (w===5 ? 200 : 0), `運動会 ${w}しょう`)}pt`);
  const t = save.town, me = UD.me;
  me.fr = (me.fr||0) + 2 + w; got.push(`💗 ${me.name}の なかよし アップ`);
  if(w >= 3){ me.ab.work = Math.min(10, (me.ab.work||0) + 1); me.ab.know = Math.min(10, (me.ab.know||0) + 1); got.push(`🎽 ハチマキで ${me.name}の はたらく・ちしき +1`); }
  const drops = [];
  if(w === 5){ const f = D.got.includes('ud_trophy') ? (D.got.includes('ud_medal') ? null : 'ud_medal') : 'ud_trophy'; if(f) drops.push(f); }
  if(w >= 3 || Math.random() < 0.25){ const pool = UD_ITEMS.map(x => x.id), nw = pool.filter(id => !D.got.includes(id)); drops.push(choice(nw.length ? nw : pool)); }
  drops.forEach(id => { const f = FUR(id); if(f){ const H = ensureHome(); H.inv[id] = (H.inv[id]||0) + 1; } else t.inv[id] = (t.inv[id]||0) + 1;
    if(!D.got.includes(id)) D.got.push(id); discover(id); const o = f || ITEM(id); got.push(`<img src="${esc(artSrc(o.art))}" alt=""> ${esc(o.name)}（運動会 げんてい）`); });
  save.history.push({d:Date.now(), mode:'ud', kind:'ud', subj:'ud', n:UD.total, c:UD.correct, pt:0});
  persist(); checkBadges();
  const rank = w===5 ? '🏆 パーフェクト ゆうしょう！' : w>=3 ? '🥇 ゆうしょう！' : w>=2 ? '🥈 じゅんゆうしょう' : '🎽 さんかしょう';
  $('#udView').innerHTML = stageHTML(`<div class="udFinal"><img class="udTro" src="${esc(artSrc(w>=3 ? 'ud_trophy' : 'ud_medal'))}" alt=""><b>${rank}</b>
    <div class="udRow">${UD_EVENTS.map((e,i) => `<span class="${UD.wins[i]?'w':'l'}">${e.i}<small>${UD.wins[i]?'かち':'まけ'}</small></span>`).join('')}</div>
    <div class="udHero">${resPic(me)}<small>MVP：${esc(me.name)}　せいかい ${UD.correct}/${UD.total}</small></div></div>`, 'final');
  say(w >= 3 ? 'おめでとう〜！！ さいこうの 運動会だったね！' : 'みんな よく がんばった！ また あした！');
  sfx(w >= 3 ? 'win' : 'cheer'); if(w >= 3) confetti(3500);
  await sleep(1600);
  await dialog(`<h2 class="dlgT">${rank}</h2>${rewardHTML(got)}<p class="note">運動会 げんていの アイテムは まち・わたしの家に かざれるよ</p>`, [{label:'やったー！', cls:'gold', v:1}], 'gold');
  show('home');
}
PARENT.ud = 'home';
BADGES.push({id:'ud1', i:'🏅', n:'はじめての 運動会', f:()=>(save.ud?.n||0)>=1}, {id:'ud5', i:'🏆', n:'運動会 パーフェクト', f:()=>(save.ud?.best||0)>=5}, {id:'ud10', i:'🎽', n:'運動会 10かい', f:()=>(save.ud?.n||0)>=10});
MISSIONS.ud1 = {ev:'ud', n:1, i:'🏅', t:'運動会に さんかしよう'};

/* =====================================================================
   ホーム：運動会・おやつ・やりなおし
   ===================================================================== */
const _renderHome28 = renderHome;
renderHome = function(){
  _renderHome28();
  $('#homeExtra')?.remove();
  const D = udData(), nq = reviewItems().length + weakKanji().length, B = foodBag(), nf2 = Object.values(B).reduce((a,b)=>a+b,0), b = buffNow();
  $('#evArea').insertAdjacentHTML('beforebegin', `<div id="homeExtra">
    <button class="card udCard ${udDoneToday()?'done':''}" id="btnUd" style="background-image:linear-gradient(90deg,rgba(255,255,255,.88) 40%,rgba(255,255,255,.2)),url(${artSrc('ud_field')})">
      <img src="${esc(artSrc('ud_trophy'))}" alt=""><div><b>🏅 どうぶつ運動会</b><small>${udDoneToday() ? `きょうは ${D.last}しょう！ また あした` : '1日1かい！ 住民と いっしょに ゆうしょうを めざそう'}</small></div><span class="udGo">${udDoneToday() ? '✔' : 'さんか！'}</span></button>
    <div class="homeMini"><button class="card hmBtn" id="btnReview"><i>🔁</i><b>まちがえた 問題</b><small>${nq ? `${nq}こ やりなおそう` : 'ないよ！ すごい'}</small>${nq ? `<span class="hmBadge">${nq}</span>` : ''}</button>
      <button class="card hmBtn" id="btnFood"><i>🍞</i><b>おやつ</b><small>${b ? `×${b.m} はつどう中` : nf2 ? `${nf2}こ もっている` : 'パン屋で かえるよ'}</small></button></div></div>`);
};
document.addEventListener('click', e => {
  if(e.target.closest('#btnUd')){ e.stopImmediatePropagation(); udOpen(); return; }
  if(e.target.closest('#btnReview')){ e.stopImmediatePropagation(); openReview(); return; }
  if(e.target.closest('#btnFood')){ e.stopImmediatePropagation(); openFoodBag(); return; }
}, true);

/* =====================================================================
   きろく：教科べつ・さいきんの 勉強を 正しく
   ===================================================================== */
const HIST_LBL = {math:'🔢 さんすう', soc:'🗾 しゃかい', sci:'🔬 りか', ek:'🔤 えいご', bun:'✍️ ぶんしょう', rev:'🔁 ふくしゅう', eng:'🌏 えいご（おとな）', prog:'🤖 プログラミング', ud:'🏅 運動会'};
function subjCount(s){
  const S = SUBJ[s]; let n = 0, c = 0;
  if(s==='kanji'){ const t = totals(); n += t.n; c += t.c; }
  if(s==='prog'){ const P = save.prog?.stars||{}; return {n:Object.keys(P).length, c:Object.keys(P).length, unit:'ステージ'}; }
  if(s==='eng'){ try{ n = E.hist.length; c = E.hist.filter(h => h.res==='o').length; }catch(e){} return {n, c, unit:'問'}; }
  (S.units ? S.units() : []).forEach(k => { const st = mSave().stats[k]; if(st){ n += st.n; c += st.c; } });
  return {n, c, unit:'問'};
}
const _renderRecord28 = renderRecord;
renderRecord = function(){
  _renderRecord28();
  const sc = $('#recSubj');
  if(sc) sc.innerHTML = Object.entries(SUBJ).map(([s,S]) => { const pc = subjPct(s), k = subjCount(s), tier = [...TIERS].reverse().find(t => pc >= t[0]);
    return `<button class="rsCard" data-rs2="${s}"><div class="mbRing" style="--p:${pc}"><b>${pc}%</b><small>習得度</small></div>
      <div class="rsTxt"><b>${tier ? tier[1] : '🔰'} ${S.n}</b><small>${nf(k.n)}${k.unit} とりくんだ</small><small>${k.unit==='問' && k.n ? `せいかいりつ ${Math.round(k.c/k.n*100)}%` : k.unit==='ステージ' ? `★${Object.values(save.prog?.stars||{}).reduce((a,b)=>a+b,0)}` : '—'}</small></div></button>`; }).join('');
  const wk = $('#recWeak2');
  if(wk){ const by = {}; reviewItems().forEach(w => { const k = kindOfKey(w.u); by[k] = (by[k]||0) + 1; }); const nk = weakKanji().length;
    const NM = {math:'🔢 さんすう', soc:'🗾 しゃかい', sci:'🔬 りか', ek:'🔤 えいご'};
    wk.innerHTML = `<div class="revSum">${Object.entries(by).map(([k,n]) => `<span>${NM[k]||k} <b>${n}</b></span>`).join('')}<span>🀄 かんじ <b>${nk}</b></span></div>
      <button class="btn pink" id="btnReview2" style="width:100%">🔁 まちがえた 問題を やりなおす</button>`; }
  $('#recHist').innerHTML = save.history.slice(-25).reverse().map(h => {
    const lbl = h.subj ? HIST_LBL[h.subj] : h.mode==='math' ? '🔢 さんすう など' : `🀄 かんじ ${h.mode==='test' ? 'テスト' : 'れんしゅう'}・${h.kind==='write' ? '書き' : '読み'}`;
    return `<div><span class="d">${fmtDT(h.d)}</span>${lbl}　${h.subj==='prog' ? 'ステージ クリア' : `${h.c}/${h.n}問 せいかい`}${h.b?`・⭐${h.b}`:''}</div>`; }).join('') || '<div class="note">まだ ないよ</div>';
};
document.addEventListener('click', e => {
  if(e.target.closest('#btnReview2')){ e.stopImmediatePropagation(); openReview(); return; }
  const b = e.target.closest('[data-rs2]'); if(!b) return; e.stopImmediatePropagation();
  const s = b.dataset.rs2; ({kanji:() => show('kmode'), math:() => show('math'), soc:() => show('soc'), sci:() => show('sci'), ek:() => show('ekid'), prog:() => { show('prog'); renderProgSel(); }, eng:() => show('eng')})[s]?.();
}, true);
/* えいご（おとな）と プログラミングも きろくに */
const _engFinish28 = engFinish;
engFinish = function(){ const r = ES.res || []; if(r.length){ save.history.push({d:Date.now(), mode:'eng', kind:'eng', subj:'eng', n:r.length, c:r.filter(x => x.res==='o').length}); persist(); } return _engFinish28(); };
const _misEv28 = misEv;
misEv = function(ev, k=1){ if(ev==='prog'){ save.history.push({d:Date.now(), mode:'prog', kind:'prog', subj:'prog', n:1, c:1}); persist(); } return _misEv28(ev, k); };


/* =====================================================================
   v2.9：漢字テストの えらんだ 漢字を のこす＋けんさく・
         わたしの家の しまう バグ修正・まちを 大きく＋線路の 上にも マス
   ===================================================================== */
/* ---------- 漢字テスト：えらんだ 漢字を のこす ---------- */
const kata2hira = s => String(s||'').replace(/[\u30A1-\u30F6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
let tselQ = '';
function tselSave(){ save.tselSaved = save.tselSaved || {}; save.tselSaved[save.menu.kind] = [...tsel]; persist(); }
function tselLoad(){ const S = (save.tselSaved||{})[save.menu.kind] || []; tsel = new Set(S.filter(k => tselMap.has(k))); }
openTestSelect = function(){ buildTselMap(); tselLoad(); tselTab = tsel.size ? 'sel' : 'all'; tselQ = ''; renderTsel(); show('tsel'); };
const _visibleKanji29 = visibleKanji;
visibleKanji = function(){
  const keys = [...tselMap.keys()], q = kata2hira(tselQ.trim());
  if(q) return keys.filter(k => k.includes(q) || (tselMap.get(k)||[]).some(x => (x.word||'').includes(q) || (x.text||'').includes(q) || kata2hira(x.reading||'').includes(q) || kata2hira(x.kanjiReading||'').includes(q)));
  if(tselTab==='sel') return keys.filter(k => tsel.has(k));
  if(tselTab==='last'){ const L = (save.tselLast||{})[save.menu.kind] || []; return L.filter(k => tselMap.has(k)); }
  return _visibleKanji29();
};
const _renderTsel29 = renderTsel;
renderTsel = function(){
  _renderTsel29();
  const last = ((save.tselLast||{})[save.menu.kind] || []).length;
  $('#tselTabs').insertAdjacentHTML('afterbegin', `<button data-v="sel" class="${tselTab==='sel'&&!tselQ?'on':''}">✅ えらんだ漢字（${tsel.size}）</button>` + (last ? `<button data-v="last" class="${tselTab==='last'&&!tselQ?'on':''}">🕘 まえの テスト（${last}）</button>` : ''));
  if(tselQ) $$('#tselTabs button').forEach(b => b.classList.remove('on'));
  if(!$('#tselSearch')) $('.tselHead').insertAdjacentHTML('afterbegin', `<div class="tselSearch"><input id="tselSearch" placeholder="🔍 漢字・ことば・よみで さがす（れい：安、やす、がっき）" autocomplete="off"><button class="btn small white" id="tselClr">✕</button></div>`);
  $('#tselSearch').value = tselQ;
  if(tselQ && !visibleKanji().length) $('#kgrid').innerHTML = `<div class="note" style="grid-column:1/-1;padding:20px;text-align:center">「${esc(tselQ)}」は 見つからなかったよ</div>`;
  tselSave();
};
document.addEventListener('input', e => { if(e.target.id!=='tselSearch') return; tselQ = e.target.value; const pos = e.target.selectionStart; renderTsel(); const i = $('#tselSearch'); i.focus(); try{ i.setSelectionRange(pos,pos); }catch(_){} });
document.addEventListener('click', e => {
  if(e.target.closest('#tselClr')){ tselQ = ''; renderTsel(); return; }
  const b = e.target.closest('#tselTabs button'); if(b){ tselQ = ''; }
}, true);
$('#tselKind').addEventListener('click', () => setTimeout(() => { tselLoad(); renderTsel(); }, 0));
$('#btnTestStart').addEventListener('click', () => { save.tselLast = save.tselLast || {}; save.tselLast[save.menu.kind] = [...tsel]; tselSave(); }, true);

/* =====================================================================
   わたしの家：しまう バグ修正（ふえる バグ）
   ===================================================================== */
function homeCount(id){ const H = roomData(); let n = H.inv[id]||0; n += H.items.filter(i => i.id===id).length;
  Object.entries(H.rooms||{}).forEach(([rid,R]) => { if(rid!==H.roomCur && R && R.items) n += R.items.filter(i => i.id===id).length; }); return n; }
$('#btnHomeStore').onclick = null;
$('#btnHomeStore').addEventListener('click', e => {
  e.stopImmediatePropagation();
  const H = ensureHome(), sel = H.items[homeSel];
  if(homeHand){
    if(homeHand.from==='map'){ H.inv[homeHand.id] = (H.inv[homeHand.id]||0) + 1; }
    homeHand = null;               // もちものから 手に もっていた ときは 何も ふやさない
  } else if(sel){
    H.items.splice(homeSel, 1); H.inv[sel.id] = (H.inv[sel.id]||0) + 1; homeSel = -1;
  }
  persist(); renderMyHome();
}, true);
/* 手に もっている ときは タッチで えらべない・しまうを 押すと 置いた ものを しまう */
const _renderHomeTray29 = renderHomeTray;
renderHomeTray = function(){
  _renderHomeTray29();
  const H = ensureHome(), btn = $('#btnHomeStore'); if(!btn) return;
  if(homeHand && homeHand.from==='inv'){ btn.disabled = false; btn.textContent = '✋ もつのを やめる'; }
  else btn.textContent = '🗃 しまう';
  Object.keys(H.inv).forEach(k => { if(!(H.inv[k] > 0)) delete H.inv[k]; });
};
/* へやの データの ずれを なおす（いちど だけ） */
function homeRepair(){
  const H = roomData(); if(H.fix29) return; H.fix29 = 1;
  // 同じ へやの 配列を 2つの へやが 共有していたら はなす
  const seen = new Set();
  Object.entries(H.rooms||{}).forEach(([rid,R]) => { if(!R) return; if(rid===H.roomCur){ R.items = H.items; return; } if(seen.has(R.items) || R.items===H.items) R.items = (R.items||[]).map(i => ({...i})); seen.add(R.items); });
  // かさなって 置かれている 家具は もちものへ
  const ok = [];
  H.items.forEach(it => { const f = FUR(it.id); if(!f){ return; } const keep = H.items.filter(o => ok.includes(o)); 
    const [w,h] = fpOf(it.id, it.r); let clash = false;
    keep.forEach(o => { const fo = FUR(o.id); if(!!fo?.floor !== !!f.floor) return; const [w2,h2] = fpOf(o.id, o.r);
      if(it.x < o.x+w2 && o.x < it.x+w && it.y < o.y+h2 && o.y < it.y+h) clash = true; });
    if(clash || it.x < 0 || it.y < 0 || it.x + w > ROOM.cols || it.y + h > ROOM.rows) H.inv[it.id] = (H.inv[it.id]||0) + 1; else ok.push(it); });
  H.items.splice(0, H.items.length, ...ok);
  Object.keys(H.inv).forEach(k => { if(!(H.inv[k] > 0) || !FUR(k)) delete H.inv[k]; });
  persist();
}
/* へやを かえるとき、もようがえの 手もちを もどす */
const _switchRoom29 = switchRoom;
switchRoom = function(id){ if(homeHand && homeHand.from==='map'){ const H = ensureHome(); H.inv[homeHand.id] = (H.inv[homeHand.id]||0) + 1; } homeHand = null; homeSel = -1; return _switchRoom29(id); };
/* homeSel が はみ出していたら リセット */
const _renderMyHome29 = renderMyHome;
renderMyHome = function(){ homeRepair(); const H = ensureHome(); if(homeSel >= H.items.length) homeSel = -1; if(homeHand && !FUR(homeHand.id)) homeHand = null; if(homeHand && homeHand.from==='inv' && !(H.inv[homeHand.id] > 0)) homeHand = null; return _renderMyHome29(); };
/* おねがいで わたす とき：今の へやに なければ ほかの へやから */
function takeFurniture(id){
  const H = roomData();
  if((H.inv[id]||0) > 0){ H.inv[id]--; if(!H.inv[id]) delete H.inv[id]; return true; }
  let i = H.items.findIndex(x => x.id===id); if(i >= 0){ H.items.splice(i, 1); return true; }
  for(const [rid,R] of Object.entries(H.rooms||{})){ if(rid===H.roomCur || !R?.items) continue; i = R.items.findIndex(x => x.id===id); if(i >= 0){ R.items.splice(i, 1); return true; } }
  return false;
}
const _reqProg29 = reqProg;
reqProg = function(q){ if(q.kind==='fur') return [(q.given || homeCount(q.id) > 0) ? 1 : 0, 1]; return _reqProg29(q); };
completeReq = (orig => async function(q){
  if(q && q.kind==='fur' && !q.given && reqDone(q)){ if(!takeFurniture(q.id)) return; q.given = true; persist(); }
  return orig(q);
})(completeReq);

/* =====================================================================
   まち：レベルごとに もっと 大きく ＋ 線路の 上にも マス
   ===================================================================== */
const BIG = [[6,5],[8,6],[9,7],[10,8],[12,9],[13,10],[15,11],[16,12],[18,13],[19,14],[21,15],[22,16]];
TOWN_LEVELS.forEach((L,i) => { const b = BIG[i]; if(b){ L.cols = Math.max(L.cols, b[0]); L.rows = Math.max(L.rows, b[1]); } });
const RAIL = {row:2, h:0, on:false};
function railRow(L){ return Math.min(2, Math.max(1, L.rows - 2)); }
const _renderMap29 = renderMap;
renderMap = function(){
  const rail = $('#railStrip'), world = $('#townWorld');
  if(rail && rail.parentElement !== world) world.insertBefore(rail, world.firstChild);
  RAIL.on = false; RAIL.h = 0;
  _renderMap29();
  const L = townCalc().L, map = $('#townMap');
  if(rail && !rail.classList.contains('hidden')){
    RAIL.row = railRow(L);
    const ref = map.querySelector(`.cell[data-x="0"][data-y="${RAIL.row}"]`);
    if(ref){ map.insertBefore(rail, ref); rail.classList.add('inMap'); RAIL.h = rail.offsetHeight; RAIL.on = true; }
  } else if(rail) rail.classList.remove('inMap');
  // 位置を つけなおす
  WK.st.forEach(s => { if(s.el) place(s, true); });
  CAR.list.forEach(c => placeCar(c, true));
};
const railOff = y => (RAIL.on && y >= RAIL.row) ? RAIL.h : 0;
const _walkPos29 = walkPos;
walkPos = function(s){ const p = _walkPos29(s); p.top += railOff(s.y); return p; };
const _placeCar29 = placeCar;
placeCar = function(c, instant){ _placeCar29(c, instant); if(c.el && RAIL.on){ c.el.style.top = (parseFloat(c.el.style.top) + railOff(c.y)) + 'px'; } };
paintW = (orig => function(s){ if(!RAIL.on) return orig(s); const el = s.el; if(!el) return;
  const W = WK.cs*0.62, py = s.py, bandTop = RAIL.row*WK.cs;
  el.style.transform = `translate3d(${s.px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
  const feetPx = py + W*1.12 + 2, rowF = feetPx > bandTop + RAIL.h ? (feetPx - RAIL.h)/WK.cs - 1 : Math.min(feetPx/WK.cs - 1, RAIL.row - 0.5);
  el.style.zIndex = Math.max(0, Math.ceil(rowF - 0.02))*10 + 5; })(paintW);


/* =====================================================================
   v3.0：まちがえた問題の 修正・ホームの アイコン・ふみきり
   ===================================================================== */
/* ---------- にがての 漢字：正解したら きえる ---------- */
function kclr(){ return save.kclr || (save.kclr = {}); }
weakKanji = function(){
  const H = qh(), C = kclr();
  return BUILTIN.concat(customQs||[]).filter(q => {
    if(C[q.id]) return false;
    const s = save.stats[q.id], hr = H['kr:'+q.id], hw = H['kw:'+q.id];
    const qhWeak = (hr && hr.w > 0 && hr.s === 0) || (hw && hw.w > 0 && hw.s === 0);
    return qhWeak || (s && (s.r[1] > s.r[0] || s.w[1] > s.w[0]));
  });
};
const _qhRec30 = qhRec;
qhRec = function(key, ok){
  _qhRec30(key, ok);
  const m = /^k[rw]:(.+)$/.exec(key); if(m){ if(ok) kclr()[m[1]] = 1; else delete kclr()[m[1]]; persist(); }
};
weakSession = function(kind){
  const list = shuffle(weakKanji().slice()).slice(0, 10);
  if(!list.length){ toast('ふくしゅうする 漢字が ないよ'); return; }
  startSession('practice', kind, list);
};
$('#weakWrite') && ($('#weakWrite').onclick = () => weakSession('write'));
$('#weakRead') && ($('#weakRead').onclick = () => weakSession('read'));
/* ---------- まとめて やりなおし（さんすう・しゃかい・りか・えいご＋漢字） ---------- */
MATH_UNITS.kq_rev = {n:'にがての 漢字', g:'rev', art:'icon_read', gen(){ const W = weakKanji(), q = choice(W.length ? W : BUILTIN), m = kanjiMQ(q, true); return {type:'choice', q:m.html, ans:m.ans, opts:m.opts, kid:q.id, sub:'kq'+q.id}; }};
const revCount = () => reviewItems().filter(w => w.u!=='kq_rev').length + weakKanji().length;
reviewItems = function(){ return weakQ().filter(w => MATH_UNITS[w.u] && w.u!=='kq_rev'); };
reviewStart = function(){
  const W = reviewItems().map(w => ({u:w.u, type:w.type, q:w.q, ans:w.ans, opts:w.opts ? w.opts.slice() : undefined, disp:w.disp, hint:w.hint, optHtml:w.optHtml, wk:w.k}));
  const K = weakKanji().map(q => { const m = kanjiMQ(q, true); return {u:'kq_rev', type:'choice', q:m.html, ans:m.ans, opts:m.opts, kid:q.id, hint:m.hint}; });
  const list = shuffle(W.concat(K)).slice(0, 15);
  if(!list.length){ toast('まちがえた 問題は ないよ！ すごい！'); return; }
  window.MQREV = true; window.MQSCI = window.MQEK = window.MQBUN = false; window.MQSOC = !list.some(p => typeof MATH_UNITS[p.u].g === 'number');
  $('#mPlayTag').textContent = 'ふくしゅう'; $('#mPlayTag').style.background = '#E0577A';
  MQ = {list, i:0, res:[], pts:0, t0:Date.now(), combo:0, soc:window.MQSOC}; show('mathplay'); mRender();
};
const _mJudge30 = mJudge;
mJudge = function(v){
  const was = MQ && MQ.done, p = MQ.list[MQ.i];
  const out = _mJudge30(v);
  if(!was && p){
    const ok = MQ.res[MQ.res.length-1]?.ok;
    if(p.u==='kq_rev'){
      save.weakQ = weakQ().filter(x => x.u!=='kq_rev');
      const q = BUILTIN.concat(customQs||[]).find(x => x.id===p.kid);
      if(q){ addStat(q, 'read', ok, 1); if(ok) kclr()[q.id] = 1; else delete kclr()[q.id]; }
    } else if(p.wk){
      const k2 = qKeyOf(p);
      if(ok) save.weakQ = weakQ().filter(x => x.k!==p.wk && x.k!==k2);
      else save.weakQ = weakQ().filter(x => x.k===p.wk || x.k!==k2);
    }
    persist();
  }
  return out;
};
const _hardUnits30 = hardUnits;
hardUnits = function(units, soc){ return _hardUnits30(units.filter(u => u!=='kq_rev').length ? units.filter(u => u!=='kq_rev') : ['big'], soc); };
openReview = async function(){
  const nq = reviewItems().length, nk = weakKanji().length, tot = nq + nk;
  if(!tot){ await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('bird_jump'))}" alt=""></div><h2 class="dlgT">まちがえた 問題は ないよ！</h2><p class="dlgP">この ちょうしで がんばろう！</p>`, [{label:'うん！', cls:'pink', v:1}]); return; }
  const by = {}; reviewItems().forEach(w => { const k = kindOfKey(w.u); by[k] = (by[k]||0) + 1; });
  const NM = {math:'🔢 さんすう', soc:'🗾 しゃかい', sci:'🔬 りか', ek:'🔤 えいご'};
  const v = await dialog(`<div class="dlgArt"><img src="${esc(artSrc('ic_review'))}" alt=""></div><h2 class="dlgT">まちがえた 問題を やりなおそう</h2>
    <div class="revSum">${Object.entries(by).map(([k,n]) => `<span>${NM[k]||k} <b>${n}</b></span>`).join('')}${nk ? `<span>🀄 かんじ <b>${nk}</b></span>` : ''}</div>
    <p class="dlgP" style="font-size:13px">ぜんぶで <b>${tot}問</b>。せいかいすると リストから きえるよ！</p>`,
    [{label:`🔁 やりなおす（${Math.min(15, tot)}問）`, cls:'pink', v:'q'}].concat(nk ? [{label:'✏️ 漢字を 書いて ふくしゅう', cls:'orange', v:'k'}] : []).concat([{label:'あとで', cls:'white', v:null}]), 'wide');
  if(v==='q') reviewStart();
  if(v==='k') weakSession('write');
};
/* ---------- ホームの アイコンを イラストに ---------- */
const _renderHome30 = renderHome;
renderHome = function(){
  _renderHome30();
  const r = $('#btnReview i'), f = $('#btnFood i'), n = revCount();
  if(r) r.outerHTML = `<img class="hmIco" src="${esc(artSrc('ic_review'))}" alt="">`;
  if(f) f.outerHTML = `<img class="hmIco" src="${esc(artSrc('ic_snack'))}" alt="">`;
  const s = $('#btnReview small'), bd = $('#btnReview .hmBadge');
  if(s) s.textContent = n ? `${n}こ やりなおそう` : 'ないよ！ すごい';
  if(bd){ if(n) bd.textContent = n; else bd.remove(); } else if(n) $('#btnReview')?.insertAdjacentHTML('beforeend', `<span class="hmBadge">${n}</span>`);
};

/* =====================================================================
   ふみきり
   ===================================================================== */
if(!TOWN_ITEMS.some(x => x.id==='road_crossing')) TOWN_ITEMS.push({id:'road_crossing', type:'bld', cat:'rail', name:'ふみきり', art:'bld_crossing', emoji:'🚧', price:300, lv:3, dev:8, desc:'線路の すぐ 上か 下の マスに おくと、そこから 線路を わたれるよ'});
ZUKAN_INFO.road_crossing = 'カンカンカン…！ 電車が くると しゃだんきが おりる。';
function crossCols(){ const c = save.town.cells, s = new Set(); Object.entries(c).forEach(([k,id]) => { if(id!=='road_crossing') return; const [x,y] = k.split(',').map(Number); if(y===RAIL.row || y===RAIL.row-1) s.add(x); }); return s; }
function railBlock(x, y, nx, ny){
  if(!RAIL.on || x!==nx) return false;
  if(Math.min(y,ny)!==RAIL.row-1 || Math.max(y,ny)!==RAIL.row) return false;
  const cs = crossCols(); if(!cs.size) return false;
  return !cs.has(x);
}
const _renderMap30 = renderMap;
renderMap = function(){
  _renderMap30();
  const rail = $('#railStrip'); if(!rail) return;
  rail.querySelectorAll('.xBand').forEach(e => e.remove());
  if(!RAIL.on) return;
  const cs = WK.cs;
  crossCols().forEach(x => rail.insertAdjacentHTML('beforeend', `<div class="xBand" style="left:${x*cs}px;width:${cs}px"><i class="xg l"></i><i class="xg r"></i><b class="xl l"></b><b class="xl r"></b></div>`));
  Object.entries(save.town.cells).forEach(([k,id]) => { if(id!=='road_crossing') return; const [x,y] = k.split(','), c = $(`#townMap .cell[data-x="${x}"][data-y="${y}"]`); if(c) c.insertAdjacentHTML('beforeend', `<img class="xingImg" src="${esc(artSrc('bld_crossing'))}" alt="">`); });
};
/* 地図などの 大きな 図が ある 問題も にがてに のこす（図は あとで 作りなおす） */
addWeak = function(p){
  if(!p || p.bonus || p.u==='kq_rev') return; const k = qKeyOf(p), W = weakQ();
  if(W.some(x => x.k===k)) return;
  const big = (p.disp||'').length > 9000 || JSON.stringify(p.optHtml||'').length > 9000;
  W.push({k, u:p.u, type:p.type, q:p.q, ans:p.ans, opts:p.opts, disp: big ? '' : (p.disp||''), big: big ? 1 : 0, hint:p.hint||'', optHtml: big ? undefined : p.optHtml, dk:p.dk, sub:p.sub});
  if(W.length > 40) W.shift();
};
function rehydrate(w){
  if(!w.big) return w;
  const U = MATH_UNITS[w.u]; if(!U) return w;
  for(let i=0;i<400;i++){ const g = U.gen(); if(stripTags(g.q)===stripTags(w.q) && g.ans===w.ans && (!w.sub || g.sub===w.sub)) return Object.assign({}, w, {disp:g.disp, optHtml:g.optHtml, opts:w.opts||g.opts}); }
  for(let i=0;i<400;i++){ const g = U.gen(); if(g.ans===w.ans) return Object.assign({}, w, {q:g.q, disp:g.disp, optHtml:g.optHtml, opts:g.opts}); }
  return w;
}
const _reviewStart30 = reviewStart;
reviewStart = function(){
  const save0 = save.weakQ; save.weakQ = weakQ().map(w => Object.assign(rehydrate(w), {k:w.k}));
  try{ _reviewStart30(); } finally { save.weakQ = save0; }
};
weakToMQ = (orig => function(it){ if(it.w) it = Object.assign({}, it, {w:rehydrate(it.w)}); return orig(it); })(weakToMQ);
picHTML = (orig => function(o, cls=''){ if(o && o.id==='road_crossing') return `<img class="${cls}" src="${esc(artSrc('bld_crossing'))}" alt="">`; return orig(o, cls); })(picHTML);


/* =====================================================================
   v3.1：えきの いどう・運動会の アイコン・レア度べつ 登場演出・
         ずかんの レイアウト・屋台の たてもの・お店の しなぞろえ
   ===================================================================== */
/* ---------- えき：もようがえで うごかせる（線路の となりだけ） ---------- */
const RAIL_B = new Set(['station','bigstation','platform']);
const railAdj = y => RAIL.on && (y === RAIL.row - 1 || y === RAIL.row);
document.addEventListener('click', e => {
  if(!townEdit || curScreen!=='town') return;
  const c = e.target.closest('#townMap .cell'); if(!c) return;
  const t = save.town, key = `${c.dataset.x},${c.dataset.y}`, cur = t.cells[key], y = +c.dataset.y;
  if(!hand && cur && RAIL_B.has(cur)){ e.stopImmediatePropagation(); delete t.cells[key]; hand = {id:cur, from:'map', key}; persist(); renderTown(); toast(`${ITEM(cur).name}を もったよ。線路の すぐ 上か 下の マスに おいてね`); return; }
  if(hand && RAIL_B.has(hand.id) && !cur && !railAdj(y)){ e.stopImmediatePropagation(); toast('🚉 えきは 線路の すぐ 上か 下の マスに おいてね'); }
}, true);
const _endEdit31 = endEdit;
endEdit = function(silent){
  const t = save.town;
  if(hand && hand.from==='map' && RAIL_B.has(hand.id) && hand.key && t.cells[hand.key]){
    const free = Object.keys(t.cells).length, L = townCalc().L; let spot = null;
    for(let x=0;x<L.cols && !spot;x++) for(const yy of [RAIL.row-1, RAIL.row]) if(!t.cells[`${x},${yy}`]){ spot = `${x},${yy}`; break; }
    if(spot){ t.cells[spot] = hand.id; hand = null; }
  }
  return _endEdit31(silent);
};
/* 線路の 上に ホームを のばす */
const _renderMap31 = renderMap;
renderMap = function(){
  _renderMap31();
  const rail = $('#railStrip'); if(!rail || !RAIL.on) return;
  rail.querySelectorAll('.stnBand').forEach(e => e.remove());
  const cs = WK.cs;
  Object.entries(save.town.cells).forEach(([k,id]) => { if(!RAIL_B.has(id)) return; const [x,y] = k.split(',').map(Number);
    if(!railAdj(y)){ return; }
    const w = id==='station' ? 1 : 2, x0 = Math.max(0, x - (w-1)/2);
    rail.insertAdjacentHTML('beforeend', `<div class="stnBand ${y===RAIL.row-1?'top':'bot'}" style="left:${x0*cs}px;width:${w*cs}px"><i></i></div>`);
    const cell = $(`#townMap .cell[data-x="${x}"][data-y="${y}"]`); if(cell) cell.classList.add(y===RAIL.row-1 ? 'stnTop' : 'stnBot'); });
};
/* もともと 線路から はなれて いる えきは いちど だけ 線路の となりへ */
function fixStations(){
  const t = save.town; if(t.stnFix || !RAIL.on) return; t.stnFix = 1;
  const L = townCalc().L;
  Object.entries({...t.cells}).forEach(([k,id]) => { if(!RAIL_B.has(id)) return; const y = +k.split(',')[1]; if(railAdj(y)) return;
    for(let x=0;x<L.cols;x++) for(const yy of [RAIL.row-1, RAIL.row]){ const nk = `${x},${yy}`; if(!t.cells[nk]){ delete t.cells[k]; t.cells[nk] = id; if(t.glv && t.glv[k]){ t.glv[nk] = t.glv[k]; delete t.glv[k]; } return; } } });
  persist();
}
const _renderTown31 = renderTown;
renderTown = function(){ _renderTown31(); if(RAIL.on && !save.town.stnFix){ fixStations(); _renderTown31(); } };

/* ---------- 運動会の アイコン ---------- */
UD_EVENTS.forEach(e => { e.art = 'udi_' + e.id; });
const udIco = e => `<img class="udIco" src="${esc(artSrc(e.art))}" alt="">`;
const _udOpen31 = udOpen;
udOpen = async function(){ await _udOpen31(); const el = $('#udView .udEvList'); if(el) el.innerHTML = UD_EVENTS.map(e => `<span>${udIco(e)} ${e.n}</span>`).join(''); };
const _udEvent31 = udEvent;
udEvent = async function(ev){
  const ob = new MutationObserver(() => {
    const t = $('#udView .udEvTitle > i'); if(t && !t.querySelector('img')) t.innerHTML = `<img class="udIcoBig" src="${esc(artSrc(ev.art))}" alt="">`;
    $$('#dlgBody .udQHead > span:first-child').forEach(s => { if(!s.querySelector('img')) s.innerHTML = `${udIco(ev)} ${ev.n}`; });
  });
  ob.observe(document.body, {childList:true, subtree:true});
  try{ return await _udEvent31(ev); } finally { ob.disconnect(); }
};
const _udFinish31 = udFinish;
udFinish = async function(){
  const ob = new MutationObserver(() => { $$('#udView .udRow span').forEach((s,i) => { if(!s.querySelector('img') && UD_EVENTS[i]) s.firstChild.replaceWith(Object.assign(document.createElement('img'), {className:'udIco', src:artSrc(UD_EVENTS[i].art)})); }); });
  ob.observe(document.body, {childList:true, subtree:true});
  try{ return await _udFinish31(); } finally { ob.disconnect(); }
};

/* ---------- レア度べつ 登場演出 ---------- */
arrival = (orig => async function(r, title){
  const k = SP(r.sp).rar || 1;
  if(k >= 2 && k <= 4){
    const L = {2:['✦ ちょっとレア ✦','silver'], 3:['★ レア ★','gold'], 4:['🌈 ちょうレア 🌈','rainbow']}[k];
    sound('fan'); if(k >= 3) confetti(k===4 ? 4000 : 2400);
    await dialog(`<div class="arrFx a${k}"><div class="afRays"></div>${k===4 ? '<div class="afRing"></div><div class="afRing r2"></div>' : ''}
      <div class="afSpk">${[...Array(k===4 ? 16 : k===3 ? 10 : 6)].map((_,i) => `<i style="--a:${i*(360/(k===4?16:k===3?10:6))}deg;--d:${(i%4)*0.15}s"></i>`).join('')}</div>
      <img class="afLetter" src="${esc(artSrc(k>=3 ? 'itm_goldletter' : 'itm_letter'))}" alt=""><b class="afT">${L[0]}</b><small class="afS">${k===4 ? 'にじいろの ひかりが あふれだした…！' : k===3 ? 'きんいろに かがやいている！' : 'ぎんいろに ひかっている！'}</small></div>`,
      [{label: k===4 ? '🌈 ひらく！' : 'ひらく！', cls:'gold', v:1}], 'arrCard a'+k);
    const _d = dialog;
    dialog = function(h, b, c){ dialog = _d; return _d(h, b, (c||'') + ' arrShow a'+k); };
    try{ return await _arrival(r, title || 'あたらしい じゅうみんが やってきた！'); } finally { dialog = _d; }
  }
  return orig(r, title);
})(arrival);

/* ---------- 屋台の たてもの ---------- */
const STALLS = [
  {id:'takoyaki', name:'たこやきやさん', art:'bld_takoyaki', emoji:'🐙', price:900, lv:3, dev:25, income:12},
  {id:'crepe', name:'クレープやさん', art:'bld_crepe', emoji:'🥞', price:1000, lv:3, dev:25, income:12},
  {id:'icecream', name:'アイスクリームやさん', art:'bld_icecream', emoji:'🍦', price:1100, lv:4, dev:28, income:14},
  {id:'ramen', name:'ラーメンやさん', art:'bld_ramen', emoji:'🍜', price:1400, lv:5, dev:32, income:18}
];
STALLS.forEach(b => { if(!TOWN_ITEMS.some(x => x.id===b.id)) TOWN_ITEMS.push(Object.assign({type:'bld', cat:'bld'}, b)); });
Object.assign(ZUKAN_INFO, {takoyaki:'あつあつの たこやきを やく 屋台。', crepe:'いちごや バナナの クレープが 人気。', icecream:'つめたくて あまい アイスの お店。', ramen:'ゆげが もくもく。おいしい ラーメンの お店。'});
Object.assign(ACT_OF, {takoyaki:'shop', crepe:'shop', icecream:'shop', ramen:'shop'});
SCENES.festival.items = ['takoyaki','crepe','icecream','d_takoyaki','d_omikuji','d_crepe','d_icestand','d_carousel'];
SCENES.bakery.items = ['bakery','ramen'];

/* ---------- お店の しなぞろえ：その お店らしい ものに ---------- */
const FOOD2 = [
  ['tomato','トマト',40,1.1,10,'veg_tomato'],['carrot','にんじん',40,1.1,10,'veg_carrot'],['cabbage','キャベツ',50,1.1,15,'veg_cabbage'],['eggplant','なす',50,1.1,15,'veg_eggplant'],
  ['corn','とうもろこし',60,1.2,15,'veg_corn'],['daikon','だいこん',60,1.2,15,'veg_daikon'],['pumpkin','かぼちゃ',80,1.2,20,'veg_pumpkin'],['apple','りんご',70,1.2,15,'veg_apple'],
  ['banana','バナナ',70,1.2,15,'veg_banana'],['grapes','ぶどう',100,1.3,15,'veg_grapes'],['strawberry','いちご',120,1.3,20,'veg_strawberry'],['watermelon','すいか',150,1.4,20,'veg_watermelon'],
  ['takoyaki','たこやき',120,1.3,20,'bld_takoyaki'],['crepe','いちごクレープ',150,1.4,20,'bld_crepe'],['icecream','アイスクリーム',150,1.4,20,'bld_icecream'],['ramen','ラーメン',220,1.6,30,'bld_ramen']
].map(([id,n,price,m,min,art]) => ({id:'f_'+id, n, price, m, min, art}));
FOOD2.forEach(f => { if(!FD(f.id)) FOOD.push(f); });
const SHOP_FOOD = {market:['f_tomato','f_carrot','f_cabbage','f_eggplant','f_corn','f_daikon','f_apple','f_banana','f_pumpkin','f_grapes','f_strawberry','f_watermelon'],
  takoyaki:['f_takoyaki'], crepe:['f_crepe','f_strawberry','f_banana'], icecream:['f_icecream','f_strawberry'], ramen:['f_ramen','f_corn','f_cabbage']};
Object.assign(SHOPS, {
  takoyaki:{n:'たこやきやさん', i:'🐙', greet:['へい らっしゃい！ あつあつだよ〜','たこ 大きめに しといたよ！'], fur:[], only:[]},
  crepe:{n:'クレープやさん', i:'🥞', greet:['いらっしゃいませ♪ どれに する？','いちごクレープが 人気だよ！'], fur:[], only:[]},
  icecream:{n:'アイスクリームやさん', i:'🍦', greet:['ひんやり つめたいよ〜','とけないうちに めしあがれ！'], fur:[], only:[]},
  ramen:{n:'ラーメンやさん', i:'🍜', greet:['へい らっしゃい！','スープは 3日 かけて つくったよ！'], fur:[], only:[]}
});
SHOPS.market.greet = ['いらっしゃい！ しんせんな やさいと くだもの あるよ！','やさいを 食べると 元気が でるよ〜'];
SHOPS.library.greet = ['しずかに たのしんでね','べんきょうが はかどる 家具が あるよ'];
// お店ごとの 品物を 見直し（その お店らしい ものだけ）
const SHOP_GOODS = {
  dept:['armchair','toybox','mirror','dresser','wardrobe','beanbag','gametv','dollhouse','bigteddy','robot','unicorn','arcade','jukebox','canopybed','d_balloon','teddy'],
  library:['shelf','desk','wdesk','pcdesk','globe','lamp','rocking','telescope','easel'],
  hotel:['bathtub','washbasin','fireplace','andon','byobu','crystal','grandpiano','throne','canopybed'],
  dealer:['kart','jeep','beetle','convert','carriage','camperbus','sports','limo','ev'],
  post:['letter','goldletter','ticket'],
  market:[]
};
Object.keys(SHOP_ONLY).forEach(id => { if(['market','library','hotel'].includes(SHOP_ONLY[id]) && !(SHOP_GOODS[SHOP_ONLY[id]]||[]).includes(id)) delete SHOP_ONLY[id]; });
['birdcage','hamcage','cattree','dogbed','d_flowercart','d_topiary','d_bigpot','bonsai','terrarium','hangflower','sewing','pottery','harp','workbench'].forEach(id => { if(SHOP_ONLY[id]) delete SHOP_ONLY[id]; });
catalog = (orig => function(b){
  const g = (save.town.glv||{})[SHOP_KEY] || 0;
  if(SHOP_FOOD[b]){
    const ids = SHOP_FOOD[b], avail = Math.max(3, Math.ceil(ids.length*(0.4 + g*0.2)));
    return ids.map((id,i) => { const f = FD(id); return {id, kind:'food', name:`${f.n}（×${f.m}・${f.min}分）`, art:f.art, price:f.price, only:true, lockG: i >= avail ? Math.min(3, g + 1) : 0}; });
  }
  if(SHOP_GOODS[b] && SHOP_GOODS[b].length){
    const list = [];
    SHOP_GOODS[b].forEach(id => { const f = FUR(id), it = ITEM(id);
      if(f) list.push({id, kind:'fur', name:f.name, art:f.art, price:f.price});
      else if(it && it.type==='veh') list.push({id, kind:'veh', name:it.name, art:it.art, price:it.price});
      else if(it && it.type==='use') list.push({id, kind:'use', name:it.name, art:it.art, price:Math.round(priceOf(it)*0.9/10)*10});
      else if(it && it.cat==='deco') list.push({id, kind:'deco', name:it.name, art:it.art, price:it.price}); });
    list.forEach(c => c.only = SHOP_ONLY[c.id]===b);
    list.sort((a,c) => (a.only?1:0) - (c.only?1:0) || a.price - c.price);
    const base = 4, step = Math.max(2, Math.ceil((list.length - base)/3)), avail = base + step*g;
    return list.map((c,i) => Object.assign(c, {lockG: i >= avail ? Math.min(3, Math.ceil((i + 1 - base)/step)) : 0}));
  }
  return orig(b);
})(catalog);
// 八百屋の 植物は ふつうの ショップで かえる
const _shopList31 = shopList; shopList = function(){ return _shopList31().filter(it => !SHOP_ONLY[it.id]); };
// えいようの おやつ：パン屋 いがいの 食べものも おやつに
window.addEventListener('click', e => {
  const sb = e.target.closest('[data-sbuy^="food:f_"]'); if(!sb) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const [,id,price] = sb.dataset.sbuy.split(':'), p = +price, f = FD(id);
  if(save.points.bal < p){ toast('ポイントが たりないよ'); return; }
  const B = foodBag(); B[id] = (B[id]||0) + 1; givePts(-p, `${SHOPS[save.town.cells[SHOP_KEY]]?.n||'お店'}で ${f.n}を かった`); persist(); sound('ok');
  const card = sb.closest('.siIt'); card.classList.add('bought'); card.querySelector('small').textContent = `もっている ${B[id]}`;
  toast(`😋 ${f.n}を かったよ！ ホームの「おやつ」で たべられるよ`);
}, true);


/* =====================================================================
   v3.2：レア住民の 専用イラスト・運動会は 種目ごとに 選手を えらぶ・
         女の子の 会話（専用イラスト・パンを あげる・セリフ ぞうりょう）・
         せってい：住民を ふやす／へらす
   ===================================================================== */

/* =====================================================================
   女の子：会話を ふやす・場面ごとの イラスト・パンを あげる
   ===================================================================== */
const GIRL_ART = {
  talk:  ['scu_girl_sakura','scu_girl_snow','scu_girl_festival','scu_girl_stars'],
  quiz:  ['scu_girl_stars'],
  bread: ['scu_girl_bakery']
};
function girlArt(kind){ const L = (GIRL_ART[kind]||[]).filter(k => artSrc(k)); return L.length ? choice(L) : null; }
const GIRL_MORE = [
  'きのうの ゆめに シマエナガが 出てきたの。ふわふわだったよ〜',
  'わたしね、おおきく なったら パンやさんに なりたいんだ！',
  'さんすうの ひっさんって、パズルみたいで たのしいよね',
  'かんじって、ぶひんを くみあわせると おぼえやすいんだって！',
  'きょうの おやつ なにかなあ… メロンパンが いいな',
  'しってる？ ペンギンは そらを とべないけど、うみの 中では とっても はやいんだよ',
  'まちの みんなが えがおだと、わたしも うれしくなっちゃう',
  'つかれたら ちょっと きゅうけい しよ。がんばりすぎも だめだよ',
  'あしたは なにを しよっか。いっしょに かんがえよう！',
  'きみが べんきょうしてる すがた、かっこいいなって おもってるよ',
  'わたしの すきな ことばは「コツコツ」！ なんか かわいくない？',
  'いつか みんなで ピクニックに いきたいな〜',
  'さいきん ほしの なまえを おぼえてるんだ。オリオンざは わかる？',
  'ふゆに なったら ゆきだるま いっしょに つくろうね',
  'えへへ、ちょっとだけ おなか すいちゃった',
  'まちがえた 問題は、たからものなんだよ。そこから つよく なれるから！',
  '「ありがとう」って いうと、こころが ぽかぽか するよね',
  'このまえ ずかんを 見てたら、まだ あってない どうぶつが いっぱい いたよ',
  'きみと いると いつも たのしい！ これからも よろしくね',
  'ねえ、なぞなぞ すき？ パンは パンでも たべられない パンは なーんだ？… フライパン！'
];
const _girlLine32 = girlLine;
girlLine = function(r){
  const t = save.town, h = new Date().getHours(), B = foodBag(), buff = buffNow();
  const extra = [
    h < 10 ? 'おはよう！ きょうも いい 一日に しようね' : h < 17 ? 'こんにちは！ いっしょに がんばろう！' : 'こんばんは。きょうも おつかれさま！',
    `いま この まちには ${t.res.length}人の なかまが いるんだよ！`,
    buff ? `${buff.n}パワーで ポイント ×${buff.m}だよ！ いまの うちに がんばろう！` : (Object.keys(B).length ? 'おやつ もってるね！ たべると べんきょうの ポイントが ふえるよ' : 'パンやさんの パン、すっごく おいしいんだよ'),
    revCount() ? `まちがえた 問題が ${revCount()}こ あるよ。いっしょに やりなおそ？` : 'まちがえた 問題が ゼロ！ すごすぎる〜！',
    udDoneToday() ? 'きょうの うんどうかい、たのしかったね！' : 'きょうの うんどうかい、まだ だよ。いっしょに でよう！'
  ];
  return Math.random() < 0.3 ? _girlLine32(r) : choice(GIRL_MORE.concat(extra, extra));
};
function girlCard(r, kind, line, extraHtml=''){
  const a = girlArt(kind);
  if(!a) return null;
  return `<div class="gTalk ${kind}"><img class="gtImg" src="${esc(artSrc(a))}" alt=""><div class="gtLine"><b>${esc(r.name)}</b><span id="talkLine">${esc(line)}</span></div></div>${extraHtml}`;
}
async function girlTalk(r){
  const today = dayKey(); let gain = '';
  if(r.talked !== today){ r.talked = today; r.fr = (r.fr||0) + 1; persist(); gain = '<div class="frUp">💗 なかよし アップ！</div>'; }
  if(r.cheer !== today){ r.cheer = today; persist(); const p = givePts(20, `${r.name}の おうえん`); gain += `<div class="frUp">📣 おうえん +${p}pt</div>`; }
  misEv('talk'); sound('ok');
  let line = girlLine(r);
  if(Math.random() < 0.3){
    const v0 = await dialog(girlCard(r, 'quiz', 'ねえねえ！ もんだい 出しても いい？ わたしが 先生だよ〜') || '', [{label:'🎲 チャレンジ！', cls:'orange', v:'go'}, {label:'また こんど', cls:'white', v:null}], 'wide talk girlD');
    if(v0==='go'){ await girlQuiz(r); return; }
    line = 'そっか！ また こんど だね';
  }
  while(true){
    const hasFood = Object.values(foodBag()).some(n => n > 0);
    const v = await dialog(girlCard(r, 'talk', line, `<div class="frRow">なかよし ${hearts(r)}</div>${gain}`),
      [{label:'💬 もっと はなす', cls:'pink', v:'more'}].concat(hasFood ? [{label:'🍞 おやつを あげる', cls:'orange', v:'bread'}] : []).concat([{label:'🎲 もんだい', cls:'white', v:'quiz'}, {label:'👗 きがえ・くわしく', cls:'white', v:'info'}, {label:'またね！', cls:'', v:null}]), 'wide talk girlD');
    gain = '';
    if(v==='more'){ let n; do{ n = girlLine(r); }while(n===line); line = n; sound('tap'); continue; }
    if(v==='bread'){ await girlGift(r); continue; }
    if(v==='quiz'){ await girlQuiz(r); return; }
    if(v==='info'){ await openResident(r.id); }
    break;
  }
}
async function girlGift(r){
  const B = foodBag(), ids = Object.keys(B).filter(k => B[k] > 0);
  const v = await dialog(`<h2 class="dlgT">🍞 どれを あげる？</h2><div class="foodGrid">${ids.map(id => { const f = FD(id); return `<button class="foodIt" data-gv="${id}"><img src="${esc(artSrc(f.art))}" alt=""><b>${esc(f.n)}</b><i>×${B[id]}</i></button>`; }).join('')}</div>`, [{label:'やめる', cls:'white', v:null}], 'wide');
  const id = GIFT_PICK; GIFT_PICK = null; if(!id) return;
  B[id]--; if(!B[id]) delete B[id];
  r.fr = (r.fr||0) + 2; const f = FD(id), p = givePts(Math.round(f.price*0.3)+10, `${r.name}に ${f.n}を あげた`); persist(); sound('fan'); confetti(1500);
  const line = choice([`わあ！ ${f.n}！ ありがとう〜！ いっしょに たべよ！`, `${f.n}、だいすきなの！ なんで わかったの？`, `うれしい〜！ きみは ほんとうに やさしいね`, `もぐもぐ… しあわせ〜！ おれいに もっと おうえん するね！`]);
  await dialog(girlCard(r, 'bread', line, `<div class="frUp">💗 なかよし 大アップ！</div><div class="frUp">🪙 おれい +${p}pt</div>`) || line, [{label:'えへへ', cls:'pink', v:1}], 'wide talk girlD');
}
let GIFT_PICK = null;
document.addEventListener('click', e => { const b = e.target.closest('[data-gv]'); if(!b) return; e.stopImmediatePropagation(); GIFT_PICK = b.dataset.gv; $('#dlg').classList.remove('show'); $$('#dlgBtns button')[0]?.click(); }, true);
async function girlQuiz(r){
  const m = makeMQ(), a = girlArt('quiz');
  const head = a ? `<div class="gQuizHead"><img src="${esc(artSrc(a))}" alt=""><b>${esc(r.name)}せんせいの もんだい！</b></div>` : `<b>${esc(r.name)}の もんだい</b>`;
  const res = await askMQ(m, head);
  const gb = giftBoost(), got = [`🪙 +${givePts(Math.round(15*gb), `${r.name}の もんだいに ちょうせん`)}pt`];
  if(res.ok){ got.push(`⭐ +${givePts(Math.round(45*gb), `${r.name}の もんだいに せいかい`)}pt`); r.fr = (r.fr||0) + 1; confetti(1400); }
  persist(); misEv('quiz');
  await dialog(girlCard(r, res.ok ? 'bread' : 'talk', res.ok ? choice(['せいかい〜！ さすが わたしの あいぼう！','すごい すごい！ はなまる あげちゃう！','かんぺき！ 先生 びっくり しちゃった！']) : `ざんねん！ こたえは「${res.ans}」だよ。いっしょに おぼえようね！`, rewardHTML(got)) || '', [{label:'ありがとう！', cls:'pink', v:1}], 'wide talk girlD');
}
talkTo = (orig => async function(id, ctx){
  const r = save.town.res.find(x => x.id===id);
  if(r && SP(r.sp).human && !reqFor(id) && ctx!=='visit'){ r.talkedAt = Date.now(); return girlTalk(r); }
  return orig(id, ctx);
})(talkTo);

/* =====================================================================
   運動会：種目ごとに 選手を えらぶ
   ===================================================================== */
function udCands(){ return save.town.res.filter(r => !SP(r.sp).human); }
async function pickForEvent(ev){
  if(ev.team) return null;
  const used = UD.used || (UD.used = {});
  const L = udCands().map(r => ({r, p:udPower(r, ev, 0), n:used[r.id]||0})).sort((a,b) => b.p - a.p);
  const best = L[0]?.p || 1;
  let pick = null;
  const html = `<div class="udPickHead"><img src="${esc(artSrc(ev.art||''))}" alt=""><div><b>${ev.n}</b><small>${esc(ev.desc)}</small>
      <small class="udW">有利な 力：${ev.w[0] > ev.w[1] ? '🔨 はたらく' : ev.w[0] < ev.w[1] ? '📘 ちしき' : '🔨 はたらく と 📘 ちしき'}</small></div></div>
    <div class="udPick2">${L.map(({r,p,n}) => `<button class="udPickIt2" data-udp2="${r.id}">${resPic(r)}<b>${esc(r.name)}</b>
      <i class="udPBar"><i style="width:${Math.round(p/best*100)}%"></i></i><small>🔨${Math.round(effAb(r,'work')*10)/10} 📘${Math.round(effAb(r,'know')*10)/10}</small>${n ? `<em>${n}かい しゅつじょう</em>` : ''}</button>`).join('')}</div>`;
  UD_PICK = null;
  await dialog(html, [{label:'おまかせ', cls:'white', v:'auto'}], 'wide udPickD');
  pick = UD_PICK ? udCands().find(r => r.id===UD_PICK) : L[0]?.r;
  if(pick) used[pick.id] = (used[pick.id]||0) + 1;
  return pick;
}
let UD_PICK = null;
document.addEventListener('click', e => { const b = e.target.closest('[data-udp2]'); if(!b) return; e.stopImmediatePropagation(); UD_PICK = b.dataset.udp2; $$('#dlgBtns button')[0]?.click(); }, true);
udEvent = (orig => async function(ev){
  if(!ev.team){
    const p = await pickForEvent(ev); if(p) UD.me = p;
    const others = save.town.res.filter(r => r.id!==UD.me.id && !SP(r.sp).human);
    if(others.length) UD.rival = choice(others);
  }
  return orig(ev);
})(udEvent);
udBegin = (orig => async function(id){ UD.used = {}; return orig(id); })(udBegin);
udOpen = (orig => async function(){
  await orig();
  const h = $('#udView .udTitle small'); if(h) h.textContent = '種目ごとに 出る 住民を えらべるよ！ まずは さいしょの 選手を えらんでね。「はたらく」「ちしき」が 強いと 有利。問題に せいかいすると パワーアップ！';
})(udOpen);
/* 結果の MVP は いちばん かった 選手 */
udFinish = (orig => async function(){
  const wins = {}; (UD.log||[]).forEach(x => { if(x.win) wins[x.id] = (wins[x.id]||0) + 1; });
  const best = Object.entries(wins).sort((a,b) => b[1]-a[1])[0];
  if(best){ const r = save.town.res.find(x => x.id===best[0]); if(r) UD.me = r; }
  return orig();
})(udFinish);
udEvent = (orig => async function(ev){ const n = UD.wins.length; await orig(ev); (UD.log = UD.log || []).push({id:UD.me?.id, win:UD.wins[n]}); })(udEvent);
udBegin = (orig => async function(id){ UD.log = []; return orig(id); })(udBegin);

/* =====================================================================
   せってい：住民を ふやす／へらす（おとな用）
   ===================================================================== */
function renderAdminRes(){
  const box = $('#adminRes'); if(!box) return;
  const t = save.town, list = SPECIES.filter(s => !s.human).sort((a,b) => (b.rar||1)-(a.rar||1) || a.name.localeCompare(b.name,'ja'));
  const q = (ADM.q||'').trim();
  const show = q ? list.filter(s => s.name.includes(q) || kata2hira(s.name).includes(kata2hira(q))) : list;
  box.innerHTML = `<div class="admRow"><input id="admQ" placeholder="🔍 どうぶつの なまえで さがす" value="${esc(q)}"><small>まちの 住民 ${t.res.length}人（さいだい ${townCalc().maxRes}人）</small></div>
    <div class="admList">${show.slice(0, 60).map(s => { const n = t.res.filter(r => r.sp===s.id).length, R = RARITY[s.rar||1];
      return `<div class="admIt rk${R.k}"><span class="admPic">${picHTML(s)}</span><div class="admTxt"><b>${esc(s.name)}</b><small style="color:${R.c}">${R.n}</small></div>
        <span class="admN">${n}人</span><button class="btn small white" data-adm="-" data-sp="${s.id}" ${n?'':'disabled'}>−</button><button class="btn small green" data-adm="+" data-sp="${s.id}">＋</button></div>`; }).join('')}</div>
    ${show.length > 60 ? `<p class="note">ほか ${show.length-60}しゅるい（けんさくで しぼりこんでね）</p>` : ''}
    <p class="note">ふやした 住民は 家が あれば その家に すみます。家が たりない ときは 家なしに なります。</p>`;
}
const ADM = {q:''};
document.addEventListener('input', e => { if(e.target.id!=='admQ') return; ADM.q = e.target.value; const pos = e.target.selectionStart; renderAdminRes(); const i = $('#admQ'); i.focus(); try{ i.setSelectionRange(pos,pos); }catch(_){} });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-adm]'); if(!b) return; e.stopImmediatePropagation();
  const t = save.town, sp = SP(b.dataset.sp);
  if(b.dataset.adm==='+'){
    const r = newResident(sp); const h = findHome(sp); r.home = h ? h.key : null;
    const dup = t.res.filter(x => x.sp===sp.id).length; if(dup) r.hue = [150,210,300,60,100,260][(dup-1)%6];
    persOf(r); t.res.push(r); discover(sp.id); toast(`${sp.name}の「${r.name}」が やってきたよ`);
  } else {
    const L = t.res.filter(x => x.sp===sp.id); const r = L[L.length-1]; if(!r) return;
    t.res = t.res.filter(x => x !== r);
    Object.keys(t.workers||{}).forEach(k => { if(t.workers[k]===r.id) delete t.workers[k]; });
    const D = reqData(); D.list = D.list.filter(q => q.rid !== r.id);
    if(save.ghost?.id===r.id) save.ghost.id = null;
    if(ensureHome().visit?.id===r.id) ensureHome().visit = null;
    WK.st.delete(r.id); toast(`${r.name}が ひっこして いったよ`);
  }
  persist(); renderAdminRes();
}, true);
renderSettings = (orig => function(){ orig(); renderAdminRes(); })(renderSettings);
show = (orig => function(name){ orig(name); if(name==='settings') renderAdminRes(); })(show);


/* =====================================================================
   v3.3：専門店の たべものの 絵と とくべつな 効果・
         さんすう／しゃかい／えいごの 問題 だいぞうりょう
   ===================================================================== */
/* ---------- 専門店の たべもの ---------- */
const SFOOD = {
  f_takoyaki:  {n:'たこやき', art:'sf_takoyaki', price:120, m:1.2, min:20, fx:'combo',  fxn:'ころころコンボ', fxd:'3問 れんぞく せいかいする たびに +15pt'},
  f_crepe:     {n:'いちごクレープ', art:'sf_crepe_st', price:150, m:1.2, min:20, fx:'bonus', fxn:'ボーナス よびこみ', fxd:'ボーナス問題が 2ばい 出やすい'},
  f_crepe_ba:  {n:'チョコバナナクレープ', art:'sf_crepe_ba', price:160, m:1.2, min:20, fx:'hint', fxn:'ひらめき', fxd:'問題で いつでも ヒントが つかえる'},
  f_icecream:  {n:'トリプルアイス', art:'sf_icecream', price:150, m:1.2, min:20, fx:'cool', fxn:'ひんやり おまもり', fxd:'まちがえても +5pt もらえる'},
  f_parfait:   {n:'チョコパフェ', art:'sf_parfait', price:260, m:1.3, min:20, fx:'lucky', fxn:'ラッキー', fxd:'せいかいすると 4かいに 1かい +20pt'},
  f_ramen:     {n:'しょうゆラーメン', art:'sf_ramen', price:220, m:1.5, min:40, fx:'long', fxn:'ながもち', fxd:'ポイント×1.5が 40分 つづく'},
  f_misoramen: {n:'みそコーンラーメン', art:'sf_misoramen', price:260, m:1.4, min:30, fx:'guard', fxn:'おばけよけ', fxd:'その日は おばけに さらわれない'},
  f_gyoza:     {n:'やきぎょうざ', art:'sf_gyoza', price:200, m:1.2, min:30, fx:'power', fxn:'ちからもち', fxd:'運動会の 住民パワー +3'}
};
Object.entries(SFOOD).forEach(([id, d]) => { const f = FD(id); if(f) Object.assign(f, d); else FOOD.push(Object.assign({id}, d)); });
Object.assign(SHOP_FOOD, {takoyaki:['f_takoyaki'], crepe:['f_crepe','f_crepe_ba'], icecream:['f_icecream','f_parfait'], ramen:['f_ramen','f_misoramen','f_gyoza']});
function sbuffNow(){ const b = save.sbuff; return b && b.until > Date.now() ? b : null; }
const fxOn = k => sbuffNow()?.fx === k;
eatFood = (orig => async function(id){
  const f = FD(id);
  if(f && f.fx){ const now = Date.now(), cur = sbuffNow();
    save.sbuff = (cur && cur.fx===f.fx) ? Object.assign(cur, {until: cur.until + f.min*60000}) : {fx:f.fx, fxn:f.fxn, fxd:f.fxd, art:f.art, n:f.n, until: now + f.min*60000, day:dayKey()};
    persist(); }
  await orig(id);
  if(f && f.fx){ await dialog(`<div class="dlgArt"><img src="${esc(artSrc(f.art))}" alt=""></div><h2 class="dlgT">✨ とくべつな こうか「${esc(f.fxn)}」</h2><p class="dlgP">${esc(f.fxd)}<br><small>（${f.min}分 つづくよ）</small></p>`, [{label:'やった！', cls:'gold', v:1}], 'gold'); }
})(eatFood);
/* ショップの 名前に こうかを のせる */
catalog = (orig => function(b){ return orig(b).map(c => { const f = c.kind==='food' && FD(c.id); if(f && f.fx) c.name = `${f.n}（${f.fxn}）`; return c; }); })(catalog);
/* こうか */
bonusBoost = (orig => function(){ return orig() * (fxOn('bonus') ? 2 : 1); })(bonusBoost);
skillOwners = (orig => function(k){ const L = orig(k); if(k==='hint' && !L.length && fxOn('hint') && girl()) return [girl()]; return L; })(skillOwners);
ghostCheck = (orig => function(){ if(fxOn('guard') || save.sbuff?.fx==='guard' && save.sbuff?.day===dayKey()) return; return orig(); })(ghostCheck);
udPower = (orig => function(r, ev, c){ return orig(r, ev, c) + (fxOn('power') ? 3 : 0); })(udPower);
function fxAfter(ok, combo){
  if(!sbuffNow()) return;
  if(ok && fxOn('combo') && combo > 0 && combo % 3 === 0){ const p = givePts(15, 'たこやき コンボ'); toast(`🐙 ころころコンボ +${p}pt`); }
  if(ok && fxOn('lucky') && Math.random() < 0.25){ const p = givePts(20, 'パフェ ラッキー'); toast(`🍨 ラッキー！ +${p}pt`); }
  if(!ok && fxOn('cool')){ const p = givePts(5, 'ひんやり おまもり'); toast(`🍦 ひんやり おまもり +${p}pt`); }
}
mJudge = (orig => function(v){ const was = MQ && MQ.done; const out = orig(v); if(!was) fxAfter(MQ.res[MQ.res.length-1]?.ok, MQ.combo); return out; })(mJudge);
finalize = (orig => function(correct, opt={}){ const was = !cur || cur.done; const out = orig(correct, opt); if(!was && S) fxAfter(correct, S.combo); return out; })(finalize);
buffTick = (orig => function(){
  orig(); const s = sbuffNow(); let el = $('#sbuffChip');
  if(!s){ if(el) el.remove(); return; }
  if(!el){ document.body.insertAdjacentHTML('beforeend', '<button id="sbuffChip"></button>'); el = $('#sbuffChip'); el.onclick = openFoodBag; }
  const sec = Math.ceil((s.until - Date.now())/1000);
  el.innerHTML = `<img src="${esc(artSrc(s.art))}" alt=""><b>${esc(s.fxn)}</b><small>${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</small>`;
})(buffTick);
openFoodBag = (orig => async function(){
  const p = orig(); setTimeout(() => {
    $$('#dlgBody .foodIt[data-eat]').forEach(b => { const f = FD(b.dataset.eat); if(f && f.fx) b.querySelector('small').textContent = `✨${f.fxn}`; });
    const s = sbuffNow(); if(s && !$('#dlgBody .sbNow')) $('#dlgBody .foodGrid')?.insertAdjacentHTML('beforebegin', `<div class="buffNow sbNow"><img src="${esc(artSrc(s.art))}" alt="">✨ ${esc(s.fxn)}：${esc(s.fxd)}</div>`);
  }, 30); return p; })(openFoodBag);

/* =====================================================================
   習得度：むずかしく（いままでの ★は のこす）
   ===================================================================== */
const NEED = [10, 30, 60], ACC = [.6, .75, .85];
unitStar = function(k){ const s = mSave().stats[k], prev = (save.mast?.u||{})[k] || 0; if(!s || !s.n) return prev; const acc = s.c/s.n;
  const st = s.c >= NEED[2] && acc >= ACC[2] ? 3 : s.c >= NEED[1] && acc >= ACC[1] ? 2 : s.c >= NEED[0] && acc >= ACC[0] ? 1 : 0; return Math.max(prev, st); };
unitPct = function(k){ const s = mSave().stats[k]; if(!s || !s.n) return 0; return Math.round(Math.min(1, s.c/NEED[2]) * Math.min(1, (s.c/s.n)/ACC[2]) * 100); };
nextHint = function(k){ const s = mSave().stats[k] || {n:0,c:0}, st = unitStar(k); if(st>=3) return 'マスター！';
  const left = Math.max(0, NEED[st] - s.c); return left ? `あと ${left}問 せいかいで ★${st+1}` : `せいかいりつ ${Math.round(ACC[st]*100)}% で ★${st+1}`; };

/* =====================================================================
   さんすう：文章題を たくさん（各たんげん）
   ===================================================================== */
const NM = ['ゆうと','はな','そうた','みお','けんた','さくら','れん','ひなた'];
const nm = () => choice(NM);
const W = {
  addsub:[
    () => { const a = ri(120,890), b = ri(110,880); return {q:`${nm()}さんは シールを <b>${a}まい</b> もっています。<b>${b}まい</b> もらうと ぜんぶで 何まい？`, ans:a+b}; },
    () => { const a = ri(300,980), b = ri(100,a-50); return {q:`<b>${a}ページ</b>の 本を <b>${b}ページ</b> 読みました。のこりは 何ページ？`, ans:a-b}; },
    () => { const a = ri(1200,5000), b = ri(300,a-100); return {q:`<b>${a}円</b> もっていて、<b>${b}円</b>の おもちゃを 買いました。のこりは 何円？`, ans:a-b}; }],
  mul1:[
    () => { const a = ri(12,98)*1, b = ri(3,9); return {q:`1こ <b>${a}円</b>の ガムを <b>${b}こ</b> 買うと 何円？`, ans:a*b}; },
    () => { const a = ri(12,48), b = ri(3,9); return {q:`1はこ <b>${a}本</b> 入りの えんぴつが <b>${b}はこ</b> あります。えんぴつは ぜんぶで 何本？`, ans:a*b}; },
    () => { const a = ri(105,480), b = ri(2,6); return {q:`1日に <b>${a}m</b> 走ります。<b>${b}日</b>で 何m 走る？`, ans:a*b}; }],
  mul2:[
    () => { const a = ri(12,45), b = ri(12,30); return {q:`1日 <b>${a}ページ</b>ずつ <b>${b}日</b> 読むと 何ページ？`, ans:a*b}; },
    () => { const a = ri(15,40), b = ri(11,25); return {q:`1列に <b>${a}人</b>ずつ <b>${b}列</b> ならびました。ぜんぶで 何人？`, ans:a*b}; },
    () => { const a = ri(25,98), b = ri(12,36); return {q:`1こ <b>${a}円</b>の ノートを <b>${b}さつ</b> 買うと 何円？`, ans:a*b}; }],
  div:[
    () => { const b = ri(3,9), q = ri(3,9), r = ri(1,b-1), a = b*q+r; return {type:'rem', q:`<b>${a}まい</b>の カードを <b>${b}人</b>で 同じ数ずつ 分けます。1人 何まいで、何まい あまる？`, ans:`${q}|${r}`}; },
    () => { const b = ri(3,8), q = ri(3,9), r = ri(1,b-1), a = b*q+r; return {q:`<b>${a}人</b>が 長いすに <b>${b}人</b>ずつ すわります。みんなが すわるには 長いすは 何きゃく いる？`, ans:q+1, hint:'あまった 人も すわれるように 1きゃく たそう'}; },
    () => { const b = ri(4,9), q = ri(4,9), a = b*q; return {q:`<b>${a}こ</b>の あめを <b>${b}こ</b>ずつ ふくろに 入れると、何ふくろ できる？`, ans:q}; }],
  time:[
    () => { const h = ri(7,10), m = ri(1,9)*5, d = ri(15,45), t = h*60+m+d; const s = `${Math.floor(t/60)}時${t%60 ? t%60+'分' : ''}`;
      const set = new Set([s]); [5,10,-5,60].forEach(x => { const u = t+x; set.add(`${Math.floor(u/60)}時${u%60 ? u%60+'分' : ''}`); });
      return {type:'choice', q:`${nm()}さんは <b>${h}時${m}分</b>に 家を 出て、<b>${d}分</b> 歩いて 学校に つきました。ついた 時こくは？`, ans:s, opts:shuffle([s, ...shuffle([...set].filter(x => x!==s)).slice(0,3)])}; },
    () => { const a = ri(20,50), b = ri(15,40); return {q:`しゅくだいを <b>${a}分</b>、ピアノを <b>${b}分</b> しました。あわせて 何分？`, ans:a+b}; }],
  len:[
    () => { const m = ri(2,6), c = ri(10,90), cut = ri(20,90); return {q:`<b>${m}m${c}cm</b>の ひもから <b>${cut}cm</b> 切りとると、のこりは 何cm？`, ans:m*100+c-cut, hint:'ぜんぶ cmに なおそう'}; },
    () => { const a = ri(1,3), b = ri(100,900), c = ri(100,900); return {q:`家から 駅まで <b>${a}km${b}m</b>、駅から 公園まで <b>${c}m</b>。あわせて 何m？`, ans:a*1000+b+c}; }],
  unit:[
    () => { const a = ri(1,4), b = ri(100,800), c = ri(100,800); return {q:`<b>${a}kg${b}g</b>の にもつに <b>${c}g</b>の 本を 入れると 何g？`, ans:a*1000+b+c}; },
    () => { const a = ri(2,5), c = ri(100,900); return {q:`<b>${a}kg</b>の さとうから <b>${c}g</b> つかいました。のこりは 何g？`, ans:a*1000-c}; }],
  dec:[
    () => { const a = ri(11,39), b = ri(11,39); return {q:`ジュースが <b>${f2(a/10)}dL</b>と <b>${f2(b/10)}dL</b> あります。あわせて 何dL？`, ans:f2((a+b)/10)}; },
    () => { const a = ri(30,90), b = ri(10,a-5); return {q:`<b>${f2(a/10)}m</b>の テープから <b>${f2(b/10)}m</b> 使いました。のこりは 何m？`, ans:f2((a-b)/10)}; }],
  frac:[
    () => { const d = ri(4,10), a = ri(1,d-1); return {q:`ピザを <b>${d}等分</b>して <b>${a}まい</b> 食べました。食べたのは ぜんたいの 何分の何？（○/○で）`, ans:`${a}/${d}`}; },
    () => { const d = ri(5,10), a = ri(1,d-3), b = ri(1,d-1-a); return {q:`ジュースを 朝 <b>${a}/${d}L</b>、夜 <b>${b}/${d}L</b> のみました。あわせて 何L？（○/○で）`, ans:`${a+b}/${d}`}; }],
  box:[
    () => { const x = ri(8,40), b = ri(5,30); return {q:`あめを □こ もっていました。<b>${b}こ</b> もらったので <b>${x+b}こ</b>に なりました。□は？`, ans:x}; },
    () => { const x = ri(3,9), b = ri(3,9); return {q:`1ふくろ □こ入りの クッキーを <b>${b}ふくろ</b> 買うと <b>${x*b}こ</b>。□は？`, ans:x}; }],
  big:[
    () => { const a = ri(12,98)*1000+ri(0,999), b = ri(10,90)*1000+ri(0,999); return {q:`A市の 人口は <b>${a}人</b>、B町は <b>${b}人</b>。あわせて 何人？`, ans:a+b}; },
    () => { const a = ri(3,9)*10000, n = ri(2,9); return {q:`1まい <b>${nf(a)}円</b>の チケットを <b>${n}まい</b> 買うと 何円？`, ans:a*n}; }],
  div2:[
    () => { const b = ri(3,8), q = ri(120,320), a = b*q; return {q:`<b>${a}円</b>を <b>${b}人</b>で 同じだけ 分けると 1人 何円？`, ans:q}; },
    () => { const b = ri(12,25), q = ri(3,9), a = b*q; return {q:`<b>${a}本</b>の 花を <b>${b}本</b>ずつ 花たばに すると、何たば できる？`, ans:q}; }],
  gaisu:[
    () => { const a = ri(10000,99999); return {q:`ある 市の 人口 <b>${a}人</b>を 四捨五入して <b>千の位</b>までの がい数に すると？`, ans:Math.round(a/1000)*1000}; }],
  rules:[
    () => { const a = ri(80,150), b = ri(2,5), c = ri(100,180); return {q:`1こ <b>${a}円</b>の パンを <b>${b}こ</b>と、<b>${c}円</b>の ジュースを 1本 買うと 何円？（1つの 式で）`, ans:a*b+c}; },
    () => { const a = ri(500,1000), b = ri(50,120), c = ri(2,4); return {q:`<b>${a}円</b> もって、1こ <b>${b}円</b>の おかしを <b>${c}こ</b> 買うと、のこりは 何円？`, ans:a-b*c}; }],
  area:[
    () => { const a = ri(3,15), b = ri(3,15); return {q:`たて <b>${a}m</b>、よこ <b>${b}m</b>の 花だんの 面積は 何m²？`, ans:a*b}; },
    () => { const a = ri(4,12); return {q:`1辺 <b>${a}cm</b>の 正方形の 色紙の 面積は 何cm²？`, ans:a*a}; }],
  dec2:[
    () => { const a = ri(11,39), n = ri(2,8); return {q:`1本 <b>${f2(a/10)}m</b>の リボンを <b>${n}本</b> つなぐと 何m？（つなぎめは 考えない）`, ans:f2(a*n/10)}; }],
  decmd:[
    () => { const n = ri(3,9), s = ri(2,6); return {q:`<b>${f2(n*s/10)}m</b>の ぼうを <b>${f2(s/10)}m</b>ずつ 切ると、何本 できる？`, ans:n}; },
    () => { const a = ri(12,45), b = ri(2,9); return {q:`1Lで <b>${f2(a/10)}kg</b>の すなが <b>${f2(b/10)}L</b>。何kg？`, ans:f2(a*b/100)}; }],
  divisor:[
    () => { const g = ri(3,8), x = ri(2,6), y = ri(2,7); if(gcd(x,y)!==1) return W.divisor[0](); return {q:`クッキー <b>${g*x}まい</b>と あめ <b>${g*y}こ</b>を、それぞれ あまりなく 同じ数ずつ 分けます。いちばん 多くて 何人に 分けられる？`, ans:g}; },
    () => { const a = ri(3,8), b = ri(3,9); return {q:`<b>${a}分</b>ごとと <b>${b}分</b>ごとに 出る バスが 同時に 出ました。つぎに 同時に 出るのは 何分後？`, ans:a*b/gcd(a,b)}; }],
  ave:[
    () => { const v = [ri(60,95), ri(60,95), ri(60,95)]; const s = v.reduce((a,b)=>a+b,0); v[2] += (3 - s%3) % 3; return {q:`${nm()}さんの テストの 点数は <b>${v.join('点、')}点</b>。平均は 何点？`, ans:(v[0]+v[1]+v[2])/3}; }],
  ratio:[
    () => { const cap = ri(4,10)*10, p = ri(5,15)*10, n = cap*p/100; if(!Number.isInteger(n)) return W.ratio[0](); return {q:`定員 <b>${cap}人</b>の バスに <b>${n}人</b> 乗っています。乗車率は 何%？`, ans:p}; },
    () => { const pr = ri(5,20)*100, p = choice([10,20,30]); return {q:`<b>${pr}円</b>の 品物が <b>${p}%引き</b>。何円で 買える？`, ans:pr*(100-p)/100}; }],
  vol:[
    () => { const a = ri(5,20), b = ri(5,20), c = ri(3,15); return {q:`たて <b>${a}cm</b>、よこ <b>${b}cm</b>、高さ <b>${c}cm</b>の 箱の 体積は 何cm³？`, ans:a*b*c}; }]
};
Object.entries(W).forEach(([k, L]) => { const U = MATH_UNITS[k]; if(!U) return; const g = U.gen;
  U.gen = function(){ if(Math.random() < 0.45){ const p = choice(L)(); return Object.assign({type:'num', hint:p.hint || 'もんだいを 2回 よんで、なにを もとめるか かんがえよう', sub:'w'+stripTags(p.q)}, p, {ans:String(p.ans), word:1}); } return g(); }; });

/* =====================================================================
   しゃかい：問題を ふやす
   ===================================================================== */
const PREF_KANA = ['ほっかいどう','あおもり','いわて','みやぎ','あきた','やまがた','ふくしま','いばらき','とちぎ','ぐんま','さいたま','ちば','とうきょう','かながわ','にいがた','とやま','いしかわ','ふくい','やまなし','ながの','ぎふ','しずおか','あいち','みえ','しが','きょうと','おおさか','ひょうご','なら','わかやま','とっとり','しまね','おかやま','ひろしま','やまぐち','とくしま','かがわ','えひめ','こうち','ふくおか','さが','ながさき','くまもと','おおいた','みやざき','かごしま','おきなわ'];
const PREF_MORE = {'北海道':['とうもろこし','夕張メロン'],'青森県':['大間の まぐろ','にんにく'],'岩手県':['中尊寺金色堂','三陸わかめ'],'宮城県':['笹かまぼこ','松島'],'秋田県':['秋田犬','竿燈まつり'],'山形県':['花笠まつり','ラ・フランス'],'福島県':['大内宿','喜多方ラーメン'],'茨城県':['偕楽園','あんこう鍋'],'栃木県':['いちご（とちおとめ）','華厳の滝'],'群馬県':['富岡製糸場','下仁田ねぎ'],'埼玉県':['鉄道博物館','岩槻の ひな人形'],'千葉県':['東京ディズニーリゾート','銚子の しょうゆ'],'東京都':['浅草の 雷門','東京タワー'],'神奈川県':['シウマイ','箱根の 温泉'],'新潟県':['佐渡島の トキ','燕三条の 金物'],'富山県':['立山','ますずし'],'石川県':['金箔','九谷焼'],'福井県':['越前がに','東尋坊'],'山梨県':['信玄もち','富士五湖'],'長野県':['善光寺','おやき'],'岐阜県':['下呂温泉','関の 刃物'],'静岡県':['わさび','浜松の ピアノづくり'],'愛知県':['みそかつ','ひつまぶし'],'三重県':['松阪牛','鈴鹿サーキット'],'滋賀県':['彦根城','近江牛'],'京都府':['清水寺','宇治茶'],'大阪府':['大阪城','お好み焼き'],'兵庫県':['神戸牛','明石焼き'],'奈良県':['法隆寺','柿の葉ずし'],'和歌山県':['高野山','白浜の パンダ'],'鳥取県':['松葉がに','水木しげるロード'],'島根県':['松江城','石見銀山'],'岡山県':['倉敷の 美観地区','桃太郎の おはなし'],'広島県':['もみじまんじゅう','原爆ドーム'],'山口県':['秋芳洞','角島大橋'],'徳島県':['鳴門の うずしお','祖谷の かずら橋'],'香川県':['金刀比羅宮','小豆島'],'愛媛県':['今治タオル','しまなみ海道'],'高知県':['四万十川','よさこい祭り'],'福岡県':['太宰府天満宮','あまおう（いちご）'],'佐賀県':['吉野ヶ里遺跡','呼子の いか'],'長崎県':['ちゃんぽん','ハウステンボス'],'熊本県':['阿蘇山','くまモン'],'大分県':['湯布院','とり天'],'宮崎県':['高千穂峡','チキン南蛮'],'鹿児島県':['屋久島','黒豚'],'沖縄県':['首里城','美ら海水族館']};
PREF.forEach(p => (PREF_MORE[p[0]]||[]).forEach(x => { if(!p[5].includes(x)) p[5].push(x); }));
const NEIGH = {'青森県':['秋田県','岩手県'],'岩手県':['青森県','秋田県','宮城県'],'宮城県':['岩手県','秋田県','山形県','福島県'],'秋田県':['青森県','岩手県','宮城県','山形県'],'山形県':['秋田県','宮城県','福島県','新潟県'],
 '福島県':['宮城県','山形県','新潟県','群馬県','栃木県','茨城県'],'茨城県':['福島県','栃木県','埼玉県','千葉県'],'栃木県':['福島県','茨城県','群馬県','埼玉県'],'群馬県':['福島県','栃木県','埼玉県','長野県','新潟県'],
 '埼玉県':['茨城県','栃木県','群馬県','長野県','山梨県','東京都','千葉県'],'千葉県':['茨城県','埼玉県','東京都'],'東京都':['埼玉県','千葉県','神奈川県','山梨県'],'神奈川県':['東京都','山梨県','静岡県'],
 '新潟県':['山形県','福島県','群馬県','長野県','富山県'],'富山県':['新潟県','長野県','岐阜県','石川県'],'石川県':['富山県','岐阜県','福井県'],'福井県':['石川県','岐阜県','滋賀県','京都府'],
 '山梨県':['埼玉県','東京都','神奈川県','静岡県','長野県'],'長野県':['新潟県','群馬県','埼玉県','山梨県','静岡県','愛知県','岐阜県','富山県'],'岐阜県':['富山県','石川県','福井県','長野県','愛知県','三重県','滋賀県'],
 '静岡県':['神奈川県','山梨県','長野県','愛知県'],'愛知県':['静岡県','長野県','岐阜県','三重県'],'三重県':['愛知県','岐阜県','滋賀県','京都府','奈良県','和歌山県'],'滋賀県':['福井県','岐阜県','三重県','京都府'],
 '京都府':['福井県','滋賀県','三重県','奈良県','大阪府','兵庫県'],'大阪府':['京都府','奈良県','和歌山県','兵庫県'],'兵庫県':['京都府','大阪府','鳥取県','岡山県'],'奈良県':['京都府','三重県','和歌山県','大阪府'],'和歌山県':['三重県','奈良県','大阪府'],
 '鳥取県':['兵庫県','岡山県','島根県','広島県'],'島根県':['鳥取県','広島県','山口県'],'岡山県':['兵庫県','鳥取県','広島県'],'広島県':['岡山県','鳥取県','島根県','山口県'],'山口県':['広島県','島根県'],
 '徳島県':['香川県','愛媛県','高知県'],'香川県':['徳島県','愛媛県'],'愛媛県':['香川県','徳島県','高知県'],'高知県':['徳島県','愛媛県'],
 '福岡県':['佐賀県','熊本県','大分県'],'佐賀県':['福岡県','長崎県'],'長崎県':['佐賀県'],'熊本県':['福岡県','大分県','宮崎県','鹿児島県'],'大分県':['福岡県','熊本県','宮崎県'],'宮崎県':['大分県','熊本県','鹿児島県'],'鹿児島県':['熊本県','宮崎県']};
const LANDLOCK = ['栃木県','群馬県','埼玉県','山梨県','長野県','岐阜県','滋賀県','奈良県'];
const NAMEDIFF = ['北海道','岩手県','宮城県','茨城県','栃木県','群馬県','神奈川県','山梨県','石川県','愛知県','三重県','滋賀県','兵庫県','島根県','香川県','愛媛県','沖縄県'];
const NAMESAME = ['青森県','秋田県','山形県','福島県','千葉県','新潟県','富山県','福井県','長野県','岐阜県','静岡県','京都府','大阪府','奈良県','和歌山県','鳥取県','岡山県','広島県','山口県','徳島県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県'];
const prefNames = PREF.map(p => p[0]);
Object.assign(MATH_UNITS, {
  s_read:{n:'都道府県の 読み方', g:'soc', lv:1, art:'so_japan', gen(){ const i = ri(0,46), p = PREF[i], k = PREF_KANA[i];
    if(Math.random() < .6) return {type:'choice', q:`<b>${p[0]}</b> の 読み方は？`, disp:jpMap(p), ans:k, opts:optsFrom(k, PREF_KANA), sub:p[0]};
    return {type:'choice', q:`「<b>${k}</b>」は どの 都道府県？`, ans:p[0], opts:optsFrom(p[0], prefNames), sub:p[0]}; }},
  s_neigh:{n:'となりの 都道府県', g:'soc', lv:2, art:'so_map', gen(){ const name = choice(Object.keys(NEIGH)), p = PREF.find(x => x[0]===name), nb = NEIGH[name];
    if(Math.random() < .7){ const a = choice(nb), wrong = prefNames.filter(x => x!==name && !nb.includes(x));
      return {type:'choice', q:`<b>${name}</b> と となりあっている 都道府県は？`, disp:jpMap(p), ans:a, opts:shuffle([a, ...shuffle(wrong).slice(0,3)]), sub:name+a}; }
    const n = String(nb.length); return {type:'choice', q:`<b>${name}</b> と となりあう 都道府県は いくつ？（陸で つながる 数）`, disp:jpMap(p), ans:n, opts:optsFrom(n, ['1','2','3','4','5','6','7','8']), sub:'n'+name}; }},
  s_pref2:{n:'都道府県 いろいろクイズ', g:'soc', lv:2, art:'so_japan', gen(){ const k = ri(0,3);
    if(k===0){ const a = choice(LANDLOCK); return {type:'choice', q:'<b>海に 面していない</b> 県は どれ？', ans:a, opts:shuffle([a, ...shuffle(prefNames.filter(x => !LANDLOCK.includes(x) && x!=='北海道')).slice(0,3)]), sub:'ll'+a}; }
    if(k===1){ const a = choice(NAMEDIFF); return {type:'choice', q:'県名と 県庁所在地の 名前が <b>ちがう</b> のは どれ？', ans:a, opts:shuffle([a, ...shuffle(NAMESAME).slice(0,3)]), sub:'nd'+a}; }
    if(k===2){ const reg = choice(REGIONS), n = String(PREF.filter(p => p[2]===reg).length); return {type:'choice', q:`<b>${reg}地方</b>には 都道府県が いくつ ある？`, disp:jpRegionMap(reg), ans:n, opts:optsFrom(n, ['1','2','3','4','5','6','7','8','9']), sub:'rc'+reg}; }
    const p = choice(PREF), wrong = PREF.filter(x => x[2]!==p[2]).map(x => x[0]); return {type:'choice', q:`<b>${p[2]}地方</b>に ある 都道府県は どれ？`, ans:p[0], opts:shuffle([p[0], ...shuffle(wrong).slice(0,3)]), sub:'rg'+p[0]}; }}
});
Object.assign(SOC_LV, {s_read:1, s_neigh:2, s_pref2:2});
Object.assign(SOC_CAT, {s_read:'🗾 都道府県', s_neigh:'🗾 都道府県', s_pref2:'🗾 都道府県'});
/* 世界の 国を ふやす */
[['Cambodia','カンボジア','プノンペン','アジア'],['Laos','ラオス','ビエンチャン','アジア'],['Iraq','イラク','バグダッド','アジア'],['Syria','シリア','ダマスカス','アジア'],['Jordan','ヨルダン','アンマン','アジア'],
 ['Qatar','カタール','ドーハ','アジア'],['Kuwait','クウェート','クウェート','アジア'],['Oman','オマーン','マスカット','アジア'],['Afghanistan','アフガニスタン','カブール','アジア'],['Uzbekistan','ウズベキスタン','タシケント','アジア'],
 ['Czechia','チェコ','プラハ','ヨーロッパ'],['Hungary','ハンガリー','ブダペスト','ヨーロッパ'],['Romania','ルーマニア','ブカレスト','ヨーロッパ'],['Bulgaria','ブルガリア','ソフィア','ヨーロッパ'],['Croatia','クロアチア','ザグレブ','ヨーロッパ'],
 ['Serbia','セルビア','ベオグラード','ヨーロッパ'],['Slovakia','スロバキア','ブラチスラバ','ヨーロッパ'],['Slovenia','スロベニア','リュブリャナ','ヨーロッパ'],['Belarus','ベラルーシ','ミンスク','ヨーロッパ'],['Lithuania','リトアニア','ビリニュス','ヨーロッパ'],
 ['Latvia','ラトビア','リガ','ヨーロッパ'],['Estonia','エストニア','タリン','ヨーロッパ'],
 ['Jamaica','ジャマイカ','キングストン','北アメリカ'],['Panama','パナマ','パナマシティ','北アメリカ'],['Costa Rica','コスタリカ','サンホセ','北アメリカ'],['Guatemala','グアテマラ','グアテマラシティ','北アメリカ'],['Honduras','ホンジュラス','テグシガルパ','北アメリカ'],
 ['Dominican Rep.','ドミニカ共和国','サントドミンゴ','北アメリカ'],['Haiti','ハイチ','ポルトープランス','北アメリカ'],
 ['Ecuador','エクアドル','キト','南アメリカ'],['Paraguay','パラグアイ','アスンシオン','南アメリカ'],['Uruguay','ウルグアイ','モンテビデオ','南アメリカ'],['Venezuela','ベネズエラ','カラカス','南アメリカ'],
 ['Algeria','アルジェリア','アルジェ','アフリカ'],['Tunisia','チュニジア','チュニス','アフリカ'],['Libya','リビア','トリポリ','アフリカ'],['Sudan','スーダン','ハルツーム','アフリカ'],['Senegal','セネガル','ダカール','アフリカ'],
 ['Mali','マリ','バマコ','アフリカ'],['Cameroon','カメルーン','ヤウンデ','アフリカ'],['Angola','アンゴラ','ルアンダ','アフリカ'],['Zambia','ザンビア','ルサカ','アフリカ'],['Zimbabwe','ジンバブエ','ハラレ','アフリカ'],
 ['Mozambique','モザンビーク','マプト','アフリカ'],['Uganda','ウガンダ','カンパラ','アフリカ'],['Rwanda','ルワンダ','キガリ','アフリカ'],['Namibia','ナミビア','ウィントフック','アフリカ'],['Botswana','ボツワナ','ハボローネ','アフリカ'],['Tanzania','タンザニア','ドドマ','アフリカ'],
 ['Papua New Guinea','パプアニューギニア','ポートモレスビー','オセアニア'],['Fiji','フィジー','スバ','オセアニア']
].forEach(c => { if(WORLD[c[0]] && !COUNTRIES.some(x => x[0]===c[0])) COUNTRIES.push(c); });
/* 歴史の できごとを ふやす */
[['十七条の 憲法','飛鳥',604],['墾田永年私財法','奈良',743],['古今和歌集が できる','平安',905],['承久の乱','鎌倉',1221],['御成敗式目','鎌倉',1232],['元寇（弘安の役）','鎌倉',1281],
 ['金閣が 建てられる','室町',1397],['銀閣が 建てられる','室町',1489],['桶狭間の戦い','室町',1560],['室町幕府が ほろびる','安土桃山',1573],['刀狩','安土桃山',1588],['豊臣秀吉が 全国を 統一','安土桃山',1590],
 ['鎖国の 完成','江戸',1639],['享保の改革','江戸',1716],['解体新書の 出版','江戸',1774],['日米修好通商条約','江戸',1858],['学制の 公布','明治',1872],['西南戦争','明治',1877],
 ['第一回 帝国議会','明治',1890],['満州事変','昭和',1931],['日中戦争が 始まる','昭和',1937],['サンフランシスコ平和条約','昭和',1951],['国際連合に 加盟','昭和',1956],
 ['大阪万博（1回目）','昭和',1970],['沖縄が 日本に 復帰','昭和',1972]
].forEach(e => { if(!J_EVENTS.some(x => x[0]===e[0])) J_EVENTS.push(e); });

/* =====================================================================
   えいご：ことばと 文を ふやす
   ===================================================================== */
Object.assign(EW2, {
  house:[['bed','ベッド'],['door','ドア'],['window','まど'],['kitchen','だいどころ'],['bathroom','ふろば'],['table','テーブル'],['sofa','ソファ'],['lamp','ライト'],['cup','コップ'],['plate','おさら'],['spoon','スプーン'],['fork','フォーク'],['key','かぎ'],['phone','でんわ'],['computer','コンピューター'],['television','テレビ'],['mirror','かがみ'],['toothbrush','はブラシ'],['towel','タオル'],['pillow','まくら'],['blanket','もうふ'],['garden','にわ'],['stairs','かいだん'],['roof','やね']],
  toy:[['ball','ボール'],['doll','にんぎょう'],['game','ゲーム'],['puzzle','パズル'],['kite','たこ（あげる たこ）'],['robot','ロボット'],['card','カード'],['comic book','まんが'],['camera','カメラ'],['drum','たいこ'],['violin','バイオリン'],['recorder','リコーダー'],['jump rope','なわとび'],['yo-yo','ヨーヨー'],['block','つみき']],
  animal3:[['crab','カニ'],['jellyfish','クラゲ'],['seal','アザラシ'],['starfish','ヒトデ'],['beetle','カブトムシ'],['grasshopper','バッタ'],['dragonfly','トンボ'],['ladybug','テントウムシ'],['snail','カタツムリ'],['squirrel','リス'],['deer','シカ'],['kangaroo','カンガルー'],['gorilla','ゴリラ'],['hippo','カバ'],['crocodile','ワニ'],['eagle','ワシ'],['parrot','オウム'],['swan','ハクチョウ'],['camel','ラクダ'],['hedgehog','ハリネズミ']],
  food3:[['steak','ステーキ'],['fried chicken','からあげ'],['rice ball','おにぎり'],['sushi','すし'],['pancake','パンケーキ'],['popcorn','ポップコーン'],['jam','ジャム'],['butter','バター'],['cheese','チーズ'],['yogurt','ヨーグルト'],['honey','はちみつ'],['sugar','さとう'],['salt','しお'],['French fries','フライドポテト'],['omelet','オムレツ'],['pudding','プリン'],['donut','ドーナツ'],['sausage','ソーセージ']],
  verb3:[['drink','のむ'],['take','とる'],['give','あげる'],['know','しっている'],['think','かんがえる'],['watch','（テレビを）みる'],['use','つかう'],['put','おく'],['carry','はこぶ'],['push','おす'],['pull','ひく'],['call','よぶ・でんわする'],['wait','まつ'],['start','はじめる'],['finish','おえる'],['learn','まなぶ'],['teach','おしえる'],['grow','そだつ'],['climb','のぼる'],['smile','ほほえむ'],['cry','なく'],['laugh','わらう'],['shout','さけぶ'],['visit','たずねる']],
  adj2:[['tall','せが たかい'],['young','わかい'],['thirsty','のどが かわいた'],['tired','つかれた'],['full','おなか いっぱい'],['dirty','きたない'],['clean','きれいな（よごれていない）'],['quiet','しずかな'],['noisy','うるさい'],['bright','あかるい'],['dark','くらい'],['sweet','あまい'],['sour','すっぱい'],['bitter','にがい'],['soft','やわらかい'],['hard','かたい'],['wet','ぬれた'],['warm','あたたかい'],['popular','にんきの ある'],['famous','ゆうめいな'],['wonderful','すばらしい'],['delicious','おいしい'],['interesting','きょうみぶかい'],['exciting','わくわくする']],
  ordinal:[['first','1ばんめ'],['second','2ばんめ'],['third','3ばんめ'],['fourth','4ばんめ'],['fifth','5ばんめ'],['sixth','6ばんめ'],['seventh','7ばんめ'],['eighth','8ばんめ'],['ninth','9ばんめ'],['tenth','10ばんめ'],['eleventh','11ばんめ'],['twelfth','12ばんめ']],
  place2:[['church','きょうかい'],['castle','おしろ'],['temple','おてら'],['shrine','じんじゃ'],['stadium','スタジアム'],['airport','くうこう'],['farm','のうじょう'],['factory','こうじょう'],['bridge','はし（川の）'],['tower','タワー'],['theater','げきじょう'],['hotel','ホテル'],['cafe','カフェ'],['mountain hut','やまごや']]
});
const art = w => /^[aeiou]/i.test(w) ? 'an' : 'a';
const SENT_T = [
  () => { const L = EW2.subject.concat([['soccer','サッカー'],['baseball','やきゅう'],['music','おんがく'],['tennis','テニス']]), w = choice(L); return {en:`I like ${w[0]}.`, jp:`わたしは ${w[1]}が すきです。`, pool:L.map(x => `I like ${x[0]}.`)}; },
  () => { const L = EW2.verb2.filter(x => !/\s/.test(x[0])), w = choice(L); return {en:`I can ${w[0]}.`, jp:`わたしは ${w[1]}ことが できます。`, pool:L.map(x => `I can ${x[0]}.`)}; },
  () => { const L = EW2.house.concat(EW2.toy).filter(x => !/s$/.test(x[0])), w = choice(L); return {en:`I want ${art(w[0])} ${w[0]}.`, jp:`${w[1]}が ほしいです。`, pool:L.map(x => `I want ${art(x[0])} ${x[0]}.`)}; },
  () => { const L = EW2.town.concat(EW2.place2), w = choice(L); return {en:`Let's go to the ${w[0]}.`, jp:`${w[1]}に いこう。`, pool:L.map(x => `Let's go to the ${x[0]}.`)}; },
  () => { const L = EW2.family, w = choice(L); return {en:`This is my ${w[0]}.`, jp:`こちらは わたしの ${w[1]}です。`, pool:L.map(x => `This is my ${x[0]}.`)}; },
  () => { const L = [['tired','つかれています'],['thirsty','のどが かわいています'],['full','おなかが いっぱいです'],['busy','いそがしいです'],['happy','うれしいです'],['sad','かなしいです'],['sleepy','ねむいです'],['hungry','おなかが すいています'],['fine','げんきです'],['tall','せが たかいです'],['excited','わくわくしています'],['angry','おこっています']], w = choice(L); return {en:`I'm ${w[0]}.`, jp:`わたしは ${w[1]}。`, pool:L.map(x => `I'm ${x[0]}.`)}; },
  () => { const L = EW2.animal2.concat(EW2.animal3), w = choice(L); return {en:`Do you like ${w[0]}s?`, jp:`${w[1]}は すきですか？`, pool:L.map(x => `Do you like ${x[0]}s?`), plural:1}; },
  () => { const L = EW2.house.filter(x => !/s$/.test(x[0])), w = choice(L), pr = choice([['on','の 上'],['under','の 下'],['by','の そば']]); return {en:`The cat is ${pr[0]} the ${w[0]}.`, jp:`ねこは ${w[1]}${pr[1]}に います。`, pool:L.map(x => `The cat is ${pr[0]} the ${x[0]}.`)}; }
];
const PLURAL_OK = /(sh|ch|s|x|z|y|f)$/; 
Object.assign(MATH_UNITS, {});
const EKU3 = {
  ek_house:ekTxt('house','いえの 中の もの','en_house',2), ek_toy:ekTxt('toy','おもちゃ・あそび','en_star',1),
  ek_animal3:ekTxt('animal3','どうぶつ・むし（もっと）','en_rabbit',2), ek_food3:ekTxt('food3','たべもの（もっと）','en_apple',2),
  ek_verb3:ekTxt('verb3','うごき（さらに）','en_run',3), ek_adj2:ekTxt('adj2','ようす（さらに）','en_happy',3),
  ek_ordinal:ekTxt('ordinal','じゅんばん（first…）','en_clock',3), ek_place2:ekTxt('place2','たてもの・ばしょ（もっと）','en_house',3),
  ek_make:{n:'文の いみ（いろいろな 文）', lv:3, art:'en_read', gen(){
    let s; for(let t=0;t<10;t++){ s = choice(SENT_T)(); if(!(s.plural && PLURAL_OK.test(s.en.split(' like ')[1]?.replace(/s\?$/,'')||''))) break; }
    if(Math.random() < .5) return {type:'choice', q:`「<b>${esc(s.jp)}</b>」を えいごで いうと？`, ans:s.en, opts:optsFrom(s.en, s.pool), say:s.en, sub:s.en};
    const other = []; for(let i=0;i<12;i++){ const o = choice(SENT_T)(); if(o.jp!==s.jp) other.push(o.jp); }
    return {type:'choice', q:`<b class="enW">${esc(s.en)}</b> の いみは？`, disp:sayBtn(s.en), ans:s.jp, opts:optsFrom(s.jp, other), say:s.en, sub:s.en};
  }}
};
Object.entries(EKU3).forEach(([k,u]) => { MATH_UNITS[k] = Object.assign(u, {g:'ek'}); EKU[k] = u; EK_LV[k] = u.lv; });


/* =====================================================================
   v3.4：女の子の 会話用 イラスト（とくべつな シーンと わける）
   ===================================================================== */
GIRL_ART.talk = ['gt_talk'];
GIRL_ART.quiz = ['gt_quiz'];
GIRL_ART.bread = ['gt_bread'];


/* =====================================================================
   v3.6：季節の 背景を まもる・電車を 踏切／ホームより 手前に・
         プログラミングの しょうがいぶつを イラストに＋ぶつかった 演出
   ===================================================================== */
/* ---------- ホームの 季節の 背景は ほかの 処理で 上書きされても もどす ---------- */
(function(){
  const bg = $('#bg'); if(!bg || !window.MutationObserver) return;
  let busy = false;
  new MutationObserver(() => {
    if(busy || curScreen!=='home') return;
    const want = artSrc(homeBgKey()); if(!want || bg.style.backgroundImage.includes(want.slice(0,80))) return;
    busy = true; bg.style.backgroundImage = `url("${want}")`; busy = false;
  }).observe(bg, {attributes:true, attributeFilter:['style']});
})();

/* ---------- プログラミング：イラストの しょうがいぶつ ---------- */
const PGI = k => `<img class="pgObj ${k}" src="${esc(artSrc('pg_'+k))}" alt="">`;
boardHTML = (orig => function(st, pos, fx={}){
  let h = orig(st, pos, fx);
  h = h.replace(/<span class="pRock">🪨<\/span>/g, PGI('rock'))
       .replace(/<span class="pBox">📦<\/span>/g, PGI('box'))
       .replace(/<span class="pWat">🌊<\/span>/g, '');
  // こわした はこの かけら
  const brk = fx.brk || new Set();
  if(brk.size){ const cs = Math.min(64, Math.floor(Math.min(340, innerWidth - 60) / Math.max(st.w, 4)));
    h = h.replace(/<\/div>$/, [...brk].map(k => { const [x,y] = k.split(',').map(Number); return `<img class="pgDebris" src="${esc(artSrc('pg_boxbrk'))}" style="left:${x*cs}px;top:${y*cs}px;width:${cs}px" alt="">`; }).join('') + '</div>'); }
  return h;
})(boardHTML);
runProg = (orig => async function(){
  await orig();
  const msg = $('#pMsg .ngTxt'); if(!msg) return;
  const st = PSTAGES[PG.stage], r = pSim(st, pFlat(PG.prog)); if(r.ok || !r.crash) return;
  const board = $('.pBoard'), bird = $('#pBird'); if(!board || !bird) return;
  const cs = parseFloat(getComputedStyle(board).getPropertyValue('--pc'));
  const [cx,cy] = r.crash, k = cx+','+cy;
  const isWater = (st.water||[]).some(w => w.join()===k), isBox = (st.boxes||[]).some(w => w.join()===k), isRock = (st.walls||[]).some(w => w.join()===k);
  const out = cx < 0 || cy < 0 || cx >= st.w || cy >= st.h;
  const ex = Math.max(0, Math.min(st.w-1, cx)), ey = Math.max(0, Math.min(st.h-1, cy));
  if(isWater){
    bird.style.left = cx*cs+'px'; bird.style.top = cy*cs+'px'; bird.classList.add('sink');
    board.insertAdjacentHTML('beforeend', `<img class="pgFx splash" src="${esc(artSrc('pg_splash'))}" style="left:${cx*cs - cs*.15}px;top:${cy*cs - cs*.35}px;width:${cs*1.3}px" alt="">`);
    sound('ng');
  } else {
    const [lx,ly] = r.path[r.path.length-1];
    bird.style.left = (lx + (cx-lx)*0.35)*cs+'px'; bird.style.top = (ly + (cy-ly)*0.35)*cs+'px';
    setTimeout(() => { bird.style.left = lx*cs+'px'; bird.style.top = ly*cs+'px'; bird.classList.add('dizzyB'); }, 180);
    board.insertAdjacentHTML('beforeend', `<img class="pgFx dizzy" src="${esc(artSrc('pg_dizzy'))}" style="left:${lx*cs}px;top:${ly*cs - cs*.45}px;width:${cs}px" alt="">`);
    if(!out){ const ob = board.querySelector(`.pCell:nth-child(${ey*st.w + ex + 1}) .pgObj`); if(ob){ ob.classList.remove('hitObj'); void ob.offsetWidth; ob.classList.add('hitObj'); } }
    board.classList.add('shake'); setTimeout(() => board.classList.remove('shake'), 500);
  }
  const big = isWater ? ['💦 ドボーン！', 'みずに おちちゃった… ⤴ジャンプで とびこえよう'] : isBox ? ['💥 ゴツン！', 'はこに ぶつかった！ 🔨こわすで こわそう'] : isRock ? ['💫 ゴツン！', 'いわに ぶつかった！ よけて すすもう'] : ['🚧 おっとっと！', 'そとには 出られないよ'];
  board.insertAdjacentHTML('beforeend', `<div class="pgBang ${isWater?'w':''}"><b>${big[0]}</b></div>`);
  msg.innerHTML = `😵 ${big[1]}`;
})(runProg);


/* =====================================================================
   v3.7：ものがたり（プロローグ 紙芝居）・チュートリアル・おんがく（アプリ内で 生成）
   ===================================================================== */
const pName = () => save.playerName || 'きみ';
const pKun = () => save.playerName ? save.playerName + 'くん' : 'きみ';

/* ---------- おんがく ---------- */
const SM = {ctx:null, master:null, timer:null, mood:null, step:0, next:0, on:true};
function smCtx(){
  if(!SM.ctx){ SM.ctx = new (window.AudioContext||window.webkitAudioContext)(); SM.master = SM.ctx.createGain(); SM.master.gain.value = 0.9; SM.master.connect(SM.ctx.destination); }
  if(SM.ctx.state==='suspended') SM.ctx.resume(); return SM.ctx;
}
const NOTE = n => { const m = /^([A-G])(#?)(\d)$/.exec(n); if(!m) return 0; const b = {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]] + (m[2]?1:0); return 440*Math.pow(2, (b + (+m[3]+1)*12 - 69)/12); };
function nt(f, t, d, type='triangle', vol=0.05, dest){
  const c = SM.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t+0.015); g.gain.exponentialRampToValueAtTime(0.0001, t+d);
  o.connect(g).connect(dest || SM.master); o.start(t); o.stop(t+d+0.05);
}
function nz(t, d, vol=0.08, freq=800, q=0.7){
  const c = SM.ctx, len = Math.max(1, c.sampleRate*d|0), buf = c.createBuffer(1, len, c.sampleRate), a = buf.getChannelData(0);
  for(let i=0;i<len;i++) a[i] = (Math.random()*2-1);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + d*0.3); g.gain.exponentialRampToValueAtTime(0.0001, t+d);
  s.connect(f).connect(g).connect(SM.master); s.start(t);
}
const MOODS = {
  box:   {spb:.27, mel:'E5 G5 C6 G5 E5 G5 C6 G5 F5 A5 C6 A5 E5 G5 C6 -', w:'triangle', v:.045, bell:1},
  bright:{spb:.22, mel:'C5 E5 G5 E5 F5 A5 G5 E5 D5 F5 E5 C5 D5 G4 C5 -', w:'triangle', v:.05, bass:'C3 - F3 - G3 - C3 -', bell:1},
  dark:  {spb:.42, mel:'A4 - C5 - B4 - G#4 - A4 - E4 - F4 - E4 -', w:'triangle', v:.04, drone:'A2'},
  wind:  {spb:.6, wind:1},
  warm:  {spb:.32, mel:'G4 C5 E5 G5 F5 E5 D5 C5 A4 C5 F5 A5 G5 E5 D5 -', w:'sine', v:.06, bass:'C3 - - - F3 - - - A2 - - - G2 - - -', bell:1},
  lively:{spb:.18, mel:'E5 G5 A5 G5 E5 C5 D5 E5 G5 E5 D5 C5 D5 E5 C5 -', w:'square', v:.025, bass:'C3 G3 C3 G3 F3 C4 G3 D4'},
  theme: {spb:.24, mel:'G4 C5 E5 G5 A5 G5 E5 C5 D5 E5 F5 D5 E5 C5 G4 - A4 C5 F5 A5 G5 E5 C5 E5 D5 C5 B4 D5 C5 - - -', w:'triangle', v:.05, bass:'C3 - G3 - A2 - E3 - F3 - C3 - G2 - C3 -', bell:1}
};
function musicPlay(mood){
  if(!save.settings.sound || !SM.on){ musicHalt(); return; }
  smCtx(); if(SM.mood===mood && SM.timer) return;
  const c = SM.ctx, g = SM.master.gain;
  g.cancelScheduledValues(c.currentTime); g.setValueAtTime(g.value, c.currentTime); g.linearRampToValueAtTime(0.0001, c.currentTime + 0.4);
  clearInterval(SM.timer); SM.timer = null;
  setTimeout(() => {
    SM.mood = mood; SM.step = 0; SM.next = c.currentTime + 0.05; const M = MOODS[mood]; if(!M) return;
    g.cancelScheduledValues(c.currentTime); g.setValueAtTime(0.0001, c.currentTime); g.linearRampToValueAtTime(0.9, c.currentTime + 0.8);
    const mel = (M.mel||'').split(' '), bass = (M.bass||'').split(' ');
    SM.timer = setInterval(() => {
      while(SM.next < c.currentTime + 0.3){
        const i = SM.step, t = SM.next;
        if(M.wind){ if(i % 2 === 0) nz(t, 1.6, 0.05, 300 + Math.random()*500, 0.5); }
        if(mel.length){ const n = mel[i % mel.length]; if(n && n!=='-'){ nt(NOTE(n), t, M.spb*1.8, M.w, M.v); if(M.bell) nt(NOTE(n)*2, t, M.spb*1.2, 'sine', M.v*0.35); } }
        if(bass.length && M.bass){ const b = bass[i % bass.length]; if(b && b!=='-') nt(NOTE(b), t, M.spb*2.6, 'triangle', 0.06); }
        if(M.drone && i % 8 === 0) nt(NOTE(M.drone), t, M.spb*8.5, 'sawtooth', 0.018);
        SM.next += M.spb; SM.step++;
      }
    }, 80);
  }, 420);
}
function musicHalt(){ clearInterval(SM.timer); SM.timer = null; SM.mood = null; if(SM.ctx){ const g = SM.master.gain, c = SM.ctx; g.cancelScheduledValues(c.currentTime); g.setValueAtTime(g.value, c.currentTime); g.linearRampToValueAtTime(0.0001, c.currentTime + 0.5); } }
function sfx2(k){
  if(!save.settings.sound) return; smCtx(); const t = SM.ctx.currentTime;
  SM.master.gain.cancelScheduledValues(t); SM.master.gain.setValueAtTime(Math.max(SM.master.gain.value, 0.6), t);
  if(k==='clap'){ [0, 0.28].forEach(d => { nz(t+d, 0.09, 0.5, 2400, 3); nt(1500, t+d, 0.06, 'square', 0.04); }); }
  if(k==='page'){ nz(t, 0.35, 0.12, 1800, 0.6); nz(t+0.08, 0.3, 0.08, 3200, 0.8); }
  if(k==='knock'){ [0, 0.22].forEach(d => { nt(160, t+d, 0.12, 'sine', 0.3); nz(t+d, 0.06, 0.2, 900, 2); }); }
  if(k==='light'){ ['C6','E6','G6','C7','E7'].forEach((n,i) => nt(NOTE(n), t + i*0.07, 0.9, 'sine', 0.06)); }
  if(k==='fanfare'){ [['C5',0],['E5',.15],['G5',.3],['C6',.45],['G5',.75],['C6',.9]].forEach(([n,d],i) => { nt(NOTE(n), t+d, i===5 ? 1.2 : 0.18, 'square', 0.05); nt(NOTE(n)/2, t+d, i===5 ? 1.2 : 0.18, 'triangle', 0.07); }); }
  if(k==='ng'){ nt(220, t, 0.25, 'square', 0.04); nt(185, t+0.15, 0.3, 'square', 0.04); }
}

/* =====================================================================
   プロローグ（紙芝居）
   ===================================================================== */
const PRO = [
  {fx:50, img:'st_1', mood:'box',   txt:'むかし むかし。「まなびの ひかり」で かがやく、ちいさな まちが ありました。'},
  {fx:45, img:'st_2', mood:'bright',txt:'まちの みんなは、まなぶことが だいすき。まいにち わらいごえで いっぱいでした。'},
  {fx:72, img:'st_3', mood:'dark',  txt:'ところが ある日――。「にがて大王」が、わすれんぼうの きりを つれて やってきたのです。'},
  {fx:64, img:'st_4', mood:'wind',  txt:'きりに つつまれた まちは いろを うしない、みんな どこかへ きえてしまいました……。'},
  {fx:50, img:'st_5', mood:'warm',  sfx:'knock', who:'シマくん', txt:'……コンコン。ねえ、きこえる？ ぼくは シマくん。ずっと、きみを さがしてたんだ！'},
  {fx:33, img:'st_6', mood:'lively',who:'ハナ', txt:'わたし、ハナ！ ひかりを もっている きみなら、この まちを とりもどせる。いっしょに がんばろう！'},
  {fx:30, img:'st_6', mood:'lively',who:'ハナ', txt:'ねえ、きみの なまえを おしえて？', name:1},
  {fx:64, img:'st_4', mood:'warm',  who:'シマくん', txt:'さあ、さいしょの もんだい！ {kun}の「まなびの ひかり」を 見せて！', quiz:1},
  {fx:42, img:'st_7', mood:'theme', sfx:'light', who:'シマくん', txt:'すごい！ これが {kun}の まなびの ひかりだ！ ひかりが あふれて、はじめての いえが うまれたよ！', fin:1}
];
const STY = {i:0, typing:false, full:'', timer:null, done:null, busy:false};
function storyFill(s){ return s.replace(/\{kun\}/g, pKun()).replace(/\{name\}/g, pName()); }
function storyShow(i, first){
  const P = PRO[i], el = $('#story');
  STY.i = i; const sheet = document.createElement('div'); sheet.className = 'kmSheet';
  sheet.innerHTML = `<div class="kmPic" style="background-image:url(${artSrc(P.img)});--fx:${P.fx||50}%;--fa:${Math.max(0,(P.fx||50)-14)}%;--fb:${Math.min(100,(P.fx||50)+14)}%"></div>
    <div class="kmText">${P.who ? `<b class="kmWho">${P.who}</b>` : ''}<span class="kmLine"></span>
      ${P.name ? `<div class="kmName"><input id="kmNameIn" maxlength="8" placeholder="なまえ（8もじまで）" value="${esc(save.playerName||'')}"><button class="btn pink" id="kmNameOk">けってい</button></div>` : ''}
      ${P.quiz ? '<div class="kmQuiz" id="kmQuiz"></div>' : ''}
      <i class="kmNext">▼ タッチで つぎへ</i></div>`;
  const stage = $('#kmStage'), old = stage.querySelector('.kmSheet:not(.out)');
  stage.insertBefore(sheet, stage.firstChild);
  if(old && !first){ old.classList.add('out'); sfx2('page'); setTimeout(() => old.remove(), 900); }
  musicPlay(P.mood); if(P.sfx) setTimeout(() => sfx2(P.sfx), 350);
  $('#kmDots').innerHTML = PRO.map((_,k) => `<i class="${k===i?'on':k<i?'past':''}"></i>`).join('');
  typeLine(storyFill(P.txt));
  if(P.quiz) setTimeout(storyQuiz, 600);
  if(P.name) setTimeout(() => $('#kmNameIn')?.focus(), 700);
}
function typeLine(s){
  clearInterval(STY.timer); STY.full = s; STY.typing = true; let n = 0; const el = () => $('#kmStage .kmSheet:not(.out) .kmLine');
  STY.timer = setInterval(() => { n += 1; const e = el(); if(e) e.textContent = s.slice(0, n); if(n >= s.length){ clearInterval(STY.timer); STY.typing = false; $('#kmStage .kmSheet:not(.out)')?.classList.add('ready'); } }, 55);
}
function storyNext(){
  if(STY.busy) return;
  const P = PRO[STY.i];
  if(STY.typing){ clearInterval(STY.timer); STY.typing = false; const e = $('#kmStage .kmSheet:not(.out) .kmLine'); if(e) e.textContent = STY.full; $('#kmStage .kmSheet:not(.out)')?.classList.add('ready'); return; }
  if(P.name || P.quiz) return;
  if(P.fin){ storyFinish(); return; }
  if(STY.i + 1 < PRO.length) storyShow(STY.i + 1);
}
function storyQuiz(){
  const a = ri(2,9), b = ri(2,9), ans = a + b, set = new Set([ans]); while(set.size < 4){ const v = ans + ri(-3,3); if(v > 0) set.add(v); }
  $('#kmQuiz').innerHTML = `<div class="kmQ">${a} ＋ ${b} ＝ ？</div><div class="kmOpts">${shuffle([...set]).map(v => `<button class="kmOpt" data-kq="${v}" data-ok="${v===ans?1:0}">${v}</button>`).join('')}</div>`;
}
async function storyFinish(){
  STY.busy = true; sfx2('fanfare');
  const el = $('#story'); el.insertAdjacentHTML('beforeend', `<div class="kmTitle"><div class="kmBurst"></div><img src="${esc(artSrc('logo_main'))}" alt=""><b>${esc(pKun())}と シマくんと ハナの<br>ものがたりが はじまる！</b><small>タッチして すすもう</small></div>`);
  confetti(3500);
  await sleep(900); STY.busy = false; STY.titleShown = true;
}
function storyClose(skip){
  musicHalt(); $('#story').classList.remove('show'); setTimeout(() => { $('#story').innerHTML = ''; }, 500);
  save.story = save.story || {}; save.story.pro = 1; persist();
  const cb = STY.done; STY.done = null; STY.titleShown = false; if(cb) cb(skip);
}
function storyOpen(done){
  STY.done = done; STY.i = 0; STY.busy = false; STY.titleShown = false;
  const el = $('#story');
  el.innerHTML = `<div class="kmBoard"><div class="kmFrame"><div id="kmStage"></div><div class="kmLatch l"></div><div class="kmLatch r"></div></div><div id="kmDots"></div></div>
    <button class="kmSkip" id="kmSkip">スキップ ⏭</button><button class="kmMute" id="kmMute">${SM.on ? '🔊' : '🔇'}</button>
    <div class="kmStart" id="kmStart"><img src="${esc(artSrc('bird_wave'))}" alt=""><b>📜 ものがたりが はじまるよ</b><small>おとが でるよ。タッチして はじめよう</small></div>`;
  el.classList.add('show');
}
document.addEventListener('click', e => {
  if(!$('#story')?.classList.contains('show')) return;
  e.stopPropagation();
  if(e.target.closest('#kmMute')){ SM.on = !SM.on; e.target.closest('#kmMute').textContent = SM.on ? '🔊' : '🔇'; if(SM.on) musicPlay(PRO[STY.i].mood); else musicHalt(); return; }
  if(e.target.closest('#kmSkip')){ storyClose(true); return; }
  if(e.target.closest('#kmStart')){ smCtx(); $('#kmStart').classList.add('go'); sfx2('clap'); setTimeout(() => { $('#kmStart')?.remove(); storyShow(0, true); }, 700); return; }
  if(STY.titleShown){ storyClose(false); return; }
  if(e.target.closest('#kmNameOk')){ const v = ($('#kmNameIn').value||'').trim().slice(0,8); if(!v){ toast('なまえを 入れてね'); return; } save.playerName = v; persist(); sfx2('light'); storyShow(STY.i + 1); return; }
  if(e.target.closest('.kmName')) return;
  const q = e.target.closest('[data-kq]');
  if(q){ if(q.dataset.ok==='1'){ q.classList.add('ok'); $$('#kmQuiz .kmOpt').forEach(b => b.disabled = true); givePts(20, 'はじめての まなびの ひかり'); sfx2('light'); setTimeout(() => storyShow(STY.i + 1), 700); }
    else { q.classList.add('ng'); sfx2('ng'); toast('おしい！ もういちど'); } return; }
  if(e.target.closest('.kmQuiz')) return;
  storyNext();
}, true);
document.addEventListener('keydown', e => { if($('#story')?.classList.contains('show') && e.key==='Enter' && e.target.id==='kmNameIn') $('#kmNameOk')?.click(); });

/* =====================================================================
   チュートリアル（スポットライト＋シマくんの ふきだし）
   ===================================================================== */
const TUT = [
  {screen:'home', sel:'#ptPill', txt:'さっきの ひかりは「ポイント」に なったよ！ べんきょうすると どんどん ふえるんだ。'},
  {screen:'home', sel:'#goTown', txt:'ポイントで まちを つくろう！ ここを タッチしてね。', tap:1},
  {screen:'town', sel:'#townMap', txt:'ここが {kun}の まち。おいわいに いえを 1けん たてたよ！', enter:'house'},
  {screen:'town', sel:'#townHead', txt:'「おまねきレター」で なかまを よぼう！ ひとり プレゼントするね。', act:'letter', btn:'✉️ レターを つかう'},
  {screen:'town', sel:'#navShop', txt:'「ショップ」では たてもの・みち・のりものが かえるよ。'},
  {screen:'home', sel:'#missionCard', txt:'まいにちの「ミッション」を クリアすると ポイントが もらえるよ。'},
  {screen:'home', sel:'#goMyHome', txt:'ここは ハナと {kun}の おうち。かぐで すてきに しよう！'},
  {screen:'home', sel:'#goRecord', txt:'がんばった「きろく」は ここで 見られるよ。'},
  {screen:'home', sel:'#goZukan', txt:'あつめた なかまや アイテムは「ずかん」で 見られるよ。'},
  {screen:'home', sel:'#goStudy', txt:'さあ、べんきょうして まちに ひかりを とりもどそう！ ぼくと ハナが いつも そばに いるよ！', last:1}
];
const TU = {on:false, i:0, el:null};
function tutData(){ return save.tut || (save.tut = {i:0, done:0}); }
function tutStart(i=0){ TU.on = true; tutData().i = i; persist(); document.body.classList.add('tutOn'); tutStep(); }
async function tutStep(){
  const D = tutData(), s = TUT[D.i]; if(!s){ tutEnd(); return; }
  $('#tutLayer').innerHTML = ''; $('#tutLayer').classList.add('show');
  if(curScreen !== s.screen) show(s.screen);
  await sleep(450);
  if(s.enter==='house'){ const t = save.town; if(!Object.values(t.cells).some(id => ITEM(id)?.home)){ const L = townCalc().L; let k = null;
      for(let y=Math.floor(L.rows/2); y<L.rows && !k; y++) for(let x=Math.floor(L.cols/2)-1; x<L.cols && !k; x++) if(!t.cells[`${x},${y}`]) k = `${x},${y}`;
      if(k){ t.cells[k] = 'house'; persist(); renderTown(); sfx2('light'); confetti(1500); } } await sleep(300); }
  const tgt = $(s.sel); if(tgt) tgt.scrollIntoView({block:'center', behavior:'smooth'});
  await sleep(450);
  tutDraw();
}
function tutDraw(){
  const D = tutData(), s = TUT[D.i]; if(!s || !TU.on) return;
  const tgt = $(s.sel), L = $('#tutLayer');
  let r = tgt ? tgt.getBoundingClientRect() : null; if(r && (r.width < 2 || r.height < 2)) r = null;
  const pad = 8, vh = innerHeight;
  const hole = r ? `<div class="tutHole" style="left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px"></div>` : '<div class="tutDim"></div>';
  const below = r ? (r.bottom + 190 < vh) : true, top = r ? (below ? r.bottom + pad + 14 : Math.max(8, r.top - pad - 14)) : vh*0.35;
  L.innerHTML = hole + `<div class="tutBub ${below?'below':'above'}" style="${below ? `top:${top}px` : `bottom:${vh - top}px`}">
    <img src="${esc(artSrc('bird_wave'))}" alt=""><div class="tutTx"><b>シマくん</b><span>${esc(storyFill(s.txt))}</span>
    ${s.tap ? '<small class="tutTap">👆 ひかっている ところを タッチ！</small>' : `<button class="btn ${s.act?'gold':'pink'} small tutBtn">${s.btn || (s.last ? 'はじめる！' : 'つぎへ ▶')}</button>`}</div>
    <i class="tutStep">${D.i+1}/${TUT.length}</i></div>`;
  TU.rect = r;
}
async function tutAdvance(){
  const D = tutData(), s = TUT[D.i];
  if(s.act==='letter'){ $('#tutLayer').classList.remove('show'); const t = save.town; t.bag.letter = (t.bag.letter||0) + 1; persist(); try{ await inviteResident(false); }catch(e){} $('#tutLayer').classList.add('show'); }
  if(s.last){ tutEnd(); return; }
  D.i++; persist(); sfx2('page'); tutStep();
}
function tutEnd(){
  TU.on = false; const D = tutData(); D.done = 1; persist(); document.body.classList.remove('tutOn');
  $('#tutLayer').classList.remove('show'); $('#tutLayer').innerHTML = ''; show('home'); confetti(2000); sfx2('fanfare');
  toast(`🎉 ${pKun()}、まちづくりの はじまりだ！`);
}
document.addEventListener('click', e => {
  if(!TU.on || $('#story')?.classList.contains('show')) return;
  if(e.target.closest('#dlg') && $('#dlg').classList.contains('show')) return;
  const s = TUT[tutData().i]; if(!s) return;
  if(e.target.closest('.tutBtn')){ e.stopImmediatePropagation(); e.preventDefault(); tutAdvance(); return; }
  if(e.target.closest('.tutSkip')){ e.stopImmediatePropagation(); tutEnd(); return; }
  if(s.tap){ const t = $(s.sel); if(t && t.contains(e.target)){ setTimeout(() => { tutData().i++; persist(); tutStep(); }, 380); return; } }
  e.stopImmediatePropagation(); e.preventDefault();
}, true);
window.addEventListener('resize', () => TU.on && setTimeout(tutDraw, 120));
window.addEventListener('scroll', () => TU.on && requestAnimationFrame(tutDraw), {passive:true});

/* =====================================================================
   はじまり・ふりかえり
   ===================================================================== */
const isNewPlayer = () => (save.history||[]).length === 0 && (save.points?.earned||0) < 60 && !(save.days && Object.keys(save.days).length > 1);
async function storyBoot(){
  if(save.story?.pro){ if(save.tut && !save.tut.done) tutStart(save.tut.i||0); return; }
  if(isNewPlayer()){ storyOpen(skip => { if(!save.tut?.done) tutStart(0); }); return; }
  const v = await dialog(`<div class="dlgArt big"><img src="${esc(artSrc('st_5'))}" alt="" style="width:100%;border-radius:14px;object-fit:cover;height:150px"></div><h2 class="dlgT">📜 あたらしく「ものがたり」が とどいたよ！</h2><p class="dlgP">シマくんと ハナと きみの ものがたり。見てみる？</p>`,
    [{label:'あとで', cls:'white', v:false}, {label:'📜 見る！', cls:'gold', v:true}], 'wide');
  save.story = save.story || {}; save.tut = save.tut || {i:0, done:1}; if(!('done' in save.tut)) save.tut.done = 1; persist();
  if(v) storyOpen(); else { save.story.pro = 1; persist(); }
}
(function waitBoot(){ if($('#loader') || $('#dlg')?.classList.contains('show')){ setTimeout(waitBoot, 400); return; } setTimeout(storyBoot, 500); })();
show = (orig => function(name){
  orig(name);
  if(name==='zukan' && !$('#storyBtns')){ const sec = $('#scr-zukan .card') || $('#scr-zukan'); sec.insertAdjacentHTML('afterbegin', `<div id="storyBtns"><button class="btn small gold" id="btnStory">📜 ものがたりを 見る</button><button class="btn small white" id="btnTut">📘 つかいかたの せつめい</button></div>`); }
})(show);
document.addEventListener('click', e => {
  if(e.target.closest('#btnStory')){ e.stopImmediatePropagation(); storyOpen(); return; }
  if(e.target.closest('#btnTut')){ e.stopImmediatePropagation(); tutStart(0); return; }
}, true);
/* ハナと シマくんが なまえで よぶ */
girlLine = (orig => function(r){ const s = orig(r); return save.playerName && Math.random() < 0.6 ? s.replace(/きみ/g, pKun()) : s; })(girlLine);


/* =====================================================================
   v3.8：①日本地図（赤い ●）の ボーナス問題で 地図が 出ない 不具合の 修正
          ＋ 小さい 都道府県は 地図を 自動で かくだい
         ②さんすうの メモ欄を 広く・横書きの 式にも 筆算スペース（方眼）
   ===================================================================== */

/* ---------- ① 日本地図：自動 かくだい ---------- */
const JP38 = (() => {
  const pts = PREF.map((p, i) => ({i, p, xy: p[0]==='沖縄県' ? null : prefXY(p)}));
  const near = {};
  pts.forEach(a => { if(!a.xy) return; let d = 1e9;
    pts.forEach(b => { if(b===a || !b.xy) return; const v = Math.hypot(a.xy[0]-b.xy[0], a.xy[1]-b.xy[1]); if(v < d) d = v; });
    near[a.i] = d; });
  return {pts, near};
})();
const JP_ZOOM_TH = 16;   // となりの 県庁所在地まで この きょりより 近いと かくだい
function jpMapFull(p){
  const i = PREF.indexOf(p), [x,y] = prefXY(p);
  return `<svg class="jpMap" data-pi="${i}" viewBox="0 0 400 440">${jpBase()}${pinSVG(x,y)}</svg>`;
}
function jpMapZoom(p){
  const i = PREF.indexOf(p), [cx,cy] = prefXY(p), d = JP38.near[i];
  const W = clamp(d*10, 84, 170), H = W*1.1;
  const vx = clamp(cx - W/2, 0, 400 - W), vy = clamp(cy - H/2, 0, 440 - H);
  const u = W/360;                       // 画面 1px ぶんの 大きさ
  const base = jpBase().replace(/stroke-width="1\.4"/g, `stroke-width="${(1.6*u).toFixed(2)}"`);
  const dots = JP38.pts.filter(o => o.xy && o.i!==i && o.xy[0] > vx-5 && o.xy[0] < vx+W+5 && o.xy[1] > vy-5 && o.xy[1] < vy+H+5)
    .map(o => `<circle cx="${o.xy[0].toFixed(1)}" cy="${o.xy[1].toFixed(1)}" r="${(4.2*u).toFixed(2)}" fill="#8C9AA6" stroke="#fff" stroke-width="${(1.4*u).toFixed(2)}" opacity=".75"/>`).join('');
  const pin = `<circle cx="${cx}" cy="${cy}" r="${(15*u).toFixed(2)}" fill="#E8414B" opacity=".25"><animate attributeName="r" values="${(10*u).toFixed(2)};${(20*u).toFixed(2)};${(10*u).toFixed(2)}" dur="1.4s" repeatCount="indefinite"/></circle>`
    + `<circle cx="${cx}" cy="${cy}" r="${(8*u).toFixed(2)}" fill="#E8414B" stroke="#fff" stroke-width="${(2.6*u).toFixed(2)}"/>`;
  // みぎ下に 日本ぜんたいの 小さな 地図（どこを かくだい しているか）
  const iw = W*0.34, ih = iw*1.1, ix = vx + W - iw - 5*u, iy = vy + H - ih - 5*u;
  const mini = `<rect x="${ix.toFixed(1)}" y="${iy.toFixed(1)}" width="${iw.toFixed(1)}" height="${ih.toFixed(1)}" rx="${(6*u).toFixed(1)}" fill="#fff" opacity=".9" stroke="#7FA9C9" stroke-width="${(1.2*u).toFixed(2)}"/>`
    + `<svg x="${ix.toFixed(1)}" y="${iy.toFixed(1)}" width="${iw.toFixed(1)}" height="${ih.toFixed(1)}" viewBox="0 0 400 440"><path d="${JP_REAL.jp}" fill="#A8DC8E" stroke="none"/>`
    + `<rect x="${vx.toFixed(1)}" y="${vy.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}" fill="rgba(232,65,75,.15)" stroke="#E8414B" stroke-width="7"/></svg>`;
  const lab = `<rect x="${(vx+5*u).toFixed(1)}" y="${(vy+5*u).toFixed(1)}" width="${(92*u).toFixed(1)}" height="${(24*u).toFixed(1)}" rx="${(12*u).toFixed(1)}" fill="#fff" opacity=".9"/>`
    + `<text x="${(vx+14*u).toFixed(1)}" y="${(vy+22*u).toFixed(1)}" font-size="${(14*u).toFixed(2)}" fill="#4F7896" font-weight="bold">🔍 かくだい</text>`;
  return `<svg class="jpMap zoomed" data-pi="${i}" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${W.toFixed(1)} ${H.toFixed(1)}">${base}${dots}${pin}${mini}${lab}</svg>`;
}
jpMap = function(p){
  if(!p) return '';
  const i = PREF.indexOf(p);
  if(i < 0 || p[0]==='沖縄県' || !(JP38.near[i] < JP_ZOOM_TH)) return jpMapFull(p);
  return jpMapZoom(p);
};

/* ---------- ① にがて問題の 地図を かならず 作りなおす ---------- */
// にがて問題を きろく する とき、地図の 都道府県番号（mp）も のこす
addWeak = (orig => function(p){
  orig(p);
  try{
    if(!p || p.bonus) return;
    const w = weakQ().find(x => x.k===qKeyOf(p)); if(!w || !w.big || w.mp!=null) return;
    const m = /data-pi="(\d+)"/.exec(p.disp||''); if(m) w.mp = +m[1];
  }catch(e){}
})(addWeak);
// 地図などの 大きな 図を もどす（番号 → 作りなおし → 答えから さがす の じゅん）
rehydrate = (orig => function(w){
  if(!w || !w.big) return w;
  if(w.mp!=null && PREF[w.mp]) return Object.assign({}, w, {disp: jpMap(PREF[w.mp])});
  const r = orig(w);
  if(r.disp) return r;
  const pf = PREF.find(x => x[0]===w.ans);
  if(pf && /赤い ●/.test(String(w.q))) return Object.assign({}, w, {disp: jpMap(pf)});
  return r;
})(rehydrate);
// ボーナス問題：にがて問題から えらぶ ときも 図を 作りなおす（図が もどせない 問題は つかわない）
pickHardQ = function(units, soc){
  const used = new Set(MQ.list.map(qKeyOf));
  const pool = uniq(units.concat(hardUnits(units, soc)));
  const W = shuffle(weakQ().filter(w => pool.includes(w.u) && !used.has(w.k))).slice(0, 4);
  for(const w0 of W){
    const w = rehydrate(w0);
    if(w.big && !w.disp && !w.optHtml) continue;
    return {u:w.u, type:w.type, q:w.q, ans:w.ans, opts: w.opts ? w.opts.slice() : undefined, disp:w.disp, hint:w.hint, optHtml:w.optHtml, sub:w.sub, dk:w.dk};
  }
  return _pickHardQ15(units, soc);
};
// 住民の 問題（にがて）：図が もどせなかった ときは 出さない
weakToMQ = (orig => function(it){
  if(it && it.w && it.w.big){ const r = rehydrate(it.w); if(!r.disp && !r.optHtml) return null; }
  return orig(it);
})(weakToMQ);

/* ---------- ② さんすう：メモ欄を 広く・横書きの 式に 筆算スペース ---------- */
const isMathU = u => !!(u && MATH_UNITS[u] && typeof MATH_UNITS[u].g === 'number');
function exprOf(q){
  const t = stripTags(String(q||'')).replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/．/g, '.');
  const m = /(\d[\d.,]*)\s*([+＋\-−×✕÷])\s*(\d[\d.,]*)/.exec(t);
  if(!m) return null;
  const a = m[1].replace(/,/g,''), b = m[3].replace(/,/g,''), op = m[2];
  const dec = a.includes('.') || b.includes('.');
  const ia = (a.split('.')[0]||'').length, ib = (b.split('.')[0]||'').length, fa = (a.split('.')[1]||'').length, fb = (b.split('.')[1]||'').length;
  let cols = Math.max(ia, ib) + Math.max(fa, fb) + (dec ? 1 : 0) + 2;
  let rows = 4;
  if(/[×✕]/.test(op)){ cols = a.replace('.','').length + b.replace('.','').length + 2 + (dec ? 1 : 0); rows = b.replace('.','').length >= 2 ? 6 : 4; }
  if(op==='÷'){ cols = a.replace('.','').length + b.replace('.','').length + 3; rows = Math.min(8, a.replace('.','').length*2 + 2); }
  return {op, dec, cols: clamp(cols, 7, 11), rows: clamp(rows, 4, 8)};
}
// 文章題：単元が 計算系で 数が 2つ 以上 あれば 方眼を 出す
function wordExpr(p){
  const U = MATH_UNITS[p.u]; if(!U || !/筆算|計算|かけ算|わり算|たし算|ひき算|小数|分数|大きな 数|あまり|文章題/.test(U.n||'')) return null;
  const t = stripTags(String(p.q||'')).replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0)-0xFEE0));
  const ns = (t.match(/\d[\d.,]*/g)||[]).map(x => x.replace(/,/g,'')).filter(x => x.length);
  if(ns.length < 2) return null;
  const top = ns.sort((x,y) => y.length - x.length).slice(0,2), dec = top.some(x => x.includes('.'));
  return {op:'?', dec, cols: clamp(top[0].length + top[1].length + 1, 7, 11), rows: 5};
}
function hsGridHTML(e){
  const bar = (/[÷]/.test(e.op)) ? '' : `<i class="hsBar" style="top:calc(2*var(--cs))"></i>`;
  return `<div class="hsGrid" style="--cols:${e.cols};--rows:${e.rows}">${bar}</div>`;
}
function memoPadHTML(p){
  const hasHs = /class="hissan/.test(p.disp||'');
  const e = !hasHs && p.type!=='cmp' ? (exprOf(p.q) || wordExpr(p)) : null;
  if(hasHs) return `<div class="memoPad withHs"><span class="mpLab">✏️ メモ</span><div class="mpTip">くり上がり・くり下がりの メモに つかってね</div></div>`;
  if(e) return `<div class="memoPad"><span class="mpLab">✏️ ここで ひっさん しよう</span>${hsGridHTML(e)}<div class="mpTip">${e.op==='?' ? '式を 立てて、ひっさんで 計算しよう' : e.dec ? '小数点（.）の 位置を たてに そろえて 書こう' : e.op==='÷' ? 'わる数・わられる数を 書いて 計算しよう' : '位を たてに そろえて 書こう'}</div></div>`;
  return `<div class="memoPad free"><span class="mpLab">✏️ メモ</span><div class="mpTip">図や 式を 自由に 書いてね</div></div>`;
}
mRender = (orig => function(){
  orig();
  const wk = $('#mWork'); if(!wk) return;
  wk.querySelector('.memoPad')?.remove();
  const p = MQ && MQ.list ? MQ.list[MQ.i] : null;
  const on = !!(p && isMathU(p.u) && !window.MQBUN && !window.MQEK);
  wk.classList.toggle('m38', on);
  if(on && $('#bonusIntro') && !$('#bonusIntro').classList.contains('show')){
    const cv = $('#mScratch'); cv.insertAdjacentHTML('beforebegin', memoPadHTML(p));
  }
  requestAnimationFrame(() => { try{ scrSize(); }catch(e){} });
})(mRender);
if(window.ResizeObserver){ try{ new ResizeObserver(() => { if(curScreen==='mathplay') scrSize(); }).observe($('#mWork')); }catch(e){} }

/* 住民の 問題でも：横書きの 式に 方眼を つけ、メモ欄を 広く */
mqFromP = (orig => function(p, u){
  const m = orig(p, u); if(!m) return m;
  const uu = u || p.u;
  if((!uu || isMathU(uu)) && !/class="hissan/.test(m.html) && p.type!=='cmp'){
    const e = exprOf(p.q); if(e) m.html += `<div class="hsGridWrap">${hsGridHTML(e)}</div>`;
  }
  return m;
})(mqFromP);
attachDlgMemo = function(){
  const h = $('#dlgBody .hissan') || $('#dlgBody .hsGridWrap'); if(!h || $('#dlgBody .dlgMemo')) return;
  const box = document.createElement('div'); box.className = 'dlgMemo';
  h.parentNode.insertBefore(box, h); box.appendChild(h);
  box.insertAdjacentHTML('beforebegin', `<div class="dmTools"><button data-dm="pen" class="on">✏️ メモ</button><button data-dm="undo">↩</button><button data-dm="clr">🧽</button></div>`);
  box.insertAdjacentHTML('beforeend', '<canvas class="dmCv"></canvas>');
  const cv = box.querySelector('canvas'), st = {on:true, strokes:[], cur:null};
  const size = () => { const r = {width:box.offsetWidth, height:box.offsetHeight}, d = devicePixelRatio||1; if(!r.width) return; cv.width = r.width*d; cv.height = r.height*d; cv.style.width = r.width+'px'; cv.style.height = r.height+'px'; cv.getContext('2d').setTransform(d,0,0,d,0,0); draw(); };
  const draw = () => { const c = cv.getContext('2d'); c.clearRect(0,0,cv.width,cv.height); c.strokeStyle = '#E8414B'; c.lineWidth = 3; c.lineCap = c.lineJoin = 'round';
    st.strokes.forEach(s => { c.beginPath(); c.moveTo(s[0][0], s[0][1]); s.forEach(p => c.lineTo(p[0], p[1])); if(s.length===1) c.lineTo(s[0][0]+.1, s[0][1]); c.stroke(); }); };
  const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { if(!st.on) return; e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(_){} st.cur = [pt(e)]; st.strokes.push(st.cur); draw(); });
  cv.addEventListener('pointermove', e => { if(!st.cur) return; e.preventDefault(); (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(ev => st.cur.push(pt(ev))); draw(); });
  ['pointerup','pointercancel'].forEach(t => cv.addEventListener(t, () => st.cur = null));
  cv.addEventListener('touchstart', e => { if(st.on) e.preventDefault(); }, {passive:false});
  $('#dlgBody .dmTools').addEventListener('click', e => { const b = e.target.closest('[data-dm]'); if(!b) return; e.stopPropagation();
    if(b.dataset.dm==='pen'){ st.on = !st.on; b.classList.toggle('on', st.on); cv.classList.toggle('off', !st.on); }
    if(b.dataset.dm==='undo'){ st.strokes.pop(); draw(); } if(b.dataset.dm==='clr'){ st.strokes = []; draw(); } });
  requestAnimationFrame(size); setTimeout(size, 400);
  if(window.ResizeObserver){ try{ new ResizeObserver(size).observe(box); }catch(e){} }
};



/* =====================================================================
   v3.9：かわいい フォント（ポップ／まるもじ／てがき／いつもの）
   ・インターネットに つながって いる ときは Webフォントを よみこむ
   ・つながって いない ときは 端末の まるゴシックで 表示（こわれない）
   ・漢字の 問題文は これまでどおり 教科書体（とめ・はね・はらいの ため）
   ===================================================================== */
const FONT_KIND = ['pop','maru','te','sys'];
function applyFont(){
  const v = FONT_KIND.includes(save.settings.font) ? save.settings.font : 'pop';
  FONT_KIND.forEach(k => document.documentElement.classList.toggle('fnt-'+k, k===v && k!=='sys'));
}
(function(){
  if(!('font' in save.settings)){ save.settings.font = 'pop'; persist(); }
  // 設定画面に「もじの かたち」を ついか
  const row = $('#segBonus')?.closest('.setSec');
  if(row && !$('#segFont')){
    row.insertAdjacentHTML('afterend', `<div class="setSec"><h3>もじの かたち</h3>
      <div class="row"><div class="seg" id="segFont"><button data-v="pop">ポップ</button><button data-v="maru">まるもじ</button><button data-v="te">てがき</button><button data-v="sys">いつもの</button></div></div>
      <div class="fontPrev"><b>まなびタウンへ ようこそ！</b>シマくんと ハナと いっしょに 123 を まなぼう。</div>
      <p class="note">かわいい もじは インターネットに つながって いる ときに よみこみます。つながって いない ときは いつもの もじに なります。漢字の 問題は 教科書の 字の ままです。</p></div>`);
    bindSeg('segFont', ST, 'font', () => { applyFont(); sound('tap'); });
  }
  applyFont();
})();
renderSettings = (orig => function(){ orig(); if($('#segFont')) syncSeg('segFont', FONT_KIND.includes(save.settings.font) ? save.settings.font : 'pop'); })(renderSettings);
// データを もどした ときも 反映
persist = (orig => function(){ orig(); if(document.body) applyFont(); })(persist);

Object.assign(DEFAULT_ART, {"c1_1": "./assets/images/image_1101_8d31eb4b.jpg", "c1_2": "./assets/images/image_1102_7f8a74e8.jpg", "c1_3": "./assets/images/image_1103_cf52eb90.jpg", "c1_4": "./assets/images/image_1104_cec4bece.jpg", "c1_5": "./assets/images/image_1105_666764e3.jpg", "c1_6": "./assets/images/image_1106_aeb74a1c.jpg"});

/* =====================================================================
   v4.0：ものがたり 第1章（Lv2）「きりの はしと まいごの ミミ」
   ・まちが Lv2 に なると 自動で 紙芝居が はじまる
   ・すでに Lv2 以上の ばあいは つぎに ひらいた ときに おしらせ
   ・ずかん →「ものがたりを 見る」から いつでも 見なおせる
   ===================================================================== */
const CHAPTERS = {
  ch1: {no:1, lv:2, title:'きりの はしと まいごの ミミ', cover:'c1_1', pages:[
    {fx:12, img:'c1_1', mood:'warm',   who:'シマくん', txt:'{kun}、見て！ まなびの ひかりで、まちが「村」に なったよ！ いえも なかまも ふえてきたね。'},
    {fx:86, img:'c1_1', mood:'warm',   who:'ハナ',     txt:'でも……村の はしっこには、まだ 灰色の きりが のこってる。なんだか しんぱい……。'},
    {fx:68, img:'c1_2', mood:'dark',   who:'ハナ',     txt:'あっ！ きりの むこう、はしの 上で だれかが ないてる！ 小さな うさぎさんだ！'},
    {fx:64, img:'c1_3', mood:'dark',   sfx:'knock', txt:'すると きりの 中から、大きな くもの かいぶつが あらわれました。「モヤモヤ～。この はしは とおさないぞ～」'},
    {fx:50, img:'c1_3', mood:'dark',   who:'シマくん', txt:'にがて大王の けらい「モヤモヤくん」だ！ {kun}、もんだいに こたえて ひかりを とどけよう！', quiz:1},
    {fx:46, img:'c1_4', mood:'lively', sfx:'light', who:'シマくん', txt:'いまだ！ {kun}の ひかりを うけとって……えーいっ！！ 「モヤ～～～っ!?」'},
    {fx:30, img:'c1_5', mood:'bright', who:'ハナ',     txt:'きりが はれて、にじが かかったよ！ うさぎの「ミミ」ちゃん、もう だいじょうぶ！'},
    {fx:40, img:'c1_5', mood:'bright', who:'ミミ',     txt:'たすけてくれて ありがとう！ {kun}の 村に すんでも いい？ みんなと いっしょに まなびたいな！'},
    {fx:45, img:'c1_6', mood:'theme',  who:'ハナ',     txt:'村の みんなも おおよろこび！ {kun}が がんばると、なかまが どんどん ふえていくね。'},
    {fx:92, img:'c1_6', mood:'warm',   who:'シマくん', txt:'あれ？ とおくの おかの 上に、ふしぎな ひかる かんばんが……。まちを「町」（Lv5）に したら、たしかめに いこう！', fin:1}
  ]}
};
const CH_ORDER = ['ch1'];
const chSeen = id => !!(save.story && save.story[id]);
const chOpen = id => (save.town?.lv||0) + 1 >= CHAPTERS[id].lv;

const PRO_BACKUP = PRO.slice();
const CHS = {id:null, quizN:0};
function storyOpenCh(id, done){
  const C = CHAPTERS[id]; if(!C) return;
  CHS.id = id; CHS.quizN = 0;
  PRO.splice(0, PRO.length, ...C.pages);
  storyOpen(done);
  const st = $('#kmStart');
  if(st) st.innerHTML = `<img src="${esc(artSrc('bird_wave'))}" alt=""><b>📜 だい${C.no}しょう</b><b class="chT">「${esc(C.title)}」</b><small>おとが でるよ。タッチして はじめよう</small>`;
}
storyClose = (orig => function(skip){
  const id = CHS.id;
  if(id){ save.story = save.story || {}; save.story[id] = 1; CHS.id = null; PRO.splice(0, PRO.length, ...PRO_BACKUP); }
  orig(skip);
})(storyClose);

/* ---------- 3もん クイズ（モヤモヤくんに ひかりを あてる） ---------- */
function chQuizQ(){
  const k = CHS.quizN, ans = [];
  let a, b, q, v;
  if(k===0){ a = ri(12,58); b = ri(11,39); q = `${a} ＋ ${b}`; v = a+b; }
  else if(k===1){ a = ri(41,95); b = ri(12,a-10); q = `${a} − ${b}`; v = a-b; }
  else { a = ri(3,9); b = ri(3,9); q = `${a} × ${b}`; v = a*b; }
  const set = new Set([v]); while(set.size < 4){ const w = v + choice([-10,-2,-1,1,2,10]); if(w > 0) set.add(w); }
  return {q, v, opts:shuffle([...set])};
}
storyQuiz = (orig => function(){
  if(!CHS.id){ orig(); return; }
  const Q = chQuizQ(), hp = 3 - CHS.quizN;
  $('#kmQuiz').innerHTML = `<div class="chHp">モヤモヤくん ${'☁️'.repeat(hp)}<span>${'✨'.repeat(CHS.quizN)}</span></div>
    <div class="kmQ">${Q.q} ＝ ？</div><div class="kmOpts">${Q.opts.map(v => `<button class="kmOpt" data-cq="${v}" data-ok="${v===Q.v?1:0}">${v}</button>`).join('')}</div>`;
})(storyQuiz);
document.addEventListener('click', e => {
  if(!$('#story')?.classList.contains('show') || !CHS.id) return;
  const q = e.target.closest('[data-cq]'); if(!q) return;
  e.stopPropagation();
  if(q.dataset.ok!=='1'){ q.classList.add('ng'); sfx2('ng'); toast('おしい！ もういちど'); return; }
  q.classList.add('ok'); $$('#kmQuiz .kmOpt').forEach(b => b.disabled = true); sfx2('light');
  const pic = $('#kmStage .kmSheet:not(.out) .kmPic'); if(pic){ pic.classList.remove('chHit'); void pic.offsetWidth; pic.classList.add('chHit'); }
  CHS.quizN++;
  if(CHS.quizN < 3){ setTimeout(() => { if(CHS.id) storyQuiz(); }, 650); return; }
  givePts(50, 'モヤモヤくんを やっつけた');
  setTimeout(() => storyShow(STY.i + 1), 750);
}, true);

/* ---------- 章の おわり：タイトルと ごほうび ---------- */
storyFinish = (orig => async function(){
  if(!CHS.id){ return orig(); }
  const C = CHAPTERS[CHS.id];
  STY.busy = true; sfx2('fanfare');
  const gift = chReward(CHS.id);
  $('#story').insertAdjacentHTML('beforeend', `<div class="kmTitle chEnd"><div class="kmBurst"></div><img src="${esc(artSrc(C.cover))}" alt="" class="chCover">
    <b>だい${C.no}しょう「${esc(C.title)}」<br>おしまい！</b><div class="chGift">${gift}</div><small>タッチして すすもう</small></div>`);
  confetti(3500);
  await sleep(900); STY.busy = false; STY.titleShown = true;
})(storyFinish);
function chReward(id){
  save.story = save.story || {}; const key = id + 'gift';
  if(save.story[key]) return '🎁 ごほうびは もう もらったよ';
  save.story[key] = 1;
  let out = '🎁 ごほうび：100pt';
  addPoints(100, `ものがたり だい${CHAPTERS[id].no}しょう`, true);
  if(id==='ch1'){
    const t = save.town, c = townCalc(), sp = SPECIES.find(s => s.id==='rabbit'), h = sp && findHome(sp);
    if(sp && h && t.res.length < c.maxRes){
      const r = newResident(sp); r.name = 'ミミ'; r.home = h.key; t.res.push(r); discover(r.sp);
      out += '<br>🐰 うさぎの ミミが 村に ひっこしてきたよ！';
    } else {
      t.bag.letter = (t.bag.letter||0) + 1;
      out += '<br>✉️ おまねきレター ×1（ミミは いえが あいたら よんでね）';
    }
  }
  persist(); try{ updatePill(); }catch(e){}
  return out;
}

/* ---------- Lv2 に なったら 自動で はじまる ---------- */
function chNext(){ return CH_ORDER.find(id => chOpen(id) && !chSeen(id)); }
async function chOffer(auto){
  const id = chNext(); if(!id || CHS.id || $('#story')?.classList.contains('show') || TU?.on) return;
  const C = CHAPTERS[id];
  const v = await dialog(`<div class="dlgArt big"><img src="${esc(artSrc(C.cover))}" alt="" style="width:100%;border-radius:14px;object-fit:cover;height:150px"></div>
    <h2 class="dlgT">📜 ものがたりの つづきが とどいたよ！</h2><p class="dlgP">だい${C.no}しょう「<b>${esc(C.title)}</b>」<br>${auto ? '村に なった おいわいに、シマくんが よんでるよ。' : ''}</p>`,
    [{label:'あとで', cls:'white', v:false}, {label:'📜 見る！', cls:'gold', v:true}], 'wide');
  if(v) storyOpenCh(id, () => { renderCurrent?.(); });
}
doLevelUp = (orig => async function(){
  await orig();
  if(chNext()) setTimeout(() => chOffer(true), 400);
})(doLevelUp);
// すでに Lv2 いじょうの ひと：起動の あとに 1回 おしらせ
(function waitCh(){
  if($('#loader') || $('#dlg')?.classList.contains('show') || $('#story')?.classList.contains('show') || TU?.on || !save.story?.pro){ setTimeout(waitCh, 800); return; }
  if(chNext() && !save.story.chAsked){ save.story.chAsked = 1; persist(); setTimeout(() => chOffer(false), 600); }
})();

/* ---------- ずかん：ものがたりを えらんで 見なおす ---------- */
document.addEventListener('click', async e => {
  if(!e.target.closest('#btnStory')) return;
  e.stopImmediatePropagation();
  const list = CH_ORDER.map(id => {
    const C = CHAPTERS[id], ok = chOpen(id);
    return `<button class="chItem ${ok?'':'lock'}" data-ch="${ok?id:''}"><img src="${esc(artSrc(C.cover))}" alt=""><span><small>だい${C.no}しょう</small>${ok ? esc(C.title) : `？？？（Lv${C.lv}で ひらくよ）`}</span></button>`;
  }).join('');
  const v = await dialog(`<h2 class="dlgT">📜 ものがたり</h2><div class="chList">
    <button class="chItem" data-ch="pro"><img src="${esc(artSrc('st_1'))}" alt=""><span><small>プロローグ</small>まなびの ひかり</span></button>${list}</div>`,
    [{label:'とじる', cls:'white', v:null}], 'wide');
}, true);
document.addEventListener('click', e => {
  const b = e.target.closest('#dlg .chItem'); if(!b) return;
  e.stopImmediatePropagation();
  if(b.classList.contains('lock')){ toast('まちを レベルアップすると 見られるよ'); return; }
  const id = b.dataset.ch; $('#dlgBtns button')?.click();
  setTimeout(() => { if(id==='pro') storyOpen(); else storyOpenCh(id); }, 350);
}, true);


/* =====================================================================
   v4.1：不具合の 修正
   ===================================================================== */

/* ---------- ① たて画面で 物語の 問題に こたえられない → 文の 欄を スクロール・問題を 見える 位置へ ---------- */
storyQuiz = (orig => function(){
  orig();
  setTimeout(() => { const q = $('#kmStage .kmSheet:not(.out) #kmQuiz'); if(q){ const box = q.closest('.kmText'); if(box) box.scrollTo({top: box.scrollHeight, behavior:'smooth'}); } }, 80);
})(storyQuiz);

/* ---------- ② ずかんから 物語：はじめの ページに もどされる 対策 ---------- */
// ・「はじめる」の 2どおし で ページ0が 2回 よばれていた → 1回だけに
// ・ページを めくった 直後の 2どおし を むし
// ・物語が ひらいている あいだは ほかから storyOpen されない
STY.started = false; STY.turn = 0;
storyOpen = (orig => function(done){
  if($('#story')?.classList.contains('show') && !STY.reopen) return;
  STY.started = false; STY.reopen = false; return orig(done);
})(storyOpen);
storyShow = (orig => function(i, first){ STY.turn = Date.now(); return orig(i, first); })(storyShow);
window.addEventListener('click', e => {
  const st = $('#story'); if(!st?.classList.contains('show')) return;
  if(e.target.closest('#kmStart')){ if(STY.started){ e.stopImmediatePropagation(); e.preventDefault(); return; } STY.started = true; STY.turn = Date.now() + 700; return; }
  if(e.target.closest('button,input,#kmSkip,#kmMute')) return;
  if(Date.now() - STY.turn < 350){ e.stopImmediatePropagation(); e.preventDefault(); }
}, true);

/* ずかんの ボタン（window で さきに うけとる） */
async function storyChooser(){
  const list = CH_ORDER.map(id => {
    const C = CHAPTERS[id], ok = chOpen(id);
    return `<button class="chItem ${ok?'':'lock'}" data-ch="${ok?id:''}"><img src="${esc(artSrc(C.cover))}" alt=""><span><small>だい${C.no}しょう</small>${ok ? esc(C.title) : `？？？（Lv${C.lv}で ひらくよ）`}</span></button>`;
  }).join('');
  await dialog(`<h2 class="dlgT">📜 ものがたり</h2><div class="chList">
    <button class="chItem" data-ch="pro"><img src="${esc(artSrc('st_1'))}" alt=""><span><small>プロローグ</small>まなびの ひかり</span></button>${list}</div>`,
    [{label:'とじる', cls:'white', v:null}], 'wide');
}
window.addEventListener('click', e => {
  if(e.target.closest('#btnStory')){ e.stopImmediatePropagation(); e.preventDefault(); storyChooser(); return; }
  if(e.target.closest('#btnTut')){ e.stopImmediatePropagation(); e.preventDefault(); TU.replay = true; tutStart(0); return; }
}, true);

/* ---------- ③ つかいかたの せつめい：とちゅうで おわれる・ふきだしが カクカク うごかない ---------- */
tutStart = function(i=0){
  TU.on = true; TU.replay = !!TU.replay || !!tutData().done; tutData().i = i; persist();
  document.body.classList.add('tutOn'); tutStep();
};
tutStep = async function(){
  const D = tutData(), s = TUT[D.i]; if(!s){ tutEnd(); return; }
  const L = $('#tutLayer'); L.innerHTML = ''; L.dataset.step = ''; L.classList.add('show');
  if(curScreen !== s.screen) show(s.screen);
  await sleep(380);
  if(s.enter==='house' && !TU.replay){ const t = save.town; if(!Object.values(t.cells).some(id => ITEM(id)?.home)){ const Lc = townCalc().L; let k = null;
      for(let y=Math.floor(Lc.rows/2); y<Lc.rows && !k; y++) for(let x=Math.floor(Lc.cols/2)-1; x<Lc.cols && !k; x++) if(!t.cells[`${x},${y}`]) k = `${x},${y}`;
      if(k){ t.cells[k] = 'house'; persist(); renderTown(); sfx2('light'); confetti(1500); } } await sleep(250); }
  const tgt = $(s.sel);
  if(tgt){ const H = document.documentElement, sb = H.style.scrollBehavior; H.style.scrollBehavior = 'auto';
    try{ tgt.scrollIntoView({block:'center', inline:'nearest', behavior:'auto'}); }catch(e){ tgt.scrollIntoView(); }
    H.style.scrollBehavior = sb; }
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  await sleep(60);
  tutDraw();
};
function tutPlace(){
  const D = tutData(), s = TUT[D.i], L = $('#tutLayer'); if(!s || !L) return;
  const bub = L.querySelector('.tutBub'), hole = L.querySelector('.tutHole'); if(!bub) return;
  const tgt = $(s.sel); let r = tgt ? tgt.getBoundingClientRect() : null; if(r && (r.width < 2 || r.height < 2)) r = null;
  const pad = 8, vh = innerHeight, bh = bub.offsetHeight || 170, gap = 14;
  if(hole && r) Object.assign(hole.style, {left:(r.left-pad)+'px', top:(r.top-pad)+'px', width:(r.width+pad*2)+'px', height:(r.height+pad*2)+'px'});
  let below = true, top;
  if(!r) top = vh*0.32;
  else {
    const spB = vh - (r.bottom + pad + gap), spA = r.top - pad - gap;
    below = spB >= bh + 8 || spB >= spA;
    top = below ? r.bottom + pad + gap : r.top - pad - gap - bh;
  }
  top = Math.max(8, Math.min(vh - bh - 8, top));
  bub.style.top = top + 'px'; bub.style.bottom = 'auto';
  bub.classList.toggle('below', !!r && below); bub.classList.toggle('above', !!r && !below);
  if(r){ const br = bub.getBoundingClientRect(); bub.style.setProperty('--ax', Math.max(24, Math.min(br.width - 24, r.left + r.width/2 - br.left)) + 'px'); }
  TU.rect = r;
}
tutDraw = function(){
  const D = tutData(), s = TUT[D.i]; if(!s || !TU.on) return;
  const L = $('#tutLayer');
  if(L.dataset.step === String(D.i) && L.querySelector('.tutBub')){ tutPlace(); return; }
  const tgt = $(s.sel), r = tgt ? tgt.getBoundingClientRect() : null, ok = r && r.width >= 2 && r.height >= 2;
  const act = s.act && !TU.replay;
  L.innerHTML = (ok ? '<div class="tutHole"></div>' : '<div class="tutDim"></div>') +
    `<div class="tutBub"><img src="${esc(artSrc('bird_wave'))}" alt=""><div class="tutTx"><b>シマくん</b><span>${esc(storyFill(s.txt))}</span>
    ${s.tap && !TU.replay ? '<small class="tutTap">👆 ひかっている ところを タッチ！</small>' : `<div class="tutRow">${TU.replay && !s.last ? '<button class="tutQuitIn tutQuit2">✕ おわる</button>' : ''}<button class="btn ${act?'gold':'pink'} small tutBtn">${act ? s.btn : (s.last ? (TU.replay ? 'おわる' : 'はじめる！') : 'つぎへ ▶')}</button></div>`}</div>
    <i class="tutStep">${D.i+1}/${TUT.length}</i></div>`;
  L.dataset.step = String(D.i);
  tutPlace();
  requestAnimationFrame(() => { tutPlace(); L.querySelector('.tutBub')?.classList.add('in'); });
};
tutAdvance = (orig => async function(){
  const D = tutData(), s = TUT[D.i];
  if(TU.replay){ if(s.last){ tutQuit(); return; } D.i++; persist(); sfx2('page'); tutStep(); return; }
  return orig();
})(tutAdvance);
function tutQuit(){
  TU.on = false; TU.replay = false; const D = tutData(); D.done = 1; persist(); document.body.classList.remove('tutOn');
  const L = $('#tutLayer'); L.classList.remove('show'); L.innerHTML = ''; L.dataset.step = ''; show('zukan');
}
tutEnd = (orig => function(){ if(TU.replay){ tutQuit(); return; } return orig(); })(tutEnd);
window.addEventListener('click', e => {
  if(!TU.on) return;
  if(e.target.closest('.tutQuit,.tutQuit2')){ e.stopImmediatePropagation(); e.preventDefault(); tutQuit(); return; }
  // ふりかえり中は「タッチして すすむ」の ステップも ボタンで すすめる
  if(TU.replay && e.target.closest('.tutBtn')){ e.stopImmediatePropagation(); e.preventDefault(); tutAdvance(); }
}, true);
window.addEventListener('scroll', () => { if(TU.on) requestAnimationFrame(tutPlace); }, {passive:true, capture:true});

/* ---------- ⑤ ホームの 季節の 背景：イベントを クリアしても かわらない ---------- */
// Lv7（都市）いこうも 季節の 背景を つかう（春：都市・冬：雪の 都市・夏／秋：季節の 絵）
homeBgKey = function(){ const s = seasonNow(), city = (save.town?.lv||0) >= 6; return city ? (s==='winter' ? 'hb_citywinter' : s==='spring' ? 'hb_city' : 'hb_'+s) : 'hb_'+s; };
function keepHomeBg(){
  if(curScreen!=='home') return;
  const bg = $('#bg'), want = artSrc(homeBgKey()); if(!bg || !want) return;
  if(!bg.style.backgroundImage.includes(want.slice(-160))) bg.style.backgroundImage = `url("${want}")`;
}
(function(){
  const bg = $('#bg'); if(!bg || !window.MutationObserver) return;
  let busy = false;
  new MutationObserver(() => { if(busy) return; busy = true; try{ keepHomeBg(); } finally { busy = false; } }).observe(bg, {attributes:true, attributeFilter:['style']});
})();
renderHome = (orig => function(){ const r = orig.apply(this, arguments); keepHomeBg(); return r; })(renderHome);
show = (orig => function(name){ orig(name); if(name==='home') keepHomeBg(); })(show);
Object.assign(DEFAULT_ART, {"c2_1": "./assets/images/image_1107_59059d2c.jpg", "c2_2": "./assets/images/image_1108_ad6e9499.jpg", "c2_3": "./assets/images/image_1109_3346821e.jpg", "c2_4": "./assets/images/image_1110_47dc3dc7.jpg", "c2_5": "./assets/images/image_1111_0016bcfa.jpg", "c2_6": "./assets/images/image_1112_9e5450ff.jpg"});

/* =====================================================================
   v4.1：ものがたり 第2章（Lv5）「ひかる かんばんと ことばの もり」
   ===================================================================== */
function kanjiQ(){
  const pool = BUILTIN.filter(q => q.reading && q.reading.length >= 2 && q.reading.length <= 5 && q.word);
  const used = CHS.usedK || (CHS.usedK = new Set());
  let q; for(let g=0; g<50; g++){ q = choice(pool); if(!used.has(q.reading)) break; } used.add(q.reading);
  const others = shuffle(pool.filter(x => x.reading!==q.reading && Math.abs(x.reading.length - q.reading.length) <= 1)).map(x => x.reading);
  const opts = shuffle([...new Set([q.reading, ...others])].slice(0,4));
  return {html:`<small>せんの ことばの 読みは？</small>${esc(q.pre)}<u>${esc(q.word)}</u>${esc(q.post)}`, v:q.reading, opts, kq:q};
}
CHAPTERS.ch2 = {no:2, lv:5, title:'ひかる かんばんと ことばの もり', cover:'c2_6',
  hp:'ケシケシ 🫙', beat:'ケシケシから ことばを とりかえした',
  quiz(){ return kanjiQ(); },
  pages:[
    {fx:20, img:'c2_1', mood:'bright', who:'ハナ',     txt:'{kun}の まちが、とうとう「町」に なったね！ お店も ひとも いっぱいだよ。'},
    {fx:80, img:'c2_1', mood:'warm',   who:'シマくん', txt:'やくそくどおり、おかの 上の ひかる かんばんを 見に いこう！ ミミも いっしょだよ。'},
    {fx:30, img:'c2_2', mood:'dark',   who:'ハナ',     txt:'あれ？ かんばんに なにも 書いてない……。字が ちょうちょに なって、もりへ とんでいっちゃう！'},
    {fx:65, img:'c2_3', mood:'warm',   who:'フクロウはかせ', txt:'ホッホー、ようこそ「ことばの もり」へ。わしは もりばんの フクロウはかせじゃ。'},
    {fx:80, img:'c2_3', mood:'warm',   who:'フクロウはかせ', txt:'ことばの ちょうちょは、だれかに つかまえられて しまったようじゃ……。'},
    {fx:66, img:'c2_4', mood:'dark',   sfx:'knock', txt:'「ケシケシ～！ ことばは ぜーんぶ ぼくが けしちゃうもんね～」 にがて大王の けらい、ケシケシが あらわれました。'},
    {fx:40, img:'c2_4', mood:'dark',   who:'シマくん', txt:'ことばの 読みかたを こたえれば、ちょうちょは もどってくる！ {kun}、いくよ！', quiz:1},
    {fx:42, img:'c2_5', mood:'lively', sfx:'light', who:'シマくん', txt:'ひかりよ、とどけ～っ！ 「ケ、ケシ……ハックション!!」 びんが われて、ちょうちょが とびだした！'},
    {fx:8,  img:'c2_5', mood:'bright', who:'フクロウはかせ', txt:'あっぱれじゃ、{kun}！ わしも 町で みんなに ことばを おしえたい。いっしょに いっても いいかの？'},
    {fx:30, img:'c2_6', mood:'theme',  who:'ハナ',     txt:'ちょうちょが もどって、かんばんが ひかった！ やじるしが どこかを さしてるよ。'},
    {fx:90, img:'c2_6', mood:'warm',   who:'シマくん', txt:'たにの むこうの「えき」だ……。でも 汽車が くらい トンネルに すいこまれていく。まちが「都市」（Lv7）に なったら、たしかめに いこう！', fin:1}
  ]};
CH_ORDER.push('ch2');

/* 章ごとの 問題・名前 */
chQuizQ = (orig => function(){
  const C = CHAPTERS[CHS.id];
  const Q = C && C.quiz ? C.quiz(CHS.quizN) : orig();
  CHS.lastQ = Q; return Q;
})(chQuizQ);
storyQuiz = (orig => function(){
  orig();
  const C = CHAPTERS[CHS.id], Q = CHS.lastQ; if(!C || !Q) return;
  const hp = $('#kmQuiz .chHp'); if(hp && C.hp){ const left = 3 - CHS.quizN; hp.innerHTML = `${esc(C.hp.split(' ')[0])} ${C.hp.split(' ')[1].repeat(left)}<span>${'✨'.repeat(CHS.quizN)}</span>`; }
  if(Q.html){ const k = $('#kmQuiz .kmQ'); if(k){ k.innerHTML = Q.html; k.classList.add('kq'); } }
})(storyQuiz);
givePts = (orig => function(p, why){
  if(CHS.id && why==='モヤモヤくんを やっつけた' && CHAPTERS[CHS.id]?.beat) why = CHAPTERS[CHS.id].beat;
  return orig(p, why);
})(givePts);
storyOpenCh = (orig => function(id, done){ CHS.usedK = new Set(); return orig(id, done); })(storyOpenCh);

/* ごほうび：フクロウはかせが ひっこして くる */
chReward = (orig => function(id){
  if(id!=='ch2') return orig(id);
  save.story = save.story || {}; const key = id + 'gift';
  if(save.story[key]) return '🎁 ごほうびは もう もらったよ';
  save.story[key] = 1;
  let out = '🎁 ごほうび：150pt';
  addPoints(150, 'ものがたり だい2しょう', true);
  const t = save.town, c = townCalc(), sp = SPECIES.find(s => s.id==='owl'), h = sp && findHome(sp);
  if(sp && h && t.res.length < c.maxRes){
    const r = newResident(sp); r.name = 'はかせ'; r.home = h.key; r.star = Math.max(r.star||1, 2); t.res.push(r); discover(r.sp);
    out += '<br>🦉 フクロウの「はかせ」が 町に ひっこしてきたよ！';
  } else {
    t.bag.goldletter = (t.bag.goldletter||0) + 1;
    out += '<br>✨ きらきらレター ×1（フクロウが すめる 家が あいたら よんでね）';
  }
  persist(); try{ updatePill(); }catch(e){}
  return out;
})(chReward);

/* 章を とじたら、つぎの 章が あれば あんない ／ 章ごとに 1回ずつ おしらせ */
storyClose = (orig => function(skip){
  orig(skip);
  setTimeout(() => { if(chNext()) chOffer(false); }, 1400);
})(storyClose);
(function waitCh2(){
  if($('#loader') || $('#dlg')?.classList.contains('show') || $('#story')?.classList.contains('show') || TU?.on || !save.story?.pro){ setTimeout(waitCh2, 900); return; }
  const id = chNext(); if(!id) return;
  const k = 'ask_' + id; if(save.story[k] || (id==='ch1' && save.story.chAsked)) return;
  save.story[k] = 1; save.story.chAsked = 1; persist(); setTimeout(() => chOffer(false), 700);
})();

/* =====================================================================
   起動
   ===================================================================== */
let rzT = null;
window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { if(Pad.isOpen) Pad.layout(); else if(curScreen==='quiz') drawThumbs(); else if(curScreen==='town') renderMap(); }, 150); });
document.addEventListener('gesturestart', e => e.preventDefault());
ensureTown(); applyArt(); updatePill(); show('home');
try{ bootLoader(); }catch(e){ document.getElementById('loader')?.remove(); }
