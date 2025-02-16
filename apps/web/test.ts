import type { ColorInstance } from "color";
import Color from "color";

function blendColor(_fg: ColorInstance, _bg: ColorInstance) {
  let fg = _fg.rgb();
  let bg = _bg.rgb();
  return Color(
    {
      r: Math.round(fg.red() * fg.alpha() + bg.red() * (1 - fg.alpha())),
      g: Math.round(fg.green() * fg.alpha() + bg.green() * (1 - fg.alpha())),
      b: Math.round(fg.blue() * fg.alpha() + bg.blue() * (1 - fg.alpha())),
      alpha: 1,
    },
    "rgb",
  );
}

const mix = (fg: ColorInstance, bg: ColorInstance) => bg.mix(fg, bg.alpha());

const compare = (fg: ColorInstance, bg: ColorInstance) => {
  console.log(blendColor(fg, bg).rgb());
  console.log(mix(fg, bg).rgb());
};

compare(Color("#696969"), Color("#fafafa"));
