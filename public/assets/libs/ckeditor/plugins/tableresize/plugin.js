/*
 Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/
(function () {
    function x(b) {
        return CKEDITOR.env.ie
            ? b.$.clientWidth
            : parseInt(b.getComputedStyle("width"), 10);
    }

    function r(b, d) {
        var a = b.getComputedStyle("border-" + d + "-width"),
            l = {thin: "0px", medium: "1px", thick: "2px"};
        0 > a.indexOf("px") &&
        (a = a in l && "none" != b.getComputedStyle("border-style") ? l[a] : 0);
        return parseInt(a, 10);
    }

    function A(b) {
        var d = [],
            a = {},
            l = "rtl" == b.getComputedStyle("direction");
        CKEDITOR.tools.array.forEach(b.$.rows, function (f, B) {
            var e = -1,
                g = 0,
                c = null;
            f
                ? ((g = new CKEDITOR.dom.element(f)),
                    (c = {height: g.$.offsetHeight, position: g.getDocumentPosition()}))
                : (c = void 0);
            for (
                var g = c.height, c = c.position, m = 0, k = f.cells.length;
                m < k;
                m++
            ) {
                var h = new CKEDITOR.dom.element(f.cells[m]),
                    p = f.cells[m + 1] && new CKEDITOR.dom.element(f.cells[m + 1]),
                    e = e + (h.$.colSpan || 1),
                    t,
                    u,
                    n = h.getDocumentPosition().x;
                l ? (u = n + r(h, "left")) : (t = n + h.$.offsetWidth - r(h, "right"));
                p
                    ? ((n = p.getDocumentPosition().x),
                        l
                            ? (t = n + p.$.offsetWidth - r(p, "right"))
                            : (u = n + r(p, "left")))
                    : ((n = b.getDocumentPosition().x),
                        l ? (t = n) : (u = n + b.$.offsetWidth));
                h = Math.max(u - t, 3);
                h = {table: b, index: e, x: t, y: c.y, width: h, height: g, rtl: l};
                a[e] = a[e] || [];
                a[e].push(h);
                h.alignedPillars = a[e];
                d.push(h);
            }
        });
        return d;
    }

    function z(b) {
        (b.data || b).preventDefault();
    }

    function E(b) {
        function d() {
            m = 0;
            c.setOpacity(0);
            h && a();
            var b = e.table;
            setTimeout(function () {
                b.removeCustomData("_cke_table_pillars");
            }, 0);
            g.removeListener("dragstart", z);
        }

        function a() {
            for (
                var c = e.rtl, l = c ? u.length : t.length, a = 0, f = 0;
                f < l;
                f++
            ) {
                var g = t[f],
                    d = u[f],
                    m = e.table;
                CKEDITOR.tools.setTimeout(
                    function (e, f, g, d, h, n) {
                        e && e.setStyle("width", k(Math.max(f + n, 1)));
                        g && g.setStyle("width", k(Math.max(d - n, 1)));
                        h && m.setStyle("width", k(h + n * (c ? -1 : 1)));
                        ++a == l && b.fire("saveSnapshot");
                    },
                    0,
                    this,
                    [
                        g,
                        g && x(g),
                        d,
                        d && x(d),
                        (!g || !d) && x(m) + r(m, "left") + r(m, "right"),
                        h,
                    ]
                );
            }
        }

        function l(l) {
            z(l);
            b.fire("saveSnapshot");
            l = e.index;
            for (
                var a = CKEDITOR.tools.buildTableMap(e.table),
                    d = [],
                    k = [],
                    p = Number.MAX_VALUE,
                    r = p,
                    w = e.rtl,
                    C = 0,
                    A = a.length;
                C < A;
                C++
            ) {
                var q = a[C],
                    v = q[l + (w ? 1 : 0)],
                    q = q[l + (w ? 0 : 1)],
                    v = v && new CKEDITOR.dom.element(v),
                    q = q && new CKEDITOR.dom.element(q);
                (v && q && v.equals(q)) ||
                (v && (p = Math.min(p, x(v))),
                q && (r = Math.min(r, x(q))),
                    d.push(v),
                    k.push(q));
            }
            t = d;
            u = k;
            n = e.x - p;
            D = e.x + r;
            c.setOpacity(0.5);
            y = parseInt(c.getStyle("left"), 10);
            h = 0;
            m = 1;
            c.on("mousemove", B);
            g.on("dragstart", z);
            g.on("mouseup", f, this);
        }

        function f(c) {
            c.removeListener();
            d();
        }

        function B(c) {
            p(c.data.getPageOffset().x);
        }

        var e, g, c, m, y, h, p, t, u, n, D;
        g = b.document;
        c = CKEDITOR.dom.element.createFromHtml(
            '\x3cdiv data-cke-temp\x3d1 contenteditable\x3dfalse unselectable\x3don style\x3d"position:absolute;cursor:col-resize;filter:alpha(opacity\x3d0);opacity:0;padding:0;background-color:#004;background-image:none;border:0px none;z-index:10"\x3e\x3c/div\x3e',
            g
        );
        b.on("destroy", function () {
            c.remove();
        });
        w || g.getDocumentElement().append(c);
        this.attachTo = function (b) {
            var a, f, d;
            m ||
            (w && (g.getBody().append(c), (h = 0)),
                (e = b),
                (a = e.alignedPillars[0]),
                (f = e.alignedPillars[e.alignedPillars.length - 1]),
                (d = a.y),
                (a = f.height + f.y - a.y),
                c.setStyles({
                    width: k(b.width),
                    height: k(a),
                    left: k(b.x),
                    top: k(d),
                }),
            w && c.setOpacity(0.25),
                c.on("mousedown", l, this),
                g.getBody().setStyle("cursor", "col-resize"),
                c.show());
        };
        p = this.move = function (b, a) {
            if (!e) return 0;
            if (
                !(
                    m ||
                    (b >= e.x && b <= e.x + e.width && a >= e.y && a <= e.y + e.height)
                )
            )
                return (
                    (e = null),
                        (m = h = 0),
                        g.removeListener("mouseup", f),
                        c.removeListener("mousedown", l),
                        c.removeListener("mousemove", B),
                        g.getBody().setStyle("cursor", "auto"),
                        w ? c.remove() : c.hide(),
                        0
                );
            var d = b - Math.round(c.$.offsetWidth / 2);
            if (m) {
                if (d == n || d == D) return 1;
                d = Math.max(d, n);
                d = Math.min(d, D);
                h = d - y;
            }
            c.setStyle("left", k(d));
            return 1;
        };
    }

    function y(b) {
        var d = b.data.getTarget();
        if ("mouseout" == b.name) {
            if (!d.is("table")) return;
            for (
                var a = new CKEDITOR.dom.element(
                    b.data.$.relatedTarget || b.data.$.toElement
                );
                a && a.$ && !a.equals(d) && !a.is("body");
            )
                a = a.getParent();
            if (!a || a.equals(d)) return;
        }
        d.getAscendant("table", 1).removeCustomData("_cke_table_pillars");
        b.removeListener();
    }

    var k = CKEDITOR.tools.cssLength,
        w = CKEDITOR.env.ie && (CKEDITOR.env.ie7Compat || CKEDITOR.env.quirks);
    CKEDITOR.plugins.add("tableresize", {
        requires: "tabletools",
        init: function (b) {
            b.on("contentDom", function () {
                var d,
                    a = b.editable();
                a.attachListener(
                    a.isInline() ? a : b.document,
                    "mousemove",
                    function (a) {
                        a = a.data;
                        var f = a.getTarget();
                        if (f.type == CKEDITOR.NODE_ELEMENT) {
                            var k = a.getPageOffset().x,
                                e = a.getPageOffset().y;
                            if (d && d.move(k, e)) z(a);
                            else if (
                                f.is("table") ||
                                f.getAscendant({thead: 1, tbody: 1, tfoot: 1}, 1)
                            )
                                if (
                                    ((a = f.getAscendant("table", 1)), b.editable().contains(a))
                                ) {
                                    (f = a.getCustomData("_cke_table_pillars")) ||
                                    (a.setCustomData("_cke_table_pillars", (f = A(a))),
                                        a.on("mouseout", y),
                                        a.on("mousedown", y));
                                    a: {
                                        a = f;
                                        for (var f = 0, g = a.length; f < g; f++) {
                                            var c = a[f];
                                            if (
                                                k >= c.x &&
                                                k <= c.x + c.width &&
                                                e >= c.y &&
                                                e <= c.y + c.height
                                            ) {
                                                k = c;
                                                break a;
                                            }
                                        }
                                        k = null;
                                    }
                                    k && (!d && (d = new E(b)), d.attachTo(k));
                                }
                        }
                    }
                );
            });
        },
    });
})();
