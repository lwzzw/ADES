function wx_fix(){var _=$("#snapshot-container");function m(){console.log("displayCanvasPrestige"),function(){var m="#QRHint{line-height:normal;text-align:left;margin-top:39px;background:#eee;padding:9px;display:flex;align-items:center;justify-content:center;}#canvasQR {margin-right:7px}#canvasQR img,#canvasQR canvas{width:64px;padding:5px;background:#fff;box-sizing:border-box}#titleQR{text-align:left}.h222s{overflow:-moz-hidden-unscrollable;overflow:hidden;}#titleQRt{font-size:14px;font-weight:bold}#titleQRd{font-size:10px}";m="<style>"+m+"</style>",_.append(m+"<div id='QRHint'><div id='canvasQR'></div><div id='titleQR'><div id='titleQRt'></div><div id='titleQRd'></div></div></div>"),_.find("a").hide(),$("#titleQRt").text(window.qr_hint||$("h1").text()),$("#titleQRd").text("长按识别二维码获取你的结果");_.height();var z=window.MPURL?window.MPURL:test.url;new QR(document.getElementById("canvasQR"),{text:z,render:"image",width:512,height:512,colorDark:"#333333",colorLight:"#FFFFFF",correctLevel:QR.CorrectLevel.L})}(),_.find("svg").each((function(){$(this).attr("width",$(this).width()+"px"),$(this).attr("height",$(this).height()+"px")})),$(".pppr, .leader_ad_banner").hide(),setTimeout((function(){window.scrollTo(0,0),$("html,body").addClass("h222s"),"function"==typeof window.h2cStart&&window.h2cStart(),html2canvas(_[0],{scrollX:0,scrollY:0,scale:2,ignoreElements:function($){return"IFRAME"==$.nodeName}}).then((function(m){$(".pppr, .leader_ad_banner").show(),window.prestige_img=m.toDataURL(),_.find("a").show(),wxImgFix(),clearInterval(_xG),$("html,body").removeClass("h222s"),"function"==typeof window.h2cEnd&&window.h2cEnd()}))}),1e3)}window.html2canvas?(console.log("direct h2c"),m()):(console.log("load h2c"),aload("//www.arealme.cn/static/h2c.js?v=1",m))}function main(){var _=[1,3,5,10,15,30,60,100,180];"1"==localStorage.getItem("cpsauto")&&($("#start").click(),localStorage.removeItem("cpsauto"));var m=3;"012345678".split("").includes(localStorage.getItem("sp_cur"))&&(m=localStorage.getItem("sp_cur")),$("#secpick b").click((function(){var z=$(this).index();localStorage.setItem("sp_cur",z),m=z,CPS_TIMER=_[m],g("/type/"+CPS_TIMER),$("#secpick b").removeClass("sp_cur").removeAttr("style"),$(this).addClass("sp_cur").css("color","#FFF");var t=$(".hint").find("p:eq(0)").find("b:eq(0)"),F=t.text().replace(/\d+/,CPS_TIMER);t.text(F)})),$("#secpick b:eq("+m+")").click()}function CQLoad(){setTimeout((function(){$("body").append('<style id="kplads">.leader_ad_banner, .google-auto-placed{display:none !important}</style>')}),0)}function CQUnload(){$("#kplads").remove()}function setPrestige(){prestige="根据《10秒标准版点击速度》测试，我的每秒点击次数是【%RESULT%】，你能打败我吗？".split("%RESULT%").join((iq_value/1).toFixed(1))}function resultParse(){function _(){setTimeout(m,0)}function m(){let _=function($){var _,m=[[13,"★★★★★★★"],[12.9,"★★★★★★*"],[12.7,"★★★★★*"],[12.3,"★★★★★*"],[12,"★★★★★*"],[11.9,"★★★★★"],[11.7,"★★★★*"],[11.3,"★★★★*"],[10.9,"★★★★*"],[10.7,"★★★★"],[10.3,"★★★*"],[10,"★★★*"],[9.9,"★★★*"],[9.7,"★★★"],[9.3,"★★★"],[9,"★★★"],[8.9,"★★★"],[8.7,"★★*"],[8.3,"★★*"],[8,"★★*"],[7.9,"★★"],[7.7,"★★"],[7.3,"★★"],[7,"★*"],[6.7,"★*"],[6.3,"★*"],[6,"*"],[5,"*"],[-1/0,"*"]],z=0,t="",F=0;$<6?(z=l(2,10,0,6,$),t="树懒",F=0,_="#C69061"):$<6.5?(z=l(10,40,6,6.5,$),t="海龟",F=1,_="#3D96A6"):$<7?(z=l(40,70,6.5,7,$),t="袋熊",F=2,_="#C28B6B"):$<7.5?(z=l(70,72,7,7.5,$),t="马",F=3,_="#BFAA87"):$<8?(z=l(72,80,7.5,8,$),t="长耳野兔",F=4,_="#D7944A"):$<8.5?(z=l(80,88,8,8.5,$),t="狮子",F=5,_="#DD8547"):$<9?(z=l(88,120,8.5,9,$),t="跳羚",F=6,_="#EFB51D"):$<9.5?(z=l(120,132,9,9.5,$),t="猎豹",F=7,_="#DC864B"):$<10?(z=l(132,161,9.5,10,$),t="黑枪鱼",F=8,_="#338DC1"):$<10.5?(z=l(161,132,10,10.5,$),t="秃鹫",F=9,_="#AB7D5A"):$<11?(z=l(320,389,10.5,11,$),t="金雕",F=10,_="#D26A2A"):(z=l(389,999,11,999,$),t="游隼",F=11,_="#5E9DC4");function l($,_,m,z,t){return $+(_-$)*((t-m)/(z-m))}for(var e=0,B=m.length;e<B;e++){let l=m[e];if($>=l[0])return{color:_,rate:l[1],text:t,brief_intro:z.toFixed(0),index:F}}}(iq_value/1),m=$isMan?"animate":"css",z=$("#iq-description"),t=$("#iq-number");t.html(iq_value),z.html(`<span class="animal-name">${_.text}</span>`),z.textfill({widthOnly:!0});var F=_.color;$("body").append(`<style>::selection{background:${F};color:#FFF}</style>`);var l=_.brief_intro/1,e=(.621371*l).toFixed(1),B=l;$isMan&&(l=0,pmh=0);var i='<span class="kmh_num">'+l+'</span><span class="kmh_txt">km/h</span>',a='<span class="mph_num">'+e+'</span><span class="mph_txt">mph</span>';z.append($('<div class="meta-speed">').html(i+a)),z.append($(`<div class="xxx" style="color:${F}">`).html(_.rate.split("*").join('<span style="opacity:.5">★</span>')));var n='pFa#8A5F3F_m784 55 14 20v23l-83 25-36 75 5-4 38-10 25 5 28 17 20 17 13 26v31l-25 44-26 18-64 109-64 60-149 48-109-28-82-80-90-104v-83L72 283v-44l140-27 16-16 49-18 21 14 109-31 38-25 20 4 6 3 88-25-7-4-27 5 17-16 34-9 36 9h1l11-3 43-34h30l14 10 73-21ZM433 208l-137 41-17 3 26 57 78 41 44-20 4-116 2-6Zm132-40-59 18-2 53 48 76 3-92 10-55Z$774D29_m72 283 224-34L798 98V75L72 266z$B58C57_m784 55 14 20L72 266v-27l188-37z$F1BA95_m211 212 17-16 49-18 21 14v15l-29-6z$A56D49_M199 264v83l106-38-106-45Z$4D3617_m199 264 106 45-26-57z$A37143_m199 347 90 104 94-101z$6B4E3A_m305 309 78 41-184-3z$6B4E3B_m383 350-19 121-75-20z$503B30_m289 451 82 80 31-50z$8A5F3F_m383 350 19 131-38-10z$392A29_m371 531 109 28 149-48-227-30z$735133_m383 350 74 60-55 71z$8A5F3F_m457 410 172 101-227-30z$C69061_m383 350 44-20 28 80-72-60Z$735133_m427 330 202 181-174-101z$503C30_m427 330 125-15 77 196z$6B4E3A_m431 214-4 116 77-91z$C69061_m504 239 48 76-125 15z$816050_m504 239 3-69-76 44z$CBA481_m507 170-25-20-37 20-14 44z$F1BA95_m482 150-17-10-20-4-38 25 35-5 3 14z$503C30_m629 511 64-60-25-135z$735133_m552 315 116 1-39 195-77-196Z$F1BA95_m725 87-36-4 8-17z$CBA481_M697 66h-30l-43 34 65-17 8-17Z$503C30_m716 122-64 134-23-85z$513A30_m652 256 16 60-116-1z$CBA481_m552 315 3-92 97 33z$6B4E3A_m652 256-23-86-74 53z$503C30_m555 223 18-97 56 44z$816050_M629 170v-51l-17-16-39 23s56 47 56 44Z$CBA481_m612 103-36-9-16 25 13 7z"/><path d="m576 94-34 9-17 16 27-5 8 5z$562F14_m668 316-22-28-2-35 24 24 6 29z$392A29_m668 316 26 26-20-36$35260A_m684 324 54 7 45-7-26 18h-63l-10-18Z$D6A981_m808 249-21 28-4 47 25-44z$D5AD8C_m808 249-13-26-20-17 5 36 28 7Z$E4AF8B_m775 206-28-17-25-5-10 34z$FBDCC1_m722 184-38 10-25 21 53 4z$C08B62_m659 215-15 38 24 24 13-31z$A37143_m712 218-13 24-18 4-22-31z$A56D49_m712 218 68 24-5-36z$D7A97D_M699 242h23l-10-24z$B27A45_M722 242h24l9-9-43-15$47250F_m751 265 5-12 8-4 8 4 6 10-6 10h-12zM710 265l-11 11h-9l-9-9 13-14 11 3z$121010_m722 273-6 4 6 10 19 1 7-6v-5l-4-4-11 4z$8B6B64_m728 255-9 12 3 6 11 4 11-4 4-3-7-13-13-2Z$98694E_m719 267-14 13 17 7-6-10 6-4z$C79B80_m748 270-4 3 4 4v5l-7 6 20-10z$180B0B_m761 278 2 4-19 11h-22l-18-9 1-4 17 7 19 1z$58351E_m722 293-48 13 10 18z$3E2312_m722 293 16 49h-44l-10-18 38-31Z$58351E_M722 293h22l26 26-32 23z$67391A_m738 342 47-34-2 16z$82552F_m763 282-19 11 26 26z$AF642B_m763 282 9-9 6 4-2 11 9 5v15l-15 11z$C29C71_m780 242-16 7 8 4 6 10 9 14z$A56E49_m780 242 7 36 21-29z$FFE5BB_m755 233-9 9 5 23 5-12 8-4 16-7z$C29C71_m751 265-3 5-7-13 5-15z$C3977A_m746 242-5 15-13-2-6-13z$FACBA7_m728 255-9 12-9-2-5-9-11-3 5-11h23z$D9935F_m699 242-5 11-13 14-7 15v24l-6-29 13-31z$240C0F_m690 276-16 30v-24l7-15z$301210_m778 263-6 10 6 4-2 11 9 5 2-16z$82542B_m674 306 48-13-18-9 1-4 14-13-9-2-11 11h-9z$A07A47_m751 265-3 5 13 8 2 4 9-9h-12z$FFF_m770 257-3 5 6-1zM693 259l-6 7 9-1z$735133_m694 342-1 109-25-135z$4D3617_m757 342-64 109v-83z$2D1F1E_m757 342-64 26 1-26z$392A29_m716 122-87 49v-22l87-27Z^#487F8D_M309 297V150l76-74-4 68 103-26-38 58-32 78 134-21 214 85 58 37-31 3 102 58-153 5h13l19 15-5 70-100-90-86 22-200-6-81-36-147-42-16 16-3-49 73-44 116 41 4-13z$3B6469_m381 144 65 32-53 130-12-162Z$0D3231_m484 118-103 26 65 32 38-58Z$6A7A80_m132 321 3 49 16-16z$5B686A_m132 321 73 31-54 2z$76A69E_m132 321 73-22v-22z$3D96A6_m205 277 116 41-116-19z$4F5B5D_M205 299v53l-73-31z$2F7B86_m321 318-14 41-102-60z$294A4C_m307 359-102-7v-53z$D1CBB3_m307 359-9 37-147-42 54-2z$326776_m340 257-33 102 116-24z$528B98_m338 266 210-33-125 102z$487F8D_m548 233 214 85-81 49z$39737B_M548 233v151l133-17-133-134Z$44848E_M548 233v151l-125-49z$AEB694_m548 384-169 48 200 6z$A3A58B_m579 438 102-71-133 17z$ADB18E_m681 367-16 49-86 22z$427379_m762 318 58 37-139 12$5F726E_m789 358 102 58-210-49z$B8C8BB_m891 416-153 5c-40-36-58-54-57-54l210 49Z$BEC4A0_m665 416 16-49 36 33-52 16Z$36626B_m665 416 100 90-27-85-21-21z$13495E_m751 421 19 15-5 70-27-85z$0F1E21_m178 308-14 26v-21z$A8AC93_m307 359 72 73-81-36z$9FAB9E_m423 335-44 97c115-30 172-46 169-48l-125-49Z$C2BDA6_m423 335-44 97-72-73z$C0D7DD_m430 357-30-73-91 13z$AAC5BA_m309 150 1 147 91-13z$4A7B80_m309 150 72-5 20 139-92-134Z$0D3231_m385 76-76 74 72-5 4-69Z^#9C6F5C_m576 377-67 9-41 41 36 36-6 10-8 15-13-22-37-11 1-1-26 25-39 30h-90l51-30 9-82-53 3-122 57-34-11h-1l-20-7-6-40 15-47v-31l52-88 13-45 37 17 35-20 118-52 120-51 149 8 102 63 93 107-8 89-67 58-18 111h-54l-43-9 33-16-19-45-16 29-60 2 23-9 23-95-5-13z$AA7D62_m125 352 23 78-38-31z$F2D4B1_m110 399 6 40 32-9z$AD754F_m116 439 55 18 66-52-121 34Z$CF9F7A_m177 233-52 88v31l52-119Z$875A46_m237 405-66 52 177-83z$AA7D62_m177 233 85-48-62 149z$BA8F76_m177 334-52 18 52-119 23 101h-23Z$DFB27D_m200 334 148 40-200 56 29-68 11-2 9-8z$CF9F7A_m177 334-8 10v14l8 4-29 68-23-78z$AD754F_m348 374-11 105h78z$875A46_m415 479-39 30-39-30z$BA8F76_M376 509h-90l51-30z$CFA384_m262 185 118-52-22 135-96-83Z$E9C397_m262 185-62 149 158-67z$CF9F7A_m312 287 36 87-148-40z$62473B_m190 188-13 45 50-28-37-17Z$875A46_M557 338 415 479l-67-105z$5F4537_m557 338-199-71-10 107z$875A46_m312 287 46-20-10 107z$5F4537_M557 338v-94l76 118z$875A46_m358 267 199-23v94z$AD754F_m380 133 120-51 149 8z$C28B6B_M649 90 477 254l-97-121z$AA7D62_m477 254-119 13 22-134z$CFA384_m477 254 80-10 92-154z$AA7D62_m649 90 102 63-194 91z$875A46_M751 153 633 362l-76-118 194-91ZM751 153l93 107-69 74z$AD754F_m775 334-142 28 118-209 24 181Z$9C6F5C_m844 260-8 89-61-15z$5F4537_m836 349-67 58 6-73z$875A46_m633 362 136 45 6-