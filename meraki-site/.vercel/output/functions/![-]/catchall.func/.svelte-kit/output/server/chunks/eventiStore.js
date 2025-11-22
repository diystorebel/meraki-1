import { c as create_ssr_component, v as validate_component } from "./ssr.js";
import { I as Icon } from "./house.js";
import { w as writable } from "./index.js";
import "./supabaseClient.js";
import "browser-image-compression";
const Calendar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const iconNode = [
    ["path", { "d": "M8 2v4" }],
    ["path", { "d": "M16 2v4" }],
    [
      "rect",
      {
        "width": "18",
        "height": "18",
        "x": "3",
        "y": "4",
        "rx": "2"
      }
    ],
    ["path", { "d": "M3 10h18" }]
  ];
  return `${validate_component(Icon, "Icon").$$render($$result, Object.assign({}, { name: "calendar" }, $$props, { iconNode }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const eventiStore = writable([]);
function isEventoAttivo(evento) {
  const now = /* @__PURE__ */ new Date();
  const inizio = new Date(evento.data_inizio);
  const fine = new Date(evento.data_fine);
  return now >= inizio && now <= fine;
}
export {
  Calendar as C,
  eventiStore as e,
  isEventoAttivo as i
};
