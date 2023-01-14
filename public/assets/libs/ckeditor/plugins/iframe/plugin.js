/*
 Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/
(function () {
    CKEDITOR.plugins.add("iframe", {
        requires: "dialog,fakeobjects",
        lang: "af,ar,az,bg,bn,bs,ca,cs,cy,da,de,de-ch,el,en,en-au,en-ca,en-gb,eo,es,es-mx,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,oc,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn",
        icons: "iframe",
        hidpi: !0,
        onLoad: function () {
            CKEDITOR.addCss(
                "img.cke_iframe{background-image: url(" +
                CKEDITOR.getUrl(this.path + "images/placeholder.png") +
                ");background-position: center center;background-repeat: no-repeat;border: 1px solid #a9a9a9;width: 80px;height: 80px;}"
            );
        },
        init: function (a) {
            var b = a.lang.iframe,
                c =
                    "iframe[align,longdesc,frameborder,height,name,scrolling,src,title,width]";
            a.plugins.dialogadvtab &&
            (c +=
                ";iframe" +
                a.plugins.dialogadvtab.allowedContent({
                    id: 1,
                    classes: 1,
                    styles: 1,
                }));
            CKEDITOR.dialog.add("iframe", this.path + "dialogs/iframe.js");
            a.addCommand(
                "iframe",
                new CKEDITOR.dialogCommand("iframe", {
                    allowedContent: c,
                    requiredContent: "iframe",
                })
            );
            a.ui.addButton &&
            a.ui.addButton("Iframe", {
                label: b.toolbar,
                command: "iframe",
                toolbar: "insert,80",
            });
            a.on("doubleclick", function (a) {
                var b = a.data.element;
                b.is("img") &&
                "iframe" == b.data("cke-real-element-type") &&
                (a.data.dialog = "iframe");
            });
            a.addMenuItems &&
            a.addMenuItems({
                iframe: {label: b.title, command: "iframe", group: "image"},
            });
            a.contextMenu &&
            a.contextMenu.addListener(function (a) {
                if (a && a.is("img") && "iframe" == a.data("cke-real-element-type"))
                    return {iframe: CKEDITOR.TRISTATE_OFF};
            });
        },
        afterInit: function (a) {
            var b = a.dataProcessor;
            (b = b && b.dataFilter) &&
            b.addRules({
                elements: {
                    iframe: function (b) {
                        return a.createFakeParserElement(b, "cke_iframe", "iframe", !0);
                    },
                },
            });
        },
    });
})();
