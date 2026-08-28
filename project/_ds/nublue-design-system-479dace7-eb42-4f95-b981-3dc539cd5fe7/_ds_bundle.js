/* @ds-bundle: {"format":4,"namespace":"NuBlueDesignSystem_479dac","components":[{"name":"CouponCard","sourcePath":"components/cards/CouponCard.jsx"},{"name":"FeatureItem","sourcePath":"components/cards/FeatureItem.jsx"},{"name":"ReviewCard","sourcePath":"components/cards/ReviewCard.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"StarRating","sourcePath":"components/core/GoogleRating.jsx"},{"name":"GoogleRating","sourcePath":"components/core/GoogleRating.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"SectionHeading","sourcePath":"components/core/SectionHeading.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Input.jsx"},{"name":"ZipSearch","sourcePath":"components/forms/ZipSearch.jsx"},{"name":"Section","sourcePath":"components/layout/Section.jsx"},{"name":"MediaSplit","sourcePath":"components/layout/Section.jsx"},{"name":"SiteFooter","sourcePath":"components/navigation/SiteFooter.jsx"},{"name":"SiteHeader","sourcePath":"components/navigation/SiteHeader.jsx"}],"sourceHashes":{"components/cards/CouponCard.jsx":"d45b825b21f0","components/cards/FeatureItem.jsx":"6166e3f584f9","components/cards/ReviewCard.jsx":"cba9a74a11db","components/core/Button.jsx":"b2b1eada2bdc","components/core/Eyebrow.jsx":"4f6e4c41f4ba","components/core/GoogleRating.jsx":"d654637649b3","components/core/Icon.jsx":"02f59bcc966d","components/core/IconButton.jsx":"a62f17b04763","components/core/SectionHeading.jsx":"8e88fb63e389","components/forms/Checkbox.jsx":"209ffb1191ea","components/forms/Input.jsx":"4794093a4c75","components/forms/ZipSearch.jsx":"6a153f99e584","components/layout/Section.jsx":"a6fcaeee409c","components/navigation/SiteFooter.jsx":"436cde5c11b0","components/navigation/SiteHeader.jsx":"6f095285561a","ui_kits/website/ContactScreen.jsx":"2222d79dd508","ui_kits/website/HomeScreen.jsx":"fe95df4be8d3","ui_kits/website/NuShieldScreen.jsx":"ed3a4a26e964","ui_kits/website/ServiceScreen.jsx":"222f461e74a9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NuBlueDesignSystem_479dac = window.NuBlueDesignSystem_479dac || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Eyebrow.jsx
try { (() => {
/** Small all-caps kicker. Sky blue on navy, accent blue on light. */
function Eyebrow({
  children,
  tone = "onLight",
  size = "sm",
  style
}) {
  const big = size === "lg";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      color: tone === "onDark" ? "var(--text-eyebrow-on-dark)" : "var(--text-eyebrow-on-light)",
      font: big ? `var(--fw-bold) var(--fs-eyebrow)/1.1 var(--font-display)` : `var(--fw-bold) 14px/1.2 var(--font-sans)`,
      letterSpacing: big ? "var(--ls-eyebrow)" : "var(--ls-nav)",
      textTransform: big ? "none" : "uppercase",
      marginBottom: big ? "var(--sp-2)" : "var(--sp-3)",
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useEffect,
  useRef
} = React;
/** Renders a Lucide icon. Requires the Lucide UMD script on the page. */
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color = "currentColor",
  style,
  ...rest
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = "";
      const i = document.createElement("i");
      i.setAttribute("data-lucide", name);
      ref.current.appendChild(i);
      window.lucide.createIcons({
        attrs: {
          width: size,
          height: size,
          "stroke-width": strokeWidth,
          stroke: color
        },
        nameAttr: "data-lucide"
      });
    }
  }, [name, size, strokeWidth, color]);
  return /*#__PURE__*/React.createElement("span", _extends({
    ref: ref,
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      flex: "0 0 auto",
      width: size,
      height: size,
      color,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/cards/FeatureItem.jsx
try { (() => {
/** Blue line icon + navy bold label. Used in the 3x2 "Expect More" grid. */
function FeatureItem({
  icon,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sp-3)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 40,
    strokeWidth: 1.5,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-bold) var(--fs-body)/1.35 var(--font-sans)`,
      color: "var(--navy)",
      maxWidth: "16ch"
    }
  }, children));
}
Object.assign(__ds_scope, { FeatureItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/FeatureItem.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const nbBtnBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--btn-gap)",
  font: "var(--type-button)",
  letterSpacing: "var(--ls-button)",
  textTransform: "uppercase",
  padding: "var(--btn-pad-y) var(--btn-pad-x)",
  borderRadius: "var(--radius-pill)",
  border: "var(--border-width-strong) solid transparent",
  cursor: "pointer",
  textDecoration: "none",
  transition: "var(--transition-button)",
  whiteSpace: "nowrap"
};
const nbBtnVariants = {
  primary: {
    background: "var(--action-primary)",
    color: "var(--action-primary-text)",
    borderColor: "var(--action-primary)"
  },
  outline: {
    background: "var(--white)",
    color: "var(--action-outline-text)",
    borderColor: "var(--action-outline-border)"
  },
  onNavy: {
    background: "var(--action-on-dark-bg)",
    color: "var(--action-on-dark-text)",
    borderColor: "var(--action-on-dark-bg)"
  },
  phone: {
    background: "transparent",
    color: "var(--white)",
    borderColor: "var(--white)"
  }
};
const nbBtnHovers = {
  primary: {
    background: "var(--action-primary-hover)",
    borderColor: "var(--action-primary-hover)"
  },
  outline: {
    background: "var(--action-primary)",
    color: "var(--white)"
  },
  onNavy: {
    background: "var(--white)"
  },
  phone: {
    background: "var(--white)",
    color: "var(--navy)"
  }
};
const nbBtnSizes = {
  sm: {
    padding: "10px 20px",
    fontSize: "13px"
  },
  md: {},
  lg: {
    padding: "17px 34px",
    fontSize: "16px"
  }
};

/** The NuBlue action pill. Red is the action colour; outline is the secondary. */
function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  href,
  fullWidth,
  disabled,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: onClick,
    disabled: Tag === "button" ? disabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      ...nbBtnBase,
      ...nbBtnVariants[variant],
      ...nbBtnSizes[size],
      ...(hover && !disabled ? nbBtnHovers[variant] : null),
      width: fullWidth ? "100%" : undefined,
      transform: press && !disabled ? `scale(var(--press-scale))` : "none",
      opacity: disabled ? 0.45 : 1,
      pointerEvents: disabled ? "none" : undefined,
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === "lg" ? 20 : 18
  }) : null, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/cards/CouponCard.jsx
try { (() => {
/** Navy offer tile with an inset white dashed border and a pale-blue action footer. */
function CouponCard({
  offer,
  description,
  expires,
  terms,
  onRequest,
  style
}) {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("article", {
    style: {
      background: "var(--surface-dark)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--sp-5)",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: `2px dashed var(--border-dashed-on-navy)`,
      borderRadius: "var(--radius-sm)",
      padding: "var(--sp-6)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "var(--sp-3)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: "var(--white)",
      font: `var(--fw-bold) var(--fs-h3)/1.2 var(--font-display)`
    }
  }, offer), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: "rgba(255,255,255,.85)",
      fontSize: "var(--fs-body-sm)",
      lineHeight: "var(--lh-body)"
    }
  }, description), expires ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--sky)",
      font: `var(--fw-semibold) var(--fs-caption)/1 var(--font-sans)`,
      letterSpacing: ".04em",
      textTransform: "uppercase"
    }
  }, "Expires ", expires) : null, open && terms ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: "rgba(255,255,255,.7)",
      fontSize: "var(--fs-caption)",
      lineHeight: 1.5
    }
  }, terms) : null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      marginTop: "auto",
      alignSelf: "flex-start",
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      color: "var(--white)",
      textDecoration: "underline",
      font: `var(--fw-semibold) var(--fs-body-sm)/1 var(--font-sans)`
    }
  }, open ? "Less Info −" : "More Info +"))), /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--pale-blue)",
      padding: "var(--sp-4) var(--sp-5)",
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    size: "sm",
    icon: "calendar-days",
    onClick: onRequest
  }, "Request Service")));
}
Object.assign(__ds_scope, { CouponCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/CouponCard.jsx", error: String((e && e.message) || e) }); }

// components/core/GoogleRating.jsx
try { (() => {
/** Gold star row. Half stars are rounded to the nearest whole star. */
function StarRating({
  rating = 5,
  size = 18,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 2,
      color: "var(--gold)",
      ...style
    },
    "aria-label": `${rating} out of 5 stars`
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: "inline-flex",
      opacity: i < Math.round(rating) ? 1 : 0.25
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9L12 2.6z"
  })))));
}

/** The Google review badge that sits under the hero CTA. */
function GoogleRating({
  rating = 4.9,
  count,
  tone = "onDark",
  style
}) {
  const text = tone === "onDark" ? "var(--white)" : "var(--navy)";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sp-3)",
      color: text,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-bold) 28px/1 var(--font-display)"
    }
  }, rating), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(StarRating, {
    rating: rating,
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-medium) var(--fs-caption)/1 var(--font-sans)`,
      opacity: 0.85
    }
  }, "Google Rating", count ? ` · ${count} reviews` : "")));
}
Object.assign(__ds_scope, { StarRating, GoogleRating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/GoogleRating.jsx", error: String((e && e.message) || e) }); }

// components/cards/ReviewCard.jsx
try { (() => {
const avatarColors = ["#3F90CF", "#151A42", "#7BC7F8", "#DC3030", "#6B6F86"];

/** Flat light-gray review tile. */
function ReviewCard({
  name,
  initial,
  rating = 5,
  quote,
  colorIndex = 0,
  style
}) {
  const bg = avatarColors[colorIndex % avatarColors.length];
  return /*#__PURE__*/React.createElement("article", {
    style: {
      background: "var(--surface-card-quiet)",
      padding: "var(--card-pad)",
      borderRadius: "var(--radius-md)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--sp-4)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sp-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: "var(--radius-circle)",
      background: bg,
      color: "var(--white)",
      display: "grid",
      placeItems: "center",
      font: `var(--fw-bold) 18px/1 var(--font-sans)`,
      flex: "0 0 auto"
    }
  }, initial || (name || "?").charAt(0)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-semibold) var(--fs-body)/1.2 var(--font-sans)`,
      color: "var(--navy)"
    }
  }, name), /*#__PURE__*/React.createElement(__ds_scope.StarRating, {
    rating: rating,
    size: 14
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: "var(--text-body)",
      fontSize: "var(--fs-body-sm)",
      lineHeight: "var(--lh-body)",
      display: "-webkit-box",
      WebkitLineClamp: 4,
      WebkitBoxOrient: "vertical",
      overflow: "hidden"
    }
  }, quote), /*#__PURE__*/React.createElement("button", {
    style: {
      alignSelf: "flex-start",
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      color: "var(--blue)",
      font: `var(--fw-semibold) var(--fs-body-sm)/1 var(--font-sans)`
    }
  }, "Read more"));
}
Object.assign(__ds_scope, { ReviewCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ReviewCard.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const nbIconBtnTones = {
  navy: {
    background: "var(--navy)",
    color: "var(--white)"
  },
  white: {
    background: "var(--white)",
    color: "var(--navy)"
  },
  outlineWhite: {
    background: "transparent",
    color: "var(--white)",
    border: "2px solid var(--white)"
  }
};

/** Round icon-only control: carousel arrows and footer social links. */
function IconButton({
  icon,
  tone = "navy",
  size = 44,
  label,
  href,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: onClick,
    "aria-label": label,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "var(--radius-circle)",
      border: "2px solid transparent",
      cursor: "pointer",
      padding: 0,
      transition: "var(--transition-button)",
      ...nbIconBtnTones[tone],
      ...(hover ? {
        background: tone === "navy" ? "var(--blue)" : "var(--pale-blue)",
        color: tone === "navy" ? "var(--white)" : "var(--navy)",
        borderColor: "transparent"
      } : null),
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(size * 0.45)
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeading.jsx
try { (() => {
/**
 * Section heading. Pass `accent` to swap one word (almost always "NuBlue") to accent blue —
 * the brand's signature headline move.
 */
function SectionHeading({
  children,
  accent = "NuBlue",
  align = "center",
  tone = "onLight",
  as = "h2",
  eyebrow,
  style
}) {
  const Tag = as;
  const color = tone === "onDark" ? "var(--white)" : "var(--text-heading)";
  const parts = typeof children === "string" && accent ? children.split(accent) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: align,
      ...style
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--fw-bold) 14px/1.2 var(--font-sans)",
      letterSpacing: "var(--ls-nav)",
      textTransform: "uppercase",
      color: tone === "onDark" ? "var(--sky)" : "var(--blue)",
      marginBottom: "var(--sp-3)"
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement(Tag, {
    style: {
      color,
      margin: 0
    }
  }, parts && parts.length > 1 ? parts.map((p, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, p, i < parts.length - 1 ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--blue)"
    }
  }, accent) : null)) : children));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
const nbTick = (checked, round) => ({
  width: 20,
  height: 20,
  flex: "0 0 auto",
  borderRadius: round ? "var(--radius-circle)" : "var(--radius-sm)",
  border: `2px solid ${checked ? "var(--blue)" : "var(--gray-400)"}`,
  background: checked ? "var(--blue)" : "var(--white)",
  display: "grid",
  placeItems: "center",
  transition: "var(--transition-button)"
});
function Checkbox({
  label,
  checked,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      gap: "var(--sp-3)",
      alignItems: "flex-start",
      cursor: "pointer",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!checked,
    onChange: e => onChange && onChange(e.target.checked),
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: nbTick(checked, false)
  }, checked ? /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  })) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-sm)",
      lineHeight: 1.45,
      color: "var(--text-body)"
    }
  }, label));
}
function RadioGroup({
  label,
  options = ["Yes", "No"],
  value,
  onChange,
  inline = true,
  style
}) {
  return /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: "none",
      margin: 0,
      padding: 0,
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("legend", {
    style: {
      padding: 0,
      font: `var(--fw-semibold) var(--fs-caption)/1 var(--font-sans)`,
      letterSpacing: ".05em",
      textTransform: "uppercase",
      color: "var(--navy)",
      marginBottom: "var(--sp-3)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: inline ? "row" : "column",
      gap: inline ? "var(--sp-6)" : "var(--sp-3)"
    }
  }, options.map(o => {
    const v = o.value ?? o,
      l = o.label ?? o,
      on = value === v;
    return /*#__PURE__*/React.createElement("label", {
      key: v,
      style: {
        display: "flex",
        gap: "var(--sp-2)",
        alignItems: "center",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      checked: on,
      onChange: () => onChange && onChange(v),
      style: {
        position: "absolute",
        opacity: 0,
        width: 0,
        height: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: nbTick(on, true)
    }, on ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "var(--white)"
      }
    }) : null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-body-sm)",
        color: "var(--text-body)"
      }
    }, l));
  })));
}
Object.assign(__ds_scope, { Checkbox, RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const nbFieldLabel = {
  display: "block",
  font: `var(--fw-semibold) var(--fs-caption)/1 var(--font-sans)`,
  letterSpacing: ".05em",
  textTransform: "uppercase",
  color: "var(--navy)",
  marginBottom: "var(--sp-2)"
};
const nbFieldBox = {
  width: "100%",
  font: `var(--fw-regular) var(--fs-body)/1.2 var(--font-sans)`,
  color: "var(--navy)",
  background: "var(--white)",
  border: `1px solid var(--border-subtle)`,
  borderRadius: "var(--radius-sm)",
  padding: "13px 14px",
  outline: "none"
};
function Input({
  label: text,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      ...style
    }
  }, text ? /*#__PURE__*/React.createElement("span", {
    style: nbFieldLabel
  }, text, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--red)"
    }
  }, "*") : null) : null, /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...nbFieldBox,
      borderColor: error ? "var(--red)" : focus ? "var(--blue)" : "var(--border-subtle)",
      boxShadow: focus ? "var(--focus-ring)" : "none"
    }
  }, rest)), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginTop: 6,
      color: "var(--red)",
      fontSize: "var(--fs-caption)"
    }
  }, error) : null);
}
function Textarea({
  label: text,
  required,
  rows = 4,
  value,
  onChange,
  placeholder,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      ...style
    }
  }, text ? /*#__PURE__*/React.createElement("span", {
    style: nbFieldLabel
  }, text, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--red)"
    }
  }, "*") : null) : null, /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...nbFieldBox,
      resize: "vertical",
      borderColor: focus ? "var(--blue)" : "var(--border-subtle)",
      boxShadow: focus ? "var(--focus-ring)" : "none"
    }
  }, rest)));
}
function Select({
  label: text,
  required,
  options = [],
  value,
  onChange,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      ...style
    }
  }, text ? /*#__PURE__*/React.createElement("span", {
    style: nbFieldLabel
  }, text, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--red)"
    }
  }, "*") : null) : null, /*#__PURE__*/React.createElement("select", _extends({
    value: value,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...nbFieldBox,
      appearance: "none",
      cursor: "pointer",
      borderColor: focus ? "var(--blue)" : "var(--border-subtle)",
      boxShadow: focus ? "var(--focus-ring)" : "none",
      backgroundImage: "linear-gradient(45deg,transparent 50%,var(--navy) 50%),linear-gradient(135deg,var(--navy) 50%,transparent 50%)",
      backgroundPosition: "calc(100% - 18px) center,calc(100% - 12px) center",
      backgroundSize: "6px 6px,6px 6px",
      backgroundRepeat: "no-repeat"
    }
  }, rest), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value ?? o,
    value: o.value ?? o
  }, o.label ?? o))));
}
Object.assign(__ds_scope, { Input, Textarea, Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/ZipSearch.jsx
try { (() => {
/** Zip-code lookup: hairline pill field with a red Search pill attached. */
function ZipSearch({
  placeholder = "Zip Code Lookup",
  onSearch,
  style
}) {
  const [value, setValue] = React.useState("");
  return /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onSearch && onSearch(value);
    },
    style: {
      display: "flex",
      gap: "var(--sp-3)",
      alignItems: "center",
      background: "var(--white)",
      border: `1px solid var(--border-subtle)`,
      borderRadius: "var(--radius-pill)",
      padding: "6px 6px 6px var(--sp-5)",
      maxWidth: 460,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => setValue(e.target.value),
    placeholder: placeholder,
    inputMode: "numeric",
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      font: `var(--fw-regular) var(--fs-body)/1 var(--font-sans)`,
      color: "var(--navy)",
      minWidth: 0
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    size: "sm",
    icon: "search",
    type: "submit"
  }, "Search"));
}
Object.assign(__ds_scope, { ZipSearch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ZipSearch.jsx", error: String((e && e.message) || e) }); }

// components/layout/Section.jsx
try { (() => {
const backgrounds = {
  white: "var(--surface-base)",
  pale: "var(--surface-alt)",
  gray: "var(--surface-alt-2)",
  navy: "var(--surface-dark)"
};

/** Full-bleed stacked section. Backgrounds alternate white → pale → white → gray. */
function Section({
  children,
  background = "white",
  style,
  contentStyle
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "nb-section",
    style: {
      background: backgrounds[background],
      color: background === "navy" ? "var(--white)" : undefined,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nb-container",
    style: contentStyle
  }, children));
}

/** 50/50 image + copy split. `reverse` puts the image on the right. */
function MediaSplit({
  image,
  alt = "",
  children,
  reverse = false,
  ratio = "1fr 1fr",
  radius = "var(--radius-photo)",
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: ratio,
      gap: "clamp(32px,5vw,72px)",
      alignItems: "center",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      order: reverse ? 2 : 1
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: alt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: radius,
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      order: reverse ? 1 : 2
    }
  }, children));
}
Object.assign(__ds_scope, { Section, MediaSplit });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Section.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SiteFooter.jsx
try { (() => {
const COLUMNS = [{
  title: "Services",
  links: ["Electrical", "Plumbing", "Air"]
}, {
  title: "Our Company",
  links: ["About", "Blog", "Coupons", "Financing", "Sitemap"]
}, {
  title: "Our Locations",
  links: ["Charlotte", "Lake Norman", "Greenville, NC", "Fayetteville, NC"]
}];

/** Sky gradient strip, white body, navy legal bar. */
function SiteFooter({
  logo = "assets/logo-vertical-navy.svg",
  phone = "(866) 455-2583",
  columns = COLUMNS,
  style
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--white)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      background: "var(--gradient-sky-strip)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "nb-container",
    style: {
      display: "grid",
      gridTemplateColumns: "260px repeat(3,1fr)",
      gap: "var(--sp-10)",
      paddingTop: "var(--sp-16)",
      paddingBottom: "var(--sp-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sp-5)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logo,
    alt: "NuBlue",
    style: {
      height: 104,
      width: "auto"
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    icon: "calendar-days",
    fullWidth: true
  }, "Schedule Service"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    icon: "phone",
    fullWidth: true,
    href: `tel:${phone.replace(/[^\d]/g, "")}`
  }, phone), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--sp-3)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "instagram",
    label: "Instagram",
    size: 44
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "facebook",
    label: "Facebook",
    size: 44
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "linkedin",
    label: "LinkedIn",
    size: 44
  }))), columns.map(col => /*#__PURE__*/React.createElement("nav", {
    key: col.title,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sp-3)"
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      font: `var(--fw-bold) var(--fs-body)/1.2 var(--font-sans)`,
      letterSpacing: ".06em",
      textTransform: "uppercase",
      color: "var(--navy)",
      marginBottom: "var(--sp-2)"
    }
  }, col.title), col.links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      color: "var(--text-body)",
      textDecoration: "none",
      fontSize: "var(--fs-body-sm)"
    }
  }, l))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--navy)",
      color: "rgba(255,255,255,.75)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nb-container",
    style: {
      display: "flex",
      gap: "var(--sp-6)",
      flexWrap: "wrap",
      paddingTop: "var(--sp-5)",
      paddingBottom: "var(--sp-5)",
      fontSize: "var(--fs-caption)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 ", new Date().getFullYear(), " NuBlue Electric, Plumbing and Air"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: "var(--sky)",
      textDecoration: "none"
    }
  }, "Privacy Policy"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: "var(--sky)",
      textDecoration: "none"
    }
  }, "SMS Terms"))));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SiteHeader.jsx
try { (() => {
const NAV = ["About", "Plumbing", "Air", "Electrical", "NuShield", "Contact"];

/** Navy site header: logo left, phone + red CTA top right, uppercase nav row below. */
function SiteHeader({
  logo = "assets/logo-horizontal-white.svg",
  phone = "(866) 455-2583",
  nav = NAV,
  active,
  onNavigate,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: "var(--surface-dark)",
      color: "var(--white)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nb-container",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--sp-8)",
      paddingTop: "var(--sp-5)",
      paddingBottom: "var(--sp-4)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate && onNavigate("Home");
    },
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logo,
    alt: "NuBlue Electric, Plumbing & Air",
    style: {
      height: 52,
      width: "auto"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sp-4)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "phone",
    icon: "phone",
    href: `tel:${phone.replace(/[^\d]/g, "")}`
  }, phone), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    icon: "calendar-days",
    onClick: () => onNavigate && onNavigate("Schedule")
  }, "Schedule Service"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      borderTop: "1px solid rgba(255,255,255,.14)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nb-container",
    style: {
      display: "flex",
      gap: "var(--sp-8)",
      paddingTop: "var(--sp-4)",
      paddingBottom: "var(--sp-4)"
    }
  }, nav.map(item => /*#__PURE__*/React.createElement("a", {
    key: item,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate && onNavigate(item);
    },
    style: {
      font: "var(--type-nav)",
      letterSpacing: "var(--ls-nav)",
      textTransform: "uppercase",
      textDecoration: "none",
      color: active === item ? "var(--sky)" : "var(--white)",
      paddingBottom: 2,
      borderBottom: active === item ? "2px solid var(--sky)" : "2px solid transparent"
    }
  }, item)))));
}
Object.assign(__ds_scope, { SiteHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ContactScreen.jsx
try { (() => {
const NBc = window.NuBlueDesignSystem_479dac;
function ContactScreen() {
  const {
    Section,
    SectionHeading,
    Input,
    Select,
    Textarea,
    RadioGroup,
    Checkbox,
    Button,
    Icon
  } = NBc;
  const [sent, setSent] = React.useState(false);
  const [f, setF] = React.useState({
    first: "",
    last: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    service: "Service Needed",
    help: ""
  });
  const set = k => e => setF({
    ...f,
    [k]: e.target.value
  });
  const [sms, setSms] = React.useState("Yes");
  const [marketing, setMarketing] = React.useState("No");
  const [consent, setConsent] = React.useState(false);
  const valid = f.first && f.last && f.email && f.phone && f.zip && consent;
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(SectionHeading, null, "Contact NuBlue Today for All Your Electric, Air & Plumbing Needs"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.3fr .7fr",
      gap: "clamp(32px,5vw,72px)",
      marginTop: "var(--sp-12)",
      alignItems: "start"
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-alt)",
      borderRadius: "var(--radius-md)",
      padding: "var(--sp-12)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle-2",
    size: 56,
    color: "var(--blue)",
    style: {
      margin: "0 auto var(--sp-4)"
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginBottom: "var(--sp-3)"
    }
  }, "Your Request Has Been Sent"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "A NuBlue dispatcher will call ", f.phone || "you", " within the hour to confirm your appointment window."), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => setSent(false),
    style: {
      marginTop: "var(--sp-6)"
    }
  }, "Send Another Request")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: "grid",
      gap: "var(--sp-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--sp-4)"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "First Name",
    required: true,
    value: f.first,
    onChange: set("first")
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Last Name",
    required: true,
    value: f.last,
    onChange: set("last")
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    required: true,
    value: f.email,
    onChange: set("email")
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Phone",
    type: "tel",
    required: true,
    value: f.phone,
    onChange: set("phone")
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Address",
    required: true,
    value: f.address,
    onChange: set("address")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.4fr .6fr",
      gap: "var(--sp-4)"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "City",
    required: true,
    value: f.city,
    onChange: set("city")
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Zip Code",
    required: true,
    value: f.zip,
    onChange: set("zip")
  })), /*#__PURE__*/React.createElement(Select, {
    label: "Service Needed",
    options: ["Service Needed", "Electrical", "Plumbing", "Air"],
    value: f.service,
    onChange: set("service")
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "How Can We Help?",
    rows: 4,
    value: f.help,
    onChange: set("help")
  }), /*#__PURE__*/React.createElement(RadioGroup, {
    label: "I'd like to receive SMS messages about my project.",
    value: sms,
    onChange: setSms
  }), /*#__PURE__*/React.createElement(RadioGroup, {
    label: "I'd like to receive SMS marketing messages from NuBlue.",
    value: marketing,
    onChange: setMarketing
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: consent,
    onChange: setConsent,
    label: "By submitting this form, you authorize NuBlue to reach out to you about your project. We will never share your personal information with third parties for marketing purposes. You can opt out at any time."
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    type: "submit",
    disabled: !valid,
    style: {
      justifySelf: "start"
    }
  }, "Send Request")), /*#__PURE__*/React.createElement("aside", {
    style: {
      background: "var(--navy)",
      color: "var(--white)",
      borderRadius: "var(--radius-md)",
      padding: "var(--card-pad)",
      display: "grid",
      gap: "var(--sp-5)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: "var(--white)"
    }
  }, "Talk to a Human"), [["phone", "(866) 455-2583"], ["clock", "Same-day service, 7 days a week"], ["map-pin", "Charlotte · Lake Norman · Greenville · Fayetteville"]].map(([icon, text]) => /*#__PURE__*/React.createElement("span", {
    key: text,
    style: {
      display: "flex",
      gap: "var(--sp-3)",
      alignItems: "flex-start",
      fontSize: "var(--fs-body-sm)",
      color: "rgba(255,255,255,.85)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20,
    color: "var(--sky)"
  }), text)), /*#__PURE__*/React.createElement(Button, {
    variant: "onNavy",
    icon: "phone",
    href: "tel:8664552583",
    fullWidth: true
  }, "Call Now")))));
}
Object.assign(window, {
  ContactScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ContactScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomeScreen.jsx
try { (() => {
const NB = window.NuBlueDesignSystem_479dac;
const A = "../../assets";
function Hero({
  go
}) {
  const {
    Button,
    GoogleRating
  } = NB;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      background: `var(--overlay-navy-photo), url(${A}/img/tech-ac-unit.jpg) center 30%/cover`,
      color: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nb-container",
    style: {
      paddingTop: "clamp(56px,7vw,104px)",
      paddingBottom: "clamp(56px,7vw,104px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: `var(--fw-bold) var(--fs-eyebrow)/1.1 var(--font-display)`,
      color: "var(--sky)",
      marginBottom: "var(--sp-2)"
    }
  }, "North Carolina\u2019s"), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: "var(--white)",
      marginBottom: "var(--sp-5)"
    }
  }, "Top-Rated Electrical, Plumbing & Air Company"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.88)",
      fontSize: "var(--fs-body-lg)",
      maxWidth: 560
    }
  }, "We\u2019re committed to serving our community with reliable home care that saves you time and money. When you need professional plumbing, air, or electrical repairs, call on the licensed technicians at NuBlue for same-day service that gets the job done right."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--sp-5)",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: "var(--sp-6)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "calendar-days",
    onClick: () => go("Contact")
  }, "Schedule Service"), /*#__PURE__*/React.createElement(GoogleRating, {
    rating: 4.9,
    count: "2,400+",
    tone: "onDark"
  })))), /*#__PURE__*/React.createElement("figure", {
    style: {
      position: "absolute",
      right: "var(--sp-10)",
      bottom: 0,
      margin: 0,
      display: "flex",
      alignItems: "flex-end",
      gap: "var(--sp-4)"
    }
  }, /*#__PURE__*/React.createElement("figcaption", {
    style: {
      textAlign: "right",
      paddingBottom: "var(--sp-8)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: `var(--fw-bold) var(--fs-h4)/1.2 var(--font-display)`,
      color: "var(--white)"
    }
  }, "Daniel Moore"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: `var(--fw-medium) var(--fs-caption)/1.4 var(--font-sans)`,
      color: "var(--sky)",
      letterSpacing: ".06em",
      textTransform: "uppercase"
    }
  }, "Highlighted Home Service Hero")), /*#__PURE__*/React.createElement("img", {
    src: `${A}/img/employee-daniel-moore.webp`,
    alt: "NuBlue Employee of the Year",
    style: {
      height: 230,
      width: "auto",
      objectFit: "contain"
    }
  })));
}
const FEATURES = [["badge-check", "Reliable Service you can Always depend on"], ["clock", "Emergency services available when you need it"], ["smile", "Commitment to Customer Satisfaction"], ["graduation-cap", "Trained & Knowledgeable Technicians"], ["trending-up", "Market Leader Program by NuBlue"], ["shield-check", "Work that is Satisfaction guaranteed"]];
const REVIEWS = [["Karen S.", 5, "The technician showed up on time, walked me through every option, and had our panel swapped the same afternoon. Genuinely the easiest home repair we've ever booked."], ["Marcus T.", 5, "Called at 7am with no hot water. NuBlue had someone at the house before noon and a new tankless heater in by dinner. Fair price, no upsell."], ["Priya R.", 5, "Third time using NuBlue — plumbing, then AC, now outdoor lighting. Same clean, respectful crew every visit. They're the only company we call now."]];
const OFFERS = [["$300 Savings on a Panel Swap", "Upgrade Your Electrical Panel and Save $300 Today!", "01/31/2025", "Offer valid for a limited time. $300 savings applies to residential electrical panel swaps only. Additional terms may apply."], ["$75 Off Surge Protector Install", "Protect Your Home and Save $75 on Surge Protection Installation!", "01/31/2025", "Offer valid for a limited time. $75 savings applies to new surge protection installations only."], ["FREE Water Test", "We believe every home deserves clean, safe water.", "01/31/2025", "Receive a FREE water test to help you identify any impurities in your home's water supply."]];
function HomeScreen({
  go
}) {
  const {
    Section,
    MediaSplit,
    SectionHeading,
    Button,
    FeatureItem,
    ReviewCard,
    CouponCard,
    IconButton,
    ZipSearch
  } = NB;
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Hero, {
    go: go
  }), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1.15fr",
      gap: "clamp(32px,5vw,72px)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "left"
  }, "Expect More With NuBlue"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--sp-4)",
      fontSize: "var(--fs-body-lg)"
    }
  }, "Get Peace of Mind, Protection, and Performance Guaranteed."), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => go("NuShield")
  }, "About Our Team")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--sp-8)"
    }
  }, FEATURES.map(([icon, label]) => /*#__PURE__*/React.createElement(FeatureItem, {
    key: label,
    icon: icon
  }, label))))), /*#__PURE__*/React.createElement(Section, {
    background: "gray"
  }, /*#__PURE__*/React.createElement(SectionHeading, null, "What Your Neighbors Are Saying"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--sp-6)",
      marginTop: "var(--sp-10)"
    }
  }, REVIEWS.map(([name, rating, quote], i) => /*#__PURE__*/React.createElement(ReviewCard, {
    key: name,
    name: name,
    rating: rating,
    quote: quote,
    colorIndex: i,
    style: {
      background: "var(--white)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginTop: "var(--sp-10)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline"
  }, "Read More Reviews"))), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(MediaSplit, {
    image: `${A}/img/tech-ac-unit.jpg`,
    alt: "NuBlue technicians at work"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "left",
    accent: "NuBlue"
  }, "Get Pre-Approved for Financing When You Work with NuBlue and Our Preferred Partners"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--sp-4)"
    }
  }, "Comfortable monthly payments on the repairs and installs your home can\u2019t wait on. Approval takes a few minutes."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "arrow-right"
  }, "Start The Process"))), /*#__PURE__*/React.createElement(Section, {
    background: "pale"
  }, /*#__PURE__*/React.createElement(SectionHeading, null, "Current Promotions & Savings"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--sp-6)",
      marginTop: "var(--sp-10)",
      alignItems: "stretch"
    }
  }, OFFERS.map(([offer, description, expires, terms]) => /*#__PURE__*/React.createElement(CouponCard, {
    key: offer,
    offer: offer,
    description: description,
    expires: expires,
    terms: terms,
    onRequest: () => go("Contact")
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "var(--sp-4)",
      marginTop: "var(--sp-10)"
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    label: "Previous offers"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => go("Coupons")
  }, "View All Offers"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-right",
    label: "More offers"
  }))), /*#__PURE__*/React.createElement(Section, {
    background: "navy"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "clamp(32px,5vw,72px)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "left",
    tone: "onDark",
    accent: "NuShield",
    eyebrow: "Membership"
  }, "Save Time, Money, and Stress with NuShield Protection Plan"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.85)",
      marginTop: "var(--sp-4)"
    }
  }, "Eliminate unexpected repair bills and service delays with priority access and ongoing maintenance for your home\u2019s most critical systems. You\u2019ll receive year-round coverage for your home\u2019s electrical, plumbing, and HVAC systems for just $19/month."), /*#__PURE__*/React.createElement(Button, {
    variant: "onNavy",
    icon: "shield-check",
    onClick: () => go("NuShield")
  }, "Learn More About NuShield")), /*#__PURE__*/React.createElement("img", {
    src: `${A}/img/nushield-mascot.webp`,
    alt: "NuShield Protection Plan mascot",
    style: {
      height: 320,
      margin: "0 auto",
      width: "auto"
    }
  }))), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(MediaSplit, {
    image: `${A}/img/van.png`,
    alt: "NuBlue service van",
    reverse: true,
    radius: "0"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "left"
  }, "Grow Your Entrepreneurial Ambition with NuBlue"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--sp-4)"
    }
  }, "We provide the training and resources necessary to obtain your license and launch a new business path. Together, with NuBlue backing you as a Market Leader, you can open your own physical location, manage your own team and receive equity in our company."), /*#__PURE__*/React.createElement(Button, {
    variant: "outline"
  }, "Join Our Team"))), /*#__PURE__*/React.createElement(Section, {
    background: "gray"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "var(--sp-10)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "left",
    accent: ""
  }, "Find Your Area"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--sp-3)",
      marginBottom: 0,
      font: `var(--fw-semibold) var(--fs-body)/1.5 var(--font-sans)`,
      color: "var(--navy)"
    }
  }, "Lake Norman \xA0|\xA0 Charlotte \xA0|\xA0 Greenville, NC \xA0|\xA0 Fayetteville")), /*#__PURE__*/React.createElement(ZipSearch, {
    onSearch: () => go("Contact")
  }))), /*#__PURE__*/React.createElement(Section, {
    background: "white",
    contentStyle: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, null, "Contact NuBlue Today for All Your Electric, Air & Plumbing Needs"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--sp-8)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    icon: "calendar-days",
    onClick: () => go("Contact")
  }, "Schedule Service")), /*#__PURE__*/React.createElement("img", {
    src: `${A}/img/van.png`,
    alt: "NuBlue service van",
    style: {
      margin: "var(--sp-10) auto 0",
      maxWidth: 760
    }
  })));
}
Object.assign(window, {
  HomeScreen,
  Hero,
  FEATURES,
  REVIEWS,
  OFFERS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/NuShieldScreen.jsx
try { (() => {
const NBn = window.NuBlueDesignSystem_479dac;
const An = "../../assets";
const TIERS = [["Air", "$19", ["Annual HVAC tune-up", "Priority scheduling", "10% off repairs"]], ["Whole Home", "$29", ["HVAC, plumbing & electrical", "Two visits a year", "15% off repairs", "No overtime fees"]], ["Whole Home +", "$39", ["Everything in Whole Home", "Water heater flush", "Surge protection check", "Free second opinions"]]];
function NuShieldScreen({
  go
}) {
  const {
    Section,
    SectionHeading,
    Button,
    Icon,
    FeatureItem
  } = NBn;
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--gradient-brand-wash)",
      color: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nb-container",
    style: {
      paddingTop: "var(--sp-16)",
      paddingBottom: "var(--sp-16)",
      display: "grid",
      gridTemplateColumns: "1.1fr .9fr",
      gap: "var(--sp-10)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: `var(--fw-bold) 14px/1.2 var(--font-sans)`,
      letterSpacing: "var(--ls-nav)",
      textTransform: "uppercase",
      color: "var(--sky)",
      marginBottom: "var(--sp-3)"
    }
  }, "NuShield Protection Plan"), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: "var(--white)",
      fontSize: "var(--fs-h1)",
      marginBottom: "var(--sp-4)"
    }
  }, "Save Time, Money, and Stress"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.9)",
      fontSize: "var(--fs-body-lg)"
    }
  }, "Year-round coverage for your home\u2019s electrical, plumbing, and HVAC systems for just $19/month. Priority access, ongoing maintenance, and no surprise repair bills."), /*#__PURE__*/React.createElement(Button, {
    variant: "onNavy",
    icon: "shield-check",
    onClick: () => go("Contact"),
    style: {
      marginTop: "var(--sp-6)"
    }
  }, "Join NuShield")), /*#__PURE__*/React.createElement("img", {
    src: `${An}/img/nushield-mascot.webp`,
    alt: "NuShield Protection Plan mascot",
    style: {
      height: 360,
      width: "auto",
      margin: "0 auto"
    }
  }))), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(SectionHeading, null, "Why Members Stay With NuBlue"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--sp-8)",
      marginTop: "var(--sp-10)"
    }
  }, /*#__PURE__*/React.createElement(FeatureItem, {
    icon: "calendar-clock"
  }, "Priority scheduling year round"), /*#__PURE__*/React.createElement(FeatureItem, {
    icon: "wrench"
  }, "Maintenance on every major system"), /*#__PURE__*/React.createElement(FeatureItem, {
    icon: "piggy-bank"
  }, "Member pricing on all repairs"), /*#__PURE__*/React.createElement(FeatureItem, {
    icon: "shield-check"
  }, "No overtime or trip charges"))), /*#__PURE__*/React.createElement(Section, {
    background: "pale"
  }, /*#__PURE__*/React.createElement(SectionHeading, null, "Pick Your Plan"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--sp-6)",
      marginTop: "var(--sp-10)",
      alignItems: "stretch"
    }
  }, TIERS.map(([name, price, perks], i) => /*#__PURE__*/React.createElement("article", {
    key: name,
    style: {
      background: i === 1 ? "var(--navy)" : "var(--white)",
      color: i === 1 ? "var(--white)" : "var(--text-body)",
      borderRadius: "var(--radius-md)",
      padding: "var(--card-pad)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--sp-4)",
      border: i === 1 ? "none" : "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      color: i === 1 ? "var(--white)" : "var(--navy)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-bold) 44px/1 var(--font-display)`,
      color: i === 1 ? "var(--sky)" : "var(--blue)"
    }
  }, price, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-medium) var(--fs-body)/1 var(--font-sans)`,
      color: i === 1 ? "rgba(255,255,255,.7)" : "var(--text-muted)"
    }
  }, " /mo")), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: "var(--sp-3)",
      flex: 1
    }
  }, perks.map(p => /*#__PURE__*/React.createElement("li", {
    key: p,
    style: {
      display: "flex",
      gap: "var(--sp-3)",
      alignItems: "flex-start",
      fontSize: "var(--fs-body-sm)",
      color: i === 1 ? "rgba(255,255,255,.85)" : "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18,
    color: i === 1 ? "var(--sky)" : "var(--blue)"
  }), p))), /*#__PURE__*/React.createElement(Button, {
    variant: i === 1 ? "onNavy" : "outline",
    fullWidth: true,
    onClick: () => go("Contact")
  }, "Choose ", name))))));
}
function CouponsScreen({
  go
}) {
  const {
    Section,
    SectionHeading,
    CouponCard,
    IconButton,
    Button
  } = NBn;
  const all = [...window.OFFERS, ["Save $200 On A New Tank Water Heater", "Enjoy huge savings when NuBlue installs your next tank water heater!", "07/31/2025", "Offer valid for a limited time. $200 savings applied on new tank water heater."], ["$1,000 Off Whole Home Re-Pipe", "Upgrade Your Plumbing and Save $1,000 on Whole Home Re-Pipe!", "07/31/2025", "Promotion applies to the Charlotte / Lake Norman service areas only. Restrictions may apply."], ["FREE Second Opinion on Installs", 'FREE Same Day "NuLook" for System Installs', "04/30/2025", "Same day does not apply in the event of delays due to customer, inclement weather, or property accessibility."]];
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Section, {
    background: "white",
    contentStyle: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Coupons",
    accent: "NuBlue"
  }, "Current Promotions & Savings from NuBlue"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--sp-4) auto 0",
      maxWidth: 640
    }
  }, "Bring one of these to your next visit \u2014 or mention it when you book and we\u2019ll apply it for you.")), /*#__PURE__*/React.createElement(Section, {
    background: "pale",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--sp-6)"
    }
  }, all.map(([offer, description, expires, terms]) => /*#__PURE__*/React.createElement(CouponCard, {
    key: offer,
    offer: offer,
    description: description,
    expires: expires,
    terms: terms,
    onRequest: () => go("Contact")
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "var(--sp-4)",
      marginTop: "var(--sp-10)"
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-left",
    label: "Previous"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "calendar-days",
    onClick: () => go("Contact")
  }, "Request Service"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-right",
    label: "Next"
  }))));
}
Object.assign(window, {
  NuShieldScreen,
  CouponsScreen,
  TIERS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/NuShieldScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ServiceScreen.jsx
try { (() => {
const NBs = window.NuBlueDesignSystem_479dac;
const As = "../../assets";
const SERVICES = {
  Electrical: {
    eyebrow: "Electrical",
    title: "Licensed Electricians Across North Carolina",
    blurb: "From a flickering outlet to a full panel replacement, our licensed electricians diagnose the real problem, quote it up front, and get it done the same day whenever we can.",
    items: [["plug", "Electrical Installations"], ["wrench", "Electrical Repair"], ["clipboard-check", "Electrical Inspections"], ["square-stack", "Electrical Panels"], ["cable", "Wiring & Outlets"], ["zap", "Surge Protection"], ["battery-charging", "Generators"], ["lightbulb", "Lighting"], ["car", "EV Charger Installation"]]
  },
  Plumbing: {
    eyebrow: "Plumbing",
    title: "Plumbing Repairs Done Right the First Time",
    blurb: "Drains, sewer lines, water heaters, repiping and well pumps. We show up with the parts on the truck and clean up before we leave.",
    items: [["waves", "Drain & Sewer"], ["flame", "Water Heaters"], ["git-branch", "Repiping"], ["gauge", "Backflow Testing"], ["trash-2", "Garbage Disposals"], ["droplets", "Well Pumps"], ["filter", "Water Filtration"], ["pipette", "Gas Lines"], ["siren", "Emergency Services"]]
  },
  Air: {
    eyebrow: "Air",
    title: "Heating & Cooling That Keeps Up With Carolina Weather",
    blurb: "Repairs, installs, inspections and indoor air quality for every system in your home — with maintenance plans that keep it running.",
    items: [["snowflake", "Air Conditioning"], ["thermometer-sun", "Heating"], ["fan", "Heat Pumps"], ["wind", "Air Ducts"], ["air-vent", "Ductless AC"], ["clipboard-check", "AC Inspections"], ["leaf", "Indoor Air Quality"], ["flame", "Furnaces"], ["siren", "Emergency Services"]]
  }
};
function ServiceScreen({
  service = "Electrical",
  go
}) {
  const {
    Section,
    SectionHeading,
    Button,
    Icon,
    MediaSplit,
    CouponCard
  } = NBs;
  const s = SERVICES[service] || SERVICES.Electrical;
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--navy)",
      color: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "nb-container",
    style: {
      paddingTop: "var(--sp-16)",
      paddingBottom: "var(--sp-16)",
      display: "grid",
      gridTemplateColumns: "1.1fr .9fr",
      gap: "var(--sp-12)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: `var(--fw-bold) 14px/1.2 var(--font-sans)`,
      letterSpacing: "var(--ls-nav)",
      textTransform: "uppercase",
      color: "var(--sky)",
      marginBottom: "var(--sp-3)"
    }
  }, s.eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: "var(--white)",
      fontSize: "var(--fs-h1)",
      marginBottom: "var(--sp-4)"
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.85)",
      fontSize: "var(--fs-body-lg)"
    }
  }, s.blurb), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--sp-4)",
      flexWrap: "wrap",
      marginTop: "var(--sp-6)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "calendar-days",
    onClick: () => go("Contact")
  }, "Schedule Service"), /*#__PURE__*/React.createElement(Button, {
    variant: "phone",
    icon: "phone",
    href: "tel:8664552583"
  }, "(866) 455-2583"))), /*#__PURE__*/React.createElement("img", {
    src: `${As}/img/tech-ac-unit.jpg`,
    alt: "NuBlue technician at work",
    style: {
      width: "100%",
      height: 330,
      objectFit: "cover",
      borderRadius: "var(--radius-photo)"
    }
  }))), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(SectionHeading, null, "What We Do"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--sp-6)",
      marginTop: "var(--sp-10)"
    }
  }, s.items.map(([icon, label]) => /*#__PURE__*/React.createElement("a", {
    key: label,
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sp-4)",
      padding: "var(--sp-5)",
      background: "var(--surface-alt)",
      borderRadius: "var(--radius-md)",
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 28,
    strokeWidth: 1.5,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-semibold) var(--fs-body)/1.3 var(--font-sans)`,
      color: "var(--navy)"
    }
  }, label), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--blue)",
    style: {
      marginLeft: "auto"
    }
  }))))), /*#__PURE__*/React.createElement(Section, {
    background: "gray"
  }, /*#__PURE__*/React.createElement(MediaSplit, {
    image: `${As}/img/van.png`,
    alt: "NuBlue service van",
    radius: "0"
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    align: "left"
  }, "Same-Day Service From NuBlue"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--sp-4)"
    }
  }, "Every truck is stocked, every technician is background-checked and licensed, and every visit ends with a clean floor and a written summary of the work."), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    onClick: () => go("NuShield")
  }, "Learn About NuShield"))), /*#__PURE__*/React.createElement(Section, {
    background: "pale"
  }, /*#__PURE__*/React.createElement(SectionHeading, null, s.eyebrow, " Offers"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--sp-6)",
      marginTop: "var(--sp-10)"
    }
  }, window.OFFERS.map(([offer, description, expires, terms]) => /*#__PURE__*/React.createElement(CouponCard, {
    key: offer,
    offer: offer,
    description: description,
    expires: expires,
    terms: terms,
    onRequest: () => go("Contact")
  })))));
}
Object.assign(window, {
  ServiceScreen,
  SERVICES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ServiceScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.CouponCard = __ds_scope.CouponCard;

__ds_ns.FeatureItem = __ds_scope.FeatureItem;

__ds_ns.ReviewCard = __ds_scope.ReviewCard;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.StarRating = __ds_scope.StarRating;

__ds_ns.GoogleRating = __ds_scope.GoogleRating;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.ZipSearch = __ds_scope.ZipSearch;

__ds_ns.Section = __ds_scope.Section;

__ds_ns.MediaSplit = __ds_scope.MediaSplit;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.SiteHeader = __ds_scope.SiteHeader;

})();
