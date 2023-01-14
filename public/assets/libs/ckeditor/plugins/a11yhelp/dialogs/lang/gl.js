/*
 Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/
CKEDITOR.plugins.setLang("a11yhelp", "gl", {
    title: "Instrucións de accesibilidade",
    contents: "Axuda. Para pechar este diálogo prema ESC.",
    legend: [
        {
            name: "Xeral",
            items: [
                {
                    name: "Barra de ferramentas do editor",
                    legend:
                        "Prema ${toolbarFocus} para navegar pola barra de ferramentas. Para moverse polos distintos grupos de ferramentas use as teclas TAB e MAIÚS+TAB. Para moverse polas distintas ferramentas use FRECHA DEREITA ou FRECHA ESQUERDA. Prema ESPAZO ou INTRO para activar o botón da barra de ferramentas.",
                },
                {
                    name: "Editor de diálogo",
                    legend:
                        "Dentro do diálogo, prema TAB para navegar cara os seguintes elementos de diálogo, prema MAIÚS+TAB para moverse cara os anteriores elementos de diálogo, prema INTRO para enviar o diálogo, prema ESC para cancelar o diálogo. Cando o diálogo ten múltiples lapelas, a lista de lapelas pode cinguirse con ALT+F10 ou con TAB como parte da orde de lapelas do diálogo. Coa lapela en foco, pode moverse cara a seguinte ou a anterior lapela coas FRECHAS ESQUERDA e DEREICHA respectivamente.",
                },
                {
                    name: "Editor do menú contextual",
                    legend:
                        "Prema ${contextMenu} ou a TECLA MENÚ para abrir o menú contextual. A seguir móvase á seguinte opción do menú con TAB ou FRECHA ABAIXO. Móvase á opción anterior con MAIÚS + TAB ou FRECHA ARRIBA. Prema ESPAZO ou INTRO para seleccionar a opción do menú. Abra o submenú da opción actual con ESPAZO ou INTRO ou FRECHA DEREITA. Regrese ao elemento principal do menú con ESC ou FRECHA ESQUERDA. Peche o menú contextual con ESC.",
                },
                {
                    name: "Lista do editor",
                    legend:
                        "Dentro dunha lista, móvase ao seguinte elemento da lista con TAB ou FRECHA ABAIXO. Móvase ao elemento anterior da lista con MAIÚS+TAB ou FRECHA ARRIBA. Prema ESPAZO ou INTRO para escoller a opción da lista. Prema ESC para pechar a lista.",
                },
                {
                    name: "Barra da ruta ao elemento no editor",
                    legend:
                        "Prema ${elementsPathFocus} para navegar ata os elementos da barra de ruta. Móvase ao seguinte elemento botón con TAB ou FRECHA DEREITA. Móvase ao botón anterior con MAIÚS+TAB ou FRECHA ESQUERDA. Prema ESPAZO ou INTRO para seleccionar o elemento no editor.",
                },
            ],
        },
        {
            name: "Ordes",
            items: [
                {name: "Orde «desfacer»", legend: "Prema ${undo}"},
                {name: "Orde «refacer»", legend: "Prema ${redo}"},
                {name: "Orde «negra»", legend: "Prema ${bold}"},
                {name: "Orde «cursiva»", legend: "Prema ${italic}"},
                {name: "Orde «subliñar»", legend: "Prema ${underline}"},
                {name: "Orde «ligazón»", legend: "Prema ${link}"},
                {
                    name: "Orde «contraer a barra de ferramentas»",
                    legend: "Prema ${toolbarCollapse}",
                },
                {
                    name: "Orde «acceder ao anterior espazo en foco»",
                    legend:
                        "Prema ${accessPreviousSpace} para acceder ao espazo máis próximo de foco inalcanzábel anterior ao cursor, por exemplo: dous elementos HR adxacentes. Repita a combinación de teclas para chegar a espazos de foco distantes.",
                },
                {
                    name: "Orde «acceder ao seguinte espazo en foco»",
                    legend:
                        "Prema ${accessNextSpace} para acceder ao espazo máis próximo de foco inalcanzábel posterior ao cursor, por exemplo: dous elementos HR adxacentes. Repita a combinación de teclas para chegar a espazos de foco distantes.",
                },
                {name: "Axuda da accesibilidade", legend: "Prema ${a11yHelp}"},
                {
                    name: "Pegar como texto simple",
                    legend: "Prema ${pastetext}",
                    legendEdge: "Prema ${pastetext}, seguido de ${paste}",
                },
            ],
        },
    ],
    tab: "Tabulador",
    pause: "Pausa",
    capslock: "Bloq. Maiús",
    escape: "Escape",
    pageUp: "Páxina arriba",
    pageDown: "Páxina abaixo",
    leftArrow: "Frecha esquerda",
    upArrow: "Frecha arriba",
    rightArrow: "Frecha dereita",
    downArrow: "Frecha abaixo",
    insert: "Inserir",
    leftWindowKey: "Tecla Windows esquerda",
    rightWindowKey: "Tecla Windows dereita",
    selectKey: "Escolla a tecla",
    numpad0: "Tec. numérico 0",
    numpad1: "Tec. numérico 1",
    numpad2: "Tec. numérico 2",
    numpad3: "Tec. numérico 3",
    numpad4: "Tec. numérico 4",
    numpad5: "Tec. numérico 5",
    numpad6: "Tec. numérico 6",
    numpad7: "Tec. numérico 7",
    numpad8: "Tec. numérico 8",
    numpad9: "Tec. numérico 9",
    multiply: "Multiplicar",
    add: "Sumar",
    subtract: "Restar",
    decimalPoint: "Punto decimal",
    divide: "Dividir",
    f1: "F1",
    f2: "F2",
    f3: "F3",
    f4: "F4",
    f5: "F5",
    f6: "F6",
    f7: "F7",
    f8: "F8",
    f9: "F9",
    f10: "F10",
    f11: "F11",
    f12: "F12",
    numLock: "Bloq. num.",
    scrollLock: "Bloq. despraz.",
    semiColon: "Punto e coma",
    equalSign: "Signo igual",
    comma: "Coma",
    dash: "Guión",
    period: "Punto",
    forwardSlash: "Barra inclinada",
    graveAccent: "Acento grave",
    openBracket: "Abrir corchete",
    backSlash: "Barra invertida",
    closeBracket: "Pechar corchete",
    singleQuote: "Comiña simple",
});
