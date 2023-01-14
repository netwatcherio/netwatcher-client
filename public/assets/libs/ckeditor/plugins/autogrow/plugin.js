/*
 Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/
(function () {
    function h(a) {
        function m() {
            e = a.document;
            n = e[CKEDITOR.env.ie ? "getBody" : "getDocumentElement"]();
            c = CKEDITOR.env.quirks ? e.getBody() : e.getDocumentElement();
            var d = CKEDITOR.env.quirks ? c : c.findOne("body");
            d &&
            (d.setStyle("height", "auto"),
                d.setStyle("min-height", CKEDITOR.env.safari ? "0%" : "auto"));
            f = CKEDITOR.dom.element.createFromHtml(
                '\x3cspan style\x3d"margin:0;padding:0;border:0;clear:both;width:1px;height:1px;display:block;"\x3e' +
                (CKEDITOR.env.webkit ? "\x26nbsp;" : "") +
                "\x3c/span\x3e",
                e
            );
        }

        function g() {
            k && c.setStyle("overflow-y", "hidden");
            var d = a.window.getViewPaneSize().height,
                b;
            n.append(f);
            b = f.getDocumentPosition(e).y + f.$.offsetHeight;
            f.remove();
            b += h;
            b = Math.max(b, r);
            b = Math.min(b, p);
            b != d &&
            l != b &&
            ((b = a.fire("autoGrow", {currentHeight: d, newHeight: b}).newHeight),
                a.resize(a.container.getStyle("width"), b, !0),
                (l = b));
            k ||
            (b < p && c.$.scrollHeight > c.$.clientHeight
                ? c.setStyle("overflow-y", "hidden")
                : c.removeStyle("overflow-y"));
        }

        var l,
            e,
            n,
            c,
            f,
            h = a.config.autoGrow_bottomSpace || 0,
            r =
                void 0 !== a.config.autoGrow_minHeight
                    ? a.config.autoGrow_minHeight
                    : 200,
            p = a.config.autoGrow_maxHeight || Infinity,
            k = !a.config.autoGrow_maxHeight;
        a.addCommand("autogrow", {
            exec: g,
            modes: {wysiwyg: 1},
            readOnly: 1,
            canUndo: !1,
            editorFocus: !1,
        });
        var t = {
                contentDom: 1,
                key: 1,
                selectionChange: 1,
                insertElement: 1,
                mode: 1,
            },
            q;
        for (q in t)
            a.on(q, function (d) {
                "wysiwyg" == d.editor.mode &&
                setTimeout(function () {
                    var b = a.getCommand("maximize");
                    !a.window || (b && b.state == CKEDITOR.TRISTATE_ON)
                        ? (l = null)
                        : (g(), k || g());
                }, 100);
            });
        a.on("afterCommandExec", function (a) {
            "maximize" == a.data.name &&
            "wysiwyg" == a.editor.mode &&
            (a.data.command.state == CKEDITOR.TRISTATE_ON
                ? c.removeStyle("overflow-y")
                : g());
        });
        a.on("contentDom", m);
        m();
        a.config.autoGrow_onStartup &&
        a.editable().isVisible() &&
        a.execCommand("autogrow");
    }

    CKEDITOR.plugins.add("autogrow", {
        init: function (a) {
            if (a.elementMode != CKEDITOR.ELEMENT_MODE_INLINE)
                a.on("instanceReady", function () {
                    a.editable().isInline()
                        ? a.ui.space("contents").setStyle("height", "auto")
                        : h(a);
                });
        },
    });
})();
